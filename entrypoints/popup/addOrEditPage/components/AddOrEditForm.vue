<script lang="ts" setup>
import { Delete, Plus, Link } from "@element-plus/icons-vue";
import { ElForm } from "element-plus";
import { FormData } from "../../../../types";

const formData = defineModel<FormData>({
  default: () => ({
    targetHost: "",
    getHosts: [""],  // 初始化为包含一个空字符串的数组
  }),
});

// 计算倒序的列表
const reversedHosts = computed(() => {
  if (!Array.isArray(formData.value.getHosts)) {
    formData.value.getHosts = [""];
  }
  return [...formData.value.getHosts].reverse();
});

// 修改删除方法
const handleDel = (i: number) => {
  const realIndex = formData.value.getHosts.length - 1 - i;
  const newHosts = [...formData.value.getHosts];  // 创建新数组
  newHosts.splice(realIndex, 1);
  
  // 确保至少有一个来源
  if (newHosts.length === 0) {
    newHosts.push("");
  }
  
  formData.value.getHosts = newHosts;  // 赋值新数组以触发响应式
};

// 添加 ref 数组来存储输入框引用
const inputRefs = ref<any[]>([]);

// 修改添加方法
const handleAdd = () => {
  if (!Array.isArray(formData.value.getHosts)) {
    formData.value.getHosts = [""];
    return;
  }
  formData.value.getHosts = [...formData.value.getHosts, ""];
  
  nextTick(() => {
    // 因为是倒序显示，所以第一个是最新添加的
    inputRefs.value[0]?.focus();
  });
};

// URL 处理函数
const normalizeUrl = (url: string): string => {
  try {
    if (!url) return '';
    // 尝试直接解析 URL
    return new URL(url).origin;
  } catch (e) {
    return '';
  }
};

// 目标网址的验证器
const validateUrl = (_: any, value: string, callback: (error?: Error) => void) => {
  try {
    if (!value) {
      callback(new Error('请输入网址'));
      return;
    }
    new URL(value);
    callback();
  } catch (e) {
    callback(new Error('请输入完整的网址，包含 http:// 或 https://'));
  }
};

// 来源网址的简单验证器
const validateSourceUrl = (_: any, value: string, callback: (error?: Error) => void) => {
  if (!value.trim()) {
    callback(new Error('请输入来源网址'));
    return;
  }
  callback();
};

// 只保留目标网址的监听
watch(() => formData.value.targetHost, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    try {
      new URL(newValue);  // 只验证是否为有效 URL
    } catch (e) {
      formData.value.targetHost = '';
    }
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
        :rules="[
          { required: true, message: '请输入目标网址' },
          { validator: validateUrl, trigger: 'blur' }
        ]"
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
      v-if="formData.getHosts.length"
      class="px-4 pb-4"
      view-class="space-y-2"
    >
      <div
        v-for="(host, i) in reversedHosts"
        :key="i"
        class="bg-white rounded-lg overflow-hidden"
      >
        <!-- 来源头部 -->
        <div class="px-4 py-2 flex justify-between items-center">
          <span class="font-medium">来源网址 {{ formData.getHosts.length - i }}</span>
          <el-button
            type="danger"
            :icon="Delete"
            @click="handleDel(i)"
            size="small"
            link
          />
        </div>

        <!-- 来源表单 -->
        <div class="px-4 pb-3">
          <el-form-item
            :prop="`getHosts.${formData.getHosts.length - 1 - i}`"
            :rules="[
              { required: true, message: '请输入来源网址' },
              { validator: validateSourceUrl, trigger: 'blur' }
            ]"
            class="!mb-0"
          >
            <el-input
              v-model="formData.getHosts[formData.getHosts.length - 1 - i]"
              placeholder="请输入来源网址"
              :prefix-icon="Link"
              clearable
              :ref="(el) => inputRefs[i] = el"
            />
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
</style>
