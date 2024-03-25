# 🖼️ 图片

## 1x.com <Site url="1x.com"/>

1x.com • In Pursuit of the Sublime. Browse 200,000 curated photos from photographers all over the world.

### Gallery <Site url="1x.com" size="sm" />

<Route namespace="1x" :data='{"path":"/:category{.+}?","name":"Gallery","url":"1x.com","maintainers":["nczitzk"],"example":"/1x/latest/awarded","parameters":{"category":"Category, Latest Awarded by default"},"description":"::: tip\nFill in the field in the path with the part of the corresponding page URL after `https://1x.com/gallery/` or `https://1x.com/photo/`. Here are the examples:\n\nIf you subscribe to [Abstract Awarded](https://1x.com/gallery/abstract/awarded), you should fill in the path with the part `abstract/awarded` from the page URL `https://1x.com/gallery/abstract/awarded`. In this case, the route will be [`/1x/abstract/awarded`](https://rsshub.app/1x/abstract/awarded).\n    \nIf you subscribe to [Wildlife Published](https://1x.com/gallery/wildlife/published), you should fill in the path with the part `wildlife/published` from the page URL `https://1x.com/gallery/wildlife/published`. In this case, the route will be [`/1x/wildlife/published`](https://rsshub.app/1x/wildlife/published).\n:::","categories":["design","picture"],"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportRadar":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["/gallery/:category*","/photos/:category*"],"target":"/1x/:category"}],"location":"index.ts"}' :test='undefined' />

::: tip
Fill in the field in the path with the part of the corresponding page URL after `https://1x.com/gallery/` or `https://1x.com/photo/`. Here are the examples:

