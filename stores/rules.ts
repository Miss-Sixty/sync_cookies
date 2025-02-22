import { ElMessageBox } from 'element-plus';
import { defineStore } from 'pinia';
import { storage } from 'wxt/storage';
import { CookieRule, FormData } from '../types';

const STORAGE_KEY = "local:cookie_rules";

export const useRuleStore = defineStore('rules', {
  state: () => ({
    editingRule: {
      targetHost: "",
      list: [{ host: "", cookie: [], availableCookies: [] }],
    } as CookieRule
  }),
  actions: {
    // 保存表单数据
    async handleSave(formData: FormData, type = 'add') {
      try {
        const saveData = JSON.parse(JSON.stringify(formData));
        const data = (await storage.getItem<CookieRule[]>(STORAGE_KEY)) || [];
        const index = data.findIndex(rule => rule.targetHost === saveData.targetHost);
        if (index === -1) return addData(data, saveData);
        if (type === 'edit') return editData(data, index, saveData)
        const isCover = await ElMessageBox.confirm(
          "目标网址已存在，是否覆盖？",
          "提示",
          {
            confirmButtonText: "覆盖",
            cancelButtonText: "取消",
          }
        );
        if (isCover === "confirm") editData(data, index, saveData);
      } catch (e) {
      }
    }
  },
});

const editData = async (data: CookieRule[], index: number, saveData: CookieRule) => {
  data[index] = saveData;
  await storage.setItem(STORAGE_KEY, data);
  return Promise.resolve();
};

const addData = async (data: CookieRule[], saveData: CookieRule) => {
  data.push(saveData);
  await storage.setItem(STORAGE_KEY, data);
  return Promise.resolve();
};
