<template>
  <div class="flex p-[20px] gap-[20px] overflow-hidden">
    <div class="basis-2/5 flex flex-col gap-[20px]">
      <Stream :avatar="players[0]?.avatar" :room-id="players[0]?.streamId" :player-name="players[0]?.name" :leaderboard />
      <Stream :avatar="players[1]?.avatar" :room-id="players[1]?.streamId" :player-name="players[1]?.name" :leaderboard />
    </div>
    <div class="basis-2/5 flex flex-col gap-[20px]">
      <Stream :avatar="players[2]?.avatar" :room-id="players[2]?.streamId" :player-name="players[2]?.name" :leaderboard />
      <Stream :avatar="players[3]?.avatar" :room-id="players[3]?.streamId" :player-name="players[3]?.name" :leaderboard />
    </div>
    <div class="basis-1/5 flex flex-col gap-[20px]">
      <div class="bg-zinc-800/70 py-2">
        <img src="/logo.png" class="px-9 p-5">
      </div>
      <div class="bg-zinc-800/70 p-4 text-center flex items-center text-[30px] text-warning">
        <span class="flex-1">
          {{ data?.name }}
        </span>
      </div>
      <Countdown />
      <Leaderboard :leaderboard />
      <div class="bg-zinc-800/70 flex-1" />
    </div>
  </div>
  <div class="-z-40 w-screen h-screen fixed top-0 bg-zinc-800/60" />
  <img src="/bg.png" class="-z-50 fixed top-0 w-full">
</template>

<script setup lang="ts">
const { $trpc } = useNuxtApp();
const { data, suspense } = useQuery({
  queryKey: ['event.getActive'],
  queryFn: () => $trpc.event.getActive.query(),
});
await suspense();

const players = computed(() => data?.value?.players.map(p => p.player) || []);

const { data: leaderboard, suspense: leaderboardSuspense } = useQuery({
  queryKey: ['leaderboard'],
  queryFn: () => $trpc.leaderboard.query(),
  refetchInterval: 10000,
  refetchIntervalInBackground: true,
});
await leaderboardSuspense();
</script>
