import { defineStore } from 'pinia';

export const useRuleStore = defineStore('rules', {
  state: () => ({
    editingRule: {
      targetHost: "",
      getHosts: [],
    }
  }),
  actions: {

  },
});
