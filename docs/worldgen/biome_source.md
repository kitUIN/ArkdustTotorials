---
writers:
  - AW-CRK14
versions:
  id: "biome_source"
  vanilla: "1.20.x"
  loaders:
    - text: "Neoforge 20.4.147-beta"
      loader: "neoforge"
---

# 群系源(`BiomeSource`)

群系源，顾名思义，用途就是为世界提供群系(`Biome`)。在minecraft中，这个类可以根据气候分量与位置决策生物群系种类，也承担了快捷搜索附件生物群系的任务。

## 注册与使用

群系源种类的注册依赖于其编解码器(`Codec`)的注册，在`LevelStem`中引用。

::: tip
通过观察`BiomeSource`代码，我们不难找到

```java
public static final Codec<BiomeSource> CODEC = BuiltInRegistries.BIOME_SOURCE.byNameCodec().dispatchStable(BiomeSource::codec, Function.identity());
```

即对于解析目标，先对该json内的`type`字段进行id与实例的匹配，获取到对应的内容编解码器，再使用新获得的编解码器来解析内容获取群系源实例。
(感到困惑？请[参考Codec章节](../data/codec.md#dispatch))
:::

让我们看看`BiomeSource`需要我们实现哪些方法：

```java
protected abstract Codec<? extends BiomeSource> codec();

protected abstract Stream<Holder<Biome>> collectPossibleBiomes();

public abstract Holder<Biome> getNoiseBiome(int pX, int pY, int pZ, Climate.Sampler pSampler);
```

第一个方法，需要我们提供一个本群系源的codec，这个codec**同时承担了编解码实例与界定实例种类的任务**，因此我们一定要保证其也被注册进游戏中。

第二个方法，用于收集该维度所有可能出现的群系。在从群系源层级获取该群系组时，游戏已在代码层面进行了延迟初始化与缓存，因此我们不必再进行额外的存储。

第三个方法，则是群系源最重要的方法，通过xyz三位置分量与六气候分量来计算群系。

先让我们略过内容书写，看看怎么注册：

首先我们需要准备好我们自定义的群系源子类的codec，您可以参考原版提供的群系源子类，例如`MultiNoiseBiomeSource`来查看如何完成。

在这里给出一个简单范例，例如我们的参数是请求一组群系，我们可以这么写：

```java
public static class Source extends BiomeSource {
    public static final Codec<Source> CODEC = RecordCodecBuilder.create(obj -> obj.group(
            Biome.CODEC.listOf().fieldOf("biomes").forGetter(ins -> ins.BIOMES)
    ).apply(obj, obj.stable(Source::new)));

    public Source(List<Holder<Biome>> biomes) {
        BIOMES = biomes;
        //......
    }

    protected Codec<? extends BiomeSource> codec() {
        return CODEC;
    }
}
```

接下来注册我们的编解码器，注册键为`Registries.BIOME_SOURCE`：

```java
public class BiomeSourceRegistry {
    public static final DeferredRegister<Codec<? extends BiomeSource>> REGISTER = DeferredRegister.create(Registries.BIOME_SOURCE, Arkdust.MODID);

    public static final DeferredHolder<Codec<? extends BiomeSource>, Codec<SarconDimension.Source>> SARCON = REGISTER.register("sarcon", () -> SarconDimension.Source.CODEC);
}
```

记得将其注册进mod主线。

最后，我们就可以在恰当的地方快乐地使用我们的群系资源了。例如在`LevelStem`中(`LevelStem`
是什么？请看[序章的最后部分](start.md))创建实例，
然后让数据生成帮我们把它转化为json。

## 内部内容书写与其它用途

有必要来细致地看一看`getNoiseBiome`方法的各个参数了。首先是最前面的`pX pY pZ`：我们在前面已经提过，群系是以4^3为一个单元计算的，
因此这三个参数对应的其实是这个单元的坐标，而不是对应位置方块的坐标。若要进行转化，我们应该将其乘以4得到方块坐标再进行判定。

> Gets the biome at the given quart positions. Note that the coordinates passed into this method are 1/ 4 the scale of
> block coordinates.
>
> 获取给定坐标的生物群系。注意，该方法传入的坐标是方块坐标的1/4。

然后是后面的`Climate.Sampler pSampler`，这里面就包含了我们所说的气候六分量，这是六个密度函数：

```java
public static record Sampler(
        DensityFunction temperature,//温度
        DensityFunction humidity,//湿度
        DensityFunction continentalness,//大陆性
        DensityFunction erosion,//侵蚀度
        DensityFunction depth,//深度
        DensityFunction weirdness,//奇异度
        List<Climate.ParameterPoint> spawnTarget
) {
}
```

这些密度函数的命名是适应原版群系构建所需要的，且在原版世界的表面生成中指导地形的生成；
这意味着，如果您明白您要干什么，您完全可以将这些函数选择性的赋予其它意义甚至留空，并在表面密度中进行相应的处理。

对于如何获得某位置的数值，您可以参考如下方法：

```java

@Override
public Holder<Biome> getNoiseBiome(int pX, int pY, int pZ, Climate.Sampler pSampler) {
    //sample方法会自动将三分量乘以4，把群系单元坐标变换为方块坐标
    long l = pSampler.sample(pX, pY, pZ).continentalness();//获取位置的大陆性，其它分量请参考实例下的方法。
    return l >= 0 ? A : B;//如果大陆性大于0，返回群系A，否则返回B。
}
```

::: warning 非常重要且意义不明的事

在上面代码中，`sample`在代码里会将六个气候分量的采样的大小乘以10000。
这意味着，如果您本来需要大陆性大于1分配X群系，您应该使用

```java

@Override
public Holder<Biome> getNoiseBiome(int pX, int pY, int pZ, Climate.Sampler pSampler) {
    long l = pSampler.sample(pX, pY, pZ).continentalness();
    return l >= 10000 ? X : B;
}
```

对于这个10000的存在有什么意义，猜测可能是为了把`double`转换为`long`提高性能——但实际是否有效很难评价。

:::

除此之外，在群系源中还有一些方法用于查询附近群系，例如`findClosestBiome3d`方法，用于查找空间内最近的某群系；
又比如`findBiomeHorizontal`方法，可以查询水平面内的某群系。对于其它用途请参考类下的方法与签名。