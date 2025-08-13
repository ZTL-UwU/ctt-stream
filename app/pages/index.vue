<template>
  <div class="flex flex-col gap-16">
    <div class="flex gap-4">
      <UButton variant="subtle" color="neutral" to="/stream" size="xl" icon="lucide:tv" class="w-fit">
        直播界面
      </UButton>
      <UButton variant="subtle" color="neutral" to="/result" size="xl" icon="lucide:upload" class="w-fit">
        上传成绩
      </UButton>
    </div>
    <ManagePlayers />
    <USeparator />
    <ManageLevels />
    <USeparator />
    <ManageEvents />
    <USeparator />
    <ManageResults />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'manage',
});
</script>
