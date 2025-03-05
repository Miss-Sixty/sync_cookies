import { Cookie, CookieRule, GetHosts } from "@/types";
import { STORAGE_KEY } from "./config";
import { ElMessageBox } from "element-plus";

// 获取 cookies 的方法
export const getCookies = async (host: string): Promise<Cookie[]> => {
  if (!host) return [];
  try {
    if (!host.startsWith("http")) {
      host = "http://" + host;
    }
    const url = new URL(host);
    const cookies = await browser.cookies.getAll({ domain: url.hostname });
    return cookies.filter(cookie => cookie.name !== undefined && cookie.value !== undefined).map(item => ({ name: item.name, value: item.value }));
  } catch (e) {
    console.error("Get cookies error:", e);
    return [];
  }
};

// 获取当前页面url
export const getCurrentUrl = async () => {
  const [firstTabs] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (!firstTabs?.url) return "";
  return new URL(firstTabs.url).origin;
}

// 保存表单数据
export const handleSaveData = async (formData: CookieRule, type = 'add') => {
  try {
    // 转换数据结构
    const data = (await storage.getItem<CookieRule[]>(STORAGE_KEY)) || [];
    const index = data.findIndex(rule => rule.targetHost === formData.targetHost);

    if (index === -1) return addData(data, formData);
    if (type === 'edit') return editData(data, index, formData);

    const isCover = await ElMessageBox.confirm(
      "目标网址已存在，是否覆盖？",
      "提示",
      {
        confirmButtonText: "覆盖",
        cancelButtonText: "取消",
      }
    );
    if (isCover === "confirm") editData(data, index, formData);
  } catch (e) {
    console.error('Save error:', e);
    throw e;
  }
}


const editData = async (data: CookieRule[], index: number, saveData: CookieRule) => {
  data[index] = saveData;
  await storage.setItem(STORAGE_KEY, JSON.parse(JSON.stringify(data)));
  return Promise.resolve();
};

const addData = async (data: CookieRule[], saveData: CookieRule) => {
  data.push(saveData);
  await storage.setItem(STORAGE_KEY, JSON.parse(JSON.stringify(data)));
  return Promise.resolve();
};

// 获取所有保存的规则
export const getAllRules = () => storage.getItem<CookieRule[]>(STORAGE_KEY) || []

// 获取当前规则
export const getCurrentRule = (rules: CookieRule[], url: string) => {
  return rules.find(rule => rule.targetHost === url);
}