<script lang="ts" setup>
import { Delete, Edit, Plus, Sort } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { PropType } from "vue";
import { storage } from "wxt/storage";
import { useRouter, useRoute } from "vue-router";
import Header from "../../components/Header.vue";

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

const modelValue = defineModel({ default: "add" });
const props = defineProps({
  type: {
    type: String,
    default: "add",
  },
  editData: {
    type: Object as PropType<CookieRule>,
    default: () => ({}),
  },
});

const formData = ref<FormData>({
  targetHost: "",
  list: [{ host: "", cookie: [], availableCookies: [] }],
});

const router = useRouter();
const route = useRoute();

// 获取编辑数据
const editData = computed(() => {
  if (route.params.editData) {
    return JSON.parse(route.params.editData as string);
  }
  return undefined;
});

// 初始化表单数据
const initFormData = async (data?: CookieRule) => {
  console.log(212, data);
  if (!data) {
    formData.value = {
      targetHost: "",
      list: [{ host: "", cookie: [], availableCookies: [] }],
    };
    // 如果是新增模式，获取当前网址
    if (modelValue.value === "add") {
      await getCurrentTab();
    }
    return;
  }

  // 编辑模式：加载已有数据
  formData.value = {
    targetHost: data.targetHost,
    list: await Promise.all(
      data.list.map(async (item) => {
        const availableCookies = await getCookies(item.host);
        return {
          host: item.host,
          cookie: item.cookie,
          availableCookies,
        };
      })
    ),
  };
};

// 监听编辑数据变化
// watch(
//   () => [props.editData, modelValue.value],
//   async ([newData]) => {
//     await initFormData(newData as CookieRule);
//   },
//   { immediate: true }
// );

// 获取当前网址
const getCurrentTab = async () => {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  if (tabs[0]?.url) {
    try {
      const url = new URL(tabs[0].url);
      formData.value.targetHost = url.hostname;
    } catch (e) {
      console.error("Invalid URL:", e);
    }
  }
};

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

const handleAdd = () => {
  formData.value.list.push({ host: "", cookie: [], availableCookies: [] });
};
const handleDel = (i: number) => {
  formData.value.list.splice(i, 1);
};

// 修改返回处理
const handleBack = () => {
  router.push({ name: "settings" });
};

// 保存表单数据
const handleSave = async () => {
  try {
    // 验证表单数据
    if (!formData.value.targetHost) {
      ElMessage.error("请输入目标网址");
      return;
    }

    if (!formData.value.list.length) {
      ElMessage.error("请至少添加一个来源");
      return;
    }

    for (const item of formData.value.list) {
      if (!item.host) {
        ElMessage.error("来源网址不能为空");
        return;
      }
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

    if (modelValue.value === "edit") {
      // 更新现有规则
      const index = data.findIndex(
        (rule) => rule.targetHost === props.editData?.targetHost
      );
      if (index !== -1) {
        data[index] = saveData;
        await storage.setItem(STORAGE_KEY, data);
        ElMessage.success("修改成功");
      } else {
        ElMessage.error("未找到要修改的规则");
        return;
      }
    } else {
      // 检查是否已存在相同的目标网址
      if (data.some((rule) => rule.targetHost === saveData.targetHost)) {
        ElMessage.error("目标网址已存在");
        return;
      }
      // 添加新规则
      await storage.setItem(STORAGE_KEY, [...data, saveData]);
      ElMessage.success("添加成功");
    }

    // 保存成功后返回设置页面
    router.push({ name: "settings" });
  } catch (error) {
    console.error("Save error:", error);
    ElMessage.error(modelValue.value === "edit" ? "修改失败" : "添加失败");
  }
};
</script>

<template>
  <Header :title="type === 'add' ? '添加' : '修改'">
    <template #extra>
      <el-button type="primary" class="!px-2 !h-7" @click="handleSave">
        保 存
      </el-button>
    </template>
  </Header>

  222--{{ editData }}

  <el-form
    :model="formData"
    label-width="auto"
    class="overflow-hidden flex flex-col flex-1"
  >
    <el-form-item label="目标网址">
      <el-input v-model="formData.targetHost" />
    </el-form-item>
    <el-scrollbar>
      <template v-for="(item, i) in formData.list" :key="i">
        <el-divider content-position="left">来源{{ i + 1 }}</el-divider>
        <el-form-item label="网址">
          <div class="flex w-full items-center gap-1">
            <el-input class="flex-1" v-model="item.host" />
            <el-button
              class="!px-2"
              title="删除"
              :icon="Delete"
              text
              @click="handleDel(i)"
            />
          </div>
        </el-form-item>
        <el-form-item label="cookies">
          <el-checkbox-group v-model="item.cookie">
            <el-checkbox
              v-for="cookie in item.availableCookies"
              :key="cookie.value"
              :label="cookie.value"
            >
              {{ cookie.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </template>
    </el-scrollbar>
    <el-button @click="handleAdd">添加来源</el-button>
  </el-form>
</template>

<style>
@reference "./style.css";

.el-form-item {
  @apply mb-1;
}
</style>
