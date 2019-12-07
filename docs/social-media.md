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

### 番剧

<Route author="DIYgod" example="/bilibili/bangumi/media/9192" path="/bilibili/bangumi/media/:mediaid" :paramsDesc="['番剧媒体 id, 番剧主页 URL 中获取']"/>

### 用户追番列表

<Route author="wdssmq" example="/bilibili/user/bangumi/208259" path="/bilibili/user/bangumi/:uid" :paramsDesc="['用户 id']"/>

### UP 主投稿

<Route author="DIYgod" example="/bilibili/user/video/2267573" path="/bilibili/user/video/:uid/:disableEmbed?" :paramsDesc="['用户 id, 可在 UP 主主页中找到', '默认为开启内嵌视频, 任意值为关闭']" radar="1"/>

### UP 主专栏

<Route author="lengthmin" example="/bilibili/user/article/334958638" path="/bilibili/user/article/:uid" :paramsDesc="['用户 id, 可在 UP 主主页中找到']"/>

### UP 主动态

<Route author="DIYgod" example="/bilibili/user/dynamic/2267573" path="/bilibili/user/dynamic/:uid/:disableEmbed?" :paramsDesc="['用户 id, 可在 UP 主主页中找到', '默认为开启内嵌视频, 任意值为关闭']" radar="1"/>

### UP 主频道

<Route author="HenryQW" example="/bilibili/user/channel/142821407/49017" path="/bilibili/user/channel/:uid/:cid/:disableEmbed?" :paramsDesc="['用户 id, 可在 UP 主主页中找到', '频道 id, 可在频道的 URL 中找到', '默认为开启内嵌视频, 任意值为关闭']"/>

### UP 主默认收藏夹

<Route author="DIYgod" example="/bilibili/user/fav/2267573" path="/bilibili/user/fav/:uid/:disableEmbed?" :paramsDesc="['用户 id, 可在 UP 主主页中找到', '默认为开启内嵌视频, 任意值为关闭']"/>

### UP 主非默认收藏夹

<Route author="Qixingchen" example="/bilibili/fav/756508/50948568" path="/bilibili/fav/:uid/:fid/:disableEmbed?" :paramsDesc="['用户 id, 可在 UP 主主页中找到', '收藏夹 ID, 可在收藏夹的 URL 中找到, 默认收藏夹建议使用 UP 主默认收藏夹功能', '默认为开启内嵌视频, 任意值为关闭']"/>

### UP 主投币视频

<Route author="DIYgod" example="/bilibili/user/coin/2267573" path="/bilibili/user/coin/:uid/:disableEmbed?" :paramsDesc="['用户 id, 可在 UP 主主页中找到', '默认为开启内嵌视频, 任意值为关闭']"/>

### UP 主粉丝

<Route author="Qixingchen" example="/bilibili/user/followers/2267573" path="/bilibili/user/followers/:uid" :paramsDesc="['用户 id, 可在 UP 主主页中找到']"/>

### UP 主关注用户

<Route author="Qixingchen" example="/bilibili/user/followings/2267573" path="/bilibili/user/followings/:uid" :paramsDesc="['用户 id, 可在 UP 主主页中找到']"/>

### 分区视频

<Route author="DIYgod" example="/bilibili/partion/33" path="/bilibili/partion/:tid/:disableEmbed?" :paramsDesc="['分区 id', '默认为开启内嵌视频, 任意值为关闭']" radar="1">

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

</Route>

### 分区视频排行榜

<Route author="lengthmin" example="/bilibili/partion/ranking/171/3" path="/bilibili/partion/ranking/:tid/:days?/:disableEmbed?" :paramsDesc="['分区 id, 见上方表格', '缺省为 7, 指最近多少天内的热度排序', '默认为开启内嵌视频, 任意值为关闭']"/>

### 视频选集列表

<Route author="sxzz" example="/bilibili/video/page/39732828" path="/bilibili/video/page/:aid/:disableEmbed?" :paramsDesc="['可在视频页 URL 中找到', '默认为开启内嵌视频, 任意值为关闭']"/>

