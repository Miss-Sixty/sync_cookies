// 获取 cookies 的方法
export const getCookies = async (host: string) => {
  if (!host) return [];
  try {
    if (!host.startsWith("http")) {
      host = "http://" + host;
    }
    const url = new URL(host);
    return await browser.cookies.getAll({ domain: url.hostname });
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
