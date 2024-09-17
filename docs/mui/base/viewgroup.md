---
description: we need more 视图s！

writers:
  - AW-CRK14
---


# 视图组 (ViewGroup)

在 Android UI 系统中，视图组 (`ViewGroup`) 的描述如下：

> 视图组 (`ViewGroup`) 是一种特殊的视图，它可以包含其他视图（称为子视图）。视图组是“布局”和“视图容器”的基类。该类还定义了 `ViewGroup.LayoutParams` 类，作为其他布局参数的基类。

简单来说，视图组可以看作是一个容器，用于存放并管理一组视图。它能够自动处理视图的相对位置和布局。

## LayoutParams

`LayoutParams` 用于控制线性布局中元素的相对位置。它的类路径为 `icyllis.modernui.widget.LinearLayout.LayoutParams`。通过 `LayoutParams` 可以设置子视图在组中的位置范围及布局的重力属性。

- **设置边距**：使用 `setMargins` 和 `setMarginsRelative` 方法可以设置子组件的边距。`setMargins` 设置的是固定的边距，而 `setMarginsRelative` 可以设置相对于视图的起始和结束边距。

- **添加布局规则**：使用 `addRule` 方法可以为目标视图配置布局关系。可以使用多个 `addRule` 方法来添加多个布局规则。

## RelativeLayout

`RelativeLayout` 是一种灵活的布局方式，可以指定子视图在布局中的相对位置和对齐规则。可以通过 `setX` 和 `setY` 方法来调整视图的位置，但这些方法的效果可能与 `LayoutParams` 中的 `setMarginsRelative` 不完全相同，建议使用 `LayoutParams` 进行布局设置。

`RelativeLayout` 的对齐规则与 `Gravity` 略有不同。为了实现对齐效果，需要创建一个 `RelativeLayout.LayoutParams` 实例，并使用 `addRule` 方法添加对齐规则。这些规则可以在 `RelativeLayout` 类下找到。例如，如果希望将一个视图布局在右上角，可以创建如下的参数：

```java
void initLayout(){
    RelativeLayout.LayoutParams params = new RelativeLayout.LayoutParams(group.dp(20), group.dp(20));
    params.addRule(RelativeLayout.ALIGN_PARENT_RIGHT); // 与父视图右侧对齐，类似于 Gravity.RIGHT。
    params.addRule(RelativeLayout.CENTER_VERTICAL); // 在父视图的竖直方向上居中。
}
```

请注意，`ALIGN_PARENT_RIGHT` 可能会导致组件在横向布局参数设置为 `-2`（`WARP_CONTENT`）时拉伸过长。在这种情况下，可以考虑使用 `RelativeLayout.ALIGN_RIGHT`。

要保持两个子视图在一个向左对齐，另一个向右对齐且在压缩状态下不重叠，需要设置 `RelativeLayout.RIGHT_OF` 或 `RelativeLayout.LEFT_OF`。请确保避免循环依赖，这可能导致布局问题。

::: warning :warning: 注意
在使用 `RelativeLayout.RIGHT_OF`、`RelativeLayout.ALIGN_RIGHT` 等布局约束时，需要指定相关目标。例如，若要将视图 `b` 放置在视图 `a` 的右侧，并避免与视图 `c` 重叠，可以这样设置：

```java
void onCreateView(){
    RelativeLayout a = new RelativeLayout(getContext());
    View b = new View(getContext());
    View c = new View(getContext());

    a.setId(20001); // 设置唯一的 ID
    c.setId(20002); // 设置唯一的 ID

    RelativeLayout.LayoutParams params = new RelativeLayout.LayoutParams(-2, -2); // 大小包围内容
    params.addRule(RelativeLayout.ALIGN_RIGHT, 20001); // 设置与 ID 为 20001 的组件右侧对齐
    params.addRule(RelativeLayout.RIGHT_OF, 20002); // 设置排布在 ID 为 20002 的组件右侧

    a.addView(b, params);
}
```

注意，使用 `RelativeLayout` 时，父视图不会自动扩展其范围（即使设置为 `WARP_CONTENT`）。需要手动调整父视图的大小以适应子视图。

