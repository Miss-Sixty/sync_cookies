<script setup lang="ts">
import { Document, Link } from "@element-plus/icons-vue";
import { ListItem } from "../../../../types";
import CardSection from "../../../../components/CardSection.vue";

defineProps<{
  rules: ListItem[];
}>();
</script>

<template>
  <CardSection title="来源网站" :icon="Document" :count="rules.length">
    <div class="px-4 pb-3">
      <div class="space-y-2">
        <div
          v-for="item in rules"
          :key="item.host"
          class="bg-gray-50 rounded p-3"
        >
          <div class="flex items-center gap-2 mb-2">
            <el-icon><Link /></el-icon>
            <span class="font-medium">{{ item.host }}</span>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="cookie in item.cookie"
              :key="cookie"
              class="bg-white rounded px-2.5 py-1.5 text-xs text-gray-600"
            >
              {{ cookie }}
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!rules.length" class="text-center text-gray-400 py-4 text-sm">
        暂无来源网站配置
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
