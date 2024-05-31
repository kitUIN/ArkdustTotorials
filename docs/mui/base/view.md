---
description: 任务不来我就不动！

writers:
  - AW-CRK14
---


# 视图与文本视图(View/TextView)

对于什么是View，AndroidUI给出的解释是：

> A View occupies a rectangular area on the screen and is responsible for drawing and event handling.

> 一个视图(View)在屏幕上占据一块矩形区域，并可以对绘制与事件处理做出反应。

为了方便理解，我们将一个View拆解成三个部分：



## Where:视图在哪里

`View`首先可以决定其位置和大小，包括其在屏幕上的绝对位置或相对于父组件的位置。请注意，由于缩放原因，建议使用dp(int value)方法来将一个像素量缩放为实际位置再使用。

### 高度与宽度设置

`setWidth`与`setHeight`可以分别设置组件的宽度和高度。默认数值为0。如果有特殊需求，请参阅`ViewGroup`部分的[LayoutParams条目](/mui/base/viewgroup#LayoutParams)。

### 相对位置设置

`setX`与`setY`可以分别设置组件（左上角为基点）的相对位置。这个位置是上面提到的高宽度的两倍。也就是说，如果有一个方形的高度与宽度设置为10，位置x与y也均是10，这个方形的位置将是(20,20)至(30,30)。`setZ`用于控制组件间的遮挡关系。

### 缩放设置

`setScaleX`与`setScaleY`可以分别设置组件在轴上的相对缩放。缩放原点默认为组件的正中间。如果有边框，那么边框宽度也会跟着缩放，图片同理。

### 相对父组件位置设置\[存疑]

setTop/setButtom/setLeft/setRight原则上可以控制组件相对父组件的区域，但是实际使用中效果不理想。

### 设置固定大小

设置大小：`setSize`方法可以设置大小。

### 在方向上的额外增减量

`setPadding`方法的四个数值可以分别指定此视图在左，上，右，下四个方向上宽度的增加值。

`setPaddingRelative`则可以设置视图距离父组件的左，上，右，下四个方向的间距。

它们是额外的变化量，因此不会影响内容比如文字的内容的渲染。

### Gravity(重力)

相比于其它内容，`Gravity`这个名字比较抽象。大家可以把它想象为像重力一样，会使View向一边移动的东西。`Gravity`决定了组件在父组件中的对齐方式，比如靠左，靠上，居中等。

为了设置重力，您可以使用`setGravity`方法，其需要的参数可以在`Gravity`类下找到需要的常量。如果您要指定多个`Gravity`特征，比如水平居中且靠下，您应该使用" | "符号连接，例如：

```java
setGravity(Gravity.CENTER_HORIZONTAL | Gravity.BOTTOM);
```



## What:视图渲染什么

对于一个普通的`View`，渲染内容包括它的背景；如果这个`View`继承了`TextView`，那将可以额外渲染指定的文字——这些文字在默认情况下会被渲染在左上角。

### 设置背景

使用`setBackground`方法可以设置视图的背景，需要传入一个`Drawable`的实例。我们会在渲染部分讲到这些。

### 文字

#### 设置文字内容

`setText`方法可以设置其显示的文字。如果您需要让文字被翻译，请使用

```
I18n.get(String transKey);
```

#### 设置文字颜色与大小

`setTextColor`可以设置文字颜色。提交的数值为一个x16数，可以在`icyllis.arc3d.core.Color`中找到预定义的颜色数值。`setTextSize`可以设置文件大小。

#### 设置提示（ToolTip）

`setTooltipText`可以为其添加一个`tooltip`，在鼠标放置在其上方一段时间后显示。

#### 文字对齐

当此组件的大小被强制设定大小后，文字会倾向于在左侧显示。

设置文字专门对齐方式：`setTextAlignment`可以设置文字对齐，比如左侧对齐，右侧对齐，居中等。内容可以在TEXT\_ALIGNMENT\_xxx找到。

Hint对应的内容是文本内容为空时的内容，常用于文本编辑框功能。用法与text类似。



## How:视图如何处理交互

### 监听器

监听器(Listener)用于处理这个对象在活跃时的一系列操作。在idea中输入Listener可以帮助你找到一系列监听器的处理方法。对于一个监听器，一般可以用以下代码来创建一个lambda表达式：

```java
Func n = (view, motionEvent)-> {};
```

其中前者view是本组件，而后者是监听到的活动。可以通过`getAction`方法获取到对应的操作类型的索引编号，这些编号的对应值可以在`MotionEvent`类下找到。

如果一个监听器监听的类型与尝试匹配的`MotionEvent`不相符，这个listener将不会被触发。比如，一个OnTouchListener中获取到的action index不会是MotionEvent.ACTION\_HOVER\_MOVE对应的值。

返回值表示这个监听器是否被消费。如果已被消费，其它没有执行的同种Listener将不会继续执行。

一些特殊的类可能提供一些特别的监听器，比如`RadioButton`提供了当按钮选择状态变化的监听器。

监听器的触发需要一些额外的预定义条件，比如说用`setFocusable(true)`或`setClickable(true)`等方法来设置能否被聚焦，能否被点击等。

### 推送

MUI系统并没有提供tick或类似的功能。如果我们需要定期执行一项任务，可以使用`postDelayed`。

post方法用于向总线提交一个可执行目标(Runnable)，这些内容将在对应的线上执行以防止出现错误。`PostDelayed`方法在此基础上提供了一个int参数用于表示执行延迟(单位：毫秒)，总线将在提交后指定时间执行目标。

在目标中重复调用`postDelayed`方法以达成周期循环目的。例如：

```java
Func runnable = ()-> {
    ticker += flag ? 1 : -1;
    ticker = Math.clamp(0, 20, ticker);
    postDelayed(runnable,50);
};

void inSomeMethod(){
    postDelayed(runnable,50);
}
```

这样每50毫秒将会执行一次，也就是每秒二十次，类似原有的tick方法。

`revomeCallbacks`方法可以将一个提交了且尚未执行的`Runnable`取消。



## 常用子类

`Button`与其子类主要启用了点击交互等功能，为按钮。

`ImageView`用于在位置创建一个渲染图片的组件。要获取到一个`Image`实例，可以使用`Image.get(String namespace,String path)`方法。

`TextView`用于在位置创建一个渲染文字的组件。

`EditText`用于创造一个可编辑的文本框。

`CheckBox`用于创造一个复选框。

`Spinner`用于创造一个下拉式选择栏。

`SwitchButton`用于创造一个可展开式栏。参考代码：

```java
void someMethod(){
    SwitchButton switchButton = new SwitchButton(getContext());
    v = switchButton;
    switchButton.setOnCheckedChangeListener((button, checked) -> {
        if (checked) {
            button.post(() -> addView(mTextView, 2));
        } else {
            button.post(() -> removeView(mTextView));
        }
    });
}
```

`SeekBar`用于创造一个可拖动的滑动条。