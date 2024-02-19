---
description: 需要准备：idea github账号 java17 梯子 和亿点点时间
---

# 开发环境配置

为了开发一个mod，首先我们需要配置mod的开发环境。Neoforge 1.20.4 mod应使用java17。

## 准备Idea

首先我们下载idea，如果没有特殊需求可以选择社区版，这是免费的且包含大部分我们需要的功能。如果您有财力，希望您能支持idea的专业版。idea的下载链接可以在这里找到：

{% embed url="https://www.jetbrains.com/zh-cn/idea/download/?section=windows" %}
idea下载链接
{% endembed %}

接下来我们需要在github上拉取Neoforge的MDK，也就是我们需要的开发套件。进入下面的网站：

{% embed url="https://github.com/neoforged/MDK" %}

## 准备Clash

如果您有配置好的梯子，可以跳过这一步。本教程不提供Clash与机场的下载链接，请自行查找。

在Clash中，我们需要打开这些选项：

<figure><img src=".gitbook/assets/image (13).png" alt=""><figcaption></figcaption></figure>

在代理中，选择规则模式。其它梯子，如ClashVerge或机场的专用客户端同理，打开有关“服务” “TUN” “混合(Mixin)” “系统代理"有关的开关，并在代理模式中选择规则代理。

## 准备NeoforgedMDK

### 方式一：从github上拉取带有版本控制的MDK

在登录了github账户后（在右上角登录或注册），我们可以看到这里有一个绿色的按钮：

<figure><img src=".gitbook/assets/image.png" alt=""><figcaption></figcaption></figure>

点击，选择Create a new responsitory，将MDK克隆一份到我们自己的github库。在这里可以填入您的项目名称。一般命名的规则是：全英文，单词首字母大写。

<figure><img src=".gitbook/assets/image (1).png" alt=""><figcaption></figcaption></figure>

最后点击下方的绿色按钮，我们就可以在个人github仓库中找到刚刚克隆的MDK了。

接下来我们需要把项目拉取到本地。打开idea，选择新建->来自版本控制（注意：这一步需要用到git。如果您没有git可以选择idea的自动安装）

<figure><img src=".gitbook/assets/image (2).png" alt=""><figcaption><p>大概就是在这里</p></figcaption></figure>

然后在左侧选择github，登录您的github账户，再在右侧选择刚刚克隆的仓库，点击克隆：

<figure><img src=".gitbook/assets/image (5).png" alt=""><figcaption></figcaption></figure>

就可以将项目拉取到本地了。

### 方式二：直接下载MDK

如果您认为不需要将自己的mod推送到github而只进行本地开发，那么这种方法或许更适合您。不过不用担心，一个已经创建了的项目可以主动推送至github并创建仓库，而您可以随时完成这一过程。

首先我们仍然要进入NeoforgedMDK，但这一次我们选择直接下载：

<figure><img src=".gitbook/assets/image (6).png" alt=""><figcaption></figcaption></figure>

将zip文件下载到本地后，解压到您认为合适的路径。之后打开idea，选择"打开"，找到我们刚刚解压出的文件夹，选择确认，将项目导入idea。

<figure><img src=".gitbook/assets/image (7).png" alt=""><figcaption><p>比如说，这个？好吧，只是做一个在idea里打开项目的示范</p></figcaption></figure>

在打开项目后，如果您的位置正确，那么您将看到右下角出现这样的内容：

<figure><img src=".gitbook/assets/image (8).png" alt=""><figcaption><p>会很慢</p></figcaption></figure>

如果选择了父文件夹，那您可能在右下角看到这样的内容：

<figure><img src=".gitbook/assets/image (9).png" alt=""><figcaption><p>只是一个示范，您的项目大概不叫这个名字</p></figcaption></figure>

点击加载即可。

### 注意：配置项目JDK

不要忘记将项目JDK选择为java17！

<figure><img src=".gitbook/assets/image (11).png" alt=""><figcaption></figcaption></figure>

<figure><img src=".gitbook/assets/image (12).png" alt=""><figcaption></figcaption></figure>

## 运行Gradle任务

打开build.gradle文件，在repositories处添加以下内容：

<figure><img src=".gitbook/assets/image (14).png" alt=""><figcaption></figcaption></figure>

```
maven {
    url "https://mvn.cloud.alipay.com/nexus/content/repositories/open/"
}

maven{
    url 'https://maven.aliyun.com/nexus/content/groups/public/'
}

maven {
    url 'https://maven.aliyun.com/nexus/content/repositories/google'
}
```

然后点击右侧的小象打开gradle任务面板并重新加载gradle（注：我这里的截图已经完成了环境构建。在您的视图中，应该没有下面的一众任务选项）：

<figure><img src=".gitbook/assets/image (15).png" alt=""><figcaption></figcaption></figure>

然后就可以等待gradle下载了。注意：这一过程可能比较缓慢且容易报错，如果报错就重复上述方法。正常情况下，只要网络正常，不会出现一直在同一个地方报错。

等待“构建”栏目显示“已完成”并变成绿色的勾（或者警告标识但是没有报错）：

<figure><img src=".gitbook/assets/image (16).png" alt=""><figcaption></figcaption></figure>

这时您的gradle面板中应该出现了上上图中我右侧的这些任务。选择此项目，双击执行：

<figure><img src=".gitbook/assets/image (17).png" alt=""><figcaption></figcaption></figure>

此时idea将会开始自动补齐游戏文件。这一过程又会花费比较多的时间。等待直到弹出游戏窗口，环境配置就算完成了。
