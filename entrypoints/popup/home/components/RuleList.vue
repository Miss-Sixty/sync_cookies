<script setup lang="ts">
import { Document, Link } from "@element-plus/icons-vue";
import { ListItem } from "../../../../types";
import CardSection from "../../../../components/CardSection.vue";

defineProps<{
  rules: ListItem[];
}>();

// 辅助函数：分割 cookie 字符串
const splitCookie = (cookie: string) => {
  const [name, value] = cookie.split("=");
  return { name, value };
};
</script>

<template>
  <CardSection
    v-for="(item, i) in rules"
    :key="item.host"
    :icon="Document"
    :title="`来源地址${i + 1}: ${item.host}`"
  >
    <div class="grid grid-cols-3 gap-2 px-3 pb-3">
      <div
        v-for="cookie in item.cookie"
        :key="cookie"
        class="bg-gray-100 rounded p-2 transition-colors"
      >
        <div class="flex flex-col">
          <span
            class="font-medium text-sm truncate"
            :title="splitCookie(cookie).name"
          >
            {{ splitCookie(cookie).name }}
          </span>
          <div
            class="text-xs text-gray-500 truncate"
            :title="splitCookie(cookie).value"
          >
            {{ splitCookie(cookie).value }}
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
