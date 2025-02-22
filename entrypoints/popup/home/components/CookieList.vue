<script setup lang="ts">
import { Collection } from "@element-plus/icons-vue";
import CardSection from "../../../../components/CardSection.vue";

defineProps<{
  cookies: { name: string; value: string }[];
}>();
</script>

<template>
  <CardSection title="已同步Cookies" :count="cookies.length" :icon="Collection">
    <div class="grid grid-cols-2 gap-1.5">
      <div
        v-for="cookie in cookies"
        :key="cookie.name"
        class="rounded-lg shadow-sm px-3 py-2 bg-white"
      >
        <span class="font-medium">{{ cookie.name }}</span>
        <div class="text-xs text-gray-500 truncate" :title="cookie.value">
          {{ cookie.value }}
        </div>
      </div>
    </div>
  </CardSection>
</template>
