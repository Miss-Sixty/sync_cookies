<script setup lang="ts">
import { storage } from "wxt/storage";
import { CookieRule } from "../../../types";
import { STORAGE_KEY } from "../config";
import PageHeader from "./components/PageHeader.vue";
import EmptyState from "../../../components/EmptyState.vue";
import CookieList from "./components/CookieList.vue";
import RuleList from "./components/RuleList.vue";
import { toast } from "vue-sonner";
import { computed } from "vue";

const currentUrl = ref("");
const currentRule = ref<CookieRule>();
const cookieList = ref<{ name: string; value: string }[]>([]);
const syncing = ref(false);

// 添加状态
const sourceCookies = ref<{ [host: string]: string[] }>({});
const selectedCookies = ref<{ [host: string]: string[] }>({});

// 获取 cookies 的方法
const getCookies = async (host: string) => {
  if (!host) return [];
  try {
    if (!host.startsWith("http")) {
      host = "http://" + host;
    }
    const url = new URL(host);
    return await browser.cookies.getAll({ domain: url.hostname });
  } catch (e) {
    console.error("Get cookies error:", e);
    return [];
  }
};

// 更新来源的 cookies
const updateSourceCookies = async () => {
  if (!currentRule.value?.getHosts?.length) return;

  try {
    // 获取当前已同步的 cookie 名称集合
    const currentCookieNames = new Set(
      cookieList.value.map(cookie => cookie.name)
    );

    // 获取每个来源的最新 cookies
    for (const host of currentRule.value.getHosts) {
      if (!host) continue;
      const cookies = await getCookies(host);
      const cookieStrings = cookies.map(
        (cookie) => `${cookie.name}=${cookie.value}`
      );
      sourceCookies.value[host] = cookieStrings;

      // 自动选中名称匹配的 cookies
      selectedCookies.value[host] = cookieStrings.filter(cookieStr => {
        const name = cookieStr.split('=')[0];
        return currentCookieNames.has(name);
      });
    }
  } catch (e) {
    console.error("Update source cookies error:", e);
    toast.error("更新来源 Cookies 失败");
  }
};

// 处理 cookie 选择更新
const handleCookiesUpdate = (host: string, cookies: string[]) => {
  selectedCookies.value[host] = cookies;
};

// 初始化方法
const initCurrentPage = async () => {
  try {
    const [firstTabs] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!firstTabs?.url) return;

    const url = new URL(firstTabs.url);
    currentUrl.value = url.origin;

    // 添加调试日志
    console.log("Current URL:", currentUrl.value);

    const rules = (await storage.getItem<CookieRule[]>(STORAGE_KEY)) || [];
    console.log("All rules:", rules); // 添加调试日志

    currentRule.value = rules.find(
      (rule) => rule.targetHost === currentUrl.value
    );

    console.log("Current rule:", currentRule.value); // 添加调试日志

    if (!currentRule.value) return;
    // 获取当前页面的 cookies
    const cookies = await getCookies(url.hostname);
    cookieList.value = cookies.map((cookie) => ({
      name: cookie.name,
      value: cookie.value,
    }));

    // 更新来源的 cookies
    await updateSourceCookies();
    console.log("Source cookies:", sourceCookies.value); // 添加调试日志
  } catch (error) {
    console.error("Init error:", error);
    ElMessage.error("初始化失败");
  }
};
initCurrentPage();

// 同步cookies
const handleSync = async () => {
  // 获取所有选中的 cookies
  const allSelectedCookies = Object.values(selectedCookies.value).flat();

  if (!allSelectedCookies.length) {
    ElMessage.warning("请选择要同步的 Cookie");
    return;
  }

  try {
    syncing.value = true;
    const targetHostname = new URL(currentUrl.value).hostname;

    // 创建 cookie 映射
    const cookiesToSync = new Map(
      allSelectedCookies.map((cookieStr) => {
        const [name, value] = cookieStr.split("=");
        return [name, value];
      })
    );

    // 1. 获取当前所有 cookies
    const currentCookies = await browser.cookies.getAll({
      domain: targetHostname,
    });

    // 2. 删除不在同步列表中的 cookies
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
    console.error("Sync error:", e);
    toast.error(`同步失败: ${e}`);
  } finally {
    syncing.value = false;
  }
};

// 删除单个 cookie
const handleDeleteCookie = async (name: string) => {
  try {
    const targetHostname = new URL(currentUrl.value).hostname;
    await browser.cookies.remove({
      url: currentUrl.value,
      name,
    });

    // 更新显示的 cookie 列表
    const cookies = await browser.cookies.getAll({
      domain: targetHostname,
    });
    cookieList.value = cookies.map((cookie) => ({
      name: cookie.name,
      value: cookie.value,
    }));

    toast.success("删除成功");
  } catch (e) {
    console.error("Delete cookie error:", e);
    toast.error(`删除失败: ${e}`);
  }
};

// 清除所有 cookies
const handleClearCookies = async () => {
  try {
    // 删除所有 cookies
    for (const cookie of cookieList.value) {
      await browser.cookies.remove({
        url: currentUrl.value,
        name: cookie.name,
      });
    }

    cookieList.value = [];
    toast.success("清除成功");
  } catch (e) {
    console.error("Clear cookies error:", e);
    toast.error(`清除失败: ${e}`);
  }
};

// 添加计算属性检查是否需要同步
const needSync = computed(() => {
  if (!currentRule.value || !cookieList.value.length) return false;
  
  // 获取所有来源的 cookies
  const allSourceCookies = new Map(
    Object.values(sourceCookies.value)
      .flat()
      .map(cookie => {
        const [name, value] = cookie.split('=');
        return [name, value];
      })
  );

  // 检查当前 cookies 是否与来源 cookies 不同
  return cookieList.value.some(cookie => {
    const sourceValue = allSourceCookies.get(cookie.name);
    return sourceValue && sourceValue !== cookie.value;
  });
});
</script>

<template>
  <div class="flex flex-col h-full">
    <PageHeader
      :current-url="currentUrl"
      :syncing="syncing"
      :need-sync="needSync"
      @sync="handleSync"
    />

    <EmptyState v-if="!currentRule" @add="$router.push('/add')" />

    <el-scrollbar v-else class="flex-1 px-4" view-class="pb-4">
      <CookieList
        :cookies="cookieList"
        @delete="handleDeleteCookie"
        @clear="handleClearCookies"
      />
      <RuleList
        :rules="currentRule.getHosts"
        :cookies="sourceCookies"
        :selected-cookies="selectedCookies"
        @update:cookies="handleCookiesUpdate"
      />
    </el-scrollbar>
  </div>
</template>
