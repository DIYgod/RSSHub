---
sidebar: auto
---

<p align="center">
    <img src="https://i.imgur.com/NZpRScX.png" alt="RSSHub" width="100">
</p>
<h1 align="center" class="logo">RSSHub</h1>

> 🍰 万物皆可 RSS

RSSHub 是一个轻量、易于扩展的 RSS 生成器, 可以给任何奇奇怪怪的内容生成 RSS 订阅源

[Telegram 群](https://t.me/rsshub)

# 指南

## 鸣谢

### Special Sponsors

| <a href="https://rixcloud.app/rsshub" target="_blank"><img width="240px" src="https://i.imgur.com/qRP0eMg.png"></a> | <a href="https://werss.app?utm_source=rsshub" target="_blank"><img width="170px" src="https://cdn.weapp.design/werss/werss-logo.png"></a> | <a href="https://j.youzan.com/ccPcrY" target="_blank"><img width="180px" src="https://i.imgur.com/FZtFAGz.png"></a> |
| :-----------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------: |


### Sponsors

| [Liuyang](https://github.com/lingllting) | Zuyang | [Sayori Studio](https://t.me/SayoriStudio) | Xiaojiong Wang |
| :--------------------------------------: | :----: | :----------------------------------------: | :------------: |


[![](https://opencollective.com/static/images/become_sponsor.svg)](https://docs.rsshub.app/support/)

### Contributors

[![](https://opencollective.com/RSSHub/contributors.svg?width=740)](https://github.com/DIYgod/RSSHub/graphs/contributors)

::: tip 提示

演示地址为 [rsshub.app](https://rsshub.app), 缓存时间 10 分钟, 可以随意使用

:::

## 通用参数

::: tip 提示

所有通用参数可以使用 `&` 连接组合使用, 效果叠加

:::

### 内容过滤

可以使用以下 URL query 过滤内容, 支持正则

filter 选出想要的内容

-   filter: 过滤标题和描述

-   filter_title: 过滤标题

-   filter_description: 过滤描述

举例: <https://rsshub.app/bilibili/user/coin/2267573?filter=微小微|赤九玖|暴走大事件>

filterout 去掉不要的内容

-   filterout: 过滤标题和描述

-   filterout_title: 过滤标题

-   filterout_description: 过滤描述

举例: <https://rsshub.app/bilibili/user/coin/2267573?filterout=微小微|赤九玖|暴走大事件>

### 条数限制

可以使用 limit 参数限制最大条数, 主要用于排行榜类 RSS

举例: bilibili 排行榜前 10 <https://rsshub.app/bilibili/ranking/0/3?limit=10>

### 输出格式

RSSHub 同时支持 RSS 2.0、Atom 和 [JSON Feed](https://jsonfeed.org/) 输出格式, 在路由末尾添加 `.rss` `.atom` 或 `.json` 即可请求对应输出格式, 缺省为 RSS 2.0

举例:

-   缺省 RSS 2.0 - <https://rsshub.app/jianshu/home>
-   RSS 2.0 - <https://rsshub.app/jianshu/home.rss>
-   Atom - <https://rsshub.app/jianshu/home.atom>
-   JSON Feed - <https://rsshub.app/jianshu/home.json>
-   和 filter 或其他 URL query 一起使用 <https://rsshub.app/bilibili/user/coin/2267573.atom?filter=微小微|赤九玖|暴走大事件>

## API 接口

::: warning 注意
API 仍处于开发状态中,  并可能会有改动. 欢迎提供建议！
:::

RSSHub 提供下列 API 接口:

### 可用公共路由列表

::: tip 提示
`protected_router.js`下的路由**不会被**包含在此 API 返回的结果当中.
:::

举例: <https://rsshub.app/api/routes/bilibili>

路由: `/api/routes/:name?`

参数:

-   name, 路由一级名称, 对应 [https://github.com/DIYgod/RSSHub/tree/master/routes](https://github.com/DIYgod/RSSHub/tree/master/routes) 中的文件夹名称. 可选, **缺省则返回所有可用路由**.

成功请求将会返回 HTTP 状态码 `200 OK` 与 JSON 结果, 格式如下:

```js
{
    "status": "success",
    "data": {
        "bilibili": {
            "routes": [
                "/bilibili/user/video/:uid",
                "/bilibili/user/article/:uid",
                "/bilibili/user/fav/:uid",
                "/bilibili/user/coin/:uid",
                "/bilibili/user/dynamic/:uid",
                "/bilibili/user/followers/:uid",
                "/bilibili/user/followings/:uid",
                "/bilibili/partion/:tid",
                "/bilibili/partion/ranking/:tid/:days?",
                "/bilibili/bangumi/:seasonid",
                "/bilibili/video/reply/:aid",
                "/bilibili/link/news/:product",
                "/bilibili/live/room/:roomID",
                "/bilibili/live/search/:key/:order",
                "/bilibili/live/area/:areaID/:order",
                "/bilibili/fav/:uid/:fid",
                "/bilibili/blackboard",
                "/bilibili/mall/new",
                "/bilibili/mall/ip/:id",
                "/bilibili/ranking/:rid?/:day?",
                "/bilibili/channel/:uid/:cid",
                "/bilibili/topic/:topic"
            ]
        }
    },
    "message": "request returned 22 routes"
}
```

若无符合请求路由, 请求将会返回 HTTP 状态码 `204 No Content`.

## 社交媒体

### bilibili

<route name="番剧" author="DIYgod" example="/bilibili/bangumi/21680" path="/bilibili/:seasonid" :paramsDesc="['番剧 id, 番剧主页打开控制台执行 `window.__INITIAL_STATE__.ssId` 或 `window.__INITIAL_STATE__.mediaInfo.param.season_id` 获取']"/>

<route name="UP 主投稿" author="DIYgod" example="/bilibili/user/video/2267573" path="/bilibili/user/video/:uid" :paramsDesc="['用户 id, 可在 UP 主主页中找到']"/>

<route name="UP 主专栏" author="lengthmin" example="/bilibili/user/article/334958638" path="/bilibili/user/article/:uid" :paramsDesc="['用户 id, 可在 UP 主主页中找到']"/>

<route name="UP 主动态" author="DIYgod" example="/bilibili/user/dynamic/2267573" path="/bilibili/user/dynamic/:uid" :paramsDesc="['用户 id, 可在 UP 主主页中找到']"/>

<route name="UP 主频道" author="HenryQW" example="/bilibili/user/channel/142821407/23390" path="/bilibili/user/channel/:uid/:cid" :paramsDesc="['用户 id, 可在 UP 主主页中找到', '频道 id, 可在频道的 URL 中找到']"/>

<route name="UP 主默认收藏夹" author="DIYgod" example="/bilibili/user/fav/2267573" path="/bilibili/user/fav/:uid" :paramsDesc="['用户 id, 可在 UP 主主页中找到']"/>

<route name="UP 主非默认收藏夹" author="Qixingchen" example="/bilibili/fav/756508/50948568" path="/bilibili/fav/:uid/:fid" :paramsDesc="['用户 id, 可在 UP 主主页中找到', '收藏夹 ID, 可在收藏夹的 URL 中找到, 默认收藏夹建议使用 UP 主默认收藏夹功能']"/>

<route name="UP 主投币视频" author="DIYgod" example="/bilibili/user/coin/2267573" path="/bilibili/user/coin/:uid" :paramsDesc="['用户 id, 可在 UP 主主页中找到']"/>

<route name="UP 主粉丝" author="Qixingchen" example="/bilibili/user/followers/2267573" path="/bilibili/user/followers/:uid" :paramsDesc="['用户 id, 可在 UP 主主页中找到']"/>

<route name="UP 主关注用户" author="Qixingchen" example="/bilibili/user/followings/2267573" path="/bilibili/user/followings/:uid" :paramsDesc="['用户 id, 可在 UP 主主页中找到']"/>

<route name="分区视频" author="DIYgod" example="/bilibili/partion/33" path="/bilibili/partion/:tid" :paramsDesc="['分区 id']">

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

</route>

<route name="分区视频排行榜" author="lengthmin" example="/bilibili/partion/ranking/171/3" path="/bilibili/partion/ranking/:tid/:days?" :paramsDesc="['分区 id, 见上方表格', '缺省为 7, 指最近多少天内的热度排序']"/>

<route name="视频评论" author="Qixingchen" example="/bilibili/video/reply/21669336" path="/bilibili/video/reply/:aid" :paramsDesc="['可在视频页 URL 中找到']"/>

<route name="link 公告" author="Qixingchen" example="/bilibili/link/news/live" path="/bilibili/link/news/:product" :paramsDesc="['公告分类, 包括 直播:live 小视频:vc 相簿:wh']"/>

#### 直播开播 <Author uid="Qixingchen"/>

见 [#哔哩哔哩直播](#哔哩哔哩直播)

#### 直播搜索 <Author uid="Qixingchen"/>

见 [#哔哩哔哩直播](#哔哩哔哩直播)

#### 直播分区 <Author uid="Qixingchen"/>

见 [#哔哩哔哩直播](#哔哩哔哩直播)

<route name="主站话题列表" author="Qixingchen" example="/bilibili/blackboard" path="/bilibili/blackboard" />

<route name="会员购新品上架" author="DIYgod" example="/bilibili/mall/new" path="/bilibili/mall/new" />

<route name="会员购作品" author="DIYgod" example="/bilibili/mall/ip/:id" path="/bilibili/mall/ip/:id" :paramsDesc="['作品 id, 可在作品列表页 URL 中找到']"/>

<route name="排行榜" author="DIYgod" example="/bilibili/ranking/0/3" path="/bilibili/ranking/:tid/:days?" :paramsDesc="['排行榜分区 id, 默认 0', '时间跨度, 可为 1 3 7 30']">

| 全站 | 动画 | 国创相关 | 音乐 | 舞蹈 | 游戏 | 科技 | 生活 | 鬼畜 | 时尚 | 娱乐 | 影视 |
| ---- | ---- | -------- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 0    | 1    | 168      | 3    | 129  | 4    | 36   | 160  | 119  | 155  | 5    | 181  |

</route>

<route name="话题(频道/标签)" author="Qixingchen" example="/bilibili/topic/2233" path="/bilibili/topic/2233" :paramsDesc="['话题名(又称频道名或标签) 例如 2233 或 COSPLAY']"/>

### 微博

<route name="博主（方案1）" author="DIYgod" example="/weibo/user/3306934123" path="/weibo/user/:uid" :paramsDesc="['用户 id, 博主主页打开控制台执行 `$CONFIG.oid` 获取']"/>

::: warning 注意

上述方案 1 获取 V+ 付费博主会有数据缺失, 所以这里提供方案 2 , 这种方式的缺点是描述不如上面的完善, 建议优先选择第一种方案

:::

<route name="博主（方案2）" author="DIYgod" example="/weibo/user2/3306934123" path="/weibo/user2/:uid" :paramsDesc="['用户 id, 博主主页打开控制台执行 `$CONFIG.oid` 获取']"/>

<route name="关键词" author="DIYgod" example="/weibo/keyword/DIYgod" path="/weibo/keyword/:keyword" :paramsDesc="['你想订阅的微博关键词']"/>

### 贴吧

<route name="帖子列表" author="u3u" example="/tieba/forum/女图" path="/tieba/forum/:kw" :paramsDesc="['吧名']"/>

<route name="精品帖子" author="u3u" example="/tieba/forum/good/女图" path="/tieba/forum/good/:kw/:cid?" :paramsDesc="['吧名', '精品分类, 如果不传 `cid` 则获取全部分类']"/>

<route name="帖子动态" author="u3u" example="/tieba/post/5853240586" path="/tieba/post/:id" :paramsDesc="['帖子 ID']"/>

<route name="楼主动态" author="u3u" example="/tieba/post/lz/5853240586" path="/tieba/post/lz/:id" :paramsDesc="['帖子 ID']"/>

### 即刻

::: warning 注意

即刻主题较为复杂, 部分主题可能出现不适配的情况. 如出现上述情况请[提 Issue](https://github.com/DIYgod/RSSHub/issues).

:::

<route name="主题-精选" author="DIYgod" example="/jike/topic/54dffb40e4b0f57466e675f0" path="/jike/topic/:id" :paramsDesc="['主题 id, 可在即刻 web 端主题页或 APP 分享出来的主题页 URL 中找到']"/>

::: tip 提示

部分主题如 `一觉醒来发生了什么: 553870e8e4b0cafb0a1bef68` 提供纯文字内容, <a href="#主题-纯文字">主题-纯文字 jike/topicText</a> 可能会提供更好的体验.

:::

<route name="主题-广场" author="DIYgod" example="/jike/topic/square/54dffb40e4b0f57466e675f0" path="/jike/topic/square/:id" :paramsDesc="['主题 id, 可在即刻 web 端主题页或 APP 分享出来的主题页 URL 中找到']"/>

<route name="主题-纯文字" author="HenryQW" example="/jike/topic/text/553870e8e4b0cafb0a1bef68" path="/jike/topic/text/:id" :paramsDesc="['主题 id, 可在即刻 web 端主题页或 APP 分享出来的主题页 URL 中找到']"/>

<route name="用户动态" author="DIYgod" example="/jike/user/82D23B32-CF36-4C59-AD6F-D05E3552CBF3" path="/jike/user/:id" :paramsDesc="['用户 id, 可在即刻 web 端用户页 URL 中找到']"/>

<route name="即刻小报" author="Andiedie" example="/jike/daily" path="/jike/daily"/>

### 微信

::: tip 提示

公众号直接抓取困难, 故目前提供即刻和瓦斯两种间接抓取方案, 请自行选择

:::

<route name="公众号（即刻来源）" author="DIYgod" example="/jike/topic/584b8ac671a288001154a115" path="/jike/topic/:id" :paramsDesc="['参考 [即刻-主题-精选](#/jike/topic/:id)']"/>

<route name="公众号（瓦斯来源）" author="DIYgod" example="/wechat/wasi/:id" path="/wechat/wasi/:id" :paramsDesc="['瓦斯公众号 id, 可在[瓦斯](https://w.qnmlgb.tech/wx)搜索公众号, 打开公众号页, 在 URL 中找到 id']"/>

### 简书

<route name="首页" author="DIYgod" example="/jianshu/home" path="/jianshu/home"/>

<route name="热门" author="DIYgod HenryQW" example="/jianshu/trending/weekly" path="/jianshu/trending/:timeframe" :paramsDesc="['按周 `weekly` 或 按月 `monthly`']"/>

<route name="专题" author="DIYgod" example="/jianshu/collection/xYuZYD" path="/jianshu/collection/:id" :paramsDesc="['专题 id, 可在专题页 URL 中找到']"/>

<route name="作者" author="DIYgod" example="/jianshu/user/yZq3ZV" path="/jianshu/user/:id" :paramsDesc="['作者 id, 可在作者主页 URL 中找到']"/>

### 知乎

::: warning 注意

知乎反爬虫策略非常严格, 以下演示经常失效, 建议自搭

:::

<route name="收藏夹" author="huruji" example="/zhihu/collection/26444956" path="/zhihu/collection/:id" :paramsDesc="['收藏夹 id, 可在收藏夹页面 URL 中找到']"/>

<route name="用户动态" author="DIYgod" example="/zhihu/people/activities/diygod" path="/zhihu/people/activities/:id" :paramsDesc="['作者 id, 可在用户主页 URL 中找到']"/>

<route name="用户回答" author="DIYgod" example="/zhihu/people/answers/diygod" path="/zhihu/people/answers/:id" :paramsDesc="['作者 id, 可在用户主页 URL 中找到']"/>

<route name="专栏" author="DIYgod" example="/zhihu/zhuanlan/googledevelopers" path="/zhihu/zhuanlan/:id" :paramsDesc="['专栏 id, 可在专栏主页 URL 中找到']"/>

<route name="知乎日报" author="DHPO" example="/zhihu/daily" path="/zhihu/daily"/>

<route name="知乎热榜" author="DIYgod" example="/zhihu/hotlist" path="/zhihu/hotlist"/>

### pixiv

<route name="用户收藏" author="EYHN" example="/pixiv/user/bookmarks/15288095" path="/pixiv/user/bookmarks/:id" :paramsDesc="['用户 id, 可在用户主页 URL 中找到']"/>

<route name="用户动态" author="DIYgod" example="/pixiv/user/11" path="/pixiv/user/:id" :paramsDesc="['用户 id, 可在用户主页 URL 中找到']"/>

<route name="排行榜" author="EYHN" example="/pixiv/ranking/week" path="/pixiv/ranking/:mode/:date?" :paramsDesc="['排行榜类型' ,'日期, 取值形如 `2018-4-25`']">

| pixiv 日排行 | pixiv 周排行 | pixiv 月排行 | pixiv 受男性欢迎排行 | pixiv 受女性欢迎排行 | pixiv 原创作品排行 | pixiv 新人排行 |
| ------------ | ------------ | ------------ | -------------------- | -------------------- | ------------------ | -------------- |
| day          | week         | month        | day_male             | day_female           | week_original      | week_rookie    |

| pixiv R-18 日排行 | pixiv R-18 受男性欢迎排行 | pixiv R-18 受女性欢迎排行 | pixiv R-18 周排行 | pixiv R-18G 排行 |
| ----------------- | ------------------------- | ------------------------- | ----------------- | ---------------- |
| day_r18           | day_male_r18              | day_female_r18            | week_r18          | week_r18g        |

</route>

### 豆瓣

<route name="正在上映的电影" author="DIYgod" example="/douban/movie/playing" path="/douban/movie/playing"/>

<route name="正在上映的高分电影" author="DIYgod" example="/douban/movie/playing/7.5/杭州" path="/douban/movie/playing/:score/:city?" :paramsDesc="['返回大于等于这个分数的电影', '城市的中文名, 可选, 默认北京']"/>

<route name="即将上映的电影" author="DIYgod" example="/douban/movie/later" path="/douban/movie/later"/>

<route name="北美票房榜" author="DIYgod" example="/douban/movie/ustop" path="/douban/movie/ustop"/>

<route name="豆瓣小组" author="DIYgod" example="/douban/group/camera" path="/douban/group/:groupid" :paramsDesc="['豆瓣小组的 id']"/>

<route name="浏览发现" author="clarkzsd" example="/douban/explore" path="/douban/explore"/>

<route name="新书速递" author="fengkx" example="/douban/book/latest" path="douban/book/latest"/>

<route name="最新增加的音乐" author="fengkx" example="/douban/music/latest" path="/douban/music/latest"/>

### Disqus

<route name="评论" author="DIYgod" example="/disqus/posts/diygod-me" path="/disqus/posts/:forum" :paramsDesc="['网站的 disqus name']"/>

### Twitter

<route name="用户" author="DIYgod" example="/twitter/user/DIYgod" path="/twitter/user/:id" :paramsDesc="['用户 twitter 名']"/>

### Instagram

<route name="用户" author="DIYgod" example="/instagram/user/diygod" path="/instagram/user/:id" :paramsDesc="['用户 id']"/>

### Youtube

<route name="用户" author="DIYgod" example="/youtube/user/JFlaMusic/" path="/youtube/user/:username/:embed?" :paramsDesc="['用户名', '默认为开启内嵌视频, 任意值为关闭']"/>

<route name="频道" author="DIYgod" example="/youtube/channel/UCDwDMPOZfxVV0x_dz0eQ8KQ" path="/youtube/channel/:id/:embed?" :paramsDesc="['频道 id', '默认为开启内嵌视频, 任意值为关闭']"/>

<route name="播放列表" author="HenryQW" example="/youtube/playlist/PLqQ1RwlxOgeLTJ1f3fNMSwhjVgaWKo_9Z" path="/youtube/playlist/:id/:embed?" :paramsDesc="['播放列表 id', '默认为开启内嵌视频, 任意值为关闭']"/>

### Dribbble

<route name="流行" author="DIYgod" example="/dribbble/popular/week" path="/dribbble/popular/:timeframe?" :paramsDesc="['时间维度, 支持 week month year ever']"/>

<route name="用户（团队" author="DIYgod" example="/dribbble/user/google" path="/dribbble/user/:name" :paramsDesc="['用户名, 可在该用户主页 URL 中找到']"/>

<route name="关键词" author="DIYgod" example="/dribbble/keyword/player" path="/dribbble/keyword/:keyword" :paramsDesc="['想要订阅的关键词']"/>

### Telegram

<route name="频道" author="DIYgod" example="/telegram/channel/awesomeDIYgod" path="/telegram/channel/:username" :paramsDesc="['频道 username']">

::: tip 提示

订阅要求: 将机器人 [@RSSHub_bot](https://t.me/RSSHub_bot) 加为频道管理员, 然后发一条消息后才可正常获取数据

:::

</route>

<route name="贴纸包" author="DIYgod" example="/telegram/stickerpack/DIYgod" path="/telegram/stickerpack/:name" :paramsDesc="['贴纸包 id, 可在分享贴纸获得的 URL 中找到']"/>

### 抖音

<route name="用户动态" author="DIYgod" example="/douyin/user/93610979153" path="/douyin/user/:id" :paramsDesc="['用户 id, 可在 分享出去获得的用户主页 URL 中找到']"/>

### 雪球

<route name="用户动态" author="imlonghao" example="/xueqiu/user/8152922548" path="/xueqiu/user/:id/:type?" :paramsDesc="['用户 id, 可在用户主页 URL 中找到', '动态的类型, 不填则默认全部']">

| 原发布 | 长文 | 问答 | 热门 | 交易 |
| ------ | ---- | ---- | ---- | ---- |
| 0      | 2    | 4    | 9    | 11   |

</route>

<route name="用户收藏动态" author="imlonghao" example="/xueqiu/favorite/8152922548" path="/xueqiu/favorite/:id" :paramsDesc="['用户 id, 可在用户主页 URL 中找到']"/>

## 编程

### 掘金

<route name="分类" author="DIYgod" example="/juejin/category/frontend" path="/juejin/category/:category" :paramsDesc="['分类名']">

| 前端     | Android | iOS | 后端    | 设计   | 产品    | 工具资源 | 阅读    | 人工智能 |
| -------- | ------- | --- | ------- | ------ | ------- | -------- | ------- | -------- |
| frontend | android | ios | backend | design | product | freebie  | article | ai       |

</route>

<route name="标签" author="isheng5" example="/juejin/tag/架构" path="/juejin/tag/:tag" :paramsDesc="['标签名, 可在标签 URL 中找到']"/>

<route name="热门" author="moaix" example="/juejin/trending/ios/monthly" path="/juejin/trending/:category/:type" :paramsDesc="['分类名', '类型']">

| category | 标签     |
| -------- | -------- |
| android  | Android  |
| frontend | 前端     |
| ios      | iOS      |
| backend  | 后端     |
| design   | 设计     |
| product  | 产品     |
| freebie  | 工具资源 |
| article  | 阅读     |
| ai       | 人工智能 |
| devops   | 运维     |
| all      | 全部     |

| type       | 类型     |
| ---------- | -------- |
| weekly     | 本周最热 |
| monthly    | 本月最热 |
| historical | 历史最热 |

</route>

### Dockone

<route name="周报" author="csi0n" example="/dockone/weekly" path="/dockone/weekly"/>

### 开发者头条

<route name="今天头条" author="jjeejj" example="/toutiao/today" path="/toutiao/today"/>

<route name="独家号" author="jjeejj" example="/toutiao/user/140544" path="/toutiao/user/:id" :paramsDesc="['独家号 id, 可在对应独家号页 URL 中找到']"/>

### 众成翻译

<route name="首页" author="SirM2z" example="/zcfy/index" path="/zcfy/index"/>

<route name="热门" author="SirM2z" example="/zcfy/hot" path="/zcfy/hot"/>

### V2EX

<route name="最热/最新主题" author="WhiteWorld" example="/v2ex/topics/latest" path="/v2ex/topics/:type" :paramsDesc="['hot 或 latest']"/>

### GitHub

::: tip 提示

GitHub 官方也提供了一些 RSS:

-   仓库 releases: https://github.com/:owner/:repo/releases.atom
-   仓库 commits: https://github.com/:owner/:repo/commits.atom
-   用户动态: https://github.com/:user.atom

:::

<route name="用户仓库" author="DIYgod" example="/github/repos/DIYgod" path="/github/repos/:user" :paramsDesc="['用户名']"/>

<route name="Trending" author="DIYgod" example="/github/trending/daily/javascript" path="/github/trending/:since/:language?" :paramsDesc="['时间跨度, 可在 [Trending 页](https://github.com/trending/javascript?since=monthly) URL 中找到, 可选 daily weekly monthly', '语言, 可在 [Trending 页](https://github.com/trending/javascript?since=monthly) URL 中找到']"/>

<route name="仓库 Issue" author="HenryQW" example="/github/issue/DIYgod/RSSHub" path="/github/issue/:user/:repo" :paramsDesc="['用户名', '仓库名']"/>

<route name="用户" author="HenryQW" example="/github/user/followers/HenryQW" path="/github/user/followers/:user" :paramsDesc="['用户名']"/>

<route name="仓库 Stars" author="HenryQW" example="/github/stars/DIYgod/RSSHub" path="/github/stars/:user/:repo" :paramsDesc="['用户名', '仓库名']"/>

### 开源中国

<route name="资讯" author="tgly307" example="/oschina/news" path="/oschina/news"/>

### GitLab

<route name="Explore" author="imlonghao" example="/gitlab/explore/trending" path="/gitlab/explore/:type" :paramsDesc="['分类']">

| Trending | Most stars | All |
| -------- | ---------- | --- |
| trending | starred    | all |

</route>

### 极客时间

<route name="专栏文章" author="fengchang" example="/geektime/column/48" path="/geektime/column/:cid" :paramsDesc="['专栏 id, 可从[全部专栏](https://time.geekbang.org/paid-content)进入专栏介绍页, 在 URL 中找到']"/>

> 极客时间专栏需要付费订阅, RSS 仅做更新提醒, 不含付费内容.

### LinkedKeeper

<route name="博文" author="imlonghao" example="/linkedkeeper/sub/1" path="/linkedkeeper/:type/:id?" :paramsDesc="['博文分类, 为 URL 中 `.action` 的文件名', '分区或标签的 ID, 对应 URL 中的 `sid` 或 `tid`']"/>

## 直播

### 哔哩哔哩直播

<route name="直播开播" author="Qixingchen" example="/bilibili/live/room/3" path="/bilibili/live/room/:roomID" :paramsDesc="['房间号, 可在直播间 URL 中找到, 长短号均可']"/>

<route name="直播搜索" author="Qixingchen" example="/bilibili/live/search/编程/online" path="/bilibili/live/search/:key/:order" :paramsDesc="['搜索关键字', '排序方式, live_time 开播时间, online 人气']"/>

<route name="直播分区" author="Qixingchen" example="/bilibili/live/area/143/online" path="/bilibili/live/area/:areaID/:order" :paramsDesc="['分区 ID 分区增删较多, 可通过 [分区列表](https://api.live.bilibili.com/room/v1/Area/getList) 查询', '排序方式, live_time 开播时间, online 人气']">

::: warning 注意

由于接口未提供开播时间, 如果直播间未更换标题与分区, 将视为一次. 如果直播间更换分区与标题, 将视为另一项

:::

</route>

### 斗鱼直播

<route name="直播间开播" author="DIYgod" example="/douyu/room/24422" path="/douyu/room/:id" :paramsDesc="['直播间 id, 可在主播直播间页 URL 中找到']"/>

### 熊猫直播

<route name="直播间开播下播" author="DIYgod" example="/panda/room/10300" path="/panda/room/:id" :paramsDesc="['直播间 id, 可在主播直播间页 URL 中找到']"/>

## 音视频

### bilibili

见 [#bilibili](#bilibili)

### Youtube

见 [#youtube](#youtube)

### 抖音

见 [#抖音](#抖音)

### 网易云音乐

<route name="歌单歌曲" author="DIYgod" example="/ncm/playlist/35798529" path="/ncm/playlist/:id" :paramsDesc="['歌单 id, 可在歌单页 URL 中找到']"/>

<route name="用户歌单" author="DIYgod" example="/ncm/user/playlist/45441555" path="/ncm/user/playlist/:uid" :paramsDesc="['用户 uid, 可在用户主页 URL 中找到']"/>

<route name="歌手专辑" author="metowolf" example="/ncm/artist/2116" path="/ncm/artist/:id" :paramsDesc="[' 歌手 id, 可在歌手详情页 URL 中找到']"/>

<route name="电台节目" author="magic-akari" example="/ncm/djradio/347317067" path="/ncm/djradio/:id" :paramsDesc="['节目 id, 可在电台节目页 URL 中找到']"/>

### 爱奇艺

<route name="动漫" author="ranpox" example="/iqiyi/dongman/a_19rrh1sifx" path="/iqiyi/dongman/:id" :paramsDesc="['动漫 id, 可在该动漫主页 URL 中找到(不包括`.html`)']"/>

### 喜马拉雅

<route name="专辑(支持泛用型播客订阅)" author="lengthmin jjeejj" example="/ximalaya/album/299146" path="/ximalaya/album/:id" :paramsDesc="['专辑 id, 可在对应专辑页面的 URL 中找到']">

::: warning 注意
专辑 id 是跟在**分类拼音**后的那个 id, 不要输成某集的 id 了

**付费内容不可收听，但可使用非播客软件(例如 Inoreader)获取更新**

目前支持泛用型播客订阅的[输出格式](https://docs.rsshub.app/#输出格式)中标明的格式只有 rss 支持, 也就是说你**只能使用**以下类型的链接来订阅播客:

-   https://rsshub.app/ximalaya/album/*
-   https://rsshub.app/ximalaya/album/*.rss

:::

::: tip 提示

:::

### EZTV

::: tip 提示

网站提供了全部种子的 RSS: https://eztv.ag/ezrss.xml

:::

<route name="Lookup Torrents by IMDB ID" author="Songkeys" example="/eztv/torrents/6048596" path="/eztv/torrents/:imdb_id" :paramsDesc="['想搜寻的 show 的种子所对应的 IMDB ID, 可在 [IMDB](https://www.imdb.com) 官网找到']"/>

### 草榴社区

<route name="分区帖子" author="zhboner" example="/t66y/7" path="/t66y/:id" :paramsDesc="['分区 id, 可在分区页 URL 中找到']">

| 亚洲无码原创区 | 亚洲有码原创区 | 欧美原创区 | 动漫原创区 | 国产原创区 |
| -------------- | -------------- | ---------- | ---------- | ---------- |
| 2              | 15             | 4          | 5          | 25         |

| 中字原创区 | 转帖交流区 | HTTP 下载区 | 在线成人区 |
| ---------- | ---------- | ----------- | ---------- |
| 26         | 27         | 21          | 22         |

| 技术讨论区 | 新时代的我们 | 达盖尔的旗帜 |
| ---------- | ------------ | ------------ |
| 7          | 8            | 16           |

</route>

## 图片

### 妹子图

::: warning 注意

该网站在国外无法访问, 由于 RSSHub 演示部署于国外, 故以下演示无效.

:::

<route name="首页（最新）" author="gee1k" example="/mzitu" path="/mzitu"/>

<route name="分类" author="gee1k" example="/mzitu/category/hot" path="/mzitu/category/:category" :paramsDesc="['分类名']">

| 热门 | 推荐 | 性感妹子 | 日本妹子 | 台湾妹子 | 清纯妹子 |
| ---- | ---- | -------- | -------- | -------- | -------- |
| hot  | best | xinggan  | japan    | taiwan   | mm       |

</route>

<route name="所有专题" author="gee1k" example="/mzitu/tags" path="/mzitu/tags"/>

<route name="专题详情" author="gee1k" example="/mzitu/tag/shishen" path="/mzitu/tag/:tag" :paramsDesc="['专题名, 可在专题页 URL 中找到']"/>

<route name="详情" author="gee1k" example="/mzitu/post/129452" path="/mzitu/post/:id" :paramsDesc="['详情 id, 可在详情页 URL 中找到']"/>

### 煎蛋

<route name="无聊图" author="Xuanwo" example="/jandan/pic" path="/jandan/:sub_model" :paramsDesc="['煎蛋板块名称']"/>

<route name="妹子图" author="kobemtl" example="/jandan/ooxx" path="/jandan/:sub_model" :paramsDesc="['煎蛋板块名称']"/>

### 喷嚏

<route name="图卦" author="tgly307" example="/dapenti/tugua" path="/dapenti/tugua"/>

### Konachan Anime Wallpapers

::: tip 提示

-   tags 可以在 [konachan](https://konachan.com/post) 选好后, 复制其 URL 中 tags= 后的参数
-   路由可选 `/konachan` 或 `/konachan.com` 或 `/konachan.net`, 其中前两者相同, `.net` 是全年龄健康的壁纸 ♡
-   网站提供了 Posts 订阅: https://konachan.com/post/piclens?tags=[tags]

:::

<route name="Popular Recent Posts" author="magic-akari" example="/konachan/post/popular_recent" path="/konachan/post/popular_recent/:period?" :paramsDesc="['默认过去 24 小时']">

举例:

-   过去 24 小时:<https://rsshub.app/konachan/post/popular_recent/1d>
-   过去一周:<https://rsshub.app/konachan/post/popular_recent/1w>
-   过去一月:<https://rsshub.app/konachan/post/popular_recent/1m>
-   过去一年:<https://rsshub.app/konachan/post/popular_recent/1y>

</route>

### yande.re

::: tip 提示

-   网站提供了 Posts 订阅: https://yande.re/post/piclens?tags=[tags]

:::

<route name="Popular Recent Posts" author="magic-akari" example="/yande.re/post/popular_recent" path="/yande.re/post/popular_recent/:period?" :paramsDesc="['默认过去 24 小时']">

举例:

-   过去 24 小时:<https://rsshub.app/yande.re/post/popular_recent/1d>
-   过去一周:<https://rsshub.app/yande.re/post/popular_recent/1w>
-   过去一月:<https://rsshub.app/yande.re/post/popular_recent/1m>
-   过去一年:<https://rsshub.app/yande.re/post/popular_recent/1y>

</route>

### Awesome Pigtails

<route name="最新图片" author="Chingyat" example="/pigtails" path="/pigtails"/>

## 二次元

### bilibili

见 [#bilibili](#bilibili)

### Bangumi

<route name="放送列表" author="magic-akari" example="/bangumi/calendar/today" path="/bangumi/calendar/today"/>

<route name="条目的吐槽箱" author="ylc395" example="/bangumi/subject/214265/comments?minLength=100" path="/bangumi/subject/:id/comments" :paramsDesc="['条目 id, 在条目页面的地址栏查看. minLength: 以查询字符串（query string）的形式指定. 用于过滤掉内容长度小于指定值的吐槽']"/>

<route name="条目的评论" author="ylc395" example="/bangumi/subject/214265/blogs" path="/bangumi/subject/:id/blogs" :paramsDesc="['条目 id, 在条目页面的地址栏查看']"/>

<route name="条目的讨论" author="ylc395" example="/bangumi/subject/214265/topics" path="/bangumi/subject/:id/topics" :paramsDesc="['条目 id, 在条目页面的地址栏查看']"/>

<route name="现实人物的新作品" author="ylc395" example="/bangumi/person/32943" path="/bangumi/person/:id" :paramsDesc="['人物 id, 在人物页面的地址栏查看']"/>

<route name="小组话题的新回复" author="ylc395" example="/bangumi/topic/24657" path="/bangumi/topic/:id" :paramsDesc="['话题 id, 在话题页面地址栏查看']"/>

### 米哈游

<route name="崩坏 2-游戏公告" author="deepred5" example="/mihoyo/bh2/gach" path="/mihoyo/bh2/:type" :paramsDesc="['公告种类']">

| 最新公告 | 版本信息 | 祈愿信息 | 活动介绍 |
| -------- | -------- | -------- | -------- |
| new      | version  | gach     | event    |

</route>

<route name="崩坏 3-游戏公告" author="deepred5" example="/mihoyo/bh3/strategy" path="/mihoyo/bh3/:type" :paramsDesc="['公告种类']">

| 最新   | 公告   | 新闻 | 活动     | 攻略     |
| ------ | ------ | ---- | -------- | -------- |
| latest | notice | news | activity | strategy |

</route>

### 忧郁的弟弟

<route name="文章" author="DIYgod" example="/mygalgame" path="mygalgame"/>

### きららファンタジア｜奇拉拉幻想曲

<route name="公告" author="magic-akari" example="/kirara/news" path="/kirara/news"/>

## 程序更新

### RSSHub

<route name="有新路由啦" author="DIYgod" example="/rsshub/rss" path="/rsshub/rss"/>

### MIUI

<route name="MIUI 新版本发布" author="Indexyz" example="/miui/aries" path="/miui/:device/:type?" :paramsDesc="['设备的 `codename` 例如 小米 2s 为 `aries`', '类型, 可选参数']">

| 稳定版  | 开发版 |
| ------- | ------ |
| release | dev    |

</route>

### Firefox

<route name="新版本发布" author="fengkx" example="/firefox/release/desktop" path="/firefox/release/:platform" :paramsDesc="['操作平台']">

| 桌面    | Android | Beta | Nightly | Android Beta | ESR           |
| ------- | ------- | ---- | ------- | ------------ | ------------- |
| desktop | android | beta | nightly | android-beta | organizations |

</route>

### Thunderbird

<route name="更新日志" author="garywill" example="/thunderbird/release" path="/thunderbird/release"/>

### 腾讯云移动直播 SDK

<route name="更新日志" author="cielpy" example="/qcloud/mlvb/changelog" path="/qcloud/mlvb/changelog"/>

### Bugly SDK

<route name="更新日志" author="cielpy" example="/bugly/changelog/1" path="/bugly/changelog/:platform" :paramsDesc="['平台类型, 必选, 1 为 Android, 2 为 iOS']"/>

### fir.im 应用

<route name="更新" author="cielpy" example="/fir/update/xcz" path="/fir/update/:id" :paramsDesc="['fir app id, 必选, 如 fir 生成的链接地址为 https://fir.im/xcz, 则 id 为 `xcz`']"/>

### Nvidia Web Driver

<route name="更新日志" author="cielpy" example="/nvidia/webdriverupdate" path="/nvidia/webdriverupdate"/>

### App Store/Mac App Store

<route name="应用更新" author="HenryQW" example="/appstore/update/cn/id444934666" path="/appstore/update/:country/:id" :paramsDesc="['App Store 国家, 如 QQ 的链接为 https://itunes.apple.com/cn/app/qq/id444934666?mt=8, 则 country 为 `cn`', 'App Store app id, 如 QQ 的链接为 https://itunes.apple.com/cn/app/qq/id444934666?mt=8, 则 id 为 `id444934666`']"/>

<route name="价格更新（限免）" author="HenryQW" example="/appstore/price/cn/mac/id1152443474" path="/appstore/price/:country/:type/:id" :paramsDesc="['App Store 国家, 如 Squash 的链接为 https://itunes.apple.com/cn/app/id1152443474, 则 country 为 `cn`', 'App 类型, `iOS` 或 `mac`', 'App Store app id, 必选, 如 Squash 的链接为 https://itunes.apple.com/cn/app/id1152443474, 则 id 为 `id115244347`']"/>

<route name="内购价格更新（限免）" author="HenryQW" example="/appstore/iap/cn/id953286746" path="/appstore/iap/:country/:id" :paramsDesc="['App Store 国家, 必选, 如 Darkroom – Photo Editor 的链接为 https://itunes.apple.com/cn/app/id953286746, 则 country 为 `cn`', 'App Store app id, 必选, 如 Darkroom – Photo Editor 的链接为 https://itunes.apple.com/cn/app/id953286746, 则 id 为 `id953286746`']"/>

<route name="每日精品限免 / 促销应用（鲜面连线 by AppSo）" author="Andiedie" example="/appstore/xianmian" path="/appstore/xianmian"/>

### F-Droid

<route name="App更新" author="garywill" example="/fdroid/apprelease/com.termux" path="/fdroid/apprelease/:app" :paramsDesc="['App包名']" />

### Greasy Fork

<route name="脚本更新" author="imlonghao" example="/greasyfork/zh-CN/bilibili.com" path="/greasyfork/:language/:domain?" :paramsDesc="['语言, 可在网站右上角找到, `all` 为所有语言', '按脚本生效域名过滤, 可选']"/>

### Minecraft CurseForge

<route name="Mod 更新" author="Indexyz" example="/curseforge/files/jei" path="/curseforge/files/:project" :paramsDesc="['项目的短名或者 `Project ID`. 项目的短名可以在地址栏获取到, 例如地址为 `https://minecraft.curseforge.com/projects/non-update`, 短名就为 `non-update`. `Project ID` 可在 `Overview` 中的 `About This Project` 中找到']"/>

### xclient.info

<route name="应用更新" author="DIYgod" example="/xclient/app/sketch" path="/xclient/app/:name" :paramsDesc="['应用名, 可在应用页 URL 中找到']"/>

## 大学通知

### 上海海事大学

<route name="学术讲座" author="simonsmh" example="/shmtu/events" path="/universities/shmtu/events"/>

<route name="通知公告" author="simonsmh" example="/shmtu/notes" path="/universities/shmtu/notes"/>

<route name="教务信息" author="simonsmh" example="/shmtu/jwc/1" path="/universities/shmtu/jwc/:type" :paramsDesc="['1 为教务新闻, 2 为教务公告']"/>

### 西南科技大学

<route name="教务处新闻" author="lengthmin" example="/swust/jwc/news" path="/universities/swust/jwc/news"/>
<route name="教务处通知" author="lengthmin" example="/swust/jwc/notice/1" path="/universities/swust/jwc/notice/:type?" :paramsDesc="['分区 type,缺省为 1, 详见下方表格']">

| 创新创业教育 | 学生学业 | 建设与改革 | 教学质量保障 | 教学运行 | 教师教学 |
| ------------ | -------- | ---------- | ------------ | -------- | -------- |
| 1            | 2        | 3          | 4            | 5        | 6        |

</route>
<route name="计科学院通知" author="lengthmin" example="/swust/cs/1" path="/universities/swust/cs/:type?" :paramsDesc="['分区 type, 缺省为 1, 详见下方表格']">

| 新闻动态 | 学术动态 | 通知公告 | 教研动态 |
| -------- | -------- | -------- | -------- |
| 1        | 2        | 3        | 4        |

</route>

### 北京大学

<route name="信科公告通知" author="Ir1d" example="/pku/eecs/0" path="/universities/pku/eecs/:type" :paramsDesc="['分区 type, 可在网页 URL 中找到']">

| 全部 | 学院通知 | 人事通知 | 教务通知 | 学工通知 | 科研通知 | 财务通知 | 工会通知 | 院友通知 |
| ---- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 0    | 1        | 2        | 6        | 8        | 7        | 5        | 3        | 4        |

</route>

### 华南师范大学

<route name="教务处通知" author="fengkx" example="/scnu/jw" path="/universities/scnu/jw"/>

<route name="图书馆通知" author="fengkx" example="/scnu/library" path="/universities/scnu/library"/>

<route name="计算机学院竞赛通知" author="fengkx" example="/scnu/cs/match" path="/universities/scnu/cs/match"/>

### 江南大学

<route name="教务处通知" author="Chingyat" example="/ju/jwc/all" path="/universities/ju/jwc/:type?" :paramsDesc="['默认为 `all`']">

| all  | tzgg     | ksap     | wjgg     | tmgz     | djks     | xjgl     | bysj     | syjs     |
| ---- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 全部 | 通知公告 | 考试安排 | 违纪公告 | 推免工作 | 等级考试 | 学籍管理 | 毕业设计 | 实验教学 |

| sjcx     | xkjs     | yjszj      | jxgg     | zyjs     | kcjs     | jcjs     | jxcg     | xsbg     |
| -------- | -------- | ---------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 实践创新 | 学科竞赛 | 研究生助教 | 教学改革 | 专业建设 | 课程建设 | 教材建设 | 教学成果 | 学术报告 |

</route>

### 大连工业大学

<route name="教务处新闻" author="xu42" example="/dpu/jiaowu/news/2" path="/universities/dpu/jiaowu/news/:type?" :paramsDesc="['默认为 `2`']">

| 新闻动态 | 通知公告 | 教务文件 |
| -------- | -------- | -------- |
| 2        | 3        | 4        |

</route>

<route name="网络服务新闻" author="xu42" example="/dpu/wlfw/news/2" path="/universities/dpu/wlfw/news/:type?" :paramsDesc="['默认为 `1`']">

| 新闻动态 | 通知公告 |
| -------- | -------- |
| 1        | 2        |

</route>

### 东南大学

<route name="信息科学与工程学院学术活动" author="HenryQW" example="/seu/radio/academic" path="/universities/seu/radio/academic"/>

<route name="研究生招生网通知公告" author="Chingyat" example="/seu/yzb/1" path="/universities/seu/yzb/:type" :paramsDesc="['1 为硕士招生, 2 为博士招生, 3 为港澳台及中外合作办学']"/>

### 哈尔滨工业大学

<route name="哈尔滨工业大学教务处通知公告" author="lty96117" example="/hit/jwc" path="/universities/hit/jwc"/>

### 上海科技大学

<route name="信息科技与技术学院活动" author="HenryQW" example="/shanghaitech/sist/activity" path="/universities/shanghaitech/sist/activity"/>

### 上海交通大学

<route name="电子信息与电气工程学院学术动态" author="HenryQW" example="/sjtu/seiee/academic" path="/universities/sjtu/seiee/academic"/>

### 中国科学院

<route name="上海微系统与信息技术研究所学术活动" author="HenryQW" example="/cas/sim/academic" path="/universities/cas/sim/academic"/>

### 南京邮电大学

<route name="教务处通知与新闻" author="shaoye" example="/njupt/jwc/notice" path="/universities/njupt/jwc/:type?" :paramsDesc="['默认为 `notice`']">

| 通知公告 | 教务快讯 |
| -------- | -------- |
| notice   | news     |

</route>

### 南昌航空大学

<route name="教务处公告与新闻" author="Sg4Dylan" example="/nchu/jwc/notice" path="/universities/nchu/jwc/:type?" :paramsDesc="['默认为 `notice`']">

| 教务公告 | 教务新闻 |
| -------- | -------- |
| notice   | news     |

</route>

### 哈尔滨工程大学

<route name="本科生院工作通知" author="XYenon" example="/heu/ugs/news/jwc/jxap" path="/universities/heu/ugs/news/:author?/:category?" :paramsDesc="['发布部门, 默认为 `gztz`', '分类, 默认为 `all`']">

author 列表：

| 教务处 | 实践教学与交流处 | 教育评估处 | 专业建设处 | 国家大学生文化素质基地 | 教师教学发展中心 | 综合办公室 | 工作通知 |
| ------ | ---------------- | ---------- | ---------- | ---------------------- | ---------------- | ---------- | -------- |
| jwc    | sjjxyjlzx        | jypgc      | zyjsc      | gjdxswhszjd            | jsjxfzzx         | zhbgs      | gztz     |

category 列表：

`all` 为全部

教务处：

| 教学安排 | 考试管理 | 学籍管理 | 外语统考 | 成绩管理 |
| -------- | -------- | -------- | -------- | -------- |
| jxap     | ksgl     | xjgl     | wytk     | cjgl     |

实践教学与交流处：

| 实验教学 | 实验室建设 | 校外实习 | 学位论文 | 课程设计 | 创新创业 | 校际交流 |
| -------- | ---------- | -------- | -------- | -------- | -------- | -------- |
| syjx     | sysjs      | xwsx     | xwlw     | kcsj     | cxcy     | xjjl     |

教育评估处：

| 教学研究与教学成果 | 质量监控 |
| ------------------ | -------- |
| jxyjyjxcg          | zljk     |

专业建设处：

| 专业与教材建设 | 陈赓实验班 | 教学名师与优秀主讲教师 | 课程建设 | 双语教学 |
| -------------- | ---------- | ---------------------- | -------- | -------- |
| zyyjcjs        | cgsyb      | jxmsyyxzjjs            | kcjs     | syjx     |

国家大学生文化素质基地：无

教师教学发展中心：

| 教师培训 |
| -------- |
| jspx     |

综合办公室：

| 联系课程 |
| -------- |
| lxkc     |

工作通知：无

</route>

### 重庆大学

<route name="教务网通知公告" author="El-Chiang" example="/cqu/jwc/announcement" path="/universities/cqu/jwc/announcement"/>

### 成都信息工程大学

<route name="成信新闻网" author="kimika" example="/cuit/cxxww/1" path="/universities/cuit/cxxww/:type?" :paramsDesc="['默认为 `1`']"/>

| 综合新闻 | 信息公告 | 焦点新闻 | 学术动态 | 工作交流 | 媒体成信 | 更名专题 | 文化活动 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 1        | 2        | 3        | 4        | 5        | 7        | 9        | 10       |

</route>

### 重庆科技学院

<route name="教务处公告" author="binarization" example="/cqust/jw/notify" path="/universities/cqust/jw/:type?" :paramsDesc="['可选, 默认为 `notify`']">

| 通知公告 | 教务快讯 |
| -------- | -------- |
| notify   | news     |

</route>

<route name="图书馆公告" author="binarization" example="/cqust/lib/news" path="/universities/cqust/lib/:type?" :paramsDesc="['可选, 默认为 `news`']">

| 本馆公告 |
| -------- |
| news     |

</route>

### 常州大学

<route name="教务处" author="richardchien" example="/cczu/jwc/1425" path="/universities/cczu/jwc/:category?" :paramsDesc="['可选, 默认为 `all`']">

| 全部 | 通知公告 | 教务新闻 | 各类活动与系列讲座 | 本科教学工程 | 他山之石 | 信息快递 |
| ---- | -------- | -------- | ------------------ | ------------ | -------- | -------- |
| all  | 1425     | 1437     | 1485               | 1487         | 1442     | 1445     |

</route>

<route name="新闻网" author="richardchien" example="/cczu/news/6620" path="/universities/cczu/news/:category?" :paramsDesc="['可选, 默认为 `all`']">

| 全部 | 常大要闻 | 校园快讯 | 媒体常大 | 时事热点 | 高教动态 | 网上橱窗 | 新媒常大 |
| ---- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| all  | 6620     | 6621     | 6687     | 6628     | 6629     | 6640     | 6645     |

</route>

### 四川旅游学院

<route name="信息与工程学院动态公告" author="talenHuang" example="/sctu/xgxy" path="/universities/sctu/xgxy">

</route>

<route name="教务处" author="talenHuang" example="/sctu/jwc/13" path="/universities/sctu/jwc:type?" :paramsDesc="['可选参数, 默认为 `13`']">

| 教务通知 | 信息公告 |
| -------- | -------- |
| 13       | 14       |

</route>

### 电子科技大学

<route name="教务处" author="achjqz" example="/uestc/jwc/student" path="/universities/uestc/jwc/:type?" :paramsDesc="['默认为 `important`']">

| 重要公告  | 学生事务公告 | 教师事务公告 |
| --------- | ------------ | ------------ |
| important | student      | teacher      |

</route>

<route name="新闻中心" author="achjqz" example="/uestc/news/culture" path="/universities/uestc/news/:type?" :paramsDesc="['默认为 `announcement`']">

| 学术    | 文化    | 公告         | 校内通知     |
| ------- | ------- | ------------ | ------------ |
| academy | culture | announcement | notification |

</route>

### 昆明理工大学

<route name="教务处" author="geekrainy" example="/kmust/jwc/notify" path="/universities/kmust/jwc/:type?" :paramsDesc="['默认为 `notify`']">

| 教务通知 | 教务新闻 |
| -------- | -------- |
| notify   | news     |

</route>

<route name="宣讲会" author="geekrainy" example="/kmust/job/careers/inner" path="/universities/kmust/job/careers/:type?" :paramsDesc="['默认为 `inner`']">

| 校内宣讲会 | 校外宣讲会 |
| ---------- | ---------- |
| inner      | outer      |

</route>

<route name="双选会" author="geekrainy" example="/kmust/job/jobfairs" path="/universities/kmust/job/jobfairs" />

### 华中科技大学

<route name="自动化学院通知" author="jinxiapu" example="/hust/auto/notice/0" path="/universities/hust/auto/notice/:type?" :paramsDesc="['分区 type, 默认为最新通知 可在网页 HTML中找到']">

| 最新 | 行政 | 人事 | 科研 | 讲座 | 本科生 | 研究生 | 学工 |
| ---- | ---- | ---- | ---- | ---- | ------ | ------ | ---- |
| 0    | 1    | 2    | 3    | 4    | 5      | 6      | 7    |

</route>

<route name="自动化学院新闻" author="jinxiapu" example="/hust/auto/news" path="/universities/hust/auto/news">

## 传统媒体

### 央视新闻

<route name="专题" author="idealclover" example="/cctv/world" path="/cctv/:category" :paramsDesc="['分类名']">

| 国内  | 国际  | 视频  | 科技 | 社会    | 法律 | 娱乐 |
| ----- | ----- | ----- | ---- | ------- | ---- | ---- |
| china | world | video | tech | society | law  | ent  |

</route>

### 财新网

> 网站部分内容需要付费订阅, RSS 仅做更新提醒, 不含付费内容.

<route name="新闻分类" author="idealclover" example="/caixin/finance/regulation" path="/caixin/:column/:category" :paramsDesc="['栏目名', '栏目下的子分类名']">

Column 列表:

| 经济    | 金融    | 政经  | 环科    | 世界          | 观点网  | 文化    | 周刊   |
| ------- | ------- | ----- | ------- | ------------- | ------- | ------- | ------ |
| economy | finance | china | science | international | opinion | culture | weekly |

以金融板块为例的 category 列表: （其余 column 以类似方式寻找）

| 监管       | 银行 | 证券基金 | 信托保险        | 投资       | 创新       | 市场   |
| ---------- | ---- | -------- | --------------- | ---------- | ---------- | ------ |
| regulation | bank | stock    | insurance_trust | investment | innovation | market |

Category 列表:

| 封面报道   | 开卷  | 社论      | 时事            | 编辑寄语    | 经济    | 金融    | 商业     | 环境与科技             | 民生    | 副刊   |
| ---------- | ----- | --------- | --------------- | ----------- | ------- | ------- | -------- | ---------------------- | ------- | ------ |
| coverstory | first | editorial | current_affairs | editor_desk | economy | finance | business | environment_technology | cwcivil | column |

</route>

### 南方周末

<route name="新闻分类" author="ranpox" example="/infzm/5" path="/infzm/:id" :paramsDesc="['南方周末内容分区 id, 可在该内容分区的 URL 中找到(即http://www.infzm.com/contents/:id), 注意 contents 为内容分区, content 为文章页, 添加前请留意.']">

下面给出部分参考:

| 全站 | 新闻 | 经济 | 文化 | 评论 | 图片 | 生活 | 时政 | 社会 | 科技 | 绿色 | 头条 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 0    | 5    | 6    | 7    | 8    | 9    | 10   | 11   | 12   | 13   | 1374 | 2553 |

</route>

### 纽约时报

::: tip 提示

纽约时报 RSS: https://cn.nytimes.com/rss/

:::

<route name="新闻早报" author="yangkghjh" example="/nytimes/morning_post" path="/nytimes/morning_post"/>

### 新京报

<route name="栏目" author="DIYgod" example="/bjnews/realtime" path="/bjnews/:category" :paramsDesc="['新京报的栏目名, 点击对应栏目后在地址栏找到']"/>

### 澎湃新闻

<route name="首页头条" author="HenryQW" example="/thepaper/featured" path="/thepaper/featured"/>

### 联合早报

<route name="即时新闻" author="lengthmin" example="/zaobao/realtime/china" path="/zaobao/realtime/:type?" :paramsDesc="['分类, 缺省为中港台']">

| 中港台 | 新加坡    | 国际  | 财经     |
| ------ | --------- | ----- | -------- |
| china  | singapore | world | zfinance |

</route>

<route name="新闻" author="lengthmin" example="/zaobao/znews/greater-china" path="/zaobao/znews/:type?" :paramsDesc="['分类, 缺省为中港台']">

| 中港台        | 新加坡    | 东南亚 | 国际          | 体育   |
| ------------- | --------- | ------ | ------------- | ------ |
| greater-china | singapore | sea    | international | sports |

</route>

## 预报预警

### 停水通知

配合 [IFTTT](https://ifttt.com/) Applets [邮件通知](https://ifttt.com/applets/SEvmDVKY-) 使用实现自动通知效果.

<route name="杭州市" author="znhocn" example="/tingshuitz/hangzhou" path="/tingshuitz/hangzhou"/>

<route name="萧山区" author="znhocn" example="/tingshuitz/xiaoshan" path="/tingshuitz/xiaoshan"/>

<route name="大连市" author="DIYgod" example="/tingshuitz/dalian" path="/tingshuitz/dalian"/>

### 中央气象台

<route name="全国气象预警" author="ylc395" example="/weatheralarm" path="/weatheralarm">

可通过全局过滤参数订阅您感兴趣的地区.

</route>

### 中国地震局

<route name="地震速报" author="ylc395" example="/earthquake" path="/earthquake">

可通过全局过滤参数订阅您感兴趣的地区.

</route>

## 出行旅游

### All the Flight Deals

<route name="特价机票" author="HenryQW" example="/atfd/us+new%20york,gb+london/1" path="/atfd/:locations/:nearby?" :paramsDesc="['始发地, 由「国家, 参见 ISO 3166-1 国家代码」和「城市」两部分组成', '可选 0 或 1, 默认 0 为不包括, 是否包括临近机场']">

举例: [https://rsshub.app/atfd/us+new york, gb+london/1](https://rsshub.app/atfd/us+new%20york,gb+london/1)

1. 单个始发地, 例如 「us+new york」, [https://rsshub.app/atfd/us+new york](https://rsshub.app/atfd/us+new%20york)
2. 逗号分隔多个始发地, 例如 「us+new york, gb+london」, [https://rsshub.app/atfd/us+new york, gb+london/](https://rsshub.app/atfd/us+new%20york,gb+london/)

ISO 3166-1 国家代码列表请参见 [维基百科 ISO_3166-1](https://zh.wikipedia.org/wiki/ISO_3166-1)

</route>

### iMuseum

<route name="展览信息" author="sinchang" example="/imuseum/shanghai/all" path="/imuseum/:city/:type" :paramsDesc="['如 shanghai, beijing', '不填则默认为 `all`']"/>

| 全部 | 最新   | 热门 | 即将结束 | 即将开始 | 已结束   |
| ---- | ------ | ---- | -------- | -------- | -------- |
| all  | latest | hot  | end_soon | coming   | outdated |

</route>

### Hopper Flight Deals

<route name="Hopper 特价机票" author="HenryQW" example="/hopper/1/LHR/PEK" path="/hopper/:lowestOnly/:from/:to?" :paramsDesc="['是否只返回最低价机票, `1`: 是, 其他任意值: 否', '始发地, IATA 国际航空运输协会机场代码', '目的地, IATA 国际航空运输协会机场代码, 可选, 缺省则目的地为`任意城市`']">

本路由返回由 Hopper 算法给出的现在可购入最便宜的折扣机票, 通常包含 6 个结果. 出行日期将由 Hopper 算法定义, 可能是明天也可能是 10 个月后.

伦敦希思罗 &#9992; 北京首都国际 <https://rsshub.app/hopper/1/LHR/PEK>

IATA 国际航空运输协会机场代码, 参见[维基百科 国际航空运输协会机场代码](<https://zh.wikipedia.org/wiki/%E5%9B%BD%E9%99%85%E8%88%AA%E7%A9%BA%E8%BF%90%E8%BE%93%E5%8D%8F%E4%BC%9A%E6%9C%BA%E5%9C%BA%E4%BB%A3%E7%A0%81_(A)>)

</route>

### 马蜂窝

<route name="游记" author="sinchang" example="/mafengwo/note/hot" path="/mafengwo/note/:type" :paramsDesc="['目前支持两种, `hot` 代表热门游记, `latest` 代表最新游记']"/>

### 中国美术馆

<route name="通知公告" author="HenryQW" example="/namoc/announcement" path="/namoc/announcement"/>

<route name="新闻" author="HenryQW" example="/namoc/news" path="/namoc/news"/>

<route name="媒体联报" author="HenryQW" example="/namoc/media" path="/namoc/media"/>

<route name="展览预告" author="HenryQW" example="/namoc/exhibition" path="/namoc/exhibition"/>

<route name="焦点专题" author="HenryQW" example="/namoc/specials" path="/namoc/specials"/>

### 国家地理

<route name="分类" author="fengkx" example="/natgeo/news/ngnews" path="/natgeo/:cat/:type?" :paramsDesc="['分类', '类型, 例如`https://www.natgeomedia.com/category/news/ngnews`对应 cat, type 分别为 news, ngnews']"/>

## 购物

### 什么值得买

::: tip 提示

网站也提供了部分 RSS: https://www.smzdm.com/dingyue

:::

</route>

<route name="关键词" author="DIYgod" example="/smzdm/keyword/女装" path="/smzdm/keyword/:keyword" :paramsDesc="['你想订阅的关键词']"/>

<route name="排行榜" author="DIYgod" example="/jianshu/user/yZq3ZV" path="/smzdm/ranking/:rank_type/:rank_id/:hour" :paramsDesc="['榜单类型','榜单ID','时间跨度']">

-   榜单类型

| 好价品类榜 | 好价电商榜 | 海淘 TOP 榜 | 好文排行榜 | 好物排行榜 |
| ---------- | ---------- | ----------- | ---------- | ---------- |
| pinlei     | dianshang  | haitao      | haowen     | haowu      |

-   榜单 ID

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

</route>

### 小米

<route name="众筹" author="DIYgod" example="/mi/crowdfunding" path="/mi/crowdfunding"/>

## 网络小说

### 笔趣阁

<route name="小说更新" author="jjeejj" example="/novel/biquge/52_52542" path="/novel/biquge/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到']">

::: tip 提示

由于笔趣阁网站有多个, 各站点小说对应的小说 id 不同. 此 feed 只对应在[`www.biquge5200.com`](https://www.biquge5200.com/)中的小说 id.

:::
</route>

### UU 看书

<route name="小说更新" author="jacky2001114" example="/novel/uukanshu/49621>" path="/novel/uukanshu/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到']"/>

### 文学迷

<route name="小说更新" author="lengthmin" example="/novel/wenxuemi/6/6144" path="/novel/wenxuemi/:id1/:id2" :paramsDesc="['小说网站链接倒数第二部分的数字, 可在对应小说页 URL 中找到, 例如 `6`', '小说网站链接最后的数字, 可在对应小说页 URL 中找到, 例如 `6144`']">

举例网址：https://www.wenxuemi.com/files/article/html/6/6144/
</route>

### 起点

<route name="章节" author="Chingyat" example="/qidian/chapter/1010400217" path="/qidian/chapter/:id`" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到']"/>

<route name="讨论区" author="Chingyat" example="/qidian/forum/1010400217" path="/qidian/forum/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到']"/>

### 快眼看书

<route name="小说更新" author="squkw" example="/novel/booksky/98619" path="/novel/booksky/:id" :paramsDesc="['小说 id, 可在对应小说页 URL 中找到, 例如 `98619`']">

举例网址：http://booksky.so/BookDetail.aspx?Level=1&bid=98619
</route>

## 中国驻外使领馆

### 大使馆

<route name="大使馆重要通知" author="HenryQW" example="/embassy/us" path="/embassy/:country" :paramsDesc="['国家短代码, 见[支持国家列表](#支持国家列表)', '城市, 对应国家列表下的`领事馆城市列表`']" />

### 领事馆

<route name="领事馆重要通知" author="HenryQW" example="/embassy/us/chicago" path="/embassy/:country/:city" :paramsDesc="['国家短代码, 见[支持国家列表](#支持国家列表)', '城市, 对应国家列表下的`领事馆城市列表`']" />

### 支持国家列表

#### 德国 `DE`

-   大使馆: `/embassy/de`

-   领事馆城市列表:

| 城市   | 路由                 |
| ------ | -------------------- |
| 慕尼黑 | `/embassy/de/munich` |

---

#### 法国 `FR`

-   大使馆: `/embassy/fr`

-   领事馆城市列表:

| 城市       | 路由                     |
| ---------- | ------------------------ |
| 马赛       | `/embassy/fr/marseille`  |
| 斯特拉斯堡 | `/embassy/fr/strasbourg` |
| 里昂       | `/embassy/fr/lyon`       |

---

#### 日本 `JP`

-   大使馆: `/embassy/jp`

-   领事馆城市列表:

| 城市   | 路由                   |
| ------ | ---------------------- |
| 长崎   | `/embassy/jp/nagasaki` |
| 大阪   | `/embassy/jp/osaka`    |
| 福冈   | `/embassy/jp/fukuoka`  |
| 名古屋 | `/embassy/jp/nagoya`   |
| 札幌   | `/embassy/jp/sapporo`  |
| 新潟   | `/embassy/jp/niigata`  |

---

#### 韩国 `KR`

-   大使馆: `/embassy/kr`

-   领事馆城市列表:

| 城市 | 路由                  |
| ---- | --------------------- |
| 釜山 | `/embassy/kr/busan`   |
| 济州 | `/embassy/kr/jeju`    |
| 光州 | `/embassy/kr/gwangju` |

---

#### 新加坡 `SG`

-   大使馆: `/embassy/sg`

---

#### 美国 `US`

-   大使馆: `/embassy/us`

-   领事馆城市列表:

| 城市   | 路由                       |
| ------ | -------------------------- |
| 纽约   | `/embassy/us/newyork`      |
| 芝加哥 | `/embassy/us/chicago`      |
| 旧金山 | `/embassy/us/sanfrancisco` |

---

#### 英国 `UK`

-   大使馆: `/embassy/uk`

-   领事馆城市列表:

| 城市       | 路由                     |
| ---------- | ------------------------ |
| 爱丁堡     | `/embassy/uk/edinburgh`  |
| 贝尔法斯特 | `/embassy/uk/belfast`    |
| 曼彻斯特   | `/embassy/uk/manchester` |

## 待分类

### 自如

<route name="房源" author="DIYgod" example="/ziroom/room/sh/1/2/五角场" path="/ziroom/room/:city/:iswhole/:room/:keyword" :paramsDesc="['城市, 北京 bj; 上海 sh; 深圳 sz; 杭州 hz; 南京 nj; 广州 gz; 成都 cd; 武汉 wh; 天津 tj', '是否整租', '房间数', '关键词']"/>

### 快递

<route name="快递" author="DIYgod" example="/express/youzhengguoji/CV054432809US" path="/express/:company/:number" :paramsDesc="['快递单号', '快递公司代码, 参考 [API URL 所支持的快递公司及参数说明](https://www.kuaidi100.com/download/api_kuaidi100_com%2820140729%29.doc)']">

::: warning 注意

快递送达后请及时取消订阅, 以免浪费服务器资源

:::

</route>

### 腾讯吐个槽

<route name="吐槽新帖" author="Qixingchen" example="/tucaoqq/post/28564/CdRI0728" path="/tucaoqq/post/:project/:key" :paramsDesc="['产品 ID', '产品密钥']"/>

### 今日头条

<route name="关键词" author="uni-zheng" example="/jinritoutiao/keyword/AI" path="/jinritoutiao/keyword/:keyword" :paramsDesc="['关键词']"/>

### Readhub

<route name="分类" author="WhiteWorld" example="/readhub/category/topic" path="/readhub/category/:category" :paramsDesc="['分类名']">

| 热门话题 | 科技动态 | 开发者资讯 | 区块链快讯 |
| -------- | -------- | ---------- | ---------- |
| topic    | news     | technews   | blockchain |

</route>

### 3DMGame

<route name="新闻中心" author="zhboner" example="/3dm/news" path="/3dm/news"/>

<route name="游戏资讯" author="sinchang jacky2001114 HenryQW" example="/3dm/detroitbecomehuman/news" path="/3dm/:name/:type" :paramsDesc="['游戏的名字, 可以在专题页的 url 中找到', '资讯类型']">

| 新闻 | 攻略 | 下载资源 | 区块链快讯 |
| ---- | ---- | -------- | ---------- |
| news | gl   | resource | blockchain |

</route>

### 机核网

<route name="分类" author="MoguCloud" example="/gcores/category/1" path="/gcores/category/:category" :paramsDesc="['分类名']">

| 文章 | 新闻 | 电台 |
| ---- | ---- | ---- |
| 1    | 2    | 9    |

</route>

### ONE · 一个

<route name="图片文字问答" author="fengkx" example="/one" path="/one"/>

### Hexo

<route name="Next 主题博客" author="fengkx" example="/hexo/next/fengkx.top" path="/hexo/next/:url" :paramsDesc="['博客 Url 不带协议头']"/>

### Keep

<route name="运动日记" author="Dectinc" example="/keep/user/556b02c1ab59390afea671ea" path="/keep/user/:id" :paramsDesc="['Keep 用户 id']"/>

### 懂球帝

<route name="早报" author="HenryQW" example="/dongqiudi/daily" path="/dongqiudi/daily"/>

::: tip 提示

部分球队和球员可能会有两个 id, 正确 id 应该由 `5000` 开头.

:::

<route name="足球赛果" author="HenryQW" example="/dongqiudi/result/50001755" path="/dongqiudi/result/:team" :paramsDesc="['球队 id, 可在[懂球帝数据](https://www.dongqiudi.com/data)中找到']"/>

<route name="球队新闻" author="HenryQW" example="/dongqiudi/team_news/50001755" path="/dongqiudi/team_news/:team" :paramsDesc="['球队 id, 可在[懂球帝数据](https://www.dongqiudi.com/data)中找到']"/>

<route name="球员新闻" author="HenryQW" example="/dongqiudi/player_news/50000339" path="/dongqiudi/player_news/:id" :paramsDesc="['球员 id, 可在[懂球帝数据](https://www.dongqiudi.com/data)中通过其队伍找到']"/>

### 维基百科

<route name="中国大陆新闻动态" author="HenryQW" example="/wikipedia/mainland" path="/wikipedia/mainland"/>

### Google

<route name="谷歌学术关键词更新" author="HenryQW" example="/google/scholar/data+visualization" path="/google/scholar/:query" :paramsDesc="['查询语句, 支持「简单」和「高级」两种模式:']">

1. 简单模式, 例如「data visualization」, <https://rsshub.app/google/scholar/data+visualization>.
2. 高级模式, 前往 [Google Scholar](https://scholar.google.com/schhp?hl=zh-cn&as_sdt=0, 5), 点击左上角, 选择高级搜索并提交查询. 此时 URL 应为: <https://scholar.google.com/scholar?as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=zh-CN&as_sdt=0%2C5>, 复制`https://scholar.google.com/scholar?`后的所有语句作为本路由的查询参数. 例子所对应的完整路由为<https://rsshub.app/google/scholar/as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=zh-CN&as_sdt=0%2C5>.

::: warning 注意

谷歌学术反爬虫机制非常严格, 以下 demo 无法确保可用性. 私人部署可能会提高稳定性.

:::

</route>

### 果壳网

<route name="科学人" author="alphardex" example="/guokr/scientific" path="/guokr/scientific"/>

### 推酷

<route name="周刊" author="zpcc" example="/tuicool/mags/tech" path="/tuicool/mags/:type" :paramsDesc="['类型如下']">

| 编程狂人 | 设计匠艺 | 创业周刊 | 科技周刊 |
| -------- | -------- | -------- | -------- |
| prog     | design   | startup  | tech     |

</route>

### 爱范儿 ifanr

<route name="AppSolution" author="HenryQW" example="/ifanr/appso" path="/ifanr/appso"/>

### Apple

<route name="更换和维修扩展计划" author="metowolf HenryQW" example="/apple/exchange_repair" path="/apple/exchange_repair/:country?" :paramsDesc="['苹果官网 URL 中的国家代码, 默认中国 `cn`']"/>

#### App Store/Mac App Store

见 [#app-store-mac-app-store](#app-store-mac-app-store)

### 少数派 sspai

<route name="最新上架付费专栏" author="HenryQW" example="/sspai/series" path="/sspai/series">

> 少数派专栏需要付费订阅, RSS 仅做更新提醒, 不含付费内容.

</route>

<route name="Shortcuts Gallery" author="Andiedie" example="/sspai/shortcuts" path="/sspai/shortcuts" />

### 电影首发站

<route name="电影" author="epirus" example="/dysfz/index" path="/dysfz/index"/>

### 电影天堂

<route name="新片精品" author="imgss" example="/dytt/index" path="/dytt/index"/>

### 趣头条

<route name="分类" author="alphardex" example="/qutoutiao/category/1" path="/qutoutiao/category/:cid" :paramsDesc="['分类 id']">

| 推荐 | 热点 | 娱乐 | 健康 | 养生 | 励志 | 科技 | ... |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | --- |
| 255  | 1    | 6    | 42   | 5    | 4    | 7    | ... |

更多的 cid 可通过访问[官网](http://home.qutoutiao.net)切换分类，观察 url 获得。

</route>
