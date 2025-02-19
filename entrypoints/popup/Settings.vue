<script lang="ts" setup>
import { VueDraggable } from "vue-draggable-plus";
const list = ref([
  {
    name: "Joao",
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
</script>

<template>
  <el-page-header @back="$emit('update:modelValue', 'home')">
    <template #content>
      <span class="text-large font-600 mr-3"> 设置 </span>
    </template>
  </el-page-header>

  <VueDraggable
    ref="el"
    v-model="list"
    :animation="150"
    class="flex flex-col gap-2"
  >
    <div
      v-for="item in list"
      :key="item.id"
      class="cursor-move bg-gray-500/5 rounded p-3"
    >
      {{ item.name }}
    </div>
  </VueDraggable>
</template>
