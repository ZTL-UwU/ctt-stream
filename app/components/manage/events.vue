<template>
  <div class="flex flex-col gap-6">
    <h2 class="text-2xl font-bold flex items-center gap-4">
      <UIcon name="lucide:calendar" />
      <span>活动管理</span>
      <UModal title="创建活动">
        <UButton icon="lucide:plus" size="lg" label="创建" color="neutral" variant="subtle" class="w-fit" />
        <template #body>
          <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
            <UFormField label="名称" name="name">
              <UInput v-model="state.name" class="w-full" />
            </UFormField>
            <UFormField label="关卡" name="levels">
              <USelect v-model="state.levelIds" :items="levelOptions" multiple placeholder="选择关卡" class="w-full" />
            </UFormField>
            <UFormField label="玩家" name="players">
              <USelect v-model="state.playerIds" :items="playerOptions" multiple placeholder="选择玩家" class="w-full" />
            </UFormField>
            <UButton type="submit">
              提交
            </UButton>
          </UForm>
        </template>
      </UModal>
    </h2>

    <div class="grid grid-cols-4 gap-8">
      <UCard v-for="event in data" :key="event.id">
        <template #header>
          <div class="flex items-center gap-2 justify-between w-full">
            <span class="text-lg font-semibold">{{ event.name }}</span>
            <div class="flex items-center gap-2">
              <UModal :title="`修改活动：${event.name}`">
                <UButton size="sm" icon="lucide:edit" variant="subtle" color="neutral" @click="prepareEdit(event)" />
                <template #body>
                  <UForm :state="tmpEvent" class="space-y-4" @submit="() => onUpdate(tmpEvent)">
                    <UFormField>
                      <USwitch v-model="tmpEvent.active" label="启用" />
                    </UFormField>
                    <UFormField label="名称" name="name">
                      <UInput v-model="tmpEvent.name" class="w-full" />
                    </UFormField>
                    <UFormField label="关卡" name="levels">
                      <USelect v-model="(tmpEvent as any).levelIds" :items="levelOptions" multiple placeholder="选择关卡" class="w-full" />
                    </UFormField>
                    <UFormField label="玩家" name="players">
                      <USelect v-model="(tmpEvent as any).playerIds" :items="playerOptions" multiple placeholder="选择玩家" class="w-full" />
                    </UFormField>
                    <div class="flex gap-2 justify-end">
                      <UButton type="submit" color="primary">
                        保存
                      </UButton>
                    </div>
                  </UForm>
                </template>
              </UModal>
              <UModal :title="`删除活动：${event.name}`">
                <UButton size="sm" icon="lucide:trash" variant="subtle" color="error" />
                <template #body="{ close }">
                  <div class="space-y-4">
                    <p class="text-sm text-red-600">
                      此操作不可撤销，确认要删除该活动以及相关关联吗？
                    </p>
                    <div class="flex justify-end gap-2">
                      <UButton color="neutral" variant="ghost" @click="close()">
                        取消
                      </UButton>
                      <UButton color="error" @click="() => onDelete(event)">
                        确认删除
                      </UButton>
                    </div>
                  </div>
                </template>
              </UModal>
            </div>
          </div>
        </template>
        <div class="text-sm text-neutral-500 flex flex-col gap-4">
          启用：{{ event.active ? '是' : '否' }}
          <div class="flex flex-wrap gap-2 items-center">
            <span>关卡：</span>
            <span class="flex flex-wrap gap-1">
              <UBadge v-for="level in event.levels" :key="level.levelId" variant="outline" color="neutral">
                {{ level.level.name }}
              </UBadge>
            </span>
          </div>
          <div class="flex flex-wrap gap-2 items-center">
            <span>玩家：</span>
            <span class="flex flex-wrap gap-1">
              <UBadge v-for="player in event.players" :key="player.playerId" variant="outline" color="neutral">
                {{ player.player.name }}
              </UBadge>
            </span>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import * as z from 'zod';

const { $trpc } = useNuxtApp();

const { data, suspense: eventSuspense } = useQuery({
  queryKey: ['event.getAll'],
  queryFn: () => $trpc.event.getAll.query(),
});

const { data: levelsData, suspense: levelSuspense } = useQuery({
  queryKey: ['level.getAll'],
  queryFn: () => $trpc.level.getAll.query(),
});

const { data: playersData, suspense: playerSuspense } = useQuery({
  queryKey: ['player.getAll'],
  queryFn: () => $trpc.player.getAll.query(),
});

await eventSuspense();
await levelSuspense();
await playerSuspense();

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  levelIds: z.array(z.number()).default([]),
  playerIds: z.array(z.number()).default([]),
});

type Schema = z.infer<typeof schema>;

const state = reactive<{ name?: string; levelIds: number[]; playerIds: number[] }>({
  name: undefined,
  levelIds: [],
  playerIds: [],
});

const levelOptions = computed(() => (levelsData?.value || []).map(l => ({ label: l.name, value: l.id })));
const playerOptions = computed(() => (playersData?.value || []).map(p => ({ label: p.name, value: p.id })));

const toast = useToast();
const queryClient = useQueryClient();

async function onSubmit(e: FormSubmitEvent<Schema>) {
  await ($trpc.event.create.mutate as any)({
    name: e.data.name,
    levels: e.data.levelIds || [],
    players: e.data.playerIds || [],
  });
  await queryClient.invalidateQueries({ queryKey: ['event.getAll'] });
  state.name = undefined;
  state.levelIds = [];
  state.playerIds = [];
  toast.add({ title: '成功', description: '活动已创建', color: 'success' });
}

const tmpEvent = ref<any>({});
function prepareEdit(eventObj: any) {
  tmpEvent.value = { ...eventObj };
  if (!tmpEvent.value.levelIds) {
    tmpEvent.value.levelIds = (tmpEvent.value.levels || []).map((l: any) => l.levelId);
  }
  if (!tmpEvent.value.playerIds) {
    tmpEvent.value.playerIds = (tmpEvent.value.players || []).map((p: any) => p.playerId);
  }
}

async function onUpdate(eventObj: any) {
  await $trpc.event.update.mutate({
    id: eventObj.id,
    name: eventObj.name,
    active: eventObj.active,
    levels: eventObj.levelIds || [],
    players: eventObj.playerIds || [], // cast via any above
  });
  await queryClient.invalidateQueries({ queryKey: ['event.getAll'] });
  prepareEdit(eventObj);
  toast.add({ title: '已保存', description: '活动已更新', color: 'success' });
}

async function onDelete(eventObj: any) {
  await $trpc.event.delete.mutate({ id: eventObj.id });
  await queryClient.invalidateQueries({ queryKey: ['event.getAll'] });
  toast.add({ title: '已删除', description: `活动 ${eventObj.name} 已删除`, color: 'success' });
}
</script>
