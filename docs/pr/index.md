---
writers:
- kitUIN
---
# 编写说明

- 本项目使用`VitePress`构建
- 编写前请确保掌握`Markdown`知识
- 调试需要部分`Nodejs`知识
- 请务必阅读本文

### 快速开始

本地`clone`项目
```bash
git clone https://github.com/kitUIN/ArkdustTutorials.git
```

安装`VitePress`依赖
```bash
npm install
```

调试运行
```bash
npm run docs:dev
```

### 编写说明

- 图片
  - 图片放在`docs/public/`目录下
  - `md`文件引用时直接使用相对路径`/图片.png`,会直接默认从`docs/public/`加载图片

- 左侧导航栏
  - 导航栏的标题和链接在`docs/.vitepress/config.mts`中配置
  - 文件内的`themeConfig`中的`sidebar`项
- 顶部导航栏
  - 导航栏的标题和链接在`docs/.vitepress/config.mts`中配置
  - 文件内的`themeConfig`中的`nav`项

### 本教程自定义控件
- [现代化超链接](/pr/modernurl)
- [顶部题外话](/pr/subtitle)
- [MC图标](/pr/mcicon)
- [尾部作者栏](/pr/author)
- [更好的超链接](/pr/prettylink)