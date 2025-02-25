<script setup lang="ts">
import { Collection, Delete } from "@element-plus/icons-vue";
import CardSection from "../../../../components/CardSection.vue";
import { ElMessageBox } from "element-plus";

const props = defineProps<{
  cookies: { name: string; value: string }[];
}>();

const emit = defineEmits<{
  delete: [name: string];
  clear: [];
}>();

// 删除单个 cookie
const handleDelete = (name: string) => {
  ElMessageBox.confirm("确定要删除该 Cookie 吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    emit("delete", name);
  });
};

// 清除所有 cookies
const handleClear = () => {
  ElMessageBox.confirm("确定要删除全部 Cookie 吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    emit("clear");
  });
};
</script>

<template>
  <CardSection title="已同步 Cookies" :icon="Collection">
    <template #extra>
      <el-button
        v-if="cookies.length"
        type="danger"
        size="small"
        link
        @click="handleClear"
      >
        清除全部
      </el-button>
    </template>

    <div class="px-4 pb-3">
      <div class="grid grid-cols-3 gap-2">
        <div
          v-for="cookie in cookies"
          :key="cookie.name"
          class="bg-primary-50 rounded p-2 group relative"
        >
          <div class="flex flex-col">
            <!-- 名称行 -->
            <div class="flex items-center justify-between mb-0.5 gap-2">
              <span
                class="font-medium text-sm truncate flex-1 text-primary-700"
                :title="cookie.name"
              >
                {{ cookie.name }}
              </span>
              <el-button
                type="danger"
                size="small"
                :icon="Delete"
                class="opacity-0 group-hover:opacity-100 transition-opacity !absolute right-1 top-1"
                @click.stop="handleDelete(cookie.name)"
                link
              />
            </div>
            <!-- 值行 -->
            <div 
              class="text-xs text-primary-500 truncate" 
              :title="cookie.value"
            >
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

<style scoped>
.bg-primary-50 {
  background-color: var(--el-color-primary-light-9);
}
.text-primary-700 {
  color: var(--el-color-primary-dark-2);
}
.text-primary-500 {
  color: var(--el-color-primary);
}
</style>
