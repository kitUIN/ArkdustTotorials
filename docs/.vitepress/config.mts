import { defineConfig } from "vitepress";
import mdItCustomAttrs from "markdown-it-custom-attrs";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  head: [
    ["link", { rel: "icon", type: "image/x-icon", href: "/neo.ico" }],
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
        ],
      },
      { text: "ModernUI", link: "/mui/" },
      { text: "关于", link: "/team/" },
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
            items: [
              {
                text: "网络",
                link: "/data/network/",
                items: [
                  { text: "自定义数据包", link: "/data/network/custompacket" },
                ],
              },
            ],
          },
        ],
      },
      {
        text: "ModernUI使用笔记",
        link: "/mui/",
        collapsed: true,
        items: [
          { text: "将Mui加载进项目依赖", link: "/mui/preparation" },
          { text: "在mc中使用Mui的UI系统", link: "/mui/demoscreen" },
          {
            text: "Mui基础学",
            link: "/mui/base/",
            items: [
              { text: "片段(Fragment)", link: "/mui/base/fragment" },
              { text: "视图与文本视图(View/TextView)", link: "/mui/base/view" },
              { text: "视图组(ViewGroup)", link: "/mui/base/viewgroup" },
              { text: "渲染(Render)", link: "/mui/base/render" },
              { text: "动画(Animation)", link: "/mui/base/animation" },
            ],
          },
        ],
      },
      {
        text: "关于",
        link: "/team/"}
    ],
    returnToTopLabel:'返回顶部', 
    sidebarMenuLabel:'目录', 
    outline: { 
      label: '当前页大纲'
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/kitUIN/ArkdustTotorials" },
    ],
    editLink: {
      pattern:
        "https://github.com/kitUIN/ArkdustTotorials/edit/master/docs/:path",
      text: "在Github上编辑该页",
    },
    lastUpdated: {
      text: "上次更新时间",
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
    docFooter: { 
      prev: '上一页', 
      next: '下一页', 
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
