# 渲染(Render)

`Render`渲染是程序为用户在屏幕上展示可视化内容的过程。在mui系统中，大部分渲染由`onDraw`方法进行，而`Drawable`类则是用于向画布（Canvas）上添加新的内容。对于一些常用的渲染，mui已经提供了`Drawable`的子类。

对于一个`View`，可以使用`setBackground`设置其渲染。特别的，对于`CompoundButton`，可以使用`setButtonDrawable`来设置其额外渲染，但我目前还没有测试出其有什么用。

## Drawable

> A Drawable is a general abstraction for “something that can be drawn.” Most often you will deal with Drawable as the type of resource retrieved for drawing things to the screen; the Drawable class provides a generic API for dealing with an underlying visual resource that may take a variety of forms. Unlike a View, a Drawable does not have any facility to receive events or otherwise interact with the user

> 一个可渲染目标(Drawable)是一个"可以被绘制的东西"的抽象父类。大多数时候，您会将其用于检索资源并绘制到屏幕上。可渲染目标类提供了一个通用的接口，用于处理多种形式的底层视觉资源（注：比如说，图片，纯色，线框）。与视图(View)不同，一个可渲染目标不具有任何可以接受事件或着说用户输入的方法（注：动画效果除外）。

### ColorDrawable

在创建一个`ColorDrawable`实例时，通过传入一个colorInt，可以设置这个`ColorDrawable`的颜色。

颜色混合模式选择：`setTintBlendMode`方法可以设置混合的模式。具体的可选项可以打开`icyllis.modernui.graphics.BlendMode`类自行查看。

设置边界：使用`setBounds`方法可以设置画布的渲染范围的边界。两组坐标分别是其在画布上位置的起始点与结束点。

::: warning :warning: 注意
实际测试中并没有表现出符合预期的效果，这或许需要主动推送到画布上时才能生效
:::

热点：hotspot用于设置渲染热点，可以辅助实现一些与点击位置有关的ui特效。

### ShapeDrawable

`ShapeDrawable`用于在位置绘制指定形状的图案。

::: danger :no_entry: 特别注意
在配置一个`ShapeDrawable`时，请注意调用`setUseLevelForShape(false)`，否则图形可能无法被渲染。
:::

设置形状：`setShape`方法可以传入一个形状的索引编号，可用的编号常量可以在`ShapeDrawable`下找到。对于一个圆形，其将被绘制在正中间，且直径等于组件较短边的变长。

设置颜色：在默认情况下颜色为黑色。若使用`setTint`方法设置了颜色，则优先使用此颜色，否则将会尝试使用`setColor`设置的颜色。

设置边缘：`setStroke`方法可以用于为图形边缘添加一圈描线

设置圆角：`setCornerRadius`可以设置圆角半径。

### ImageDrawable

`ImageDrawable`用于在位置渲染一张贴图。

构造方法需要一个`Image`类，可以用过`Image.create(namespace,path)`获取到资源路径中的一个图片。Path中应指定文件的后缀，比如`.png`和`.jpg`等。构造方法中的同理。

## DrawableWrapper

可渲染目标包装器(DrawableWrapper)是一种特殊的`Drawable`，用于对一个已有的`Drawable`进行额外的处理，比如缩放，裁剪等。具体内容与用法请自行搜索。

## DrawableContainer

`DrawableContainer`是一种特殊的`Drawable`，可以同时保有多种`Drawable`并按照一定方法选择将会使用的`Drawable`。其最常用的子类为`StateListDrawable`，其特别之处在于可以为不同状态指定不同的`Drawable`，被指定的状态可以在`StateSet.get(StateSet.xxx)`找到。

`setEnterFadeDuration`与`setExitFadeDuration`方法可以指定渲染变化时的过渡时间。

如下给出一段代码示例，摘自`icyllis.modernui.mc.ui.ThemeControl#addBackground`方法：

```java
public static void addBackground(View view) {
    StateListDrawable background = new StateListDrawable();
    ShapeDrawable drawable = new ShapeDrawable();
    drawable.setShape(ShapeDrawable.RECTANGLE);
    drawable.setColor(0x80a0a0a0);
    drawable.setCornerRadius(view.dp(2));
    background.addState(StateSet.get(StateSet.VIEW_STATE_HOVERED), drawable);
    background.setEnterFadeDuration(250);
    background.setExitFadeDuration(250);
    view.setBackground(background);
}
```

这段代码创建了一个半透明白色圆角矩形，并将其添加到`StateListDrawable`中，指定了其显示的条件为`VIEW_STATE_HOVERED`也就是鼠标在组件上时。最后设置了淡入和淡出时间为250毫秒。

## Draw

```java
void draw(@NonNull Canvas canvas);
```

这个方法是一个`Drawable`类中最核心的方法，用于在画布上绘制内容。同时，对于控制绘制内容的一些特征，还需要用到`Paint`类。

此部分是顺序运行渲染。因此，将会从上到下执行内容，后渲染的内容默认渲染前渲染的内容（若要更改请查看上面提到的设置颜色混合模式）

颜色设置：`setARGB` `setRGBA` `setColor`都可以设置颜色。

获取大小：`getBound()`方法可以获取到默认范围。

渲染图形：使用`drawRect`方法渲染矩形；使用`drawRoundRect`方法渲染圆角矩形，其中传入的一个`int`数值为圆角半径；使用`drawAct`绘制扇形，其中`startAngle`是起始角度，默认水平向右顺时针。`SweepAngle`是扇形范围的角度。单位为度，即一整圈为360；`drawBezier`方法绘制一条贝塞尔曲线。`DrawImage`方法绘制图片。其它内容请自行查看，比如绘制线，圆等，在此不一一赘述。

裁剪画布：`clipRect`方法可以裁剪画布的范围。在裁剪之后运行的代码超出范围的部分不会被渲染。

描边模式设置：`setStroke`方法可以设置是否开启描边模式，如果否则会填充图案。`setStrokeCap`设置描边端点的类型，可以在Paint.CAP\_...找到。`setStrokeWidth`设置描边宽度。`setStrokeJoin`设置描边转折处拐角形状，`setStrokeAlign`设置描边相对图形的侧，比如外侧，居中，内侧。`setStrokeMiter`可以将描边转折变为弧形转折，参数为弧形角度。

画布调整：`scale`，`rotate`等可以调整缩放，旋转等内容。
