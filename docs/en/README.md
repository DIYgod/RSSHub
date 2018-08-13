---
sidebar: auto
---

<p align="center">
<img src="https://i.imgur.com/NZpRScX.png" alt="RSSHub" width="100">
</p>
<h1 align="center" class="logo">RSSHub</h1>

RSSHub is a lightweight and extensible RSS feed aggregator, it's able to generate feeds from pretty much everything.

## Special Thanks

### Special Sponsors

<p>
<a href="https://rixcloud.app/rsshub" target="_blank">
    <img width="200px" src="https://i.imgur.com/PpcSVCZ.png">
</a>
</p>
<p>
<a href="https://werss.app?utm_source=rsshub" target="_blank">
    <img width="150px" src="https://cdn.weapp.design/werss/werss-logo.png">
</a>
</p>

### Sponsors

-   [Liuyang](https://github.com/lingllting)

-   [Zuyang](https://zuyang.farbox.com)

-   [Sayori Studio](https://t.me/SayoriStudio)

[![](https://opencollective.com/static/images/become_sponsor.svg)](https://docs.rsshub.app/support/)

### Contributors

[![](https://opencollective.com/RSSHub/contributors.svg?width=890)](https://github.com/DIYgod/RSSHub/graphs/contributors)

::: tip

Free feel to test the [demo instance](https://rsshub.app), the cache expiry time is set to 10 minutes.

:::

## Parameters

::: tip

All parameters can be used together to generate a complex feed

:::

### Filtering

The following URL query parameters are supported, Regex support is built-in

Set `filter` to include the content

-   filter: filter title and description

-   filter_title: filter title only

-   filter_description: filter description only

For example: [https://rsshub.app/bilibili/user/coin/2267573?filter=微小微|赤九玖|暴走大事件](https://rsshub.app/bilibili/user/coin/2267573?filter=微小微|赤九玖|暴走大事件)

Set `filterout` to exclude unwanted content

-   filterout: filter title and description

-   filterout_title: filter title only

-   filterout_description: filter description only

For example: [https://rsshub.app/bilibili/user/coin/2267573?filterout=微小微|赤九玖|暴走大事件](https://rsshub.app/bilibili/user/coin/2267573?filterout=微小微|赤九玖|暴走大事件)

### Limit Entries

Set `limit` to limit the number of articles in the feed,

举例：bilibili 排行榜前 10 [https://rsshub.app/bilibili/ranking/0/3?limit=10](https://rsshub.app/bilibili/ranking/0/3?limit=10)

### Output Formats

RSSHub supports RSS 2.0、Atom and [JSON Feed](https://jsonfeed.org/) as the output formats, simply append `.rss` `.atom` or `.json` to the end of the feed address, default to RSS 2.0

For exmaple:

-   Default (RSS 2.0) - [https://rsshub.app/jianshu/home](https://rsshub.app/jianshu/home)
-   RSS 2.0 - [https://rsshub.app/jianshu/home.rss](https://rsshub.app/jianshu/home.rss)
-   Atom - [https://rsshub.app/jianshu/home.atom](https://rsshub.app/jianshu/home.atom)
-   JSON Feed - [https://rsshub.app/jianshu/home.json](https://rsshub.app/jianshu/home.json)
-   Apply filters or URL query [https://rsshub.app/bilibili/user/coin/2267573.atom?filter=微小微|赤九玖|暴走大事件](https://rsshub.app/bilibili/user/coin/2267573.atom?filter=微小微|赤九玖|暴走大事件)

## Application Updates

### RSSHub

Eg: [https://rsshub.app/rsshub/rss](https://rsshub.app/rsshub/rss)

Route: `/rsshub/rss`

Parameters: N/A

### MIUI

Eg: [https://rsshub.app/miui/aries/](https://rsshub.app/miui/aries/)

Route: `/miui/:device/:type?`

Parameters

device: the device `codename` eg. `aries` for Mi 2S

type: type, optional

| stable  | development |
| ------- | ----------- |
| release | dev         |

### Firefox

Eg: [https://rsshub.app/firefox/release/desktop](https://rsshub.app/firefox/release/desktop)

Route: `/firefox/release/:platform`

Parameters: platform

| Desktop | Android | Beta | Nightly | Android Beta |
| ------- | ------- | ---- | ------- | ------------ |
| desktop | android | beta | nightly | android-beta |

### 腾讯云移动直播 SDK

Eg: [https://rsshub.app/qcloud/mlvb/changelog](https://rsshub.app/qcloud/mlvb/changelog)

Route: `/qcloud/mlvb/changelog`

Parameters: N/A

### Bugly SDK

Eg: [https://rsshub.app/bugly/changelog/1](https://rsshub.app/bugly/changelog/1)

Route: `/bugly/changelog/:platform`

Parameters: platform, 平台类型, 必选, 1 为 Android, 2 为 iOS

## bilibili

### 番剧

Eg: [https://rsshub.app/bilibili/bangumi/21680](https://rsshub.app/bilibili/bangumi/21680)

Route: `/bilibili/bangumi/:seasonid`

Parameters: seasonid, 番剧 id, 番剧主页打开控制台执行 `window.__INITIAL_STATE__.ssId` 或 `window.__INITIAL_STATE__.mediaInfo.param.season_id` 获取

### UP 主投稿

Eg: [https://rsshub.app/bilibili/user/video/2267573](https://rsshub.app/bilibili/user/video/2267573)

Route: `/bilibili/user/video/:uid`

Parameters: uid, 用户 id, 可在 UP 主主页中找到

### UP 主动态

Eg: [https://rsshub.app/bilibili/user/dynamic/2267573](https://rsshub.app/bilibili/user/dynamic/2267573)

Route: `/bilibili/user/dynamic/:uid`

Parameters: uid, 用户 id, 可在 UP 主主页中找到

### UP 主频道

Eg: [https://rsshub.app/bilibili/channel/142821407/23390](https://rsshub.app/bilibili/channel/142821407/23390)

Route: `/bilibili/channel/:uid/:cid`

Parameters: uid, 用户 id, 可在 UP 主主页中找到

cid, 频道 ID, 可在频道的 URL 中找到

### UP 主默认收藏夹

Eg: [https://rsshub.app/bilibili/user/fav/2267573](https://rsshub.app/bilibili/user/fav/2267573)

Route: `/bilibili/user/fav/:uid`

Parameters: uid, 用户 id, 可在 UP 主主页中找到

### UP 主非默认收藏夹

Eg: [https://rsshub.app/bilibili/fav/756508/50948568](https://rsshub.app/bilibili/fav/756508/50948568)

Route: `/bilibili/fav/:uid/:fid`

Parameters: uid, 用户 id, 可在 UP 主主页中找到

fid, 收藏夹 ID,可在收藏夹的 URL 中找到,默认收藏夹建议使用 UP 主默认收藏夹功能

### UP 主投币视频

Eg: [https://rsshub.app/bilibili/user/coin/2267573](https://rsshub.app/bilibili/user/coin/2267573)

Route: `/bilibili/user/coin/:uid`

Parameters: uid, 用户 id, 可在 UP 主主页中找到

### UP 主粉丝

Eg: [https://rsshub.app/bilibili/user/followers/2267573](https://rsshub.app/bilibili/user/followers/2267573)

Route: `/bilibili/user/followers/:uid`

Parameters: uid, 用户 id, 可在 UP 主主页中找到

### UP 主关注用户

Eg: [https://rsshub.app/bilibili/user/followings/2267573](https://rsshub.app/bilibili/user/followings/2267573)

Route: `/bilibili/user/followings/:uid`

Parameters: uid, 用户 id, 可在 UP 主主页中找到

### 分区视频

Eg: [https://rsshub.app/bilibili/partion/33](https://rsshub.app/bilibili/partion/33)

Route: `/bilibili/partion/:tid`

Parameters: tid, 分区 id

动画

| MAD·AMV | MMD·3D | 短片·手书·配音 | 综合 |
| ------- | ------ | -------------- | ---- |
| 24      | 25     | 47             | 27   |

番剧

| 连载动画 | 完结动画 | 资讯 | 官方延伸 |
| -------- | -------- | ---- | -------- |
| 33       | 32       | 51   | 152      |

国创

| 国产动画 | 国产原创相关 | 布袋戏 | 资讯 |
| -------- | ------------ | ------ | ---- |
| 153      | 168          | 169    | 170  |

音乐

| 原创音乐 | 翻唱 | VOCALOID·UTAU | 演奏 | 三次元音乐 | OP/ED/OST | 音乐选集 |
| -------- | ---- | ------------- | ---- | ---------- | --------- | -------- |
| 28       | 31   | 30            | 59   | 29         | 54        | 130      |

舞蹈

| 宅舞 | 三次元舞蹈 | 舞蹈教程 |
| ---- | ---------- | -------- |
| 20   | 154        | 156      |

游戏

| 单机游戏 | 电子竞技 | 手机游戏 | 网络游戏 | 桌游棋牌 | GMV | 音游 | Mugen |
| -------- | -------- | -------- | -------- | -------- | --- | ---- | ----- |
| 17       | 171      | 172      | 65       | 173      | 121 | 136  | 19    |

科技

| 趣味科普人文 | 野生技术协会 | 演讲·公开课 | 星海 | 数码 | 机械 | 汽车 |
| ------------ | ------------ | ----------- | ---- | ---- | ---- | ---- |
| 124          | 122          | 39          | 96   | 95   | 98   | 176  |

生活

| 搞笑 | 日常 | 美食圈 | 动物圈 | 手工 | 绘画 | ASMR | 运动 | 其他 |
| ---- | ---- | ------ | ------ | ---- | ---- | ---- | ---- | ---- |
| 138  | 21   | 76     | 75     | 161  | 162  | 175  | 163  | 174  |

鬼畜

| 鬼畜调教 | 音 MAD | 人力 VOCALOID | 教程演示 |
| -------- | ------ | ------------- | -------- |
| 22       | 26     | 126           | 127      |

时尚

| 美妆 | 服饰 | 健身 | 资讯 |
| ---- | ---- | ---- | ---- |
| 157  | 158  | 164  | 159  |

广告

| 广告 |
| ---- |
| 166  |

娱乐

| 综艺 | 明星 | Korea 相关 |
| ---- | ---- | ---------- |
| 71   | 137  | 131        |

影视

| 影视杂谈 | 影视剪辑 | 短片 | 预告·资讯 | 特摄 |
| -------- | -------- | ---- | --------- | ---- |
| 182      | 183      | 85   | 184       | 86   |

纪录片

| 全部 | 人文·历史 | 科学·探索·自然 | 军事 | 社会·美食·旅行 |
| ---- | --------- | -------------- | ---- | -------------- |
| 177  | 37        | 178            | 179  | 180            |

电影

| 全部 | 华语电影 | 欧美电影 | 日本电影 | 其他国家 |
| ---- | -------- | -------- | -------- | -------- |
| 23   | 147      | 145      | 146      | 83       |

电视剧

| 全部 | 国产剧 | 海外剧 |
| ---- | ------ | ------ |
| 11   | 185    | 187    |

### 视频评论

Eg: [https://rsshub.app/bilibili/video/reply/21669336](https://rsshub.app/bilibili/video/reply/21669336)

Route: `/bilibili/video/reply/:aid`

Parameters: aid, 可在视频页 URL 中找到

### link 公告

Eg: [https://rsshub.app/bilibili/link/news/live](https://rsshub.app/bilibili/link/news/live)

Route: `/bilibili/link/news/:product`

Parameters: product, 公告分类 包括 直播:live 小视频:vc 相簿:wh

### 直播开播

Eg: [https://rsshub.app/bilibili/live/room/3](https://rsshub.app/bilibili/live/room/3)

Route: `bilibili/live/room/:roomID`

Parameters: roomID, 房间号 可在直播间 URL 中找到,长短号均可

### 直播搜索

Eg: [https://rsshub.app/bilibili/live/search/编程/online](https://rsshub.app/bilibili/live/search/编程/online)

Route: `bilibili/live/search/:key/:order`

Parameters

key: 搜索关键字

order: 排序方式, live_time 开播时间, online 人气

### 直播分区

::: warning

由于接口未提供开播时间, 如果直播间未更换标题与分区, 将视为一次。如果直播间更换分区与标题, 将视为另一项

:::

Eg: [https://rsshub.app/bilibili/live/area/143/online](https://rsshub.app/bilibili/live/area/143/online)

Route: `bilibili/live/area/:areaID/:order`

Parameters

areaID: 分区 ID 分区增删较多, 可通过 [分区列表](https://api.live.bilibili.com/room/v1/Area/getList) 查询

order: 排序方式, live_time 开播时间, online 人气

### 主站话题列表

Eg: [https://rsshub.app/bilibili/blackboard](https://rsshub.app/bilibili/blackboard)

Route: `bilibili/blackboard`

### 会员购新品上架

Eg: [https://rsshub.app/bilibili/mall/new](https://rsshub.app/bilibili/mall/new)

Route: `bilibili/mall/new`

### 会员购作品

Eg: [https://rsshub.app/bilibili/mall/ip/1_4494](https://rsshub.app/bilibili/mall/ip/1_4494)

Route: `/bilibili/mall/ip/:id`

Parameters: id, 作品 id, 可在作品列表页 URL 中找到

### 排行榜

Eg: [https://rsshub.app/bilibili/ranking/0/3](https://rsshub.app/bilibili/ranking/0/3)

Route: `/bilibili/ranking/:rid?/:day?`

Parameters:

day: 时间跨度, 可为 1 3 7 30

rid: 排行榜分区 id, 默认 0

| 全站 | 动画 | 国创相关 | 音乐 | 舞蹈 | 游戏 | 科技 | 生活 | 鬼畜 | 时尚 | 娱乐 | 影视 |
| ---- | ---- | -------- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 0    | 1    | 168      | 3    | 129  | 4    | 36   | 160  | 119  | 155  | 5    | 181  |

## bangumi

### 放送列表

Eg: [https://rsshub.app/bangumi/calendar/today](https://rsshub.app/bangumi/calendar/today)

Route: `/bangumi/calendar/today`

Parameters: N/A

## 微博

### 博主

Eg: [https://rsshub.app/weibo/user/3306934123](https://rsshub.app/weibo/user/3306934123)

Route: `/weibo/user/:uid`

Parameters: uid, 用户 id, 博主主页打开控制台执行 `/uid=(\d+)/. exec(document.querySelector('.opt_box .btn_bed').getAttribute('action-data'))[1]` 获取

::: warning

上述方案获取 V+ 付费博主会有数据缺失, 所以这里提供另外一种方式, 这种方式的缺点是描述不如上面的完善, 建议优先选择第一种方案

:::

Eg: [https://rsshub.app/weibo/user2/3306934123](https://rsshub.app/weibo/user2/3306934123)

Route: `/weibo/user2/:uid`

### 关键词

Eg: [https://rsshub.app/weibo/keyword/DIYgod](https://rsshub.app/weibo/keyword/DIYgod)

Route: `/weibo/keyword/:keyword`

Parameters: keyword, 你想订阅的微博关键词

## 贴吧

### 帖子列表

Eg: [https://rsshub.app/tieba/forum/女图](https://rsshub.app/tieba/forum/女图)

Route: `/tieba/forum/:kw`

Parameters: `kw`, 吧名

### 精品帖子

Eg: [https://rsshub.app/tieba/forum/good/女图](https://rsshub.app/tieba/forum/good/女图)

Route: `/tieba/forum/good/:kw/:cid?`

Parameters:

`kw`: 吧名

`cid`: 精品分类, 如果不传 `cid` 则获取全部分类

## 即刻

### 主题-精选

Eg: [https://rsshub.app/jike/topic/54dffb40e4b0f57466e675f0](https://rsshub.app/jike/topic/54dffb40e4b0f57466e675f0)

Route: `/jike/topic/:id`

Parameters: id, 主题 id, 可在即刻 web 端主题页或 APP 分享出来的主题页 URL 中找到

### 主题-广场

Eg: [https://rsshub.app/jike/topic/square/54dffb40e4b0f57466e675f0](https://rsshub.app/jike/topic/square/54dffb40e4b0f57466e675f0)

Route: `/jike/topic/square/:id`

Parameters: id, 主题 id, 可在即刻 web 端主题页或 APP 分享出来的主题页 URL 中找到

### 用户动态

Eg: [https://rsshub.app/jike/user/82D23B32-CF36-4C59-AD6F-D05E3552CBF3](https://rsshub.app/jike/user/82D23B32-CF36-4C59-AD6F-D05E3552CBF3)

Route: `/jike/user/:id`

Parameters: id, 用户 id, 可在即刻 web 端用户页 URL 中找到

## 微信

### 公众号

::: tip 提示

公众号抓取困难, 目前可提供的方案是通过即刻的公众号主题订阅

:::

Eg: [https://rsshub.app/jike/topic/584b8ac671a288001154a115](https://rsshub.app/jike/topic/584b8ac671a288001154a115)

## 网易云音乐

### 歌单歌曲

Eg: [https://rsshub.app/ncm/playlist/35798529](https://rsshub.app/ncm/playlist/35798529)

Route: `/ncm/playlist/:id`

Parameters: id, 歌单 id, 可在歌单页 URL 中找到

### 用户歌单

Eg: [https://rsshub.app/ncm/user/playlist/45441555](https://rsshub.app/ncm/user/playlist/45441555)

Route: `/ncm/user/playlist/:uid`

Parameters: uid, 用户 uid, 可在用户主页 URL 中找到

### 歌手专辑

Eg: [https://rsshub.app/ncm/artist/2116](https://rsshub.app/ncm/artist/2116)

Route: `/ncm/artist/:id`

Parameters: id, 歌手 id, 可在歌手详情页 URL 中找到

### 电台节目

Eg: [https://rsshub.app/ncm/djradio/347317067](https://rsshub.app/ncm/djradio/347317067)

Route: `/ncm/djradio/:id`

Parameters: id, 节目 id, 可在电台节目页 URL 中找到

## 掘金

### 分类

Eg: [https://rsshub.app/juejin/category/frontend](https://rsshub.app/juejin/category/frontend)

Route: `/juejin/category/:category`

Parameters: category, 分类名

| 前端     | Android | iOS | 后端    | 设计   | 产品    | 工具资源 | 阅读    | 人工智能 |
| -------- | ------- | --- | ------- | ------ | ------- | -------- | ------- | -------- |
| frontend | android | ios | backend | design | product | freebie  | article | ai       |

## 简书

### 首页

Eg: [https://rsshub.app/jianshu/home](https://rsshub.app/jianshu/home)

Route: `/jianshu/home`

Parameters: N/A

### 7 日热门

Eg: [https://rsshub.app/jianshu/trending/weekly](https://rsshub.app/jianshu/trending/weekly)

Route: `/jianshu/trending/weekly`

Parameters: N/A

### 30 日热门

Eg: [https://rsshub.app/jianshu/trending/monthly](https://rsshub.app/jianshu/trending/monthly)

Route: `/jianshu/trending/monthly`

Parameters: N/A

### 专题

Eg: [https://rsshub.app/jianshu/collection/xYuZYD](https://rsshub.app/jianshu/collection/xYuZYD)

Route: `/jianshu/collection/:id`

Parameters: id, 专题 id, 可在专题页 URL 中找到

### 作者

Eg: [https://rsshub.app/jianshu/user/yZq3ZV](https://rsshub.app/jianshu/user/yZq3ZV)

Route: `/jianshu/user/:id`

Parameters: id, 作者 id, 可在作者主页 URL 中找到

## 知乎

::: warning

知乎反爬虫策略非常严格, 以下演示经常失效, 建议自搭

:::

### 收藏夹

Eg: [https://rsshub.app/zhihu/collection/26444956](https://rsshub.app/zhihu/collection/26444956)

Route: `/zhihu/collection/:id`

Parameters: id, 收藏夹 id, 可在收藏夹页面 URL 中找到

### 用户动态

Eg: [https://rsshub.app/zhihu/people/activities/diygod](https://rsshub.app/zhihu/people/activities/diygod)

Route: `/zhihu/people/activities/:id`

Parameters: id, 用户 id, 可在用户主页 URL 中找到

### 用户回答

Eg: [https://rsshub.app/zhihu/people/answers/diygod](https://rsshub.app/zhihu/people/answers/diygod)

Route: `/zhihu/people/answers/:id`

Parameters: id, 用户 id, 可在用户主页 URL 中找到

### 专栏

Eg: [https://rsshub.app/zhihu/zhuanlan/googledevelopers](https://rsshub.app/zhihu/zhuanlan/googledevelopers)

Route: `/zhihu/zhuanlan/:id`

Parameters: id, 专栏 id, 可在专栏主页 URL 中找到

### 知乎日报

举例：[https://rsshub.app/zhihu/daily](https://rsshub.app/zhihu/daily)

路由：`/zhihu/daily`

## 自如

### 房源

Eg: [https://rsshub.app/ziroom/room/sh/1/2/五角场](https://rsshub.app/ziroom/room/sh/1/2/五角场)

Route: `/ziroom/room/:city/:iswhole/:room/:keyword`

Parameters

city: 城市, 北京 bj；上海 sh；深圳 sz；杭州 hz；南京 nj；广州 gz；成都 cd；武汉 wh；天津 tj

iswhole: 是否整租

room: 房间数

keyword: 关键词

## 快递

::: warning

快递送达后请及时取消订阅, 以免浪费服务器资源

:::

Eg: [https://rsshub.app/express/youzhengguoji/CV054432809US](https://rsshub.app/express/youzhengguoji/CV054432809US)

Route: `/express/:company/:number`

Parameters

company: 快递公司代码, 参考 [API URL 所支持的快递公司及 Parameters 说明](https://www.kuaidi100.com/download/api_kuaidi100_com%2820140729%29.doc)

number: 快递单号

## 妹子图

::: warning

该网站在国外无法访问, 故以下演示无效

:::

### 首页（最新）

Eg: [https://rsshub.app/mzitu](https://rsshub.app/mzitu)

Route: `/mzitu/`

### 分类

Eg: [https://rsshub.app/mzitu/category/hot](https://rsshub.app/mzitu/category/hot)

Route: `/mzitu/category/:category`

Parameters: category, 分类名

| 热门 | 推荐 | 性感妹子 | 日本妹子 | 台湾妹子 | 清纯妹子 |
| ---- | ---- | -------- | -------- | -------- | -------- |
| hot  | best | xinggan  | japan    | taiwan   | mm       |

### 所有专题

Eg: [https://rsshub.app/mzitu/tags](https://rsshub.app/mzitu/tags)

Route: `/mzitu/tags`

### 专题详情

Eg: [https://rsshub.app/mzitu/tag/shishen](https://rsshub.app/mzitu/tag/shishen)

Route: `/mzitu/tag/:tag`

Parameters: tag, 专题名, 可在专题页 URL 中找到

### 详情

Eg: [https://rsshub.app/mzitu/post/129452](https://rsshub.app/mzitu/post/129452)

Route: `/mzitu/post/:id`

Parameters: id, 详情 id, 可在详情页 URL 中找到

## pixiv

### 用户收藏

Eg: [https://rsshub.app/pixiv/user/bookmarks/15288095](https://rsshub.app/pixiv/user/bookmarks/15288095)

Route: `/pixiv/user/bookmarks/:id`

Parameters: id, 用户 id, 可在用户主页 URL 中找到

### 用户动态

Eg: [https://rsshub.app/pixiv/user/11](https://rsshub.app/pixiv/user/11)

Route: `/pixiv/user/:id`

Parameters: id, 用户 id, 可在用户主页 URL 中找到

### 排行榜

Eg: [https://rsshub.app/pixiv/ranking/week](https://rsshub.app/pixiv/ranking/week)

Route: `/pixiv/ranking/:mode/:date?`

Parameters

mode: 排行榜类型

| pixiv 日排行 | pixiv 周排行 | pixiv 月排行 | pixiv 受男性欢迎排行 | pixiv 受女性欢迎排行 | pixiv 原创作品排行 | pixiv 新人排行 |
| ------------ | ------------ | ------------ | -------------------- | -------------------- | ------------------ | -------------- |
| day          | week         | month        | day_male             | day_female           | week_original      | week_rookie    |

| pixiv R-18 日排行 | pixiv R-18 受男性欢迎排行 | pixiv R-18 受女性欢迎排行 | pixiv R-18 周排行 | pixiv R-18G 排行 |
| ----------------- | ------------------------- | ------------------------- | ----------------- | ---------------- |
| day_r18           | day_male_r18              | day_female_r18            | week_r18          | week_r18g        |

date: 日期, 取值形如 `2018-4-25`

## 豆瓣

### 正在上映的电影

Eg: [https://rsshub.app/douban/movie/playing](https://rsshub.app/douban/movie/playing)

Route: `/douban/movie/playing`

Parameters: N/A

### 正在上映的高分电影

Eg: [https://rsshub.app/douban/movie/playing/7.5](https://rsshub.app/douban/movie/playing/7.5)

路由

`/douban/movie/playing/:score`

`/douban/movie/playing/:score/:city`

Parameters

score: 返回大于等于这个分数的电影

city: 城市的中文名, 可选, 默认北京

### 即将上映的电影

Eg: [https://rsshub.app/douban/movie/later](https://rsshub.app/douban/movie/later)

Route: `/douban/movie/later`

Parameters: N/A

### 北美票房榜

Eg: [https://rsshub.app/douban/movie/ustop](https://rsshub.app/douban/movie/ustop)

Route: `/douban/movie/ustop`

Parameters: N/A

### 豆瓣小组

Eg: [https://rsshub.app/douban/group/camera](https://rsshub.app/douban/group/camera)

Route: `/douban/group/:groupid`

Parameters:
groupid: 豆瓣小组的 id

## 煎蛋

### 无聊图

Eg: [https://rsshub.app/jandan/pic](https://rsshub.app/jandan/pic)

Route: `/jandan/:sub_model`

### 妹子图

Eg: [https://rsshub.app/jandan/ooxx](https://rsshub.app/jandan/ooxx)

Route: `/jandan/:sub_model`

Parameters: N/A

## 喷嚏

### 图卦

Eg: [https://rsshub.app/dapenti/tugua](https://rsshub.app/dapenti/tugua)

Route: `/dapenti/tugua`

Parameters: N/A

## Dockone

### 周报

Eg: [https://rsshub.app/dockone/weekly](https://rsshub.app/dockone/weekly)

Route: `/dockone/weekly`

Parameters: N/A

## 腾讯吐个槽

### 吐槽新帖

Eg: [https://rsshub.app/tucaoqq/post/28564/CdRI0728](https://rsshub.app/tucaoqq/post/28564/CdRI0728)

Route: `/tucaoqq/post/:project/:key`

Parameters

project: 产品 ID

key: 产品密钥

## 笔趣阁

### 小说章节

Eg: [https://rsshub.app/biquge/novel/latestchapter/52_52542](https://rsshub.app/biquge/novel/latestchapter/52_52542)

Route: `/biquge/novel/latestchapter/:id`

Parameters: id, 小说 id, 可在对应小说页 URL 中找到

::: tip 提示

由于笔趣阁网站有多个, 各站点小说对应的小说 id 不同。此 feed 只对应在[`www.biquge5200.com`](https://www.biquge5200.com/)中的小说 id。

:::

## 开发者头条

### 今天头条

Eg: [https://rsshub.app/toutiao/today](https://rsshub.app/toutiao/today)

Route: `/toutiao/today`

### 独家号

Eg: [https://rsshub.app/toutiao/user/140544](https://rsshub.app/toutiao/user/140544)

Route: `/toutiao/user/:id`

Parameters: id, 独家号 id, 可在对应独家号页 URL 中找到

## 今日头条

### 关键词

Eg: [https://rsshub.app/jinritoutiao/keyword/ai](https://rsshub.app/jinritoutiao/keyword/ai)

Route: `/jinritoutiao/keyword/:keyword`

Parameters: keyword, 关键词

## 极客时间

### 专栏文章

> 极客时间专栏需要付费订阅, RSS 仅做更新提醒, 不含付费内容。

Eg: [https://rsshub.app/geektime/column/48](https://rsshub.app/geektime/column/48)

Route: `/geektime/column/:cid`

Parameters: cid, 专栏 id, 可从[全部专栏](https://time.geekbang.org/paid-content)进入专栏介绍页, 在 URL 中找到

## 央视新闻

### 专题

Eg: [https://rsshub.app/cctv/world](https://rsshub.app/cctv/world)

Route: `/cctv/:category`

Parameters: category, 分类名

| 国内  | 国际  | 视频  | 科技 | 社会    | 法律 | 娱乐 |
| ----- | ----- | ----- | ---- | ------- | ---- | ---- |
| china | world | video | tech | society | law  | ent  |

## Disqus

### 评论

Eg: [https://rsshub.app/disqus/posts/diygod-me](https://rsshub.app/disqus/posts/diygod-me)

Route: `/disqus/posts/:forum`

Parameters: forum, 网站的 disqus name

## Twitter

### 用户

Eg: [https://rsshub.app/twitter/user/DIYgod](https://rsshub.app/twitter/user/DIYgod)

Route: `/twitter/user/:id`

Parameters: id, 用户 id

## Instagram

### 用户

Eg: [https://rsshub.app/instagram/user/diygod](https://rsshub.app/instagram/user/diygod)

Route: `/instagram/user/:id`

Parameters: id, 用户 id

## Youtube

### 用户

Eg: [https://rsshub.app/youtube/user/JFlaMusic](https://rsshub.app/youtube/user/JFlaMusic)

Route: `/youtube/user/:username`

Parameters: username, 用户名

### 频道

Eg: [https://rsshub.app/youtube/channel/UCDwDMPOZfxVV0x_dz0eQ8KQ](https://rsshub.app/youtube/channel/UCDwDMPOZfxVV0x_dz0eQ8KQ)

Route: `/youtube/channel/:id`

Parameters: id, 频道 id

## 爱奇艺

### 动漫

Eg: [https://rsshub.app/iqiyi/dongman/a_19rrh1sifx](https://rsshub.app/iqiyi/dongman/a_19rrh1sifx)

Route: `/iqiyi/dongman/:id`

Parameters: id, 动漫 id, 可在该动漫主页 URL 中找到(不包括`.html`)

## 南方周末

### 新闻分类

举例：[https://rsshub.app/infzm/5](https://rsshub.app/infzm/5)

Route: `/infzm/:id`

Parameters: id, 南方周末内容分区 id, 可在该内容分区的 URL 中找到(即http://www.infzm.com/contents/:id), 注意 contents 为内容分区, content 为文章页, 添加前请留意。下面给出部分参考：

| 全站 | 新闻 | 经济 | 文化 | 评论 | 图片 | 生活 | 时政 | 社会 | 科技 | 绿色 | 头条 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 0    | 5    | 6    | 7    | 8    | 9    | 10   | 11   | 12   | 13   | 1374 | 2553 |

## Dribbble

### 流行

举例:

[https://rsshub.app/dribbble/popular](https://rsshub.app/dribbble/popular)

[https://rsshub.app/dribbble/popular/week](https://rsshub.app/dribbble/popular/week)

Route: `/dribbble/popular/:timeframe?`

Parameters: timeframe, 可选, 时间维度, 支持 week month year ever

### 用户（团队）

Eg: [https://rsshub.app/dribbble/user/google](https://rsshub.app/dribbble/user/google)

Route: `/dribbble/user/:name`

Parameters: name, 用户名, 可在该用户主页 URL 中找到

### 关键词

Eg: [https://rsshub.app/dribbble/keyword/player](https://rsshub.app/dribbble/keyword/player)

Route: `/dribbble/keyword/:keyword`

Parameters: keyword, 想要订阅的关键词

## 斗鱼

### 直播间开播

Eg: [https://rsshub.app/douyu/room/24422](https://rsshub.app/douyu/room/24422)

Route: `/douyu/room/:id`

Parameters: id, 直播间 id, 可在主播直播间页 URL 中找到

## 熊猫直播

### 直播间开播下播

Eg: [https://rsshub.app/panda/room/10300](https://rsshub.app/panda/room/10300)

Route: `/panda/room/:id`

Parameters: id, 直播间 id, 可在主播直播间页 URL 中找到

## V2EX

### 最热/最新主题

Eg: [https://rsshub.app/v2ex/topics/latest](https://rsshub.app/v2ex/topics/latest)

Route: `/v2ex/topics/:type`

Parameters: type: hot 或 latest

## Telegram

### 频道

::: tip 提示

订阅要求：将机器人 [@RSSHub_bot](https://t.me/RSSHub_bot) 加为频道管理员, 然后发一条消息后才可正常获取数据

:::

Eg: [https://rsshub.app/telegram/channel/awesomeDIYgod](https://rsshub.app/telegram/channel/awesomeDIYgod)

Route: `/telegram/channel/:username`

Parameters: username, 频道 username

## Readhub

### 分类

Eg: [https://rsshub.app/readhub/category/topic](https://rsshub.app/readhub/category/topic)

Route: `/readhub/category/:category`

Parameters: category, 分类名

| 热门话题 | 科技动态 | 开发者资讯 | 区块链快讯 |
| -------- | -------- | ---------- | ---------- |
| topic    | news     | technews   | blockchain |

## Konachan Anime Wallpapers

::: tip 提示

-   tags 可以在 [konachan](https://konachan.com/post) 选好后, 复制其 URL 中 tags= 后的 Parameters
-   路由可选 `/konachan` 或 `/konachan.com` 或 `/konachan.net`, 其中前两者相同, `.net` 是全年龄健康的壁纸 ♡

:::

### Posts

路由:

-   `/konachan/post`
-   `/konachan/post/:tags`

举例:

-   [https://rsshub.app/konachan/post](https://rsshub.app/konachan/post)
-   [https://rsshub.app/konachan/post/touhou](https://rsshub.app/konachan/post/touhou)
-   [https://rsshub.app/konachan/post/panties+rating%3Asafe](https://rsshub.app/konachan/post/panties+rating%3Asafe)

### Popular Recent Posts

路由:

-   `/konachan/post/popular_recent` 默认过去 24 小时
-   `/konachan/post/popular_recent/:period`

举例:

-   过去 24 小时:[https://rsshub.app/konachan/post/popular_recent/1d](https://rsshub.app/konachan/post/popular_recent/1d)
-   过去一周:[https://rsshub.app/konachan/post/popular_recent/1w](https://rsshub.app/konachan/post/popular_recent/1w)
-   过去一月:[https://rsshub.app/konachan/post/popular_recent/1m](https://rsshub.app/konachan/post/popular_recent/1m)
-   过去一年:[https://rsshub.app/konachan/post/popular_recent/1y](https://rsshub.app/konachan/post/popular_recent?period=1y)

## yande.re

### Posts

路由:

-   `/yande.re/post`
-   `/yande.re/post/:tags`

举例:

-   [https://rsshub.app/yande.re/post](https://rsshub.app/yande.re/post)
-   [https://rsshub.app/yande.re/post/the_idolm%40ster](https://rsshub.app/yande.re/post/the_idolm%40ster)
-   [https://rsshub.app/yande.re/post/kantai_collection](https://rsshub.app/yande.re/post/kantai_collection)
-   [https://rsshub.app/yande.re/post/love_live%21](https://rsshub.app/yande.re/post/love_live%21)

### Popular Recent Posts

路由:

-   `/yande.re/post/popular_recent` 默认过去 24 小时
-   `/yande.re/post/popular_recent/:period`

举例:

-   过去 24 小时:[https://rsshub.app/yande.re/post/popular_recent/1d](https://rsshub.app/yande.re/post/popular_recent/1d)
-   过去一周:[https://rsshub.app/yande.re/post/popular_recent/1w](https://rsshub.app/yande.re/post/popular_recent/1w)
-   过去一月:[https://rsshub.app/yande.re/post/popular_recent/1m](https://rsshub.app/yande.re/post/popular_recent/1m)
-   过去一年:[https://rsshub.app/yande.re/post/popular_recent/1y](https://rsshub.app/yande.re/post/popular_recent?period=1y)

## GitHub

::: tip 提示

GitHub 官方也提供了一些 RSS:

-   仓库 releases: https://github.com/:owner/:repo/releases.atom
-   仓库 commits: https://github.com/:owner/:repo/commits.atom
-   用户动态: https://github.com/:user.atom

:::

### 用户仓库

Eg: [https://rsshub.app/github/repos/DIYgod](https://rsshub.app/github/repos/DIYgod)

Route: `/github/repos/:user`

Parameters: user, 用户名

### Trending

举例:

[https://rsshub.app/github/trending/daily](https://rsshub.app/github/trending/daily)

[https://rsshub.app/github/trending/daily/javascript](https://rsshub.app/github/trending/daily/javascript)

Route: `/github/trending/:since/:language?`

Parameters:

since, 时间跨度, 可在 [Trending 页](https://github.com/trending/javascript?since=monthly) URL 中找到, 可选 daily weekly monthly

language, 语言, 可在 [Trending 页](https://github.com/trending/javascript?since=monthly) URL 中找到

### Issue

Eg: [https://rsshub.app/github/issue/DIYgod/RSSHub](https://rsshub.app/github/issue/DIYgod/RSSHub)

Route: `/github/issue/:user/:repo`

Parameters: user, 用户名
Parameters: repo, 仓库名

## 纽约时报

::: tip 提示

纽约时报 RSS: https://cn.nytimes.com/rss/

:::

### 新闻早报

Eg: [https://rsshub.app/nytimes/morning_post](https://rsshub.app/nytimes/morning_post)

Route: `/nytimes/morning_post`

Parameters: N/A

## UU 看书

### 小说章节

Eg: [https://rsshub.app/uukanshu/chapter/49621](https://rsshub.app/uukanshu/chapter/49621)

Route: `/uukanshu/chapter/:id`

Parameters: id, 小说 id, 可在对应小说页 URL 中找到

## 3DMGame

### 新闻中心

Eg: [https://rsshub.app/3dm/news](https://rsshub.app/3dm/news)

Route: `/3dm/news`

Parameters: N/A

### 新闻

Eg: [https://rsshub.app/3dm/detroitbecomehuman/news](https://rsshub.app/3dm/detroitbecomehuman/news)

Route: `/3dm/:name/news`

Parameters: name, 游戏的编号可以在专题页的 url 中找到

### 攻略

Eg: [https://rsshub.app/3dm/detroitbecomehuman/gl](https://rsshub.app/3dm/detroitbecomehuman/gl)

Route: `/3dm/:name/gl`

Parameters: name, 游戏的编号可以在专题页的 url 中找到

### 下载

Eg: [https://rsshub.app/3dm/detroitbecomehuman/download](https://rsshub.app/3dm/detroitbecomehuman/download)

Route: `/3dm/:name/download`

Parameters: name, 游戏的编号可以在专题页的 url 中找到

## 喜马拉雅

### 专辑

Eg: [https://rsshub.app/ximalaya/album/shangye/299146/](https://rsshub.app/ximalaya/album/shangye/299146/)

Route: `/ximalaya/album/:classify/:id`

Parameters:

classify, 专辑分类, 可在对应专辑页面的 URL 中找到

id, 专辑 id, 可在对应专辑页面的 URL 中找到

## EZTV

::: tip 提示

网站提供了全部种子的 RSS：https://eztv.ag/ezrss.xml

:::

### Lookup Torrents by IMDB ID

Eg: [https://rsshub.app/eztv/torrents/6048596](https://rsshub.app/eztv/torrent/6048596)

Route: `/eztv/torrents/:imdb_id`

Parameters: imdb_id, 想搜寻的 show 的种子所对应的 IMDB ID, 可在 [IMDB](https://www.imdb.com) 官网找到

## 什么值得买

::: tip 提示

网站也提供了部分 RSS：https://www.smzdm.com/dingyue

:::

### 关键词

Eg: [https://rsshub.app/smzdm/keyword/女装](https://rsshub.app/smzdm/keyword/女装)

Route: `/smzdm/keyword/:keyword`

Parameters: keyword, 你想订阅的关键词

### 排行榜

Eg: [https://rsshub.app/smzdm/ranking/pinlei/11/3](https://rsshub.app/smzdm/ranking/pinlei/11/3)

Route: `/smzdm/ranking/:rank_type/:rank_id/:hour`

Parameters

**rank_type**

| 好价品类榜 | 好价电商榜 | 海淘 TOP 榜 | 好文排行榜 | 好物排行榜 |
| ---------- | ---------- | ----------- | ---------- | ---------- |
| pinlei     | dianshang  | haitao      | haowen     | haowu      |

**rank_id**

好价品类榜

| 全部 | 时尚运动 | 3C 家电 | 食品家居 | 日百母婴 | 出行游玩 | 白菜 | 凑单品 |
| ---- | -------- | ------- | -------- | -------- | -------- | ---- | ------ |
| 11   | 12       | 13      | 14       | 15       | 16       | 17   | 22     |

好价电商榜

| 券活动 | 京东 | 天猫 | 亚马逊中国 | 国美在线 | 苏宁易购 | 网易 | 西集网 | 美国亚马逊 | 日本亚马逊 | ebay |
| ------ | ---- | ---- | ---------- | -------- | -------- | ---- | ------ | ---------- | ---------- | ---- |
| 24     | 23   | 25   | 26         | 27       | 28       | 29   | 30     | 31         | 32         | 33   |

海淘 TOP 榜

| 全部 | 海外直邮 | 美国榜 | 欧洲榜 | 澳新榜 | 亚洲榜 | 晒物榜 |
| ---- | -------- | ------ | ------ | ------ | ------ | ------ |
| 39   | 34       | 35     | 36     | 37     | 38     | hsw    |

好文排行榜

| 原创 | 资讯 |
| ---- | ---- |
| yc   | zx   |

好物排行榜

| 新晋榜 | 消费众测 | 新锐品牌 | 好物榜单 |
| ------ | -------- | -------- | -------- |
| hwall  | zc       | nb       | hw       |

**hour**: 时间跨度

## 上海海事大学

### 学术讲座

Eg: [https://rsshub.app/shmtu/events](https://rsshub.app/shmtu/events)

Route: `/shmtu/events`

Parameters: N/A

### 通知公告

Eg: [https://rsshub.app/shmtu/notes](https://rsshub.app/shmtu/notes)

Route: `/shmtu/notes`

Parameters: N/A

### 教务信息

Eg: [https://rsshub.app/shmtu/jwc/1](https://rsshub.app/shmtu/jwc/1)

Route: `/shmtu/jwc/:type`

Parameters: type, 1 为教务新闻,2 为教务公告

## 新京报

### 栏目

Eg: [https://rsshub.app/bjnews/realtime](https://rsshub.app/bjnews/realtime)

路由： `/bjnews/:category`

Parameters: category, 新京报的栏目名, 点击对应栏目后在地址栏找到

## 停水通知

配合 [IFTTT](https://ifttt.com/) Applets [邮件通知](https://ifttt.com/applets/SEvmDVKY-) 使用实现自动通知效果

### 杭州市

Eg: [https://rsshub.app/tingshuitz/hangzhou](https://rsshub.app/tingshuitz/hangzhou)

Route: `/tingshuitz/hangzhou`

Parameters: N/A

### 萧山区

Eg: [https://rsshub.app/tingshuitz/xiaoshan](https://rsshub.app/tingshuitz/xiaoshan)

Route: `/tingshuitz/xiaoshan`

Parameters: N/A

### 大连市

Eg: [https://rsshub.app/tingshuitz/dalian](https://rsshub.app/tingshuitz/dalian)

Route: `/tingshuitz/dalian`

Parameters: N/A

## 米哈游

### 崩坏 2-游戏公告

Eg: [https://rsshub.app/mihoyo/bh2/gach](https://rsshub.app/mihoyo/bh2/gach)

Route: `/mihoyo/bh2/:type`

Parameters: type, 公告种类

| 最新公告 | 版本信息 | 祈愿信息 | 活动介绍 |
| -------- | -------- | -------- | -------- |
| new      | version  | gach     | event    |

### 崩坏 3-游戏公告

Eg: [https://rsshub.app/mihoyo/bh3/strategy](https://rsshub.app/mihoyo/bh3/strategy)

Route: `/mihoyo/bh3/:type`

Parameters: type, 公告种类

| 最新   | 公告   | 新闻 | 活动     | 攻略     |
| ------ | ------ | ---- | -------- | -------- |
| latest | notice | news | activity | strategy |

## 灵梦御所

### 分类

Eg: [https://rsshub.app/reimu/category/music](https://rsshub.app/reimu/category/music)

Route: `/reimu/category/:category`

Parameters: category, 分类名

| 3d  | 动画  | 合集       | 图包    | 壁纸      | 御所汉化 | 游戏 | 漫画  | 独立  | 表番推荐  | 音声  |
| --- | ----- | ---------- | ------- | --------- | -------- | ---- | ----- | ----- | --------- | ----- |
| 3d  | anime | collection | picture | wallpaper | chinese  | game | comic | indie | recommend | music |

### 标签

Eg: [https://rsshub.app/reimu/tag/ntr](https://rsshub.app/reimu/tag/ntr)

Route: `/reimu/tag/:tag`

Parameters: tag, 标签名, 例如: **ntr**, **rbq**, **凌辱**

## 草榴社区

### 分区帖子

Eg: [https://rsshub.app/t66y/7](https://rsshub.app/t66y/7)

Route: `/t66y/:id`

Parameters: id, 分区 id, 可在分区页 URL 中找到

| 亚洲无码原创区 | 亚洲有码原创区 | 欧美原创区 | 动漫原创区 | 国产原创区 |
| -------------- | -------------- | ---------- | ---------- | ---------- |
| 2              | 15             | 4          | 5          | 25         |

| 中字原创区 | 转帖交流区 | HTTP 下载区 | 在线成人区 |
| ---------- | ---------- | ----------- | ---------- |
| 26         | 27         | 21          | 22         |

| 技术讨论区 | 新时代的我们 | 达盖尔的旗帜 |
| ---------- | ------------ | ------------ |
| 7          | 8            | 16           |

## 科技星球

### 首页

Eg: [https://rsshub.app/kejixingqiu/home](https://rsshub.app/kejixingqiu/home)

Route: `/kejixingqiu/home`

## 北大信科

### 公告通知

Eg: [https://rsshub.app/pku/eecs/0](https://rsshub.app/pku/eecs/0)

Route: `/eecs/:type`

可选 Parameters: type, 分区 type, 可在网页 URL 中找到

| 全部 | 学院通知 | 人事通知 | 教务通知 | 学工通知 | 科研通知 | 财务通知 | 工会通知 | 院友通知 |
| ---- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 0    | 1        | 2        | 6        | 8        | 7        | 5        | 3        | 4        |

## 机核网

### 分类

Eg: [https://rsshub.app/gcores/category/1](https://rsshub.app/gcores/category/1)

Route: `/gcores/category/:category`

Parameters: category, 分类名

| 文章 | 新闻 | 电台 |
| ---- | ---- | ---- |
| 1    | 2    | 9    |

## 国家地理

### 分类

举例:

[https://rsshub.app/natgeo/travel](https://rsshub.app/natgeo/travel)

[https://rsshub.app/natgeo/news/ngnews](https://rsshub.app/natgeo/news/ngnews)

路由： `/natgeo/:cat/:type?`

Parameters: cat, 分类; type, 类型

可在 url 中获取, 例如`https://www.natgeomedia.com/category/news/ngnews`对应 cat, type 分别为 news, ngnews

## ONE · 一个

举例： [https://rsshub.app/one](https://rsshub.app/one)

Route: `/one`

Parameters: N/A

## 推酷

### 周刊

Eg: [https://rsshub.app/tuicool/mags/tech](https://rsshub.app/tuicool/mags/tech)

Route: `/tuicool/mags/:type`

Parameters: type

| 编程狂人 | 设计匠艺 | 创业周刊 | 科技周刊 |
| -------- | -------- | -------- | -------- |
| prog     | design   | startup  | tech     |

## Hexo

### Next 主题

举例：[http://rsshub.app/hexo/next/fengkx.top](http://rsshub.app/hexo/next/fengkx.top)

路由： `/hexo/next/:url`

Parameters: url 博客 Url 不带协议头

## 小米

### 众筹

举例： [https://rsshub.app/mi/crowdfunding](https://rsshub.app/mi/crowdfunding)

Route: `/mi/crowdfunding`

Parameters: N/A

## 华南师范大学

### 教务处通知

举例： [https://rsshub.app/scnu/jw](https://rsshub.app/scnu/jw)

路由： `/scnu/jw`

Parameters: N/A

### 图书馆通知

举例： [https://rsshub.app/scnu/library](https://rsshub.app/scnu/library)

路由： `/scnu/library`

Parameters: N/A

### 计算机学院竞赛通知

举例： [https://rsshub.app/scnu/cs/match](https://rsshub.app/scnu/cs/match)

路由： `/scnu/cs/match`

Parameters: N/A

## Keep

### 运动日记

举例：[https://rsshub.app/keep/user/556b02c1ab59390afea671ea](https://rsshub.app/keep/user/556b02c1ab59390afea671ea)

Route: `/keep/user/:id`

Parameters: id, Keep 用户 id

## 起点

### 章节

举例： [https://rsshub.app/qidian/chapter/1010400217](https://rsshub.app/qidian/chapter/1010400217)

路由： `/qidian/chapter/:id`

Parameters: id, 小说 id, 可在对应小说页 URL 中找到

### 讨论区

举例： [https://rsshub.app/qidian/forum/1010400217](https://rsshub.app/qidian/forum/1010400217)

路由： `/qidian/forum/:id`

Parameters: id, 小说 id, 可在对应小说页 URL 中找到

## 懂球帝

### 早报

举例： [https://rsshub.app/dongqiudi/daily](https://rsshub.app/dongqiudi/daily)

路由： `/dongqiudi/daily`

Parameters: N/A

## 维基百科

### 中国大陆新闻动态

举例： [https://rsshub.app/wikipedia/mainland](https://rsshub.app/wikipedia/mainland)

路由： `/wikipedia/mainland`

Parameters: N/A

## 雪球

### 用户动态

Eg: [https://rsshub.app/xueqiu/user/8152922548](https://rsshub.app/xueqiu/user/8152922548)

Route: `/xueqiu/user/:id/:type?`

Parameters:

id, 用户 id, 可在用户主页 URL 中找到

type, 可选, 动态的类型, 不填则默认全部

| 原发布 | 长文 | 问答 | 热门 | 交易 |
| ------ | ---- | ---- | ---- | ---- |
| 0      | 2    | 4    | 9    | 11   |

### 用户收藏动态

Eg: [https://rsshub.app/xueqiu/favorite/8152922548](https://rsshub.app/xueqiu/favorite/8152922548)

Route: `/xueqiu/favorite/:id`

Parameters:

id, 用户 id, 可在用户主页 URL 中找到

## 中国美术馆

### 通知公告

举例： [https://rsshub.app/namoc/announcement](https://rsshub.app/namoc/announcement)

路由： `/namoc/announcement`

Parameters: N/A

### 新闻

举例： [https://rsshub.app/namoc/news](https://rsshub.app/namoc/news)

路由： `/namoc/news`

Parameters: N/A

### 媒体联报

举例： [https://rsshub.app/namoc/media](https://rsshub.app/namoc/media)

路由： `/namoc/media`

Parameters: N/A

### 展览预告

举例： [https://rsshub.app/namoc/exhibition](https://rsshub.app/namoc/exhibition)

路由： `/namoc/exhibition`

Parameters: N/A

### 焦点专题

举例： [https://rsshub.app/namoc/specials](https://rsshub.app/namoc/specials)

路由： `/namoc/specials`

Parameters: N/A

## Greasy Fork

### 脚本更新

Eg: [https://rsshub.app/greasyfork/zh-CN/bilibili.com](https://rsshub.app/greasyfork/zh-CN/bilibili.com)

Route: `/greasyfork/:language/:domain?`

Parameters:

language, 语言, 可在网站右上角找到, `all` 为所有语言

domain, 按脚本生效域名过滤, 可选

## LinkedKeeper

### 博文

Eg: [https://rsshub.app/linkedkeeper/sub/1](https://rsshub.app/linkedkeeper/sub/1)

Route: `/linkedkeeper/:type/:id?`

Parameters:

type, 博文分类, 为 URL 中 `.action` 的文件名

id, 可选, 分区或标签的 ID, 对应 URL 中的 `sid` 或 `tid`

## 开源中国

### 资讯

Eg: [https://rsshub.app/oschina/news](https://rsshub.app/oschina/news)

Route: `/oschina/news`

Parameters: N/A

## All the Flight Deals

### 特价机票 Flight Deals

Eg: [https://rsshub.app/atfd/us+new york,gb+london/1](https://rsshub.app/atfd/us+new york,gb+london/1)

Route: `/atfd/:locations/:nearby?`

Parameters:

locations:

    1. 始发地 ISO 3166-1 国家代码+城市名称, 例如 `us+new york`, https://rsshub.app/atfd/us+new york
    2. 支持逗号区分多个始发地, 例如 `us+new york,gb+london`, https://rsshub.app/atfd/us+new york,gb+london/

    ISO 3166-1 国家代码列表请参见 https://en.wikipedia.org/wiki/ISO_3166-1

nearby: 可选 0 或 1, 默认 0 为不包括, 是否包括临近机场
