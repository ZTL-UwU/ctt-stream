<template>
  <div class="flex flex-col p-[20px] gap-[20px] overflow-hidden">
    <div class="flex gap-[20px]">
      <Stream2 :avatar="players[0]?.avatar" :room-id="players[0]?.streamId" :player-name="players[0]?.name" :leaderboard class="flex-1" />
      <Stream2 :avatar="players[1]?.avatar" :room-id="players[1]?.streamId" :player-name="players[1]?.name" :leaderboard class="flex-1" />
    </div>
    <div class="flex gap-[20px] h-[401px]">
      <div class="basis-1/4 flex flex-col gap-[20px] items-center">
        <div class="bg-zinc-800/70">
          <img src="/logo.png" class="px-20 p-5">
        </div>
        <div class="bg-zinc-800/70 p-4 w-full text-center flex items-center text-[30px] text-warning flex-1">
          <span class="flex-1">
            {{ data?.name }}
          </span>
        </div>
      </div>
      <div class="basis-1/4 flex flex-col gap-[20px]">
        <Countdown />
        <div class="bg-zinc-800/70 flex-1" />
      </div>
      <Leaderboard2 :player="leaderboard?.leaderboard[0]!" class="basis-1/4" :leaderboard />
      <Leaderboard2 :player="leaderboard?.leaderboard[1]!" class="basis-1/4" :leaderboard />
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
