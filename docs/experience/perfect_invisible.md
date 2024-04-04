---
description: 那里有盔甲在挖矿😨
writers:
- AnECanSaiTin
versions:
  id: "perfect_invisible"
  vanilla: "1.20.4"
  loaders:
    - text: "Neoforge 20.4.80-beta"
      loader: "neoforge"  
---

# 完美隐身
原版的隐身效果只能隐去身形，盔甲与手持物品还是会显示出来，因此显得过于鸡肋。这个案例实现了在实体拥有***完美隐身 PERFECT_INVISIBLE*** 效果时完全不渲染。

---

取消实体的渲染。
```java
@SubscribeEvent
public static void player(RenderPlayerEvent.Pre event) {
    if (event.getEntity().hasEffect(ModEffects.PERFECT_INVISIBLE.get())) {
        event.setCanceled(true);
    }
}
```
如果有需要，可以取消第一人称的手臂渲染，包括手上拿着的物品。
```java
@SubscribeEvent
public static void hand(RenderHandEvent event) {
    if (Minecraft.getInstance().player.hasEffect(ModEffects.PERFECT_INVISIBLE.get())) {
        event.setCanceled(true);
    }
}
```
取消影子。
```java
@Mixin(LivingEntity.class)
public abstract class LevelEntityMixin {
    @Redirect(method = "updateInvisibilityStatus", at = @At(value = "INVOKE", target = "Lnet/minecraft/world/entity/LivingEntity;hasEffect(Lnet/minecraft/world/effect/MobEffect;)Z"))
    public boolean redirect$updateInvisibilityStatus(LivingEntity livingEntity, MobEffect effect) {
        if (livingEntity.hasEffect(MobEffects.INVISIBILITY) || livingEntity.hasEffect(MobEffects.PERFECT_INVISIBLE.get())) {
            return true;
        }
    }
}
```
这里其实有些功能重复了，取消影子所操作的Mixin让***完美隐身 PERFECT_INVISIBLE*** 效果已经与原版隐身相同，即只隐藏身形，装备依然显示。