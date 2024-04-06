---
description: 前排提醒：如果不是做物品动画的需求，请尽量使用BakedModel。另外，请尽量保证单个mod创建的BEWLR实例数量为一！
writers:
  - AW-CRK14
versions:
   id: "bewlr"
   vanilla: "1.20.x"
   loaders:
      - text: "Neoforge 20.4.80-beta"
        loader: "neoforge"  
---

# 物品渲染 之<br> BEWLR(BlockEntityWithoutLevelRenderer)

BEWLR，全称应该是`去维度化方块实体渲染器(BlockEntityRenderer)`，这一功能允许你像使用`方块实体渲染器(BlockEntityRenderer)`一样渲染你的物品，包括在gui中的状态，手持时的模型等。游戏原版中，盾牌，三叉戟，潜影贝等在手持或物品栏中时的渲染都是由这套(或者说强关联)系统完成的。

让我们先来了解一下游戏原版中的使用：

## BEWLR与ItemRenderer
模型的加载，烘培，位置处理等内容我们按下不表，直接来到和我们的主题最接近的部分:`ItemRenderer`类(net.minecraft.client.renderer.entity.ItemRenderer)。这一类在客户端Minecraft实例构造时被创建，用于初步处理物品的渲染逻辑。

其中，render方法最值得我们注意。这个方法的传参包含了许多信息:
* `ItemStack` pItemStack: 需要处理的物品堆
* `ItemDisplayContext` pDisplayContext: 其渲染的背景特征，比如GUI，第一人称右手，第三人称左手，地面等
* `boolean` pLeftHand: 表示是否位于左手
* `PoseStack` pPoseStack: 渲染的位置栈
* `MultiBufferSource` pBuffer: (一些渲染用的数据)
* `int` pCombinedLight: 混合光照叠加
* `int` pCombinedOverlay: 混合层叠加
* `BakedModel` pModel: 默认提供的模型

这个方法所包含的基本逻辑就是:
1. 进行模型再处理。对于盾牌，三叉戟，使用指定模型覆盖原有的物品模型。
2. 进行位置移动处理。
3. 进入判断。如果模型为自定义(`isCustomRenderer()`)或为非物品栏/掉落物形式的三叉戟，则使用该物品堆的`IClientItemExtensions`提供的BEWLR渲染器实例，这就是我们将要使用的渲染处理方法。
4. 否则，进入默认渲染，对物品与模型进行一系列位置运算与数据处理。我们所看到的，普通的平面材质物品，以及大部分没有特殊渲染变化的方块都是由此部分处理。

其中，通过`IClientItemExtensions`获取到的对象即为`BlockEntityWithoutLevelRenderer(BEWLR)`，顾名思义，这个类可以辅助方块实体在没有被放置在世界的情况下进行渲染，比如旗帜，床，骷髅等。

所有原版的BEWLR共用一个实例，其基本逻辑也很简单，大概就是判断物品堆，获取对应的需要处理的方块实体(还有三叉戟或者盾牌的手持状态)，再处理位置变换，最后调用方块实体(或者对应模型)的渲染。

## Neoforge官方文档介绍 翻译
<p>
<font color="#888888"> <code>BlockEntityWithoutLevelRenderer</code> is a method to handle dynamic rendering on items. This system is much simpler than the old ItemStack system, which required a BlockEntity, and did not allow access to the ItemStack.</font><br/>
去维度化方块实体渲染器是一种用于处理物品动态渲染的方法。这一系统相比于旧的，请求一个方块实体且不允许直接访问对应物品堆的系统而言更加简单易用。
</p>

<p>
<font color="#888888"> BlockEntityWithoutLevelRenderer allows you to render your item using (some method).</font><br/>
BEWLR 允许你使用

```java
public void renderByItem(ItemStack itemStack, ItemDisplayContext ctx, PoseStack poseStack, MultiBufferSource bufferSource, int combinedLight, int combinedOverlay);
```
方法渲染你的物品
</p>

<p>
<font color="#888888">In order to use an BEWLR, the Item must first satisfy the condition that its model returns true for <code>BakedModel#isCustomRenderer</code>. If it does not have one, it will use the default <code>ItemRenderer#getBlockEntityRenderer</code>. Once that returns true, the Item's BEWLR will be accessed for rendering.</font><br/>
若需使用BRWLR，这个物品必须满足"它的模型在<code>BakedModel#isCustomRenderer</code>方法中返回true(也就是我们上面提到的模型为自定义)"。如果为否，它将会使用<code>ItemRenderer</code>中默认的方块实体渲染器；如果为是，则会使用物品的BEWLR。
</p>


:::tip 注
如果方块的`Block#getRenderShape`被设置为`RenderShape#ENTITYBLOCK_ANIMATED`，那它也会使用BEWLR渲染
:::

<p>
<font color="#888888">To set the BEWLR for an Item, an anonymous instance of <code>IClientItemExtensions</code> must be consumed within <code>Item#initializeClient</code>. Within the anonymous instance, <code>IClientItemExtensions#getCustomRenderer</code> should be overridden to return the instance of your BEWLR:</font><br/>
如果需要为一个物品设置BEWLR，应当在<code>Item#initializeClient</code>中返回一个<code>IClientItemExtensions</code>实例。在这个匿名实例中应覆写<code>IClientItemExtensions#getCustomRenderer</code>方法并返回您自定义的BEWLR。
</p>

```java
// In your item class
@Override
public void initializeClient(Consumer<IClientItemExtensions> consumer) {
consumer.accept(new IClientItemExtensions() {
    @Override
    public BlockEntityWithoutLevelRenderer getCustomRenderer() {
      return myBEWLRInstance;
    }
});
}
```

## BEWLR使用例
1. 创建一个类，继承BlockEntityWithoutLevelRenderer。在这个类中，我们可以覆写renderByItem方法来处理我们的内容渲染，构造参数可以从Minecraft客户端实例中获取:
    ```java
    public class Renderer extends BlockEntityWithoutLevelRenderer {

        Renderer() {
            super(Minecraft.getInstance().getBlockEntityRenderDispatcher(), Minecraft.getInstance().getEntityModels());
        }
    
        @Override
        public void onResourceManagerReload(@Nonnull ResourceManager resourceManager) {
        }
    
        @Override
        public void renderByItem(@Nonnull ItemStack stack, @Nonnull ItemDisplayContext transformType,
                                 @Nonnull PoseStack ps, @Nonnull MultiBufferSource source, int combinedLight,
                                 int combinedOverlay) {
            //你的渲染处理代码
        }
    }
    ```
2. 在物品中，指定你的BEWLR:
   ```java
   //在某处，创建你的BEWLR实例
   public static final BlockEntityWithoutLevelRenderer RENDERER = new Renderer();
   
   //在你的item类中
   public void initializeClient(@Nonnull Consumer<IClientItemExtensions> consumer) {
        consumer.accept(new IClientItemExtensions() {
            @Override
            public BlockEntityWithoutLevelRenderer getCustomRenderer() {
                return RENDERER;
            }
        });
   }
   ```
   
3. 在物品的父模型设置为`minecraft:builtin/entity`，这一父模型的`isCustomRenderer()`为true，将引导使用BEWLR:
   ```json
   {
      "parent": "minecraft:builtin/entity"
   }
   ```
   
:::danger 注意
在渲染一个物品的时候，将会遍历处理所有BEWLR实例。因此，请尽量保证你的mod中使用尽量少的实例，以减少性能负担。
:::

完成如上配置后，您就可以使用BEWLR来处理您的物品了。