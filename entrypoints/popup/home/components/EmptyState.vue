<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue';

defineEmits<{
  add: [];
}>();
</script>

<template>
  <div class="flex-1 flex items-center justify-center bg-white m-3 rounded-lg">
    <el-empty :image-size="60" description="当前网址没有保存的规则">
      <el-button type="primary" @click="$emit('add')" class="!flex !items-center">
        <el-icon class="mr-1"><Plus /></el-icon>
        添加配置
      </el-button>
    </el-empty>
  </div>
</template> 