### 视频评论

<Route author="Qixingchen" example="/bilibili/video/reply/21669336" path="/bilibili/video/reply/:aid" :paramsDesc="['可在视频页 URL 中找到']"/>

### 视频弹幕

<Route author="Qixingchen" example="/bilibili/video/danmaku/21669336/1" path="/bilibili/video/danmaku/:aid/:pid?" :paramsDesc="['视频AV号,可在视频页 URL 中找到','分P号,不填默认为1']"/>

### link 公告

<Route author="Qixingchen" example="/bilibili/link/news/live" path="/bilibili/link/news/:product" :paramsDesc="['公告分类, 包括 直播:live 小视频:vc 相簿:wh']"/>

### 视频搜索

<Route author="Symty" example="/bilibili/vsearch/藤原千花" path="/bilibili/vsearch/:kw/:order?/:disableEmbed?" :paramsDesc="['检索关键字', '排序方式, 综合:totalrank 最多点击:click 最新发布:pubdate(缺省) 最多弹幕:dm 最多收藏:stow', '默认为开启内嵌视频, 任意值为关闭']"/>

### 用户关注视频动态

<Route author="LogicJake" example="/bilibili/followings/video/2267573" path="/bilibili/followings/video/:uid/:disableEmbed?" :paramsDesc="['用户 id', '默认为开启内嵌视频, 任意值为关闭']">
::: warning 注意

用户动态需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。

:::
</Route>

### 用户关注专栏

<Route author="woshiluo" example="/bilibili/followings/article/99800931" path="/bilibili/followings/article/:uid" :paramsdesc="['用户 id']">
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

<Route author="DIYgod" example="/bilibili/mall/new" path="/bilibili/mall/new" />

### 会员购作品

<Route author="DIYgod" example="/bilibili/mall/ip/1_5883" path="/bilibili/mall/ip/:id" :paramsDesc="['作品 id, 可在作品列表页 URL 中找到']"/>

### 排行榜

<Route author="DIYgod" example="/bilibili/ranking/0/3/1" path="/bilibili/ranking/:tid/:days?/:arc_type?/:disableEmbed?" :paramsDesc="['排行榜分区 id, 默认 0', '时间跨度, 可为 1 3 7 30', '投稿时间, 可为 0(全部投稿) 1(近期投稿) , 默认 1', '默认为开启内嵌视频, 任意值为关闭']">

| 全站 | 动画 | 国创相关 | 音乐 | 舞蹈 | 游戏 | 科技 | 生活 | 鬼畜 | 时尚 | 娱乐 | 影视 |
| ---- | ---- | -------- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 0    | 1    | 168      | 3    | 129  | 4    | 36   | 160  | 119  | 155  | 5    | 181  |

</Route>

### 话题(频道/标签)

<Route author="Qixingchen" example="/bilibili/topic/2233" path="/bilibili/topic/2233" :paramsDesc="['话题名(又称频道名或标签) 例如 2233 或 COSPLAY']"/>

### 歌单

<Route author="LogicJake" example="/bilibili/audio/10624" path="/bilibili/audio/10624" :paramsDesc="['歌单 id, 可在歌单页 URL 中找到']"/>

### 专栏文集

<Route author="hoilc" example="/bilibili/readlist/25611" path="/bilibili/readlist/:listid" :paramsDesc="['文集 id, 可在专栏文集 URL 中找到']"/>

## Disqus

### 评论

<Route author="DIYgod" example="/disqus/posts/diygod-me" path="/disqus/posts/:forum" :paramsDesc="['网站的 disqus name']"/>

## Facebook

### 粉絲專頁

<Route author="maple3142" example="/facebook/page/SonetPCR" path="/facebook/page/:id" :paramsDesc="['專頁 id']" anticrawler="1"/>

## Instagram

### 用户

<Route author="DIYgod" example="/instagram/user/diygod" path="/instagram/user/:id" :paramsDesc="['用户 id']" anticrawler="1"/>

### 标签

