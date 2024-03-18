# 🎨️ ACG

## AcFun <Site url="www.acfun.cn"/>

### 番剧 <Site url="www.acfun.cn" size="sm" />

<Route namespace="acfun" :data='{"path":"/bangumi/:id","categories":["anime"],"example":"/acfun/bangumi/5022158","parameters":{"id":"番剧 id"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"番剧","maintainers":["xyqfer"],"description":":::tip\n番剧 id 不包含开头的 aa。\n例如：`https://www.acfun.cn/bangumi/aa5022158` 的番剧 id 是 5022158，不包括开头的 aa。\n:::","location":"bangumi.ts"}' />

:::tip
番剧 id 不包含开头的 aa。
例如：`https://www.acfun.cn/bangumi/aa5022158` 的番剧 id 是 5022158，不包括开头的 aa。
:::

### 文章 <Site url="www.acfun.cn" size="sm" />

<Route namespace="acfun" :data='{"path":"/article/:categoryId/:sortType?/:timeRange?","categories":["anime"],"example":"/acfun/article/110","parameters":{"categoryId":"分区 ID，见下表","sortType":"排序，见下表，默认为 `createTime`","timeRange":"时间范围，见下表，仅在排序是 `hotScore` 有效，默认为 `all`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"文章","maintainers":["TonyRL"],"description":"| 二次元画师 | 综合 | 生活情感 | 游戏 | 动漫文化 | 漫画文学 |\n  | ---------- | ---- | -------- | ---- | -------- | -------- |\n  | 184        | 110  | 73       | 164  | 74       | 75       |\n\n  | 最新发表   | 最新动态        | 最热文章 |\n  | ---------- | --------------- | -------- |\n  | createTime | lastCommentTime | hotScore |\n\n  | 时间不限 | 24 小时 | 三天     | 一周    | 一个月   |\n  | -------- | ------- | -------- | ------- | -------- |\n  | all      | oneDay  | threeDay | oneWeek | oneMonth |","location":"article.ts"}' />

| 二次元画师 | 综合 | 生活情感 | 游戏 | 动漫文化 | 漫画文学 |
  | ---------- | ---- | -------- | ---- | -------- | -------- |
  | 184        | 110  | 73       | 164  | 74       | 75       |

  | 最新发表   | 最新动态        | 最热文章 |
  | ---------- | --------------- | -------- |
  | createTime | lastCommentTime | hotScore |

  | 时间不限 | 24 小时 | 三天     | 一周    | 一个月   |
  | -------- | ------- | -------- | ------- | -------- |
  | all      | oneDay  | threeDay | oneWeek | oneMonth |

### 用户投稿 <Site url="www.acfun.cn" size="sm" />

<Route namespace="acfun" :data='{"path":"/user/video/:uid","radar":[{"source":["www.acfun.cn/u/:id"],"target":"/user/video/:id"}],"name":"用户投稿","parameters":{"uid":"用户 UID"},"categories":["anime"],"maintainers":["wdssmq"],"location":"video.ts"}' />

## ACG17 <Site url="acg17.com"/>

### 全部文章 <Site url="acg17.com/post" size="sm" />

<Route namespace="acg17" :data='{"path":"/post/all","categories":["anime"],"example":"/acg17/post/all","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["acg17.com/post"]}],"name":"全部文章","maintainers":["SunBK201"],"url":"acg17.com/post","location":"post.ts"}' />

## AGE 动漫 <Site url="agemys.cc"/>

### 番剧详情 <Site url="agemys.cc" size="sm" />

<Route namespace="agefans" :data='{"path":"/detail/:id","categories":["anime"],"example":"/agefans/detail/20200035","parameters":{"id":"番剧 id，对应详情 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["agemys.org/detail/:id"]}],"name":"番剧详情","maintainers":["s2marine"],"location":"detail.ts"}' />

### 最近更新 <Site url="agemys.org/update" size="sm" />

<Route namespace="agefans" :data='{"path":"/update","categories":["anime"],"example":"/agefans/update","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["agemys.org/update","agemys.org/"]}],"name":"最近更新","maintainers":["nczitzk"],"url":"agemys.org/update","location":"update.ts"}' />

## CnGal <Site url="www.cngal.org"/>

### 每周速报 <Site url="www.cngal.org/" size="sm" />

<Route namespace="cngal" :data='{"path":"/weekly","categories":["anime"],"example":"/cngal/weekly","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.cngal.org/","www.cngal.org/weeklynews"]}],"name":"每周速报","maintainers":["chengyuhui"],"url":"www.cngal.org/","location":"weekly.ts"}' />

### 制作者 / 游戏新闻 <Site url="www.cngal.org" size="sm" />

<Route namespace="cngal" :data='{"path":"/entry/:id","categories":["anime"],"example":"/cngal/entry/2693","parameters":{"id":"词条ID，游戏或制作者页面URL的最后一串数字"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.cngal.org/entries/index/:id"]}],"name":"制作者 / 游戏新闻","maintainers":["chengyuhui"],"location":"entry.ts"}' />

## Comicat <Site url="comicat.org"/>

### 搜索关键词 <Site url="comicat.org" size="sm" />

<Route namespace="comicat" :data='{"path":"/search/:keyword","categories":["anime"],"example":"/comicat/search/喵萌奶茶屋+跃动青春+720P+简日","parameters":{"keyword":"关键词，请用`+`号连接"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":true,"supportPodcast":false,"supportScihub":false},"name":"搜索关键词","maintainers":["Cyang39"],"location":"search.ts"}' />

## Comics Kingdom <Site url="comicskingdom.com"/>

### Archive <Site url="comicskingdom.com" size="sm" />

<Route namespace="comicskingdom" :data='{"path":"/:name","categories":["anime"],"example":"/comicskingdom/pardon-my-planet","parameters":{"name":"URL path of the strip on comicskingdom.com"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["comicskingdom.com/:name/*","comicskingdom.com/:name"]}],"name":"Archive","maintainers":["stjohnjohnson"],"location":"index.ts"}' />

## CCC 創作集 <Site url="creative-comic.tw"/>

### 漫畫 <Site url="creative-comic.tw" size="sm" />

<Route namespace="creative-comic" :data='{"path":"/book/:id/:coverOnly?/:quality?","categories":["anime"],"example":"/creative-comic/book/117","parameters":{"id":"漫畫 ID，可在 URL 中找到","coverOnly":"僅獲取封面，非 `true` 時將獲取**全部**頁面，預設 `true`","quality":"閱讀品質，標準畫質 `1`，高畫質 `2`，預設 `1`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["creative-comic.tw/book/:id/*"],"target":"/:id"}],"name":"漫畫","maintainers":["TonyRL"],"location":"book.ts"}' />

## DLsite <Site url="dlsite.com"/>

### Current Release <Site url="dlsite.com" size="sm" />

<Route namespace="dlsite" :data='{"path":"/new/:type","categories":["anime"],"example":"/dlsite/new/home","parameters":{"type":"Type, see table below"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Current Release","maintainers":["cssxsh"],"description":"| Doujin | Comics | PC Games | Doujin (R18) | Adult Comics | H Games | Otome | BL |\n  | ------ | ------ | -------- | ------------ | ------------ | ------- | ----- | -- |\n  | home   | comic  | soft     | maniax       | books        | pro     | girls | bl |","location":"new.ts"}' />

