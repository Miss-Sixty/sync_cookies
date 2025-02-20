<script lang="ts" setup>
import { VueDraggable } from "vue-draggable-plus";
import { Delete, Edit, Plus, Sort } from "@element-plus/icons-vue";
const emit = defineEmits(["editData"]);
const modelValue = defineModel();
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

const handleClickList = (item: any) => {
  modelValue.value = "edit";
  emit("editData", item);
};
</script>

<template>
  <el-page-header @back="$emit('update:modelValue', 'home')" class="bt-1 mb-2">
    <template #content>
      <span class="text-large font-600 mr-3"> 设置 </span>
    </template>
    <template #extra>
      <el-button
        type="primary"
        size="small"
        :icon="Plus"
        @click="$emit('update:modelValue', 'add')"
      >
        添 加
      </el-button>
    </template>
  </el-page-header>

  <VueDraggable
    ref="el"
    v-model="list"
    :animation="150"
    class="flex flex-col gap-2"
    handle=".el-icon"
  >
    <div
      v-for="item in list"
      :key="item.id"
      class="border rounded px-1 py-2 flex items-center"
      @click="handleClickList(item)"
    >
      <el-button
        title="排序"
        size="small"
        :icon="Sort"
        text
        class="!cursor-move"
      />
      <span class="flex-1 bg-red-300 truncate mx-1" :title="item.name">
        {{ item.name }}
      </span>
      <el-button class="!px-1.5" title="修改" size="small" :icon="Edit" text />
      <el-popconfirm title="确定要删除吗？">
        <template #reference>
          <el-button
            class="!px-1.5 !ml-0"
            title="删除"
            size="small"
            :icon="Delete"
            text
          />
        </template>
      </el-popconfirm>
    </div>
  </VueDraggable>
</template>
