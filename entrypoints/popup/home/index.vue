<script setup lang="ts">
import { storage } from "wxt/storage";
import { CookieRule } from "../../../types";
import { STORAGE_KEY } from "../config";
import PageHeader from "./components/PageHeader.vue";
import EmptyState from "./components/EmptyState.vue";
import CookieList from "./components/CookieList.vue";
import RuleList from "./components/RuleList.vue";
import { toast } from "vue-sonner";

const currentUrl = ref("");
const currentRule = ref<CookieRule>();
const cookieList = ref<{ name: string; value: string }[]>([]);
const syncing = ref(false);

// 获取当前网址并查找对应规则
const initCurrentPage = async () => {
  try {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tabs[0]?.url) return;

    const url = new URL(tabs[0].url);
    currentUrl.value = url.origin;

    const rules = (await storage.getItem<CookieRule[]>(STORAGE_KEY)) || [];
    currentRule.value = rules.find(
      (rule) => rule.targetHost === currentUrl.value
    );

    if (currentRule.value) {
      const cookies = await browser.cookies.getAll({ domain: url.hostname });
      cookieList.value = cookies.map((cookie) => ({
        name: cookie.name,
        value: cookie.value,
      }));
    }
  } catch (error) {
    console.error("Init error:", error);
    ElMessage.error("初始化失败");
  }
};

// 同步cookies
const handleSync = async () => {
  if (!currentRule.value) {
    ElMessage.warning("当前网址没有保存的规则");
    return;
  }

  try {
    syncing.value = true;
    for (const source of currentRule.value.list) {
      const url = new URL(
        source.host.startsWith("http") ? source.host : `http://${source.host}`
      );
      const sourceCookies = await browser.cookies.getAll({
        domain: url.hostname,
      });

      for (const cookieStr of source.cookie) {
        const [name, value] = cookieStr.split("=");
        await browser.cookies.set({
          url: currentUrl.value,
          name,
          value,
          domain: new URL(currentUrl.value).hostname,
          path: "/",
        });
      }
    }

    const cookies = await browser.cookies.getAll({
      domain: new URL(currentUrl.value).hostname,
    });
    cookieList.value = cookies.map((cookie) => ({
      name: cookie.name,
      value: cookie.value,
    }));

    toast.success("同步成功");
  } catch (e) {
    toast.error(`同步失败: ${e}`);
  } finally {
    syncing.value = false;
  }
};

onMounted(() => {
  initCurrentPage();
});
</script>

<template>
  <div class="flex flex-col h-full">
    <PageHeader
      :current-url="currentUrl"
      :syncing="syncing"
      @sync="handleSync"
    />

    <EmptyState v-if="!currentRule" @add="$router.push('/add')" />

    <el-scrollbar v-else class="flex-1 px-2" view-class="pb-4">
      <CookieList :cookies="cookieList" />
      <RuleList :rules="currentRule.list" />
    </el-scrollbar>
  </div>
</template>
