<script lang="ts" setup>
import { Delete, Plus, Link, Refresh } from "@element-plus/icons-vue";
import { ElForm } from "element-plus";
import {} from "vue";
import { FormData } from "../../../../types";

const formData = defineModel<FormData>({
  default: {
    targetHost: "",
    list: [
      {
        host: "",
        cookie: [],
        availableCookies: [],
        checkAll: false,
        isIndeterminate: false,
      },
    ],
  },
});

// 添加 cookie 加载状态
const loadingCookies = ref<{ [key: number]: boolean }>({});

// 添加状态标记
const cookiesChanged = ref<{ [key: number]: boolean }>({});

// 获取指定网址的所有cookies
const getCookies = async (host: string) => {
  if (!host) return [];
  try {
    if (!host.startsWith("http")) {
      host = "http://" + host;
    }
    const url = new URL(host);
    const cookies = await browser.cookies.getAll({ domain: url.hostname });
    return cookies.map((cookie) => ({
      value: `${cookie.name}=${cookie.value}`,
    }));
  } catch (e) {
    console.error("Invalid URL or cookie error:", e);
    return [];
  }
};

// 计算倒序的列表
const reversedList = computed(() => [...formData.value.list].reverse());

// 修改删除方法，需要处理倒序后的索引
const handleDel = (i: number) => {
  const realIndex = formData.value.list.length - 1 - i;
  formData.value.list.splice(realIndex, 1);
};

// 处理全选
const handleCheckAllChange = (index: number) => {
  const realIndex = formData.value.list.length - 1 - index;
  const item = formData.value.list[realIndex];

  if (!item.availableCookies?.length) return;

  item.cookie = item.checkAll ? item.availableCookies.map((c) => c.value) : [];
  item.isIndeterminate = false;
};

// 处理选择变化
const handleCheckedChange = (index: number) => {
  const realIndex = formData.value.list.length - 1 - index;
  const item = formData.value.list[realIndex];

  if (!item.availableCookies?.length) return;

  const checkedCount = item.cookie.length;
  const totalCount = item.availableCookies.length;

  item.checkAll = checkedCount === totalCount;
  item.isIndeterminate = checkedCount > 0 && checkedCount < totalCount;
};

// 修改添加方法，初始化选择状态
const handleAdd = () => {
  formData.value.list.push({
    host: "",
    cookie: [],
    availableCookies: [],
    checkAll: false,
    isIndeterminate: false,
  });
};

// 检查 cookie 是否有变化
const checkCookieChanges = async (index: number) => {
  const item = formData.value.list[index];
  if (!item.host) return;

  try {
    const newCookies = await getCookies(item.host);
    const newCookieValues = new Set(newCookies.map(c => c.value));
    const oldCookieValues = new Set(item.availableCookies?.map(c => c.value) || []);

    // 检查是否有变化
    const hasChanges = newCookies.length !== (item.availableCookies?.length || 0) ||
      newCookies.some(cookie => !oldCookieValues.has(cookie.value)) ||
      (item.availableCookies || []).some(cookie => !newCookieValues.has(cookie.value));

    cookiesChanged.value[index] = hasChanges;
  } catch (e) {
    console.error('Check cookie changes error:', e);
  }
};

// 检查所有来源的 cookie 变化
const checkAllCookieChanges = () => {
  formData.value.list.forEach((_, index) => {
    checkCookieChanges(index);
  });
};

// 在组件挂载时检查变化
onMounted(() => {
  checkAllCookieChanges();
});

// 修改刷新方法，重置变化状态
const refreshCookies = async (i: number) => {
  const realIndex = formData.value.list.length - 1 - i;
  if (!formData.value.list[realIndex].host) {
    ElMessage.warning("请先输入来源网址");
    return;
  }
  loadingCookies.value[realIndex] = true;
  try {
    const cookies = await getCookies(formData.value.list[realIndex].host);
    formData.value.list[realIndex] = {
      ...formData.value.list[realIndex],
      availableCookies: cookies,
      cookie: [], // 重置选中的cookies
      checkAll: false,
      isIndeterminate: false,
    };
    cookiesChanged.value[realIndex] = false; // 重置变化状态
  } catch (e) {
    console.error(e);
    ElMessage.error("获取 Cookies 失败");
  } finally {
    loadingCookies.value[realIndex] = false;
  }
};

// 定时检查变化
let checkInterval: number;
onMounted(() => {
  checkInterval = window.setInterval(checkAllCookieChanges, 5000); // 每5秒检查一次
});

onUnmounted(() => {
  if (checkInterval) {
    clearInterval(checkInterval);
  }
});

