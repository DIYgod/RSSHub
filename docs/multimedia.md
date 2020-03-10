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

### 番剧

<Route author="xyqfer" example="/acfun/bangumi/5022158" path="/acfun/bangumi/:id" :paramsDesc="['番剧 id']"/>

::: tip 提示

番剧 id 不包含开头的 aa。
例如：http://www.acfun.cn/bangumi/aa5022158 的番剧 id 是 5022158，不包括开头的 aa。

:::

### 用户投稿

<Route author="wdssmq" example="/acfun/user/video/14450522" path="/acfun/user/video/:id" :paramsDesc="['用户 UID']"/>

## bilibili

见 [#bilibili](/social-media.html#bilibili)

## BT 之家

### 最新种子

<Route author="zhang-wangz" example="/btzj/base" path="/btzj/:type?" anticrawler="1" :paramsDesc="['type,见下表']">

| base                     | govern                 |
| ------------------------ | ---------------------- |
| https://www.88btbtt.com/ | http://www.1btjia.com/ |

</Route>

::: tip 提示

由于 BT 之家域名有多个. 此 feed 对应[`https://www.88btbtt.com`](https://www.88btbtt.com)域名和[`http://www.1btjia.com/`](http://www.1btjia.com/)域名.
可空，默认为 base

:::

## EZTV

::: tip 提示

网站提供了全部种子的 RSS: https://eztv.io/ezrss.xml

:::

### Lookup Torrents by IMDB ID

<Route author="Songkeys" example="/eztv/torrents/6048596" path="/eztv/torrents/:imdb_id" :paramsDesc="['想搜寻的 show 的种子所对应的 IMDB ID, 可在 [IMDB](https://www.imdb.com) 官网找到']" supportBT="1"/>

## JavBus

### 首页

<Route author="MegrezZhu CoderTonyChan" example="/javbus/home" path="/javbus/home"/>

### 分类

<Route author="MegrezZhu CoderTonyChan" example="/javbus/genre/7g" path="/javbus/genre/:gid" :paramsDesc="['分类id，详见[网站里](https://www.javbus.com/genre)的链接']" />

### 演员

<Route author="MegrezZhu CoderTonyChan" example="/javbus/star/2jv" path="/javbus/star/:sid" :paramsDesc="['演员id，详见[网站里](https://www.javbus.com/actresses)的链接']" />

### 系列

<Route author="MegrezZhu CoderTonyChan Felix2yu" example="/javbus/series/44q" path="/javbus/series/:seriesid" :paramsDesc="['系列id，详见作品中系列的链接']" />

### 首页/步兵

<Route author="MegrezZhu CoderTonyChan" example="/javbus/uncensored/home" path="/javbus/uncensored/home"/>

### 分类/步兵

<Route author="MegrezZhu CoderTonyChan" example="/javbus/uncensored/genre/1bc" path="/javbus/uncensored/genre/:gid" :paramsDesc="['分类id，详见[网站里](https://www.javbus.com/uncensored/genre)的链接']" />

### 演员/步兵

<Route author="MegrezZhu CoderTonyChan" example="/javbus/uncensored/star/b5b" path="/javbus/uncensored/star/:sid" :paramsDesc="['演员id，详见[网站里](https://www.javbus.com/uncensored/actresses)的链接']" />

### 系列/步兵

<Route author="MegrezZhu CoderTonyChan Felix2yu" example="/javbus/uncensored/series/1ft" path="/javbus/uncensored/series/:seriesid" :paramsDesc="['系列id，详见作品中系列的链接']" />

### 首页/欧陆风云

<Route author="MegrezZhu CoderTonyChan" example="/javbus/western/home" path="/javbus/western/home"/>

### 分类/欧陆风云

<Route author="MegrezZhu CoderTonyChan" example="/javbus/western/genre/86" path="/javbus/western/genre/:gid" :paramsDesc="['分类id，详见[网站里](https://www.javbus.work/genre)的链接']" />

### 演员/欧陆风云

<Route author="MegrezZhu CoderTonyChan" example="/javbus/western/star/4hv" path="/javbus/western/star/:sid" :paramsDesc="['演员id，详见[网站里](https://www.javbus.work/actresses)的链接']" />

### 系列/欧陆风云

<Route author="MegrezZhu CoderTonyChan Felix2yu" example="/javbus/western/series/20" path="/javbus/western/series/:seriesid" :paramsDesc="['系列id，详见作品中系列的链接']" />

## JavLibrary

### 影片

<Route author="Diygod junfengP" example="/javlibrary/videos/bestrated" path="/javlibrary/videos/:vtype" :paramsDesc="['影片类型']" radar="1" >
|新话题|新发行|新加入|最想要|高评价|
|-----|------|------|-----|------|
|update|newrelease|newentries|mostwanted|bestrated|
</Route>

### 影星

<Route author="Diygod junfengP" example="/javlibrary/stars/afisw" path="/javlibrary/stars/:sid" :paramsDesc="['影星id，从链接上获取']" radar="1" />

### 用户

<Route author="Diygod junfengP" example="/javlibrary/users/mangudai/userposts" path="/javlibrary/users/:uid/:utype" :paramsDesc="['用户id，即用户名称','用户选项，见下表']" radar="1" >
|想要的|看过的|拥有的|发表的文章|
|-----|------|------|-----|
|userwanted|userwatched|userowned|userposts|
</Route>

### 最佳评论

<Route author="DCJaous" example="/javlibrary/bestreviews" path="/javlibrary/bestreviews" radar="1" />

## Last.fm

### 用户播放记录

<Route author="hoilc" example="/lastfm/recent/yeFoenix" path="/lastfm/recent/:user" :paramsDesc="['Last.fm 用户名']" radar="1" />

### 用户 Love 记录

<Route author="hoilc" example="/lastfm/loved/yeFoenix" path="/lastfm/loved/:user" :paramsDesc="['Last.fm 用户名']" radar="1" />

### 站内 Top 榜单

<Route author="hoilc" example="/lastfm/top/spain" path="/lastfm/top/:country?" :paramsDesc="['国家或地区, 需要符合`ISO 3166-1`的英文全称, 可参考`https://zh.wikipedia.org/wiki/ISO_3166-1二位字母代码#正式分配代码`']" radar="1" />

## Mp4Ba

### 影视分类

<Route author="SettingDust wolfyu1991"  example="/mp4ba/6" path="/mp4ba/:param" :paramsDesc="['类型']" supportBT="1"/>

**类型参考这里**
| 电影 | 连续剧 | 动画 | 综艺 | 纪录片 |
| ---- | ------ | ---- | ---- | ------ |
| 6 | 7 | 15 | 20 | 24 |

| 动作片 | 喜剧片 | 爱情片 | 科幻片 | 恐怖片 |
| ------ | ------ | ------ | ------ | ------ |
| 8      | 9      | 10     | 11     | 12     |

| 剧情片 | 战争片 | 国产剧 | 港台剧 | 日韩剧 | 欧美剧 |
| ------ | ------ | ------ | ------ | ------ | ------ |
| 13     | 14     | 16     | 17     | 18     | 19     |

</Route>

### 影视搜索

<Route author="wolfyu1991"  example="/mp4ba/复仇者联盟" path="/mp4ba/:keyword" :paramsDesc="['搜索关键字']" supportBT="1"/>

</Route>

## MQube

### 全站最近更新

<Route author="hoilc" example="/mqube/latest" path="/mqube/latest" radar="1" />

### 全站每日排行

<Route author="hoilc" example="/mqube/top" path="/mqube/top" radar="1" />

### 个人最近更新

<Route author="hoilc" example="/mqube/user/mukamui_v_p" path="/mqube/user/:user" :paramsDesc="['用户 ID, 可以在个人资料页的 URL 中找到']" radar="1" />

### 标签最近更新

<Route author="hoilc" example="/mqube/tag/UTAU" path="/mqube/tag/:tag" :paramsDesc="['标签名称, 可参考`https://mqube.net/search/tag`']" radar="1" />

## Nyaa

### 搜索结果

<Route author="Lava-Swimmer" example="/nyaa/search/psycho-pass" path="/nyaa/search/:keyword" :paramsDesc="['搜索关键字']" supportBT="1"/>

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

## Yahoo!テレビ

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

打开想跟踪的帖子，比如：http://t66y.com/htm_data/20/1811/3286088.html。其中`3286088`就是帖子id。

:::

</Route>

## 低端影视

### 影视剧集更新

<Route author="saintwinkle" example="/ddrk/update/silicon-valley/6" path="/ddrk/update/:name/:season?" :paramsDesc="['影视名称，可以在 URL 中找到','季数，可以在 URL 中找到，剧集没有分季时不用填写，或是默认输出第一季的内容']" radar="1" />

### 首页

<Route author="hoilc" example="/ddrk/index" path="/ddrk/index" radar="1" />

### 分类

<Route author="hoilc" example="/ddrk/category/jp-drama" path="/ddrk/category/:category" :paramsDesc="['分类 ID, 可在 URL 中找到, 注意, 如果有两级分类, 只需要填写第二级即可']" radar="1" />

### 标签

<Route author="hoilc" example="/ddrk/tag/石原里美" path="/ddrk/tag/:tag" :paramsDesc="['标签名, 可在 URL 中找到']" radar="1" />

## 电影首发站

### 电影

<Route author="epirus" example="/dysfz" path="/dysfz"/>

## 电影天堂

### 新片精品

<Route author="imgss" example="/dytt" path="/dytt" supportBT="1"/>

## 抖音

见 [#抖音](/social-media.html#dou-yin)

## 高清电台

### 最新电影

<Route author="Songkeys" example="/gaoqing/latest" path="/gaoqing/latest"/>

## 故事 FM

### 首页

<Route author="sanmmm" example="/storyfm/index" path="/storyfm/index"/>

## 开眼

### 每日精选

<Route author="SunShinenny" example="/kaiyan/index" path="/kaiyan/index"/>

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

<Route author="greatcodeeer" example="/pianyuan" path="/pianyuan" radar="1"/>

## 色花堂中文论坛

### 原创 BT 电影

<Route author="qiwihui junfengP" example="/dsndsht23/36/368" path="/dsndsht23/:subforumid?/:type?" supportBT="1" :paramsDesc="['版块 id 或板块名称（见下表）, 为空默认高清中文字幕', '类型 id, 可在分区类型过滤后的 URL 中找到']">

| 每日合集 | 国产原创 | 亚洲无码原创 | 亚洲有码原创 | 高清中文字幕 | 三级写真 | 亚洲名站有码 | VR 系列 | 欧美无码 | 动漫原创 | AI 换脸电影 | 原档收藏 WMV |
| -------- | -------- | ------------ | ------------ | ------------ | -------- | ------------ | ------- | -------- | -------- | ----------- | ------------ |
| mrhj     | gcyc     | yzwmyc       | yzymyc       | gqzwzm       | sjxz     | yzmzym       | vr      | omwm     | dmyc     | ai          | ydsc         |

</Route>

### 色花图片

<Route author="junfengP" example="/dsndsht23/picture/hrxazp" path="/dsndsht23/picture/:subforumid" :paramsDesc="['子版块 id']">

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

<Route author="lengthmin jjeejj" example="/ximalaya/album/299146" path="/ximalaya/album/:id/:all?" :paramsDesc="['专辑 id, 可在对应专辑页面的 URL 中找到','是否需要获取全部节目，默认不获取，填入该字段则视为获取']" supportPodcast="1" radar="1">

::: warning 注意
专辑 id 是跟在**分类拼音**后的那个 id, 不要输成某集的 id 了

**付费内容不可收听，但可使用非播客软件(例如 Inoreader)获取更新**

目前支持泛用型播客订阅的[输出格式](https://docs.rsshub.app/#输出格式)中标明的格式只有 rss 支持, 也就是说你**只能使用**以下类型的链接来订阅播客:

-   https://rsshub.app/ximalaya/album/*
-   https://rsshub.app/ximalaya/album/*.rss

:::

</Route>

## 优酷

### 频道

<Route author="xyqfer" example="/youku/channel/UNTg3MTM3OTcy" path="/youku/channel/:channelId/:embed?" :paramsDesc="['频道 id', '默认为开启内嵌视频, 任意值为关闭']"/>

## 中国高清网

### 电影

<Route author="minosss" example="/gaoqingla" path="/gaoqingla/:tag?" :paramsDesc="['标签tag，视频清晰度']" />

| 全部 | 蓝光   | 1080P | 720P | 3D  | WEB-DL |
| ---- | ------ | ----- | ---- | --- | ------ |
| 留空 | bluray | 1080p | 720p | 3d  | webdl  |

## 中国广播

### 电台节目

<Route author="kt286" example="/radio/2/520767" path="/radio/:channelname/:name" :paramsDesc="['频道ID, 可在对应专辑页面的 URL 中找到','节目ID，可在对应专辑页面的 URL 中找到']" supportPodcast="1"/>

## 字幕库

### 字幕列表

<Route author="sanmmm" example="/zimuku/mv" path="/zimuku/:type?" :paramsDesc="['类型, 默认为`mv`电影']">

类型

| 最新电影 | 最新美剧 |
| -------- | -------- |
| mv       | tv       |

</Route>

## 字幕组（ZiMuZu.tv）

::: tip 提示

跟官方提供的 RSS 相比：官方使用了不规范的 magnet 字段，无法被 BT 客户端识别并自动下载，其他数据相同

:::

### 影视

<Route author="DIYgod" example="/zimuzu/resource/37031" path="/zimuzu/resource/:id?" :paramsDesc="['影视 id，对应影视的 URL 中找到，为空时输出最近更新']" supportBT="1"/>
