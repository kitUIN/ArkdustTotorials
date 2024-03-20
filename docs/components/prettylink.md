---
writers:
- kitUIN
---
# 更好的超链接

自定义超链接
- 图标
- 颜色

## 使用
在`/docs/.vitepress/theme/datas/prettyLinks.ts`文件中添加你需要的图标和颜色

例如:
```ts
export const prettyList = [
    {
      pattern: /https:\/\/www\.curseforge\.com.+/, // 链接检测正则
      icon:"/icon/curseforge.ico", // 图标
      color: '#F16436', // 颜色
    }
  ]
```

展示:
- [Github](https://github.com/bernie-g/geckolib)
- [CurseForge](https://www.curseforge.com/minecraft/mc-mods/geckolib)
- [Modrinth](https://modrinth.com/mod/geckolib)
- [McMod](https://www.mcmod.cn/class/3232.html)
- [blockbench](https://www.blockbench.net/)