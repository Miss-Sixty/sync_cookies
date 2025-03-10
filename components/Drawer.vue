<script setup lang="ts">
import { VueDraggable } from "vue-draggable-plus";
import { Delete, Sort } from "@element-plus/icons-vue";
import { storage } from "wxt/storage";
import { CookieRule } from "@/types";
import { STORAGE_KEY } from "@/entrypoints/popup/config";
import { toast } from "vue-sonner";
import EmptyState from "./EmptyState.vue";

const rules = ref<CookieRule[]>([]);

// 加载规则列表
const loadRules = async () => {
  try {
    const result = await storage.getItem<CookieRule[]>(STORAGE_KEY);
    rules.value = result || [];
  } catch (e) {
    toast.error(`加载规则失败: ${e}`);
  }
};
loadRules();

// 保存规则列表
const saveRules = async (newRules: CookieRule[]) => {
  try {
    await storage.setItem(STORAGE_KEY, newRules);
  } catch (error) {
    console.error("Save rules error:", error);
    throw error;
  }
};

// 删除规则
const handleDelete = async (rule: CookieRule) => {
  try {
    const newRules = rules.value.filter(
      (r) => r.targetHost !== rule.targetHost
    );
    await saveRules(newRules);
    rules.value = newRules;
    toast.success("删除成功");
  } catch (e) {
    toast.error(`删除失败: ${e}`);
  }
};

// 保存排序
const handleSort = async () => {
  try {
    await saveRules(rules.value);
    toast.success("排序已保存");
  } catch (e) {
    toast.error(`保存排序失败: ${e}`);
  }
};

// 使用构建时注入的环境变量
const buildTimeISO = import.meta.env.BUILD_TIME || new Date().toISOString();
const buildDate = new Date(buildTimeISO).toLocaleDateString("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
}).replace(/\//g, "-");
</script>

<template>
  <ElDrawer
    size="70%"
    header-class="!px-3 !py-2 !m-0"
    append-to-body
    body-class="bg-gray-100 !p-0 flex flex-col"
    :with-header="false"
  >
    <el-scrollbar class="flex-1">
      <VueDraggable
        v-model="rules"
        :animation="150"
        class="flex flex-col gap-2 p-3 min-h-[calc(100%-40px)]"
        handle=".drag-handle"
        @end="handleSort"
      >
        <div
          v-for="rule in rules"
          :key="rule.targetHost"
          class="bg-white rounded px-1.5 py-2 flex items-center"
        >
          <el-button
            title="排序"
            size="small"
            :icon="Sort"
            text
            class="drag-handle !cursor-move touch-none"
          />
          <span class="flex-1 truncate mx-1" :title="rule.targetHost">
            {{ rule.targetHost }}
            <span class="text-gray-400 text-sm">
              ({{ rule.getHosts?.length }} 个来源)
            </span>
          </span>
          <el-popconfirm title="确定要删除吗？" @confirm="handleDelete(rule)">
            <template #reference>
              <el-button
                class="!ml-0"
                title="删除"
                size="small"
                :icon="Delete"
                text
              />
            </template>
          </el-popconfirm>
        </div>
      </VueDraggable>
      <EmptyState v-if="!rules.length" />
    </el-scrollbar>

    <!-- 添加页脚 -->
    <div
      class="px-1 py-2 flex justify-between items-center text-xs text-gray-400"
    >
      <span class="scale-90">更新日期：{{ buildDate }}</span>
      <a
        href="https://github.com/SeahorZhang/sync_cookies"
        target="_blank"
        class="flex items-center gap-1 hover:text-gray-700 transition-colors scale-90"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
          />
        </svg>
        GitHub
      </a>
    </div>
  </ElDrawer>
</template>
