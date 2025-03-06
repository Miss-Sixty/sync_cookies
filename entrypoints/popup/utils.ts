import { Cookie, CookieRule } from "@/types";
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
    
    // 使用 Map 去重，保留最后一个出现的 cookie
    const uniqueCookies = new Map();
    cookies.forEach(cookie => {
      if (cookie.name && cookie.value) {
        uniqueCookies.set(cookie.name, {
          name: cookie.name,
          value: cookie.value
        });
      }
    });
    
    return Array.from(uniqueCookies.values());
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
    const saveData = JSON.parse(JSON.stringify(formData));

    // 转换数据结构
    const data = (await storage.getItem<CookieRule[]>(STORAGE_KEY)) || [];
    const index = data.findIndex(rule => rule.targetHost === saveData.targetHost);

    if (index === -1) return addData(data, saveData);
    if (type === 'edit') return editData(data, index, saveData);

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

// 清除 cookies
export const handleClearCookies = async (url: string, cookies: Cookie[]) => {
  try {
    for (const cookie of cookies) {
      await browser.cookies.remove({
        url,
        name: cookie.name,
      });
    }
    return await getCookies(url);
  } catch (e) {
    console.error("Clear cookies error:", e);
    throw e;
  }
};