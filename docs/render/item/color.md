---
description: 宝宝早教之各种颜色的物品
writers:
  - AW-CRK14
versions:
  id: "color"
  vanilla: "1.20.x"
  loaders:
    - text: "Neoforge 20.4.80-beta"
      loader: "neoforge"  
---

# 物品颜色(ItemColor)

在原版的诸如药水，刷怪蛋等物品上，对于不同的种类会有不同的颜色。很显然，如果每创建一种药水或刷怪蛋都要求绘制一个专用贴图，将会是不便而臃肿的。因此，Minecraft中使用`ItemColor`系统来处理这种情况。

在下文中，我们将会以刷怪蛋为例讲述这部分内容。

## ItemColor的优势与局限

`ItemColor`的优势是，对于只需要简单调色的物品，可以直接根据您输入的颜色与指定的材质，进行变色处理。这一过程是分层的，意味着您的一个物品如果有多层(layer)，您可以对每一层进行单独的颜色处理。

其局限性也较为明显，即只能做到颜色上的整体变化，对于更深入的形状变化或颜色的分区域变化，其无能为力。

## ItemColor的使用

这一功能的使用只需要监听相应的事件(`RegisterColorHandlersEvent.Item` mod总线 仅客户端)即可。让我们以刷怪蛋为例:

```java
public class DeferredSpawnEggItem extends SpawnEggItem {
    //省略其它内容
    @Mod.EventBusSubscriber(value = Dist.CLIENT, modid = "neoforge", bus = Mod.EventBusSubscriber.Bus.MOD)
    private static class ColorRegisterHandler {
        @SubscribeEvent(priority = EventPriority.HIGHEST)
        public static void registerSpawnEggColors(RegisterColorHandlersEvent.Item event) {
            MOD_EGGS.forEach(egg -> event.register((stack, layer) -> egg.getColor(layer), egg));
        }
    }
}
```

在这一事件的监听中，neoforge遍历所有注册的怪物蛋(`MOD_EGGS.forEach`)，对于每一个蛋，都使用其自带的`getColor`方法获取这一层(怪物蛋物品有两层，您可以看到它的两种颜色区域其实是两层分别调色后组装的结果)对应的x16颜色。

在此之后，将这套逻辑与物品绑定，进行注册。

注：在`RegisterColorHandlersEvent`类下还有相应的，为方块进行调色的事件。原理相似。

## ItemColor的原理

事件中保有一个`ItemColors`变量，这一实例用于总控所有材质调色内容。在使用事件注册了颜色后，内容都将在这里进行存储。

在`ItemRenderer#renderQuadList`方法中，也就是物品渲染阶段，将会从其中拉取颜色进行运算处理，统一烘培。这涉及到底层的着色原理，因此在此不进行升入研讨。
```java
public void renderQuadList(PoseStack pPoseStack, VertexConsumer pBuffer, List<BakedQuad> pQuads, ItemStack pItemStack, int pCombinedLight, int pCombinedOverlay) {
    boolean flag = !pItemStack.isEmpty();
    PoseStack.Pose posestack$pose = pPoseStack.last();

    for (BakedQuad bakedquad : pQuads) {
        int i = -1;
        if (flag && bakedquad.isTinted()) {
            i = this.itemColors.getColor(pItemStack, bakedquad.getTintIndex());
        }

        float f = (float) (i >> 16 & 0xFF) / 255.0F;
        float f1 = (float) (i >> 8 & 0xFF) / 255.0F;
        float f2 = (float) (i & 0xFF) / 255.0F;
        pBuffer.putBulkData(posestack$pose, bakedquad, f, f1, f2, 1.0F, pCombinedLight, pCombinedOverlay, true);
    }
}
```

