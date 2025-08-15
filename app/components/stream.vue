<template>
  <div>
    <iframe
      :src="`https://www.bilibili.com/blackboard/live/live-activity-player.html?cid=${roomId}&danmaku=0&logo=0`" frameborder="0"
      width="736" height="414"
      class="w-full"
    />
    <div class="h-[95px] text-white bg-zinc-800/70 flex items-center justify-between px-5">
      <img :src="avatar" class="rounded-full h-12 w-12">
      <!-- <UAvatar size="3xl" :src="avatar" /> -->
      <span class="text-[40px] font-semibold">
        {{ playerName }}
      </span>
      <span class="text-[30px] font-semibold font-mono">
        {{ time }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RouterOutput } from '~~/types';

const { roomId, leaderboard, playerName } = defineProps<{
  avatar: string;
  roomId: string;
  playerName: string;
  leaderboard: RouterOutput['leaderboard'];
}>();

const time = computed(() => {
  const player = leaderboard?.leaderboard.find(p => p.player.name === playerName);
  if (!player)
    return '0:00.000';
  if (player.bestTimes.length < leaderboard.levelAmount)
    return `${player.bestTimes.length} / ${leaderboard.levelAmount}`;
  return msToCelesteTime(player.totalTime);
});
</script>
