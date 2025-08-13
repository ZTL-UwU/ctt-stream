<template>
  <div class="flex flex-col gap-6">
    <h2 class="text-2xl font-bold flex items-center gap-4">
      <UIcon name="lucide:layers" />
      <span>关卡管理</span>
      <UModal title="创建关卡">
        <UButton icon="lucide:plus" size="lg" label="创建" color="neutral" variant="subtle" class="w-fit" />

        <template #body>
          <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
            <UFormField label="名称" name="name">
              <UInput v-model="state.name" />
            </UFormField>
            <UButton type="submit">
              提交
            </UButton>
          </UForm>
        </template>
      </UModal>
    </h2>

    <div class="grid grid-cols-4 gap-8">
      <UCard v-for="level in data" :key="level.id">
        <template #header>
          <div class="flex items-center gap-2 justify-between w-full">
            <span class="text-lg font-semibold">
              {{ level.name }}
            </span>
            <div class="flex items-center gap-2">
              <UModal :title="`修改关卡：${level.name}`">
                <UButton size="sm" icon="lucide:edit" variant="subtle" color="neutral" />
                <template #body>
                  <UForm :state="level" class="space-y-4" @submit="() => onUpdate(level)">
                    <UFormField label="名称" name="name">
                      <UInput v-model="level.name" />
                    </UFormField>
                    <div class="flex gap-2 justify-end">
                      <UButton type="submit" color="primary">
                        保存
                      </UButton>
                    </div>
                  </UForm>
                </template>
              </UModal>
              <UModal :title="`删除关卡：${level.name}`">
                <UButton size="sm" icon="lucide:trash" variant="subtle" color="error" />
                <template #body="{ close }">
                  <div class="space-y-4">
                    <p class="text-sm text-red-600">
                      此操作不可撤销，确认要删除该关卡及其相关成绩/关联吗？
                    </p>
                    <div class="flex justify-end gap-2">
                      <UButton color="neutral" variant="ghost" @click="close()">
                        取消
                      </UButton>
                      <UButton color="error" @click="() => onDelete(level)">
                        确认删除
                      </UButton>
                    </div>
                  </div>
                </template>
              </UModal>
            </div>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import * as z from 'zod';

const { $trpc } = useNuxtApp();
const { data, suspense } = useQuery({
  queryKey: ['level.getAll'],
  queryFn: () => $trpc.level.getAll.query(),
});
await suspense();

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  name: undefined,
});

const toast = useToast();
const queryClient = useQueryClient();
async function onSubmit(event: FormSubmitEvent<Schema>) {
  await $trpc.level.create.mutate({
    name: event.data.name,
  });
  await queryClient.invalidateQueries({ queryKey: ['level.getAll'] });
  state.name = undefined;
  toast.add({ title: '成功', description: '关卡已创建', color: 'success' });
}

async function onUpdate(level: any) {
  await $trpc.level.update.mutate({
    id: level.id,
    name: level.name,
  });
  await queryClient.invalidateQueries({ queryKey: ['level.getAll'] });
  toast.add({ title: '已保存', description: '关卡已更新', color: 'success' });
}

async function onDelete(level: any) {
  await $trpc.level.delete.mutate({ id: level.id });
  await queryClient.invalidateQueries({ queryKey: ['level.getAll'] });
  toast.add({ title: '已删除', description: `关卡 ${level.name} 已删除`, color: 'success' });
}
</script>
