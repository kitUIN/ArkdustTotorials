---
description: 主动发送一些包含任意数据的网络包
---

# 自定义数据包

### 想要发送的数据

通常我们会用一个类来表示，由于是高版本我们可以选择使用`record`替代类

作为示例，我们想要发送玩家按下按键的数据，这个数据包含两个内容：玩家名称与按下的按键

```java
public record KeyPacket(String playerName，int key) {}
```

然后你需要实现接口`CustomPacketPayload`，这就是你的自定义数据包了

```java
public record KeyPacket(String playerName, int key) implements CustomPacketPayload {
    // 这个是网络通道的ID,MOD_ID即为你的modid,key_packet是我自己定义的通道名称
    public static final ResourceLocation ID = new ResourceLocation(MOD_ID, "key_packet");
    // 这里需要实现从FriendlyByteBuf读取,如果没有你的类型的实现则需要自己写
    public KeyPacket(final FriendlyByteBuf buffer) {
        this(buffer.readUtf(), buffer.readInt());
    }
    // 这里需要实现写入FriendlyByteBuf,如果没有你的类型的实现则需要自己写
    @Override
    public void write(final FriendlyByteBuf buffer) {
        buffer.writeUtf(playerName());
        buffer.writeInt(key());
    }
    // 获取通道ID
    @Override
    public ResourceLocation id() {
        return ID;
    }
}
```

`this(buffer.readUtf()，buffer.readInt());` 这是将中间件`FriendlyByteBuf`解包为原始数据，若是你的类型没有自带的实现，你需要自己编写相关实现

`write`方法是用于将原始数据写入到中间件`FriendlyByteBuf` ，若是你的类型没有自带的实现，你需要自己编写相关实现

### 数据接收处理

```java
public class KeyChannelHandler {
    private static final Logger LOGGER = LogUtils.getLogger();
    private static final KeyChannelHandler INSTANCE = new KeyChannelHandler ();
    public static KeyChannelHandler getInstance() {
        return INSTANCE;
    }
    // 这里是我们的客户端接收后处理部分
    public void clientHandle(final KeyPacket data, final PlayPayloadContext context) {
        // 这里的逻辑可以自己编写
        // 由于示例只发给服务端,所以不需要客户端接收
    }
    // 这里是我们的服务端接收后处理部分
    public void serverHandle(final KeyPacket data, final PlayPayloadContext context) {
        // 这里的逻辑可以自己编写
        LOGGER.info("服务端接收数据:PlayerName:{},按键:{}",
                data.playerName(),
                data.key());
    }
}
```

这里我们定义了两个函数`clientHandle`，`serverHandle`作为客户端与服务端接收数据的处理程序

函数的两个参数是固定的，第一个固定为通道的数据包，第二个固定为`PlayPayloadContext`&#x20;

`PlayPayloadContext` 较为常用的是&#x20;

* `context.player()`即获取数据包发送者，这个值可能为空，所以我们可以用`ifPresent`进行判断,若存在则继续
* `context.packetHandler()`可以快速对发包者进行回复
* 默认该处理是运行在网络线程中的，如果你想要运行在主线程,请使用：`context.workHandler()`

```java
        context.player().ifPresent(player -> {
            // Do something
        });
        context.workHandler().submitAsync(() -> {
            blah(data.age());
        })
        .exceptionally(e -> {
            // Handle exception
            context.packetHandler().disconnect(Component.translatable("my_mod.networking.failed", e.getMessage()));
            return null;
        });
```

### 注册我们的数据包

完成以上内容后，还需要将我们的数据包注册，这才可以正常运行

我们在主类中编写：

```java
    public NetworkingExample(IEventBus modEventBus)
    {
        NeoForge.EVENT_BUS.register(this);

        // 添加监听器,用于注册通道
        modEventBus.addListener(this::register); // [!code ++]
    }
    
    public void register(final RegisterPayloadHandlerEvent event) { // [!code ++]
        // 首先我们需要获取自己模组的数据包注册器 // [!code ++]
        final IPayloadRegistrar registrar = event.registrar(MOD_ID); // [!code ++]
        registrar.play(KeyPacket.ID, KeyPacket::new, handler -> handler // [!code ++]
                // 由于不需要客户端接收,所以我们不注册客户端接收处理器 // [!code ++]
                //.client(KeyChannelHandler.getInstance()::clientHandle) // [!code ++]
                // 注册服务端接收处理器 // [!code ++]
                .server(KeyChannelHandler.getInstance()::serverHandle)); // [!code ++]
        // 如果该通道不是必须,可以设置为可选 // [!code ++]
        // 这样连接到未注册该通道的服务端与客户端仍将能够连接。 // [!code ++]
        // registrar.optional(); // [!code ++]
        // 通道可以设置版本号,服务端会与客户端检测版本号,若不一致则无法连接 // [!code ++]
        // registrar.versioned("1.0.2"); // [!code ++]
        LOGGER.info("注册自定义数据包"); // [!code ++]
    }
```

`play`可以理解为注册通道，他有三个参数

* 第一个参数为通道的ID
* 第二个参数为数据包构建方法
* 第三个参数是处理程序的回调，如果你的处理函数是static，可以直接传入

`play`有一个重载可以快速注册客户端和服务端一致的处理器

此外，`IPayloadRegistrar` 还有一些常见的用法

* `optional()` 如果该通道不是必须，可以设置为可选，这样客户端(服务端)连接到未注册该通道的服务端(客户端)仍将能够保持连接
* `versioned(String)`通道可以设置版本号，服务端会与客户端检测版本号，若不一致则无法连接



### 主动发送

我们在把通道注册完毕之后，需要通过一种方式来进行主动发送

```java
public class NetworkUtil {

    // 发送到服务端
    public static void sendToServer(CustomPacketPayload payload) {
        PacketDistributor.SERVER.noArg().send(payload);
    }

    // 发送到客户端
    public static void sendToPlayer(CustomPacketPayload payload, ServerPlayer player) {
        player.connection.send(payload);
    }
}
```

这里我们直接用接口`CustomPacketPayload` 方便让不同的数据包都能使用这个函数


### 示例代码仓库

[示例代码仓库](https://github.com/kitUIN/NetworkingExample)