---
writers:
  - AW-CRK14
  - IAFEnvoy
versions:
  id: "title_screen_entity"
  vanilla: "1.20.x"
  loaders:
    - text: "Forge 1.20.1-47.3.7"
      loader: "forge"
    - text: "Fabric 0.16.3"
      loader: "fabric"
---

# 在主菜单渲染生物实体

由于一般情况下渲染生物实体需要用到该生物实体的实例，而生物实体实例的创建又需要`Level`实例，
这使得在进入世界前渲染生物实体有所困难。

而解决方案之一，便是创建一套简单的“伪世界”来完成构造初始化。

我们在这里以玩家为例：

## 1.创建伪注册管理器与伪网络连接器

```java
//Code from CICADA under MIT license
public class DummyClientPlayNetworkHandler extends ClientPlayNetworkHandler {
    //首先创建一点伪注册表 这里有维度类型，群系和旗帜模板
    public static final Registry<DimensionType> CURSED_DIMENSION_TYPE_REGISTRY = new SimpleRegistry<>(RegistryKeys.DIMENSION_TYPE, Lifecycle.stable());

    static {
        Registry.register(CURSED_DIMENSION_TYPE_REGISTRY, new Identifier(TitleScreenMobs.MOD_ID, "dummy"), new DimensionType(
                OptionalLong.of(6000L), true, false, false, true, 1.0, true, false, -64, 384, 384,
                BlockTags.INFINIBURN_OVERWORLD, DimensionTypes.OVERWORLD_ID, 0.0f, 
                new DimensionType.MonsterSettings(false, true, UniformIntProvider.create(0, 7), 0)
        ));
    }

    private static final Registry<Biome> cursedBiomeRegistry = new SimpleDefaultedRegistry<>("dummy", RegistryKeys.BIOME, Lifecycle.stable(), true) {
        @Override
        public RegistryEntry.Reference<Biome> entryOf(RegistryKey<Biome> key) {
            return null;
        }
    };

    private static final Registry<BannerPattern> cursedBannerRegistry = new SimpleDefaultedRegistry<>("dummy", RegistryKeys.BANNER_PATTERN, Lifecycle.stable(), true);

    private static final DynamicRegistryManager.Immutable cursedRegistryManager = new DynamicRegistryManager.Immutable() {
        //这个奇怪的注册器是专门设计的，将所有请求全部返回同一个注册对象。
        //具体内容请参考文末仓库中的相关类
        private final CursedRegistry<DamageType> damageTypes = new CursedRegistry<>(RegistryKeys.DAMAGE_TYPE, new Identifier("fake_damage"),
                new DamageType("", DamageScaling.NEVER, 0));

        @SuppressWarnings({"unchecked", "rawtypes"})
        @Override
        public Optional<Registry> getOptional(RegistryKey key) {
            var x = Registries.REGISTRIES.get(key);
            //这些注册类型都是level的构造过程中会被用到的，不添加会导致报错
            if (x != null) {
                return Optional.of(x);
            } else if (RegistryKeys.DAMAGE_TYPE.equals(key)) {
                return Optional.of(damageTypes);
            } else if (RegistryKeys.BIOME.equals(key)) {
                return Optional.of(cursedBiomeRegistry);
            } else if (RegistryKeys.DIMENSION_TYPE.equals(key)) {
                return Optional.of(CURSED_DIMENSION_TYPE_REGISTRY);
            } else if (RegistryKeys.BANNER_PATTERN.equals(key)) {
                //旗帜模板是为了兼容模组“锂”
                return Optional.of(cursedBannerRegistry);
            }

            return Optional.empty();
        }

        @Override
        public Stream<Entry<?>> streamAllRegistries() {
            return Stream.empty();
        }
    };
    
    //还需要创建一个伪网络连接器
    private static DummyClientPlayNetworkHandler instance;

    public static DummyClientPlayNetworkHandler getInstance() {
        if (instance == null) instance = new DummyClientPlayNetworkHandler();
        return instance;
    }

    private DummyClientPlayNetworkHandler() {
        super(
                MinecraftClient.getInstance(),
                null,
                new ClientConnection(NetworkSide.CLIENTBOUND),
                MinecraftClient.getInstance().getCurrentServerEntry(),
                MinecraftClient.getInstance().getSession().getProfile(),
                MinecraftClient.getInstance().getTelemetryManager().createWorldSession(true, Duration.of(0, ChronoUnit.SECONDS), null)
        );
    }

    @Override
    public DynamicRegistryManager.Immutable getRegistryManager() {
        return cursedRegistryManager;
    }
}
```

## 2.创建伪世界

