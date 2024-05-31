---
description: we need more 视图s！

writers:
  - AW-CRK14
---


# 视图组(ViewGroup)

安卓UI系统对视图组(ViewGroup)的描述是这样的：

> A ViewGroup is a special view that can contain other views (called children.) The view group is the base class for layouts and views containers. This class also defines the ViewGroup.LayoutParams class which serves as the base class for layouts parameters.
>
> 视图组(ViewGroup)是一种特殊的，可以存储其它视图(称为子视图)的视图。视图组是"布局"和"视图容器"的基类。此类中同样定义了LayoutParams类作为其它布局参数的基类。

简单来说，您可以将其理解为一组可以自动响应位置变化的一组视图。

## LayoutParams

`LayoutParams`是用于控制线性布局中一个元素的相对位置的参数。其文件包位置为`icyllis.modernui.widget.LinearLayout.LayoutParams`。可以设置其在组中的相对位置范围，以及组的gravity。

`setMargins`与`setMarginsRelative`方法可以设置子组件的收缩或扩张(好像不能扩张)，四个值分别是原始位置相对于左，上，右，下边的收缩量。

`addRule`方法可以为目标配置布局相关性关系，使用多个`addRule`方法以添加多个关系。

## RelativeLayout

关系布局是一种比较自由的布局，可以指定一个子视图在布局中的相对位置，也可以设置其对齐规则。对于其位置的调整，我们可以使用`setX``setY`或者在`LayoutParams`里使用`setMarginsRelative`方法实现。不过，二者的效果并不完全相同，[前者在实际使用中具有二倍特性](view.md#相对位置设置)。因此，我建议您使用后者

::: warning :warning: 注意：
需要注意的是，`RelativeLayout`使用的对齐规则与常用的`Gravity`存在差异。为了实现对齐效果，我们需要创建一个`RelativeLayout.LayoutParams`实例，然后使用`addRule`方法添加对齐规则。规则可以`RelativeLayout`类下的常量处找到。比如，我们想使一个视图布局在右上角，我们可以创建这样一个params：

```java
void a(){
    RelativeLayout.LayoutParams params = new RelativeLayout.LayoutParams(group.dp(20),group.dp(20));
    params.addRule(RelativeLayout.ALIGN_PARENT_RIGHT);//与父对象右侧对齐，类似于Gravity.RIGHT。
    params.addRule(RelativeLayout.CENTER_VERTICAL);//在父对象竖直方向上居中。
}
```

请注意，`ALIGN_PARENT_RIGHT`会倾向于使组件的位置尽可能右，因此可能会导致在横向布局参数被设置为-2(`WARP_CONTENT`)的时候整个布局拉的很长。在这时，您或许需要考虑使用`RelativeLayout.ALIGN_RIGHT`

若想保持两个子组件在一个向左对齐，一个向右对齐且在压缩状态下不相互叠合，需要为右侧的一个设置`RelativeLayout.RIGHT_OF`或为左侧的设置`RelativeLayout.LEFT_OF`。请保证不出现循环依赖，这将导致问题。
:::

再在加入父group时传入params即可。

## LinearLayout

线性布局可以使内容排成一列，实现类似设置窗口等的效果。

设置排列方向：`setOrientation`可以设置布局方向，比如`LinearLayout.VERTICAL`可以设置为竖直布局，而`LinearLayout.HORIZONTAL`可以设置为水平布局。

设置元素间隔：`setShowDividers`可以设置哪些元素之间需要渲染间隔部分，一般包括以下几种：

```java
public static final int SHOW_DIVIDER_NONE = 0;
public static final int SHOW_DIVIDER_BEGINNING = 1;
public static final int SHOW_DIVIDER_MIDDLE = 2;
public static final int SHOW_DIVIDER_END = 4;
```

分别对应无间隔渲染，起始位置渲染，中间位置渲染，结束位置渲染。若要设置多个，请使用|符号连接。`setDividerDrawable`方法用于提供一个渲染间隔条的渲染器。

`setDividerPadding`方法可以设置分隔线在相应方向上的拓展距离。

设置子view的相对位置：子元素在`Group`中的排列趋势可以通过设置`Group`的`Gravity`决定，使用`setHorizontalGravity`与`setVerticalGravity`可以引导子组件从某一方向开始排列。

```java
void a(){
    LinearLayout base = new LinearLayout(getContext());
    base.setShowDividers(LinearLayout.SHOW_DIVIDER_NONE);
    base.setOrientation(LinearLayout.VERTICAL);
    base.setDividerPadding(base.dp(5));

    RelativeLayout topLayout = new RelativeLayout(getContext());

    //添加一些子View

    topLayout.setBackground(withBorder());//测试用，设置view的背景。
    base.setVerticalGravity(Gravity.BOTTOM);
    base.addView(topLayout);
}
```

这样我们的`topLayout`就会出现在`base`组件的底部了。

## RadioGroup

`RadioGroup`是`LinearLayout`的子类，专门用于处理一组`RadioButton`，可以保证其对应的所有`RadioButton`中只有一个被选中或一个都没有被选中。使用`addView`与`removeView`来添加与删除元素。

选择一个元素：`click`方法可用于选择一个元素，其传入数值应为对应按钮的id。

清除元素选择：使用`clearCheck`方法可以将选择的元素重置到无选择状态。

特别的，`RadioGroup`中可以监听一个`OnCheckedChange`事件，用于处理被选择的按钮变化时需要进行的内容。

## Spinner

`Spinner`是一类特殊的`ViewGroup`，用于打开一个下拉选择列表，并允许选择一个内容，常用于诸如选择城市，选择语言等。

下面是一段`Spinner`的代码示例，摘自MUI的测试页面代码：

```java
void a(){
    Spinner spinner = new Spinner(getContext());
    v = spinner;
    ArrayList<String> list = new ArrayList<>(FontFamily.getSystemFontMap().keySet());
    list.sort(null);
    spinner.setAdapter(new ArrayAdapter<>(getContext(), list));
    p = new LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT);
    spinner.setMinimumWidth(dp(240));
}
```

这个示例创建了一个下拉栏，里面包含所有系统安装了的字体的名字。

## FragmentContainerView

记得在`Fragment`阶段我们提到的“Fragment可以组合”吗？`FragmentContainerView`可以用来记录一个`Fragment`，并把它像`View`一样加载进其它`ViewGroup`中，加载整个`Fragment`。`FragmentContainerView`需要记录这个组件的`id`，因此您应当在`Fragment`中专门定义一个常量来帮助处理。就像这样：

```java
void a(){
    final int tabId = 0x200;//这地方随你搞
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

这通常和按钮等功能结合，用于处理内部分页。您可以参考`icyllis.modernui.mc.CenterFragment2`下的代码，查看更多用法。