| Doujin | Comics | PC Games | Doujin (R18) | Adult Comics | H Games | Otome | BL |
  | ------ | ------ | -------- | ------------ | ------------ | ------- | ----- | -- |
  | home   | comic  | soft     | maniax       | books        | pro     | girls | bl |

### Ci-en Creators' Article <Site url="dlsite.com" size="sm" />

<Route namespace="dlsite" :data='{"path":"/ci-en/:id/article","categories":["anime"],"example":"/dlsite/ci-en/7400/article","parameters":{"id":"Creator id, can be found in URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["ci-en.dlsite.com/creator/:id/article/843558","ci-en.dlsite.com/"]}],"name":"Ci-en Creators&#39; Article","maintainers":["nczitzk"],"location":"ci-en/article.ts"}' />

### Discounted Works <Site url="dlsite.com" size="sm" />

<Route namespace="dlsite" :data='{"path":"/campaign/:type/:free?","categories":["anime"],"example":"/dlsite/campaign/home","parameters":{"type":"Type, see table above","free":"Free only, empty means false, other value means true"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Discounted Works","maintainers":["cssxsh"],"location":"campaign.ts"}' />

### Unknown <Site url="dlsite.com" size="sm" />

<Route namespace="dlsite" :data='{"path":"*","name":"Unknown","maintainers":[],"location":"index.ts"}' />

## Eventernote <Site url="www.eventernote.com"/>

### 声优活动及演唱会 <Site url="www.eventernote.com" size="sm" />

<Route namespace="eventernote" :data='{"path":"/actors/:name/:id","categories":["anime"],"example":"/eventernote/actors/三森すずこ/2634","parameters":{"name":"声优姓名","id":"声优 ID"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.eventernote.com/actors/:name/:id/events"]}],"name":"声优活动及演唱会","maintainers":["KTachibanaM"],"location":"actors.ts"}' />

## Gogoanimehd <Site url="developer.anitaku.to"/>

### Recent Releases <Site url="developer.anitaku.to/" size="sm" />

<Route namespace="gogoanimehd" :data='{"path":"/recent-releases","categories":["anime"],"example":"/gogoanimehd/recent-releases","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["developer.anitaku.to/"]}],"name":"Recent Releases","maintainers":["user4302"],"url":"developer.anitaku.to/","location":"recent-releases.ts"}' />

## Hpoi 手办维基 <Site url="www.hpoi.net"/>

### 角色周边 <Site url="www.hpoi.net" size="sm" />

<Route namespace="hpoi" :data='{"path":"/items/character/:id/:order?","categories":["anime"],"example":"/hpoi/items/character/1035374","parameters":{"id":"角色 ID","order":"排序, 见下表，默认为 add"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"角色周边","maintainers":["DIYgod"],"description":"| 发售    | 入库 | 总热度 | 一周热度 | 一天热度 | 评价   |\n  | ------- | ---- | ------ | -------- | -------- | ------ |\n  | release | add  | hits   | hits7Day | hitsDay  | rating |","location":"character.ts"}' />

| 发售    | 入库 | 总热度 | 一周热度 | 一天热度 | 评价   |
  | ------- | ---- | ------ | -------- | -------- | ------ |
  | release | add  | hits   | hits7Day | hitsDay  | rating |

### 情报 <Site url="www.hpoi.net" size="sm" />

<Route namespace="hpoi" :data='{"path":"/info/:type?","categories":["anime"],"example":"/hpoi/info/all","parameters":{"type":"分类, 见下表, 默认为`all`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"情报","maintainers":["sanmmm DIYgod"],"description":"分类\n\n  | 全部 | 手办  | 模型  |\n  | ---- | ----- | ----- |\n  | all  | hobby | model |","location":"info.ts"}' />

分类

  | 全部 | 手办  | 模型  |
  | ---- | ----- | ----- |
  | all  | hobby | model |

### 热门推荐 <Site url="www.hpoi.net/bannerItem/list" size="sm" />

<Route namespace="hpoi" :data='{"path":"/bannerItem","categories":["anime"],"example":"/hpoi/bannerItem","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.hpoi.net/bannerItem/list"]}],"name":"热门推荐","maintainers":["DIYgod"],"url":"www.hpoi.net/bannerItem/list","location":"banner-item.ts"}' />

### 所有周边 <Site url="www.hpoi.net/hobby/all" size="sm" />

<Route namespace="hpoi" :data='{"path":"/items/all/:order?","categories":["anime"],"example":"/hpoi/items/all","parameters":{"order":"排序, 见下表，默认为 add"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.hpoi.net/hobby/all"],"target":"/items/all"}],"name":"所有周边","maintainers":["DIYgod"],"url":"www.hpoi.net/hobby/all","description":"| 发售    | 入库 | 总热度 | 一周热度 | 一天热度 | 评价   |\n  | ------- | ---- | ------ | -------- | -------- | ------ |\n  | release | add  | hits   | hits7Day | hitsDay  | rating |","location":"all.ts"}' />

| 发售    | 入库 | 总热度 | 一周热度 | 一天热度 | 评价   |
  | ------- | ---- | ------ | -------- | -------- | ------ |
  | release | add  | hits   | hits7Day | hitsDay  | rating |

### 用户动态 <Site url="www.hpoi.net" size="sm" />

<Route namespace="hpoi" :data='{"path":"/user/:user_id/:caty","categories":["anime"],"example":"/hpoi/user/116297/buy","parameters":{"user_id":"用户ID","caty":"类别, 见下表"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"用户动态","maintainers":["DIYgod","luyuhuang"],"description":"| 想买 | 预定     | 已入 | 关注 | 有过   |\n  | ---- | -------- | ---- | ---- | ------ |\n  | want | preorder | buy  | care | resell |","location":"user.ts"}' />

| 想买 | 预定     | 已入 | 关注 | 有过   |
  | ---- | -------- | ---- | ---- | ------ |
  | want | preorder | buy  | care | resell |

### 作品周边 <Site url="www.hpoi.net" size="sm" />

<Route namespace="hpoi" :data='{"path":"/items/work/:id/:order?","categories":["anime"],"example":"/hpoi/items/work/4117491","parameters":{"id":"作品 ID","order":"排序, 见下表，默认为 add"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"作品周边","maintainers":["DIYgod"],"description":"| 发售    | 入库 | 总热度 | 一周热度 | 一天热度 | 评价   |\n  | ------- | ---- | ------ | -------- | -------- | ------ |\n  | release | add  | hits   | hits7Day | hitsDay  | rating |","location":"work.ts"}' />

| 发售    | 入库 | 总热度 | 一周热度 | 一天热度 | 评价   |
  | ------- | ---- | ------ | -------- | -------- | ------ |
  | release | add  | hits   | hits7Day | hitsDay  | rating |

## IDOLY PRIDE 偶像荣耀 <Site url="idolypride.jp"/>

### News <Site url="idolypride.jp/news" size="sm" />

<Route namespace="idolypride" :data='{"path":"/news","categories":["anime"],"example":"/idolypride/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["idolypride.jp/news"]}],"name":"News","maintainers":["Mingxia1"],"url":"idolypride.jp/news","location":"news.ts"}' />

