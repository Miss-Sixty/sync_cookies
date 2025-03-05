<script setup lang="ts">
import { GetHosts } from "@/types";
import { Setting, Refresh, Plus } from "@element-plus/icons-vue";
defineProps<{
  currentUrl: string;
  syncing: boolean;
  needSync?: boolean;
  getHosts: GetHosts[];
}>();

defineEmits<{
  sync: [];
  settings: [];
}>();
</script>

<template>
  <div
    class="bg-white px-3 py-2.5 shadow-sm flex justify-between items-center z-1"
  >
    <div class="flex-1 flex flex-col overflow-hidden mr-2">
      <span class="text-gray-400 text-xs">当前网址</span>
      <span
        class="text-gray-800 font-medium truncate flex-1"
        :title="currentUrl"
      >
        {{ currentUrl }}
      </span>
    </div>

    <el-button
      type="primary"
      :loading="syncing"
      :class="{ 'el-button--warning': needSync }"
      @click="$emit('sync')"
      :icon="Refresh"
      title="同步"
      :disabled="!getHosts.length"
    >
      {{ needSync ? "Cookie 已更新，点击同步" : "同步" }}
    </el-button>

    <router-link to="/settings" custom v-slot="{ navigate }">
      <el-button @click="navigate" :icon="Setting" circle title="设置" />
    </router-link>
  </div>
</template>
