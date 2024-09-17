---
description: 每次测试ui都要打开游戏，这多不方便，不是吗

writers:
  - AW-CRK14
---

# 在 Minecraft 中使用 ModernUI 的 UI 系统

在 ModernUI 中，一个 UI 界面的基本单位是 Fragment。为了方便表述，本文中将其统称为 **MUIFragment**（请注意，这个名字并非官方术语，仅用于本文）。

要打开一个 **MUIFragment**，需要使用 `icyllis.modernui.mc.ModernUIApi#openScreen` 方法。
此方法需要传入一个 `Fragment` 实例，要创建这个实例，您需要继承 `Fragment` 类并重写一些关键方法，其中最重要的是：

```java
public View onCreateView(LayoutInflater inflater, ViewGroup container, DataSet savedInstanceState) {
}
```

这个方法用于创建一个 `View`，即可视对象，包含您希望在界面中展示的所有元素。我们将在后续内容中详细讨论这些元素。

请注意，ModernUI 的 UI 系统在设计上与 Minecraft 原版的 UI 系统有较大差异。
由于本人了解有限，此处不做详细阐述。简单说明一点：该系统没有类似 `tick` 的方法，而是根据任务的需要执行相应操作。
因此，**如果您希望实现类似计时器的功能，您需要定期循环推送任务**。

**MUIFragment** 没有公共的关闭方法。如果您想创建一个按钮来关闭界面，可以使用如下代码：

```java
static {
    setOnCheckedChangeListener((button, id) ->
            Minecraft.getInstance().execute(
                    () -> Minecraft.getInstance().setScreen(null)
            ));
}
```

为了方便测试，您可以添加以下代码：

```java
public static void main(String[] args) {
    System.setProperty("java.awt.headless", "true");
    Configurator.setRootLevel(Level.DEBUG);

    try (ModernUI app = new ModernUI()) {
        app.run(); // 在这里传入您的 Fragment 实例
    }
    AudioManager.getInstance().close();
    System.gc();
}
```

这启动了一个专门的，适配MUI框架的窗口以展示渲染效果。
通过这种方式，您可以直接运行并测试 **MUIFragment** 的效果。
