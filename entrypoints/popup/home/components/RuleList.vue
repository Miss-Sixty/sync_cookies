<script setup lang="ts">
import { Document, Delete } from "@element-plus/icons-vue";
import CardSection from "../../../../components/CardSection.vue";
import { CheckboxValueType } from "element-plus";

const props = defineProps<{
  rules: string[];
  cookies: { [host: string]: string[] };
  selectedCookies: { [host: string]: string[] }; // 添加新的 prop
}>();

const emit = defineEmits<{
  "update:cookies": [host: string, cookies: string[]];
}>();

// 每个来源的选择状态
const checkStates = ref<{
  [host: string]: {
    checkAll: boolean;
    isIndeterminate: boolean;
    selectedCookies: string[];
  };
}>({});

// 初始化选择状态
watch(
  () => props.selectedCookies,
  (newSelected) => {
    Object.entries(newSelected).forEach(([host, cookies]) => {
      if (!checkStates.value[host]) {
        checkStates.value[host] = {
          checkAll: false,
          isIndeterminate: false,
          selectedCookies: [],
        };
      }
      checkStates.value[host].selectedCookies = cookies;
      const allCookies = props.cookies[host] || [];
      checkStates.value[host].checkAll = cookies.length === allCookies.length;
      checkStates.value[host].isIndeterminate =
        cookies.length > 0 && cookies.length < allCookies.length;
    });
  },
  { immediate: true, deep: true }
);

const handleCheckAllChange = (host: string, val: CheckboxValueType) => {
  const state = checkStates.value[host];
  state.checkAll = val === true; // 确保转换为 boolean
  state.isIndeterminate = false;
  state.selectedCookies = state.checkAll ? props.cookies[host] : [];
  emit("update:cookies", host, state.selectedCookies);
};

const handleCheckedChange = (host: string, value: string[]) => {
  const state = checkStates.value[host];
  const allCookies = props.cookies[host] || [];

  state.selectedCookies = value;
  state.checkAll = value.length === allCookies.length;
  state.isIndeterminate = value.length > 0 && value.length < allCookies.length;

  emit("update:cookies", host, value);
};
</script>

<template>
  <CardSection title="来源网站" :icon="Document">
    <div class="space-y-4">
      <div v-for="(host, i) in rules" :key="host" class="rounded px-4 pb-4">
        <div class="font-medium mb-2">来源网址 {{ i + 1 }}: {{ host }}</div>

        <template v-if="cookies[host]?.length">
          <el-checkbox
            v-model="checkStates[host].checkAll"
            :indeterminate="checkStates[host].isIndeterminate"
            @change="(val) => handleCheckAllChange(host, val)"
          >
            全选
          </el-checkbox>

          <el-checkbox-group
            v-model="checkStates[host].selectedCookies"
            @change="(val) => handleCheckedChange(host, val)"
            class="grid grid-cols-3 gap-2"
          >
            <el-checkbox
              v-for="cookie in cookies[host]"
              :key="cookie"
              :value="cookie"
              size="large"
              class="bg-gray-100 rounded p-2 !h-auto !m-0 overflow-hidden"
            >
              <div
                class="text-sm font-medium truncate"
                :title="cookie.split('=')[0]"
              >
                {{ cookie.split("=")[0] }}
              </div>
              <div
                class="text-xs text-gray-500 truncate"
                :title="cookie.split('=')[1]"
              >
                {{ cookie.split("=")[1] }}
              </div>
            </el-checkbox>
          </el-checkbox-group>
        </template>

        <div v-else class="text-gray-400 text-sm">暂无可用的 Cookie</div>
      </div>
    </div>
  </CardSection>
</template>

<style scoped>
::v-deep(.el-checkbox__label) {
  overflow: hidden;
}
</style>
