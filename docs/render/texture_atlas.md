---
description: (很多很多的图片.png)
writers:
  - AW-CRK14
---

# TextureAtlas纹理图集

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