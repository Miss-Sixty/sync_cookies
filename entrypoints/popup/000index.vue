<script lang="ts" setup>
import { storage } from "wxt/storage";
import { useRouter } from "vue-router";
import { CookieRule } from "../../types";
import { STORAGE_KEY } from "./config";
import {
  Setting,
  Refresh,
  Document,
  Link,
  Plus,
  Collection,
  Key,
} from "@element-plus/icons-vue";

const router = useRouter();
const currentUrl = ref("");
const currentRule = ref<CookieRule>();
const cookieList = ref<{ name: string; value: string }[]>([]);
const syncing = ref(false);

// 获取当前网址并查找对应规则
const initCurrentPage = async () => {
  try {
    // 获取当前标签页URL
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tabs[0]?.url) return;

    const url = new URL(tabs[0].url);
    currentUrl.value = url.origin;

    // 查找匹配的规则
    const rules = (await storage.getItem<CookieRule[]>(STORAGE_KEY)) || [];
    currentRule.value = rules.find(
      (rule) => rule.targetHost === currentUrl.value
    );

    // 获取当前页面的cookies
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
    // 遍历所有来源
    for (const source of currentRule.value.list) {
      // 获取来源网址的指定cookies
      const url = new URL(
        source.host.startsWith("http") ? source.host : `http://${source.host}`
      );
      const sourceCookies = await browser.cookies.getAll({
        domain: url.hostname,
      });

      // 将cookies写入当前网址
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

    // 刷新当前页面的cookie列表
    const cookies = await browser.cookies.getAll({
      domain: new URL(currentUrl.value).hostname,
    });
    cookieList.value = cookies.map((cookie) => ({
      name: cookie.name,
      value: cookie.value,
    }));

    ElMessage.success("同步成功");
  } catch (error) {
    console.error("Sync error:", error);
    ElMessage.error("同步失败");
  } finally {
    syncing.value = false;
  }
};

onMounted(() => {
  initCurrentPage();
});
</script>

<template>
  <div class="flex flex-col h-full bg-gray-100">
    <!-- 头部区域 -->
    <div class="bg-white px-4 py-2.5 shadow-sm">
      <div class="flex justify-between items-center">
        <div class="flex flex-col">
          <span class="text-gray-400 text-xs">当前网址</span>
          <div class="flex items-center gap-2">
            <span
              class="text-gray-800 font-medium truncate max-w-[300px]"
              :title="currentUrl"
            >
              {{ currentUrl }}
            </span>
            <el-tag
              v-if="currentRule"
              size="small"
              type="success"
              effect="plain"
              class="!text-xs"
              >已配置</el-tag
            >
          </div>
        </div>
        <div class="flex gap-1.5">
          <el-button
            type="primary"
            @click="handleSync"
            :disabled="!currentRule"
            :loading="syncing"
            size="small"
            class="!flex !items-center"
          >
            <el-icon class="mr-1"><Refresh /></el-icon>
            同步
          </el-button>
          <el-button @click="router.push('/settings')" size="small">
            <el-icon><Setting /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 无规则时的提示 -->
    <div
      v-if="!currentRule"
      class="flex-1 flex items-center justify-center bg-white m-3 rounded-lg"
    >
      <el-empty :image-size="60" description="当前网址没有保存的规则">
        <el-button
          type="primary"
          @click="router.push('/add')"
          class="!flex !items-center"
        >
          <el-icon class="mr-1"><Plus /></el-icon>
          添加配置
        </el-button>
      </el-empty>
    </div>

    <!-- 有规则时的内容区域 -->
    <el-scrollbar v-else class="flex-1 p-3">
      <div class="space-y-3">
        <!-- 当前 Cookies -->
        <div class="flex items-center gap-2 mb-3 text-gray-800">
          <el-icon class="text-blue-600"><Collection /></el-icon>
          <span class="font-medium">当前 Cookies</span>
          <span class="text-blue-600 text-sm">({{ cookieList.length }})</span>
        </div>
        <div class="bg-white rounded-lg p-4">
          <div class="grid grid-cols-2 gap-1.5">
            <div
              v-for="cookie in cookieList"
              :key="cookie.name"
              class="border border-blue-100 rounded-lg p-2.5 hover:bg-blue-50 transition-all"
            >
              <div class="flex items-center mb-1">
                <el-icon class="mr-1.5 text-blue-600"><Key /></el-icon>
                <span class="font-medium text-gray-700">{{ cookie.name }}</span>
              </div>
              <div
                class="text-sm text-gray-500 truncate pl-6"
                :title="cookie.value"
              >
                {{ cookie.value }}
              </div>
            </div>
          </div>
        </div>

        <!-- 规则列表 -->
        <div class="flex items-center gap-2 mb-3 text-gray-800">
          <el-icon class="text-primary-600"><Document /></el-icon>
          <span class="font-medium">同步配置</span>
        </div>
        <div class="bg-white rounded-lg p-4">
          <div class="space-y-2">
            <div
              v-for="item in currentRule.list"
              :key="item.host"
              class="border border-primary-100 rounded-lg p-3 hover:bg-primary-50 transition-all"
            >
              <div class="flex items-center mb-2">
                <el-icon class="mr-1.5 text-primary-600"><Link /></el-icon>
                <span class="font-medium text-gray-700">{{ item.host }}</span>
              </div>
              <div class="grid grid-cols-2 gap-1.5">
                <div
                  v-for="cookie in item.cookie"
                  :key="cookie"
                  class="bg-white rounded px-2.5 py-1.5 text-sm text-gray-600"
                  :title="cookie"
                >
                  {{ cookie }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<style scoped>
.el-scrollbar {
  height: 0;
}

:deep(.el-button) {
  border-radius: 6px;
}

.text-primary-600 {
  color: var(--el-color-primary);
}

.border-primary-100 {
  border-color: #d9ecff;
}

.bg-primary-50 {
  background-color: #ecf5ff;
}

:deep(.el-scrollbar__bar) {
  opacity: 0.2;
}

:deep(.el-scrollbar__bar:hover) {
  opacity: 0.4;
}
</style>
