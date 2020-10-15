---
pageClass: routes
---

# 音视频

## 2048 核基地

### 论坛更新

<Route author="hoilc" example="/2048/bbs/16" path="/2048/bbs/:fid" :paramsDesc="['板块 ID, 可在 URL 中找到, 例如, `thread.php?fid-16.html`中, 板块 ID 为`16`']" supportBT="1" />

## 60-Second Science - Scientific American

### Transcript

<Route author="emdoe" example="/60s-science/transcript" path="/60s-science/transcript"/>

## 99% Invisible

### Transcript

<Route author="Ji4n1ng" example="/99percentinvisible/transcript" path="/99percentinvisible/transcript"/>

## AcFun

见 [#AcFun](/anime.html#acfun)

## AGE 动漫

见 [#AGE 动漫](/anime.html#age-dong-man)

## Avgle

### 视频列表

<Route author="I2IMk" example="/avgle/videos" path="/avgle/videos/:order?/:time?/:top?" :paramsDesc="['视频次序, `bw` 观看中 / `mr` 最新 / `mv` 最多观看 / `tr` 最高评分 / `tf` 最多收藏 / `lg` 最长, 默认 `mv`', '视频的添加时间, `a` 所有 / `t` 今天 / `d` 本周 / `m` 本月, 默认 `m`', '按次序获取的视频数, 不大于 `250`, 默认 `30`']"/>

### 视频搜索

<Route author="I2IMk" example="/avgle/search/橋本ありな" path="/avgle/search/:keyword/:order?/:time?/:top?" :paramsDesc="['搜索的关键词', '视频次序, `bw` 观看中 / `mr` 最新 / `mv` 最多观看 / `tr` 最高评分 / `tf` 最多收藏 / `lg` 最长, 默认 `mr`', '视频的添加时间, `a` 所有 / `t` 今天 / `d` 本周 / `m` 本月, 默认 `a`', '按次序获取的视频数, 不大于 `250`, 默认 `30`']"/>

## bilibili

见 [#bilibili](/social-media.html#bilibili)

## BT 之家

### 最新种子

<Route author="zhang-wangz" example="/btzj/base" path="/btzj/:type?" anticrawler="1" :paramsDesc="['type,见下表']">

| base                       | govern                   |
| -------------------------- | ------------------------ |
| <https://www.88btbtt.com/> | <http://www.2btjia.com/> |

</Route>

::: tip 提示

由于 BT 之家域名有多个。此 feed 对应[`https://www.88btbtt.com`](https://www.88btbtt.com)域名和[`http://www.2btjia.com/`](http://www.2btjia.com/)域名.
可空，默认为 base

:::

## EZTV

::: tip 提示

网站提供了全部种子的 RSS: <https://eztv.io/ezrss.xml>

:::

### Lookup Torrents by IMDB ID

<Route author="Songkeys" example="/eztv/torrents/6048596" path="/eztv/torrents/:imdb_id" :paramsDesc="['想搜寻的 show 的种子所对应的 IMDB ID, 可在 [IMDB](https://www.imdb.com) 官网找到']" supportBT="1"/>

## Hentaimama

### 近期更新

<Route author="everyonus" example="/hentaimama/videos" path="/hentaimama/videos" />

## JavBus

### 首页

<Route author="MegrezZhu CoderTonyChan" example="/javbus/home" path="/javbus/home"/>

### 分类

<Route author="MegrezZhu CoderTonyChan" example="/javbus/genre/7g" path="/javbus/genre/:gid" :paramsDesc="['分类id，详见[网站里](https://www.javbus.com/genre)的链接']" />

### 演员

<Route author="MegrezZhu CoderTonyChan" example="/javbus/star/2jv" path="/javbus/star/:sid" :paramsDesc="['演员id，详见[网站里](https://www.javbus.com/actresses)的链接']" />

### 系列

<Route author="MegrezZhu CoderTonyChan Felix2yu" example="/javbus/series/44q" path="/javbus/series/:seriesid" :paramsDesc="['系列id，详见作品中系列的链接']" />

### 首页 / 步兵

<Route author="MegrezZhu CoderTonyChan" example="/javbus/uncensored/home" path="/javbus/uncensored/home"/>

### 分类 / 步兵

<Route author="MegrezZhu CoderTonyChan" example="/javbus/uncensored/genre/1bc" path="/javbus/uncensored/genre/:gid" :paramsDesc="['分类id，详见[网站里](https://www.javbus.com/uncensored/genre)的链接']" />

### 演员 / 步兵

<Route author="MegrezZhu CoderTonyChan" example="/javbus/uncensored/star/b5b" path="/javbus/uncensored/star/:sid" :paramsDesc="['演员id，详见[网站里](https://www.javbus.com/uncensored/actresses)的链接']" />

### 系列 / 步兵

<Route author="MegrezZhu CoderTonyChan Felix2yu" example="/javbus/uncensored/series/1ft" path="/javbus/uncensored/series/:seriesid" :paramsDesc="['系列id，详见作品中系列的链接']" />

### 首页 / 欧陆风云

<Route author="MegrezZhu CoderTonyChan" example="/javbus/western/home" path="/javbus/western/home"/>

### 分类 / 欧陆风云

<Route author="MegrezZhu CoderTonyChan" example="/javbus/western/genre/86" path="/javbus/western/genre/:gid" :paramsDesc="['分类id，详见[网站里](https://www.javbus.work/genre)的链接']" />

### 演员 / 欧陆风云

<Route author="MegrezZhu CoderTonyChan" example="/javbus/western/star/4hv" path="/javbus/western/star/:sid" :paramsDesc="['演员id，详见[网站里](https://www.javbus.work/actresses)的链接']" />

### 系列 / 欧陆风云

<Route author="MegrezZhu CoderTonyChan Felix2yu" example="/javbus/western/series/20" path="/javbus/western/series/:seriesid" :paramsDesc="['系列id，详见作品中系列的链接']" />

## JavDB

### 主页

<Route author="nczitzk" example="/javdb/home" path="/javdb/home/:caty?/:sort?/:filter?" :paramsDesc="['分类，见下表，默认为 `有碼`', '排序，见下表，默认为 `磁鏈更新排序`', '过滤，见下表，默认为 `可下载`']">

分类

| 有碼     | 無碼       | 歐美    | FC2 |
| -------- | ---------- | ------- | --- |
| censored | uncensored | western | fc2 |

排序

| 发布日期排序 | 磁鏈更新排序 |
| ------------ | ------------ |
| 1            | 2            |

过滤

| 全部 | 可下载 | 含字幕 | 含短評 |
| ---- | ------ | ------ | ------ |
| 0    | 1      | 2      | 3      |

</Route>

### 分類

<Route author="nczitzk" example="/javdb/tags/c2=5&c10=1" path="/javdb/tags/:query?/:caty?" :paramsDesc="['筛选，默认为 `c10=1`', '分类，见下表，默认为 `有碼`']">

::: tip 提示

在 [分類](https://javdb.com/tags) 中选定分类后，URL 中 `tags?` 后的字段即为筛选参数。

如 <https://javdb.com/tags?c2=5&c10=1> 中 `c2=5&c10=1` 为筛选参数。

:::

分类

| 有碼     | 無碼       | 歐美    | FC2 |
| -------- | ---------- | ------- | --- |
| censored | uncensored | western | fc2 |

</Route>

### 排行榜

<Route author="nczitzk" example="/javdb/rankings" path="/javdb/rankings/:caty?/:time?" :paramsDesc="['分类，见下表，默认为 `有碼`', '时间，见下表，默认为 `日榜`']">

分类

| 有碼     | 無碼       | 歐美    | FC2 |
| -------- | ---------- | ------- | --- |
| censored | uncensored | western | fc2 |

时间

| 日榜  | 週榜   | 月榜    |
| ----- | ------ | ------- |
| daily | weekly | monthly |

</Route>

### 搜索

<Route author="nczitzk" example="/javdb/search/巨乳" path="/javdb/search/:keyword?/:filter?" :paramsDesc="['关键字，默认为空', '过滤，见下表，默认为 `可播放`']">

| 全部 | 可播放   | 單體作品 | 演員  | 片商  | 導演     | 系列   | 番號 | 可下載   | 字幕  | 預覽圖  |
| ---- | -------- | -------- | ----- | ----- | -------- | ------ | ---- | -------- | ----- | ------- |
|      | playable | single   | actor | maker | director | series | code | download | cnsub | preview |

</Route>

### 演員

<Route author="nczitzk" example="/javdb/actors/R2Vg" path="/javdb/actors/:id/:filter?" :paramsDesc="['编号，可在演员页 URL 中找到', '过滤，见下表，默认为 `全部`']">

| 全部 | 可播放 | 單體作品 | 可下載 | 含字幕 |
| ---- | ------ | -------- | ------ | ------ |
|      | p      | s        | d      | c      |

所有演员编号参见 [演員庫](https://javdb.com/actors)

</Route>

### 系列

<Route author="nczitzk" example="/javdb/series/1NW" path="/javdb/series/:id/:filter?" :paramsDesc="['编号，可在系列页 URL 中找到', '过滤，见下表，默认为 `全部`']">

| 全部 | 可播放   | 單體作品 | 可下載   | 字幕  | 預覽圖  |
| ---- | -------- | -------- | -------- | ----- | ------- |
|      | playable | single   | download | cnsub | preview |

所有系列编号参见 [系列庫](https://javdb.com/series)

</Route>

### 片商

<Route author="nczitzk" example="/javdb/makers/7R" path="/javdb/makers/:id/:filter?" :paramsDesc="['编号，可在片商页 URL 中找到', '过滤，见下表，默认为 `全部`']">

| 全部 | 可播放   | 單體作品 | 可下載   | 字幕  | 預覽圖  |
| ---- | -------- | -------- | -------- | ----- | ------- |
|      | playable | single   | download | cnsub | preview |

所有片商编号参见 [片商庫](https://javdb.com/makers)

</Route>

## JavLibrary

### 影片

<Route author="Diygod junfengP" example="/javlibrary/videos/bestrated" path="/javlibrary/videos/:vtype" :paramsDesc="['影片类型']" radar="1" rssbud="1">
|新话题|新发行|新加入|最想要|高评价|
|-----|------|------|-----|------|
|update|newrelease|newentries|mostwanted|bestrated|
</Route>

### 影星

<Route author="Diygod junfengP" example="/javlibrary/stars/afisw" path="/javlibrary/stars/:sid" :paramsDesc="['影星id，从链接上获取']" radar="1" rssbud="1"/>

### 用户

<Route author="Diygod junfengP" example="/javlibrary/users/mangudai/userposts" path="/javlibrary/users/:uid/:utype" :paramsDesc="['用户id，即用户名称','用户选项，见下表']" radar="1" rssbud="1">
|想要的|看过的|拥有的|发表的文章|
|-----|------|------|-----|
|userwanted|userwatched|userowned|userposts|
</Route>

### 最佳评论

<Route author="DCJaous" example="/javlibrary/bestreviews" path="/javlibrary/bestreviews" radar="1" rssbud="1"/>

## Last.fm

### 用户播放记录

<Route author="hoilc" example="/lastfm/recent/yeFoenix" path="/lastfm/recent/:user" :paramsDesc="['Last.fm 用户名']" radar="1" rssbud="1"/>

### 用户 Love 记录

<Route author="hoilc" example="/lastfm/loved/yeFoenix" path="/lastfm/loved/:user" :paramsDesc="['Last.fm 用户名']" radar="1" rssbud="1"/>

### 站内 Top 榜单

<Route author="hoilc" example="/lastfm/top/spain" path="/lastfm/top/:country?" :paramsDesc="['国家或地区, 需要符合`ISO 3166-1`的英文全称, 可参考`https://zh.wikipedia.org/wiki/ISO_3166-1二位字母代码#正式分配代码`']" radar="1" rssbud="1"/>

## Mp4Ba

### 影视分类

<Route author="SettingDust wolfyu1991"  example="/mp4ba/6" path="/mp4ba/:param" :paramsDesc="['类型']" supportBT="1"/>

**类型参考这里**

| 电影 | 连续剧 | 动画 | 综艺 | 纪录片 |
| ---- | ------ | ---- | ---- | ------ |
| 6    | 7      | 15   | 20   | 24     |

| 动作片 | 喜剧片 | 爱情片 | 科幻片 | 恐怖片 |
| ------ | ------ | ------ | ------ | ------ |
| 8      | 9      | 10     | 11     | 12     |

| 剧情片 | 战争片 | 国产剧 | 港台剧 | 日韩剧 | 欧美剧 |
| ------ | ------ | ------ | ------ | ------ | ------ |
| 13     | 14     | 16     | 17     | 18     | 19     |

</Route>

### 影视搜索

<Route author="wolfyu1991"  example="/mp4ba/复仇者联盟" path="/mp4ba/:keyword" :paramsDesc="['搜索关键字']" supportBT="1"/>

## MQube

### 全站最近更新

<Route author="hoilc" example="/mqube/latest" path="/mqube/latest" radar="1" rssbud="1"/>

### 全站每日排行

<Route author="hoilc" example="/mqube/top" path="/mqube/top" radar="1" rssbud="1"/>

### 个人最近更新

<Route author="hoilc" example="/mqube/user/mukamui_v_p" path="/mqube/user/:user" :paramsDesc="['用户 ID, 可以在个人资料页的 URL 中找到']" radar="1" rssbud="1"/>

### 标签最近更新

<Route author="hoilc" example="/mqube/tag/UTAU" path="/mqube/tag/:tag" :paramsDesc="['标签名称, 可参考`https://mqube.net/search/tag`']" radar="1" rssbud="1"/>

## Nyaa

### 搜索结果

<Route author="Lava-Swimmer" example="/nyaa/search/psycho-pass" path="/nyaa/search/:keyword" :paramsDesc="['搜索关键字']" supportBT="1"/>

## OneJAV

::: tip 提示

官方提供的订阅源不支持 BT 下载订阅，地址为 <https://onejav.com/feeds/>

:::

### OneJAV BT

<Route author="monsterxcn" example="/onejav/popular/30" path="/onejav/:type/:key?" :paramsDesc="['类型', '关键词']" supportBT="1" radar="1">

**类型**

| 最新 | 热门    | 随机   | 指定演员 | 指定标签 | 指定日期 |
| ---- | ------- | ------ | -------- | -------- | -------- |
| new  | popular | random | actress  | tag      | day      |

**关键词**

| 空 | 日期范围    | 演员名       | 标签名         | 日期     |
| -- | ----------- | ------------ | -------------- | -------- |
|    | 7 / 30 / 60 | Yua%20Mikami | Adult%20Awards | YYYYMMDD |

**示例说明**

-   `/onejav/new`

    仅当类型为 `new` `popular` 或 `random` 时关键词可为 **空**

-   `/onejav/popular/30`

    `popular` `random` 类型的关键词可填写 `7` `30` 或 `60` 三个 **日期范围** 之一

-   `/onejav/actress/Yua%20Mikami`

    `actress` 类型的关键词必须填写 **演员名** ，可在 [此处](https://onejav.com/actress/) 演员单页链接中获取

-   `/onejav/tag/Adult%20Awards`

    `tag` 类型的关键词必须填写 **标签名** 且标签中的 `/` 必须替换为 `%2F` ，可在 [此处](https://onejav.com/tag/) 标签单页链接中获取

-   `/onejav/day/20200730`

    `day` 类型的关键词必须填写 **日期** ，按照示例写成形如 `20200730` 的格式

</Route>

## PornHub

### 分类

<Route author="nczitzk" example="/pornhub/category/popular-with-women" path="/pornhub/category/:caty" :paramsDesc="['类别，参见 [categories](https://cn.pornhub.com/webmasters/categories)']"/>

### 搜索

<Route author="nczitzk" example="/pornhub/search/stepsister" path="/pornhub/search/:keyword" :paramsDesc="['关键字']"/>

### 用户

<Route author="I2IMk" example="/pornhub/users/0maru0" path="/pornhub/users/:username" :paramsDesc="['用户名, 对应其专页地址的后面部分, 如 `pornhub.com/users/0maru0`']" />

### 素人（Verified amateur /model）

<Route author="I2IMk" example="/pornhub/model/stacy-starando" path="/pornhub/model/:username/:sort?" :paramsDesc="['用户名, 对应其专页地址的后面部分, 如 `pornhub.com/model/stacy-starando`', '排序方式, 下文会提到']" />

### 色情明星（Verified model /pornstar）

<Route author="I2IMk" example="/pornhub/pornstar/june-liu" path="/pornhub/pornstar/:username/:sort?" :paramsDesc="['用户名, 对应其专页地址的后面部分, 如 `pornhub.com/pornstar/june-liu`', '排序方式, 下文会提到']" />

**排序方式 `sort`**

| mr                   | mv                     | tr                 | lg           | cm          |
| -------------------- | ---------------------- | ------------------ | ------------ | ----------- |
| Most Recent 最新精选 | Most Viewed 最多次观看 | Top Rated 评价最好 | Longest 最长 | Newest 最新 |

### 视频列表

<Route author="I2IMk" example="/pornhub/category_url/video%3Fc%3D15%26o%3Dmv%26t%3Dw%26cc%3Djp" path="/pornhub/category_url/:url?" :paramsDesc="['相对路径, `pornhub.com/` 后的部分, 需手动 URL 编码']"/>

## rs05 人生 05 电影

### rs05 电影列表

<Route author="monner-henster" example="/rs05/rs05" path="/rs05/rs05"/>

## Sankaku Complex

### Post

<Route author="xyqfer" example="/sankakucomplex/post" path="/sankakucomplex/post"/>

## sexinsex

### 分区帖子

<Route author="cnzgray" example="/sexinsex/230/634" path="/sexinsex/:id/:type?" :paramsDesc="['分区 id, 可在分区页 URL 中找到', '类型 id, 可在分区类型过滤后的 URL 中找到']">

> 注意：并非所有的分区都有子类型，可以参考亚洲成人有码原创区的[字幕]这一子类型。

| 亚洲成人无码原创区 | 亚洲成人有码原创区 | 欧美无码原创区 | 欧美无码区 | 亚洲有码薄码区 |
| ------------------ | ------------------ | -------------- | ---------- | -------------- |
| 143                | 230                | 229            | 77         | 58             |

</Route>

## SoundCloud

### Tracks

<Route author="fallenhh" example="/soundcloud/tracks/angeart" path="/soundcloud/tracks/:user" :paramsDesc="['用户名']" />

## Yahoo! テレビ

### 番組検索

<Route author="sakamossan" example="/yahoo-jp-tv/%E8%8A%B1%E6%BE%A4%E9%A6%99%E8%8F%9C" path="/yahoo-jp-tv/:query" :paramsDesc="['搜索查询']"/>

## Youtube

见 [#youtube](/social-media.html#youtube)

## 爱奇艺

### 用户视频

<Route author="talengu" example="/iqiyi/user/video/2289191062" path="/iqiyi/user/video/:uid" :paramsDesc="['用户名']" />

### 动漫

<Route author="ranpox" example="/iqiyi/dongman/a_19rrh1sifx" path="/iqiyi/dongman/:id" :paramsDesc="['动漫 id, 可在该动漫主页 URL 中找到(不包括`.html`)']"/>

## 播客 IBC 岩手放送｜ IBC ラジオ　イヤーマイッタマイッタ

### IBC 岩手放送｜ IBC ラジオ　イヤーマイッタマイッタ

<Route author="fengkx" example="/maitta" path="/maitta" supportPodcast="1" />

## 草榴社区

### 分区帖子

<Route author="zhboner" example="/t66y/20/2" path="/t66y/:id/:type?" :paramsDesc="['分区 id, 可在分区页 URL 中找到', '类型 id, 可在分区类型过滤后的 URL 中找到']" anticrawler="1">

> 注意：并非所有的分区都有子类型，可以参考成人文学交流区的[古典武侠]这一子类型。

| 亚洲无码原创区 | 亚洲有码原创区 | 欧美原创区 | 动漫原创区 | 国产原创区 |
| -------------- | -------------- | ---------- | ---------- | ---------- |
| 2              | 15             | 4          | 5          | 25         |

| 中字原创区 | 转帖交流区 | HTTP 下载区 | 在线成人区 |
| ---------- | ---------- | ----------- | ---------- |
| 26         | 27         | 21          | 22         |

| 技术讨论区 | 新时代的我们 | 达盖尔的旗帜 | 成人文学交流 |
| ---------- | ------------ | ------------ | ------------ |
| 7          | 8            | 16           | 20           |

</Route>

### 帖子跟踪

<Route author="cnzgray" example="/t66y/post/3286088" path="/t66y/post/:tid" :paramsDesc="['帖子 id, 可在帖子 URL 中找到']" anticrawler="1">

::: tip 提示

帖子 id 查找办法:

打开想跟踪的帖子，比如：<http://t66y.com/htm_data/20/1811/3286088.html> 其中 `3286088` 就是帖子 id。

:::

</Route>

## 场库

### 今日精选

<Route author="Wenmoux" example="/changku" path="/changku"/>

## 低端影视

### 影视剧集更新

<Route author="saintwinkle" example="/ddrk/update/silicon-valley/6" path="/ddrk/update/:name/:season?" :paramsDesc="['影视名称，可以在 URL 中找到','季数，可以在 URL 中找到，剧集没有分季时不用填写，或是默认输出第一季的内容']" radar="1" rssbud="1"/>

### 首页

<Route author="hoilc" example="/ddrk/index" path="/ddrk/index" radar="1" rssbud="1"/>

### 分类

<Route author="hoilc" example="/ddrk/category/jp-drama" path="/ddrk/category/:category" :paramsDesc="['分类 ID, 可在 URL 中找到, 注意, 如果有两级分类, 只需要填写第二级即可']" radar="1" rssbud="1"/>

### 标签

<Route author="hoilc" example="/ddrk/tag/石原里美" path="/ddrk/tag/:tag" :paramsDesc="['标签名, 可在 URL 中找到']" radar="1" rssbud="1"/>

## 电影首发站

### 电影

<Route author="epirus" example="/dysfz" path="/dysfz"/>

## 电影天堂

### 新片精品

<Route author="imgss" example="/dytt" path="/dytt" supportBT="1"/>

## 高清电台

### 最新电影

<Route author="Songkeys" example="/gaoqing/latest" path="/gaoqing/latest"/>

## 故事 FM

### 首页

<Route author="sanmmm" example="/storyfm/index" path="/storyfm/index"/>

## 开眼

### 每日精选

<Route author="SunShinenny" example="/kaiyan/index" path="/kaiyan/index"/>

## 荔枝 FM

### 电台更新

<Route author="nczitzk" example="/lizhi/user/27151442948222380" path="/lizhi/user/:id" :paramsDesc="['用户 id，可以在电台的 URL 中找到']"/>

## 猫耳 FM

### 广播剧 / 有声漫画

<Route author="FlashWingShadow" example="/missevan/drama/28499" path="/missevan/drama/:id" :paramsDesc="['剧集 id，在剧集主页 URL 中可以找到']"/>

## 猫眼电影

### 正在热映

<Route author="HenryQW" example="/maoyan/hot" path="/maoyan/hot" />

### 即将上映

<Route author="HenryQW" example="/maoyan/upcoming" path="/maoyan/upcoming" />

## 奈菲影视

### 分区

<Route author="AngUOI" example="/nfmovies/0" path="/nfmovies/:id?" :paramsDesc="['子版块 id, 为空默认首页']">

| 首页 | 电影 | 电视剧 | 综艺 | 动漫 | 奈菲独家 |
| ---- | ---- | ------ | ---- | ---- | -------- |
| 0    | 1    | 2      | 3    | 4    | 5        |

</Route>

## 柠檬 私房歌 (ningmeng.name)

### 私房歌

<Route author="dearrrfish" example="/ningmeng/song" path="/ningmeng/song" />

## 片源网

### 最新资源

<Route author="greatcodeeer" example="/pianyuan" path="/pianyuan" radar="1" rssbud="1"/>

## 飘花电影网

### 今日热门

<Route author="nczitzk" example="/piaohua/hot" path="/piaohua/hot" />

## 蜻蜓 FM

### 专辑

<Route author="nczitzk" example="/qingting/channel/293411" path="/qingting/channel/:id" :paramsDesc="['专辑id, 可在专辑页 URL 中找到']"/>

## 人人影视

### 评测推荐

<Route author="wb121017405" example="/rrys/review" path="/rrys/review" />

### 今日更新

<Route author="alcarl" example="/yyets/todayfilelist" path="/yyets/todayfilelist" />

## 色花堂中文论坛

### 分区帖子

<Route author="qiwihui junfengP" example="/dsndsht23/36/368" path="/dsndsht23/:subforumid?/:type?" supportBT="1" :paramsDesc="['版块 id 或板块名称（见下表）, 为空默认高清中文字幕', '类型 id, 可在分区类型过滤后的 URL 中找到']">

**原创 BT 电影**

| 每日合集 | 国产原创 | 亚洲无码原创 | 亚洲有码原创 | 高清中文字幕 | 三级写真 | 亚洲名站有码 | VR 系列 | 欧美无码 | 动漫原创 | AI 换脸电影 | 原档收藏 WMV |
| -------- | -------- | ------------ | ------------ | ------------ | -------- | ------------ | ------- | -------- | -------- | ----------- | ------------ |
| mrhj     | gcyc     | yzwmyc       | yzymyc       | gqzwzm       | sjxz     | yzmzym       | vr      | omwm     | dmyc     | ai          | ydsc         |

**色花图片**

| 华人性爱自拍 | 华人街拍区 | 亚洲性爱 | 欧美性爱 | 卡通动漫 |
| ------------ | ---------- | -------- | -------- | -------- |
| hrxazp       | hrjpq      | yzxa     | omxa     | ktdm     |

</Route>

## 腾讯视频

### 播放列表

<Route author="Andiedie" example="/tencentvideo/playlist/jx7g4sm320sqm7i" path="/tencentvideo/playlist/:id" :paramsDesc="['播放列表 ID，可以在 URL 中找到']" />

## 网易云音乐

### 歌单歌曲

<Route author="DIYgod" example="/ncm/playlist/35798529" path="/ncm/playlist/:id" :paramsDesc="['歌单 id, 可在歌单页 URL 中找到']"/>

### 用户歌单

<Route author="DIYgod" example="/ncm/user/playlist/45441555" path="/ncm/user/playlist/:uid" :paramsDesc="['用户 uid, 可在用户主页 URL 中找到']"/>

### 歌手专辑

<Route author="metowolf" example="/ncm/artist/2116" path="/ncm/artist/:id" :paramsDesc="[' 歌手 id, 可在歌手详情页 URL 中找到']"/>

### 电台节目

<Route author="magic-akari" example="/ncm/djradio/347317067" path="/ncm/djradio/:id" :paramsDesc="['节目 id, 可在电台节目页 URL 中找到']" supportPodcast="1" />

## 喜马拉雅

### 专辑

<Route author="lengthmin jjeejj prnake" example="/ximalaya/album/299146" path="/ximalaya/album/:id/:all?" :paramsDesc="['专辑 id, 可在对应专辑页面的 URL 中找到','是否需要获取全部节目，默认不获取，填入该字段则视为获取']" supportPodcast="1" radar="1" rssbud="1">

::: warning 注意
专辑 id 是跟在**分类拼音**后的那个 id, 不要输成某集的 id 了

**付费内容需要登陆才能收听，详情见部署页面的配置模块**

目前支持泛用型播客订阅的[输出格式](https://docs.rsshub.app/#输出格式)中标明的格式只有 rss 支持，也就是说你**只能使用**以下类型的链接来订阅播客:

-   `https://rsshub.app/ximalaya/album/*`
-   `https://rsshub.app/ximalaya/album/*.rss`

:::

</Route>

## 小宇宙

### 发现

<Route author="prnake" example="/xiaoyuzhou" path="/xiaoyuzhou">

::: warning 注意

小宇宙的 api 需要验证 `x-jike-device-id`、`x-jike-access-token` 和 `x-jike-refresh-token` 。必要时需要自行配置，具体见部署文档。

:::

</Route>

## 优酷

### 频道

<Route author="xyqfer" example="/youku/channel/UNTg3MTM3OTcy" path="/youku/channel/:channelId/:embed?" :paramsDesc="['频道 id', '默认为开启内嵌视频, 任意值为关闭']"/>

## 中国高清网

### 电影

<Route author="minosss" example="/gaoqingla" path="/gaoqingla/:tag?" :paramsDesc="['标签tag，视频清晰度']" />

| 全部 | 蓝光   | 1080P | 720P | 3D | WEB-DL |
| ---- | ------ | ----- | ---- | -- | ------ |
| 留空 | bluray | 1080p | 720p | 3d | webdl  |

## 中国广播

### 电台节目

<Route author="kt286" example="/radio/2/520767" path="/radio/:channelname/:name" :paramsDesc="['频道ID, 可在对应专辑页面的 URL 中找到','节目ID，可在对应专辑页面的 URL 中找到']" supportPodcast="1"/>

## 追新番日剧站

### 更新列表

<Route author="mengx8" example="/zhuixinfan/list" path="/zhuixinfan/list" radar="1" rssbud="1"/>

## 字幕库

### 字幕列表

<Route author="sanmmm" example="/zimuku/mv" path="/zimuku/:type?" :paramsDesc="['类型, 默认为`mv`电影']">

类型

| 最新电影 | 最新美剧 |
| -------- | -------- |
| mv       | tv       |

</Route>

## 字幕组（ZiMuZu.tv）

### 影视

::: tip 提示

跟官方提供的 RSS 相比：官方使用了不规范的 magnet 字段，无法被 BT 客户端识别并自动下载，其他数据相同

:::

<Route author="DIYgod" example="/zimuzu/resource/37031" path="/zimuzu/resource/:id?" :paramsDesc="['影视 id，对应影视的 URL 中找到，为空时输出最近更新']" supportBT="1"/>

### 排行榜

<Route author="queensferryme DIYgod" example="/zimuzu/top/week/movie" path="/zimuzu/top/:range/:type" :paramsDesc="['时间范围, 可以是 `week` `month` `year` `total`', '排行类型, 可以是 `fav` `tv` `movie`']">

例如，路由 `/zimuzu/top/week/movie` 应该输出 <http://www.rrys2019.com/html/top/week_movie_list.html> 的排行榜单

</Route>