<Route author="widyakumara" path="/instagram/tag/:tag" example="/instagram/tag/urbantoys" :paramsDesc="['标签名']" anticrawler="1"/>

### 快拍 Stories

<Route author="Maecenas" path="/instagram/story/:username" example="/instagram/story/instagram" :paramsDesc="['用户名']"/>

## Keep

### 运动日记

<Route author="Dectinc DIYgod" example="/keep/user/556b02c1ab59390afea671ea" path="/keep/user/:id" :paramsDesc="['Keep 用户 id']"/>

## Lofter

::: tip 提示

官方提供了用户主页 RSS: http://**:username**.lofter.com/rss

:::

### 话题(标签)

<Route author="hoilc" example="/lofter/tag/名侦探柯南/date" path="/lofter/tag/:name/:type?" :paramsDesc="['话题名(标签名) 例如 `名侦探柯南`', '排行类型, 默认显示最新话题, 取值如下']"/>

| new  | date | week | month | total |
| ---- | ---- | ---- | ----- | ----- |
| 最新 | 日榜 | 周榜 | 月榜  | 总榜  |

## Mastodon

### 实例公共时间线

<Route author="hoilc" example="/mastodon/timeline/pawoo.net/true" path="/mastodon/timeline/:site/:only_media?" :paramsDesc="['实例地址, 仅域名, 不包括`http://`或`https://`协议头', '是否只显示包含媒体（图片或视频）的推文, 默认置空为否, 任意值为是']"/>

## pixiv

### 用户收藏

<Route author="EYHN" example="/pixiv/user/bookmarks/15288095" path="/pixiv/user/bookmarks/:id" :paramsDesc="['用户 id, 可在用户主页 URL 中找到']" radar="1"/>

### 用户动态

<Route author="DIYgod" example="/pixiv/user/11" path="/pixiv/user/:id" :paramsDesc="['用户 id, 可在用户主页 URL 中找到']" radar="1"/>

### 排行榜

<Route author="EYHN" example="/pixiv/ranking/week" path="/pixiv/ranking/:mode/:date?" :paramsDesc="['排行榜类型' ,'日期, 取值形如 `2018-4-25`']" radar="1">

| pixiv 日排行 | pixiv 周排行 | pixiv 月排行 | pixiv 受男性欢迎排行 | pixiv 受女性欢迎排行 | pixiv 原创作品排行 | pixiv 新人排行 |
| ------------ | ------------ | ------------ | -------------------- | -------------------- | ------------------ | -------------- |
| day          | week         | month        | day_male             | day_female           | week_original      | week_rookie    |

| pixiv R-18 日排行 | pixiv R-18 受男性欢迎排行 | pixiv R-18 受女性欢迎排行 | pixiv R-18 周排行 | pixiv R-18G 排行 |
| ----------------- | ------------------------- | ------------------------- | ----------------- | ---------------- |
| day_r18           | day_male_r18              | day_female_r18            | week_r18          | week_r18g        |

</Route>

### 关键词

<Route author="DIYgod" example="/pixiv/search/麻衣/popular/2" path="/pixiv/search/:keyword/:order?/:r18?" :paramsDesc="['关键词', '排序方式，popular 按热门度排序，空或其他任意值按时间排序', '过滤 R18 内容，0 为不过滤，1 为只看非 R18 内容，2 为只看 R18 内容，默认为 0']" radar="1"/>

### 关注的新作品

<Route author="ClarkeCheng" example="/pixiv/user/illustfollows" path="/pixiv/user/illustfollows" radar="1"/>
::: warning 注意

因为每个人关注的画师不同，所以只能自建。请不要将画师设为“悄悄关注”，这样子画师的作品就不会出现在订阅里了。

:::
</Route>

## Soul

### 瞬间更新

<Route author="ImSingee" example="/soul/Y2w2aTNWQVBLOU09" path="/soul:id" :paramsDesc="['用户 id, 分享用户主页时的 URL 的 userIdEcpt 参数']" radar="1"></Route>

## Telegram

### 频道

<Route author="DIYgod" example="/telegram/channel/awesomeDIYgod" path="/telegram/channel/:username" :paramsDesc="['频道 username']"/>

