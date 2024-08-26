---
writers:
  - AW-CRK14
versions:
  id: "container"
  vanilla: "1.20.x"
  loaders:
    - text: "Neoforge 20.4.147-beta"
      loader: "neoforge"
---

# 序：创建一个新维度，我们要干些什么

如果我们想创建一个新的维度——不添加任何特征(`Feature`)与结构(`Structure`)，我们只需要预备三个资源键：

```java
public static final ResourceLocation RL = new ResourceLocation(Arkdust.MODID, "sarcon");//这里可以改成你想要的维度id

public static final ResourceKey<LevelStem> STEM = ResourceKey.create(Registries.LEVEL_STEM, RL);
public static final ResourceKey<DimensionType> TYPE = ResourceKey.create(Registries.DIMENSION_TYPE, RL.withSuffix("_type"));
public static final ResourceKey<NoiseGeneratorSettings> SETTING = ResourceKey.create(Registries.NOISE_SETTINGS, RL);

//这一个不是必要的——游戏会帮我们在相应的地方自动注册。这只是方便我们的跨维度传送代码的书写。
public static final ResourceKey<Level> LEVEL = ResourceKey.create(Registries.DIMENSION, RL);
```

::: tip

为了方便后续的讲解，我先把我们需要的数据生成部分的代码放在这里，`your_modid`请替换为您的modid：

```java

@Mod.EventBusSubscriber(modid = "your_modid", bus = Mod.EventBusSubscriber.Bus.MOD)
public class ModBusConsumer {
    private static final RegistrySetBuilder BUILDER = new RegistrySetBuilder()
            .add(Registries.NOISE_SETTINGS, NoiseGenSettingRegistry::bootstrap)
            .add(Registries.DIMENSION_TYPE, DimensionTypeRegistry::bootstrap)
            .add(Registries.LEVEL_STEM, LevelStemRegistry::bootstrap)
            .add(Registries.BIOME, BiomeRegistry::bootstrap);

    @SubscribeEvent
    public static void gatherData(GatherDataEvent event) {
        DataGenerator generator = event.getGenerator();
        PackOutput output = event.getGenerator().getPackOutput();
        ExistingFileHelper fileHelper = event.getExistingFileHelper();
        CompletableFuture<HolderLookup.Provider> lookup = event.getLookupProvider();
        generator.addProvider(event.includeServer(), new DatapackBuiltinEntriesProvider(output, lookup, BUILDER, Collections.singleton("your_modid")));
    }
}
```

:::

其中，维度类型(`DimensionType`)决定了这个维度的一些基本行为逻辑，例如最小和最大高度，有无天光，是否会下雨，是否允许使用床以及怪物生成情况等一系列简单逻辑。
我们可以使用数据生成来帮我们快速生成对应的json文件：

```java
public class DimensionTypeRegistry {
    public static void bootstrap(BootstapContext<DimensionType> context) {
        context.register(SarconDimension.TYPE, new DimensionType(OptionalLong.empty(), true, false, true, false, 0.00001, true, false,
                0, 304, 304, BlockTags.INFINIBURN_OVERWORLD, BuiltinDimensionTypes.OVERWORLD_EFFECTS, 0, new DimensionType.MonsterSettings(true, true, UniformInt.of(0, 6), 9)));
    }
}
```

这里各个参数的意义可以根据`DimensionType`
下的参数签名参考[minecraft wiki的对应篇目](https://zh.minecraft.wiki/w/%E7%BB%B4%E5%BA%A6%E7%B1%BB%E5%9E%8B?variant=zh-cn)

而噪音生成设置(`NoiseGeneratorSettings`)存储了世界生成过程中所需要的一系列信息：

```java
public class NoiseGenSettingRegistry {
    public static void bootstrap(BootstapContext<NoiseGeneratorSettings> context) {
        context.register(SarconDimension.SETTING, new NoiseGeneratorSettings(NoiseSettings.create(0, 160, 2, 2), Blocks.STONE.defaultBlockState(), Blocks.WATER.defaultBlockState(),
                Router.sarconRouter(context.lookup(Registries.DENSITY_FUNCTION), context.lookup(Registries.NOISE)),
                new SarconDimension.SurfaceSource(),//TODO SurfaceRule required
                List.of(), 64, false, false, false, true));
    }
}
```

这里的`NoiseSettings.create(0, 160, 2, 2)`的前两个参数分别是允许的最小和最大生成高度；
后两个参数则是胞的x与z方向长度，我们会在基于噪音的区块生成器(`NoiseBasedChunkGenerator`)处再提到它。

其它参数都可以参照签名与[wiki](https://minecraft.fandom.com/zh/wiki/%E8%87%AA%E5%AE%9A%E4%B9%89%E4%B8%96%E7%95%8C%E7%94%9F%E6%88%90)
查询用途，那个留空的list是用于根据气候参数处理玩家出生点偏好的。

这里我们着重强调两个点：

- `Router.sarconRouter`这一句用于提供一个`NoiseRouter`，
  这里面包含了整个世界生成阶段所需要的所以密度函数(`DensityFunction`)，
  用途包括但不限于决定岩浆与水的扩散，气候六分量，矿脉以及地形生成。
- `new SarconDimension.SurfaceSource()`这里我们传入一个地表规则，用于处理地表放置的方块。

这俩都是世界生成里的重头戏，我们会在之后开专门的篇章来强调。

最后就是`LevelStem`了，这个我不知道应该翻译成什么，用于将维度类型，噪音设置与区块生成器进行绑定：

```java
public class LevelStemRegistry {
    public static void bootstrap(BootstapContext<LevelStem> bootstrap) {
        HolderGetter<Level> levelGetter = bootstrap.lookup(Registries.DIMENSION);
        HolderGetter<DimensionType> levelTypeGetter = bootstrap.lookup(Registries.DIMENSION_TYPE);
        HolderGetter<Biome> biomeGetter = bootstrap.lookup(Registries.BIOME);
        HolderGetter<NoiseGeneratorSettings> noiseGetter = bootstrap.lookup(Registries.NOISE_SETTINGS);
        bootstrap.register(SarconDimension.STEM, new LevelStem(levelTypeGetter.getOrThrow(SarconDimension.TYPE), new NoiseBasedChunkGenerator(new SarconDimension.Source(biomeGetter), noiseGetter.getOrThrow(SarconDimension.SETTING))));
    }
}
```

在将这些数据包生成完成后，我们就可以使用

```java
static {
    player.teleportTo(sarcon, pos.getX(), pos.getY(), pos.getZ(), player.getYRot(), player.getXRot());
}
```

把我们传送到新维度了。