## iwara <Site url="ecchi.iwara.tv"/>

### Unknown <Site url="ecchi.iwara.tv" size="sm" />

<Route namespace="iwara" :data='{"path":"/users/:username?/:type?","name":"Unknown","maintainers":["Fatpandac"],"location":"index.ts"}' />

### User Subscriptions <Site url="ecchi.iwara.tv/" size="sm" />

<Route namespace="iwara" :data='{"path":"/subscriptions","categories":["anime"],"example":"/iwara/subscriptions","parameters":{},"features":{"requireConfig":[{"name":"IWARA_USERNAME","description":""},{"name":"IWARA_PASSWORD","description":""}],"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["ecchi.iwara.tv/"]}],"name":"User Subscriptions","maintainers":["FeCCC"],"url":"ecchi.iwara.tv/","description":":::warning\n  This route requires username and password, therefore it&#39;s only available when self-hosting, refer to the [Deploy Guide](/install/#route-specific-configurations) for route-specific configurations.\n  :::","location":"subscriptions.ts"}' />

:::warning
  This route requires username and password, therefore it's only available when self-hosting, refer to the [Deploy Guide](/install/#route-specific-configurations) for route-specific configurations.
  :::

## Kemono <Site url="kemono.su"/>

### Posts <Site url="kemono.su" size="sm" />

<Route namespace="kemono" :data='{"path":"/:source?/:id?","categories":["anime"],"example":"/kemono","parameters":{"source":"Source, see below, Posts by default","id":"User id, can be found in URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["kemono.su/:source/user/:id","kemono.su/"]}],"name":"Posts","maintainers":["nczitzk"],"description":"Sources\n\n  | Posts | Patreon | Pixiv Fanbox | Gumroad | SubscribeStar | DLsite | Discord | Fantia |\n  | ----- | ------- | ------------ | ------- | ------------- | ------ | ------- | ------ |\n  | posts | patreon | fanbox       | gumroad | subscribestar | dlsite | discord | fantia |\n\n  :::tip\n  When `posts` is selected as the value of the parameter **source**, the parameter **id** does not take effect.\n  :::","location":"index.ts"}' />

Sources

  | Posts | Patreon | Pixiv Fanbox | Gumroad | SubscribeStar | DLsite | Discord | Fantia |
  | ----- | ------- | ------------ | ------- | ------------- | ------ | ------- | ------ |
  | posts | patreon | fanbox       | gumroad | subscribestar | dlsite | discord | fantia |

  :::tip
  When `posts` is selected as the value of the parameter **source**, the parameter **id** does not take effect.
  :::

## lovelive-anime <Site url="www.lovelive-anime.jp"/>

### Love Live! Official Website Latest NEWS <Site url="www.lovelive-anime.jp/" size="sm" />

<Route namespace="lovelive-anime" :data='{"path":"/news/:option?","categories":["anime"],"example":"/lovelive-anime/news","parameters":{"option":"Crawl full text when `option` is `detail`."},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.lovelive-anime.jp/","www.lovelive-anime.jp/news"],"target":"/news"}],"name":"Love Live! Official Website Latest NEWS","maintainers":["axojhf"],"url":"www.lovelive-anime.jp/","location":"news.ts"}' />

### Love Live Official Website Categories Topics <Site url="www.lovelive-anime.jp" size="sm" />

<Route namespace="lovelive-anime" :data='{"path":"/topics/:abbr/:category?/:option?","categories":["anime"],"example":"/lovelive-anime/topics/otonokizaka","parameters":{"abbr":"The path to the Love Live series of sub-projects on the official website is detailed in the table below","category":"The official website lists the Topics category, `category` is `detail` when crawling the full text, other categories see the following table for details","option":"Crawl full text when `option` is `detail`."},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Love Live Official Website Categories Topics","maintainers":["axojhf"],"description":"| Sub-project Name (not full name) | Lovelive!   | Lovelive! Sunshine!! | Lovelive! Nijigasaki High School Idol Club | Lovelive! Superstar!! | 幻日のヨハネ | ラブライブ！スクールアイドルミュージカル |\n  | -------------------------------- | ----------- | -------------------- | ------------------------------------------ | --------------------- | ------------ | ---------------------------------------- |\n  | `abbr`parameter                  | otonokizaka | uranohoshi           | nijigasaki                                 | yuigaoka              | yohane       | musical                                  |\n\n  | Category Name       | 全てのニュース        | 音楽商品 | アニメ映像商品 | キャスト映像商品 | 劇場    | アニメ放送 / 配信 | キャスト配信 / ラジオ | ライブ / イベント | ブック | グッズ | ゲーム | メディア | ご当地情報 | その他 | キャンペーン |\n  | ------------------- | --------------------- | -------- | -------------- | ---------------- | ------- | ----------------- | --------------------- | ----------------- | ------ | ------ | ------ | -------- | ---------- | ------ | ------------ |\n  | `category`parameter | <u>*No parameter*</u> | music    | anime_movie   | cast_movie      | theater | onair             | radio                 | event             | books  | goods  | game   | media    | local      | other  | campaign     |","location":"topics.ts"}' />

| Sub-project Name (not full name) | Lovelive!   | Lovelive! Sunshine!! | Lovelive! Nijigasaki High School Idol Club | Lovelive! Superstar!! | 幻日のヨハネ | ラブライブ！スクールアイドルミュージカル |
  | -------------------------------- | ----------- | -------------------- | ------------------------------------------ | --------------------- | ------------ | ---------------------------------------- |
  | `abbr`parameter                  | otonokizaka | uranohoshi           | nijigasaki                                 | yuigaoka              | yohane       | musical                                  |

  | Category Name       | 全てのニュース        | 音楽商品 | アニメ映像商品 | キャスト映像商品 | 劇場    | アニメ放送 / 配信 | キャスト配信 / ラジオ | ライブ / イベント | ブック | グッズ | ゲーム | メディア | ご当地情報 | その他 | キャンペーン |
  | ------------------- | --------------------- | -------- | -------------- | ---------------- | ------- | ----------------- | --------------------- | ----------------- | ------ | ------ | ------ | -------- | ---------- | ------ | ------------ |
  | `category`parameter | <u>*No parameter*</u> | music    | anime_movie   | cast_movie      | theater | onair             | radio                 | event             | books  | goods  | game   | media    | local      | other  | campaign     |

### Unknown <Site url="www.lovelive-anime.jp" size="sm" />

<Route namespace="lovelive-anime" :data='{"path":"/schedules/:serie?/:category?","name":"Unknown","maintainers":[],"location":"schedules.ts"}' />

## Mox.moe <Site url="mox.moe"/>

### 首頁 <Site url="mox.moe" size="sm" />

