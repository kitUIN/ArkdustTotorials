---
description: we need more 视图s！
---

# 视图组(ViewGroup)

安卓UI系统对视图组(ViewGroup)的描述是这样的：

> A ViewGroup is a special view that can contain other views (called children.) The view group is the base class for layouts and views containers. This class also defines the ViewGroup.LayoutParams class which serves as the base class for layouts parameters.
>
> 视图组(ViewGroup)是一种特殊的，可以存储其它视图(称为子视图)的视图。视图组是"布局"和"视图容器"的基类。此类中同样定义了LayoutParams类作为其它布局参数的基类。

简单来说，您可以将其理解为一组可以自动响应位置变化的一组视图。

## LayoutParams:

LayoutParams是用于控制线性布局中一个元素的相对位置的参数。其文件包位置为icyllis.modernui.widget.LinearLayout.LayoutParams。可以设置其在组中的相对位置范围，以及组的gravity。

setMargins与setMarginsRelative方法可以设置子组件的收缩或扩张(好像不能扩张)，四个值分别是原始位置相对于左，上，右，下边的收缩量。

## LinearLayout:

线性布局可以使内容排成一列，实现类似设置窗口等的效果。

设置排列方向：setOrientation可以设置布局方向，比如LinearLayout.VERTICAL可以设置为竖直布局，而LinearLayout. HORIZONTAL可以设置为水平布局。

设置元素间隔：setShowDividers可以设置哪些元素之间需要渲染间隔部分，一般包括以下几种：

```java
public static final int SHOW_DIVIDER_NONE = 0;
public static final int SHOW_DIVIDER_BEGINNING = 1;
public static final int SHOW_DIVIDER_MIDDLE = 2;
public static final int SHOW_DIVIDER_END = 4;
```

分别对应无间隔渲染，起始位置渲染，中间位置渲染，结束位置渲染。若要设置多个，请使用|符号连接。setDividerDrawable方法用于提供一个渲染间隔条的渲染器。

设置间隔与元素之间的距离：setDividerPadding方法可以设置每条间隔与元素之间的距离，单位是像素。

设置子view的相对位置：子元素在Group中的排列趋势可以通过设置Group的Gravity决定，使用setHorizontalGravity与setVerticalGravity可以引导子组件从某一方向开始排列。

```java
LinearLayout base = new LinearLayout(getContext());
base.setShowDividers(LinearLayout.SHOW_DIVIDER_NONE);
base.setOrientation(LinearLayout.VERTICAL);
base.setDividerPadding(base.dp(5));
 
RelativeLayout topLayout = new RelativeLayout(getContext());

//添加一些子View

topLayout.setBackground(withBorder());//测试用，设置view的背景。
base.setVerticalGravity(Gravity.BOTTOM); 
base.addView(topLayout);
```

这样我们的topLayout就会出现在base组件的底部了。

## RadioGroup:

RadioGroup是LinearLayout的子类，专门用于处理一组RadioButton，可以保证其对应的所有RadioButton中只有一个被选中或一个都没有被选中。使用addView与removeView来添加与删除元素。

选择一个元素：click方法可用于选择一个元素，其传入数值应为对应按钮的id。

清除元素选择：使用clearCheck方法可以将选择的元素重置到无选择状态。

特别的，RadioGroup中可以监听一个OnCheckedChange事件，用于处理被选择的按钮变化时需要进行的内容。

## Spinner:

Spinner是一类特殊的ViewGroup，用于打开一个下拉选择列表，并允许选择一个内容，常用于诸如选择城市，选择语言等。

下面是一段Spinner的代码示例，摘自MUI的测试页面代码：

```java
Spinner spinner = new Spinner(getContext());
v = spinner;
ArrayList<String> list = new ArrayList<>(FontFamily.getSystemFontMap().keySet());
list.sort(null);
spinner.setAdapter(new ArrayAdapter<>(getContext(), list));
p = new LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT,
        ViewGroup.LayoutParams.WRAP_CONTENT);
spinner.setMinimumWidth(dp(240));
```

这个示例创建了一个下拉栏，里面包含所有系统安装了的字体的名字。

## FragmentContainerView:

记得在Fragment阶段我们提到的“Fragment可以组合”吗？FragmentContainerView可以用来记录一个Fragment，并把它像View一样加载进其它ViewGroup中，加载整个Fragment。FragmentContainerView需要记录这个组件的id，因此您应当在Fragment中专门定义一个常量来帮助处理。就像这样：

```java
final int tabId = 0x200;//这地方随你搞
getChildFragmentManager().beginTransaction()
        .replace(tabId, MarkdownFragment.class, null, "markdown")
        .setTransition(FragmentTransaction.TRANSIT_FRAGMENT_OPEN)
        .setReorderingAllowed(true)
        .commit();

FragmentContainerView tabContainer = new FragmentContainerView(getContext());
tabContainer.setId(tabId);
base.addView(tabContainer);
```

这通常和按钮等功能结合，用于处理内部分页。您可以参考icyllis.modernui.mc.CenterFragment2下的代码，查看更多用法。
