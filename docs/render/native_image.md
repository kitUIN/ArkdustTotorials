---
description: 真正的像素级操作
writers:
  - AW-CRK14
versions:
  id: "native_image"
  vanilla: "1.20.x"
  loaders:
    - text: "Neoforge 20.4.80-beta"
      loader: "neoforge"  
---

# 原生图片(NativeImage)

对于`NativeImage`一词的具体翻译暂不明确，我们姑且在这里把它叫做原生图片。

原生图片，或者叫做本地图片，正如其名字，它是一个包含了一张图片的大小，着色模式(通常为RGBA)与各个像素位置的颜色(的内存索引)的类。您可以将其简单理解为一张可供我们便捷的处理的图片。

这一类在对图片的加载与纹理的生成中常用，例如[`TextureAtlasSprite`的`SpriteContents`](texture_atlas.md#获取textureatlas)中，其简单而言就是一个`NativeImage`与根据其解析出的大小，动画帧等内容的打包。

因此，如果您需要用到动态生成图片，您或许需要了解一下这部分内容。**否则您可以不需要阅读本章节**。

## NativeImage包含的基础信息

在创建`NativeImage`时，需要指定其着色模式(`NativeImage.Format pFormat`)，长(`int pWidth`)，宽(`int pHeight`)，初始颜色填充(~~pUseCiallo~~`boolean pUseCalloc`)，这些内容都是不可变的。

在构造方法中，将会在内存中开辟一段区域（Byte长度为像素总数乘以着色模式的组件量（例如RGBA为4，RGB为3，LUMINANCE也就是灰度为1）），分别表示各个位置的像素颜色。在下面，我们**将都以RGBA模式进行描述，这是最常用，也是此类中支持最广泛的**。

请注意，虽然我们是使用RGBA称呼这种着色模式，但实际上**其存储的顺序是ABGR**，读取或存入相关的x16颜色的顺序**均是ABGR**而非我们通常习惯的RGBA或者ARBG。因此您需要特别注意，以保证您的颜色处理按预期进行。

## NativeImage的使用

我们可以使用如下方法从png文件中读取生成`NativeImage`:
```java
import java.io.IOException;

public static NativeImage read(ResourceLocation location) {
    Minecraft.getInstance().getResourceManager().getResource(location).ifPresent(r -> {
        try {
            return NativeImage.read(resource.open());
        } catch (IOException e) {
            throw new RuntimeException("Unable to read resource and create an image. Resource:" + resource.sourcePackId(), e);
        }
    });
    throw new IOException("Can't find resource at " + location);
}
```

复制`NativeImage`:
```java
public static NativeImage copy(NativeImage image) {
    NativeImage i = new NativeImage(image.getWidth(), image.getHeight(), false);
    i.copyFrom(image);
    return i;
}
```

缩放`NativeImage`，由于其本身的长宽并不能变更，因此我们将创建该图片的缩放副本:

```java
public static NativeImage scale(NativeImage image, int width, int height) {//width和height是缩放后图片的长宽
    NativeImage i = new NativeImage(width, height, false);
    image.resizeSubRectTo(0, 0, image.getWidth(), image.getHeight(), i);
    return i;
}
```

我们可以使用`getPixelRGBA(x,y)`来获取在某一像素位置的颜色，注意不要超过图片范围否则会导致报错。可以使用`isOutsideBounds`方法判断是否在范围内。相应的，我们也可以用`setPixelRGBA(x,y,x16abgr)`方法来设置一个像素的颜色。

再次强度，使用这两个方法获取到的颜色int的顺序**均为ABGR**，即便它们的方法签名中写的是rgba。

在此给出获取四个颜色分量的范例:
```java
//A=0 B=1 G=2 R=3
public static int getColorByte(int color, int index) {
    if (index < 0 || index > 3) {
        throw new IllegalArgumentException("index must in range[0,3].");
    }
    return color >>> 24 - 8 * index & 0xFF;
}
```

基于这一方法，我们可以实现一些多图片的相互影响的操作，其具体方法就是遍历原始图片中的每个像素位置的颜色，与另一图片的对应位置的颜色进行处理，再将获得的新颜色设置为原图片(建议使用原图片的副本)的指定位置的颜色。

在这里给出叠加与alpha过滤的单一位置颜色处理示范:

```java
public static int blend(int backgroundColor, int foregroundColor) {

    // 将Alpha值标准化到[0, 1]范围
    float alphaBackground = getColorByte(backgroundColor, 0) / 255.0f;
    float alphaForeground = getColorByte(foregroundColor, 0) / 255.0f;

    // 对每个颜色分量执行Alpha混合
    int finalRed = (int) ((alphaForeground * getColorByte(foregroundColor, 3)) + ((1 - alphaForeground) * alphaBackground * getColorByte(backgroundColor, 3)));
    int finalGreen = (int) ((alphaForeground * getColorByte(foregroundColor, 2)) + ((1 - alphaForeground) * alphaBackground * getColorByte(backgroundColor, 2)));
    int finalBlue = (int) ((alphaForeground * getColorByte(foregroundColor, 1)) + ((1 - alphaForeground) * alphaBackground * getColorByte(backgroundColor, 1)));
    int finalAlpha = (int) (255 * (alphaForeground + (1 - alphaForeground) * alphaBackground));

    // 将混合后的分量重新组合成一个整数
    return (finalAlpha << 24) | (finalBlue << 16) | (finalGreen << 8) | finalRed;
}

public static int alphaFilter(int original, int alpha) {
    alpha = Math.min((getColorByte(alpha, 3) + getColorByte(alpha, 2) + getColorByte(alpha, 1)) / 3, getColorByte(alpha, 0));
    return original & 0x00FFFFFF | alpha << 24;
}
```
