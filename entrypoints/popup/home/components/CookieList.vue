<script setup lang="ts">
import { Collection, Delete } from "@element-plus/icons-vue";
import CardSection from "../../../../components/CardSection.vue";
import { ElMessageBox } from "element-plus";
import { getCookies } from "../../utils";
import { toast } from "vue-sonner";

const props = defineProps<{
  cookies: { name: string; value: string }[];
  currentUrl: string;
  cookieList: { name: string; value: string }[];
}>();

const emit = defineEmits<{
  delete: [name: string];
  clear: [];
  "update:cookieList": [cookieList: { name: string; value: string }[]];
}>();

// 删除单个 cookie
const handleDeleteCookie = async (name: string) => {
  try {
    await browser.cookies.remove({
      url: props.currentUrl,
      name,
    });
    emit("update:cookieList", await getCookies(props.currentUrl));
  } catch (e) {
    console.error("Delete cookie error:", e);
    toast.error(`删除失败: ${e}`);
  }
};

// 清除所有 cookies
const handleClear = async () => {
  try {
    await ElMessageBox.confirm("确定要删除全部 Cookie 吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    handleClearCookies();
  } catch (e) {}
};

// 清除所有 cookies
const handleClearCookies = async () => {
  try {
    for (const cookie of props.cookieList) {
      await browser.cookies.remove({
        url: props.currentUrl,
        name: cookie.name,
      });
    }
    emit("update:cookieList", await getCookies(props.currentUrl));
  } catch (e) {
    console.error("Clear cookies error:", e);
    toast.error(`清除失败: ${e}`);
  }
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
                @click.stop="handleDeleteCookie(cookie.name)"
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