### 贴纸包

<Route author="DIYgod" example="/telegram/stickerpack/DIYgod" path="/telegram/stickerpack/:name" :paramsDesc="['贴纸包 id, 可在分享贴纸获得的 URL 中找到']"/>

### Telegram Blog

<Route author="fengkx" example="/telegram/blog" path="/telegram/blog" />

## Twitter

### 用户时间线

<Route author="DIYgod" example="/twitter/user/DIYgod" path="/twitter/user/:id" :paramsDesc="['用户名']" radar="1"/>

### 用户关注时间线

<Route author="DIYgod" example="/twitter/followings/DIYgod" path="/twitter/followings/:id" :paramsDesc="['用户名']" radar="1">

::: warning 注意

用户关注时间线需要对应用户的 Twitter token， 所以只能自建，详情见部署页面的配置模块。

:::

</Route>

### 列表时间线

<Route author="xyqfer" example="/twitter/list/ladyleet/javascript" path="/twitter/list/:id/:name" :paramsDesc="['用户名', 'list 名称']" radar="1"/>

### 用户喜欢列表

<Route author="xyqfer" example="/twitter/likes/DIYgod" path="/twitter/likes/:id" :paramsDesc="['用户名']" radar="1"/>

### 关键词

<Route author="DIYgod" example="/twitter/keyword/RSSHub" path="/twitter/keyword/:keyword" :paramsDesc="['关键词']" radar="1"/>

## VueVlog

### 用户

<Route author="kt286" example="/vuevideo/971924215514" path="/vuevideo/:userid" :paramsDesc="['用户ID, 可在对应页面的 URL 中找到']"/>

## Youtube

::: tip Tiny Tiny RSS 用户请注意

