---
description: 让我们融为一体吧
writers:
- AnECanSaiTin
---

# 无实体碰撞
在某些情况下，你可能需要让实体之间不会发生碰撞。这个案例实现了在实体拥有***无碰撞 NO_COLLISION*** 效果时取消碰撞判定。

MC版本：1.20.4  
Mod加载器版本：NeoForged-20.4.80-beta

---

```java
@Mixin(LivingEntity.class)
public abstract class LevelEntityMixin {
    @Unique
    private final Predicate<Entity> mod$noCollisionEffect = entity -> !(entity instanceof LivingEntity living) || !living.hasEffect(ModEffects.NO_COLLISION.get());
    @Unique
    private final Predicate<Entity> mod$alwaysFalse = entity -> false;
    
    @Redirect(method = "pushEntities", at = @At(value = "INVOKE", target = "Lnet/minecraft/world/entity/EntitySelector;pushableBy(Lnet/minecraft/world/entity/Entity;)Ljava/util/function/Predicate;"))
    public Predicate<Entity> mixin$getEntities(Entity entity) {
        if (((LivingEntity) (Object)this).hasEffect(ModEffects.NO_COLLISION.get())) {
            return mod$alwaysFalse;//如果实体本身拥有效果，则不对任何实体产生碰撞。
        }
        
        //不对拥有效果的实体产生碰撞
        return EntitySelector.pushableBy((Entity) (Object)this).and(mod$noCollisionEffect);
    }
}
```
实体的碰撞分为两个部分
- 当前实体对其他实体的碰撞
- 其他实体对当前实体的碰撞

因此，需要将两部分都取消。幸运的是，这两部分都通过调用 **pushEntities** 方法来进行碰撞检测。所以，只需要在获取实体时作下手脚，给判定实体的条件（Predicate）添加上对无碰撞效果的检测。