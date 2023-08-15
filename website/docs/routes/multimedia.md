import Route from '@site/src/components/Route';

# 🔊 音视频

## 141JAV {#141jav}

:::tip 提示

官方提供的订阅源不支持 BT 下载订阅，地址为 <https://141jav.com/feeds/>

:::

### 通用 {#141jav-tong-yong}

<Route author="cgkings nczitzk" example="/141jav/popular/30" path="/141jav/:type?/:keyword?" paramsDesc={['类型', '关键词']} supportBT="1" radar="1">

**类型**

| 最新 | 热门    | 随机   | 指定演员 | 指定标签 |
| ---- | ------- | ------ | -------- | -------- |
| new  | popular | random | actress  | tag      |

**关键词**

| 空 | 日期范围    | 演员名       | 标签名         |
| -- | ----------- | ------------ | -------------- |
|    | 7 / 30 / 60 | Yua%20Mikami | Adult%20Awards |

**示例说明**

-   `/141jav/new`

    仅当类型为 `new` `popular` 或 `random` 时关键词为 **空**

-   `/141jav/popular/30`

    `popular` `random` 类型的关键词可填写 `7` `30` 或 `60` 三个 **日期范围** 之一，分别对应 **7 天**、**30 天** 或 **60 天内**

-   `/141jav/actress/Yua%20Mikami`

    `actress` 类型的关键词必须填写 **演员名** ，可在 [此处](https://141jav.com/actress) 演员单页链接中获取

-   `/141jav/tag/Adult%20Awards`

    `tag` 类型的关键词必须填写 **标签名** 且标签中的 `/` 必须替换为 `%2F` ，可在 [此处](https://141jav.com/tag) 标签单页链接中获取

-   `/141jav/date/2020/07/30`

    `date` 类型的关键词必须填写 **日期**

</Route>

## 141PPV {#141ppv}

:::tip 提示

官方提供的订阅源不支持 BT 下载订阅，地址为 <https://141ppv.com/feeds/>

:::

### 通用 {#141ppv-tong-yong}

<Route author="cgkings nczitzk" example="/141ppv/popular/30" path="/141ppv/:type?/:keyword?" paramsDesc={['类型', '关键词']} supportBT="1" radar="1">

**类型**

| 最新 | 热门    | 随机   | 指定演员 | 指定标签 |
| ---- | ------- | ------ | -------- | -------- |
| new  | popular | random | actress  | tag      |

**关键词**

| 空 | 日期范围    | 演员名       | 标签名         |
| -- | ----------- | ------------ | -------------- |
|    | 7 / 30 / 60 | Yua%20Mikami | Adult%20Awards |

**示例说明**

-   `/141ppv/new`

    仅当类型为 `new` `popular` 或 `random` 时关键词为 **空**

-   `/141ppv/popular/30`

    `popular` `random` 类型的关键词可填写 `7` `30` 或 `60` 三个 **日期范围** 之一，分别对应 **7 天**、**30 天** 或 **60 天内**

-   `/141ppv/actress/Yua%20Mikami`

    `actress` 类型的关键词必须填写 **演员名** ，可在 [此处](https://141ppv.com/actress) 演员单页链接中获取

-   `/141ppv/tag/Adult%20Awards`

    `tag` 类型的关键词必须填写 **标签名** 且标签中的 `/` 必须替换为 `%2F` ，可在 [此处](https://141ppv.com/tag) 标签单页链接中获取

-   `/141ppv/date/2020/07/30`

    `date` 类型的关键词必须填写 **日期**

</Route>

## 2048 核基地 {#2048-he-ji-di}

### 论坛 {#2048-he-ji-di-lun-tan}

<Route author="hoilc nczitzk" example="/2048/2" path="/2048/:id?" paramsDesc={['板块 ID, 见下表，默认为最新合集，即 `3`，亦可在 URL 中找到, 例如, `thread.php?fid-3.html`中, 板块 ID 为`3`']} supportBT="1">

| 最新合集 | 亞洲無碼 | 日本騎兵 | 歐美新片 | 國內原創 | 中字原創 | 三級寫真 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 3        | 4        | 5        | 13       | 15       | 16       | 18       |

| 有碼.HD | 亞洲 SM.HD | 日韓 VR/3D | 歐美 VR/3D | S-cute / Mywife / G-area |
| ------- | ---------- | ---------- | ---------- | ------------------------ |
| 116     | 114        | 96         | 97         | 119                      |

| 網友自拍 | 亞洲激情 | 歐美激情 | 露出偷窺 | 高跟絲襪 | 卡通漫畫 | 原創达人 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 23       | 24       | 25       | 26       | 27       | 28       | 135      |

| 唯美清純 | 网络正妹 | 亞洲正妹 | 素人正妹 | COSPLAY | 女优情报 | Gif 动图 |
| -------- | -------- | -------- | -------- | ------- | -------- | -------- |
| 21       | 274      | 276      | 277      | 278     | 29       |          |

| 獨家拍攝 | 稀有首發 | 网络见闻 | 主播實錄 | 珍稀套圖 | 名站同步 | 实用漫画 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 213      | 94       | 283      | 111      | 88       | 131      | 180      |

| 网盘二区 | 网盘三区 | 分享福利 | 国产精选 | 高清福利 | 高清首发 | 多挂原创 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 72       | 272      | 195      | 280      | 79       | 216      | 76       |

| 磁链迅雷 | 正片大片 | H-GAME | 有声小说 | 在线视频 | 在线快播影院 |
| -------- | -------- | ------ | -------- | -------- | ------------ |
| 43       | 67       | 66     | 55       | 78       | 279          |

| 综合小说 | 人妻意淫 | 乱伦迷情 | 长篇连载 | 文学作者 | TXT 小说打包 |
| -------- | -------- | -------- | -------- | -------- | ------------ |
| 48       | 103      | 50       | 54       | 100      | 109          |

| 聚友客栈 | 坛友自售 |
| -------- | -------- |
| 57       | 136      |

</Route>

## 4k 世界 {#4k-shi-jie}

### 分类 {#4k-shi-jie-fen-lei}

<Route author="nczitzk" example="/4ksj/forum" path="/4ksj/forum/:id?" paramsDesc={['分类 id，默认为最新4K电影']}>

:::tip 提示

若订阅 [最新 4K 电影](https://www.4ksj.com/forum-2-1.html)，网址为 <https://www.4ksj.com/forum-2-1.html>。截取 `https://www.4ksj.com/forum-` 到末尾 `.html` 的部分 `2-1` 作为参数，此时路由为 [`/4ksj/forum/2-1`](https://rsshub.app/4ksj/forum/2-1)。

若订阅子分类 [Dolby Vision 纪录片 4K 电影](https://www.4ksj.com/forum-4kdianying-s7-dianyingbiaozhun-3-dytypes-9-1.html)，网址为 <https://www.4ksj.com/forum-4kdianying-s7-dianyingbiaozhun-3-dytypes-9-1.html>。截取 `https://www.4ksj.com/forum-` 到末尾 `.html` 的部分 `4kdianying-s7-dianyingbiaozhun-3-dytypes-9-1` 作为参数，此时路由为 [`/4ksj/forum/4kdianying-s7-dianyingbiaozhun-3-dytypes-9-1`](https://rsshub.app/4ksj/forum/4kdianying-s7-dianyingbiaozhun-3-dytypes-9-1)。

:::

</Route>

## 60-Second Science - Scientific American {#60-second-science---scientific-american}

<Route author="emdoe" example="/60s-science" path="/60s-science"/>

输出 Transcript 从而提供比官方（podcast）更好的使用体验。

## 6v 电影 {#6v-dian-ying}

### 最新电影 {#6v-dian-ying-zui-xin-dian-ying}

<Route author="tc9011" example="/6v123/latestMovies" path="/6v123/latestMovies" supportBT="1"/>

### 最新电视剧 {#6v-dian-ying-zui-xin-dian-shi-ju}

<Route author="tc9011" example="/6v123/latestTVSeries" path="/6v123/latestTVSeries" supportBT="1"/>

## 7mmtv {#7mmtv}

### 分类 {#7mmtv-fen-lei}

<Route author="nczitzk" example="/7mmtv/zh/censored_list/all" path="/7mmtv/:language?/:category?/:type?" paramsDesc={['语言，见下表，默认为 `en` 即英语', '分类，见下表，默认为 `censored_list` 即 有碼AV', '空间，见下表，默认为全部']} anticrawler="1">

**语言**

| English | 日本語 | 한국의 | 中文 |
| ------- | ------ | ------ | ---- |
| en      | ja     | ko     | zh   |

**分类**

| 中字 AV      | 有碼 AV       | 素人 AV         | 無碼 AV         | 國產影片     | H 漫畫貼圖  |
| ------------ | ------------- | --------------- | --------------- | ------------ | ----------- |
| chinese_list | censored_list | amateurjav_list | uncensored_list | amateur_list | hcomic_list |

| 中字 AV 隨機   | 有碼 AV 隨機    | 素人 AV 隨機      | 無碼 AV 隨機      | 國產影片隨機   | H 漫畫貼圖隨機 |
| -------------- | --------------- | ----------------- | ----------------- | -------------- | -------------- |
| chinese_random | censored_random | amateurjav_random | uncensored_random | amateur_random | hcomic_random  |

**空间**

| 全部空間 | fembed (可下載) | streamsb (可下載) | doodstream | streamtape (可下載) | avgle | embedgram | videovard (可下載) |
| -------- | --------------- | ----------------- | ---------- | ------------------- | ----- | --------- | ------------------ |
| all      | 21              | 30                | 28         | 29                  | 17    | 34        | 33                 |

</Route>

### 制作商 {#7mmtv-zhi-zuo-shang}

<Route author="nczitzk" example="/7mmtv/zh/amateurjav_makersr/1752" path="/7mmtv/:language?/:category?/:id?" paramsDesc={['语言，见下表，默认为 `en` 即英语', '分类，见下表', '编号，见下表']} anticrawler="1">

**语言**

| English | 日本語 | 한국의 | 中文 |
| ------- | ------ | ------ | ---- |
| en      | ja     | ko     | zh   |

**分类与编号**

分类为 `amateurjav_makersr` 即 **素人 AV** 时，可选製作商编号有：

| 製作商                    | 编号 |
| ------------------------- | ---- |
| シロウト TV (SIRO)        | 1752 |
| ラグジュ TV (LUXU)        | 1586 |
| ナンパ TV (200GANA)       | 1751 |
| PRESTIGE PREMIUM(300MAAN) | 1318 |
| S-CUTE                    | 1069 |
| ARA                       | 1585 |

分类为 `uncensored_makersr` 即 **無碼 AV** 时，可选製作商编号有：

| 製作商                              | 编号 |
| ----------------------------------- | ---- |
| HEYZO                               | 17   |
| 東京熱 (Tokyo Hot)                  | 29   |
| 一本道 (1pondo)                     | 32   |
| カリビアンコム (Caribbeancom)       | 30   |
| カリビアンコム PPV (Caribbeancompr) | 40   |
| 天然むすめ (10musume)               | 31   |
| パコパコママ (pacopacomama)         | 36   |
| ガチん娘！(Gachinco)                | 35   |
| エッチな 4610                       | 34   |
| 人妻斬り 0930                       | 38   |
| エッチな 0930                       | 39   |
| トリプルエックス (XXX-AV)           | 126  |
| FC2                                 | 37   |

</Route>

## 91porn {#91porn}

:::tip 提示

91porn 有多个备用域名，路由默认使用永久域名 <https://91porn.com>。若该域名无法访问，可以通过在路由最后加上 `?domain=<域名>` 指定路由访问的域名。如指定备用域名为 <https://0122.91p30.com>，则在所有 91porn 路由最后加上 `?domain=0122.91p30.com` 即可，此时路由为 [`/91porn?domain=0122.91p30.com`](https://rsshub.app/91porn?domain=0122.91p30.com)

:::

### 今日排行 {#91porn-jin-ri-pai-hang}

<Route author="TonyRL" example="/91porn" path="/91porn/:lang?" paramsDesc={['语言，见下表，默认 `en_US`']}  radar="1" rssbud="1" anticrawler="1">

| English | 简体中文 | 繁體中文 |
| ------- | -------- | -------- |
| en_US   | cn_CN    | zh_ZH    |

</Route>

### 作者 {#91porn-zuo-zhe}

<Route author="TonyRL" example="/91porn/author/2d6d2iWm4vVCwqujAZbSrKt2QJCbbaObv9HQ21Zo8wGJWudWBg" path="/91porn/author/:uid/:lang?" paramsDesc={['作者 ID，可在 URL 中找到', '语言，见上表，默认 `en_US`']}  radar="1" rssbud="1" anticrawler="1" />

## 99% Invisible {#99%25-invisible}

### Transcript {#99%25-invisible-transcript}

<Route author="Ji4n1ng" example="/99percentinvisible/transcript" path="/99percentinvisible/transcript"/>

## A 姐分享 {#a-jie-fen-xiang}

<Route author="zhenhappy" example="/abskoop/nsfw" path="/abskoop/:type?" paramsDesc={['为空, 订阅主站点, `nsfw`订阅nsfw子站点']}>

## AV01（av01.tv） {#av01%EF%BC%88av01.tv%EF%BC%89}

### 演员 {#av01%EF%BC%88av01.tv%EF%BC%89-yan-yuan}

:::tip 提示
当没有给定排序类型时，默认为按上传时间排序及 mr

:::

<Route author="HXHL" example="/av01/actor/七沢みあ" path="/av01/actor/:name/:type?" paramsDesc={['女优名,必选-仅限日语,可直接在网站上找到','排序顺序,可选-可以是`mr` `rd` `bw` `tr` `lg`']}>

| 按上传时间排序 | 按上市时间排序 | 按观看次数排序 | 按评分排序 | 按时长排序 |
| -------------- | -------------- | -------------- | ---------- | ---------- |
| mr             | rd             | bw             | tr         | lg         |

</Route>

### 分类 {#av01%EF%BC%88av01.tv%EF%BC%89-fen-lei}

<Route author="HXHL" example="/av01/tag/中出し" path="/av01/tag/:name/:type?" paramsDesc={['分类名,必选-仅限日语,可直接在网站上找到','排序顺序,可选-可以是`mr` `rd` `bw` `tr` `lg`']}>

例如，路由 `/av01/tag/中出し` 应该输出 <https://www.av01.tv/tag/%E4%B8%AD%E5%87%BA%E3%81%97> 的排行榜单

</Route>

## Avgle {#avgle}

### 视频列表 {#avgle-shi-pin-lie-biao}

<Route author="I2IMk" example="/avgle/videos" path="/avgle/videos/:order?/:time?/:top?" paramsDesc={['视频次序, `bw` 观看中 / `mr` 最新 / `mv` 最多观看 / `tr` 最高评分 / `tf` 最多收藏 / `lg` 最长, 默认 `mv`', '视频的添加时间, `a` 所有 / `t` 今天 / `d` 本周 / `m` 本月, 默认 `m`', '按次序获取的视频数, 不大于 `250`, 默认 `30`']}/>

### 视频搜索 {#avgle-shi-pin-sou-suo}

<Route author="I2IMk" example="/avgle/search/橋本ありな" path="/avgle/search/:keyword/:order?/:time?/:top?" paramsDesc={['搜索的关键词', '视频次序, `bw` 观看中 / `mr` 最新 / `mv` 最多观看 / `tr` 最高评分 / `tf` 最多收藏 / `lg` 最长, 默认 `mr`', '视频的添加时间, `a` 所有 / `t` 今天 / `d` 本周 / `m` 本月, 默认 `a`', '按次序获取的视频数, 不大于 `250`, 默认 `30`']}/>

## Bandcamp {#bandcamp}

### Weekly {#bandcamp-weekly}

<Route author="nczitzk" example="/bandcamp/weekly" path="/bandcamp/weekly"/>

### Tag {#bandcamp-tag}

<Route author="nczitzk" example="/bandcamp/tag/united-kingdom" path="/bandcamp/tag/:tag?" paramsDesc={['标签，可在 URL 中找到']}/>

### Upcoming Live Streams {#bandcamp-upcoming-live-streams}

<Route author="nczitzk" example="/bandcamp/live" path="/bandcamp/live"/>

## BT 之家 {#bt-zhi-jia}

### 分类 {#bt-zhi-jia-fen-lei}

<Route author="nczitzk" example="/btzj" path="/btzj/:category?" paramsDesc={['分类，可在对应分类页 URL 中找到，默认为首页']}>

:::tip 提示

分类页中域名末尾到 `.htm` 前的字段即为对应分类，如 [电影](https://www.btbtt20.com/forum-index-fid-951.htm) <https://www.btbtt20.com/forum-index-fid-951.htm> 中域名末尾到 `.htm` 前的字段为 `forum-index-fid-951`，所以路由应为 [`/btzj/forum-index-fid-951`](https://rsshub.app/btzj/forum-index-fid-951)

部分分类页，如 [电影](https://www.btbtt20.com/forum-index-fid-951.htm)、[剧集](https://www.btbtt20.com/forum-index-fid-950.htm) 等，提供了更复杂的分类筛选。你可以将选项选中后，获得结果分类页 URL 中分类参数，构成路由。如选中分类 [高清电影 - 年份：2021 - 地区：欧美](https://www.btbtt20.com/forum-index-fid-1183-typeid1-0-typeid2-738-typeid3-10086-typeid4-0.htm) <https://www.btbtt20.com/forum-index-fid-1183-typeid1-0-typeid2-738-typeid3-10086-typeid4-0.htm> 中域名末尾到 `.htm` 前的字段为 `forum-index-fid-1183-typeid1-0-typeid2-738-typeid3-10086-typeid4-0`，所以路由应为 [`/btzj/forum-index-fid-1183-typeid1-0-typeid2-738-typeid3-10086-typeid4-0`](https://rsshub.app/btzj/forum-index-fid-1183-typeid1-0-typeid2-738-typeid3-10086-typeid4-0)

:::

基础分类如下：

| 交流                | 电影                | 剧集                | 高清电影             |
| ------------------- | ------------------- | ------------------- | -------------------- |
| forum-index-fid-975 | forum-index-fid-951 | forum-index-fid-950 | forum-index-fid-1183 |

| 音乐                | 动漫                | 游戏                | 综艺                 |
| ------------------- | ------------------- | ------------------- | -------------------- |
| forum-index-fid-953 | forum-index-fid-981 | forum-index-fid-955 | forum-index-fid-1106 |

| 图书                 | 美图                | 站务              | 科技                |
| -------------------- | ------------------- | ----------------- | ------------------- |
| forum-index-fid-1151 | forum-index-fid-957 | forum-index-fid-2 | forum-index-fid-952 |

| 求助                 | 音轨字幕             |
| -------------------- | -------------------- |
| forum-index-fid-1187 | forum-index-fid-1191 |

:::tip 提示

BT 之家的域名会变更，本路由以 <https://www.btbtt20.com> 为默认域名，若该域名无法访问，可以通过在路由后方加上 `?domain=<域名>` 指定路由访问的域名。如指定域名为 <https://www.btbtt15.com>，则在 `/btzj` 后加上 `?domain=btbtt15.com` 即可，此时路由为 [`/btzj?domain=btbtt15.com`](https://rsshub.app/btzj?domain=btbtt15.com)

如果加入了分类参数，直接在分类参数后加入 `?domain=<域名>` 即可。如指定分类 [剧集](https://www.btbtt20.com/forum-index-fid-950.htm) <https://www.btbtt20.com/forum-index-fid-950.htm> 并指定域名为 <https://www.btbtt15.com>，即在 `/btzj/forum-index-fid-950` 后加上 `?domain=btbtt15.com`，此时路由为 [`/btzj/forum-index-fid-950?domain=btbtt15.com`](https://rsshub.app/btzj/forum-index-fid-950?domain=btbtt15.com)

目前，你可以选择的域名有 `btbtt10-20.com` 共 10 个，或 `88btbbt.com`，该站也提供了专用网址查询工具。详见 [此贴](https://www.btbtt20.com/thread-index-fid-2-tid-4550191.htm)

:::

</Route>

### 最新种子 {#bt-zhi-jia-zui-xin-zhong-zi}

<Route author="zhang-wangz nczitzk" example="/btzj/base" path="/btzj/:type?" anticrawler="1" paramsDesc={['type,见下表']}>

| base                       | govern                   |
| -------------------------- | ------------------------ |
| <https://www.88btbtt.com/> | <http://www.2btjia.com/> |

</Route>

:::tip 提示

由于 BT 之家域名有多个。此 feed 对应[`https://www.88btbtt.com`](https://www.88btbtt.com)域名和[`http://www.2btjia.com/`](http://www.2btjia.com/)域名.
可空，默认为 base

:::

## CNTV {#cntv}

### 栏目 {#cntv-lan-mu}

:::tip 提示

栏目 ID 查找示例:
打开栏目具体某一期页面，F12 控制台输入`column_id`得到栏目 ID。

:::

<Route author="WhoIsSure Fatpandac" example="/cntv/TOPC1451528971114112" path="/cntv/:column" paramsDesc={['栏目ID, 可在对应CNTV栏目页面找到']}>

栏目

| 新闻联播             | 新闻周刊             | 天下足球             |
| -------------------- | -------------------- | -------------------- |
| TOPC1451528971114112 | TOPC1451559180488841 | TOPC1451551777876756 |

</Route>

## Coomer {#coomer}

### Artist {#coomer-artist}

<Route author="nczitzk" example="/coomer/artist/belledelphine" path="/coomer/artist/:id" paramsDesc={['Artist id，可在对应页面中找到']}/>

### Recent Posts {#coomer-recent-posts}

<Route author="nczitzk" example="/coomer/posts" path="/coomer/posts"/>

## DoMP4 影视 {#domp4-ying-shi}

### 最近更新 {#domp4-ying-shi-zui-jin-geng-xin}

<Route author="savokiss" example="/domp4/latest/vod" path="/domp4/latest/:type?" paramsDesc={['`vod` 代表电影，`tv` 代表电视剧，默认 vod']}  radar="1"/>

### 剧集订阅 {#domp4-ying-shi-ju-ji-ding-yue}

<Route author="savokiss" example="/domp4/detail/LBTANI22222I" path="/domp4/detail/:id" paramsDesc={['从剧集详情页 URL 处获取，如：`https://www.mp4kan.com/html/LBTANI22222I.html`，取 `.html` 前面部分']} radar="1" supportBT="1"/>

:::tip
由于大部分详情页是 `/html/xxx.html`，还有部分是 `/detail/123.html`，所以此处做了兼容，id 取 `xxx` 或者 `123` 都可以。
:::

## E-Hentai {#e-hentai}

### 分类 {#e-hentai-fen-lei}

<Route author="nczitzk" example="/e-hentai/category/manga" path="/e-hentai/category/:category?/:needTorrents?/:needImages?" paramsDesc={['分类，可在对应分类页中找到，默认为首页', '需要输出种子文件，填写 true/yes 表示需要，默认需要', '需要显示大图，填写 true/yes 表示需要，默认需要']}>

:::tip 提示

参数 **需要输出种子文件** 设置为 `true` `yes` `t` `y` 等值后，RSS 会携带种子文件的路径，以供支持 RSS 的下载工具订阅下载。

同理，参数 **需要显示大图** 启用后，RSS 会携带每项内容中的大图，而不只提供缩略图。

当然，选择 **需要输出种子文件**、**需要显示大图** 后获取内容时间需要更久，同时若指定获取数量过多，可能会出现获取超时错误。此时，可以在路由末尾处加上 `?limit=限制获取数目` 来限制获取条目数量，或直接修改全局的超时参数 `REQUEST_TIMEOUT`（详见文档中的 [其他应用配置](https://docs.rsshub.app/install/#pei-zhi-qi-ta-ying-yong-pei-zhi)）。

以下是一个例子：

选择浏览 [Manga 分类](https://e-hentai.org/manga)，并指定 **不携带种子文件**，**只显示大图**，并只 **输出 5 个**。由于 [Manga 分类](https://e-hentai.org/manga) 的 URL <https://e-hentai.org/manga> 中对应分类字段为 `manga`，所以对应路由为 [`/e-hentai/category/manga/no/yes?limit=5`](https://rsshub.app/e-hentai/category/manga/no/yes?limit=5)

:::

| Doujinshi | Manga | Artist CG | Game CG | Western |
| --------- | ----- | --------- | ------- | ------- |
| doujinshi | manga | artistcg  | gamecg  | western |

| Non-H | Image Set | Cosplay | Asian Porn | Misc | Popular |
| ----- | --------- | ------- | ---------- | ---- | ------- |
| non-h | imageset  | cosplay | asianporn  | misc | popular |

</Route>

### 标签 {#e-hentai-biao-qian}

<Route author="nczitzk" example="/e-hentai/tag/language:chinese" path="/e-hentai/tag/:tag?" paramsDesc={['标签，可在对应标签页中找到，默认为首页']}>

:::tip 提示

参数 **需要输出种子文件**、**需要显示大图** 的说明同上，以下是一个例子：

选择浏览 [language:chinese 标签](https://e-hentai.org/tag/language:chinese)，并指定 **携带种子文件**，**不显示大图**。由于 [language:chinese 标签](https://e-hentai.org/tag/language:chinese) 的 URL <https://e-hentai.org/tag/language:chinese> 中对应标签字段为 `language:chinese`，所以对应路由为 [`/e-hentai/tag/language:chinese/true/false`](https://rsshub.app/e-hentai/tag/language:chinese/true/false)

:::

</Route>

### 搜索 {#e-hentai-sou-suo}

<Route author="nczitzk" example="/e-hentai/search/f_search=haha" path="/e-hentai/search/:keyword?" paramsDesc={['关键字，可以在搜索结果页的 URL 中找到，默认为首页']}>

:::tip 提示

参数 **需要输出种子文件**、**需要显示大图** 的说明同上，以下是一个例子：

选择浏览 [f_search=cosplay 搜索结果](https://e-hentai.org/?f_search=cosplay)，并指定 **携带种子文件**，且 **显示大图**。由于 [f_search=cosplay 搜索结果](https://e-hentai.org/?f_search=cosplay) 的 URL <https://e-hentai.org/?f_search=cosplay> 中对应关键字字段为 `?` 后的 `f_search=cosplay`，所以对应路由为 [`/e-hentai/search/f_search=cosplay/y/y`](https://rsshub.app/e-hentai/search/f_search=cosplay/y/y)

:::

</Route>

## EZTV {#eztv}

:::tip 提示

网站提供了全部种子的 RSS: <https://eztv.io/ezrss.xml>

:::

## FIX 字幕侠 {#fix-zi-mu-xia}

### 分类 {#fix-zi-mu-xia-fen-lei}

<Route author="nczitzk" example="/zimuxia" path="/zimuxia/:category?" paramsDesc={['分类，见下表，默认为 ALL']} >

| ALL | FIX 德语社 | 欧美剧集 | 欧美电影 | 综艺 & 纪录 | FIX 日语社 | FIX 韩语社 | FIX 法语社 |
| --- | ---------- | -------- | -------- | ----------- | ---------- | ---------- | ---------- |
|     | 昆仑德语社 | 欧美剧集 | 欧美电影 | 综艺纪录    | fix 日语社 | fix 韩语社 | fix 法语社 |

</Route>

### 剧集 {#fix-zi-mu-xia-ju-ji}

<Route author="nczitzk" example="/zimuxia/portfolio/我们这一天" path="/zimuxia/portfolio/:id" paramsDesc={['剧集名，可在剧集页 URL 中找到']} />

### Lookup Torrents by IMDB ID {#fix-zi-mu-xia-lookup-torrents-by-imdb-id}

<Route author="Songkeys" example="/eztv/torrents/6048596" path="/eztv/torrents/:imdb_id" paramsDesc={['想搜寻的 show 的种子所对应的 IMDB ID, 可在 [IMDB](https://www.imdb.com) 官网找到']} supportBT="1"/>

## Hentaimama {#hentaimama}

### 近期更新 {#hentaimama-jin-qi-geng-xin}

<Route author="everyonus" example="/hentaimama/videos" path="/hentaimama/videos" />

## IBC 岩手放送 {#ibc-yan-shou-fang-song}

### イヤーマイッタマイッタ {#ibc-yan-shou-fang-song-%E3%82%A4%E3%83%A4%E3%83%BC%E3%83%9E%E3%82%A4%E3%83%83%E3%82%BF%E3%83%9E%E3%82%A4%E3%83%83%E3%82%BF}

<Route author="fengkx" example="/ibc/maitta" path="/ibc/maitta" supportPodcast="1" radar="1"/>

### ラジオ {#ibc-yan-shou-fang-song-%E3%83%A9%E3%82%B8%E3%82%AA}

<Route author="nczitzk" example="/ibc/radio/maitta" path="/ibc/radio/:id?" paramsDesc={['节目 id, 可在节目页 URL 中找到，默认为 イヤーマイッタマイッタ']} supportPodcast="1">

:::tip 提示

若订阅 [イヤーマイッタマイッタ](https://www.ibc.co.jp/radio/maitta/audio)，网址为 <https://www.ibc.co.jp/radio/maitta/audio>。截取 `https://www.ibc.co.jp/radio/` 到末尾的部分 `/audio/` 之间的 `maitta` 作为参数，此时路由为 [`/ibc/radio/maitta`](https://rsshub.app/ibc/radio/maitta)。

若订阅 [火曜ワイド「境界トラブル解決ラジオ！」](https://www.ibc.co.jp/radio/TochiKyokai/audio)，网址为 <https://www.ibc.co.jp/radio/TochiKyokai/audio>。截取 `https://www.ibc.co.jp/radio/` 到末尾的部分 `/audio/` 之间的 `TochiKyokai` 作为参数，此时路由为 [`/ibc/radio/TochiKyokai`](https://rsshub.app/ibc/radio/TochiKyokai)。

:::

</Route>

## JavBus {#javbus}

:::tip 提示

JavBus 有多个备用域名，本路由默认使用永久域名 <https://javbus.com> ，若该域名无法访问，可以通过在路由最后加上 `?domain=<域名>` 指定路由访问的域名。如指定备用域名为 <https://javsee.icu>，则在所有 JavBus 路由最后加上 `?domain=javsee.icu` 即可，此时路由为 [`/javbus?domain=javsee.icu`](https://rsshub.app/javbus?domain=javsee.icu)

值得注意的是 **欧美** 的域名与主域名有所不同，其备用域名亦然，本路由默认使用域名 <https://javbus.org> ，若该域名无法访问，可以通过在路由最后加上 `?western_domain=<域名>` 指定路由访问的域名。如指定备用域名为 <https://javsee.one>，则在所有 JavBus **欧美** 路由最后加上 `?western_domain=javsee.one` 即可，此时路由为 [`/javbus/western?western_domain=javsee.one`](https://rsshub.app/javbus/western?western_domain=javsee.one)

:::

### 有码 - 首页 {#javbus-you-ma---shou-ye}

<Route author="MegrezZhu CoderTonyChan nczitzk" example="/javbus" path="/javbus"/>

### 有码 - 分类 {#javbus-you-ma---fen-lei}

<Route author="MegrezZhu CoderTonyChan nczitzk" example="/javbus/genre/7g" path="/javbus/genre/:id" paramsDesc={['分类 id，可在对应分类页 URL 中找到']}>

更多分类前往 [有碼類別 - 影片](https://www.javbus.com/genre)

</Route>

### 有码 - 演员 {#javbus-you-ma---yan-yuan}

<Route author="MegrezZhu CoderTonyChan nczitzk" example="/javbus/star/2jv" path="/javbus/star/:id" paramsDesc={['演员 id，可在对应演员页 URL 中找到']}>

更多演员前往 [有碼女優 - 影片](https://www.javbus.com/actresses)

</Route>

### 有码 - 系列 {#javbus-you-ma---xi-lie}

<Route author="MegrezZhu CoderTonyChan Felix2yu nczitzk" example="/javbus/series/44q" path="/javbus/series/:id" paramsDesc={['系列 id，可在对应系列页 URL 中找到']} />

### 有码 - 制作商 {#javbus-you-ma---zhi-zuo-shang}

<Route author="MegrezZhu CoderTonyChan Felix2yu nczitzk" example="/javbus/studio/ej" path="/javbus/studio/:id" paramsDesc={['制作商 id，可在对应制作商页 URL 中找到']} />

### 有码 - 发行商 {#javbus-you-ma---fa-xing-shang}

<Route author="MegrezZhu CoderTonyChan Felix2yu nczitzk" example="/javbus/label/x8" path="/javbus/label/:id" paramsDesc={['发行商 id，可在对应发行商页 URL 中找到']} />

### 有码 - 导演 {#javbus-you-ma---dao-yan}

<Route author="MegrezZhu CoderTonyChan Felix2yu nczitzk" example="/javbus/director/4gv" path="/javbus/director/:id" paramsDesc={['导演 id，可在对应导演页 URL 中找到']} />

### 有码 - 搜索 {#javbus-you-ma---sou-suo}

<Route author="nczitzk" example="/javbus/search/REBD" path="/javbus/search/:keyword" paramsDesc={['关键字，默认为空']} />

### 无码 - 首页 {#javbus-wu-ma---shou-ye}

<Route author="MegrezZhu CoderTonyChan nczitzk" example="/javbus/uncensored" path="/javbus/uncensored"/>

### 无码 - 分类 {#javbus-wu-ma---fen-lei}

<Route author="MegrezZhu CoderTonyChan nczitzk" example="/javbus/uncensored/genre/1bc" path="/javbus/uncensored/genre/:id" paramsDesc={['分类 id，可在对应分类页 URL 中找到']}>

更多分类前往 [無碼類別 - 影片](https://www.javbus.com/uncensored/genre)

</Route>

### 无码 - 演员 {#javbus-wu-ma---yan-yuan}

<Route author="MegrezZhu CoderTonyChan nczitzk" example="/javbus/uncensored/star/b5b" path="/javbus/uncensored/star/:id" paramsDesc={['演员 id，可在对应演员页 URL 中找到']}>

更多演员前往 [無碼女優 - 影片](https://www.javbus.com/uncensored/actresses)

</Route>

### 无码 - 系列 {#javbus-wu-ma---xi-lie}

<Route author="MegrezZhu CoderTonyChan Felix2yu nczitzk" example="/javbus/uncensored/series/1ft" path="/javbus/uncensored/series/:id" paramsDesc={['系列 id，可在对应系列页 URL 中找到']} />

### 无码 - 制作商 {#javbus-wu-ma---zhi-zuo-shang}

<Route author="MegrezZhu CoderTonyChan Felix2yu nczitzk" example="/javbus/uncensored/studio/3n" path="/javbus/uncensored/studio/:id" paramsDesc={['制作商 id，可在对应制作商页 URL 中找到']} />

### 无码 - 搜索 {#javbus-wu-ma---sou-suo}

<Route author="nczitzk" example="/javbus/uncensored/search/HEYZO" path="/javbus/uncensored/search/:keyword" paramsDesc={['关键字，默认为空']} />

### 欧美 - 首页 {#javbus-ou-mei---shou-ye}

<Route author="MegrezZhu CoderTonyChan nczitzk" example="/javbus/western" path="/javbus/western"/>

### 欧美 - 分类 {#javbus-ou-mei---fen-lei}

<Route author="MegrezZhu CoderTonyChan nczitzk" example="/javbus/western/genre/86" path="/javbus/western/genre/:id" paramsDesc={['分类 id，可在对应分类页 URL 中找到']}>

更多分类前往 [類別 - 影片](https://www.javbus.org/genre)

</Route>

### 欧美 - 演员 {#javbus-ou-mei---yan-yuan}

<Route author="MegrezZhu CoderTonyChan nczitzk" example="/javbus/western/star/4hv" path="/javbus/western/star/:id" paramsDesc={['演员 id，可在对应演员页 URL 中找到']}>

更多演员前往 [歐美演員 - 影片](https://www.javbus.org/actresses)

</Route>

### 欧美 - 系列 {#javbus-ou-mei---xi-lie}

<Route author="MegrezZhu CoderTonyChan Felix2yu nczitzk" example="/javbus/western/series/20" path="/javbus/western/series/:id" paramsDesc={['系列 id，可在对应系列页 URL 中找到']} />

### 欧美 - 制作商 {#javbus-ou-mei---zhi-zuo-shang}

<Route author="nczitzk" example="/javbus/western/studio/4" path="/javbus/western/studio/:id" paramsDesc={['制作商 id，可在对应制作商页 URL 中找到']} />

### 欧美 - 搜索 {#javbus-ou-mei---sou-suo}

<Route author="nczitzk" example="/javbus/western/search/Brazzers" path="/javbus/western/search/:keyword" paramsDesc={['关键字，默认为空']} />

## JavDB {#javdb}

:::tip 提示

JavDB 有多个备用域名，本路由默认使用永久域名 <https://javdb.com> ，若该域名无法访问，可以通过在路由最后加上 `?domain=<域名>` 指定路由访问的域名。如指定备用域名为 <https://javdb36.com>，则在所有 JavDB 路由最后加上 `?domain=javdb36.com` 即可，此时路由为 [`/javdb?domain=javdb36.com`](https://rsshub.app/javdb?domain=javdb36.com)

如果加入了 **分類** 参数，直接在分類参数后加入 `?domain=<域名>` 即可。如指定分類 URL 为 <https://javdb.com/tags?c2=5&c10=1> 并指定备用域名为 <https://javdb36.com>，即在 `/javdb/tags/c2=5&c10=1` 最后加上 `?domain=javdb36.com`，此时路由为 [`/javdb/tags/c2=5&c10=1?domain=javdb36.com`](https://rsshub.app/javdb/tags/c2=5&c10=1?domain=javdb36.com)

**排行榜**、**搜索**、**演員**、**片商** 参数同适用于 **分類** 参数的上述规则

:::

:::tip 提示

你可以通过指定 `limit` 参数来获取特定数量的条目，即可以通过在路由后方加上 `?limit=25`，默认为单次获取 20 个条目，即默认 `?limit=20`

因为该站有反爬检测，所以不应将此值调整过高

:::

### 主页 {#javdb-zhu-ye}

<Route author="nczitzk" example="/javdb" path="/javdb/:category?/:sort?/:filter?" paramsDesc={['分类，见下表，默认为 `有碼`', '排序，见下表，默认为 `磁鏈更新排序`', '过滤，见下表，默认为 `可下载`']} anticrawler="1">

分类

| 有碼     | 無碼       | 歐美    |
| -------- | ---------- | ------- |
| censored | uncensored | western |

排序

| 发布日期排序 | 磁鏈更新排序 |
| ------------ | ------------ |
| 1            | 2            |

过滤

| 全部 | 可下载 | 含字幕 | 含短評 |
| ---- | ------ | ------ | ------ |
| 0    | 1      | 2      | 3      |

</Route>

### 分類 {#javdb-fen-lei}

<Route author="nczitzk" example="/javdb/tags/c2=5&c10=1" path="/javdb/tags/:query?/:category?" paramsDesc={['筛选，默认为 `c10=1`', '分类，见下表，默认为 `有碼`']} anticrawler="1">

:::tip 提示

在 [分類](https://javdb.com/tags) 中选定分类后，URL 中 `tags?` 后的字段即为筛选参数。

如 <https://javdb.com/tags?c2=5&c10=1> 中 `c2=5&c10=1` 为筛选参数。

:::

分类

| 有碼     | 無碼       | 歐美    |
| -------- | ---------- | ------- |
| censored | uncensored | western |

</Route>

### 排行榜 {#javdb-pai-hang-bang}

<Route author="nczitzk" example="/javdb/rankings" path="/javdb/rankings/:category?/:time?" paramsDesc={['分类，见下表，默认为 `有碼`', '时间，见下表，默认为 `日榜`']} anticrawler="1">

分类

| 有碼     | 無碼       | 歐美    |
| -------- | ---------- | ------- |
| censored | uncensored | western |

时间

| 日榜  | 週榜   | 月榜    |
| ----- | ------ | ------- |
| daily | weekly | monthly |

</Route>

### 搜索 {#javdb-sou-suo}

<Route author="nczitzk" example="/javdb/search/巨乳" path="/javdb/search/:keyword?/:filter?/:sort?" paramsDesc={['关键字，默认为空', '过滤，见下表，默认为 `可播放`', '排序，见下表，默认为 `按相关度排序`']} anticrawler="1">

过滤

| 全部 | 占位 | 可播放   | 單體作品 | 演員  | 片商  | 導演     | 系列   | 番號 | 可下載   | 字幕  | 預覽圖  |
| ---- | ---- | -------- | -------- | ----- | ----- | -------- | ------ | ---- | -------- | ----- | ------- |
|      | none | playable | single   | actor | maker | director | series | code | download | cnsub | preview |

排序

| 按相关度排序 | 按发布时间排序 |
| ------------ | -------------- |
| 0            | 1              |

</Route>

### 演員 {#javdb-yan-yuan}

<Route author="nczitzk" example="/javdb/actors/R2Vg" path="/javdb/actors/:id/:filter?" paramsDesc={['编号，可在演员页 URL 中找到', '过滤，见下表，默认为 `全部`']} anticrawler="1">

| 全部 | 可播放 | 單體作品 | 可下載 | 含字幕 |
| ---- | ------ | -------- | ------ | ------ |
|      | p      | s        | d      | c      |

所有演员编号参见 [演員庫](https://javdb.com/actors)

</Route>

### 系列 {#javdb-xi-lie}

<Route author="nczitzk" example="/javdb/series/1NW" path="/javdb/series/:id/:filter?" paramsDesc={['编号，可在系列页 URL 中找到', '过滤，见下表，默认为 `全部`']} anticrawler="1">

| 全部 | 可播放   | 單體作品 | 可下載   | 字幕  | 預覽圖  |
| ---- | -------- | -------- | -------- | ----- | ------- |
|      | playable | single   | download | cnsub | preview |

所有系列编号参见 [系列庫](https://javdb.com/series)

</Route>

### 片商 {#javdb-pian-shang}

<Route author="nczitzk" example="/javdb/makers/7R" path="/javdb/makers/:id/:filter?" paramsDesc={['编号，可在片商页 URL 中找到', '过滤，见下表，默认为 `全部`']} anticrawler="1">

| 全部 | 可播放   | 單體作品 | 可下載   | 字幕  | 預覽圖  |
| ---- | -------- | -------- | -------- | ----- | ------- |
|      | playable | single   | download | cnsub | preview |

所有片商编号参见 [片商庫](https://javdb.com/makers)

</Route>

### 清单 {#javdb-qing-dan}

<Route author="dddepg" example="/javdb/lists/2GPgB" path="/lists/:id/:filter?/:sort?" paramsDesc={['编号，可在清单页 URL 中找到', '过滤，见下表，默认为 `全部`，需要占位时可设置为 `none`', '排序，见下表，默认为 `加入时间排序`']} anticrawler="1">

过滤

| 全部 | 占位 | 可播放   | 單體作品 | 含磁链   | 含字幕 | 預覽圖  |
| ---- | ---- | -------- | -------- | -------- | ------ | ------- |
|      | none | playable | single   | download | cnsub  | preview |

排序

| 加入时间排序 | 发布时间排序 |
| ------------ | ------------ |
| 0            | 1            |

</Route>

## JAVLibrary {#javlibrary}

### 最近讨论的影片 {#javlibrary-zui-jin-tao-lun-de-ying-pian}

<Route author="nczitzk" example="/javlibrary/update/cn" path="/javlibrary/update/:language?" paramsDesc={['语言，见上表，默认为日语，即 `ja`']} radar="1" rssbud="1"/>

### 新发行的影片 {#javlibrary-xin-fa-xing-de-ying-pian}

<Route author="nczitzk" example="/javlibrary/newrelease/cn" path="/javlibrary/newrelease/:language?/:mode?" paramsDesc={['语言，见上表，默认为日语，即 `ja`', '模式，见下表，默认为有评论的影片（依发行日），即 `1`']} radar="1" rssbud="1">

| 有评论的影片（依发行日） | 所有的影片（依发行日） |
| ------------------------ | ---------------------- |
| 1                        | 2                      |

</Route>

### 最新加入的影片 {#javlibrary-zui-xin-jia-ru-de-ying-pian}

<Route author="nczitzk" example="/javlibrary/newentries/cn" path="/javlibrary/newentries/:language?" paramsDesc={['语言，见上表，默认为日语，即 `ja`']} radar="1" rssbud="1"/>

### 最想要的影片 {#javlibrary-zui-xiang-yao-de-ying-pian}

<Route author="nczitzk" example="/javlibrary/mostwanted/cn" path="/javlibrary/mostwanted/:language?/:mode?" paramsDesc={['语言，见上表，默认为日语，即 `ja`', '模式，见下表，默认为上个月，即 `1`']} radar="1" rssbud="1">

| 上个月 | 全部 |
| ------ | ---- |
| 1      | 2    |

</Route>

### 评价最高的影片 {#javlibrary-ping-jia-zui-gao-de-ying-pian}

<Route author="nczitzk" example="/javlibrary/bestrated/cn" path="/javlibrary/bestrated/:language?/:mode?" paramsDesc={['语言，见上表，默认为日语，即 `ja`', '模式，见下表，默认为上个月，即 `1`']} radar="1" rssbud="1">

| 上个月 | 全部 |
| ------ | ---- |
| 1      | 2    |

</Route>

### 影片依分类 {#javlibrary-ying-pian-yi-fen-lei}

<Route author="nczitzk" example="/javlibrary/genre/amjq/cn" path="/javlibrary/genre/:genre?/:language?/:mode?" paramsDesc={['分类，默认为极致·性高潮，即 `amjq`', '语言，见上表，默认为日语，即 `ja`', '模式，见下表，默认为有评论的影片（依发行日），即 `1`']} radar="1" rssbud="1">

| 有评论的影片（依发行日） | 所有的影片（依发行日） |
| ------------------------ | ---------------------- |
| 1                        | 2                      |

:::tip 提示

全部分类参见 [依分类](https://www.javlibrary.com/cn/genres.php)

:::

</Route>

### 影片按演员 {#javlibrary-ying-pian-an-yan-yuan}

<Route author="Diygod junfengP nczitzk" example="/javlibrary/star/abbds/cn" path="/javlibrary/star/:id/:language?/:mode?" paramsDesc={['演员 id，可在对应演员页 URL 中找到', '语言，见上表，默认为日语，即 `ja`', '模式，见下表，默认为有评论的影片（依发行日），即 `1`']} radar="1" rssbud="1">

| 有评论的影片（依发行日） | 所有的影片（依发行日） |
| ------------------------ | ---------------------- |
| 1                        | 2                      |

:::tip 提示

按排行榜查看演员可前往 [排行榜](https://www.javlibrary.com/cn/star_mostfav.php)

全部演员参见 [名鑑](https://www.javlibrary.com/cn/star_list.php)

:::

</Route>

### 最佳评论 {#javlibrary-zui-jia-ping-lun}

<Route author="DCJaous nczitzk" example="/javlibrary/bestreviews/cn" path="/javlibrary/bestreviews/:language?/:mode?" paramsDesc={['语言，见上表，默认为日语，即 `ja`', '模式，见下表，默认为上个月，即 `1`']} radar="1" rssbud="1">

| 上个月 | 全部 |
| ------ | ---- |
| 1      | 2    |

</Route>

### 用户发表的文章 {#javlibrary-yong-hu-fa-biao-de-wen-zhang}

<Route author="Diygod junfengP nczitzk" example="/javlibrary/userposts/mangudai/cn" path="/javlibrary/userposts/:id/:language?" paramsDesc={['用户 id，可在对应用户页 URL 中找到', '语言，见上表，默认为日语，即 `ja`']} radar="1" rssbud="1"/>

### 用户相关的影片 {#javlibrary-yong-hu-xiang-guan-de-ying-pian}

<Route author="Diygod junfengP nczitzk" example="/javlibrary/userwatched/mangudai/cn" path="/javlibrary/:type/:id/:language?" paramsDesc={['相关类型，见下表', '用户 id，可在对应用户页 URL 中找到', '语言，见上表，默认为日语，即 `ja`']} radar="1" rssbud="1">

| 用户想要的影片 | 用户看过的影片 | 用户拥有的影片 |
| -------------- | -------------- | -------------- |
| userwanted     | userwatched    | userowned      |

</Route>

## Last.fm {#last.fm}

### 用户播放记录 {#last.fm-yong-hu-bo-fang-ji-lu}

<Route author="hoilc" example="/lastfm/recent/yeFoenix" path="/lastfm/recent/:user" paramsDesc={['Last.fm 用户名']} radar="1" rssbud="1"/>

### 用户 Love 记录 {#last.fm-yong-hu-love-ji-lu}

<Route author="hoilc" example="/lastfm/loved/yeFoenix" path="/lastfm/loved/:user" paramsDesc={['Last.fm 用户名']} radar="1" rssbud="1"/>

### 站内 Top 榜单 {#last.fm-zhan-nei-top-bang-dan}

<Route author="hoilc" example="/lastfm/top/spain" path="/lastfm/top/:country?" paramsDesc={['国家或地区, 需要符合`ISO 3166-1`的英文全称, 可参考`https://zh.wikipedia.org/wiki/ISO_3166-1二位字母代码#正式分配代码`']} radar="1" rssbud="1"/>

## Melon {#melon}

### Chart {#melon-chart}

<Route author="nczitzk" example="/melon/chart" path="/melon/chart/:category?" paramsDesc={['分类，见下表，默认为24H']}>

| 24H | 일간 | 주간 | 월간  |
| --- | ---- | ---- | ----- |
|     | day  | week | month |

</Route>

## Mixcloud {#mixcloud}

### 用户 {#mixcloud-yong-hu}

<Route author="Misaka13514" example="/mixcloud/dholbach/uploads" path="/mixcloud/:username/:type?" paramsDesc={['用户名，可在对应用户页 URL 中找到', '分类，见下表，默认为 uploads']} radar="1" rssbud="1" supportPodcast="1">

| Shows   | Favorites | History | Stream |
| ------- | --------- | ------- | ------ |
| uploads | favorites | listens | stream |

</Route>

## Mp4Ba {#mp4ba}

### 影视分类 {#mp4ba-ying-shi-fen-lei}

<Route author="SettingDust wolfyu1991"  example="/mp4ba/6" path="/mp4ba/:param" paramsDesc={['类型']} supportBT="1"/>

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

### 影视搜索 {#mp4ba-ying-shi-sou-suo}

<Route author="wolfyu1991"  example="/mp4ba/复仇者联盟" path="/mp4ba/:keyword" paramsDesc={['搜索关键字']} supportBT="1"/>

## MQube {#mqube}

### 全站最近更新 {#mqube-quan-zhan-zui-jin-geng-xin}

<Route author="hoilc" example="/mqube/latest" path="/mqube/latest" radar="1" rssbud="1"/>

### 全站每日排行 {#mqube-quan-zhan-mei-ri-pai-hang}

<Route author="hoilc" example="/mqube/top" path="/mqube/top" radar="1" rssbud="1"/>

### 个人最近更新 {#mqube-ge-ren-zui-jin-geng-xin}

<Route author="hoilc" example="/mqube/user/mukamui_v_p" path="/mqube/user/:user" paramsDesc={['用户 ID, 可以在个人资料页的 URL 中找到']} radar="1" rssbud="1"/>

### 标签最近更新 {#mqube-biao-qian-zui-jin-geng-xin}

<Route author="hoilc" example="/mqube/tag/UTAU" path="/mqube/tag/:tag" paramsDesc={['标签名称, 可参考`https://mqube.net/search/tag`']} radar="1" rssbud="1"/>

## NEW 字幕组 {#new-zi-mu-zu}

### 分类 {#new-zi-mu-zu-fen-lei}

<Route author="nczitzk" example="/newzmz" path="/newzmz/:category?" paramsDesc={['分类，见下表，默认为最近更新']}>

| 最近更新 | 剧集推荐 | 电影推荐 | 纪录片推荐 | 动画推荐 | 真人秀推荐 |
| -------- | -------- | -------- | ---------- | -------- | ---------- |
| 1        | 2        | 3        | 4          | 5        | 6          |

</Route>

### 指定剧集 {#new-zi-mu-zu-zhi-ding-ju-ji}

<Route author="nczitzk" example="/newzmz/qEzRyY3v" path="/newzmz/:id?" paramsDesc={['剧集 id，可在剧集下载页 URL 中找到']}>

如：雪国列车（剧版）的下载页 URL 为 `https://ysfx.tv/view/qEzRyY3v.html`，即剧集 id 为 `qEzRyY3v`。

</Route>

## Nyaa {#nyaa}

### 搜索结果 {#nyaa-sou-suo-jie-guo}

<Route author="Lava-Swimmer noname1776" example="/nyaa/search/psycho-pass" path="/nyaa/search/:query?" paramsDesc={['搜索关键字']} supportBT="1" radar="1"/>

### 用户 {#nyaa-yong-hu}

<Route author="Lava-Swimmer noname1776" example="/nyaa/user/silver-khaie" path="/nyaa/user/:username?" paramsDesc={['用户名']} supportBT="1" radar="1"/>

### 对指定用户进行搜索 {#nyaa-dui-zhi-ding-yong-hu-jin-xing-sou-suo}

<Route author="Lava-Swimmer noname1776" example="/nyaa/user/silver-khaie/search/a" path="/nyaa/user/:username/search/:query?" paramsDesc={['用户名', '搜索关键词']} supportBT="1" radar="1"/>

### Sukebei 搜索结果 {#nyaa-sukebei-sou-suo-jie-guo}

<Route author="Lava-Swimmer noname1776" example="/nyaa/sukebei/search/hi" path="/nyaa/sukebei/search/:query?" paramsDesc={['搜索关键字']} supportBT="1" radar="1"/>

### Sukebei 用户 {#nyaa-sukebei-yong-hu}

<Route author="Lava-Swimmer noname1776" example="/nyaa/sukebei/user/Tarakara168" path="/nyaa/sukebei/user/:username?" paramsDesc={['用户名']} supportBT="1" radar="1"/>

### Sukebei 对指定用户进行搜索 {#nyaa-sukebei-dui-zhi-ding-yong-hu-jin-xing-sou-suo}

<Route author="Lava-Swimmer noname1776" example="/nyaa/sukebei/user/Tarakara168/search/a" path="/nyaa/sukebei/user/:username/search/:query?" paramsDesc={['用户名', '搜索关键词']} supportBT="1" radar="1"/>

## OneJAV {#onejav}

:::tip 提示

官方提供的订阅源不支持 BT 下载订阅，地址为 <https://onejav.com/feeds/>

:::

### OneJAV BT {#onejav-onejav-bt}

<Route author="monsterxcn" example="/onejav/popular/30" path="/onejav/:type/:key?" paramsDesc={['类型', '关键词']} supportBT="1" radar="1">

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

## PornHub {#pornhub}

### 分类 {#pornhub-fen-lei}

<Route author="nczitzk" example="/pornhub/category/popular-with-women" path="/pornhub/category/:caty" paramsDesc={['类别，参见 [categories](https://cn.pornhub.com/webmasters/categories)']}/>

### 搜索 {#pornhub-sou-suo}

<Route author="nczitzk" example="/pornhub/search/stepsister" path="/pornhub/search/:keyword" paramsDesc={['关键字']}/>

### 用户 {#pornhub-yong-hu}

<Route author="I2IMk queensferryme" example="/pornhub/users/pornhubmodels" path="/pornhub/:language?/users/:username" paramsDesc={['语言，下文会提到', '用户名, 对应其专页地址的后面部分, 如 `pornhub.com/users/pornhubmodels`']} />

### 素人（Verified amateur / Model） {#pornhub-su-ren-%EF%BC%88verified-amateur-%2F-model%EF%BC%89}

<Route author="I2IMk queensferryme" example="/pornhub/model/stacy-starando" path="/pornhub/:language?/model/:username/:sort?" paramsDesc={['语言，下文会提到', '用户名, 对应其专页地址的后面部分, 如 `pornhub.com/model/stacy-starando`', '排序方式, 下文会提到']} />

### 色情明星（Verified model / Pornstar） {#pornhub-se-qing-ming-xing-%EF%BC%88verified-model-%2F-pornstar%EF%BC%89}

<Route author="I2IMk queensferryme" example="/pornhub/pornstar/june-liu" path="/pornhub/:language?/pornstar/:username/:sort?" paramsDesc={['语言，下文会提到', '用户名, 对应其专页地址的后面部分, 如 `pornhub.com/pornstar/june-liu`', '排序方式, 下文会提到']} />

**排序方式 `sort`**

| mr                   | mv                     | tr                 | lg           | cm          |
| -------------------- | ---------------------- | ------------------ | ------------ | ----------- |
| Most Recent 最新精选 | Most Viewed 最多次观看 | Top Rated 评价最好 | Longest 最长 | Newest 最新 |

### 视频列表 {#pornhub-shi-pin-lie-biao}

<Route author="I2IMk queensferryme" example="/pornhub/category_url/video%3Fc%3D15%26o%3Dmv%26t%3Dw%26cc%3Djp" path="/pornhub/:language?/category_url/:url?" paramsDesc={['语言，下文会提到', '相对路径, `pornhub.com/` 后的部分, 需手动 URL 编码']}/>

**语言 `language`**

参见 [Pornhub F.A.Qs](https://help.pornhub.com/hc/en-us/articles/360044327034-How-do-I-change-the-language-)，放空则默认为英文。常见的有：

-   `cn`（中文），对应中文站 <https://cn.pornhub.com/>；
-   `jp`（日语），对应日语站 <https://jp.pornhub.com/> 等。

## Prestige 蚊香社 {#prestige-wen-xiang-she}

### 系列作品 {#prestige-wen-xiang-she-xi-lie-zuo-pin}

<Route author="minimalistrojan" example="/prestige-av/series/847" path="/prestige-av/series/:mid/:sort?" paramsDesc={['系列编号', '排序方式，缺省为 near（最新）']} puppeteer="1">

| 人气    | 最新 | 发售日期 | 标题顺序 | 价格升序 | 价格降序 |
| ------- | ---- | -------- | -------- | -------- | -------- |
| popular | near | date     | title    | low      | high     |

</Route>

## rs05 人生 05 电影 {#rs05-ren-sheng-05-dian-ying}

### rs05 电影列表 {#rs05-ren-sheng-05-dian-ying-rs05-dian-ying-lie-biao}

<Route author="monner-henster" example="/rs05/rs05" path="/rs05/rs05"/>

## s-hentai {#s-hentai}

### Category {#s-hentai-category}

<Route author="nczitzk" example="/s-hentai" path="/s-hentai/:id?" paramsDesc={['id，见下表，默认为 ready-to-download']}>

| Doujin | HCG | Games・Animes | Voices・ASMR | Ready to Download |
| ------ | --- | ------------- | ------------ | ----------------- |
| 1      | 2   | 3             | 4            | ready-to-download |

</Route>

## Sankaku Complex {#sankaku-complex}

### Post {#sankaku-complex-post}

<Route author="xyqfer" example="/sankakucomplex/post" path="/sankakucomplex/post"/>

## sexinsex {#sexinsex}

### 分区帖子 {#sexinsex-fen-qu-tie-zi}

<Route author="cnzgray" example="/sexinsex/230/634" path="/sexinsex/:id/:type?" paramsDesc={['分区 id, 可在分区页 URL 中找到', '类型 id, 可在分区类型过滤后的 URL 中找到']}>

> 注意：并非所有的分区都有子类型，可以参考亚洲成人有码原创区的 \[字幕] 这一子类型。

| 亚洲成人无码原创区 | 亚洲成人有码原创区 | 欧美无码原创区 | 欧美无码区 | 亚洲有码薄码区 |
| ------------------ | ------------------ | -------------- | ---------- | -------------- |
| 143                | 230                | 229            | 77         | 58             |

</Route>

## SoundCloud {#soundcloud}

### Tracks {#soundcloud-tracks}

<Route author="fallenhh" example="/soundcloud/tracks/angeart" path="/soundcloud/tracks/:user" paramsDesc={['用户名']} />

## Spotify {#spotify}

### 艺术家专辑 {#spotify-yi-shu-jia-zhuan-ji}

<Route author="outloudvi" example="/spotify/artist/6k9TBCxyr4bXwZ8Y21Kwn1" path="/spotify/artist/:id" paramsDesc={['艺术家 ID']} selfhost="1"/>

### 播放列表 {#spotify-bo-fang-lie-biao}

<Route author="outloudvi" example="/spotify/playlist/4UBVy1LttvodwivPUuwJk2" path="/spotify/playlist/:id" paramsDesc={['播放列表 ID']} selfhost="1"/>

### 个人 Saved Tracks {#spotify-ge-ren-saved-tracks}

<Route author="outloudvi" example="/spotify/saved/50" path="/spotify/saved/:limit?" paramsDesc={['歌曲数量，默认为 50']} selfhost="1"/>

### 个人 Top Tracks {#spotify-ge-ren-top-tracks}

<Route author="outloudvi" example="/spotify/top/tracks" path="/spotify/top/tracks" selfhost="1"/>

### 个人 Top Artists {#spotify-ge-ren-top-artists}

<Route author="outloudvi" example="/spotify/top/artists" path="/spotify/top/artists" selfhost="1"/>

### 节目 {#spotify-jie-mu}

<Route author="caiohsramos" example="/spotify/show/38bS44xjbVVZ3No3ByF1dJ" path="/spotify/show/:id" paramsDesc={['节目 ID']} selfhost="1"/>

## Sub HD {#sub-hd}

### 字幕 {#sub-hd-zi-mu}

<Route author="laampui nczitzk" example="/subhd/sub/new" path="/subhd/sub/:category?" paramsDesc={['分类，见下表，默认为最新']}>

| 最新字幕 | 热门字幕 | 剧集字幕 | 电影字幕 |
| -------- | -------- | -------- | -------- |
| new      | top      | tv       | movie    |

</Route>

### 字幕组 {#sub-hd-zi-mu-zu}

<Route author="nczitzk" example="/subhd/zu/14" path="/subhd/zu/:category?" paramsDesc={['字幕组，见下表，默认为 YYeTs字幕组']}>

| YYeTs 字幕组 | F.I.X 字幕侠 | 深影字幕组 | 擦枪字幕组 | 哒哒字幕组 | 迪幻字幕组 | 伊甸园字幕组 | H-SGDK 字幕组 | 蓝血字幕组 | GA 字幕组 | CC 标准电影字幕组 | NEW 字幕组 | Orange 字幕组 | 圣城家园 SCG 字幕组 | 纪录片之家字幕组 |
| ------------ | ------------ | ---------- | ---------- | ---------- | ---------- | ------------ | ------------- | ---------- | --------- | ----------------- | ---------- | ------------- | ------------------- | ---------------- |
| 14           | 28           | 2          | 118        | 132        | 20         | 1            | 18            | 71         | 11        | 75                | 130        | 66            | 19                  | 10               |

</Route>

## The Movie Database {#the-movie-database}

:::tip 提示
路由中的语言参数可参考 <https://developers.themoviedb.org/3/getting-started/languages>。
:::

### 系列 {#the-movie-database-xi-lie}

<Route author="x2cf" example="/themoviedb/collection/131292/zh" path="/themoviedb/collection/:id/:lang?" paramsDesc={['系列 ID', '语言']} radar="1" rssbud="1" />

### 热门 {#the-movie-database-re-men}

<Route author="x2cf" example="/themoviedb/trending/tv/day/zh" path="/themoviedb/trending/:mediaType/:timeWindow/:lang?" paramsDesc={['`movie` 或 `tv`', '`day` 或 `week`', '语言']} radar="1" rssbud="1" />

### 剧集系列 {#the-movie-database-ju-ji-xi-lie}

<Route author="x2cf" example="/themoviedb/tv/70593/seasons/zh" path="/themoviedb/tv/:id/seasons/:lang?" paramsDesc={['剧集 ID', '语言']} radar="1" rssbud="1" />

### 剧集章节 {#the-movie-database-ju-ji-zhang-jie}

<Route author="x2cf" example="/themoviedb/tv/70593/seasons/1/episodes/zh" path="/themoviedb/tv/:id/seasons/:seasonNumber/episodes/:lang?" paramsDesc={['剧集 ID', '季号', '语言']} radar="1" rssbud="1" />

### 片单 {#the-movie-database-pian-dan}

<Route author="x2cf" example="/themoviedb/tv/top-rated/zh" path="/themoviedb/:mediaType/:sheet/:lang?" paramsDesc={['`movie` 或 `tv`', '片单，见下表', '语言']} radar="1" rssbud="1">

当 `mediaType` 为 `tv` 时，`sheet` 的值如下：

| 今日播出     | 电视播出中 | 高分      |
| ------------ | ---------- | --------- |
| airing-today | on-the-air | top-rated |

当 `mediaType` 为 `movie` 时，`sheet` 的值如下：

| 正在上映    | 即将上映 | 高分      |
| ----------- | -------- | --------- |
| now-playing | upcoming | top-rated |

</Route>

## Trakt.tv {#trakt.tv}

### 用户收藏 {#trakt.tv-yong-hu-shou-cang}

<Route author="hoilc" example="/trakt/collection/tomyangsh/movies" path="/trakt/collection/:username/:type?" paramsDesc={['用户名','收藏类型，可选`movies`,`shows`,`episodes`,`all`，默认为`all`']} radar="1" rssbud="1" />

## U3C3 {#u3c3}

### 关键词搜索 {#u3c3-guan-jian-ci-sou-suo}

<Route author="noname1897" example="/u3c3/search/新片速递" path="/u3c3/search/:keyword?" paramsDesc={['搜索关键字']} supportBT="1" radar="1" />

### 分类 {#u3c3-fen-lei}

<Route author="noname1897" example="/u3c3/U3C3" path="/u3c3/:type?" paramsDesc={['类别名称，注意大小写，需要严格对应！可选的 `type` 有 `U3C3`/`Video`/`Photo`/`Book`/`Game`/`Software`/`Other`，如果不设置 type，则展示首页']} supportBT="1" radar="1" />

## U9A9 {#u9a9}

### 首页 {#u9a9-shou-ye}

<Route author="TonyRL" example="/u9a9" path="/u3c3/:preview?" paramsDesc={['是否显示预览图，预设为关，任意值为开']} supportBT="1" radar="1" />

### 搜索 {#u9a9-sou-suo}

<Route author="TonyRL" example="/u9a9/search/新片速递" path="/u3c3/search/:keyword/:preview?" paramsDesc={['搜索关键字', '是否显示预览图，预设为关，任意值为开']} supportBT="1" radar="1" />

## Yahoo! テレビ {#yahoo!-%E3%83%86%E3%83%AC%E3%83%93}

### 番組検索 {#yahoo!-%E3%83%86%E3%83%AC%E3%83%93-fan-zu-jian-suo}

<Route author="sakamossan" example="/yahoo-jp-tv/%E8%8A%B1%E6%BE%A4%E9%A6%99%E8%8F%9C" path="/yahoo-jp-tv/:query" paramsDesc={['搜索查询']}/>

## 阿基米德 FM {#a-ji-mi-de-fm}

### 播客 {#a-ji-mi-de-fm-bo-ke}

<Route author="Fatpandac" example="/ajmide/10603594" path="/ajmide/:id" paramsDesc={['播客 id，可以从播客页面 URL 中找到']} radar="1" rssbud="1"/>

## 阿里云盘 {#a-li-yun-pan}

### 文件列表 {#a-li-yun-pan-wen-jian-lie-biao}

<Route author="DIYgod" example="/aliyundrive/files/XDFSyJ3J5wk/63035a070a078cf4e55e4b7ea3fd5bd269c4e41c" path="/aliyundrive/files/:share_id/:parent_file_id?" paramsDesc={['分享 id，可以从分享页面 URL 中找到', '文件夹 id，可以从文件夹页面 URL 中找到']} radar="1" rssbud="1"/>

## 爱奇艺 {#ai-qi-yi}

### 用户视频 {#ai-qi-yi-yong-hu-shi-pin}

<Route author="talengu" example="/iqiyi/user/video/2289191062" path="/iqiyi/user/video/:uid" paramsDesc={['用户名']} radar="1"/>

### 剧集 {#ai-qi-yi-ju-ji}

<Route author="TonyRL" example="/iqiyi/album/神武天尊-2020-1b4lufwxd7h" path="/iqiyi/album/:id" paramsDesc={['剧集 id, 可在该主页 URL 中找到']} radar="1">

:::tip 提示
可抓取內容根据服务器所在地区而定
:::

</Route>

## 哔嘀影视 {#bi-di-ying-shi}

:::tip 提示

哔嘀影视有多个备用域名，路由默认使用域名 <https://bdys01.com>。若该域名无法访问，可以通过在路由最后加上 `?domain=<域名>` 指定路由访问的域名。如指定备用域名为 <https://bde4.icu>，则在所有哔嘀影视路由最后加上 `?domain=bde4.icu` 即可，此时路由为 [`/bdys?domain=bde4.icu`](https://rsshub.app/bdys?domain=bde4.icu)

:::

### 首页 {#bi-di-ying-shi-shou-ye}

<Route author="nczitzk" example="/bdys" path="/bdys/:caty?/:type?/:area?/:year?/:order?" paramsDesc={['影视类型，见下表，默认为 `all` 即不限','资源分类，见下表，默认为 `all` 即不限', '制片地区，见下表，默认为 `all` 即不限','上映时间，此处填写年份不小于2000，默认为 `all` 即不限','影视排序，见下表，默认为更新时间']} anticrawler="1" radar="1">

#### 资源分类

| 不限 | 电影 | 电视剧 |
| ---- | ---- | ------ |
| all  | 0    | 1      |

#### 影视类型

| 不限 | 动作    | 爱情   | 喜剧 | 科幻   | 恐怖   |
| ---- | ------- | ------ | ---- | ------ | ------ |
| all  | dongzuo | aiqing | xiju | kehuan | kongbu |

| 战争      | 武侠  | 魔幻   | 剧情   | 动画    | 惊悚     |
| --------- | ----- | ------ | ------ | ------- | -------- |
| zhanzheng | wuxia | mohuan | juqing | donghua | jingsong |

| 3D | 灾难   | 悬疑   | 警匪    | 文艺  | 青春     |
| -- | ------ | ------ | ------- | ----- | -------- |
| 3D | zainan | xuanyi | jingfei | wenyi | qingchun |

| 冒险    | 犯罪   | 纪录 | 古装     | 奇幻   | 国语  |
| ------- | ------ | ---- | -------- | ------ | ----- |
| maoxian | fanzui | jilu | guzhuang | qihuan | guoyu |

| 综艺   | 历史  | 运动    | 原创压制   |
| ------ | ----- | ------- | ---------- |
| zongyi | lishi | yundong | yuanchuang |

| 美剧  | 韩剧  | 国产电视剧 | 日剧 | 英剧   | 德剧 |
| ----- | ----- | ---------- | ---- | ------ | ---- |
| meiju | hanju | guoju      | riju | yingju | deju |

| 俄剧 | 巴剧 | 加剧  | 西剧 | 意大利剧 | 泰剧  |
| ---- | ---- | ----- | ---- | -------- | ----- |
| eju  | baju | jiaju | xiju | yidaliju | taiju |

| 港台剧    | 法剧 | 澳剧 |
| --------- | ---- | ---- |
| gangtaiju | faju | aoju |

#### 制片地区

| 大陆 | 中国香港 | 中国台湾 |
| ---- | -------- | -------- |

| 美国 | 英国 | 日本 | 韩国 | 法国 |
| ---- | ---- | ---- | ---- | ---- |

| 印度 | 德国 | 西班牙 | 意大利 | 澳大利亚 |
| ---- | ---- | ------ | ------ | -------- |

| 比利时 | 瑞典 | 荷兰 | 丹麦 | 加拿大 | 俄罗斯 |
| ------ | ---- | ---- | ---- | ------ | ------ |

#### 影视排序

| 更新时间 | 豆瓣评分 |
| -------- | -------- |
| 0        | 1        |

</Route>

## 草榴社区 {#cao-liu-she-qu}

### 分区帖子 {#cao-liu-she-qu-fen-qu-tie-zi}

<Route author="zhboner" example="/t66y/20/2" path="/t66y/:id/:type?" paramsDesc={['分区 id, 可在分区页 URL 中找到', '类型 id, 可在分区类型过滤后的 URL 中找到']} anticrawler="1">

> 注意：并非所有的分区都有子类型，可以参考成人文学交流区的 \[古典武侠] 这一子类型。

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

### 帖子跟踪 {#cao-liu-she-qu-tie-zi-gen-zong}

<Route author="cnzgray" example="/t66y/post/3286088" path="/t66y/post/:tid" paramsDesc={['帖子 id, 可在帖子 URL 中找到']} anticrawler="1">

:::tip 提示

帖子 id 查找办法:

打开想跟踪的帖子，比如：<http://t66y.com/htm_data/20/1811/3286088.html> 其中 `3286088` 就是帖子 id。

:::

</Route>

## 场库 {#chang-ku}

### 今日精选 {#chang-ku-jin-ri-jing-xuan}

<Route author="Wenmoux" example="/changku" path="/changku"/>

### 分类 {#chang-ku-fen-lei}

<Route author="Wenmoux" example="/changku/cate/12" path="/changku/cate/:cateid" paramsDesc={['分类id']}>

| 创意 | 励志 | 搞笑 | 广告 | 汽车 | 旅行 |
| ---- | ---- | ---- | ---- | ---- | ---- |
| 6    | 7    | 8    | 13   | 92   | 11   |

| 爱情 | 剧情 | 运动 | 动画 | 音乐 | 科幻 |
| ---- | ---- | ---- | ---- | ---- | ---- |
| 12   | 17   | 10   | 16   | 18   | 23   |

| 预告 | 记录 | 混剪 | 游戏 | 时尚 | 实验 |
| ---- | ---- | ---- | ---- | ---- | ---- |
| 43   | 24   | 44   | 104  | 88   | 45   |

| 生活 |
| ---- |
| 78   |

</Route>

## 低端影视 {#di-duan-ying-shi}

### 影视剧集更新 {#di-duan-ying-shi-ying-shi-ju-ji-geng-xin}

<Route author="saintwinkle" example="/ddrk/update/silicon-valley/6" path="/ddrk/update/:name/:season?" paramsDesc={['影视名称，可以在 URL 中找到','季数，可以在 URL 中找到，剧集没有分季时不用填写，或是默认输出第一季的内容']} radar="1" rssbud="1"/>

### 首页 {#di-duan-ying-shi-shou-ye}

<Route author="hoilc" example="/ddrk/index" path="/ddrk/index" radar="1" rssbud="1"/>

### 分类 {#di-duan-ying-shi-fen-lei}

<Route author="hoilc" example="/ddrk/category/jp-drama" path="/ddrk/category/:category" paramsDesc={['分类 ID, 可在 URL 中找到, 注意, 如果有两级分类, 只需要填写第二级即可']} radar="1" rssbud="1"/>

### 标签 {#di-duan-ying-shi-biao-qian}

<Route author="hoilc" example="/ddrk/tag/石原里美" path="/ddrk/tag/:tag" paramsDesc={['标签名, 可在 URL 中找到']} radar="1" rssbud="1"/>

## 电影首发站 {#dian-ying-shou-fa-zhan}

### 电影 {#dian-ying-shou-fa-zhan-dian-ying}

<Route author="epirus" example="/dysfz" path="/dysfz"/>

## 电影天堂 {#dian-ying-tian-tang}

### 新片精品 {#dian-ying-tian-tang-xin-pian-jing-pin}

<Route author="imgss" example="/dytt" path="/dytt" supportBT="1"/>

## 法国国际广播电台 {#fa-guo-guo-ji-guang-bo-dian-tai}

### 滚动新闻 {#fa-guo-guo-ji-guang-bo-dian-tai-gun-dong-xin-wen}

<Route author="nczitzk" example="/rfi/news" path="/rfi/news"/>

## 高清电台 {#gao-qing-dian-tai}

### 最新电影 {#gao-qing-dian-tai-zui-xin-dian-ying}

<Route author="Songkeys" example="/gaoqing/latest" path="/gaoqing/latest"/>

## 故事 FM {#gu-shi-fm}

### 首页 {#gu-shi-fm-shou-ye}

<Route author="sanmmm" example="/storyfm/index" path="/storyfm/index"/>

### 播客 {#gu-shi-fm-bo-ke}

<Route author="nczitzk" example="/storyfm/episodes" path="/storyfm/episodes" supportPodcast="1"/>

## 开眼 {#kai-yan}

### 每日精选 {#kai-yan-mei-ri-jing-xuan}

<Route author="SunShinenny" example="/kaiyan/index" path="/kaiyan/index"/>

## 荔枝 FM {#li-zhi-fm}

### 电台更新 {#li-zhi-fm-dian-tai-geng-xin}

<Route author="nczitzk" example="/lizhi/user/27151442948222380" path="/lizhi/user/:id" paramsDesc={['用户 id，可以在电台的 URL 中找到']}/>

## 猫耳 FM {#mao-er-fm}

### 广播剧 / 有声漫画 {#mao-er-fm-guang-bo-ju-%2F-you-sheng-man-hua}

<Route author="FlashWingShadow" example="/missevan/drama/28499" path="/missevan/drama/:id" paramsDesc={['剧集 id，在剧集主页 URL 中可以找到']}/>

### 最新广播剧 {#mao-er-fm-zui-xin-guang-bo-ju}

<Route author="nczitzk" example="/missevan/drama/latest" path="/missevan/drama/latest"/>

## 猫眼电影 {#mao-yan-dian-ying}

### 正在热映 {#mao-yan-dian-ying-zheng-zai-re-ying}

<Route author="HenryQW" example="/maoyan/hot" path="/maoyan/hot" />

### 即将上映 {#mao-yan-dian-ying-ji-jiang-shang-ying}

<Route author="HenryQW" example="/maoyan/upcoming" path="/maoyan/upcoming" />

### 正在热映 - 完整版 {#mao-yan-dian-ying-zheng-zai-re-ying---wan-zheng-ban}

<Route author="song-zhou" example="/maoyan/hotComplete" path="/maoyan/hotComplete/:orderby?/:ascOrDesc?/:top?" paramsDesc={['排序条件，(score: 评分,pubDate: 发布时间),', '正序或倒序 (asc: 正序, desc: 倒序) 默认倒序', '取前多少条，默认取所有']}/>

## 奈菲影视 {#nai-fei-ying-shi}

### 分区 {#nai-fei-ying-shi-fen-qu}

<Route author="AngUOI" example="/nfmovies/0" path="/nfmovies/:id?" paramsDesc={['子版块 id, 为空默认首页']}>

| 首页 | 电影 | 电视剧 | 综艺 | 动漫 | 奈菲独家 |
| ---- | ---- | ------ | ---- | ---- | -------- |
| 0    | 1    | 2      | 3    | 4    | 5        |

</Route>

## 柠檬 私房歌 (ningmeng.name) {#ning-meng-si-fang-ge-(ningmeng.name)}

### 私房歌 {#ning-meng-si-fang-ge-(ningmeng.name)-si-fang-ge}

<Route author="dearrrfish" example="/ningmeng/song" path="/ningmeng/song" />

## 片源网 {#pian-yuan-wang}

### 最新资源 {#pian-yuan-wang-zui-xin-zi-yuan}

<Route author="greatcodeeer jerry1119" example="/pianyuan/index" path="/pianyuan/index/:media?" paramsDesc={['类别，见下表，默认为首页']} radar="1" rssbud="1" selfhost="1"/>

| 电影 | 剧集 |
| ---- | ---- |
| mv   | tv   |

### 搜索 {#pian-yuan-wang-sou-suo}

<Route author="jerry1119" example="/pianyuan/indexers/pianyuan/results/search/api?t=test&q=长津湖" path="/pianyuan/indexers/pianyuan/results/search/" selfhost="1"/>

搜索路由模仿 jackett 的搜索 api, 以提供给 nastools 使用，填写在 nastools 配置 indexer 中

## 飘花电影网 {#piao-hua-dian-ying-wang}

### 今日热门 {#piao-hua-dian-ying-wang-jin-ri-re-men}

<Route author="nczitzk" example="/piaohua/hot" path="/piaohua/hot" />

## 蜻蜓 FM {#qing-ting-fm}

### 专辑 {#qing-ting-fm-zhuan-ji}

<Route author="nczitzk" example="/qingting/channel/293411" path="/qingting/channel/:id" paramsDesc={['专辑id, 可在专辑页 URL 中找到']}/>

### 播客 {#qing-ting-fm-bo-ke}

<Route author="RookieZoe huyyi" example="/qingting/podcast/293411" path="/qingting/podcast/:id" paramsDesc={['专辑id, 可在专辑页 URL 中找到']} radar="1" supportPodcast="1">

获取的播放 URL 有效期只有 1 天，需要开启播客 APP 的自动下载功能。

</Route>

## 秋爸日字 {#qiu-ba-ri-zi}

### 分类 {#qiu-ba-ri-zi-fen-lei}

<Route author="nczitzk" example="/qq88" path="/qq88/:category?" paramsDesc={['分类 id，见下表，默认为首页']}>

| 首页 | オトナの土ドラ | 日剧 | 日剧 SP |
| ---- | -------------- | ---- | ------- |
|      | 10             | 5    | 11      |

</Route>

## 人人影视 {#ren-ren-ying-shi}

### 影视资讯 {#ren-ren-ying-shi-ying-shi-zi-xun}

<Route author="wb121017405" example="/yyets/article" path="/yyets/article/:type?" paramsDesc="['分类，见下表，默认为全部']" radar="1" rssbud="1">

| 全部 | 影视资讯 | 收视快报 | 人人影评 | 人人剧评 | 新剧评测   | 片单推荐 |
| ---- | -------- | -------- | -------- | -------- | ---------- | -------- |
|      | news     | report   | m_review | t_review | new_review | recom    |

</Route>

### 今日播出 {#ren-ren-ying-shi-jin-ri-bo-chu}

<Route author="bao1991213" example="/yyets/today" path="/yyets/today" radar="1" rssbud="1"/>

## 色花堂 {#se-hua-tang}

### 分区帖子 {#se-hua-tang-fen-qu-tie-zi}

<Route author="qiwihui junfengP nczitzk" example="/sehuatang/36/368" path="/sehuatang/:subforumid?/:type?" supportBT="1" paramsDesc={['版块 id 或板块名称（见下表）, 为空默认高清中文字幕', '类型 id, 可在分区类型过滤后的 URL 中找到']}>

**原创 BT 电影**

| 国产原创 | 亚洲无码原创 | 亚洲有码原创 | 高清中文字幕 | 三级写真 | VR 视频 | 素人有码 | 欧美无码 | 韩国主播 | 动漫原创 | 综合讨论 |
| -------- | ------------ | ------------ | ------------ | -------- | ------- | -------- | -------- | -------- | -------- | -------- |
| gcyc     | yzwmyc       | yzymyc       | gqzwzm       | sjxz     | vr      | srym     | omwm     | hgzb     | dmyc     | zhtl     |

**色花图片**

| 原创自拍 | 转贴自拍 | 华人街拍 | 亚洲性爱 | 欧美性爱 | 卡通动漫 | 套图下载 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| yczp     | ztzp     | hrjp     | yzxa     | omxa     | ktdm     | ttxz     |

</Route>

### 作者文章 {#se-hua-tang-zuo-zhe-wen-zhang}

<Route author="JamYiz" example="/sehuatang/user/411096" path="/sehuatang/user/:uid" paramsDesc={['用户 uid, 可在用户主页 URL 中找到']} selfhost="1"/>

## 深影译站 {#shen-ying-yi-zhan}

### 首页 {#shen-ying-yi-zhan-shou-ye}

<Route author="nczitzk" example="/shinybbs" path="/shinybbs" />

### 剧集类型 {#shen-ying-yi-zhan-ju-ji-lei-xing}

<Route author="nczitzk" example="/shinybbs/page/62" path="/shinybbs/page/:id?" paramsDesc={['类型 id，见下表']}>

| 英美剧 | 日韩剧 | 小语种 |
| ------ | ------ | ------ |
| 62     | 140    | 2      |

</Route>

### 最新作品 {#shen-ying-yi-zhan-zui-xin-zuo-pin}

<Route author="nczitzk" example="/shinybbs/latest" path="/shinybbs/latest" />

### 指定剧集 {#shen-ying-yi-zhan-zhi-ding-ju-ji}

<Route author="nczitzk" example="/shinybbs/p/1790" path="/shinybbs/p/:id" paramsDesc={['剧集 id，可在剧集页 URL 中找到']} />

## 时光网 {#shi-guang-wang}

### 时光新闻 {#shi-guang-wang-shi-guang-xin-wen}

<Route author="TsSmartTT" example="/mtime/news" path="/mtime/news" radar="1" rssbud="1"/>

## 腾讯视频 {#teng-xun-shi-pin}

### 播放列表 {#teng-xun-shi-pin-bo-fang-lie-biao}

<Route author="Andiedie" example="/tencentvideo/playlist/jx7g4sm320sqm7i" path="/tencentvideo/playlist/:id" paramsDesc={['播放列表 ID，可以在 URL 中找到']} radar="1" />

## 听听 FM {#ting-ting-fm}

### 节目 {#ting-ting-fm-jie-mu}

<Route author="TonyRL" example="/tingtingfm/program/M7VJv6Jj4R" path="/tingtingfm/program/:programId" paramsDesc={['节目 ID，可以在 URL 中找到']} radar="1" supportPodcast="1"/>

## 弯弯字幕组 {#wan-wan-zi-mu-zu}

### 分类 {#wan-wan-zi-mu-zu-fen-lei}

<Route author="nczitzk" example="/wanwansub/139" path="/wanwansub/:id?" paramsDesc={['分类 id，见下表，默认为 ALL']} >

| ALL | 英语小分队 | 日语小分队 | 韩语小分队 | 葡语小分队 | 西语小分队 | 法语小分队 | 意语小分队 | 德语小分队 | 泰语小分队 | 其他语种 |
| --- | ---------- | ---------- | ---------- | ---------- | ---------- | ---------- | ---------- | ---------- | ---------- | -------- |
| 139 | 110        | 111        | 112        | 113        | 114        | 115        | 116        | 153        | 117        | 154      |

</Route>

### 剧集 {#wan-wan-zi-mu-zu-ju-ji}

<Route author="nczitzk" example="/wanwansub/info/393" path="/wanwansub/info/:id" paramsDesc={['剧集 id，可在剧集页 URL 中找到']} />

## 网易云音乐 {#wang-yi-yun-yin-yue}

:::tip 部分歌单及听歌排行信息为登陆后可见

部分歌单及听歌排行信息为登陆后可见，自建时将环境变量`NCM_COOKIES`设为登陆后的 Cookie 值，即可正常获取。
:::

### 歌单歌曲 {#wang-yi-yun-yin-yue-ge-dan-ge-qu}

<Route author="DIYgod" example="/163/music/playlist/35798529" path="/163/music/playlist/:id" paramsDesc={['歌单 id, 可在歌单页 URL 中找到']} radar="1" />

### 用户歌单 {#wang-yi-yun-yin-yue-yong-hu-ge-dan}

<Route author="DIYgod" example="/163/music/user/playlist/45441555" path="/163/music/user/playlist/:uid" paramsDesc={['用户 uid, 可在用户主页 URL 中找到']} radar="1" />

### 用户听歌排行 {#wang-yi-yun-yin-yue-yong-hu-ting-ge-pai-hang}

<Route author="alfredcai" example="/163/music/user/playrecords/45441555/1" path="/163/music/user/playrecords/:uid/:type?" paramsDesc={['用户 uid, 可在用户主页 URL 中找到','排行榜类型，0所有时间(默认)，1最近一周']} />

### 用户动态 {#wang-yi-yun-yin-yue-yong-hu-dong-tai}

<Route author="Master-Hash" example="/163/music/user/events/585804522" path="/163/music/user/events/:uid" paramsDesc={['用户 uid, 可在用户主页 URL 中找到']} rader="1" />

### 歌手专辑 {#wang-yi-yun-yin-yue-ge-shou-zhuan-ji}

<Route author="metowolf" example="/163/music/artist/2116" path="/163/music/artist/:id" paramsDesc={['歌手 id, 可在歌手详情页 URL 中找到']} radar="1" />

### 歌手歌曲 {#wang-yi-yun-yin-yue-ge-shou-ge-qu}

<Route author="ZhongMingKun" example="/163/music/artist/songs/2116" path="/163/music/artist/songs/:id" paramsDesc={['歌手 id, 可在歌手详情页 URL 中找到']} radar="1" />

### 电台节目 {#wang-yi-yun-yin-yue-dian-tai-jie-mu}

<Route author="magic-akari" example="/163/music/djradio/347317067" path="/163/music/djradio/:id" paramsDesc={['节目 id, 可在电台节目页 URL 中找到']} supportPodcast="1"  radar="1" />

## 西瓜视频 {#xi-gua-shi-pin}

:::tip Tiny Tiny RSS 用户请注意

Tiny Tiny RSS 会给所有 iframe 元素添加 `sandbox="allow-scripts"` 属性，导致无法加载西瓜视频内嵌视频，如果需要使用内嵌视频请为 Tiny Tiny RSS 安装 [remove_iframe_sandbox](https://github.com/DIYgod/ttrss-plugin-remove-iframe-sandbox) 插件

:::

### 用户视频投稿 {#xi-gua-shi-pin-yong-hu-shi-pin-tou-gao}

<Route author="FlashWingShadow Fatpandac" example="/ixigua/user/video/4234740937" path="/ixigua/user/video/:uid/:disableEmbed?" paramsDesc={['用户 id, 可在用户主页中找到', '默认为开启内嵌视频, 任意值为关闭']}/>

## 喜马拉雅 {#xi-ma-la-ya}

### 专辑（不输出 ShowNote） {#xi-ma-la-ya-zhuan-ji-%EF%BC%88-bu-shu-chu-shownote%EF%BC%89}

<Route author="lengthmin jjeejj prnake" example="/ximalaya/album/299146" path="/ximalaya/:type/:id/:all?" paramsDesc={['专辑类型, 通常可以使用 `album`，可在对应专辑页面的 URL 中找到','专辑 id, 可在对应专辑页面的 URL 中找到','是否需要获取全部节目，填入 `1`、`true`、`all` 视为获取所有节目，填入其他则不获取。']} supportPodcast="1" radar="1" rssbud="1" selfhost="1">

目前喜马拉雅的 API 只能一集一集的获取各节目上的 ShowNote，会极大的占用系统资源，所以默认为不获取节目的 ShowNote。下方有一个新的路径可选获取 ShowNote。

:::caution 注意
专辑类型即 url 中的分类拼音，使用通用分类 `album` 通常是可行的，专辑 id 是跟在**分类拼音**后的那个 id, 不要输成某集的 id 了

**付费内容需要配置好已购买账户的 token 才能收听，详情见部署页面的配置模块**
:::

</Route>

### 专辑（输出 ShowNote） {#xi-ma-la-ya-zhuan-ji-%EF%BC%88-shu-chu-shownote%EF%BC%89}

<Route author="lengthmin jjeejj prnake" example="/ximalaya/album/39488639/0/shownote" path="/ximalaya/:type/:id/:all/:shownote?" paramsDesc={['专辑类型, 通常可以使用 `album`，可在对应专辑页面的 URL 中找到','专辑 id, 可在对应专辑页面的 URL 中找到','是否需要获取全部节目，填入 `1`、`true`、`all` 视为获取所有节目，填入其他则不获取。', '是否需要获取节目的 ShowNote，填入 `1`、`true`,`shownote` 视为获取，填入其他则不获取。']} supportPodcast="1" selfhost="1">

</Route>

## 小宇宙 {#xiao-yu-zhou}

### 发现 {#xiao-yu-zhou-fa-xian}

<Route author="prnake" example="/xiaoyuzhou" path="/xiaoyuzhou" selfhost="1">

:::caution 注意

小宇宙的 api 需要验证 `x-jike-device-id`、`x-jike-access-token` 和 `x-jike-refresh-token` 。必要时需要自行配置，具体见部署文档。

:::

</Route>

### 播客 {#xiao-yu-zhou-bo-ke}

<Route author="hondajojo" example="/xiaoyuzhou/podcast/6021f949a789fca4eff4492c" path="/xiaoyuzhou/podcast/:id" paramsDesc={['播客id，可以在小宇宙播客的 URL 中找到']}/>

## 优酷 {#you-ku}

### 频道 {#you-ku-pin-dao}

<Route author="xyqfer Fatpandac" example="/youku/channel/UNTg3MTM3OTcy" path="/youku/channel/:channelId/:embed?" paramsDesc={['频道 id', '默认为开启内嵌视频, 任意值为关闭']}/>

## 云听 {#yun-ting}

### 专辑 {#yun-ting-zhuan-ji}

<Route author="nczitzk" example="/radio/album/15682090498666" path="/radio/album/:id" paramsDesc={['专辑 id，可在对应专辑页面的 URL 中找到']} supportPodcast="1">

如果订阅 [中国相声榜](https://www.radio.cn/pc-portal/sanji/detail.html?columnId=15682090498666)，其 URL 为 <https://www.radio.cn/pc-portal/sanji/detail.html?columnId=15682090498666>，可以得到 `columnId` 为 `15682090498666`

所以对应路由为 [`/radio/album/15682090498666`](https://rsshub.app/radio/album/15682090498666)

:::tip 提示

部分专辑不适用该路由，此时可以尝试 [节目](#yun-ting-jie-mu) 路由

:::

</Route>

### 节目 {#yun-ting-jie-mu}

<Route author="kt286 nczitzk" example="/radio/1552135" path="/radio/:id" paramsDesc={['专辑 id，可在对应专辑页面的 URL 中找到']} supportPodcast="1">

如果订阅 [共和国追梦人](http://www.radio.cn/pc-portal/sanji/detail.html?columnId=1552135)，其 URL 为 <https://www.radio.cn/pc-portal/sanji/detail.html?columnId=1552135>，可以得到 `columnId` 为 `1552135`

所以对应路由为 [`/radio/1552135`](https://rsshub.app/radio/1552135)

:::tip 提示

该路由仅适用于更新时间较早的电台节目，如 [共和国追梦人](http://www.radio.cn/pc-portal/sanji/detail.html?columnId=1552135)

与适用于 [专辑](#yun-ting-zhuan-ji) 路由的专辑其 `columnId` 长度相比，它们的 `columnId` 长度较短

:::

</Route>

### 直播 {#yun-ting-zhi-bo}

<Route author="nczitzk" example="/radio/zhibo/1395528" path="/radio/zhibo/:id" paramsDesc={['直播 id，可在对应点播页面的 URL 中找到']} supportPodcast="1">

如果订阅 [新闻和报纸摘要](http://www.radio.cn/pc-portal/sanji/zhibo\_2.html?name=1395528)，其 URL 为 <http://www.radio.cn/pc-portal/sanji/zhibo_2.html?name=1395528>，可以得到 `name` 为 `1395528`

所以对应路由为 [`/radio/zhibo/1395528`](https://rsshub.app/radio/zhibo/1395528)

:::tip 提示

查看更多电台直播节目，可前往 [电台直播](http://www.radio.cn/pc-portal/erji/radioStation.html)

:::

</Route>

## 直播吧 {#zhi-bo-ba}

### 录像 {#zhi-bo-ba-lu-xiang}

<Route author="TonyRL" example="/zhibo8/luxiang/nba" path="/zhibo8/luxiang/:category" paramsDesc={['分类，见下表，默认为 `nba`']} radar="1">

| NBA | 足球  |
| --- | ----- |
| nba | zuqiu |

</Route>

## 中国高清网 {#zhong-guo-gao-qing-wang}

### 电影 {#zhong-guo-gao-qing-wang-dian-ying}

<Route author="minosss" example="/gaoqingla" path="/gaoqingla/:tag?" paramsDesc={['标签tag，视频清晰度']} />

| 全部 | 蓝光   | 1080P | 720P | 3D | WEB-DL |
| ---- | ------ | ----- | ---- | -- | ------ |
| 留空 | bluray | 1080p | 720p | 3d | webdl  |

## 中文播客榜 {#zhong-wen-bo-ke-bang}

:::tip 提示

可以通过指定 `limit` 参数确定榜单排名下限，默认为 250。

若只查看榜单前 50，可在订阅 URL 后加入 `?limit=50`。

即，以 [热门节目](https://xyzrank.com/#/) 为例，路由为[`/xyzrank?limit=50`](https://rsshub.app/xyzrank?limit=50)。

:::

### 热门节目 {#zhong-wen-bo-ke-bang-re-men-jie-mu}

<Route author="nczitzk" example="/xyzrank" path="/xyzrank"/>

### 热门播客 {#zhong-wen-bo-ke-bang-re-men-bo-ke}

<Route author="nczitzk" example="/xyzrank/hot-podcasts" path="/xyzrank/hot-podcasts"/>

### 新锐节目 {#zhong-wen-bo-ke-bang-xin-rui-jie-mu}

<Route author="nczitzk" example="/xyzrank/hot-episodes-new" path="/xyzrank/hot-episodes-new"/>

### 新锐播客 {#zhong-wen-bo-ke-bang-xin-rui-bo-ke}

<Route author="nczitzk" example="/xyzrank/new-podcasts" path="/xyzrank/new-podcasts"/>

## 注视影视 {#zhu-shi-ying-shi}

### 更新通知 {#zhu-shi-ying-shi-geng-xin-tong-zhi}

<Route author="zytomorrow" example="/gaze/update/5157c267ee121ab8d1b45092304a1e85" path="/gaze/update/:mid" paramsDesc={['剧集的id。播放页面play之后的一串字符']}/>

## 追新番 {#zhui-xin-fan}

### 最近更新 {#zhui-xin-fan-zui-jin-geng-xin}

<Route author="mengx8 nczitzk" example="/fanxinzhui" path="/fanxinzhui" radar="1" rssbud="1"/>

## 字幕库 {#zi-mu-ku}

### 字幕列表 {#zi-mu-ku-zi-mu-lie-biao}

<Route author="sanmmm" example="/zimuku/mv" path="/zimuku/:type?" paramsDesc={['类型, 默认为`mv`电影']}>

类型

| 最新电影 | 最新美剧 |
| -------- | -------- |
| mv       | tv       |

</Route>

## 字幕组（ZiMuZu.tv） {#zi-mu-zu-%EF%BC%88zimuzu.tv%EF%BC%89}

### 影视 {#zi-mu-zu-%EF%BC%88zimuzu.tv%EF%BC%89-ying-shi}

:::tip 提示

跟官方提供的 RSS 相比：官方使用了不规范的 magnet 字段，无法被 BT 客户端识别并自动下载，其他数据相同

:::

<Route author="DIYgod" example="/zimuzu/resource/37031" path="/zimuzu/resource/:id?" paramsDesc={['影视 id，对应影视的 URL 中找到，为空时输出最近更新']} supportBT="1"/>

### 排行榜 {#zi-mu-zu-%EF%BC%88zimuzu.tv%EF%BC%89-pai-hang-bang}

<Route author="queensferryme DIYgod" example="/zimuzu/top/week/movie" path="/zimuzu/top/:range/:type" paramsDesc={['时间范围, 可以是 `week` `month` `year` `total`', '排行类型, 可以是 `fav` `tv` `movie`']}>

例如，路由 `/zimuzu/top/week/movie` 应该输出 <http://www.rrys2019.com/html/top/week_movie_list.html> 的排行榜单

</Route>

## 综艺秀 {#zong-yi-xiu}

### 综艺 {#zong-yi-xiu-zong-yi}

<Route author="pharaoh2012 nczitzk" example="/zyshow/chongchongchong" path="/zyshow/:region?/:id" paramsDesc={['地区，见下表，默认为空，即台湾', '综艺 id，综艺详情对应页 URL 中找到']}  radar="1" rssbud="1">

地区

| 台湾 | 韩国 | 大陆 |
| ---- | ---- | ---- |
|      | kr   | dl   |

</Route>
