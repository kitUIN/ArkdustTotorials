---
writers:
  - AW-CRK14
versions:
  id: "block"
  vanilla: "1.20.x"
  loaders:
    - text: "Neoforge 20.4.147-beta"
      loader: "neoforge"
---

# 方块 基础

这次咱们来讲讲方块。

在此，我们选用营火作为例子，因为它可以为我们提供状态，模型，交互等功能的案例。
至于其如何烤肉，我们留到方块实体部分再讲。

## 基本概念

就像我们在讲item部分时一样，我们也需要区别两个概念：`Block`与`BlockState`

其二者的关系与`Item`和`ItemStack`的关系相似：`BlockState`是在对于给定的`Block`的基础上，添加额外的信息内容形成的。
这部分内容一般用于处理模型渲染，但也可以作为不精确的数据存储或被用于计算碰撞箱或亮度。

当方块被放置在地上时，将会根据放置背景为其决定状态。
对于大部分方块而言，其方块状态只有一个默认值，例如石头，钻石块，羊毛等等。
而对于一些方块，例如半砖(半砖状态:上，下，全; 是否含水)或营火(是否含水; 是否点燃; 是否为高烟; 放置朝向)等。

作为相同的方块，它们在不同的放置状态下有一些简单的数据属性需要存储，
这些数据中每一组都对应着一个有限元素数量的特质(`Property<>`)；
而一个方块的所有特质的所有变种的遍历，构成了这个方块所有可能的的`BlockState`;
其中的每一特定变种组合，被称为一个`BlockState`。

以篝火为例，它具有32种不同的方块状态 *(是否含水2 * 是否点燃2 * 是否为高烟2 * 水平放置朝向东南西北4 = 32)*，
即使其中有部分状态，例如同时含水和点燃，在正常条件下不存在，它仍然会被保留。

相应的，我们可以说一个"不含水且未被点燃，不具有高烟特性，向东放置的篝火"是"篝火方块"的一个方块状态。

特别的是，正如我们在物品章节提到过的，`BlockState`是单例：这意味着，在程序内部，对于两个不同位置的，
"含水的下半圆石半砖"，它们既是同一个方块(圆石半砖方块)，**也是同一个方块状态实例**。

相区别的，如果我们使用`ItemStack.copy()`创建一个物品堆的副本，虽然它和原物品堆内容一样，
但它们并不是同一实例，对其中一个更改并不会影响到另一个。

## 方块(Block)

方块的注册也是使用拓展注册器(见[注册章节](registration.md))。
其构造时需要一个`方块行为属性(BlockBehaviour.Properties)`，这一类中指定了该方块的一些基本特性，
例如硬度，爆炸抗性，发光亮度，玩家在方块上的跳跃高度因子，摩擦力等等。下面给出其参考：

- `mapColor(DyeColor/MapColor/Function<BlockState, MapColor>)`: 设定方块在地图上的颜色。第三个可以根据方块状态提供不同的颜色。
- `noOcclusion()`: 设定无光吸收，即不会遮挡光。
- `noCollission()`: 在无光吸收的情况下强制使其无碰撞箱。
- `friction(float)`: 摩擦力，粘液块为0.8，冰为0.98，默认为0.6。嗯……怪怪的。粘液块方块内有特定的速度计算方法。
- `speedFactor(float)`: 速度因子。
- `jumpFactor(float)`: 跳跃因子。
- `sound(SoundType)`: 方块的基本交互时的音效组。
- `lightLevel(ToIntFunction<BlockState>)`: 根据方块状态，获取发光强度。
- `strength(float pDestroyTime, float pExplosionResistance)`: 方块的硬度与爆炸抗性。 其相同签名但只有一个参数的方法将二者设定为一样的。
- `instabreak()`: 爆炸抗性与硬度都设为0，这样随便碰一下就会被破坏掉。比如草。
- `randomTicks()`: 为方块启用随机刻，在启用后可以通过覆写相应方法实现随机刻功能。
- `dynamicShape()`: 动态形状。潜影盒，脚手架，石笋等启用了这一特性，但我不清楚具体是干什么的。
- `noLootTable()`: 设置方块无掉落物。
- `dropsLike(Block)/lootFrom(Supplier<? extends Block>)`: 将方块掉落物引用至另一方块。
- `air()`: 是否为空气。洞穴空气方块：在想我的事？

