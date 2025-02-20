<script lang="ts" setup>
import { ElConfigProvider } from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import Home from "./Home.vue";
import Settings from "./Settings.vue";
import AddOrEditPage from "./AddOrEditPage.vue";

const activePage = ref("settings");
const editData = ref();

watch(activePage, (val) => {
  if (val !== "edit") editData.value = {};
});
</script>

<template>
  <el-config-provider :locale="zhCn">
    <div class="w-96 py-3 px-4 flex flex-col gap-2 h-96 overflow-hidden">
      <Home v-if="activePage === 'home'" v-model="activePage" />
      <Settings
        v-else-if="activePage === 'settings'"
        v-model="activePage"
        @editData="(val) => (editData = val)"
      />
      <AddOrEditPage
        v-else-if="activePage === 'add' || activePage === 'edit'"
        v-model="activePage"
        :editData="editData"
      />
    </div>
  </el-config-provider>
</template>
