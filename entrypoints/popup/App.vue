<script lang="ts" setup>
import { ElConfigProvider } from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import {
  ArrowDown,
  Plus,
  Delete,
  Edit,
  Setting,
} from "@element-plus/icons-vue";
import Home from "./Home.vue";
import Settings from "./Settings.vue";
const formData = ref({
  name: "",
});

const tableData = ref([
  {
    date: "2016-05-03",
    address: "No. 189, Grove St, Los Angeles",
  },
  {
    date: "2016-05-02",
    address: "No. 189, Grove St, Los Angeles",
  },
  {
    date: "2016-05-02",
    address: "No. 189, Grove St, Los Angeles",
  },
  {
    date: "2016-05-02",
    address: "No. 189, Grove St, Los Angeles",
  },
  {
    date: "2016-05-02",
    address: "No. 189, Grove St, Los Angeles",
  },
  {
    date: "2016-05-02",
    address: "No. 189, Grove St, Los Angeles",
  },
]);

const initials = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
const value = ref();
const options = Array.from({ length: 1000 }).map((_, idx) => ({
  value: `Option ${idx + 1}`,
  label: `${initials[idx % 10]}${idx}`,
}));

const activePage = ref("settings");
</script>

<template>
  <el-config-provider :locale="zhCn">
    <div class="w-96 p-2 flex flex-col gap-2 h-96 overflow-hidden">
      <Home v-if="activePage === 'home'" v-model="activePage" />
      <Settings v-else-if="activePage === 'settings'" v-model="activePage" />
    </div>
  </el-config-provider>
</template>