If you subscribe to [Abstract Awarded](https://1x.com/gallery/abstract/awarded), you should fill in the path with the part `abstract/awarded` from the page URL `https://1x.com/gallery/abstract/awarded`. In this case, the route will be [`/1x/abstract/awarded`](https://rsshub.app/1x/abstract/awarded).
    
If you subscribe to [Wildlife Published](https://1x.com/gallery/wildlife/published), you should fill in the path with the part `wildlife/published` from the page URL `https://1x.com/gallery/wildlife/published`. In this case, the route will be [`/1x/wildlife/published`](https://rsshub.app/1x/wildlife/published).
:::

## 500px 摄影社区 <Site url="500px.com.cn"/>

### 部落影集 <Site url="500px.com.cn" size="sm" />

<Route namespace="500px" :data='{"path":"/tribe/set/:id","categories":["picture"],"example":"/500px/tribe/set/f5de0b8aa6d54ec486f5e79616418001","parameters":{"id":"部落 ID"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"部落影集","maintainers":["TonyRL"],"location":"tribe-set.ts"}' :test='undefined' />

### 摄影师作品 <Site url="500px.com.cn" size="sm" />

<Route namespace="500px" :data='{"path":"/user/works/:id","categories":["picture"],"example":"/500px/user/works/hujunli","parameters":{"id":"摄影师 ID"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["500px.com.cn/:id","500px.com.cn/community/user-details/:id","500px.com.cn/community/user-details/:id/*"]}],"name":"摄影师作品","maintainers":["TonyRL"],"location":"user.ts"}' :test='undefined' />

## 8KCosplay <Site url="8kcosplay.com"/>

### Unknown <Site url="8kcosplay.com/" size="sm" />

<Route namespace="8kcos" :data='{"path":"/cat/:cat{.+}?","radar":[{"source":["8kcosplay.com/"],"target":""}],"name":"Unknown","maintainers":[],"url":"8kcosplay.com/","location":"cat.ts"}' :test='undefined' />

### 标签 <Site url="8kcosplay.com/" size="sm" />

<Route namespace="8kcos" :data='{"path":"/tag/:tag","categories":["picture"],"example":"/8kcos/tag/cosplay","parameters":{"tag":"标签名"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["8kcosplay.com/tag/:tag"]}],"name":"标签","maintainers":["KotoriK"],"url":"8kcosplay.com/","location":"tag.ts"}' :test='undefined' />

### 最新 <Site url="8kcosplay.com/" size="sm" />

<Route namespace="8kcos" :data='{"path":"/","categories":["picture"],"example":"/8kcos/","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["8kcosplay.com/"],"target":""}],"name":"最新","maintainers":["KotoriK"],"url":"8kcosplay.com/","location":"latest.ts"}' :test='undefined' />

## ArtStation <Site url="www.artstation.com"/>

### Artist Profolio <Site url="www.artstation.com" size="sm" />

<Route namespace="artstation" :data='{"path":"/:handle","categories":["picture"],"example":"/artstation/wlop","parameters":{"handle":"Artist handle, can be found in URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.artstation.com/:handle"]}],"name":"Artist Profolio","maintainers":["TonyRL"],"location":"user.ts"}' :test='{"code":0}' />

## Booru <Site url="mmda.booru.org"/>

### MMDArchive 标签查询 <Site url="mmda.booru.org" size="sm" />

<Route namespace="booru" :data='{"path":"/mmda/tags/:tags?","categories":["picture"],"example":"/booru/mmda/tags/full_body%20blue_eyes","parameters":{"tags":"标签，多个标签使用 `%20` 连接，如需根据作者查询则在 `user:` 后接上作者名，如：`user:xxxx`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportRadar":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["mmda.booru.org/index.php"]}],"name":"MMDArchive 标签查询","maintainers":["N78Wy"],"description":"For example:\n\n  -   默认查询 (什么 tag 都不加)：`/booru/mmda/tags`\n  -   默认查询单个 tag：`/booru/mmda/tags/full_body`\n  -   默认查询多个 tag：`/booru/mmda/tags/full_body%20blue_eyes`\n  -   默认查询根据作者查询：`/booru/mmda/tags/user:xxxx`","location":"mmda.ts"}' :test='{"code":0}' />

For example:

  -   默认查询 (什么 tag 都不加)：`/booru/mmda/tags`
  -   默认查询单个 tag：`/booru/mmda/tags/full_body`
  -   默认查询多个 tag：`/booru/mmda/tags/full_body%20blue_eyes`
  -   默认查询根据作者查询：`/booru/mmda/tags/user:xxxx`

## E-Hentai 

For RSS content, specify options in the `routeParams` parameter in query string format to control additional functionality

| Key          | Meaning                                                                         | Accepted keys  | Default value |
| ------------ | ------------------------------------------------------------------------------- | -------------- | ------------- |
| bittorrent   | Whether include a link to the latest torrent                                    | 0/1/true/false | false         |
| embed_thumb | Whether the cover image is embedded in the RSS feed rather than given as a link | 0/1/true/false | false         |

### Favorites 

<Route namespace="ehentai" :data='{"path":"/favorites/:favcat?/:order?/:page?/:routeParams?","categories":["picture"],"example":"/ehentai/favorites/0/posted/1","parameters":{"favcat":"Favorites folder number","order":"`posted`(Sort by gallery release time) , `favorited`(Sort by time added to favorites)","page":"Page number","routeParams":"Additional parameters, see the table above"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":true,"supportPodcast":false,"supportScihub":false},"name":"Favorites","maintainers":["yindaheng98","syrinka"],"location":"favorites.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### Search 

<Route namespace="ehentai" :data='{"path":"/search/:params?/:page?/:routeParams?","categories":["picture"],"example":"/ehentai/search/f_search=artist%3Amana%24/1","parameters":{"params":"Search parameters. You can copy the content after `https://e-hentai.org/?`","page":"Page number","routeParams":"Additional parameters, see the table above"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":true,"supportPodcast":false,"supportScihub":false},"name":"Search","maintainers":["yindaheng98","syrinka"],"location":"search.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### Tag 

<Route namespace="ehentai" :data='{"path":"/tag/:tag/:page?/:routeParams?","categories":["picture"],"example":"/ehentai/tag/language:chinese/1","parameters":{"tag":"Tag","page":"Page number","routeParams":"Additional parameters, see the table above"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":true,"supportPodcast":false,"supportScihub":false},"name":"Tag","maintainers":["yindaheng98","syrinka"],"location":"tag.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

## Fantia <Site url="fantia.jp"/>

### Search <Site url="fantia.jp" size="sm" />

<Route namespace="fantia" :data='{"path":"/search/:type?/:caty?/:period?/:order?/:rating?/:keyword?","categories":["picture"],"example":"/fantia/search/posts/all/daily","parameters":{"type":"Type, see the table below, `posts` by default","caty":"Category, see the table below, can also be found in search page URL, `すべてのクリエイター` by default","period":"Ranking period, see the table below, empty by default","order":"Sorting, see the table below, `更新の新しい順` by default","rating":"Rating, see the table below, `すべて` by default","keyword":"Keyword, empty by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Search","maintainers":[],"description":"Type\n\n  | クリエイター | 投稿  | 商品     | コミッション |\n  | ------------ | ----- | -------- | ------------ |\n  | fanclubs     | posts | products | commissions  |\n\n  Category\n\n  | 分类                   | 分类名     |\n  | ---------------------- | ---------- |\n  | イラスト               | illust     |\n  | 漫画                   | comic      |\n  | コスプレ               | cosplay    |\n  | YouTuber・配信者       | youtuber   |\n  | Vtuber                 | vtuber     |\n  | 音声作品・ASMR         | voice      |\n  | 声優・歌い手           | voiceactor |\n  | アイドル               | idol       |\n  | アニメ・映像・写真     | anime      |\n  | 3D                     | 3d         |\n  | ゲーム制作             | game       |\n  | 音楽                   | music      |\n  | 小説                   | novel      |\n  | ドール                 | doll       |\n  | アート・デザイン       | art        |\n  | プログラム             | program    |\n  | 創作・ハンドメイド     | handmade   |\n  | 歴史・評論・情報       | history    |\n  | 鉄道・旅行・ミリタリー | railroad   |\n  | ショップ               | shop       |\n  | その他                 | other      |\n\n  Ranking period\n\n  | デイリー | ウィークリー | マンスリー | 全期間 |\n  | -------- | ------------ | ---------- | ------ |\n  | daily    | weekly       | monthly    | all    |\n\n  Sorting\n\n  | 更新の新しい順 | 更新の古い順 | 投稿の新しい順 | 投稿の古い順 | お気に入り数順 |\n  | -------------- | ------------ | -------------- | ------------ | -------------- |\n  | updater        | update_old  | newer          | create_old  | popular        |\n\n  Rating\n\n  | すべて | 一般のみ | R18 のみ |\n  | ------ | -------- | -------- |\n  | all    | general  | adult    |","location":"search.ts"}' :test='{"code":0}' />

Type

  | クリエイター | 投稿  | 商品     | コミッション |
  | ------------ | ----- | -------- | ------------ |
  | fanclubs     | posts | products | commissions  |

  Category

  | 分类                   | 分类名     |
  | ---------------------- | ---------- |
  | イラスト               | illust     |
  | 漫画                   | comic      |
  | コスプレ               | cosplay    |
  | YouTuber・配信者       | youtuber   |
  | Vtuber                 | vtuber     |
  | 音声作品・ASMR         | voice      |
  | 声優・歌い手           | voiceactor |
  | アイドル               | idol       |
  | アニメ・映像・写真     | anime      |
  | 3D                     | 3d         |
  | ゲーム制作             | game       |
  | 音楽                   | music      |
  | 小説                   | novel      |
  | ドール                 | doll       |
  | アート・デザイン       | art        |
  | プログラム             | program    |
  | 創作・ハンドメイド     | handmade   |
  | 歴史・評論・情報       | history    |
  | 鉄道・旅行・ミリタリー | railroad   |
  | ショップ               | shop       |
  | その他                 | other      |

  Ranking period

  | デイリー | ウィークリー | マンスリー | 全期間 |
  | -------- | ------------ | ---------- | ------ |
  | daily    | weekly       | monthly    | all    |

  Sorting

  | 更新の新しい順 | 更新の古い順 | 投稿の新しい順 | 投稿の古い順 | お気に入り数順 |
  | -------------- | ------------ | -------------- | ------------ | -------------- |
  | updater        | update_old  | newer          | create_old  | popular        |

  Rating

  | すべて | 一般のみ | R18 のみ |
  | ------ | -------- | -------- |
  | all    | general  | adult    |

### User Posts <Site url="fantia.jp" size="sm" />

<Route namespace="fantia" :data='{"path":"/user/:id","categories":["picture"],"example":"/fantia/user/3498","parameters":{"id":"User id, can be found in user profile URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["fantia.jp/fanclubs/:id"]}],"name":"User Posts","maintainers":["nczitzk"],"location":"user.ts"}' :test='{"code":0}' />

## Google <Site url="www.google.com"/>

### Public Albums <Site url="www.google.com" size="sm" />

<Route namespace="google" :data='{"path":"/album/:id","categories":["picture"],"example":"/google/album/msFFnAzKmQmWj76EA","parameters":{"id":"album ID, can be found in URL, for example, `https://photos.app.goo.gl/msFFnAzKmQmWj76EA` to `msFFnAzKmQmWj76EA`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Public Albums","maintainers":["hoilc"],"location":"album.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### Update <Site url="www.google.com" size="sm" />

<Route namespace="google" :data='{"path":"/doodles/:language?","categories":["picture"],"example":"/google/doodles/zh-CN","parameters":{"language":"Language, default to `zh-CN`, for other language values, you can get it from [Google Doodles official website](https://www.google.com/doodles)"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Update","maintainers":["xyqfer"],"location":"doodles.ts"}' :test='{"code":0}' />

## MM 范 <Site url="95mm.org"/>

### 标签 <Site url="95mm.org/" size="sm" />

<Route namespace="95mm" :data='{"path":"/tag/:tag","categories":["picture"],"example":"/95mm/tag/黑丝","parameters":{"tag":"标签，可在对应标签页中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["95mm.org/"]}],"name":"标签","maintainers":["nczitzk"],"url":"95mm.org/","location":"tag.ts"}' :test='undefined' />

### 分类 <Site url="95mm.org/" size="sm" />

<Route namespace="95mm" :data='{"path":"/tab/:tab?","categories":["picture"],"example":"/95mm/tab/热门","parameters":{"tab":"分类，见下表，默认为最新"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["95mm.org/"]}],"name":"分类","maintainers":["nczitzk"],"url":"95mm.org/","description":"| 最新 | 热门 | 校花 | 森系 | 清纯 | 童颜 | 嫩模 | 少女 |\n  | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |","location":"tab.ts"}' :test='undefined' />

| 最新 | 热门 | 校花 | 森系 | 清纯 | 童颜 | 嫩模 | 少女 |
  | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |

### 集合 <Site url="95mm.org/" size="sm" />

<Route namespace="95mm" :data='{"path":"/category/:category","categories":["picture"],"example":"/95mm/category/1","parameters":{"category":"集合，见下表"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["95mm.org/"]}],"name":"集合","maintainers":["nczitzk"],"url":"95mm.org/","description":"| 清纯唯美 | 摄影私房 | 明星写真 | 三次元 | 异域美景 | 性感妖姬 | 游戏主题 | 美女壁纸 |\n  | -------- | -------- | -------- | ------ | -------- | -------- | -------- | -------- |\n  | 1        | 2        | 4        | 5      | 6        | 7        | 9        | 11       |","location":"category.ts"}' :test='undefined' />

| 清纯唯美 | 摄影私房 | 明星写真 | 三次元 | 异域美景 | 性感妖姬 | 游戏主题 | 美女壁纸 |
  | -------- | -------- | -------- | ------ | -------- | -------- | -------- | -------- |
  | 1        | 2        | 4        | 5      | 6        | 7        | 9        | 11       |

## NASA Astronomy Picture of the Day <Site url="apod.nasa.gov"/>

### Cheng Kung University Mirror <Site url="apod.nasa.govundefined" size="sm" />

<Route namespace="nasa" :data='{"path":"/apod-ncku","categories":["picture"],"example":"/nasa/apod-ncku","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["apod.nasa.govundefined"]}],"name":"Cheng Kung University Mirror","maintainers":["nczitzk","williamgateszhao"],"url":"apod.nasa.govundefined","location":"apod-ncku.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

### NASA 中文 <Site url="apod.nasa.govundefined" size="sm" />

<Route namespace="nasa" :data='{"path":"/apod-cn","categories":["picture"],"example":"/nasa/apod-cn","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["apod.nasa.govundefined"]}],"name":"NASA 中文","maintainers":["nczitzk","williamgateszhao"],"url":"apod.nasa.govundefined","description":":::tip\n  [NASA 中文](https://www.nasachina.cn/) 提供了每日天文图的中英双语图文说明，但在更新上偶尔略有一两天的延迟。\n  :::","location":"apod-cn.ts"}' :test='{"code":0}' />

:::tip
  [NASA 中文](https://www.nasachina.cn/) 提供了每日天文图的中英双语图文说明，但在更新上偶尔略有一两天的延迟。
  :::

### NASA <Site url="apod.nasa.govundefined" size="sm" />

<Route namespace="nasa" :data='{"path":"/apod","categories":["picture"],"example":"/nasa/apod","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["apod.nasa.govundefined"]}],"name":"NASA","maintainers":["nczitzk","williamgateszhao"],"url":"apod.nasa.govundefined","location":"apod.ts"}' :test='{"code":0}' />

## Pixabay <Site url="pixabay.com"/>

### Search <Site url="pixabay.com" size="sm" />

<Route namespace="pixabay" :data='{"path":"/search/:q/:order?","categories":["picture"],"example":"/pixabay/search/cat","parameters":{"q":"Search term","order":"Order, `popular` or `latest`, `latest` by default"},"features":{"requireConfig":[{"name":"PIXABAY_KEY","optional":true,"description":""}],"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["pixabay.com/:searchType/search/:q"],"target":"/search/:q"}],"name":"Search","maintainers":["TonyRL"],"location":"search.ts"}' :test='{"code":0}' />

## wallhaven <Site url="wallhaven.cc"/>

:::tip
When parameter **Need Details** is set to `true` `yes` `t` `y`, RSS will add the title, uploader, upload time, and category information of each image, which can support the filtering function of RSS reader.

However, the number of requests to the site increases a lot when it is turned on, which causes the site to return `Response code 429 (Too Many Requests)`. So you need to specify a smaller `limit` parameter, i.e. add `?limit=<the number of posts for a request>` after the route, here is an example.

For example [Latest Wallpapers](https://wallhaven.cc/latest), the route turning on **Need Details** is [/wallhaven/latest/true](https://rsshub.app/wallhaven/latest/true), and then specify a smaller `limit`. We can get [/wallhaven/latest/true?limit=5](https://rsshub.app/wallhaven/latest/true?limit=5).
:::

### Search <Site url="wallhaven.cc/" size="sm" />

<Route namespace="wallhaven" :data='{"path":["/search/:filter?/:needDetails?","/:filter?/:needDetails?"],"categories":["picture"],"example":"/wallhaven/search/categories=110&purity=110&sorting=date_added&order=desc","parameters":{"filter":"Filter, empty by default","needDetails":"Need Details, `true`/`yes` as yes, no by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["wallhaven.cc/"]}],"name":"Search","maintainers":["nczitzk","Fatpandac"],"url":"wallhaven.cc/","description":":::tip\n  Subscribe pages starting with `https://wallhaven.cc/search`, fill the text after `?` as `filter` in the route. The following is an example:\n\n  The text after `?` is `q=id%3A711&sorting=random&ref=fp&seed=8g0dgd` for [Wallpaper Search: #landscape - wallhaven.cc](https://wallhaven.cc/search?q=id%3A711&sorting=random&ref=fp&seed=8g0dgd), so the route is [/wallhaven/q=id%3A711&sorting=random&ref=fp&seed=8g0dgd](https://rsshub.app/wallhaven/q=id%3A711&sorting=random&ref=fp&seed=8g0dgd)\n  :::","location":"index.ts"}' :test='{"code":0}' />

:::tip
  Subscribe pages starting with `https://wallhaven.cc/search`, fill the text after `?` as `filter` in the route. The following is an example:

  The text after `?` is `q=id%3A711&sorting=random&ref=fp&seed=8g0dgd` for [Wallpaper Search: #landscape - wallhaven.cc](https://wallhaven.cc/search?q=id%3A711&sorting=random&ref=fp&seed=8g0dgd), so the route is [/wallhaven/q=id%3A711&sorting=random&ref=fp&seed=8g0dgd](https://rsshub.app/wallhaven/q=id%3A711&sorting=random&ref=fp&seed=8g0dgd)
  :::

### Search <Site url="wallhaven.cc/" size="sm" />

<Route namespace="wallhaven" :data='{"path":["/search/:filter?/:needDetails?","/:filter?/:needDetails?"],"categories":["picture"],"example":"/wallhaven/search/categories=110&purity=110&sorting=date_added&order=desc","parameters":{"filter":"Filter, empty by default","needDetails":"Need Details, `true`/`yes` as yes, no by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["wallhaven.cc/"]}],"name":"Search","maintainers":["nczitzk","Fatpandac"],"url":"wallhaven.cc/","description":":::tip\n  Subscribe pages starting with `https://wallhaven.cc/search`, fill the text after `?` as `filter` in the route. The following is an example:\n\n  The text after `?` is `q=id%3A711&sorting=random&ref=fp&seed=8g0dgd` for [Wallpaper Search: #landscape - wallhaven.cc](https://wallhaven.cc/search?q=id%3A711&sorting=random&ref=fp&seed=8g0dgd), so the route is [/wallhaven/q=id%3A711&sorting=random&ref=fp&seed=8g0dgd](https://rsshub.app/wallhaven/q=id%3A711&sorting=random&ref=fp&seed=8g0dgd)\n  :::","location":"index.ts"}' :test='{"code":0}' />

:::tip
  Subscribe pages starting with `https://wallhaven.cc/search`, fill the text after `?` as `filter` in the route. The following is an example:

  The text after `?` is `q=id%3A711&sorting=random&ref=fp&seed=8g0dgd` for [Wallpaper Search: #landscape - wallhaven.cc](https://wallhaven.cc/search?q=id%3A711&sorting=random&ref=fp&seed=8g0dgd), so the route is [/wallhaven/q=id%3A711&sorting=random&ref=fp&seed=8g0dgd](https://rsshub.app/wallhaven/q=id%3A711&sorting=random&ref=fp&seed=8g0dgd)
  :::

## 北京天文馆 <Site url="bjp.org.cn"/>

### 每日一图 <Site url="bjp.org.cn/APOD/today.shtml" size="sm" />

<Route namespace="bjp" :data='{"path":"/apod","categories":["picture"],"example":"/bjp/apod","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["bjp.org.cn/APOD/today.shtml","bjp.org.cn/APOD/list.shtml","bjp.org.cn/"]}],"name":"每日一图","maintainers":["HenryQW"],"url":"bjp.org.cn/APOD/today.shtml","location":"apod.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

## 国家地理 <Site url="nationalgeographic.com"/>

### Unknown <Site url="nationalgeographic.com" size="sm" />

<Route namespace="natgeo" :data='{"path":"/dailyselection","name":"Unknown","maintainers":["OrangeEd1t"],"location":"dailyselection.ts"}' :test='undefined' />

### 每日一图 <Site url="nationalgeographic.com/photo-of-the-day/*" size="sm" />

<Route namespace="natgeo" :data='{"path":"/dailyphoto","categories":["picture"],"example":"/natgeo/dailyphoto","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["nationalgeographic.com/photo-of-the-day/*","nationalgeographic.com/"]}],"name":"每日一图","maintainers":["LogicJake","OrangeEd1t","TonyRL"],"url":"nationalgeographic.com/photo-of-the-day/*","location":"dailyphoto.ts"}' :test='{"code":0}' />

## 极品性感美女 <Site url="www.jpxgmn.com"/>

### 本周热门 <Site url="www.jpxgmn.com" size="sm" />

<Route namespace="jpxgmn" :data='{"path":"/weekly","categories":["picture"],"example":"/jpxgmn/weekly","radar":[{"source":["www.12356782.xyz/"],"target":"/weekly"}],"name":"本周热门","maintainers":["Urabartin"],"location":"weekly.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

### 分类 <Site url="www.jpxgmn.com" size="sm" />

<Route namespace="jpxgmn" :data='{"path":"/tab/:tab?","categories":["picture"],"example":"/jpxgmn/tab","parameters":{"tab":"分类，默认为`top`，包括`top`、`new`、`hot`，以及[源网站](http://www.jpxgmn.com/)所包含的其他相对路径，比如`Xiuren`、`XiaoYu`等"},"radar":[{"source":["www.12356782.xyz/:tab"],"target":"/:tab"}],"name":"分类","maintainers":["Urabartin"],"location":"tab.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

### 搜索 <Site url="www.jpxgmn.com" size="sm" />

<Route namespace="jpxgmn" :data='{"path":"/search/:kw","categories":["picture"],"example":"/jpxgmn/search/candy","parameters":{"kw":"搜索关键词"},"name":"搜索","maintainers":["Urabartin"],"location":"search.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

## 喷嚏 <Site url="dapenti.com"/>

### 图卦 <Site url="dapenti.com" size="sm" />

<Route namespace="dapenti" :data='{"path":"/tugua","categories":["picture"],"example":"/dapenti/tugua","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"图卦","maintainers":["tgly307"],"location":"tugua.ts"}' :test='{"code":0}' />

### 主题 <Site url="dapenti.com" size="sm" />

<Route namespace="dapenti" :data='{"path":"/subject/:id","categories":["picture"],"example":"/dapenti/subject/184","parameters":{"id":"主题 id"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"主题","maintainers":["xyqfer"],"location":"subject.ts"}' :test='{"code":0}' />

## 奇葩买家秀 <Site url="qipamaijia.com"/>

### 频道 <Site url="qipamaijia.com/" size="sm" />

<Route namespace="qipamaijia" :data='{"path":"/:cate?","categories":["picture"],"example":"/qipamaijia/fuli","parameters":{"cate":"频道名，可在对应网址中找到，默认为最新"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["qipamaijia.com/","qipamaijia.com/:cate"],"target":"/:cate"}],"name":"频道","maintainers":["Fatpandac","nczitzk"],"url":"qipamaijia.com/","location":"index.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

