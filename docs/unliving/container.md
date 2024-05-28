---
writers:
  - AW-CRK14
versions:
   id: "container"
   vanilla: "1.20.x"
   loaders:
      - text: "Neoforge 20.4.80-beta"
        loader: "neoforge"  
---

# 容器(Container)与物品处理(IItemHandler)

在游戏中，我们不难发现，不少可交互的方块都存在着可以与物品互动的特性，比如箱子里存放物品，工作台的制作，堆肥箱的漏斗输入输出。这些功能都与玩家或其它机器与目标方块的物品交换有关，也就是我们的主题，容器。

容器，也就是容纳物品的器具。根据实际使用而言，`Container`其实更应当被视为一个物品的暂存器或者接口。物品处理与容器较为类似，主要内容为`IITemHandler`接口，由neoforge提供。

在开发过程中我们存储物品，可以任意选用。但为了便于在不同的地方使用，您可以创建一个类并继承所有这些接口。

## ItemHandle组项

在游戏中，Neoforge提供的物品能力(`ItemCapability`)使用`ItemHandle`组类。neoforge已经为我们提供了实现案例:

```java
package net.neoforged.neoforge.items;

public class ItemStackHandler implements IItemHandler, IItemHandlerModifiable, INBTSerializable<CompoundTag> {
    //...
}
```

在`ItemStackHandler`类中，拥有一个`NonNullList<ItemStack>`的变量，用于存储一组物品。

- `IItemHandler`接口主要要求了几个物品处理的方法，即物品堆数量，某一索引中的物品堆，存入与取出物品。
- `IItemHandlerModifiable`接口则提供了一个设置索引位置的物品堆的方法。
- `INBTSerializable<CompoundTag>`则是用于解析nbt的方法，用于将nbt解析为实例，或者将实例编码为nbt。

## Container组项

在游戏中，原版的物品存储与漏斗等方块物品交互由`Container`组类提供，在含物品栏的gui中数据处理层(menu)使用此类来负责物品的暂存。

`Container`可以存储物品，也可以作为物品在ui中的暂存(例如信标gui)，或是作为物品交互时的动态访问接口(例如堆肥桶)等。

### Container接口

这是整个组项的根基。相比于`IItemHandler`侧重与物品，`Container`有一些侧重于交互的设计，这使其在gui中拥有更好的表现。

这一接口的内容包括槽位总数，获取、设置与取出物品，在不刷新的情况下清空指定槽位等。对于交互的设计，它有专门的判断槽位可用性(`canPlace/TakeItem`)，标记已更改(`setChanged`)，玩家打开与关闭容器(`start/stopOpen`)等方法的设计。

从内容上来讲，它在交互设计之外的内容与`IItemHandler`有不少重合。在需要的情况下，我们可以将它们同时实现。

在原版中为我们提供了`SimpleContainer`，可以直接使用。但`Container`并未提供方便的序列化与反序列化方法，这使得其保存与加载相对不易。您可以参考上面提到的`ItemStackHandler`中的方法实现来完成加载与保存。

### WorldlyContainer接口

`WorldlyContainer`是对`Container`接口的拓展，这允许容器拥有世界交互功能，也就是和漏斗等方块互动。

- `getSlotsForFace(Direction)`方法需要返回`int[]`，也就是从指定的面可以获取到的容器槽位的索引组。
- `canPlaceItemThroughFace`表示是否允许从某面放入物品。
- `canTakeItemThroughFace`相反，表示是否允许从某面取出物品。

在堆肥桶方块中，还有一个`WorldlyContainerHolder`接口被使用。但是似乎只有其使用了这个接口，因此不详细解释。这里看一下堆肥桶的奇妙小代码：

```java
public WorldlyContainer getContainer(BlockState pState, LevelAccessor pLevel, BlockPos pPos) {
    int i = pState.getValue(LEVEL);//通过方块状态获取数值。嗯，是的，堆肥桶没有方块实体。
    if (i == 8) {//在存满情况下，返回一个输出容器。这个容器中设置了仅能向下输出，为一个骨粉
        return new ComposterBlock.OutputContainer(pState, pLevel, pPos, new ItemStack(Items.BONE_MEAL));
    } else {//在0至6状态下，返回一个输入容器，允许投入物品。7状态下创建一个空容器且不允许交互。
        return (WorldlyContainer) (i < 7 ? new ComposterBlock.InputContainer(pState, pLevel, pPos) : new ComposterBlock.EmptyContainer());
    }
}
```
