# 音视频

## bilibili

见 [#bilibili](/social-media.html#bilibili)

## Youtube

见 [#youtube](/social-media.html#youtube)

## 抖音

见 [#抖音](/social-media.html#抖音)

## 网易云音乐

<Route name="歌单歌曲" author="DIYgod" example="/ncm/playlist/35798529" path="/ncm/playlist/:id" :paramsDesc="['歌单 id, 可在歌单页 URL 中找到']"/>

<Route name="用户歌单" author="DIYgod" example="/ncm/user/playlist/45441555" path="/ncm/user/playlist/:uid" :paramsDesc="['用户 uid, 可在用户主页 URL 中找到']"/>

<Route name="歌手专辑" author="metowolf" example="/ncm/artist/2116" path="/ncm/artist/:id" :paramsDesc="[' 歌手 id, 可在歌手详情页 URL 中找到']"/>

<Route name="电台节目" author="magic-akari" example="/ncm/djradio/347317067" path="/ncm/djradio/:id" :paramsDesc="['节目 id, 可在电台节目页 URL 中找到']"/>

## 爱奇艺

<Route name="动漫" author="ranpox" example="/iqiyi/dongman/a_19rrh1sifx" path="/iqiyi/dongman/:id" :paramsDesc="['动漫 id, 可在该动漫主页 URL 中找到(不包括`.html`)']"/>

## 腾讯视频

<Route name="播放列表" author="Andiedie" example="/tencentvideo/playlist/jx7g4sm320sqm7i" path="/tencentvideo/playlist/:id" :paramsDesc="['播放列表 ID，可以在 URL 中找到']" />

## 喜马拉雅

<Route name="专辑(支持泛用型播客订阅)" author="lengthmin jjeejj" example="/ximalaya/album/299146" path="/ximalaya/album/:id/:all?" :paramsDesc="['专辑 id, 可在对应专辑页面的 URL 中找到','是否需要获取全部节目，默认不获取，填入该字段则视为获取']">

::: warning 注意
专辑 id 是跟在**分类拼音**后的那个 id, 不要输成某集的 id 了

**付费内容不可收听，但可使用非播客软件(例如 Inoreader)获取更新**

目前支持泛用型播客订阅的[输出格式](https://docs.rsshub.app/#输出格式)中标明的格式只有 rss 支持, 也就是说你**只能使用**以下类型的链接来订阅播客:

-   https://rsshub.app/ximalaya/album/*
-   https://rsshub.app/ximalaya/album/*.rss

:::

</Route>

## EZTV

::: tip 提示

网站提供了全部种子的 RSS: https://eztv.ag/ezrss.xml

:::

<Route name="Lookup Torrents by IMDB ID" author="Songkeys" example="/eztv/torrents/6048596" path="/eztv/torrents/:imdb_id" :paramsDesc="['想搜寻的 show 的种子所对应的 IMDB ID, 可在 [IMDB](https://www.imdb.com) 官网找到']"/>

## 草榴社区

<Route name="分区帖子" author="zhboner" example="/t66y/20/2" path="/t66y/:id/:type?" :paramsDesc="['分区 id, 可在分区页 URL 中找到', '类型 id, 可在分区类型过滤后的 URL 中找到']">

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

<Route name="帖子跟踪" author="cnzgray" example="/t66y/post/3286088" path="/t66y/post/:tid" :paramsDesc="['帖子 id, 可在帖子 URL 中找到']">

::: tip 提示

帖子 id 查找办法:

打开想跟踪的帖子，比如：http://t66y.com/htm_data/20/1811/3286088.html。其中`3286088`就是帖子id。

:::

</Route>

## sexinsex

<Route name="分区帖子" author="cnzgray" example="/sexinsex/230/634" path="/sexinsex/:id/:type?" :paramsDesc="['分区 id, 可在分区页 URL 中找到', '类型 id, 可在分区类型过滤后的 URL 中找到']">

> 注意：并非所有的分区都有子类型，可以参考亚洲成人有码原创区的[字幕]这一子类型。

| 亚洲成人无码原创区 | 亚洲成人有码原创区 | 欧美无码原创区 | 欧美无码区 | 亚洲有码薄码区 |
| ------------------ | ------------------ | -------------- | ---------- | -------------- |
| 143                | 230                | 229            | 77         | 58             |

</Route>

## 电影首发站

<Route name="电影" author="epirus" example="/dysfz" path="/dysfz"/>

## 电影天堂

<Route name="新片精品" author="imgss" example="/dytt" path="/dytt"/>

## rs05 人生 05 电影

<Route name="rs05电影列表" author="monner-henster" example="/rs05/rs05" path="/rs05/rs05"/>

## 优酷

<Route name="频道" author="xyqfer" example="/youku/channel/UNTg3MTM3OTcy" path="/youku/channel/:channelId/:embed?" :paramsDesc="['频道 id', '默认为开启内嵌视频, 任意值为关闭']"/>

## AcFun

<Route name="番剧" author="xyqfer" example="/acfun/bangumi/5022158" path="/acfun/bangumi/:id" :paramsDesc="['番剧 id']"/>

::: tip 提示

番剧 id 不包含开头的 aa。
例如：http://www.acfun.cn/bangumi/aa5022158 的番剧 id 是 5022158，不包括开头的 aa。

:::

## 字幕组（ZiMuZu.tv）

::: tip 提示

跟官方提供的 RSS 相比：官方使用了不规范的 magnet 字段，无法被 BT 客户端识别并自动下载，其他数据相同

:::

<Route name="影视" author="DIYgod" example="/zimuzu/resource/37031" path="/zimuzu/resource/:id?" :paramsDesc="['影视 id，对应影视的 URL 中找到，为空时输出最近更新']"/>

## Sankaku Complex

<Route name="Post" author="xyqfer" example="/sankakucomplex/post" path="/sankakucomplex/post"/>

## 高清电台

<Route name="最新电影" author="Songkeys" example="/gaoqing/latest" path="/gaoqing/latest"/>

## JavBus

<Route name="首页" author="MegrezZhu CoderTonyChan" example="/javbus/home" path="/javbus/home"/>

<Route name="分类" author="MegrezZhu CoderTonyChan" example="/javbus/genre/7g" path="/javbus/genre/:gid" :paramsDesc="['分类id，详见[网站里](https://www.javbus.com/genre)的链接']" />

<Route name="演员" author="MegrezZhu CoderTonyChan" example="/javbus/star/2jv" path="/javbus/star/:sid" :paramsDesc="['演员id，详见[网站里](https://www.javbus.com/actresses)的链接']" />

<Route name="首页/步兵" author="MegrezZhu CoderTonyChan" example="/javbus/uncensored/home" path="/javbus/uncensored/home"/>

<Route name="分类/步兵" author="MegrezZhu CoderTonyChan" example="/javbus/uncensored/genre/1bc" path="/javbus/uncensored/genre/:gid" :paramsDesc="['分类id，详见[网站里](https://www.javbus.com/uncensored/genre)的链接']" />

<Route name="演员/步兵" author="MegrezZhu CoderTonyChan" example="/javbus/uncensored/star/b5b" path="/javbus/uncensored/star/:sid" :paramsDesc="['演员id，详见[网站里](https://www.javbus.com/uncensored/actresses)的链接']" />

<Route name="首页/欧陆风云" author="MegrezZhu CoderTonyChan" example="/javbus/western/home" path="/javbus/western/home"/>

<Route name="分类/欧陆风云" author="MegrezZhu CoderTonyChan" example="/javbus/western/genre/86" path="/javbus/western/genre/:gid" :paramsDesc="['分类id，详见[网站里](https://www.javbus.work/genre)的链接']" />

<Route name="演员/欧陆风云" author="MegrezZhu CoderTonyChan" example="/javbus/western/star/4hv" path="/javbus/western/star/:sid" :paramsDesc="['演员id，详见[网站里](https://www.javbus.work/actresses)的链接']" />

## Mp4Ba

**类型参考这里**
| 1 | 2 | 3 | 4 |
| - | - | - | - |
| 电影 | 连续剧 | 综艺 | 动画 |

| 5      | 6      | 7      | 8      | 9      |
| ------ | ------ | ------ | ------ | ------ |
| 动作片 | 喜剧片 | 爱情片 | 科幻片 | 恐怖片 |

| 10     | 11     | 12     | 13     | 14     | 15     |
| ------ | ------ | ------ | ------ | ------ | ------ |
| 剧情片 | 战争片 | 国产剧 | 港台剧 | 日韩剧 | 欧美剧 |

<Route name="资源" author="SettingDust"  example="/mp4ba/1" path="/mp4ba/:param" :paramsDesc="['类型/关键字']"/>
