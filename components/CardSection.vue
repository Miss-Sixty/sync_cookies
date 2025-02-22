<script setup lang="ts">
import { ElIcon } from "element-plus";

defineProps<{
  title: string;
  icon?: Component;
}>();
</script>

<template>
  <div class="rounded-lg shadow-sm bg-white mt-2">
    <div class="flex items-center justify-between px-4 py-2">
      <div class="flex items-center gap-1 font-medium">
        <el-icon><component :is="icon" /></el-icon>
        {{ title }}
      </div>
      <slot name="extra"></slot>
    </div>
    <slot></slot>
  </div>
</template>

<style scoped>
.text-primary-600 {
  color: var(--el-color-primary);
}
</style>
