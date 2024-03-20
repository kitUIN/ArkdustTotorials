---
description: 红 日（迫真）（蓝色字体 下划线 超链接）

writers:
  - AW-CRK14
---


# 文字格式化(Spannable)
如果一个页面中需要放入很多内容而且需要添加各种字体特性，显然用TextView一段一段做就限定很不合适了。Spannable是一种特殊的字符序列(CharSequence)，用于将一段文字内指定范围的内容进行额外处理。此处的范围指的是文字索引数值范围——这可以帮我们有效地降低文字排版的复杂度。

首先我们要创建一个Spannable的实例，其构造参数需要传入一个String实例，代表我们的源文本。注意，如果您的文本内容会修改的话，可以使用StringBuilder等类。
接下来，对于这一个实例，我们可以使用setSpan方法：
```java
Spannale spannale = new Spannale("some content");

public void someMethod(){
    spannable.setSpan(new ForegroundColorSpan(0xfff699b4), from, to,
    Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
}
```
比如这个方法，我们就为from到to范围内的文本设置了一个颜色为fff699b4的文本颜色，在渲染后这一段将变成对应的颜色。

您可以在CharacterStyle的子类中找到更多用法。在此只提供几个比较常用的：
* ForegroundColorSpan(int colorx16)设置前景颜色，也就是字的颜色
* RelativeSizeSpan(float scale)缩放字体
* StyleSpan(Typeface t)设置字体特性，比如Typeface.BOLD是粗体，Typeface.BOLD_ITALIC是粗体斜体。
* URLSpan(String url)设置一个超链接。注意，要使超链接可以点击，需要对TextView使用setLinksClickable(true)
* UnderlineSpan()设置下划线
* StrikethroughSpan()设置划除

同一个字符可以被多种Style修饰，比如说您可以为您的字体同时添加颜色，下划线，斜体。

在完成Spannable部分后，我们需要创建预排版，再将其赋值给一个TextView实例，比如说我们的TextView实例叫做tv：
```java
public viod someMethod(){
//...
    CompletableFuture.runAsync(() -> {
        var precomputed = PrecomputedText.create(spannable, tv.getTextMetricsParams());
        tv.post(() -> tv.setText(precomputed, TextView.BufferType.SPANNABLE));
    });
}
```
最后配置tv，添加进您的ViewGroup即可。