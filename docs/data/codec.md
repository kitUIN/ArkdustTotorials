---
description: 真是coco又dede啊  你们有这样deco的codec吗
writers:
  - AW-CRK14
versions:
  id: "codec"
  vanilla: "1.20.x"
  loaders:
    - text: "Neoforge 20.4.147-beta"
      loader: "neoforge"  
---

# 编解码器(Codec)

在minecraft 1.14.x版本中开始引入了数据包，允许用户通过json文件创建某些需要注册的内容的实例，或者说，“数据驱动”。
这涵盖的内容很广泛，包括但不限于配方解析，战利品表，伤害类型，结构，群系等。而除了数据包外，材质包中，有关模型，材质路径等的解析，也都可以算在其中。

既然牵扯到了json与运行中实例，那我们就不得不考虑其如何解析——而`Codec`正是为这一目的而生的。
`Codec`的设计便是用于将json文件中的基本数据，按照一定的解析模板，生成指定类的实例；
同时，它也负责对一个给定的类的实例，根据其中存储的信息数据，重新按照一定的模板进行组合，生成出json内容。

这些过程被分别称为`解码(Decode)`与`编码(Encode)`。
我们将会在下文再聊到他们。而现在，我们需要来看看，如何为你的内容创建一个`Codec`。

注：建议在碰到需要使用codec的时候再阅读。

## 固定实例与可变内容实例

从最简单的部分开始——我们先来创建固定实例。

假定我们现在有一个类`RangeChecker`用于检查一个数据是否在范围内，我们需要为其创建`Codec`：

```java
public record RangeChecker(ResourceLocation id, int numA, int numB) {
    public boolean check(int number) {
        return numA == numB ? number == numA : number >= Math.min(numA, numB) && number <= Math.max(numA, numB);
    }
}
```

(ResourceLocation只是给着做案例的，实际上没用.png)

那么，我们可以为其创建一个固定的编解码器，使用`Codec.unit`

```java
public static final Codec<RangeChecker> CODEC = Codec.unit(new RangeChecker(new ResourceLocation("ard_tts", "range_checker"), 0, 20));
```

但是，这显然有一个问题：我们既然为其分配了`numA`，`numB`两个实参，肯定不希望从json中解析时，只能将其解析为一个固定的内容。
为了解决这个问题，我们就不应该使用`unit`，而是采用别的方式。其中最常用的，便是`RecordCodecBuilder`：

```java
public static final Codec<RangeChecker> CODEC = RecordCodecBuilder.create(i -> i.group(
        ResourceLocation.CODEC.fieldOf("rl").forGetter(RangeChecker::id),//请求一个RL
        Codec.INT.fieldOf("firstNum").forGetter(RangeChecker::numA),//一个int
        Codec.INT.fieldOf("secondNum").forGetter(RangeChecker::numB)//以及另一个int
).apply(i, RangeChecker::new));//然后是实例创建方法——数据位置一一对应！
```

然后，它便可以这么被解析：

```json
{
  "rl": "ard_tts:rc",
  "firstNum": 4,
  "secondNum": 18
}
```

得到的实例就是：

```java
RangeCheck newInstance = new RangeChecker(new ResourceLocation("ard_tts", "rc"), 4, 8);
```

是不是有点感觉了？

那么，我们正式进入`Codec`的领域吧：

## Codec引用

也许你已经注意到了：在上面的代码中，我们的`RecordCodecBuilder`中，使用了其它的`Codec`，其中有基本数据元素的`Codec.INT`——
在`Codec`下还有其它一些基本数据元素的，比如`FLOAT` `STRING` `LONG` `BOOL`等；
同时，我们也引用了不是基本数据元素的`ResourceLocation.CODEC`，它是另一个类的，包装好的`CODEC`，被我们在这里引用了。

因此，我们不难发现，除了`Codec`类中给出的基本数据类型，**其它类已配置的CODEC同样可以被我们使用。**

## Codec子变种

好吧，我确实不知道该如何用更好的名字称呼。总的来说，对于每一个`Codec`，mojang已经为我们提供了一系列方法，用于创建它的变形以适应不同情况的需求。

### MapCodec

在上面的代码中，我们不难找到，我们使用`fieldOf`方法为指定的`Codec`提供了键(key，也就是json的元素冒号前的部分)。
这样，`CODEC`就会尝试在该键下解析内容。这一方法，便是将`Codec`转化为了`MapCodec`，即配置了解析区域的`Codec`。

