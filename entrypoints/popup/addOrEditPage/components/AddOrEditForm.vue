<script lang="ts" setup>
import { Delete, Plus, Link, Refresh } from "@element-plus/icons-vue";
import { ElForm } from "element-plus";
import { PropType } from "vue";
import { FormData, ListItem } from "../../../../types";
import CardSection from "../../../../components/CardSection.vue";

const formData = defineModel<FormData>({
  default: {
    targetHost: "",
    list: [{ host: "", cookie: [], availableCookies: [] }],
  },
});

// 添加 cookie 加载状态
const loadingCookies = ref<{ [key: number]: boolean }>({});

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

// 修改刷新方法，需要处理倒序后的索引
const refreshCookies = async (i: number) => {
  const realIndex = formData.value.list.length - 1 - i;
  if (!formData.value.list[realIndex].host) {
    ElMessage.warning("请先输入来源网址");
    return;
  }
  loadingCookies.value[realIndex] = true;
  try {
    const cookies = await getCookies(formData.value.list[realIndex].host);
    formData.value.list[realIndex].availableCookies = cookies;
    formData.value.list[realIndex].cookie = []; // 重置选中的cookies
  } catch (e) {
    console.error(e);
    ElMessage.error("获取 Cookies 失败");
  } finally {
    loadingCookies.value[realIndex] = false;
  }
};

const handleAdd = () => {
  formData.value.list.push({ host: "", cookie: [], availableCookies: [] });
};

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
            <span class="font-medium"
              >来源网址 {{ formData.list.length - i }}</span
            >
            <el-tag size="small" type="info">
              已选择:
              {{
                item.cookie.length + "/" + (item.availableCookies?.length || 0)
              }}
            </el-tag>
          </div>

          <div class="flex items-center gap-2">
            <el-button
              type="primary"
              :icon="Refresh"
              @click="refreshCookies(i)"
              size="small"
              :loading="loadingCookies[i]"
              link
            >
              刷新
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
            <div class="bg-gray-50 rounded-lg overflow-hidden">
              <div class="p-2 border-b flex justify-between items-center">
                <span class="text-sm text-gray-500">可用的 Cookies</span>
                <el-button
                  type="primary"
                  size="small"
                  link
                  @click="
                    item.cookie =
                      item.availableCookies?.map((c) => c.value) || []
                  "
                >
                  全选
                </el-button>
              </div>
              <div class="p-3 max-h-40 overflow-auto">
                <el-checkbox-group v-model="item.cookie">
                  <div class="space-y-2">
                    <el-checkbox
                      v-for="cookie in item.availableCookies"
                      :key="cookie.value"
                      :label="cookie.value"
                      class="!w-full"
                    >
                      <div class="truncate text-sm">{{ cookie.value }}</div>
                    </el-checkbox>
                  </div>
                </el-checkbox-group>
                <div
                  v-if="!item.availableCookies?.length"
                  class="text-center text-gray-400 py-2"
                >
                  请输入网址获取可用的 Cookies
                </div>
              </div>
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
:deep(.el-checkbox) {
  --el-checkbox-bg-color: white;
  margin-right: 0;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s;
}

:deep(.el-checkbox:hover) {
  background-color: var(--el-fill-color-light);
}

:deep(.el-checkbox.is-checked) {
  background-color: var(--el-color-primary-light-9);
}

:deep(.el-input-group__append) {
  padding: 0;
}

:deep(.el-form-item__label) {
  padding-bottom: 4px;
}
</style>
