---
sidebar: auto
---

<p align="center">
<img src="https://i.imgur.com/NZpRScX.png" alt="RSSHub" width="100">
</p>
<h1 align="center" class="logo">RSSHub</h1>

RSSHub 是一个轻量、易于扩展的 RSS 生成器，可以给任何奇奇怪怪的内容生成 RSS 订阅源

::: tip 提示
演示域名为 [rss.now.sh](https://rss.now.sh)，缓存时间 5 分钟，可以随意使用
:::

## 内容过滤

可以使用以下 URL query 过滤出想要的内容，支持正则

- filter: 过滤标题和描述

- filter_title: 过滤标题

- filter_description: 过滤描述

举例: [https://rss.now.sh/bilibili/user/coin/2267573?filter=微小微|赤九玖|暴走大事件](https://rss.now.sh/bilibili/user/coin/2267573?filter=微小微|赤九玖|暴走大事件)

## bilibili

### 番剧

举例: [https://rss.now.sh/bilibili/bangumi/21680](https://rss.now.sh/bilibili/bangumi/21680)

路由: `/bilibili/bangumi/:seasonid`

参数: seasonid，番剧 id，可在番剧主页 URL 中找到

### UP 主投稿

举例: [https://rss.now.sh/bilibili/user/video/2267573](https://rss.now.sh/bilibili/user/video/2267573)

路由: `/bilibili/user/video/:uid`

参数: uid，用户 id，可在 UP 主主页中找到

### UP 主动态

举例: [https://rss.now.sh/bilibili/user/dynamic/2267573](https://rss.now.sh/bilibili/user/dynamic/2267573)

路由: `/bilibili/user/dynamic/:uid`

参数: uid，用户 id，可在 UP 主主页中找到

### UP 主收藏夹

举例: [https://rss.now.sh/bilibili/user/fav/2267573](https://rss.now.sh/bilibili/user/fav/2267573)

路由: `/bilibili/user/fav/:uid`

参数: uid，用户 id，可在 UP 主主页中找到

### UP 主投币视频

举例: [https://rss.now.sh/bilibili/user/coin/2267573](https://rss.now.sh/bilibili/user/coin/2267573)

路由: `/bilibili/user/coin/:uid`

参数: uid，用户 id，可在 UP 主主页中找到

### UP 主粉丝

举例: [https://rss.now.sh/bilibili/user/followers/2267573](https://rss.now.sh/bilibili/user/followers/2267573)

路由: `/bilibili/user/followers/:uid`

参数: uid，用户 id，可在 UP 主主页中找到

### UP 主关注用户

举例: [https://rss.now.sh/bilibili/user/followings/2267573](https://rss.now.sh/bilibili/user/followings/2267573)

路由: `/bilibili/user/followings/:uid`

参数: uid，用户 id，可在 UP 主主页中找到

### 分区视频

举例: [https://rss.now.sh/bilibili/partion/33](https://rss.now.sh/bilibili/partion/33)

路由: `/bilibili/partion/:tid`

参数: tid，分区 id

动画

| MAD·AMV | MMD·3D | 短片·手书·配音 | 综合   |
| ------- | ------ | -------- | ---- |
| 24      | 25     | 47       | 27   |

番剧

| 连载动画 | 完结动画 | 资讯   | 官方延伸 |
| ---- | ---- | ---- | ---- |
| 33   | 32   | 51   | 152  |

国创

| 国产动画 | 国产原创相关 | 布袋戏  | 资讯   |
| ---- | ------ | ---- | ---- |
| 153  | 168    | 169  | 170  |

音乐

| 原创音乐 | 翻唱   | VOCALOID·UTAU | 演奏   | 三次元音乐 | OP/ED/OST | 音乐选集 |
| ---- | ---- | ------------- | ---- | ----- | --------- | ---- |
| 28   | 31   | 30            | 59   | 29    | 54        | 130  |

舞蹈

| 宅舞   | 三次元舞蹈 | 舞蹈教程 |
| ---- | ----- | ---- |
| 20   | 154   | 156  |

游戏

| 单机游戏 | 电子竞技 | 手机游戏 | 网络游戏 | 桌游棋牌 | GMV  | 音游   | Mugen |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ----- |
| 17   | 171  | 172  | 65   | 173  | 121  | 136  | 19    |

科技

| 趣味科普人文 | 野生技术协会 | 演讲·公开课 | 星海   | 数码   | 机械   | 汽车   |
| ------ | ------ | ------ | ---- | ---- | ---- | ---- |
| 124    | 122    | 39     | 96   | 95   | 98   | 176  |

生活

| 搞笑   | 日常   | 美食圈  | 动物圈  | 手工   | 绘画   | ASMR | 运动   | 其他   |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 138  | 21   | 76   | 75   | 161  | 162  | 175  | 163  | 174  |

鬼畜

| 鬼畜调教 | 音MAD | 人力VOCALOID | 教程演示 |
| ---- | ---- | ---------- | ---- |
| 22   | 26   | 126        | 127  |

s

| 美妆   | 服饰   | 健身   | 资讯   |
| ---- | ---- | ---- | ---- |
| 157  | 158  | 164  | 159  |

广告

| 广告   |
| ---- |
| 166  |

娱乐

| 综艺   | 明星   | Korea相关 |
| ---- | ---- | ------- |
| 71   | 137  | 131     |

影视

| 影视杂谈 | 影视剪辑 | 短片   | 预告·资讯 | 特摄   |
| ---- | ---- | ---- | ----- | ---- |
| 182  | 183  | 85   | 184   | 86   |

### 视频评论

举例: [https://rss.now.sh/bilibili/video/reply/21669336](https://rss.now.sh/bilibili/video/reply/21669336)

路由: `/bilibili/video/reply/:aid`

参数: aid，可在视频页 URL 中找到

### link 公告

举例: [https://rss.now.sh/bilibili/link/news/live](https://rss.now.sh/bilibili/link/news/live)

路由: `/bilibili/link/news/:product`

参数: product, 公告分类 包括 直播:live 小视频:vc 相簿:wh

### 直播开播

举例: [https://rss.now.sh/bilibili/live/room/3](https://rss.now.sh/bilibili/live/room/3)

路由: `bilibili/live/room/:roomID`

参数: roomID, 房间号 可在直播间 URL 中找到,长短号均可

### 直播搜索

举例: [https://rss.now.sh/bilibili/live/search/编程/online](https://rss.now.sh/bilibili/live/search/编程/online)

路由: `bilibili/live/search/:key/:order`

参数: key, 搜索关键字

order ,排序方式 开播时间: live_time,人气:online

### 直播分区

::: warning 注意
由于接口未提供开播时间,如果直播间未更换标题与分区,将只会出现一次.如果直播间更换分区与标题,将再出现一次
:::

举例: [https://rss.now.sh/bilibili/live/area/143/online](https://rss.now.sh/bilibili/live/area/143/online)

路由: `bilibili/live/area/:areaID/:order`

参数: areaID , 分区ID 分区增删较多,可通过 [分区列表](https://api.live.bilibili.com/room/v1/Area/getList) 查询  

order ,排序方式 开播时间: live_time,人气:online

## 微博

### 博主

举例: [https://rss.now.sh/weibo/user/3306934123](https://rss.now.sh/weibo/user/3306934123)

路由: `/weibo/user/:uid`

参数: uid，用户 id，博主主页打开控制台执行 `/uid=(\d+)/. exec(document.querySelector('.opt_box .btn_bed').getAttribute('action-data'))[1]` 获取

### 关键词

举例: [https://rss.now.sh/weibo/keyword/DIYgod](https://rss.now.sh/weibo/keyword/DIYgod)

路由: `/weibo/keyword/:keyword`

参数: keyword，你想订阅的微博关键词

## 即刻

### 主题

举例: [https://rss.now.sh/jike/topic/54dffb40e4b0f57466e675f0](https://rss.now.sh/jike/topic/54dffb40e4b0f57466e675f0)

路由: `/jike/topic/:id`

参数: id，主题 id，可在即刻 web 端主题页或 APP 分享出来的主题页 URL 中找到

### 用户动态

举例: [https://rss.now.sh/jike/user/82D23B32-CF36-4C59-AD6F-D05E3552CBF3](https://rss.now.sh/jike/user/82D23B32-CF36-4C59-AD6F-D05E3552CBF3)

路由: `/jike/user/:id`

参数: id，用户 id，可在即刻 web 端用户页 URL 中找到

## 网易云音乐

### 歌单歌曲

举例: [https://rss.now.sh/ncm/playlist/35798529](https://rss.now.sh/ncm/playlist/35798529)

路由: `/ncm/playlist/:id`

参数: id，歌单 id，可在歌单页 URL 中找到

### 用户歌单

举例: [https://rss.now.sh/ncm/user/playlist/45441555](https://rss.now.sh/ncm/user/playlist/45441555)

路由: `/ncm/user/playlist/:uid`

参数: uid，用户 uid，可在用户主页 URL 中找到

### 歌手专辑

举例: [https://rss.now.sh/ncm/artist/2116](https://rss.now.sh/ncm/artist/2116)

路由: `/ncm/artist/:id`

参数: id，歌手 id，可在歌手详情页 URL 中找到

## 掘金

### 分类

举例: [https://rss.now.sh/juejin/category/frontend](https://rss.now.sh/juejin/category/frontend)

路由: `/juejin/category/:category`

参数: category，分类名

| 前端       | Android | iOS  | 后端      | 设计     | 产品      | 工具资源    | 阅读      | 人工智能 |
| -------- | ------- | ---- | ------- | ------ | ------- | ------- | ------- | ---- |
| frontend | android | ios  | backend | design | product | freebie | article | ai   |

## 简书

### 首页

举例: [https://rss.now.sh/jianshu/home](https://rss.now.sh/jianshu/home)

路由: `/jianshu/home`

参数: 无

### 7 日热门

举例: [https://rss.now.sh/jianshu/trending/weekly](https://rss.now.sh/jianshu/trending/weekly)

路由: `/jianshu/trending/weekly`

参数: 无

### 30 日热门

举例: [https://rss.now.sh/jianshu/trending/monthly](https://rss.now.sh/jianshu/trending/monthly)

路由: `/jianshu/trending/monthly`

参数: 无

### 专题

举例: [https://rss.now.sh/jianshu/collection/xYuZYD](https://rss.now.sh/jianshu/collection/xYuZYD)

路由: `/jianshu/collection/:id`

参数: id，专题 id，可在专题页 URL 中找到

### 作者

举例: [https://rss.now.sh/jianshu/user/yZq3ZV](https://rss.now.sh/jianshu/user/yZq3ZV)

路由: `/jianshu/user/:id`

参数: id，作者 id，可在作者主页 URL 中找到


## 知乎

### 收藏夹

举例: [https://rss.now.sh/zhihu/collection/26444956](https://rss.now.sh/zhihu/collection/26444956)

路由: `/zhihu/collection/:id`

参数: id，收藏夹 id，可在收藏夹页面 URL 中找到

### 用户动态

举例: [https://rss.now.sh/zhihu/people/activities/diygod](https://rss.now.sh/zhihu/people/activities/diygod)

路由: `/zhihu/people/activities/:id`

参数: id，用户 id，可在用户主页 URL 中找到

### 用户回答

举例: [https://rss.now.sh/zhihu/people/answers/diygod](https://rss.now.sh/zhihu/people/answers/diygod)

路由: `/zhihu/people/answers/:id`

参数: id，用户 id，可在用户主页 URL 中找到

### 专栏

举例: [https://rss.now.sh/zhihu/zhuanlan/googledevelopers](https://rss.now.sh/zhihu/zhuanlan/googledevelopers)

路由: `/zhihu/zhuanlan/:id`

参数: id，专栏 id，可在专栏主页 URL 中找到

## 自如

### 房源

举例: [https://rss.now.sh/ziroom/room/sh/1/2/五角场](https://rss.now.sh/ziroom/room/sh/1/2/五角场)

路由: `/ziroom/room/:city/:iswhole/:room/:keyword`

参数

city: 城市，北京 bj；上海 sh；深圳 sz；杭州 hz；南京 nj；广州 gz；成都 cd；武汉 wh；天津 tj

iswhole: 是否整租

room: 房间数

keyword: 关键词

## 快递

::: warning 注意
快递送达后请及时取消订阅，以免不必要地浪费服务器资源
:::

举例: [https://rss.now.sh/express/youzhengguoji/CV054432809US](https://rss.now.sh/express/youzhengguoji/CV054432809US)

路由: `/express/:company/:number`

参数

company: 快递公司代码，参考 [API URL 所支持的快递公司及参数说明](https://www.kuaidi100.com/download/api_kuaidi100_com%2820140729%29.doc)

number: 快递单号

## 贴吧

### 帖子列表

举例: [https://rss.now.sh/tieba/forum/女图](https://rss.now.sh/tieba/forum/女图)

路由: `/tieba/forum/:kw`

参数: kw，吧名

## 妹子图

::: warning 注意
该网站在国外无法访问，故以下演示无效
:::

### 首页（最新）

举例: [https://rss.now.sh/mzitu](https://rss.now.sh/mzitu)

路由: `/mzitu/`

### 分类

举例: [https://rss.now.sh/mzitu/category/hot](https://rss.now.sh/mzitu/category/hot)

路由: `/mzitu/category/:category`

参数：category，分类名

| 热门   | 推荐   | 性感妹子    | 日本妹子  | 台湾妹子   | 清纯妹子 |
| ---- | ---- | ------- | ----- | ------ | ---- |
| hot  | best | xinggan | japan | taiwan | mm   |


### 所有专题

举例: [https://rss.now.sh/mzitu/tags](https://rss.now.sh/mzitu/tags)

路由: `/mzitu/tags`

### 专题详情

举例: [https://rss.now.sh/mzitu/tag/shishen](https://rss.now.sh/mzitu/tag/shishen)

路由: `/mzitu/tag/:tag`

参数: tag，专题名，可在专题页 URL 中找到

### 详情

举例: [https://rss.now.sh/mzitu/post/129452](https://rss.now.sh/mzitu/post/129452)

路由: `/mzitu/post/:id`

参数: id，详情 id，可在详情页 URL 中找到

## pixiv

### 用户收藏

举例: [https://rss.now.sh/pixiv/user/bookmarks/15288095](https://rss.now.sh/pixiv/user/bookmarks/15288095)

路由: `/pixiv/user/bookmarks/:id`

参数: id，用户 id，可在用户主页 URL 中找到

### 用户动态

举例: [https://rss.now.sh/pixiv/user/11](https://rss.now.sh/pixiv/user/11)

路由: `/pixiv/user/:id`

参数: id，用户 id，可在用户主页 URL 中找到

### 排行榜

举例: [https://rss.now.sh/pixiv/ranking/week](https://rss.now.sh/pixiv/ranking/week)

路由: `/pixiv/ranking/:mode/:date?`

参数

mode: 排行榜类型

| pixiv 日排行 | pixiv 周排行 | pixiv 月排行 | pixiv 受男性欢迎排行 | pixiv 受女性欢迎排行 | pixiv 原创作品排行  | pixiv 新人排行  |
| --------- | --------- | --------- | ------------- | ------------- | ------------- | ----------- |
| day       | week      | month     | day_male      | day_female    | week_original | week_rookie |

| pixiv R-18 日排行 | pixiv R-18 受男性欢迎排行 | pixiv R-18 受女性欢迎排行 | pixiv R-18 周排行 | pixiv R-18G 排行 |
| -------------- | ------------------ | ------------------ | -------------- | -------------- |
| day_r18        | day_male_r18       | day_female_r18     | week_r18       | week_r18g      |

date: 日期，取值形如 `2018-4-25`

## 豆瓣

### 正在上映的电影

举例: [https://rss.now.sh/douban/movie/playing](https://rss.now.sh/douban/movie/playing)

路由: `/douban/movie/playing`

参数: 无

### 正在上映的高分电影

举例: [https://rss.now.sh/douban/movie/playing/7.5](https://rss.now.sh/douban/movie/playing/7.5)

路由

`/douban/movie/playing/:score`

`/douban/movie/playing/:score/:city`

参数

score: 返回大于等于这个分数的电影

city: 城市的中文名，可选，默认北京

### 即将上映的电影

举例: [https://rss.now.sh/douban/movie/later](https://rss.now.sh/douban/movie/later)

路由: `/douban/movie/later`

参数: 无

### 北美票房榜

举例: [https://rss.now.sh/douban/movie/ustop](https://rss.now.sh/douban/movie/ustop)

路由: `/douban/movie/ustop`

参数: 无

## 煎蛋

### 无聊图

举例: [https://rss.now.sh/jandan/pic](https://rss.now.sh/jandan/pic)

路由: `/jandan/pic`

参数: 无

## 喷嚏

### 图卦

举例: [https://rss.now.sh/dapenti/tugua](https://rss.now.sh/dapenti/tugua)

路由: `/dapenti/tugua`

参数: 无

## Dockone

### 周报

举例: [https://rss.now.sh/dockone/weekly](https://rss.now.sh/dockone/weekly)

路由: `/dockone/weekly`

参数: 无

## 腾讯吐个槽

### 吐槽新帖

举例: [https://rss.now.sh/tucaoqq/post/28564/CdRI0728](https://rss.now.sh/tucaoqq/post/28564/CdRI0728)

路由: `/tucaoqq/post/:project/:key`

参数

project: 产品ID

key: 产品密钥

## 笔趣阁

### 小说章节

举例: [https://rss.now.sh/biquge/novel/latestchapter/52_52542](https://rss.now.sh/biquge/novel/latestchapter/52_52542)

路由: `/biquge/novel/latestchapter/:id`

参数: id，小说 id，可在对应小说页 URL 中找到

## 开发者头条

### 今天头条

举例: [https://rss.now.sh/toutiao/today](https://rss.now.sh/toutiao/today)

路由: `/toutiao/today`

### 独家号

举例: [https://rss.now.sh/toutiao/user/140544](https://rss.now.sh/toutiao/user/140544)

路由: `/toutiao/user/:id`

参数: id，独家号 id，可在对应独家号页 URL 中找到

## Disqus

### 评论

举例: [https://rss.now.sh/disqus/posts/diygod-me](https://rss.now.sh/disqus/posts/diygod-me)

路由: `/disqus/posts/:forum`

参数: forum，网站的 disqus name

## Twitter

### 用户

举例: [https://rss.now.sh/twitter/user/DIYgod](https://rss.now.sh/twitter/user/DIYgod)

路由: `/twitter/user/:id`

参数: id，用户 id

## Instagram

### 用户

举例: [https://rss.now.sh/instagram/user/diygod](https://rss.now.sh/instagram/user/diygod)

路由: `/instagram/user/:id`

参数: id，用户 id

## Youtube

### 用户

举例: [https://rss.now.sh/youtube/user/JFlaMusic](https://rss.now.sh/youtube/user/JFlaMusic)

路由: `/youtube/user/:username`

参数: username，用户名

### 频道

举例: [https://rss.now.sh/youtube/channel/UCDwDMPOZfxVV0x_dz0eQ8KQ](https://rss.now.sh/youtube/channel/UCDwDMPOZfxVV0x_dz0eQ8KQ)

路由: `/youtube/channel/:id`

参数: id，频道 id
