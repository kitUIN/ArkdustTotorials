import { defineConfig } from "vitepress";
import mdItCustomAttrs  from 'markdown-it-custom-attrs'
 

// https://vitepress.dev/reference/site-config
export default defineConfig({
  head:[
    [
        "link",
        { rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/@fancyapps/ui/dist/fancybox.css" },
    ],
    ["script", { src: "https://cdn.jsdelivr.net/npm/@fancyapps/ui@4.0/dist/fancybox.umd.js" }],
],
  lang: "zh-CN",
  title: "ArkdustTotorials",
  description:
    "The totorials of Minecraft Neoforge1.20.4 , Arkdust mod and even more",
  themeConfig: {
    logo:"/neo.svg",
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "主页", link: "/" },
      { text: "教程", link: "/introduction" },
    ],

    sidebar: [
      {
        text: "教程",
        items: [
          { text: "概述", link: "/introduction" },
          { text: "开发环境配置", link: "/environment" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/vuejs/vitepress" },
    ],
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换'
                }
              }
            }
          }
        }
      }
    }
  },
  lastUpdated: true,
  markdown: {
    image: {
      // 默认禁用图片懒加载
      lazyLoading: true
    },
    config: (md) => {
      // use more markdown-it plugins!
      md.use(mdItCustomAttrs, 'image', {
          'data-fancybox': "gallery"
      })
      }
  }
});
