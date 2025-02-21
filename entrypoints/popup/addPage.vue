<script lang="ts" setup>
import { ElForm, ElMessage, ElMessageBox } from "element-plus";
import { storage } from "wxt/storage";
import { useRouter } from "vue-router";
import Header from "../../components/Header.vue";
import AddOrEditForm from "../../components/AddOrEditForm.vue";
import { useRuleStore } from "../../stores/rules";
import { Cookie, ListItem, FormData } from '../../types';
const store = useRuleStore();

const formData = ref<FormData>({
  targetHost: "",
  list: [{ host: "", cookie: [], availableCookies: [] }],
});

const router = useRouter();
const formRef = ref<InstanceType<typeof ElForm>>();

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
  () => formData.value.list.map((item) => item.host),
  async (newHosts, oldHosts) => {
    for (let i = 0; i < newHosts.length; i++) {
      if (newHosts[i] !== oldHosts?.[i]) {
        const cookies = await getCookies(newHosts[i]);
        formData.value.list[i].availableCookies = cookies;
        formData.value.list[i].cookie = []; // 重置选中的cookies
      }
    }
  }
);

// 获取当前网址
const getCurrentTab = async () => {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tabs[0]?.url) return "";
  try {
    const url = new URL(tabs[0].url);
    formData.value.targetHost = url.origin;
  } catch (e) {
    console.error("Invalid URL:", e);
  }
};
getCurrentTab();

// 保存表单数据
const validateForm = async () => {
  try {
    await formRef.value?.validate();
    if (!formData.value.list.length) {
      ElMessage.error("请至少添加一个来源");
      return;
    }
    handleSave();
  } catch (e) {}
};
// 保存表单数据
const handleSave = async () => {
  try {
    await store.handleSave(formData.value);
    router.back();
  } catch (e) {
    ElMessage.error(`添加失败：${e}`);
  }
};
</script>

<template>
  <Header title="添加">
    <template #extra>
      <el-button type="primary" class="!px-2 !h-7" @click="validateForm">
        保 存
      </el-button>
    </template>
  </Header>

  <AddOrEditForm ref="formRef" v-model="formData" />
</template>
