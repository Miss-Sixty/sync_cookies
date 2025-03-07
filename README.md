# Sync Cookies

一个用于同步不同域名之间 Cookies 的 Chrome/Edge/Firefox 扩展。

## 功能介绍

- 🔄 跨域同步 - 在不同域名之间自由同步 Cookies
- 🔍 实时预览 - 实时显示当前页面和来源页面的所有 Cookies
- ✅ 选择性同步 - 可以选择需要同步的特定 Cookies
- 🔔 变更提示 - 自动检测 Cookie 变化并提示同步
- 📋 多来源支持 - 支持从多个来源网站同步 Cookies

## 安装使用

### 从应用商店安装

- 🌐 [Chrome 网上应用店](https://chromewebstore.google.com/detail/synccookies/hcehoofohgpjngheemopifodkamccbij)
- 🦊 [Firefox 附加组件](#)（暂未发布）

### 手动安装

1. 从 [Releases](https://github.com/SeahorZhang/sync_cookies/releases) 下载最新版本的 zip 文件
2. 解压到本地文件夹
3. 打开浏览器的扩展管理页面
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Firefox: `about:addons`
4. 开启"开发者模式"
   - Firefox: 点击齿轮图标，选择"调试附加组件"
5. 点击"加载已解压的扩展程序"并选择解压后的文件夹
   - Firefox: 点击"临时载入附加组件"，选择 manifest.json 文件

## 使用方法

1. 在目标网站点击扩展图标
2. 点击"添加"按钮添加来源网站
3. 在来源网站中选择要同步的 Cookies
4. 点击"同步"按钮将选中的 Cookies 同步到当前网站

## 开发指南

### 前置要求

- Node.js >= 16
- pnpm >= 8

### 开发流程

1. 克隆仓库
bash
git clone https://github.com/SeahorZhang/sync_cookies.git  
cd sync_cookies

2. 安装依赖
bash
pnpm install

3. 启动开发服务器
bash
pnpm build


## 贡献

欢迎提交 Issue 和 Pull Request。请确保在提交前测试你的代码。

## 许可证

[MIT](LICENSE)