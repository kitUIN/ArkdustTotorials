---
description: (很多很多的图片.png)
writers:
  - AW-CRK14
versions:
  id: "texture_atlas"
  vanilla: "1.20.x"
  loaders:
    - text: "Neoforge 20.4.80-beta"
      loader: "neoforge"  
---

# 纹理图集(TextureAtlas)

让我们先来假象一个场景：
> 一位优质的模组开发者正在设计一个文件盒。按照设计，这个盒子可以存入指定的，任意数量本附魔书，并且会根据存放的数量占最大数量的比值在方块内指定高度渲染一张没有被任何模型引用的材质。  
> 他的想法是:使用BlockEntityRenderer，根据方块的位置处理`PoseStack`的位置，计算四个顶点，然后通过资源路径将材质绑定到顶点上，从而渲染出这张贴图。

提问:在不考虑代码问题的前提下，这个流程是否完整？

有异议！(拍桌) 这一过程存在一个致命的缺陷:我们可以注意到，整个过程中没有绑定过贴图，顶点信息里也不需要指定贴图:
```java
public void render(BlueprintReduceBoxBE be, float partialTicks, MatrixStack matrixStackIn, IRenderTypeBuffer bufferIn, int combinedLightIn, int combinedOverlayIn){
    matrixStackIn.pushPose();
    matrixStackIn.translate(0.5, 0, 0.5);
    matrixStackIn.mulPose(be.getBlockState().getValue(BlockStateProperties.HORIZONTAL_FACING).getRotation());
    matrixStackIn.scale(0.0625F, 0.0625F, 0.0625F);

    TextureAtlasSprite i = someMethod();

    BufferBuilder buffer = (BufferBuilder) bufferIn.getBuffer(RenderType.cutout());
    if (be.getCount() != 0) {
        float height = 1 + 8 * ((float)be.getCount()/be.getMaxContain());

        Matrix4f m4f = matrixStackIn.last().pose();
        buffer.vertex(m4f, -6, -6, -height).color(255, 255, 255, 255).uv(i.getU0(), center)
                .uv2(combinedLightIn).normal(0, 0, 1).endVertex();
        buffer.vertex(m4f, -6, 6, -height).color(255, 255, 255, 255).uv(i.getU0(), i.getV0())
                .uv2(combinedLightIn).normal(0, 0, 1).endVertex();
        buffer.vertex(m4f, 6, 6, -height).color(255, 255, 255, 255).uv(u1, i.getV0())
                .uv2(combinedLightIn).normal(0, 0, 1).endVertex();
        buffer.vertex(m4f, 6, -6, -height).color(255, 255, 255, 255).uv(u1, center)
                .uv2(combinedLightIn).normal(0, 0, 1).endVertex();

    }
    matrixStackIn.popPose();
}
```
以及，这个TextureAtlasSprite要从哪里获取?

这就要说到这篇的主题:`TextureAtlas`

## 什么是TextureAtlas?

`TextureAtlas`又名纹理图集，简单来说就是把大量材质缝合进一张图片，以减少文件读写的性能开销，提高渲染速度，这是绝大部分游戏都会使用的一种方法。它看上去就像这样:
![clash](/render/texture_atlas1.png)
当然 这张图不完整，很显然有一些物品仍然没有包含在内。在Minecraft游戏原版中，注册了多个TextureAtlas，其中最常用的为BLOCK_ATLAS(`"textures/atlas/blocks.png"`)，其内容包含方块，物品（包括模组额外注册的），潮涌核心，钟，锻造模板等。

在上述的例子中，其所绑定的uv默认就是BLOCK_ATLAS上的uv位置; `TextureAtlasSprite`则包含了其在该纹理图集中的相对位置。这些东西都可以通过对应的TextureAtlas获取。

## 获取TextureAtlas

在游戏完成加载后，我们将可以使用
```java
public void someMethod(){
    //...
    Minecraft.getInstance().getTextureAtlas(InventoryMenu.BLOCK_ATLAS).apply(/**你的资源路径*/);
    //注:在lexforge1.20.1中，InventoryMenu.BLOCK_ATLAS应替换为PlayerContainer.BLOCK_ATLAS
}
```
获取到对应的`TextureAtlasSprite`。这个类中包含了一些基本的材质背景数据以及其在对应的TextureAtlas中的相对位置。同理，你可以用这个方法获取到物品，方块等的贴图。