下面还有一些例如红石连接，乐器等，可以自己去研究。

:::danger 注意
和物品一样，**不要在方块内存放任何可变的动态变量**。如果有需要，请使用`Property`或方块实体。

以及，请不要在注册以外的地方创建方块实例。由于其与属性(attribute)系统挂钩，这可能导致一些问题。
:::

在创建了方块实例后，我们就可以通过覆写一些方法来在特定的时候实现对应的功能。
例如，可以覆写`onPlace`,`onRemove`方法处理方块被放置与破坏时的事件，
覆写`entityInside`处理有生物在方块内时的行为，又或是覆写`getCollisionShape`,`getVisualShape`来获取其选择框形状与碰撞箱形状。

更多的内容，您可以在`BlockBehaviour`与`Block`类下深入探究，它可以帮您实现绝大部分您认为或许需要事件来解决的功能。

## 特质(Properties)

在前面我们已经说过，`Property`是有限元素数量的，而且由于要进行变种遍历，将其元素数量设定的很高显然是不合适的。

因此，原版只提供了三种`Property`的默认实现: 拥有是或否两个值的`BooleanProperty`，
数量有限的枚举类的`EnumProperty`以及指定范围内整数的`IntegerProperty`。

它们都需要一个`String name`作为标识id。在将其注册到对应方块后，可以直接通过id获取对应的内容;
同时，也会在模型json文件中作为变种的键名使用。
在原版的`BlockStateProperties`类中提供了大量的预制特质，在需求相同的情况下请尽量使用原版提供的特质。

我们需要在`createBlockStateDefinition`方法中，将我们方块用到的特质进行注册;
我们也可以在方块实体的构造方法里，配置方块的默认`BlockState`。

请看篝火代码(节选):

```java
public class CampfireBlock extends BaseEntityBlock implements SimpleWaterloggedBlock {
    protected static final VoxelShape SHAPE = Block.box(0.0, 0.0, 0.0, 16.0, 7.0, 16.0);
    //这里引用了几个Property
    public static final BooleanProperty LIT = BlockStateProperties.LIT;
    public static final BooleanProperty SIGNAL_FIRE = BlockStateProperties.SIGNAL_FIRE;
    public static final BooleanProperty WATERLOGGED = BlockStateProperties.WATERLOGGED;
    public static final DirectionProperty FACING = BlockStateProperties.HORIZONTAL_FACING;
    //就像这样，请保证存储的数据一定为常量(带final)
    private final boolean spawnParticles;
    private final int fireDamage;

    public CampfireBlock(boolean p_51236_, int p_51237_, BlockBehaviour.Properties p_51238_) {
        super(p_51238_);
        this.spawnParticles = p_51236_;
        this.fireDamage = p_51237_;
        //注册默认的方块状态
        this.registerDefaultState(
                this.stateDefinition
                        .any()
                        .setValue(LIT, Boolean.TRUE)
                        .setValue(SIGNAL_FIRE, Boolean.FALSE)
                        .setValue(WATERLOGGED, Boolean.FALSE)
                        .setValue(FACING, Direction.NORTH)
        );
    }

    @Nullable
    @Override
    public BlockState getStateForPlacement(BlockPlaceContext pContext) {
        LevelAccessor levelaccessor = pContext.getLevel();
        BlockPos blockpos = pContext.getClickedPos();
        boolean flag = levelaccessor.getFluidState(blockpos).getType() == Fluids.WATER;
        //根据放置位置有没有水，下方有没有干草块，以及放置时的朝向决定放置的方块状态
        return this.defaultBlockState()
                .setValue(WATERLOGGED, Boolean.valueOf(flag))
                .setValue(SIGNAL_FIRE, Boolean.valueOf(this.isSmokeSource(levelaccessor.getBlockState(blockpos.below()))))
                .setValue(LIT, Boolean.valueOf(!flag))
                .setValue(FACING, pContext.getHorizontalDirection());
    }

    //获取形状部分乱入。用于配置碰撞箱与选择箱。
    @Override
    public VoxelShape getShape(BlockState pState, BlockGetter pLevel, BlockPos pPos, CollisionContext pContext) {
        return SHAPE;
    }

    //将用到的特质进行注册。否则会报错。
    @Override
    protected void createBlockStateDefinition(StateDefinition.Builder<Block, BlockState> pBuilder) {
        pBuilder.add(LIT, SIGNAL_FIRE, WATERLOGGED, FACING);
    }
}
```

