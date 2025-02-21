<script lang="ts" setup>
import { useRouter } from "vue-router";
const router = useRouter();
defineProps({
  title: {
    type: String,
    default: "",
  },
});
const goBack = () => {
  router.back();
};
</script>

<template>
  <el-page-header @back="goBack" class="bt-1 mb-2" title="返回">
    <template #content>
      <span class="text-large font-600 mr-3"> {{ title }} </span>
    </template>
    <template #extra>
      <slot name="extra"></slot>
    </template>
  </el-page-header>
</template>
