---
writers:
  - AW-CRK14
versions:
  id: "custom_registry"
  vanilla: "1.20.x"
  loaders:
    - text: "Neoforge 20.4.147-beta"
      loader: "neoforge"
---

# 自定义注册类型

显然，如果您想开发一个在某一方面深入且具有可拓展的模组，原版提供的注册种类是远远不够的。
因此，我们需要适时创建我们的自定义注册类型。

自定义注册类型其使用效果和原版一致——都可以使用`DeferredRegister`注册。我们所要做的很简单：
创建类型的注册资源键，创建其注册存储容器，最后注册进总注册表。

假定我们现在有一个类`Element`，嗯，元素。首先我们需要创建其对应的资源键：

```java
public static final ResourceKey<Registry<Element>> ELEMENT_KEY = ResourceKey.createRegistryKey(new ResourceLocation("your_modid", "element"));
```

然后创建对应的注册器，在Neoforge中，我们接下来要这么做：

```java
public static final Registry<Element> ELEMENT = new RegistryBuilder<>(Keys.ELEMENT_KEY).sync(true).create();
```

最后注册进总注册表：

```java
//在modbus中触发
@SubscribeEvent
public static void newRegistry(NewRegistryEvent event) {
    event.register(NewTypeRegistry.ELEMENT);
}
```

再来看看在Fabric里，不需要额外的事件的注册：

```java
public static final Registry<Element> ELEMENT = FabricRegistryBuilder.createSimple(Keys.ELEMENT_KEY).buildAndRegister();
```

好了，完成。现在我们就可以使用延申注册器对`Element`类的实例进行注册了。

如果您想通过id访问实例——就像对别的注册种类，例如Block什么的做的那样——从我们的`Registry\<Element> ELEMENT`实例里拿就行。
同时关于tag等的解析也自带，不需要额外注册。