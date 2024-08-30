---
writers:
  - AW-CRK14
versions:
id: "density_func"
vanilla: "1.20.x"
loaders:
  - text: "Neoforge 20.4.147-beta"
loader: "neoforge"
---

# 密度函数(`DensityFunction`)

在`NoiseRouter`里，我们需要多个密度函数来表示各种信息，这些信息被用于群系的判断，洞穴内流体的生成，地表形状的生成与洞穴的生成等。
在本篇中，我们将以地表形状从2d的数值转化为3d高度为例，以及河流与地形的相互影响，为大家讲解密度函数的基本用法。

密度函数与可能会使用到的噪声，其json文件分别要放在数据包下的相应位置：

![clash](/worldgen/densfunc_path.png)

先提及一个小点：由于密度函数使用一套专门的随机生成器，在同一种子下，在不同时机执行两组相同的密度函数，其所产生的结果完全一致。

在代码中，地表地形对应下面的聚焦：

```java
public record NoiseRouter(
        DensityFunction barrierNoise,
        DensityFunction fluidLevelFloodednessNoise,
        DensityFunction fluidLevelSpreadNoise,
        DensityFunction lavaNoise,
        DensityFunction temperature,
        DensityFunction vegetation,
        DensityFunction continents,
        DensityFunction erosion,
        DensityFunction depth,
        DensityFunction ridges,
        DensityFunction initialDensityWithoutJaggedness,
        DensityFunction finalDensity, // [!code focus]
        DensityFunction veinToggle,
        DensityFunction veinRidged,
        DensityFunction veinGap
) {
}
```

在此我们推荐一个密度函数可视化网站，帮助我们更好的理解与开发：

