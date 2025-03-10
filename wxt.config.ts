import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import ElementPlus from 'unplugin-element-plus/vite'
import { fileURLToPath } from 'url'


// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: 'Sync Cookies',
    description: '多域名cookies同步',
    permissions: [
      "activeTab",  // 这个权限允许我们访问当前标签页的所有信息，包括 cookies
      "cookies",    // 用于操作 cookies
      "storage"     // 用于存储规则
    ],
    host_permissions: [
      "*://*/*"  // 允许访问所有网站的 cookies
    ]
  },
  vite: () => ({
    plugins: [
      tailwindcss(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
      ElementPlus({}),
    ],
    define: {
      'import.meta.env.BUILD_TIME': JSON.stringify(new Date().toISOString())
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./', import.meta.url))
      }
    }
  }),
});
