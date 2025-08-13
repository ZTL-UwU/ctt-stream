import { defineStore } from 'pinia';

export const useCountdownStore = defineStore('countdown', () => {
  const startTime = ref<number | null>(null);
  return {
    startTime,
  };
}, {
  persist: {
    storage: piniaPluginPersistedstate.cookies({
      // One month
      maxAge: 30 * 24 * 60 * 60,
    }),
  },
});
