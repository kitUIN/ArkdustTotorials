---
writers:
  - AW-CRK14
---

# 世界生成学

世界生成(`WorldGen`)是游戏在创建世界时，进行的一系列行为，将世界的内容从无到有构建内容的过程。

其中区块生成器(`ChunkGenerator`)可以算是整个游戏世界生成的中枢，既负责对某一区块地表的填充，也负责对已生成区块的内容（比如结构）进行记录，
还可以负责对新区块生成的计划。

这包括以下的阶段，您可以在`net.minecraft.world.level.chunk.ChunkStatus`下看到它们：

1. `EMPTY`阶段没有内容被执行。
2. `STRUCTURE_STARTS`阶段，区块内决策结构(`Sturcture`)生成起点(`StructureStartPoint`)。
   这时，如果世界允许结构生成，将调用`ChunkGenerator.createStructures`方法来尝试生成结构。
   这将根据维度的结构生成信息，推算出所有可用的结构集(`StructureSet`)，并遍历结构集中所有子结构以保证已知的该种结构集未生成。
   若该起点为空的，则尝试填充该结构起点，确定每个分片(`Piece`)的位置与旋转等信息。
   这一阶段方块尚未生成，直接由群系源(`BiomeSource`)与高度访问器(`LevelHeightAccessor`)提供位置信息。
   这会在[结构]章提到。起点的信息将被保留在区块的`ChunkAccess#structureStarts`中。
3. `STRUCTURE_REFERENCES`阶段，区块将以自身为中心，遍历周围边长17的正方形(即当前位置四个方向各8区块)内的所有区块，
   获取各个区块包含的结构起点，判定是否会延申至本区块内；如果是，则为本区块记录对于该结构起点的引用于`ChunkAccess#structuresRefences`。
4. `BIOMES`阶段，将调用生成器的`ChunkGenerator#createBiomes`方法。这一方法将根据提供的维度群系源(`BiomeSource`)，
   通过六个气候密度函数决定最终群系。在这一阶段中，区块将会在三轴上均被四等分，64个4\*4\*4小块分别计算群系。
5. `NOISE`阶段，最核心的阶段。在这一阶段，将调用`ChunkGenerator#fillFromNoise`方法来处理密度函数并向世界中填充方块。
   在原版中，正常世界使用`NoiseBasedChunkGenerator`，通过该维度提供的区块生成器(`NoiseRouter`)计算地形；
   超平坦和调试模式则使用专门的生成器。抽象方法。在填充完成后，执行基岩层生成任务。
6. `SURFACE`阶段，调用生成器的`ChunkGenerator#buildSurface`方法，生成地表。
   其中，在噪音区块生成器中，将会使用表面规则(`SurfaceRule`)根据位置，深度与群系等信息，
   决定某一个位置的方块，例如平原表层是草方块，下面是泥土和岩石之类。
7. `CARVERS`阶段，调用生成器的`ChunkGenerator#applyCarvers`方法，对地表进行雕刻。抽象方法。
   雕刻(`Carver`)用于对已完成基本填充的世界进行二次处理，例如雕刻洞穴与雕刻峡谷等。
8. `FEATURES`阶段，首先根据地形基本已经确定的区块刷新高度图(`HeightMap`)，
   然后调用生成器的`ChunkGenerator#applyBiomeDecoration`方法，生成特征。特征(`Feature`)包括诸如花，草，树，糊等；这一阶段又可以继续细分。
   值得注意的是，即便结构在上述阶段已经决定了位置，其内部方块的放置以及数据模式结构方块的处理仍是在这一阶段完成的，且结构处理在特征之前。
9. `INITIALIZE_LIGHT`阶段，区块生成器没有被使用。这一阶段初始化光源。
10. `LIGHT`阶段，区块生成器也没有被使用。这一阶段计算区块内各个位置的亮度。
11. `SPAWN`阶段，区块生成器生成区块内的原始生物。抽象方法。
12. 最后是`FULL`阶段，这时所有内容均已完成生成，自然也没有生成器的活了。

对于详细的信息，您可以查看[minecraft wiki](https://zh.minecraft.wiki/w/%E4%B8%96%E7%95%8C%E7%94%9F%E6%88%90?variant=zh-cn)
获取更多详细的信息。在本章节中，我们也将会继续深入为大家介绍如何自定义其中的关键内容。