[https://misode.github.io/worldgen/density-function/](https://misode.github.io/worldgen/density-function/)

## 如何使用该网站？

首先我们将网站调为中文模式，找到这个小地球的标志，选择中文：

![clash](/worldgen/densfunc_web1.png)

介绍一下各个按钮的用途：

![clash](/worldgen/densfunc_web2.png)

由于我们的案例使用2d数值转3d高度，我们希望我们的预览图视图为俯视图而非正视图。我们可以在这里调整：

![clash](/worldgen/densfunc_web3.png)

## 什么是密度函数？

在我的世界中，地形生成依赖于噪声系统——噪声提供了数个输入值，
通常被用作“坐标”(注：这里的坐标并不是指世界坐标，更好的理解应该是在指定位置上的数值)，
并生成一个输出，即为“密度”(Density)。这些密度决定一个位置的方块是被填充(密度大于0)还是被替换为空气(密度小于0)。

然而，未经处理的初始噪音通常会显得混乱而缺乏特色，因此我们需要对它们进行一些额外的计算处理——这些处理由专门的函数完成，就是“密度函数”(`DensityFunction`)。
这些密度函数通过处理原始噪音使其更适合于地形的生成。

## 密度源与噪声(`Noise`)

大部分的密度函数规则都是用于对一个或多个数据进行处理的，但我们仍需要一个最基础的噪音模板来提供处理的“原材料”。

一般情况下，我们使用`噪声`(key=`minecraft:noise`)来为我们提供源。这种源由另一种类，也就是噪声(`Noise`)类提供，同样使用数据包配置。
该网站也提供了噪声的数据包生成与效果预览，点击噪声参数旁边的快捷符号就可以快速查看该噪音预设的内容。

::: warning 注意
在查看噪音预设前记得保存你的密度函数！在进入噪声后使用撤回有可能不会撤回到你密度函数的最后状态。
:::

### 噪声(`minecraft:noise`)

噪声元素是最基础的，可以引用一个噪声的资源路径，并为其指定在xz(水平)与y(竖直)方向上的缩放。
当xz缩放趋近于0时，其数值变化就会越平缓；当某一个缩放数值为0时，该方向上就都会取轴坐标为0时的数值。

### 偏移噪声(`minecraft:shifted_noise`)

偏移噪声是在噪声基础上，允许对噪声在xyz轴上拥有分别的偏移。这分别需要一个密度参数来控制偏移的密度参数。
其原理大概是，当你获取某个坐标(x,y,z)的噪声数值时，会计算这个坐标上三个参数对应的数值，并加在原始坐标上。

::: tip 密度参数
密度参数，在代码中其实就对应着密度函数。但是在其codec解析中存在特别的调度，可以被无形的大手分成三类：

- 常数(`DensityFunctions.Constant`)
- 密度函数引用(`DensityFunctions.HolderHolder`)
- 自定义密度函数

在本质上，这三种其实是一样的，都是密度函数的一种实现。只是在json解析的过程中，前两种被允许简化。
:::

假定我们指定了z上的偏移密度函数为f(x,y,z)，x上的偏移密度函数为g(x,y,z)，
那么实际计算噪声数值时，程序将会取样(x + g(x,y,z), y, z + f(x,y,z))位置的噪声数值。

这也就意味着，当你的某个分量的偏移，例如x，设定为1的话，其实际显示效果应该是往该轴的负方向移动对应距离。

有点像数学里函数图像的位置变化，嗯？

### 其它密度源？

旧混合噪音(`minecraft:old_blended_noise`)一种旧版的自生成噪音，不推荐使用。

末地岛屿(`minecraft:end_islands`)是一种为末地专门设计的噪音发生器，不需要任何参数。
当然，我们也可以自定义我们自己的密度源——这或许需要一点小小的寄数。

### 噪声偏移(`DensityFunctions.ShiftNoise`)

包含三种，`minecraft:shift` `minecraft:shift_a` `minecraft:shift_b`

emmmm……看看啥用吧。来自Wiki。

![clash](/worldgen/densfunc_shift.png)

## 数据再处理

显然，要想使世界丰富多彩，单有几个密度源是远远不够的。我们还需要其它处理器，用于将密度源继续处理，实现我们想要的效果。

### 简单双参数(`DensityFunctions.TwoArgumentSimpleFunction`)

最简单的数学运算，加法(`minecraft:add`，增加)乘法(`minecraft:mul`，乘)与最大值(`minecraft:max`)最小值(`minecraft:min`)。
看名字应该就知道是干什么的了吧。

### 映射(`DensityFunctions.Mapped`)

~~为什么要这么取名呢~~

映射，或者我们更喜欢叫简单单参数数学运算，包含了六种算法，
分别是平方(`minecraft:square`)立方(`minecraft:cube`)绝对值(`minecraft:abs`)，
负值乘半(`minecraft:half_negative`)和负值乘四分之一(`minecraft:quarter_negative`)，
以及挤压(`minecraft:squeeze`)。

解释一下这个负值乘半和负值乘四分之一，这是指在密度数值小于0时，把数据乘以0.5或者0.25。

挤压不算简单数学运算，它在代码里是这个亚子的。我不知道该怎么说它。

```java
private static double transform(DensityFunctions.Mapped.Type pType, double pValue) {
    return switch (pType) {
        //...
        case SQUEEZE -> {
            double d0 = Mth.clamp(pValue, -1.0, 1.0);
            yield d0 / 2.0 - d0 * d0 * d0 / 24.0;
        }
    };
}
```

### 范围选择(`DensityFunctions.RangeChoice`)

范围选择(`minecraft:range_choice`)可以用于根据某个输入在位置上的值进行再分流。在设定了最大与最小值（常数值）后，
可以分别为范围内与范围外分配一个密度参数。

但这有一个小问题，在两个参数的边缘无法进行远距离的平滑过渡（插值距离很短）。因此，可能更多时候样条是一个更好的选择。

## 特殊数据提供器

有一些比较特殊且不太常用的函数，例如三个混合：

`minecraft:blend_alpha`在一定区域内，若都是新版区块，返回1；
`minecraft:blend_offset`则正好相反，若都是新区块返回0。
`blend_density`是它们的合并版，用于新旧版本之间的区块过渡。

在我们的自定义维度中应该是不必使用的——似乎也没用。

还有一个胡须化(`minecraft:beardifier`)，一般情况不需要我们自己配置，而是世界生成阶段默认会执行的，用于在有需要的结构附近平整地形。

## 样条(`Spline`)

样条(`minecraft:spline`)是一种更高自由度，更加好用的值到值映射。它需要一个输入，以及一组关键点；在此基础上就可以按照规律输出结果。

如何理解样条呢？让我们想象一个直角坐标系，其中x为输入数值，y为输出数值。
我们向其中按照位置(key=`location`)从小到大的顺序输入数个关键点，每个关键点都可以配置位置，
导数(就是数学里那个导数，该位置的斜率。key=`derivative`)以及值(key=`value`，可以指定另一个样条)。

在确定位置之后，将他们用平滑的线连接起来，确保每个关键点的三个信息都被满足；这时我们输入值x对应的y也就是输出值。
超出关键点范围的坐标将会按照导数计算。

因此我们不难看出，如果我们有一个密度函数a，那么

```json
{
  "type": "minecraft:spline",
  "spline": {
    "coordinate": "a",
    "points": [
      {
        "location": 1,
        "derivative": 0.5,
        "value": 1
      }
    ]
  }
}
```

这么一个样条，显然与

```json
{
  "type": "minecraft:add",
  "argument1": {
    "type": "minecraft:mul",
    "argument1": {
      "type": "minecraft:add",
      "argument1": "a",
      "argument2": -1
    },
    "argument2": 0.5
  },
  "argument2": 1
}
```

也就是(a-1)*0.5+1等效，就是一个简单的一次函数。

最重要的一点，样条边缘可以拥有平滑的过渡。因此，我们大概可以拿他来模拟一条河的走向，可惜它是闭环的：

```json
{
  "type": "minecraft:cache_2d",
  "argument": {
    "type": "minecraft:spline",
    "spline": {
      "coordinate": {
        "type": "minecraft:noise",
        "noise": "minecraft:calcite",
        "xz_scale": 1.5,
        "y_scale": 0
      },
      "points": [
        {
          "location": -0.05,
          "derivative": 0,
          "value": -0.07
        },
        {
          "location": -0.007,
          "derivative": 0,
          "value": 0
        },
        {
          "location": -0.0005,
          "derivative": 0.1,
          "value": 0.01
        },
        {
          "location": 0.0005,
          "derivative": -0.1,
          "value": 0.01
        },
        {
          "location": 0.007,
          "derivative": 0,
          "value": 0
        },
        {
          "location": 0.05,
          "derivative": 0,
          "value": -0.07
        }
      ]
    }
  }
}
```

![clash](/worldgen/densfunc_spline1.png)

这里我们的-0.07与0.01是随便填的数，在之后的处理中再套一层样条来分配即可。

还记得我们最开始提到的吗？
"由于密度函数使用一套专门的随机生成器，在同一种子下，在不同时机执行两组相同的密度函数，其所产生的结果完全一致。"

这意味着，假定我们又有两个函数b和c，我们现在对a进行一个样条处理，赋予两个关键点，分别是
> (位置为0，导数为0，值为b) 和 (位置为0.5，导数为0，值为mul(0.4,add(b,c)))

嗯，这并非json的真实写法，我们只是这么表示。

在最终输出结果上，你会看到a小于0的部分就是b的图像，大于0.5的部分是(b+c)*0.4的图像。
且在中间区域，b的图像会有连贯的过渡，即“0”半区的b图像和“0.5”半区变浅的b图像会连起来，而不是从中间断开——它们使用同一个种子，生成完全相同。

但还有一个问题：图像的确相同，但在把坐标代入计算的时候仍然会被计算两次——如果情况更加复杂，相同的一串密度函数将被反复执行，这显然是我们不希望的。

因此，我们还得请出一个好东西：缓存。

## 标记(`Marker`)——缓存(`Cache`)与插值(`Interpolated`)

为什么要把插值和缓存放在一起？因为这部分内容的数据处理并非由`DensityFunction`的类完成的，
而是我们之前提到的噪音区块生成器(`NoiseBasedChunkGenerator`)负责的，所有缓存数据都会被存在这里面。

### 我们应该在什么地方标记缓存？ \[待查证]

应该将某个多次使用的密度函数部分提取出来(就是单独放一个json文件)，并在其它密度函数中引用该密度函数时标记缓存；或直接在提取出的部分中进行标记。
否则缓存效果很可能不佳。

当然，这部分本身仍待查找。缓存的触发逻辑比较复杂，而且对于最终是否触发及对世界生成速度的优化仍然存疑。

::: details 仍需测试的内容

缓存的触发与实际效果不明确 需要进行生成时间测试

测试对象：net.minecraft.world.level.levelgen.NoiseBasedChunkGenerator#doFill in
net.minecraft.world.level.levelgen.NoiseBasedChunkGenerator#fillFromNoise

关于在何时标记缓存的初步代码研究：

在`NoiseChunk`中，会使用`mapAll(this::wrap)`方法对密度函数进行包装。

而`warp`方法对应代码

```java
protected DensityFunction wrap(DensityFunction func) {
    return this.wrapped.computeIfAbsent(func, this::wrapNew);
}
```

其中`wrapNew`方法会对标记进行检查，对输入的`HolderHolder`执行`holderholder.function().value()`，这一过程获取到其包装的实例，
理论上该实例由注册表获取，应为单例。

而`wrapped`为一个`HashMap`，对于相同实例会直接合并；同时考虑到`HolderHolder`中存在

```java
public DensityFunction mapAll(DensityFunction.Visitor visitor) {
    return visitor.apply(new DensityFunctions.HolderHolder(new Holder.Direct<>(this.function.value().mapAll(visitor))));
}
```

使得子密度函数也可以被包装，因此在子密度函数内标记缓存可行。

同时，考虑到`HolderHolder`与`Holder`均为record类，而`Holder`包装的内容保持不变，因此以此内容为键可以获取到相同的`Marked`。
因此在密度函数引用时标记可行。

由于相同原理，程序可以将相同的被包裹部分进行实例合并。

考虑到只有基本噪音发生器，特殊数据提供器，缓存和插值，胡须化，容器包装器会向程序请求执行包装，而包装后新的实例中被包装处理的部分将替换相应部分并组成一个新的，
与原密度函数生成效果等效的实例，`wrapped`表在包装结束后将不再有任何数据价值。

:::

### 缓存的逻辑是什么？

在区块生成阶段，程序会对所有的保有的密度函数进行包装，找出缓存，插值与特殊数据源。

在找出缓存与插值后，会将其进行一次转换，由原来的密度函数标记(`Marker`)转换为被标记对象(`Marked`)，并会在其中拥有数据存储变量。

不同的几种缓存的差别在于其缓存量与缓存刷新机制的不同。在此之前，我们需要先了解一下：在噪音区块生成器中，填充区块的逻辑是怎样的。

让我们把视线移至`NoiseBasedChunkGenerator#doFill`，我们挑出一些重要的部分:

```java
private ChunkAccess doFill(Blender pBlender, StructureManager pStructureManager, RandomState pRandom, ChunkAccess pChunk, int pMinCellY, int pCellCountY) {
    //创建区块
    NoiseChunk noisechunk = pChunk.getOrCreateNoiseChunk(p_224255_ -> this.createNoiseChunk(p_224255_, pStructureManager, pBlender, pRandom));
    //ignore heightmap
    ChunkPos chunkpos = pChunk.getPos();
    int minBlockX = chunkpos.getMinBlockX();
    int minBlockZ = chunkpos.getMinBlockZ();
    noisechunk.initializeForFirstCellX();
    BlockPos.MutableBlockPos blockpos$mutableblockpos = new BlockPos.MutableBlockPos();
    //这个元胞高度和宽度对应了我们之前在噪音设置里配置的两个数值 但是都被代码乘以了4
    int cellWidth = noisechunk.cellWidth();
    int cellHeight = noisechunk.cellHeight();
    int xCellCount = 16 / cellWidth;
    int zCellCount = 16 / cellWidth;

    //开始遍历区块内每一个元胞
    for (int xCellIndex = 0; xCellIndex < xCellCount; ++xCellIndex) {
        //这些选择被传入后，输出结果时不再请求坐标
        noisechunk.advanceCellX(xCellIndex);

        for (int zCellIndex = 0; zCellIndex < zCellCount; ++zCellIndex) {
            int lastYSectionIndex = pChunk.getSectionsCount() - 1;//数值等价(最大y-1)/16
            LevelChunkSection levelchunksection = pChunk.getSection(lastYSectionIndex);//区块列内的选择块(16*16*16的这种)选择器，从最高处开始选

            for (int yCellIndex = pCellCountY - 1; yCellIndex >= 0; --yCellIndex) {
                noisechunk.selectCellYZ(yCellIndex, zCellIndex);

                //在一个胞内进行遍历
                for (int yInCell = cellHeight - 1; yInCell >= 0; --yInCell) {
                    int y = (pMinCellY + yCellIndex) * cellHeight + yInCell;//实际y坐标
                    int yInChunk = y & 15;
                    int ySectionIndex = pChunk.getSectionIndex(y);//获取y对应的选择块索引
                    if (lastYSectionIndex != ySectionIndex) {
                        lastYSectionIndex = ySectionIndex;
                        levelchunksection = pChunk.getSection(ySectionIndex);//重新选择
                    }

                    double yPosInCell = (double) yInCell / (double) cellHeight;
                    noisechunk.updateForY(y, yPosInCell);

                    for (int xInCell = 0; xInCell < cellWidth; ++xInCell) {
                        int x = minBlockX + xCellIndex * cellWidth + xInCell;
                        int xInChunk = x & 15;
                        double xPosInCell = (double) xInCell / (double) cellWidth;
                        noisechunk.updateForX(x, xPosInCell);

                        for (int zInCell = 0; zInCell < cellWidth; ++zInCell) {
                            int z = minBlockZ + zCellIndex * cellWidth + zInCell;
                            int zInChunk = z & 15;
                            double zPosInChunk = (double) zInCell / (double) cellWidth;
                            noisechunk.updateForZ(z, zPosInChunk);

                            //计算具体坐标上的方块
                            //......
                        }
                    }
                }
            }
        }

        noisechunk.swapSlices();
    }

    noisechunk.stopInterpolation();
    return pChunk;
}
```

看完代码，我们不难发现，游戏在生成过程中，先遍历xz的元胞，获得元胞列； 在元胞列内，从上往下依次填充每一层。

这时我们就可以看插值和缓存的逻辑了：

### 插值(`NoiseChunk.NoiseInterpolator`)

插值的原理很简单，如果没有缓存且开启了插值模式，就获取元胞八个顶点上的数值进行缓存；这样，在获取胞内的值时，直接使用三次线性插值获取对应点的密度即可。

这看起来是一种节省算力的好方法：在主世界中，其水平与竖直胞大小分别是1与2——这意味着，在每个4\*8\*4的128方块胞内，只需要取样8个点的密度函数值，
如果忽略三次线性插值的带来的性能负担，这一方法将在此步骤上节省约15/16的性能——考虑到区块内胞顶点性能存在数值合并，这一值可能更高。

::: details 关于插值的笔记

在`NoiseInterpolator#selectCellYZ`内我们不难发现，当一个胞请求八个顶点的数值时，其实是从两个已预备的二次数组中直接拿取的。
考虑到传入信息为yz的胞索引，而x为外侧的遍历，以及代码中出现的`+1`，不难发现`slice0` `slice1`分别代表着x初位与末位，
且对xyz都只取样了胞的顶点。

同时，由于`NoiseInterpolator#swapSlices`交换了`slice0`与`slice1`，而在x胞遍历的`NoiseChunk#advanceCellX`
中重新填充了`slice1`，这意味着slice二次数组每个被复用了一次。这意味着，在不考虑区块边界的情况下，每一个顶点数据被八个元胞使用过。

忽略线性插值性能影响的话，其性能占用只为不使用插值的1/128。

但为什么还是这么慢呢。
:::

### 缓存2d(`NoiseChunk.Cache2D`)

缓存2d保有一个缓存数值，一个x与一个z。当xz中的一个变化时，缓存将被新位置的值覆盖。

但考虑到在胞内遍历顺序为 z <- x <- y，也就是说在y未改变的情况下水平遍历，这种缓存就显得有些幽默。

因此，如果您想缓存平面内的数据，您可能需要考虑使用平面缓存。

还是有好消息的：它相比缓存一次可以少存储一个y数据。

### 缓存一次(`NoiseChunk.CacheOnce`)

相比于缓存2d多了记录一个y，y变化也会引起缓存刷新。虽然说这俩的坐标记录都是使用的long。

计算性能开销减小了一点，嗯？

### 平面缓存(`NoiseChunk.FlatCache`)

就像它的名字，可以缓存平面上的数值。在区块被创建时缓存就被填充。

但有一个小问题：它的最小缓存最小单元是4*4，这意味着如果单纯使用它而不使用插值，你的世界会变成一团团大马赛克。

不是哥们 bugjump你不能给咱整点能用的平面缓存吗。

### 胞内缓存(`NoiseChunk.CacheAllInCell`)

仅在世界生成过程中被程序自动添加。自定义密度函数**请不要使用**。

## y梯度递减/y钳制梯度(`NoiseChunk.YClampedGradient`)

前面我们提到过，在密度小于0时，位置将被填充为空气。以上面的河流为例，我们为其源噪音指定了y乘数因子为0，如果我们直接将其作为密度函数进行生成，
其最终效果将会是：在河流部分，整个世界竖直镂空，其它区域全部填充。

为此，我们还需要进行一点额外的处理：为整个世界的密度函数添加一层y梯度递减。

如果我们在最低位置设置一个大的值，最高位置设置一个小的值(小于0)，并把这个值与原函数相加，我们就可以生成出高低起伏的效果了，对地表起伏之类的也是同理。

这种方法和原版主世界生成不太一样——原版在地形起伏的生成上是直接采用三维噪音，这使得原版可以生成一些空岛与地形水平凹陷；
而我们的做法在不添加额外的处理(比如洞穴等)时，不会出现上方有方块而下方悬空的情况。

同时，这需要我们在整体地形设计时对数值有一个基本把握：多高为世界平均高度，y在每方块上密度递减多少。
假定我们的中心面为64，在32到128上每格递减0.01，拥有原密度函数f，我们就可以按照如下方法使用：

```json
{
  "type": "minecraft:add",
  "argument1": {
    "type": "minecraft:y_clamped_gradient",
    "from_y": 32,
    "to_y": 128,
    "from_value": 0.32,
    "to_value": -0.64
  },
  "argument2": "f"
}
```

## 自定义密度函数

有时候我们可能会觉得，原版提供的密度函数还不够丰富，不能很好的满足我们的需求。这时候您可以考虑自定义密度函数。

如果您只想做一个普通的，提供数值或修改数值的密度函数，您可以直接实现`DensityFunction.SimpleFunction`
或`DensityFunctions.PureTransformer`接口。前者用于提供数据，后者用于处理数据，非常简单。

`SimpleFunction`的核心方法是`DensityFunction#compute`，您可以从它的传参中获取采样位置。

当然，别忘了为他们配置`Codec`，也别忘了把他们的`Codec`进行注册——其注册键在`Registries#DENSITY_FUNCTION_TYPE`。

## 实例：来点沙漠和绿洲吧

假设我们现在想设计一个沙漠维度，具有下面的特征：

在维度中分布着一些绿洲区域，这些绿洲内部有低地可以形成湖泊，连续的河流，且边缘有大坡；在绿洲外的沙漠，地表存在类似沙脊的特殊起伏；
且沙漠中存在旧河道凹陷，不连续，但走向和绿洲中的河流相连。

这部分 我会给出示例密度函数。具体效果可以自己在之前推荐的网站里看。

### 第一步 确定绿洲区域生成

我们直接采用一个纯噪音，用噪音的输出数值决定是绿洲还是沙漠：

```json
{
  "type": "minecraft:noise",
  "noise": "minecraft:noodle_thickness",
  "xz_scale": 0.35,
  "y_scale": 0
}
```

经过调整发现，在0.5位置作为绿洲递减开始位置，0.65位置作为绿洲边缘递减结束位置比较合适。

### 第二步 完成绿洲地表生成函数

我们将其命名为`oasis.json`：

::: details 点击查看json内容

```json
{
  "type": "minecraft:min",
  "argument1": {
    "type": "minecraft:mul",
    "argument1": {
      "type": "minecraft:add",
      "argument1": {
        "type": "minecraft:clamp",
        "input": {
          "type": "minecraft:noise",
          "noise": "minecraft:ice",
          "xz_scale": 0.4,
          "y_scale": 0
        },
        "min": 0,
        "max": 0.5
      },
      "argument2": {
        "type": "minecraft:clamp",
        "input": {
          "type": "minecraft:noise",
          "noise": "minecraft:badlands_surface",
          "xz_scale": 0.75,
          "y_scale": 0
        },
        "min": 0.05,
        "max": 0.7
      }
    },
    "argument2": 0.075
  },
  "argument2": {
    "type": "minecraft:spline",
    "spline": {
      "coordinate": {
        "type": "minecraft:noise",
        "noise": "minecraft:surface_secondary",
        "xz_scale": 0.4,
        "y_scale": 0
      },
      "points": [
        {
          "location": -1,
          "derivative": 0,
          "value": -0.04
        },
        {
          "location": -0.3,
          "derivative": 0,
          "value": 0
        },
        {
          "location": 0.5,
          "derivative": 1,
          "value": 0.8
        }
      ]
    }
  }
}
```

:::

这就是单纯的混合，调试，凭感觉走就行。注意这里的数值分布，我们已经决定以`0.01/m`为y递减速率，这里的数值分布要符合我们对地形起伏等性质的预想。

### 第三步 完成沙漠地区地表密度函数

同样是反复的调试和混合，我们命名`surface_noise_a.json`。这里我们稍微用了几个自定义的噪声，其实可以不需要：

::: details 点击查看json内容

```json
{
  "type": "minecraft:cache_2d",
  "argument": {
    "type": "minecraft:add",
    "argument1": {
      "type": "minecraft:max",
      "argument1": {
        "type": "minecraft:mul",
        "argument1": {
          "type": "minecraft:spline",
          "spline": {
            "coordinate": {
              "type": "minecraft:add",
              "argument1": {
                "type": "minecraft:noise",
                "noise": "arkdust:sarcon/surface1",
                "xz_scale": 0.6,
                "y_scale": 0
              },
              "argument2": {
                "type": "minecraft:shifted_noise",
                "noise": "arkdust:sarcon/surface1",
                "xz_scale": 0.6,
                "y_scale": 0,
                "shift_x": -30,
                "shift_y": 0,
                "shift_z": 80
              }
            },
            "points": [
              {
                "location": -1.3,
                "derivative": 0,
                "value": 0
              },
              {
                "location": -0.54,
                "derivative": 0.2,
                "value": 0.18
              },
              {
                "location": -0.22,
                "derivative": 0.5,
                "value": 0.25
              },
              {
                "location": -0.035,
                "derivative": 0.7,
                "value": 0.35
              },
              {
                "location": 0,
                "derivative": 0,
                "value": 0.405
              },
              {
                "location": 0.035,
                "derivative": -0.7,
                "value": 0.35
              },
              {
                "location": 0.22,
                "derivative": -0.5,
                "value": 0.25
              },
              {
                "location": 0.54,
                "derivative": -0.2,
                "value": 0.18
              },
              {
                "location": 1.3,
                "derivative": 0,
                "value": 0
              }
            ]
          }
        },
        "argument2": {
          "type": "minecraft:spline",
          "spline": {
            "coordinate": {
              "type": "minecraft:noise",
              "noise": "minecraft:gravel",
              "xz_scale": 1.75,
              "y_scale": 0
            },
            "points": [
              {
                "location": -0.6,
                "derivative": 0,
                "value": 0.1
              },
              {
                "location": -0.15,
                "derivative": 0.05,
                "value": 0.7
              },
              {
                "location": 0.7,
                "derivative": 0,
                "value": 0.9
              },
              {
                "location": 1.1,
                "derivative": 2,
                "value": 1.3
              }
            ]
          }
        }
      },
      "argument2": {
        "type": "minecraft:abs",
        "argument": {
          "type": "minecraft:add",
          "argument1": {
            "type": "minecraft:mul",
            "argument1": 0.1,
            "argument2": {
              "type": "minecraft:noise",
              "noise": "minecraft:iceberg_surface",
              "xz_scale": 0.7,
              "y_scale": 0
            }
          },
          "argument2": 0.03
        }
      }
    },
    "argument2": {
      "type": "minecraft:mul",
      "argument1": 0.25,
      "argument2": {
        "type": "minecraft:noise",
        "noise": "minecraft:temperature",
        "xz_scale": 0.5,
        "y_scale": 0
      }
    }
  }
}

```

:::

中间最大的一串样条就是我们写的山脊（虽然说效果不是很好），其采样原理和之前我们的河流类似，将一个噪音趋近于0的部分映射一个更大的值，
趋近于±∞的值赋予一个更小的值。最后给它上一个由噪声控制的倍率，防止它保持连续生成。

剩下的一些就是点普通的给地表做起伏效果的函数了。

### 第四步 完成河流与被截断的河流的密度函数

河流的密度函数就使用我们上面提到的的那个，命名为`river.json`，再来一个`river_cover.json`

我们使用两个钳制：

::: details 点击查看json内容

```json
{
  "type": "minecraft:cache_2d",
  "argument": {
    "type": "minecraft:clamp",
    "input": {
      "type": "minecraft:add",
      "argument1": "arkdust:sarcon/river",
      "argument2": {
        "type": "minecraft:clamp",
        "input": {
          "type": "minecraft:mul",
          "argument1": {
            "type": "minecraft:noise",
            "noise": "minecraft:badlands_pillar",
            "xz_scale": 0.003,
            "y_scale": 0
          },
          "argument2": 0.5
        },
        "min": -0.07,
        "max": 0
      }
    },
    "min": -0.07,
    "max": 0.01
  }
}
```

:::

### 第五步 组合密度函数

这里我使用一下json5来打注释，不然不好讲解。复制的时候记得把注释删掉。

::: details 点击查看json内容

```json5
{
  "type": "minecraft:spline",
  "spline": {
    "coordinate": {
      //这里是我们之前确定的，用于决定绿洲和沙漠的函数，我们暂且叫做湿度。这一函数我们也可以提取出来给群系源的部分，用于决定群系。
      "type": "minecraft:noise",
      "noise": "minecraft:noodle_thickness",
      "xz_scale": 0.35,
      "y_scale": 0
    },
    "points": [
      {
        //在湿度为0的位置上，只有地表起伏，加上0.25倍的废弃河道凹陷
        "location": 0,
        "derivative": 0,
        "value": {
          "coordinate": {
            "type": "minecraft:add",
            "argument1": "arkdust:sarcon/surface_noise_a",
            "argument2": {
              "type": "minecraft:mul",
              "argument1": "arkdust:sarcon/river_covered",
              "argument2": -0.25
            }
          },
          "points": [
            {
              "location": 0,
              //给定一个数值倍率1，并在数值基础上增加0.275做地表起伏
              "derivative": 1,
              "value": 0.275
            }
          ]
        }
      },
      {
        //在湿度为0.5的位置，作为绿洲边界凹陷的起点。
        "location": 0.5,
        "derivative": 0,
        "value": {
          "coordinate": {
            "type": "minecraft:add",
            "argument1": {
              "type": "minecraft:mul",
              //河流与地表起伏的强度都乘以0.4
              "argument1": 0.4,
              "argument2": {
                "type": "minecraft:add",
                "argument1": "arkdust:sarcon/surface_noise_a",
                "argument2": {
                  //对我们配置的河流再进行一次样条，重新映射数据。这里我们的处理实际上使河流负化了，否则河流会突起一坨
                  "type": "minecraft:spline",
                  "spline": {
                    "coordinate": "arkdust:sarcon/river",
                    "points": [
                      {
                        "location": -0.02,
                        "derivative": 0,
                        "value": 0
                      },
                      {
                        //河里的起伏
                        "location": 0.01,
                        "derivative": 0,
                        "value": {
                          "coordinate": {
                            "type": "minecraft:noise",
                            "noise": "minecraft:spaghetti_2d",
                            "xz_scale": 20,
                            "y_scale": 0
                          },
                          "points": [
                            {
                              "location": 0,
                              "derivative": 0.015,
                              "value": -0.02
                            }
                          ]
                        }
                      }
                    ]
                  }
                }
              }
            },
            "argument2": {
              //河道遗址乘以-0.2
              "type": "minecraft:mul",
              "argument1": "arkdust:sarcon/river_covered",
              "argument2": -0.2
            }
          },
          "points": [
            {
              "location": 0,
              //这里的导数或者说斜率，其实我们可以给上面提取一个0.4的因子，省掉一个mul
              "derivative": 1,
              //同样的地表增高
              "value": 0.18
            }
          ]
        }
      },
      {
        //进入绿洲了
        "location": 0.65,
        "derivative": 0,
        "value": {
          //先对河流进行样条：河流优先，河流外的绿洲区域再使用噪音生成函数。
          "coordinate": "arkdust:sarcon/river",
          "points": [
            {
              //河流外面
              "location": -0.07,
              "derivative": 0,
              "value": {
                "coordinate": "arkdust:sarcon/oasis",
                "points": [
                  {
                    "location": -0.04,
                    "derivative": 0,
                    "value": -0.025
                  },
                  {
                    "location": 0,
                    "derivative": 1,
                    "value": 0
                  }
                ]
              }
            },
            {
              //河流中心。其实我们这里这么做会导致河流拓宽——但河流本来很窄
              "location": 0.01,
              "derivative": 0,
              "value": {
                //同样，河流底部的起伏……
                "coordinate": {
                  "type": "minecraft:noise",
                  "noise": "minecraft:spaghetti_2d",
                  "xz_scale": 20,
                  "y_scale": 0
                },
                "points": [
                  {
                    "location": 0,
                    //……乘以了0.04……
                    "derivative": 0.04,
                    //并减去了0.048!
                    "value": -0.048
                  }
                ]
              }
            }
          ]
        }
      }
    ]
  }
}
```

:::

### 第六步 添加y上的递减 添加额外处理

如果仔细看wiki我们会发现，密度函数中有一个已移除板块，里面有一个`slide`。这其实并没有被完全移除，而是被转到了代码里，用多个密度函数组合表示。

它现在长这样：

```java
private static DensityFunction slide(
        DensityFunction pDensityFunction, int pMinY, int pMaxY, int p_224447_, int p_224448_, double p_224449_, int p_224450_, int p_224451_, double p_224452_
) {
    DensityFunction densityfunction1 = DensityFunctions.yClampedGradient(pMinY + pMaxY - p_224447_, pMinY + pMaxY - p_224448_, 1.0, 0.0);
    DensityFunction $$9 = DensityFunctions.lerp(densityfunction1, p_224449_, pDensityFunction);
    DensityFunction densityfunction2 = DensityFunctions.yClampedGradient(pMinY + p_224450_, pMinY + p_224451_, 0.0, 1.0);
    return DensityFunctions.lerp(densityfunction2, p_224452_, $$9);
}

//线性插值
public static DensityFunction lerp(DensityFunction pDeltaFunction, double pMin, DensityFunction pMaxFunction) {
    return add(mul(pDeltaFunction, add(pMaxFunction, constant(-pMin))), constant(pMin));
}
```

看起来有点难以理解，不是吗？其用途是在高处对密度函数进行递减直到0（变为空气），在低处则逐渐被完全填充。我们可以写一个简单的方法来近似模拟这一过程：

```java
public static DensityFunction slide(
        DensityFunction originFunc, int appearStart, int appearEnd, int fadeStart, int fadeEnd, double solid, double air
) {
    DensityFunction fadeFunc = DensityFunctions.yClampedGradient(fadeStart, fadeEnd, 1.0, 0.0);
    DensityFunction appearFunc = DensityFunctions.yClampedGradient(appearStart, appearEnd, 0.0, 1.0);
    DensityFunction handler = DensityFunctions.min(appearFunc, fadeFunc);
    return DensityFunctions.add(DensityFunctions.mul(handler, originFunc), DensityFunctions.add(
            DensityFunctions.yClampedGradient(appearStart, appearEnd, solid, 0.0),
            DensityFunctions.yClampedGradient(fadeStart, fadeEnd, 0.0, air)
    ));
}
```

这处理了最高处与最低处的情况，但还没有处理中间部分的过渡。原版还有一系列意义不明的后处理，就是这个：

```java
public static DensityFunction postProcess(DensityFunction pDensityFunction) {
    DensityFunction densityfunction = DensityFunctions.blendDensity(pDensityFunction);
    return DensityFunctions.mul(DensityFunctions.interpolated(densityfunction), DensityFunctions.constant(0.64)).squeeze();
}
```

我不太喜欢打插值，因此直接复制了插值外的部分：

```java
DensityFunction surface = DensityFunctions.mul(DensityFunctions.blendDensity(slide(
        DensityFunctions.add(DensityFunctions.yClampedGradient(32, 160, 0.31, -0.97), DensityFunctions.cache2d(surfaceRoot)),
        24, 32, 160, 176, 0.1, -0.1)), DensityFunctions.constant(0.64)
).squeeze();
```

把这个surface传入`NoiseRouter`的`finalDensity`部分，其生成结果应该是这样的：

::: details 点击查看json内容

```json
{
  "type": "minecraft:squeeze",
  "argument": {
    "type": "minecraft:mul",
    "argument1": 0.64,
    "argument2": {
      "type": "minecraft:blend_density",
      "argument": {
        "type": "minecraft:add",
        "argument1": {
          "type": "minecraft:mul",
          "argument1": {
            "type": "minecraft:min",
            "argument1": {
              "type": "minecraft:y_clamped_gradient",
              "from_value": 0.0,
              "from_y": 24,
              "to_value": 1.0,
              "to_y": 32
            },
            "argument2": {
              "type": "minecraft:y_clamped_gradient",
              "from_value": 1.0,
              "from_y": 160,
              "to_value": 0.0,
              "to_y": 176
            }
          },
          "argument2": {
            "type": "minecraft:add",
            "argument1": {
              "type": "minecraft:y_clamped_gradient",
              "from_value": 0.31,
              "from_y": 32,
              "to_value": -0.97,
              "to_y": 160
            },
            "argument2": {
              "type": "minecraft:cache_2d",
              "argument": "arkdust:sarcon/desert_gen"
            }
          }
        },
        "argument2": {
          "type": "minecraft:add",
          "argument1": {
            "type": "minecraft:y_clamped_gradient",
            "from_value": 0.1,
            "from_y": 24,
            "to_value": 0.0,
            "to_y": 32
          },
          "argument2": {
            "type": "minecraft:y_clamped_gradient",
            "from_value": 0.0,
            "from_y": 160,
            "to_value": -0.1,
            "to_y": 176
          }
        }
      }
    }
  }
}
```

:::

为你的维度配置好密度函数后，进入维度，应该就可以看到你的地形了。当然，这只是地形，地表仍然光秃秃的——这就需要另外的妙妙工具了，地表规则(`SurfaceRule`)

![clash](/worldgen/densfunc_game.png)