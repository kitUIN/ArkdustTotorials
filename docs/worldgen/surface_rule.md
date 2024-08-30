---
writers:
  - AW-CRK14
versions:
  id: "surface_rule"
  vanilla: "1.20.x"
  loaders:
    - text: "Neoforge 20.4.147-beta"
      loader: "neoforge"
---

# 表面规则(`SurfaceRule`)

*//此章节正在施工 使用碎片信息替代*

*//此部分信息可能存在过时问题，不保证百分百准确，请仔细甄别*

## SurfaceRule的基本逻辑与使用

在高版本中，`SurfaceRule`取代了低版本中的`SurfaceBuilder`。
对于世界生成阶段的每一个方块都会经过一次SurfaceRule的判定，来决定相应位置应该生成何种方块。
简单来说其基本逻辑就是对于每一个被选中的方块，先根据其所处群系的匹配来进入下一级`SurfaceRule`，再根据其位置等特性生成对应的方块。
如果方块没有被生成（即返回的方块状态（`BlockState`）为null），则下降到默认的生成规则，并生成基础地形。

SurfaceRules这一体系（以下简称体系）由以下几个类构成：

- 规则资源(`RuleSource`)，是体系的基本组成。
  一个`RuleSource`下可以存储多个子`RuleSource`，它们将按照顺序被执行。
  其本身不具有决定方块生成的作用，更像是作为一个注册有关内容的引导。其需要包含一个自身的编解码器(`Codec<?>`)用于注册，
  以及实现一个apply方法来将生成背景(`SurfaceRules.Context`)转化为所需要的地表规则(`SurfaceRule`)。

- 地表规则(`SurfaceRule`)，是真正负责执行将位置信息转化为BlockState的。这里需要实现一个tryApply方法，提供了运算方块的坐标。
  但这些数据不一定能满足我们的需求，因此有需要的话可以在构造一个SurfaceRule实例时将Context一并传入。

- `ConditionSource`状态资源，类比上述规则资源，但这个应该返回一个boolean来表示是否应该在此位置进行相应活动。
  相应的，其真正决定坐标的应该是一个`Condition`类。但由于其作用效果有限，因此二者常被视为一体的。

`SurfaceRules`内提供了一些基础的方法：

- `ifTrue`方法：这需要一个`ConditionSource`和一个`RuleSource`，若前者成立则执行后者。
  `ifTrue`方法本身也是一个`ConditionSource`，因而可以嵌套使用(怎么可能不行呢)。

- `sequence`方法：需要多个`RuleSource`，在前置的条件成立时其存储的多个`RuleSource`将会轮流被尝试执行。
  这可以使多个具有相同前提条件的`RuleSource`被聚集，比如原版中先使用`ifTrue`判断是否属于指定群系，
  再使用`sequence`来添加所有需要在此群系中执行的子`RuleSource`。

- `not`方法：反转一个`ConditionSource`的结果。

- `makeStateRule`方法：需要提供一个`Block`，这将把`Block`转化为一个`RuleSource`，可以上述提及的情况下使用以放置对应方块。

在`SurfaceRules`类中还提供了其它一些方法或预定义常量，
比如`isBiome`，`waterBlockCheck`，`yBlockCheck`，`stoneDepthCheck`等等，用来检测一个位置的各种属性，大家可以自行查看。

这里展示一个代码实例并解释一下以加深大家对代码的理解：

```java
public static SurfaceRules.RuleSource build() {
    return SurfaceRules.ifTrue(SurfaceRules.isBiome(BiomeKey.BIOME),//如果群系为我们之前创建的自定义群系
            SurfaceRules.ifTrue(SurfaceRules.not(SurfaceRules.hole()),//且如果位置不是矿洞内
                    SurfaceRules.sequence(
                            SurfaceRules.ifTrue(SurfaceRules.stoneDepthCheck(0, true, 3, CaveSurface.FLOOR), makeStateRule(Blocks.DIRT)),//将距离表面3格以内的方块替换为泥土
                            SurfaceRules.ifTrue(SurfaceRules.stoneDepthCheck(0, true, 5, CaveSurface.FLOOR), makeStateRule(Blocks.COARSE_DIRT))//对于不符合上方“距离表面3格以内”不成立的方块，如果距离表面五格以内，则替换为砂土
                    )));
}
```

## SurfaceRule自定义

`SurfaceRule`的自定义是继承自原版`SurfaceRule`接口的自建类，在这里我们可以使用代码与给出的数据直接进行类似旧版本中SurfaceBuilder的行为，
具有较高的自由度，个人认为对于复杂的地表要求，使用这一功能比堆叠`ifTrue`与`senquence`更为便捷与直观。

首先我们需要创建一个类并实现`SurfaceRules.RuleSource`接口，这需要实现`codec`方法与`apply`方法。
如果你不需要在创建的时候像`ifTrue`（从源码中可以看到这其实是`TestRuleSource`类的构造的快捷方法）等一样传入参数，则可以直接使用

