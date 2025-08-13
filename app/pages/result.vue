<template>
  <div class="p-4 max-w-2xl mx-auto space-y-6">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h1 class="text-lg font-semibold">
            上传成绩
          </h1>
        </div>
      </template>

      <UForm :schema="schema" :state="form" class="space-y-6" @submit="onSubmit">
        <div class="flex flex-col gap-4">
          <UFormField name="eventId" required>
            <USelect
              v-model="form.eventId"
              :items="eventOptions"
              option-attribute="label"
              value-attribute="value"
              placeholder="选择活动"
              class="w-full"
            />
          </UFormField>

          <UFormField name="playerId" required>
            <USelect
              v-model="form.playerId"
              :items="playerOptions"
              option-attribute="label"
              value-attribute="value"
              placeholder="选择玩家"
              :disabled="!form.eventId"
              class="w-full"
            />
          </UFormField>

          <UFormField name="levelId" required>
            <USelect
              v-model="form.levelId"
              :items="levelOptions"
              option-attribute="label"
              value-attribute="value"
              placeholder="选择关卡"
              :disabled="!form.eventId"
              class="w-full"
            />
          </UFormField>

          <UFormField name="time" required>
            <UInput
              v-model="form.time"
              placeholder="时间"
              class="w-full"
            />
            <span class="text-sm mt-2 text-warning">请保证时间格式为 M:SS.mmm（如 0:57.239 / 1:27.159）</span>
          </UFormField>
        </div>

        <div class="flex items-center gap-3">
          <UButton type="submit" :loading="submitting" icon="lucide:upload">
            提交
          </UButton>
          <UButton type="button" variant="soft" color="neutral" icon="i-heroicons-x-mark" @click="resetForm">
            清空表格
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod';

definePageMeta({ layout: 'manage' });

const { $trpc } = useNuxtApp();

const schema = z.object({
  eventId: z.number(),
  playerId: z.number(),
  levelId: z.number(),
  time: z.string(),
});

interface FormState {
  eventId?: number;
  playerId?: number;
  levelId?: number;
  time?: string;
}

const form = reactive<FormState>({});

const { data: eventsData, suspense: eventSuspense } = useQuery({
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

const eventOptions = computed(() => (eventsData?.value || []).map(l => ({ label: l.name, value: l.id })));
const levelOptions = computed(() => (levelsData?.value || []).map(l => ({ label: l.name, value: l.id })));
const playerOptions = computed(() => (playersData?.value || []).map(p => ({ label: p.name, value: p.id })));

watch(() => form.eventId, () => {
  form.playerId = undefined;
  form.levelId = undefined;
});

function resetForm() {
  form.eventId = undefined;
  form.playerId = undefined;
  form.levelId = undefined;
  form.time = undefined;
}

const submitting = ref(false);
async function onSubmit() {
  submitting.value = true;
  try {
    const parsed = schema.parse(form);
    await $trpc.result.create.mutate({
      eventId: parsed.eventId,
      playerId: parsed.playerId,
      levelId: parsed.levelId,
      time: celesteTimeToMs(parsed.time),
    });
    form.playerId = undefined;
    form.levelId = undefined;
    form.time = undefined;
  }
  catch (e: any) {
    console.error('Submission failed:', e);
  }
  finally {
    submitting.value = false;
  }
}
</script>
