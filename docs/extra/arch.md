---
writers:
  - AW-CRK14
versions:
  id: "arch"
---

# Architectury

在开发 Minecraft mod 时，可能需要让一个 mod 支持多个 mod 加载器平台。为了避免为每个平台
（如 Forge、NeoForge、Fabric）分别创建和维护一个独立的项目，我们可以使用 Architectury。

`Architectury` 是一个多加载器平台开发工具，其 `Architectury API` 提供了对 ForgeAPI 和 FabricAPI 的抽象调用接口。
简而言之，它帮助我们在不同的模组加载器平台上同时开发 mod，实现代码的共享，并简化处理加载器专有实现的工作。

在本文中，我们将简称 `Architectury` 为 `arch`。

## 开始一个 Architectury 项目

虽然 IntelliJ IDEA 的 mcdev 插件可以帮助创建 arch 项目，
但由于版本更新滞后，推荐使用[这个网站](https://generate.architectury.dev/)来创建项目。步骤如下：

1. 在网站上填写左侧的基础信息。
2. 在右侧选择需要联合开发的加载器平台。
3. 点击下方的 `Generate template` 按钮生成模板。
4. 下载模板，解压缩，并在 IDE 中以项目形式打开，等待 Gradle 构建完成即可。

## `@ExpectPlatform` 注解

在某些情况下，我们需要的功能在不同平台上有不同的实现（例如自定义注册种类）。为了在 `common`
模块中处理通用内容，将平台特定的实现留给对应的平台模块，我们可以使用 `@ExpectPlatform` 注解。

假设我们需要一个元素的自定义注册器，在 NeoForge 和 Fabric 中分别创建了 `Registry<Element>`。在 `common`
模块中使用时，我们需要创建一个静态方法来获取该实例：

```java
package a.b.c.registry;

public class RegistryGetter {
    @ExpectPlatform // 注意这个注解
    public static Registry<Element> getElementRegistry() {
        throw new UnsupportedOperationException();
    }
}
```

对于 NeoForge 平台，创建如下实现：

```java
package a.b.c.registry.neoforge; // 在 common 内包路径后加上平台名

public class RegistryGetterImpl { // 类名变为原类名 + Impl

    // 不需要标注 @ExpectPlatform 注解
    public static Registry<Element> getElementRegistry() {
        // 返回你创建的 Registry<Element>
        return ELEMENT_REGISTRY_NEOFORGE;
    }
}
```

在 Fabric 平台，创建如下实现：

```java
package a.b.c.registry.fabric; // 在 common 内包路径后加上平台名

public class RegistryGetterImpl { // 类名变为原类名 + Impl

    // 不需要标注 @ExpectPlatform 注解
    public static Registry<Element> getElementRegistry() {
        // 返回你创建的 Registry<Element>
        return ELEMENT_REGISTRY_FABRIC;
    }
}
```

在不同平台上运行 mod 时，调用 `a.b.c.registry.RegistryGetter#getElementRegistry`
方法，将会获取到不同平台的实例。这个功能不仅限于注册器，也可以用于所有需要平台调度的地方。

## 拓展注册器

arch 提供了一套拓展注册器，用于在 common 模块中注册对象。其用法类似于 Forge 的注册器。
使用 `DeferredRegister.create(String modid, ResourceKey<T> registryKey)` 创建类型为 `T`的注册器， 例如方块是 `Block`。
然后使用 `REGISTER.register(String id, Supplier<T> supplier)`来创建对应的 `RegistrySupplier<T>`。

对于自定义注册种类，同样适用。注册时，需在适当的位置调用 `DeferredRegister.register()` 方法。

注意：在 Fabric 中可以直接在 mod 初始化中进行注册；
但在 Forge 系中，尤其是使用了自定义注册种类时，需要将注册过程移至 `RegisterEvent` 中进行。
请确保 `register()`方法只被调用一次，因为这个事件会为每种类型的注册触发一次。

## arch 事件

arch 也提供了一套事件系统 API，包括一些简单的事件。
要使用事件，只需找到相应的事件处理池（例如实体事件在 `EntityEvent`中），选择需要的事件并进行注册。例如：

```java
static {
    EntityEvent.LIVING_HURT.register((LivingEntity entity, DamageSource source, float amount) -> EventResult.interruptFalse());
}
```

通过这些功能，Architectury 可以显著简化跨平台 mod 的开发工作，使代码更加整洁、易于维护。