## 方法覆写

在minecraft中，被标为`@Deprecated`的方法，大部分并不是被弃用，而是说你可以通过覆写它实现功能。

让我们来看看在篝火方块中覆写的内容：

```java
//使用 就是对着方块右键
@Override
public InteractionResult use(BlockState pState, Level pLevel, BlockPos pPos, Player pPlayer, InteractionHand pHand, BlockHitResult pHit) {
    //这是一些方块实体的东西。先不用看，咱们讲方块实体的时候再聊。
    BlockEntity blockentity = pLevel.getBlockEntity(pPos);
    if (blockentity instanceof CampfireBlockEntity campfireblockentity) {
        ItemStack itemstack = pPlayer.getItemInHand(pHand);
        Optional<RecipeHolder<CampfireCookingRecipe>> optional = campfireblockentity.getCookableRecipe(itemstack);
        if (optional.isPresent()) {
            if (!pLevel.isClientSide
                    && campfireblockentity.placeFood(
                    pPlayer, pPlayer.getAbilities().instabuild ? itemstack.copy() : itemstack, optional.get().value().getCookingTime()
            )) {
                pPlayer.awardStat(Stats.INTERACT_WITH_CAMPFIRE);
                return InteractionResult.SUCCESS;
            }

            return InteractionResult.CONSUME;
        }
    }

    return InteractionResult.PASS;
}

//当实体在方块内
@Override
public void entityInside(BlockState pState, Level pLevel, BlockPos pPos, Entity pEntity) {
    //如果点燃，且生物没有冰霜行者附魔
    if (pState.getValue(LIT) && pEntity instanceof LivingEntity && !EnchantmentHelper.hasFrostWalker((LivingEntity) pEntity)) {
        //……那就烫他的jio！对生物造成火焰伤害
        pEntity.hurt(pLevel.damageSources().inFire(), (float) this.fireDamage);
    }

    super.entityInside(pState, pLevel, pPos, pEntity);
}

//当方块被破坏
@Override
public void onRemove(BlockState pState, Level pLevel, BlockPos pPos, BlockState pNewState, boolean pIsMoving) {
    //如果新的方块和这个不一样
    if (!pState.is(pNewState.getBlock())) {
        BlockEntity blockentity = pLevel.getBlockEntity(pPos);
        if (blockentity instanceof CampfireBlockEntity) {
            //又是方块实体的东西。总之就是把里面的东西掉出来。
            Containers.dropContents(pLevel, pPos, ((CampfireBlockEntity) blockentity).getItems());
        }

        super.onRemove(pState, pLevel, pPos, pNewState, pIsMoving);
    }
}

/**
 * Update the provided state given the provided neighbor direction and neighbor state, returning a new state.
 * For example, fences make their connections to the passed in state if possible, and wet concrete powder immediately returns its solidified counterpart.
 * Note that this method should ideally consider only the specific direction passed in.
 *
 * 根据提供的邻居方向和邻居状态更新提供的状态，返回一个新状态。
 * 例如，栅栏使其连接到通过状态，如果可能的话，湿混凝土粉末立即返回其固化的对应物。
 * 注意，这种方法最好只考虑传入的特定方向。
 *
 * 上面的英文是原本就有的注释。
 */
@Override
public BlockState updateShape(BlockState pState, Direction pFacing, BlockState pFacingState, LevelAccessor pLevel, BlockPos pCurrentPos, BlockPos pFacingPos) {
    //如果含水，为当前位置计划水的流动
    if (pState.getValue(WATERLOGGED)) {
        pLevel.scheduleTick(pCurrentPos, Fluids.WATER, Fluids.WATER.getTickDelay(pLevel));
    }

    //如果下方的方块变动，则根据下方是不是发烟材料(干草块)设定自己的高火焰状态。
    return pFacing == Direction.DOWN
            ? pState.setValue(SIGNAL_FIRE, Boolean.valueOf(this.isSmokeSource(pFacingState)))
            : super.updateShape(pState, pFacing, pFacingState, pLevel, pCurrentPos, pFacingPos);
}

//当弹射物击中方块
@Override
public void onProjectileHit(Level pLevel, BlockState pState, BlockHitResult pHit, Projectile pProjectile) {
    BlockPos blockpos = pHit.getBlockPos();
    //如果弹射物在燃烧，且自己未被点燃也不含水
    if (!pLevel.isClientSide
            && pProjectile.isOnFire()
            && pProjectile.mayInteract(pLevel, blockpos)
            && !pState.getValue(LIT)
            && !pState.getValue(WATERLOGGED)) {
        //在世界放置方块，放置为当前方块状态的点燃变种。
        pLevel.setBlock(blockpos, pState.setValue(BlockStateProperties.LIT, Boolean.valueOf(true)), 11);
    }
}

//旋转与镜像，主要是给存储nbt结构用的。
@Override
public BlockState rotate(BlockState pState, Rotation pRot) {
    return pState.setValue(FACING, pRot.rotate(pState.getValue(FACING)));
}

@Override
public BlockState mirror(BlockState pState, Mirror pMirror) {
    return pState.rotate(pMirror.getRotation(pState.getValue(FACING)));
}
```

