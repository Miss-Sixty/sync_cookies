<script setup lang="ts">
import { Document, Edit } from "@element-plus/icons-vue";
import CardSection from "@/components/CardSection.vue";
import { CheckboxValueType, FormInstance } from "element-plus";
import { getAllRules, handleSaveData } from "@/entrypoints/popup/utils";
import { GetHosts, CookieRule } from "@/types";
import EmptyState from "@/components/EmptyState.vue";
import { toast } from "vue-sonner";
import { STORAGE_KEY } from "@/entrypoints/popup/config";

const props = defineProps<{
  getHosts: GetHosts[];
  currentRule: CookieRule;
}>();

const emit = defineEmits<{
  "update:cookies": [host: string, cookies: { name: string; value: string }[]];
  "update:getHosts": [getHosts: GetHosts[]];
}>();
const inputRefs = ref<HTMLInputElement[]>([]);
const formRef = ref<FormInstance>();
const handleAdd = () => {
  props.getHosts.push({
    host: "",
    cookies: [],
    settings: {
      edit: true,
      checkAll: false,
      isIndeterminate: false,
      selectedCookies: [],
    },
  });
  nextTick(() => {
    inputRefs.value.at(-1)?.focus();
  });
};

const handleDelete = async (i: number) => {
  const getHosts = JSON.parse(JSON.stringify(props.getHosts));
  getHosts.splice(i, 1);
  emit("update:getHosts", getHosts);
  // 删除存储中对应的规则
  const rules = await getAllRules();
  if (!rules) return;
  const index = rules.findIndex(
    (rule) => rule.targetHost === props.currentRule.targetHost
  );
  if (index !== -1) {
    rules.splice(index, 1);
    await storage.setItem(STORAGE_KEY, rules);
  }
};

const validator = async (host: GetHosts) => {
  try {
    await formRef.value?.validate();
    handleSave(host);
  } catch (e) {
    return false;
  }
};

// 存储数据
const handleSave = async (host: GetHosts) => {
  try {
    host.settings.edit = false;
    await handleSaveData(props.currentRule);
    toast.success("保存成功");
  } catch (e) {
    console.error("Save error:", e);
    toast.error("保存失败");
  }
};

// 处理全选变化
const handleCheckAllChange = (host: GetHosts, val: CheckboxValueType) => {
  host.settings.checkAll = val === true;
  host.settings.isIndeterminate = false;
  host.settings.selectedCookies =
    val === true ? host.cookies.map((cookie) => cookie.name) : [];
};

// 处理单选变化
const handleCheckedChange = (host: GetHosts, checkedCookies: string[]) => {
  const allCookies = host.cookies || [];
  host.settings.selectedCookies = checkedCookies;
  host.settings.checkAll = checkedCookies.length === allCookies.length;
  host.settings.isIndeterminate =
    checkedCookies.length > 0 && checkedCookies.length < allCookies.length;
};
</script>

<template>
  <CardSection title="来源网站" :icon="Document">
    <template #extra>
      <el-button type="primary" @click="handleAdd" size="small" link>
        添加配置
      </el-button>
    </template>

    <EmptyState class="mt-2" v-if="!getHosts.length" />

    <el-form
      ref="formRef"
      :model="props"
      v-else
      class="space-y-4"
      hide-required-asterisk
    >
      <div v-for="(host, i) in getHosts" :key="i" class="rounded px-4 pb-4">
        <el-form-item
          :prop="`getHosts.${i}.host`"
          :label="`来源网址 ${i + 1}`"
          class="!mb-1"
          :rules="{
            required: true,
            message: '来源网址不能为空',
            trigger: 'blur',
          }"
        >
          <div class="flex items-center gap-1.5 w-full">
            <el-input
              v-if="host.settings?.edit"
              :ref="(el) => inputRefs.push(el as HTMLInputElement)"
              class="flex-1"
              v-model="host.host"
              placeholder="请输入来源网址"
            />
            <p class="flex-1" v-else>
              {{ host.host }}
              <el-button
                type="primary"
                link
                :icon="Edit"
                @click="host.settings.edit = true"
              />
            </p>
            <div v-if="host.settings?.edit">
              <el-button type="primary" link @click="validator(host)">
                保存
              </el-button>
              <el-button
                class="!ml-auto"
                type="danger"
                link
                @click="handleDelete(i)"
              >
                删除
              </el-button>
            </div>
          </div>
        </el-form-item>
        <template v-if="host.cookies?.length">
          <el-checkbox
            v-model="host.settings.checkAll"
            :indeterminate="host.settings.isIndeterminate"
            @change="(val) => handleCheckAllChange(host, val)"
            :disabled="host.host === currentRule.targetHost"
          >
            全选
          </el-checkbox>

          <el-checkbox-group
            v-model="host.settings.selectedCookies"
            @change="(val) => handleCheckedChange(host, val)"
            class="grid grid-cols-3 gap-2"
          >
            <el-checkbox
              v-for="(cookie, i) in host.cookies"
              :key="i"
              :value="cookie.name"
              :disabled="host.host === currentRule.targetHost"
              size="large"
              class="bg-gray-100 rounded p-2 !h-auto !m-0 overflow-hidden"
            >
              <div class="text-sm font-medium truncate" :title="cookie.name">
                {{ cookie.name }}
              </div>
              <div class="text-xs text-gray-500 truncate" :title="cookie.value">
                {{ cookie.value }}
              </div>
            </el-checkbox>
          </el-checkbox-group>
        </template>
      </div>
    </el-form>
  </CardSection>
</template>

<style scoped>
::v-deep(.el-checkbox__label) {
  overflow: hidden;
}
</style>