```java
//Code from CICADA under MIT license
//我们继承客户端世界
public class DummyClientWorld extends ClientWorld {
    private static DummyClientWorld instance;

    public static DummyClientWorld getInstance() {
        if (instance == null) instance = new DummyClientWorld();
        return instance;
    }

    private DummyClientWorld() {
        super(
                DummyClientPlayNetworkHandler.getInstance(),//使用我们刚刚创建的网络处理器
                new Properties(Difficulty.EASY, false, true),
                RegistryKey.of(RegistryKeys.WORLD, new Identifier(TitleScreenMobs.MOD_ID, "dummy")),
                new CursedRegistryEntry<>(DummyDimensionType.getInstance(), RegistryKeys.DIMENSION_TYPE),
                0,
                0,
                () -> MinecraftClient.getInstance().getProfiler(),
                MinecraftClient.getInstance().worldRenderer,
                false,
                0L
        );
    }

    @Override
    public DynamicRegistryManager getRegistryManager() {
        return super.getRegistryManager();
    }

    public static class DummyDimensionType {
        private static DimensionType instance;

        public static DimensionType getInstance() {
            if (instance == null)
                instance = new DimensionType(OptionalLong.empty(), true, false, false, false, 1.0, false, false, 16, 32, 0, BlockTags.INFINIBURN_OVERWORLD, DimensionTypes.OVERWORLD_ID, 1f, new DimensionType.MonsterSettings(false, false, UniformIntProvider.create(0, 0), 0));
            return instance;
        }
    }
}
```

## 3.创建伪玩家
```java
//Code from CICADA under MIT license
public class DummyClientPlayerEntity extends ClientPlayerEntity {
    private static DummyClientPlayerEntity instance;
    private SkinTextures skinTextures = null;
    private final PlayerEntity player = null;
    private final Text name = null;
    public Function<EquipmentSlot, ItemStack> equippedStackSupplier = slot -> ItemStack.EMPTY;

    public static DummyClientPlayerEntity getInstance() {
        if (instance == null) instance = new DummyClientPlayerEntity();
        return instance;
    }

    private DummyClientPlayerEntity() {
        super(MinecraftClient.getInstance(), DummyClientWorld.getInstance(), DummyClientPlayNetworkHandler.getInstance(), null, null, false, false);
        //为玩家赋予uuid并添加皮肤
        setUuid(UUID.randomUUID());
        MinecraftClient.getInstance().getSkinProvider().fetchSkinTextures(getGameProfile()).thenAccept((textures) -> {
            skinTextures = textures;
        });
    }

    //调整一下一些别的信息
    @Override
    public boolean isPartVisible(PlayerModelPart modelPart) {
        return true;
    }

    @Override
    public SkinTextures getSkinTextures() {
        return skinTextures == null ? DefaultSkinHelper.getSkinTextures(this.getUuid()) : skinTextures;
    }

    @Nullable
    @Override
    protected PlayerListEntry getPlayerListEntry() {
        return null;
    }

    @Override
    public boolean isSpectator() {
        return false;
    }

    @Override
    public boolean isCreative() {
        return true;
    }

    @Override
    public ItemStack getEquippedStack(EquipmentSlot slot) {
        if (player != null) {
            return player.getEquippedStack(slot);
        }
        return equippedStackSupplier.apply(slot);
    }

    @Override
    public Text getName() {
        if (name == null) {
            return super.getName();
        } else {
            return name;
        }
    }
}
```

## 4.使用我们的伪玩家，例如在主菜单渲染

```java
@Mixin(TitleScreen.class)
public class MixinTitleScreen {
    @Inject(method = "render", at = @At("RETURN"))
    private void mobsMainMenu_render(DrawContext context, int mouseX, int mouseY, float delta, CallbackInfo ci) {
        TitleScreen sc = (TitleScreen) (Object) this;
        if (MinecraftClient.getInstance() != null) {
            //在这里渲染假玩家
            ClientPlayerEntity player = DummyClientPlayerEntity.getInstance();
            int height = sc.height / 4 + 132;
            int playerX = sc.width / 2 - 160;
            InventoryScreen.drawEntity(context, playerX - 25, height - 70, playerX + 25, height, 30, 0, mouseX, mouseY, player);
        }
    }
}
```

以上就是其基本逻辑，在实际使用过程中仍然存在一些其它的小问题——您可以参考仓库中的代码进行修改，也期待您给出更优的解决方案。

<ModernUrl icon="/icon/github.png" title="TitleScreenMobs"
url="https://github.com/ArkTechMC/TitleScreenMobs/tree/master/common/src/main/java/com/iafenvoy/tsm"  />