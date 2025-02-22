<script setup lang="ts">
import { ElIcon } from "element-plus";

defineProps<{
  title: string;
  count?: number;
  icon: Component;
}>();
</script>

<template>
  <div class="px-2">
    <div class="flex items-center pt-4 pb-2 gap-1">
      <el-icon><component :is="icon" /></el-icon>
      {{ title }}
      <span v-if="count !== undefined" class="text-gray-400">
        ({{ count }})
      </span>
    </div>
    <slot></slot>
  </div>
</template>

<style scoped>
.text-primary-600 {
  color: var(--el-color-primary);
}
</style>
