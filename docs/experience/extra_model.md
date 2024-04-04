---
description: 一!物!降!1!5!
writers:
- AW-CRK14
versions:
  id: "extra_model"
  vanilla: "1.20.4"
  loaders:
    - text: "Neoforge 20.4.80-beta"
      loader: "neoforge"  
---

# 额外模型注册
在一些情况下，我们会希望让游戏加载一些没有被物品，方块或其它地方引用的模型以帮助我们进行自定义的渲染。这种情况下，我们可以通过如下方式快速，便捷地使用资源路径引导游戏注册。

---

用于处理这一系列操作的事件是`ModelEvent.RegisterAdditional`。这一事件位于MOD总线上，仅在客户端触发，可以使用`register(ResourceLocation)`方法注册一个指定的路径上的模型。

```java
@Mod.EventBusSubscriber(bus = Mod.EventBusSubscriber.Bus.MOD)
public class EventConsumer$Material {
    @SubscribeEvent
    public static void extraItemModelAttach(ModelEvent.RegisterAdditional event) {
        event.register(new ResourceLocation("arkdust","test/some_model"));
    }
}
```

这将会尝试去获取arkdust资源包下的models/test/some_model.json文件。特别的，你可以使用`ModelResourceLocation`并将其构造中需要的额外字符串(pVariant)设定为`inventory`来使其默认在models/item下寻找模型。

模型加载完成后，可以通过客户端实例的`ModelManager`使用`getModel(ResourceLoaction)`获取模型，传入的参数与之前注册的保持一致即可。

```java
BakedModel model = Minecraft.getInstance().getModelManager().getModel(new ResourceLocation("arkdust","test/some_model"));
```