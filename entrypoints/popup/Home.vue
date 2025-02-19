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

</script>

<template>
  <div class="flex items-center gap-2">
    <el-select-v2
      ref="select"
      v-model="value"
      :options="options"
      placeholder="点击右侧按钮添加cookie来源"
      :height="150"
    />
    <el-button
      :icon="Setting"
      circle
      @click="$emit('update:modelValue', 'settings')"
    />
  </div>

  <el-table
    class="flex-1"
    :data="tableData"
    border
    show-overflow-tooltip
    scrollbar-always-on
  >
    <el-table-column prop="date" label="来源" />
    <el-table-column prop="address" label="cookie" />
  </el-table>

  <el-button type="primary">同 步</el-button>
</template>
