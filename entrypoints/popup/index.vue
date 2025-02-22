<script lang="ts" setup>
import { storage } from "wxt/storage";
import { useRouter } from "vue-router";
import { CookieRule } from '../../types';
import { STORAGE_KEY } from './config';
import { Setting, Refresh, Document, Link, Plus, Collection, Key } from '@element-plus/icons-vue';

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
    currentRule.value = rules.find((rule) => rule.targetHost === currentUrl.value);

    // 获取当前页面的cookies
    if (currentRule.value) {
      const cookies = await browser.cookies.getAll({ domain: url.hostname });
      cookieList.value = cookies.map(cookie => ({
        name: cookie.name,
        value: cookie.value
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
      const url = new URL(source.host.startsWith('http') ? source.host : `http://${source.host}`);
      const sourceCookies = await browser.cookies.getAll({
        domain: url.hostname,
      });

      // 将cookies写入当前网址
      for (const cookieStr of source.cookie) {
        const [name, value] = cookieStr.split('=');
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
      domain: new URL(currentUrl.value).hostname 
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
  <div class="flex flex-col h-full bg-gray-50">
    <!-- 头部区域 - 减小间距 -->
    <div class="bg-white px-3 py-1.5 mb-2 shadow-sm">
      <div class="flex justify-between items-center">
        <div class="flex flex-col">
          <span class="text-gray-400 text-[10px]">当前网址</span>
          <span class="text-gray-700 text-sm truncate max-w-[300px]" :title="currentUrl">
            {{ currentUrl }}
          </span>
        </div>
        <div class="flex gap-1">
          <el-button 
            type="primary" 
            @click="handleSync" 
            :disabled="!currentRule"
            :loading="syncing"
            size="small"
            class="!flex !items-center !px-2 !h-6 !text-xs"
          >
            <el-icon class="mr-0.5"><Refresh /></el-icon>
            同步
          </el-button>
          <router-link to="/settings" custom v-slot="{ navigate }">
            <el-button @click="navigate" size="small" class="!flex !items-center !px-2 !h-6">
              <el-icon><Setting /></el-icon>
            </el-button>
          </router-link>
        </div>
      </div>
    </div>

    <!-- 无规则时的提示 -->
    <div v-if="!currentRule" class="flex-1 flex items-center justify-center bg-white mx-3 rounded shadow-sm">
      <el-empty :image-size="50" description="当前网址没有保存的规则">
        <router-link to="/add">
          <el-button type="primary" size="small" class="!flex !items-center !text-xs !h-7">
            <el-icon class="mr-0.5"><Plus /></el-icon>
            去添加
          </el-button>
        </router-link>
      </el-empty>
    </div>

    <!-- 有规则时的内容区域 -->
    <el-scrollbar v-else class="flex-1 px-3">
      <div class="flex flex-col gap-2">
        <!-- 规则列表 -->
        <el-card class="!border-0 shadow-sm">
          <template #header>
            <div class="flex items-center !py-0.5">
              <el-icon class="text-primary mr-1.5 text-sm"><Document /></el-icon>
              <span class="text-gray-700 text-sm">已保存的规则</span>
            </div>
          </template>
          <div class="space-y-1.5">
            <div v-for="item in currentRule.list" :key="item.host" 
              class="bg-gray-50 rounded p-2"
            >
              <div class="flex items-center mb-1.5">
                <el-icon class="text-primary mr-1 text-xs"><Link /></el-icon>
                <span class="text-gray-700 text-xs">{{ item.host }}</span>
              </div>
              <div class="grid grid-cols-2 gap-1.5">
                <div v-for="cookie in item.cookie" :key="cookie" 
                  class="bg-white rounded px-2 py-1.5 text-[11px] border border-gray-100 hover:border-primary transition-colors"
                  :title="cookie"
                >
                  {{ cookie }}
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 当前 Cookies -->
        <el-card class="!border-0 shadow-sm">
          <template #header>
            <div class="flex items-center !py-0.5">
              <el-icon class="text-primary mr-1.5 text-sm"><Collection /></el-icon>
              <span class="text-gray-700 text-sm">当前 Cookies</span>
            </div>
          </template>
          <div class="grid grid-cols-2 gap-1.5">
            <div v-for="cookie in cookieList" :key="cookie.name"
              class="bg-gray-50 rounded p-2 hover:bg-gray-100 transition-colors"
            >
              <div class="text-gray-700 text-xs mb-0.5 flex items-center">
                <el-icon class="text-primary mr-1 text-[11px]"><Key /></el-icon>
                {{ cookie.name }}
              </div>
              <div class="text-[11px] text-gray-500 truncate pl-4" :title="cookie.value">
                {{ cookie.value }}
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </el-scrollbar>
  </div>
</template>

<style scoped>
.el-scrollbar {
  height: 0;
}

:deep(.el-card) {
  border-radius: 6px;
}

:deep(.el-card__header) {
  padding: 8px 12px;
  border-bottom: 1px solid #f1f5f9;
  min-height: auto;
}

:deep(.el-card__body) {
  padding: 12px;
}

:deep(.el-button) {
  border-radius: 4px;
}

.text-primary {
  color: var(--el-color-primary);
}

.border-primary {
  border-color: var(--el-color-primary);
}

:deep(.el-scrollbar__bar) {
  opacity: 0.2;
}

:deep(.el-scrollbar__bar:hover) {
  opacity: 0.4;
}

.hover\:border-primary:hover {
  border-color: var(--el-color-primary);
}
</style>
