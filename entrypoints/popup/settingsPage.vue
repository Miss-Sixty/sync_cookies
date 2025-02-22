<script lang="ts" setup>
import { VueDraggable } from "vue-draggable-plus";
import { Delete, Edit, Plus, Sort } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { storage } from "wxt/storage";
import { useRouter } from "vue-router";
import Header from "../../components/Header.vue";
import { useRuleStore } from "../../stores/rules";
import { CookieRule } from "../../types";
import { STORAGE_KEY } from "./config";
import { toast } from "vue-sonner";
const store = useRuleStore();
const rules = ref<CookieRule[]>([]);
const router = useRouter();

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

// 编辑规则
const handleEdit = (rule: CookieRule) => {
  store.editingRule = rule;
  router.push({
    name: "edit",
  });
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
</script>

<template>
  <Header title="设置">
    <template #extra>
      <el-button type="primary" :icon="Plus" @click="$router.push('/add')">
        添加配置
      </el-button>
    </template>
  </Header>

  <VueDraggable
    v-model="rules"
    :animation="150"
    class="flex flex-col gap-2 px-4"
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
          ({{ rule.list?.length }} 个来源)
        </span>
      </span>
      <el-button
        title="修改"
        size="small"
        :icon="Edit"
        text
        @click.stop="handleEdit(rule)"
      />
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

  <div v-if="!rules.length" class="text-center text-gray-400 mt-4">
    暂无规则，请点击右上角添加
  </div>
</template>
