# 动画(Animation)

## Toast

Toast是一种提示框，不会被聚焦，显示时会在屏幕中间的下部出现一个半透明黑底白字的提示并在一段时间后消失，就像安卓系统中的底部提示一样。如果要创建并激活一个Toast，您需要使用：

```java
Toast._makeText_(context,"Your info",Toast._LENGTH_).show();
Toast._makeText_(context,"Your info",Toast._SHORT_).show();
```

准确来说它大概不算是动画分类下的内容，但我的确不知道应该把它放在哪里。

## ObjectAnimator

要创建一个动画，我们首先需要一个用于存储数据的容器，使动画在执行时可以根据时间改变我们的内容。首先我们需要一个`icyllis.modernui.util.Property`类的实例，这里我们挑一个最简单的：`FloatProperty<T>`。其中`T`是其依附于的`View`。之所以选择`FloatProperty`，一个原因就是MUI已经提供了float在动画中平滑过渡的方法，当然，您也可以采用其它的类，但两个状态之间的平滑过渡效果可能比较难处理，这需要您为自己的类创建TypeEvaluator。

为了构造一个`FloatProperty`，我们需要基础`FloatProperty`类，并实现其中的两个方法：用于设置值的`setValue`和用于获取值的`get`。比如，我们可以创建这样一个`FloatProperty`：

```java
private float click;
private static final FloatProperty<RadioButtonA> clickPro = new FloatProperty<>("click"
) {
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

（准确来说 这东西的设计看起来更像一个数据读写的接口。但它终归不是。）

接下来，我们要使用我们刚刚创建的`FloatProperty`来创建`ObjectAnimator`。一个`ObjectAnimator`可以对应多个`FloatProperty`。

如果只需要对应一个，可以使用`icyllis.modernui.animation.ObjectAnimator#ofFloat`方法，传入的值分别是`View`的实例，`FloatProperty`，以及一个及以上的float。在存在两个float时，这两个值分别是起始值和结束值；在存在超过两个float时，将在变化过程中经过每一个值，两个插值之间经过的时间相同。

如果需要对应多个，那么可以参考下面这段代码：

```java
var pvh1 = PropertyValuesHolder.ofFloat(ROTATION, 0, 2880);
var pvh2 = PropertyValuesHolder.ofFloat(ROTATION_Y, 0, 720);
var pvh3 = PropertyValuesHolder.ofFloat(ROTATION_X, 0, 1440);
anim = ObjectAnimator.ofPropertyValuesHolder(this, pvh1, pvh2, pvh3);
```

在创建了一个`ObjectAnimator`后，我们就可以使用`setDuration`方法来设置动画的时间，`setInterpolator`来设置变化速率（其索引可以在`TimeInterpolator`类下找到），再使用`addUpdateListener(a -> invalidate())`来设置是否需要在执行动画时刷新绘图。

最后，我们需要在对应需要执行的地方使用`start`方法。动画系统下还有一些控制动画运动状态的方法，可以自行查看。