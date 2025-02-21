<script lang="ts" setup>
import { ElForm, ElMessage, ElMessageBox } from "element-plus";
import { storage } from "wxt/storage";
import { useRouter } from "vue-router";
import Header from "../../components/Header.vue";
import AddOrEditForm from "../../components/AddOrEditForm.vue";

// 导入 CookieRule 类型
interface CookieRule {
  targetHost: string;
  list: {
    host: string;
    cookie: string[];
  }[];
}
const STORAGE_KEY = "local:cookie_rules";

interface Cookie {
  label: string;
  value: string;
}

interface ListItem {
  host: string;
  cookie: string[];
  availableCookies: Cookie[];
}

interface FormData {
  targetHost: string;
  list: ListItem[];
}

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
      label: `${cookie.name} = ${cookie.value}`,
      value: cookie.name,
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
const handleSave = async () => {
  try {
    const res = await formRef.value?.validate();
    console.log(2, res);
    if (!formData.value.list.length) {
      ElMessage.error("请至少添加一个来源");
      return;
    }

    // 准备保存的数据（去掉availableCookies）
    const saveData: CookieRule = {
      targetHost: formData.value.targetHost,
      list: formData.value.list.map((item) => ({
        host: item.host,
        cookie: item.cookie,
      })),
    };

    // 获取现有数据
    const data: CookieRule[] =
      (await storage.getItem<CookieRule[]>(STORAGE_KEY)) || [];
    console.log(1, data);

    const index = data.findIndex(
      (rule) => rule.targetHost === saveData.targetHost
    );

    if (index !== -1) {
      // 提醒是否覆盖
      const isCover = await ElMessageBox.confirm(
        "目标网址已存在，是否覆盖？",
        "提示",
        {
          confirmButtonText: "覆盖",
          cancelButtonText: "取消",
        }
      );
      if (isCover === "confirm") {
        data[index] = saveData;
        await storage.setItem(STORAGE_KEY, data);
        ElMessage.success("修改成功");
        router.back();
      }
    } else {
      data.push(saveData);
      await storage.setItem(STORAGE_KEY, data);
      ElMessage.success("添加成功");
      router.back();
    }
  } catch (e) {
    ElMessage.error(`添加失败：${e}`);
  }
};
</script>

<template>
  <Header title="添加">
    <template #extra>
      <el-button type="primary" class="!px-2 !h-7" @click="handleSave">
        保 存
      </el-button>
    </template>
  </Header>

  <AddOrEditForm ref="formRef" v-model="formData" />
</template>
