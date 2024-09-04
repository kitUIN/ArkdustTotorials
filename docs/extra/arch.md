---
writers:
  - AW-CRK14
versions:
  id: "arch"
---

# Architectury

在mod开发过程中，有时候我们想让一个mod同时支持多种mod加载器。
显然，如果我们为同一个mod的forge，neoforge，fabric版本分别创建一个项目分别开发，维护将是一个困难的任务——
因此，Architectury应运而生。

`Architectury`是一款用于多加载器联合开发的工具，其`Architectury API`为ForgeAPI与FabricAPI的抽象化调用API。
简单来说，它能帮助我们同时开发不同模组加载器平台的mod，共享大部分代码，并辅助处理加载器的专有实现的代码。

下文中，`Architectury`我们将简称为arch。

## 开始一个Architectury项目

idea的mcdev插件可以帮我们创建一个arch项目——但由于种种原因，其版本存在一些滞后性。

因此，我们推荐使用[这个网站](https://generate.architectury.dev/)来创建项目。
在设置完左侧的基础信息后，可以在右侧选择需要联合开发的加载器平台。最后点击下方的`Generate template`，生成模板。
最后下载模板，解压，在ide中以项目形式打开，等待gradle构建即可。

## `@ExpectPlatform`注解

有时候，我们用到的功能具有平台实现差异（例如自定义注册种类），但其经过处理可以统一到同一原版类。
我们会希望可以在`common`模块对有关实例进行获取与处理，只将实现部分交由对应平台。

`@ExpectPlatform`用于平台向核心的数据传递。
让我们以自定义注册器为例(关于怎么写自定义注册器请[参考对应章节](../data/custom_registry.md))：

假定我们需要一个元素的自定义注册器——我们在neoforge与fabric分别创建了`Registry\<Element>`，这时我们想在common模块中使用它，
我们首先需要创建用于获取该实例的静态方法：

```java
package a.b.c.registry;

public class RegistryGetter {
    @ExpectPlatform //注意这里 我们标注注解
    public static Registry<Element> getElementRegistry() {
        throw new UnsupportedOperationException();
    }
}
```

然后，以neoforge为例，注意包位置：

```java
package a.b.c.registry.neoforge;//common内包路径接上平台名

public class RegistryGetterImpl {//类名变为原类名+Impl

    //不需要标注注解
    public static Registry<Element> getElementRegistry() {
        //返回你创建的Registry<Element>
        return ELEMENT_REGISTRY_NEOFORGE;
    }
}
```

这样，在neoforge平台，调用`a.b.c.registry.RegistryGetter#getElementRegistry`，获取到的结果就是`ELEMENT_REGISTRY_NEOFORGE`。

同理，在fabric里：

```java
package a.b.c.registry.fabric;//common内包路径接上平台名

public class RegistryGetterImpl {//类名变为原类名+Impl

    //不需要标注注解
    public static Registry<Element> getElementRegistry() {
        //返回你创建的Registry<Element>
        return ELEMENT_REGISTRY_FABRIC;
    }
}
```

这样，在fabric平台，调用方法获得的结果就是`ELEMENT_REGISTRY_FABRIC`。

在不同的平台上运行模组时，使用相同的`getElementRegistry`方法，就可以获取不同平台提供的实例。
这一功能不局限于注册，对于所有你需要进行平台调度的地方都可以使用。

## 拓展注册器

arch提供了一套拓展注册器，可以帮助我们在common模块中注册对象。

其使用方法和forgelike的基本一样。使用`DeferredRegister.create(String modid,ResourceKey\<T> registryKey)`
创建类型为`T`的对象的注册器，比如方块就是`Block`。
然后使用`REGISTER.register(String id,Suppiler\<T> supplier)`就可以创建对应的`RegistrySupplier\<T>`。

对于自定义的注册种类同样有效。之后，你需要在适当的位置使用`DeferredRegister.register()`进行注册。

注意：在fabric中可以直接在mod init中这么使用；但在forge系中，特别是使用了自定义注册种类时，
你需要把这一过程挪至`RegisterEvent`中进行——这个事件每种类型的注册都会触发一次，请保证`register()`方法只被调用一次。

## arch事件

arch同样拥有一套事件系统的api，提供了一些简单的事件。要使用事件，您只需要找到对于的事件处理池，
比如实体事件在`EntityEvent`里。选择你想使用的事件，进行对应的注册即可，例如

```java
static {
    EntityEvent.LIVING_HURT.register((LivingEntity entity, DamageSource source, float amount) -> EventResult.interruptFalse());
}
```