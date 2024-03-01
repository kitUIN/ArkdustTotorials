---
description: 价值20大洋！
writers:
- AW-CRK14
---

# 多模块

让我们来假定一个场景：

> 现在，有一位bugger开发了一个模组，包含了一套全新的天气系统与一些为专用维度添加的天气。他认为可能别人也会想要使用这套天气系统，于是准备将其独立出来变成一个单独的前置mod，使其它开发者也可以使用他造的轮子。  
但现在他碰到了一个问题：要将这个前置模组和模组本体一起进行开发。准确来说，他打算在模组的后续开发过程中，轮子全部造在前置模组中，而具体功能放在模组本体内。让我们假定前置模组为D，本体模组为M：  
首先，添加一个新的系统，如果需要在D中完成代码，打包，复制到M模组下，在M模组内调试然后修改D的代码，这样显然是过于麻烦了。有没有办法在保持D与M作为模组的独立性的情况下，直接在M中引用D的代码呢？
这便是我们需要多模块的原因。另外，这个bugger其实是我。

本篇参考了[红石计划(ProjectRed)](https://www.mcmod.cn/class/164.html)的多模块配置思路，由于版本的改动，其配置不能直接使用。在mouse0w0@github大佬和AnECanSaiTin@github大佬的帮助下进行了高版本适配，完成本教程。

## 多模块结构

我们要先来了解一下多模块的结构，这有助于我们理解其运作。

首先，我们需要一个gradle根模块。这个根模块用于管理整个项目中所有gradle子模块，方便我们实现各个模块之间的交互。

在根模块下，我们可以部署多个gradle子模块。由于我们是要开发多个mod，在这里我们可以部署多个neoforgeMDK，这在之后我们会提到。
:::tip TIP
如果您安装了MinecraftDevelopment插件，您可以直接在新建模块中选择此项目快速生成一份MDK。但您可能需要注意neoforge小版本问题与插件版本问题。
![clash](/extra/multi_module_tip.png)
:::
最后我们还需要一个运行模块，用于集中启动我们所有的子模块模组。让我们一步步来：

新建一个项目作为我们的根模块:
![clash](/extra/multi_module_1.png)
在这个模块下，我们不需要配置代码，因此可以直接删掉src。接下来我们创建前置模组D与本体模组M，以及一个Runtime模块，这个模块内只需要一个build.gradle即可。现在，它们应该长这样：
![clash](/extra/multi_module_2.png)
> [!IMPORTANT]
> 如果您连续创建了两个模组模块并发现其中一个的gradle出现了报错，请不必疑惑，等待另一个的gradle加载完成后再刷新gradle即可。

接下来我们将新建的模块导入根目录中。打开根目录的setting.gradle文件,在最顶部添加模组插件配置(直接复制模组模块中setting.gradle的全部内容)，下方再用include添加进你的子模块。子模块下的setting都可以删掉了:
```groovy
pluginManagement {
    repositories {
        mavenLocal()
        gradlePluginPortal()
        maven { url = 'https://maven.neoforged.net/releases' }
    }
}

plugins {
    id 'org.gradle.toolchains.foojay-resolver-convention' version '0.5.0'
}

rootProject.name = 'MuiltModule'

include 'Main'
include 'Dependence'
include 'Runtime'
```

然后是runtime的build.gradle，我们主要是添加了新的模组资源路径，删除了限定模组调试，以及添加了运行时的模组附加，以后启动游戏就使用这个runtime即可:
```groovy
plugins {
    id 'java-library'
    id 'eclipse'
    id 'idea'
    id 'maven-publish'
    id 'net.neoforged.gradle.userdev' version '7.0.74'
}

java.toolchain.languageVersion = JavaLanguageVersion.of(17)

runs {
    configureEach {
        systemProperty 'forge.logging.markers', 'REGISTRIES'
        systemProperty 'forge.logging.console.level', 'debug'

        modSource project(":Dependence").sourceSets.main
        modSource project(":Main").sourceSets.main
    }

    client {
    }

    server {
        programArgument '--nogui'
    }

    gameTestServer {
    }

    data {
    }
}

sourceSets.main.resources {
    srcDir 'Main/src/generated/resources'
    srcDir 'Dependence/src/generated/resources'
}


dependencies {
    implementation "net.neoforged:neoforge:${neo_version}"

    runtimeOnly project(":Dependence")
    runtimeOnly project(":Main")
}
```

您也可以根据需求删改两个模组模块的内容。这是一个Main模块的修改示例，注意标蓝的位置导入的内容:
![clash](/extra/multi_module_3.png)

在完成这些配置后，就可以开始我们愉快的gradle清理环节。把根模块和子模块都刷新一遍(如果有问题就先把buildNeeds buildDependency build都点一遍)，再把idea捣鼓出来的多余的gradle任务删掉。

最后来测试一下，在Dependence里面起个Test记录:
![clash](/extra/multi_module_4.png)
然后在Main里调用:
![clash](/extra/multi_module_5.png)
最后 把runtime的Client跑起来。

![clash](/extra/multi_module_6.png)
![clash](/extra/multi_module_7.png)
好啊 很好啊(赞赏)