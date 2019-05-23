---
pageClass: routes
---

# 图片

## Awesome Pigtails

### 最新图片

<Route author="Chingyat" example="/pigtails" path="/pigtails/index"/>

## Konachan Anime Wallpapers

::: tip 提示

-   tags 可以在 [konachan](https://konachan.com/post) 选好后, 复制其 URL 中 tags= 后的参数
-   路由可选 `/konachan` 或 `/konachan.com` 或 `/konachan.net`, 其中前两者相同, `.net` 是全年龄健康的壁纸 ♡
-   网站提供了 Posts 订阅: https://konachan.com/post/piclens?tags=[tags]

:::

### Popular Recent Posts

<Route author="magic-akari" example="/konachan/post/popular_recent" path="/konachan/post/popular_recent/:period?" :paramsDesc="['默认过去 24 小时']">

举例:

-   过去 24 小时:<https://rsshub.app/konachan/post/popular_recent/1d>
-   过去一周:<https://rsshub.app/konachan/post/popular_recent/1w>
-   过去一月:<https://rsshub.app/konachan/post/popular_recent/1m>
-   过去一年:<https://rsshub.app/konachan/post/popular_recent/1y>

</Route>

## nHentai

### 分类筛选

<Route author="MegrezZhu" example="/nhentai/language/chinese" path="/nhentai/:key/:keyword/:mode?" :paramsDesc="['筛选条件，可选: parody, character, tag, artist, group, language, category','筛选值', '模式，`simple`为仅封面，`detail`会包括本子每一页，但对服务器负载大。默认为`simple`']" />
### 高级搜索

<Route author="MegrezZhu" example="/nhentai/search/language%3Ajapanese+-scat+-yaoi+-guro+-%22mosaic+censorship%22" path="/nhentai/search/:keyword/:mode?" :paramsDesc="['用于搜索的关键词。可在原网站搜索后复制 q= 后面的内容，也可直接输入，但空格等特殊符号是否会转换取决于浏览器和阅读器的实现。用法详见[官网](https://nhentai.net/info/)', '模式，`simple`为仅封面，`detail`会包括本子每一页，但对服务器负载大。默认为`simple`']" />

## Tits Guru

### Home

<Route author="MegrezZhu" example="/tits-guru/home" path="/tits-guru/home"/>
### Daily Best

<Route author="MegrezZhu" example="/tits-guru/daily" path="/tits-guru/daily"/>
### Models

<Route author="MegrezZhu" example="/tits-guru/model/mila-azul" path="/tits-guru/model/:name" :paramsDesc="['指定模特名字，详见[这里](https://tits-guru.com/models)']"/>
### Categories

<Route author="MegrezZhu" example="/tits-guru/category/bikini" path="/tits-guru/category/:type" :paramsDesc="['指定类别，详见[这里](https://tits-guru.com/categories)']"/>

## yande.re

::: tip 提示

-   网站提供了 Posts 订阅: https://yande.re/post/piclens?tags=[tags]

:::

### Popular Recent Posts

<Route author="magic-akari" example="/yande.re/post/popular_recent" path="/yande.re/post/popular_recent/:period?" :paramsDesc="['默认过去 24 小时']">

举例:

-   过去 24 小时:<https://rsshub.app/yande.re/post/popular_recent/1d>
-   过去一周:<https://rsshub.app/yande.re/post/popular_recent/1w>
-   过去一月:<https://rsshub.app/yande.re/post/popular_recent/1m>
-   过去一年:<https://rsshub.app/yande.re/post/popular_recent/1y>

</Route>

## 不羞涩

### 分类

<Route author="kba977" example="/dbmv" path="/dbmv/:category?" :paramsDesc="['分类 id - 若不填该参数, 默认所有']">

| 大胸妹 | 小翘臀 | 黑丝袜 | 美腿控 | 有颜值 | 大杂烩 |
| ------ | ------ | ------ | ------ | ------ | ------ |
| 2      | 6      | 7      | 3      | 4      | 5      |

</Route>

## 国家地理

### 每日一图

<Route author="LogicJake" example="/natgeo/dailyphoto" path="/natgeo/dailyphoto"/>

## 煎蛋

### 无聊图

<Route author="Xuanwo xyqfer" example="/jandan/pic" path="/jandan/:sub_model" :paramsDesc="['煎蛋板块名称']"/>

| 无聊图 | 无聊图热榜 | 4 小时热榜 |
| ------ | ---------- | ---------- |
| pic    | top        | top-4h     |

### 妹子图

<Route author="kobemtl xyqfer" example="/jandan/ooxx" path="/jandan/:sub_model" :paramsDesc="['煎蛋板块名称']"/>

| 妹子图 | 妹子图热榜 |
| ------ | ---------- |
| ooxx   | top-ooxx   |

## 妹子图

### 首页（最新）

<Route author="gee1k xyqfer" example="/mzitu/home" path="/mzitu/home/:type?" :paramsDesc="['类型，默认最新，可选`hot`最热']"/>

### 分类

<Route author="gee1k xyqfer" example="/mzitu/category/xinggan" path="/mzitu/category/:category" :paramsDesc="['分类名']">

| 性感妹子 | 日本妹子 | 台湾妹子 | 清纯妹子 |
| -------- | -------- | -------- | -------- |
| xinggan  | japan    | taiwan   | mm       |

</Route>

### 所有专题

<Route author="gee1k xyqfer" example="/mzitu/tags" path="/mzitu/tags"/>

### 专题详情

<Route author="gee1k xyqfer" example="/mzitu/tag/shishen" path="/mzitu/tag/:tag" :paramsDesc="['专题名, 可在专题页 URL 中找到']"/>

### 详情

<Route author="gee1k xyqfer" example="/mzitu/post/129452" path="/mzitu/post/:id" :paramsDesc="['详情 id, 可在详情页 URL 中找到']"/>

## 喷嚏

### 图卦

<Route author="tgly307" example="/dapenti/tugua" path="/dapenti/tugua"/>

### 主题

<Route author="xyqfer" example="/dapenti/subject/184" path="/dapenti/subject/:id" :paramsDesc="['主题 id']"/>

## Bing 壁纸

### 每日壁纸

<Route author="FHYunCai" example="/bing" path="/bing"/>
