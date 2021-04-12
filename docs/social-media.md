---
pageClass: routes
---

# 社交媒体

## 755

### 用户时间线

<Route author="hoilc" example="/755/user/akimoto-manatsu" path="/755/user/:username" :paramsDesc="['用户名, 可在 URL 中找到']"/>

## bilibili

::: tip Tiny Tiny RSS 用户请注意

Tiny Tiny RSS 会给所有 iframe 元素添加 `sandbox="allow-scripts"` 属性，导致无法加载 bilibili 内嵌视频，如果需要使用内嵌视频请为 Tiny Tiny RSS 安装 [remove_iframe_sandbox](https://github.com/DIYgod/ttrss-plugin-remove-iframe-sandbox) 插件

:::

::: tip 关于视频清晰度

内嵌视频的默认清晰度为 480P，如需解锁更高清晰度，请[点此](https://www.bilibili.com/blackboard/html5player.html?cid=253377437&aid=885203421&page=&as_wide=1)在下方登录以设置 Cookie，仅对当前浏览器生效

:::

### 番剧

<Route author="DIYgod" example="/bilibili/bangumi/media/9192" path="/bilibili/bangumi/media/:mediaid" :paramsDesc="['番剧媒体 id, 番剧主页 URL 中获取']"/>

### 用户追番列表

<Route author="wdssmq" example="/bilibili/user/bangumi/208259" path="/bilibili/user/bangumi/:uid/:type?" :paramsDesc="['用户 id','1为番，2为剧，留空为1']" anticrawler="1" radar="1" rssbud="1"/>

### UP 主投稿

<Route author="DIYgod" example="/bilibili/user/video/2267573" path="/bilibili/user/video/:uid/:disableEmbed?" :paramsDesc="['用户 id, 可在 UP 主主页中找到', '默认为开启内嵌视频, 任意值为关闭']" anticrawler="1" radar="1" rssbud="1"/>

### UP 主专栏

<Route author="lengthmin" example="/bilibili/user/article/334958638" path="/bilibili/user/article/:uid" :paramsDesc="['用户 id, 可在 UP 主主页中找到']" anticrawler="1" radar="1" rssbud="1"/>

### UP 主动态

<Route author="DIYgod zytomorrow" example="/bilibili/user/dynamic/2267573" path="/bilibili/user/dynamic/:uid/:disableEmbed?" :paramsDesc="['用户 id, 可在 UP 主主页中找到', '默认为开启内嵌视频, 任意值为关闭']" radar="1" rssbud="1"/>

### UP 主频道

<Route author="HenryQW" example="/bilibili/user/channel/142821407/49017" path="/bilibili/user/channel/:uid/:cid/:disableEmbed?" :paramsDesc="['用户 id, 可在 UP 主主页中找到', '频道 id, 可在频道的 URL 中找到', '默认为开启内嵌视频, 任意值为关闭']" anticrawler="1" radar="1" rssbud="1"/>

### UP 主默认收藏夹

<Route author="DIYgod" example="/bilibili/user/fav/2267573" path="/bilibili/user/fav/:uid/:disableEmbed?" :paramsDesc="['用户 id, 可在 UP 主主页中找到', '默认为开启内嵌视频, 任意值为关闭']" radar="1" rssbud="1"/>

### UP 主非默认收藏夹

<Route author="Qixingchen" example="/bilibili/fav/756508/50948568" path="/bilibili/fav/:uid/:fid/:disableEmbed?" :paramsDesc="['用户 id, 可在 UP 主主页中找到', '收藏夹 ID, 可在收藏夹的 URL 中找到, 默认收藏夹建议使用 UP 主默认收藏夹功能', '默认为开启内嵌视频, 任意值为关闭']"/>

### UP 主投币视频

<Route author="DIYgod" example="/bilibili/user/coin/208259" path="/bilibili/user/coin/:uid/:disableEmbed?" :paramsDesc="['用户 id, 可在 UP 主主页中找到', '默认为开启内嵌视频, 任意值为关闭']" anticrawler="1" radar="1" rssbud="1"/>

### UP 主粉丝

<Route author="Qixingchen" example="/bilibili/user/followers/2267573" path="/bilibili/user/followers/:uid" :paramsDesc="['用户 id, 可在 UP 主主页中找到']" radar="1" rssbud="1"/>

### UP 主关注用户

<Route author="Qixingchen" example="/bilibili/user/followings/2267573" path="/bilibili/user/followings/:uid" :paramsDesc="['用户 id, 可在 UP 主主页中找到']" radar="1" rssbud="1"/>

### 分区视频

<Route author="DIYgod" example="/bilibili/partion/33" path="/bilibili/partion/:tid/:disableEmbed?" :paramsDesc="['分区 id', '默认为开启内嵌视频, 任意值为关闭']" radar="1" rssbud="1">

动画

| MAD·AMV | MMD·3D | 短片・手书・配音 | 特摄 | 综合 |
| ------- | ------ | ---------------- | ---- | ---- |
| 24      | 25     | 47               | 86   | 27   |

番剧

| 连载动画 | 完结动画 | 资讯 | 官方延伸 |
| -------- | -------- | ---- | -------- |
| 33       | 32       | 51   | 152      |

国创

| 国产动画 | 国产原创相关 | 布袋戏 | 动态漫・广播剧 | 资讯 |
| -------- | ------------ | ------ | -------------- | ---- |
| 153      | 168          | 169    | 195            | 170  |

音乐

| 原创音乐 | 翻唱 | VOCALOID·UTAU | 电音 | 演奏 | MV  | 音乐现场 | 音乐综合 | ~~OP/ED/OST~~ |
| -------- | ---- | ------------- | ---- | ---- | --- | -------- | -------- | ------------- |
| 28       | 31   | 30            | 194  | 59   | 193 | 29       | 130      | 54            |

舞蹈

| 宅舞 | 街舞 | 明星舞蹈 | 中国舞 | 舞蹈综合 | 舞蹈教程 |
| ---- | ---- | -------- | ------ | -------- | -------- |
| 20   | 198  | 199      | 200    | 154      | 156      |

游戏

| 单机游戏 | 电子竞技 | 手机游戏 | 网络游戏 | 桌游棋牌 | GMV | 音游 | Mugen |
| -------- | -------- | -------- | -------- | -------- | --- | ---- | ----- |
| 17       | 171      | 172      | 65       | 173      | 121 | 136  | 19    |

知识

| 科学科普 | 社科人文 | 财经 | 校园学习 | 职业职场 | 野生技术协会 |
| -------- | -------- | ---- | -------- | -------- | ------------ |
| 201      | 124      | 207  | 208      | 209      | 122          |

~~科技~~

| ~~演讲・公开课~~ | ~~星海~~ | ~~机械~~ | ~~汽车~~ |
| ---------------- | -------- | -------- | -------- |
| 39               | 96       | 98       | 176      |

数码

| 手机平板 | 电脑装机 | 摄影摄像 | 影音智能 |
| -------- | -------- | -------- | -------- |
| 95       | 189      | 190      | 191      |

生活

| 搞笑 | 日常 | 美食圈 | 动物圈 | 手工 | 绘画 | 运动 | 汽车 | 其他 | ~~ASMR~~ |
| ---- | ---- | ------ | ------ | ---- | ---- | ---- | ---- | ---- | -------- |
| 138  | 21   | 76     | 75     | 161  | 162  | 163  | 176  | 174  | 175      |

鬼畜

| 鬼畜调教 | 音 MAD | 人力 VOCALOID | 教程演示 |
| -------- | ------ | ------------- | -------- |
| 22       | 26     | 126           | 127      |

时尚

| 美妆 | 服饰 | 健身 | T 台 | 风向标 |
| ---- | ---- | ---- | ---- | ------ |
| 157  | 158  | 164  | 159  | 192    |

~~广告~~

| ~~广告~~ |
| -------- |
| 166      |

资讯

| 热点 | 环球 | 社会 | 综合 |
| ---- | ---- | ---- | ---- |
| 203  | 204  | 205  | 206  |

娱乐

| 综艺 | 明星 | Korea 相关 |
| ---- | ---- | ---------- |
| 71   | 137  | 131        |

影视

| 影视杂谈 | 影视剪辑 | 短片 | 预告・资讯 |
| -------- | -------- | ---- | ---------- |
| 182      | 183      | 85   | 184        |

纪录片

| 全部 | 人文・历史 | 科学・探索・自然 | 军事 | 社会・美食・旅行 |
| ---- | ---------- | ---------------- | ---- | ---------------- |
| 177  | 37         | 178              | 179  | 180              |

电影

| 全部 | 华语电影 | 欧美电影 | 日本电影 | 其他国家 |
| ---- | -------- | -------- | -------- | -------- |
| 23   | 147      | 145      | 146      | 83       |

电视剧

| 全部 | 国产剧 | 海外剧 |
| ---- | ------ | ------ |
| 11   | 185    | 187    |

</Route>

### 分区视频排行榜

<Route author="lengthmin" example="/bilibili/partion/ranking/171/3" path="/bilibili/partion/ranking/:tid/:days?/:disableEmbed?" :paramsDesc="['分区 id, 见上方表格', '缺省为 7, 指最近多少天内的热度排序', '默认为开启内嵌视频, 任意值为关闭']"/>

### 视频选集列表

<Route author="sxzz" example="/bilibili/video/page/BV1i7411M7N9" path="/bilibili/video/page/:bvid/:disableEmbed?" :paramsDesc="['可在视频页 URL 中找到', '默认为开启内嵌视频, 任意值为关闭']"/>

### 视频评论

<Route author="Qixingchen" example="/bilibili/video/reply/BV1vA411b7ip" path="/bilibili/video/reply/:bvid" :paramsDesc="['可在视频页 URL 中找到']"/>

### 视频弹幕

<Route author="Qixingchen" example="/bilibili/video/danmaku/BV1vA411b7ip/1" path="/bilibili/video/danmaku/:bvid/:pid?" :paramsDesc="['视频AV号,可在视频页 URL 中找到','分P号,不填默认为1']"/>

### link 公告

<Route author="Qixingchen" example="/bilibili/link/news/live" path="/bilibili/link/news/:product" :paramsDesc="['公告分类, 包括 直播:live 小视频:vc 相簿:wh']"/>

### 视频搜索

<Route author="Symty" example="/bilibili/vsearch/藤原千花" path="/bilibili/vsearch/:kw/:order?/:disableEmbed?" :paramsDesc="['检索关键字', '排序方式, 综合:totalrank 最多点击:click 最新发布:pubdate(缺省) 最多弹幕:dm 最多收藏:stow', '默认为开启内嵌视频, 任意值为关闭']"/>

### 用户关注动态

<Route author="TigerCubDen" example="/bilibili/followings/dynamic/109937383" path="/bilibili/followings/dynamic/:uid/:disableEmbed?" :paramsDesc="['用户 id', '默认为开启内嵌视频, 任意值为关闭']" selfhost="1">
::: warning 注意

用户动态需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。

:::
</Route>

### 用户关注视频动态

<Route author="LogicJake" example="/bilibili/followings/video/2267573" path="/bilibili/followings/video/:uid/:disableEmbed?" :paramsDesc="['用户 id', '默认为开启内嵌视频, 任意值为关闭']" selfhost="1">
::: warning 注意

用户动态需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。

:::
</Route>

### 用户关注专栏

<Route author="woshiluo" example="/bilibili/followings/article/99800931" path="/bilibili/followings/article/:uid" :paramsdesc="['用户 id']" selfhost="1">
::: warning 注意

用户动态需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。

:::
</Route>

### 直播开播

见 [#哔哩哔哩直播](/live.html#bi-li-bi-li-zhi-bo)

### 直播搜索

见 [#哔哩哔哩直播](/live.html#bi-li-bi-li-zhi-bo)

### 直播分区

见 [#哔哩哔哩直播](/live.html#bi-li-bi-li-zhi-bo)

### 主站话题列表

<Route author="Qixingchen" example="/bilibili/blackboard" path="/bilibili/blackboard" />

### 会员购新品上架

<Route author="DIYgod" example="/bilibili/mall/new/1" path="/bilibili/mall/new/:category?" :paramsDesc="['分类，默认全部，见下表']">

| 全部 | 手办 | 魔力赏 | 周边 | 游戏 |
| ---- | ---- | ------ | ---- | ---- |
| 0    | 1    | 7      | 3    | 6    |

</Route>

### 会员购作品

<Route author="DIYgod" example="/bilibili/mall/ip/0_3000294" path="/bilibili/mall/ip/:id" :paramsDesc="['作品 id, 可在作品列表页 URL 中找到']"/>

### 排行榜

<Route author="DIYgod" example="/bilibili/ranking/0/3/1" path="/bilibili/ranking/:tid/:days?/:arc_type?/:disableEmbed?" :paramsDesc="['排行榜分区 id, 默认 0', '时间跨度, 可为 1 3 7 30', '投稿时间, 可为 0(全部投稿) 1(近期投稿) , 默认 1', '默认为开启内嵌视频, 任意值为关闭']">

| 全站 | 动画 | 国创相关 | 音乐 | 舞蹈 | 游戏 | 科技 | 数码 | 生活 | 鬼畜 | 时尚 | 娱乐 | 影视 |
| ---- | ---- | -------- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 0    | 1    | 168      | 3    | 129  | 4    | 36   | 188  | 160  | 119  | 155  | 5    | 181  |

</Route>

### 话题 (频道 / 标签)

<Route author="Qixingchen" example="/bilibili/topic/2233" path="/bilibili/topic/:topic" :paramsDesc="['话题名(又称频道名或标签) 例如 2233 或 COSPLAY']"/>

### 歌单

<Route author="LogicJake" example="/bilibili/audio/10624" path="/bilibili/audio/:id" :paramsDesc="['歌单 id, 可在歌单页 URL 中找到']"/>

### 专栏文集

<Route author="hoilc" example="/bilibili/readlist/25611" path="/bilibili/readlist/:listid" :paramsDesc="['文集 id, 可在专栏文集 URL 中找到']"/>

### B 站每周必看

<Route author="ttttmr" example="/bilibili/weekly" path="/bilibili/weekly/:disableEmbed?" :paramsDesc="['默认为开启内嵌视频, 任意值为关闭']"/>

### 漫画更新

<Route author="hoilc" example="/bilibili/manga/update/26009" path="/bilibili/manga/update/:comicid" :paramsDesc="['漫画 id, 可在 URL 中找到, 支持带有`mc`前缀']"/>

## Dev.to

### 最高职位

<Route author="dwemerx" example="/dev.to/top/month" path="/dev.to/top/:period" :paramsDesc="['period']">

| 开发到每周最高 | 开发至每月最高 | 开发年度最高 | 开发到有史以来最高职位 |
| -------------- | -------------- | ------------ | ---------------------- |
| week           | month          | year         | infinity               |

</Route>

## Disqus

### 评论

<Route author="DIYgod" example="/disqus/posts/diygod-me" path="/disqus/posts/:forum" :paramsDesc="['网站的 disqus name']"/>

## Facebook

### 粉絲專頁

<Route author="maple3142" example="/facebook/page/SonetPCR" path="/facebook/page/:id" :paramsDesc="['專頁 id']" anticrawler="1"/>

## Fur Affinity

### 主页

<Route author="TigerCubDen" example="/furaffinity/home" path="/furaffinity/home/:type?/:nsfw?" :paramsDesc="['类型，默认为 `artwork`', 'NSFW开关, 当值为 `1` 时不过滤NSFW内容']" radar="1">

类型 type

| 艺术品  | 手工   | 音乐  | 写作    |
| ------- | ------ | ----- | ------- |
| artwork | crafts | music | writing |

</Route>

### 浏览

<Route author="TigerCubDen" example="/furaffinity/browse" path="/furaffinity/browse/:nsfw?" :paramsDesc="['NSFW开关, 当值为 `1` 时不过滤NSFW内容']" radar="1"/>

### 站点状态

<Route author="TigerCubDen" example="/furaffinity/status" path="/furaffinity/status" radar="1"/>

### 搜索

<Route author="TigerCubDen" example="/furaffinity/search/tiger" path="/furaffinity/search/:keyword/:nsfw?" :paramsDesc="['搜索关键词，仅限英文搜索', 'NSFW开关, 当值为 `1` 时不过滤NSFW内容']" radar="1"/>

### 用户主页简介

<Route author="TigerCubDen" example="/furaffinity/user/tiger-jungle" path="/furaffinity/user/:username" :paramsDesc="['用户名, 可在用户主页的链接处找到']" radar="1"/>

### 用户关注列表

<Route author="TigerCubDen" example="/furaffinity/watching/okami9312" path="/furaffinity/watching/:username" :paramsDesc="['用户名, 可在用户主页的链接处找到']" radar="1"/>

### 用户被关注列表

<Route author="TigerCubDen" example="/furaffinity/watchers/malikshadowclaw" path="/furaffinity/watchers/:username" :paramsDesc="['用户名, 可在用户主页的链接处找到']" radar="1"/>

### 用户接受委托信息

<Route author="TigerCubDen" example="/furaffinity/commissions/flashlioness" path="/furaffinity/commissions/:username" :paramsDesc="['用户名, 可在用户主页的链接处找到']" radar="1"/>

### 用户的 Shouts 留言

<Route author="TigerCubDen" example="/furaffinity/shouts/redodgft" path="/furaffinity/shouts/:username" :paramsDesc="['用户名, 可在用户主页的链接处找到']" radar="1"/>

### 用户的日记

<Route author="TigerCubDen" example="/furaffinity/journals/rukis" path="/furaffinity/journals/:username" :paramsDesc="['用户名, 可在用户主页的链接处找到']" radar="1"/>

### 用户的创作画廊

<Route author="TigerCubDen" example="/furaffinity/gallery/flashlioness" path="/furaffinity/gallery/:username/:nsfw?" :paramsDesc="['用户名, 可在用户主页的链接处找到', 'NSFW开关，当值为 `1` 时不过滤NSFW内容']" radar="1"/>

### 用户的零碎 (非正式) 作品

<Route author="TigerCubDen" example="/furaffinity/scraps/flashlioness" path="/furaffinity/scraps/:username/:nsfw?" :paramsDesc="['用户名, 可在用户主页的链接处找到', 'NSFW开关，当值为 `1` 时不过滤NSFW内容']" radar="1"/>

### 用户的喜爱列表

<Route author="TigerCubDen" example="/furaffinity/favorites/tiger-jungle" path="/furaffinity/favorites/:username/:nsfw?" :paramsDesc="['用户名, 可在用户主页的链接处找到', 'NSFW开关，当值为 `1` 时不过滤NSFW内容']" radar="1"/>

### 作品评论区

<Route author="TigerCubDen" example="/furaffinity/submission_comments/34909983" path="/furaffinity/submission_comments/:id" :paramsDesc="['作品id, 可在作品所在页面对应的链接处找到']" radar="1"/>

### 日记评论区

<Route author="TigerCubDen" example="/furaffinity/journal_comments/9750669" path="/furaffinity/journal_comments/:id" :paramsDesc="['日记id, 可在日记所在页面对应的链接处找到']" radar="1"/>

## Gab

### 用戶時間線

<Route author="zphw" example="/gab/user/realdonaldtrump" path="/gab/user/:username" :paramsDesc="['用戶名']" />

### 熱門

<Route author="zphw" example="/gab/popular/hot" path="/gab/popular/:sort?" :paramsDesc="['排序方式, `hot` 為 Hot Posts, `top` 為 Top Posts。默認為 hot']" />

## iCity

### 用户动态

<Route author="nczitzk" example="/icity/sai" path="/icity/:id" :paramsDesc="['用户 id']"/>

## Instagram

::: warning 注意

由于 Instagram API 限制，必须在服务器上设置你的用户名和密码。暂不支持两步验证。步骤见部署指南。

如需无登录的 feed，请用 Picuki。

:::

### 用户

<Route author="oppilate DIYgod" example="/instagram/user/stefaniejoosten" path="/instagram/:category/:key" :paramsDesc="['时间线类别，目前仅支持用户时间线','针对该类别的索引，例如用户时间线里是用户名或用户 ID']" radar="1" anticrawler="1"/>

## Keep

### 运动日记

<Route author="Dectinc DIYgod" example="/keep/user/556b02c1ab59390afea671ea" path="/keep/user/:id" :paramsDesc="['Keep 用户 id']"/>

## Lofter

### 用户

<Route author="hondajojo" example="/lofter/user/tingtingtingtingzhi" path="/lofter/user/:name" :paramsDesc="['Lofter 用户名, 在URL里']"/>

### 话题 (标签)

<Route author="hoilc" example="/lofter/tag/名侦探柯南/date" path="/lofter/tag/:name/:type?" :paramsDesc="['话题名(标签名) 例如 `名侦探柯南`', '排行类型, 默认显示最新话题, 取值如下']"/>

| new  | date | week | month | total |
| ---- | ---- | ---- | ----- | ----- |
| 最新 | 日榜 | 周榜 | 月榜  | 总榜  |

## Mastodon

::: tip 提示

通常来说，各实例提供用户时间线的订阅源，如下：

-   RSS: `https://**:instance**/users/**:username**.rss`
-   Atom: ~~`https://**:instance**/users/**:username**.atom`~~ (仅 pawoo.net)

例如：<https://pawoo.net/users/pawoo_support.rss> 或 <https://pawoo.net/users/pawoo_support.atom>

上述订阅源的内容不包括用户的转嘟。RSSHub 提供基于 Mastodon API 的订阅源，但需要您在某个 Mastodon 实例申请 API，并对 RSSHub 实例进行配置。详情见部署页面的配置模块。

:::

### 用户公共时间线

<Route author="notofoe" example="/mastodon/acct/CatWhitney@mastodon.social/statuses" path="/mastodon/acct/:acct/statuses/:only_media?" :paramsDesc="['Webfinger account URI, 形如 `user@host`', '是否只显示包含媒体（图片或视频）的推文, 默认置空为否, 任意值为是']"/>

### 实例公共时间线（本站）

<Route author="hoilc" example="/mastodon/timeline/pawoo.net/true" path="/mastodon/timeline/:site/:only_media?" :paramsDesc="['实例地址, 仅域名, 不包括`http://`或`https://`协议头', '是否只显示包含媒体（图片或视频）的推文, 默认置空为否, 任意值为是']"/>

### 实例公共时间线（跨站）

<Route author="hoilc" example="/mastodon/remote/pawoo.net/true" path="/mastodon/remote/:site/:only_media?" :paramsDesc="['实例地址, 仅域名, 不包括`http://`或`https://`协议头', '是否只显示包含媒体（图片或视频）的推文, 默认置空为否, 任意值为是']"/>

### 用户公共时间线（备用）

<Route author="notofoe" example="/mastodon/account_id/mastodon.social/23634/statuses/only_media" path="/mastodon/account/:site/:account_id/statuses/:only_media?" :paramsDesc="['实例地址, 仅域名, 不包括`http://`或`https://`协议头', '用户 ID. 登录实例后, 搜索用户并进入用户页, 在地址中可以找到这串数字', '是否只显示包含媒体（图片或视频）的推文, 默认置空为否, 任意值为是']"/>

## piapro

### 用户最新作品

<Route author="hoilc" example="/piapro/user/shine_longer" path="/piapro/user/:pid" :paramsDesc="['用户 ID, 可在 URL 中找到']"/>

### 全站最新作品

<Route author="hoilc" example="/piapro/public/music/miku/2" path="/piapro/public/:type/:tag?/:category?" :paramsDesc="['作品类别, 可选`music`,`illust`,`text`','标签, 即 URL 中`tag`参数','分类 ID, 即 URL 中 `categoryId` 参数']"/>

## Picuki

### 用户

<Route author="hoilc" example="/picuki/profile/stefaniejoosten" path="/picuki/profile/:id/:displayVideo?" :paramsDesc="['Instagram 用户 id','是否显示视频，任意值为是，留空为否']" radar="1" rssbud="1"/>

## pixiv

### 用户收藏

<Route author="EYHN" example="/pixiv/user/bookmarks/15288095" path="/pixiv/user/bookmarks/:id" :paramsDesc="['用户 id, 可在用户主页 URL 中找到']" radar="1" rssbud="1"/>

### 用户动态

<Route author="DIYgod" example="/pixiv/user/11" path="/pixiv/user/:id" :paramsDesc="['用户 id, 可在用户主页 URL 中找到']" radar="1" rssbud="1"/>

### 排行榜

<Route author="EYHN" example="/pixiv/ranking/week" path="/pixiv/ranking/:mode/:date?" :paramsDesc="['排行榜类型' ,'日期, 取值形如 `2018-4-25`']" radar="1" rssbud="1">

| pixiv 日排行 | pixiv 周排行 | pixiv 月排行 | pixiv 受男性欢迎排行 | pixiv 受女性欢迎排行 | pixiv 原创作品排行 | pixiv 新人排行 |
| ------------ | ------------ | ------------ | -------------------- | -------------------- | ------------------ | -------------- |
| day          | week         | month        | day_male             | day_female           | week_original      | week_rookie    |

| pixiv R-18 日排行 | pixiv R-18 受男性欢迎排行 | pixiv R-18 受女性欢迎排行 | pixiv R-18 周排行 | pixiv R-18G 排行 |
| ----------------- | ------------------------- | ------------------------- | ----------------- | ---------------- |
| day_r18           | day_male_r18              | day_female_r18            | week_r18          | week_r18g        |

</Route>

### 关键词

<Route author="DIYgod" example="/pixiv/search/麻衣/popular/2" path="/pixiv/search/:keyword/:order?/:r18?" :paramsDesc="['关键词', '排序方式，popular 按热门度排序，空或其他任意值按时间排序', '过滤 R18 内容，0 为不过滤，1 为只看非 R18 内容，2 为只看 R18 内容，默认为 0']" radar="1" rssbud="1"/>

### 关注的新作品

<Route author="ClarkeCheng" example="/pixiv/user/illustfollows" path="/pixiv/user/illustfollows" radar="1" rssbud="1" selfhost="1"/>
::: warning 注意

因为每个人关注的画师不同，所以只能自建。请不要将画师设为 “悄悄关注”，这样子画师的作品就不会出现在订阅里了。

:::
</Route>

## pixiv-fanbox

<Route author="sgqy" example="/fanbox/otomeoto" path="/fanbox/:user?" :paramsDesc="['用户名, 可在用户主页 URL 中找到. 默认为官方资讯']"/>

## Popi 提问箱

### 提问箱新回答

<Route author="AgFlore" example="/popiask/popi6666" path="/popiask/:sharecode/:pagesize?" :paramsDesc="['提问箱 ID', '查看条数（默认为 20）']" radar="1" rssbud="1"/>

## Soul

### 瞬间更新

<Route author="ImSingee" example="/soul/Y2w2aTNWQVBLOU09" path="/soul/:id" :paramsDesc="['用户 id, 分享用户主页时的 URL 的 userIdEcpt 参数']" radar="1" rssbud="1"></Route>

### 热门瞬间

<Route author="BugWriter2" example="/soul/posts/hot" path="/soul/posts/hot" radar="1" rssbud="1"></Route>

## Tape 小纸条

### 提问箱新回答

<Route author="AgFlore" example="/tapechat/questionbox/TOAH7BBH" path="/tapechat/questionbox/:sharecode/:pagesize?" :paramsDesc="['提问箱 ID', '查看条数（默认为 20）']" />

## Telegram

### 频道

<Route author="DIYgod" example="/telegram/channel/awesomeDIYgod/%23DIYgod的豆瓣动态" path="/telegram/channel/:username/:searchQuery?" :paramsDesc="['频道 username', '搜索关键词, 如需搜索 tag 请用 `%23` 替代 `#`']" radar="1" rssbud="1">

::: tip 提示

由于 Telegram 限制，部分涉及色情、版权、政治的频道无法订阅，可通过访问 <https://t.me/s/:username> 确认。

:::

</Route>

### 贴纸包

<Route author="DIYgod" example="/telegram/stickerpack/DIYgod" path="/telegram/stickerpack/:name" :paramsDesc="['贴纸包 id, 可在分享贴纸获得的 URL 中找到']"/>

### Telegram Blog

<Route author="fengkx" example="/telegram/blog" path="/telegram/blog" />

## Twitter

::: warning 注意

由于 Twitter Api 限制，关于 Twitter 相关的 RSS 接口目前仅支持 7 天内推文检索

:::

对于推文内容，在 `routeParams` 参数中以 query string 格式指定选项，可以控制额外的功能

| 键                           | 含义                                                                         | 接受的值       | 默认值                                   |
| ---------------------------- | ---------------------------------------------------------------------------- | -------------- | ---------------------------------------- |
| readable                     | 是否开启细节排版可读性优化                                                   | 0/1/true/false | false                                    |
| authorNameBold               | 是否加粗作者名字                                                             | 0/1/true/false | false                                    |
| showAuthorInTitle            | 是否在标题处显示作者                                                         | 0/1/true/false | false（`/twitter/followings` 中为 true） |
| showAuthorInDesc             | 是否在正文处显示作者                                                         | 0/1/true/false | false（`/twitter/followings` 中为 true） |
| showQuotedAuthorAvatarInDesc | 是否在正文处显示被转推的推文的作者头像（若阅读器会提取正文图片，不建议开启） | 0/1/true/false | false                                    |
| showAuthorAvatarInDesc       | 是否在正文处显示作者头像（若阅读器会提取正文图片，不建议开启）               | 0/1/true/false | false                                    |
| showEmojiForRetweetAndReply  | 显示 “🔁” 取代 “Rt”、“↩️” 取代 “Re”                                          | 0/1/true/false | false                                    |
| showRetweetTextInTitle       | 在标题处显示转推评论（置为 false 则在标题只显示被转推推文）                  | 0/1/true/false | true                                     |
| addLinkForPics               | 为图片添加可点击的链接                                                       | 0/1/true/false | false                                    |
| showTimestampInDescription   | 在正文处显示推特的时间戳                                                     | 0/1/true/false | false                                    |
| showQuotedInTitle            | 在标题处显示被引用的推文                                                     | 0/1/true/false | false                                    |
| widthOfPics                  | 推文配图宽（生效取决于阅读器）                                               | 不指定 / 数字  | 不指定                                   |
| heightOfPics                 | 推文配图高（生效取决于阅读器）                                               | 不指定 / 数字  | 不指定                                   |
| sizeOfAuthorAvatar           | 作者头像大小                                                                 | 数字           | 48                                       |
| sizeOfQuotedAuthorAvatar     | 被转推推文作者头像大小                                                       | 数字           | 24                                       |
| excludeReplies               | 排除回复，只在用户时间线有效                                                 | 0/1/true/false | false                                    |
| includeRts                   | 包括转推，只在用户时间线有效                                                 | 0/1/true/false | true                                     |
| count                        | 传递给 Twitter API 的 `count` 参数，只在用户时间线有效                       | 不指定 / 数字  | 不指定                                   |

指定更多与默认值不同的参数选项可以改善 RSS 的可读性，如

    https://rsshub.app/twitter/user/durov/readable=1&authorNameBold=1&showAuthorInTitle=1&showAuthorInDesc=1&showQuotedAuthorAvatarInDesc=1&showAuthorAvatarInDesc=1&showEmojiForRetweetAndReply=1&showRetweetTextInTitle=0&addLinkForPics=1&showTimestampInDescription=1&showQuotedInTitle=1&heightOfPics=150

的效果为

<img src="/readable-twitter.png" alt="Durov 的可读推特 RSS">

### 用户时间线

<Route author="DIYgod" example="/twitter/user/DIYgod" path="/twitter/user/:id/:routeParams?" :paramsDesc="['用户名', '额外参数；请参阅上面的说明和表格；特别地，当 `routeParams=exclude_replies`时去除回复，`routeParams=exclude_rts`去除转推，`routeParams=exclude_rts_replies`去除回复和转推，默认包含全部回复和转推。']" radar="1" rssbud="1"/>

### 用户关注时间线

<Route author="DIYgod" example="/twitter/followings/DIYgod" path="/twitter/followings/:id/:routeParams?" :paramsDesc="['用户名', '额外参数；请参阅上面的说明和表格']" radar="1" rssbud="1" selfhost="1">

::: warning 注意

用户关注时间线需要对应用户的 Twitter token， 所以只能自建，详情见部署页面的配置模块。

:::

</Route>

### 列表时间线

<Route author="xyqfer" example="/twitter/list/ladyleet/javascript" path="/twitter/list/:id/:name/:routeParams?" :paramsDesc="['用户名', 'list 名称', '额外参数；请参阅上面的说明和表格']" radar="1" rssbud="1"/>

### 用户喜欢列表

<Route author="xyqfer" example="/twitter/likes/DIYgod" path="/twitter/likes/:id/:routeParams?" :paramsDesc="['用户名', '额外参数；请参阅上面的说明和表格']" radar="1" rssbud="1"/>

### 关键词

<Route author="DIYgod" example="/twitter/keyword/RSSHub" path="/twitter/keyword/:keyword/:routeParams?" :paramsDesc="['关键词', '额外参数；请参阅上面的说明和表格']" radar="1" rssbud="1"/>

### Trends

<Route author="sakamossan" example="/twitter/trends/23424856" path="/twitter/trends/:woeid?" :paramsDesc="['Where On Earth ID. 默认 woeid=1 (World Wide)']" radar="1" rssbud="1"/>

## VueVlog

### 用户

<Route author="kt286" example="/vuevideo/971924215514" path="/vuevideo/:userid" :paramsDesc="['用户ID, 可在对应页面的 URL 中找到']"/>

## YouTube

::: tip Tiny Tiny RSS 用户请注意

Tiny Tiny RSS 会给所有 iframe 元素添加 `sandbox="allow-scripts"` 属性，导致无法加载 YouTube 内嵌视频，如果需要使用内嵌视频请为 Tiny Tiny RSS 安装 [remove_iframe_sandbox](https://github.com/DIYgod/ttrss-plugin-remove-iframe-sandbox) 插件

:::

### 用户

<Route author="DIYgod" example="/youtube/user/JFlaMusic/" path="/youtube/user/:username/:disableEmbed?" :paramsDesc="['用户名', '默认为开启内嵌视频, 任意值为关闭']" radar="1" rssbud="1"/>

### 频道

::: tip 提示

YouTube 官方亦有提供频道 RSS，形如 <https://www.youtube.com/feeds/videos.xml?channel_id=UCDwDMPOZfxVV0x_dz0eQ8KQ>。

:::

<Route author="DIYgod" example="/youtube/channel/UCDwDMPOZfxVV0x_dz0eQ8KQ" path="/youtube/channel/:id/:disableEmbed?" :paramsDesc="['频道 id', '默认为开启内嵌视频, 任意值为关闭']" radar="1" rssbud="1"/>

### 播放列表

<Route author="HenryQW" example="/youtube/playlist/PLqQ1RwlxOgeLTJ1f3fNMSwhjVgaWKo_9Z" path="/youtube/playlist/:id/:disableEmbed?" :paramsDesc="['播放列表 id', '默认为开启内嵌视频, 任意值为关闭']" radar="1" rssbud="1"/>

## 巴哈姆特

### 个人小屋

<Route author="hoilc" example="/bahamut/creation/tpesamguo/338592" path="/bahamut/creation/:author/:category?" :paramsDesc="['作者 ID, 即为个人小屋 URL 中 `owner` 参数','分类ID, 即为创作分类 URL 中 `c` 参数']"/>

### 创作大厅

<Route author="hoilc" example="/bahamut/creation_index/4/0/2" path="/bahamut/creation_index/:category?/:subcategory?/:type?" :paramsDesc="['分类 ID, 即为 URL 中 `k1` 参数, 0 或置空为不限','子分类 ID, 即为 URL 中 `k2` 参数, 0或置空为不限', '排行类型, 即为 URL 中 `vt` 参数, 0或置空为達人專欄']">

分类 ID 参考如下

| 不限 | 日誌 | 小說 | 繪圖 | Cosplay | 同人商品 |
| ---- | ---- | ---- | ---- | ------- | -------- |
| 0    | 1    | 2    | 3    | 4       | 5        |

子分类 ID 比较多不作列举

排行类型参考如下

| 達人專欄 | 最新創作 | 最新推薦 | 熱門創作 | 精選閣樓 |
| -------- | -------- | -------- | -------- | -------- |
| 1        | 2        | 3        | 4        | 5        |

</Route>

## 币乎

### 用户动态

<Route author="LogicJake" example="/bihu/activaties/1478342200" path="/bihu/activaties/:id" :paramsDesc="['用户 id']"/>

## 唱吧

### 用户

<Route author="kt286" example="/changba/34108440" path="/changba/:userid" :paramsDesc="['用户ID, 可在对应页面的 URL 中找到']" supportPodcast="1"/>

## 大众点评

### 用户

<Route author="brilon"  example="/dianping/user/35185271" path="/dianping/user/:id" :paramsDesc="['用户id，可在 URL 中找到']"/>

## 豆瓣

### 正在上映的电影

<Route author="DIYgod" example="/douban/movie/playing" path="/douban/movie/playing"/>

### 正在上映的高分电影

<Route author="DIYgod" example="/douban/movie/playing/7.5" path="/douban/movie/playing/:score" :paramsDesc="['返回大于等于这个分数的电影']"/>

### 即将上映的电影

<Route author="DIYgod" example="/douban/movie/later" path="/douban/movie/later"/>

### 北美票房榜

<Route author="DIYgod" example="/douban/movie/ustop" path="/douban/movie/ustop"/>

### 一周口碑榜

<Route author="umm233 nczitzk" example="/douban/movie/weekly" path="/douban/movie/weekly/:type?" :paramsDesc="['分类，可在榜单页 URL 中找到，默认为一周口碑电影榜']">

| 一周口碑电影榜    | 一周口碑剧集榜 | 华语口碑剧集榜         |
| ----------------- | -------------- | ---------------------- |
| movie_weekly_best | tv_weekly_best | tv_chinese_best_weekly |

</Route>

### 豆瓣电影分类

<Route author="zzwab" example="/douban/movie/classification/R/7.5/Netflix,剧情,2020" path="/douban/movie/classification/:sort?/:score?/:tags?" :paramsDesc="['排序方式，默认为U', '最低评分，默认不限制', '分类标签，多个标签之间用英文逗号分隔，常见的标签到豆瓣电影的分类页面查看，支持自定义标签']" />

排序方式可选值如下

| 近期热门 | 标记最多 | 评分最高 | 最近上映 |
| -------- | -------- | -------- | -------- |
| U        | T        | S        | R        |

### 豆瓣电影人

<Route author="minimalistrojan" example="/douban/celebrity/1274261" path="/douban/celebrity/:id/:sort?" :paramsDesc="['电影人 id', '排序方式，缺省为 `time`（时间排序），可为 `vote` （评价排序）']"/>

### 豆瓣小组

<Route author="DIYgod" example="/douban/group/648102" path="/douban/group/:groupid/:type?" :paramsDesc="['豆瓣小组的 id', '缺省 最新，essence 最热，elite 精华']"/>

### 浏览发现

<Route author="clarkzsd" example="/douban/explore" path="/douban/explore"/>

### 浏览发现分栏目

<Route author="LogicJake" example="/douban/explore/column/2" path="/douban/explore_column/:id" :paramsDesc="['分栏目id']"/>

### 新书速递

<Route author="fengkx" example="/douban/book/latest" path="douban/book/latest"/>

### 最新增加的音乐

<Route author="fengkx xyqfer" example="/douban/music/latest/chinese" path="/douban/music/latest/:area?" :paramsDesc="['区域类型，默认全部']">

| 华语    | 欧美    | 日韩        |
| ------- | ------- | ----------- |
| chinese | western | japankorean |

</Route>

### 热门同城活动

<Route author="xyqfer" example="/douban/event/hot/118172" path="/douban/event/hot/:locationId" :paramsDesc="['位置 id, [同城首页](https://www.douban.com/location)打开控制台执行 `window.__loc_id__` 获取']"/>

### 商务印书馆新书速递

<Route author="xyqfer" example="/douban/commercialpress/latest" path="/douban/commercialpress/latest"/>

### 豆瓣书店

<Route author="xyqfer" example="/douban/bookstore" path="/douban/bookstore"/>

### 热门图书排行

<Route author="xyqfer queensferryme" example="/douban/book/rank/fiction" path="/douban/book/rank/:type?" :paramsDesc="['图书类型，默认合并列表']">

| 全部 | 虚构    | 非虚构     |
| ---- | ------- | ---------- |
|      | fiction | nonfiction |

</Route>

### 豆列

<Route author="LogicJake" example="/douban/doulist/37716774" path="douban/doulist/:id" :paramsDesc="['豆列id']"/>

### 用户广播

<Route author="alfredcai" example="/douban/people/62759792/status" path="douban/people/:userid/status/:routeParams" :paramsDesc="['整数型用户 id', '额外参数；见下']" radar="1">

::: tip 提示

-   **目前只支持整数型 id**
-   字母型的 id，可以通过头像图片链接来找到其整数型 id，图片命名规则`ul[userid]-*.jpg`或`u[userid]-*.jpg`，即取文件名中间的数字
-   例如：用户 id: `MovieL`他的头像图片链接：`https://img1.doubanio.com/icon/ul1128221-98.jpg`他的整数型 id: `1128221`

:::

对于豆瓣用户广播内容，在 `routeParams` 参数中以 query string 格式设置如下选项可以控制输出的样式

| 键                         | 含义                                                           | 接受的值       | 默认值 |
| -------------------------- | -------------------------------------------------------------- | -------------- | ------ |
| readable                   | 是否开启细节排版可读性优化                                     | 0/1/true/false | false  |
| authorNameBold             | 是否加粗作者名字                                               | 0/1/true/false | false  |
| showAuthorInTitle          | 是否在标题处显示作者                                           | 0/1/true/false | true   |
| showAuthorInDesc           | 是否在正文处显示作者                                           | 0/1/true/false | false  |
| showAuthorAvatarInDesc     | 是否在正文处显示作者头像（若阅读器会提取正文图片，不建议开启） | 0/1/true/false | false  |
| showEmojiForRetweet        | 显示 “🔁” 取代 “Fw”（转发）                                    | 0/1/true/false | false  |
| showRetweetTextInTitle     | 在标题出显示转发评论（置为 false 则在标题只显示被转发的广播）  | 0/1/true/false | false  |
| addLinkForPics             | 为图片添加可点击的链接                                         | 0/1/true/false | false  |
| showTimestampInDescription | 在正文处显示广播的时间戳                                       | 0/1/true/false | false  |
| showComments               | 在正文处显示评论                                               | 0/1/true/false | false  |
| widthOfPics                | 广播配图宽（生效取决于阅读器）                                 | 不指定 / 数字  | 不指定 |
| heightOfPics               | 广播配图高（生效取决于阅读器）                                 | 不指定 / 数字  | 不指定 |
| sizeOfAuthorAvatar         | 作者头像大小                                                   | 数字           | 48     |

指定更多与默认值不同的参数选项可以改善 RSS 的可读性，如

    https://rsshub.app/douban/people/113894409/status/readable=1&authorNameBold=1&showAuthorInTitle=1&showAuthorInDesc=1&showAuthorAvatarInDesc=1&showEmojiForRetweet=1&showRetweetTextInTitle=1&addLinkForPics=1&showTimestampInDescription=1&showComments=1&widthOfPics=100

的效果为

<img src="/readable-douban.png" alt="豆瓣读书的可读豆瓣广播 RSS">

</Route>

### 日记最新回应

<Route author="nczitzk" example="/douban/replies/xiaoyaxiaoya" path="/douban/replies/:uid" :paramsDesc="['用户id，可在用户日记页 URL 中找到']"/>

### 最新回应过的日记

<Route author="nczitzk" example="/douban/replied/xiaoyaxiaoya" path="/douban/replied/:uid" :paramsDesc="['用户id，可在用户日记页 URL 中找到']"/>

### 话题

<Route author="LogicJake" example="/douban/topic/48823" path="/douban/topic/:id/:sort?" :paramsDesc="['话题id','排序方式，hot或new，默认为new']"/>

### 频道专题

<Route author="umm233" example="/douban/channel/30168934/hot" path="/douban/channel/:id/:nav?" :paramsDesc="['频道id','专题分类，可选，默认为 default']">

| 默认    | 热门 | 最新 |
| ------- | ---- | ---- |
| default | hot  | new  |

</Route>

### 频道书影音

<Route author="umm233" example="/douban/channel/30168934/subject/0" path="/douban/channel/:id/subject/:nav" :paramsDesc="['频道id','书影音分类']">

| 电影 | 电视剧 | 图书 | 唱片 |
| ---- | ------ | ---- | ---- |
| 0    | 1      | 2    | 3    |

</Route>

### 用户想看

<Route author="exherb" example="/douban/people/exherb/wish/torrentProvider=1337x" path="/douban/people/:userid/wish/:routeParams?" :paramsDesc="['用户id','额外参数；见下']">

对于豆瓣用户想看的内容，在 `routeParams` 参数中以 query string 格式设置如下选项可以控制输出的样式

| 键               | 含义                                                       | 接受的值                        | 默认值 |
| ---------------- | ---------------------------------------------------------- | ------------------------------- | ------ |
| pagesCount       | 查询页面数                                                 |                                 | 1      |
| torrentProvider  | 启用 torrent 搜索                                          | all/1337x/Eztv/Rarbg/Yts/HDHome |        |
| passkey          | HDHome 密钥，当 torrentProvider 为 `all` 或  `HDHome` 必填 |                                 |        |
| torrentQuery     | 额外关键词，如 `1080p`， 逗号分割                          |                                 |        |
| torrentMinSeeds  | 最小 seeds 数                                              |                                 | 1      |
| torrentMinRating | 种子和电影标题最小匹配度                                   |                                 | 0.5    |

</Route>

## 饭否

::: warning 注意
部署时需要申请并配置饭否 Consumer Key、Consumer Secret、用户名和密码，具体见部署文档
:::

### 用户动态

<Route author="junbaor" example="/fanfou/user_timeline/wangxing" path="/fanfou/user_timeline/:uid" :paramsDesc="['用户的uid']" anticrawler="1"/>

### 当前登录用户的时间线

<Route author="junbaor" example="/fanfou/home_timeline" path="/fanfou/home_timeline" anticrawler="1"/>

### 用户收藏

<Route author="junbaor" example="/fanfou/favorites/wangxing" path="/fanfou/favorites/:uid" :paramsDesc="['用户的uid']" anticrawler="1"/>

### 热门话题

<Route author="junbaor" example="/fanfou/trends" path="/fanfou/trends" anticrawler="1"/>

### 饭否搜索

<Route author="junbaor" example="/fanfou/public_timeline/冬天" path="/fanfou/public_timeline/:keyword" :paramsDesc="['关键字']" anticrawler="1"/>

## 方格子

### 出版專題

<Route author="Maecenas" example="/vocus/publication/bass" path="/vocus/publication/:id" :paramsDesc="['出版專題 id，可在出版專題主页的 URL 找到']"/>

### 用户个人文章

<Route author="LogicJake" example="/vocus/user/tsetyan" path="/vocus/user/:id" :paramsDesc="['用户 id，可在用户主页的 URL 找到']"/>

## 即刻

### 用户动态

<Route author="DIYgod prnake" example="/jike/user/3EE02BC9-C5B3-4209-8750-4ED1EE0F67BB" path="/jike/user/:id" :paramsDesc="['用户 id, 可在即刻分享出来的单条动态页点击用户头像进入个人主页，然后在个人主页的 URL 中找到，或者在单条动态页使用 RSSHub Radar 插件']" radar="1"/>

### 圈子

<Route author="DIYgod prnake" example="/jike/topic/556688fae4b00c57d9dd46ee" path="/jike/topic/:id" :paramsDesc="['圈子 id, 可在即刻 web 端圈子页或 APP 分享出来的圈子页 URL 中找到']" radar="1" rssbud="1"/>

### 圈子 - 纯文字

<Route author="HenryQW" example="/jike/topic/text/553870e8e4b0cafb0a1bef68" path="/jike/topic/text/:id" :paramsDesc="['圈子 id, 可在即刻 web 端圈子页或 APP 分享出来的圈子页 URL 中找到']" radar="1" rssbud="1"/>

## 简书

### 首页

<Route author="DIYgod HenryQW" example="/jianshu/home" path="/jianshu/home"/>

### 热门

<Route author="DIYgod HenryQW" example="/jianshu/trending/weekly" path="/jianshu/trending/:timeframe" :paramsDesc="['按周 `weekly` 或 按月 `monthly`']"/>

### 专题

<Route author="DIYgod HenryQW" example="/jianshu/collection/xYuZYD" path="/jianshu/collection/:id" :paramsDesc="['专题 id, 可在专题页 URL 中找到']"/>

### 作者

<Route author="DIYgod HenryQW" example="/jianshu/user/yZq3ZV" path="/jianshu/user/:id" :paramsDesc="['作者 id, 可在作者主页 URL 中找到']"/>

## 美拍

### 用户动态

<Route author="ihewro" example="/meipai/user/56537299" path="/meipai/user/:id" :paramsDesc="['用户 id, 可在 分享出去获得的用户主页 URL 中找到']"/>

## 数字尾巴

### 首页

<Route author="Erriy" example="/dgtle" path="/dgtle" />

### 闲置（分类）

<Route author="xyqfer hoilc" example="/dgtle/trade/111" path="/dgtle/trade/:typeId?" :paramsDesc="['分类 id，默认为全部']">

| 全部 | 电脑 | 手机 | 平板 | 相机 | 影音 | 外设 | 生活 | 公告 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 0    | 111  | 109  | 110  | 113  | 114  | 115  | 112  | 116  |

</Route>

### 闲置（关键词）

<Route author="gaoliang hoilc" example="/dgtle/trade/search/ipad" path="/dgtle/trade/search/:keyword" :paramsDesc="['搜索关键词']"/>

### 鲸图（分类）

<Route author="Erriy" example="/dgtle/whale/category/0" path="/dgtle/whale/category/:category" :paramsDesc="['分类 id']">

| 精选 | 人物 | 静物 | 二次元 | 黑白 | 自然 | 美食 | 电影与游戏 | 科技与艺术 | 城市与建筑 | 萌物 | 美女 |
| ---- | ---- | ---- | ------ | ---- | ---- | ---- | ---------- | ---------- | ---------- | ---- | ---- |
| 0    | 1    | 2    | 3      | 4    | 5    | 6    | 7          | 8          | 9          | 10   | 11   |

</Route>

### 鲸图（排行榜）

<Route author="Erriy" example="/dgtle/whale/rank/download/day" path="/dgtle/whale/rank/:type/:rule" :paramsDesc="['排行榜类型', '排行榜周期']">

type

| 下载排行榜 | 点赞排行榜 |
| ---------- | ---------- |
| download   | like       |

rule

| 日排行 | 周排行 | 月排行 | 总排行 |
| ------ | ------ | ------ | ------ |
| day    | week   | month  | amount |

</Route>

## 刷屏

### 最新

<Route author="xyqfer" example="/weseepro/newest" path="/weseepro/newest"/>

### 最新（无中间页）

<Route author="xyqfer yefoenix" example="/weseepro/newest-direct" path="/weseepro/newest-direct"/>

### 朋友圈

<Route author="xyqfer" example="/weseepro/circle" path="/weseepro/circle"/>

## 微博

对于微博内容，在 `routeParams` 参数中以 query string 格式指定选项，可以控制输出的样式

| 键                         | 含义                                                           | 接受的值       | 默认值                              |
| -------------------------- | -------------------------------------------------------------- | -------------- | ----------------------------------- |
| readable                   | 是否开启细节排版可读性优化                                     | 0/1/true/false | false                               |
| authorNameBold             | 是否加粗作者名字                                               | 0/1/true/false | false                               |
| showAuthorInTitle          | 是否在标题处显示作者                                           | 0/1/true/false | false（`/weibo/keyword/`中为 true） |
| showAuthorInDesc           | 是否在正文处显示作者                                           | 0/1/true/false | false（`/weibo/keyword/`中为 true） |
| showAuthorAvatarInDesc     | 是否在正文处显示作者头像（若阅读器会提取正文图片，不建议开启） | 0/1/true/false | false                               |
| showEmojiForRetweet        | 显示 “🔁” 取代 “转发” 两个字                                   | 0/1/true/false | false                               |
| showRetweetTextInTitle     | 在标题出显示转发评论（置为 false 则在标题只显示被转发微博）    | 0/1/true/false | true                                |
| addLinkForPics             | 为图片添加可点击的链接                                         | 0/1/true/false | false                               |
| showTimestampInDescription | 在正文处显示被转发微博的时间戳                                 | 0/1/true/false | false                               |
| widthOfPics                | 微博配图宽（生效取决于阅读器）                                 | 不指定 / 数字  | 不指定                              |
| heightOfPics               | 微博配图高（生效取决于阅读器）                                 | 不指定 / 数字  | 不指定                              |
| sizeOfAuthorAvatar         | 作者头像大小                                                   | 数字           | 48                                  |
| displayVideo               | 是否直接显示微博视频，只在博主 RSS 中有效                      | 0/1/true/false | true                                |

指定更多与默认值不同的参数选项可以改善 RSS 的可读性，如

    https://rsshub.app/weibo/user/1642909335/readable=1&authorNameBold=1&showAuthorInTitle=1&showAuthorInDesc=1&showAuthorAvatarInDesc=1&showEmojiForRetweet=1&showRetweetTextInTitle=0&addLinkForPics=1&showTimestampInDescription=1&showTimestampInDescription=1&heightOfPics=150

的效果为

<img src="/readable-weibo.png" alt="微博小秘书的可读微博 RSS">

### 博主

<Route author="DIYgod iplusx" example="/weibo/user/1195230310" path="/weibo/user/:uid/:routeParams?" :paramsDesc="['用户 id, 博主主页打开控制台执行 `$CONFIG.oid` 获取', '额外参数；请参阅上面的说明和表格；特别地，当 `routeParams=1` 时开启微博视频显示']" anticrawler="1" radar="1" rssbud="1">

部分博主仅登录可见，不支持订阅，可以通过打开 `https://m.weibo.cn/u/:uid` 验证

</Route>

### 关键词

<Route author="DIYgod" example="/weibo/keyword/DIYgod" path="/weibo/keyword/:keyword/:routeParams?" :paramsDesc="['你想订阅的微博关键词', '额外参数；请参阅上面的说明和表格']" anticrawler="1" radar="1" rssbud="1"/>

### 热搜榜

<Route author="xyqfer" example="/weibo/search/hot" path="/weibo/search/hot" anticrawler="1" radar="1" rssbud="1"/>

### 超话

<Route author="zengxs" example="/weibo/super_index/1008084989d223732bf6f02f75ea30efad58a9" path="/weibo/super_index/:id/:routeParams?" :paramsDesc="['超话ID', '额外参数；请参阅上面的说明和表格']" anticrawler="1" radar="1" rssbud="1"/>

### 个人时间线

::: warning 注意

个人时间线暂不支持改善可读性。

:::

<Route author="zytomorrow DIYgod" example="/weibo/timeline/3306934123" path="/weibo/timeline/:uid/:feature?" :paramsDesc="['用户的uid', '	过滤类型ID，0：全部、1：原创、2：图片、3：视频、4：音乐，默认为0。']" anticrawler="1" selfhost="1">

::: warning 注意

需要对应用户打开页面进行授权生成 token 才能生成内容

自部署需要申请并配置微博 key，具体见部署文档

:::

</Route>

## 微博绿洲

### 用户

<Route author="kt286" example="/weibo/oasis/user/1990895721" path="/weibo/oasis/user/:userid" :paramsDesc="['用户 id, 可在用户主页 URL 中找到']" anticrawler="1"/>

### 热帖

<Route author="hillerliao" example="/xueqiu/hots" path="/xueqiu/hots"/>

## 悟空问答

### 用户动态

<Route author="nczitzk" example="/wukong/user/5826687196" path="/wukong/user/:id/:type?" :paramsDesc="['用户ID，可在用户页 URL 中找到', '类型，可选 `dongtai` 即 动态，`answers` 即 回答，`questions` 即 提问，默认为 `dongtai`']">

::: tip 注意

用户的动态是一定时间范围内用户提出的问题和作出的回答，距离现在时间较久的问题和回答不会出现，此时选择 `dongtai` 用户动态是会缺失的。

同理选择 `answers` 和 `questions` 作为参数时，对于没有提出过问题和作出过回答的用户，其内容也会相应缺失。

:::

</Route>

## 小红书

### 用户笔记和专辑

<Route author="lotosbin" example="/xiaohongshu/user/593032945e87e77791e03696/notes" path="/xiaohongshu/user/:user_id/notes" :paramsDesc="['user_id']"/>

### 用户专辑

<Route author="lotosbin" example="/xiaohongshu/user/593032945e87e77791e03696/album" path="/xiaohongshu/user/:user_id/album" :paramsDesc="['user_id']"/>

### 专辑

<Route author="lotosbin" example="/xiaohongshu/board/5db6f79200000000020032df" path="/xiaohongshu/board/:board_id" :paramsDesc="['board_id']" />

## 新榜

::: warning 注意
部署时需要配置 NEWRANK_COOKIE，具体见部署文档
请勿过高频抓取，新榜疑似对每天调用 token 总次数进行了限制，超限会报错
:::

### 微信公众号

<Route author="lessmoe" example="/newrank/wechat/chijiread" path="/newrank/wechat/:wxid" :paramsDesc="['微信号，若微信号与新榜信息不一致，以新榜为准']" anticrawler="1"/>

### 抖音短视频

<Route author="lessmoe" example="/newrank/douyin/110266463747" path="/newrank/douyin/:dyid" :paramsDesc="['抖音ID，可在新榜账号详情 URL 中找到']" anticrawler="1"/>

::: warning 注意
免费版账户抖音每天查询次数 20 次，如需增加次数可购买新榜会员或等待未来多账户支持
:::

## 知乎

### 收藏夹

<Route author="huruji Colin-XKL" example="/zhihu/collection/26444956" path="/zhihu/collection/:id" :paramsDesc="['收藏夹 id, 可在收藏夹页面 URL 中找到']" anticrawler="1" radar="1" rssbud="1"/>

### 用户动态

<Route author="DIYgod" example="/zhihu/people/activities/diygod" path="/zhihu/people/activities/:id" :paramsDesc="['作者 id, 可在用户主页 URL 中找到']" anticrawler="1" radar="1" rssbud="1"/>

### 用户回答

<Route author="DIYgod prnake" example="/zhihu/people/answers/diygod" path="/zhihu/people/answers/:id" :paramsDesc="['作者 id, 可在用户主页 URL 中找到']" anticrawler="1" radar="1" rssbud="1"/>

### 用户文章

<Route author="whtsky Colin-XKL" example="/zhihu/posts/people/frederchen" path="/zhihu/posts/:usertype/:id" :paramsDesc="['作者 id, 可在用户主页 URL 中找到', '用户类型usertype，参考用户主页的URL。目前有两种，见下表']" anticrawler="1" radar="1" rssbud="1"/>

| 普通用户 | 机构用户 |
| -------- | -------- |
| people   | org      |

### 专栏

<Route author="DIYgod" example="/zhihu/zhuanlan/googledevelopers" path="/zhihu/zhuanlan/:id" :paramsDesc="['专栏 id, 可在专栏主页 URL 中找到']" anticrawler="1" radar="1" rssbud="1"/>

### 知乎日报

<Route author="DHPO" example="/zhihu/daily" path="/zhihu/daily" anticrawler="1" radar="1" rssbud="1"/>

### 知乎日报 - 合集

<Route author="ccbikai" example="/zhihu/daily/section/2" path="/zhihu/daily/section/:sectionId" :paramsDesc="['合集 id, 可在 https://news-at.zhihu.com/api/7/sections 找到']" anticrawler="1"/>

### 知乎热榜

<Route author="DIYgod" example="/zhihu/hotlist" path="/zhihu/hotlist" anticrawler="1" radar="1" rssbud="1"/>

### 知乎分类热榜

<Route author="nczitzk" example="/zhihu/hot" path="/zhihu/hot/:category?" :paramsDesc="['分类，见下表，默认为全站']" anticrawler="1" radar="1" rssbud="1">

| 全站  | 国际  | 科学    | 汽车 | 视频   | 时尚    | 时事  | 数码    | 体育  | 校园   | 影视 |
| ----- | ----- | ------- | ---- | ------ | ------- | ----- | ------- | ----- | ------ | ---- |
| total | focus | science | car  | zvideo | fashion | depth | digital | sport | school | film |

</Route>

### 知乎想法热榜

<Route author="xyqfer" example="/zhihu/pin/hotlist" path="/zhihu/pin/hotlist" anticrawler="1" radar="1" rssbud="1"/>

### 问题

<Route author="xyqfer" example="/zhihu/question/59895982" path="/zhihu/question/:questionId" :paramsDesc="['问题 id']" anticrawler="1" radar="1" rssbud="1"/>

### 话题

<Route author="xyqfer" example="/zhihu/topic/19828946" path="/zhihu/topic/:topicId" :paramsDesc="['话题 id']" anticrawler="1" radar="1" rssbud="1"/>

### 用户想法

<Route author="xyqfer" example="/zhihu/people/pins/kan-dan-45" path="/zhihu/people/pins/:id" :paramsDesc="['作者 id, 可在用户主页 URL 中找到']" anticrawler="1" radar="1" rssbud="1"/>

### 知乎书店 - 新书

<Route author="xyqfer" example="/zhihu/bookstore/newest" path="/zhihu/bookstore/newest" anticrawler="1" radar="1" rssbud="1"/>

### 知乎想法 - 24 小时新闻汇总

<Route author="xyqfer" example="/zhihu/pin/daily" path="/zhihu/pin/daily" anticrawler="1" radar="1" rssbud="1"/>

### 知乎书店 - 知乎周刊

<Route author="LogicJake" example="/zhihu/weekly" path="/zhihu/weekly" anticrawler="1" radar="1" rssbud="1"/>

### 用户关注时间线

<Route author="SeanChao" example="/zhihu/timeline" path="/zhihu/timeline" anticrawler="1" selfhost="1">
::: warning 注意

用户关注动态需要登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。

:::

</Route>
