<template>
  <div class="flex flex-col gap-2 text-white bg-zinc-800/70 text-center py-4">
    <!-- <div class="text-[25px] font-bold bg-zinc-800/70 p-3">
      排行榜
    </div> -->
    <div class="flex items-center justify-between px-5 py-2">
      <div class="flex items-center gap-4">
        <img :src="player.player.avatar" class="rounded-full h-8 w-8">
        <span class="text-[26px] font-semibold">{{ player.player.name }}</span>
      </div>
      <span class="text-[26px] font-semibold font-mono">
        {{ player.bestTimes.length < (leaderboard?.levelAmount ?? 3)
          ? `${player.bestTimes.length} / ${leaderboard?.levelAmount}`
          : msToCelesteTime(player.totalTime) }}
      </span>
    </div>
    <div v-for="level in leaderboard?.levels" :key="level.levelId">
      <div class="flex items-center justify-between px-5 py-2">
        <div class="flex gap-4 items-center">
          <img v-if="level.level.avatar" :src="level.level.avatar" class="h-8 w-8">
          <span class="text-[26px]">{{ level.level.name }}</span>
        </div>
        <span class="text-[26px] font-mono">
          {{ player.bestTimes.find(t => t.levelId === level.levelId)?.time
            ? msToCelesteTime(player.bestTimes.find(t => t.levelId === level.levelId)!.time)
            : '未完成' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RouterOutput } from '~~/types';
import { msToCelesteTime } from '@/composables/time';

defineProps<{
  leaderboard: RouterOutput['leaderboard'] | undefined;
  player: RouterOutput['leaderboard']['leaderboard'][number];
}>();
</script>
