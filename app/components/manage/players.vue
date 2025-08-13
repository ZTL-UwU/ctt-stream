<template>
  <div class="flex flex-col gap-6">
    <h2 class="text-2xl font-bold flex items-center gap-4">
      <UIcon name="lucide:user" />
      <span>玩家管理</span>
      <UModal title="创建玩家">
        <UButton icon="lucide:plus" size="lg" label="创建" color="neutral" variant="subtle" class="w-fit" />

        <template #body>
          <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
            <UFormField label="名称" name="name">
              <UInput v-model="state.name" />
            </UFormField>
            <UFormField label="直播房间号" name="streamId">
              <UInput v-model="state.streamId" />
            </UFormField>
            <UFormField label="头像 URL" name="avatar">
              <UInput v-model="state.avatar" />
            </UFormField>

            <UButton type="submit">
              Submit
            </UButton>
          </UForm>
        </template>
      </UModal>
    </h2>

    <div class="grid grid-cols-4 gap-8">
      <UCard v-for="player in data" :key="player.id">
        <template #header>
          <div class="flex items-center gap-2 justify-between w-full">
            <div class="flex items-center gap-2">
              <UAvatar :src="player.avatar" />
              <span class="text-lg font-semibold">
                {{ player.name }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <UModal :title="`修改玩家：${player.name}`">
                <UButton size="sm" icon="lucide:edit" variant="subtle" color="neutral" @click="prepareEdit(player)" />
                <template #body>
                  <UForm :state="tmpPlayer" class="space-y-4" @submit="() => onUpdate(tmpPlayer)">
                    <UFormField label="名称" name="name">
                      <UInput v-model="tmpPlayer.name" />
                    </UFormField>
                    <UFormField label="直播房间号" name="streamId">
                      <UInput v-model="tmpPlayer.streamId" />
                    </UFormField>
                    <UFormField label="头像 URL" name="avatar">
                      <UInput v-model="tmpPlayer.avatar" />
                    </UFormField>
                    <div class="flex gap-2 justify-end">
                      <UButton type="submit" color="primary">
                        保存
                      </UButton>
                    </div>
                  </UForm>
                </template>
              </UModal>
              <UModal :title="`删除玩家：${player.name}`">
                <UButton size="sm" icon="lucide:trash" variant="subtle" color="error" />
                <template #body="{ close }">
                  <div class="space-y-4">
                    <p class="text-sm text-red-600">
                      此操作不可撤销，确认要删除该玩家以及相关成绩与关联吗？
                    </p>
                    <div class="flex justify-end gap-2">
                      <UButton color="neutral" variant="ghost" @click="close()">
                        取消
                      </UButton>
                      <UButton color="error" @click="() => onDelete(player)">
                        确认删除
                      </UButton>
                    </div>
                  </div>
                </template>
              </UModal>
            </div>
          </div>
        </template>
        直播房间号：{{ player.streamId }}
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import * as z from 'zod';

const { $trpc } = useNuxtApp();
const { data, suspense } = useQuery({
  queryKey: ['player.getAll'],
  queryFn: () => $trpc.player.getAll.query(),
});
await suspense();

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  streamId: z.string().min(1, 'Stream ID is required'),
  avatar: z.string().url('Avatar must be a valid URL'),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  name: undefined,
  streamId: undefined,
  avatar: undefined,
});

const tmpPlayer = ref<any>({});
function prepareEdit(playerObj: any) {
  tmpPlayer.value = { ...playerObj };
}

const toast = useToast();
const queryClient = useQueryClient();
async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({ title: 'Success', description: 'The form has been submitted.', color: 'success' });
  await $trpc.player.create.mutate({
    name: event.data.name,
    streamId: event.data.streamId,
    avatar: event.data.avatar,
  });
  await queryClient.invalidateQueries({ queryKey: ['player.getAll'] });
  state.name = undefined;
  state.streamId = undefined;
  state.avatar = undefined;
}

async function onUpdate(player: any) {
  await $trpc.player.update.mutate({
    id: player.id,
    name: player.name,
    streamId: player.streamId,
    avatar: player.avatar,
  });
  await queryClient.invalidateQueries({ queryKey: ['player.getAll'] });
  toast.add({ title: '已保存', description: '玩家信息已更新', color: 'success' });
}

async function onDelete(player: any) {
  await $trpc.player.delete.mutate({ id: player.id });
  await queryClient.invalidateQueries({ queryKey: ['player.getAll'] });
  toast.add({ title: '已删除', description: `玩家 ${player.name} 已删除`, color: 'success' });
}
</script>
