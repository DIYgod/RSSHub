---
pageClass: routes
---

# 社交媒体

## bilibili

### 番剧

<Route author="DIYgod" example="/bilibili/bangumi/media/9192" path="/bilibili/bangumi/media/:mediaid" :paramsDesc="['番剧媒体 id, 番剧主页 URL 中获取']"/>

### UP 主投稿

<Route author="DIYgod" example="/bilibili/user/video/2267573" path="/bilibili/user/video/:uid" :paramsDesc="['用户 id, 可在 UP 主主页中找到']"/>

### UP 主专栏

<Route author="lengthmin" example="/bilibili/user/article/334958638" path="/bilibili/user/article/:uid" :paramsDesc="['用户 id, 可在 UP 主主页中找到']"/>

### UP 主动态

<Route author="DIYgod" example="/bilibili/user/dynamic/2267573" path="/bilibili/user/dynamic/:uid" :paramsDesc="['用户 id, 可在 UP 主主页中找到']"/>

### UP 主频道

<Route author="HenryQW" example="/bilibili/user/channel/142821407/49017" path="/bilibili/user/channel/:uid/:cid" :paramsDesc="['用户 id, 可在 UP 主主页中找到', '频道 id, 可在频道的 URL 中找到']"/>

### UP 主默认收藏夹

<Route author="DIYgod" example="/bilibili/user/fav/2267573" path="/bilibili/user/fav/:uid" :paramsDesc="['用户 id, 可在 UP 主主页中找到']"/>

### UP 主非默认收藏夹

<Route author="Qixingchen" example="/bilibili/fav/756508/50948568" path="/bilibili/fav/:uid/:fid" :paramsDesc="['用户 id, 可在 UP 主主页中找到', '收藏夹 ID, 可在收藏夹的 URL 中找到, 默认收藏夹建议使用 UP 主默认收藏夹功能']"/>

### UP 主投币视频

<Route author="DIYgod" example="/bilibili/user/coin/2267573" path="/bilibili/user/coin/:uid" :paramsDesc="['用户 id, 可在 UP 主主页中找到']"/>

### UP 主粉丝

<Route author="Qixingchen" example="/bilibili/user/followers/2267573" path="/bilibili/user/followers/:uid" :paramsDesc="['用户 id, 可在 UP 主主页中找到']"/>

### UP 主关注用户

<Route author="Qixingchen" example="/bilibili/user/followings/2267573" path="/bilibili/user/followings/:uid" :paramsDesc="['用户 id, 可在 UP 主主页中找到']"/>

### 分区视频

<Route author="DIYgod" example="/bilibili/partion/33" path="/bilibili/partion/:tid" :paramsDesc="['分区 id']">

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

<Route author="lengthmin" example="/bilibili/partion/ranking/171/3" path="/bilibili/partion/ranking/:tid/:days?" :paramsDesc="['分区 id, 见上方表格', '缺省为 7, 指最近多少天内的热度排序']"/>

### 视频选集列表

<Route author="sxzz" example="/bilibili/video/page/39732828" path="/bilibili/video/page/:aid" :paramsDesc="['可在视频页 URL 中找到']"/>

### 视频评论

<Route author="Qixingchen" example="/bilibili/video/reply/21669336" path="/bilibili/video/reply/:aid" :paramsDesc="['可在视频页 URL 中找到']"/>

### 视频弹幕

<Route author="Qixingchen" example="/bilibili/video/danmaku/21669336/1" path="/bilibili/video/danmaku/:aid/:pid?" :paramsDesc="['视频AV号,可在视频页 URL 中找到','分P号,不填默认为1']"/>

### link 公告

<Route author="Qixingchen" example="/bilibili/link/news/live" path="/bilibili/link/news/:product" :paramsDesc="['公告分类, 包括 直播:live 小视频:vc 相簿:wh']"/>

### 视频搜索

<Route author="Symty" example="/bilibili/vsearch/藤原千花" path="/bilibili/vsearch/:kw/:order?" :paramsDesc="['检索关键字', '排序方式, 综合:totalrank 最多点击:click 最新发布:pubdate(缺省) 最多弹幕:dm 最多收藏:stow']"/>

### 用户关注视频动态

