<script setup lang="ts">
import { Plus } from "@element-plus/icons-vue";

defineEmits<{
  add: [];
}>();
</script>

<template>
  <div class="flex-1 flex items-center justify-center bg-white rounded-lg">
    <el-empty :image-size="60" description="当前网址没有保存的规则"> </el-empty>
  </div>
</template>
