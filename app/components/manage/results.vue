<template>
  <div class="flex flex-col gap-6">
    <h2 class="text-2xl font-bold flex items-center gap-4">
      <UIcon name="lucide:clock" />
      <span>成绩管理</span>
    </h2>

    <div class="grid grid-cols-4 gap-8">
      <UCard v-for="result in data" :key="result.id">
        <template #header>
          <div class="flex items-center gap-2 justify-between w-full">
            <span class="text-lg font-semibold">
              {{ result.level.name }} by {{ result.player.name }}
            </span>
            <div class="flex items-center gap-2">
              <UModal title="删除成绩">
                <UButton size="sm" icon="lucide:trash" variant="subtle" color="error" />
                <template #body="{ close }">
                  <div class="space-y-4">
                    <p class="text-sm text-red-600">
                      此操作不可撤销，确认要删除该成绩吗？
                    </p>
                    <div class="flex justify-end gap-2">
                      <UButton color="neutral" variant="ghost" @click="close()">
                        取消
                      </UButton>
                      <UButton color="error" @click="() => onDelete(result)">
                        确认删除
                      </UButton>
                    </div>
                  </div>
                </template>
              </UModal>
            </div>
          </div>
        </template>
        时间：{{ msToCelesteTime(result.time) }}
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { msToCelesteTime } from '@/composables/time';

const { $trpc } = useNuxtApp();
const { data, suspense } = useQuery({
  queryKey: ['result.getAll'],
  queryFn: () => $trpc.result.getAll.query(),
});
await suspense();

const toast = useToast();
const queryClient = useQueryClient();

async function onDelete(result: any) {
  await $trpc.result.delete.mutate({ id: result.id });
  await queryClient.invalidateQueries({ queryKey: ['result.getAll'] });
  toast.add({ title: '已删除', description: `成绩 ${result.id} 已删除`, color: 'success' });
}
</script>
