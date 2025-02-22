<script lang="ts" setup>
import { Delete } from "@element-plus/icons-vue";
import { ElForm } from "element-plus";
import { PropType } from "vue";
import { FormData } from "../../../../types";
import CardSection from "../../../../components/CardSection.vue";

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
    hide-required-asterisk
    status-icon
    :show-message="false"
  >
    <el-form-item
      prop="targetHost"
      class="bg-white px-4 py-2 rounded mx-4"
      label="目标网址"
      :rules="{ required: true }"
    >
      <el-input placeholder="请输入目标网址" v-model="formData.targetHost" />
    </el-form-item>
    <el-scrollbar>
      <CardSection
        v-for="(item, i) in formData.list"
        :key="i"
        :title="'来源' + (i + 1)"
      >
        <el-form-item
          label="网址"
          :prop="`list.${i}.host`"
          :rules="{ required: true }"
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
          :rules="{ required: true, type: 'array' }"
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
      </CardSection>
    </el-scrollbar>
    <el-button @click="handleAdd">添加来源</el-button>
  </el-form>
</template>

<style>
@reference "../../style.css";

.el-form-item {
  @apply !mb-0;
}
</style>
