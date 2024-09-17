---
description: 任务不来我就不动！

writers:
  - AW-CRK14
---

# 视图与文本视图 (View/TextView)

在 `AndroidUI` 中，视图 (`View`) 被定义为：

> 一个视图 (`View`) 在屏幕上占据一块矩形区域，并可以对绘制与事件处理做出反应。

为了更好地理解，我们将视图拆解为三个部分：

## Where: 视图的位置

`View` 可以决定其位置和大小，包括其在屏幕上的绝对位置或相对于父组件的位置。建议使用 `dp(int value)`
方法来将像素量转换为实际位置，以应对缩放问题。

### 高度与宽度设置

使用 `setWidth` 和 `setHeight` 方法可以分别设置组件的宽度和高度。默认值为 0。如果有特殊需求，请参阅 `ViewGroup`
部分的 [LayoutParams 条目](./viewgroup#LayoutParams)。

### 相对位置设置

使用 `setX` 和 `setY` 方法可以分别设置组件（以左上角为基点）的相对位置。这个位置是视图的高度和宽度之和。例如，如果一个方形的高度和宽度都设置为
10，位置 `x` 和 `y` 也都是 10，那么这个方形的位置将是 (20,20) 到 (30,30)。`setZ` 方法用于控制组件间的遮挡关系。

### 缩放设置

使用 `setScaleX` 和 `setScaleY` 方法可以分别设置组件在 X 轴和 Y 轴上的缩放比例。缩放的原点默认为组件的中心。边框宽度和图片也会随缩放一起变化。

### 相对父组件位置设置 [存疑]

`setTop` / `setBottom` / `setLeft` / `setRight` 方法原则上可以控制组件相对于父组件的位置，但实际效果可能不如预期。

### 设置固定大小

可以使用 `setSize` 方法来设置组件的固定大小。

### 在方向上的额外增减量

`setPadding` 方法的四个参数分别指定视图在左、上、右、下四个方向上的内边距。`setPaddingRelative`
方法则设置视图距离父组件的左、上、右、下四个方向的间距。这些是额外的变化量，不会影响内容的渲染，例如文字。

### Gravity（重力）

`Gravity` 的作用类似于重力，决定了组件在父组件中的对齐方式，比如靠左、靠上、居中等。设置重力可以使用 `setGravity`
方法，其参数可以在 `Gravity` 类下找到所需的常量。例如，要实现水平居中且靠下的对齐方式，可以使用：

```
setGravity(Gravity.CENTER_HORIZONTAL | Gravity.BOTTOM);
```

## What: 视图渲染什么

一个普通的 `View` 渲染内容包括其背景；如果 `View` 继承了 `TextView`，则可以额外渲染指定的文字，默认情况下文字会渲染在左上角。

### 设置背景

使用 `setBackground` 方法可以设置视图的背景，需传入一个 `Drawable` 实例。具体细节将在渲染部分介绍。

### 文字

#### 设置文字内容

使用 `setText` 方法设置显示的文字。如果需要翻译文字，请使用：

```
I18n.get(String transKey);
```

#### 设置文字颜色与大小

`setTextColor` 方法可以设置文字颜色。提交的数值为 16 进制数，可以在 `icyllis.arc3d.core.Color`
中找到预定义的颜色值。`setTextSize` 方法可以设置文字大小，单位为 sp，因此无需使用 `group.dp` 来缩放字体大小。

#### 设置提示（Tooltip）

使用 `setTooltipText` 方法可以为视图添加一个 tooltip，鼠标悬停在视图上方一段时间后显示。

#### 文字对齐

当组件的大小被固定时，文字默认会在左侧显示。使用 `setTextAlignment`
方法可以设置文字的对齐方式，如左对齐、右对齐、居中等。相关常量可以在 `TEXT_ALIGNMENT_xxx` 中找到。Hint
对应的内容在文本内容为空时显示，常用于文本编辑框功能，用法与 text 类似。

## How: 视图如何处理交互

### 监听器

监听器用于处理视图在活动时的各种操作。您可以在 IDE 中输入 Listener 以找到相关的监听器方法。创建监听器时，可以使用如下代码编写
lambda 表达式：

```
(view, motionEvent) -> {};
```

其中，`view` 是当前视图，`motionEvent` 是监听到的事件。通过 `getAction`
方法可以获取操作类型的索引编号，这些编号在 `MotionEvent` 类下定义。如果监听器类型与 `MotionEvent`
不匹配，则不会触发该监听器。例如，`OnTouchListener` 中的 `action index` 不会对应 `MotionEvent.ACTION_HOVER_MOVE` 的值。

对于鼠标点击事件监听器，可以使用 `setOnClickListener`
设置，这种方法只能判断点击事件，而无法得知点击位置和键盘状态。如果需要详细信息，可以使用 `setOnTouchListener`
，其中 `MotionEvent` 可以获取按键信息。示例代码如下：

```java
void viewInit() {
    setOnTouchListener((view, motionEvent) -> {
        if (motionEvent.getActionButton() == MotionEvent.BUTTON_PRIMARY) {
            System.out.println("点击左键！位置：{x=" + motionEvent.getX() + ", y=" + motionEvent.getY() + "}");
        } else if (motionEvent.getActionButton() == MotionEvent.BUTTON_SECONDARY) {
            System.out.println("点击右键！键盘状态：{alt=" + motionEvent.isAltPressed() + ", shift=" + motionEvent.isShiftPressed() + "}");
        }
    });
}
```

返回值表示该监听器是否已被消费。如果已被消费，其它相同类型的监听器将不会继续执行。

一些特殊的类提供了特别的监听器，例如 `RadioButton` 提供了按钮选择状态变化的监听器。

监听器的触发可能需要额外的预定义条件，比如使用 `setFocusable(true)` 或 `setClickable(true)` 等方法来设置是否可以被聚焦或点击。

### 推送

MUI 系统不提供 tick 或类似功能。如果需要定期执行任务，可以使用 `postDelayed` 方法。

`post` 方法用于向总线提交一个可执行目标 (`Runnable`)，这些目标将在对应的线程上执行以防止错误。`postDelayed`
方法在此基础上提供了一个延迟参数（单位：毫秒），总线将在指定时间后执行目标。

通过在目标中重复调用 `postDelayed` 方法，可以实现周期性循环。例如：

```java
Func runnable = () -> {
    runSomething();
    postDelayed(runnable, 50);
};

void post() {
    postDelayed(runnable, 50);
}
```

这段代码每 50 毫秒执行一次，相当于每秒 20 次，类似于原有的 tick 方法。

`removeCallbacks` 方法可以取消一个已提交但尚未执行的 `Runnable`。

## 常用子类

- **`Button`** 及其子类：用于实现按钮和点击交互功能。
- **`ImageView`**：用于在指定位置渲染图片。获取 `Image` 实例可以使用 `Image.get(String namespace, String path)` 方法。
- **`TextView`**：用于在指定位置渲染文字。
- **`EditText`**：用于创建一个可编辑的文本框。
- **`CheckBox`**：用于创建一个复选框。
- **`Spinner`**：用于创建一个下拉选择框。
- **`SwitchButton`**：用于创建一个可切换的开关按钮。示例代码如下：
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
- **`SeekBar`**：用于创建一个可拖动的滑动条。