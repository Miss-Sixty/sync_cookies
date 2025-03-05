<script setup lang="ts">
import { CookieRule } from "../../../types";
import PageHeader from "./components/PageHeader.vue";
import CookieList from "./components/CookieList.vue";
import RuleList from "./components/RuleList.vue";
import { toast } from "vue-sonner";
import { computed } from "vue";
import {
  getAllRules,
  getCookies,
  getCurrentRule,
  getCurrentUrl,
  handleSaveData,
} from "../utils";

const currentUrl = ref("");
const currentRule = ref<CookieRule>({
  targetHost: "",
  getHosts: [],
});
const cookieList = ref<{ name: string; value: string }[]>([]);
const syncing = ref(false);

// 初始化方法
const initCurrentPage = async () => {
  try {
    // 获取当前页面url
    currentUrl.value = await getCurrentUrl();
    currentRule.value.targetHost = currentUrl.value;
    console.log("Current URL:", currentUrl.value);

    // 获取当前页面地址的 cookies
    cookieList.value = await getCookies(currentUrl.value);

    // 获取所有保存规则
    const rules = await getAllRules();
    console.log("Rules:", rules);
    if (!rules?.length) return;

    // 获取当前页面保存规则
    const _currentRule = getCurrentRule(rules, currentUrl.value);
    if (_currentRule) currentRule.value = _currentRule;
    console.log("Current rule:", currentRule.value);
    // 更新所有来源页面的 cookies
    currentRule.value.getHosts.forEach(async (host) => {
      host.cookies = await getCookies(host.host);
    });
  } catch (error) {
    console.error("Init error:", error);
    ElMessage.error("初始化失败");
  }
};
initCurrentPage();

// 同步cookies
const handleSync = async () => {
  const hosts = currentRule.value?.getHosts;
  if (!hosts?.length) {
    toast.error("没有可同步的来源");
    return;
  }

  // 获取所有选中的 cookies
  const selectedCookies = hosts.flatMap(host => 
    host.cookies?.filter(cookie => 
      host.settings.selectedCookies.includes(cookie.name)
    ) || []
  );

  if (!selectedCookies.length) {
    toast.warning("请选择要同步的 Cookie");
    return;
  }

  try {
    syncing.value = true;
    const targetHostname = new URL(currentUrl.value).hostname;

    // 创建 cookie 映射，使用最后一个选中的值
    const cookiesToSync = new Map(
      selectedCookies.map(cookie => [cookie.name, cookie.value])
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

    // 3. 同步新的 cookies
    for (const [name, value] of cookiesToSync) {
      await browser.cookies.set({
        url: currentUrl.value,
        name,
        value,
        domain: targetHostname,
        path: "/",
      });
    }

    // 4. 更新显示的 cookie 列表
    cookieList.value = await getCookies(currentUrl.value);
    const saveData = JSON.parse(JSON.stringify(currentRule.value));
    await handleSaveData(saveData);
    toast.success("同步成功");
  } catch (e) {
    console.error("Sync error:", e);
    toast.error(`同步失败: ${e}`);
  } finally {
    syncing.value = false;
  }
};

// 添加计算属性检查是否需要同步
const needSync = computed(() => {
  const hosts = currentRule.value?.getHosts;
  if (!hosts?.length) return false;

  // 获取所有选中的 cookies
  const selectedCookies = hosts.flatMap(host => 
    host.cookies?.filter(cookie => 
      host.settings.selectedCookies.includes(cookie.name)
    ) || []
  );

  // 如果没有选中的 cookies，不需要同步
  if (!selectedCookies.length) return false;

  // 比较当前 cookies 和选中的 cookies
  const currentCookieMap = new Map(
    cookieList.value.map(cookie => [cookie.name, cookie.value])
  );

  // 检查是否有不同的值
  return selectedCookies.some(cookie => 
    currentCookieMap.get(cookie.name) !== cookie.value
  );
});
</script>

<template>
  <div class="flex flex-col h-full">
    <PageHeader
      :current-url="currentUrl"
      :syncing="syncing"
      :need-sync="needSync"
      @sync="handleSync"
      :getHosts="currentRule.getHosts"
    />
    <el-scrollbar class="flex-1 px-3" view-class="pb-3">
      <CookieList
        :cookies="cookieList"
        :current-url="currentUrl"
        v-model:cookie-list="cookieList"
      />
      <RuleList
        :currentRule="currentRule"
        v-model:getHosts="currentRule.getHosts"
      />
    </el-scrollbar>
  </div>
</template>
