<script setup lang="ts">
import { ElButton } from "element-plus";
import { Delete } from "@element-plus/icons-vue";
import { Cookie } from "@/types";

defineProps<{
  cookies: Cookie[];
  del?: boolean;
}>();

defineEmits<{
  (e: "delete", cookie: Cookie[]): void;
}>();
</script>

<template>
  <div class="px-4 pb-3">
    <div class="grid grid-cols-3 gap-2">
      <div
        v-for="cookie in cookies"
        :key="cookie.name"
        class="bg-gray-100 rounded p-2 overflow-hidden group"
      >
        <div class="flex flex-col">
          <div class="flex items-center justify-between mb-0.5 gap-2">
            <span class="font-medium text-sm truncate" :title="cookie.name">
              {{ cookie.name }}
            </span>
            <el-button
              v-if="del"
              type="danger"
              size="small"
              :icon="Delete"
              class="transition-opacity opacity-0 group-hover:opacity-100"
              @click.stop="$emit('delete', [cookie])"
              link
            />
          </div>

          <div class="text-xs text-primary-500 truncate" :title="cookie.value">
            {{ cookie.value }}
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!cookies.length" class="text-center text-gray-400 py-4 text-sm">
      页面暂无 Cookies
    </div>
  </div>
</template>