### MapCodecCodec

我们可以对一个`MapCodec`再调用`codec()`方法，使其重新变回一个`Codec`。注意：此时其**仍保留了已经配置的key**，
换言之这一过程并非还原，而是**再一次包装**，使其在指定键下搜寻子键并解析内容。

这么说可能有点抽象，我们来看一个例子，还是使用上面的`RangeChecker`：

```java
public static final Codec<RangeChecker> CODEC = RecordCodecBuilder.create(i -> i.group(
        ResourceLocation.CODEC.fieldOf("rl").forGetter(RangeChecker::id),
        //.fieldOf("num").codec().fieldOf("a")等效于.fieldOf("num").fieldOf("a")
        Codec.INT.fieldOf("num").codec().fieldOf("a").forGetter(RangeChecker::numA),
        Codec.INT.fieldOf("num").fieldOf("b").forGetter(RangeChecker::numB)
).apply(i, RangeChecker::new));
```

那么，它应当解析的json内容就是：

```json
{
  "rl": "ard_tts:rc",
  "num": {
    "a": 1,
    "b": 14
  }
}
```

又套了一层，芜

### ListCodec 与 OptionalFieldCodec

经常吃json的朋友应该知道，json中有用方括号(就是[])包围的部分，用于表示一列数据。

相应的，`Codec`也为我们提供了解析这种数组形式内容的方法，即`listOf()`方法。
与之相似的还有`optionalField(String)`，但这就是创建一个`MapCodec`了，和上面的`fieldOf(String)`放在一起。

```java
import java.util.Optional;

public static final Codec<ResourceLoaction> single = ResourceLocation.CODEC;
public static final Codec<List<ResourceLocation>> list = ResourceLocation.CODEC.listOf();
public static final MapCodec<Optional<ResourceLocation>> option = ResourceLocation.CODEC.optionalField("some_field");
```

### 注册对象与标签

在使用`ResourceLocation.CODEC`时，我们可能通常想通过注册id来获取到指定的实例。
`Registry`类中已经为我们预备了对应的`Codec`可以直接使用，有`Holder`与`实例`两种形式：

```java
default Codec<T> byNameCodec() {
    Codec<T> codec = ResourceLocation.CODEC
            .flatXmap(
                    p_258170_ -> Optional.ofNullable(this.get(p_258170_))
                            .map(DataResult::success)
                            .orElseGet(() -> DataResult.error(() -> "Unknown registry key in " + this.key() + ": " + p_258170_)),
                    p_258177_ -> this.getResourceKey(p_258177_)
                            .map(ResourceKey::location)
                            .map(DataResult::success)
                            .orElseGet(() -> DataResult.error(() -> "Unknown registry element in " + this.key() + ":" + p_258177_))
            );
    Codec<T> codec1 = ExtraCodecs.idResolverCodec(p_258179_ -> this.getResourceKey(p_258179_).isPresent() ? this.getId(p_258179_) : -1, this::byId, -1);
    return ExtraCodecs.overrideLifecycle(ExtraCodecs.orCompressed(codec, codec1), this::lifecycle, this::lifecycle);
}

default Codec<Holder<T>> holderByNameCodec() {
    Codec<Holder<T>> codec = ResourceLocation.CODEC
            .flatXmap(
                    p_258174_ -> this.getHolder(ResourceKey.create(this.key(), p_258174_))
                            .map(DataResult::success)
                            .orElseGet(() -> DataResult.error(() -> "Unknown registry key in " + this.key() + ": " + p_258174_)),
                    p_206061_ -> p_206061_.unwrapKey()
                            .map(ResourceKey::location)
                            .map(DataResult::success)
                            .orElseGet(() -> DataResult.error(() -> "Unknown registry element in " + this.key() + ":" + p_206061_))
            );
    return ExtraCodecs.overrideLifecycle(codec, p_258178_ -> this.lifecycle(p_258178_.value()), p_258171_ -> this.lifecycle(p_258171_.value()));
}
```

具体是咋实现的我们会在之后提到。而`Tag`同样也为我们提供了便利的解析器，在`TagKey`类中：