这是它的注册，当然，我们的注册应当使用`DeferredRegister`。

```java
public static final Block CAMPFIRE = register(
        "campfire",
        new CampfireBlock(
                true,
                1,
                BlockBehaviour.Properties.of()
                        .mapColor(MapColor.PODZOL)
                        .instrument(NoteBlockInstrument.BASS)
                        .strength(2.0F)
                        .sound(SoundType.WOOD)
                        .lightLevel(litBlockEmission(15))
                        .noOcclusion()
                        .ignitedByLava()
        )
);
```

这里额外提一嘴这个`litBlockEmission(15)`：

```java
private static ToIntFunction<BlockState> litBlockEmission(int pLightValue) {
    return state -> state.getValue(BlockStateProperties.LIT) ? pLightValue : 0;
}
```

这就是之前说过的，方块状态可以影响方块亮度等信息；以及可以通过指定种类的property来获取状态对应的数据。
这里的`BlockStateProperties.LIT`，对应有`public static final BooleanProperty LIT = BooleanProperty.create("lit")`。
而您即使将其换为`state -> state.getValue(BooleanProperty.create("lit")) ? pLightValue : 0`，
它们的id与数据种类相同，仍可以正常运作。

另见:`SimpleWaterloggedBlock`接口，为可以含水的方块提供的快捷接口，
只要这个方块注册了`BooleanProperty WATERLOGGED = BooleanProperty.create("waterlogged");`特质就能正常使用。

不要忘了给方块注册对应的方块物品！只有注册了，它才能在物品栏中被获取。如果您使用的是`DeferredRegister.Items`，
您可以使用`registerSimpleBlockItem(String, Supplier<? extends Block>, Item.Properties)`快速为您的方块创建对应的物品。

或者`registerSimpleBlockItem(Holder<Block> block)`……更短了。

## 方块模型

在最后，我们需要为我们的方块配置模型json文件。这一部分基本上就是材质包的范畴了，所以我们不过多赘述，
之后会在数据生成部分提到快速生成的办法。

只需要记住，有三个文件需要创建：

- `blockstates`下的方块同名文件，用于根据方块状态分配对应的模型。有固定(见大部分例如矿石，石头之类的方块的)，
  分配(见红石比较器一类，里面的xyz什么的是轴旋转角度)，随机(见草方块)，组装(见堆肥箱，栅栏等)等。
- `models/block`下，指定的模型的同名文件，单纯的模型层。注意，材质如果使用的是自己包中的，其资源路径要指定对应的命名空间。
- `models/item`下，是方块物品的模型。直接将`parent`设定为上面你的方块模型即可。

剩下的部分，参考原版或其它模组即可。

嗯……至少从16，或许更早以来，它一直没变过。看这个吧。

<ModernUrl icon="/icon/boson.png"
title="Boson x1.16 开发指南"
stitle="Boson"
url="https://boson.v2mcdev.com/block/modelandtextures.html" />