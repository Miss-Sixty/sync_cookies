<script setup lang="ts">
import { Collection } from "@element-plus/icons-vue";
import CardSection from "../../../../components/CardSection.vue";

defineProps<{
  cookies: { name: string; value: string }[];
}>();
</script>

<template>
  <CardSection
    title="已同步 Cookies"
    :count="cookies.length"
    :icon="Collection"
  >
    <div class="px-4 pb-3">
      <div class="grid grid-cols-3 gap-2">
        <div
          v-for="cookie in cookies"
          :key="cookie.name"
          class="bg-gray-100 rounded p-2 transition-colors"
        >
          <div class="flex flex-col">
            <span class="font-medium text-sm truncate" :title="cookie.name">
              {{ cookie.name }}
            </span>
            <div class="text-xs text-gray-500 truncate" :title="cookie.value">
              {{ cookie.value }}
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-if="!cookies.length"
        class="text-center text-gray-400 py-4 text-sm"
      >
        暂无同步的 Cookies
      </div>
    </div>
  </CardSection>
</template>
