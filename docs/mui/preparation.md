---
writers:
  - AW-CRK14
---

# 将Mui加载进项目依赖

首先我们需要配置build.gradle文件。

配置repositories部分，添加库的路径：

```gradle
maven {
    name 'IzzelAliz Maven'
    url 'https://maven.izzel.io/releases/'
}

maven {
    name 'Curse Maven'
    url = "https://www.cursemaven.com"
}
```

添加库配置：

```gradle
configurations {
    libraries
    // This will make sure that all dependencies that you add to the libraries configuration will also be added to the implementation configuration
    // This way, you only need one dependency declaration for both runtime and compile dependencies
    implementation.extendsFrom libraries
}
```

然后在dependencies部分添加mui的编译与运行依赖：

```gradle
// Modern UI core framework
libraries "icyllis.modernui:ModernUI-Core:${modernui_version}"
// Modern UI core extensions
libraries "icyllis.modernui:ModernUI-Markdown:${modernui_version}"
// Modern UI for Minecraft Forge
compileOnly "curse.maven:modern-ui-352491:5040141"
runtimeOnly "curse.maven:modern-ui-352491:5040141"
```

接下来就可以重新构建gradle环境了。在等待gradle时，我们可以配置一下我们的mods.toml文件，把mui添加为模组依赖：

```
[[dependencies.xxx]]
    modId="modernui"
    type="required"
    versionRange="[3.10.0.6,)"
    ordering="NONE"
    side="CLIENT"
```

xxx部分是你的modid。由于mui只处理渲染有关的内容，我们将其设置为仅客户端。现在，我们就可以等待gradle重新加载好了。完成后，外部库中应该会出现这样几个库：

![img](/mui/1.png)

打开游戏，如果您发现您的界面上文字变为高清的字体了，那么就说明成功了。

注意，这时候如果我们打开mui库下的类，会看到idea提示代码为反编译的源码，让我们可以选择源。这时可以下载github上mui的源码：

[ModernUI](https://github.com/BloCamLimb/ModernUI)

[ModernUI-MC](https://github.com/BloCamLimb/ModernUI-MC)

两个都要下！


然后在idea中选择源，按住ctrl把两个都选中，导入即可。