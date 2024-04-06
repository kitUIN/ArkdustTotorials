---
description: (烤四胞胎)
writers:
  - AW-CRK14
versions:
  id: "baked_model"
  vanilla: "1.20.x"
  loaders:
    - text: "Neoforge 20.4.80-beta"
      loader: "neoforge"  
---

# 已烘培模型(BakedModel)

联想到我们在游戏中看到的各种模型与开发环境中的json文件，我们不难想到:如果每个模型在需要时被从json文件解析处理，这将会产生巨额的性能负担，这显然是不合理的。

因此，游戏在加载过程中将会对模型进行处理，使其达到高度抽象(对于人类而言，对计算机而言则是极为直白有效)的状态。这种状态将大大降低解析负担，这一过程就是**烘培(Bake)**。在烘培后的模型，其最重要的，直接用于渲染的是一组`BakedQuad(已烘培矩形(某翻译网站把它翻译成了烤四胞胎))`。这一组内每个`BakedQuad`包含了一个矩形的相对位置，方向与着色等信息。

注意: 即便`BakedQuad`内的确存储了一个材质，但这个材质并不直接影响这个矩形的着色——换言之，修改存储这个材质的变量不会导致此矩形渲染的结果发生改变。

模型的烘培是一个较为复杂的过程。因此，我们这里更多的是侧重于讲它的另一个作用:动态修改指定物品的模型——这里的修改包含很多方面，包括模型的变化，多个模型的拼接组装，根据物品属性变更模型样式等等。

## BakedModel应当在哪些情况使用

提到可变化的物品模型，你会想到什么？通常情况下，我们会有三种解决方案：[BEWLR](bewlr.md),BakedModel,[ItemProperties]()。

先说自由度和性能开销:

在使用恰当的情况下，`BakedModel`原则上具有最高的性能与不错的自由度。但，正如我们上面提到过的，`BakedModel`的核心部分是一组`BakedQuad`，而`BakedQuad`我们已经提到过: 它高度抽象化，也就是说我们很难对一个`BakedQuad`做出颜色，形状等方面的进一步处理。

这也就是说，**BakedModel在对给定模型的再处理上不够方便**。这意味着，如果您想实现模型的变形甚至是模型动画，使用`BakedModel`会很不方便。

但在基本数据的获取上，`ItemProperties`只能提供到数字数据以及有限的分段模型修改。这意味着对于更为复杂的模型需求，这会变得很臃肿: 
> 我们有一个煎锅，可以往锅上放食物。如果使用`ItemProperties`，我们需要: 
> 1. 为每种食物编号。这就出现了第一个问题:如果出现了其它mod的食物或食物材质被材质包替换，这将出现不兼容与不一致问题。
> 2. 对每种编号的食物提供一个组合了的材质。这就出现了第二个问题:对于“锅”与“食物”，其本身就具有模型，如果我们在为每种组合预创建一种组合模型，这将生成许多模型且可能大部分都不会被使用。
> 
> 这显然是不够方便的。如果使用`BakedModel`，我们就可以简化这一过程:
> 1. 直接通过物品的nbt数据，获取到其附加的食物的名字，再进一步获取到食物物品的模型。
> 2. 将煎锅模型与食物模型结合。

我们不难看出，在对**复杂数据条件的处理与相比于“给定模型”更抽象的层级上模型分配会具有优势**。但相应的，其制作过程也会稍微变得复杂一点(举个例子，如果你想实现`ItemProperties`可以实现的功能，你需要创建一个空的BakedModel，并在它提供的ItemOverride内进行数据处理。而`ItemProperties`在代码内部似乎也就是这么做的，因此这在没有特殊需求的情况下反而显得多此一举。)

总结一下:
- 在变量数据为数字，变种有限且模型分配逻辑简单的情况下，推荐使用`ItemProperties`
- 在变量数据多样，涉及模型的组合，变种数量不可预估但是不涉及对已有模型的额外处理的情况下，推荐使用`BakedModel`
- 在变量数据繁多，有对模型的额外的，涉及类似动画等功能的情况下，推荐使用`BEWLR`

## BakedModel接口

虽然它被叫做“已烘培模型”，但它实际上的确是一个接口——这使我们可以更加轻松地完成我们对某个模型的替换与处理。这个接口下有数个方法:

- `useAmbientOcclusion()` `isGui3d()` `usesBlockLight()` `isCustomRenderer()`这几个方法要求返回一个布朗值，其用途正如其名字。
- <code>~~getParticleIcon()~~ getParticleIcon(ModelData)</code>这个方法需要返回一个材质，用于物品粒子(比如被食物被吃掉时的粒子)
- <code>~~getTransforms()~~ applyTransform(ItemDisplayContext, PoseStack, boolean)</code>这个方法用于处理物品在不同显示条件(比如左右手，gui中，展示框上)的额外位移，旋转，缩放。这两个方法，前者要求返回一个`ItemTransforms`，含有无转换的默认值。后者为forge的拓展，要求返回一个`BakedModel`，这一过程默认返回经过前者处理的，此`BakedModel`的结果。  
  (可能这么说不太清楚，请看代码:)
  ```java
    default BakedModel applyTransform(ItemDisplayContext transformType, PoseStack poseStack, boolean applyLeftHandTransform) {
        self().getTransforms().getTransform(transformType).apply(applyLeftHandTransform, poseStack);
        return self();
    }
  ```
