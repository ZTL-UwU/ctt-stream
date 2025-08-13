<template>
  <div class="font-bold flex flex-col text-white text-[50px] bg-zinc-800/70 text-center pb-2">
    <div class="text-[25px] font-bold bg-zinc-800/70 p-3 flex justify-between items-center">
      <div class="flex-1" />
      <span class="justify-center flex-1">
        倒计时
      </span>
      <div class="justify-end flex-1 flex gap-1">
        <UButton icon="lucide:refresh-ccw" size="sm" color="neutral" @click="reset()" />
        <UButton v-if="isActive" icon="lucide:pause" size="sm" color="neutral" @click="pause()" />
        <UButton v-else icon="lucide:play" size="sm" color="neutral" @click="resume()" />
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

const { pause, resume, isActive } = useIntervalFn(() => {
  if (!countdownStore.startTime) {
    formatted.value = '2:00:00';
    return;
  }

  const remainingTime = countdownStore.startTime + 2 * 60 * 60 * 1000 - Date.now();

  if (remainingTime <= 0) {
    formatted.value = '比赛结束';
    pause();
  }

  formatted.value = msToTime(remainingTime);
}, 1000, {
  immediate: false,
  immediateCallback: true,
});

function reset() {
  pause();
  countdownStore.startTime = Date.now();
  formatted.value = msToTime(countdownStore.startTime + 2 * 60 * 60 * 1000 - Date.now());
}

onMounted(() => {
  if (countdownStore.startTime) {
    formatted.value = msToTime(countdownStore.startTime + 2 * 60 * 60 * 1000 - Date.now());
    resume();
  }
});
</script>
