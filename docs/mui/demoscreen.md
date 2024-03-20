---
description: 每次测试ui都要打开游戏，这多不方便，不是吗

writers:
  - AW-CRK14
---


# 在mc中使用Mui的UI系统

Mui中，一个UI界面的基本单位是Fragment。为了方便表述，在下文中，我会将它们统称为FUI（这个名字不是一个官方的称呼，因此不要到其它地方使用这个名字。）

如果需要打开一个FUI，需要使用

```java
icyllis.modernui.mc.MuiModApi#openScreen
```

这个方法需要传入一个Fragment实例，创建这个实例你需要继承Fragment类并覆写一些方法，其中最重要的是

```java
public View onCreateView(LayoutInflater flater, ViewGroup container, DataSet savedInstanceState)
```

方法，这个方法用于创建一个View，也就是可视对象，包含你需要打开的FUI中的所有元素。我们会在之后提及。

值得注意的是，Mui的UI系统与MC原版的UI系统在设计上有较大的差异，这一部分由于本人并没有深入了解过AndroidUI，所以不在此详细阐述，只是点出一点：这套系统没有类似tick的方法，只会在有任务的时候执行相应任务。因此，如果您想实现类似计时器之类的与时间有关的功能，您应当固定周期地循环推送任务。

FUI没有公用的关闭方法。如果您想创造一个按钮来关闭界面，应使用

```java
setOnCheckedChangeListener((button,id)-> {
    Minecraft.getInstance().execute(()->Minecraft.getInstance().setScreen(null));
});
```

为了更方便地测试FUI，您可以添加以下内容：

```java
public static void main(String[] args) {
    System.setProperty("java.awt.headless", "true");
    Configurator.setRootLevel(Level.DEBUG);

    try (ModernUI app = new ModernUI()) {
        app.run();//这里传入你的Fragment实例
    }
    AudioManager.getInstance().close();
    System.gc();
}
```

这样就可以直接运行出FUI的测试窗口了。