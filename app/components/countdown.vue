<template>
  <div class="font-bold flex flex-col text-white text-[50px] bg-zinc-800/70 text-center">
    <div class="text-[25px] font-bold bg-zinc-800/70 p-3 flex justify-between items-center">
      <div class="flex-1" />
      <span class="justify-center flex-1">
        倒计时
      </span>
      <div class="justify-end flex-1 flex gap-1">
        <UButton icon="lucide:refresh-ccw" size="sm" color="neutral" @click="reset()" />
        <UButton v-if="isActive" icon="lucide:pause" size="sm" color="neutral" @click="pause()" />
        <UButton v-else icon="lucide:play" size="sm" color="neutral" @click="resumeOrStart()" />
      </div>
    </div>
    <span class="font-mono">
      {{ formatted }}
    </span>
  </div>
</template>

<script setup lang="ts">
const countdownStore = useCountdownStore();

const formatted = ref<string>('2:00:00');

function getFormattedTime(startTime: number): string {
  const remainingTime = startTime + 2 * 60 * 60 * 1000 - Date.now();

  if (remainingTime <= 0) {
    return '比赛结束';
  }

  return msToTime(remainingTime);
}

const { pause, resume, isActive } = useIntervalFn(() => {
  if (!countdownStore.startTime) {
    formatted.value = '2:00:00';
    return;
  }

  formatted.value = getFormattedTime(countdownStore.startTime);
}, 1000, {
  immediate: false,
  immediateCallback: true,
});

function resumeOrStart() {
  if (!countdownStore.startTime) {
    countdownStore.startTime = Date.now();
  }
  resume();
}

function reset() {
  pause();
  countdownStore.startTime = Date.now();
  formatted.value = getFormattedTime(countdownStore.startTime);
}

onMounted(() => {
  if (countdownStore.startTime) {
    formatted.value = getFormattedTime(countdownStore.startTime);
    resume();
  }
});
</script>
