# 📱 新媒体

## 36kr <Site url="36kr.com"/>

### 资讯热榜 <Site url="36kr.com" size="sm" />

<Route namespace="36kr" :data='{"path":"/hot-list/:category?","categories":["new-media"],"example":"/36kr/hot-list","parameters":{"category":"分类，默认为24小时热榜"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["36kr.com/hot-list/:category","36kr.com/"],"target":"/hot-list/:category"}],"name":"资讯热榜","maintainers":["nczitzk"],"description":"| 24 小时热榜 | 资讯人气榜 | 资讯综合榜 | 资讯收藏榜 |\n  | ----------- | ---------- | ---------- | ---------- |\n  | 24          | renqi      | zonghe     | shoucang   |","location":"hot-list.ts"}' />

| 24 小时热榜 | 资讯人气榜 | 资讯综合榜 | 资讯收藏榜 |
  | ----------- | ---------- | ---------- | ---------- |
  | 24          | renqi      | zonghe     | shoucang   |

### 资讯, 快讯, 用户文章, 主题文章, 专题文章, 搜索文章, 搜索快讯 <Site url="36kr.com" size="sm" />

<Route namespace="36kr" :data='{"path":"/:category/:subCategory?/:keyword?","categories":["new-media"],"example":"/36kr/newsflashes","parameters":{"category":"分类，必填项","subCategory":"子分类，选填项，目的是为了兼容老逻辑","keyword":"关键词，选填项，仅搜索文章/快讯时有效"},"name":"资讯, 快讯, 用户文章, 主题文章, 专题文章, 搜索文章, 搜索快讯","maintainers":["nczitzk","fashioncj"],"description":"| 最新资讯频道    | 快讯     | 推荐资讯｜生活｜房产｜职场｜搜索文章｜搜索快讯｜\n    | ------- | -------- ｜ -------- ｜ -------- ｜ -------- ｜ --------｜ -------- ｜ -------- ｜\n    | news | newsflashes ｜ recommend ｜ life ｜ estate ｜ workplace ｜ search/articles/关键词 ｜ search/articles/关键词 ｜","location":"index.ts"}' />

| 最新资讯频道    | 快讯     | 推荐资讯｜生活｜房产｜职场｜搜索文章｜搜索快讯｜
    | ------- | -------- ｜ -------- ｜ -------- ｜ -------- ｜ --------｜ -------- ｜ -------- ｜
    | news | newsflashes ｜ recommend ｜ life ｜ estate ｜ workplace ｜ search/articles/关键词 ｜ search/articles/关键词 ｜

## 52hrtt 华人头条 <Site url="52hrtt.com"/>

### 新闻 <Site url="52hrtt.com" size="sm" />

<Route namespace="52hrtt" :data='{"path":"/:area?/:type?","categories":["new-media"],"example":"/52hrtt/global","parameters":{"area":"地区，默认为全球","type":"分类，默认为新闻"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"新闻","maintainers":["nczitzk"],"description":"地区和分类皆可在浏览器地址栏中找到，下面是一个例子。\n\n  访问华人头条全球站的国际分类，会跳转到 `https://www.52hrtt.com/global/n/w?infoTypeId=A1459145516533`。其中 `global` 即为 **全球** 对应的地区代码，`A1459145516533` 即为 **国际** 对应的分类代码。","location":"index.ts"}' />

地区和分类皆可在浏览器地址栏中找到，下面是一个例子。

  访问华人头条全球站的国际分类，会跳转到 `https://www.52hrtt.com/global/n/w?infoTypeId=A1459145516533`。其中 `global` 即为 **全球** 对应的地区代码，`A1459145516533` 即为 **国际** 对应的分类代码。

### 专题 <Site url="52hrtt.com" size="sm" />

<Route namespace="52hrtt" :data='{"path":"/symposium/:id?/:classId?","categories":["new-media"],"example":"/52hrtt/symposium/F1626082387819","parameters":{"id":"专题 id","classId":"子分类 id"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["52hrtt.com/global/n/w/symposium/:id"],"target":"/symposium/:id"}],"name":"专题","maintainers":["nczitzk"],"description":"专题 id 和 子分类 id 皆可在浏览器地址栏中找到，下面是一个例子。\n\n  访问 “邱毅看平潭” 专题，会跳转到 `https://www.52hrtt.com/global/n/w/symposium/F1626082387819`。其中 `F1626082387819` 即为 **专题 id** 对应的地区代码。\n\n  :::tip\n  更多的专题可以点击 [这里](https://www.52hrtt.com/global/n/w/symposium)\n  :::","location":"symposium.ts"}' />