<Route namespace="mox" :data='{"path":"/:category?","categories":["anime"],"example":"/mox","parameters":{"category":"分类，可在对应分类页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["mox.moe/l/:category","mox.moe/"]}],"name":"首頁","maintainers":["nczitzk"],"description":":::tip\n  在首页将分类参数选择确定后跳转到的分类页面 URL 中，`/l/` 后的字段即为分类参数。\n\n  如 [科幻 + 日語 + 日本 + 長篇 + 完結 + 最近更新](https://mox.moe/l/CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL) 的 URL 为 [https://mox.moe/l/CAT%2A 科幻，日本，完結，lastupdate,jpn,l,BL](https://mox.moe/l/CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL)，此时 `/l/` 后的字段为 `CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL`。最终获得路由为 [`/mox/CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL`](https://rsshub.app/mox/CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL)\n  :::","location":"index.ts"}' />

:::tip
  在首页将分类参数选择确定后跳转到的分类页面 URL 中，`/l/` 后的字段即为分类参数。

  如 [科幻 + 日語 + 日本 + 長篇 + 完結 + 最近更新](https://mox.moe/l/CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL) 的 URL 为 [https://mox.moe/l/CAT%2A 科幻，日本，完結，lastupdate,jpn,l,BL](https://mox.moe/l/CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL)，此时 `/l/` 后的字段为 `CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL`。最终获得路由为 [`/mox/CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL`](https://rsshub.app/mox/CAT%2A科幻,日本,完結,lastupdate,jpn,l,BL)
  :::

## nhentai <Site url="nhentai.net"/>

### Advanced Search <Site url="nhentai.net" size="sm" />

<Route namespace="nhentai" :data='{"path":"/search/:keyword/:mode?","categories":["anime"],"example":"/nhentai/search/language%3Ajapanese+-scat+-yaoi+-guro+-\"mosaic+censorship\"","parameters":{"keyword":"Keywords for search. You can copy the content after `q=` after searching on the original website, or you can enter it directly. See the [official website](https://nhentai.net/info/) for details","mode":"mode, `simple` to only show cover, `detail` to show all pages, `torrent` to include Magnet URI, need login, refer to [Route-specific Configurations](/install/#configuration-route-specific-configurations), default to `simple`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":true,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["nhentai.net/:key/:keyword"],"target":"/:key/:keyword"}],"name":"Advanced Search","maintainers":["MegrezZhu","hoilc"],"location":"search.ts"}' />

### Filter <Site url="nhentai.net" size="sm" />

<Route namespace="nhentai" :data='{"path":"/:key/:keyword/:mode?","categories":["anime"],"example":"/nhentai/language/chinese","parameters":{"key":"Filter term, can be: `parody`, `character`, `tag`, `artist`, `group`, `language` or `category`","keyword":"Filter value","mode":"mode, `simple` to only show cover, `detail` to show all pages, `torrent` to include Magnet URI, need login, refer to [Route-specific Configurations](/install/#configuration-route-specific-configurations), default to `simple`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":true,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["nhentai.net/:key/:keyword"],"target":"/:key/:keyword"}],"name":"Filter","maintainers":["MegrezZhu","hoilc"],"location":"other.ts"}' />

## QooApp <Site url="apps.qoo-app.com"/>

### Game Store - Cards <Site url="apps.qoo-app.com" size="sm" />

<Route namespace="qoo-app" :data='{"path":"/apps/:lang?/card/:id","categories":["anime"],"example":"/qoo-app/apps/en/card/7675","parameters":{"lang":"Language, see the table above, empty means `中文`","id":"Game ID, can be found in URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Game Store - Cards","maintainers":["TonyRL"],"location":"apps/card.ts"}' />

### Game Store - Review <Site url="apps.qoo-app.com" size="sm" />

<Route namespace="qoo-app" :data='{"path":"/apps/:lang?/comment/:id","categories":["anime"],"example":"/qoo-app/apps/en/comment/7675","parameters":{"lang":"Language, see the table below, empty means `中文`","id":"Game ID, can be found in URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Game Store - Review","maintainers":["TonyRL"],"description":"| 中文 | English | 한국어 | Español | 日本語 | ไทย | Tiếng Việt |\n  | ---- | ------- | ------ | ------- | ------ | --- | ---------- |\n  |      | en      | ko     | es      | ja     | th  | vi         |","location":"apps/comment.ts"}' />

| 中文 | English | 한국어 | Español | 日本語 | ไทย | Tiếng Việt |
  | ---- | ------- | ------ | ------- | ------ | --- | ---------- |
  |      | en      | ko     | es      | ja     | th  | vi         |

### Game Store - Notes <Site url="apps.qoo-app.com" size="sm" />

<Route namespace="qoo-app" :data='{"path":"/apps/:lang?/note/:id","categories":["anime"],"example":"/qoo-app/apps/en/note/7675","parameters":{"lang":"Language, see the table above, empty means `中文`","id":"Game ID, can be found in URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Game Store - Notes","maintainers":["TonyRL"],"location":"apps/note.ts"}' />

### Game Store - Article <Site url="apps.qoo-app.com" size="sm" />

<Route namespace="qoo-app" :data='{"path":"/apps/:lang?/post/:id","categories":["anime"],"example":"/qoo-app/apps/en/post/7675","parameters":{"lang":"Language, see the table above, empty means `中文`","id":"Game ID, can be found in URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Game Store - Article","maintainers":["TonyRL"],"location":"apps/post.ts"}' />

### News <Site url="apps.qoo-app.com" size="sm" />

<Route namespace="qoo-app" :data='{"path":"/news/:lang?","categories":["anime"],"example":"/qoo-app/news/en","parameters":{"lang":"Language, see the table below, empty means `中文`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"News","maintainers":["TonyRL"],"description":"| 中文 | English |\n  | ---- | ------- |\n  |      | en      |","location":"news.ts"}' />

| 中文 | English |
  | ---- | ------- |
  |      | en      |

### Note Comments <Site url="apps.qoo-app.com" size="sm" />

<Route namespace="qoo-app" :data='{"path":"/notes/:lang?/note/:id","categories":["anime"],"example":"/qoo-app/notes/en/note/2329113","parameters":{"lang":"Language, see the table above, empty means `中文`","id":"Note ID, can be found in URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Note Comments","maintainers":["TonyRL"],"location":"notes/note.ts"}' />

### Unknown <Site url="apps.qoo-app.com" size="sm" />

<Route namespace="qoo-app" :data='{"path":"/notes/:lang?/topic/:topic","name":"Unknown","maintainers":["TonyRL"],"location":"notes/topic.ts"}' />

### User Notes <Site url="apps.qoo-app.com" size="sm" />

<Route namespace="qoo-app" :data='{"path":"/notes/:lang?/user/:uid","categories":["anime"],"example":"/qoo-app/notes/en/user/35399143","parameters":{"lang":"Language, see the table above, empty means `中文`","uid":"User ID, can be found in URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"User Notes","maintainers":["TonyRL"],"location":"notes/user.ts"}' />

### User Game Comments <Site url="apps.qoo-app.com" size="sm" />

<Route namespace="qoo-app" :data='{"path":"/user/:lang?/appComment/:uid","categories":["anime"],"example":"/qoo-app/user/en/appComment/35399143","parameters":{"lang":"Language, see the table above, empty means `中文`","uid":"User ID, can be found in URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"User Game Comments","maintainers":["TonyRL"],"location":"user/app-comment.ts"}' />

## Rawkuma <Site url="rawkuma.com"/>

### Manga <Site url="rawkuma.com" size="sm" />

<Route namespace="rawkuma" :data='{"path":"/manga/:id","categories":["anime"],"example":"/rawkuma/manga/tensei-shitara-dai-nana-ouji-dattanode-kimamani-majutsu-o-kiwamemasu","parameters":{"id":"Manga ID, can be found in URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["rawkuma.com/manga/:id","rawkuma.com/"]}],"name":"Manga","maintainers":["nczitzk"],"location":"manga.ts"}' />

## THBWiki <Site url="thwiki.cc"/>

### Calendar <Site url="thwiki.cc/" size="sm" />

<Route namespace="thwiki" :data='{"path":"/calendar/:before?/:after?","categories":["anime"],"example":"/thwiki/calendar","parameters":{"before":"From how many days ago (default 30)","after":"To how many days after (default 30)"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["thwiki.cc/","thwiki.cc/日程表"],"target":"/calendar"}],"name":"Calendar","maintainers":["aether17"],"url":"thwiki.cc/","location":"index.ts"}' />

## VCB-Studio <Site url="vcb-s.com"/>

### Unknown <Site url="vcb-s.com/" size="sm" />

<Route namespace="vcb-s" :data='{"path":"/","radar":[{"source":["vcb-s.com/"],"target":""}],"name":"Unknown","maintainers":["cxfksword"],"url":"vcb-s.com/","location":"index.ts"}' />

### 分类文章 <Site url="vcb-s.com/" size="sm" />

<Route namespace="vcb-s" :data='{"path":"/category/:cate","categories":["anime"],"example":"/vcb-s/category/works","parameters":{"cate":"分类"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["vcb-s.com/archives/category/:cate"]}],"name":"分类文章","maintainers":["cxfksword"],"url":"vcb-s.com/","description":"| 作品项目 | 科普系列 | 计划与日志 |\n  | -------- | -------- | ---------- |\n  | works    | kb       | planlog    |","location":"category.ts"}' />

| 作品项目 | 科普系列 | 计划与日志 |
  | -------- | -------- | ---------- |
  | works    | kb       | planlog    |

## X 漫画 <Site url="xmanhua.com"/>

### 最新动态 <Site url="xmanhua.com" size="sm" />

<Route namespace="xmanhua" :data='{"path":"/:uid","categories":["anime"],"example":"/xmanhua/73xm","parameters":{"uid":"漫画 id,在浏览器中可见，例如鬼灭之刃对应的 id 为 `73xm`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["xmanhua.com/:uid"]}],"name":"最新动态","maintainers":["Ye11"],"location":"index.ts"}' />

## 俺の 3D エロ動画 (oreno3d) <Site url="oreno3d.com"/>

:::tip
You can use some RSS parsing libraries (like `feedpraser` in `Python`) to receive the video update messages and download them automatically
:::

### Author Search <Site url="oreno3d.com" size="sm" />

<Route namespace="oreno3d" :data='{"path":["/authors/:authorid/:sort/:pagelimit?","/characters/:characterid/:sort/:pagelimit?","/origins/:originid/:sort/:pagelimit?","/search/:keyword/:sort/:pagelimit?","/tags/:tagid/:sort/:pagelimit?"],"categories":["anime"],"example":"/oreno3d/authors/3189/latest/1","parameters":{"authorid":"Author id, can be found in URL","sort":"Sort method, see the table above","pagelimit":"The maximum number of pages to be crawled, the default is 1"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Author Search","maintainers":["xueli_sherryli"],"description":"| favorites | hot | latest | popularity |\n  | --------- | --- | ------ | ---------- |\n  | favorites | hot | latest | popularity |","location":"main.ts"}' />

| favorites | hot | latest | popularity |
  | --------- | --- | ------ | ---------- |
  | favorites | hot | latest | popularity |

### Author Search <Site url="oreno3d.com" size="sm" />

<Route namespace="oreno3d" :data='{"path":["/authors/:authorid/:sort/:pagelimit?","/characters/:characterid/:sort/:pagelimit?","/origins/:originid/:sort/:pagelimit?","/search/:keyword/:sort/:pagelimit?","/tags/:tagid/:sort/:pagelimit?"],"categories":["anime"],"example":"/oreno3d/authors/3189/latest/1","parameters":{"authorid":"Author id, can be found in URL","sort":"Sort method, see the table above","pagelimit":"The maximum number of pages to be crawled, the default is 1"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Author Search","maintainers":["xueli_sherryli"],"description":"| favorites | hot | latest | popularity |\n  | --------- | --- | ------ | ---------- |\n  | favorites | hot | latest | popularity |","location":"main.ts"}' />

| favorites | hot | latest | popularity |
  | --------- | --- | ------ | ---------- |
  | favorites | hot | latest | popularity |

### Author Search <Site url="oreno3d.com" size="sm" />

<Route namespace="oreno3d" :data='{"path":["/authors/:authorid/:sort/:pagelimit?","/characters/:characterid/:sort/:pagelimit?","/origins/:originid/:sort/:pagelimit?","/search/:keyword/:sort/:pagelimit?","/tags/:tagid/:sort/:pagelimit?"],"categories":["anime"],"example":"/oreno3d/authors/3189/latest/1","parameters":{"authorid":"Author id, can be found in URL","sort":"Sort method, see the table above","pagelimit":"The maximum number of pages to be crawled, the default is 1"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Author Search","maintainers":["xueli_sherryli"],"description":"| favorites | hot | latest | popularity |\n  | --------- | --- | ------ | ---------- |\n  | favorites | hot | latest | popularity |","location":"main.ts"}' />

| favorites | hot | latest | popularity |
  | --------- | --- | ------ | ---------- |
  | favorites | hot | latest | popularity |

### Author Search <Site url="oreno3d.com" size="sm" />

<Route namespace="oreno3d" :data='{"path":["/authors/:authorid/:sort/:pagelimit?","/characters/:characterid/:sort/:pagelimit?","/origins/:originid/:sort/:pagelimit?","/search/:keyword/:sort/:pagelimit?","/tags/:tagid/:sort/:pagelimit?"],"categories":["anime"],"example":"/oreno3d/authors/3189/latest/1","parameters":{"authorid":"Author id, can be found in URL","sort":"Sort method, see the table above","pagelimit":"The maximum number of pages to be crawled, the default is 1"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Author Search","maintainers":["xueli_sherryli"],"description":"| favorites | hot | latest | popularity |\n  | --------- | --- | ------ | ---------- |\n  | favorites | hot | latest | popularity |","location":"main.ts"}' />

| favorites | hot | latest | popularity |
  | --------- | --- | ------ | ---------- |
  | favorites | hot | latest | popularity |

### Author Search <Site url="oreno3d.com" size="sm" />

<Route namespace="oreno3d" :data='{"path":["/authors/:authorid/:sort/:pagelimit?","/characters/:characterid/:sort/:pagelimit?","/origins/:originid/:sort/:pagelimit?","/search/:keyword/:sort/:pagelimit?","/tags/:tagid/:sort/:pagelimit?"],"categories":["anime"],"example":"/oreno3d/authors/3189/latest/1","parameters":{"authorid":"Author id, can be found in URL","sort":"Sort method, see the table above","pagelimit":"The maximum number of pages to be crawled, the default is 1"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Author Search","maintainers":["xueli_sherryli"],"description":"| favorites | hot | latest | popularity |\n  | --------- | --- | ------ | ---------- |\n  | favorites | hot | latest | popularity |","location":"main.ts"}' />

| favorites | hot | latest | popularity |
  | --------- | --- | ------ | ---------- |
  | favorites | hot | latest | popularity |

## 巴哈姆特電玩資訊站 <Site url="acg.gamer.com.tw"/>

### GNN 新聞 <Site url="acg.gamer.com.tw" size="sm" />

<Route namespace="gamer" :data='{"path":"/gnn/:category?","categories":["anime"],"example":"/gamer/gnn/1","parameters":{"category":"版块"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"GNN 新聞","maintainers":["Arracc"],"description":"| 首頁 | PC | TV 掌機 | 手機遊戲 | 動漫畫 | 主題報導 | 活動展覽 | 電競 |\n  | ---- | -- | ------- | -------- | ------ | -------- | -------- | ---- |\n  | 缺省 | 1  | 3       | 4        | 5      | 9        | 11       | 13   |\n\n  | Switch | PS5 | PS4 | XboxOne | XboxSX | PC 單機 | PC 線上 | iOS | Android | Web | 漫畫  | 動畫  |\n  | ------ | --- | --- | ------- | ------ | ------- | ------- | --- | ------- | --- | ----- | ----- |\n  | ns     | ps5 | ps4 | xbone   | xbsx   | pc      | olg     | ios | android | web | comic | anime |","location":"gnn-index.ts"}' />

| 首頁 | PC | TV 掌機 | 手機遊戲 | 動漫畫 | 主題報導 | 活動展覽 | 電競 |
  | ---- | -- | ------- | -------- | ------ | -------- | -------- | ---- |
  | 缺省 | 1  | 3       | 4        | 5      | 9        | 11       | 13   |

  | Switch | PS5 | PS4 | XboxOne | XboxSX | PC 單機 | PC 線上 | iOS | Android | Web | 漫畫  | 動畫  |
  | ------ | --- | --- | ------- | ------ | ------- | ------- | --- | ------- | --- | ----- | ----- |
  | ns     | ps5 | ps4 | xbone   | xbsx   | pc      | olg     | ios | android | web | comic | anime |

### 動畫瘋 - 動畫 <Site url="acg.gamer.com.tw" size="sm" />

<Route namespace="gamer" :data='{"path":"/ani/anime/:sn","categories":["anime"],"example":"/gamer/ani/anime/36868","parameters":{"sn":"動畫 sn，在 URL 可以找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"動畫瘋 - 動畫","maintainers":[],"location":"ani/anime.ts"}' />

### 動畫瘋 - 最後更新 <Site url="ani.gamer.com.tw/" size="sm" />

<Route namespace="gamer" :data='{"path":"/ani/new_anime","categories":["anime"],"example":"/gamer/ani/new_anime","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["ani.gamer.com.tw/"],"target":"/new_anime"}],"name":"動畫瘋 - 最後更新","maintainers":[],"url":"ani.gamer.com.tw/","location":"ani/new-anime.ts"}' />

### 熱門推薦 <Site url="acg.gamer.com.tw" size="sm" />

<Route namespace="gamer" :data='{"path":"/hot/:bsn","categories":["anime"],"example":"/gamer/hot/47157","parameters":{"bsn":"板块 id，在 URL 可以找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"熱門推薦","maintainers":["nczitzk","TonyRL"],"location":"hot.ts"}' />

## 包子漫画 <Site url="www.baozimh.com"/>

### 订阅漫画 <Site url="www.baozimh.com" size="sm" />

<Route namespace="baozimh" :data='{"path":"/comic/:name","categories":["anime"],"example":"/baozimh/comic/guowangpaiming-shiricaofu","parameters":{"name":"漫画名称，在漫画链接可以得到(`comic/` 后的那段)"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.baozimh.com/comic/:name"]}],"name":"订阅漫画","maintainers":["Fatpandac"],"location":"index.ts"}' />

## 动漫之家 <Site url="news.dmzj.com"/>

### 新闻站 <Site url="news.dmzj.com/" size="sm" />

<Route namespace="dmzj" :data='{"path":"/news/:category?","categories":["anime"],"example":"/dmzj/news/donghuaqingbao","parameters":{"category":"类别"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["news.dmzj.com/"],"target":"/news"}],"name":"新闻站","maintainers":["vzz64"],"url":"news.dmzj.com/","description":"| 漫画情报      | 轻小说情报          | 动漫周边       | 声优情报        | 音乐资讯    | 游戏资讯   | 美图欣赏      | 漫展情报       | 大杂烩  |\n  | ------------- | ------------------- | -------------- | --------------- | ----------- | ---------- | ------------- | -------------- | ------- |\n  | manhuaqingbao | qingxiaoshuoqingbao | manhuazhoubian | shengyouqingbao | yinyuezixun | youxizixun | meituxinshang | manzhanqingbao | dazahui |","location":"news.ts"}' />

| 漫画情报      | 轻小说情报          | 动漫周边       | 声优情报        | 音乐资讯    | 游戏资讯   | 美图欣赏      | 漫展情报       | 大杂烩  |
  | ------------- | ------------------- | -------------- | --------------- | ----------- | ---------- | ------------- | -------------- | ------- |
  | manhuaqingbao | qingxiaoshuoqingbao | manhuazhoubian | shengyouqingbao | yinyuezixun | youxizixun | meituxinshang | manzhanqingbao | dazahui |

## 動漫狂 <Site url="cartoonmad.com"/>

### 漫画更新 <Site url="cartoonmad.com" size="sm" />

<Route namespace="cartoonmad" :data='{"path":"/comic/:id","categories":["anime"],"example":"/cartoonmad/comic/5827","parameters":{"id":"漫画ID"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["cartoonmad.com/comic/:id"]}],"name":"漫画更新","maintainers":["KellyHwong"],"location":"comic.ts"}' />

## 番组放送 <Site url="bgmlist.com"/>

### 开播提醒 <Site url="bgmlist.com" size="sm" />

<Route namespace="bgmlist" :data='{"path":"/onair/:lang?","categories":["anime"],"example":"/bgmlist/onair/zh-Hans","parameters":{"lang":"语言"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"开播提醒","maintainers":["x2cf"],"location":"onair.ts"}' />

## 风之动漫 <Site url="manhua.fffdm.com"/>

### 在线漫画 <Site url="manhua.fffdm.com" size="sm" />

<Route namespace="fffdm" :data='{"path":"/manhua/:id/:cdn?","categories":["anime"],"example":"/fffdm/manhua/93","parameters":{"id":"漫画ID。默认获取全部，建议使用通用参数limit获取指定数量","cdn":"cdn加速器。默认5，当前可选1-5"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.fffdm.com/manhua/:id","www.fffdm.com/:id"],"target":"/manhua/:id"}],"name":"在线漫画","maintainers":["zytomorrow"],"location":"manhua/manhua.ts"}' />

## 禁漫天堂 <Site url="18comic.org"/>

:::tip
禁漫天堂有多个备用域名，本路由默认使用域名 `https://jmcomic.me`，若该域名无法访问，可以通过在路由最后加上 `?domain=<域名>` 指定路由访问的域名。如指定备用域名为 `https://jmcomic1.me`，则在所有禁漫天堂路由最后加上 `?domain=jmcomic1.me` 即可，此时路由为 [`/18comic?domain=jmcomic1.me`](https://rsshub.app/18comic?domain=jmcomic1.me)
:::

### 成人 A 漫 <Site url="jmcomic.group/" size="sm" />

<Route namespace="18comic" :data='{"path":"/:category?/:time?/:order?/:keyword?","categories":["anime"],"example":"/18comic","parameters":{"category":"分类，见下表，默认为 `all` 即全部","time":"时间范围，见下表，默认为 `a` 即全部","order":"排列顺序，见下表，默认为 `mr` 即最新","keyword":"关键字，见下表，默认为空"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["jmcomic.group/"]}],"name":"成人 A 漫","maintainers":["nczitzk"],"url":"jmcomic.group/","description":"分类\n\n  | 全部 | 其他漫畫 | 同人   | 韓漫   | 美漫   | 短篇  | 单本   |\n  | ---- | -------- | ------ | ------ | ------ | ----- | ------ |\n  | all  | another  | doujin | hanman | meiman | short | single |\n\n  时间范围\n\n  | 全部 | 今天 | 这周 | 本月 |\n  | ---- | ---- | ---- | ---- |\n  | a    | t    | w    | m    |\n\n  排列顺序\n\n  | 最新 | 最多点阅的 | 最多图片 | 最高评分 | 最多评论 | 最多爱心 |\n  | ---- | ---------- | -------- | -------- | -------- | -------- |\n  | mr   | mv         | mp       | tr       | md       | tf       |\n\n  关键字（供参考）\n\n  | YAOI | 女性向 | NTR | 非 H | 3D | 獵奇 |\n  | ---- | ------ | --- | ---- | -- | ---- |","location":"index.ts"}' />

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

### 搜索 <Site url="jmcomic.group/" size="sm" />

<Route namespace="18comic" :data='{"path":"/search/:option?/:category?/:keyword?/:time?/:order?","categories":["anime"],"example":"/18comic/search/photos/all/NTR","parameters":{"option":"选项，可选 `video` 和 `photos`，默认为 `photos`","category":"分类，同上表，默认为 `all` 即全部","keyword":"关键字，同上表，默认为空","time":"时间范围，同上表，默认为 `a` 即全部","order":"排列顺序，同上表，默认为 `mr` 即最新"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["jmcomic.group/"],"target":"/:category?/:time?/:order?/:keyword?"}],"name":"搜索","maintainers":[],"url":"jmcomic.group/","description":":::tip\n  关键字必须超过两个字，这是来自网站的限制。\n  :::","location":"search.ts"}' />

:::tip
  关键字必须超过两个字，这是来自网站的限制。
  :::

### 文庫 <Site url="jmcomic.group/" size="sm" />

<Route namespace="18comic" :data='{"path":"/blogs/:category?","categories":["anime"],"example":"/18comic/blogs","parameters":{"category":"分类，见下表，默认为空即全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["jmcomic.group/"]}],"name":"文庫","maintainers":["nczitzk"],"url":"jmcomic.group/","description":"分类\n\n  | 全部 | 紳夜食堂 | 遊戲文庫 | JG GAMES | 模型山下 |\n  | ---- | -------- | -------- | -------- | -------- |\n  |      | dinner   | raiders  | jg       | figure   |","location":"blogs.ts"}' />

分类

  | 全部 | 紳夜食堂 | 遊戲文庫 | JG GAMES | 模型山下 |
  | ---- | -------- | -------- | -------- | -------- |
  |      | dinner   | raiders  | jg       | figure   |

### 专辑 <Site url="jmcomic.group/" size="sm" />

<Route namespace="18comic" :data='{"path":"/album/:id","categories":["anime"],"example":"/18comic/album/292282","parameters":{"id":"专辑 id，可在专辑页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["jmcomic.group/"]}],"name":"专辑","maintainers":["nczitzk"],"url":"jmcomic.group/","description":":::tip\n  专辑 id 不包括 URL 中标题的部分。\n  :::","location":"album.ts"}' />

:::tip
  专辑 id 不包括 URL 中标题的部分。
  :::

## 看漫画 <Site url="www.manhuagui.com"/>

### 漫画更新 <Site url="www.manhuagui.com" size="sm" />

<Route namespace="manhuagui" :data='{"path":["/comic/:id/:chapterCnt?","/:domain?/comic/:id/:chapterCnt?"],"categories":["anime"],"example":"/manhuagui/comic/22942/5","parameters":{"id":"漫画ID","chapterCnt":"返回章节的数量，默认为0，返回所有章节"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.mhgui.com/comic/:id/"],"target":"/comic/:id"}],"name":"漫画更新","maintainers":["MegrezZhu"],"location":"comic.ts"}' />

### 漫画更新 <Site url="www.manhuagui.com" size="sm" />

<Route namespace="manhuagui" :data='{"path":["/comic/:id/:chapterCnt?","/:domain?/comic/:id/:chapterCnt?"],"categories":["anime"],"example":"/manhuagui/comic/22942/5","parameters":{"id":"漫画ID","chapterCnt":"返回章节的数量，默认为0，返回所有章节"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.mhgui.com/comic/:id/"],"target":"/comic/:id"}],"name":"漫画更新","maintainers":["MegrezZhu"],"location":"comic.ts"}' />

### 漫画个人订阅 <Site url="www.mhgui.com/user/book/shelf" size="sm" />

<Route namespace="manhuagui" :data='{"path":"/subscribe","categories":["anime"],"example":"/manhuagui/subscribe","parameters":{},"features":{"requireConfig":[{"name":"MHGUI_COOKIE","description":""}],"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.mhgui.com/user/book/shelf"]}],"name":"漫画个人订阅","maintainers":["shininome"],"url":"www.mhgui.com/user/book/shelf","description":":::tip\n  个人订阅需要自建\n  环境变量需要添加 MHGUI_COOKIE\n  :::","location":"subscribe.ts"}' />

:::tip
  个人订阅需要自建
  环境变量需要添加 MHGUI_COOKIE
  :::

## 拷贝漫画 <Site url="copymanga.com"/>

### 漫画更新 <Site url="copymanga.com" size="sm" />

<Route namespace="copymanga" :data='{"path":"/comic/:id/:chapterCnt?","categories":["anime"],"example":"/copymanga/comic/dianjuren/5","parameters":{"id":"漫画ID","chapterCnt":"返回章节的数量，默认为 `10`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"漫画更新","maintainers":["btdwv","marvolo666","yan12125"],"location":"comic.ts"}' />

## 来漫画 <Site url="www.laimanhua8.com"/>

### 漫画列表 <Site url="www.laimanhua8.com" size="sm" />

<Route namespace="laimanhua" :data='{"path":"/:id","categories":["anime"],"example":"/laimanhua/tiandikangzhanjiVERSUS","parameters":{"id":"漫画 ID，可在 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.laimanhua8.com/kanmanhua/:id"]}],"name":"漫画列表","maintainers":["TonyRL"],"location":"index.ts"}' />

## 腾讯新闻较真查证平台 <Site url="ac.qq.com"/>

### Unknown <Site url="ac.qq.com" size="sm" />

<Route namespace="qq" :data='{"path":"/ac/comic/:id?","radar":[{"source":["ac.qq.com/Comic/ComicInfo/id/:id","ac.qq.com/"],"target":"/ac/comic/:id"}],"name":"Unknown","maintainers":[],"location":"ac/comic.ts"}' />

### 排行榜 <Site url="ac.qq.com" size="sm" />

<Route namespace="qq" :data='{"path":"/ac/rank/:type?/:time?","categories":["anime"],"example":"/qq/ac/rank","parameters":{"type":"分类，见下表，默认为月票榜","time":"时间，`cur` 为当周、`prev` 为上周"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["ac.qq.com/Rank/comicRank/type/:type","ac.qq.com/"]}],"name":"排行榜","maintainers":["nczitzk"],"description":"| 月票榜 | 飙升榜 | 新作榜 | 畅销榜 | TOP100 | 男生榜 | 女生榜 |\n  | ------ | ------ | ------ | ------ | ------ | ------ | ------ |\n  | mt     | rise   | new    | pay    | top    | male   | female |\n\n  :::tip\n  `time` 参数仅在 `type` 参数选为 **月票榜** 的时候生效。\n  :::","location":"ac/rank.ts"}' />

| 月票榜 | 飙升榜 | 新作榜 | 畅销榜 | TOP100 | 男生榜 | 女生榜 |
  | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
  | mt     | rise   | new    | pay    | top    | male   | female |

  :::tip
  `time` 参数仅在 `type` 参数选为 **月票榜** 的时候生效。
  :::

## 月幕 Galgame <Site url="ymgal.games"/>

### 本月新作 <Site url="ymgal.games/" size="sm" />

<Route namespace="ymgal" :data='{"path":"/game/release","categories":["anime"],"example":"/ymgal/game/release","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["ymgal.games/"]}],"name":"本月新作","maintainers":["SunBK201"],"url":"ymgal.games/","location":"game.ts"}' />

### 文章 <Site url="ymgal.games" size="sm" />

<Route namespace="ymgal" :data='{"path":"/article/:type?","categories":["anime"],"example":"/ymgal/article","parameters":{"type":"文章类型"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"文章","maintainers":["SunBK201"],"description":"| 全部文章 | 资讯 | 专栏   |\n  | -------- | ---- | ------ |\n  | all      | news | column |","location":"article.ts"}' />

| 全部文章 | 资讯 | 专栏   |
  | -------- | ---- | ------ |
  | all      | news | column |

## アニメ新番組 <Site url="bangumi.moe"/>

### Unknown <Site url="bangumi.moe/" size="sm" />

<Route namespace="bangumi" :data='{"path":"/moe/*","radar":[{"source":["bangumi.moe/"],"target":"/moe"}],"name":"Unknown","maintainers":[],"url":"bangumi.moe/","location":"moe/index.ts"}' />

### 成员关注动画榜 <Site url="bgm.tv/anime" size="sm" />

<Route namespace="bangumi" :data='{"path":"/tv/followrank","categories":["anime"],"example":"/bangumi/tv/followrank","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["bgm.tv/anime"]}],"name":"成员关注动画榜","maintainers":["honue"],"url":"bgm.tv/anime","location":"tv/other/followrank.ts"}' />

### 當季新番 <Site url="bangumi.online/" size="sm" />

<Route namespace="bangumi" :data='{"path":"/online","categories":["anime"],"example":"/bangumi/online","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["bangumi.online/"]}],"name":"當季新番","maintainers":["devinmugen"],"url":"bangumi.online/","location":"online/online.ts"}' />

### 放送列表 <Site url="bgm.tv/calendar" size="sm" />

<Route namespace="bangumi" :data='{"path":"/tv/calendar/today","categories":["anime"],"example":"/bangumi/tv/calendar/today","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["bgm.tv/calendar"]}],"name":"放送列表","maintainers":["magic-akari"],"url":"bgm.tv/calendar","location":"tv/calendar/today.ts"}' />

### 条目的通用路由格式 <Site url="bangumi.moe" size="sm" />

<Route namespace="bangumi" :data='{"path":"/tv/subject/:id/:type?/:showOriginalName?","categories":["anime"],"example":"/bangumi/tv/subject/328609/ep/true","parameters":{"id":"条目 id, 在条目页面的地址栏查看","type":"条目类型，可选值为 `ep`, `comments`, `blogs`, `topics`，默认为 `ep`","showOriginalName":"显示番剧标题原名，可选值 0/1/false/true，默认为 false"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["bgm.tv/subject/:id"],"target":"/tv/subject/:id"}],"name":"条目的通用路由格式","maintainers":["JimenezLi"],"description":":::warning\n  此通用路由仅用于对路由参数的描述，具体信息请查看下方与条目相关的路由\n  :::","location":"tv/subject/index.ts"}' />

:::warning
  此通用路由仅用于对路由参数的描述，具体信息请查看下方与条目相关的路由
  :::

### 现实人物的新作品 <Site url="bangumi.moe" size="sm" />

<Route namespace="bangumi" :data='{"path":"/tv/person/:id","categories":["anime"],"example":"/bangumi/tv/person/32943","parameters":{"id":"人物 id, 在人物页面的地址栏查看"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["bgm.tv/person/:id"]}],"name":"现实人物的新作品","maintainers":["ylc395"],"location":"tv/person/index.ts"}' />

### 小组话题的新回复 <Site url="bangumi.moe" size="sm" />

<Route namespace="bangumi" :data='{"path":"/tv/topic/:id","categories":["anime"],"example":"/bangumi/tv/topic/367032","parameters":{"id":"话题 id, 在话题页面地址栏查看"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["bgm.tv/group/topic/:id"]}],"name":"小组话题的新回复","maintainers":["ylc395"],"location":"tv/group/reply.ts"}' />

### 小组话题 <Site url="bangumi.moe" size="sm" />

<Route namespace="bangumi" :data='{"path":"/tv/group/:id","categories":["anime"],"example":"/bangumi/tv/group/boring","parameters":{"id":"小组 id, 在小组页面地址栏查看"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["bgm.tv/group/:id"]}],"name":"小组话题","maintainers":["SettingDust"],"location":"tv/group/topic.ts"}' />

### 用户日志 <Site url="bangumi.moe" size="sm" />

<Route namespace="bangumi" :data='{"path":"/tv/user/blog/:id","categories":["anime"],"example":"/bangumi/tv/user/blog/sai","parameters":{"id":"用户 id, 在用户页面地址栏查看"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["bgm.tv/user/:id"]}],"name":"用户日志","maintainers":["nczitzk"],"location":"tv/user/blog.ts"}' />

### 用户想看 <Site url="bangumi.moe" size="sm" />

<Route namespace="bangumi" :data='{"path":"/tv/user/wish/:id","categories":["anime"],"example":"/bangumi/tv/user/wish/sai","parameters":{"id":"用户 id, 在用户页面地址栏查看"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["bgm.tv/anime/list/:id/wish"]}],"name":"用户想看","maintainers":["honue"],"location":"tv/user/wish.ts"}' />

