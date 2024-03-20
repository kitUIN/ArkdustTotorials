---
writers:
- kitUIN
---
# MC-Icon
我的世界的一些图标,从`McMod`抄的

## 使用
1. 成条使用
```html
<McIconBar 
icon="hunger" 
count="8" 
total="20" />
```
<McIconBar icon="hunger" count="8" total="20" />
2. 单个使用
```html
<McIconBar 
icon="hunger" 
count="8" />
```
<McIconBar icon="hunger" count="8" />

## 能够使用的图标

| 名称 | icon | 展示 | 备注 |
| --- | ---  | ---  | --- |
| 饱食度 | hunger | <McIconBar icon="hunger" count="3" />  | 请使用`count`控制,正整数|
| 饱和度 | saturation | <McIconBar icon="saturation" count="0.5" /><McIconBar icon="saturation" count="1" /><McIconBar icon="saturation" count="1.5" /><McIconBar icon="saturation" count="2" />  | 请使用`count`控制,为`0.5`的倍数|
| 生命值 | health | <McIconBar icon="health" count="3" />  | 请使用`count`控制,正整数|
| 生命值(极限) | health-ex | <McIconBar icon="health-ex" count="3" />  | 请使用`count`控制,正整数|
| 护甲韧性 | toughness | <McIconBar icon="toughness" count="3" />  | 请使用`count`控制,正整数|
| 护甲值 | armor | <McIconBar icon="armor" count="3" />  | 请使用`count`控制,正整数|
| 护甲值(钻石) | toughness-diamond | <McIconBar icon="toughness-diamond" count="3" />  | 请使用`count`控制,正整数|
| 坐骑生命值 | health-jockey | <McIconBar icon="health-jockey" count="3" />  | 请使用`count`控制,正整数|
| 氧气 | oxygen | <McIconBar icon="oxygen" count="2" />  | 请使用`count`控制,`2`的倍数|
| 经验 | exp | <McIconBar icon="exp" count="1" />  | 请使用`count`控制,正整数|