const formRef = ref<InstanceType<typeof ElForm>>();
defineExpose({ formRef, validate: () => formRef.value?.validate() });
</script>

<template>
  <el-form
    ref="formRef"
    :model="formData"
    class="overflow-hidden flex flex-col flex-1"
    hide-required-asterisk
    :show-message="false"
    scroll-to-error
  >
    <!-- 目标网址 -->
    <div class="bg-white px-4 py-3 mx-4 rounded-lg">
      <el-form-item
        prop="targetHost"
        label="目标网址"
        :rules="{ required: true }"
        class="!mb-0"
      >
        <el-input
          v-model="formData.targetHost"
          placeholder="请输入目标网址"
          :prefix-icon="Link"
        />
      </el-form-item>
    </div>

    <!-- 来源列表 -->
    <div class="flex justify-between items-center px-4 py-3">
      <span class="font-medium">来源网站</span>
      <el-button
        type="primary"
        size="small"
        plain
        :icon="Plus"
        @click="handleAdd"
      >
        添加来源
      </el-button>
    </div>

    <el-scrollbar
      v-if="formData.list.length"
      class="px-4 pb-4"
      view-class="space-y-2"
    >
      <div
        v-for="(item, i) in reversedList"
        :key="i"
        class="bg-white rounded-lg overflow-hidden"
      >
        <!-- 来源头部 -->
        <div class="px-4 py-2 flex justify-between items-center">
          <div class="flex items-center gap-2">
            <span class="font-medium">来源网址 {{ formData.list.length - i }}</span>
            <el-tag size="small" type="info">
              已选择: {{ item.cookie.length + "/" + (item.availableCookies?.length || 0) }}
            </el-tag>
          </div>

          <div class="flex items-center gap-2">
            <el-button
              :type="cookiesChanged[formData.list.length - 1 - i] ? 'warning' : 'primary'"
              :icon="Refresh"
              @click="refreshCookies(i)"
              size="small"
              :loading="loadingCookies[i]"
              class="!flex !items-center"
              link
            >
              <template v-if="cookiesChanged[formData.list.length - 1 - i]">
                <span class="text-warning-500">Cookie 已更新，点击刷新</span>
              </template>
              <template v-else>
                刷新
              </template>
            </el-button>
            <el-divider direction="vertical" class="!mx-1" />
            <el-button
              type="danger"
              :icon="Delete"
              @click="handleDel(i)"
              size="small"
              link
            />
          </div>
        </div>

        <!-- 来源表单 -->
        <div class="px-4 space-y-4 pb-3">
          <el-form-item
            :prop="`list.${formData.list.length - 1 - i}.host`"
            :rules="{ required: true }"
            class="!mb-0"
          >
            <el-input
              v-model="item.host"
              placeholder="请输入来源网址"
              :prefix-icon="Link"
              clearable
            />
          </el-form-item>

          <el-form-item
            v-if="item.host"
            :prop="`list.${formData.list.length - 1 - i}.cookie`"
            :rules="{ required: true, type: 'array' }"
            class="!mb-0"
          >
            <div class="w-full mt-1">
              <el-checkbox
                v-model="item.checkAll"
                :indeterminate="item.isIndeterminate"
                @change="handleCheckAllChange(i)"
                class="!mr-0 !p-0"
              >
                <span class="text-sm">全选</span>
              </el-checkbox>

              <!-- Cookie 列表 -->
              <el-checkbox-group
                v-model="item.cookie"
                @change="handleCheckedChange(i)"
              >
                <div class="grid grid-cols-3 gap-2">
                  <el-checkbox
                    v-for="cookie in item.availableCookies"
                    :key="cookie.value"
                    :label="cookie.value"
                    class="!m-0 !p-0 overflow-hidden"
                    size="large"
                  >
                    <div class="flex flex-col overflow-hidden">
                      <div
                        class="font-medium text-sm truncate"
                        :title="cookie.value.split('=')[0]"
                      >
                        {{ cookie.value.split("=")[0] }}
                      </div>
                      <div
                        class="text-xs text-gray-400 truncate"
                        :title="cookie.value.split('=')[1]"
                      >
                        {{ cookie.value.split("=")[1] }}
                      </div>
                    </div>
                  </el-checkbox>
                </div>
              </el-checkbox-group>
            </div>
          </el-form-item>
        </div>
      </div>
    </el-scrollbar>

    <!-- 空状态 -->
    <div v-else class="text-center text-gray-400 py-8">
      请点击上方按钮添加来源网站
    </div>
  </el-form>
</template>

<style scoped>
@import "../../style.css";
:deep(.el-checkbox__label) {
  @apply overflow-hidden;
}
</style>
