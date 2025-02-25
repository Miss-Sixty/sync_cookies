<script lang="ts" setup>
import { ElForm } from "element-plus";
import { useRouter, useRoute } from "vue-router";
import Header from "../../../components/Header.vue";
import AddOrEditForm from "./components/AddOrEditForm.vue";
import { useRuleStore } from "../../../stores/rules";
import { FormData } from "../../../types";
import { toast } from "vue-sonner";

const router = useRouter();
const route = useRoute();
const store = useRuleStore();
const formRef = ref<InstanceType<typeof ElForm>>();

// 根据路由判断是新建还是编辑
const type = computed(() => route.name);
const typeText = computed(() => (type.value === "edit" ? "修改" : "添加"));

// 表单数据
const formData = ref<FormData>(
  type.value === "edit"
    ? {
        targetHost: store.editingRule.targetHost,
        getHosts: Array.isArray(store.editingRule.getHosts) 
          ? [...store.editingRule.getHosts] 
          : [""],  // 确保是数组
      }
    : {
        targetHost: "",
        getHosts: [""],
      }
);

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

// 监听每个列表项的host变化
watch(
  () => formData.value.getHosts,
  async (newHosts, oldHosts) => {
    for (let i = 0; i < newHosts.length; i++) {
      if (newHosts[i] !== oldHosts?.[i]) {
        const cookies = await getCookies(newHosts[i]);
        // 不再需要处理 cookies，因为已经移到了 home/index.vue
      }
    }
  },
  { deep: true }
);

// 获取当前网址
const getCurrentTab = async () => {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tabs[0]?.url) return;
  try {
    const url = new URL(tabs[0].url);
    formData.value.targetHost = url.origin;  // 使用 origin 而不是 href
  } catch (e) {
    console.error("Invalid URL:", e);
  }
};
if (type.value === "add") getCurrentTab();

// 表单验证和保存
const validateForm = async () => {
  try {
    await formRef.value?.validate();
    if (!formData.value.getHosts.length) {
      toast.error("请至少添加一个来源");
      return;
    }
    handleSave();
  } catch (e) {}
};

// 保存表单数据
const handleSave = async () => {
  try {
    await store.handleSave(formData.value, type.value as string);
    toast.success(`${typeText.value}成功`);
    router.back();
  } catch (e) {
    toast.error(`${typeText.value}失败：${e}`);
  }
};
</script>

<template>
  <Header :title="typeText">
    <template #extra>
      <el-button type="primary" @click="validateForm"> 保 存 </el-button>
    </template>
  </Header>
  <AddOrEditForm ref="formRef" v-model="formData" />
</template>
