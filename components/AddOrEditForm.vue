<script lang="ts" setup>
import { Delete } from "@element-plus/icons-vue";
import { ElForm } from "element-plus";
import { PropType } from "vue";
import { Cookie, ListItem, FormData } from '../types';

const formData = defineModel<FormData>({
  default: {
    targetHost: "",
    list: [{ host: "", cookie: [], availableCookies: [] }],
  },
});

defineProps({
  type: {
    type: String,
    default: "add",
  },
  formData: {
    type: Object as PropType<FormData>,
    default: () => ({}),
  },
});

const handleAdd = () => {
  formData.value.list.push({ host: "", cookie: [], availableCookies: [] });
};
const handleDel = (i: number) => {
  formData.value.list.splice(i, 1);
};

const formRef = ref<InstanceType<typeof ElForm>>();
// 验证
const validate = () => formRef.value?.validate();
defineExpose({
  formRef,
  validate,
});
</script>

<template>
  <el-form
    ref="formRef"
    :model="formData"
    label-width="auto"
    class="overflow-hidden flex flex-col flex-1"
  >
    <el-form-item
      prop="targetHost"
      label="目标网址"
      :rules="[{ required: true, message: '请输入目标网址' }]"
    >
      <el-input v-model="formData.targetHost" />
    </el-form-item>
    <el-scrollbar>
      <template v-for="(item, i) in formData.list" :key="i">
        <el-divider content-position="left">来源{{ i + 1 }}</el-divider>
        <el-form-item
          label="网址"
          :prop="`list.${i}.host`"
          :rules="[{ required: true, message: '请输入网址' }]"
        >
          <div class="flex w-full items-center gap-1">
            <el-input
              class="flex-1"
              v-model="item.host"
              placeholder="请输入来源网址"
            />
            <el-button
              class="!px-2"
              title="删除"
              :icon="Delete"
              text
              @click="handleDel(i)"
            />
          </div>
        </el-form-item>
        <el-form-item
          label="cookies"
          :prop="`list.${i}.cookie`"
          :rules="[{ required: true, message: '请选择cookies', type: 'array' }]"
        >
          <el-checkbox-group v-model="item.cookie">
            <el-checkbox
              v-for="cookie in item.availableCookies"
              :key="cookie.value"
              :value="cookie.value"
            >
              {{ cookie.value }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </template>
    </el-scrollbar>
    <el-button @click="handleAdd">添加来源</el-button>
  </el-form>
</template>

<style>
@reference "../entrypoints/popup/style.css";

.el-form-item {
  @apply mb-1;
}
</style>
