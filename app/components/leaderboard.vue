<template>
  <div class="flex flex-col gap-4 text-white bg-zinc-800/70 text-center pb-4">
    <div class="text-[25px] font-bold bg-zinc-800/70 p-3">
      排行榜
    </div>
    <div v-for="player in leaderboard?.leaderboard" :key="player.player.id" class="flex items-center justify-between px-5 py-2">
      <div class="flex items-center gap-2">
        <img :src="player.player.avatar" class="rounded-full h-8 w-8">
        <span class="text-[24px] font-semibold">{{ player.player.name }}</span>
      </div>
      <span class="text-[22px] font-semibold font-mono">
        {{ player.bestTimes.length < (leaderboard?.levelAmount ?? 3)
          ? `${player.bestTimes.length} / ${leaderboard?.levelAmount}`
          : msToCelesteTime(player.totalTime) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RouterOutput } from '~~/types';
import { msToCelesteTime } from '@/composables/time';

defineProps<{
  leaderboard: RouterOutput['leaderboard'] | undefined;
}>();
</script>