```java
public static <T> Codec<TagKey<T>> codec(ResourceKey<? extends Registry<T>> pRegistry) {
    return ResourceLocation.CODEC.xmap(p_203893_ -> create(pRegistry, p_203893_), TagKey::location);
}

public static <T> Codec<TagKey<T>> hashedCodec(ResourceKey<? extends Registry<T>> pRegistry) {//使用Registry.key()可以获得
    return Codec.STRING
            .comapFlatMap(
                    p_274844_ -> p_274844_.startsWith("#")
                            ? ResourceLocation.read(p_274844_.substring(1)).map(p_203890_ -> create(pRegistry, p_203890_))
                            : DataResult.error(() -> "Not a tag id"),
                    p_203876_ -> "#" + p_203876_.location
            );
}
```

有一种特殊情况，也就是我们希望对一个键，同时尝试解析`单个id` `多个id` `标签`，我们可以使用`HolderSetCodec`来帮我们便利的完成任务。

## Codec组合处理

当然——Codec还有一些常用但是更加高级的功能。这些功能或许有些难懂，但是可以在特定的场景下帮我们有效的解决问题，值得看一看：

### EitherCodec

看名字就知道，二选一。`Codec.either`可以保有两个`Codec`，在解码时会先尝试使用第一个进行解析；如果失败，则使用第二个进行尝试。
当然，这一过程会产生一些奇怪的副作用。假定我们有`Codec<F>`与`Codec<S>`，那么使用`Codec.either`
，它将会转化为`Codec<Either<F,S>>`。

这也就意味着，我们没有办法直接使用它，而需要进行一点小小的再处理：

### map与comap

`map`与`comap`用于处理对象的映射。
其中，`comap`是由“结果”向“源”的映射，或者说是实例向json映射的过程，返回的是一个编码器(`Encoder`)；
而`map`则恰好相反，是由“源”向“结果”的映射，或者说是json向实例映射的过程，返回的是一个解码器(`Decoder`)。

而我们可以将其二者结合起来使用，变为`cross map`，也就是`xmap`。

### "x"

在codec中，我们看到的`x`大多表示的都是`cross`的意思，也就是双向映射。

有了这个功能，我们就可以回头再来看上面的`EitherCodec`了。假定我们的泛型`<F>`与`<S>`都是`R`的子类：

```java
public static final Codec<R> CODEC =
        Codec.either(codecF, codecS).//这里是EitherCodec，Codec<Either<F,S>>
                xmap(
                either -> either.map(first -> first, second -> second),//解码映射，将二者统一至R层级
                instance -> instance instanceof F fins ? Either.left(fins) : Either.right((S) instance)//编码映射，使用Either.left/right为其分配正确的codec
        );
```

这样，我们就可以把两个codec的解码结果统一为一个，即R了；而其编码则根据子类实例的类判断来重新分配。

当然，这并不是`xmap`的唯一用法。只要是基于类A向类B的可逆映射，都可以使用`xmap`。某种角度而言，你可以把它当成一个`LinkedMap`。

### "flat"

既然已经说完了`xmap`，那就顺便提一下`flat`。`flatXmap`与`xmap`的区别是，
如果`xmap`是A <==> B的双向映射，那么`flatXmap`就是A ==> DataResult\<B> 和 DataResult\<A> <== B的双向映射。

所谓`DataResult`是一种特殊的`Either`，表示成功时其保有left为实例结果；而表示失败时，其保有right为错误报告信息。

而你在codec中可以见到的绝大部分`flat`，其代表的意义大多如上。

那么，现在，可以尝试理解`Registry`提供的`Codec`的基本逻辑了(笑)

### xor

说过了上面的内容，`ExtraCodec.xor`应该就不难理解了。与`Codec.either`不同的是，它要求二者不能同时解析成功，否则会导致错误。

### withAlternative

与替代是基于`xmap`与`either`实现的功能，用于收紧编码。其会尝试用提供的两种`Codec`进行解码，但在编码时，只会使用前者。
这可以用于简化一些不必要的编码器判断，并使编码结果更为统一。

### dispatch

调度是一个比较特殊的设计：在`Codec.dispatch`中，它先会请求一个生成类型实例，再由这个类型实例指引至具体的实例进行解析操作。
如果你在开发过程中，看到其要求注册一个`xxxType`，而其构造参数中要求传入指定类的子类的(或者说，就是你在编写的那个)`Codec`，
那其的解析大概率使用的就是调度系统。

## 自定义Codec

——当然，`Codec`与`MapCodec`也是可以自己实现的。这一部分内容由于本人并未使用到，暂时不做书写以避免误导。
您可以观察游戏本体或加载器提供的实例来学习如何创建自己的Codec。