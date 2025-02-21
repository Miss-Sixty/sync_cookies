<script lang="ts" setup>
import { ElForm, ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import Header from "../../components/Header.vue";
import AddOrEditForm from "../../components/AddOrEditForm.vue";
import { useRuleStore } from "../../stores/rules";

const router = useRouter();
const store = useRuleStore();
const formRef = ref<InstanceType<typeof ElForm>>();
const formData = ref(store.editingRule);

// 保存表单数据
const validateForm = async () => {
  try {
    await formRef.value?.validate();
    if (!formData.value.list.length) {
      ElMessage.error("请至少添加一个来源");
      return;
    }
    handleSave();
  } catch (e) {}
};
// 保存表单数据
const handleSave = async () => {
  try {
    await store.handleSave(formData.value,'edit');
    router.back();
  } catch (e) {
    ElMessage.error(`添加失败：${e}`);
  }
};
</script>

<template>
  <Header title="修改">
    <template #extra>
      <el-button type="primary" class="!px-2 !h-7" @click="validateForm">
        保 存
      </el-button>
    </template>
  </Header>
  <AddOrEditForm ref="formRef" v-model="formData" />
</template>
