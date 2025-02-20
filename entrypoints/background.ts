export default defineBackground(() => {
  // 存储所有的规则
  const STORAGE_KEY = 'cookie_rules';

  // 保存规则到存储
  async function saveRule(rule: CookieRule) {
    const rules = await browser.storage.local.get(STORAGE_KEY);
    const existingRules: CookieRule[] = rules[STORAGE_KEY] || [];
    
    // 检查是否存在相同目标网址的规则
    const index = existingRules.findIndex(r => r.targetHost === rule.targetHost);
    if (index !== -1) {
      existingRules[index] = rule;
    } else {
      existingRules.push(rule);
    }
    
    await browser.storage.local.set({ [STORAGE_KEY]: existingRules });
  }

  // 获取所有规则
  async function getRules(): Promise<CookieRule[]> {
    const rules = await browser.storage.local.get(STORAGE_KEY);
    return rules[STORAGE_KEY] || [];
  }

  // 删除规则
  async function deleteRule(targetHost: string) {
    const rules = await browser.storage.local.get(STORAGE_KEY);
    const existingRules: CookieRule[] = rules[STORAGE_KEY] || [];
    const newRules = existingRules.filter(r => r.targetHost !== targetHost);
    await browser.storage.local.set({ [STORAGE_KEY]: newRules });
  }

  // 更新规则顺序
  async function updateRulesOrder(newRules: CookieRule[]) {
    await browser.storage.local.set({ [STORAGE_KEY]: newRules });
  }

  // 监听消息
  browser.runtime.onMessage.addListener(async (message) => {
    switch (message.type) {
      case 'saveRule':
        await saveRule(message.data);
        return true;
      case 'getRules':
        return await getRules();
      case 'deleteRule':
        await deleteRule(message.data.targetHost);
        return true;
      case 'updateRulesOrder':
        await updateRulesOrder(message.data);
        return true;
      default:
        return false;
    }
  });

  console.log('Background script initialized');
});

// 类型定义
interface Cookie {
  label: string;
  value: string;
}

interface ListItem {
  host: string;
  cookie: string[];
  availableCookies: Cookie[];
}

interface CookieRule {
  targetHost: string;
  list: ListItem[];
}
