---
writers:
  - AW-CRK14
---

# 渲染(Render)

`Render`渲染是将可视化内容展示在屏幕上的过程。在`mui`系统中，大部分渲染工作是通过`onDraw`方法完成的，而`Drawable`
类用于向画布（Canvas）上添加新的内容。对于一些常见的渲染需求，`mui`已经提供了`Drawable`的子类。

对于一个`View`，可以使用`setBackground`方法设置其背景渲染。特别地，对于`CompoundButton`，可以使用`setButtonDrawable`
设置其额外的渲染效果，但目前我们还没有测试出其具体作用。

## Drawable

> `Drawable` 是一个“可以被绘制的东西”的抽象类。通常，`Drawable`用作从资源中检索的绘制内容的类型，
> 它提供了一个通用的接口来处理各种形式的底层视觉资源（例如图片、纯色、线框）。
> 与`View`不同，`Drawable`不具备处理事件或与用户交互的功能（动画效果除外）。

### ColorDrawable

`ColorDrawable`用于创建一个单一颜色的图形。通过传入一个`colorInt`值可以设置`ColorDrawable`的颜色。

- **颜色混合模式**：使用`setTintBlendMode`方法设置混合模式。具体可选项请参考`icyllis.modernui.graphics.BlendMode`类。
- **设置边界**：使用`setBounds`方法设置画布渲染的边界，坐标包括画布上位置的起始点和结束点。

::: warning :warning: 注意
实际测试中可能未能如预期生效，这可能需要手动将其推送到画布上时才能体现效果。
:::

- **热点**：`hotspot`用于设置渲染热点，帮助实现与点击位置相关的UI特效。

### ShapeDrawable

`ShapeDrawable`用于在指定位置绘制形状的图案。

::: danger :no_entry: 特别注意
在配置`ShapeDrawable`时，务必调用`setUseLevelForShape(false)`，否则图形可能无法正确渲染。
:::

- **设置形状**：通过`setShape`方法传入形状的索引编号。可用编号常量可在`ShapeDrawable`中找到。例如，圆形将绘制在中心，直径等于组件较短边的长度。
- **设置颜色**：默认颜色为黑色。使用`setTint`方法设置的颜色将优先应用，否则将尝试使用`setColor`方法设置的颜色。
- **设置边缘**：使用`setStroke`方法为形状边缘添加描边。
- **设置圆角**：使用`setCornerRadius`方法设置圆角半径。

### ImageDrawable

`ImageDrawable`用于在指定位置渲染图片。

- **构造方法**：需要一个`Image`类实例。可以通过`Image.create(namespace, path)`
  方法获取资源路径中的图片。路径中应指定文件的后缀，如`.png`或`.jpg`。

## DrawableWrapper

`DrawableWrapper`是一种特殊的`Drawable`，用于对已有的`Drawable`进行额外处理，如缩放、裁剪等。具体内容和用法请参见相关文档。

## DrawableContainer

`DrawableContainer`是一种特殊的`Drawable`，能够同时包含多个`Drawable`并根据一定规则选择使用。
最常用的子类是`StateListDrawable`，其特别之处在于可以为不同状态指定不同的`Drawable`。
状态可以在`StateSet.get(StateSet.xxx)`中找到。

- **过渡时间**：使用`setEnterFadeDuration`和`setExitFadeDuration`方法设置渲染变化的过渡时间。

以下是一个示例代码，摘自`icyllis.modernui.mc.ui.ThemeControl#addBackground`方法：

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

这段代码创建了一个半透明白色圆角矩形，并将其添加到`StateListDrawable`中，指定在`VIEW_STATE_HOVERED`状态下显示，即鼠标悬停在组件上时。
最后，设置了淡入和淡出效果的持续时间为250毫秒。

## Draw

```java
void draw(@NonNull Canvas canvas);
```

这是`Drawable`类中最核心的方法，用于在画布上绘制内容。控制绘制内容的一些特性还需要使用`Paint`类。

渲染过程是顺序执行的，因此内容会从上到下依次绘制。后渲染的内容默认会覆盖之前渲染的内容（若要更改此行为，请参考前面提到的颜色混合模式设置）。

- **颜色设置**：可以使用`setARGB`、`setRGBA`、`setColor`方法设置颜色。
- **获取大小**：使用`getBounds()`方法获取默认的绘制范围。
- **渲染图形**：
    - 使用`drawRect`方法绘制矩形；
    - 使用`drawRoundRect`方法绘制圆角矩形，传入的`int`值为圆角半径，并可以指定绘制哪些角；
    - 使用`drawArc`方法绘制扇形，其中`startAngle`是起始角度，默认水平向右顺时针，`sweepAngle`是扇形的角度范围，单位为度；
    - 使用`drawBezier`方法绘制贝塞尔曲线；
    - 使用`drawImage`方法绘制图片。

对于`drawRect`和`drawRoundRect`，可以使用其衍生的渐变填充方法`drawRectGradient`和`drawRoundRectGradient`
，在这些方法中可以指定目标四个角的着色，过程将忽略`Paint`中的预定颜色。

- **裁剪画布**：使用`clipRect`方法裁剪画布的范围。裁剪后，超出范围的部分将不被渲染。
- **描边设置**：
    - `setStroke`方法设置是否开启描边模式，若关闭，则会填充图案；
    - `setStrokeCap`设置描边端点类型（见`Paint.CAP_...`）；
    - `setStrokeWidth`设置描边宽度；
    - `setStrokeJoin`设置描边转折处的拐角形状；
    - `setStrokeAlign`设置描边的对齐方式（注：此功能尚未实现）；
    - `setStrokeMiter`将描边转折变为弧形，参数为弧形角度。

- **画布调整**：使用`scale`、`rotate`等方法调整缩放和旋转等效果。

## 目标位置定位

在渲染过程中，确定使用哪些参数作为定位数据是非常重要的。

- 使用`getLeft`、`getTop`、`getRight`、`getBottom`获取组件相对于父组件的位置。以父组件的左上角为原点（0,0），对应的组件的边界位置。
- 使用`getPaddingLeft`、`getPaddingTop`、`getPaddingRight`、`getPaddingBottom`获取与父组件边界的相对距离。

在画布（`Canvas`）和组件事件监听（`EventListener`
）中，左上角是坐标原点（0,0）。例如，组件的右下角坐标为(`getWidth()`, `getHeight()`)
；若要让图片填充组件的右下角四分之一区域，其范围应为 \[(width / 2F, height / 2F), (width, height)]。

总之，在处理渲染时，我们无需考虑与父组件的位置相关性，直接使用组件内的相对坐标系即可。