- `getOverrides()`返回一个`ItemOverrides`，用于根据物品，玩家，维度等分配模型。
- <code>~~getQuads(BlockState, Direction, RandomSource)~~ getQuads(BlockState, Direction, RandomSource, ModelData, RenderType)</code>这是整个`BakedModel`最核心的，直接与渲染内容挂钩的方法，返回一组包含了顶点数据的`BakedQuad(已烘培矩形)`

## ItemOverrides

> `ItemOverrides` provides a way for an `BakedModel` to process the state of an `ItemStack` and return a new `BakedModel`; thereafter, the returned model replaces the old one. `ItemOverrides` represents an arbitrary function `(BakedModel, ItemStack, ClientLevel, LivingEntity, int) → BakedModel`, making it useful for dynamic models. In vanilla, it is used to implement item property overrides.  
> `ItemOverrides`为`BakedModel`提供了一个处理物品堆的状态并返回另一个`BakedModel`的方法，在这之后，新的模型将代替旧有模型进行渲染(注:只是代替这一次渲染，在每次渲染时进行处理仍然会调用前者)。`ItemOverrides`代表了任意`(BakedModel, ItemStack, ClientLevel, LivingEntity, int) → BakedModel`函数，用于处理模型变化。在原版中，这被用于实现`ItemProperties`

由于我们不需要使用原版预先提供的逻辑，我们可以直接使用
```java
private final ItemOverrides ITEM_OVERRIDES = new ItemOverrides();
```
来创建一个空的`ItemOverrides`。但很显然，一个空的`ItemOverrides`不能满足我们的需求。因此，在创建时我们需要覆写`BakedModel resolve(BakedModel, ItemStack, ClientLevel, LivingEntity, int)`方法。

```java
private final ItemOverrides ITEM_OVERRIDES = new ItemOverrides(){
        @Override
        public BakedModel resolve(BakedModel pModel, ItemStack pStack, @Nullable ClientLevel pLevel, @Nullable LivingEntity pEntity, int pSeed) {
            //在这里完成你的逻辑
            return model;
        }
    };
```

最后，我们需要在`getOverrides()`方法中返回我们创建的这个实例即可。

## Transform

