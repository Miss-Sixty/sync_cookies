<script setup lang="ts">
import { Toaster } from "vue-sonner";
import { CircleCheckFilled, CircleCloseFilled } from "@element-plus/icons-vue";
import Home from "./index.vue";
</script>

<template>
  <Toaster position="bottom-right" offset="16px">
    <template #success-icon>
      <el-icon size="16" color="#67C23A"><CircleCheckFilled /></el-icon>
    </template>
    <template #error-icon>
      <el-icon size="16" color="#F56C6C"><CircleCloseFilled /></el-icon>
    </template>
  </Toaster>
  <div class="w-[601px] h-[450px] flex flex-col bg-gray-100">
    <Home />
  </div>
</template>