## 向TextureAtlas上附加材质

在这里我们介绍使用datagen生成我们需要的atlas/xxx.json。如果您想自己手动完成对应的json文件，请直接参考生成出的内容。

如下，给出代码示例:
```java
public class MaterialSpriteAttachGen extends SpriteSourceProvider {
    public MaterialSpriteAttachGen(PackOutput output, CompletableFuture<HolderLookup.Provider> lookupProvider, ExistingFileHelper existingFileHelper) {
        super(output, lookupProvider, BreakdownCore.MODID, existingFileHelper);
    }

    @Override
    protected void gather() {
        SourceList sourceList = atlas(BLOCKS_ATLAS);
        for(Material material : Registry$Material.MATERIAL){
            sourceList.addSource(new SingleFile(material.id.withPath(id -> "brea/material/" + id), Optional.empty()));
        }
        for(MaterialItemType type : Registry$Material.MATERIAL_ITEM_TYPE){
            sourceList.addSource(new SingleFile(type.id.withPath(s -> "brea/mit/" + s),Optional.empty()));
            if(this.existingFileHelper.exists(type.id.withPath(s -> "textures/brea/mit_cover/" + s + ".png"), PackType.CLIENT_RESOURCES)){
                sourceList.addSource(new SingleFile(type.id.withPath(s -> "brea/mit_cover/" + s),Optional.empty()));
            }
        }

        sourceList.addSource(new DirectoryLister("brea/material","brea/material/"));
        sourceList.addSource(new DirectoryLister("brea/mit","brea/mit/"));
        sourceList.addSource(new DirectoryLister("brea/mit_cover","brea/mit_cover/"));
    }
}
```

在这个类中,`SpriteSourceProvider`专门用于处理生成atlases附加的类。我们覆写`gather`方法:
1. 通过atlas方法，传入指定的，需要附加内容的`TextureAtlas`路径，获取一个`SourceList`。我们需要把接下来获取的资源全都加入这个`SourceList`中。
2. 在`Material`的遍历中，我向sourceList中添加了一个SingleFile也就是单个文件。这里需要两个参数，第一个是指定贴图的资源路径，第二个为一个Optional资源路径:若此项不为空，则会将对应的材质以此项获取到的资源路径为id进行注册，否则则使用贴图资源的路径作为id。
3. 在`MaterialItemType`的遍历中，我使用了`ExistingFileHelper`对指定目录下的文件的存在性进行检验。如果存在则进行注册
4. 最后我添加了几个`DirectoryLister`。这一类可以添加指定路径下的所有材质。其中第一个参数指定其材质下的路径前缀，第二个参数指定其在注册时的id前缀。
   > 比如说，我在assets下存在arkdust/textures/brea/material/orirock.png, wf/textures/brea/material/dark_crystal.png, minecraft/textures/brea/material/iron.png  
   > <br>这时我使用`new DirectoryLister("brea/material","mat/")`，这三个文件虽然位于不同modid的包下(arkdust,wf,minecraft)，但都会被获取到。  
   > <br>在这一基础上，它们将会被进行额外处理:首先裁切路径前缀，文件拓展名后缀并转换为资源路径，以第一个为例，变为arkdust:orirock;再添加注册id前缀，变为arkdust:mat/orirock。这就是最终将会被注册进这个textureAtlas的名字。  
   > <br>需要注意的是，当您使用datagen生成模型指定资源路径时，路径查找将会将其默认为包下的材质资源的实际路径;而游戏在加载模型时，则会以这个路径去获取TextureAtlas中的材质。因此，像上面这个例子给出的示例有可能会导致您使用datagen生成的模型出现材质缺失，或者材质路径正确的模型被判定为材质缺失。  
   > <br>为了避免这个问题，您应当使两个参数保持路径等价，即`new DirectoryLister("brea/material","brea/material/")`。或修改模型生成的生成器材质表的访问权限后绕过资源存在判断直接添加材质资源路径。

您可以查看`assets\minecraft\atlases\blocks.json`来观察原版是如何使用json文件为`TextureAtlas`添加材质的。也可以查看`SpriteSource`的实现来获取更多可用的类。