专题 id 和 子分类 id 皆可在浏览器地址栏中找到，下面是一个例子。

  访问 “邱毅看平潭” 专题，会跳转到 `https://www.52hrtt.com/global/n/w/symposium/F1626082387819`。其中 `F1626082387819` 即为 **专题 id** 对应的地区代码。

  :::tip
  更多的专题可以点击 [这里](https://www.52hrtt.com/global/n/w/symposium)
  :::

## AEON <Site url="aeon.aeon.co"/>

### Categories <Site url="aeon.aeon.co" size="sm" />

<Route namespace="aeon" :data='{"path":"/category/:category","categories":["new-media"],"example":"/aeon/category/philosophy","parameters":{"category":"Category"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["aeon.aeon.co/:category"]}],"name":"Categories","maintainers":["emdoe"],"description":"Supported categories: Philosophy, Science, Psychology, Society, and Culture.","location":"category.ts"}' />

Supported categories: Philosophy, Science, Psychology, Society, and Culture.

### Types <Site url="aeon.aeon.co" size="sm" />

<Route namespace="aeon" :data='{"path":"/:type","categories":["new-media"],"example":"/aeon/essays","parameters":{"type":"Type"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["aeon.aeon.co/:type"]}],"name":"Types","maintainers":["emdoe"],"description":"Supported types: Essays, Videos, and Audio.\n\n  Compared to the official one, the RSS feed generated by RSSHub not only has more fine-grained options, but also eliminates pull quotes, which can&#39;t be easily distinguished from other paragraphs by any RSS reader, but only disrupt the reading flow. This feed also provides users with a bio of the author at the top.\n\n  However, The content generated under `audio` does not contain links to audio files.","location":"type.ts"}' />

Supported types: Essays, Videos, and Audio.

  Compared to the official one, the RSS feed generated by RSSHub not only has more fine-grained options, but also eliminates pull quotes, which can't be easily distinguished from other paragraphs by any RSS reader, but only disrupt the reading flow. This feed also provides users with a bio of the author at the top.

  However, The content generated under `audio` does not contain links to audio files.

## AG⓪RA <Site url="agorahub.github.io"/>

### 共和報 <Site url="agorahub.github.io/pen0" size="sm" />

<Route namespace="agora0" :data='{"path":"/pen0","categories":["new-media"],"example":"/agora0/pen0","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["agorahub.github.io/pen0"]}],"name":"共和報","maintainers":["TonyRL"],"url":"agorahub.github.io/pen0","location":"pen0.ts"}' />

### 零博客 <Site url="agorahub.github.io" size="sm" />

<Route namespace="agora0" :data='{"path":"/:category?","categories":["new-media"],"example":"/agora0/initium","parameters":{"category":"分类，见下表，默认为 initium，即端传媒"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["agora0.gitlab.io/blog/:category","agora0.gitlab.io/"],"target":"/:category"}],"name":"零博客","maintainers":["nczitzk"],"description":"| muitinⒾ | aidemnⒾ | srettaⓂ | qⓅ | sucoⓋ |\n  | ------- | ------- | -------- | -- | ----- |\n  | initium | inmedia | matters  | pq | vocus |","location":"index.ts"}' />

| muitinⒾ | aidemnⒾ | srettaⓂ | qⓅ | sucoⓋ |
  | ------- | ------- | -------- | -- | ----- |
  | initium | inmedia | matters  | pq | vocus |

## AppleInsider <Site url="appleinsider.com"/>

### Category <Site url="appleinsider.com" size="sm" />

<Route namespace="appleinsider" :data='{"path":"/:category?","categories":["new-media"],"example":"/appleinsider","parameters":{"category":"Category, see below, News by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["appleinsider.com/:category","appleinsider.com/"],"target":"/:category"}],"name":"Category","maintainers":["nczitzk"],"description":"| News | Reviews | How-tos |\n  | ---- | ------- | ------- |\n  |      | reviews | how-to  |","location":"index.ts"}' />

| News | Reviews | How-tos |
  | ---- | ------- | ------- |
  |      | reviews | how-to  |

## C114 通信网 <Site url="c114.com.cn"/>

### 滚动新闻 <Site url="c114.com.cn/news/roll.asp" size="sm" />

<Route namespace="c114" :data='{"path":"/roll","categories":["new-media"],"example":"/c114/roll","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["c114.com.cn/news/roll.asp","c114.com.cn/"]}],"name":"滚动新闻","maintainers":["nczitzk"],"url":"c114.com.cn/news/roll.asp","location":"roll.ts"}' />

## China.com 中华网 <Site url="finance.china.com"/>

### Finance News 财经 - 财经新闻 <Site url="finance.china.com" size="sm" />

<Route namespace="china" :data='{"path":"/finance/:category?","categories":["new-media"],"example":"/china/finance","parameters":{"category":"Category of news. See the form below for details, default is suggest news."},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["finance.china.com/:category"]}],"name":"Finance News 财经 - 财经新闻","maintainers":["KingJem"],"description":"| 推荐    | TMT | 金融    | 地产   | 消费    | 医药  | 酒业 | IPO 观察 |\n  | ------- | --- | ------- | ------ | ------- | ----- | ---- | -------- |\n  | tuijian | TMT | jinrong | dichan | xiaofei | yiyao | wine | IPO      |\n\n  > Note: The default news num is `30`.\n\n  > 注意：默认新闻条数是 `30`。","location":"finance/finance.ts"}' />

| 推荐    | TMT | 金融    | 地产   | 消费    | 医药  | 酒业 | IPO 观察 |
  | ------- | --- | ------- | ------ | ------- | ----- | ---- | -------- |
  | tuijian | TMT | jinrong | dichan | xiaofei | yiyao | wine | IPO      |

  > Note: The default news num is `30`.

  > 注意：默认新闻条数是 `30`。

### Military - Military News 军事 - 军事新闻 <Site url="military.china.com/news" size="sm" />

<Route namespace="china" :data='{"path":"/news/military","categories":["new-media"],"example":"/china/news/military","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["military.china.com/news"]}],"name":"Military - Military News 军事 - 军事新闻","maintainers":["jiaaoMario"],"url":"military.china.com/news","location":"news/military/news.ts"}' />

### News and current affairs 时事新闻 <Site url="finance.china.com" size="sm" />

<Route namespace="china" :data='{"path":"/news/:category?","categories":["new-media"],"example":"/china/news","parameters":{"category":"Category of news. See the form below for details, default is china news."},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["news.china.com/:category"]}],"name":"News and current affairs 时事新闻","maintainers":["jiaaoMario"],"description":"Category of news\n\n  | China News | International News | Social News | Breaking News |\n  | ---------- | ------------------ | ----------- | ------------- |\n  | domestic   | international      | social      | news100       |","location":"news/highlights/news.ts"}' />

Category of news

  | China News | International News | Social News | Breaking News |
  | ---------- | ------------------ | ----------- | ------------- |
  | domestic   | international      | social      | news100       |

## CoinDesk Consensus Magazine <Site url="coindesk.com"/>

### 新闻周刊 <Site url="coindesk.com/" size="sm" />

<Route namespace="coindesk" :data='{"path":"/consensus-magazine","categories":["new-media"],"example":"/coindesk/consensus-magazine","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["coindesk.com/"]}],"name":"新闻周刊","maintainers":["jameshih"],"url":"coindesk.com/","location":"index.ts"}' />

## DCFever <Site url="dcfever.com"/>

### 測試報告 <Site url="dcfever.com" size="sm" />

<Route namespace="dcfever" :data='{"path":"/reviews/:type?","categories":["new-media"],"example":"/dcfever/reviews/cameras","parameters":{"type":"分類，預設為 `cameras`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["dcfever.com/:type/reviews.php"],"target":"/reviews/:type"}],"name":"測試報告","maintainers":["TonyRL"],"description":"| 相機及鏡頭 | 手機平板 | 試車報告 |\n  | ---------- | -------- | -------- |\n  | cameras    | phones   | cars     |","location":"reviews.ts"}' />

| 相機及鏡頭 | 手機平板 | 試車報告 |
  | ---------- | -------- | -------- |
  | cameras    | phones   | cars     |

### 二手市集 - 物品搜尋 <Site url="dcfever.com" size="sm" />

<Route namespace="dcfever" :data='{"path":"/trading/search/:keyword/:mainCat?","categories":["new-media"],"example":"/dcfever/trading/search/Sony","parameters":{"keyword":"關鍵字","mainCat":"主要分類 ID，見上表"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"二手市集 - 物品搜尋","maintainers":["TonyRL"],"location":"trading-search.ts"}' />

### 二手市集 <Site url="dcfever.com" size="sm" />

<Route namespace="dcfever" :data='{"path":"/trading/:id","categories":["new-media"],"example":"/dcfever/trading/1","parameters":{"id":"分類 ID，見下表"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"二手市集","maintainers":["TonyRL"],"description":"[所有物品分類](https://www.dcfever.com/trading/index.php#all_cats)\n\n  | 攝影產品 | 電腦 | 手機通訊 | 影音產品 | 遊戲機、模型 | 電器傢俱 | 潮流服飾 | 手錶 | 單車及運動 | 其它 |\n  | -------- | ---- | -------- | -------- | ------------ | -------- | -------- | ---- | ---------- | ---- |\n  | 1        | 2    | 3        | 44       | 43           | 104      | 45       | 99   | 109        | 4    |","location":"trading.ts"}' />

[所有物品分類](https://www.dcfever.com/trading/index.php#all_cats)

  | 攝影產品 | 電腦 | 手機通訊 | 影音產品 | 遊戲機、模型 | 電器傢俱 | 潮流服飾 | 手錶 | 單車及運動 | 其它 |
  | -------- | ---- | -------- | -------- | ------------ | -------- | -------- | ---- | ---------- | ---- |
  | 1        | 2    | 3        | 44       | 43           | 104      | 45       | 99   | 109        | 4    |

### 新聞中心 <Site url="dcfever.com" size="sm" />

<Route namespace="dcfever" :data='{"path":"/news/:type?","categories":["new-media"],"example":"/dcfever/news","parameters":{"type":"分類，預設為所有新聞"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"新聞中心","maintainers":["TonyRL"],"description":"| 所有新聞 | 攝影器材 | 手機通訊 | 汽車熱話 | 攝影文化    | 影片攝錄    | 測試報告 | 生活科技 | 攝影技巧  |\n  | -------- | -------- | -------- | -------- | ----------- | ----------- | -------- | -------- | --------- |\n  |          | camera   | mobile   | auto     | photography | videography | reviews  | gadget   | technique |","location":"news.ts"}' />

| 所有新聞 | 攝影器材 | 手機通訊 | 汽車熱話 | 攝影文化    | 影片攝錄    | 測試報告 | 生活科技 | 攝影技巧  |
  | -------- | -------- | -------- | -------- | ----------- | ----------- | -------- | -------- | --------- |
  |          | camera   | mobile   | auto     | photography | videography | reviews  | gadget   | technique |

## DeepMind <Site url="deepmind.com"/>

### Blog <Site url="deepmind.com/blog" size="sm" />

<Route namespace="deepmind" :data='{"path":"/blog","categories":["new-media"],"example":"/deepmind/blog","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["deepmind.com/blog","deepmind.com/"]}],"name":"Blog","maintainers":["nczitzk","TonyRL"],"url":"deepmind.com/blog","location":"blog.ts"}' />

## DN.com <Site url="dn.com"/>

### News <Site url="dn.com" size="sm" />

<Route namespace="dn" :data='{"path":"/:language/news/:category?","categories":["new-media"],"example":"/dn/en-us/news","parameters":{"language":"Language, see below","category":"Category, see below, The Latest by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"News","maintainers":["nczitzk"],"description":"#### Language\n\n  | English | 中文  |\n  | ------- | ----- |\n  | en-us   | zh-cn |\n\n  #### Category\n\n  | English Category     | 中文分类 | Category id |\n  | -------------------- | -------- | ----------- |\n  | The Latest           | 最新     |             |\n  | Industry Information | 行业资讯 | category-1  |\n  | Knowledge            | 域名知识 | category-2  |\n  | Investment           | 域名投资 | category-3  |","location":"news.ts"}' />

#### Language

  | English | 中文  |
  | ------- | ----- |
  | en-us   | zh-cn |

  #### Category

  | English Category     | 中文分类 | Category id |
  | -------------------- | -------- | ----------- |
  | The Latest           | 最新     |             |
  | Industry Information | 行业资讯 | category-1  |
  | Knowledge            | 域名知识 | category-2  |
  | Investment           | 域名投资 | category-3  |

## EU Disinfo Lab <Site url="disinfo.eu"/>

### Publications <Site url="disinfo.eu/" size="sm" />

<Route namespace="disinfo" :data='{"path":"/publications","categories":["new-media"],"example":"/disinfo/publications","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["disinfo.eu/"]}],"name":"Publications","maintainers":["nczitzk"],"url":"disinfo.eu/","location":"publications.ts"}' />

## e 公司 <Site url="egsea.com"/>

### 快讯 <Site url="egsea.com/news/flash" size="sm" />

<Route namespace="egsea" :data='{"path":"/flash","categories":["new-media"],"example":"/egsea/flash","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["egsea.com/news/flash"]}],"name":"快讯","maintainers":["hillerliao"],"url":"egsea.com/news/flash","location":"flash.ts"}' />

## ePrice <Site url="eprice.com.tw"/>

### 最新消息 <Site url="eprice.com.tw" size="sm" />

<Route namespace="eprice" :data='{"path":"/:region?","categories":["new-media"],"example":"/eprice/tw","parameters":{"region":"地区，预设为 tw"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"最新消息","maintainers":["TonyRL"],"description":"地区：\n\n  | hk   | tw   |\n  | ---- | ---- |\n  | 香港 | 台湾 |","location":"rss.ts"}' />

地区：

  | hk   | tw   |
  | ---- | ---- |
  | 香港 | 台湾 |

## Farmatters <Site url="farmatters.com"/>

### Exclusive <Site url="farmatters.com/exclusive" size="sm" />

<Route namespace="farmatters" :data='{"path":["/exclusive/:locale?","/news/:locale?","/:locale?","/:type/:id/:locale?"],"categories":["new-media"],"example":"/farmatters/exclusive","parameters":{"locale":"Locale, `zh-CN` or `en-US`, `zh-CN` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["farmatters.com/exclusive"],"target":"/exclusive"}],"name":"Exclusive","maintainers":["nczitzk"],"url":"farmatters.com/exclusive","location":"index.ts"}' />

### Exclusive <Site url="farmatters.com/exclusive" size="sm" />

<Route namespace="farmatters" :data='{"path":["/exclusive/:locale?","/news/:locale?","/:locale?","/:type/:id/:locale?"],"categories":["new-media"],"example":"/farmatters/exclusive","parameters":{"locale":"Locale, `zh-CN` or `en-US`, `zh-CN` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["farmatters.com/exclusive"],"target":"/exclusive"}],"name":"Exclusive","maintainers":["nczitzk"],"url":"farmatters.com/exclusive","location":"index.ts"}' />

### Exclusive <Site url="farmatters.com/exclusive" size="sm" />

<Route namespace="farmatters" :data='{"path":["/exclusive/:locale?","/news/:locale?","/:locale?","/:type/:id/:locale?"],"categories":["new-media"],"example":"/farmatters/exclusive","parameters":{"locale":"Locale, `zh-CN` or `en-US`, `zh-CN` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["farmatters.com/exclusive"],"target":"/exclusive"}],"name":"Exclusive","maintainers":["nczitzk"],"url":"farmatters.com/exclusive","location":"index.ts"}' />

### Exclusive <Site url="farmatters.com/exclusive" size="sm" />

<Route namespace="farmatters" :data='{"path":["/exclusive/:locale?","/news/:locale?","/:locale?","/:type/:id/:locale?"],"categories":["new-media"],"example":"/farmatters/exclusive","parameters":{"locale":"Locale, `zh-CN` or `en-US`, `zh-CN` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["farmatters.com/exclusive"],"target":"/exclusive"}],"name":"Exclusive","maintainers":["nczitzk"],"url":"farmatters.com/exclusive","location":"index.ts"}' />

## Focus Taiwan <Site url="focustaiwan.tw"/>

### Category <Site url="focustaiwan.tw" size="sm" />

<Route namespace="focustaiwan" :data='{"path":"/:category?","categories":["new-media"],"example":"/focustaiwan","parameters":{"category":"分类，见下表，默认为 news"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Category","maintainers":["nczitzk"],"description":"| Latest | Editor&#39;s Picks | Photos of the Day |\n  | ------ | -------------- | ----------------- |\n  | news   | editorspicks   | photos            |\n\n  | Politics | Cross-strait | Business | Society | Science & Tech | Culture | Sports |\n  | -------- | ------------ | -------- | ------- | -------------- | ------- | ------ |\n  | politics | cross-strait | business | society | science & tech | culture | sports |","location":"index.ts"}' />

| Latest | Editor's Picks | Photos of the Day |
  | ------ | -------------- | ----------------- |
  | news   | editorspicks   | photos            |

  | Politics | Cross-strait | Business | Society | Science & Tech | Culture | Sports |
  | -------- | ------------ | -------- | ------- | -------------- | ------- | ------ |
  | politics | cross-strait | business | society | science & tech | culture | sports |

## Foresight News <Site url="foresightnews.pro"/>

### Unknown <Site url="foresightnews.pro/" size="sm" />

<Route namespace="foresightnews" :data='{"path":"/","radar":[{"source":["foresightnews.pro/"],"target":""}],"name":"Unknown","maintainers":["nczitzk"],"url":"foresightnews.pro/","location":"index.ts"}' />

### 快讯 <Site url="foresightnews.pro/news" size="sm" />

<Route namespace="foresightnews" :data='{"path":"/news","categories":["new-media"],"example":"/foresightnews/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["foresightnews.pro/news","foresightnews.pro/"]}],"name":"快讯","maintainers":["nczitzk"],"url":"foresightnews.pro/news","location":"news.ts"}' />

### 文章 <Site url="foresightnews.pro/" size="sm" />

<Route namespace="foresightnews" :data='{"path":"/article","categories":["new-media"],"example":"/foresightnews/article","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["foresightnews.pro/"]}],"name":"文章","maintainers":["nczitzk"],"url":"foresightnews.pro/","location":"article.ts"}' />

### 专栏 <Site url="foresightnews.pro/" size="sm" />

<Route namespace="foresightnews" :data='{"path":"/column/:id","categories":["new-media"],"example":"/foresightnews/column/1","parameters":{"id":"专栏 id, 可在对应专栏页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["foresightnews.pro/column/detail/:id","foresightnews.pro/"]}],"name":"专栏","maintainers":["nczitzk"],"url":"foresightnews.pro/","location":"column.ts"}' />

## Google <Site url="www.google.com"/>

### News <Site url="www.google.com" size="sm" />

<Route namespace="google" :data='{"path":"/news/:category/:locale","categories":["new-media"],"example":"/google/news/Top stories/hl=en-US&gl=US&ceid=US:en","parameters":{"category":"Category Title","locale":"locales, could be found behind `?`, including `hl`, `gl`, and `ceid` as parameters"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"News","maintainers":["zoenglinghou"],"location":"news.ts"}' />

## Grist <Site url="grist.org"/>

### Featured <Site url="grist.org/" size="sm" />

<Route namespace="grist" :data='{"path":"/featured","categories":["new-media"],"example":"/grist/featured","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["grist.org/"]}],"name":"Featured","maintainers":["Rjnishant530"],"url":"grist.org/","location":"featured.ts"}' />

### Series <Site url="grist.org/articles/" size="sm" />

<Route namespace="grist" :data='{"path":"/series/:series","categories":["new-media"],"example":"/grist/series/best-of-grist","parameters":{"series":"Find in the URL which has /series/"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["grist.org/series/:series"]}],"name":"Series","maintainers":["Rjnishant530"],"url":"grist.org/articles/","location":"series.ts"}' />

### Topic <Site url="grist.org/articles/" size="sm" />

<Route namespace="grist" :data='{"path":"/topic/:topic","categories":["new-media"],"example":"/grist/topic/extreme-heat","parameters":{"topic":"Any Topic from Table below"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["grist.org/:topic"]}],"name":"Topic","maintainers":["Rjnishant530"],"url":"grist.org/articles/","description":"Topics\n\n  | Topic Name               | Topic Link         |\n  | ------------------------ | ------------------ |\n  | Accountability           | accountability     |\n  | Agriculture              | agriculture        |\n  | Ask Umbra                | ask-umbra-series   |\n  | Buildings                | buildings          |\n  | Cities                   | cities             |\n  | Climate & Energy         | climate-energy     |\n  | Climate Fiction          | climate-fiction    |\n  | Climate of Courage       | climate-of-courage |\n  | COP26                    | cop26              |\n  | COP27                    | cop27              |\n  | Culture                  | culture            |\n  | Economics                | economics          |\n  | Energy                   | energy             |\n  | Equity                   | equity             |\n  | Extreme Weather          | extreme-weather    |\n  | Fix                      | fix                |\n  | Food                     | food               |\n  | Grist                    | grist              |\n  | Grist News               | grist-news         |\n  | Health                   | health             |\n  | Housing                  | housing            |\n  | Indigenous Affairs       | indigenous         |\n  | International            | international      |\n  | Labor                    | labor              |\n  | Language                 | language           |\n  | Migration                | migration          |\n  | Opinion                  | opinion            |\n  | Politics                 | politics           |\n  | Protest                  | protest            |\n  | Race                     | race               |\n  | Regulation               | regulation         |\n  | Science                  | science            |\n  | Shift Happens Newsletter | shift-happens      |\n  | Solutions                | solutions          |\n  | Spanish                  | spanish            |\n  | Sponsored                | sponsored          |\n  | Technology               | technology         |\n  | Temperature Check        | temperature-check  |\n  | Uncategorized            | article            |\n  | Updates                  | updates            |\n  | Video                    | video              |","location":"topic.ts"}' />

Topics

  | Topic Name               | Topic Link         |
  | ------------------------ | ------------------ |
  | Accountability           | accountability     |
  | Agriculture              | agriculture        |
  | Ask Umbra                | ask-umbra-series   |
  | Buildings                | buildings          |
  | Cities                   | cities             |
  | Climate & Energy         | climate-energy     |
  | Climate Fiction          | climate-fiction    |
  | Climate of Courage       | climate-of-courage |
  | COP26                    | cop26              |
  | COP27                    | cop27              |
  | Culture                  | culture            |
  | Economics                | economics          |
  | Energy                   | energy             |
  | Equity                   | equity             |
  | Extreme Weather          | extreme-weather    |
  | Fix                      | fix                |
  | Food                     | food               |
  | Grist                    | grist              |
  | Grist News               | grist-news         |
  | Health                   | health             |
  | Housing                  | housing            |
  | Indigenous Affairs       | indigenous         |
  | International            | international      |
  | Labor                    | labor              |
  | Language                 | language           |
  | Migration                | migration          |
  | Opinion                  | opinion            |
  | Politics                 | politics           |
  | Protest                  | protest            |
  | Race                     | race               |
  | Regulation               | regulation         |
  | Science                  | science            |
  | Shift Happens Newsletter | shift-happens      |
  | Solutions                | solutions          |
  | Spanish                  | spanish            |
  | Sponsored                | sponsored          |
  | Technology               | technology         |
  | Temperature Check        | temperature-check  |
  | Uncategorized            | article            |
  | Updates                  | updates            |
  | Video                    | video              |

### Unknown <Site url="grist.org/articles/" size="sm" />

<Route namespace="grist" :data='{"path":"/","radar":[{"source":["grist.org/articles/"]}],"name":"Unknown","maintainers":["Rjnishant530"],"url":"grist.org/articles/","location":"index.ts"}' />

## Harvard Health Publishing <Site url="www.health.harvard.edu"/>

### Health Blog <Site url="www.health.harvard.edu/blog" size="sm" />

<Route namespace="harvard" :data='{"path":"/health/blog","categories":["new-media"],"example":"/harvard/health/blog","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.health.harvard.edu/blog"]}],"name":"Health Blog","maintainers":["nczitzk"],"url":"www.health.harvard.edu/blog","location":"health/blog.ts"}' />

## Harvard Business Review <Site url="hbr.org"/>

### Topic <Site url="hbr.org" size="sm" />

<Route namespace="hbr" :data='{"path":"/topic/:topic?/:type?","categories":["new-media"],"example":"/hbr/topic/leadership","parameters":{"topic":"Topic, can be found in URL, Leadership by default","type":"Type, see below, Latest by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["hbr.org/topic/:topic?","hbr.org/"]}],"name":"Topic","maintainers":["nczitzk"],"description":"| LATEST | POPULAR | FROM THE STORE | FOR YOU |\n  | ------ | ------- | -------------- | ------- |\n  | Latest | Popular | From the Store | For You |\n\n  :::tip\n  Click here to view [All Topics](https://hbr.org/topics)\n  :::","location":"topic.ts"}' />

| LATEST | POPULAR | FROM THE STORE | FOR YOU |
  | ------ | ------- | -------------- | ------- |
  | Latest | Popular | From the Store | For You |

  :::tip
  Click here to view [All Topics](https://hbr.org/topics)
  :::

## HKEPC <Site url="hkepc.com"/>

### HKEPC 电脑领域 <Site url="hkepc.com/" size="sm" />

<Route namespace="hkepc" :data='{"path":"/:category?","categories":["new-media"],"example":"/hkepc/news","parameters":{"category":"分类，见下表，默认为最新消息"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["hkepc.com/"],"target":""}],"name":"HKEPC 电脑领域","maintainers":["TonyRL"],"url":"hkepc.com/","description":"| 专题报导   | 新闻中心 | 新品快递 | 超频领域 | 流动数码 | 生活娱乐      | 会员消息 | 脑场新闻 | 业界资讯 | 最新消息 |\n  | ---------- | -------- | -------- | -------- | -------- | ------------- | -------- | -------- | -------- | -------- |\n  | coverStory | news     | review   | ocLab    | digital  | entertainment | member   | price    | press    | latest   |","location":"index.ts"}' />

| 专题报导   | 新闻中心 | 新品快递 | 超频领域 | 流动数码 | 生活娱乐      | 会员消息 | 脑场新闻 | 业界资讯 | 最新消息 |
  | ---------- | -------- | -------- | -------- | -------- | ------------- | -------- | -------- | -------- | -------- |
  | coverStory | news     | review   | ocLab    | digital  | entertainment | member   | price    | press    | latest   |

## Indians in Kuwait <Site url="indiansinkuwait.com"/>

### News <Site url="indiansinkuwait.com/latest-news" size="sm" />

<Route namespace="indiansinkuwait" :data='{"path":"/latest","categories":["new-media"],"example":"/indiansinkuwait/latest","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["indiansinkuwait.com/latest-news","indiansinkuwait.com/"]}],"name":"News","maintainers":["TonyRL"],"url":"indiansinkuwait.com/latest-news","location":"latest.ts"}' />

## InfoQ 中文 <Site url="infoq.cn"/>

### 话题 <Site url="infoq.cn" size="sm" />

<Route namespace="infoq" :data='{"path":"/topic/:id","categories":["new-media"],"example":"/infoq/topic/1","parameters":{"id":"话题id，可在 [InfoQ全部话题](https://www.infoq.cn/topics) 页面找到URL里的话题id"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["infoq.cn/topic/:id"]}],"name":"话题","maintainers":["brilon"],"location":"topic.ts"}' />

### 推荐 <Site url="infoq.cn/" size="sm" />

<Route namespace="infoq" :data='{"path":"/recommend","categories":["new-media"],"example":"/infoq/recommend","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["infoq.cn/"]}],"name":"推荐","maintainers":["brilon"],"url":"infoq.cn/","location":"recommend.ts"}' />

## iThome 台灣 <Site url="ithome.com"/>

### Feeds <Site url="ithome.com" size="sm" />

<Route namespace="ithome" :data='{"path":"/tw/feeds/:category","categories":["new-media"],"example":"/ithome/tw/feeds/news","parameters":{"category":"類別"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.ithome.com.tw/:category","www.ithome.com.tw/:category/feeds"]}],"name":"Feeds","maintainers":["miles170"],"description":"| 新聞 | AI       | Cloud | DevOps | 資安     |\n  | ---- | -------- | ----- | ------ | -------- |\n  | news | big-data | cloud | devops | security |","location":"tw/feeds.ts"}' />

| 新聞 | AI       | Cloud | DevOps | 資安     |
  | ---- | -------- | ----- | ------ | -------- |
  | news | big-data | cloud | devops | security |

### 标签 <Site url="ithome.com" size="sm" />

<Route namespace="ithome" :data='{"path":"/tag/:name","categories":["new-media"],"example":"/ithome/tag/win11","parameters":{"name":"标签名称，可从网址链接中获取"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["ithome.com/tag/:name"]}],"name":"标签","maintainers":["Fatpandac"],"location":"tag.ts"}' />

### 分类资讯 <Site url="ithome.com" size="sm" />

<Route namespace="ithome" :data='{"path":"/:caty","categories":["new-media"],"example":"/ithome/it","parameters":{"caty":"类别"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"分类资讯","maintainers":["luyuhuang"],"description":"| it      | soft     | win10      | win11      | iphone      | ipad      | android      | digi     | next     |\n  | ------- | -------- | ---------- | ---------- | ----------- | --------- | ------------ | -------- | -------- |\n  | IT 资讯 | 软件之家 | win10 之家 | win11 之家 | iphone 之家 | ipad 之家 | android 之家 | 数码之家 | 智能时代 |","location":"index.ts"}' />

| it      | soft     | win10      | win11      | iphone      | ipad      | android      | digi     | next     |
  | ------- | -------- | ---------- | ---------- | ----------- | --------- | ------------ | -------- | -------- |
  | IT 资讯 | 软件之家 | win10 之家 | win11 之家 | iphone 之家 | ipad 之家 | android 之家 | 数码之家 | 智能时代 |

### 热榜 <Site url="ithome.com" size="sm" />

<Route namespace="ithome" :data='{"path":"/ranking/:type","categories":["new-media"],"example":"/ithome/ranking/24h","parameters":{"type":"类别"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"热榜","maintainers":["immmortal","luyuhuang"],"description":"| 24h           | 7days    | monthly |\n  | ------------- | -------- | ------- |\n  | 24 小时阅读榜 | 7 天最热 | 月榜    |","location":"ranking.ts"}' />

| 24h           | 7days    | monthly |
  | ------------- | -------- | ------- |
  | 24 小时阅读榜 | 7 天最热 | 月榜    |

### 专题 <Site url="ithome.com" size="sm" />

<Route namespace="ithome" :data='{"path":"/zt/:id","categories":["new-media"],"example":"/ithome/zt/xijiayi","parameters":{"id":"专题 id"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["ithome.com/zt/:id"]}],"name":"专题","maintainers":["nczitzk"],"description":"所有专题请见[此处](https://www.ithome.com/zt)","location":"zt.ts"}' />

所有专题请见[此处](https://www.ithome.com/zt)

## KBS <Site url="world.kbs.co.kr"/>

### News <Site url="world.kbs.co.kr/" size="sm" />

<Route namespace="kbs" :data='{"path":"/news/:category?/:language?","categories":["new-media"],"example":"/kbs/news","parameters":{"category":"Category, can be found in Url as `id`, all by default","language":"Language, see below, e as English by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["world.kbs.co.kr/"],"target":"/news"}],"name":"News","maintainers":["nczitzk"],"url":"world.kbs.co.kr/","description":"| 한국어 | عربي | 中国语 | English | Français | Deutsch | Bahasa Indonesia | 日本語 | Русский | Español | Tiếng Việt |\n  | ------ | ---- | ------ | ------- | -------- | ------- | ---------------- | ------ | ------- | ------- | ---------- |\n  | k      | a    | c      | e       | f        | g       | i                | j      | r       | s       | v          |","location":"news.ts"}' />

| 한국어 | عربي | 中国语 | English | Français | Deutsch | Bahasa Indonesia | 日本語 | Русский | Español | Tiếng Việt |
  | ------ | ---- | ------ | ------- | -------- | ------- | ---------------- | ------ | ------- | ------- | ---------- |
  | k      | a    | c      | e       | f        | g       | i                | j      | r       | s       | v          |

### Today <Site url="world.kbs.co.kr/" size="sm" />

<Route namespace="kbs" :data='{"path":"/today/:language?","categories":["new-media"],"example":"/kbs/today","parameters":{"language":"Language, see below, e as English by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["world.kbs.co.kr/"],"target":"/today"}],"name":"Today","maintainers":["nczitzk"],"url":"world.kbs.co.kr/","description":"| 한국어 | عربي | 中国语 | English | Français | Deutsch | Bahasa Indonesia | 日本語 | Русский | Español | Tiếng Việt |\n  | ------ | ---- | ------ | ------- | -------- | ------- | ---------------- | ------ | ------- | ------- | ---------- |\n  | k      | a    | c      | e       | f        | g       | i                | j      | r       | s       | v          |","location":"today.ts"}' />

| 한국어 | عربي | 中国语 | English | Français | Deutsch | Bahasa Indonesia | 日本語 | Русский | Español | Tiếng Việt |
  | ------ | ---- | ------ | ------- | -------- | ------- | ---------------- | ------ | ------- | ------- | ---------- |
  | k      | a    | c      | e       | f        | g       | i                | j      | r       | s       | v          |

## Kuwait Local <Site url="kuwaitlocal.com"/>

### Categorised News <Site url="kuwaitlocal.com/news/latest" size="sm" />

<Route namespace="kuwaitlocal" :data='{"path":"/:category?","categories":["new-media"],"example":"/kuwaitlocal/article","parameters":{"category":"Category name, can be found in URL, `latest` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["kuwaitlocal.com/news/categories/:category"],"target":"/:category"}],"name":"Categorised News","maintainers":["TonyRL"],"url":"kuwaitlocal.com/news/latest","location":"index.ts"}' />

## LINE <Site url="today.line.me"/>

### TODAY - Channel <Site url="today.line.me" size="sm" />

<Route namespace="line" :data='{"path":"/today/:edition/publisher/:id","categories":["new-media"],"example":"/line/today/th/publisher/101048","parameters":{"edition":"Edition, see table above","id":"Channel ID, can be found in URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["today.line.me/:edition/v2/publisher/:id"]}],"name":"TODAY - Channel","maintainers":["TonyRL"],"location":"publisher.ts"}' />

### TODAY <Site url="today.line.me/" size="sm" />

<Route namespace="line" :data='{"path":"/today/:edition?/:tab?","categories":["new-media"],"example":"/line/today","parameters":{"edition":"Edition, see below, Taiwan by default","tab":"Tag, can be found in URL, `top` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["today.line.me/"]}],"name":"TODAY","maintainers":["nczitzk"],"url":"today.line.me/","description":"Edition\n\n  | Taiwan | Thailand | Hong Kong |\n  | ------ | -------- | --------- |\n  | tw     | th       | hk        |","location":"today.ts"}' />

Edition

  | Taiwan | Thailand | Hong Kong |
  | ------ | -------- | --------- |
  | tw     | th       | hk        |

## Live Universal Awareness Map <Site url="liveuamap.com"/>

### 实时消息 <Site url="liveuamap.com" size="sm" />

<Route namespace="liveuamap" :data='{"path":"/:region?","categories":["new-media"],"example":"/liveuamap","parameters":{"region":"region 热点地区，默认为`ukraine`，其他选项见liveuamap.com的三级域名"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["liveuamap.com/:region*"],"target":"/:region"}],"name":"实时消息","maintainers":["CoderSherlock"],"location":"index.ts"}' />

## LVV2 <Site url="lvv2.com"/>

### 24 小时点击排行 Top 10 <Site url="lvv2.com" size="sm" />

<Route namespace="lvv2" :data='{"path":"/top/:channel/:sort?","categories":["new-media"],"example":"/lvv2/top/sort-score","parameters":{"channel":"频道，见下表","sort":"排序方式，仅得分和24小时榜可选填该参数，见下表"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"24 小时点击排行 Top 10","maintainers":["Fatpandac"],"description":"|   热门   |   最新   |    得分    |   24 小时榜   |\n  | :------: | :------: | :--------: | :-----------: |\n  | sort-hot | sort-new | sort-score | sort-realtime |\n\n  | 排序方式 | 一小时内 | 一天内 | 一个周内 | 一个月内 |\n  | :------: | :------: | :----: | :------: | :------: |\n  |          |  t-hour  |  t-day |  t-week  |  t-month |","location":"top.ts"}' />

|   热门   |   最新   |    得分    |   24 小时榜   |
  | :------: | :------: | :--------: | :-----------: |
  | sort-hot | sort-new | sort-score | sort-realtime |

  | 排序方式 | 一小时内 | 一天内 | 一个周内 | 一个月内 |
  | :------: | :------: | :----: | :------: | :------: |
  |          |  t-hour  |  t-day |  t-week  |  t-month |

### 频道 <Site url="lvv2.com" size="sm" />

<Route namespace="lvv2" :data='{"path":"/news/:channel/:sort?","categories":["new-media"],"example":"/lvv2/news/sort-score","parameters":{"channel":"频道，见下表","sort":"排序方式，仅得分和24小时榜可选填该参数，见下表"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"频道","maintainers":["Fatpandac"],"description":"|   热门   |   最新   |    得分    |   24 小时榜   |\n  | :------: | :------: | :--------: | :-----------: |\n  | sort-hot | sort-new | sort-score | sort-realtime |\n\n  | 排序方式 | 一小时内 | 一天内 | 一个周内 | 一个月内 |\n  | :------: | :------: | :----: | :------: | :------: |\n  |          |  t-hour  |  t-day |  t-week  |  t-month |","location":"news.ts"}' />

|   热门   |   最新   |    得分    |   24 小时榜   |
  | :------: | :------: | :--------: | :-----------: |
  | sort-hot | sort-new | sort-score | sort-realtime |

  | 排序方式 | 一小时内 | 一天内 | 一个周内 | 一个月内 |
  | :------: | :------: | :----: | :------: | :------: |
  |          |  t-hour  |  t-day |  t-week  |  t-month |

## Macfilos <Site url="macfilos.com"/>

### Blog <Site url="macfilos.com/blog" size="sm" />

<Route namespace="macfilos" :data='{"path":"/blog","categories":["new-media"],"example":"/macfilos/blog","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["macfilos.com/blog","macfilos.com/"]}],"name":"Blog","maintainers":["nczitzk"],"url":"macfilos.com/blog","location":"blog.ts"}' />

## Mirror <Site url="mirror.xyz"/>

### User <Site url="mirror.xyz" size="sm" />

<Route namespace="mirror" :data='{"path":"/:id","categories":["new-media"],"example":"/mirror/tingfei.eth","parameters":{"id":"user id"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"User","maintainers":["fifteen42","rde9","nczitzk"],"location":"index.ts"}' />

## MyGoPen <Site url="mygopen.com"/>

### 分類 <Site url="mygopen.com" size="sm" />

<Route namespace="mygopen" :data='{"path":"/:label?","categories":["new-media"],"example":"/mygopen","parameters":{"label":"分類，见下表，默认为首页"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["mygopen.com/search/label/:label","mygopen.com/"]}],"name":"分類","maintainers":["nczitzk"],"description":"| 謠言 | 詐騙 | 真實資訊 | 教學 |\n  | ---- | ---- | -------- | ---- |","location":"index.ts"}' />

| 謠言 | 詐騙 | 真實資訊 | 教學 |
  | ---- | ---- | -------- | ---- |

## Nautilus <Site url="nautil.us"/>

### Topics <Site url="nautil.us" size="sm" />

<Route namespace="nautil" :data='{"path":"/topic/:tid","categories":["new-media"],"example":"/nautil/topic/arts","parameters":{"tid":"topic"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["nautil.us/topics/:tid"]}],"name":"Topics","maintainers":["emdoe"],"description":"This route provides a flexible plan with full text content to subscribe specific topic(s) on the Nautilus. Please visit [nautil.us](https://nautil.us) and click `Topics` to acquire whole topic list.","location":"topics.ts"}' />

This route provides a flexible plan with full text content to subscribe specific topic(s) on the Nautilus. Please visit [nautil.us](https://nautil.us) and click `Topics` to acquire whole topic list.

## NGOCN <Site url="ngocn2.org"/>

### 首页 <Site url="ngocn2.org/" size="sm" />

<Route namespace="ngocn2" :data='{"path":"/:category?","categories":["new-media"],"example":"/ngocn2","parameters":{"category":"分类，见下表，默认为所有文章"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["ngocn2.org/"]}],"name":"首页","maintainers":["nczitzk"],"url":"ngocn2.org/","description":"| 所有文章 | 早报        | 热点     |\n  | -------- | ----------- | -------- |\n  | article  | daily-brief | trending |","location":"index.ts"}' />

| 所有文章 | 早报        | 热点     |
  | -------- | ----------- | -------- |
  | article  | daily-brief | trending |

## NL Times <Site url="nltimes.nl"/>

### News <Site url="nltimes.nl" size="sm" />

<Route namespace="nltimes" :data='{"path":"/news/:category?","categories":["new-media"],"example":"/nltimes/news/top-stories","parameters":{"category":"category"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["nltimes.nl/categories/:category"],"target":"/news/:category"}],"name":"News","maintainers":["Hivol"],"description":"| Top Stories (default) | Health | Crime | Politics | Business | Tech | Culture | Sports | Weird | 1-1-2 |\n  | --------------------- | ------ | ----- | -------- | -------- | ---- | ------- | ------ | ----- | ----- |\n  | top-stories           | health | crime | politics | business | tech | culture | sports | weird | 1-1-2 |","location":"news.ts"}' />

| Top Stories (default) | Health | Crime | Politics | Business | Tech | Culture | Sports | Weird | 1-1-2 |
  | --------------------- | ------ | ----- | -------- | -------- | ---- | ------- | ------ | ----- | ----- |
  | top-stories           | health | crime | politics | business | tech | culture | sports | weird | 1-1-2 |

## Odaily 星球日报 <Site url="odaily.news"/>

### 活动 <Site url="0daily.com/activityPage" size="sm" />

<Route namespace="odaily" :data='{"path":"/activity","categories":["new-media"],"example":"/odaily/activity","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["0daily.com/activityPage","0daily.com/"]}],"name":"活动","maintainers":["nczitzk"],"url":"0daily.com/activityPage","location":"activity.ts"}' />

### 快讯 <Site url="0daily.com/newsflash" size="sm" />

<Route namespace="odaily" :data='{"path":"/newsflash","categories":["new-media"],"example":"/odaily/newsflash","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["0daily.com/newsflash","0daily.com/"]}],"name":"快讯","maintainers":["nczitzk"],"url":"0daily.com/newsflash","location":"newsflash.ts"}' />

### 搜索快讯 <Site url="odaily.news" size="sm" />

<Route namespace="odaily" :data='{"path":"/search/news/:keyword","categories":["new-media"],"example":"/odaily/search/news/RSS3","parameters":{"keyword":"搜索关键字"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["0daily.com/search/:keyword"]}],"name":"搜索快讯","maintainers":["snowraincloud"],"location":"search-news.ts"}' />

### 文章 <Site url="0daily.com/" size="sm" />

<Route namespace="odaily" :data='{"path":"/:id?","categories":["new-media"],"example":"/odaily","parameters":{"id":"id，见下表，默认为最新"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["0daily.com/"]}],"name":"文章","maintainers":["nczitzk"],"url":"0daily.com/","description":"| 最新 | 新品 | DeFi | NFT | 存储 | 波卡 | 行情 | 活动 |\n  | ---- | ---- | ---- | --- | ---- | ---- | ---- | ---- |\n  | 280  | 333  | 331  | 334 | 332  | 330  | 297  | 296  |","location":"post.ts"}' />

| 最新 | 新品 | DeFi | NFT | 存储 | 波卡 | 行情 | 活动 |
  | ---- | ---- | ---- | --- | ---- | ---- | ---- | ---- |
  | 280  | 333  | 331  | 334 | 332  | 330  | 297  | 296  |

### 用户文章 <Site url="odaily.news" size="sm" />

<Route namespace="odaily" :data='{"path":"/user/:id","categories":["new-media"],"example":"/odaily/user/2147486902","parameters":{"id":"用户 id，可在用户页地址栏中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["0daily.com/user/:id","0daily.com/"]}],"name":"用户文章","maintainers":["nczitzk"],"location":"user.ts"}' />

## Onet <Site url="wiadomosci.onet.pl"/>

### News <Site url="wiadomosci.onet.pl/" size="sm" />

<Route namespace="onet" :data='{"path":"/news","categories":["new-media"],"example":"/onet/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["wiadomosci.onet.pl/"]}],"name":"News","maintainers":["Vegann"],"url":"wiadomosci.onet.pl/","description":"This route provides a better reading experience (full text articles) over the official one for `https://wiadomosci.onet.pl`.","location":"news.ts"}' />

This route provides a better reading experience (full text articles) over the official one for `https://wiadomosci.onet.pl`.

## OpenAI <Site url="openai.com"/>

### Blog <Site url="openai.com" size="sm" />

<Route namespace="openai" :data='{"path":"/blog/:tag?","categories":["new-media"],"example":"/openai/blog","parameters":{"tag":"Tag, see below, All by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Blog","maintainers":["StevenRCE0","nczitzk"],"description":"| All | Announcements | Events | Safety & Alignment | Community | Product | Culture & Careers   | Milestones | Research |\n  | --- | ------------- | ------ | ------------------ | --------- | ------- | ------------------- | ---------- | -------- |\n  |     | announcements | events | safety-alignment   | community | product | culture-and-careers | milestones | research |","location":"blog.ts"}' />

| All | Announcements | Events | Safety & Alignment | Community | Product | Culture & Careers   | Milestones | Research |
  | --- | ------------- | ------ | ------------------ | --------- | ------- | ------------------- | ---------- | -------- |
  |     | announcements | events | safety-alignment   | community | product | culture-and-careers | milestones | research |

### ChatGPT - Release Notes <Site url="openai.com" size="sm" />

<Route namespace="openai" :data='{"path":"/chatgpt/release-notes","categories":["new-media"],"example":"/openai/chatgpt/release-notes","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"ChatGPT - Release Notes","maintainers":[],"location":"chatgpt.ts"}' />

### Research <Site url="openai.com" size="sm" />

<Route namespace="openai" :data='{"path":"/research","categories":["new-media"],"example":"/openai/research","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Research","maintainers":["yuguorui"],"location":"research.ts"}' />

## PANews <Site url="panewslab.com"/>

### 快讯 <Site url="panewslab.com/" size="sm" />

<Route namespace="panewslab" :data='{"path":["/news","/newsflash"],"categories":["new-media"],"example":"/panewslab/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["panewslab.com/"]}],"name":"快讯","maintainers":["nczitzk"],"url":"panewslab.com/","location":"news.ts"}' />

### 快讯 <Site url="panewslab.com/" size="sm" />

<Route namespace="panewslab" :data='{"path":["/news","/newsflash"],"categories":["new-media"],"example":"/panewslab/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["panewslab.com/"]}],"name":"快讯","maintainers":["nczitzk"],"url":"panewslab.com/","location":"news.ts"}' />

### 深度 <Site url="panewslab.com/" size="sm" />

<Route namespace="panewslab" :data='{"path":"/:category?","categories":["new-media"],"example":"/panewslab","parameters":{"category":"分类，见下表，默认为精选"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["panewslab.com/"]}],"name":"深度","maintainers":["nczitzk"],"url":"panewslab.com/","description":"| 精选 | 链游 | 元宇宙 | NFT | DeFi | 监管 | 央行数字货币 | 波卡 | Layer 2 | DAO | 融资 | 活动 |\n  | ---- | ---- | ------ | --- | ---- | ---- | ------------ | ---- | ------- | --- | ---- | ---- |","location":"index.ts"}' />

| 精选 | 链游 | 元宇宙 | NFT | DeFi | 监管 | 央行数字货币 | 波卡 | Layer 2 | DAO | 融资 | 活动 |
  | ---- | ---- | ------ | --- | ---- | ---- | ------------ | ---- | ------- | --- | ---- | ---- |

### 专栏 <Site url="panewslab.com/" size="sm" />

<Route namespace="panewslab" :data='{"path":["/author/:id","/column/:id"],"categories":["new-media"],"example":"/panewslab/author/166","parameters":{"id":"专栏 id，可在地址栏 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["panewslab.com/"]}],"name":"专栏","maintainers":["nczitzk"],"url":"panewslab.com/","location":"author.ts"}' />

### 专栏 <Site url="panewslab.com/" size="sm" />

<Route namespace="panewslab" :data='{"path":["/author/:id","/column/:id"],"categories":["new-media"],"example":"/panewslab/author/166","parameters":{"id":"专栏 id，可在地址栏 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["panewslab.com/"]}],"name":"专栏","maintainers":["nczitzk"],"url":"panewslab.com/","location":"author.ts"}' />

### 专题 <Site url="panewslab.com/" size="sm" />

<Route namespace="panewslab" :data='{"path":"/topic/:id","categories":["new-media"],"example":"/panewslab/topic/1629365774078402","parameters":{"id":"专题 id，可在地址栏 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["panewslab.com/"]}],"name":"专题","maintainers":["nczitzk"],"url":"panewslab.com/","location":"topic.ts"}' />

## PeoPo 公民新聞 <Site url="peopo.org"/>

### 新聞分類 <Site url="peopo.org" size="sm" />

<Route namespace="peopo" :data='{"path":"/topic/:topicId?","categories":["new-media"],"example":"/peopo/topic/159","parameters":{"topicId":"分類 ID，見下表，默認為社會關懷"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["peopo.org/topic/:topicId"],"target":"/topic/:topicId"}],"name":"新聞分類","maintainers":[],"description":"| 分類     | ID  |\n  | -------- | --- |\n  | 社會關懷 | 159 |\n  | 生態環保 | 113 |\n  | 文化古蹟 | 143 |\n  | 社區改造 | 160 |\n  | 教育學習 | 161 |\n  | 農業     | 163 |\n  | 生活休閒 | 162 |\n  | 媒體觀察 | 164 |\n  | 運動科技 | 165 |\n  | 政治經濟 | 166 |\n  | 北台灣   | 223 |\n  | 中台灣   | 224 |\n  | 南台灣   | 225 |\n  | 東台灣   | 226 |\n  | 校園中心 | 167 |\n  | 原住民族 | 227 |\n  | 天然災害 | 168 |","location":"topic.ts"}' />

| 分類     | ID  |
  | -------- | --- |
  | 社會關懷 | 159 |
  | 生態環保 | 113 |
  | 文化古蹟 | 143 |
  | 社區改造 | 160 |
  | 教育學習 | 161 |
  | 農業     | 163 |
  | 生活休閒 | 162 |
  | 媒體觀察 | 164 |
  | 運動科技 | 165 |
  | 政治經濟 | 166 |
  | 北台灣   | 223 |
  | 中台灣   | 224 |
  | 南台灣   | 225 |
  | 東台灣   | 226 |
  | 校園中心 | 167 |
  | 原住民族 | 227 |
  | 天然災害 | 168 |

## Phoronix <Site url="phoronix.com"/>

### News & Reviews <Site url="phoronix.com" size="sm" />

<Route namespace="phoronix" :data='{"path":"/:category?/:topic?","categories":["new-media"],"example":"/phoronix/linux/KDE","parameters":{"category":"Category","topic":"Topic. You may find available parameters from their navigator links. E.g. to subscribe to `https://www.phoronix.com/reviews/Operating+Systems`, fill in the path `/phoronix/reviews/Operating+Systems`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["phoronix.com/:category?/:topic?"]}],"name":"News & Reviews","maintainers":["oppliate","Rongronggg9"],"location":"index.ts"}' />

## QuestMobile <Site url="questmobile.com.cn"/>

### 行业研究报告 <Site url="questmobile.com.cn" size="sm" />

<Route namespace="questmobile" :data='{"path":"/report/:industry?/:label?","categories":["new-media"],"example":"/questmobile/report","parameters":{"industry":"行业，见下表，默认为 `-1`，即全部行业","label":"标签，见下表，默认为 `-1`，即全部标签"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"行业研究报告","maintainers":["nczitzk"],"description":":::tip\n  若订阅行业 [互联网行业](https://www.questmobile.com.cn/research/reports/1/-1)，网址为 `https://www.questmobile.com.cn/research/reports/1/-1`\n  参数 industry 为 `互联网行业` 或 `1`，此时路由为 [`/questmobile/report/互联网行业`](https://rsshub.app/questmobile/report/互联网行业) 或 [`/questmobile/report/1/-1`](https://rsshub.app/questmobile/report/1/-1)。\n\n  若订阅标签 [榜单](https://www.questmobile.com.cn/research/reports/-1/11)，网址为 `https://www.questmobile.com.cn/research/reports/-1/11`\n  参数 label 为 `榜单` 或 `11`，此时路由为 [`/questmobile/report/榜单`](https://rsshub.app/questmobile/report/榜单) 或 [`/questmobile/report/-1/11`](https://rsshub.app/questmobile/report/-1/11)。\n\n  若订阅行业和标签 [品牌领域 - 互联网经济](https://www.questmobile.com.cn/research/reports/2/1)，网址为 `https://www.questmobile.com.cn/research/reports/2/1`\n  参数 industry 为 `品牌领域` 或 `2`，参数 label 为 `互联网经济` 或 `1`，此时路由为 [`/questmobile/report/品牌领域/互联网经济`](https://rsshub.app/questmobile/report/品牌领域/互联网经济) 或 [`/questmobile/report/2/1`](https://rsshub.app/questmobile/report/2/1)，甚至 [`/questmobile/report/品牌领域/1`](https://rsshub.app/questmobile/report/品牌领域/1)。\n  :::\n\n  <details>\n    <summary>全部行业和标签</summary>\n\n    #### 行业\n\n    | 互联网行业 | 移动社交 | 移动视频 | 移动购物 | 系统工具 |\n    | ---------- | -------- | -------- | -------- | -------- |\n    | 1          | 1001     | 1002     | 1003     | 1004     |\n\n    | 出行服务 | 金融理财 | 生活服务 | 移动音乐 | 新闻资讯 |\n    | -------- | -------- | -------- | -------- | -------- |\n    | 1005     | 1006     | 1007     | 1008     | 1009     |\n\n    | 办公商务 | 手机游戏 | 实用工具 | 数字阅读 | 教育学习 |\n    | -------- | -------- | -------- | -------- | -------- |\n    | 1010     | 1011     | 1012     | 1013     | 1014     |\n\n    | 汽车服务 | 拍摄美化 | 智能设备 | 旅游服务 | 健康美容 |\n    | -------- | -------- | -------- | -------- | -------- |\n    | 1015     | 1016     | 1017     | 1018     | 1020     |\n\n    | 育儿母婴 | 主题美化 | 医疗服务 | 品牌领域 | 美妆品牌 |\n    | -------- | -------- | -------- | -------- | -------- |\n    | 1022     | 1023     | 1024     | 2        | 2001     |\n\n    | 母婴品牌 | 家电品牌 | 食品饮料品牌 | 汽车品牌 | 服饰箱包品牌 |\n    | -------- | -------- | ------------ | -------- | ------------ |\n    | 2002     | 2003     | 2004         | 2005     | 2006         |\n\n    #### 标签\n\n    | 互联网经济 | 圈层经济 | 粉丝经济 | 银发经济 | 儿童经济 |\n    | ---------- | -------- | -------- | -------- | -------- |\n    | 1          | 1001     | 1002     | 1004     | 1005     |\n\n    | 萌宠经济 | 她经济 | 他经济 | 泛娱乐经济 | 下沉市场经济 |\n    | -------- | ------ | ------ | ---------- | ------------ |\n    | 1007     | 1009   | 1010   | 1011       | 1012         |\n\n    | 内容经济 | 订阅经济 | 会员经济 | 居家经济 | 到家经济 |\n    | -------- | -------- | -------- | -------- | -------- |\n    | 1013     | 1014     | 1015     | 1016     | 1017     |\n\n    | 颜值经济 | 闲置经济 | 旅游经济            | 人群洞察 | 00 后 |\n    | -------- | -------- | ------------------- | -------- | ----- |\n    | 1018     | 1020     | 1622842051677753346 | 2        | 2002  |\n\n    | Z 世代 | 银发族 | 宝妈宝爸 | 萌宠人群 | 运动达人 |\n    | ------ | ------ | -------- | -------- | -------- |\n    | 2003   | 2004   | 2005     | 2007     | 2008     |\n\n    | 女性消费 | 男性消费 | 游戏人群 | 二次元 | 新中产 |\n    | -------- | -------- | -------- | ------ | ------ |\n    | 2009     | 2010     | 2012     | 2013   | 2014   |\n\n    | 下沉市场用户 | 大学生 | 数字化营销 | 广告效果 | 品牌营销 |\n    | ------------ | ------ | ---------- | -------- | -------- |\n    | 2018         | 2022   | 3          | 3001     | 3002     |\n\n    | 全域营销 | 私域流量 | 新媒体营销 | KOL 生态 | 内容营销 |\n    | -------- | -------- | ---------- | -------- | -------- |\n    | 3003     | 3004     | 3005       | 3006     | 3008     |\n\n    | 直播电商 | 短视频带货 | 娱乐营销            | 营销热点 | 双 11 电商大促 |\n    | -------- | ---------- | ------------------- | -------- | -------------- |\n    | 3009     | 3010       | 1630464311158738945 | 4        | 4001           |\n\n    | 618 电商大促 | 春节营销 | 五一假期营销 | 热点事件盘点 | 消费热点 |\n    | ------------ | -------- | ------------ | ------------ | -------- |\n    | 4002         | 4003     | 4004         | 4007         | 5        |\n\n    | 时尚品牌 | 连锁餐饮 | 新式茶饮 | 智能家电 | 国潮品牌 |\n    | -------- | -------- | -------- | -------- | -------- |\n    | 5001     | 5002     | 5003     | 5004     | 5007     |\n\n    | 白酒品牌            | 精益运营 | 媒介策略 | 用户争夺 | 精细化运营 |\n    | ------------------- | -------- | -------- | -------- | ---------- |\n    | 1622841828310093825 | 6        | 6001     | 6002     | 6003       |\n\n    | 用户分层 | 增长黑马 | 社交裂变 | 新兴领域 | 新能源汽车 |\n    | -------- | -------- | -------- | -------- | ---------- |\n    | 6004     | 6005     | 6007     | 7        | 7001       |\n\n    | 智能汽车 | 新消费 | AIoT | 产业互联网 | AIGC                |\n    | -------- | ------ | ---- | ---------- | ------------------- |\n    | 7002     | 7003   | 7004 | 7005       | 1645677998450511873 |\n\n    | OTT 应用            | 智能电视            | 全景数据 | 全景生态 | 微信小程序 |\n    | ------------------- | ------------------- | -------- | -------- | ---------- |\n    | 1676063510499528705 | 1676063630293045249 | 8        | 8001     | 8002       |\n\n    | 支付宝小程序 | 百度智能小程序 | 企业流量            | 抖音小程序          | 手机终端 |\n    | ------------ | -------------- | ------------------- | ------------------- | -------- |\n    | 8003         | 8004           | 1671052842096496642 | 1676063017220018177 | 9        |\n\n    | 智能终端 | 国产终端 | 5G 手机 | 盘点 | 季度报告 |\n    | -------- | -------- | ------- | ---- | -------- |\n    | 9001     | 9002     | 9003    | 10   | 10001    |\n  </details>","location":"report.ts"}' />

:::tip
  若订阅行业 [互联网行业](https://www.questmobile.com.cn/research/reports/1/-1)，网址为 `https://www.questmobile.com.cn/research/reports/1/-1`
  参数 industry 为 `互联网行业` 或 `1`，此时路由为 [`/questmobile/report/互联网行业`](https://rsshub.app/questmobile/report/互联网行业) 或 [`/questmobile/report/1/-1`](https://rsshub.app/questmobile/report/1/-1)。

  若订阅标签 [榜单](https://www.questmobile.com.cn/research/reports/-1/11)，网址为 `https://www.questmobile.com.cn/research/reports/-1/11`
  参数 label 为 `榜单` 或 `11`，此时路由为 [`/questmobile/report/榜单`](https://rsshub.app/questmobile/report/榜单) 或 [`/questmobile/report/-1/11`](https://rsshub.app/questmobile/report/-1/11)。

  若订阅行业和标签 [品牌领域 - 互联网经济](https://www.questmobile.com.cn/research/reports/2/1)，网址为 `https://www.questmobile.com.cn/research/reports/2/1`
  参数 industry 为 `品牌领域` 或 `2`，参数 label 为 `互联网经济` 或 `1`，此时路由为 [`/questmobile/report/品牌领域/互联网经济`](https://rsshub.app/questmobile/report/品牌领域/互联网经济) 或 [`/questmobile/report/2/1`](https://rsshub.app/questmobile/report/2/1)，甚至 [`/questmobile/report/品牌领域/1`](https://rsshub.app/questmobile/report/品牌领域/1)。
  :::

  <details>
    <summary>全部行业和标签</summary>

    #### 行业

    | 互联网行业 | 移动社交 | 移动视频 | 移动购物 | 系统工具 |
    | ---------- | -------- | -------- | -------- | -------- |
    | 1          | 1001     | 1002     | 1003     | 1004     |

    | 出行服务 | 金融理财 | 生活服务 | 移动音乐 | 新闻资讯 |
    | -------- | -------- | -------- | -------- | -------- |
    | 1005     | 1006     | 1007     | 1008     | 1009     |

    | 办公商务 | 手机游戏 | 实用工具 | 数字阅读 | 教育学习 |
    | -------- | -------- | -------- | -------- | -------- |
    | 1010     | 1011     | 1012     | 1013     | 1014     |

    | 汽车服务 | 拍摄美化 | 智能设备 | 旅游服务 | 健康美容 |
    | -------- | -------- | -------- | -------- | -------- |
    | 1015     | 1016     | 1017     | 1018     | 1020     |

    | 育儿母婴 | 主题美化 | 医疗服务 | 品牌领域 | 美妆品牌 |
    | -------- | -------- | -------- | -------- | -------- |
    | 1022     | 1023     | 1024     | 2        | 2001     |

    | 母婴品牌 | 家电品牌 | 食品饮料品牌 | 汽车品牌 | 服饰箱包品牌 |
    | -------- | -------- | ------------ | -------- | ------------ |
    | 2002     | 2003     | 2004         | 2005     | 2006         |

    #### 标签

    | 互联网经济 | 圈层经济 | 粉丝经济 | 银发经济 | 儿童经济 |
    | ---------- | -------- | -------- | -------- | -------- |
    | 1          | 1001     | 1002     | 1004     | 1005     |

    | 萌宠经济 | 她经济 | 他经济 | 泛娱乐经济 | 下沉市场经济 |
    | -------- | ------ | ------ | ---------- | ------------ |
    | 1007     | 1009   | 1010   | 1011       | 1012         |

    | 内容经济 | 订阅经济 | 会员经济 | 居家经济 | 到家经济 |
    | -------- | -------- | -------- | -------- | -------- |
    | 1013     | 1014     | 1015     | 1016     | 1017     |

    | 颜值经济 | 闲置经济 | 旅游经济            | 人群洞察 | 00 后 |
    | -------- | -------- | ------------------- | -------- | ----- |
    | 1018     | 1020     | 1622842051677753346 | 2        | 2002  |

    | Z 世代 | 银发族 | 宝妈宝爸 | 萌宠人群 | 运动达人 |
    | ------ | ------ | -------- | -------- | -------- |
    | 2003   | 2004   | 2005     | 2007     | 2008     |

    | 女性消费 | 男性消费 | 游戏人群 | 二次元 | 新中产 |
    | -------- | -------- | -------- | ------ | ------ |
    | 2009     | 2010     | 2012     | 2013   | 2014   |

    | 下沉市场用户 | 大学生 | 数字化营销 | 广告效果 | 品牌营销 |
    | ------------ | ------ | ---------- | -------- | -------- |
    | 2018         | 2022   | 3          | 3001     | 3002     |

    | 全域营销 | 私域流量 | 新媒体营销 | KOL 生态 | 内容营销 |
    | -------- | -------- | ---------- | -------- | -------- |
    | 3003     | 3004     | 3005       | 3006     | 3008     |

    | 直播电商 | 短视频带货 | 娱乐营销            | 营销热点 | 双 11 电商大促 |
    | -------- | ---------- | ------------------- | -------- | -------------- |
    | 3009     | 3010       | 1630464311158738945 | 4        | 4001           |

    | 618 电商大促 | 春节营销 | 五一假期营销 | 热点事件盘点 | 消费热点 |
    | ------------ | -------- | ------------ | ------------ | -------- |
    | 4002         | 4003     | 4004         | 4007         | 5        |

    | 时尚品牌 | 连锁餐饮 | 新式茶饮 | 智能家电 | 国潮品牌 |
    | -------- | -------- | -------- | -------- | -------- |
    | 5001     | 5002     | 5003     | 5004     | 5007     |

    | 白酒品牌            | 精益运营 | 媒介策略 | 用户争夺 | 精细化运营 |
    | ------------------- | -------- | -------- | -------- | ---------- |
    | 1622841828310093825 | 6        | 6001     | 6002     | 6003       |

    | 用户分层 | 增长黑马 | 社交裂变 | 新兴领域 | 新能源汽车 |
    | -------- | -------- | -------- | -------- | ---------- |
    | 6004     | 6005     | 6007     | 7        | 7001       |

    | 智能汽车 | 新消费 | AIoT | 产业互联网 | AIGC                |
    | -------- | ------ | ---- | ---------- | ------------------- |
    | 7002     | 7003   | 7004 | 7005       | 1645677998450511873 |

    | OTT 应用            | 智能电视            | 全景数据 | 全景生态 | 微信小程序 |
    | ------------------- | ------------------- | -------- | -------- | ---------- |
    | 1676063510499528705 | 1676063630293045249 | 8        | 8001     | 8002       |

    | 支付宝小程序 | 百度智能小程序 | 企业流量            | 抖音小程序          | 手机终端 |
    | ------------ | -------------- | ------------------- | ------------------- | -------- |
    | 8003         | 8004           | 1671052842096496642 | 1676063017220018177 | 9        |

    | 智能终端 | 国产终端 | 5G 手机 | 盘点 | 季度报告 |
    | -------- | -------- | ------- | ---- | -------- |
    | 9001     | 9002     | 9003    | 10   | 10001    |
  </details>

## Radio-Canada.ca <Site url="ici.radio-canada.ca"/>

### Latest News <Site url="ici.radio-canada.ca" size="sm" />

<Route namespace="radio-canada" :data='{"path":"/latest/:language?","categories":["new-media"],"example":"/radio-canada/latest","parameters":{"language":"Language, see below, English by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["ici.radio-canada.ca/rci/:lang","ici.radio-canada.ca/"]}],"name":"Latest News","maintainers":["nczitzk"],"description":"| Français | English | Español | 简体中文 | 繁體中文 | العربية | ਪੰਜਾਬੀ | Tagalog |\n  | -------- | ------- | ------- | -------- | -------- | ------- | --- | ------- |\n  | fr       | en      | es      | zh-hans  | zh-hant  | ar      | pa  | tl      |","location":"latest.ts"}' />

| Français | English | Español | 简体中文 | 繁體中文 | العربية | ਪੰਜਾਬੀ | Tagalog |
  | -------- | ------- | ------- | -------- | -------- | ------- | --- | ------- |
  | fr       | en      | es      | zh-hans  | zh-hant  | ar      | pa  | tl      |

## Readhub <Site url="readhub.cn"/>

### 分类 <Site url="readhub.cn" size="sm" />

<Route namespace="readhub" :data='{"path":"/:category?","categories":["new-media"],"example":"/readhub","parameters":{"category":"分类，见下表，默认为热门话题"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"分类","maintainers":["WhiteWorld","nczitzk","Fatpandac"],"description":"| 热门话题 | 科技动态 | 医疗产业 | 财经快讯           |\n  | -------- | -------- | -------- | ------------------ |\n  |          | news     | medical  | financial_express |","location":"index.ts"}' />

| 热门话题 | 科技动态 | 医疗产业 | 财经快讯           |
  | -------- | -------- | -------- | ------------------ |
  |          | news     | medical  | financial_express |

### 每日早报 <Site url="readhub.cn/daily" size="sm" />

<Route namespace="readhub" :data='{"path":"/daily","categories":["new-media"],"example":"/readhub/daily","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["readhub.cn/daily"]}],"name":"每日早报","maintainers":["nczitzk","fashioncj"],"url":"readhub.cn/daily","location":"daily.ts"}' />

## Sakamichi Series 坂道系列官网资讯 <Site url="hinatazaka46.com"/>

### Hinatazaka46 Blog 日向坂 46 博客 <Site url="hinatazaka46.com" size="sm" />

<Route namespace="hinatazaka46" :data='{"path":"/blog/:id?/:page?","categories":["new-media"],"example":"/hinatazaka46/blog","parameters":{"id":"Member ID, see below, `all` by default","page":"Page, `0` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Hinatazaka46 Blog 日向坂 46 博客","maintainers":[],"description":"Member ID\n\n  | Member ID | Name         |\n  | --------- | ------------ |\n  | 2000      | 四期生リレー |\n  | 36        | 渡辺 莉奈    |\n  | 35        | 山下 葉留花  |\n  | 34        | 宮地 すみれ  |\n  | 33        | 藤嶌 果歩    |\n  | 32        | 平岡 海月    |\n  | 31        | 平尾 帆夏    |\n  | 30        | 竹内 希来里  |\n  | 29        | 正源司 陽子  |\n  | 28        | 清水 理央    |\n  | 27        | 小西 夏菜実  |\n  | 26        | 岸 帆夏      |\n  | 25        | 石塚 瑶季    |\n  | 24        | 山口 陽世    |\n  | 23        | 森本 茉莉    |\n  | 22        | 髙橋 未来虹  |\n  | 21        | 上村 ひなの  |\n  | 18        | 松田 好花    |\n  | 17        | 濱岸 ひより  |\n  | 16        | 丹生 明里    |\n  | 15        | 富田 鈴花    |\n  | 14        | 小坂 菜緒    |\n  | 13        | 河田 陽菜    |\n  | 12        | 金村 美玖    |\n  | 11        | 東村 芽依    |\n  | 10        | 高本 彩花    |\n  | 9         | 高瀬 愛奈    |\n  | 8         | 佐々木 美玲  |\n  | 7         | 佐々木 久美  |\n  | 6         | 齊藤 京子    |\n  | 5         | 加藤 史帆    |\n  | 4         | 影山 優佳    |\n  | 2         | 潮 紗理菜    |","location":"blog.ts"}' />

Member ID

  | Member ID | Name         |
  | --------- | ------------ |
  | 2000      | 四期生リレー |
  | 36        | 渡辺 莉奈    |
  | 35        | 山下 葉留花  |
  | 34        | 宮地 すみれ  |
  | 33        | 藤嶌 果歩    |
  | 32        | 平岡 海月    |
  | 31        | 平尾 帆夏    |
  | 30        | 竹内 希来里  |
  | 29        | 正源司 陽子  |
  | 28        | 清水 理央    |
  | 27        | 小西 夏菜実  |
  | 26        | 岸 帆夏      |
  | 25        | 石塚 瑶季    |
  | 24        | 山口 陽世    |
  | 23        | 森本 茉莉    |
  | 22        | 髙橋 未来虹  |
  | 21        | 上村 ひなの  |
  | 18        | 松田 好花    |
  | 17        | 濱岸 ひより  |
  | 16        | 丹生 明里    |
  | 15        | 富田 鈴花    |
  | 14        | 小坂 菜緒    |
  | 13        | 河田 陽菜    |
  | 12        | 金村 美玖    |
  | 11        | 東村 芽依    |
  | 10        | 高本 彩花    |
  | 9         | 高瀬 愛奈    |
  | 8         | 佐々木 美玲  |
  | 7         | 佐々木 久美  |
  | 6         | 齊藤 京子    |
  | 5         | 加藤 史帆    |
  | 4         | 影山 優佳    |
  | 2         | 潮 紗理菜    |

### Hinatazaka46 News 日向坂 46 新闻 <Site url="hinatazaka46.com/s/official/news/list" size="sm" />

<Route namespace="hinatazaka46" :data='{"path":"/news","categories":["new-media"],"example":"/hinatazaka46/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["hinatazaka46.com/s/official/news/list","hinatazaka46.com/"]}],"name":"Hinatazaka46 News 日向坂 46 新闻","maintainers":["crispgm","akashigakki"],"url":"hinatazaka46.com/s/official/news/list","location":"news.ts"}' />

## Sakamichi Series 坂道系列官网资讯 <Site url="news.nogizaka46.com"/>

### Nogizaka46 Blog 乃木坂 46 博客 <Site url="blog.nogizaka46.com/s/n46/diary/MEMBER" size="sm" />

<Route namespace="nogizaka46" :data='{"path":"/blog/:id?","categories":["new-media"],"example":"/nogizaka46/blog","parameters":{"id":"Member ID, see below, `all` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["blog.nogizaka46.com/s/n46/diary/MEMBER"],"target":"/blog"}],"name":"Nogizaka46 Blog 乃木坂 46 博客","maintainers":["Kasper4649","akashigakki"],"url":"blog.nogizaka46.com/s/n46/diary/MEMBER","description":"Member ID\n\n  | Member ID | Name                  |\n  | --------- | --------------------- |\n  | 55401     | 岡本 姫奈             |\n  | 55400     | 川﨑 桜               |\n  | 55397     | 池田 瑛紗             |\n  | 55396     | 五百城 茉央           |\n  | 55395     | 中西 アルノ           |\n  | 55394     | 奥田 いろは           |\n  | 55393     | 冨里 奈央             |\n  | 55392     | 小川 彩               |\n  | 55391     | 菅原 咲月             |\n  | 55390     | 一ノ瀬 美空           |\n  | 55389     | 井上 和               |\n  | 55387     | 弓木 奈於             |\n  | 55386     | 松尾 美佑             |\n  | 55385     | 林 瑠奈               |\n  | 55384     | 佐藤 璃果             |\n  | 55383     | 黒見 明香             |\n  | 48014     | 清宮 レイ             |\n  | 48012     | 北川 悠理             |\n  | 48010     | 金川 紗耶             |\n  | 48019     | 矢久保 美緒           |\n  | 48018     | 早川 聖来             |\n  | 48009     | 掛橋 沙耶香           |\n  | 48008     | 賀喜 遥香             |\n  | 48017     | 筒井 あやめ           |\n  | 48015     | 田村 真佑             |\n  | 48013     | 柴田 柚菜             |\n  | 48006     | 遠藤 さくら           |\n  | 36760     | 与田 祐希             |\n  | 36759     | 吉田 綾乃クリスティー |\n  | 36758     | 山下 美月             |\n  | 36757     | 向井 葉月             |\n  | 36756     | 中村 麗乃             |\n  | 36755     | 佐藤 楓               |\n  | 36754     | 阪口 珠美             |\n  | 36753     | 久保 史緒里           |\n  | 36752     | 大園 桃子             |\n  | 36751     | 梅澤 美波             |\n  | 36750     | 岩本 蓮加             |\n  | 36749     | 伊藤 理々杏           |\n  | 264       | 齋藤 飛鳥             |","location":"blog.ts"}' />

Member ID

  | Member ID | Name                  |
  | --------- | --------------------- |
  | 55401     | 岡本 姫奈             |
  | 55400     | 川﨑 桜               |
  | 55397     | 池田 瑛紗             |
  | 55396     | 五百城 茉央           |
  | 55395     | 中西 アルノ           |
  | 55394     | 奥田 いろは           |
  | 55393     | 冨里 奈央             |
  | 55392     | 小川 彩               |
  | 55391     | 菅原 咲月             |
  | 55390     | 一ノ瀬 美空           |
  | 55389     | 井上 和               |
  | 55387     | 弓木 奈於             |
  | 55386     | 松尾 美佑             |
  | 55385     | 林 瑠奈               |
  | 55384     | 佐藤 璃果             |
  | 55383     | 黒見 明香             |
  | 48014     | 清宮 レイ             |
  | 48012     | 北川 悠理             |
  | 48010     | 金川 紗耶             |
  | 48019     | 矢久保 美緒           |
  | 48018     | 早川 聖来             |
  | 48009     | 掛橋 沙耶香           |
  | 48008     | 賀喜 遥香             |
  | 48017     | 筒井 あやめ           |
  | 48015     | 田村 真佑             |
  | 48013     | 柴田 柚菜             |
  | 48006     | 遠藤 さくら           |
  | 36760     | 与田 祐希             |
  | 36759     | 吉田 綾乃クリスティー |
  | 36758     | 山下 美月             |
  | 36757     | 向井 葉月             |
  | 36756     | 中村 麗乃             |
  | 36755     | 佐藤 楓               |
  | 36754     | 阪口 珠美             |
  | 36753     | 久保 史緒里           |
  | 36752     | 大園 桃子             |
  | 36751     | 梅澤 美波             |
  | 36750     | 岩本 蓮加             |
  | 36749     | 伊藤 理々杏           |
  | 264       | 齋藤 飛鳥             |

### Nogizaka46 News 乃木坂 46 新闻 <Site url="news.nogizaka46.com/s/n46/news/list" size="sm" />

<Route namespace="nogizaka46" :data='{"path":"/news","categories":["new-media"],"example":"/nogizaka46/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["news.nogizaka46.com/s/n46/news/list"]}],"name":"Nogizaka46 News 乃木坂 46 新闻","maintainers":["crispgm","Fatpandac"],"url":"news.nogizaka46.com/s/n46/news/list","location":"news.ts"}' />

## Sakamichi Series 坂道系列官网资讯 <Site url="sakurazaka46.com"/>

### Sakurazaka46 Blog 櫻坂 46 博客 <Site url="sakurazaka46.com" size="sm" />

<Route namespace="sakurazaka46" :data='{"path":"/blog/:id?/:page?","categories":["new-media"],"example":"/sakurazaka46/blog","parameters":{"id":"Member ID, see below, `all` by default","page":"Page, `0` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Sakurazaka46 Blog 櫻坂 46 博客","maintainers":["victor21813","nczitzk","akashigakki"],"description":"Member ID\n\n  | Member ID | Name         |\n  | --------- | ------------ |\n  | 2000      | 三期生リレー |\n  | 69        | 山下 瞳月    |\n  | 68        | 村山 美羽    |\n  | 67        | 村井 優      |\n  | 66        | 向井 純葉    |\n  | 65        | 的野 美青    |\n  | 64        | 中嶋 優月    |\n  | 63        | 谷口 愛季    |\n  | 62        | 小島 凪紗    |\n  | 61        | 小田倉 麗奈  |\n  | 60        | 遠藤 理子    |\n  | 59        | 石森 璃花    |\n  | 58        | 守屋 麗奈    |\n  | 57        | 増本 綺良    |\n  | 56        | 幸阪 茉里乃  |\n  | 55        | 大沼 晶保    |\n  | 54        | 大園 玲      |\n  | 53        | 遠藤 光莉    |\n  | 51        | 山﨑 天      |\n  | 50        | 森田 ひかる  |\n  | 48        | 松田 里奈    |\n  | 47        | 藤吉 夏鈴    |\n  | 46        | 田村 保乃    |\n  | 45        | 武元 唯衣    |\n  | 44        | 関 有美子    |\n  | 43        | 井上 梨名    |\n  | 15        | 原田 葵      |\n  | 14        | 土生 瑞穂    |\n  | 11        | 菅井 友香    |\n  | 08        | 齋藤 冬優花  |\n  | 07        | 小林 由依    |\n  | 06        | 小池 美波    |\n  | 04        | 尾関 梨香    |\n  | 03        | 上村 莉菜    |","location":"blog.ts"}' />

Member ID

  | Member ID | Name         |
  | --------- | ------------ |
  | 2000      | 三期生リレー |
  | 69        | 山下 瞳月    |
  | 68        | 村山 美羽    |
  | 67        | 村井 優      |
  | 66        | 向井 純葉    |
  | 65        | 的野 美青    |
  | 64        | 中嶋 優月    |
  | 63        | 谷口 愛季    |
  | 62        | 小島 凪紗    |
  | 61        | 小田倉 麗奈  |
  | 60        | 遠藤 理子    |
  | 59        | 石森 璃花    |
  | 58        | 守屋 麗奈    |
  | 57        | 増本 綺良    |
  | 56        | 幸阪 茉里乃  |
  | 55        | 大沼 晶保    |
  | 54        | 大園 玲      |
  | 53        | 遠藤 光莉    |
  | 51        | 山﨑 天      |
  | 50        | 森田 ひかる  |
  | 48        | 松田 里奈    |
  | 47        | 藤吉 夏鈴    |
  | 46        | 田村 保乃    |
  | 45        | 武元 唯衣    |
  | 44        | 関 有美子    |
  | 43        | 井上 梨名    |
  | 15        | 原田 葵      |
  | 14        | 土生 瑞穂    |
  | 11        | 菅井 友香    |
  | 08        | 齋藤 冬優花  |
  | 07        | 小林 由依    |
  | 06        | 小池 美波    |
  | 04        | 尾関 梨香    |
  | 03        | 上村 莉菜    |

### Sakurazaka46 News 櫻坂 46 新闻 <Site url="sakurazaka46.com/s/s46/news/list" size="sm" />

<Route namespace="sakurazaka46" :data='{"path":"/news","categories":["new-media"],"example":"/sakurazaka46/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["sakurazaka46.com/s/s46/news/list","sakurazaka46.com/"]}],"name":"Sakurazaka46 News 櫻坂 46 新闻","maintainers":["nczitzk"],"url":"sakurazaka46.com/s/s46/news/list","location":"news.ts"}' />

## Samsung <Site url="research.samsung.com"/>

### Research Blog <Site url="research.samsung.com/blog" size="sm" />

<Route namespace="samsung" :data='{"path":"/research/blog","categories":["new-media"],"example":"/samsung/research/blog","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["research.samsung.com/blog","research.samsung.com/"]}],"name":"Research Blog","maintainers":["nczitzk"],"url":"research.samsung.com/blog","location":"research/blog.ts"}' />

## Sensor Tower <Site url="sensortower.com"/>

### Blog <Site url="sensortower.com/blog" size="sm" />

<Route namespace="sensortower" :data='{"path":"/blog/:language?","categories":["new-media"],"example":"/sensortower/blog","parameters":{"language":"Language, see below, English by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["sensortower.com/blog","sensortower.com/zh-CN/blog","sensortower.com/ja/blog","sensortower.com/ko/blog","sensortower.com/"],"target":"/blog"}],"name":"Blog","maintainers":["nczitzk"],"url":"sensortower.com/blog","description":"| English | Chinese | Japanese | Korean |\n  | ------- | ------- | -------- | ------ |\n  |         | zh-CN   | ja       | ko     |","location":"blog.ts"}' />

| English | Chinese | Japanese | Korean |
  | ------- | ------- | -------- | ------ |
  |         | zh-CN   | ja       | ko     |

## Sky Sports <Site url="skysports.com"/>

### News <Site url="skysports.com" size="sm" />

<Route namespace="skysports" :data='{"path":"/news/:team","categories":["new-media"],"example":"/skysports/news/ac-milan","parameters":{"team":"Team id, can be found in URL to the team page"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"News","maintainers":["nczitzk"],"location":"news.ts"}' />

## SupChina <Site url="supchina.com"/>

### Podcasts <Site url="supchina.com/podcasts" size="sm" />

<Route namespace="supchina" :data='{"path":"/podcasts","categories":["new-media"],"example":"/supchina/podcasts","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["supchina.com/podcasts","supchina.com/"]}],"name":"Podcasts","maintainers":["nczitzk"],"url":"supchina.com/podcasts","location":"podcasts.ts"}' />

### Unknown <Site url="supchina.com/feed" size="sm" />

<Route namespace="supchina" :data='{"path":"/","radar":[{"source":["supchina.com/feed","supchina.com/"],"target":""}],"name":"Unknown","maintainers":["nczitzk"],"url":"supchina.com/feed","location":"index.ts"}' />

## swissinfo <Site url="swissinfo.ch"/>

### Category <Site url="swissinfo.ch" size="sm" />

<Route namespace="swissinfo" :data='{"path":"/:language?/:category?","categories":["new-media"],"example":"/swissinfo/eng/latest-news","parameters":{"language":"Language, eng by default","category":"Category, Latest News by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["swissinfo.ch/:language/:category","swissinfo.ch/"]}],"name":"Category","maintainers":["nczitzk"],"location":"index.ts"}' />

## TechCrunch <Site url="techcrunch.com"/>

### News <Site url="techcrunch.com/" size="sm" />

<Route namespace="techcrunch" :data='{"path":"/news","categories":["new-media"],"example":"/techcrunch/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["techcrunch.com/"]}],"name":"News","maintainers":["EthanWng97"],"url":"techcrunch.com/","location":"news.ts"}' />

## TechPowerUp <Site url="techpowerup.com"/>

### Reviews <Site url="techpowerup.com/" size="sm" />

<Route namespace="techpowerup" :data='{"path":"/review/:keyword?","categories":["new-media"],"example":"/techpowerup/review/4090","parameters":{"keyword":"Search Keyword"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["techpowerup.com/"],"target":""}],"name":"Reviews","maintainers":["TonyRL"],"url":"techpowerup.com/","location":"review.ts"}' />

### Unknown <Site url="techpowerup.com/" size="sm" />

<Route namespace="techpowerup" :data='{"path":"/","radar":[{"source":["techpowerup.com/"],"target":""}],"name":"Unknown","maintainers":["TonyRL"],"url":"techpowerup.com/","location":"index.ts"}' />

## The Verge <Site url="theverge.com"/>

### The Verge <Site url="theverge.com" size="sm" />

<Route namespace="theverge" :data='{"path":"/:hub?","categories":["new-media"],"example":"/theverge","parameters":{"hub":"Hub, see below, All Posts by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["theverge.com/:hub","theverge.com/"]}],"name":"The Verge","maintainers":["HenryQW","vbali"],"description":"| Hub         | Hub name            |\n  | ----------- | ------------------- |\n  |             | All Posts           |\n  | android     | Android             |\n  | apple       | Apple               |\n  | apps        | Apps & Software     |\n  | blackberry  | BlackBerry          |\n  | culture     | Culture             |\n  | gaming      | Gaming              |\n  | hd          | HD & Home           |\n  | microsoft   | Microsoft           |\n  | photography | Photography & Video |\n  | policy      | Policy & Law        |\n  | web         | Web & Social        |\n\n  Provides a better reading experience (full text articles) over the official one.","location":"index.ts"}' />

| Hub         | Hub name            |
  | ----------- | ------------------- |
  |             | All Posts           |
  | android     | Android             |
  | apple       | Apple               |
  | apps        | Apps & Software     |
  | blackberry  | BlackBerry          |
  | culture     | Culture             |
  | gaming      | Gaming              |
  | hd          | HD & Home           |
  | microsoft   | Microsoft           |
  | photography | Photography & Video |
  | policy      | Policy & Law        |
  | web         | Web & Social        |

  Provides a better reading experience (full text articles) over the official one.

## ThoughtCo <Site url="thoughtco.com"/>

### Category <Site url="thoughtco.com" size="sm" />

<Route namespace="thoughtco" :data='{"path":"/:category?","categories":["new-media"],"example":"/thoughtco","parameters":{"category":"Category id, see below"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Category","maintainers":["nczitzk"],"description":"#### Science, Tech, Math\n\n  | category         | id                         |\n  | ---------------- | -------------------------- |\n  | Science          | science-4132464            |\n  | Math             | math-4133545               |\n  | Social Sciences  | social-sciences-4133522    |\n  | Computer Science | computer-science-4133486   |\n  | Animals & Nature | animals-and-nature-4133421 |\n\n  #### Humanities\n\n  | category          | id                          |\n  | ----------------- | --------------------------- |\n  | History & Culture | history-and-culture-4133356 |\n  | Visual Arts       | visual-arts-4132957         |\n  | Literature        | literature-4133251          |\n  | English           | english-4688281             |\n  | Geography         | geography-4133035           |\n  | Philosophy        | philosophy-4133025          |\n  | Issues            | issues-4133022              |\n\n  #### Languages\n\n  | category                     | id               |\n  | ---------------------------- | ---------------- |\n  | English as a Second Language | esl-4133095      |\n  | Spanish                      | spanish-4133085  |\n  | French                       | french-4133079   |\n  | German                       | german-4133073   |\n  | Italian                      | italian-4133069  |\n  | Japanese                     | japanese-4133062 |\n  | Mandarin                     | mandarin-4133057 |\n  | Russian                      | russian-4175265  |\n\n  #### Resources\n\n  | category               | id                           |\n  | ---------------------- | ---------------------------- |\n  | For Students & Parents | for-students-parents-4132588 |\n  | For Educators          | for-educators-4132509        |\n  | For Adult Learners     | for-adult-learners-4132469   |\n\n  <details>\n    <summary>More categories</summary>\n\n    #### Science\n\n    | category          | id                          |\n    | ----------------- | --------------------------- |\n    | Chemistry         | chemistry-4133594           |\n    | Biology           | biology-4133580             |\n    | Physics           | physics-4133571             |\n    | Geology           | geology-4133564             |\n    | Astronomy         | astronomy-4133558           |\n    | Weather & Climate | weather-and-climate-4133550 |\n\n    #### Math\n\n    | category              | id                              |\n    | --------------------- | ------------------------------- |\n    | Math Tutorials        | math-tutorials-4133543          |\n    | Geometry              | geometry-4133540                |\n    | Arithmetic            | arithmetic-4133542              |\n    | Pre Algebra & Algebra | pre-algebra-and-algebra-4133541 |\n    | Statistics            | statistics-4133539              |\n    | Exponential Decay     | exponential-decay-4133528       |\n    | Worksheets By Grade   | worksheets-by-grade-4133526     |\n    | Resources             | math-resources-4133523          |\n\n    #### Social Sciences\n\n    | category    | id                  |\n    | ----------- | ------------------- |\n    | Psychology  | psychology-4160512  |\n    | Sociology   | sociology-4133515   |\n    | Archaeology | archaeology-4133504 |\n    | Economics   | economics-4133521   |\n    | Ergonomics  | ergonomics-4133492  |\n\n    #### Computer Science\n\n    | category               | id                               |\n    | ---------------------- | -------------------------------- |\n    | PHP Programming        | php-4133485                      |\n    | Perl                   | perl-4133481                     |\n    | Python                 | python-4133477                   |\n    | Java Programming       | java-programming-4133478         |\n    | Javascript Programming | javascript-programming-4133476   |\n    | Delphi Programming     | delphi-programming-4133475       |\n    | C & C++ Programming    | c-and-c-plus-programming-4133470 |\n    | Ruby Programming       | ruby-programming-4133469         |\n    | Visual Basic           | visual-basic-4133468             |\n\n    #### Animals and Nature\n\n    | category         | id                       |\n    | ---------------- | ------------------------ |\n    | Amphibians       | amphibians-4133418       |\n    | Birds            | birds-4133416            |\n    | Habitat Profiles | habitat-profiles-4133412 |\n    | Mammals          | mammals-4133411          |\n    | Reptiles         | reptiles-4133408         |\n    | Insects          | insects-4133406          |\n    | Marine Life      | marine-life-4133393      |\n    | Forestry         | forestry-4133386         |\n    | Dinosaurs        | dinosaurs-4133376        |\n    | Evolution        | evolution-4133366        |\n\n    #### History and Culture\n\n    | category                       | id                                       |\n    | ------------------------------ | ---------------------------------------- |\n    | American History               | american-history-4133354                 |\n    | African American History       | african-american-history-4133344         |\n    | African History                | african-history-4133338                  |\n    | Ancient History and Culture    | ancient-history-4133336                  |\n    | Asian History                  | asian-history-4133325                    |\n    | European History               | european-history-4133316                 |\n    | Genealogy                      | genealogy-4133308                        |\n    | Inventions                     | inventions-4133303                       |\n    | Latin American History         | latin-american-history-4133296           |\n    | Medieval & Renaissance History | medieval-and-renaissance-history-4133289 |\n    | Military History               | military-history-4133285                 |\n    | The 20th Century               | 20th-century-4133273                     |\n    | Women&#39;s History                | womens-history-4133260                   |\n\n    #### Visual Arts\n\n    | category      | id                   |\n    | ------------- | -------------------- |\n    | Art & Artists | art-4132956          |\n    | Architecture  | architecture-4132953 |\n\n    #### Literature\n\n    | category           | id                         |\n    | ------------------ | -------------------------- |\n    | Best Sellers       | best-sellers-4133250       |\n    | Classic Literature | classic-literature-4133245 |\n    | Plays & Drama      | plays-and-drama-4133239    |\n    | Poetry             | poetry-4133232             |\n    | Quotations         | quotations-4133229         |\n    | Shakespeare        | shakespeare-4133223        |\n    | Short Stories      | short-stories-4133217      |\n    | Children&#39;s Books   | childrens-books-4133216    |\n\n    #### English\n\n    | category        | id                      |\n    | --------------- | ----------------------- |\n    | English Grammar | english-grammar-4133049 |\n    | Writing         | writing-4133048         |\n\n    #### Geography\n\n    | category                 | id                                 |\n    | ------------------------ | ---------------------------------- |\n    | Basics                   | geography-basics-4133034           |\n    | Physical Geography       | physical-geography-4133032         |\n    | Political Geography      | political-geography-4133033        |\n    | Population               | population-4133031                 |\n    | Country Information      | country-information-4133030        |\n    | Key Figures & Milestones | key-figures-and-milestones-4133029 |\n    | Maps                     | maps-4133027                       |\n    | Urban Geography          | urban-geography-4133026            |\n\n    #### Philosophy\n\n    | category                       | id                                       |\n    | ------------------------------ | ---------------------------------------- |\n    | Philosophical Theories & Ideas | philosophical-theories-and-ideas-4133024 |\n    | Major Philosophers             | major-philosophers-4133023               |\n\n    #### Issues\n\n    | category                          | id                               |\n    | --------------------------------- | -------------------------------- |\n    | The U. S. Government              | us-government-4133021            |\n    | U.S. Foreign Policy               | us-foreign-policy-4133010        |\n    | U.S. Liberal Politics             | us-liberal-politics-4133009      |\n    | U.S. Conservative Politics        | us-conservative-politics-4133006 |\n    | Women&#39;s Issues                    | womens-issues-4133002            |\n    | Civil Liberties                   | civil-liberties-4132996          |\n    | The Middle East                   | middle-east-4132989              |\n    | Race Relations                    | race-relations-4132982           |\n    | Immigration                       | immigration-4132977              |\n    | Crime & Punishment                | crime-and-punishment-4132972     |\n    | Canadian Government               | canadian-government-4132959      |\n    | Understanding Types of Government | types-of-government-5179107      |\n\n    #### English as a Second Language\n\n    | category                     | id                                         |\n    | ---------------------------- | ------------------------------------------ |\n    | Pronunciation & Conversation | esl-pronunciation-and-conversation-4133093 |\n    | Vocabulary                   | esl-vocabulary-4133092                     |\n    | Writing Skills               | esl-writing-skills-4133091                 |\n    | Reading Comprehension        | esl-reading-comprehension-4133090          |\n    | Grammar                      | esl-grammar-4133089                        |\n    | Business English             | esl-business-english-4133088               |\n    | Resources for Teachers       | resources-for-esl-teachers-4133087         |\n\n    #### Spanish\n\n    | category          | id                                  |\n    | ----------------- | ----------------------------------- |\n    | History & Culture | spanish-history-and-culture-4133084 |\n    | Pronunciation     | spanish-pronunciation-4133083       |\n    | Vocabulary        | spanish-vocabulary-4133082          |\n    | Writing Skills    | spanish-writing-skills-4133081      |\n    | Grammar           | spanish-grammar-4133080             |\n\n    #### French\n\n    | category                     | id                                           |\n    | ---------------------------- | -------------------------------------------- |\n    | Pronunciation & Conversation | french-pronunciation-4133075                 |\n    | Vocabulary                   | french-vocabulary-4133076                    |\n    | Grammar                      | french-grammar-4133074                       |\n    | Resources For Teachers       | french-resources-for-french-teachers-4133077 |\n\n    #### German\n\n    | category                     | id                                 |\n    | ---------------------------- | ---------------------------------- |\n    | History & Culture            | german-history-and-culture-4133071 |\n    | Pronunciation & Conversation | german-pronunciation-4133070       |\n    | Vocabulary                   | german-vocabulary-4133068          |\n    | Grammar                      | german-grammar-4133067             |\n\n    #### Italian\n\n    | category          | id                                  |\n    | ----------------- | ----------------------------------- |\n    | History & Culture | italian-history-and-culture-4133065 |\n    | Vocabulary        | italian-vocabulary-4133061          |\n    | Grammar           | italian-grammar-4133063             |\n\n    #### Japanese\n\n    | category                      | id                                   |\n    | ----------------------------- | ------------------------------------ |\n    | History & Culture             | japanese-history-and-culture-4133058 |\n    | Essential Japanese Vocabulary | japanese-vocabulary-4133060          |\n    | Japanese Grammar              | japanese-grammar-4133056             |\n\n    #### Mandarin\n\n    | category                         | id                                       |\n    | -------------------------------- | ---------------------------------------- |\n    | Mandarin History and Culture     | mandarin-history-and-culture-4133054     |\n    | Pronunciation                    | mandarin-pronunciation-4133053           |\n    | Vocabulary                       | mandarin-vocabulary-4133052              |\n    | Understanding Chinese Characters | understanding-chinese-characters-4133051 |\n\n    #### Russian\n\n    | category | id              |\n    | -------- | --------------- |\n    | Russian  | russian-4175265 |\n\n    #### For Students & Parents\n\n    | category           | id                         |\n    | ------------------ | -------------------------- |\n    | Homework Help      | homework-help-4132587      |\n    | Private School     | private-school-4132514     |\n    | Test Prep          | test-prep-4132578          |\n    | College Admissions | college-admissions-4132565 |\n    | College Life       | college-life-4132553       |\n    | Graduate School    | graduate-school-4132543    |\n    | Business School    | business-school-4132536    |\n    | Law School         | law-school-4132527         |\n    | Distance Learning  | distance-learning-4132521  |\n\n    #### For Educators\n\n    | category             | id                            |\n    | -------------------- | ----------------------------- |\n    | Becoming A Teacher   | becoming-a-teacher-4132510    |\n    | Assessments & Tests  | assessments-and-tests-4132508 |\n    | Elementary Education | elementary-education-4132507  |\n    | Secondary Education  | secondary-education-4132504   |\n    | Special Education    | special-education-4132499     |\n    | Teaching             | teaching-4132488              |\n    | Homeschooling        | homeschooling-4132480         |\n\n    #### For Adult Learners\n\n    | category                | id                              |\n    | ----------------------- | ------------------------------- |\n    | Tips For Adult Students | tips-for-adult-students-4132468 |\n    | Getting Your Ged        | getting-your-ged-4132466        |\n  </details>","location":"index.ts"}' />

#### Science, Tech, Math

  | category         | id                         |
  | ---------------- | -------------------------- |
  | Science          | science-4132464            |
  | Math             | math-4133545               |
  | Social Sciences  | social-sciences-4133522    |
  | Computer Science | computer-science-4133486   |
  | Animals & Nature | animals-and-nature-4133421 |

  #### Humanities

  | category          | id                          |
  | ----------------- | --------------------------- |
  | History & Culture | history-and-culture-4133356 |
  | Visual Arts       | visual-arts-4132957         |
  | Literature        | literature-4133251          |
  | English           | english-4688281             |
  | Geography         | geography-4133035           |
  | Philosophy        | philosophy-4133025          |
  | Issues            | issues-4133022              |

  #### Languages

  | category                     | id               |
  | ---------------------------- | ---------------- |
  | English as a Second Language | esl-4133095      |
  | Spanish                      | spanish-4133085  |
  | French                       | french-4133079   |
  | German                       | german-4133073   |
  | Italian                      | italian-4133069  |
  | Japanese                     | japanese-4133062 |
  | Mandarin                     | mandarin-4133057 |
  | Russian                      | russian-4175265  |

  #### Resources

  | category               | id                           |
  | ---------------------- | ---------------------------- |
  | For Students & Parents | for-students-parents-4132588 |
  | For Educators          | for-educators-4132509        |
  | For Adult Learners     | for-adult-learners-4132469   |

  <details>
    <summary>More categories</summary>

    #### Science

    | category          | id                          |
    | ----------------- | --------------------------- |
    | Chemistry         | chemistry-4133594           |
    | Biology           | biology-4133580             |
    | Physics           | physics-4133571             |
    | Geology           | geology-4133564             |
    | Astronomy         | astronomy-4133558           |
    | Weather & Climate | weather-and-climate-4133550 |

    #### Math

    | category              | id                              |
    | --------------------- | ------------------------------- |
    | Math Tutorials        | math-tutorials-4133543          |
    | Geometry              | geometry-4133540                |
    | Arithmetic            | arithmetic-4133542              |
    | Pre Algebra & Algebra | pre-algebra-and-algebra-4133541 |
    | Statistics            | statistics-4133539              |
    | Exponential Decay     | exponential-decay-4133528       |
    | Worksheets By Grade   | worksheets-by-grade-4133526     |
    | Resources             | math-resources-4133523          |

    #### Social Sciences

    | category    | id                  |
    | ----------- | ------------------- |
    | Psychology  | psychology-4160512  |
    | Sociology   | sociology-4133515   |
    | Archaeology | archaeology-4133504 |
    | Economics   | economics-4133521   |
    | Ergonomics  | ergonomics-4133492  |

    #### Computer Science

    | category               | id                               |
    | ---------------------- | -------------------------------- |
    | PHP Programming        | php-4133485                      |
    | Perl                   | perl-4133481                     |
    | Python                 | python-4133477                   |
    | Java Programming       | java-programming-4133478         |
    | Javascript Programming | javascript-programming-4133476   |
    | Delphi Programming     | delphi-programming-4133475       |
    | C & C++ Programming    | c-and-c-plus-programming-4133470 |
    | Ruby Programming       | ruby-programming-4133469         |
    | Visual Basic           | visual-basic-4133468             |

    #### Animals and Nature

    | category         | id                       |
    | ---------------- | ------------------------ |
    | Amphibians       | amphibians-4133418       |
    | Birds            | birds-4133416            |
    | Habitat Profiles | habitat-profiles-4133412 |
    | Mammals          | mammals-4133411          |
    | Reptiles         | reptiles-4133408         |
    | Insects          | insects-4133406          |
    | Marine Life      | marine-life-4133393      |
    | Forestry         | forestry-4133386         |
    | Dinosaurs        | dinosaurs-4133376        |
    | Evolution        | evolution-4133366        |

    #### History and Culture

    | category                       | id                                       |
    | ------------------------------ | ---------------------------------------- |
    | American History               | american-history-4133354                 |
    | African American History       | african-american-history-4133344         |
    | African History                | african-history-4133338                  |
    | Ancient History and Culture    | ancient-history-4133336                  |
    | Asian History                  | asian-history-4133325                    |
    | European History               | european-history-4133316                 |
    | Genealogy                      | genealogy-4133308                        |
    | Inventions                     | inventions-4133303                       |
    | Latin American History         | latin-american-history-4133296           |
    | Medieval & Renaissance History | medieval-and-renaissance-history-4133289 |
    | Military History               | military-history-4133285                 |
    | The 20th Century               | 20th-century-4133273                     |
    | Women's History                | womens-history-4133260                   |

    #### Visual Arts

    | category      | id                   |
    | ------------- | -------------------- |
    | Art & Artists | art-4132956          |
    | Architecture  | architecture-4132953 |

    #### Literature

    | category           | id                         |
    | ------------------ | -------------------------- |
    | Best Sellers       | best-sellers-4133250       |
    | Classic Literature | classic-literature-4133245 |
    | Plays & Drama      | plays-and-drama-4133239    |
    | Poetry             | poetry-4133232             |
    | Quotations         | quotations-4133229         |
    | Shakespeare        | shakespeare-4133223        |
    | Short Stories      | short-stories-4133217      |
    | Children's Books   | childrens-books-4133216    |

    #### English

    | category        | id                      |
    | --------------- | ----------------------- |
    | English Grammar | english-grammar-4133049 |
    | Writing         | writing-4133048         |

    #### Geography

    | category                 | id                                 |
    | ------------------------ | ---------------------------------- |
    | Basics                   | geography-basics-4133034           |
    | Physical Geography       | physical-geography-4133032         |
    | Political Geography      | political-geography-4133033        |
    | Population               | population-4133031                 |
    | Country Information      | country-information-4133030        |
    | Key Figures & Milestones | key-figures-and-milestones-4133029 |
    | Maps                     | maps-4133027                       |
    | Urban Geography          | urban-geography-4133026            |

    #### Philosophy

    | category                       | id                                       |
    | ------------------------------ | ---------------------------------------- |
    | Philosophical Theories & Ideas | philosophical-theories-and-ideas-4133024 |
    | Major Philosophers             | major-philosophers-4133023               |

    #### Issues

    | category                          | id                               |
    | --------------------------------- | -------------------------------- |
    | The U. S. Government              | us-government-4133021            |
    | U.S. Foreign Policy               | us-foreign-policy-4133010        |
    | U.S. Liberal Politics             | us-liberal-politics-4133009      |
    | U.S. Conservative Politics        | us-conservative-politics-4133006 |
    | Women's Issues                    | womens-issues-4133002            |
    | Civil Liberties                   | civil-liberties-4132996          |
    | The Middle East                   | middle-east-4132989              |
    | Race Relations                    | race-relations-4132982           |
    | Immigration                       | immigration-4132977              |
    | Crime & Punishment                | crime-and-punishment-4132972     |
    | Canadian Government               | canadian-government-4132959      |
    | Understanding Types of Government | types-of-government-5179107      |

    #### English as a Second Language

    | category                     | id                                         |
    | ---------------------------- | ------------------------------------------ |
    | Pronunciation & Conversation | esl-pronunciation-and-conversation-4133093 |
    | Vocabulary                   | esl-vocabulary-4133092                     |
    | Writing Skills               | esl-writing-skills-4133091                 |
    | Reading Comprehension        | esl-reading-comprehension-4133090          |
    | Grammar                      | esl-grammar-4133089                        |
    | Business English             | esl-business-english-4133088               |
    | Resources for Teachers       | resources-for-esl-teachers-4133087         |

    #### Spanish

    | category          | id                                  |
    | ----------------- | ----------------------------------- |
    | History & Culture | spanish-history-and-culture-4133084 |
    | Pronunciation     | spanish-pronunciation-4133083       |
    | Vocabulary        | spanish-vocabulary-4133082          |
    | Writing Skills    | spanish-writing-skills-4133081      |
    | Grammar           | spanish-grammar-4133080             |

    #### French

    | category                     | id                                           |
    | ---------------------------- | -------------------------------------------- |
    | Pronunciation & Conversation | french-pronunciation-4133075                 |
    | Vocabulary                   | french-vocabulary-4133076                    |
    | Grammar                      | french-grammar-4133074                       |
    | Resources For Teachers       | french-resources-for-french-teachers-4133077 |

    #### German

    | category                     | id                                 |
    | ---------------------------- | ---------------------------------- |
    | History & Culture            | german-history-and-culture-4133071 |
    | Pronunciation & Conversation | german-pronunciation-4133070       |
    | Vocabulary                   | german-vocabulary-4133068          |
    | Grammar                      | german-grammar-4133067             |

    #### Italian

    | category          | id                                  |
    | ----------------- | ----------------------------------- |
    | History & Culture | italian-history-and-culture-4133065 |
    | Vocabulary        | italian-vocabulary-4133061          |
    | Grammar           | italian-grammar-4133063             |

    #### Japanese

    | category                      | id                                   |
    | ----------------------------- | ------------------------------------ |
    | History & Culture             | japanese-history-and-culture-4133058 |
    | Essential Japanese Vocabulary | japanese-vocabulary-4133060          |
    | Japanese Grammar              | japanese-grammar-4133056             |

    #### Mandarin

    | category                         | id                                       |
    | -------------------------------- | ---------------------------------------- |
    | Mandarin History and Culture     | mandarin-history-and-culture-4133054     |
    | Pronunciation                    | mandarin-pronunciation-4133053           |
    | Vocabulary                       | mandarin-vocabulary-4133052              |
    | Understanding Chinese Characters | understanding-chinese-characters-4133051 |

    #### Russian

    | category | id              |
    | -------- | --------------- |
    | Russian  | russian-4175265 |

    #### For Students & Parents

    | category           | id                         |
    | ------------------ | -------------------------- |
    | Homework Help      | homework-help-4132587      |
    | Private School     | private-school-4132514     |
    | Test Prep          | test-prep-4132578          |
    | College Admissions | college-admissions-4132565 |
    | College Life       | college-life-4132553       |
    | Graduate School    | graduate-school-4132543    |
    | Business School    | business-school-4132536    |
    | Law School         | law-school-4132527         |
    | Distance Learning  | distance-learning-4132521  |

    #### For Educators

    | category             | id                            |
    | -------------------- | ----------------------------- |
    | Becoming A Teacher   | becoming-a-teacher-4132510    |
    | Assessments & Tests  | assessments-and-tests-4132508 |
    | Elementary Education | elementary-education-4132507  |
    | Secondary Education  | secondary-education-4132504   |
    | Special Education    | special-education-4132499     |
    | Teaching             | teaching-4132488              |
    | Homeschooling        | homeschooling-4132480         |

    #### For Adult Learners

    | category                | id                              |
    | ----------------------- | ------------------------------- |
    | Tips For Adult Students | tips-for-adult-students-4132468 |
    | Getting Your Ged        | getting-your-ged-4132466        |
  </details>

## TOPYS <Site url="topys.cn"/>

### 关键字 <Site url="topys.cn" size="sm" />

<Route namespace="topys" :data='{"path":"/:keyword?","categories":["new-media"],"example":"/topys","parameters":{"keyword":"关键字，可在对应结果页的 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["topys.cn/search/:keyword","topys.cn/"]}],"name":"关键字","maintainers":["nczitzk"],"description":"| 创意 | 设计 | 商业 | 艺术 | 文化 | 科技 |\n  | ---- | ---- | ---- | ---- | ---- | ---- |","location":"index.ts"}' />

| 创意 | 设计 | 商业 | 艺术 | 文化 | 科技 |
  | ---- | ---- | ---- | ---- | ---- | ---- |

## UNTAG <Site url="utgd.net"/>

### 分类 <Site url="utgd.net" size="sm" />

<Route namespace="utgd" :data='{"path":"/:category?","categories":["new-media"],"example":"/utgd/method","parameters":{"category":"分类，可在对应分类页的 URL 中找到，默认为方法"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["utgd.net/category/s/:category","utgd.net/"],"target":"/:category"}],"name":"分类","maintainers":["nczitzk"],"description":"| 方法   | 观点    |\n  | ------ | ------- |\n  | method | opinion |","location":"category.ts"}' />

| 方法   | 观点    |
  | ------ | ------- |
  | method | opinion |

### 时间线 <Site url="utgd.net/" size="sm" />

<Route namespace="utgd" :data='{"path":"/timeline","categories":["new-media"],"example":"/utgd/timeline","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["utgd.net/"]}],"name":"时间线","maintainers":["nczitzk"],"url":"utgd.net/","location":"timeline.ts"}' />

### 专题 <Site url="utgd.net/topic" size="sm" />

<Route namespace="utgd" :data='{"path":"/topic/:topic?","categories":["new-media"],"example":"/utgd/topic/在线阅读专栏","parameters":{"topic":"专题，默认为在线阅读专栏"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["utgd.net/topic","utgd.net/"],"target":"/topic/:topic"}],"name":"专题","maintainers":["nczitzk"],"url":"utgd.net/topic","description":"| 在线阅读专栏 | 卡片笔记专题 |\n  | ------------ | ------------ |\n\n  更多专栏请见 [专题广场](https://utgd.net/topic)","location":"topic.ts"}' />

| 在线阅读专栏 | 卡片笔记专题 |
  | ------------ | ------------ |

  更多专栏请见 [专题广场](https://utgd.net/topic)

## Yahoo <Site url="hk.news.yahoo.com"/>

### News <Site url="yahoo.com/" size="sm" />

<Route namespace="yahoo" :data='{"path":"/news/:region/:category?","categories":["new-media"],"example":"/yahoo/news/hk/world","parameters":{"region":"Region, see the table below","category":"Category, see the table below"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["yahoo.com/"]}],"name":"News","maintainers":["KeiLongW"],"url":"yahoo.com/","description":"`Region`\n\n  | Hong Kong | Taiwan | US |\n  | --------- | ------ | -- |\n  | hk        | tw     | en |\n\n  <details>\n    <summary>`Category` (Hong Kong)</summary>\n\n    | 全部     | 港聞      | 兩岸國際 | 財經     | 娛樂          | 體育   | 健康   | 親子      | 副刊       |\n    | -------- | --------- | -------- | -------- | ------------- | ------ | ------ | --------- | ---------- |\n    | （留空） | hong-kong | world    | business | entertainment | sports | health | parenting | supplement |\n  </details>\n\n  <details>\n    <summary>`Category` (Taiwan)</summary>\n\n    | 全部     | 政治     | 財經    | 娛樂          | 運動   | 社會地方 | 國際  | 生活      | 健康   | 科技       | 品味  |\n    | -------- | -------- | ------- | ------------- | ------ | -------- | ----- | --------- | ------ | ---------- | ----- |\n    | （留空） | politics | finance | entertainment | sports | society  | world | lifestyle | health | technology | style |\n  </details>\n\n  <details>\n    <summary>`Category` (US)</summary>\n\n    | All     | World | Business | Entertainment | Sports | Health |\n    | ------- | ----- | -------- | ------------- | ------ | ------ |\n    | (Empty) | world | business | entertainment | sports | health |\n  </details>","location":"news/tw/index.ts"}' />

`Region`

  | Hong Kong | Taiwan | US |
  | --------- | ------ | -- |
  | hk        | tw     | en |

  <details>
    <summary>`Category` (Hong Kong)</summary>

    | 全部     | 港聞      | 兩岸國際 | 財經     | 娛樂          | 體育   | 健康   | 親子      | 副刊       |
    | -------- | --------- | -------- | -------- | ------------- | ------ | ------ | --------- | ---------- |
    | （留空） | hong-kong | world    | business | entertainment | sports | health | parenting | supplement |
  </details>

  <details>
    <summary>`Category` (Taiwan)</summary>

    | 全部     | 政治     | 財經    | 娛樂          | 運動   | 社會地方 | 國際  | 生活      | 健康   | 科技       | 品味  |
    | -------- | -------- | ------- | ------------- | ------ | -------- | ----- | --------- | ------ | ---------- | ----- |
    | （留空） | politics | finance | entertainment | sports | society  | world | lifestyle | health | technology | style |
  </details>

  <details>
    <summary>`Category` (US)</summary>

    | All     | World | Business | Entertainment | Sports | Health |
    | ------- | ----- | -------- | ------------- | ------ | ------ |
    | (Empty) | world | business | entertainment | sports | health |
  </details>

### Unknown <Site url="hk.news.yahoo.com" size="sm" />

<Route namespace="yahoo" :data='{"path":"/news/en/:category?","name":"Unknown","maintainers":[],"location":"news/us/index.ts"}' />

### 新聞來源列表 <Site url="hk.news.yahoo.com" size="sm" />

<Route namespace="yahoo" :data='{"path":"/news/providers/:region","categories":["new-media"],"example":"/yahoo/news/providers/tw","parameters":{"region":"地區，見上表"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"新聞來源列表","maintainers":["TonyRL"],"location":"news/tw/provider-helper.ts"}' />

### 新聞來源 <Site url="hk.news.yahoo.com" size="sm" />

<Route namespace="yahoo" :data='{"path":"/news/provider/:region/:providerId","categories":["new-media"],"example":"/yahoo/news/provider/tw/udn.com","parameters":{"region":"地區，見下表","providerId":"新聞來源 ID，可透過下方新聞來源列表獲得"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"新聞來源","maintainers":["TonyRL"],"description":"| 香港 | 台灣 |\n  | ---- | ---- |\n  | hk   | tw   |","location":"news/tw/provider.ts"}' />

| 香港 | 台灣 |
  | ---- | ---- |
  | hk   | tw   |

## zyw <Site url="hot.zyw.asia"/>

### 今日热榜 <Site url="hot.zyw.asia" size="sm" />

<Route namespace="zyw" :data='{"path":"/hot/:site?","categories":["new-media"],"example":"/zyw/hot","parameters":{"site":"站点，见下表，默认为空，即全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"今日热榜","maintainers":["nczitzk"],"description":":::tip\n  全部站点请见 [此处](https://hot.zyw.asia/#/list)\n  :::\n\n  | 哔哩哔哩 | 微博 | 知乎 | 36 氪 | 百度 | 少数派 | IT 之家 | 澎湃新闻 | 今日头条 | 百度贴吧 | 稀土掘金 | 腾讯新闻 |\n  | -------- | ---- | ---- | ----- | ---- | ------ | ------- | -------- | -------- | -------- | -------- | -------- |","location":"hot.ts"}' />

:::tip
  全部站点请见 [此处](https://hot.zyw.asia/#/list)
  :::

  | 哔哩哔哩 | 微博 | 知乎 | 36 氪 | 百度 | 少数派 | IT 之家 | 澎湃新闻 | 今日头条 | 百度贴吧 | 稀土掘金 | 腾讯新闻 |
  | -------- | ---- | ---- | ----- | ---- | ------ | ------- | -------- | -------- | -------- | -------- | -------- |

## 阿里研究院 <Site url="aliresearch.com"/>

### 资讯 <Site url="aliresearch.com/cn/information" size="sm" />

<Route namespace="aliresearch" :data='{"path":"/information/:type?","categories":["new-media"],"example":"/aliresearch/information","parameters":{"type":"类型，见下表，默认为新闻"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["aliresearch.com/cn/information","aliresearch.com/"],"target":"/information"}],"name":"资讯","maintainers":["nczitzk"],"url":"aliresearch.com/cn/information","description":"| 新闻 | 观点 | 案例 |\n  | ---- | ---- | ---- |","location":"information.ts"}' />

| 新闻 | 观点 | 案例 |
  | ---- | ---- | ---- |

## 艾莱资讯 <Site url="rail.ally.net.cn"/>

### 世界轨道交通资讯网 <Site url="rail.ally.net.cn/" size="sm" />

<Route namespace="ally" :data='{"path":"/rail/:category?/:topic?","categories":["new-media"],"example":"/ally/rail/hyzix/chengguijiaotong/","parameters":{"category":"分类，可在 URL 中找到；略去则抓取首页","topic":"话题，可在 URL 中找到；并非所有页面均有此字段"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["rail.ally.net.cn/","rail.ally.net.cn/html/:category?/:topic?"]}],"name":"世界轨道交通资讯网","maintainers":["Rongronggg9"],"url":"rail.ally.net.cn/","description":":::tip\n  默认抓取前 20 条，可通过 `?limit=` 改变。\n  :::","location":"rail.ts"}' />

:::tip
  默认抓取前 20 条，可通过 `?limit=` 改变。
  :::

## 白话区块链 <Site url="hellobtc.com"/>

### 科普 <Site url="hellobtc.com" size="sm" />

<Route namespace="hellobtc" :data='{"path":"/kepu/:channel?","categories":["new-media"],"example":"/hellobtc/kepu/latest","parameters":{"channel":"类型，见下表，默认为最新"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"科普","maintainers":["Fatpandac"],"description":"| latest | bitcoin | ethereum | defi | inter_blockchain | mining | safety | satoshi_nakomoto | public_blockchain |\n  | ------ | ------- | -------- | ---- | ----------------- | ------ | ------ | ----------------- | ------------------ |\n  | 最新   | 比特币  | 以太坊   | DeFi | 跨链              | 挖矿   | 安全   | 中本聪            | 公链               |","location":"kepu.ts"}' />

| latest | bitcoin | ethereum | defi | inter_blockchain | mining | safety | satoshi_nakomoto | public_blockchain |
  | ------ | ------- | -------- | ---- | ----------------- | ------ | ------ | ----------------- | ------------------ |
  | 最新   | 比特币  | 以太坊   | DeFi | 跨链              | 挖矿   | 安全   | 中本聪            | 公链               |

### 快讯 <Site url="hellobtc.com/news" size="sm" />

<Route namespace="hellobtc" :data='{"path":"/news","categories":["new-media"],"example":"/hellobtc/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["hellobtc.com/news"]}],"name":"快讯","maintainers":["Fatpandac"],"url":"hellobtc.com/news","location":"news.ts"}' />

### 首页 <Site url="hellobtc.com" size="sm" />

<Route namespace="hellobtc" :data='{"path":"/information/:channel?","categories":["new-media"],"example":"/hellobtc/information/latest","parameters":{"channel":"类型，可填 `latest` 和 `application` 及最新和应用，默认为最新"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"首页","maintainers":["Fatpandac"],"location":"information.ts"}' />

## 報導者 <Site url="twreporter.org"/>

### 最新 <Site url="twreporter.org/" size="sm" />

<Route namespace="twreporter" :data='{"path":"/newest","categories":["new-media"],"example":"/twreporter/newest","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["twreporter.org/"]}],"name":"最新","maintainers":["emdoe"],"url":"twreporter.org/","location":"newest.ts"}' />

## 本地宝 <Site url="bendibao.com"/>

### 焦点资讯 <Site url="bendibao.com/" size="sm" />

<Route namespace="bendibao" :data='{"path":"/news/:city","categories":["new-media"],"example":"/bendibao/news/bj","parameters":{"city":"城市缩写，可在该城市页面的 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["bendibao.com/"]}],"name":"焦点资讯","maintainers":["nczitzk"],"url":"bendibao.com/","description":"| 城市名 | 缩写 |\n  | ------ | ---- |\n  | 北京   | bj   |\n  | 上海   | sh   |\n  | 广州   | gz   |\n  | 深圳   | sz   |\n\n  更多城市请参见 [这里](http://www.bendibao.com/city.htm)\n\n  > **香港特别行政区** 和 **澳门特别行政区** 的本地宝城市页面不更新资讯。","location":"news.ts"}' />

| 城市名 | 缩写 |
  | ------ | ---- |
  | 北京   | bj   |
  | 上海   | sh   |
  | 广州   | gz   |
  | 深圳   | sz   |

  更多城市请参见 [这里](http://www.bendibao.com/city.htm)

  > **香港特别行政区** 和 **澳门特别行政区** 的本地宝城市页面不更新资讯。

## 财富中文网 <Site url="fortunechina.com"/>

### 分类 <Site url="fortunechina.com" size="sm" />

<Route namespace="fortunechina" :data='{"path":"/:category?","categories":["new-media"],"example":"/fortunechina","parameters":{"category":"分类，见下表，默认为首页"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["fortunechina.com/:category","fortunechina.com/"]}],"name":"分类","maintainers":["nczitzk"],"description":"| 商业    | 领导力    | 科技 | 研究   |\n  | ------- | --------- | ---- | ------ |\n  | shangye | lindgaoli | keji | report |","location":"index.ts"}' />

| 商业    | 领导力    | 科技 | 研究   |
  | ------- | --------- | ---- | ------ |
  | shangye | lindgaoli | keji | report |

## 差评 <Site url="chaping.cn"/>

### 快讯 <Site url="chaping.cn/newsflash" size="sm" />

<Route namespace="chaping" :data='{"path":"/newsflash","categories":["new-media"],"example":"/chaping/newsflash","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["chaping.cn/newsflash"]}],"name":"快讯","maintainers":["Fatpandac"],"url":"chaping.cn/newsflash","location":"newsflash.ts"}' />

### 图片墙 <Site url="chaping.cn/" size="sm" />

<Route namespace="chaping" :data='{"path":"/banner","categories":["new-media"],"example":"/chaping/banner","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["chaping.cn/"]}],"name":"图片墙","maintainers":["nczitzk"],"url":"chaping.cn/","location":"banner.ts"}' />

### 资讯 <Site url="chaping.cn" size="sm" />

<Route namespace="chaping" :data='{"path":"/news/:caty?","categories":["new-media"],"example":"/chaping/news/15","parameters":{"caty":"分类，默认为全部资讯"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"资讯","maintainers":["nczitzk"],"description":"| 编号 | 分类       |\n  | ---- | ---------- |\n  | 15   | 直播       |\n  | 3    | 科技新鲜事 |\n  | 7    | 互联网槽点 |\n  | 5    | 趣味科技   |\n  | 6    | DEBUG TIME |\n  | 1    | 游戏       |\n  | 8    | 视频       |\n  | 9    | 公里每小时 |","location":"news.ts"}' />

| 编号 | 分类       |
  | ---- | ---------- |
  | 15   | 直播       |
  | 3    | 科技新鲜事 |
  | 7    | 互联网槽点 |
  | 5    | 趣味科技   |
  | 6    | DEBUG TIME |
  | 1    | 游戏       |
  | 8    | 视频       |
  | 9    | 公里每小时 |

## 创业邦 <Site url="cyzone.cn"/>

### Unknown <Site url="cyzone.cn" size="sm" />

<Route namespace="cyzone" :data='{"path":["/channel/:id?","/:id?"],"radar":[{"source":["cyzone.cn/channel/:id","cyzone.cn/"],"target":"/:id"}],"name":"Unknown","maintainers":["nczitzk"],"description":"| 最新 | 快鲤鱼 | 创投 | 科创板 | 汽车 |\n  | ---- | ------ | ---- | ------ | ---- |\n  | news | 5      | 14   | 13     | 8    |\n\n  | 海外 | 消费 | 科技 | 医疗 | 文娱 |\n  | ---- | ---- | ---- | ---- | ---- |\n  | 10   | 9    | 7    | 27   | 11   |\n\n  | 城市 | 政策 | 特写 | 干货 | 科技股 |\n  | ---- | ---- | ---- | ---- | ------ |\n  | 16   | 15   | 6    | 12   | 33     |","location":"index.ts"}' />

| 最新 | 快鲤鱼 | 创投 | 科创板 | 汽车 |
  | ---- | ------ | ---- | ------ | ---- |
  | news | 5      | 14   | 13     | 8    |

  | 海外 | 消费 | 科技 | 医疗 | 文娱 |
  | ---- | ---- | ---- | ---- | ---- |
  | 10   | 9    | 7    | 27   | 11   |

  | 城市 | 政策 | 特写 | 干货 | 科技股 |
  | ---- | ---- | ---- | ---- | ------ |
  | 16   | 15   | 6    | 12   | 33     |

### Unknown <Site url="cyzone.cn" size="sm" />

<Route namespace="cyzone" :data='{"path":["/channel/:id?","/:id?"],"radar":[{"source":["cyzone.cn/channel/:id","cyzone.cn/"],"target":"/:id"}],"name":"Unknown","maintainers":["nczitzk"],"description":"| 最新 | 快鲤鱼 | 创投 | 科创板 | 汽车 |\n  | ---- | ------ | ---- | ------ | ---- |\n  | news | 5      | 14   | 13     | 8    |\n\n  | 海外 | 消费 | 科技 | 医疗 | 文娱 |\n  | ---- | ---- | ---- | ---- | ---- |\n  | 10   | 9    | 7    | 27   | 11   |\n\n  | 城市 | 政策 | 特写 | 干货 | 科技股 |\n  | ---- | ---- | ---- | ---- | ------ |\n  | 16   | 15   | 6    | 12   | 33     |","location":"index.ts"}' />

| 最新 | 快鲤鱼 | 创投 | 科创板 | 汽车 |
  | ---- | ------ | ---- | ------ | ---- |
  | news | 5      | 14   | 13     | 8    |

  | 海外 | 消费 | 科技 | 医疗 | 文娱 |
  | ---- | ---- | ---- | ---- | ---- |
  | 10   | 9    | 7    | 27   | 11   |

  | 城市 | 政策 | 特写 | 干货 | 科技股 |
  | ---- | ---- | ---- | ---- | ------ |
  | 16   | 15   | 6    | 12   | 33     |

### 标签 <Site url="cyzone.cn" size="sm" />

<Route namespace="cyzone" :data='{"path":"/label/:name","categories":["new-media"],"example":"/cyzone/label/创业邦周报","parameters":{"name":"标签名称，可在对应标签页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["cyzone.cn/label/:name","cyzone.cn/"]}],"name":"标签","maintainers":["nczitzk"],"location":"label.ts"}' />

### 作者 <Site url="cyzone.cn" size="sm" />

<Route namespace="cyzone" :data='{"path":"/author/:id","categories":["new-media"],"example":"/cyzone/author/1225562","parameters":{"id":"作者 id，可在对应作者页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["cyzone.cn/author/:id","cyzone.cn/"]}],"name":"作者","maintainers":["nczitzk"],"location":"author.ts"}' />

## 創新拿鐵 <Site url="startuplatte.com"/>

### 分类 <Site url="startuplatte.com" size="sm" />

<Route namespace="startuplatte" :data='{"path":"/:category?","categories":["new-media"],"example":"/startuplatte","parameters":{"category":"分类，见下表，默认为首頁"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["startuplatte.com/category/:category","startuplatte.com/"]}],"name":"分类","maintainers":["nczitzk"],"description":"| 首頁 | 大師智慧 | 深度分析 | 新知介紹 |\n  | ---- | -------- | -------- | -------- |\n  |      | quote    | analysis | trend    |","location":"index.ts"}' />

| 首頁 | 大師智慧 | 深度分析 | 新知介紹 |
  | ---- | -------- | -------- | -------- |
  |      | quote    | analysis | trend    |

## 大河财立方 <Site url="dahecube.com"/>

### 新闻 <Site url="dahecube.com" size="sm" />

<Route namespace="dahecube" :data='{"path":"/:type?","categories":["new-media"],"example":"/dahecube","parameters":{"type":"板块，见下表，默认为推荐"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"新闻","maintainers":["linbuxiao"],"description":"| 推荐      | 党史    | 豫股  | 财经     | 投教      | 金融    | 科创    | 投融   | 专栏   |\n  | --------- | ------- | ----- | -------- | --------- | ------- | ------- | ------ | ------ |\n  | recommend | history | stock | business | education | finance | science | invest | column |","location":"index.ts"}' />

| 推荐      | 党史    | 豫股  | 财经     | 投教      | 金融    | 科创    | 投融   | 专栏   |
  | --------- | ------- | ----- | -------- | --------- | ------- | ------- | ------ | ------ |
  | recommend | history | stock | business | education | finance | science | invest | column |

## 得到 <Site url="dedao.cn"/>

### Unknown <Site url="dedao.cn" size="sm" />

<Route namespace="dedao" :data='{"path":"/:category?","name":"Unknown","maintainers":[],"location":"index.ts"}' />

### 首页 <Site url="igetget.com/" size="sm" />

<Route namespace="dedao" :data='{"path":"/list/:category?","categories":["new-media"],"example":"/dedao/list/年度日更","parameters":{"category":"分类名，默认为年度日更"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["igetget.com/"]}],"name":"首页","maintainers":["nczitzk"],"url":"igetget.com/","location":"list.ts"}' />

### 用户主页 <Site url="dedao.cn" size="sm" />

<Route namespace="dedao" :data='{"path":"/user/:id/:type?","categories":["new-media"],"example":"/dedao/user/VkA5OqLX4RyGxmZRNBMlwBrDaJQ9og","parameters":{"id":"用户 id，可在对应用户主页 URL 中找到","type":"类型，见下表，默认为`0`，即动态"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"用户主页","maintainers":["nczitzk"],"description":"| 动态 | 书评 | 视频 |\n  | ---- | ---- | ---- |\n  | 0    | 7    | 12   |","location":"user.ts"}' />

| 动态 | 书评 | 视频 |
  | ---- | ---- | ---- |
  | 0    | 7    | 12   |

### 知识城邦 <Site url="dedao.cn" size="sm" />

<Route namespace="dedao" :data='{"path":"/knowledge/:topic?/:type?","categories":["new-media"],"example":"/dedao/knowledge","parameters":{"topic":"话题 id，可在对应话题页 URL 中找到","type":"分享类型，`true` 指精选，`false` 指最新，默认为精选"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["dedao.cn/knowledge/topic/:topic","dedao.cn/knowledge","dedao.cn/"]}],"name":"知识城邦","maintainers":["nczitzk"],"location":"knowledge.ts"}' />

## 电獭少女 <Site url="agirls.aotter.net"/>

### 当前精选主题列表 <Site url="agirls.aotter.net/" size="sm" />

<Route namespace="agirls" :data='{"path":"/topic_list","categories":["new-media"],"example":"/agirls/topic_list","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["agirls.aotter.net/","agirls.aotter.net/topic"]}],"name":"当前精选主题列表","maintainers":["TonyRL"],"url":"agirls.aotter.net/","location":"topic-list.ts"}' />

### 分类 <Site url="agirls.aotter.net" size="sm" />

<Route namespace="agirls" :data='{"path":"/:category?","categories":["new-media"],"example":"/agirls/app","parameters":{"category":"分类，默认为最新文章，可在对应主题页的 URL 中找到，下表仅列出部分"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["agirls.aotter.net/posts/:category"],"target":"/:category"}],"name":"分类","maintainers":["TonyRL"],"description":"| App 评测 | 手机开箱 | 笔电开箱 | 3C 周边     | 教学小技巧 | 科技情报 |\n  | -------- | -------- | -------- | ----------- | ---------- | -------- |\n  | app      | phone    | computer | accessories | tutorial   | techlife |","location":"index.ts"}' />

| App 评测 | 手机开箱 | 笔电开箱 | 3C 周边     | 教学小技巧 | 科技情报 |
  | -------- | -------- | -------- | ----------- | ---------- | -------- |
  | app      | phone    | computer | accessories | tutorial   | techlife |

### 精选主题 <Site url="agirls.aotter.net" size="sm" />

<Route namespace="agirls" :data='{"path":"/topic/:topic","categories":["new-media"],"example":"/agirls/topic/AppleWatch","parameters":{"topic":"精选主题，可通过下方精选主题列表获得"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["agirls.aotter.net/topic/:topic"]}],"name":"精选主题","maintainers":["TonyRL"],"location":"topic.ts"}' />

## 电动邦 <Site url="diandong.com"/>

### 资讯 <Site url="diandong.com/news" size="sm" />

<Route namespace="diandong" :data='{"path":"/news/:cate?","categories":["new-media"],"example":"/diandong/news","parameters":{"cate":"分类，见下表，默认为推荐"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["diandong.com/news"],"target":"/news/:cate"}],"name":"资讯","maintainers":["Fatpandac"],"url":"diandong.com/news","description":"分类\n\n  | 推荐 | 新车 | 导购 | 试驾 | 用车 | 技术 | 政策 | 行业 |\n  | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |\n  | 0    | 29   | 61   | 30   | 75   | 22   | 24   | 23   |","location":"news.ts"}' />

分类

  | 推荐 | 新车 | 导购 | 试驾 | 用车 | 技术 | 政策 | 行业 |
  | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
  | 0    | 29   | 61   | 30   | 75   | 22   | 24   | 23   |

## 东西智库 <Site url="dx2025.com"/>

### 分类 <Site url="dx2025.com" size="sm" />

<Route namespace="dx2025" :data='{"path":"/:type?/:category?","categories":["new-media"],"example":"/dx2025","parameters":{"type":"内容类别，见下表，默认为空","category":"行业分类，见下表，默认为空"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"分类","maintainers":["nczitzk"],"description":"内容类别\n\n  | 产业观察             | 行业报告         | 政策   | 数据 |\n  | -------------------- | ---------------- | ------ | ---- |\n  | industry-observation | industry-reports | policy | data |\n\n  行业分类\n\n  | 行业                 | 行业名称                                                          |\n  | -------------------- | ----------------------------------------------------------------- |\n  | 新一代信息技术       | next-generation-information-technology-industry-reports           |\n  | 高档数控机床和机器人 | high-grade-cnc-machine-tools-and-robots-industry-reports          |\n  | 航空航天装备         | aerospace-equipment-industry-reports                              |\n  | 海工装备及高技术船舶 | marine-engineering-equipment-and-high-tech-ships-industry-reports |\n  | 先进轨道交通装备     | advanced-rail-transportation-equipment-industry-reports           |\n  | 节能与新能源汽车     | energy-saving-and-new-energy-vehicles-industry-reports            |\n  | 电力装备             | electric-equipment-industry-reports                               |\n  | 农机装备             | agricultural-machinery-equipment-industry-reports                 |\n  | 新材料               | new-material-industry-reports                                     |\n  | 生物医药及医疗器械   | biomedicine-and-medical-devices-industry-reports                  |\n  | 现代服务业           | modern-service-industry-industry-reports                          |\n  | 制造业人才           | manufacturing-talent-industry-reports                             |","location":"index.ts"}' />

内容类别

  | 产业观察             | 行业报告         | 政策   | 数据 |
  | -------------------- | ---------------- | ------ | ---- |
  | industry-observation | industry-reports | policy | data |

  行业分类

  | 行业                 | 行业名称                                                          |
  | -------------------- | ----------------------------------------------------------------- |
  | 新一代信息技术       | next-generation-information-technology-industry-reports           |
  | 高档数控机床和机器人 | high-grade-cnc-machine-tools-and-robots-industry-reports          |
  | 航空航天装备         | aerospace-equipment-industry-reports                              |
  | 海工装备及高技术船舶 | marine-engineering-equipment-and-high-tech-ships-industry-reports |
  | 先进轨道交通装备     | advanced-rail-transportation-equipment-industry-reports           |
  | 节能与新能源汽车     | energy-saving-and-new-energy-vehicles-industry-reports            |
  | 电力装备             | electric-equipment-industry-reports                               |
  | 农机装备             | agricultural-machinery-equipment-industry-reports                 |
  | 新材料               | new-material-industry-reports                                     |
  | 生物医药及医疗器械   | biomedicine-and-medical-devices-industry-reports                  |
  | 现代服务业           | modern-service-industry-industry-reports                          |
  | 制造业人才           | manufacturing-talent-industry-reports                             |

## 懂球帝 <Site url="m.dongqiudi.com"/>

:::tip
-   可以通过头条新闻 + 参数过滤的形式获得早报、专题等内容。
:::

### 球员新闻 <Site url="m.dongqiudi.com" size="sm" />

<Route namespace="dongqiudi" :data='{"path":"/player_news/:id","categories":["new-media"],"example":"/dongqiudi/player_news/50000339","parameters":{"id":"球员 id, 可在[懂球帝数据](https://www.dongqiudi.com/data)中通过其队伍找到"},"radar":[{"source":["www.dongqiudi.com/player/*id"]}],"name":"球员新闻","maintainers":["HenryQW"],"location":"player-news.ts"}' />

### 球队新闻 <Site url="m.dongqiudi.com" size="sm" />

<Route namespace="dongqiudi" :data='{"path":"/team_news/:team","categories":["new-media"],"example":"/dongqiudi/team_news/50001755","parameters":{"team":"球队 id, 可在[懂球帝数据](https://www.dongqiudi.com/data)中找到"},"radar":[{"source":["www.dongqiudi.com/team/*team"]}],"name":"球队新闻","maintainers":["HenryQW"],"location":"team-news.ts"}' />

### 新闻 <Site url="m.dongqiudi.com" size="sm" />

<Route namespace="dongqiudi" :data='{"path":"/top_news/:id?","categories":["new-media"],"example":"/dongqiudi/top_news/1","parameters":{"id":"类别 id，不填默认头条新闻"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["m.dongqiudi.com/home/:id"],"target":"/top_news/:id"}],"name":"新闻","maintainers":["HendricksZheng"],"description":"| 头条 | 深度 | 闲情 | D 站 | 中超 | 国际 | 英超 | 西甲 | 意甲 | 德甲 |\n  | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |\n  | 1    | 55   | 37   | 219  | 56   | 120  | 3    | 5    | 4    | 6    |","location":"top-news.ts"}' />

| 头条 | 深度 | 闲情 | D 站 | 中超 | 国际 | 英超 | 西甲 | 意甲 | 德甲 |
  | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
  | 1    | 55   | 37   | 219  | 56   | 120  | 3    | 5    | 4    | 6    |

### 早报 <Site url="www.dongqiudi.com/special/48" size="sm" />

<Route namespace="dongqiudi" :data='{"path":"/daily","categories":["new-media"],"example":"/dongqiudi/daily","radar":[{"source":["www.dongqiudi.com/special/48"]}],"name":"早报","maintainers":["HenryQW"],"url":"www.dongqiudi.com/special/48","description":":::tip\n部分球队和球员可能会有两个 id, 正确 id 应该由 `5000` 开头.\n:::","location":"daily.ts"}' />

:::tip
部分球队和球员可能会有两个 id, 正确 id 应该由 `5000` 开头.
:::

### 专题 <Site url="m.dongqiudi.com" size="sm" />

<Route namespace="dongqiudi" :data='{"path":"/special/:id","categories":["new-media"],"example":"/dongqiudi/special/41","parameters":{"id":"专题 id, 可自行通过 https://www.dongqiudi.com/special/+数字匹配"},"radar":[{"source":["www.dongqiudi.com/special/:id"]}],"name":"专题","maintainers":["dxmpalb"],"description":"| 新闻大爆炸 | 懂球帝十佳球 | 懂球帝本周 MVP |\n  | ---------- | ------------ | -------------- |\n  | 41         | 52           | 53             |","location":"special.ts"}' />

| 新闻大爆炸 | 懂球帝十佳球 | 懂球帝本周 MVP |
  | ---------- | ------------ | -------------- |
  | 41         | 52           | 53             |

### 足球赛果 <Site url="m.dongqiudi.com" size="sm" />

<Route namespace="dongqiudi" :data='{"path":"/result/:team","categories":["new-media"],"example":"/dongqiudi/result/50001755","parameters":{"team":"球队 id, 可在[懂球帝数据](https://www.dongqiudi.com/data)中找到"},"radar":[{"source":["www.dongqiudi.com/team/*team"]}],"name":"足球赛果","maintainers":["HenryQW"],"location":"result.ts"}' />

## 樊登读书 <Site url="card.dushu.io"/>

### 樊登福州运营中心 <Site url="www.dushu365.com*" size="sm" />

<Route namespace="dushu" :data='{"path":"/fuzhou","categories":["new-media"],"example":"/dushu/fuzhou","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.dushu365.com*"]}],"name":"樊登福州运营中心","maintainers":["Fatpandac"],"url":"www.dushu365.com*","location":"fuzhou/index.ts"}' />

## 仮面ライダ <Site url="kamen-rider-official.com"/>

### 最新情報 <Site url="kamen-rider-official.com" size="sm" />

<Route namespace="kamen-rider-official" :data='{"path":"/news/:category?","categories":["new-media"],"example":"/kamen-rider-official/news","parameters":{"category":"Category, see below, すべて by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"最新情報","maintainers":["nczitzk"],"description":"| Category                               |\n  | -------------------------------------- |\n  | すべて                                 |\n  | テレビ                                 |\n  | 映画・V シネマ等                       |\n  | Blu-ray・DVD、配信等                   |\n  | 20 作記念グッズ・東映 EC 商品          |\n  | 石ノ森章太郎生誕 80 周年記念商品       |\n  | 玩具・カード                           |\n  | 食品・飲料・菓子                       |\n  | 子供生活雑貨                           |\n  | アパレル・大人向け雑貨                 |\n  | フィギュア・ホビー・一番くじ・プライズ |\n  | ゲーム・デジタル                       |\n  | 雑誌・書籍・漫画                       |\n  | 音楽                                   |\n  | 映像                                   |\n  | イベント                               |\n  | ホテル・レストラン等                   |\n  | キャンペーン・タイアップ等             |\n  | その他                                 |\n  | KAMEN RIDER STORE                      |\n  | THE 鎧武祭り                           |\n  | 鎧武外伝                               |\n  | 仮面ライダーリバイス                   |\n  | ファイナルステージ                     |\n  | THE50 周年展                           |\n  | 風都探偵                               |\n  | 仮面ライダーギーツ                     |\n  | 仮面ライダーアウトサイダーズ           |\n  | 仮面ライダーガッチャード               |\n  | 仮面ライダー BLACK SUN                 |","location":"news.ts"}' />

| Category                               |
  | -------------------------------------- |
  | すべて                                 |
  | テレビ                                 |
  | 映画・V シネマ等                       |
  | Blu-ray・DVD、配信等                   |
  | 20 作記念グッズ・東映 EC 商品          |
  | 石ノ森章太郎生誕 80 周年記念商品       |
  | 玩具・カード                           |
  | 食品・飲料・菓子                       |
  | 子供生活雑貨                           |
  | アパレル・大人向け雑貨                 |
  | フィギュア・ホビー・一番くじ・プライズ |
  | ゲーム・デジタル                       |
  | 雑誌・書籍・漫画                       |
  | 音楽                                   |
  | 映像                                   |
  | イベント                               |
  | ホテル・レストラン等                   |
  | キャンペーン・タイアップ等             |
  | その他                                 |
  | KAMEN RIDER STORE                      |
  | THE 鎧武祭り                           |
  | 鎧武外伝                               |
  | 仮面ライダーリバイス                   |
  | ファイナルステージ                     |
  | THE50 周年展                           |
  | 風都探偵                               |
  | 仮面ライダーギーツ                     |
  | 仮面ライダーアウトサイダーズ           |
  | 仮面ライダーガッチャード               |
  | 仮面ライダー BLACK SUN                 |

## 封面新闻 <Site url="thecover.cn"/>

### 频道 <Site url="thecover.cn" size="sm" />

<Route namespace="thecover" :data='{"path":"/channel/:id?","categories":["new-media"],"example":"/thecover/channel/3560","parameters":{"id":"对应id,可在频道链接中获取，默认为3892"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"频道","maintainers":["yuxinliu-alex"],"description":"| 天下 | 四川 | 辟谣 | 国际 | 云招考 | 30 秒 | 拍客 | 体育 | 国内 | 帮扶铁军 | 文娱 | 宽窄 | 商业 | 千面 | 封面号 |\n  | ---- | ---- | ---- | ---- | ------ | ----- | ---- | ---- | ---- | -------- | ---- | ---- | ---- | ---- | ------ |\n  | 3892 | 3560 | 3909 | 3686 | 11     | 3902  | 3889 | 3689 | 1    | 4002     | 12   | 46   | 4    | 21   | 17     |","location":"channel.ts"}' />

| 天下 | 四川 | 辟谣 | 国际 | 云招考 | 30 秒 | 拍客 | 体育 | 国内 | 帮扶铁军 | 文娱 | 宽窄 | 商业 | 千面 | 封面号 |
  | ---- | ---- | ---- | ---- | ------ | ----- | ---- | ---- | ---- | -------- | ---- | ---- | ---- | ---- | ------ |
  | 3892 | 3560 | 3909 | 3686 | 11     | 3902  | 3889 | 3689 | 1    | 4002     | 12   | 46   | 4    | 21   | 17     |

## 風傳媒 <Site url="storm.mg"/>

### 分类 <Site url="storm.mg" size="sm" />

<Route namespace="storm" :data='{"path":"/:category?/:id?","categories":["new-media"],"example":"/storm","parameters":{"category":"分类，见下表，默认为新聞總覽","id":"子分类 ID，可在 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["storm.mg/:category/:id"]}],"name":"分类","maintainers":["nczitzk"],"description":"| 新聞總覽 | 地方新聞      | 歷史頻道 | 評論總覽    |\n  | -------- | ------------- | -------- | ----------- |\n  | articles | localarticles | history  | all-comment |\n\n  :::tip\n  支持形如 `https://www.storm.mg/category/118` 的路由，即 [`/storm/category/118`](https://rsshub.app/storm/category/118)\n\n  支持形如 `https://www.storm.mg/localarticle-category/s149845` 的路由，即 [`/storm/localarticle-category/s149845`](https://rsshub.app/storm/localarticle-category/s149845)\n  :::","location":"index.ts"}' />

| 新聞總覽 | 地方新聞      | 歷史頻道 | 評論總覽    |
  | -------- | ------------- | -------- | ----------- |
  | articles | localarticles | history  | all-comment |

  :::tip
  支持形如 `https://www.storm.mg/category/118` 的路由，即 [`/storm/category/118`](https://rsshub.app/storm/category/118)

  支持形如 `https://www.storm.mg/localarticle-category/s149845` 的路由，即 [`/storm/localarticle-category/s149845`](https://rsshub.app/storm/localarticle-category/s149845)
  :::

## 凤凰网 <Site url="feng.ifeng.com"/>

### Unknown <Site url="feng.ifeng.com" size="sm" />

<Route namespace="ifeng" :data='{"path":"/news/*","name":"Unknown","maintainers":[],"location":"news.ts"}' />

### 大风号 <Site url="feng.ifeng.com" size="sm" />

<Route namespace="ifeng" :data='{"path":"/feng/:id/:type","categories":["new-media"],"example":"/ifeng/feng/2583/doc","parameters":{"id":"对应 id，可在 大风号作者页面 找到","type":"类型，见下表"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"大风号","maintainers":["Jamch"],"description":"| 文章 | 视频  |\n  | ---- | ----- |\n  | doc  | video |","location":"feng.ts"}' />

| 文章 | 视频  |
  | ---- | ----- |
  | doc  | video |

## 福利吧 <Site url="fuliba2023.net"/>

### 最新 <Site url="fuliba2023.net/" size="sm" />

<Route namespace="fuliba" :data='{"path":"/latest","categories":["new-media"],"example":"/fuliba/latest","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["fuliba2023.net/"]}],"name":"最新","maintainers":["shinemoon"],"url":"fuliba2023.net/","location":"latest.ts"}' />

## 观察者网 <Site url="guancha.cn"/>

### Unknown <Site url="guancha.cn/" size="sm" />

<Route namespace="guancha" :data='{"path":"/topic/:id/:order?","radar":[{"source":["guancha.cn/"],"target":"/:category?"}],"name":"Unknown","maintainers":["occupy5","nczitzk"],"url":"guancha.cn/","location":"topic.ts"}' />

### 个人主页文章 <Site url="guancha.cn" size="sm" />

<Route namespace="guancha" :data='{"path":"/personalpage/:uid","categories":["new-media"],"example":"/guancha/personalpage/243983","parameters":{"uid":"用户id， 可在URL中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"个人主页文章","maintainers":["Jeason0228"],"location":"personalpage.ts"}' />

### 观学院 <Site url="guancha.cn/" size="sm" />

<Route namespace="guancha" :data='{"path":"/member/:category?","categories":["new-media"],"example":"/guancha/member/recommend","parameters":{"category":"分类，见下表"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["guancha.cn/"],"target":"/:category?"}],"name":"观学院","maintainers":["nczitzk"],"url":"guancha.cn/","description":"| 精选      | 观书堂 | 在线课  | 观学院   |\n  | --------- | ------ | ------- | -------- |\n  | recommend | books  | courses | huodongs |","location":"member.ts"}' />

| 精选      | 观书堂 | 在线课  | 观学院   |
  | --------- | ------ | ------- | -------- |
  | recommend | books  | courses | huodongs |

### 首页 <Site url="guancha.cn/" size="sm" />

<Route namespace="guancha" :data='{"path":"/:category?","categories":["new-media"],"example":"/guancha","parameters":{"category":"分类，见下表，默认为全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["guancha.cn/"]}],"name":"首页","maintainers":["nczitzk","Jeason0228"],"url":"guancha.cn/","description":"| 全部 | 评论 & 研究 | 要闻  | 风闻    | 热点新闻 | 滚动新闻 |\n  | ---- | ----------- | ----- | ------- | -------- | -------- |\n  | all  | review      | story | fengwen | redian   | gundong  |\n\n  home = 评论 & 研究 + 要闻 + 风闻\n\n  others = 热点新闻 + 滚动新闻\n\n  :::tip\n  观察者网首页左中右的三个 column 分别对应 **评论 & 研究**、**要闻**、**风闻** 三个部分。\n  :::","location":"index.ts"}' />

| 全部 | 评论 & 研究 | 要闻  | 风闻    | 热点新闻 | 滚动新闻 |
  | ---- | ----------- | ----- | ------- | -------- | -------- |
  | all  | review      | story | fengwen | redian   | gundong  |

  home = 评论 & 研究 + 要闻 + 风闻

  others = 热点新闻 + 滚动新闻

  :::tip
  观察者网首页左中右的三个 column 分别对应 **评论 & 研究**、**要闻**、**风闻** 三个部分。
  :::

### 头条 <Site url="guancha.cn/GuanChaZheTouTiao" size="sm" />

<Route namespace="guancha" :data='{"path":"/headline","categories":["new-media"],"example":"/guancha/headline","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["guancha.cn/GuanChaZheTouTiao","guancha.cn/"]}],"name":"头条","maintainers":["nczitzk"],"url":"guancha.cn/GuanChaZheTouTiao","location":"headline.ts"}' />

## 国家高端智库 / 综合开发研究院 <Site url="cdi.com.cn"/>

### 栏目 <Site url="cdi.com.cn" size="sm" />

<Route namespace="cdi" :data='{"path":"/:id?","categories":["new-media"],"example":"/cdi","parameters":{"id":"分类，见下表，默认为综研国策"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"栏目","maintainers":["nczitzk"],"description":"| 樊纲观点 | 综研国策 | 综研观察 | 综研专访 | 综研视点 | 银湖新能源 |\n  | -------- | -------- | -------- | -------- | -------- | ---------- |\n  | 102      | 152      | 150      | 153      | 154      | 151        |","location":"index.ts"}' />

| 樊纲观点 | 综研国策 | 综研观察 | 综研专访 | 综研视点 | 银湖新能源 |
  | -------- | -------- | -------- | -------- | -------- | ---------- |
  | 102      | 152      | 150      | 153      | 154      | 151        |

## 果壳网 <Site url="guokr.com"/>

### 果壳网专栏 <Site url="guokr.com/" size="sm" />

<Route namespace="guokr" :data='{"path":"/:channel","categories":["new-media"],"example":"/guokr/calendar","parameters":{"channel":"专栏类别"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["guokr.com/"]}],"name":"果壳网专栏","maintainers":["DHPO","hoilc"],"url":"guokr.com/","description":"| 物种日历 | 吃货研究所 | 美丽也是技术活 |\n  | -------- | ---------- | -------------- |\n  | calendar | institute  | beauty         |","location":"channel.ts"}' />

| 物种日历 | 吃货研究所 | 美丽也是技术活 |
  | -------- | ---------- | -------------- |
  | calendar | institute  | beauty         |

### 科学人 <Site url="guokr.com/scientific" size="sm" />

<Route namespace="guokr" :data='{"path":"/scientific","categories":["new-media"],"example":"/guokr/scientific","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["guokr.com/scientific","guokr.com/"]}],"name":"科学人","maintainers":["alphardex","nczitzk"],"url":"guokr.com/scientific","location":"scientific.ts"}' />

## 后续 <Site url="houxu.app"/>

### Live <Site url="houxu.app/" size="sm" />

<Route namespace="houxu" :data='{"path":"/lives/:id","categories":["new-media"],"example":"/houxu/lives/33899","parameters":{"id":"编号，可在对应 Live 页面的 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["houxu.app/lives/:id","houxu.app/"]}],"name":"Live","maintainers":["nczitzk"],"url":"houxu.app/","location":"lives.ts"}' />

### Unknown <Site url="houxu.app/" size="sm" />

<Route namespace="houxu" :data='{"path":["/featured","/index","/"],"radar":[{"source":["houxu.app/"],"target":""}],"name":"Unknown","maintainers":[],"url":"houxu.app/","location":"index.ts"}' />

### Unknown <Site url="houxu.app/" size="sm" />

<Route namespace="houxu" :data='{"path":["/featured","/index","/"],"radar":[{"source":["houxu.app/"],"target":""}],"name":"Unknown","maintainers":[],"url":"houxu.app/","location":"index.ts"}' />

### Unknown <Site url="houxu.app/" size="sm" />

<Route namespace="houxu" :data='{"path":["/featured","/index","/"],"radar":[{"source":["houxu.app/"],"target":""}],"name":"Unknown","maintainers":[],"url":"houxu.app/","location":"index.ts"}' />

### 跟踪 <Site url="houxu.app/memory" size="sm" />

<Route namespace="houxu" :data='{"path":"/memory","categories":["new-media"],"example":"/houxu/memory","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["houxu.app/memory","houxu.app/"]}],"name":"跟踪","maintainers":["nczitzk"],"url":"houxu.app/memory","location":"memory.ts"}' />

### 专栏 <Site url="houxu.app/events" size="sm" />

<Route namespace="houxu" :data='{"path":"/events","categories":["new-media"],"example":"/houxu/events","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["houxu.app/events","houxu.app/"]}],"name":"专栏","maintainers":["nczitzk"],"url":"houxu.app/events","location":"events.ts"}' />

## 虎嗅 <Site url="huxiu.com"/>

### 24 小时 <Site url="huxiu.com/moment" size="sm" />

<Route namespace="huxiu" :data='{"path":"/moment","categories":["new-media"],"example":"/huxiu/moment","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":true,"supportPodcast":true,"supportScihub":false},"radar":[{"source":["huxiu.com/moment"]}],"name":"24 小时","maintainers":["nczitzk"],"url":"huxiu.com/moment","location":"moment.ts"}' />

### Unknown <Site url="huxiu.com" size="sm" />

<Route namespace="huxiu" :data='{"path":"/club/:id","name":"Unknown","maintainers":["nczitzk"],"location":"club.ts"}' />

### Unknown <Site url="huxiu.com" size="sm" />

<Route namespace="huxiu" :data='{"path":["/author/:id/:type?","/member/:id/:type?"],"name":"Unknown","maintainers":[],"description":"| TA 的文章 | TA 的 24 小时 |\n  | --------- | ------------- |\n  | article   | moment        |","location":"member.ts"}' />

| TA 的文章 | TA 的 24 小时 |
  | --------- | ------------- |
  | article   | moment        |

### Unknown <Site url="huxiu.com" size="sm" />

<Route namespace="huxiu" :data='{"path":["/author/:id/:type?","/member/:id/:type?"],"name":"Unknown","maintainers":[],"description":"| TA 的文章 | TA 的 24 小时 |\n  | --------- | ------------- |\n  | article   | moment        |","location":"member.ts"}' />

| TA 的文章 | TA 的 24 小时 |
  | --------- | ------------- |
  | article   | moment        |

### 标签 <Site url="huxiu.com" size="sm" />

<Route namespace="huxiu" :data='{"path":"/tag/:id","categories":["new-media"],"example":"/huxiu/tag/291","parameters":{"id":"标签 id，可在对应标签页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":true,"supportPodcast":true,"supportScihub":false},"name":"标签","maintainers":["xyqfer","HenryQW","nczitzk"],"description":"更多标签请参见 [标签](https://www.huxiu.com/tags)","location":"tag.ts"}' />

更多标签请参见 [标签](https://www.huxiu.com/tags)

### 简报 <Site url="huxiu.com" size="sm" />

<Route namespace="huxiu" :data='{"path":"/briefcolumn/:id","categories":["new-media"],"example":"/huxiu/briefcolumn/1","parameters":{"id":"简报 id，可在对应简报页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":true,"supportPodcast":true,"supportScihub":false},"name":"简报","maintainers":["Fatpandac","nczitzk"],"location":"brief-column.ts"}' />

### 搜索 <Site url="huxiu.com/" size="sm" />

<Route namespace="huxiu" :data='{"path":"/search/:keyword","categories":["new-media"],"example":"/huxiu/search/生活","parameters":{"keyword":"关键字"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":true,"supportPodcast":true,"supportScihub":false},"radar":[{"source":["huxiu.com/"]}],"name":"搜索","maintainers":["xyqfer","HenryQW","nczitzk"],"url":"huxiu.com/","location":"search.ts"}' />

### 文集 <Site url="huxiu.com" size="sm" />

<Route namespace="huxiu" :data='{"path":"/collection/:id","categories":["new-media"],"example":"/huxiu/collection/212","parameters":{"id":"文集 id，可在对应文集页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":true,"supportPodcast":true,"supportScihub":false},"name":"文集","maintainers":["AlexdanerZe","nczitzk"],"description":"更多文集请参见 [文集](https://www.huxiu.com/collection)","location":"collection.ts"}' />

更多文集请参见 [文集](https://www.huxiu.com/collection)

### 资讯 <Site url="huxiu.com/article" size="sm" />

<Route namespace="huxiu" :data='{"path":["/article","/channel/:id?"],"categories":["new-media"],"example":"/huxiu/article","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":true,"supportPodcast":true,"supportScihub":false},"radar":[{"source":["huxiu.com/article"]}],"name":"资讯","maintainers":["HenryQW","nczitzk"],"description":"| 视频 | 车与出行 | 年轻一代 | 十亿消费者 | 前沿科技 |\n  | ---- | -------- | -------- | ---------- | -------- |\n  | 10   | 21       | 106      | 103        | 105      |\n\n  | 财经 | 娱乐淘金 | 医疗健康 | 文化教育 | 出海 |\n  | ---- | -------- | -------- | -------- | ---- |\n  | 115  | 22       | 111      | 113      | 114  |\n\n  | 金融地产 | 企业服务 | 创业维艰 | 社交通讯 | 全球热点 | 生活腔调 |\n  | -------- | -------- | -------- | -------- | -------- | -------- |\n  | 102      | 110      | 2        | 112      | 107      | 4        |","url":"huxiu.com/article","location":"channel.ts"}' />

| 视频 | 车与出行 | 年轻一代 | 十亿消费者 | 前沿科技 |
  | ---- | -------- | -------- | ---------- | -------- |
  | 10   | 21       | 106      | 103        | 105      |

  | 财经 | 娱乐淘金 | 医疗健康 | 文化教育 | 出海 |
  | ---- | -------- | -------- | -------- | ---- |
  | 115  | 22       | 111      | 113      | 114  |

  | 金融地产 | 企业服务 | 创业维艰 | 社交通讯 | 全球热点 | 生活腔调 |
  | -------- | -------- | -------- | -------- | -------- | -------- |
  | 102      | 110      | 2        | 112      | 107      | 4        |

### 资讯 <Site url="huxiu.com/article" size="sm" />

<Route namespace="huxiu" :data='{"path":["/article","/channel/:id?"],"categories":["new-media"],"example":"/huxiu/article","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":true,"supportPodcast":true,"supportScihub":false},"radar":[{"source":["huxiu.com/article"]}],"name":"资讯","maintainers":["HenryQW","nczitzk"],"description":"| 视频 | 车与出行 | 年轻一代 | 十亿消费者 | 前沿科技 |\n  | ---- | -------- | -------- | ---------- | -------- |\n  | 10   | 21       | 106      | 103        | 105      |\n\n  | 财经 | 娱乐淘金 | 医疗健康 | 文化教育 | 出海 |\n  | ---- | -------- | -------- | -------- | ---- |\n  | 115  | 22       | 111      | 113      | 114  |\n\n  | 金融地产 | 企业服务 | 创业维艰 | 社交通讯 | 全球热点 | 生活腔调 |\n  | -------- | -------- | -------- | -------- | -------- | -------- |\n  | 102      | 110      | 2        | 112      | 107      | 4        |","url":"huxiu.com/article","location":"channel.ts"}' />

| 视频 | 车与出行 | 年轻一代 | 十亿消费者 | 前沿科技 |
  | ---- | -------- | -------- | ---------- | -------- |
  | 10   | 21       | 106      | 103        | 105      |

  | 财经 | 娱乐淘金 | 医疗健康 | 文化教育 | 出海 |
  | ---- | -------- | -------- | -------- | ---- |
  | 115  | 22       | 111      | 113      | 114  |

  | 金融地产 | 企业服务 | 创业维艰 | 社交通讯 | 全球热点 | 生活腔调 |
  | -------- | -------- | -------- | -------- | -------- | -------- |
  | 102      | 110      | 2        | 112      | 107      | 4        |

## 机核网 <Site url="gcores.com"/>

### 标签 <Site url="gcores.com" size="sm" />

<Route namespace="gcores" :data='{"path":"/tag/:tag/:category?","categories":["new-media"],"example":"/gcores/tag/42/articles","parameters":{"tag":"标签名，可在选定标签分类页面的 URL 中找到，如视觉动物——42","category":"分类名"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["gcores.com/categories/:tag","gcores.com/"],"target":"/tag/:tag"}],"name":"标签","maintainers":["StevenRCE0"],"description":"分类名同上。","location":"tag.ts"}' />

分类名同上。

### 播客 <Site url="gcores.com/radios" size="sm" />

<Route namespace="gcores" :data='{"path":"/radios/:category?","categories":["new-media"],"example":"/gcores/radios/45","parameters":{"category":"分类名，默认为全部，可在分类页面的 URL 中找到，如 Gadio News -- 45"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":true,"supportScihub":false},"radar":[{"source":["gcores.com/categories/:category"],"target":"/radios/:category"}],"name":"播客","maintainers":["eternasuno"],"url":"gcores.com/radios","location":"radio.ts"}' />

### 分类 <Site url="gcores.com" size="sm" />

<Route namespace="gcores" :data='{"path":"/category/:category","categories":["new-media"],"example":"/gcores/category/news","parameters":{"category":"分类名"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["gcores.com/:category"]}],"name":"分类","maintainers":["MoguCloud","StevenRCE0"],"description":"| 资讯 | 视频   | 电台   | 文章     |\n  | ---- | ------ | ------ | -------- |\n  | news | videos | radios | articles |","location":"category.ts"}' />

| 资讯 | 视频   | 电台   | 文章     |
  | ---- | ------ | ------ | -------- |
  | news | videos | radios | articles |

### 专题文章 <Site url="gcores.com" size="sm" />

<Route namespace="gcores" :data='{"path":"/collections/:collection","categories":["new-media"],"example":"/gcores/collections/64","parameters":{"collection":"专题id，可在专题页面的 URL 中找到，如 游戏开发设计心得分享 -- 64"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["gcores.com/collections/:collection"]}],"name":"专题文章","maintainers":["kudryavka1013"],"location":"collection.ts"}' />

## 加美财经 <Site url="caus.com"/>

### 分类 <Site url="caus.com" size="sm" />

<Route namespace="caus" :data='{"path":"/:category?","categories":["new-media"],"example":"/caus","parameters":{"category":"分类，见下表，默认为全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"分类","maintainers":["nczitzk"],"description":"| 全部 | 要闻 | 商业 | 快讯 | 财富 | 生活 |\n  | ---- | ---- | ---- | ---- | ---- | ---- |\n  | 0    | 1    | 2    | 3    | 8    | 6    |","location":"index.ts"}' />

| 全部 | 要闻 | 商业 | 快讯 | 财富 | 生活 |
  | ---- | ---- | ---- | ---- | ---- | ---- |
  | 0    | 1    | 2    | 3    | 8    | 6    |

## 簡訊設計 <Site url="blog.simpleinfo.cc"/>

### 志祺七七 <Site url="blog.simpleinfo.cc" size="sm" />

<Route namespace="simpleinfo" :data='{"path":"/:category?","categories":["new-media"],"example":"/simpleinfo","parameters":{"category":"分类名"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["blog.simpleinfo.cc/blog/:category"],"target":"/:category"}],"name":"志祺七七","maintainers":["haukeng"],"description":"| 夥伴聊聊 | 專案設計 |\n  | -------- | -------- |\n  | work     | talk     |\n\n  | 國內外新聞 | 政治百分百 | 社會觀察家 | 心理與哲學            |\n  | ---------- | ---------- | ---------- | --------------------- |\n  | news       | politics   | society    | psychology-philosophy |\n\n  | 科學大探索 | 環境與健康         | ACG 快樂聊 | 好書籍分享   | 其它主題     |\n  | ---------- | ------------------ | ---------- | ------------ | ------------ |\n  | science    | environment-health | acg        | book-sharing | other-topics |","location":"index.ts"}' />

| 夥伴聊聊 | 專案設計 |
  | -------- | -------- |
  | work     | talk     |

  | 國內外新聞 | 政治百分百 | 社會觀察家 | 心理與哲學            |
  | ---------- | ---------- | ---------- | --------------------- |
  | news       | politics   | society    | psychology-philosophy |

  | 科學大探索 | 環境與健康         | ACG 快樂聊 | 好書籍分享   | 其它主題     |
  | ---------- | ------------------ | ---------- | ------------ | ------------ |
  | science    | environment-health | acg        | book-sharing | other-topics |

## 健康界 <Site url="cn-healthcare.com"/>

### 首页 <Site url="cn-healthcare.com/" size="sm" />

<Route namespace="cn-healthcare" :data='{"path":"/index","categories":["new-media"],"example":"/cn-healthcare/index","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["cn-healthcare.com/"]}],"name":"首页","maintainers":["qnloft"],"url":"cn-healthcare.com/","location":"index.ts"}' />

## 今日热榜 <Site url="tophub.today"/>

:::warning
由于需要登录后的 Cookie 值才能获取原始链接，所以需要自建，需要在环境变量中配置 `TOPHUB_COOKIE`，详情见部署页面的配置模块。
:::

### 榜单 <Site url="tophub.today" size="sm" />

<Route namespace="tophub" :data='{"path":"/:id","categories":["new-media"],"example":"/tophub/Om4ejxvxEN","parameters":{"id":"榜单id，可在 URL 中找到"},"features":{"requireConfig":[{"name":"TOPHUB_COOKIE","optional":true,"description":""}],"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["tophub.today/n/:id"]}],"name":"榜单","maintainers":["LogicJake"],"location":"index.ts"}' />

### 榜单列表 <Site url="tophub.today" size="sm" />

<Route namespace="tophub" :data='{"path":"/list/:id","categories":["new-media"],"example":"/tophub/list/Om4ejxvxEN","parameters":{"id":"榜单id，可在 URL 中找到"},"features":{"requireConfig":[{"name":"TOPHUB_COOKIE","optional":true,"description":""}],"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["tophub.today/n/:id"]}],"name":"榜单列表","maintainers":["akynazh"],"description":":::tip\n将榜单条目集合到一个列表中，可避免推送大量条目，更符合阅读习惯且有热度排序，推荐使用。\n:::","location":"list.ts"}' />

:::tip
将榜单条目集合到一个列表中，可避免推送大量条目，更符合阅读习惯且有热度排序，推荐使用。
:::

## 靠谱新闻 <Site url="kaopu.news"/>

### 全部 <Site url="kaopu.news" size="sm" />

<Route namespace="kaopu" :data='{"path":"/news/:language?","categories":["new-media"],"example":"/news/zh-hans","parameters":{"language":"语言"},"radar":[{"source":["kaopu.news/"]}],"name":"全部","maintainers":["fashioncj"],"description":"| 简体中文    | 繁体中文     | \n  | ------- | -------- | \n  | zh-hans | zh-hant | ","location":"news.ts"}' />

| 简体中文    | 繁体中文     | 
  | ------- | -------- | 
  | zh-hans | zh-hant | 

## 科学网 <Site url="blog.sciencenet.cn"/>

### 精选博客 <Site url="blog.sciencenet.cn" size="sm" />

<Route namespace="sciencenet" :data='{"path":"/blog/:type?/:time?/:sort?","categories":["new-media"],"example":"/sciencenet/blog","parameters":{"type":"类型，见下表，默认为推荐","time":"时间，见下表，默认为所有时间","sort":"排序，见下表，默认为按发表时间排序"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"精选博客","maintainers":["nczitzk"],"description":"类型\n\n  | 精选      | 最新 | 热门 |\n  | --------- | ---- | ---- |\n  | recommend | new  | hot  |\n\n  时间\n\n  | 36 小时内精选博文 | 一周内精选博文 | 一月内精选博文 | 半年内精选博文 | 所有时间精选博文 |\n  | ----------------- | -------------- | -------------- | -------------- | ---------------- |\n  | 1                 | 2              | 3              | 4              | 5                |\n\n  排序\n\n  | 按发表时间排序 | 按评论数排序 | 按点击数排序 |\n  | -------------- | ------------ | ------------ |\n  | 1              | 2            | 3            |","location":"blog.ts"}' />

类型

  | 精选      | 最新 | 热门 |
  | --------- | ---- | ---- |
  | recommend | new  | hot  |

  时间

  | 36 小时内精选博文 | 一周内精选博文 | 一月内精选博文 | 半年内精选博文 | 所有时间精选博文 |
  | ----------------- | -------------- | -------------- | -------------- | ---------------- |
  | 1                 | 2              | 3              | 4              | 5                |

  排序

  | 按发表时间排序 | 按评论数排序 | 按点击数排序 |
  | -------------- | ------------ | ------------ |
  | 1              | 2            | 3            |

### 用户博客 <Site url="blog.sciencenet.cn" size="sm" />

<Route namespace="sciencenet" :data='{"path":"/user/:id","categories":["new-media"],"example":"/sciencenet/user/tony8310","parameters":{"id":"用户 id，可在对用户博客页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["blog.sciencenet.cn/u/:id","blog.sciencenet.cn/"]}],"name":"用户博客","maintainers":["nczitzk"],"location":"user.ts"}' />

## 快科技 <Site url="m.mydrivers.com"/>

### Unknown <Site url="m.mydrivers.com/" size="sm" />

<Route namespace="mydrivers" :data='{"path":["/cid/:id?","/zhibo"],"name":"Unknown","maintainers":[],"url":"m.mydrivers.com/","location":"cid.ts"}' />

### Unknown <Site url="m.mydrivers.com/" size="sm" />

<Route namespace="mydrivers" :data='{"path":["/cid/:id?","/zhibo"],"name":"Unknown","maintainers":[],"url":"m.mydrivers.com/","location":"cid.ts"}' />

### Unknown <Site url="m.mydrivers.com" size="sm" />

<Route namespace="mydrivers" :data='{"path":"/:category{.+}?","name":"Unknown","maintainers":[],"location":"index.ts"}' />

### 排行 <Site url="m.mydrivers.com/newsclass.aspx" size="sm" />

<Route namespace="mydrivers" :data='{"path":"/rank/:range?","categories":["new-media"],"example":"/mydrivers/rank","parameters":{"range":"时间范围，见下表，默认为24小时最热"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["m.mydrivers.com/newsclass.aspx"],"target":"/rank"}],"name":"排行","maintainers":["nczitzk"],"url":"m.mydrivers.com/newsclass.aspx","description":"| 24 小时最热 | 本周最热 | 本月最热 |\n  | ----------- | -------- | -------- |\n  | 0           | 1        | 2        |","location":"rank.ts"}' />

| 24 小时最热 | 本周最热 | 本月最热 |
  | ----------- | -------- | -------- |
  | 0           | 1        | 2        |

## 雷峰网 <Site url="leiphone.com"/>

### Unknown <Site url="leiphone.com/" size="sm" />

<Route namespace="leiphone" :data='{"path":"/:do?/:keyword?","radar":[{"source":["leiphone.com/"],"target":""}],"name":"Unknown","maintainers":[],"url":"leiphone.com/","location":"index.ts"}' />

### 业界资讯 <Site url="leiphone.com/" size="sm" />

<Route namespace="leiphone" :data='{"path":"/newsflash","categories":["new-media"],"example":"/leiphone/newsflash","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["leiphone.com/"]}],"name":"业界资讯","maintainers":[],"url":"leiphone.com/","location":"newsflash.ts"}' />

## 链新闻 ABMedia <Site url="www.abmedia.io"/>

### 类别 <Site url="www.abmedia.io" size="sm" />

<Route namespace="abmedia" :data='{"path":"/:category?","categories":["new-media"],"example":"/abmedia/technology-development","parameters":{"category":"类别，默认为产品技术"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.abmedia.io/category/:catehory"],"target":"/:category"}],"name":"类别","maintainers":[],"description":"参数可以从链接中拿到，如：\n\n  `https://www.abmedia.io/category/technology-development` 对应 `/abmedia/technology-development`","location":"category.ts"}' />

参数可以从链接中拿到，如：

  `https://www.abmedia.io/category/technology-development` 对应 `/abmedia/technology-development`

### 首页最新新闻 <Site url="www.abmedia.io/" size="sm" />

<Route namespace="abmedia" :data='{"path":"/index","categories":["new-media"],"example":"/abmedia/index","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.abmedia.io/"]}],"name":"首页最新新闻","maintainers":[],"url":"www.abmedia.io/","location":"index.ts"}' />

## 链捕手 ChainCatcher <Site url="chaincatcher.com"/>

### Unknown <Site url="chaincatcher.com/" size="sm" />

<Route namespace="chaincatcher" :data='{"path":"/","radar":[{"source":["chaincatcher.com/"],"target":""}],"name":"Unknown","maintainers":["TonyRL"],"url":"chaincatcher.com/","location":"home.ts"}' />

### 快讯 <Site url="chaincatcher.com/news" size="sm" />

<Route namespace="chaincatcher" :data='{"path":"/news","categories":["new-media"],"example":"/chaincatcher/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["chaincatcher.com/news","chaincatcher.com/"]}],"name":"快讯","maintainers":["TonyRL"],"url":"chaincatcher.com/news","location":"news.ts"}' />

## 量子位 <Site url="qbitai.com"/>

### 标签 <Site url="qbitai.com" size="sm" />

<Route namespace="qbitai" :data='{"path":"/tag/:tag","categories":["new-media"],"example":"/qbitai/tag/大语言模型","parameters":{"tag":"标签名"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["qbitai.com/tag/:tag"]}],"name":"标签","maintainers":["FuryMartin"],"location":"tag.ts"}' />

### 分类 <Site url="qbitai.com" size="sm" />

<Route namespace="qbitai" :data='{"path":"/category/:category","categories":["new-media"],"example":"/qbitai/category/资讯","parameters":{"category":"分类名，见下表"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["qbitai.com/category/:category"]}],"name":"分类","maintainers":["FuryMartin"],"description":"| 资讯 | 数码     | 智能车 | 智库  | 活动    |\n| ---- | -------- | ------ | ----- | ------- |\n| 资讯 | ebandeng | auto   | zhiku | huodong |","location":"category.ts"}' />

| 资讯 | 数码     | 智能车 | 智库  | 活动    |
| ---- | -------- | ------ | ----- | ------- |
| 资讯 | ebandeng | auto   | zhiku | huodong |

## 隆众资讯 <Site url="oilchem.net"/>

### 资讯 <Site url="oilchem.net" size="sm" />

<Route namespace="oilchem" :data='{"path":"/:type?/:category?/:subCategory?","categories":["new-media"],"example":"/oilchem/list/140/18263","parameters":{"type":"类别 id，可在对应类别页中找到，默认为首页","category":"分类 id，可在对应分类页中找到","subCategory":"子分类 id，可在对应分类页中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"资讯","maintainers":["nczitzk"],"description":"以下是几个例子：\n\n  [**化工**](https://chem.oilchem.net) `https://chem.oilchem.net` 中，类别 id 为 `chem`，分类 id 为空，子分类 id 为空，对应路由即为 [`/oilchem/chem`](https://rsshub.app/oilchem/list/140/18263)\n\n  [**甲醇**](https://chem.oilchem.net/chemical/methanol.shtml) 的相关资讯有两个页面入口：其一 `https://chem.oilchem.net/chemical/methanol.shtml` 中，类别 id 为 `chem`，分类 id 为 `chemical`，子分类 id 为 `methanol`，对应路由即为 [`/oilchem/chem/chemical/methanol`](https://rsshub.app/oilchem/chem/chemical/methanol) 或其二 `https://list.oilchem.net/140` 中，类别 id 为 `list`，分类 id 为 `140`，子分类 id 为空，对应路由即为 [`/oilchem/list/140`](https://rsshub.app/oilchem/list/140)；\n\n  [**甲醇热点聚焦**](https://list.oilchem.net/140/18263) `https://list.oilchem.net/140/18263` 中，类别 id 为 `list`，分类 id 为 `140`，子分类 id 为 `18263`，对应路由即为 [`/oilchem/list/140/18263`](https://rsshub.app/oilchem/list/140/18263)","location":"index.ts"}' />

以下是几个例子：

  [**化工**](https://chem.oilchem.net) `https://chem.oilchem.net` 中，类别 id 为 `chem`，分类 id 为空，子分类 id 为空，对应路由即为 [`/oilchem/chem`](https://rsshub.app/oilchem/list/140/18263)

  [**甲醇**](https://chem.oilchem.net/chemical/methanol.shtml) 的相关资讯有两个页面入口：其一 `https://chem.oilchem.net/chemical/methanol.shtml` 中，类别 id 为 `chem`，分类 id 为 `chemical`，子分类 id 为 `methanol`，对应路由即为 [`/oilchem/chem/chemical/methanol`](https://rsshub.app/oilchem/chem/chemical/methanol) 或其二 `https://list.oilchem.net/140` 中，类别 id 为 `list`，分类 id 为 `140`，子分类 id 为空，对应路由即为 [`/oilchem/list/140`](https://rsshub.app/oilchem/list/140)；

  [**甲醇热点聚焦**](https://list.oilchem.net/140/18263) `https://list.oilchem.net/140/18263` 中，类别 id 为 `list`，分类 id 为 `140`，子分类 id 为 `18263`，对应路由即为 [`/oilchem/list/140/18263`](https://rsshub.app/oilchem/list/140/18263)

## 論盡媒體 AllAboutMacau Media <Site url="aamacau.com"/>

### 话题 <Site url="aamacau.com/" size="sm" />

<Route namespace="aamacau" :data='{"path":"/:category?/:id?","categories":["new-media"],"example":"/aamacau","parameters":{"category":"分类，见下表，默认为即時報道","id":"id，可在对应页面 URL 中找到，默认为空"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["aamacau.com/"]}],"name":"话题","maintainers":[],"url":"aamacau.com/","description":"| 即時報道     | 每週專題    | 藝文爛鬼樓 | 論盡紙本 | 新聞事件 | 特別企劃 |\n  | ------------ | ----------- | ---------- | -------- | -------- | -------- |\n  | breakingnews | weeklytopic | culture    | press    | case     | special  |\n\n  :::tip\n  除了直接订阅分类全部文章（如 [每週專題](https://aamacau.com/topics/weeklytopic) 的对应路由为 [/aamacau/weeklytopic](https://rsshub.app/aamacau/weeklytopic)），你也可以订阅特定的专题，如 [【9-12】2021 澳門立法會選舉](https://aamacau.com/topics/【9-12】2021澳門立法會選舉) 的对应路由为 [/【9-12】2021 澳門立法會選舉](https://rsshub.app/aamacau/【9-12】2021澳門立法會選舉)。\n\n  分类中的专题也可以单独订阅，如 [新聞事件](https://aamacau.com/topics/case) 中的 [「武漢肺炎」新聞檔案](https://aamacau.com/topics/case/「武漢肺炎」新聞檔案) 对应路由为 [/case/「武漢肺炎」新聞檔案](https://rsshub.app/aamacau/case/「武漢肺炎」新聞檔案)。\n\n  同理，其他分类同上例子也可以订阅特定的单独专题。\n  :::","location":"index.ts"}' />

| 即時報道     | 每週專題    | 藝文爛鬼樓 | 論盡紙本 | 新聞事件 | 特別企劃 |
  | ------------ | ----------- | ---------- | -------- | -------- | -------- |
  | breakingnews | weeklytopic | culture    | press    | case     | special  |

  :::tip
  除了直接订阅分类全部文章（如 [每週專題](https://aamacau.com/topics/weeklytopic) 的对应路由为 [/aamacau/weeklytopic](https://rsshub.app/aamacau/weeklytopic)），你也可以订阅特定的专题，如 [【9-12】2021 澳門立法會選舉](https://aamacau.com/topics/【9-12】2021澳門立法會選舉) 的对应路由为 [/【9-12】2021 澳門立法會選舉](https://rsshub.app/aamacau/【9-12】2021澳門立法會選舉)。

  分类中的专题也可以单独订阅，如 [新聞事件](https://aamacau.com/topics/case) 中的 [「武漢肺炎」新聞檔案](https://aamacau.com/topics/case/「武漢肺炎」新聞檔案) 对应路由为 [/case/「武漢肺炎」新聞檔案](https://rsshub.app/aamacau/case/「武漢肺炎」新聞檔案)。

  同理，其他分类同上例子也可以订阅特定的单独专题。
  :::

## 罗戈网 <Site url="logclub.com"/>

### Unknown <Site url="logclub.com" size="sm" />

<Route namespace="logclub" :data='{"path":"/:category{.+}?","name":"Unknown","maintainers":[],"location":"index.ts"}' />

### 报告 <Site url="logclub.com" size="sm" />

<Route namespace="logclub" :data='{"path":["/lc_report/:id?","/report/:id?"],"categories":["new-media"],"example":"/logclub/lc_report","parameters":{"id":"报告 id，见下表，默认为罗戈研究出品"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"报告","maintainers":["nczitzk"],"description":"| 罗戈研究出品 | 物流报告       | 绿色双碳报告          |\n  | ------------ | -------------- | --------------------- |\n  | Report       | IndustryReport | GreenDualCarbonReport |","location":"report.ts"}' />

| 罗戈研究出品 | 物流报告       | 绿色双碳报告          |
  | ------------ | -------------- | --------------------- |
  | Report       | IndustryReport | GreenDualCarbonReport |

### 报告 <Site url="logclub.com" size="sm" />

<Route namespace="logclub" :data='{"path":["/lc_report/:id?","/report/:id?"],"categories":["new-media"],"example":"/logclub/lc_report","parameters":{"id":"报告 id，见下表，默认为罗戈研究出品"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"报告","maintainers":["nczitzk"],"description":"| 罗戈研究出品 | 物流报告       | 绿色双碳报告          |\n  | ------------ | -------------- | --------------------- |\n  | Report       | IndustryReport | GreenDualCarbonReport |","location":"report.ts"}' />

| 罗戈研究出品 | 物流报告       | 绿色双碳报告          |
  | ------------ | -------------- | --------------------- |
  | Report       | IndustryReport | GreenDualCarbonReport |

## 麻省理工科技评论 <Site url="mittrchina.com"/>

### 首页 <Site url="mittrchina.com" size="sm" />

<Route namespace="mittrchina" :data='{"path":"/:type?","categories":["new-media"],"example":"/mittrchina/index","parameters":{"type":"类型，见下表，默认为首页资讯"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"首页","maintainers":["EsuRt","queensferryme"],"description":"| 快讯     | 本周热文 | 首页资讯 | 视频  |\n  | -------- | -------- | -------- | ----- |\n  | breaking | hot      | index    | video |","location":"index.ts"}' />

| 快讯     | 本周热文 | 首页资讯 | 视频  |
  | -------- | -------- | -------- | ----- |
  | breaking | hot      | index    | video |

## 慢雾科技 <Site url="slowmist.com"/>

### 动态 <Site url="slowmist.com/zh/news.html" size="sm" />

<Route namespace="slowmist" :data='{"path":"/:type?","categories":["new-media"],"example":"/slowmist/research","parameters":{"type":"分类，见下表，默认为公司新闻"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["slowmist.com/zh/news.html"]}],"name":"动态","maintainers":["AtlasQuan"],"url":"slowmist.com/zh/news.html","description":"| 公司新闻 | 漏洞披露 | 技术研究 |\n  | -------- | -------- | -------- |\n  | news     | vul      | research |","location":"slowmist.ts"}' />

| 公司新闻 | 漏洞披露 | 技术研究 |
  | -------- | -------- | -------- |
  | news     | vul      | research |

## 貓奴日常 <Site url="thecatcity.com"/>

### 分類 <Site url="thecatcity.com/" size="sm" />

<Route namespace="thecatcity" :data='{"path":"/:term?","categories":["new-media"],"example":"/thecatcity","parameters":{"term":"見下表，留空為全部文章"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["thecatcity.com/"],"target":""}],"name":"分類","maintainers":["TonyRL"],"url":"thecatcity.com/","description":"| 貓物分享 | 貓咪新聞 | 養貓大全 | 貓奴景點 | 新手養貓教學 |\n  | -------- | -------- | -------- | -------- | ------------ |\n  | 1        | 2        | 3        | 4        | 5            |","location":"index.ts"}' />

| 貓物分享 | 貓咪新聞 | 養貓大全 | 貓奴景點 | 新手養貓教學 |
  | -------- | -------- | -------- | -------- | ------------ |
  | 1        | 2        | 3        | 4        | 5            |

## 梅斯医学 MedSci <Site url="medsci.cn"/>

### 资讯 <Site url="medsci.cn" size="sm" />

<Route namespace="medsci" :data='{"path":"/:sid?/:tid?","categories":["new-media"],"example":"/medsci","parameters":{"sid":"科室，见下表，默认为推荐","tid":"亚专业，可在对应科室页 URL 中找到，默认为该科室的全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"资讯","maintainers":["nczitzk"],"description":":::tip\n  下表为科室对应的 sid，若想获得 tid，可以到对应科室页面 URL 中寻找 `t_id` 字段的值，下面是一个例子：\n\n  如 [肿瘤 - NSCLC](https://www.medsci.cn/department/details?s_id=5&t_id=277) 的 URL 为 `https://www.medsci.cn/department/details?s_id=5&t_id=277`，可以看到此时 `s_id` 对应 `sid` 的值为 5， `t_id` 对应 `tid` 的值为 277，所以可以得到路由 [`/medsci/5/277`](https://rsshub.app/medsci/5/277)\n  :::\n\n  | 心血管 | 内分泌 | 消化 | 呼吸 | 神经科 |\n  | ------ | ------ | ---- | ---- | ------ |\n  | 2      | 6      | 4    | 12   | 17     |\n\n  | 传染科 | 精神心理 | 肾内科 | 风湿免疫 | 血液科 |\n  | ------ | -------- | ------ | -------- | ------ |\n  | 9      | 13       | 14     | 15       | 21     |\n\n  | 老年医学 | 胃肠外科 | 血管外科 | 肝胆胰外 | 骨科 |\n  | -------- | -------- | -------- | -------- | ---- |\n  | 19       | 76       | 92       | 91       | 10   |\n\n  | 普通外科 | 胸心外科 | 神经外科 | 泌尿外科 | 烧伤科 |\n  | -------- | -------- | -------- | -------- | ------ |\n  | 23       | 24       | 25       | 26       | 27     |\n\n  | 整形科 | 麻醉疼痛 | 罕见病 | 康复医学 | 药械 |\n  | ------ | -------- | ------ | -------- | ---- |\n  | 28     | 29       | 304    | 95       | 11   |\n\n  | 儿科 | 耳鼻咽喉 | 口腔科 | 眼科 | 政策人文 |\n  | ---- | -------- | ------ | ---- | -------- |\n  | 18   | 30       | 31     | 32   | 33       |\n\n  | 营养全科 | 预防公卫 | 妇产科 | 中医科 | 急重症 |\n  | -------- | -------- | ------ | ------ | ------ |\n  | 34       | 35       | 36     | 37     | 38     |\n\n  | 皮肤性病 | 影像放射 | 转化医学 | 检验病理 | 护理 |\n  | -------- | -------- | -------- | -------- | ---- |\n  | 39       | 40       | 42       | 69       | 79   |\n\n  | 糖尿病 | 冠心病 | 肝病 | 乳腺癌 |\n  | ------ | ------ | ---- | ------ |\n  | 8      | 43     | 22   | 89     |","location":"index.ts"}' />

:::tip
  下表为科室对应的 sid，若想获得 tid，可以到对应科室页面 URL 中寻找 `t_id` 字段的值，下面是一个例子：

  如 [肿瘤 - NSCLC](https://www.medsci.cn/department/details?s_id=5&t_id=277) 的 URL 为 `https://www.medsci.cn/department/details?s_id=5&t_id=277`，可以看到此时 `s_id` 对应 `sid` 的值为 5， `t_id` 对应 `tid` 的值为 277，所以可以得到路由 [`/medsci/5/277`](https://rsshub.app/medsci/5/277)
  :::

  | 心血管 | 内分泌 | 消化 | 呼吸 | 神经科 |
  | ------ | ------ | ---- | ---- | ------ |
  | 2      | 6      | 4    | 12   | 17     |

  | 传染科 | 精神心理 | 肾内科 | 风湿免疫 | 血液科 |
  | ------ | -------- | ------ | -------- | ------ |
  | 9      | 13       | 14     | 15       | 21     |

  | 老年医学 | 胃肠外科 | 血管外科 | 肝胆胰外 | 骨科 |
  | -------- | -------- | -------- | -------- | ---- |
  | 19       | 76       | 92       | 91       | 10   |

  | 普通外科 | 胸心外科 | 神经外科 | 泌尿外科 | 烧伤科 |
  | -------- | -------- | -------- | -------- | ------ |
  | 23       | 24       | 25       | 26       | 27     |

  | 整形科 | 麻醉疼痛 | 罕见病 | 康复医学 | 药械 |
  | ------ | -------- | ------ | -------- | ---- |
  | 28     | 29       | 304    | 95       | 11   |

  | 儿科 | 耳鼻咽喉 | 口腔科 | 眼科 | 政策人文 |
  | ---- | -------- | ------ | ---- | -------- |
  | 18   | 30       | 31     | 32   | 33       |

  | 营养全科 | 预防公卫 | 妇产科 | 中医科 | 急重症 |
  | -------- | -------- | ------ | ------ | ------ |
  | 34       | 35       | 36     | 37     | 38     |

  | 皮肤性病 | 影像放射 | 转化医学 | 检验病理 | 护理 |
  | -------- | -------- | -------- | -------- | ---- |
  | 39       | 40       | 42       | 69       | 79   |

  | 糖尿病 | 冠心病 | 肝病 | 乳腺癌 |
  | ------ | ------ | ---- | ------ |
  | 8      | 43     | 22   | 89     |

## 米课 <Site url="imiker.com"/>

### 米课圈精华 <Site url="imiker.com/explore/find" size="sm" />

<Route namespace="imiker" :data='{"path":"/ask/jinghua","categories":["new-media"],"example":"/imiker/ask/jinghua","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["imiker.com/explore/find"]}],"name":"米课圈精华","maintainers":["nczitzk"],"url":"imiker.com/explore/find","location":"jinghua.ts"}' />

## 鸟哥笔记 <Site url="niaogebiji.com"/>

### Unknown <Site url="niaogebiji.com/" size="sm" />

<Route namespace="niaogebiji" :data='{"path":"/","radar":[{"source":["niaogebiji.com/","niaogebiji.com/bulletin"],"target":""}],"name":"Unknown","maintainers":["WenryXu"],"url":"niaogebiji.com/","location":"index.ts"}' />

### 分类目录 <Site url="niaogebiji.com/" size="sm" />

<Route namespace="niaogebiji" :data='{"path":"/cat/:cat","categories":["new-media"],"example":"/niaogebiji/cat/103","parameters":{"cat":"如 https://www.niaogebiji.com/cat/103，最后的数字就是id"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["niaogebiji.com/cat/:cat"]}],"name":"分类目录","maintainers":["cKotoriKat"],"url":"niaogebiji.com/","location":"cat.ts"}' />

### 今日事 <Site url="niaogebiji.com/" size="sm" />

<Route namespace="niaogebiji" :data='{"path":"/today","categories":["new-media"],"example":"/niaogebiji/today","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["niaogebiji.com/","niaogebiji.com/bulletin"],"target":""}],"name":"今日事","maintainers":["KotoriK"],"url":"niaogebiji.com/","location":"today.ts"}' />

## 品玩 <Site url="pingwest.com"/>

### 话题动态 <Site url="pingwest.com" size="sm" />

<Route namespace="pingwest" :data='{"path":"/tag/:tag/:type/:option?","categories":["new-media"],"example":"/pingwest/tag/ChinaJoy/1","parameters":{"tag":"话题名或话题id, 可从话题页url中得到","type":"内容类型","option":"参数, 默认无"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"话题动态","maintainers":["sanmmm"],"description":"内容类型\n\n  | 最新 | 热门 |\n  | ---- | ---- |\n  | 1    | 2    |\n\n  参数\n\n  -   `fulltext`，全文输出，例如：`/pingwest/tag/ChinaJoy/1/fulltext`\n\n  :::tip\n  该路由一次最多显示 30 条文章\n  :::","location":"tag.ts"}' />

内容类型

  | 最新 | 热门 |
  | ---- | ---- |
  | 1    | 2    |

  参数

  -   `fulltext`，全文输出，例如：`/pingwest/tag/ChinaJoy/1/fulltext`

  :::tip
  该路由一次最多显示 30 条文章
  :::

### 实时要闻 <Site url="pingwest.com/status" size="sm" />

<Route namespace="pingwest" :data='{"path":"/status","categories":["new-media"],"example":"/pingwest/status","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["pingwest.com/status","pingwest.com/"]}],"name":"实时要闻","maintainers":["sanmmm"],"url":"pingwest.com/status","location":"status.ts"}' />

### 用户 <Site url="pingwest.com" size="sm" />

<Route namespace="pingwest" :data='{"path":"/user/:uid/:type?/:option?","categories":["new-media"],"example":"/pingwest/user/7781550877/article","parameters":{"uid":"用户id, 可从用户主页中得到","type":"内容类型, 默认为`article`","option":"参数"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["pingwest.com/user/:uid/:type","pingwest.com/"],"target":"/user/:uid/:type"}],"name":"用户","maintainers":["sanmmm"],"description":"内容类型\n\n  | 文章    | 动态  |\n  | ------- | ----- |\n  | article | state |\n\n  参数\n\n  -   `fulltext`，全文输出，例如：`/pingwest/user/7781550877/article/fulltext`","location":"user.ts"}' />

内容类型

  | 文章    | 动态  |
  | ------- | ----- |
  | article | state |

  参数

  -   `fulltext`，全文输出，例如：`/pingwest/user/7781550877/article/fulltext`

## 全国港澳研究会 <Site url="cahkms.org"/>

### 分类 <Site url="cahkms.org/" size="sm" />

<Route namespace="cahkms" :data='{"path":"/:category?","categories":["new-media"],"example":"/cahkms","parameters":{"category":"分类，见下表，默认为重要新闻"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["cahkms.org/"]}],"name":"分类","maintainers":["nczitzk"],"url":"cahkms.org/","description":"| 关于我们 | 港澳新闻 | 重要新闻 | 顾问点评、会员观点 | 专题汇总 |\n  | -------- | -------- | -------- | ------------------ | -------- |\n  | 01       | 02       | 03       | 04                 | 05       |\n\n  | 港澳时评 | 图片新闻 | 视频中心 | 港澳研究 | 最新书讯 | 研究资讯 |\n  | -------- | -------- | -------- | -------- | -------- | -------- |\n  | 06       | 07       | 08       | 09       | 10       | 11       |","location":"index.ts"}' />

| 关于我们 | 港澳新闻 | 重要新闻 | 顾问点评、会员观点 | 专题汇总 |
  | -------- | -------- | -------- | ------------------ | -------- |
  | 01       | 02       | 03       | 04                 | 05       |

  | 港澳时评 | 图片新闻 | 视频中心 | 港澳研究 | 最新书讯 | 研究资讯 |
  | -------- | -------- | -------- | -------- | -------- | -------- |
  | 06       | 07       | 08       | 09       | 10       | 11       |

## 全民健康网 <Site url="qm120.com"/>

### 新闻 <Site url="qm120.com/" size="sm" />

<Route namespace="qm120" :data='{"path":"/news/:category?","categories":["new-media"],"example":"/qm120/news","parameters":{"category":"分类，见下表，默认为健康焦点"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["qm120.com/"]}],"name":"新闻","maintainers":["nczitzk"],"url":"qm120.com/","description":"| 健康焦点 | 行业动态 | 医学前沿 | 法规动态 |\n  | -------- | -------- | -------- | -------- |\n  | jdxw     | hydt     | yxqy     | fgdt     |\n\n  | 食品安全 | 医疗事故 | 医药会展 | 医药信息 |\n  | -------- | -------- | -------- | -------- |\n  | spaq     | ylsg     | yyhz     | yyxx     |\n\n  | 新闻专题 | 行业新闻 |\n  | -------- | -------- |\n  | zhuanti  | xyxw     |","location":"news.ts"}' />

| 健康焦点 | 行业动态 | 医学前沿 | 法规动态 |
  | -------- | -------- | -------- | -------- |
  | jdxw     | hydt     | yxqy     | fgdt     |

  | 食品安全 | 医疗事故 | 医药会展 | 医药信息 |
  | -------- | -------- | -------- | -------- |
  | spaq     | ylsg     | yyhz     | yyxx     |

  | 新闻专题 | 行业新闻 |
  | -------- | -------- |
  | zhuanti  | xyxw     |

## 人人都是产品经理 <Site url="woshipm.com"/>

### 热门文章 <Site url="woshipm.com/" size="sm" />

<Route namespace="woshipm" :data='{"path":"/popular/:range?","categories":["new-media"],"example":"/woshipm/popular","parameters":{"range":"时间，见下表，默认为 `daily`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["woshipm.com/"],"target":"/popular"}],"name":"热门文章","maintainers":["WenryXu"],"url":"woshipm.com/","description":"| 日榜  | 周榜   | 月榜    |\n  | ----- | ------ | ------- |\n  | daily | weekly | monthly |","location":"popular.ts"}' />

| 日榜  | 周榜   | 月榜    |
  | ----- | ------ | ------- |
  | daily | weekly | monthly |

### 天天问 <Site url="wen.woshipm.com/" size="sm" />

<Route namespace="woshipm" :data='{"path":"/wen","categories":["new-media"],"example":"/woshipm/wen","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["wen.woshipm.com/"]}],"name":"天天问","maintainers":["WenryXu"],"url":"wen.woshipm.com/","location":"wen.ts"}' />

### 用户文章 <Site url="woshipm.com" size="sm" />

<Route namespace="woshipm" :data='{"path":"/user_article/:id","categories":["new-media"],"example":"/woshipm/user_article/324696","parameters":{"id":"用户 id"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["woshipm.com/u/:id"]}],"name":"用户文章","maintainers":["LogicJake"],"location":"user-article.ts"}' />

## 软餐 <Site url="ruancan.com"/>

### Unknown <Site url="ruancan.com/" size="sm" />

<Route namespace="ruancan" :data='{"path":"/","radar":[{"source":["ruancan.com/"],"target":""}],"name":"Unknown","maintainers":[],"url":"ruancan.com/","location":"index.ts"}' />

### Unknown <Site url="ruancan.com/" size="sm" />

<Route namespace="ruancan" :data='{"path":"/user/:id","radar":[{"source":["ruancan.com/i/:id","ruancan.com/"]}],"name":"Unknown","maintainers":[],"url":"ruancan.com/","location":"user.ts"}' />

### 分类 <Site url="ruancan.com/" size="sm" />

<Route namespace="ruancan" :data='{"path":"/category/:category?","categories":["new-media"],"example":"/ruancan/category/news","parameters":{"category":"分类 id，可在对应分类页 URL 中找到，默认为业界"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["ruancan.com/cat/:category","ruancan.com/"],"target":"/category/:category"}],"name":"分类","maintainers":[],"url":"ruancan.com/","location":"category.ts"}' />

### 搜索 <Site url="ruancan.com/" size="sm" />

<Route namespace="ruancan" :data='{"path":"/search/:keyword?","categories":["new-media"],"example":"/ruancan/search/Windows","parameters":{"keyword":"关键字，默认为空"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["ruancan.com/"],"target":""}],"name":"搜索","maintainers":[],"url":"ruancan.com/","location":"search.ts"}' />

## 上下游 News&Market <Site url="newsmarket.com.tw"/>

### 分類 <Site url="newsmarket.com.tw" size="sm" />

<Route namespace="newsmarket" :data='{"path":"/:category?","categories":["new-media"],"example":"/newsmarket","parameters":{"category":"分类，见下表，默认为首页"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["newsmarket.com.tw/blog/category/:category","newsmarket.com.tw/"]}],"name":"分類","maintainers":["nczitzk"],"description":"| 時事。政策  | 食安        | 新知      | 愛地方       | 種好田       | 好吃。好玩    |\n  | ----------- | ----------- | --------- | ------------ | ------------ | ------------- |\n  | news-policy | food-safety | knowledge | country-life | good-farming | good-food-fun |\n\n  | 食農教育       | 人物               | 漁業。畜牧           | 綠生活。國際        | 評論    |\n  | -------------- | ------------------ | -------------------- | ------------------- | ------- |\n  | food-education | people-and-history | raising-and-breeding | living-green-travel | opinion |","location":"index.ts"}' />

| 時事。政策  | 食安        | 新知      | 愛地方       | 種好田       | 好吃。好玩    |
  | ----------- | ----------- | --------- | ------------ | ------------ | ------------- |
  | news-policy | food-safety | knowledge | country-life | good-farming | good-food-fun |

  | 食農教育       | 人物               | 漁業。畜牧           | 綠生活。國際        | 評論    |
  | -------------- | ------------------ | -------------------- | ------------------- | ------- |
  | food-education | people-and-history | raising-and-breeding | living-green-travel | opinion |

## 少数派 sspai <Site url="sspai.com"/>

### Matrix <Site url="sspai.com/matrix" size="sm" />

<Route namespace="sspai" :data='{"path":"/matrix","categories":["new-media"],"example":"/sspai/matrix","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["sspai.com/matrix"]}],"name":"Matrix","maintainers":["feigaoxyz"],"url":"sspai.com/matrix","location":"matrix.ts"}' />

### Shortcuts Gallery <Site url="shortcuts.sspai.com/*" size="sm" />

<Route namespace="sspai" :data='{"path":"/shortcuts","categories":["new-media"],"example":"/sspai/shortcuts","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["shortcuts.sspai.com/*"]}],"name":"Shortcuts Gallery","maintainers":["Andiedie"],"url":"shortcuts.sspai.com/*","location":"shortcuts-gallery.ts"}' />

### 标签订阅 <Site url="sspai.com" size="sm" />

<Route namespace="sspai" :data='{"path":"/tag/:keyword","categories":["new-media"],"example":"/sspai/tag/apple","parameters":{"keyword":"关键词"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["sspai.com/tag/:keyword"]}],"name":"标签订阅","maintainers":["Jeason0228"],"location":"tag.ts"}' />

### 付费专栏文章更新 <Site url="sspai.com/series" size="sm" />

<Route namespace="sspai" :data='{"path":"/series/:id","categories":["new-media"],"example":"/sspai/series/77","parameters":{"id":"专栏 id"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["sspai.com/series/:id","sspai.com/series/:id/list","sspai.com/series/:id/metadata"]}],"name":"付费专栏文章更新","maintainers":["TonyRL"],"url":"sspai.com/series","location":"series-update.ts"}' />

### 首页 <Site url="sspai.com/index" size="sm" />

<Route namespace="sspai" :data='{"path":"/index","categories":["new-media"],"example":"/sspai/index","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["sspai.com/index"]}],"name":"首页","maintainers":["HenryQW"],"url":"sspai.com/index","location":"index.ts"}' />

### 用户收藏 <Site url="sspai.com" size="sm" />

<Route namespace="sspai" :data='{"path":"/bookmarks/:slug","categories":["new-media"],"example":"/sspai/bookmarks/urfp0d9i","parameters":{"slug":"用户 slug，可在个人主页URL中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["sspai.com/u/:slug/bookmark_posts"]}],"name":"用户收藏","maintainers":["curly210102"],"location":"bookmarks.ts"}' />

### 专栏 <Site url="sspai.com" size="sm" />

<Route namespace="sspai" :data='{"path":"/column/:id","categories":["new-media"],"example":"/sspai/column/262","parameters":{"id":"专栏 id"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["sspai.com/column/:id"]}],"name":"专栏","maintainers":["LogicJake"],"location":"column.ts"}' />

### 专题内文章更新 <Site url="sspai.com" size="sm" />

<Route namespace="sspai" :data='{"path":"/topic/:id","categories":["new-media"],"example":"/sspai/topic/250","parameters":{"id":"专题 id，可在专题主页URL中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["sspai.com/topic/:id"]}],"name":"专题内文章更新","maintainers":["SunShinenny"],"location":"topic.ts"}' />

### 专题 <Site url="sspai.com/topics" size="sm" />

<Route namespace="sspai" :data='{"path":"/topics","categories":["new-media"],"example":"/sspai/topics","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["sspai.com/topics"]}],"name":"专题","maintainers":["SunShinenny"],"url":"sspai.com/topics","description":"此为专题广场更新提示 => 集合型而非单篇文章。与下方 \"专题内文章更新\" 存在明显区别！","location":"topics.ts"}' />

此为专题广场更新提示 => 集合型而非单篇文章。与下方 "专题内文章更新" 存在明显区别！

### 最新上架付费专栏 <Site url="sspai.com/series" size="sm" />

<Route namespace="sspai" :data='{"path":"/series","categories":["new-media"],"example":"/sspai/series","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["sspai.com/series"]}],"name":"最新上架付费专栏","maintainers":["HenryQW"],"url":"sspai.com/series","description":"> 少数派专栏需要付费订阅，RSS 仅做更新提醒，不含付费内容.","location":"series.ts"}' />

> 少数派专栏需要付费订阅，RSS 仅做更新提醒，不含付费内容.

### 作者动态 <Site url="sspai.com" size="sm" />

<Route namespace="sspai" :data='{"path":"/activity/:slug","categories":["new-media"],"example":"/sspai/activity/urfp0d9i","parameters":{"slug":"作者 slug，可在作者主页URL中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["sspai.com/u/:id/updates"],"target":"/activity/:id"}],"name":"作者动态","maintainers":["umm233"],"location":"activity.ts"}' />

### 作者 <Site url="sspai.com" size="sm" />

<Route namespace="sspai" :data='{"path":"/author/:id","categories":["new-media"],"example":"/sspai/author/796518","parameters":{"id":"作者 slug 或 id，slug 可在作者主页URL中找到，id 不易查找，仅作兼容"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["sspai.com/u/:id/posts"]}],"name":"作者","maintainers":["SunShinenny","hoilc"],"location":"author.ts"}' />

## 时刻新闻 <Site url="timednews.com"/>

### 新闻 <Site url="timednews.com" size="sm" />

<Route namespace="timednews" :data='{"path":"/news/:type?","categories":["new-media"],"example":"/timednews/news","parameters":{"type":"子分类，见下表，默认为全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"新闻","maintainers":["linbuxiao"],"description":"子分类\n\n  | 全部 | 时政           | 财经    | 科技       | 社会   | 体娱   | 国际          | 美国 | 中国 | 欧洲   | 评论     |\n  | ---- | -------------- | ------- | ---------- | ------ | ------ | ------------- | ---- | ---- | ------ | -------- |\n  | all  | currentAffairs | finance | technology | social | sports | international | usa  | cn   | europe | comments |","location":"news.ts"}' />

子分类

  | 全部 | 时政           | 财经    | 科技       | 社会   | 体娱   | 国际          | 美国 | 中国 | 欧洲   | 评论     |
  | ---- | -------------- | ------- | ---------- | ------ | ------ | ------------- | ---- | ---- | ------ | -------- |
  | all  | currentAffairs | finance | technology | social | sports | international | usa  | cn   | europe | comments |

## 搜狐号 <Site url="sohu.com"/>

### 更新 <Site url="sohu.com" size="sm" />

<Route namespace="sohu" :data='{"path":"/mp/:id","categories":["new-media"],"example":"/sohu/mp/119097","parameters":{"id":"搜狐号 ID"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"更新","maintainers":["HenryQW"],"description":"1.  通过浏览器搜索相关搜狐号 `果壳 site: mp.sohu.com`。\n  2.  通过浏览器控制台执行 `contentData.mkey`，返回的即为搜狐号 ID。","location":"mp.ts"}' />

1.  通过浏览器搜索相关搜狐号 `果壳 site: mp.sohu.com`。
  2.  通过浏览器控制台执行 `contentData.mkey`，返回的即为搜狐号 ID。

## 唐书房 <Site url="tangshufang.com"/>

### 分类 <Site url="tangshufang.com" size="sm" />

<Route namespace="tangshufang" :data='{"path":"/:category?","categories":["new-media"],"example":"/tangshufang","parameters":{"category":"分类，见下表，默认为首页"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["tangshufang.com/:category","tangshufang.com/"]}],"name":"分类","maintainers":["nczitzk"],"description":"| 首页 | 老唐实盘 | 书房拾遗 | 理念 & 估值 | 经典陪读 | 财务套利 |\n  | ---- | -------- | -------- | ----------- | -------- | -------- |\n  |      | shipan   | wenda    | linian      | peidu    | taoli    |\n\n  | 企业分析 | 白酒企业 | 腾讯控股 | 分众传媒 | 海康威视 | 其他企业 |\n  | -------- | -------- | -------- | -------- | -------- | -------- |\n  | qiye     | baijiu   | tengxun  | fenzhong | haikang  | qita     |\n\n  | 核心五篇 | 读者投稿 | 读书随笔 | 财报浅析 | 出行游记 | 巴芒连载 |\n  | -------- | -------- | -------- | -------- | -------- | -------- |\n  | hexin    | tougao   | suibi    | caibao   | youji    | bamang   |","location":"index.ts"}' />

| 首页 | 老唐实盘 | 书房拾遗 | 理念 & 估值 | 经典陪读 | 财务套利 |
  | ---- | -------- | -------- | ----------- | -------- | -------- |
  |      | shipan   | wenda    | linian      | peidu    | taoli    |

  | 企业分析 | 白酒企业 | 腾讯控股 | 分众传媒 | 海康威视 | 其他企业 |
  | -------- | -------- | -------- | -------- | -------- | -------- |
  | qiye     | baijiu   | tengxun  | fenzhong | haikang  | qita     |

  | 核心五篇 | 读者投稿 | 读书随笔 | 财报浅析 | 出行游记 | 巴芒连载 |
  | -------- | -------- | -------- | -------- | -------- | -------- |
  | hexin    | tougao   | suibi    | caibao   | youji    | bamang   |

## 腾讯研究院 <Site url="tisi.org"/>

### 最近更新 <Site url="tisi.org" size="sm" />

<Route namespace="tisi" :data='{"path":"/latest","categories":["new-media"],"example":"/tisi/latest","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"最近更新","maintainers":["Fatpandac"],"location":"index.ts"}' />

## 通識・現代中國 <Site url="chiculture.org.hk"/>

### 議題熱話 <Site url="chiculture.org.hk" size="sm" />

<Route namespace="chiculture" :data='{"path":"/topic/:category?","categories":["new-media"],"example":"/chiculture/topic","parameters":{"category":"分类，见下表，默认为全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"議題熱話","maintainers":["nczitzk"],"description":"| 全部 | 現代中國 | 今日香港 | 全球化 | 一周時事通識 |\n  | ---- | -------- | -------- | ------ | ------------ |\n  |      | 76       | 479      | 480    | 379          |","location":"topic.ts"}' />

| 全部 | 現代中國 | 今日香港 | 全球化 | 一周時事通識 |
  | ---- | -------- | -------- | ------ | ------------ |
  |      | 76       | 479      | 480    | 379          |

## 投中网 <Site url="chinaventure.com.cn"/>

### 分类 <Site url="chinaventure.com.cn/" size="sm" />

<Route namespace="chinaventure" :data='{"path":"/news/:id?","categories":["new-media"],"example":"/chinaventure/news/78","parameters":{"id":"分类，见下表，默认为推荐"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["chinaventure.com.cn/"],"target":""}],"name":"分类","maintainers":["yuxinliu-alex"],"url":"chinaventure.com.cn/","description":"| 推荐 | 商业深度 | 资本市场 | 5G | 健康 | 教育 | 地产 | 金融 | 硬科技 | 新消费 |\n  | ---- | -------- | -------- | -- | ---- | ---- | ---- | ---- | ------ | ------ |\n  |      | 78       | 80       | 83 | 111  | 110  | 112  | 113  | 114    | 116    |","location":"index.ts"}' />

| 推荐 | 商业深度 | 资本市场 | 5G | 健康 | 教育 | 地产 | 金融 | 硬科技 | 新消费 |
  | ---- | -------- | -------- | -- | ---- | ---- | ---- | ---- | ------ | ------ |
  |      | 78       | 80       | 83 | 111  | 110  | 112  | 113  | 114    | 116    |

## 湾区日报 <Site url="wanqu.co"/>

### 最新推荐 <Site url="wanqu.co/" size="sm" />

<Route namespace="wanqu" :data='{"path":"/news","categories":["new-media"],"example":"/wanqu/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["wanqu.co/"]}],"name":"最新推荐","maintainers":["Fatpandac"],"url":"wanqu.co/","location":"news.ts"}' />

## 晚点 LatePost <Site url="latepost.com"/>

### 报道 <Site url="latepost.com" size="sm" />

<Route namespace="latepost" :data='{"path":"/:proma?","categories":["new-media"],"example":"/latepost","parameters":{"proma":"栏目 id，见下表，默认为最新报道"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"报道","maintainers":["nczitzk"],"description":"| 最新报道 | 晚点独家 | 人物访谈 | 晚点早知道 | 长报道 |\n  | -------- | -------- | -------- | ---------- | ------ |\n  |          | 1        | 2        | 3          | 4      |","location":"index.ts"}' />

| 最新报道 | 晚点独家 | 人物访谈 | 晚点早知道 | 长报道 |
  | -------- | -------- | -------- | ---------- | ------ |
  |          | 1        | 2        | 3          | 4      |

## 王者荣耀 <Site url="mp.weixin.qq.com"/>

### Unknown <Site url="mp.weixin.qq.com" size="sm" />

<Route namespace="tencent" :data='{"path":"/news/coronavirus/data/:province?/:city?","name":"Unknown","maintainers":["CaoMeiYouRen"],"location":"news/coronavirus/data.ts"}' />

### Unknown <Site url="new.qq.com/zt2020/page/feiyan.htm" size="sm" />

<Route namespace="tencent" :data='{"path":"/news/coronavirus/total","radar":[{"source":["new.qq.com/zt2020/page/feiyan.htm"]}],"name":"Unknown","maintainers":["CaoMeiYouRen"],"url":"new.qq.com/zt2020/page/feiyan.htm","location":"news/coronavirus/total.ts"}' />

### 更新 <Site url="mp.weixin.qq.com" size="sm" />

<Route namespace="tencent" :data='{"path":"/news/author/:mid","categories":["new-media"],"example":"/tencent/news/author/5933889","parameters":{"mid":"企鹅号 ID"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["new.qq.com/omn/author/:mid"]}],"name":"更新","maintainers":["LogicJake","miles170"],"location":"news/author.ts"}' />

## 网易公开课 <Site url="163.com"/>

:::tip
部分歌单及听歌排行信息为登陆后可见，自建时将环境变量`NCM_COOKIES`设为登陆后的 Cookie 值，即可正常获取。
:::

### 更新 <Site url="163.com" size="sm" />

<Route namespace="163" :data='{"path":"/dy/:id","categories":["new-media"],"example":"/163/dy/W4983108759592548559","parameters":{"id":"网易号 ID"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"更新","maintainers":["HendricksZheng"],"description":"1.  在[网易号搜索页面](https://dy.163.com/v2/media/tosearch.html) 搜索想要订阅的网易号。\n  2.  打开网易号的任意文章。\n  3.  查看源代码，搜索 `data-wemediaid`，查看紧随其后的引号内的属性值（类似 `W1966190042455428950`）即为网易号 ID。","location":"dy.ts"}' />

1.  在[网易号搜索页面](https://dy.163.com/v2/media/tosearch.html) 搜索想要订阅的网易号。
  2.  打开网易号的任意文章。
  3.  查看源代码，搜索 `data-wemediaid`，查看紧随其后的引号内的属性值（类似 `W1966190042455428950`）即为网易号 ID。

### 今日关注 <Site url="wp.m.163.com/163/html/newsapp/todayFocus/index.html" size="sm" />

<Route namespace="163" :data='{"path":"/today/:need_content?","categories":["new-media"],"example":"/163/today","parameters":{"need_content":"需要获取全文，填写 true/yes 表示需要，默认需要"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["wp.m.163.com/163/html/newsapp/todayFocus/index.html","wp.m.163.com/"],"target":"/today"}],"name":"今日关注","maintainers":["nczitzk"],"url":"wp.m.163.com/163/html/newsapp/todayFocus/index.html","description":":::tip\n  参数 **需要获取全文** 设置为 `true` `yes` `t` `y` 等值后，RSS 会携带该新闻条目的对应全文。\n  :::","location":"today.ts"}' />

:::tip
  参数 **需要获取全文** 设置为 `true` `yes` `t` `y` 等值后，RSS 会携带该新闻条目的对应全文。
  :::

### 栏目 <Site url="163.com" size="sm" />

<Route namespace="163" :data='{"path":"/exclusive/:id?","categories":["new-media"],"example":"/163/exclusive/qsyk","parameters":{"id":"栏目, 默认为首页"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["3g.163.com/touch/exclusive/sub/:id"]}],"name":"栏目","maintainers":["nczitzk"],"description":"| 分类     | 编号 |\n  | -------- | ---- |\n  | 首页     |      |\n  | 轻松一刻 | qsyk |\n  | 槽值     | cz   |\n  | 人间     | rj   |\n  | 大国小民 | dgxm |\n  | 三三有梗 | ssyg |\n  | 数读     | sd   |\n  | 看客     | kk   |\n  | 下划线   | xhx  |\n  | 谈心社   | txs  |\n  | 哒哒     | dd   |\n  | 胖编怪聊 | pbgl |\n  | 曲一刀   | qyd  |\n  | 今日之声 | jrzs |\n  | 浪潮     | lc   |\n  | 沸点     | fd   |","location":"exclusive.ts"}' />

| 分类     | 编号 |
  | -------- | ---- |
  | 首页     |      |
  | 轻松一刻 | qsyk |
  | 槽值     | cz   |
  | 人间     | rj   |
  | 大国小民 | dgxm |
  | 三三有梗 | ssyg |
  | 数读     | sd   |
  | 看客     | kk   |
  | 下划线   | xhx  |
  | 谈心社   | txs  |
  | 哒哒     | dd   |
  | 胖编怪聊 | pbgl |
  | 曲一刀   | qyd  |
  | 今日之声 | jrzs |
  | 浪潮     | lc   |
  | 沸点     | fd   |

### 排行榜 <Site url="163.com" size="sm" />

<Route namespace="163" :data='{"path":"/news/rank/:category?/:type?/:time?","categories":["new-media"],"example":"/163/news/rank/whole/click/day","parameters":{"category":"新闻分类，参见下表，默认为“全站”","type":"排行榜类型，“点击榜”对应`click`，“跟贴榜”对应`follow`，默认为“点击榜”","time":"统计时间，“1小时”对应`hour`，“24小时”对应`day`，“本周”对应`week`，“本月”对应`month`，默认为“24小时”"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"排行榜","maintainers":["nczitzk"],"description":":::tip\n  全站新闻 **点击榜** 的统计时间仅包含 “24 小时”、“本周”、“本月”，不包含 “1 小时”。即可用的`time`参数为`day`、`week`、`month`。\n\n  其他分类 **点击榜** 的统计时间仅包含 “1 小时”、“24 小时”、“本周”。即可用的`time`参数为`hour`、`day`、`week`。\n\n  而所有分类（包括全站）的 **跟贴榜** 的统计时间皆仅包含 “24 小时”、“本周”、“本月”。即可用的`time`参数为`day`、`week`、`month`。\n  :::\n\n  新闻分类：\n\n  | 全站  | 新闻 | 娱乐          | 体育   | 财经  | 科技 | 汽车 | 女人 | 房产  | 游戏 | 旅游   | 教育 |\n  | ----- | ---- | ------------- | ------ | ----- | ---- | ---- | ---- | ----- | ---- | ------ | ---- |\n  | whole | news | entertainment | sports | money | tech | auto | lady | house | game | travel | edu  |","location":"news/rank.ts"}' />

:::tip
  全站新闻 **点击榜** 的统计时间仅包含 “24 小时”、“本周”、“本月”，不包含 “1 小时”。即可用的`time`参数为`day`、`week`、`month`。

  其他分类 **点击榜** 的统计时间仅包含 “1 小时”、“24 小时”、“本周”。即可用的`time`参数为`hour`、`day`、`week`。

  而所有分类（包括全站）的 **跟贴榜** 的统计时间皆仅包含 “24 小时”、“本周”、“本月”。即可用的`time`参数为`day`、`week`、`month`。
  :::

  新闻分类：

  | 全站  | 新闻 | 娱乐          | 体育   | 财经  | 科技 | 汽车 | 女人 | 房产  | 游戏 | 旅游   | 教育 |
  | ----- | ---- | ------------- | ------ | ----- | ---- | ---- | ---- | ----- | ---- | ------ | ---- |
  | whole | news | entertainment | sports | money | tech | auto | lady | house | game | travel | edu  |

### 人间 <Site url="163.com" size="sm" />

<Route namespace="163" :data='{"path":"/renjian/:category?","categories":["new-media"],"example":"/163/renjian/texie","parameters":{"category":"分类，见下表，默认为特写"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["renjian.163.com/:category","renjian.163.com/"]}],"name":"人间","maintainers":["nczitzk"],"description":"| 特写  | 记事  | 大写  | 好读  | 看客  |\n  | ----- | ----- | ----- | ----- | ----- |\n  | texie | jishi | daxie | haodu | kanke |","location":"renjian.ts"}' />

| 特写  | 记事  | 大写  | 好读  | 看客  |
  | ----- | ----- | ----- | ----- | ----- |
  | texie | jishi | daxie | haodu | kanke |

### 网易号（通用） <Site url="163.com" size="sm" />

<Route namespace="163" :data='{"path":"/dy2/:id","categories":["new-media"],"example":"/163/dy2/T1555591616739","parameters":{"id":"id，该网易号主页网址最后一项html的文件名"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"网易号（通用）","maintainers":["mjysci"],"description":"优先使用方法一，若是网易号搜索页面搜不到的小众网易号（文章页面不含`data-wemediaid`）则可使用此法。\n触发反爬会只抓取到标题，建议自建。","location":"dy2.ts"}' />

优先使用方法一，若是网易号搜索页面搜不到的小众网易号（文章页面不含`data-wemediaid`）则可使用此法。
触发反爬会只抓取到标题，建议自建。

### 专栏 <Site url="163.com" size="sm" />

<Route namespace="163" :data='{"path":"/news/special/:type?","categories":["new-media"],"example":"/163/news/special/1","parameters":{"type":"栏目"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"专栏","maintainers":["nczitzk"],"description":"| 轻松一刻 | 槽值 | 人间 | 大国小民 | 三三有梗 | 数读 | 看客 | 下划线 | 谈心社 | 哒哒 | 胖编怪聊 | 曲一刀 | 今日之声 | 浪潮 | 沸点 |\n  | -------- | ---- | ---- | -------- | -------- | ---- | ---- | ------ | ------ | ---- | -------- | ------ | -------- | ---- | ---- |\n  | 1        | 2    | 3    | 4        | 5        | 6    | 7    | 8      | 9      | 10   | 11       | 12     | 13       | 14   | 15   |","location":"news/special.ts"}' />

| 轻松一刻 | 槽值 | 人间 | 大国小民 | 三三有梗 | 数读 | 看客 | 下划线 | 谈心社 | 哒哒 | 胖编怪聊 | 曲一刀 | 今日之声 | 浪潮 | 沸点 |
  | -------- | ---- | ---- | -------- | -------- | ---- | ---- | ------ | ------ | ---- | -------- | ------ | -------- | ---- | ---- |
  | 1        | 2    | 3    | 4        | 5        | 6    | 7    | 8      | 9      | 10   | 11       | 12     | 13       | 14   | 15   |

## 微信小程序 <Site url="posts.careerengine.us"/>

:::tip
公众号直接抓取困难，故目前提供几种间接抓取方案，请自行选择
:::

### 公众号（CareerEngine 来源） <Site url="posts.careerengine.us" size="sm" />

<Route namespace="wechat" :data='{"path":"/ce/:id","categories":["new-media"],"example":"/wechat/ce/595a5b14d7164e53908f1606","parameters":{"id":"公众号 id，在 [CareerEngine](https://search.careerengine.us/) 搜索公众号，通过 URL 中找到对应的公众号 id"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["cimidata.com/a/:id"]}],"name":"公众号（CareerEngine 来源）","maintainers":["HenryQW"],"location":"ce.ts"}' />

### 公众号（二十次幂来源） <Site url="posts.careerengine.us" size="sm" />

<Route namespace="wechat" :data='{"path":"/ershicimi/:id","categories":["new-media"],"example":"/wechat/ershicimi/813oxJOl","parameters":{"id":"公众号id，打开公众号页，在 URL 中找到 id"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"公众号（二十次幂来源）","maintainers":["sanmmm"],"location":"ershcimi.ts"}' />

### 公众号栏目 (非推送 & 历史消息) <Site url="posts.careerengine.us" size="sm" />

<Route namespace="wechat" :data='{"path":"/mp/homepage/:biz/:hid/:cid?","categories":["new-media"],"example":"/wechat/mp/homepage/MzA3MDM3NjE5NQ==/16","parameters":{"biz":"公众号id","hid":"分页id","cid":"页内栏目"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"公众号栏目 (非推送 & 历史消息)","maintainers":["MisteryMonster"],"description":"只适用拥有首页模板 (分享链接带有 homepage) 的公众号。例如从公众号分享出来的链接为 `https://mp.weixin.qq.com/mp/homepage?__biz=MzA3MDM3NjE5NQ==&hid=4`，`biz` 为 `MzA3MDM3NjE5NQ==`，`hid` 为 `4`。\n\n  有些页面里会有分栏， `cid` 可以通过元素选择器选中栏目查看`data-index`。如[链接](https://mp.weixin.qq.com/mp/homepage?__biz=MzA3MDM3NjE5NQ==&hid=4)里的 `京都职人` 栏目的 `cid` 为 `0`，`文艺时光` 栏目的 `cid` 为 `2`。如果不清楚的话最左边的栏目为`0`，其右方栏目依次递增 `1`。","location":"mp.ts"}' />

只适用拥有首页模板 (分享链接带有 homepage) 的公众号。例如从公众号分享出来的链接为 `https://mp.weixin.qq.com/mp/homepage?__biz=MzA3MDM3NjE5NQ==&hid=4`，`biz` 为 `MzA3MDM3NjE5NQ==`，`hid` 为 `4`。

  有些页面里会有分栏， `cid` 可以通过元素选择器选中栏目查看`data-index`。如[链接](https://mp.weixin.qq.com/mp/homepage?__biz=MzA3MDM3NjE5NQ==&hid=4)里的 `京都职人` 栏目的 `cid` 为 `0`，`文艺时光` 栏目的 `cid` 为 `2`。如果不清楚的话最左边的栏目为`0`，其右方栏目依次递增 `1`。

### 公众号文章话题 Tag <Site url="posts.careerengine.us" size="sm" />

<Route namespace="wechat" :data='{"path":"/mp/msgalbum/:biz/:aid","categories":["new-media"],"example":"/wechat/mp/msgalbum/MzA3MDM3NjE5NQ==/1375870284640911361","parameters":{"biz":"公众号id","aid":"Tag id"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"公众号文章话题 Tag","maintainers":["MisteryMonster"],"description":"一些公众号（如看理想）会在微信文章里添加 Tag ，点入 Tag 的链接如 `https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzA3MDM3NjE5NQ==&action=getalbum&album_id=1375870284640911361`，其中`biz` 为 `MzA3MDM3NjE5NQ==`，`aid` 为 `1375870284640911361`。","location":"msgalbum.ts"}' />

一些公众号（如看理想）会在微信文章里添加 Tag ，点入 Tag 的链接如 `https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzA3MDM3NjE5NQ==&action=getalbum&album_id=1375870284640911361`，其中`biz` 为 `MzA3MDM3NjE5NQ==`，`aid` 为 `1375870284640911361`。

### 公众号（搜狗来源） <Site url="posts.careerengine.us" size="sm" />

<Route namespace="wechat" :data='{"path":"/sogou/:id","categories":["new-media"],"example":"/wechat/sogou/qimao0908","parameters":{"id":"公众号 id, 打开 weixin.sogou.com 并搜索相应公众号， 在 URL 中找到 id"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"公众号（搜狗来源）","maintainers":["EthanWng97"],"location":"sogou.ts"}' />

### 公众号（Telegram 频道来源） <Site url="posts.careerengine.us" size="sm" />

<Route namespace="wechat" :data='{"path":"/tgchannel/:id/:mpName?/:searchQueryType?","categories":["new-media"],"example":"/wechat/tgchannel/lifeweek","parameters":{"id":"公众号绑定频道 id","mpName":"欲筛选的公众号全名（URL-encoded，精确匹配），在频道订阅了多个公众号时可选用","searchQueryType":"搜索查询类型，见下表"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"公众号（Telegram 频道来源）","maintainers":["LogicJake","Rongronggg9"],"description":"| 搜索查询类型 | 将使用的搜索关键字 |            适用于           |\n  | :----------: | :----------------: | :-------------------------: |\n  |      `0`     |     (禁用搜索)     |       所有情况 (默认)       |\n  |      `1`     |     公众号全名     | 未启用 efb-patch-middleware |\n  |      `2`     |     #公众号全名    | 已启用 efb-patch-middleware |\n\n  :::tip\n  启用搜索有助于在订阅了过多公众号的频道里有效筛选，不易因为大量公众号同时推送导致一些公众号消息被遗漏，但必须正确选择搜索查询类型，否则会搜索失败。\n  :::\n\n  :::warning\n  该方法需要通过 efb 进行频道绑定，具体操作见 [https://github.com/DIYgod/RSSHub/issues/2172](https://github.com/DIYgod/RSSHub/issues/2172)\n  :::","location":"tgchannel.ts"}' />

| 搜索查询类型 | 将使用的搜索关键字 |            适用于           |
  | :----------: | :----------------: | :-------------------------: |
  |      `0`     |     (禁用搜索)     |       所有情况 (默认)       |
  |      `1`     |     公众号全名     | 未启用 efb-patch-middleware |
  |      `2`     |     #公众号全名    | 已启用 efb-patch-middleware |

  :::tip
  启用搜索有助于在订阅了过多公众号的频道里有效筛选，不易因为大量公众号同时推送导致一些公众号消息被遗漏，但必须正确选择搜索查询类型，否则会搜索失败。
  :::

  :::warning
  该方法需要通过 efb 进行频道绑定，具体操作见 [https://github.com/DIYgod/RSSHub/issues/2172](https://github.com/DIYgod/RSSHub/issues/2172)
  :::

### 公众号（优读来源） <Site url="posts.careerengine.us" size="sm" />

<Route namespace="wechat" :data='{"path":"/uread/:userid","categories":["new-media"],"example":"/wechat/uread/shensing","parameters":{"userid":"公众号的微信号, 可在 微信-公众号-更多资料 中找到。并不是所有的都支持，能不能用随缘"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"公众号（优读来源）","maintainers":["kt286"],"location":"uread.ts"}' />

### 公众号（Wechat2RSS 来源） <Site url="posts.careerengine.us" size="sm" />

<Route namespace="wechat" :data='{"path":"/wechat2rss/:id","categories":["new-media"],"example":"/wechat/wechat2rss/5b925323244e9737c39285596c53e3a2f4a30774","parameters":{"id":"公众号 id，打开 `https://wechat2rss.xlab.app/posts/list/`，在 URL 中找到 id；注意不是公众号页的 id，而是订阅的 id"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"公众号（Wechat2RSS 来源）","maintainers":["TonyRL"],"location":"wechat2rss.ts"}' />

## 维基新闻 <Site url="zh.wikinews.org"/>

### 最新新闻 <Site url="zh.wikinews.org" size="sm" />

<Route namespace="wikinews" :data='{"path":"/latest","categories":["new-media"],"example":"/wikinews/latest","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["zh.wikinews.org/wiki/Special:新闻订阅"]}],"name":"最新新闻","maintainers":["KotoriK"],"description":"根据维基新闻的[sitemap](https://zh.wikinews.org/wiki/Special:%E6%96%B0%E9%97%BB%E8%AE%A2%E9%98%85)获取新闻全文。目前仅支持中文维基新闻。","location":"index.ts"}' />

根据维基新闻的[sitemap](https://zh.wikinews.org/wiki/Special:%E6%96%B0%E9%97%BB%E8%AE%A2%E9%98%85)获取新闻全文。目前仅支持中文维基新闻。

## 乌有之乡 <Site url="wyzxwk.com"/>

### 栏目 <Site url="wyzxwk.com" size="sm" />

<Route namespace="wyzxwk" :data='{"path":"/article/:id?","categories":["new-media"],"example":"/wyzxwk/article/shushe","parameters":{"id":"栏目 id，可在栏目页 URL 中找到，默认为时代观察"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["wyzxwk.com/Article/:id","wyzxwk.com/"]}],"name":"栏目","maintainers":["nczitzk"],"description":"时政\n\n  | 时代观察 | 舆论战争 |\n  | -------- | -------- |\n  | shidai   | yulun    |\n\n  经济\n\n  | 经济视点 | 社会民生 | 三农关注 | 产业研究 |\n  | -------- | -------- | -------- | -------- |\n  | jingji   | shehui   | sannong  | chanye   |\n\n  国际\n\n  | 国际纵横 | 国防外交 |\n  | -------- | -------- |\n  | guoji    | guofang  |\n\n  思潮\n\n  | 理想之旅 | 思潮碰撞 | 文艺新生 | 读书交流 |\n  | -------- | -------- | -------- | -------- |\n  | lixiang  | sichao   | wenyi    | shushe   |\n\n  历史\n\n  | 历史视野 | 中华文化 | 中华医药 | 共产党人 |\n  | -------- | -------- | -------- | -------- |\n  | lishi    | zhonghua | zhongyi  | cpers    |\n\n  争鸣\n\n  | 风华正茂 | 工农之声 | 网友杂谈 | 网友时评 |\n  | -------- | -------- | -------- | -------- |\n  | qingnian | gongnong | zatan    | shiping  |\n\n  活动\n\n  | 乌有公告 | 红色旅游 | 乌有讲堂  | 书画欣赏 |\n  | -------- | -------- | --------- | -------- |\n  | gonggao  | lvyou    | jiangtang | shuhua   |","location":"article.ts"}' />

时政

  | 时代观察 | 舆论战争 |
  | -------- | -------- |
  | shidai   | yulun    |

  经济

  | 经济视点 | 社会民生 | 三农关注 | 产业研究 |
  | -------- | -------- | -------- | -------- |
  | jingji   | shehui   | sannong  | chanye   |

  国际

  | 国际纵横 | 国防外交 |
  | -------- | -------- |
  | guoji    | guofang  |

  思潮

  | 理想之旅 | 思潮碰撞 | 文艺新生 | 读书交流 |
  | -------- | -------- | -------- | -------- |
  | lixiang  | sichao   | wenyi    | shushe   |

  历史

  | 历史视野 | 中华文化 | 中华医药 | 共产党人 |
  | -------- | -------- | -------- | -------- |
  | lishi    | zhonghua | zhongyi  | cpers    |

  争鸣

  | 风华正茂 | 工农之声 | 网友杂谈 | 网友时评 |
  | -------- | -------- | -------- | -------- |
  | qingnian | gongnong | zatan    | shiping  |

  活动

  | 乌有公告 | 红色旅游 | 乌有讲堂  | 书画欣赏 |
  | -------- | -------- | --------- | -------- |
  | gonggao  | lvyou    | jiangtang | shuhua   |

## 香港 01 <Site url="hk01.com"/>

### Unknown <Site url="hk01.com" size="sm" />

<Route namespace="hk01" :data='{"path":"/channel/:id?","radar":[{"source":["hk01.com/channel/:id","hk01.com/"]}],"name":"Unknown","maintainers":[],"location":"channel.ts"}' />

### Unknown <Site url="hk01.com" size="sm" />

<Route namespace="hk01" :data='{"path":"/issue/:id?","radar":[{"source":["hk01.com/issue/:id","hk01.com/"]}],"name":"Unknown","maintainers":[],"location":"issue.ts"}' />

### Unknown <Site url="hk01.com" size="sm" />

<Route namespace="hk01" :data='{"path":"/tag/:id?","radar":[{"source":["hk01.com/tag/:id","hk01.com/"]}],"name":"Unknown","maintainers":[],"location":"tag.ts"}' />

### Unknown <Site url="hk01.com" size="sm" />

<Route namespace="hk01" :data='{"path":"/zone/:id?","radar":[{"source":["hk01.com/zone/:id","hk01.com/"]}],"name":"Unknown","maintainers":[],"location":"zone.ts"}' />

### 即時 <Site url="hk01.com/latest" size="sm" />

<Route namespace="hk01" :data='{"path":"/latest","categories":["new-media"],"example":"/hk01/latest","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["hk01.com/latest","hk01.com/"]}],"name":"即時","maintainers":["5upernova-heng"],"url":"hk01.com/latest","location":"latest.ts"}' />

### 热门 <Site url="hk01.com/hot" size="sm" />

<Route namespace="hk01" :data='{"path":"/hot","categories":["new-media"],"example":"/hk01/hot","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["hk01.com/hot","hk01.com/"]}],"name":"热门","maintainers":["hoilc","Fatpandac","nczitzk"],"url":"hk01.com/hot","location":"hot.ts"}' />

## 消费者委员会 <Site url="consumer.org.hk"/>

### 文章 <Site url="consumer.org.hk/" size="sm" />

<Route namespace="consumer" :data='{"path":"/:category?/:language?/:keyword?","categories":["new-media"],"example":"/consumer","parameters":{"category":"分类，见下表，默认为測試及調查","language":"语言，见下表，默认为繁体中文","keyword":"关键字，默认为空"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["consumer.org.hk/"]}],"name":"文章","maintainers":["nczitzk"],"url":"consumer.org.hk/","description":"分类\n\n  | 测试及调查 | 生活资讯 | 投诉实录  | 议题评论 |\n  | ---------- | -------- | --------- | -------- |\n  | test       | life     | complaint | topic    |\n\n  语言\n\n  | 简体中文 | 繁体中文 |\n  | -------- | -------- |\n  | sc       | tc       |","location":"index.ts"}' />

分类

  | 测试及调查 | 生活资讯 | 投诉实录  | 议题评论 |
  | ---------- | -------- | --------- | -------- |
  | test       | life     | complaint | topic    |

  语言

  | 简体中文 | 繁体中文 |
  | -------- | -------- |
  | sc       | tc       |

### 消費全攻略 <Site url="consumer.org.hk" size="sm" />

<Route namespace="consumer" :data='{"path":"/shopping-guide/:category?/:language?","categories":["new-media"],"example":"/consumer/shopping-guide","parameters":{"category":"分类，见下表，默认为 `trivia`","language":"语言，见上表，默认为 `tc`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"消費全攻略","maintainers":["TonyRL"],"description":"| 冷知識 | 懶人包 | 特集     | 銀髮一族           | 飲食煮意         | 科技達人   | 健康美容          | 規劃人生                    | 消閒娛樂                  | 家品家電        | 親子時光        | 綠色生活     |\n  | ------ | ------ | -------- | ------------------ | ---------------- | ---------- | ----------------- | --------------------------- | ------------------------- | --------------- | --------------- | ------------ |\n  | trivia | tips   | features | silver-hair-market | food-and-cooking | tech-savvy | health-and-beauty | life-and-financial-planning | leisure-and-entertainment | home-appliances | family-and-kids | green-living |","location":"shopping-guide.ts"}' />

| 冷知識 | 懶人包 | 特集     | 銀髮一族           | 飲食煮意         | 科技達人   | 健康美容          | 規劃人生                    | 消閒娛樂                  | 家品家電        | 親子時光        | 綠色生活     |
  | ------ | ------ | -------- | ------------------ | ---------------- | ---------- | ----------------- | --------------------------- | ------------------------- | --------------- | --------------- | ------------ |
  | trivia | tips   | features | silver-hair-market | food-and-cooking | tech-savvy | health-and-beauty | life-and-financial-planning | leisure-and-entertainment | home-appliances | family-and-kids | green-living |

## 小黑盒 <Site url="news.cn"/>

### 新华社新闻 <Site url="news.cn/xhsxw.htm" size="sm" />

<Route namespace="news" :data='{"path":["/xhsxw","/whxw"],"categories":["new-media"],"example":"/news/xhsxw","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["news.cn/xhsxw.htm"]}],"name":"新华社新闻","maintainers":["nczitzk"],"url":"news.cn/xhsxw.htm","location":"xhsxw.ts"}' />

### 新华社新闻 <Site url="news.cn/xhsxw.htm" size="sm" />

<Route namespace="news" :data='{"path":["/xhsxw","/whxw"],"categories":["new-media"],"example":"/news/xhsxw","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["news.cn/xhsxw.htm"]}],"name":"新华社新闻","maintainers":["nczitzk"],"url":"news.cn/xhsxw.htm","location":"xhsxw.ts"}' />

## 小刀娱乐网 <Site url="xd.x6d.com"/>

### 分类 <Site url="xd.x6d.com" size="sm" />

<Route namespace="x6d" :data='{"path":"/:id?","name":"分类","url":"xd.x6d.com","maintainers":["nczitzk"],"example":"/x6d/34","parameters":{"id":"分类 id，可在对应分类页面的 URL 中找到，默认为首页最近更新"},"description":"| 技巧分享 | QQ 技巧 | 微信技巧 | 其他教程 | 其他分享 |\n  | -------- | ------- | -------- | -------- | -------- |\n  | 31       | 55      | 112      | 33       | 88       |\n\n  | 宅家自学 | 健身养生 | 摄影剪辑 | 长点知识 | 自我提升 | 两性相关 | 编程办公 | 职场关系 | 新媒体运营 | 其他教程 |\n  | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | ---------- | -------- |\n  | 18       | 98       | 94       | 93       | 99       | 100      | 21       | 22       | 19         | 44       |\n\n  | 活动线报 | 流量话费 | 免费会员 | 实物活动 | 游戏活动 | 红包活动 | 空间域名 | 其他活动 |\n  | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |\n  | 34       | 35       | 91       | 92       | 39       | 38       | 37       | 36       |\n\n  | 值得一看 | 找点乐子 | 热门事件 | 节目推荐 |\n  | -------- | -------- | -------- | -------- |\n  | 65       | 50       | 77       | 101      |\n\n  | 值得一听 | 每日一听 | 歌单推荐 |\n  | -------- | -------- | -------- |\n  | 71       | 87       | 79       |\n\n  | 资源宝库 | 书籍资料 | 设计资源 | 剪辑资源 | 办公资源 | 壁纸资源 | 编程资源 |\n  | -------- | -------- | -------- | -------- | -------- | -------- | -------- |\n  | 106      | 107      | 108      | 109      | 110      | 111      | 113      |","categories":["new-media"],"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"location":"index.ts"}' />

| 技巧分享 | QQ 技巧 | 微信技巧 | 其他教程 | 其他分享 |
  | -------- | ------- | -------- | -------- | -------- |
  | 31       | 55      | 112      | 33       | 88       |

  | 宅家自学 | 健身养生 | 摄影剪辑 | 长点知识 | 自我提升 | 两性相关 | 编程办公 | 职场关系 | 新媒体运营 | 其他教程 |
  | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | ---------- | -------- |
  | 18       | 98       | 94       | 93       | 99       | 100      | 21       | 22       | 19         | 44       |

  | 活动线报 | 流量话费 | 免费会员 | 实物活动 | 游戏活动 | 红包活动 | 空间域名 | 其他活动 |
  | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
  | 34       | 35       | 91       | 92       | 39       | 38       | 37       | 36       |

  | 值得一看 | 找点乐子 | 热门事件 | 节目推荐 |
  | -------- | -------- | -------- | -------- |
  | 65       | 50       | 77       | 101      |

  | 值得一听 | 每日一听 | 歌单推荐 |
  | -------- | -------- | -------- |
  | 71       | 87       | 79       |

  | 资源宝库 | 书籍资料 | 设计资源 | 剪辑资源 | 办公资源 | 壁纸资源 | 编程资源 |
  | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
  | 106      | 107      | 108      | 109      | 110      | 111      | 113      |

## 小专栏 <Site url="xiaozhuanlan.com"/>

### 专栏 <Site url="xiaozhuanlan.com" size="sm" />

<Route namespace="xiaozhuanlan" :data='{"path":"/column/:id","categories":["new-media"],"example":"/xiaozhuanlan/column/olddriver-selection","parameters":{"id":"专栏 ID，可在专栏页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["xiaozhuanlan.com/:id"]}],"name":"专栏","maintainers":["TonyRL"],"location":"column.ts"}' />

## 新浪 <Site url="finance.sina.com.cn"/>

### Unknown <Site url="finance.sina.com.cn" size="sm" />

<Route namespace="sina" :data='{"path":"/sports/:type?","name":"Unknown","maintainers":["nczitzk"],"location":"sports.ts"}' />

### 财经－国內 <Site url="finance.sina.com.cn/china" size="sm" />

<Route namespace="sina" :data='{"path":"/finance/china/:lid?","categories":["new-media"],"example":"/sina/finance/china","parameters":{"lid":"分区 id，见下表，默认为 `1686`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["finance.sina.com.cn/china","finance.sina.com.cn/"],"target":"/finance/china"}],"name":"财经－国內","maintainers":["yubinbai"],"url":"finance.sina.com.cn/china","description":"| 国内滚动 | 宏观经济 | 金融新闻 | 地方经济 | 部委动态 | 今日财经 TOP10 |\n  | -------- | -------- | -------- | -------- | -------- | -------------- |\n  | 1686     | 1687     | 1690     | 1688     | 1689     | 3231           |","location":"finance/china.ts"}' />

| 国内滚动 | 宏观经济 | 金融新闻 | 地方经济 | 部委动态 | 今日财经 TOP10 |
  | -------- | -------- | -------- | -------- | -------- | -------------- |
  | 1686     | 1687     | 1690     | 1688     | 1689     | 3231           |

### 滚动新闻 <Site url="finance.sina.com.cn" size="sm" />

<Route namespace="sina" :data='{"path":"/rollnews/:lid?","categories":["new-media"],"example":"/sina/rollnews","parameters":{"lid":"分区 id，可在 URL 中找到，默认为 `2509`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"滚动新闻","maintainers":["xyqfer"],"description":"| 全部 | 国内 | 国际 | 社会 | 体育 | 娱乐 | 军事 | 科技 | 财经 | 股市 | 美股 |\n  | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |\n  | 2509 | 2510 | 2511 | 2669 | 2512 | 2513 | 2514 | 2515 | 2516 | 2517 | 2518 |","location":"rollnews.ts"}' />

| 全部 | 国内 | 国际 | 社会 | 体育 | 娱乐 | 军事 | 科技 | 财经 | 股市 | 美股 |
  | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
  | 2509 | 2510 | 2511 | 2669 | 2512 | 2513 | 2514 | 2515 | 2516 | 2517 | 2518 |

### 科技 - 科学探索 <Site url="finance.sina.com.cn" size="sm" />

<Route namespace="sina" :data='{"path":"/discovery/:type","categories":["new-media"],"example":"/sina/discovery/zx","parameters":{"type":"订阅分区类型，见下表"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"科技 - 科学探索","maintainers":["LogicJake"],"description":"| 最新 | 天文航空 | 动物植物 | 自然地理 | 历史考古 | 生命医学 | 生活百科 | 科技前沿 |\n  | ---- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |\n  | zx   | twhk     | dwzw     | zrdl     | lskg     | smyx     | shbk     | kjqy     |","location":"discovery.ts"}' />

| 最新 | 天文航空 | 动物植物 | 自然地理 | 历史考古 | 生命医学 | 生活百科 | 科技前沿 |
  | ---- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
  | zx   | twhk     | dwzw     | zrdl     | lskg     | smyx     | shbk     | kjqy     |

### 美股 <Site url="finance.sina.com.cn/stock/usstock" size="sm" />

<Route namespace="sina" :data='{"path":"/finance/stock/usstock/:cids?","categories":["new-media"],"example":"/sina/finance/stock/usstock","parameters":{"cids":"分区 id，见下表，默认为 `57045`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["finance.sina.com.cn/stock/usstock","finance.sina.com.cn/"],"target":"/finance/stock/usstock"}],"name":"美股","maintainers":["TonyRL"],"url":"finance.sina.com.cn/stock/usstock","description":"| 最新报道 | 中概股 | 国际财经 | 互联网 |\n  | -------- | ------ | -------- | ------ |\n  | 57045    | 57046  | 56409    | 40811  |","location":"finance/stock/usstock.ts"}' />

| 最新报道 | 中概股 | 国际财经 | 互联网 |
  | -------- | ------ | -------- | ------ |
  | 57045    | 57046  | 56409    | 40811  |

### 专栏 - 创事记 <Site url="tech.sina.com.cn/chuangshiji" size="sm" />

<Route namespace="sina" :data='{"path":"/csj","categories":["new-media"],"example":"/sina/csj","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["tech.sina.com.cn/chuangshiji","tech.sina.com.cn/"]}],"name":"专栏 - 创事记","maintainers":["xapool"],"url":"tech.sina.com.cn/chuangshiji","location":"chuangshiji.ts"}' />

## 新片场 <Site url="xinpianchang.com"/>

### 发现 <Site url="xinpianchang.com" size="sm" />

<Route namespace="xinpianchang" :data='{"path":["/discover/:params?","/:params?"],"categories":["new-media"],"example":"/xinpianchang/discover","parameters":{"params":"参数，可在对应分类页 URL 中找到，默认为 `article-0-0-all-all-0-0-score` ，即全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"发现","maintainers":["nczitzk"],"description":":::tip\n  跳转到欲订阅的分类页，将 URL 的 `/discover` 到末尾的部分填入 `params` 参数。\n\n  如 [全部原创视频作品](https://www.xinpianchang.com/discover/article-0-0-all-all-0-0-score) 的 URL 为 `https://www.xinpianchang.com/discover/article-0-0-all-all-0-0-score`，其 `/discover` 到末尾的部分为 `article-0-0-all-all-0-0-score`，所以对应的路由为 [/xinpianchang/discover/article-0-0-all-all-0-0-score](https://rsshub.app/xinpianchang/discover/article-0-0-all-all-0-0-score)。\n  :::","location":"index.ts"}' />

:::tip
  跳转到欲订阅的分类页，将 URL 的 `/discover` 到末尾的部分填入 `params` 参数。

  如 [全部原创视频作品](https://www.xinpianchang.com/discover/article-0-0-all-all-0-0-score) 的 URL 为 `https://www.xinpianchang.com/discover/article-0-0-all-all-0-0-score`，其 `/discover` 到末尾的部分为 `article-0-0-all-all-0-0-score`，所以对应的路由为 [/xinpianchang/discover/article-0-0-all-all-0-0-score](https://rsshub.app/xinpianchang/discover/article-0-0-all-all-0-0-score)。
  :::

### 发现 <Site url="xinpianchang.com" size="sm" />

<Route namespace="xinpianchang" :data='{"path":["/discover/:params?","/:params?"],"categories":["new-media"],"example":"/xinpianchang/discover","parameters":{"params":"参数，可在对应分类页 URL 中找到，默认为 `article-0-0-all-all-0-0-score` ，即全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"发现","maintainers":["nczitzk"],"description":":::tip\n  跳转到欲订阅的分类页，将 URL 的 `/discover` 到末尾的部分填入 `params` 参数。\n\n  如 [全部原创视频作品](https://www.xinpianchang.com/discover/article-0-0-all-all-0-0-score) 的 URL 为 `https://www.xinpianchang.com/discover/article-0-0-all-all-0-0-score`，其 `/discover` 到末尾的部分为 `article-0-0-all-all-0-0-score`，所以对应的路由为 [/xinpianchang/discover/article-0-0-all-all-0-0-score](https://rsshub.app/xinpianchang/discover/article-0-0-all-all-0-0-score)。\n  :::","location":"index.ts"}' />

:::tip
  跳转到欲订阅的分类页，将 URL 的 `/discover` 到末尾的部分填入 `params` 参数。

  如 [全部原创视频作品](https://www.xinpianchang.com/discover/article-0-0-all-all-0-0-score) 的 URL 为 `https://www.xinpianchang.com/discover/article-0-0-all-all-0-0-score`，其 `/discover` 到末尾的部分为 `article-0-0-all-all-0-0-score`，所以对应的路由为 [/xinpianchang/discover/article-0-0-all-all-0-0-score](https://rsshub.app/xinpianchang/discover/article-0-0-all-all-0-0-score)。
  :::

### 排行榜 <Site url="xinpianchang.com" size="sm" />

<Route namespace="xinpianchang" :data='{"path":"/rank/:category?","categories":["new-media"],"example":"/xinpianchang/rank","parameters":{"category":"分类 id，可在对应排行榜页 URL 中找到，见下表，默认为 `all` ，即总榜"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"排行榜","maintainers":["nczitzk"],"description":"| 分类     | id         |\n  | -------- | ---------- |\n  | 总榜     | all        |\n  | 精选榜   | staffPicks |\n  | 广告     | ad         |\n  | 宣传片   | publicity  |\n  | 创意     | creative   |\n  | 干货教程 | backstage  |","location":"rank.ts"}' />

| 分类     | id         |
  | -------- | ---------- |
  | 总榜     | all        |
  | 精选榜   | staffPicks |
  | 广告     | ad         |
  | 宣传片   | publicity  |
  | 创意     | creative   |
  | 干货教程 | backstage  |

## 壹蘋新聞網 <Site url="tw.nextapple.com"/>

### 最新新聞 <Site url="tw.nextapple.com/" size="sm" />

<Route namespace="nextapple" :data='{"path":"/realtime/:category?","categories":["new-media"],"example":"/nextapple/realtime/latest","parameters":{"category":"類別，見下表，默認為首頁"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["tw.nextapple.com/","tw.nextapple.com/realtime/:category"]}],"name":"最新新聞","maintainers":["miles170"],"url":"tw.nextapple.com/","description":"| 首頁   | 焦點      | 熱門 | 娛樂          | 生活 | 女神     | 社會  |\n  | ------ | --------- | ---- | ------------- | ---- | -------- | ----- |\n  | latest | recommend | hit  | entertainment | life | gorgeous | local |\n\n  | 政治     | 國際          | 財經    | 體育   | 旅遊美食  | 3C 車市 |\n  | -------- | ------------- | ------- | ------ | --------- | ------- |\n  | politics | international | finance | sports | lifestyle | gadget  |","location":"realtime.ts"}' />

| 首頁   | 焦點      | 熱門 | 娛樂          | 生活 | 女神     | 社會  |
  | ------ | --------- | ---- | ------------- | ---- | -------- | ----- |
  | latest | recommend | hit  | entertainment | life | gorgeous | local |

  | 政治     | 國際          | 財經    | 體育   | 旅遊美食  | 3C 車市 |
  | -------- | ------------- | ------- | ------ | --------- | ------- |
  | politics | international | finance | sports | lifestyle | gadget  |

## 移动支付网 <Site url="mpaypass.com.cn"/>

### 分类 <Site url="mpaypass.com.cn" size="sm" />

<Route namespace="mpaypass" :data='{"path":"/main/:type?","categories":["new-media"],"example":"/mpaypass/main/policy","parameters":{"type":"新闻类型，类型可在URL中找到，类似`policy`，`eye`等，空或其他任意值展示最新新闻"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"分类","maintainers":["zhuan-zhu"],"location":"main.ts"}' />

### 新闻 <Site url="mpaypass.com.cn/" size="sm" />

<Route namespace="mpaypass" :data='{"path":"/news","categories":["new-media"],"example":"/mpaypass/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["mpaypass.com.cn/"]}],"name":"新闻","maintainers":["LogicJake","genghis-yang"],"url":"mpaypass.com.cn/","location":"news.ts"}' />

## 早报网 <Site url="qqorw.cn"/>

### 每日早报 <Site url="qqorw.cn" size="sm" />

<Route namespace="qqorw" :data='{"path":"/:category?","categories":["new-media"],"example":"/qqorw","parameters":{"category":"分类，见下表，默认为首页"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["qqorw.cn/:category","qqorw.cn/"]}],"name":"每日早报","maintainers":["nczitzk"],"description":"| 首页 | 每日早报 | 国际早报 | 生活冷知识 |\n  | ---- | -------- | -------- | ---------- |\n  |      | mrzb     | zbapp    | zbzzd      |","location":"index.ts"}' />

| 首页 | 每日早报 | 国际早报 | 生活冷知识 |
  | ---- | -------- | -------- | ---------- |
  |      | mrzb     | zbapp    | zbzzd      |

## 知园 <Site url="zhiy.cc"/>

### Newsletter <Site url="zhiy.cc" size="sm" />

<Route namespace="zhiy" :data='{"path":"/letters/:author","categories":["new-media"],"example":"/zhiy/letters/messy","parameters":{"author":"作者 ID，可在URL中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["zhiy.cc/:author"]}],"name":"Newsletter","maintainers":["TonyRL"],"location":"letter.ts"}' />

### 笔记 <Site url="zhiy.cc" size="sm" />

<Route namespace="zhiy" :data='{"path":"/posts/:author","categories":["new-media"],"example":"/zhiy/posts/long","parameters":{"author":"作者 ID，可在URL中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["zhiy.cc/:author"]}],"name":"笔记","maintainers":["TonyRL"],"location":"post.ts"}' />

## 中国钢铁工业协会 <Site url="chinaisa.org.cn"/>

### 栏目 <Site url="chinaisa.org.cn" size="sm" />

<Route namespace="chinaisa" :data='{"path":"/:id?","categories":["new-media"],"example":"/chinaisa","parameters":{"id":"栏目，见下表，默认为钢协动态"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"栏目","maintainers":["nczitzk"],"description":"| 栏目     | id                                                               |\n  | -------- | ---------------------------------------------------------------- |\n  | 钢协动态 | 58af05dfb6b4300151760176d2aad0a04c275aaadbb1315039263f021f920dcd |\n  | 钢协要闻 | 67ea4f106bd8f0843c0538d43833c463a0cd411fc35642cbd555a5f39fcf352b |\n  | 会议报道 | e5070694f299a43b20d990e53b6a69dc02e755fef644ae667cf75deaff80407a |\n  | 领导讲话 | a873c2e67b26b4a2d8313da769f6e106abc9a1ff04b7f1a50674dfa47cf91a7b |\n  | 图片新闻 | 806254321b2459bddb3c2cb5590fef6332bd849079d3082daf6153d7f8d62e1e |\n\n  <details>\n    <summary>更多栏目</summary>\n\n    #### 党建工作\n\n    | 栏目                                                 | id                                                               |\n    | ---------------------------------------------------- | ---------------------------------------------------------------- |\n    | 党建工作                                             | 10e8911e0c852d91f08e173c768700da608abfb4e7b0540cb49fa5498f33522b |\n    | 学习贯彻习近平新时代中国特色社会主义思想主题教育专栏 | b7a7ad4b5d8ffaca4b29f3538fd289da9d07f827f89e6ea57ef07257498aacf9 |\n    | 党史学习教育专栏                                     | 4d8e7dec1b672704916331431156ea7628a598c191d751e4fc28408ccbd4e0c4 |\n    | 不忘初心、牢记使命                                   | 427f7c28c90ec9db1aab78db8156a63ff2e23f6a0cea693e3847fe6d595753db |\n    | 两学一做                                             | 5b0609fedc9052bb44f1cfe9acf5ec8c9fe960f22a07be69636f2cf1cacaa8f7 |\n    | 钢协党代会                                           | beaaa0314f0f532d4b18244cd70df614a4af97465d974401b1f5b3349d78144b |\n    | 创先争优                                             | e7ea82c886ba18691210aaf48b3582a92dca9c4f2aab912757cedafb066ff8a6 |\n    | 青年工作                                             | 2706ee3a4a4c3c23e90e13c8fdc3002855d1dba394b61626562a97b33af3dbd0 |\n    | 日常动态                                             | e21157a082fc0ab0d7062c8755e91472ee0d23de6ccc5c2a44b62e54062cf1e4 |\n\n    #### 要闻\n\n    | 栏目         | id                                                               |\n    | ------------ | ---------------------------------------------------------------- |\n    | 要闻         | c42511ce3f868a515b49668dd250290c80d4dc8930c7e455d0e6e14b8033eae2 |\n    | 会员动态     | 268f86fdf61ac8614f09db38a2d0295253043b03e092c7ff48ab94290296125c |\n    | 疫情应对专栏 | a83c48faeb34065fd9b33d3c84957a152675141458aedc0ec454b760c9fcad65 |\n\n    #### 统计发布\n\n    | 栏目     | id                                                               |\n    | -------- | ---------------------------------------------------------------- |\n    | 统计发布 | 2e3c87064bdfc0e43d542d87fce8bcbc8fe0463d5a3da04d7e11b4c7d692194b |\n    | 生产经营 | 3238889ba0fa3aabcf28f40e537d440916a361c9170a4054f9fc43517cb58c1e |\n    | 进出口   | 95ef75c752af3b6c8be479479d8b931de7418c00150720280d78c8f0da0a438c |\n    | 环保统计 | 619ce7b53a4291d47c19d0ee0765098ca435e252576fbe921280a63fba4bc712 |\n\n    #### 行业分析\n\n    | 栏目     | id                                                               |\n    | -------- | ---------------------------------------------------------------- |\n    | 行业分析 | 1b4316d9238e09c735365896c8e4f677a3234e8363e5622ae6e79a5900a76f56 |\n    | 市场分析 | a44207e193a5caa5e64102604b6933896a0025eb85c57c583b39626f33d4dafd |\n    | 板带材   | 05d0e136828584d2cd6e45bdc3270372764781b98546cce122d9974489b1e2f2 |\n    | 社会库存 | 197422a82d9a09b9cc86188444574816e93186f2fde87474f8b028fc61472d35 |\n\n    #### 钢材价格指数\n\n    | 栏目         | id                                                               |\n    | ------------ | ---------------------------------------------------------------- |\n    | 钢材价格指数 | 17b6a9a214c94ccc28e56d4d1a2dbb5acef3e73da431ddc0a849a4dcfc487d04 |\n    | 综合价格指数 | 63913b906a7a663f7f71961952b1ddfa845714b5982655b773a62b85dd3b064e |\n    | 地区价格     | fc816c75aed82b9bc25563edc9cf0a0488a2012da38cbef5258da614d6e51ba9 |\n\n    #### 宏观经济信息\n\n    | 栏目         | id                                                               |\n    | ------------ | ---------------------------------------------------------------- |\n    | 宏观经济信息 | 5d77b433182404193834120ceed16fe0625860fafd5fd9e71d0800c4df227060 |\n    | 相关行业信息 | ae2a3c0fd4936acf75f4aab6fadd08bc6371aa65bdd50419e74b70d6f043c473 |\n    | 国际动态     | 1bad7c56af746a666e4a4e56e54a9508d344d7bc1498360580613590c16b6c41 |\n\n    #### 专题报道\n\n    | 栏目                 | id                                                               |\n    | -------------------- | ---------------------------------------------------------------- |\n    | 专题报道             | 50e7242bfd78b4395f3338df7699a0ff8847b886c4c3a55bd7c102a2cfe32fe9 |\n    | 钢协理事会           | 40c6404418699f0f8cb4e513013bb110ef250c782f0959852601e7c75e1afcd8 |\n    | 钢协新闻发布会       | 11ea370f565c6c141b1a4dac60aa00c4331bd442382a5dd476a5e73e001b773c |\n    | 劳模表彰             | 907e4ae217bf9c981a132051572103f9c87cccb7f00caf5a1770078829e6bcb3 |\n    | 钢铁行业职业技能竞赛 | 563c15270a691e3c7cb9cd9ba457c5af392eb4630fa833fc1a55c8e2afbc28a9 |\n\n    #### 成果奖励\n\n    | 栏目                   | id                                                               |\n    | ---------------------- | ---------------------------------------------------------------- |\n    | 成果奖励               | a6c30053b66356b4d77fbf6668bda69f7e782b2ae08a21d5db171d50a504bd40 |\n    | 冶金科学技术奖         | 50fe0c63f657ee48e49cb13fe7f7c5502046acdb05e2ee8a317f907af4191683 |\n    | 企业管理现代化创新成果 | b5607d3b73c2c3a3b069a97b9dbfd59af64aea27bafd5eb87ba44d1b07a33b66 |\n    | 清洁生产环境友好企业   | 4475c8e21374d063a22f95939a2909837e78fab1832dc97bf64f09fa01c0c5f7 |\n    | 产品开发市场开拓奖     | 169e34d7b29e3deaf4d4496da594d3bbde2eb0a40f7244b54dbfb9cc89a37296 |\n    | 质量金杯奖             | 68029784be6d9a7bf9cb8cace5b8a5ce5d2d871e9a0cbcbf84eeae0ea2746311 |\n\n    #### 节能减排\n\n    | 栏目                                       | id                                                               |\n    | ------------------------------------------ | ---------------------------------------------------------------- |\n    | 节能减排                                   | 08895f1681c198fdf297ab38e33e1f428f6ccf2add382f3844a52e410f10e5a0 |\n    | 先进节能环保技术                           | 6e639343a517fd08e5860fba581d41940da523753956ada973b6952fc05ef94f |\n    | 钢铁企业超低排放改造和评估监测进展情况公示 | 50d99531d5dee68346653ca9548f308764ad38410a091e662834a5ed66770174 |\n\n    #### 国际交流\n\n    | 栏目     | id                                                               |\n    | -------- | ---------------------------------------------------------------- |\n    | 国际交流 | 4753eef81b4019369d4751413d852ab9027944b84c612b5a08614e046d169e81 |\n    | 外事动态 | aa590ec6f835136a9ce8c9f3d0c3b194beb6b78037466ab40bb4aacc32adfcc9 |\n    | 国际会展 | 05ac1f2971bc375d25c9112e399f9c3cbb237809684ebc5b0ca4a68a1fcb971c |\n\n    #### 政策法规\n\n    | 栏目     | id                                                               |\n    | -------- | ---------------------------------------------------------------- |\n    | 政策法规 | 63a69eb0087f1984c0b269a1541905f19a56e117d56b3f51dfae0e6c1d436533 |\n    | 政策法规 | a214b2e71c3c79fa4a36ff382ee5f822b9603634626f7e320f91ed696b3666f2 |\n    | 贸易规则 | 5988b2380d04d3efde8cc247377d19530c17904ec0b5decdd00f9b3e026e3715 |\n\n    #### 分会园地\n\n    | 栏目         | id                                                               |\n    | ------------ | ---------------------------------------------------------------- |\n    | 分会园地     | d059d6751dcaae94e31a795072267f7959c35d012eebb9858b3ede2990e82ea9 |\n    | 法律分会     | 96000647f18ea78fa134a3932563e7d27c68d0482de498f179b44846234567a9 |\n    | 设备分会     | c8e1e3f52406115c2c03928271bbe883c0875b7c9f2f67492395685a62a1a2d8 |\n    | 国际产能合作 | 4fb8cc4b0d6f905a969ac3375f6d17b34df4dcae69d798d2a4616daa80af020c |\n    | 绿化分会     | ad55a0fbc1a44e94fb60e21b98cf967aca17ecf1450bdfb3699468fe8235103b |\n\n    #### 钢铁知识\n\n    | 栏目         | id                                                               |\n    | ------------ | ---------------------------------------------------------------- |\n    | 钢铁知识     | 7f7509ff045023015e0d6c1ba22c32734b673be2ec14eae730a99c08e3badb3f |\n    | 钢铁材料使用 | 7e319d71258ed6bb663cf59b4cf67fe97894e60aa5520f3d2cf966f82f9b89ac |\n    | 钢铁标准     | fae0c4dd27f8fe4759941e78c9dc1dfe0088ce30d1b684d12be4c8172d2c08e1 |\n\n    #### 钢协刊物\n\n    | 栏目       | id                                                               |\n    | ---------- | ---------------------------------------------------------------- |\n    | 钢协刊物   | ed51af486f6d4b313b3aaf8fea0b32a4a2d4a89714c61992caf01942eb61831b |\n    | 中国钢铁业 | 6440bdfccadf87908b13d8bbd9a66bb89bbd60cc5e175c018ca1c62c7d55e61f |\n    | 钢铁信息   | 2b66af0b2cda9b420739e55e255a6f72f277557670ef861c9956da8fde25da05 |\n  </details>","location":"index.ts"}' />

| 栏目     | id                                                               |
  | -------- | ---------------------------------------------------------------- |
  | 钢协动态 | 58af05dfb6b4300151760176d2aad0a04c275aaadbb1315039263f021f920dcd |
  | 钢协要闻 | 67ea4f106bd8f0843c0538d43833c463a0cd411fc35642cbd555a5f39fcf352b |
  | 会议报道 | e5070694f299a43b20d990e53b6a69dc02e755fef644ae667cf75deaff80407a |
  | 领导讲话 | a873c2e67b26b4a2d8313da769f6e106abc9a1ff04b7f1a50674dfa47cf91a7b |
  | 图片新闻 | 806254321b2459bddb3c2cb5590fef6332bd849079d3082daf6153d7f8d62e1e |

  <details>
    <summary>更多栏目</summary>

    #### 党建工作

    | 栏目                                                 | id                                                               |
    | ---------------------------------------------------- | ---------------------------------------------------------------- |
    | 党建工作                                             | 10e8911e0c852d91f08e173c768700da608abfb4e7b0540cb49fa5498f33522b |
    | 学习贯彻习近平新时代中国特色社会主义思想主题教育专栏 | b7a7ad4b5d8ffaca4b29f3538fd289da9d07f827f89e6ea57ef07257498aacf9 |
    | 党史学习教育专栏                                     | 4d8e7dec1b672704916331431156ea7628a598c191d751e4fc28408ccbd4e0c4 |
    | 不忘初心、牢记使命                                   | 427f7c28c90ec9db1aab78db8156a63ff2e23f6a0cea693e3847fe6d595753db |
    | 两学一做                                             | 5b0609fedc9052bb44f1cfe9acf5ec8c9fe960f22a07be69636f2cf1cacaa8f7 |
    | 钢协党代会                                           | beaaa0314f0f532d4b18244cd70df614a4af97465d974401b1f5b3349d78144b |
    | 创先争优                                             | e7ea82c886ba18691210aaf48b3582a92dca9c4f2aab912757cedafb066ff8a6 |
    | 青年工作                                             | 2706ee3a4a4c3c23e90e13c8fdc3002855d1dba394b61626562a97b33af3dbd0 |
    | 日常动态                                             | e21157a082fc0ab0d7062c8755e91472ee0d23de6ccc5c2a44b62e54062cf1e4 |

    #### 要闻

    | 栏目         | id                                                               |
    | ------------ | ---------------------------------------------------------------- |
    | 要闻         | c42511ce3f868a515b49668dd250290c80d4dc8930c7e455d0e6e14b8033eae2 |
    | 会员动态     | 268f86fdf61ac8614f09db38a2d0295253043b03e092c7ff48ab94290296125c |
    | 疫情应对专栏 | a83c48faeb34065fd9b33d3c84957a152675141458aedc0ec454b760c9fcad65 |

    #### 统计发布

    | 栏目     | id                                                               |
    | -------- | ---------------------------------------------------------------- |
    | 统计发布 | 2e3c87064bdfc0e43d542d87fce8bcbc8fe0463d5a3da04d7e11b4c7d692194b |
    | 生产经营 | 3238889ba0fa3aabcf28f40e537d440916a361c9170a4054f9fc43517cb58c1e |
    | 进出口   | 95ef75c752af3b6c8be479479d8b931de7418c00150720280d78c8f0da0a438c |
    | 环保统计 | 619ce7b53a4291d47c19d0ee0765098ca435e252576fbe921280a63fba4bc712 |

    #### 行业分析

    | 栏目     | id                                                               |
    | -------- | ---------------------------------------------------------------- |
    | 行业分析 | 1b4316d9238e09c735365896c8e4f677a3234e8363e5622ae6e79a5900a76f56 |
    | 市场分析 | a44207e193a5caa5e64102604b6933896a0025eb85c57c583b39626f33d4dafd |
    | 板带材   | 05d0e136828584d2cd6e45bdc3270372764781b98546cce122d9974489b1e2f2 |
    | 社会库存 | 197422a82d9a09b9cc86188444574816e93186f2fde87474f8b028fc61472d35 |

    #### 钢材价格指数

    | 栏目         | id                                                               |
    | ------------ | ---------------------------------------------------------------- |
    | 钢材价格指数 | 17b6a9a214c94ccc28e56d4d1a2dbb5acef3e73da431ddc0a849a4dcfc487d04 |
    | 综合价格指数 | 63913b906a7a663f7f71961952b1ddfa845714b5982655b773a62b85dd3b064e |
    | 地区价格     | fc816c75aed82b9bc25563edc9cf0a0488a2012da38cbef5258da614d6e51ba9 |

    #### 宏观经济信息

    | 栏目         | id                                                               |
    | ------------ | ---------------------------------------------------------------- |
    | 宏观经济信息 | 5d77b433182404193834120ceed16fe0625860fafd5fd9e71d0800c4df227060 |
    | 相关行业信息 | ae2a3c0fd4936acf75f4aab6fadd08bc6371aa65bdd50419e74b70d6f043c473 |
    | 国际动态     | 1bad7c56af746a666e4a4e56e54a9508d344d7bc1498360580613590c16b6c41 |

    #### 专题报道

    | 栏目                 | id                                                               |
    | -------------------- | ---------------------------------------------------------------- |
    | 专题报道             | 50e7242bfd78b4395f3338df7699a0ff8847b886c4c3a55bd7c102a2cfe32fe9 |
    | 钢协理事会           | 40c6404418699f0f8cb4e513013bb110ef250c782f0959852601e7c75e1afcd8 |
    | 钢协新闻发布会       | 11ea370f565c6c141b1a4dac60aa00c4331bd442382a5dd476a5e73e001b773c |
    | 劳模表彰             | 907e4ae217bf9c981a132051572103f9c87cccb7f00caf5a1770078829e6bcb3 |
    | 钢铁行业职业技能竞赛 | 563c15270a691e3c7cb9cd9ba457c5af392eb4630fa833fc1a55c8e2afbc28a9 |

    #### 成果奖励

    | 栏目                   | id                                                               |
    | ---------------------- | ---------------------------------------------------------------- |
    | 成果奖励               | a6c30053b66356b4d77fbf6668bda69f7e782b2ae08a21d5db171d50a504bd40 |
    | 冶金科学技术奖         | 50fe0c63f657ee48e49cb13fe7f7c5502046acdb05e2ee8a317f907af4191683 |
    | 企业管理现代化创新成果 | b5607d3b73c2c3a3b069a97b9dbfd59af64aea27bafd5eb87ba44d1b07a33b66 |
    | 清洁生产环境友好企业   | 4475c8e21374d063a22f95939a2909837e78fab1832dc97bf64f09fa01c0c5f7 |
    | 产品开发市场开拓奖     | 169e34d7b29e3deaf4d4496da594d3bbde2eb0a40f7244b54dbfb9cc89a37296 |
    | 质量金杯奖             | 68029784be6d9a7bf9cb8cace5b8a5ce5d2d871e9a0cbcbf84eeae0ea2746311 |

    #### 节能减排

    | 栏目                                       | id                                                               |
    | ------------------------------------------ | ---------------------------------------------------------------- |
    | 节能减排                                   | 08895f1681c198fdf297ab38e33e1f428f6ccf2add382f3844a52e410f10e5a0 |
    | 先进节能环保技术                           | 6e639343a517fd08e5860fba581d41940da523753956ada973b6952fc05ef94f |
    | 钢铁企业超低排放改造和评估监测进展情况公示 | 50d99531d5dee68346653ca9548f308764ad38410a091e662834a5ed66770174 |

    #### 国际交流

    | 栏目     | id                                                               |
    | -------- | ---------------------------------------------------------------- |
    | 国际交流 | 4753eef81b4019369d4751413d852ab9027944b84c612b5a08614e046d169e81 |
    | 外事动态 | aa590ec6f835136a9ce8c9f3d0c3b194beb6b78037466ab40bb4aacc32adfcc9 |
    | 国际会展 | 05ac1f2971bc375d25c9112e399f9c3cbb237809684ebc5b0ca4a68a1fcb971c |

    #### 政策法规

    | 栏目     | id                                                               |
    | -------- | ---------------------------------------------------------------- |
    | 政策法规 | 63a69eb0087f1984c0b269a1541905f19a56e117d56b3f51dfae0e6c1d436533 |
    | 政策法规 | a214b2e71c3c79fa4a36ff382ee5f822b9603634626f7e320f91ed696b3666f2 |
    | 贸易规则 | 5988b2380d04d3efde8cc247377d19530c17904ec0b5decdd00f9b3e026e3715 |

    #### 分会园地

    | 栏目         | id                                                               |
    | ------------ | ---------------------------------------------------------------- |
    | 分会园地     | d059d6751dcaae94e31a795072267f7959c35d012eebb9858b3ede2990e82ea9 |
    | 法律分会     | 96000647f18ea78fa134a3932563e7d27c68d0482de498f179b44846234567a9 |
    | 设备分会     | c8e1e3f52406115c2c03928271bbe883c0875b7c9f2f67492395685a62a1a2d8 |
    | 国际产能合作 | 4fb8cc4b0d6f905a969ac3375f6d17b34df4dcae69d798d2a4616daa80af020c |
    | 绿化分会     | ad55a0fbc1a44e94fb60e21b98cf967aca17ecf1450bdfb3699468fe8235103b |

    #### 钢铁知识

    | 栏目         | id                                                               |
    | ------------ | ---------------------------------------------------------------- |
    | 钢铁知识     | 7f7509ff045023015e0d6c1ba22c32734b673be2ec14eae730a99c08e3badb3f |
    | 钢铁材料使用 | 7e319d71258ed6bb663cf59b4cf67fe97894e60aa5520f3d2cf966f82f9b89ac |
    | 钢铁标准     | fae0c4dd27f8fe4759941e78c9dc1dfe0088ce30d1b684d12be4c8172d2c08e1 |

    #### 钢协刊物

    | 栏目       | id                                                               |
    | ---------- | ---------------------------------------------------------------- |
    | 钢协刊物   | ed51af486f6d4b313b3aaf8fea0b32a4a2d4a89714c61992caf01942eb61831b |
    | 中国钢铁业 | 6440bdfccadf87908b13d8bbd9a66bb89bbd60cc5e175c018ca1c62c7d55e61f |
    | 钢铁信息   | 2b66af0b2cda9b420739e55e255a6f72f277557670ef861c9956da8fde25da05 |
  </details>

## 中国收入分配研究院 <Site url="ciidbnu.org"/>

### 分类 <Site url="ciidbnu.org" size="sm" />

<Route namespace="ciidbnu" :data='{"path":"/:id?","categories":["new-media"],"example":"/ciidbnu","parameters":{"id":"分类 id，可在分类页地址栏 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"分类","maintainers":["nczitzk"],"description":"| 社会动态 | 院内新闻 | 学术观点 | 文献书籍 | 工作论文 | 专题讨论 |\n  | -------- | -------- | -------- | -------- | -------- | -------- |\n  | 1        | 5        | 3        | 4        | 6        | 8        |","location":"index.ts"}' />

| 社会动态 | 院内新闻 | 学术观点 | 文献书籍 | 工作论文 | 专题讨论 |
  | -------- | -------- | -------- | -------- | -------- | -------- |
  | 1        | 5        | 3        | 4        | 6        | 8        |

## 中国科普博览 <Site url="live.kepu.net.cn"/>

### 直播回看 <Site url="live.kepu.net.cn/replay/index" size="sm" />

<Route namespace="kepu" :data='{"path":"/live","categories":["new-media"],"example":"/kepu/live","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":true,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["live.kepu.net.cn/replay/index"]}],"name":"直播回看","maintainers":["nczitzk"],"url":"live.kepu.net.cn/replay/index","location":"live.ts"}' />

## 珠海网 <Site url="hizh.cn"/>

### 栏目 <Site url="hizh.cn/" size="sm" />

<Route namespace="hizu" :data='{"path":"/:column?","categories":["new-media"],"example":"/hizu","parameters":{"column":"栏目，见下表，默认为热点"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["hizh.cn/"]}],"name":"栏目","maintainers":["nczitzk"],"url":"hizh.cn/","description":"| 分类     | 编号                     |\n  | -------- | ------------------------ |\n  | 热点     | 5dd92265e4b0bf88dd8c1175 |\n  | 订阅     | 5dd921a7e4b0bf88dd8c116f |\n  | 学党史   | 604f1cbbe4b0cf5c2234d470 |\n  | 政经     | 5dd92242e4b0bf88dd8c1174 |\n  | 合作区   | 61259fd6e4b0d294f7f9786d |\n  | 名记名播 | 61dfe511e4b0248b60d1c568 |\n  | 大湾区   | 5dd9222ce4b0bf88dd8c1173 |\n  | 网评     | 617805e4e4b037abacfd4820 |\n  | TV 新闻  | 5dd9220de4b0bf88dd8c1172 |\n  | 音频     | 5e6edd50e4b02ebde0ab061e |\n  | 澳门     | 600e8ad4e4b02c3a6af6aaa8 |\n  | 政务     | 600f760fe4b0e33cf6f8e68e |\n  | 教育     | 5ff7c0fde4b0e2f210d05e20 |\n  | 深圳     | 5fc88615e4b0e3055e693e0a |\n  | 中山     | 600e8a93e4b02c3a6af6aa80 |\n  | 民生     | 5dd921ece4b0bf88dd8c1170 |\n  | 社区     | 61148184e4b08d3215364396 |\n  | 专题     | 5dd9215fe4b0bf88dd8c116b |\n  | 战疫     | 5e2e5107e4b0c14b5d0e3d04 |\n  | 横琴     | 5f88eaf2e4b0a27cd404e09e |\n  | 香洲     | 5f86a3f5e4b09d75f99dde7d |\n  | 金湾     | 5e8c42b4e4b0347c7e5836e0 |\n  | 斗门     | 5ee70534e4b07b8a779a1ad6 |\n  | 高新     | 607d37ade4b05c59ac2f3d40 |","location":"index.ts"}' />

| 分类     | 编号                     |
  | -------- | ------------------------ |
  | 热点     | 5dd92265e4b0bf88dd8c1175 |
  | 订阅     | 5dd921a7e4b0bf88dd8c116f |
  | 学党史   | 604f1cbbe4b0cf5c2234d470 |
  | 政经     | 5dd92242e4b0bf88dd8c1174 |
  | 合作区   | 61259fd6e4b0d294f7f9786d |
  | 名记名播 | 61dfe511e4b0248b60d1c568 |
  | 大湾区   | 5dd9222ce4b0bf88dd8c1173 |
  | 网评     | 617805e4e4b037abacfd4820 |
  | TV 新闻  | 5dd9220de4b0bf88dd8c1172 |
  | 音频     | 5e6edd50e4b02ebde0ab061e |
  | 澳门     | 600e8ad4e4b02c3a6af6aaa8 |
  | 政务     | 600f760fe4b0e33cf6f8e68e |
  | 教育     | 5ff7c0fde4b0e2f210d05e20 |
  | 深圳     | 5fc88615e4b0e3055e693e0a |
  | 中山     | 600e8a93e4b02c3a6af6aa80 |
  | 民生     | 5dd921ece4b0bf88dd8c1170 |
  | 社区     | 61148184e4b08d3215364396 |
  | 专题     | 5dd9215fe4b0bf88dd8c116b |
  | 战疫     | 5e2e5107e4b0c14b5d0e3d04 |
  | 横琴     | 5f88eaf2e4b0a27cd404e09e |
  | 香洲     | 5f86a3f5e4b09d75f99dde7d |
  | 金湾     | 5e8c42b4e4b0347c7e5836e0 |
  | 斗门     | 5ee70534e4b07b8a779a1ad6 |
  | 高新     | 607d37ade4b05c59ac2f3d40 |

## 字节点击 <Site url="byteclicks.com"/>

### Unknown <Site url="byteclicks.com/" size="sm" />

<Route namespace="byteclicks" :data='{"path":"/","radar":[{"source":["byteclicks.com/"],"target":""}],"name":"Unknown","maintainers":["TonyRL"],"url":"byteclicks.com/","location":"index.ts"}' />

### 标签 <Site url="byteclicks.com/" size="sm" />

<Route namespace="byteclicks" :data='{"path":"/tag/:tag","categories":["new-media"],"example":"/byteclicks/tag/人工智能","parameters":{"tag":"标签，可在URL中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["byteclicks.com/tag/:tag"]}],"name":"标签","maintainers":["TonyRL"],"url":"byteclicks.com/","location":"tag.ts"}' />

## 自由微信 <Site url="freewechat.com"/>

### 公众号 <Site url="freewechat.com" size="sm" />

<Route namespace="freewechat" :data='{"path":"/profile/:id","categories":["new-media"],"example":"/freewechat/profile/MzI5NTUxNzk3OA==","parameters":{"id":"公众号 ID，可在URL中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["freewechat.com/profile/:id"]}],"name":"公众号","maintainers":["TonyRL"],"location":"profile.ts"}' />

