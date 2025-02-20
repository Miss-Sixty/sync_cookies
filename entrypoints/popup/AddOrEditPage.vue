<script lang="ts" setup>
import { Delete, Edit, Plus, Sort } from "@element-plus/icons-vue";
const modelValue = defineModel({ default: "add" });
defineProps({
  editData: {
    type: Object,
    default: () => ({}),
  },
});
const list = ref([
  {
    name: "JoaoJoaoJoaoJoaoJoaoJoaoJoaoJoaoJoaoJoaoJoaoJoaoJoao",
    id: 1,
  },
  {
    name: "Jean",
    id: 2,
  },
  {
    name: "Johanna",
    id: 3,
  },
  {
    name: "Juan",
    id: 4,
  },
]);

const data = [
  {
    label: "Level one 1",
  },
  {
    label: "Level one 2",
  },
  {
    label: "Level one 3",
  },
];

const defaultProps = {
  children: "children",
  label: "label",
};

const formData = ref({
  targetHost: "",
  list: [{ host: "www.baidu.com", cookie: [] }],
});

const handleAdd = () => {
  formData.value.list.push({ host: "", cookie: [] });
};
const handleDel = (i: number) => {
  formData.value.list.splice(i, 1);
};
</script>

<template>
  <el-page-header @back="modelValue = 'settings'" class="mt-1">
    <template #content>
      <span class="text-large font-600 mr-3">
        {{ modelValue === "add" ? "添加" : "修改" }}
      </span>
    </template>
    <template #extra>
      <el-button type="primary" class="!px-2 !h-7">保 存</el-button>
    </template>
  </el-page-header>

  <!-- 222--{{ editData }} -->

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
            <el-checkbox label="Option A" value="Value A" />
            <el-checkbox label="Option B" value="Value B" />
            <el-checkbox label="Option C" value="Value C" />
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
