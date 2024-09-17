---
description: 红 日（迫真）（蓝色字体 下划线 超链接）

writers:
  - AW-CRK14
---

# 文字格式化 (Spannable)

在 Android 开发中，`Spannable`
是一种用于对文本进行格式化的强大工具。它允许你对文本的不同部分应用不同的样式，而不仅仅是对整个 `TextView`
应用样式。这种方式对于处理复杂的文本排版和样式非常有用。

## 创建和使用 `Spannable`

首先，你需要创建一个 `Spannable` 实例。`Spannable` 实际上是一个接口，而 `SpannableString` 和 `SpannableStringBuilder`
是它的两个常用实现。如果你的文本内容会修改，建议使用 `SpannableStringBuilder`。

```java
// 创建一个 SpannableString 实例
Spannable spannable = new SpannableString("some content");

// 或者使用 SpannableStringBuilder 实例（如果你会修改内容）
SpannableStringBuilder spannableBuilder = new SpannableStringBuilder("some content");
```

## 应用样式

你可以使用 `setSpan` 方法在 `Spannable` 中指定不同的样式。`setSpan` 方法需要四个参数：

1. **`Object what`**: 要应用的样式对象，比如 `ForegroundColorSpan`。
2. **`int start`**: 起始索引，样式应用的开始位置。
3. **`int end`**: 结束索引，样式应用的结束位置。
4. **`int flags`**: 标记，指定如何处理相邻的样式。常用的标记有：
    - `Spanned.SPAN_EXCLUSIVE_EXCLUSIVE`
    - `Spanned.SPAN_INCLUSIVE_EXCLUSIVE`
    - `Spanned.SPAN_EXCLUSIVE_INCLUSIVE`
    - `Spanned.SPAN_INCLUSIVE_INCLUSIVE`

### 常用的 `Span` 实现

以下是一些常见的 `Span` 实现：

- **`ForegroundColorSpan`**: 设置前景颜色（文本颜色）。
    ```
    spannable.setSpan(new ForegroundColorSpan(0xfff699b4), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    ```

- **`RelativeSizeSpan`**: 设置字体大小比例。
    ```
    spannable.setSpan(new RelativeSizeSpan(1.5f), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    ```

- **`StyleSpan`**: 设置字体样式，如粗体或斜体。
    ```
    spannable.setSpan(new StyleSpan(Typeface.BOLD), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    ```

- **`URLSpan`**: 设置超链接。
    ```
    spannable.setSpan(new URLSpan("http://example.com"), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    ```

- **`UnderlineSpan`**: 添加下划线。
    ```
    spannable.setSpan(new UnderlineSpan(), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    ```

- **`StrikethroughSpan`**: 添加删除线。
    ```
    spannable.setSpan(new StrikethroughSpan(), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    ```

一个字符可以同时应用多种 `Span`，例如同时应用颜色和下划线：

```java
public void configureSpan() {
    spannable.setSpan(new ForegroundColorSpan(Color.RED), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    spannable.setSpan(new UnderlineSpan(), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
}
```

## 设置预排版

在将 `Spannable` 应用到 `TextView` 时，可以使用预排版来提高性能。预排版会计算文本的排版信息，从而减少文本渲染时的计算开销。

```java
public void someMethod() {
    // 创建 SpannableStringBuilder 实例并设置样式
    SpannableStringBuilder spannable = new SpannableStringBuilder("some content");
    spannable.setSpan(new ForegroundColorSpan(Color.RED), 0, 4, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);

    // 创建预排版文本并设置给 TextView
    CompletableFuture.runAsync(() -> {
        // 获取 TextView 的 TextMetricsParams
        TextView tv = getView();//从某处获取TextView
        var precomputed = PrecomputedText.create(spannable, tv.getTextMetricsParams());

        // 在主线程中设置预排版文本
        tv.post(() -> tv.setText(precomputed, TextView.BufferType.SPANNABLE));
    });
}
```

在这段代码的逻辑是：

1. 创建 `SpannableStringBuilder` 实例，并设置相应的样式，这里是将索引为1到3（首尾均被排除）的字设置为红色
2. 使用 `PrecomputedText.create()` 方法创建预排版文本。
3. 使用 `TextView.post()` 方法将预排版文本设置到 `TextView` 中，以保证在主线程中更新 UI。

配置后，`TextView` 将能够正确处理和显示预排版的文本内容。