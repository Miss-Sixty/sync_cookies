<script setup lang="ts">
import { Setting, Refresh } from "@element-plus/icons-vue";
defineProps<{
  currentUrl: string;
  syncing: boolean;
}>();

defineEmits<{
  sync: [];
  settings: [];
}>();
</script>

<template>
  <div
    class="bg-white px-4 py-2.5 shadow-sm flex justify-between items-center z-1"
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
      @click="$emit('sync')"
      :loading="syncing"
      :icon="Refresh"
    >
      同步
    </el-button>

    <router-link to="/settings" custom v-slot="{ navigate }">
      <el-button @click="navigate" :icon="Setting" />
    </router-link>
  </div>
</template>
