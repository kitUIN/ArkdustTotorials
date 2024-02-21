# 片段(Fragment)

片段Fragment，在AndroidUI系统中，被解释为：

> A Fragment represents a behavior or a portion of user interface in an Activity. You can combine multiple fragments in a single activity to build a multi-pane UI and reuse a fragment in multiple activities. You can think of a fragment as a modular section of an activity, which has its own lifecycle, receives its own input events, and which you can add or remove while the activity is running.
>
> 片段(Fragment)代表一个活动(Activity)中的行为或用户交互的一部分。你可以将多个片段结合进一个活动中以创建一个多窗格UI，并在多种活动中复用一个片段。你可以将片段想象为一种活动的可选模块化组成部分，它拥有自己独立的生命周期，处理自己的输入事件，并且可以在活动运行的过程中加入或移除。

当然，在MUI中，您也可以将其简单理解为一种特殊的屏幕(Screen)(虽然二者其实并不一样)，一种可以嵌套的，功能更强大的屏幕。

为了创建一个Fragment，我们需要继承icyllis.modernui.fragment.Fragment类。其中最重要的方法是

```java
View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                         @Nullable DataSet savedInstanceState) 
```

这个方法将创建一个视图(View)。一个可交互的组件（即使被设置为不可交互模式）都是一个视图，比如按钮组件，文本组件，图片组件等，都可以被渲染，当然你也可以使其不被渲染，我们会在下一节介绍这些。返回一个新的组件，比如一个没有任何特殊特点的按钮都是可以的，但显然我们更希望一个界面上能有多个不同的组件。因此，您可以根据需求，传入一个继承了ViewGroup的视图，它可以包含多个按一定规则排列的视图，具体使用请继续往下看。

Fragment下还有很多其它可以覆写的方法，比如onAttach，onCreate等在生命周期特定阶段可以触发的事件。在这些事件中，您可以使用getChildFragmentManager或getParentFragmentManager来获取子/父组件的管理器，进而实现组件的增减与转换。比如，这里给出一段代码：

```java
//摘自CenterFragment2类
@Override
public void onCreate(@Nullable DataSet savedInstanceState) {
    super.onCreate(savedInstanceState);
    getChildFragmentManager().beginTransaction()
            .replace(id_tab_container, DashboardFragment.class, null, "dashboard")
            .setTransition(FragmentTransaction.TRANSIT_FRAGMENT_OPEN)
            .setReorderingAllowed(true)
            .commit();
}
```

您可以参考MUI制作的几个UI界面来学习如何使用这些Fragment，比如类icyllis.modernui.mc.CenterFragment2与icyllis.modernui.TestFragment