```java
public static final Codec<WastelandSurfaceLayer> CODEC = Codec.unit(BiomeSurfaceRule::new);
```

来创建一个对应的`Codec`，其中`BiomeSurfaceRule`是你创建的`SurfaceRule`的类名。

~~(其它codec？去[复习](../data/codec.md)！)~~

在`codec`方法中我们返回`new KeyDispatchDataCodec<>(CODEC)`即可。

接下来我们应该创建一个类并实现`SurfaceRules.SurfaceRule`接口。
由于其需要实现的`tryApply`方法只提供了坐标位置而缺少更多信息，因此我强烈建议在构造这个`Rule`
实例时传入`SurfaceRules.Context`，如下：

```java
public record Rule(SurfaceRules.Context context) implements SurfaceRules.SurfaceRule {
}
```

创建完成后我们应当实现`tryApply`方法。根据之前传入的`context`，我们可以获取到我们需要的各种信息。
但由于类中数据的权限设置，对于一些不能访问的值，您需要使用AT来为其手动添加权限。

至于在这里该如何具体书写代码，大家可以去查看原版已经完成的`SurfaceRule`的写法。这里仅给出一份参考代码来帮助大家了解基本的逻辑：

```java
public record Rule(SurfaceRules.Context context) implements SurfaceRules.SurfaceRule {
    public BlockState tryApply(int x, int y, int z) {
        //将y大于100的位置均转变为空气 由于在之前额外使用了限制地表范围的SurfaceRules.stoneDepthCheck(0, true, 3, CaveSurface.FLOOR),这些内容仅对地表前3的方块生效。但这一过程容易造成群系衔接出现问题。
        //不和表面生成绑定导致的。
        if (context.blockY >= 100) return Blocks.AIR.defaultBlockState();
        //对于高度为99或98的方块，随机变为砂土或菌丝
        if (context.blockY >= 98)
            return new Random(context.pos.asLong()).nextFloat() >= 0.3F ? Blocks.MYCELIUM.defaultBlockState() : Blocks.COARSE_DIRT.defaultBlockState();
        if (context.blockY >= 95) return Blocks.COARSE_DIRT.defaultBlockState();//高度为97到95的方块替换为砂土
        //使用自NoiseThresholdConditionSource，创建噪音函数并获取位置的噪音值。这一值一般位于+-0.75之间，不同噪音可能有所差异
        double noise = context.randomState.getOrCreateNoise(Noises.PILLAR).getValue(context.blockX, 0, context.blockZ);
        if (noise > 0.6D) {//根据噪音值的不同范围生成不同的方块
            //我们创建了getState方法来帮助我们判断目标方块在最上方还是次上方
            return getState(Blocks.MYCELIUM.defaultBlockState(), Blocks.COARSE_DIRT.defaultBlockState());
        } else if (noise > 0.3D) {
            //在特定区间内进行随机，这使得两种生成之间有过渡效果。
            return new Random(context.pos.asLong()).nextFloat() * 0.3F < noise - 0.3D ? getState(Blocks.MYCELIUM.defaultBlockState(), Blocks.COARSE_DIRT.defaultBlockState()) : getState(Blocks.GRAVEL.defaultBlockState(), Blocks.ANDESITE.defaultBlockState());
        } else if (noise > 0.2D) {
            return getState(Blocks.GRAVEL.defaultBlockState(), Blocks.ANDESITE.defaultBlockState());
        } else if (noise > -0.2D) {
            return new Random(context.pos.asLong()).nextFloat() * 0.4F < noise + 0.2D ? getState(Blocks.GRAVEL.defaultBlockState(), Blocks.ANDESITE.defaultBlockState()) : getState(Blocks.ANDESITE.defaultBlockState(), Blocks.DIRT.defaultBlockState());
        } else if (noise > -0.6D) {
            return new Random(context.pos.asLong()).nextFloat() * 0.5F < noise + 0.8D ? getState(Blocks.ANDESITE.defaultBlockState(), Blocks.DIRT.defaultBlockState()) : null;
        } else {
            return new Random(context.pos.asLong()).nextFloat() < 0.1F ? getState(Blocks.ANDESITE.defaultBlockState(), Blocks.DIRT.defaultBlockState()) : null;
        }
    }

    private BlockState getState(BlockState surfaceState, BlockState groundState) {
        if (context.stoneDepthAbove > 3 || context.blockY <= 56) {//如果位置深度大于3或者位置低于y=56，则返回null，这将使其掉入默认生成
            return null;
        } else if (context.stoneDepthAbove <= 1) {//如果是表层方块，返回第一种
            return surfaceState;
        } else {//如果是次表层方块，返回第二种
            return groundState;
        }
    }
}
```

最后我们需要把新创建的RuleSource的CODEC注册，使用注册键`Registries#MATERIAL_RULE`