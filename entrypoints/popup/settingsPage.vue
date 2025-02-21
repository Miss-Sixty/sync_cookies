<script lang="ts" setup>
import { VueDraggable } from "vue-draggable-plus";
import { Delete, Edit, Plus, Sort } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { storage } from "wxt/storage";
import { useRouter } from "vue-router";
import Header from '../../components/Header.vue'

interface CookieRule {
  targetHost: string;
  list: {
    host: string;
    cookie: string[];
  }[];
}

const STORAGE_KEY = "local:cookie_rules";
const modelValue = defineModel();
const editData = ref<CookieRule>();
const rules = ref<CookieRule[]>([]);
const router = useRouter();

// 加载规则列表
const loadRules = async () => {
  try {
    const result = await storage.getItem<CookieRule[]>(STORAGE_KEY);
    rules.value = result || [];
  } catch (error) {
    console.error("Load rules error:", error);
    ElMessage.error("加载规则失败");
  }
};

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
    ElMessage.success("删除成功");
  } catch (error) {
    console.error("Delete rule error:", error);
    ElMessage.error("删除失败");
  }
};

// 编辑规则
const handleEdit = (rule: CookieRule) => {
  router.push({
    name: "edit",
    params: {
      editData: JSON.stringify(rule),
    },
  });
};

// 添加按钮点击处理
const handleAdd = () => {
  router.push({ name: "add" });
};

// 返回首页
const handleBack = () => {
  router.push("/");
};

// 保存排序
const handleSort = async () => {
  try {
    await saveRules(rules.value);
    ElMessage.success("排序已保存");
  } catch (error) {
    console.error("Update order error:", error);
    ElMessage.error("保存排序失败");
  }
};

// 监听模式变化
watch(modelValue, (newValue) => {
  if (newValue === "add" || newValue === "settings") {
    // 清空编辑数据
    editData.value = undefined;
  }
});

// 组件挂载时加载规则
onMounted(() => {
  loadRules();
});
</script>

<template>
  <Header title="设置">
    <template #extra>
        <router-link to="/add" custom v-slot="{ navigate }">
          <el-button type="primary" size="small" :icon="Plus" @click="navigate">
            添 加
          </el-button>
        </router-link>
      </template>
  </Header>


  <VueDraggable
    v-model="rules"
    :animation="150"
    class="flex flex-col gap-2"
    handle=".drag-handle"
    @end="handleSort"
  >
    <div
      v-for="rule in rules"
      :key="rule.targetHost"
      class="border rounded px-1 py-2 flex items-center"
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
        class="!px-1.5"
        title="修改"
        size="small"
        :icon="Edit"
        text
        @click.stop="handleEdit(rule)"
      />
      <el-popconfirm title="确定要删除吗？" @confirm="handleDelete(rule)">
        <template #reference>
          <el-button
            class="!px-1.5 !ml-0"
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
