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
    currentUrl.value = url.href;

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
    const targetHostname = new URL(currentUrl.value).hostname;

    // 1. 获取当前所有 cookies
    const currentCookies = await browser.cookies.getAll({
      domain: targetHostname,
    });

    // 2. 获取需要同步的 cookie 映射（使用最后一个出现的值）
    const cookiesToSync = new Map(
      currentRule.value.list.flatMap(source => 
        source.cookie.map(cookieStr => {
          const [name, value] = cookieStr.split('=');
          return [name, value];
        })
      )
    );

    // 3. 删除不在同步列表中的 cookies
    for (const cookie of currentCookies) {
      if (!cookiesToSync.has(cookie.name)) {
        await browser.cookies.remove({
          url: currentUrl.value,
          name: cookie.name,
        });
      }
    }

    // 4. 同步新的 cookies（不重复）
    for (const [name, value] of cookiesToSync) {
      await browser.cookies.set({
        url: currentUrl.value,
        name,
        value,
        domain: targetHostname,
        path: "/",
      });
    }

    // 5. 更新显示的 cookie 列表
    const cookies = await browser.cookies.getAll({
      domain: targetHostname,
    });
    cookieList.value = cookies.map((cookie) => ({
      name: cookie.name,
      value: cookie.value,
    }));

    toast.success("同步成功");
  } catch (e) {
    console.error('Sync error:', e);
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

    <el-scrollbar v-else class="flex-1 px-4" view-class="pb-4">
      <CookieList :cookies="cookieList" />
      <RuleList :rules="currentRule.list" />
    </el-scrollbar>
  </div>
</template>
