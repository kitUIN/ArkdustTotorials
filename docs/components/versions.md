---
writers:
- kitUIN
---
# 多版本
为你的文章增加多版本模式

## 使用
在md文件顶部添加
```yml
---
versions: # 多版本模式
  vanilla:  # 原版版本
    current:  # 当前版本
      text: "1.12.2"  # 当前版本号
    others:
      - text: "1.14.4" # 其他版本号
        link: "/text/hellowrold1.14.4" # 其他版本号对应的文章链接
  loader:  # 模组加载器版本
    current:  # 当前版本
      text: "NeoForged >=20.4.80-beta"  # 当前版本号
      loader: "neoforge"  # 模组加载器
    others:
      - text: "NeoForged-20.4.78" # 其他版本号
        loader: "neoforge" # 模组加载器
        link: "/text/hellowrold1.14.4"  # 其他版本号对应的文章链接
      - text: "Fabric-20.4.79"
        loader: "fabric"
      - text: "Forge-20.4.78"
        loader: "forge"
      - text: "Quilt-20.4.78"
        loader: "quilt"
---
```
展示:

![image1](/components/version1.png)
![image2](/components/version2.png)

## 参数


### MVersions
即上文中的`versions`项

| 参数 | 类型  | 默认值 | 说明 |
| :------: | :------: | :------: | :------: |
| `vanilla` | `Version?` | - | mc版本|
| `loader` | `Version?` | - | 模组加载器版本|

### Version

| 参数 | 类型  | 默认值 | 说明 |
| :------: | :------: | :------: | :------: |
| `current` | `VersionLink?` | - | 当前版本|
| `others` | `VersionLink[]?` | - | 其他版本|

### VersionLink
| 参数 | 类型  | 默认值 | 说明 |
| :------: | :------: | :------: | :------: |
| `text` | `string?` | - | 显示的文字内容|
| `loader` | `string?` | `vanilla` | 加载器图标,默认为原版,可选: `neoforge`/`forge`/`fabric`/`quilt`/`vanilla`|
| `link` | `string?` | - | 跳转到的链接|
| `type` | `string?` | `tip` | 徽标的样式,可选: `info`/`tip`/`warning`/`danger`|