模型的转换用于处理模型在不同位置渲染时的缩放与角度变化。请参考[neoforge官方文档链接](https://docs.neoforged.net/docs/rendering/modelloaders/transform)获取更多信息。

## BakedQuad

`BakedQuad`包含的最重要的信息是一组表示顶点位置的`int\[]`(vertices)，用于控制顶点。除此之外，还有表示这个面的方向的`Direction`(direction)也比较重要。

再次强调，材质的着色已经在烘培阶段**被合并存储在了顶点数据中，难以更改**。`BakedQuad`类下的`tintIndex`与`sprite`均不会直接影响到最终渲染出的着色效果。

## 使用例

让我们以*农夫乐事*模组的煎锅为例:

```java
public class SkilletModel implements BakedModel {
    //物品模型生成器，由原版提供。在正常情况下，也可以从客户端实例获取。
	private static final ItemModelGenerator ITEM_MODEL_GENERATOR = new ItemModelGenerator();

	private final ModelBakery bakery;//模型烘培器
	private final BakedModel originalModel;//原始煎锅模型
	private final BakedModel cookingModel;//默认的工作状态煎锅模型

	public SkilletModel(ModelBakery bakery, BakedModel originalModel, BakedModel cookingModel) {
		this.bakery = bakery;
		this.originalModel = Preconditions.checkNotNull(originalModel);
		this.cookingModel = Preconditions.checkNotNull(cookingModel);
	}

    //创建新的ItemOverrides
	private final ItemOverrides itemOverrides = new ItemOverrides() {
		@Nonnull
		@Override
		public BakedModel resolve(BakedModel model, ItemStack stack, @Nullable ClientLevel level, @Nullable LivingEntity entityIn, int seed) {
			CompoundTag tag = stack.getOrCreateTag();

            //如果物品具有Cooking词条，则尝试使用getCookingModel方法返回新的模型。否则使用原始的煎锅模型。
			if (tag.contains("Cooking")) {
				ItemStack ingredientStack = ItemStack.of(tag.getCompound("Cooking"));
				return SkilletModel.this.getCookingModel(ingredientStack);
			}

			return originalModel;
		}
	};

    //在这个方法中，返回我们之前创建的ItemOverrides，使游戏在渲染该物品时应用这一功能。
	@Nonnull
	@Override
	public ItemOverrides getOverrides() {
		return itemOverrides;
	}

	//省略部分方法。这部分方法直接调用originalModel的对应方法。

    //模型的缓存。由于烘培过程的性能占用较高，而烘培完成后的BakedQuad其内容基本也不大，这里将完成了的模型加入缓存以提高效率。  
	private final HashMap<Item, CompositeBakedModel> cache = new HashMap<>();

    //根据目标物品来处理模型，拉取缓存或创建新的内容并加入缓存。
	private CompositeBakedModel getCookingModel(ItemStack ingredientStack) {
		return cache.computeIfAbsent(ingredientStack.getItem(), p -> new CompositeBakedModel(bakery, ingredientStack, cookingModel));
	}

	private static class CompositeBakedModel extends WrappedItemModel<BakedModel>
	{
        //创建的子模型的面信息与方向->面处理。
		private final List<BakedQuad> genQuads = new ArrayList<>();
		private final Map<Direction, List<BakedQuad>> faceQuads = new EnumMap<>(Direction.class);

		public CompositeBakedModel(ModelBakery bakery, ItemStack ingredientStack, BakedModel skillet) {
			super(skillet);

            //获取物品的资源路径，通过该资源路径获取该模型的UnbakedModel。
			ResourceLocation ingredientLocation = BuiltInRegistries.ITEM.getKey(ingredientStack.getItem());
			UnbakedModel ingredientUnbaked = bakery.getModel(new ModelResourceLocation(ingredientLocation, "inventory"));
            //创建物品的转换处理
			ModelState transform = new SimpleModelState(
					new Transformation(
							new Vector3f(0.0F, -0.4F, 0.0F),
							Axis.XP.rotationDegrees(270),
							new Vector3f(0.625F, 0.625F, 0.625F), null));
            //为新创建的模型命名
			ResourceLocation name = new ResourceLocation(FarmersDelight.MODID, "skillet_with_" + ingredientLocation.toString().replace(':', '_'));

            //由bakery获取baker。使用默认的纹理。
			ModelBaker baker = bakery.new ModelBakerImpl((modelLoc, material) -> material.sprite(), name);

			BakedModel ingredientBaked;
            //如果模型被标记为需要进行生成，使用ItemModelGenerator进行烘培; 否则直接进行烘培。
			if (ingredientUnbaked instanceof BlockModel bm && ((BlockModel) ingredientUnbaked).getRootModel() == ModelBakery.GENERATION_MARKER) {
				ingredientBaked = ITEM_MODEL_GENERATOR
						.generateBlockModel(Material::sprite, bm)
						.bake(baker, bm, Material::sprite, transform, name, false);
			} else {
				ingredientBaked = ingredientUnbaked.bake(baker, Material::sprite, transform, name);
			}

            //创建各面缓存
			for (Direction e : Direction.values()) {
				faceQuads.put(e, new ArrayList<>());
			}

			RandomSource rand = RandomSource.create(0);
			for (BakedModel pass : ingredientBaked.getRenderPasses(ingredientStack, false)) {
				genQuads.addAll(pass.getQuads(null, null, rand, ModelData.EMPTY, null));

				for (Direction e : Direction.values()) {
					rand.setSeed(0);
					faceQuads.get(e).addAll(pass.getQuads(null, e, rand, ModelData.EMPTY, null));
				}
			}

            //将煎锅的模型合并进物品单独的模型，使其成为一体。
			for (BakedModel pass : skillet.getRenderPasses(ModItems.SKILLET.get().getDefaultInstance(), false)) {
				rand.setSeed(0);
				genQuads.addAll(pass.getQuads(null, null, rand, ModelData.EMPTY, null));
				for (Direction e : Direction.values()) {
					rand.setSeed(0);
					faceQuads.get(e).addAll(pass.getQuads(null, e, rand, ModelData.EMPTY, null));
				}
			}
		}

		@Override
		public boolean isCustomRenderer() {
			return originalModel.isCustomRenderer();
		}

		@Nonnull
		@Override
		public List<BakedQuad> getQuads(@Nullable BlockState state, @Nullable Direction face, @Nonnull RandomSource rand, @Nonnull ModelData data, @Nullable RenderType renderType) {
			return face == null ? genQuads : faceQuads.get(face);
		}

		@Override
		public BakedModel applyTransform(@Nonnull ItemDisplayContext cameraTransformType, PoseStack stack, boolean leftHand) {
			super.applyTransform(cameraTransformType, stack, leftHand);
			return this;
		}
	}
}
```

## 注册

`BakedModel`还需要进行注册，以替换物品原本的，由json文件生成的模型。`ModelEvent.ModifyBakingResult`事件可以帮助我们完成这一过程，这一事件在Mod线，客户端上触发。

在事件中，使用`getModel()`获取模型列表，并向其中放入新的键对值。其中键的资源路径应使用`new ModelResourceLoaction([物品的注册id],"inventory")`，键则根据需求传入上面我们创建的`BakedModel`的实例即可。