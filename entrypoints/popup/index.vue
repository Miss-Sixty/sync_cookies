<script lang="ts" setup>
import { storage } from "wxt/storage";
import { useRouter } from "vue-router";

const router = useRouter();
const STORAGE_KEY = "local:cookie_rules";

interface CookieRule {
  targetHost: string;
  list: {
    host: string;
    cookie: string[];
  }[];
}

const currentUrl = ref("");
const currentRule = ref<CookieRule>();
const cookieList = ref<{ name: string; value: string }[]>([]);

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
    currentUrl.value = url.hostname;

    // 查找匹配的规则
    const rules = (await storage.getItem<CookieRule[]>(STORAGE_KEY)) || [];
    currentRule.value = rules.find(
      (rule) => rule.targetHost === currentUrl.value
    );

    // 获取当前网址的所有cookies
    const cookies = await browser.cookies.getAll({ domain: currentUrl.value });
    cookieList.value = cookies.map((cookie) => ({
      name: cookie.name,
      value: cookie.value,
    }));
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
    // 遍历所有来源
    for (const source of currentRule.value.list) {
      // 获取来源网址的指定cookies
      const sourceCookies = await browser.cookies.getAll({
        domain: source.host,
      });
      const selectedCookies = sourceCookies.filter((cookie) =>
        source.cookie.includes(cookie.name)
      );

      // 将cookies写入当前网址
      for (const cookie of selectedCookies) {
        await browser.cookies.set({
          url: `http://${currentUrl.value}`,
          name: cookie.name,
          value: cookie.value,
          domain: currentUrl.value,
          path: "/",
        });
      }
    }

    // 刷新当前页面的cookie列表
    const cookies = await browser.cookies.getAll({ domain: currentUrl.value });
    cookieList.value = cookies.map((cookie) => ({
      name: cookie.name,
      value: cookie.value,
    }));

    ElMessage.success("同步成功");
  } catch (error) {
    console.error("Sync error:", error);
    ElMessage.error("同步失败");
  }
};

// 跳转到设置页面
const goToSettings = () => {
  router.push({ name: "settings" });
};

// 组件挂载时初始化
onMounted(() => {
  initCurrentPage();
});
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-bold">当前网址：{{ currentUrl }}</h2>
      <div class="flex gap-2">
        <el-button type="primary" @click="handleSync" :disabled="!currentRule">
          同步 Cookie
        </el-button>
        <el-button @click="goToSettings">设置</el-button>
      </div>
    </div>


      <el-text v-if="!currentRule">当前网址没有保存的规则，
      <router-link to="/add">
        <el-text type="primary">去添加</el-text>
      </router-link>
    </el-text>

    <el-scrollbar v-else class="flex-1">
      <div class="mb-4">
        <h3 class="font-bold mb-2">已保存的规则：</h3>
        <div class="pl-4">
          <div v-for="item in currentRule.list" :key="item.host" class="mb-2">
            <div class="font-bold">{{ item.host }}</div>
            <div class="text-gray-600 pl-4">
              选中的 Cookies: {{ item.cookie.join(", ") }}
            </div>
          </div>
        </div>
      </div>

      <el-divider />

      <div>
        <h3 class="font-bold mb-2">当前 Cookies：</h3>
        <el-table :data="cookieList" style="width: 100%">
          <el-table-column prop="name" label="名称" />
          <el-table-column prop="value" label="值" show-overflow-tooltip />
        </el-table>
      </div>
    </el-scrollbar>
  </div>
</template>

<style scoped>
.el-scrollbar {
  height: 0;
}
</style>
