---
pageClass: routes
---

# 图片

## 1X

### Magazine

<Route author="emdoe" example="/1x/magazine" path="/1x/magazine"/>

## Awesome Pigtails

### 最新图片

<Route author="Chingyat" example="/pigtails" path="/pigtails/index"/>

## Bing 壁纸

### 每日壁纸

<Route author="FHYunCai" example="/bing" path="/bing" radar="1"/>

## CNU 视觉联盟

### 每日精选

<Route author="hoilc" example="/cnu/selected" path="/cnu/selected" />

### 发现

<Route author="hoilc" example="/cnu/discovery/hot/自然" path="/cnu/discovery/:type?/:category?" :paramsDesc="['板块类型, 默认为`热门`, 具体参见下表', '图片类别, 默认为`0`代表全部, 可参见[这里](http://www.cnu.cc/discoveryPage/hot-0)']"/>

| 热门 | 推荐      | 最新   |
| ---- | --------- | ------ |
| hot  | recommend | recent |

## Dilbert Comic Strip

<Route name="Daily Strip" author="Maecenas" example="/dilbert/strip" path="/dilbert/strip">

通过提取漫画，提供比官方源更佳的阅读体验。

</Route>

## Google Doodles

### 更新

<Route author="xyqfer" example="/google/doodles/zh-CN" path="/google/doodles/:language?" :paramsDesc="['语言，默认为`zh-CN`简体中文，如需其他语言值可从[Google Doodles 官网](https://www.google.com/doodles)获取']" />

## Google 相册

### 公开影集

<Route author="hoilc" example="/google/album/msFFnAzKmQmWj76EA" path="/google/album/:id" :paramsDesc="['影集 ID, 可在 URL 中找到, 例如, 分享链接为`https://photos.app.goo.gl/msFFnAzKmQmWj76EA`, 则 ID 为`msFFnAzKmQmWj76EA`']" radar="1" />

## Konachan Anime Wallpapers

::: tip 提示

-   tags 在 [konachan](https://konachan.com/post) URL 中 `tags=` 后的参数
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

## LoveHeaven

### 漫画更新

<Route author="hoilc" example="/loveheaven/update/kimetsu-no-yaiba" path="/loveheaven/update/:slug" :paramsDesc="['漫画 slug，可在漫画页面URL中找到，不包括开头的`manga-`，也不包括末尾的`.html`']" />

## nHentai

### 分类筛选

<Route author="MegrezZhu hoilc" example="/nhentai/language/chinese" path="/nhentai/:key/:keyword/:mode?" :paramsDesc="['筛选条件，可选: parody, character, tag, artist, group, language, category','筛选值', '模式，`simple`为仅封面，`detail`会包括本子每一页，但对服务器负载大，`torrent`会包括磁力链接，需要登录，参见[部分 RSS 模块配置](/install/#bu-fen-rss-mo-kuai-pei-zhi)。默认为`simple`']" anticrawler="1" supportBT="1" />

### 高级搜索

<Route author="MegrezZhu hoilc" example="/nhentai/search/language%3Ajapanese+-scat+-yaoi+-guro+-%22mosaic+censorship%22" path="/nhentai/search/:keyword/:mode?" :paramsDesc="['用于搜索的关键词。可在原网站搜索后复制 q= 后面的内容，也可直接输入。用法详见[官网](https://nhentai.net/info/)', '模式，`simple`为仅封面，`detail`会包括本子每一页，但对服务器负载大，`torrent`会包括磁力链接，需要登录，参见[部分 RSS 模块配置](/install/#bu-fen-rss-mo-kuai-pei-zhi)。默认为`simple`']" anticrawler="1" supportBT="1" />

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

<Route author="magic-akari SettingDust" example="/yande.re/post/popular_recent" path="/yande.re/post/popular_recent/:period?" :paramsDesc="['默认过去 24 小时']">

举例:

-   过去 24 小时:<https://rsshub.app/yande.re/post/popular_recent/1d>
-   过去一周:<https://rsshub.app/yande.re/post/popular_recent/1w>
-   过去一月:<https://rsshub.app/yande.re/post/popular_recent/1m>
-   过去一年:<https://rsshub.app/yande.re/post/popular_recent/1y>

</Route>

## 百度趣画

### 更新

<Route author="xyqfer" example="/baidu/doodles" path="/baidu/doodles"/>

## 北京天文馆

### 每日一图

<Route author="HenryQW" example="/bjp/apod" path="/bjp/apod"/>

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

<Route author="gee1k xyqfer LogicJake" example="/mzitu/home" path="/mzitu/home/:type?" :paramsDesc="['类型，默认最新，可选`hot`最热或`best`推荐']" anticrawler="1"/>

### 分类

<Route author="gee1k xyqfer LogicJake" example="/mzitu/category/xinggan" path="/mzitu/category/:category" :paramsDesc="['分类名']" anticrawler="1">

| 性感妹子 | 日本妹子 | 台湾妹子 | 清纯妹子 |
| -------- | -------- | -------- | -------- |
| xinggan  | japan    | taiwan   | mm       |

</Route>

### 所有专题

<Route author="gee1k xyqfer LogicJake" example="/mzitu/tags" path="/mzitu/tags" anticrawler="1"/>

### 专题详情

<Route author="gee1k xyqfer LogicJake" example="/mzitu/tag/shishen" path="/mzitu/tag/:tag" :paramsDesc="['专题名, 可在专题页 URL 中找到']" anticrawler="1"/>

### 详情

<Route author="gee1k xyqfer LogicJake" example="/mzitu/post/129452" path="/mzitu/post/:id" :paramsDesc="['详情 id, 可在详情页 URL 中找到']" anticrawler="1"/>

## 喷嚏

### 图卦

<Route author="tgly307" example="/dapenti/tugua" path="/dapenti/tugua"/>

### 主题

<Route author="xyqfer" example="/dapenti/subject/184" path="/dapenti/subject/:id" :paramsDesc="['主题 id']"/>

## 涂鸦王国

### 用户上传作品和用户喜欢作品

<Route author="LanceZhu" example="/gracg/user11968EIcqS3" path="/gracg/:user/:love?" :paramsDesc="['用户访问ID，用户主页URL获取', '是否切换为用户喜欢作品, 不选或为 0 不切换，1则切换']"/>
