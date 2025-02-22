<script setup lang="ts">
import { Document, Link } from "@element-plus/icons-vue";
import { ListItem } from "../../../../types";
import CardSection from ".//CardSection.vue";

defineProps<{
  rules: ListItem[];
}>();
</script>

<template>
  <CardSection title="来源网站" :icon="Document" :count="rules.length">
    <div class="space-y-1.5">
      <div
        v-for="item in rules"
        :key="item.host"
        class="rounded-lg shadow-sm px-3 py-2 bg-white"
      >
        <span class="font-medium">{{ item.host }}</span>
        <div class="grid grid-cols-2 gap-1.5">
          <div
            v-for="cookie in item.cookie"
            :key="cookie"
            class="text-xs text-gray-500 truncate"
            :title="cookie"
          >
            {{ cookie }}
          </div>
        </div>
      </div>
    </div>
  </CardSection>
</template>

<style scoped>
.text-primary-600 {
  color: var(--el-color-primary);
}

.border-primary-100 {
  border-color: #d9ecff;
}
</style>
