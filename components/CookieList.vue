<script setup lang="ts">
import { Collection } from "@element-plus/icons-vue";
import CardSection from "@/components/CardSection.vue";
import { ElMessageBox } from "element-plus";
import { handleClearCookies } from "@/entrypoints/popup/utils";
import { toast } from "vue-sonner";
import Card from "@/components/Card.vue";
import { Cookie } from "@/types";

const props = defineProps<{
  cookies: { name: string; value: string }[];
  currentUrl: string;
  cookieList: { name: string; value: string }[];
}>();

const emit = defineEmits<{
  delete: [cookie: Cookie];
  clear: [];
  "update:cookieList": [cookieList: Cookie[]];
}>();

// 删除 cookie
const handleDeleteCookie = async (cookie: Cookie[], type = "one") => {
  try {
    if (type === "all") {
      await ElMessageBox.confirm("确定要删除全部 Cookie 吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      });
    }
    emit(
      "update:cookieList",
      await handleClearCookies(props.currentUrl, cookie)
    );
  } catch (e) {
    console.error("Delete cookie error:", e);
    toast.error(`删除失败: ${e}`);
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
        @click="handleDeleteCookie(cookieList, 'all')"
      >
        清除全部
      </el-button>
    </template>

    <Card del :cookies="cookies" @delete="handleDeleteCookie" />
  </CardSection>
</template>