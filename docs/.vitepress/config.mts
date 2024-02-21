import { defineConfig } from "vitepress";
import mdItCustomAttrs from "markdown-it-custom-attrs";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  head: [
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://cdn.jsdelivr.net/npm/@fancyapps/ui/dist/fancybox.css",
      },
    ],
    [
      "script",
      {
        src: "https://cdn.jsdelivr.net/npm/@fancyapps/ui@4.0/dist/fancybox.umd.js",
      },
    ],
  ],

  lang: "zh-CN",
  title: "ArkdustTotorials",
  description:
    "The totorials of Minecraft Neoforge1.20.4 , Arkdust mod and even more",
  themeConfig: {
    logo: "/neo.svg",
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "主页", link: "/" },
      { text: "快速开始", link: "/introduction" },
      {
        text: "教程",
        items: [
          { text: "基础学", link: "/base/" },
          { text: "数据学", link: "/data/" },
          {
            text: "网络学",
            link: "/network/",
          },
        ],
      },
      { text: "关于", link: "/team" },
    ],

    sidebar: [
      {
        text: "教程",
        items: [
          { text: "概述", link: "/introduction" },
          { text: "开发环境配置", link: "/environment" },
          {
            text: "基础学",
            link: "/base/",
            items: [{ text: "注册 基础", link: "/base/registration" }],
          },
          {
            text: "数据学",
            link: "/data/",
            items: [],
          },
          {
            text: "网络学",
            link: "/network/",
            items: [{ text: "自定义数据包", link: "/network/custompacket" }],
          },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/kitUIN/ArkdustTotorials" },
    ],
    editLink: {
      pattern: 'https://github.com/kitUIN/ArkdustTotorials/edit/master/docs/:path',
      text:"在Github上编辑该页"
    },
    lastUpdated: {
      text: '上次更新时间'
    },
    search: {
      provider: "local",
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: "搜索文档",
                buttonAriaLabel: "搜索文档",
              },
              modal: {
                noResultsText: "无法找到相关结果",
                resetButtonTitle: "清除查询条件",
                footer: {
                  selectText: "选择",
                  navigateText: "切换",
                },
              },
            },
          },
        },
      },
    },
  },
  lastUpdated: true,
  markdown: {
    image: {
      // 默认禁用图片懒加载
      lazyLoading: true,
    },
    config: (md) => {
      // use more markdown-it plugins!
      md.use(mdItCustomAttrs, "image", {
        "data-fancybox": "gallery",
      });
    },
  },
});