:::

## LinearLayout

`LinearLayout` 允许将视图按列或行排列，类似于设置窗口等效果。

- **设置排列方向**：使用 `setOrientation` 方法可以设置布局方向。例如，`LinearLayout.VERTICAL` 设置为垂直布局，而 `LinearLayout.HORIZONTAL` 设置为水平布局。

- **设置元素间隔**：使用 `setShowDividers` 方法可以设置哪些元素之间需要渲染间隔部分。常见的设置包括：

    ```java
    public static final int SHOW_DIVIDER_NONE = 0;
    public static final int SHOW_DIVIDER_BEGINNING = 1;
    public static final int SHOW_DIVIDER_MIDDLE = 2;
    public static final int SHOW_DIVIDER_END = 4;
    ```

  这四种设置分别对应无间隔、起始位置间隔、中间位置间隔和结束位置间隔。可以使用 `|` 符号连接多个设置。`setDividerDrawable` 方法用于提供一个渲染间隔条的 drawable。

- **设置分隔线的内边距**：使用 `setDividerPadding` 方法可以设置分隔线在方向上的拓展距离。

- **设置子视图的相对位置**：使用 `setHorizontalGravity` 和 `setVerticalGravity` 方法可以设置子视图从某一方向开始排列。例如：

    ```java
    void a(){
        LinearLayout base = new LinearLayout(getContext());
        base.setShowDividers(LinearLayout.SHOW_DIVIDER_NONE);
        base.setOrientation(LinearLayout.VERTICAL);
        base.setDividerPadding(base.dp(5));

        RelativeLayout topLayout = new RelativeLayout(getContext());

        // 添加一些子视图

        topLayout.setBackground(withBorder()); // 设置背景
        base.setVerticalGravity(Gravity.BOTTOM);
        base.addView(topLayout);
    }
    ```

  这样 `topLayout` 将出现在 `base` 组件的底部。

## RadioGroup

`RadioGroup` 是 `LinearLayout` 的子类，专门用于处理一组 `RadioButton`，确保在所有 `RadioButton` 中只能选择一个（或者一个都没有选择）。

- **选择一个元素**：使用 `click` 方法选择一个元素，其参数应为按钮的 ID。

- **清除选择**：使用 `clearCheck` 方法可以将选中的按钮重置为无选择状态。

- **监听选中变化**：可以设置 `OnCheckedChange` 事件监听器，以处理按钮选择变化时的操作。

## Spinner

`Spinner` 是一种特殊的 `ViewGroup`，用于显示下拉选择列表，并允许选择一个选项。常用于选择城市、语言等。

示例代码：

```java
void a(){
    Spinner spinner = new Spinner(getContext());
    v = spinner;
    ArrayList<String> list = new ArrayList<>(FontFamily.getSystemFontMap().keySet());
    list.sort(null);
    spinner.setAdapter(new ArrayAdapter<>(getContext(), list));
    p = new LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
    spinner.setMinimumWidth(dp(240));
}
```

这段代码创建了一个下拉选择框，其中包含所有系统安装的字体名称。

## FragmentContainerView

`FragmentContainerView` 用于管理和显示 `Fragment`，可以像视图一样加载到其他 `ViewGroup` 中。您需要为 `FragmentContainerView` 设置一个唯一的 ID，以便在 `Fragment` 中引用。

示例代码：

```java
void replace(){
    final int tabId = 0x200; // 设定唯一 ID
    getChildFragmentManager().beginTransaction()
            .replace(tabId, MarkdownFragment.class, null, "markdown")
            .setTransition(FragmentTransaction.TRANSIT_FRAGMENT_OPEN)
            .setReorderingAllowed(true)
            .commit();

    FragmentContainerView tabContainer = new FragmentContainerView(getContext());
    tabContainer.setId(tabId);
    base.addView(tabContainer);
}
```

这段代码结合按钮功能，实现了内部分页的功能。更多用法可以参考 `icyllis.modernui.mc.CenterFragment2` 下的代码。