<Route author="LogicJake" example="/bilibili/followings/video/2267573" path="/bilibili/followings/video/:uid" :paramsDesc="['用户 id']">
::: warning 注意

用户动态需要 b 站登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。

:::
</Route>

### 直播开播

见 [#哔哩哔哩直播](/live.html#哔哩哔哩直播)

### 直播搜索

见 [#哔哩哔哩直播](/live.html#哔哩哔哩直播)

### 直播分区

见 [#哔哩哔哩直播](/live.html#哔哩哔哩直播)

### 主站话题列表

<Route author="Qixingchen" example="/bilibili/blackboard" path="/bilibili/blackboard" />

### 会员购新品上架

<Route author="DIYgod" example="/bilibili/mall/new" path="/bilibili/mall/new" />

### 会员购作品

<Route author="DIYgod" example="/bilibili/mall/ip/1_5883" path="/bilibili/mall/ip/:id" :paramsDesc="['作品 id, 可在作品列表页 URL 中找到']"/>

### 排行榜

<Route author="DIYgod" example="/bilibili/ranking/0/3/1" path="/bilibili/ranking/:tid/:days?/:arc_type?" :paramsDesc="['排行榜分区 id, 默认 0', '时间跨度, 可为 1 3 7 30', '投稿时间, 可为 0(全部投稿) 1(近期投稿) , 默认 1']">

| 全站 | 动画 | 国创相关 | 音乐 | 舞蹈 | 游戏 | 科技 | 生活 | 鬼畜 | 时尚 | 娱乐 | 影视 |
| ---- | ---- | -------- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 0    | 1    | 168      | 3    | 129  | 4    | 36   | 160  | 119  | 155  | 5    | 181  |

</Route>

### 话题(频道/标签)

<Route author="Qixingchen" example="/bilibili/topic/2233" path="/bilibili/topic/2233" :paramsDesc="['话题名(又称频道名或标签) 例如 2233 或 COSPLAY']"/>

### 歌单

<Route author="LogicJake" example="/bilibili/audio/10624" path="/bilibili/audio/10624" :paramsDesc="['歌单 id, 可在歌单页 URL 中找到']"/>

## Dcard

### 首頁帖子

<Route author="DIYgod" example="/dcard/posts/popular" path="/dcard/posts/:type?" :paramsDesc="['排序，popular 熱門；latest 最新，默認為 latest']"/>

### 板塊帖子

<Route author="HenryQW" example="/dcard/funny/popular" path="/dcard/:section/:type?" :paramsDesc="['板塊名稱，URL 中獲得', '排序，popular 熱門；latest 最新，默認為 latest']"/>

## Disqus

### 评论

<Route author="DIYgod" example="/disqus/posts/diygod-me" path="/disqus/posts/:forum" :paramsDesc="['网站的 disqus name']"/>

## Dribbble

### 流行

<Route author="DIYgod" example="/dribbble/popular/week" path="/dribbble/popular/:timeframe?" :paramsDesc="['时间维度, 支持 week month year ever']"/>

### 用户（团队

<Route author="DIYgod" example="/dribbble/user/google" path="/dribbble/user/:name" :paramsDesc="['用户名, 可在该用户主页 URL 中找到']"/>

### 关键词

<Route author="DIYgod" example="/dribbble/keyword/player" path="/dribbble/keyword/:keyword" :paramsDesc="['想要订阅的关键词']"/>

## Facebook

### 粉絲專頁

<Route author="maple3142" example="/facebook/page/SonetPCR" path="/facebook/page/:id" :paramsDesc="['專頁 id']"/>

## Instagram

### 用户

<Route author="DIYgod" example="/instagram/user/diygod" path="/instagram/user/:id" :paramsDesc="['用户 id']"/>

### 标签

<Route author="widyakumara" path="/instagram/tag/:tag" example="/instagram/tag/urbantoys" :paramsDesc="['标签名']" />

## Matters

### 最新排序

<Route author="xyqfer Cerebrater" example="/matters/latest" path="/matters/latest" />

### 熱門文章

<Route author="Cerebrater" example="/matters/hot" path="/matters/hot" />

### 标签

<Route author="Cerebrater" example="/matters/tags/VGFnOjk3Mg" path="/matters/tags/:tid" :paramsDesc="['標籤 id，可在標籤所在的 URL 找到']"/>

### 作者

<Route author="Cerebrater" example="/matters/author/az" path="/matters/author/:uid" :paramsDesc="['作者 id，可在作者主頁的 URL 找到']"/>

## NGA

### 分区帖子

<Route author="xyqfer" example="/nga/forum/485" path="/nga/forum/:fid"  :paramsDesc="['分区 id, 可在分区主页 URL 找到']"/>

### 帖子

<Route author="xyqfer" example="/nga/post/15939161" path="/nga/post/:tid"  :paramsDesc="['帖子 id, 可在帖子 URL 找到']"/>

# Saraba1st

### 帖子

<Route author="zengxs" example="/saraba1st/thread/1789863" path="/saraba1st/thread/:tid" :paramsDesc="['帖子 id']">

帖子网址如果为 <https://bbs.saraba1st.com/2b/thread-1789863-1-1.html> 那么帖子 id 就是 `1789863`。

</Route>

## pixiv

### 用户收藏

<Route author="EYHN" example="/pixiv/user/bookmarks/15288095" path="/pixiv/user/bookmarks/:id" :paramsDesc="['用户 id, 可在用户主页 URL 中找到']"/>

### 用户动态

<Route author="DIYgod" example="/pixiv/user/11" path="/pixiv/user/:id" :paramsDesc="['用户 id, 可在用户主页 URL 中找到']"/>

### 排行榜

<Route author="EYHN" example="/pixiv/ranking/week" path="/pixiv/ranking/:mode/:date?" :paramsDesc="['排行榜类型' ,'日期, 取值形如 `2018-4-25`']">

| pixiv 日排行 | pixiv 周排行 | pixiv 月排行 | pixiv 受男性欢迎排行 | pixiv 受女性欢迎排行 | pixiv 原创作品排行 | pixiv 新人排行 |
| ------------ | ------------ | ------------ | -------------------- | -------------------- | ------------------ | -------------- |
| day          | week         | month        | day_male             | day_female           | week_original      | week_rookie    |

| pixiv R-18 日排行 | pixiv R-18 受男性欢迎排行 | pixiv R-18 受女性欢迎排行 | pixiv R-18 周排行 | pixiv R-18G 排行 |
| ----------------- | ------------------------- | ------------------------- | ----------------- | ---------------- |
| day_r18           | day_male_r18              | day_female_r18            | week_r18          | week_r18g        |

</Route>

### 关键词

<Route author="DIYgod" example="/pixiv/search/麻衣/popular" path="/pixiv/search/:keyword/:order?" :paramsDesc="['关键词', '排序方式，popular 按热门度排序，空或其他任意值按时间排序']"/>

## Telegram

### 频道

<Route author="DIYgod" example="/telegram/channel/awesomeDIYgod" path="/telegram/channel/:username" :paramsDesc="['频道 username']"/>

### 贴纸包

<Route author="DIYgod" example="/telegram/stickerpack/DIYgod" path="/telegram/stickerpack/:name" :paramsDesc="['贴纸包 id, 可在分享贴纸获得的 URL 中找到']"/>

## Twitter

### 用户时间线

<Route author="DIYgod" example="/twitter/user/DIYgod" path="/twitter/user/:id" :paramsDesc="['用户 twitter 名']"/>

### 列表时间线

<Route author="xyqfer" example="/twitter/list/ladyleet/javascript" path="/twitter/list/:id/:name" :paramsDesc="['用户 twitter 名', 'list 名称']"/>

### 用户喜欢列表

<Route author="xyqfer" example="/twitter/likes/DIYgod" path="/twitter/likes/:id" :paramsDesc="['用户 twitter 名']"/>

## Youtube

### 用户

<Route author="DIYgod" example="/youtube/user/JFlaMusic/" path="/youtube/user/:username/:embed?" :paramsDesc="['用户名', '默认为开启内嵌视频, 任意值为关闭']"/>

### 频道

<Route author="DIYgod" example="/youtube/channel/UCDwDMPOZfxVV0x_dz0eQ8KQ" path="/youtube/channel/:id/:embed?" :paramsDesc="['频道 id', '默认为开启内嵌视频, 任意值为关闭']"/>

### 播放列表

<Route author="HenryQW" example="/youtube/playlist/PLqQ1RwlxOgeLTJ1f3fNMSwhjVgaWKo_9Z" path="/youtube/playlist/:id/:embed?" :paramsDesc="['播放列表 id', '默认为开启内嵌视频, 任意值为关闭']"/>

## 币乎

### 用户动态

<Route author="LogicJake" example="/bihu/activaties/1478342200" path="/bihu/activaties/:id" :paramsDesc="['用户 id']"/>

## 豆瓣

### 正在上映的电影

<Route author="DIYgod" example="/douban/movie/playing" path="/douban/movie/playing"/>

### 正在上映的高分电影

<Route author="DIYgod" example="/douban/movie/playing/7.5/杭州" path="/douban/movie/playing/:score/:city?" :paramsDesc="['返回大于等于这个分数的电影', '城市的中文名, 可选, 默认北京']"/>

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

## 方格子

### 出版專題

<Route author="Maecenas" example="/vocus/publication/bass" path="/vocus/publication/:id" :paramsDesc="['出版專題 id，可在出版專題主页的 URL 找到']"/>

<Route author="LogicJake" example="/vocus/user/tsetyan" path="/vocus/user/:id" :paramsDesc="['用户 id，可在用户主页的 URL 找到']"/>

## 好奇心日报

### 分类

<Route author="WenhuWee" example="/qdaily/category/5" path="/qdaily/category/:id" :paramsDesc="['分类id，可在分类URL找到']"/>

### 栏目

<Route author="WenhuWee emdoe" example="/qdaily/column/59" path="/qdaily/column/:id" :paramsDesc="['栏目id，可在栏目URL找到']"/>

### 标签

<Route author="SivaGao" example="/qdaily/tag/29" path="/qdaily/tag/:id" :paramsDesc="['标签id，可在tagURL找到']"/>

## 虎扑

### 虎扑 BBS 论坛

<Route author="LogicJake" example="/hupu/bbs/bxj/2" path="/hupu/bbs/:id/:order?" :paramsDesc="['板块id，可在板块 URL 找到', '排序方式，1最新回帖（默认），2最新发帖，3精华帖']"/>

## 即刻

::: warning 注意

即刻圈子较为复杂, 部分圈子可能出现不适配的情况. 如出现上述情况请[提 Issue](https://github.com/DIYgod/RSSHub/issues).

:::

### 圈子-精选

<Route author="DIYgod" example="/jike/topic/54dffb40e4b0f57466e675f0" path="/jike/topic/:id" :paramsDesc="['圈子 id, 可在即刻 web 端圈子页或 APP 分享出来的圈子页 URL 中找到']"/>

::: tip 提示

部分圈子如 `一觉醒来发生了什么: 553870e8e4b0cafb0a1bef68` 提供纯文字内容, <a href="#/jike/topic/text/:id">圈子-纯文字 /jike/topic/text/:id</a> 可能会提供更好的体验.

:::

### 圈子-广场

<Route author="DIYgod" example="/jike/topic/square/54dffb40e4b0f57466e675f0" path="/jike/topic/square/:id" :paramsDesc="['圈子 id, 可在即刻 web 端圈子页或 APP 分享出来的圈子页 URL 中找到']"/>

### 圈子-纯文字

<Route author="HenryQW" example="/jike/topic/text/553870e8e4b0cafb0a1bef68" path="/jike/topic/text/:id" :paramsDesc="['圈子 id, 可在即刻 web 端圈子页或 APP 分享出来的圈子页 URL 中找到']"/>

### 用户动态

<Route author="DIYgod" example="/jike/user/82D23B32-CF36-4C59-AD6F-D05E3552CBF3" path="/jike/user/:id" :paramsDesc="['用户 id, 可在即刻 web 端用户页 URL 中找到']"/>

### 即刻小报

<Route author="Andiedie" example="/jike/daily" path="/jike/daily"/>

## 简书

### 首页

<Route author="DIYgod HenryQW" example="/jianshu/home" path="/jianshu/home"/>

### 热门

<Route author="DIYgod HenryQW" example="/jianshu/trending/weekly" path="/jianshu/trending/:timeframe" :paramsDesc="['按周 `weekly` 或 按月 `monthly`']"/>

### 专题

<Route author="DIYgod HenryQW" example="/jianshu/collection/xYuZYD" path="/jianshu/collection/:id" :paramsDesc="['专题 id, 可在专题页 URL 中找到']"/>

### 作者

<Route author="DIYgod HenryQW" example="/jianshu/user/yZq3ZV" path="/jianshu/user/:id" :paramsDesc="['作者 id, 可在作者主页 URL 中找到']"/>

## 龙腾网

### 转译网贴

<Route author="sgqy" example="/ltaaa" path="/ltaaa/:type?" :paramsDesc="['热门类型.']">

| 最新 | 每周 | 每月  | 全年 |
| ---- | ---- | ----- | ---- |
| (空) | week | month | year |

</Route>

## 美拍

### 用户动态

<Route author="ihewro" example="/meipai/user/56537299" path="/meipai/user/:id" :paramsDesc="['用户 id, 可在 分享出去获得的用户主页 URL 中找到']"/>

## 贴吧

### 帖子列表

<Route author="u3u" example="/tieba/forum/女图" path="/tieba/forum/:kw" :paramsDesc="['吧名']"/>

### 精品帖子

<Route author="u3u" example="/tieba/forum/good/女图" path="/tieba/forum/good/:kw/:cid?" :paramsDesc="['吧名', '精品分类, 如果不传 `cid` 则获取全部分类']"/>

### 帖子动态

<Route author="u3u" example="/tieba/post/5853240586" path="/tieba/post/:id" :paramsDesc="['帖子 ID']"/>

### 楼主动态

<Route author="u3u" example="/tieba/post/lz/5853240586" path="/tieba/post/lz/:id" :paramsDesc="['帖子 ID']"/>

## 微博

### 博主（方案 1）

<Route author="DIYgod" example="/weibo/user/1195230310" path="/weibo/user/:uid" :paramsDesc="['用户 id, 博主主页打开控制台执行 `$CONFIG.oid` 获取']" crawlerBadge="1"/>

::: warning 注意

上述方案 1 获取 V+ 付费博主会有数据缺失, 所以这里提供方案 2 , 这种方式的缺点是描述不如上面的完善, 建议优先选择第一种方案

:::

### 博主（方案 2）

<Route author="DIYgod" example="/weibo/user2/1195230310" path="/weibo/user2/:uid" :paramsDesc="['用户 id, 博主主页打开控制台执行 `$CONFIG.oid` 获取']"/>

### 关键词

<Route author="DIYgod" example="/weibo/keyword/DIYgod" path="/weibo/keyword/:keyword" :paramsDesc="['你想订阅的微博关键词']" crawlerBadge="1"/>

### 热搜榜

<Route author="xyqfer" example="/weibo/search/hot" path="/weibo/search/hot" crawlerBadge="1"/>

### 超话

<Route author="zengxs" example="/weibo/super_index/1008084989d223732bf6f02f75ea30efad58a9" path="/weibo/super_index/:id" :paramsDesc="['超话ID']" crawlerBadge="1"/>

## 微信

::: tip 提示

公众号直接抓取困难, 故目前提供即刻和瓦斯两种间接抓取方案, 请自行选择

:::

### 公众号（即刻来源）

<Route author="DIYgod" example="/jike/topic/584b8ac671a288001154a115" path="/jike/topic/:id" :paramsDesc="['参考 [即刻-圈子-精选](#/jike/topic/:id)']"/>

### 公众号（瓦斯来源）

<Route author="DIYgod" example="/wechat/wasi/5b575db858e5c4583338db11" path="/wechat/wasi/:id" :paramsDesc="['瓦斯公众号 id, 可在[瓦斯](https://w.qnmlgb.tech/wx)搜索公众号, 打开公众号页, 在 URL 中找到 id']"/>

### 公众号（ wemp.app 来源）

<Route author="HenryQW" example="/wechat/wemp/36836fbe-bdec-4758-8967-7cc82722952d" path="/wechat/wemp/:id" :paramsDesc="['wemp 公众号 id, 可在搜索引擎使用 `site:wemp.app` 搜索公众号（例如: 人民日报 site:wemp.app), 打开公众号页, 在 URL 中找到 id']"/>

### 公众号（传送门来源）

<Route author="HenryQW" example="/wechat/csm/huxiu_com" path="/wechat/csm/:id" :paramsDesc="['公众号 id, 打开公众号页, 在 URL 中找到 id']"/>

### 公众号（Telegrame 频道来源）

<Route author="LogicJake" example="/wechat/tgchannel/lifeweek" path="/wechat/tgchannel/:id" :paramsDesc="['公众号绑定频道 id']">

::: warning 注意

该方法需要通过 efb 进行频道绑定，具体操作见[https://github.com/DIYgod/RSSHub/issues/2172](https://github.com/DIYgod/RSSHub/issues/2172)
:::
</Route>

### 公众平台系统公告栏目

<Route author="xyqfer" example="/wechat/announce" path="/wechat/announce" />

### 小程序插件

<Route author="xyqfer" example="/wechat/miniprogram/plugins" path="/wechat/miniprogram/plugins" />

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

### 股票信息

<Route author="YuYang" example="/xueqiu/stock_info/SZ000002" path="/xueqiu/stock_info/:id/:type?" :paramsDesc="['股票代码（需要带上交易所）', '动态的类型, 不填则为股票公告']">

| 公告         | 新闻 | 研报     |
| ------------ | ---- | -------- |
| announcement | news | research |

</Route>

## 一亩三分地

### 主题帖

<Route author="Maecenas" example="/1point3acres/user/1/threads" path="/1point3acres/user/:id/threads" :paramsDesc="['用户 id，可在 Instant 版网站的个人主页 URL 找到']"/>

### 回帖

<Route author="Maecenas" example="/1point3acres/user/1/posts" path="/1point3acres/user/:id/posts" :paramsDesc="['用户 id，可在 Instant 版网站的个人主页 URL 找到']"/>

## 知乎

### 收藏夹

<Route author="huruji" example="/zhihu/collection/26444956" path="/zhihu/collection/:id" :paramsDesc="['收藏夹 id, 可在收藏夹页面 URL 中找到']" crawlerBadge="1"/>

### 用户动态

<Route author="DIYgod" example="/zhihu/people/activities/diygod" path="/zhihu/people/activities/:id" :paramsDesc="['作者 id, 可在用户主页 URL 中找到']" crawlerBadge="1"/>

### 用户回答

<Route author="DIYgod" example="/zhihu/people/answers/diygod" path="/zhihu/people/answers/:id" :paramsDesc="['作者 id, 可在用户主页 URL 中找到']" crawlerBadge="1"/>

### 专栏

<Route author="DIYgod" example="/zhihu/zhuanlan/googledevelopers" path="/zhihu/zhuanlan/:id" :paramsDesc="['专栏 id, 可在专栏主页 URL 中找到']" crawlerBadge="1"/>

### 知乎日报

<Route author="DHPO" example="/zhihu/daily" path="/zhihu/daily" crawlerBadge="1"/>

### 知乎热榜

<Route author="DIYgod" example="/zhihu/hotlist" path="/zhihu/hotlist" crawlerBadge="1"/>

### 知乎想法热榜

<Route author="xyqfer" example="/zhihu/pin/hotlist" path="/zhihu/pin/hotlist" crawlerBadge="1"/>

### 问题

<Route author="xyqfer" example="/zhihu/question/59895982" path="/zhihu/question/:questionId" :paramsDesc="['问题 id']" crawlerBadge="1"/>

### 话题

<Route author="xyqfer" example="/zhihu/topic/19828946" path="/zhihu/topic/:topicId" :paramsDesc="['话题 id']" crawlerBadge="1"/>

### 用户想法

<Route author="xyqfer" example="/zhihu/people/pins/kan-dan-45" path="/zhihu/people/pins/:id" :paramsDesc="['作者 id, 可在用户主页 URL 中找到']" crawlerBadge="1"/>

### 知乎书店-新书

<Route author="xyqfer" example="/zhihu/bookstore/newest" path="/zhihu/bookstore/newest" crawlerBadge="1"/>

### 知乎想法-24 小时新闻汇总

<Route author="xyqfer" example="/zhihu/pin/daily" path="/zhihu/pin/daily" crawlerBadge="1"/>

### 知乎书店-知乎周刊

<Route author="LogicJake" example="/zhihu/weekly" path="/zhihu/weekly" crawlerBadge="1"/>
