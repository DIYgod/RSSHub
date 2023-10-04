# 🎨️ ACG

## 005.tv {#005.tv}

### 二次元资讯 {#005.tv-er-ci-yuan-zi-xun}

<Route author="junfengP" example="/005tv/zx/latest" path="/005tv/zx/latest"/>

## 1draw #深夜の真剣お絵描き 60 分一本勝負 {#1draw-shen-ye-%E3%81%AE-zhen-jian-%E3%81%8A-hui-miao-%E3%81%8D-60-fen-yi-ben-sheng-fu}

### 投稿一览 {#1draw-shen-ye-%E3%81%AE-zhen-jian-%E3%81%8A-hui-miao-%E3%81%8D-60-fen-yi-ben-sheng-fu-tou-gao-yi-lan}

<Route author="jackyu1996" path="/1draw/" example="/1draw/" />

## 78 动漫 {#78-dong-man}

### 新品速递 {#78-dong-man-xin-pin-su-di}

<Route author="nczitzk" example="/78dm/news" path="/78dm/news/:path+" paramsDesc={['参数，见说明，默认为空']}>

:::tip

若订阅 [新品速递](https://www.78dm.net/news)，网址为 <https://www.78dm.net/news>。截取 `https://www.78dm.net` 到末尾的部分 `/news` 作为参数，此时路由为 [`/78dm/news`](https://rsshub.app/78dm/news)。

若订阅子分类 [新品速递 - 综合](https://www.78dm.net/news/0/9/0/0/0/0/0/1.html)，网址为 <https://www.78dm.net/news/0/9/0/0/0/0/0/1.html>。截取 `https://www.78dm.net` 到末尾 `.html` 的部分 `/news/0/9/0/0/0/0/0/1` 作为参数，路由为 [`/78dm/news/0/9/0/0/0/0/0/1`](https://rsshub.app/78dm/news/0/9/0/0/0/0/0/1)。

:::

</Route>

### 精彩评测 {#78-dong-man-jing-cai-ping-ce}

<Route author="nczitzk" example="/78dm/eval_list" path="/78dm/eval_list/:path+" paramsDesc={['参数，见说明，默认为空']}>

:::tip

若订阅 [精彩评测](https://www.78dm.net/eval_list)，网址为 <https://www.78dm.net/eval_list>。截取 `https://www.78dm.net` 到末尾的部分 `/eval_list` 作为参数，此时路由为 [`/78dm/eval_list`](https://rsshub.app/78dm/eval_list)。

若订阅子分类 [精彩评测 - 综合](https://www.78dm.net/eval_list/120/0/0/1.html)，网址为 <https://www.78dm.net/eval_list/120/0/0/1.html>。截取 `https://www.78dm.net` 到末尾 `.html` 的部分 `/eval_list/120/0/0/1` 作为参数，路由为 [`/78dm/eval_list/120/0/0/1`](https://rsshub.app/78dm/eval_list/120/0/0/1)。

:::

</Route>

### 好帖推荐 {#78-dong-man-hao-tie-tui-jian}

<Route author="nczitzk" example="/78dm/ht_list" path="/78dm/ht_list/:path+" paramsDesc={['参数，见说明，默认为空']}>

:::tip

若订阅 [好帖推荐](https://www.78dm.net/ht_list)，网址为 <https://www.78dm.net/ht_list>。截取 `https://www.78dm.net` 到末尾的部分 `/ht_list` 作为参数，此时路由为 [`/78dm/ht_list`](https://rsshub.app/78dm/ht_list)。

若订阅子分类 [好帖推荐 - 综合](https://www.78dm.net/ht_list/107/0/0/1.html)，网址为 <https://www.78dm.net/ht_list/107/0/0/1.html>。截取 `https://www.78dm.net` 到末尾 `.html` 的部分 `/ht_list/107/0/0/1` 作为参数，路由为 [`/78dm/ht_list/107/0/0/1`](https://rsshub.app/78dm/ht_list/107/0/0/1)。

:::

</Route>

## AcFun {#acfun}

### 番剧 {#acfun-fan-ju}

<Route author="xyqfer" example="/acfun/bangumi/5022158" path="/acfun/bangumi/:id" paramsDesc={['番剧 id']} radar="1" rssbud="1"/>

:::tip

番剧 id 不包含开头的 aa。
例如：<http://www.acfun.cn/bangumi/aa5022158> 的番剧 id 是 5022158，不包括开头的 aa。

:::

### 用户投稿 {#acfun-yong-hu-tou-gao}

<Route author="wdssmq" example="/acfun/user/video/14450522" path="/acfun/user/video/:id" paramsDesc={['用户 UID']} radar="1" rssbud="1"/>

### 文章 {#acfun-wen-zhang}

<Route author="TonyRL" example="/acfun/article/110" path="/acfun/article/:categoryId/:sortType?/:timeRange?" paramsDesc={['分区 ID，见下表', '排序，见下表，默认为 `createTime`', '时间范围，见下表，仅在排序是 `hotScore` 有效，默认为 `all`']} radar="1" rssbud="1">

| 二次元画师 | 综合 | 生活情感 | 游戏 | 动漫文化 | 漫画文学 |
| ---------- | ---- | -------- | ---- | -------- | -------- |
| 184        | 110  | 73       | 164  | 74       | 75       |

| 最新发表   | 最新动态        | 最热文章 |
| ---------- | --------------- | -------- |
| createTime | lastCommentTime | hotScore |

| 时间不限 | 24 小时 | 三天     | 一周    | 一个月   |
| -------- | ------- | -------- | ------- | -------- |
| all      | oneDay  | threeDay | oneWeek | oneMonth |

</Route>

## ACG17 {#acg17}

### 全部文章 {#acg17-quan-bu-wen-zhang}

<Route author="SunBK201" example="/acg17/post/all" path="/acg17/post/all" radar="1" />

## AGE 动漫 {#age-dong-man}

### 最近更新 {#age-dong-man-zui-jin-geng-xin}

<Route author="nczitzk" example="/agefans/update" path="/agefans/update"/>

### 番剧详情 {#age-dong-man-fan-ju-xiang-qing}

<Route author="s2marine" example="/agefans/detail/20200035" path="/agefans/detail/:id" paramsDesc={['番剧 id，对应详情 URL 中找到']}/>

## Anime1 {#anime1}

### 動畫 {#anime1-dong-hua}

<Route author="maple3142" example="/anime1/anime/2018年秋季/哥布林殺手" path="/anime1/anime/:time/:name" paramsDesc={['时间', '动画名称']} radar="1" rssbud="1">

时间和动画名称请自己从网址取得: `https://anime1.me/category/2018年秋季/刀劍神域-alicization`

</Route>

### 搜尋 {#anime1-sou-xun}

<Route author="maple3142" example="/anime1/search/兔女郎學姊" path="/anime1/search/:keyword" paramsDesc={['关键字']} radar="1" rssbud="1"/>

## Animen 动漫平台 {#animen-dong-man-ping-tai}

### news {#animen-dong-man-ping-tai-news}

<Route author="LogicJake" example="/animen/news/zx" path="/animen/news/:type" paramsDesc={['板块类型']}>

| 最新 | 焦点 | 动画 | 漫画 | 游戏 | 小说 | 真人版 | 活动 | 音乐 | 访谈 | 其他 | 新闻稿 | 懒人包 | 公告 |
| ---- | ---- | ---- | ---- | ---- | ---- | ------ | ---- | ---- | ---- | ---- | ------ | ------ | ---- |
| zx   | jd   | dh   | mh   | yx   | xs   | zrb    | hd   | yy   | ft   | qt   | xwg    | lrb    | gg   |

</Route>

## Anitama {#anitama}

### Anitama Channel {#anitama-anitama-channel}

<Route author="ranpox" path="/anitama/:channel?" example="/anitama" paramsDesc={['频道id，从频道的地址栏中查看']}/>

## Bangumi Moe 萌番组 {#bangumi-moe-meng-fan-zu}

### Latest {#bangumi-moe-meng-fan-zu-latest}

<Route author="nczitzk" example="/bangumi/moe" path="/bangumi/moe"/>

### Tags {#bangumi-moe-meng-fan-zu-tags}

<Route author="nczitzk" example="/bangumi/moe/chs/1080p" path="/bangumi/moe/:tags?" paramsDesc={['Tags, empty by default, multiple tags separated by `/`']}>

For more tags, please go to [Search torrent](https://bangumi.moe/search/index)

</Route>

## Bangumi 番组计划 {#bangumi-fan-zu-ji-hua}

### 放送列表 {#bangumi-fan-zu-ji-hua-fang-song-lie-biao}

<Route author="magic-akari" example="/bangumi/tv/calendar/today" path="/bangumi/tv/calendar/today" radar="1"/>

### 条目的通用路由格式 {#bangumi-fan-zu-ji-hua-tiao-mu-di-tong-yong-lu-you-ge-shi}

<Route author="JimenezLi" example="/bangumi/tv/subject/328609/ep/true" path="/bangumi/tv/subject/:id/:type?/:showOriginalName?" paramsDesc={['条目 id, 在条目页面的地址栏查看', '条目类型，可选值为 `ep`, `comments`, `blogs`, `topics`，默认为 `ep`', '显示番剧标题原名，可选值 0/1/false/true，默认为 false']}>

:::caution

此通用路由仅用于对路由参数的描述，具体信息请查看下方与条目相关的路由

:::

</Route>

### 条目的章节 {#bangumi-fan-zu-ji-hua-tiao-mu-di-zhang-jie}

<Route author="SettingDust" example="/bangumi/tv/subject/240038" path="/bangumi/tv/subject/:id" paramsDesc={['条目 id, 在条目页面的地址栏查看']} radar="1"/>

### 条目的吐槽箱 {#bangumi-fan-zu-ji-hua-tiao-mu-di-tu-cao-xiang}

<Route author="ylc395" example="/bangumi/tv/subject/214265/comments?minLength=100" path="/bangumi/tv/subject/:id/comments" paramsDesc={['条目 id, 在条目页面的地址栏查看. minLength: 以查询字符串（query string）的形式指定. 用于过滤掉内容长度小于指定值的吐槽']} radar="1"/>

### 条目的评论 {#bangumi-fan-zu-ji-hua-tiao-mu-di-ping-lun}

<Route author="ylc395" example="/bangumi/tv/subject/214265/blogs" path="/bangumi/tv/subject/:id/blogs" paramsDesc={['条目 id, 在条目页面的地址栏查看']} radar="1"/>

### 条目的讨论 {#bangumi-fan-zu-ji-hua-tiao-mu-di-tao-lun}

<Route author="ylc395" example="/bangumi/tv/subject/214265/topics" path="/bangumi/tv/subject/:id/topics" paramsDesc={['条目 id, 在条目页面的地址栏查看']} radar="1"/>

### 现实人物的新作品 {#bangumi-fan-zu-ji-hua-xian-shi-ren-wu-de-xin-zuo-pin}

<Route author="ylc395" example="/bangumi/tv/person/32943" path="/bangumi/tv/person/:id" paramsDesc={['人物 id, 在人物页面的地址栏查看']} radar="1"/>

### 小组话题的新回复 {#bangumi-fan-zu-ji-hua-xiao-zu-hua-ti-de-xin-hui-fu}

<Route author="ylc395" example="/bangumi/tv/topic/367032" path="/bangumi/tv/topic/:id" paramsDesc={['话题 id, 在话题页面地址栏查看']} radar="1"/>

### 小组话题 {#bangumi-fan-zu-ji-hua-xiao-zu-hua-ti}

<Route author="SettingDust" example="/bangumi/tv/group/boring" path="/bangumi/tv/group/:id" paramsDesc={['小组 id, 在小组页面地址栏查看']} radar="1"/>

### 用户日志 {#bangumi-fan-zu-ji-hua-yong-hu-ri-zhi}

<Route author="nczitzk" example="/bangumi/tv/user/blog/sai" path="/bangumi/tv/user/blog/:id" paramsDesc={['用户 id, 在用户页面地址栏查看']} radar="1"/>

## CCC 創作集 {#ccc-chuang-zuo-ji}

### 漫畫 {#ccc-chuang-zuo-ji-man-hua}

<Route author="TonyRL" example="/creative-comic/book/117" path="/creative-comic/book/:id/:coverOnly?/:quality?" paramsDesc={['漫畫 ID，可在 URL 中找到', '僅獲取封面，非 `true` 時將獲取**全部**頁面，預設 `true`', '閱讀品質，標準畫質 `1`，高畫質 `2`，預設 `1`']} radar="1" rssbud="1"/>

## CnGal {#cngal}

### 每周速报 {#cngal-mei-zhou-su-bao}

<Route author="chengyuhui" example="/cngal/weekly" path="/cngal/weekly" radar="1" rssbud="1"/>

### 制作者 / 游戏新闻 {#cngal-zhi-zuo-zhe-you-xi-xin-wen}

<Route author="chengyuhui" example="/cngal/entry/2693" path="/cngal/entry/:id" paramsDesc={['词条ID，游戏或制作者页面URL的最后一串数字']} radar="1" rssbud="1"/>

## Comicat {#comicat}

### 搜索关键词 {#comicat-sou-suo-guan-jian-ci}

<Route author="Cyang39" example="/comicat/search/喵萌奶茶屋+跃动青春+720P+简日" path="/comicat/search/:keyword" paramsDesc={['关键词，请用`+`号连接']} supportBT="1" />

## Comics Kingdom {#comics-kingdom}

### Archive {#comics-kingdom-archive}

<Route author="stjohnjohnson" example="/comicskingdom/pardon-my-planet" path="/comicskingdom/:name" paramsDesc={['URL path of the strip on comicskingdom.com']} />

## DLsite {#dlsite}

### General {#dlsite-general}

<Route author="nczitzk" example="/dlsite/home/new" path="/dlsite/:path+" paramsDesc={['Path, `/home/new` by default, as Release Calendar']}>

:::tip

To subscribe to this route, you can first visit the site and specify filters, and then fill in the field after `https://www.dlsite.com/` in the URL of the corresponding page at the path of the route. Here are 2 examples.

If you subscribe to [Voice / ASMR works Release date - New to Old](https://www.dlsite.com/home/works/type/=/work_type_category/audio/order/release_d), at the URL of the corresponding page <https://www.dlsite.com/home/works/type/=/work_type_category/audio/order/release_d> and after `https://www.dlsite.com/` is `home/works/type/=/work_ type_category/audio/order/release_d`, which can be seen as the path. In this case the route is [`/dlsite/home/works/type/=/work_type_category/audio/order/release_d`](https://rsshub.app/dlsite/home/works/type/=/work_type_category/audio/order/release_d)

If you subscribe to [Discounted works Latest Discounts - Newest to Oldest](https://www.dlsite.com/home/works/discount/=/order/cstart_d), at the URL of the corresponding page <https://www.dlsite.com/home/works/discount/=/order/cstart_d> and after `https://www.dlsite.com/` is `home/works/discount/=/order/cstart_d`, which can be seen as the path. In this case the route is [`/dlsite/home/works/discount/=/order/cstart_d`](https://rsshub.app/dlsite/home/works/discount/=/order/cstart_d)

:::

</Route>

### Current Release {#dlsite-current-release}

<Route author="cssxsh" example="/dlsite/new/home" path="/dlsite/new/:type" paramsDesc={['Type, see table below']}>

| Doujin   | Comics    | PC Games   | Doujin (R18) | Adult Comics | H Games | Otome    | BL |
| ---- | ----- | ---- | -------- | -------- | ----- | ----- | -- |
| home | comic | soft | maniax   | books    | pro   | girls | bl |

</Route>

### Discounted Works {#dlsite-discounted-works}

<Route author="cssxsh" example="/dlsite/campaign/home" path="/dlsite/campaign/:type/:free?" paramsDesc={['Type, see table above', 'Free only, empty means false, other value means true']}/>

### Ci-en Creators' Article {#dlsite-ci-en-creators-article}

<Route author="nczitzk" example="/dlsite/ci-en/:id/article" path="/dlsite/ci-en/7400/article" paramsDesc={['Creator id, can be found in URL']}/>

## ebb.io {#ebb.io}

### ebb {#ebb.io-ebb}

<Route author="Tsuki" example="/ebb" path="/ebb"/>

## Eventernote {#eventernote}

### 声优活动及演唱会 {#eventernote-sheng-you-huo-dong-ji-yan-chang-hui}

<Route author="KTachibanaM" path="/eventernote/actors/:name/:id" example="/eventernote/actors/三森すずこ/2634" paramsDesc={['声优姓名', '声优 ID']} radar="1" rssbud="1"/>

## Gogoanimehd {#gogoanimehd}

### Recent Releases {#gogoanimehd-recent-releases}

<Route author="user4302" example="/gogoanimehd/recent-releases" path="/gogoanimehd/recent-releases" />


## Hanime.tv {#hanime.tv}

### Recently updated {#hanime.tv-recently-updated}

<Route author="EsuRt" example="/hanime/video" path="/hanime/video"/>

## Hpoi 手办维基 {#hpoi-shou-ban-wei-ji}

### 情报 {#hpoi-shou-ban-wei-ji-qing-bao}

<Route author="sanmmm" path="/hpoi/info/:type?" example="/hpoi/info/all" paramsDesc={['分类, 见下表, 默认为`all`']}>

分类

| 全部 | 手办  | 模型  |
| ---- | ----- | ----- |
| all  | hobby | model |

</Route>

### 浏览周边 {#hpoi-shou-ban-wei-ji-liu-lan-zhou-bian}

<Route author="howel52 DIYgod" path="/hpoi/:category/:words" example="/hpoi/charactar/1246512" paramsDesc={['分类, 见下表', '角色/作品 ID']}>

| 角色手办  | 作品手办 |
| --------- | -------- |
| charactar | works    |

</Route>

### 用户动态 {#hpoi-shou-ban-wei-ji-yong-hu-dong-tai}

<Route author="luyuhuang DIYgod" path="/hpoi/user/:user_id/:caty" example="/hpoi/user/116297/buy" paramsDesc={['用户ID', '类别, 见下表']}>

| 想买 | 预定     | 已入 | 关注 | 有过   |
| ---- | -------- | ---- | ---- | ------ |
| want | preorder | buy  | care | resell |

</Route>

## IDOLY PRIDE 偶像荣耀 {#idoly-pride-ou-xiang-rong-yao}

### News {#idoly-pride-ou-xiang-rong-yao-news}

<Route author="Mingxia1" example="/idolypride/news" path="/idolypride/news" radar="1" rssbud="1"/>

## iwara {#iwara}

### User {#iwara-user}

<Route author="Fatpandac" example="/iwara/users/kelpie/video" path="/iwara/users/:username/:type?" paramsDesc={['username, can find in userpage', 'video by default']} radar="1" rssbud="1">

| type | video | image |
| :--: | :---: | :---: |
|      | video | image |

</Route>

### User Subscriptions {#iwara-user-subscriptions}

<Route author="FeCCC" example="/iwara/subscriptions" path="/iwara/subscriptions" radar="1" rssbud="1" selfhost="1">

:::caution

This route requires username and password, therefore it's only available when self-hosting, refer to the [Deploy Guide](/install/#route-specific-configurations) for route-specific configurations.

:::

</Route>

## Kemono {#kemono}

### Posts {#kemono-posts}

<Route author="nczitzk" example="/kemono" path="/kemono/:source?/:id?" paramsDesc={['Source, see below, Posts by default', 'User id, can be found in URL']}>

Sources

| Posts | Patreon | Pixiv Fanbox | Gumroad | SubscribeStar | DLsite | Discord | Fantia |
| ----- | ------- | ------------ | ------- | ------------- | ------ | ------- | ------ |
| posts | patreon | fanbox       | gumroad | subscribestar | dlsite | discord | fantia |

:::tip

When `posts` is selected as the value of the parameter **source**, the parameter **id** does not take effect.

:::

</Route>

## lovelive-anime {#lovelive-anime}

### Love Live! Official Website Latest NEWS {#lovelive-anime-love-live!-official-website-latest-news}

<Route author="axojhf" example="/lovelive-anime/news" path="/lovelive-anime/news/:option?" paramsDesc={['Crawl full text when `option` is `detail`.']} radar="1"/>

### Love Live Official Website Categories Topics {#lovelive-anime-love-live-official-website-categories-topics}

<Route author="axojhf" example="/lovelive-anime/topics/otonokizaka" path="/lovelive-anime/topics/:abbr/:category?/:option?" paramsDesc={['The path to the Love Live series of sub-projects on the official website is detailed in the table below', 'The official website lists the Topics category, `category` is `detail` when crawling the full text, other categories see the following table for details', 'Crawl full text when `option` is `detail`.']} radar="1">

| Sub-project Name (not full name) | Lovelive!   | Lovelive! Sunshine!! | Lovelive! Nijigasaki High School Idol Club | Lovelive! Superstar!! | 幻日のヨハネ | ラブライブ！スクールアイドルミュージカル |
|----------------------------------|-------------|----------------------|--------------------------------------------|-----------------------|--------|----------------------|
| `abbr`parameter                  | otonokizaka | uranohoshi           | nijigasaki                                 | yuigaoka              | yohane | musical              |


| Category Name       | 全てのニュース               | 音楽商品  | アニメ映像商品     | キャスト映像商品   | 劇場      | アニメ放送/配信 | キャスト配信/ラジオ | ライブ/イベント | ブック   | グッズ   | ゲーム  | メディア  | ご当地情報 | その他   | キャンペーン   |
|---------------------|-----------------------|-------|-------------|------------|---------|----------|------------|----------|-------|-------|------|-------|-------|-------|----------|
| `category`parameter | <u>*No parameter*</u> | music | anime_movie | cast_movie | theater | onair    | radio      | event    | books | goods | game | media | local | other | campaign |

</Route>

### Love Live Official Website Schedule {#lovelive-anime-love-live-official-website-schedule}

<Route author="axojhf" example="/lovelive-anime/schedules" path="/schedules/:serie?/:category?" paramsDesc={['Love Live! Series sub-projects abbreviation, see the following table', 'The official website lists the categories, see the following table for details']} radar="1">

:::tip Please note!

The schedule and other information obtained by this route is subject to the official website announcement!
The RSS routing has not been rigorously tested and the information provided cannot be guaranteed accurate!

:::

| Sub-project Name (not full name) | 全シリーズ                        | Lovelive!  | Lovelive! Sunshine!! | Lovelive! Nijigasaki High School Idol Club | Lovelive! Superstar!! | ラブライブ！スクールアイドルミュージカル |
|----------------------------------|------------------------------|------------|----------------------|--------------------------------------------|-----------------------|----------------------|
| `serie`parameter                 | <u>*No parameter*</u>or`all` | `lovelive` | `sunshine`           | `nijigasaki`                               | `superstar`           | `musical`            |

| Category Name       | 全て                           | ライブ    | イベント    | 生配信       |
|---------------------|------------------------------|--------|---------|-----------|
| `category`parameter | <u>*No parameter*</u>or`all` | `live` | `event` | `haishin` |

</Route>

## MangaDex {#mangadex}

### Manga Update {#mangadex-manga-update}

<Route author="vzz64" example="/mangadex/58be6aa6-06cb-4ca5-bd20-f1392ce451fb/en" path="/:id/:lang?" paramsDesc={['manga ID', 'language code']} radar="1" />

## Mox.moe {#mox.moe}

### 首頁 {#mox.moe-shou-ye}

<Route author="nczitzk" example="/mox" path="/mox/:category?" paramsDesc={['分类，可在对应分类页 URL 中找到']}>

:::tip

在首页将分类参数选择确定后跳转到的分类页面 URL 中，`/l/` 后的字段即为分类参数。

如 [科幻 + 日語 + 日本 + 長篇 + 完結 + 最近更新](https://mox.moe/l/CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL) 的 URL 为 [https://mox.moe/l/CAT%2A 科幻，日本，完結，lastupdate,jpn,l,BL](https://mox.moe/l/CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL)，此时 `/l/` 后的字段为 `CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL`。最终获得路由为 [`/mox/CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL`](https://rsshub.app/mox/CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL)

:::

</Route>

## nhentai {#nhentai}

### Filter {#nhentai-filter}

<Route author="MegrezZhu hoilc" example="/nhentai/language/chinese" path="/nhentai/:key/:keyword/:mode?" paramsDesc={['Filter term, can be: `parody`, `character`, `tag`, `artist`, `group`, `language` or `category`','Filter value', 'mode, `simple` to only show cover, `detail` to show all pages, `torrent` to include Magnet URI, need login, refer to [Route-specific Configurations](/install/#configuration-route-specific-configurations), default to `simple`']} anticrawler="1" supportBT="1" radar="1"/>

### Advanced Search {#nhentai-advanced-search}

<Route author="MegrezZhu hoilc" example='/nhentai/search/language%3Ajapanese+-scat+-yaoi+-guro+-"mosaic+censorship"' path="/nhentai/search/:keyword/:mode?" paramsDesc={['Keywords for search. You can copy the content after `q=` after searching on the original website, or you can enter it directly. See the [official website](https://nhentai.net/info/) for details', 'mode, `simple` to only show cover, `detail` to show all pages, `torrent` to include Magnet URI, need login, refer to [Route-specific Configurations](/install/#configuration-route-specific-configurations), default to `simple`']} anticrawler="1" supportBT="1" radar="1"/>

## QooApp {#qooapp}

### Game Store - Review {#qooapp-game-store-review}

<Route author="TonyRL" example="/qoo-app/apps/en/comment/7675" path="/qoo-app/apps/:lang?/comment/:id" paramsDesc={['Language, see the table below, empty means `中文`', 'Game ID, can be found in URL']}  radar="1">

| 中文 | English | 한국어 | Español | 日本語 | ไทย | Tiếng Việt |
| -- | ------- | --- | ------- | --- | --- | ---------- |
|    | en      | ko  | es      | ja  | th  | vi         |

</Route>

### Game Store - Article {#qooapp-game-store-article}

<Route author="TonyRL" example="/qoo-app/apps/en/post/7675" path="/qoo-app/apps/:lang?/post/:id" paramsDesc={['Language, see the table above, empty means `中文`', 'Game ID, can be found in URL']}  radar="1"/>

### Game Store - Notes {#qooapp-game-store-notes}

<Route author="TonyRL" example="/qoo-app/apps/en/note/7675" path="/qoo-app/apps/:lang?/note/:id" paramsDesc={['Language, see the table above, empty means `中文`', 'Game ID, can be found in URL']}  radar="1"/>

### Game Store - Cards {#qooapp-game-store-cards}

<Route author="TonyRL" example="/qoo-app/apps/en/card/7675" path="/qoo-app/apps/:lang?/card/:id" paramsDesc={['Language, see the table above, empty means `中文`', 'Game ID, can be found in URL']}  radar="1"/>

### News {#qooapp-news}

<Route author="TonyRL" example="/qoo-app/news/en" path="/qoo-app/news/:lang?" paramsDesc={['Language, see the table below, empty means `中文`']}  radar="1">

| 中文 | English |
| -- | ------- |
|    | en      |

</Route>

### Note Comments {#qooapp-note-comments}

<Route author="TonyRL" example="/qoo-app/notes/en/note/2329113" path="/qoo-app/notes/:lang?/note/:id" paramsDesc={['Language, see the table above, empty means `中文`', 'Note ID, can be found in URL']}  radar="1"/>

### Hot Hashtags {#qooapp-hot-hashtags}

<Route author="TonyRL" example="/qoo-app/notes/en/topic/QooAppGacha" path="/qoo-app/notes/:lang?/topic/:id" paramsDesc={['Language, see the table above, empty means `中文`', 'Hashtag name without `#`']}  radar="1"/>

### User Game Comments {#qooapp-user-game-comments}

<Route author="TonyRL" example="/qoo-app/user/en/appComment/35399143" path="/qoo-app/user/:lang?/appComment/:uid" paramsDesc={['Language, see the table above, empty means `中文`', 'User ID, can be found in URL']}  radar="1"/>

### User Notes {#qooapp-user-notes}

<Route author="TonyRL" example="/qoo-app/notes/en/user/35399143" path="/qoo-app/notes/:lang?/user/:uid" paramsDesc={['Language, see the table above, empty means `中文`', 'User ID, can be found in URL']}  radar="1"/>

## Rawkuma {#rawkuma}

### Manga {#rawkuma-manga}

<Route author="nczitzk" example="/rawkuma/manga/tensei-shitara-dai-nana-ouji-dattanode-kimamani-majutsu-o-kiwamemasu" path="/rawkuma/manga/:id" paramsDesc={['Manga ID, can be found in URL']} radar="1"/>

## say 花火 {#say-hua-huo}

### 文章 {#say-hua-huo-wen-zhang}

<Route author="junfengP" example="/sayhuahuo" path="/sayhuahuo"/>

## THBWiki {#thbwiki}

### Calendar {#thbwiki-calendar}

<Route author="aether17" path="/thwiki/calendar/:before?/:after?" example="/thwiki/calendar" paramsDesc={['From how many days ago (default 30)', 'To how many days after (default 30)']} radar="1" rssbud="1"/>

## Touhougarakuta 东方我乐多丛志 {#touhougarakuta-dong-fang-wo-le-duo-cong-zhi}

### Articles {#touhougarakuta-dong-fang-wo-le-duo-cong-zhi-articles}

<Route author="ttyfly" path="/touhougarakuta/:language/:type" example="/touhougarakuta/ja/news" paramsDesc={['language', 'article type']}>

Languages:

| Chinese | Japanese | Korean |
| ---- | ---- | ---- |
|  cn  |  ja  |  ko  |

Article types:

|  Index   | Series | Interviews | Novels | Comics | News |
| -------- | ------ | ---------- | ------ | ------ | ---- |
|  index   | series | interviews | novels | comics | news |

| Music review | Game review | Book review  | Where are you |
| ------------ | ----------- | ------------ | ------------- |
| music_review | game_review | book_review  | where_are_you |

**Note:** The index type includes all types of articles. Think twice before using it.

</Route>

## VCB-Studio {#vcb-studio}

### 最新文章 {#vcb-studio-zui-xin-wen-zhang}

<Route author="cxfksword" example="/vcb-s" path="/vcb-s" radar="1"/>

### 分类文章 {#vcb-studio-fen-lei-wen-zhang}

<Route author="cxfksword" example="/vcb-s/category/works" path="/vcb-s/category/:cate" paramsDesc={['分类']} radar="1">

| 作品项目 | 科普系列 | 计划与日志 |
| -------- | -------- | ---------- |
| works    | kb       | planlog    |

</Route>

## Vol.moe {#vol.moe}

### vol {#vol.moe-vol}

<Route author="CoderTonyChan" example="/vol/finish" path="/vol/:mode?" paramsDesc={['mode type']}>

| Comics are serialized | Comics is finshed |
| --------------------- | ----------------- |
| serial                | finish            |

</Route>

## Webtoons {#webtoons}

### Comic updates {#webtoons-comic-updates}

<Route author="machsix" path="/webtoons/:lang/:category/:name/:id" example="/webtoons/zh-hant/drama/gongzhuweimian/894" paramsDesc={['Language','Category','Name','ID']}/>

For example: <https://www.webtoons.com/zh-hant/drama/gongzhuweimian/list?title_no=894>, `lang=zh-hant`,`category=drama`,`name=gongzhucheyeweimian`,`id=894`.

### Naver {#webtoons-naver}

<Route author="zfanta" example="/webtoons/naver/651673" path="/webtoons/naver/:titleId" paramsDesc={['titleId of naver webtoon']} />

## X 漫画 {#x-man-hua}

### 最新动态 {#x-man-hua-zui-xin-dong-tai}

<Route author="Ye11" example="/xmanhua/73xm" path="/xmanhua/:uid" paramsDesc={['漫画 id,在浏览器中可见，例如鬼灭之刃对应的 id 为 `73xm`']}/>

## 俺の 3D エロ動画 (oreno3d) {#an-%E3%81%AE-3d-%E3%82%A8%E3%83%AD-dong-hua-oreno3d}

:::tip

You can use some RSS parsing libraries (like `feedpraser` in `Python`) to receive the video update messages and download them automatically

:::

### Keyword Search {#an-%E3%81%AE-3d-%E3%82%A8%E3%83%AD-dong-hua-oreno3d-keyword-search}

<Route author="xueli-sherryli" example="/oreno3d/search/bronya/latest/1" path="/oreno3d/search/:keyword/:sort/:pagelimit?" paramsDesc={['Search keyword', 'Sort method, see the table below', 'The maximum number of pages to be crawled, the default is 1']} radar="1" rssbud="1">

| favorites | hot  | latest | popularity |
| --------- | ---- | ------ | ---------- |
| favorites | hot  | latest | popularity |

</Route>

### Character Search {#an-%E3%81%AE-3d-%E3%82%A8%E3%83%AD-dong-hua-oreno3d-character-search}

<Route author="xueli-sherryli" example="/oreno3d/characters/283/latest/1" path="/oreno3d/characters/:characterid/:sort/:pagelimit?" paramsDesc={['Character id, can be found in URL' , 'Sort method, see the table above', 'The maximum number of pages to be crawled, the default is 1']} radar="1" rssbud="1"/>

### Author Search {#an-%E3%81%AE-3d-%E3%82%A8%E3%83%AD-dong-hua-oreno3d-author-search}

<Route author="xueli-sherryli" example="/oreno3d/authors/3189/latest/1" path="/oreno3d/authors/:authorid/:sort/:pagelimit?" paramsDesc={['Author id, can be found in URL' , 'Sort method, see the table above', 'The maximum number of pages to be crawled, the default is 1']} radar="1" rssbud="1"/>

### Tags Search {#an-%E3%81%AE-3d-%E3%82%A8%E3%83%AD-dong-hua-oreno3d-tags-search}

<Route author="xueli-sherryli" example="/oreno3d/tags/177/latest/1" path="/oreno3d/tags/:tagid/:sort/:pagelimit?" paramsDesc={['Tag id, can be found in URL', 'Sort method, see the table above', 'The maximum number of pages to be crawled, the default is 1']} radar="1" rssbud="1"/>

### Origins Search {#an-%E3%81%AE-3d-%E3%82%A8%E3%83%AD-dong-hua-oreno3d-origins-search}

<Route author="xueli-sherryli" example="/oreno3d/origins/3/latest/1" path="/oreno3d/origins/:originid/:sort/:pagelimit?" paramsDesc={['Origin id, can be found in URL' , 'Sort method, see the table above', 'The maximum number of pages to be crawled, the default is 1']} radar="1" rssbud="1"/>

## 包子漫画 {#bao-zi-man-hua}

### 订阅漫画 {#bao-zi-man-hua-ding-yue-man-hua}

<Route author="Fatpandac" example="/baozimh/comic/guowangpaiming-shiricaofu" path="/baozimh/comic/:name" paramsDesc={['漫画名称，在漫画链接可以得到(`comic/` 后的那段)']}/>

## 嘀哩嘀哩 - dilidili {#di-li-di-li-dilidili}

### 嘀哩嘀哩番剧更新 {#di-li-di-li-dilidili-di-li-di-li-fan-ju-geng-xin}

<Route author="SunShinenny" path="/dilidili/fanju/:id" example="/dilidili/fanju/onepunchman2" paramsDesc={['番剧id']}>

请打开对应番剧的纵览页 (非具体某集), 从 url 中最后一位查看番剧 id.(一般为英文)
除去 ' 海贼 ' 此类具有特殊页面的超长番剧，绝大多数页面都可以解析.
最适合用来追新番

</Route>

## 電撃オンライン {#dian-ji-%E3%82%AA%E3%83%B3%E3%83%A9%E3%82%A4%E3%83%B3}

### 最新記事 {#dian-ji-%E3%82%AA%E3%83%B3%E3%83%A9%E3%82%A4%E3%83%B3-zui-xin-ji-shi}

<Route author="cssxsh" path="/dengekionline/:type?" example="/dengekionline/dps" paramsDesc={['新闻类别，如下表']}>

| All | PlayStation | Nintendo | Xbox      | PC  | Girl’sStyle | Arcade Web | App | Anime | Review | Rank |
| --- | ----------- | -------- | --------- | --- | ----------- | ---------- | --- | ----- | ------ | ---- |
|     | dps         | nintendo | microsoft | dpc | gstyle      | arcade     | app | anime | review | rank |

</Route>

## 咚漫 {#dong-man}

### 漫画更新 {#dong-man-man-hua-geng-xin}

<Route author="machsix" path="/dongmanmanhua/:category/:name/:id" example="/dongmanmanhua/COMEDY/xin-xinlingdeshengyin/381" paramsDesc={['类别','名称','ID']}/>

## 动漫之家 {#dong-man-zhi-jia}

### 新闻站 {#dong-man-zhi-jia-xin-wen-zhan}

<Route author="vzz64" path="/dmzj/news/:category?" example="/dmzj/news/donghuaqingbao" paramsDesc={['类别']} radar="1">

| 漫画情报      | 轻小说情报          | 动漫周边       | 声优情报        | 音乐资讯    | 游戏资讯   | 美图欣赏      | 漫展情报       | 大杂烩  |
| ------------- | ------------------- | -------------- | --------------- | ----------- | ---------- | ------------- | -------------- | ------- |
| manhuaqingbao | qingxiaoshuoqingbao | manhuazhoubian | shengyouqingbao | yinyuezixun | youxizixun | meituxinshang | manzhanqingbao | dazahui |

</Route>

## 動畫瘋 {#dong-hua-feng}

### 最後更新 {#dong-hua-feng-zui-hou-geng-xin}

<Route author="maple3142" example="/anigamer/new_anime" path="/anigamer/new_anime"/>

### 動畫 {#dong-hua-feng-dong-hua}

<Route author="maple3142" example="/anigamer/anime/90003" path="/anigamer/anime/:sn" paramsDesc={['動畫 sn']}/>

## 動漫狂 {#dong-man-kuang}

### 漫画更新 {#dong-man-kuang-man-hua-geng-xin}

<Route author="KellyHwong" path="/cartoonmad/comic/:id" example="/cartoonmad/comic/5827" paramsDesc={['漫画ID']} radar="1"/>

## 番组放送 {#fan-zu-fang-song}

### 开播提醒 {#fan-zu-fang-song-kai-bo-ti-xing}

<Route author="x2cf" example="/bgmlist/onair/zh-Hans" path="/bgmlist/onair/:lang?" paramsDesc={['语言']} radar="1" rssbud="1" />

## 风之动漫 {#feng-zhi-dong-man}

### 在线漫画 {#feng-zhi-dong-man-zai-xian-man-hua}

<Route author="geeeeoff zytomorrow" path="/fffdm/manhua/:id/:cdn?" example="/fffdm/manhua/93" paramsDesc={['漫画ID。默认获取全部，建议使用通用参数limit获取指定数量', 'cdn加速器。默认5，当前可选1-5']}  radar="1" rssbud="1"/>

## 海猫吧 {#hai-mao-ba}

### 漫画更新 {#hai-mao-ba-man-hua-geng-xin}

<Route author="zytomorrow" path="/haimaoba/:id" example="/haimaoba/4026" paramsDesc={['漫画id，漫画主页的地址栏中最后一位数字']} radar="1" rssbud="1"/>

## 禁漫天堂 {#jin-man-tian-tang}

:::tip

禁漫天堂有多个备用域名，本路由默认使用域名 <https://jmcomic.me>，若该域名无法访问，可以通过在路由最后加上 `?domain=<域名>` 指定路由访问的域名。如指定备用域名为 <https://jmcomic1.me>，则在所有禁漫天堂路由最后加上 `?domain=jmcomic1.me` 即可，此时路由为 [`/18comic?domain=jmcomic1.me`](https://rsshub.app/18comic?domain=jmcomic1.me)

:::

### 成人 A 漫 {#jin-man-tian-tang-cheng-ren-a-man}

<Route author="nczitzk" example="/18comic" path="/18comic/:category?/:time?/:order?/:keyword?" paramsDesc={['分类，见下表，默认为 `all` 即全部', '时间范围，见下表，默认为 `a` 即全部', '排列顺序，见下表，默认为 `mr` 即最新', '关键字，见下表，默认为空']}>

分类

| 全部 | 其他漫畫 | 同人   | 韓漫   | 美漫   | 短篇  | 单本   |
| ---- | -------- | ------ | ------ | ------ | ----- | ------ |
| all  | another  | doujin | hanman | meiman | short | single |

时间范围

| 全部 | 今天 | 这周 | 本月 |
| ---- | ---- | ---- | ---- |
| a    | t    | w    | m    |

排列顺序

| 最新 | 最多点阅的 | 最多图片 | 最高评分 | 最多评论 | 最多爱心 |
| ---- | ---------- | -------- | -------- | -------- | -------- |
| mr   | mv         | mp       | tr       | md       | tf       |

关键字（供参考）

| YAOI | 女性向 | NTR | 非 H | 3D | 獵奇 |
| ---- | ------ | --- | ---- | -- | ---- |

</Route>

### 搜索 {#jin-man-tian-tang-sou-suo}

<Route author="nczitzk" example="/18comic/search/photos/all/NTR" path="/18comic/search/:option?/:category?/:keyword?/:time?/:order?" paramsDesc={['选项，可选 `video` 和 `photos`，默认为 `photos`', '分类，同上表，默认为 `all` 即全部', '关键字，同上表，默认为空', '时间范围，同上表，默认为 `a` 即全部', '排列顺序，同上表，默认为 `mr` 即最新']}>

:::tip

关键字必须超过两个字，这是来自网站的限制。

:::

</Route>

### 专辑 {#jin-man-tian-tang-zhuan-ji}

<Route author="nczitzk" example="/18comic/album/292282" path="/18comic/album/:id" paramsDesc={['专辑 id，可在专辑页 URL 中找到']}>

:::tip

专辑 id 不包括 URL 中标题的部分。

:::

</Route>

### 文庫 {#jin-man-tian-tang-wen-ku}

<Route author="nczitzk" example="/18comic/blogs" path="/18comic/blogs/:category?" paramsDesc={['分类，见下表，默认为空即全部']}>

分类

| 全部 | 紳夜食堂 | 遊戲文庫 | JG GAMES | 模型山下 |
| ---- | -------- | -------- | -------- | -------- |
|      | dinner   | raiders  | jg       | figure   |

</Route>

## 看漫画 {#kan-man-hua}

### 漫画更新 {#kan-man-hua-man-hua-geng-xin}

<Route author="MegrezZhu" path="/manhuagui/comic/:id/:chapterCnt?" example="/manhuagui/comic/22942/5" paramsDesc={['漫画ID','返回章节的数量，默认为0，返回所有章节']} radar="1" rssbud="1"/>

### 漫画个人订阅 {#kan-man-hua-man-hua-ge-ren-ding-yue}

<Route author="shininome" path="/manhuagui/subscribe" example="/manhuagui/subscribe" radar="1" rssbud="1" selfhost="1">

:::tip

个人订阅需要自建
环境变量需要添加 MHGUI_COOKIE

:::

</Route>

### 镜像站 - 漫画更新 {#kan-man-hua-jing-xiang-zhan-man-hua-geng-xin}

<Route author="btdwv" path="/manhuagui/mhgui/comic/:id/:chapterCnt?" example="/manhuagui/mhgui/comic/13317/5" paramsDesc={['漫画ID','返回章节的数量，默认为0，返回所有章节']} radar="1" rssbud="1"/>

### 台湾站 - 漫画更新 {#kan-man-hua-tai-wan-zhan-man-hua-geng-xin}

<Route author="btdwv" path="/manhuagui/twmanhuagui/comic/:id/:chapterCnt?" example="/manhuagui/twmanhuagui/comic/13317/5" paramsDesc={['漫画ID','返回章节的数量，默认为0，返回所有章节']} radar="1" rssbud="1"/>

## 拷贝漫画 {#kao-bei-man-hua}

### 漫画更新 {#kao-bei-man-hua-man-hua-geng-xin}

<Route author="btdwv marvolo666 yan12125" path="/copymanga/comic/:id/:chapterCnt?" example="/copymanga/comic/dianjuren/5" paramsDesc={['漫画ID', '返回章节的数量，默认为 `10`']} radar="1" rssbud="1"/>

## 漫画 DB {#man-hua-db}

### 漫画 DB {#man-hua-db-man-hua-db}

<Route author="junfengP" path="/manhuadb/:id" example="/manhuadb/comics/1711" paramsDesc={['漫画ID']}/>

## 漫画堆 {#man-hua-dui}

### 漫画 {#man-hua-dui-man-hua}

<Route author="geeeeoff" path="/manhuadui/manhua/:name/:serial?" example="/manhuadui/manhua/yiquanchaoren/1" paramsDesc={['漫画名称', '内容序号，部分漫画存在最新章节、原作、番外，根据页面顺序从1开始排序']}/>

## 漫小肆 {#man-xiao-si}

### 漫画更新 {#man-xiao-si-man-hua-geng-xin}

<Route author="junfengP" path="/manxiaosi/book/:id" example="/manxiaosi/book/90" paramsDesc={['漫画id，漫画主页的地址栏中']} radar="1" rssbud="1"/>

## 三界异次元 {#san-jie-yi-ci-yuan}

### 三界异次元 {#san-jie-yi-ci-yuan-san-jie-yi-ci-yuan}

<Route author="luyuhuang" example="/3ycy/home" path="/3ycy/home" radar="1" rssbud="1"/>

## 紳士漫畫 {#shen-shi-man-hua}

### 最新 {#shen-shi-man-hua-zui-xin}

<Route author="KenMizz" example="/wnacg" path="/wnacg" radar="1"/>

### 分类更新 {#shen-shi-man-hua-fen-lei-geng-xin}

<Route author="Gandum2077" example="/wnacg/category/6" path="/wnacg/category/:cid" paramsDesc={['分类的 id，即对应 URL 中的数字']} radar="1"/>

### 標籤更新 {#shen-shi-man-hua-biao-qian-geng-xin}

<Route author="Gandum2077" example="/wnacg/tag/漢化" path="/wnacg/tag/:tag" paramsDesc={['標籤，即 URL 中的 `tag-`後的文字']} radar="1"/>

## 鼠绘漫画 {#shu-hui-man-hua}

### 鼠绘漫画 {#shu-hui-man-hua-shu-hui-man-hua}

<Route author="zytomorrow" path="/shuhui/comics/:id" example="/shuhui/comics/1" paramsDesc={['漫画id，漫画主页的地址栏中最后一位数字']} radar="1" rssbud="1"/>

## 腾讯动漫 {#teng-xun-dong-man}

### 排行榜 {#teng-xun-dong-man-pai-hang-bang}

<Route author="nczitzk" example="/qq/ac/rank" path="/qq/ac/rank/:type?/:time?" paramsDesc={['分类，见下表，默认为月票榜', '时间，`cur` 为当周、`prev` 为上周']} radar="1" rssbud="1">

| 月票榜 | 飙升榜 | 新作榜 | 畅销榜 | TOP100 | 男生榜 | 女生榜 |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| mt     | rise   | new    | pay    | top    | male   | female |

:::tip

`time` 参数仅在 `type` 参数选为 **月票榜** 的时候生效。

:::

</Route>

### 漫画 {#teng-xun-dong-man-man-hua}

<Route author="nczitzk" example="/qq/ac/comic/531490" path="/qq/ac/comic/:id" paramsDesc={['编号，可在对应页 URL 中找到']} radar="1" rssbud="1"/>

## 忧郁的 loli {#you-yu-de-loli}

### 文章 {#you-yu-de-loli-wen-zhang}

<Route author="DIYgod kotoyuuko" example="/hhgal" path="/hhgal"/>

## 月幕 Galgame {#yue-mu-galgame}

### 文章 {#yue-mu-galgame-wen-zhang}

<Route author="SunBK201" example="/ymgal/article" path="/ymgal/article/:type?" paramsDesc={['文章类型']} radar="1">

| 全部文章 | 资讯 | 专栏   |
| -------- | ---- | ------ |
| all      | news | column |

</Route>

### 本月新作 {#yue-mu-galgame-ben-yue-xin-zuo}

<Route author="SunBK201" example="/ymgal/game/release" path="/ymgal/game/release" radar="1" />

## 终点分享 {#zhong-dian-fen-xiang}

### 最新汉化 {#zhong-dian-fen-xiang-zui-xin-han-hua}

<Route author="junfengP" example="/zdfx" path="/zdfx"/>

## アニメ新番組 {#%E3%82%A2%E3%83%8B%E3%83%A1-xin-fan-zu}

### 當季新番 {#%E3%82%A2%E3%83%8B%E3%83%A1-xin-fan-zu-dang-ji-xin-fan}

<Route author="devinmugen" example="/bangumi/online" path="/bangumi/online"/>
