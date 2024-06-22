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

# 战利品表

战利品表(`LootTable`)是在游戏中常见的，用于从一组物品堆(`ItemStack`)中随机或根据条件挑选某个物品堆的设计。
在游戏原版中，方块在不同情况下的掉落(例如矿石的正常挖掘与精准采集的区别)，游戏中宝箱内容的生成，钓鱼或猫的礼物的决定都是由战利品表提供的。

本章节中不会过多的阐述战利品表的使用方法——这一篇的主要内容是如何为战利品表的json解析添加自定义的解析器。

## 战利品表的基本使用

战利品表以json文件形式，存储在`data/\[modid]/loot_tables`下。对于不同的用途，通常也会在路径下再进行细分，
例如方块的掉落物就通常在路径下的`blocks`文件夹中，而箱子之类的物品随机生成在`chests`文件夹下。

在箱子一类的，实现了`RandomizableContainer`接口的类，可以使用`setLootTable`来设置其掉落物表；而对于具体的内容生成，需要参考对应的实现代码。
在该类中提供了默认方法用于便捷的处理生成：
```java
    default void unpackLootTable(@Nullable Player pPlayer) {
        Level level = this.getLevel();
        BlockPos blockpos = this.getBlockPos();
        ResourceLocation resourcelocation = this.getLootTable();
        if (resourcelocation != null && level != null && level.getServer() != null) {
            LootTable loottable = level.getServer().getLootData().getLootTable(resourcelocation);
            if (pPlayer instanceof ServerPlayer) {
                CriteriaTriggers.GENERATE_LOOT.trigger((ServerPlayer)pPlayer, resourcelocation);
            }

            this.setLootTable(null);
            LootParams.Builder lootparams$builder = new LootParams.Builder((ServerLevel)level)
                .withParameter(LootContextParams.ORIGIN, Vec3.atCenterOf(blockpos));
            if (pPlayer != null) {
                lootparams$builder.withLuck(pPlayer.getLuck()).withParameter(LootContextParams.THIS_ENTITY, pPlayer);
            }

            loottable.fill(this, lootparams$builder.create(LootContextParamSets.CHEST), this.getLootTableSeed());
        }
    }
```

而钓鱼竿，你可以在`net.minecraft.world.entity.projectile.FishingHook#retrieve`下看到其源码。这里节选部分内容：
```java
static {
    LootParams lootparams = new LootParams.Builder((ServerLevel)this.level())
            .withParameter(LootContextParams.ORIGIN, this.position())
            .withParameter(LootContextParams.TOOL, pStack)
            .withParameter(LootContextParams.THIS_ENTITY, this)
            .withParameter(LootContextParams.KILLER_ENTITY, this.getOwner())
            .withLuck((float)this.luck + player.getLuck())
            .create(LootContextParamSets.FISHING);
    LootTable loottable = this.level().getServer().getLootData().getLootTable(BuiltInLootTables.FISHING);
    List<ItemStack> list = loottable.getRandomItems(lootparams);
    //...

    for(ItemStack itemstack : list) {
        ItemEntity itementity = new ItemEntity(this.level(), this.getX(), this.getY(), this.getZ(), itemstack);
        double d0 = player.getX() - this.getX();
        double d1 = player.getY() - this.getY();
        double d2 = player.getZ() - this.getZ();
        double d3 = 0.1;
        itementity.setDeltaMovement(d0 * 0.1, d1 * 0.1 + Math.sqrt(Math.sqrt(d0 * d0 + d1 * d1 + d2 * d2)) * 0.08, d2 * 0.1);
        this.level().addFreshEntity(itementity);
        player.level()
                .addFreshEntity(new ExperienceOrb(player.level(), player.getX(), player.getY() + 0.5, player.getZ() + 0.5, this.random.nextInt(6) + 1));
        if (itemstack.is(ItemTags.FISHES)) {
            player.awardStat(Stats.FISH_CAUGHT, 1);
        }
    }
}
```

## LootTable的有关类
