---
writers:
  - AW-CRK14
---

# 片段 (Fragment)

在 Android UI 系统中，Fragment 的定义是：

> 一个 Fragment 代表活动 (Activity)中的行为或用户界面的一个部分。
> 您可以在一个活动中组合多个片段来构建多窗格的用户界面，并在多个活动中复用一个片段。
> 可以将片段视为活动的一个模块化部分，它具有自己的生命周期，处理自己的输入事件，并且可以在活动运行时动态添加或移除。

在 ModernUI 中，您可以将 `Fragment` 简单地理解为一种特殊类型的屏幕（`Screen`），尽管两者并不完全相同。
`Fragment`是一种功能更强大且可以嵌套的屏幕组件。

要创建一个 Fragment，您需要继承 `icyllis.modernui.fragment.Fragment` 类。关键方法是：

```java
public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                         @Nullable DataSet savedInstanceState) {
}
```

此方法用于创建一个视图（`View`）。**在这个方法内，您将完成主要内容的创建**。
视图是所有可交互组件的基础，它们都可以在恰当的条件下被渲染。这是我们可以自由选择的，我们将在后续章节详细讨论。

通常，您会返回一个视图，例如一个基本的按钮，虽然实际使用中，您可能希望在一个界面上展示多个不同的组件。
因此，您可以根据需要返回一个继承了`ViewGroup`的视图，它可以容纳并管理多个视图组件。具体实现请继续阅读后续内容。

在 `Fragment` 中，还有许多其他可重写的方法，例如 `onAttach` 和 `onCreate`
，这些方法在生命周期的特定阶段被触发。在这些事件中，您可以使用 `getChildFragmentManager` 或 `getParentFragmentManager`
来获取子组件或父组件的管理器，以实现组件的动态添加、移除和切换。例如，以下是一个示例代码：

```java
// 示例代码摘自 CenterFragment2 类
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

您可以参考 ModernUI 提供的一些示例 UI 界面来学习如何使用这些 Fragment，例如 `icyllis.modernui.mc.CenterFragment2`
和 `icyllis.modernui.TestFragment` 类。
