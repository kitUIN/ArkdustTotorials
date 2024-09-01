---
writers:
  - AW-CRK14
versions:
  id: "arch"
---

# Architectury

在mod开发过程中，有时候我们想让一个mod同时支持多种mod加载器。
显然，如果我们为同一个mod的forge，neoforge，fabric版本分别创建一个项目分别开发，维护将是一个困难的任务——
因此，Architectury应运而生。

`Architectury`是一款用于多加载器联合开发的工具，其`Architectury API`为ForgeAPI与FabricAPI的抽象化调用API。
简单来说，它能帮助我们同时开发不同模组加载器平台的mod，共享大部分代码，并辅助处理加载器的专有实现的代码。

下文中，`Architectury`我们将简称为arch。

## 开始一个Architectury项目

idea的mcdev插件可以帮我们创建一个arch项目——但由于种种原因，其版本存在一些滞后性。

因此，我们推荐使用[这个网站](https://generate.architectury.dev/)来创建项目。
在设置完左侧的基础信息后，可以在右侧选择需要联合开发的加载器平台。最后点击下方的`Generate template`，生成模板。
最后下载模板，解压，在ide中以项目形式打开，等待gradle构建即可。