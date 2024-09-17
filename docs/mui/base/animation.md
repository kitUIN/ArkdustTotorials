---
writers:
  - AW-CRK14
---

# 动画(Animation)

## Toast

`Toast`是一种提示框，通常不会获得焦点。它在屏幕底部中间出现，显示一个半透明黑底白字的提示信息，并在一段时间后自动消失，类似于安卓系统中的底部提示。如果要创建并显示一个`Toast`，可以使用以下代码：

```
Toast._makeText_(context, "Your info", Toast._LENGTH_).show();
Toast._makeText_(context, "Your info", Toast._SHORT_).show();
```

虽然`Toast`的功能不完全属于动画的范畴，但由于其通常会出现在与动画相关的上下文中，我们将其包括在这里。

## ObjectAnimator

`ObjectAnimator`允许我们创建动画，通过在时间的推移中逐步改变对象的属性值。要创建一个`ObjectAnimator`，我们首先需要一个`Property`类的实例来存储数据，供动画使用。在`icyllis.modernui.util`包中，我们可以使用`FloatProperty<T>`，其中`T`是动画应用于的`View`。选择`FloatProperty`的原因之一是MUI已经提供了对float类型在动画中平滑过渡的支持。如果使用其他类型的属性，您可能需要为您的类创建一个`TypeEvaluator`来处理状态之间的过渡。

下面是一个简单的`FloatProperty`示例：

```java
private float click;
private static final FloatProperty<RadioButtonA> clickPro = new FloatProperty<>("click") {
    @Override
    public void setValue(RadioButtonA object, float value) {
        object.click = value;
    }

    @Override
    public Float get(RadioButtonA object) {
        return object.click;
    }
};
```

`FloatProperty`主要用于定义如何读取和设置动画属性值。

接下来，使用`FloatProperty`创建`ObjectAnimator`。`ObjectAnimator`可以管理一个或多个`FloatProperty`。

- **单一属性动画**：如果只需要一个属性动画，可以使用`icyllis.modernui.animation.ObjectAnimator#ofFloat`方法。参数包括`View`的实例、`FloatProperty`和一个或多个float值。两个float值分别表示起始值和结束值；如果有多个float值，动画将依次经过这些值，每段时间内的插值变化相同。

  示例代码：

  ```java
  ObjectAnimator animator = ObjectAnimator.ofFloat(view, clickPro, 0f, 100f);
  ```

- **多个属性动画**：如果需要同时控制多个属性，可以使用`PropertyValuesHolder`来定义每个属性的动画，然后将这些`PropertyValuesHolder`对象传递给`ObjectAnimator`。

  示例代码：

  ```java
  PropertyValuesHolder pvh1 = PropertyValuesHolder.ofFloat(ROTATION, 0, 2880);
  PropertyValuesHolder pvh2 = PropertyValuesHolder.ofFloat(ROTATION_Y, 0, 720);
  PropertyValuesHolder pvh3 = PropertyValuesHolder.ofFloat(ROTATION_X, 0, 1440);
  ObjectAnimator animator = ObjectAnimator.ofPropertyValuesHolder(this, pvh1, pvh2, pvh3);
  ```

在创建`ObjectAnimator`后，可以使用以下方法来配置动画：

- **设置持续时间**：`setDuration`方法设置动画的总时间。
- **设置插值器**：`setInterpolator`方法设置动画的变化速率。可选插值器可以在`TimeInterpolator`类中找到。
- **添加更新监听器**：使用`addUpdateListener(a -> invalidate())`方法在动画过程中刷新绘图。

最后，使用`start`方法启动动画。动画系统还提供了一些控制动画状态的方法，具体可以参考相关文档。