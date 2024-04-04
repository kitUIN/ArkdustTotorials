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
  id: "versions" # 唯一标识符, 用于自动识别文章的多版本模式, 不填就不会自动识别
  vanilla: "1.20.4" # 原版版本
  loaders:  # 模组加载器版本
    - text: "NeoForge-20.4.80-beta"
      loader: "neoforge" #  模组加载器图标
  others: # 其他标签
    - text: "Yarn"
      id: "混淆表" # 其他标签中的唯一标识符,在父级id存在的情况下,符合该id的标签才会被自动识别
      loader: "fabric"
    - text: "自定义控件"
---
```
展示:

![image1](/components/version1.png)
![image2](/components/version2.png)