Tiny Tiny RSS 会给所有 iframe 元素添加 `sandbox="allow-scripts"` 属性，导致无法加载 Youtube 内嵌视频，如果需要使用内嵌视频请为 Tiny Tiny RSS 安装 [remove_iframe_sandbox](https://github.com/DIYgod/ttrss-plugin-remove-iframe-sandbox) 插件

:::

### 用户

<Route author="DIYgod" example="/youtube/user/JFlaMusic/" path="/youtube/user/:username/:disableEmbed?" :paramsDesc="['用户名', '默认为开启内嵌视频, 任意值为关闭']" radar="1"/>

### 频道

<Route author="DIYgod" example="/youtube/channel/UCDwDMPOZfxVV0x_dz0eQ8KQ" path="/youtube/channel/:id/:disableEmbed?" :paramsDesc="['频道 id', '默认为开启内嵌视频, 任意值为关闭']" radar="1"/>

### 播放列表

<Route author="HenryQW" example="/youtube/playlist/PLqQ1RwlxOgeLTJ1f3fNMSwhjVgaWKo_9Z" path="/youtube/playlist/:id/:disableEmbed?" :paramsDesc="['播放列表 id', '默认为开启内嵌视频, 任意值为关闭']" radar="1"/>

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

### 豆瓣小组

<Route author="DIYgod" example="/douban/group/camera" path="/douban/group/:groupid" :paramsDesc="['豆瓣小组的 id']"/>

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

<Route author="xyqfer" example="/douban/book/rank/fiction" path="/douban/book/rank/:type" :paramsDesc="['图书类型']">

| 虚构    | 非虚构     |
| ------- | ---------- |
| fiction | nonfiction |

</Route>

### 豆列

<Route author="LogicJake" example="/douban/doulist/37716774" path="douban/doulist/:id" :paramsDesc="['豆列id']"/>

### 用户广播

<Route author="alfredcai" example="/douban/people/62759792/status" path="douban/people/:userid/status" :paramsDesc="['整数型用户 id']">

::: tip 提示

-   **目前只支持整数型 id**
-   字母型的 id，可以通过头像图片链接来找到其整数型 id，图片命名规则`ul[userid]-*.jpg`
-   例如：用户 id: `MovieL`他的头像图片链接：`https://img1.doubanio.com/icon/ul1128221-98.jpg`他的整数型 id: `1128221`

:::

</Route>

### 话题

<Route author="LogicJake" example="/douban/topic/48823" path="/douban/topic/:id/:sort?" :paramsDesc="['话题id','排序方式，hot或new，默认为new']"/>

## 抖音

### 用户动态

<Route author="DIYgod" example="/douyin/user/93610979153" path="/douyin/user/:id" :paramsDesc="['用户 id, 可在 分享出去获得的用户主页 URL 中找到']"/>

### 喜欢的视频

<Route author="xyqfer" example="/douyin/like/93610979153" path="/douyin/like/:id" :paramsDesc="['用户 id, 可在 分享出去获得的用户主页 URL 中找到']"/>

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

<Route author="xyqfer" example="/dgtle/trade/111" path="/dgtle/trade/:typeId?" :paramsDesc="['分类 id，默认为全部']">

| 全部 | 电脑 | 手机 | 平板 | 相机 | 影音 | 外设 | 生活 | 公告 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 0    | 111  | 109  | 110  | 113  | 114  | 115  | 112  | 116  |

</Route>

### 闲置（关键词）

<Route author="gaoliang" example="/dgtle/trade/search/ipad" path="/dgtle/trade/search/:keyword" :paramsDesc="['搜索关键词']"/>

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

### 博主

<Route author="DIYgod iplusx" example="/weibo/user/1195230310" path="/weibo/user/:uid/:displayVideo?" :paramsDesc="['用户 id, 博主主页打开控制台执行 `$CONFIG.oid` 获取', '是否直接显示微博视频, 缺省 `0` 不显示, 若需要显示则填 `1` ']" anticrawler="1" radar="1"/>

### 关键词

<Route author="DIYgod" example="/weibo/keyword/DIYgod" path="/weibo/keyword/:keyword" :paramsDesc="['你想订阅的微博关键词']" anticrawler="1" radar="1"/>

### 热搜榜

<Route author="xyqfer" example="/weibo/search/hot" path="/weibo/search/hot" anticrawler="1" radar="1"/>

### 超话

<Route author="zengxs" example="/weibo/super_index/1008084989d223732bf6f02f75ea30efad58a9" path="/weibo/super_index/:id" :paramsDesc="['超话ID']" anticrawler="1" radar="1"/>

### 个人时间线

<Route author="zytomorrow DIYgod" example="/weibo/timeline/3306934123" path="/weibo/timeline/:uid/:feature?" :paramsDesc="['用户的uid', '	过滤类型ID，0：全部、1：原创、2：图片、3：视频、4：音乐，默认为0。']">

::: warning 注意

需要对应用户打开页面进行授权生成 token 才能生成内容

自部署需要申请并配置微博 key，具体见部署文档

:::

</Route>

## 微博绿洲

### 用户

<Route author="kt286" example="/weibo/oasis/user/1990895721" path="/weibo/oasis/user/:userid" :paramsDesc="['用户 id, 可在用户主页 URL 中找到']" anticrawler="1"/>

## 雪球

### 用户动态

<Route author="imlonghao" example="/xueqiu/user/8152922548" path="/xueqiu/user/:id/:type?" :paramsDesc="['用户 id, 可在用户主页 URL 中找到', '动态的类型, 不填则默认全部']">

| 原发布 | 长文 | 问答 | 热门 | 交易 |
| ------ | ---- | ---- | ---- | ---- |
| 0      | 2    | 4    | 9    | 11   |

</Route>

### 用户收藏动态

<Route author="imlonghao" example="/xueqiu/favorite/8152922548" path="/xueqiu/favorite/:id" :paramsDesc="['用户 id, 可在用户主页 URL 中找到']"/>

### 用户自选动态

<Route author="hillerliao" example="/xueqiu/user_stock/1247347556" path="/xueqiu/user_stock/:id" :paramsDesc="['用户 id, 可在用户主页 URL 中找到']"/>

### 基金净值更新

<Route author="HenryQW" example="/xueqiu/fund/040008" path="/xueqiu/fund/:id" :paramsDesc="['基金代码, 可在基金主页 URL 中找到. 此路由的数据为场外基金 (`F`开头)']"/>

### 组合最新调仓信息

<Route author="ZhishanZhang" example="/xueqiu/p/ZH1288184" path="/xueqiu/snb/:id" :paramsDesc="['组合代码, 可在组合主页 URL 中找到.']"/>

### 股票信息

<Route author="YuYang" example="/xueqiu/stock_info/SZ000002" path="/xueqiu/stock_info/:id/:type?" :paramsDesc="['股票代码（需要带上交易所）', '动态的类型, 不填则为股票公告']">

| 公告         | 新闻 | 研报     |
| ------------ | ---- | -------- |
| announcement | news | research |

</Route>

### 热帖

<Route author="hillerliao" example="/xueqiu/hots" path="/xueqiu/hots"/>

## 知乎

### 收藏夹

<Route author="huruji" example="/zhihu/collection/26444956" path="/zhihu/collection/:id" :paramsDesc="['收藏夹 id, 可在收藏夹页面 URL 中找到']" anticrawler="1" radar="1"/>

### 用户动态

<Route author="DIYgod" example="/zhihu/people/activities/diygod" path="/zhihu/people/activities/:id" :paramsDesc="['作者 id, 可在用户主页 URL 中找到']" anticrawler="1" radar="1"/>

### 用户回答

<Route author="DIYgod" example="/zhihu/people/answers/diygod" path="/zhihu/people/answers/:id" :paramsDesc="['作者 id, 可在用户主页 URL 中找到']" anticrawler="1" radar="1"/>

### 用户文章

<Route author="whtsky" example="/zhihu/people/posts/dcjanus" path="/zhihu/people/posts/:id" :paramsDesc="['作者 id, 可在用户主页 URL 中找到']" anticrawler="1" radar="1"/>

### 专栏

<Route author="DIYgod" example="/zhihu/zhuanlan/googledevelopers" path="/zhihu/zhuanlan/:id" :paramsDesc="['专栏 id, 可在专栏主页 URL 中找到']" anticrawler="1" radar="1"/>

### 知乎日报

<Route author="DHPO" example="/zhihu/daily" path="/zhihu/daily" anticrawler="1" radar="1"/>

### 知乎日报 - 合集

<Route author="ccbikai" example="/zhihu/daily/section/2" path="/zhihu/daily/section/:sectionId" :paramsDesc="['合集 id, 可在 https://news-at.zhihu.com/api/7/sections 找到']" anticrawler="1"/>

### 知乎热榜

<Route author="DIYgod" example="/zhihu/hotlist" path="/zhihu/hotlist" anticrawler="1" radar="1"/>

### 知乎想法热榜

<Route author="xyqfer" example="/zhihu/pin/hotlist" path="/zhihu/pin/hotlist" anticrawler="1" radar="1"/>

### 问题

<Route author="xyqfer" example="/zhihu/question/59895982" path="/zhihu/question/:questionId" :paramsDesc="['问题 id']" anticrawler="1" radar="1"/>

### 话题

<Route author="xyqfer" example="/zhihu/topic/19828946" path="/zhihu/topic/:topicId" :paramsDesc="['话题 id']" anticrawler="1" radar="1"/>

### 用户想法

<Route author="xyqfer" example="/zhihu/people/pins/kan-dan-45" path="/zhihu/people/pins/:id" :paramsDesc="['作者 id, 可在用户主页 URL 中找到']" anticrawler="1" radar="1"/>

### 知乎书店-新书

<Route author="xyqfer" example="/zhihu/bookstore/newest" path="/zhihu/bookstore/newest" anticrawler="1" radar="1"/>

### 知乎想法-24 小时新闻汇总

<Route author="xyqfer" example="/zhihu/pin/daily" path="/zhihu/pin/daily" anticrawler="1" radar="1"/>

### 知乎书店-知乎周刊

<Route author="LogicJake" example="/zhihu/weekly" path="/zhihu/weekly" anticrawler="1" radar="1"/>
