# 📰 传统媒体

## ABC News <Site url="abc.net.au"/>

### Channel & Topic <Site url="abc.net.au" size="sm" />

<Route namespace="abc" :data='{"path":"/:category{.+}?","radar":[{"source":["abc.net.au/:category*"],"target":"/:category"}],"parameters":{"category":"Category, can be found in the URL, can also be filled in with the `documentId` in the source code of the page, `news/justin` as **Just In** by default"},"name":"Channel & Topic","categories":["traditional-media"],"description":"\n  :::tip\n  All Topics in [Topic Library](https://abc.net.au/news/topics) are supported, you can fill in the field after `topic` in its URL, or fill in the `documentId`.\n\n  For example, the URL for [Computer Science](https://www.abc.net.au/news/topic/computer-science) is `https://www.abc.net.au/news/topic/computer-science`, the `category` is `news/topic/computer-science`, and the `documentId` of the Topic is `2302`, so the route is [/abc/news/topic/computer-science](https://rsshub.app/abc/news/topic/computer-science) and [/abc/2302](https://rsshub.app/abc/2302).\n\n  The supported channels are all listed in the table below. For other channels, please find the `documentId` in the source code of the channel page and fill it in as above.\n  :::","maintainers":["nczitzk"],"location":"index.ts"}' />


  :::tip
  All Topics in [Topic Library](https://abc.net.au/news/topics) are supported, you can fill in the field after `topic` in its URL, or fill in the `documentId`.

  For example, the URL for [Computer Science](https://www.abc.net.au/news/topic/computer-science) is `https://www.abc.net.au/news/topic/computer-science`, the `category` is `news/topic/computer-science`, and the `documentId` of the Topic is `2302`, so the route is [/abc/news/topic/computer-science](https://rsshub.app/abc/news/topic/computer-science) and [/abc/2302](https://rsshub.app/abc/2302).

  The supported channels are all listed in the table below. For other channels, please find the `documentId` in the source code of the channel page and fill it in as above.
  :::

## AP News <Site url="apnews.com"/>

### Topics <Site url="apnews.com" size="sm" />

<Route namespace="apnews" :data='{"path":"/topics/:topic?","categories":["traditional-media"],"example":"/apnews/topics/apf-topnews","parameters":{"topic":"Topic name, can be found in URL. For example: the topic name of AP Top News [https://apnews.com/apf-topnews](https://apnews.com/apf-topnews) is `apf-topnews`, `trending-news` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["apnews.com/hub/:topic"],"target":"/topics/:topic"}],"name":"Topics","maintainers":["zoenglinghou","mjysci","TonyRL"],"location":"topics.ts"}' />

## BBC <Site url="bbc.com"/>

### News <Site url="bbc.com" size="sm" />

<Route namespace="bbc" :data='{"path":"/:site?/:channel?","name":"News","maintainers":["HenryQW","DIYgod"],"example":"/bbc/world-asia","parameters":{"site":"语言，简体或繁体中文","channel":"channel, default to `top stories`"},"categories":["traditional-media"],"description":"Provides a better reading experience (full text articles) over the official ones.\n\n    Support major channels, refer to [BBC RSS feeds](https://www.bbc.co.uk/news/10628494). Eg, `business` for `https://feeds.bbci.co.uk/news/business/rss.xml`.\n\n    -   Channel contains sub-directories, such as `https://feeds.bbci.co.uk/news/world/asia/rss.xml`, replace `/` with `-`, `/bbc/world-asia`.","location":"index.ts"}' />

Provides a better reading experience (full text articles) over the official ones.

    Support major channels, refer to [BBC RSS feeds](https://www.bbc.co.uk/news/10628494). Eg, `business` for `https://feeds.bbci.co.uk/news/business/rss.xml`.

    -   Channel contains sub-directories, such as `https://feeds.bbci.co.uk/news/world/asia/rss.xml`, replace `/` with `-`, `/bbc/world-asia`.

## Caixin Global <Site url="caixinglobal.com"/>

### Latest News <Site url="caixinglobal.com/news" size="sm" />

<Route namespace="caixinglobal" :data='{"path":"/latest","categories":["traditional-media"],"example":"/caixinglobal/latest","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["caixinglobal.com/news","caixinglobal.com/"]}],"name":"Latest News","maintainers":["TonyRL"],"url":"caixinglobal.com/news","location":"latest.ts"}' />

## Canadian Broadcasting Corporation <Site url="cbc.ca"/>

### News <Site url="cbc.ca/news" size="sm" />

<Route namespace="cbc" :data='{"path":"/topics/:topic?","categories":["traditional-media"],"example":"/cbc/topics","parameters":{"topic":"Channel,`Top Stories` by default. For secondary channel like `canada/toronto`, use `-` to replace `/`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["cbc.ca/news"],"target":"/topics"}],"name":"News","maintainers":["wb14123"],"url":"cbc.ca/news","location":"topics.ts"}' />

## CNBC <Site url="search.cnbc.com"/>

### Full article RSS <Site url="search.cnbc.com" size="sm" />

<Route namespace="cnbc" :data='{"path":"/rss/:id?","categories":["traditional-media"],"example":"/cnbc/rss","parameters":{"id":"Channel ID, can be found in Official RSS URL, `100003114` (Top News) by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.cnbc.com/id/:id/device/rss/rss.html"],"target":"/rss/:id"}],"name":"Full article RSS","maintainers":["TonyRL"],"description":"Provides a better reading experience (full articles) over the official ones.\n\n  Support all channels, refer to [CNBC RSS feeds](https://www.cnbc.com/rss-feeds/).","location":"rss.ts"}' />

Provides a better reading experience (full articles) over the official ones.

  Support all channels, refer to [CNBC RSS feeds](https://www.cnbc.com/rss-feeds/).

## Corona Virus Disease 2019 <Site url="scmp.com"/>

### News <Site url="scmp.com" size="sm" />

<Route namespace="scmp" :data='{"path":"/:category_id","categories":["traditional-media"],"example":"/scmp/3","parameters":{"category_id":"Category"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["scmp.com/rss/:category_id/feed"]}],"name":"News","maintainers":["proletarius101"],"description":"See the [official RSS page](https://www.scmp.com/rss) to get the ID of each category. This route provides fulltext that the offical feed doesn&#39;t.","location":"index.ts"}' />

See the [official RSS page](https://www.scmp.com/rss) to get the ID of each category. This route provides fulltext that the offical feed doesn't.

### Topics <Site url="scmp.com" size="sm" />

<Route namespace="scmp" :data='{"path":"/topics/:topic","categories":["traditional-media"],"example":"/scmp/topics/coronavirus-pandemic-all-stories","parameters":{"topic":"Topic, can be found in URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["scmp.com/topics/:topic"]}],"name":"Topics","maintainers":["TonyRL"],"location":"topic.ts"}' />

## DNA India <Site url="dnaindia.com"/>

### News <Site url="dnaindia.com" size="sm" />

<Route namespace="dnaindia" :data='{"path":["/:category","/topic/:topic"],"categories":["traditional-media"],"example":"/dnaindia/headlines","parameters":{"category":"Find it in the URL, or tables below"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["dnaindia.com/:category"]}],"name":"News","maintainers":["Rjnishant530"],"description":"Categories:\n\n  | Headlines | Explainer | India | Entertainment | Sports | Viral | Lifestyle | Education | Business | World |\n  | --------- | --------- | ----- | ------------- | ------ | ----- | --------- | --------- | -------- | ----- |\n  | headlines | explainer | india | entertainment | sports | viral | lifestyle | education | business | world |","location":"category.ts"}' />

Categories:

  | Headlines | Explainer | India | Entertainment | Sports | Viral | Lifestyle | Education | Business | World |
  | --------- | --------- | ----- | ------------- | ------ | ----- | --------- | --------- | -------- | ----- |
  | headlines | explainer | india | entertainment | sports | viral | lifestyle | education | business | world |

### News <Site url="dnaindia.com" size="sm" />

<Route namespace="dnaindia" :data='{"path":["/:category","/topic/:topic"],"categories":["traditional-media"],"example":"/dnaindia/headlines","parameters":{"category":"Find it in the URL, or tables below"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["dnaindia.com/:category"]}],"name":"News","maintainers":["Rjnishant530"],"description":"Categories:\n\n  | Headlines | Explainer | India | Entertainment | Sports | Viral | Lifestyle | Education | Business | World |\n  | --------- | --------- | ----- | ------------- | ------ | ----- | --------- | --------- | -------- | ----- |\n  | headlines | explainer | india | entertainment | sports | viral | lifestyle | education | business | world |","location":"category.ts"}' />

Categories:

  | Headlines | Explainer | India | Entertainment | Sports | Viral | Lifestyle | Education | Business | World |
  | --------- | --------- | ----- | ------------- | ------ | ----- | --------- | --------- | -------- | ----- |
  | headlines | explainer | india | entertainment | sports | viral | lifestyle | education | business | world |

## Ekantipur / कान्तिपुर (Nepal) <Site url="ekantipur.com"/>

### Full Article RSS <Site url="ekantipur.com" size="sm" />

<Route namespace="ekantipur" :data='{"path":"/:channel?","categories":["traditional-media"],"example":"/ekantipur/news","parameters":{"channel":"Find it in the ekantipur.com menu or pick from the list below:"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["ekantipur.com/:channel"],"target":"/:channel"}],"name":"Full Article RSS","maintainers":["maniche04"],"description":"Channels:\n\n  | समाचार | अर्थ / वाणिज्य | विचार     | खेलकुद   | उपत्यका     | मनोरञ्जन         | फोटोफिचर          | फिचर     | विश्व    | ब्लग   |\n  | ---- | -------- | ------- | ------ | -------- | ------------- | -------------- | ------- | ----- | ---- |\n  | news | business | opinion | sports | national | entertainment | photo_feature | feature | world | blog |","location":"issue.ts"}' />

Channels:

  | समाचार | अर्थ / वाणिज्य | विचार     | खेलकुद   | उपत्यका     | मनोरञ्जन         | फोटोफिचर          | फिचर     | विश्व    | ब्लग   |
  | ---- | -------- | ------- | ------ | -------- | ------------- | -------------- | ------- | ----- | ---- |
  | news | business | opinion | sports | national | entertainment | photo_feature | feature | world | blog |

## Financial Times <Site url="ftchinese.com"/>

### FT 中文网 <Site url="ftchinese.com" size="sm" />

<Route namespace="ft" :data='{"path":"/:language/:channel?","categories":["traditional-media"],"example":"/ft/chinese/hotstoryby7day","parameters":{"language":"语言，简体`chinese`，繁体`traditional`","channel":"频道，缺省为每日更新"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"FT 中文网","maintainers":["HenryQW","xyqfer"],"description":":::tip\n  -   不支持付费文章。\n  :::\n\n  通过提取文章全文，以提供比官方源更佳的阅读体验。\n\n  支持所有频道，频道名称见 [官方频道 RSS](http://www.ftchinese.com/channel/rss.html).\n\n  -   频道为单一路径，如 `http://www.ftchinese.com/rss/news` 则为 `/ft/chinese/news`.\n  -   频道包含多重路径，如 `http://www.ftchinese.com/rss/column/007000002` 则替换 `/` 为 `-` `/ft/chinese/column-007000002`.","location":"channel.ts"}' />

:::tip
  -   不支持付费文章。
  :::

  通过提取文章全文，以提供比官方源更佳的阅读体验。

  支持所有频道，频道名称见 [官方频道 RSS](http://www.ftchinese.com/channel/rss.html).

  -   频道为单一路径，如 `http://www.ftchinese.com/rss/news` 则为 `/ft/chinese/news`.
  -   频道包含多重路径，如 `http://www.ftchinese.com/rss/column/007000002` 则替换 `/` 为 `-` `/ft/chinese/column-007000002`.

### myFT personal RSS <Site url="ftchinese.com" size="sm" />

<Route namespace="ft" :data='{"path":"/myft/:key","categories":["traditional-media"],"example":"/ft/myft/rss-key","parameters":{"key":"the last part of myFT personal RSS address"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"myFT personal RSS","maintainers":["HenryQW"],"description":":::tip\n  -   Visit ft.com -> myFT -> Contact Preferences to enable personal RSS feed, see [help.ft.com](https://help.ft.com/faq/email-alerts-and-contact-preferences/what-is-myft-rss-feed/)\n  -   Obtain the key from the personal RSS address, it looks like `12345678-abcd-4036-82db-vdv20db024b8`\n  :::","location":"myft.ts"}' />

:::tip
  -   Visit ft.com -> myFT -> Contact Preferences to enable personal RSS feed, see [help.ft.com](https://help.ft.com/faq/email-alerts-and-contact-preferences/what-is-myft-rss-feed/)
  -   Obtain the key from the personal RSS address, it looks like `12345678-abcd-4036-82db-vdv20db024b8`
  :::

## infzm 

### 频道 

<Route namespace="infzm" :data='{"path":"/:id","parameters":{"id":"南方周末频道 id, 可在该频道的 URL 中找到（即 https://www.infzm.com/contents?term_id=:id)"},"categories":["traditional-media"],"example":"/infzm/1","radar":[{"source":["infzm.com/contents"]}],"name":"频道","maintainers":["KarasuShin","ranpox","xyqfer"],"description":"下面给出部分参考：\n\n    | 推荐 | 新闻 | 观点 | 文化 | 人物 | 影像 | 专题 | 生活 | 视频 |\n    | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |\n    | 1    | 2    | 3    | 4    | 7    | 8    | 6    | 5    | 131  |","location":"index.ts"}' />

下面给出部分参考：

    | 推荐 | 新闻 | 观点 | 文化 | 人物 | 影像 | 专题 | 生活 | 视频 |
    | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
    | 1    | 2    | 3    | 4    | 7    | 8    | 6    | 5    | 131  |

## Korean Central News Agency (KCNA) 朝鲜中央通讯社 <Site url="www.kcna.kp"/>

### News <Site url="www.kcna.kp" size="sm" />

<Route namespace="kcna" :data='{"path":"/:lang/:category?","categories":["traditional-media"],"example":"/kcna/en","parameters":{"lang":"Language, refer to the table below","category":"Category, refer to the table below"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.kcna.kp/:lang","www.kcna.kp/:lang/category/articles/q/1ee9bdb7186944f765208f34ecfb5407.kcmsf","www.kcna.kp/:lang/category/articles.kcmsf"],"target":"/:lang"}],"name":"News","maintainers":["Rongronggg9"],"description":"| Language | 조선어 | English | 中国语 | Русский | Español | 日本語 |\n  | -------- | ------ | ------- | ------ | ------- | ------- | ------ |\n  | `:lang`  | `kp`   | `en`    | `cn`   | `ru`    | `es`    | `jp`   |\n\n  | Category                                                         | `:category`                        |\n  | ---------------------------------------------------------------- | ---------------------------------- |\n  | WPK General Secretary **Kim Jong Un**&#39;s Revolutionary Activities | `54c0ca4ca013a92cc9cf95bd4004c61a` |\n  | Latest News (default)                                            | `1ee9bdb7186944f765208f34ecfb5407` |\n  | Top News                                                         | `5394b80bdae203fadef02522cfb578c0` |\n  | Home News                                                        | `b2b3bcc1b0a4406ab0c36e45d5db58db` |\n  | Documents                                                        | `a8754921399857ebdbb97a98a1e741f5` |\n  | World                                                            | `593143484cf15d48ce85c26139582395` |\n  | Society-Life                                                     | `93102e5a735d03979bc58a3a7aefb75a` |\n  | External                                                         | `0f98b4623a3ef82aeea78df45c423fd0` |\n  | News Commentary                                                  | `12c03a49f7dbe829bceea8ac77088c21` |","location":"news.ts"}' />

| Language | 조선어 | English | 中国语 | Русский | Español | 日本語 |
  | -------- | ------ | ------- | ------ | ------- | ------- | ------ |
  | `:lang`  | `kp`   | `en`    | `cn`   | `ru`    | `es`    | `jp`   |

  | Category                                                         | `:category`                        |
  | ---------------------------------------------------------------- | ---------------------------------- |
  | WPK General Secretary **Kim Jong Un**'s Revolutionary Activities | `54c0ca4ca013a92cc9cf95bd4004c61a` |
  | Latest News (default)                                            | `1ee9bdb7186944f765208f34ecfb5407` |
  | Top News                                                         | `5394b80bdae203fadef02522cfb578c0` |
  | Home News                                                        | `b2b3bcc1b0a4406ab0c36e45d5db58db` |
  | Documents                                                        | `a8754921399857ebdbb97a98a1e741f5` |
  | World                                                            | `593143484cf15d48ce85c26139582395` |
  | Society-Life                                                     | `93102e5a735d03979bc58a3a7aefb75a` |
  | External                                                         | `0f98b4623a3ef82aeea78df45c423fd0` |
  | News Commentary                                                  | `12c03a49f7dbe829bceea8ac77088c21` |

## La Jornada <Site url="jornada.com.mx"/>

### News <Site url="jornada.com.mx" size="sm" />

<Route namespace="jornada" :data='{"path":"/:date?/:category?","categories":["traditional-media"],"example":"/jornada/2022-10-12/capital","parameters":{"date":"Date string, must be in format of `YYYY-MM-DD`. You can get today&#39;s news using `today`","category":"Category, refer to the table below"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"News","maintainers":["Thealf154"],"description":"Provides a way to get an specific rss feed by date and category over the official one.\n\n  | Category             | `:category` |\n  | -------------------- | ----------- |\n  | Capital              | capital     |\n  | Cartones             | cartones    |\n  | Ciencia y Tecnología | ciencia     |\n  | Cultura              | cultura     |\n  | Deportes             | deportes    |\n  | Economía             | economia    |\n  | Estados              | estados     |\n  | Mundo                | mundo       |\n  | Opinión              | opinion     |\n  | Política             | politica    |\n  | Sociedad             | sociedad    |","location":"index.ts"}' />

Provides a way to get an specific rss feed by date and category over the official one.

  | Category             | `:category` |
  | -------------------- | ----------- |
  | Capital              | capital     |
  | Cartones             | cartones    |
  | Ciencia y Tecnología | ciencia     |
  | Cultura              | cultura     |
  | Deportes             | deportes    |
  | Economía             | economia    |
  | Estados              | estados     |
  | Mundo                | mundo       |
  | Opinión              | opinion     |
  | Política             | politica    |
  | Sociedad             | sociedad    |

## NHK <Site url="www3.nhk.or.jp"/>

### News Web Easy <Site url="www3.nhk.or.jp/news/easy/" size="sm" />

<Route namespace="nhk" :data='{"path":"/news_web_easy","categories":["traditional-media"],"example":"/nhk/news_web_easy","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www3.nhk.or.jp/news/easy/","www3.nhk.or.jp/"]}],"name":"News Web Easy","maintainers":["Andiedie"],"url":"www3.nhk.or.jp/news/easy/","location":"news-web-easy.ts"}' />

### WORLD-JAPAN - Top Stories <Site url="www3.nhk.or.jp" size="sm" />

<Route namespace="nhk" :data='{"path":"/news/:lang?","categories":["traditional-media"],"example":"/nhk/news/en","parameters":{"lang":"Language, see below, `en` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www3.nhk.or.jp/nhkworld/:lang/news/list/","www3.nhk.or.jp/nhkworld/:lang/news/"],"target":"/news/:lang"}],"name":"WORLD-JAPAN - Top Stories","maintainers":["TonyRL"],"description":"| العربية | বাংলা | မြန်မာဘာသာစကား | 中文（简体） | 中文（繁體） | English | Français |\n  | ------- | -- | ------------ | ------------ | ------------ | ------- | -------- |\n  | ar      | bn | my           | zh           | zt           | en      | fr       |\n\n  | हिन्दी | Bahasa Indonesia | 코리언 | فارسی | Português | Русский | Español |\n  | -- | ---------------- | ------ | ----- | --------- | ------- | ------- |\n  | hi | id               | ko     | fa    | pt        | ru      | es      |\n\n  | Kiswahili | ภาษาไทย | Türkçe | Українська | اردو | Tiếng Việt |\n  | --------- | ------- | ------ | ---------- | ---- | ---------- |\n  | sw        | th      | tr     | uk         | ur   | vi         |","location":"news.ts"}' />

| العربية | বাংলা | မြန်မာဘာသာစကား | 中文（简体） | 中文（繁體） | English | Français |
  | ------- | -- | ------------ | ------------ | ------------ | ------- | -------- |
  | ar      | bn | my           | zh           | zt           | en      | fr       |

  | हिन्दी | Bahasa Indonesia | 코리언 | فارسی | Português | Русский | Español |
  | -- | ---------------- | ------ | ----- | --------- | ------- | ------- |
  | hi | id               | ko     | fa    | pt        | ru      | es      |

  | Kiswahili | ภาษาไทย | Türkçe | Українська | اردو | Tiếng Việt |
  | --------- | ------- | ------ | ---------- | ---- | ---------- |
  | sw        | th      | tr     | uk         | ur   | vi         |

## Now 新聞 <Site url="news.now.com"/>

### 新聞 <Site url="news.now.com/" size="sm" />

<Route namespace="now" :data='{"path":"/news/:category?/:id?","categories":["traditional-media"],"example":"/now/news","parameters":{"category":"分类，见下表，默认为首页","id":"编号，可在对应专题/节目页 URL 中找到 topicId"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["news.now.com/"]}],"name":"新聞","maintainers":["nczitzk"],"url":"news.now.com/","description":":::tip\n  **编号** 仅对事件追蹤、評論節目、新聞專題三个分类起作用，例子如下：\n\n  对于 [事件追蹤](https://news.now.com/home/tracker) 中的 [塔利班奪權](https://news.now.com/home/tracker/detail?catCode=123&topicId=1056) 话题，其网址为 `https://news.now.com/home/tracker/detail?catCode=123&topicId=1056`，其中 `topicId` 为 1056，则对应路由为 [`/now/news/tracker/1056`](https://rsshub.app/now/news/tracker/1056)\n  :::\n\n  | 首頁 | 港聞  | 兩岸國際      | 娛樂          |\n  | ---- | ----- | ------------- | ------------- |\n  |      | local | international | entertainment |\n\n  | 生活 | 科技       | 財經    | 體育   |\n  | ---- | ---------- | ------- | ------ |\n  | life | technology | finance | sports |\n\n  | 事件追蹤 | 評論節目 | 新聞專題 |\n  | -------- | -------- | -------- |\n  | tracker  | feature  | opinion  |","location":"news.ts"}' />

:::tip
  **编号** 仅对事件追蹤、評論節目、新聞專題三个分类起作用，例子如下：

  对于 [事件追蹤](https://news.now.com/home/tracker) 中的 [塔利班奪權](https://news.now.com/home/tracker/detail?catCode=123&topicId=1056) 话题，其网址为 `https://news.now.com/home/tracker/detail?catCode=123&topicId=1056`，其中 `topicId` 为 1056，则对应路由为 [`/now/news/tracker/1056`](https://rsshub.app/now/news/tracker/1056)
  :::

  | 首頁 | 港聞  | 兩岸國際      | 娛樂          |
  | ---- | ----- | ------------- | ------------- |
  |      | local | international | entertainment |

  | 生活 | 科技       | 財經    | 體育   |
  | ---- | ---------- | ------- | ------ |
  | life | technology | finance | sports |

  | 事件追蹤 | 評論節目 | 新聞專題 |
  | -------- | -------- | -------- |
  | tracker  | feature  | opinion  |

## National Public Radio <Site url="npr.org"/>

### News <Site url="npr.org" size="sm" />

<Route namespace="npr" :data='{"path":"/:endpoint?","categories":["traditional-media"],"example":"/npr/1001","parameters":{"endpoint":"Channel ID, can be found in Official RSS URL, `1001` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"News","maintainers":["bennyyip"],"description":"Provide full article RSS for CBC topics.","location":"full.ts"}' />

Provide full article RSS for CBC topics.

## Reuters 路透社 <Site url="reuters.com"/>

:::tip
You can use `sophi=true` query parameter to invoke the **experimental** method, which can, if possible, fetch more articles(between 20 and 100) with `limit` given. But some articles from the old method might not be available.
:::

### Category/Topic/Author <Site url="reuters.com" size="sm" />

<Route namespace="reuters" :data='{"path":"/:category/:topic?","categories":["traditional-media"],"example":"/reuters/world/us","parameters":{"category":"find it in the URL, or tables below","topic":"find it in the URL, or tables below"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["reuters.com/:category/:topic?","reuters.com/"]}],"name":"Category/Topic/Author","maintainers":["LyleLee","HenryQW","proletarius101","black-desk","nczitzk"],"description":"-   `:category`:\n\n      | World | Business | Legal | Markets | Breakingviews | Technology | Graphics |\n      | ----- | -------- | ----- | ------- | ------------- | ---------- | -------- |\n      | world | business | legal | markets | breakingviews | technology | graphics |\n\n  -   `world/:topic`:\n\n      | All | Africa | Americas | Asia Pacific | China | Europe | India | Middle East | United Kingdom | United States | The Great Reboot | Reuters Next |\n      | --- | ------ | -------- | ------------ | ----- | ------ | ----- | ----------- | -------------- | ------------- | ---------------- | ------------ |\n      |     | africa | americas | asia-pacific | china | europe | india | middle-east | uk             | us            | the-great-reboot | reuters-next |\n\n  -   `business/:topic`:\n\n      | All | Aerospace & Defense | Autos & Transportation | Energy | Environment | Finance | Healthcare & Pharmaceuticals | Media & Telecom | Retail & Consumer | Sustainable Business | Charged | Future of Health | Future of Money | Take Five | Reuters Impact |\n      | --- | ------------------- | ---------------------- | ------ | ----------- | ------- | ---------------------------- | --------------- | ----------------- | -------------------- | ------- | ---------------- | --------------- | --------- | -------------- |\n      |     | aerospace-defense   | autos-transportation   | energy | environment | finance | healthcare-pharmaceuticals   | media-telecom   | retail-consumer   | sustainable-business | charged | future-of-health | future-of-money | take-five | reuters-impact |\n\n  -   `legal/:topic`:\n\n      | All | Government | Legal Industry | Litigation | Transactional |\n      | --- | ---------- | -------------- | ---------- | ------------- |\n      |     | government | legalindustry  | litigation | transactional |\n\n  -   `authors/:topic`:\n\n      | Default | Jonathan Landay | any other authors |\n      | ------- | --------------- | ----------------- |\n      | reuters | jonathan-landay | their name in URL |\n\n  More could be found in the URL of the category/topic page.","location":"common.ts"}' />

-   `:category`:

      | World | Business | Legal | Markets | Breakingviews | Technology | Graphics |
      | ----- | -------- | ----- | ------- | ------------- | ---------- | -------- |
      | world | business | legal | markets | breakingviews | technology | graphics |

  -   `world/:topic`:

      | All | Africa | Americas | Asia Pacific | China | Europe | India | Middle East | United Kingdom | United States | The Great Reboot | Reuters Next |
      | --- | ------ | -------- | ------------ | ----- | ------ | ----- | ----------- | -------------- | ------------- | ---------------- | ------------ |
      |     | africa | americas | asia-pacific | china | europe | india | middle-east | uk             | us            | the-great-reboot | reuters-next |

  -   `business/:topic`:

      | All | Aerospace & Defense | Autos & Transportation | Energy | Environment | Finance | Healthcare & Pharmaceuticals | Media & Telecom | Retail & Consumer | Sustainable Business | Charged | Future of Health | Future of Money | Take Five | Reuters Impact |
      | --- | ------------------- | ---------------------- | ------ | ----------- | ------- | ---------------------------- | --------------- | ----------------- | -------------------- | ------- | ---------------- | --------------- | --------- | -------------- |
      |     | aerospace-defense   | autos-transportation   | energy | environment | finance | healthcare-pharmaceuticals   | media-telecom   | retail-consumer   | sustainable-business | charged | future-of-health | future-of-money | take-five | reuters-impact |

  -   `legal/:topic`:

      | All | Government | Legal Industry | Litigation | Transactional |
      | --- | ---------- | -------------- | ---------- | ------------- |
      |     | government | legalindustry  | litigation | transactional |

  -   `authors/:topic`:

      | Default | Jonathan Landay | any other authors |
      | ------- | --------------- | ----------------- |
      | reuters | jonathan-landay | their name in URL |

  More could be found in the URL of the category/topic page.

### Inverstigates <Site url="reuters.com" size="sm" />

<Route namespace="reuters" :data='{"path":"/investigates","categories":["traditional-media"],"example":"/reuters/investigates","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Inverstigates","maintainers":["LyleLee"],"location":"investigates.ts"}' />

## Radio Free Asia (RFA) 自由亚洲电台 <Site url="rfa.org"/>

### News <Site url="rfa.org" size="sm" />

<Route namespace="rfa" :data='{"path":"/:language?/:channel?/:subChannel?","categories":["traditional-media"],"example":"/rfa/english","parameters":{"language":"language, English by default","channel":"channel","subChannel":"subchannel, where applicable"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"News","maintainers":["zphw"],"description":"Delivers a better experience by supporting parameter specification.\n\nParameters can be obtained from the official website, for instance:\n\n`https://www.rfa.org/cantonese/news` corresponds to `/rfa/cantonese/news`\n\n`https://www.rfa.org/cantonese/news/htm` corresponds to `/rfa/cantonese/news/htm`","location":"index.ts"}' />

Delivers a better experience by supporting parameter specification.

Parameters can be obtained from the official website, for instance:

`https://www.rfa.org/cantonese/news` corresponds to `/rfa/cantonese/news`

`https://www.rfa.org/cantonese/news/htm` corresponds to `/rfa/cantonese/news/htm`

## Rodong Sinmun 劳动新闻 <Site url="rodong.rep.kp"/>

### News <Site url="rodong.rep.kp/cn/index.php" size="sm" />

<Route namespace="rodong" :data='{"path":"/news/:language?","categories":["traditional-media"],"example":"/rodong/news","parameters":{"language":"Language, see below, `ko` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["rodong.rep.kp/cn/index.php","rodong.rep.kp/en/index.php","rodong.rep.kp/ko/index.php","rodong.rep.kp/cn","rodong.rep.kp/en","rodong.rep.kp/ko"],"target":"/news"}],"name":"News","maintainers":["TonyRL"],"url":"rodong.rep.kp/cn/index.php","description":"| 조선어 | English | 中文 |\n  | ------ | ------- | ---- |\n  | ko     | en      | cn   |","location":"news.ts"}' />

| 조선어 | English | 中文 |
  | ------ | ------- | ---- |
  | ko     | en      | cn   |

## Russian News Agency TASS <Site url="tass.com"/>

### News <Site url="tass.com" size="sm" />

<Route namespace="tass" :data='{"path":"/:category?","categories":["traditional-media"],"example":"/tass/politics","parameters":{"category":"Category, can be found in URL, `politics` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["tass.com/:category"],"target":"/:category"}],"name":"News","maintainers":["TonyRL"],"description":"| Russian Politics & Diplomacy | World | Business & Economy | Military & Defense | Science & Space | Emergencies | Society & Culture | Press Review | Sports |\n  | ---------------------------- | ----- | ------------------ | ------------------ | --------------- | ----------- | ----------------- | ------------ | ------ |\n  | politics                     | world | economy            | defense            | science         | emergencies | society           | pressreview  | sports |","location":"news.ts"}' />

| Russian Politics & Diplomacy | World | Business & Economy | Military & Defense | Science & Space | Emergencies | Society & Culture | Press Review | Sports |
  | ---------------------------- | ----- | ------------------ | ------------------ | --------------- | ----------- | ----------------- | ------------ | ------ |
  | politics                     | world | economy            | defense            | science         | emergencies | society           | pressreview  | sports |

## Solidot <Site url="www.solidot.org"/>

### 最新消息 <Site url="www.solidot.org" size="sm" />

<Route namespace="solidot" :data='{"path":"/:type?","categories":["traditional-media"],"example":"/solidot/linux","parameters":{"type":"消息类型。默认为 www. 在网站上方选择后复制子域名即可"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"最新消息","maintainers":["sgqy","hang333","TonyRL"],"description":":::tip\n  Solidot 提供的 feed:\n\n  -   [https://www.solidot.org/index.rss](https://www.solidot.org/index.rss)\n  :::\n\n  | 全部 | 创业    | Linux | 科学    | 科技       | 移动   | 苹果  | 硬件     | 软件     | 安全     | 游戏  | 书籍  | ask | idle | 博客 | 云计算 | 奇客故事 |\n  | ---- | ------- | ----- | ------- | ---------- | ------ | ----- | -------- | -------- | -------- | ----- | ----- | --- | ---- | ---- | ------ | -------- |\n  | www  | startup | linux | science | technology | mobile | apple | hardware | software | security | games | books | ask | idle | blog | cloud  | story    |","location":"main.ts"}' />

:::tip
  Solidot 提供的 feed:

  -   [https://www.solidot.org/index.rss](https://www.solidot.org/index.rss)
  :::

  | 全部 | 创业    | Linux | 科学    | 科技       | 移动   | 苹果  | 硬件     | 软件     | 安全     | 游戏  | 书籍  | ask | idle | 博客 | 云计算 | 奇客故事 |
  | ---- | ------- | ----- | ------- | ---------- | ------ | ----- | -------- | -------- | -------- | ----- | ----- | --- | ---- | ---- | ------ | -------- |
  | www  | startup | linux | science | technology | mobile | apple | hardware | software | security | games | books | ask | idle | blog | cloud  | story    |

## Sputnik News 俄罗斯卫星通讯社 <Site url="sputniknews.cn"/>

### Category <Site url="sputniknews.cn" size="sm" />

<Route namespace="sputniknews" :data='{"path":"/:category?/:language?","categories":["traditional-media"],"example":"/sputniknews","parameters":{"category":"Category, can be found in URL, `news` by default","language":"Language, see below, English by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Category","maintainers":["nczitzk"],"description":"Categories for International site:\n\n  | WORLD | COVID-19 | BUSINESS | SPORT | TECH | OPINION |\n  | ----- | -------- | -------- | ----- | ---- | ------- |\n  | world | covid-19 | business | sport | tech | opinion |\n\n  Categories for Chinese site:\n\n  | 新闻 | 中国  | 俄罗斯 | 国际            | 俄中关系                 | 评论    |\n  | ---- | ----- | ------ | --------------- | ------------------------ | ------- |\n  | news | china | russia | category_guoji | russia_china_relations | opinion |\n\n  Language\n\n  | Language    | Id          |\n  | ----------- | ----------- |\n  | English     | english     |\n  | Spanish     | spanish     |\n  | German      | german      |\n  | French      | french      |\n  | Greek       | greek       |\n  | Italian     | italian     |\n  | Czech       | czech       |\n  | Polish      | polish      |\n  | Serbian     | serbian     |\n  | Latvian     | latvian     |\n  | Lithuanian  | lithuanian  |\n  | Moldavian   | moldavian   |\n  | Belarusian  | belarusian  |\n  | Armenian    | armenian    |\n  | Abkhaz      | abkhaz      |\n  | Ssetian     | ssetian     |\n  | Georgian    | georgian    |\n  | Azerbaijani | azerbaijani |\n  | Arabic      | arabic      |\n  | Turkish     | turkish     |\n  | Persian     | persian     |\n  | Dari        | dari        |\n  | Kazakh      | kazakh      |\n  | Kyrgyz      | kyrgyz      |\n  | Uzbek       | uzbek       |\n  | Tajik       | tajik       |\n  | Vietnamese  | vietnamese  |\n  | Japanese    | japanese    |\n  | Chinese     | chinese     |\n  | Portuguese  | portuguese  |","location":"index.ts"}' />

Categories for International site:

  | WORLD | COVID-19 | BUSINESS | SPORT | TECH | OPINION |
  | ----- | -------- | -------- | ----- | ---- | ------- |
  | world | covid-19 | business | sport | tech | opinion |

  Categories for Chinese site:

  | 新闻 | 中国  | 俄罗斯 | 国际            | 俄中关系                 | 评论    |
  | ---- | ----- | ------ | --------------- | ------------------------ | ------- |
  | news | china | russia | category_guoji | russia_china_relations | opinion |

  Language

  | Language    | Id          |
  | ----------- | ----------- |
  | English     | english     |
  | Spanish     | spanish     |
  | German      | german      |
  | French      | french      |
  | Greek       | greek       |
  | Italian     | italian     |
  | Czech       | czech       |
  | Polish      | polish      |
  | Serbian     | serbian     |
  | Latvian     | latvian     |
  | Lithuanian  | lithuanian  |
  | Moldavian   | moldavian   |
  | Belarusian  | belarusian  |
  | Armenian    | armenian    |
  | Abkhaz      | abkhaz      |
  | Ssetian     | ssetian     |
  | Georgian    | georgian    |
  | Azerbaijani | azerbaijani |
  | Arabic      | arabic      |
  | Turkish     | turkish     |
  | Persian     | persian     |
  | Dari        | dari        |
  | Kazakh      | kazakh      |
  | Kyrgyz      | kyrgyz      |
  | Uzbek       | uzbek       |
  | Tajik       | tajik       |
  | Vietnamese  | vietnamese  |
  | Japanese    | japanese    |
  | Chinese     | chinese     |
  | Portuguese  | portuguese  |

## The Economist <Site url="economist.com"/>

### Category <Site url="economist.com" size="sm" />

<Route namespace="economist" :data='{"path":"/:endpoint","categories":["traditional-media"],"example":"/economist/latest","parameters":{"endpoint":"Category name, can be found on the [official page](https://www.economist.com/rss). For example, https://www.economist.com/china/rss.xml to china"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["economist.com/:endpoint"]}],"name":"Category","maintainers":["ImSingee"],"location":"full.ts"}' />

### Espresso <Site url="economist.com/the-world-in-brief" size="sm" />

<Route namespace="economist" :data='{"path":"/espresso","categories":["traditional-media"],"example":"/economist/espresso","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["economist.com/the-world-in-brief","economist.com/espresso"]}],"name":"Espresso","maintainers":["TonyRL"],"url":"economist.com/the-world-in-brief","location":"espresso.ts"}' />

### Global Business Review <Site url="businessreview.global/" size="sm" />

<Route namespace="economist" :data='{"path":"/global-business-review/:language?","categories":["traditional-media"],"example":"/economist/global-business-review/cn-en","parameters":{"language":"Language, `en`, `cn`, `tw` are supported, support multiple options, default to cn-en"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["businessreview.global/"],"target":"/global-business-review"}],"name":"Global Business Review","maintainers":["prnake"],"url":"businessreview.global/","location":"global-business-review.ts"}' />

## The Nikkei 日本経済新聞 <Site url="asia.nikkei.com"/>

### News <Site url="asia.nikkei.com" size="sm" />

<Route namespace="nikkei" :data='{"path":"/:category/:article_type?","categories":["traditional-media"],"example":"/nikkei/news","parameters":{"category":"Category, see table below","article_type":"Only includes free articles, set `free` to enable, disabled by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.nikkei.com/:category/archive","www.nikkei.com/:category"],"target":"/:category"}],"name":"News","maintainers":["Arracc"],"description":"| 総合 | オピニオン | 経済    | 政治     | 金融      | マーケット | ビジネス | マネーのまなび | テック     | 国際          | スポーツ | 社会・調査 | 地域  | 文化    | ライフスタイル |\n  | ---- | ---------- | ------- | -------- | --------- | ---------- | -------- | -------------- | ---------- | ------------- | -------- | ---------- | ----- | ------- | -------------- |\n  | news | opinion    | economy | politics | financial | business   | 不支持   | 不支持         | technology | international | sports   | society    | local | culture | lifestyle      |","location":"news.ts"}' />

| 総合 | オピニオン | 経済    | 政治     | 金融      | マーケット | ビジネス | マネーのまなび | テック     | 国際          | スポーツ | 社会・調査 | 地域  | 文化    | ライフスタイル |
  | ---- | ---------- | ------- | -------- | --------- | ---------- | -------- | -------------- | ---------- | ------------- | -------- | ---------- | ----- | ------- | -------------- |
  | news | opinion    | economy | politics | financial | business   | 不支持   | 不支持         | technology | international | sports   | society    | local | culture | lifestyle      |

### Nikkei Asia Latest News <Site url="asia.nikkei.com/" size="sm" />

<Route namespace="nikkei" :data='{"path":"/asia","categories":["traditional-media"],"example":"/nikkei/asia","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["asia.nikkei.com/"]}],"name":"Nikkei Asia Latest News","maintainers":["rainrdx"],"url":"asia.nikkei.com/","location":"asia/index.ts"}' />

### Unknown <Site url="www.nikkei.com/" size="sm" />

<Route namespace="nikkei" :data='{"path":["/","/index"],"name":"Unknown","maintainers":[],"url":"www.nikkei.com/","location":"index.ts"}' />

### Unknown <Site url="www.nikkei.com/" size="sm" />

<Route namespace="nikkei" :data='{"path":["/","/index"],"name":"Unknown","maintainers":[],"url":"www.nikkei.com/","location":"index.ts"}' />

### Unknown <Site url="asia.nikkei.com" size="sm" />

<Route namespace="nikkei" :data='{"path":"/cn/*","name":"Unknown","maintainers":[],"location":"cn/index.ts"}' />

## The New York Times 纽约时报 <Site url="nytimes.com"/>

### Best Seller Books <Site url="nytimes.com/" size="sm" />

<Route namespace="nytimes" :data='{"path":"/book/:category?","categories":["traditional-media"],"example":"/nytimes/book/combined-print-and-e-book-nonfiction","parameters":{"category":"N"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["nytimes.com/"],"target":""}],"name":"Best Seller Books","maintainers":["melvinto"],"url":"nytimes.com/","description":"| Category                             |\n| ------------------------------------ |\n| combined-print-and-e-book-nonfiction |\n| hardcover-nonfiction                 |\n| paperback-nonfiction                 |\n| advice-how-to-and-miscellaneous      |\n| combined-print-and-e-book-fiction    |\n| hardcover-fiction                    |\n| trade-fiction-paperback              |\n| childrens-middle-grade-hardcover     |\n| picture-books                        |\n| series-books                         |\n| young-adult-hardcover                |","location":"book.ts"}' />

| Category                             |
| ------------------------------------ |
| combined-print-and-e-book-nonfiction |
| hardcover-nonfiction                 |
| paperback-nonfiction                 |
| advice-how-to-and-miscellaneous      |
| combined-print-and-e-book-fiction    |
| hardcover-fiction                    |
| trade-fiction-paperback              |
| childrens-middle-grade-hardcover     |
| picture-books                        |
| series-books                         |
| young-adult-hardcover                |

### News <Site url="nytimes.com/" size="sm" />

<Route namespace="nytimes" :data='{"path":"/:lang?","categories":["traditional-media"],"example":"/nytimes/dual","parameters":{"lang":"language, default to Chinese"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["nytimes.com/"],"target":""}],"name":"News","maintainers":["HenryQW"],"url":"nytimes.com/","description":"By extracting the full text of articles, we provide a better reading experience (full text articles) over the official one.\n\n  | Default to Chinese | Chinese-English | English | Chinese-English (Traditional Chinese) | Traditional Chinese |\n  | ------------------ | --------------- | ------- | ------------------------------------- | ------------------- |\n  | (empty)            | dual            | en      | dual-traditionalchinese               | traditionalchinese  |","location":"index.ts"}' />

By extracting the full text of articles, we provide a better reading experience (full text articles) over the official one.

  | Default to Chinese | Chinese-English | English | Chinese-English (Traditional Chinese) | Traditional Chinese |
  | ------------------ | --------------- | ------- | ------------------------------------- | ------------------- |
  | (empty)            | dual            | en      | dual-traditionalchinese               | traditionalchinese  |

### 新闻简报 <Site url="nytimes.com/" size="sm" />

<Route namespace="nytimes" :data='{"path":"/daily_briefing_chinese","categories":["traditional-media"],"example":"/nytimes/daily_briefing_chinese","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["nytimes.com/"],"target":""}],"name":"新闻简报","maintainers":["yueyericardo","nczitzk"],"url":"nytimes.com/","description":"网站地址：[https://www.nytimes.com/zh-hans/series/daily-briefing-chinese](https://www.nytimes.com/zh-hans/series/daily-briefing-chinese)","location":"daily-briefing-chinese.ts"}' />

网站地址：[https://www.nytimes.com/zh-hans/series/daily-briefing-chinese](https://www.nytimes.com/zh-hans/series/daily-briefing-chinese)

## Taiwan News 台灣英文新聞 <Site url="taiwannews.com.tw"/>

### Hot News <Site url="taiwannews.com.tw" size="sm" />

<Route namespace="taiwannews" :data='{"path":"/hot/:lang?","categories":["traditional-media"],"example":"/taiwannews/hot","parameters":{"lang":"Language, `en` or `zh`, `en` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["taiwannews.com.tw/:lang/index"],"target":"/hot/:lang"}],"name":"Hot News","maintainers":["TonyRL"],"location":"hot.ts"}' />

## The Atlantic <Site url="www.theatlantic.com"/>

### News <Site url="www.theatlantic.com" size="sm" />

<Route namespace="theatlantic" :data='{"path":"/:category","categories":["traditional-media"],"example":"/theatlantic/latest","parameters":{"category":"category, see below"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.theatlantic.com/:category"]}],"name":"News","maintainers":["EthanWng97"],"description":"| Popular      | Latest | Politics | Technology | Business |\n  | ------------ | ------ | -------- | ---------- | -------- |\n  | most-popular | latest | politics | technology | business |\n\n  More categories (except photo) can be found within the navigation bar at [https://www.theatlantic.com](https://www.theatlantic.com)","location":"news.ts"}' />

| Popular      | Latest | Politics | Technology | Business |
  | ------------ | ------ | -------- | ---------- | -------- |
  | most-popular | latest | politics | technology | business |

  More categories (except photo) can be found within the navigation bar at [https://www.theatlantic.com](https://www.theatlantic.com)

## The Hindu <Site url="thehindu.com"/>

### Topic <Site url="thehindu.com" size="sm" />

<Route namespace="thehindu" :data='{"path":"/topic/:topic","categories":["traditional-media"],"example":"/thehindu/topic/rains","parameters":{"topic":"Topic slug, can be found in URL."},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["thehindu.com/topic/:topic"]}],"name":"Topic","maintainers":["TonyRL"],"location":"topic.ts"}' />

## The Wall Street Journal (WSJ) 华尔街日报 <Site url="cn.wsj.com"/>

### News <Site url="cn.wsj.com" size="sm" />

<Route namespace="wsj" :data='{"path":"/:lang/:category?","categories":["traditional-media"],"example":"/wsj/en-us/opinion","parameters":{"lang":"Language, `en-us`, `zh-cn`, `zh-tw`","category":"Category. See below"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"News","maintainers":["oppilate"],"description":"en_us\n\n  | World | U.S. | Politics | Economy | Business | Tech       | Markets | Opinion | Books & Arts | Real Estate | Life & Work | Sytle               | Sports |\n  | ----- | ---- | -------- | ------- | -------- | ---------- | ------- | ------- | ------------ | ----------- | ----------- | ------------------- | ------ |\n  | world | us   | politics | economy | business | technology | markets | opinion | books-arts   | realestate  | life-work   | style-entertainment | sports |\n\n  zh-cn / zh-tw\n\n  | 国际  | 中国  | 金融市场 | 经济    | 商业     | 科技       | 派        | 专栏与观点 |\n  | ----- | ----- | -------- | ------- | -------- | ---------- | --------- | ---------- |\n  | world | china | markets  | economy | business | technology | life-arts | opinion    |\n\n  Provide full article RSS for WSJ topics.","location":"news.ts"}' />

en_us

  | World | U.S. | Politics | Economy | Business | Tech       | Markets | Opinion | Books & Arts | Real Estate | Life & Work | Sytle               | Sports |
  | ----- | ---- | -------- | ------- | -------- | ---------- | ------- | ------- | ------------ | ----------- | ----------- | ------------------- | ------ |
  | world | us   | politics | economy | business | technology | markets | opinion | books-arts   | realestate  | life-work   | style-entertainment | sports |

  zh-cn / zh-tw

  | 国际  | 中国  | 金融市场 | 经济    | 商业     | 科技       | 派        | 专栏与观点 |
  | ----- | ----- | -------- | ------- | -------- | ---------- | --------- | ---------- |
  | world | china | markets  | economy | business | technology | life-arts | opinion    |

  Provide full article RSS for WSJ topics.

## Voice of Mongolia 蒙古之声 <Site url="vom.mn"/>

### News <Site url="vom.mn" size="sm" />

<Route namespace="vom" :data='{"path":"/featured/:lang?","categories":["traditional-media"],"example":"/vom/featured","parameters":{"lang":"Language, see the table below, `mn` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["vom.mn/:lang","vom.mn/"],"target":"/featured/:lang"}],"name":"News","maintainers":["TonyRL"],"description":"| English | 日本語 | Монгол | Русский | 简体中文 |\n  | ------- | ------ | ------ | ------- | -------- |\n  | en      | ja     | mn     | ru      | zh       |","location":"featured.ts"}' />

| English | 日本語 | Монгол | Русский | 简体中文 |
  | ------- | ------ | ------ | ------- | -------- |
  | en      | ja     | mn     | ru      | zh       |

## Yomiuri Shimbun 読売新聞 <Site url="www.yomiuri.co.jp"/>

### News <Site url="www.yomiuri.co.jp" size="sm" />

<Route namespace="yomiuri" :data='{"path":"/:category?","categories":["traditional-media"],"example":"/yomiuri/news","parameters":{"category":"Category, `news` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.yomiuri.co.jp/:category?"]}],"name":"News","maintainers":["Arracc"],"description":"Free articles only.\n\n  | Category       | Parameter |\n  | -------------- | --------- |\n  | 新着・速報     | news      |\n  | 社会           | national  |\n  | 政治           | politics  |\n  | 経済           | economy   |\n  | スポーツ       | sports    |\n  | 国際           | world     |\n  | 地域           | local     |\n  | 科学・ＩＴ     | science   |\n  | エンタメ・文化 | culture   |\n  | ライフ         | life      |\n  | 医療・健康     | medical   |\n  | 教育・就活     | kyoiku    |\n  | 選挙・世論調査 | election  |\n  | 囲碁・将棋     | igoshougi |\n  | 社説           | editorial |\n  | 皇室           | koushitsu |","location":"news.ts"}' />

Free articles only.

  | Category       | Parameter |
  | -------------- | --------- |
  | 新着・速報     | news      |
  | 社会           | national  |
  | 政治           | politics  |
  | 経済           | economy   |
  | スポーツ       | sports    |
  | 国際           | world     |
  | 地域           | local     |
  | 科学・ＩＴ     | science   |
  | エンタメ・文化 | culture   |
  | ライフ         | life      |
  | 医療・健康     | medical   |
  | 教育・就活     | kyoiku    |
  | 選挙・世論調査 | election  |
  | 囲碁・将棋     | igoshougi |
  | 社説           | editorial |
  | 皇室           | koushitsu |

## 北极星电力网 <Site url="guangfu.bjx.com.cn"/>

### 光伏 <Site url="guangfu.bjx.com.cn" size="sm" />

<Route namespace="bjx" :data='{"path":"/gf/:type","categories":["traditional-media"],"example":"/bjx/gf/sc","parameters":{"type":"分类，北极星光伏最后的`type`字段"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"光伏","maintainers":["Sxuet"],"description":"`:type` 类型可选如下\n\n  | 要闻 | 政策 | 市场行情 | 企业动态 | 独家观点 | 项目工程 | 招标采购 | 财经 | 国际行情 | 价格趋势 | 技术跟踪 |\n  | ---- | ---- | -------- | -------- | -------- | -------- | -------- | ---- | -------- | -------- | -------- |\n  | yw   | zc   | sc       | mq       | dj       | xm       | zb       | cj   | gj       | sj       | js       |","location":"types.ts"}' />

`:type` 类型可选如下

  | 要闻 | 政策 | 市场行情 | 企业动态 | 独家观点 | 项目工程 | 招标采购 | 财经 | 国际行情 | 价格趋势 | 技术跟踪 |
  | ---- | ---- | -------- | -------- | -------- | -------- | -------- | ---- | -------- | -------- | -------- |
  | yw   | zc   | sc       | mq       | dj       | xm       | zb       | cj   | gj       | sj       | js       |

### 环保要闻 <Site url="huanbao.bjx.com.cn/yw" size="sm" />

<Route namespace="bjx" :data='{"path":"/huanbao","categories":["traditional-media"],"example":"/bjx/huanbao","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["huanbao.bjx.com.cn/yw","huanbao.bjx.com.cn/"]}],"name":"环保要闻","maintainers":["zsimple"],"url":"huanbao.bjx.com.cn/yw","location":"huanbao.ts"}' />

## 财新博客 <Site url="caixin.com"/>

> 网站部分内容需要付费订阅，RSS 仅做更新提醒，不含付费内容。

### 财新数据通 <Site url="k.caixin.com/web" size="sm" />

<Route namespace="caixin" :data='{"path":"/database","categories":["traditional-media"],"example":"/caixin/database","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["k.caixin.com/web","k.caixin.com/"]}],"name":"财新数据通","maintainers":["nczitzk"],"url":"k.caixin.com/web","location":"database.ts"}' />

### 财新一线 <Site url="caixin.com" size="sm" />

<Route namespace="caixin" :data='{"path":"/k","categories":["traditional-media"],"example":"/caixin/k","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":true,"supportScihub":false},"name":"财新一线","maintainers":["boypt"],"location":"k.ts"}' />

### 财新周刊 <Site url="weekly.caixin.com/" size="sm" />

<Route namespace="caixin" :data='{"path":"/weekly","categories":["traditional-media"],"example":"/caixin/weekly","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["weekly.caixin.com/","weekly.caixin.com/*"]}],"name":"财新周刊","maintainers":["TonyRL"],"url":"weekly.caixin.com/","location":"weekly.ts"}' />

### 首页新闻 <Site url="caixin.com/" size="sm" />

<Route namespace="caixin" :data='{"path":"/article","categories":["traditional-media"],"example":"/caixin/article","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":true,"supportScihub":false},"radar":[{"source":["caixin.com/"]}],"name":"首页新闻","maintainers":["EsuRt"],"url":"caixin.com/","location":"article.ts"}' />

### 新闻分类 <Site url="caixin.com" size="sm" />

<Route namespace="caixin" :data='{"path":"/:column/:category","categories":["traditional-media"],"example":"/caixin/finance/regulation","parameters":{"column":"栏目名","category":"栏目下的子分类名"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":true,"supportScihub":false},"name":"新闻分类","maintainers":["idealclover"],"description":"Column 列表：\n\n  | 经济    | 金融    | 政经  | 环科    | 世界          | 观点网  | 文化    | 周刊   |\n  | ------- | ------- | ----- | ------- | ------------- | ------- | ------- | ------ |\n  | economy | finance | china | science | international | opinion | culture | weekly |\n\n  以金融板块为例的 category 列表：（其余 column 以类似方式寻找）\n\n  | 监管       | 银行 | 证券基金 | 信托保险         | 投资       | 创新       | 市场   |\n  | ---------- | ---- | -------- | ---------------- | ---------- | ---------- | ------ |\n  | regulation | bank | stock    | insurance_trust | investment | innovation | market |\n\n  Category 列表：\n\n  | 封面报道   | 开卷  | 社论      | 时事             | 编辑寄语     | 经济    | 金融    | 商业     | 环境与科技              | 民生    | 副刊   |\n  | ---------- | ----- | --------- | ---------------- | ------------ | ------- | ------- | -------- | ----------------------- | ------- | ------ |\n  | coverstory | first | editorial | current_affairs | editor_desk | economy | finance | business | environment_technology | cwcivil | column |","location":"category.ts"}' />

Column 列表：

  | 经济    | 金融    | 政经  | 环科    | 世界          | 观点网  | 文化    | 周刊   |
  | ------- | ------- | ----- | ------- | ------------- | ------- | ------- | ------ |
  | economy | finance | china | science | international | opinion | culture | weekly |

  以金融板块为例的 category 列表：（其余 column 以类似方式寻找）

  | 监管       | 银行 | 证券基金 | 信托保险         | 投资       | 创新       | 市场   |
  | ---------- | ---- | -------- | ---------------- | ---------- | ---------- | ------ |
  | regulation | bank | stock    | insurance_trust | investment | innovation | market |

  Category 列表：

  | 封面报道   | 开卷  | 社论      | 时事             | 编辑寄语     | 经济    | 金融    | 商业     | 环境与科技              | 民生    | 副刊   |
  | ---------- | ----- | --------- | ---------------- | ------------ | ------- | ------- | -------- | ----------------------- | ------- | ------ |
  | coverstory | first | editorial | current_affairs | editor_desk | economy | finance | business | environment_technology | cwcivil | column |

### 最新文章 <Site url="caixin.com/" size="sm" />

<Route namespace="caixin" :data='{"path":"/latest","categories":["traditional-media"],"example":"/caixin/latest","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["caixin.com/"]}],"name":"最新文章","maintainers":["tpnonthealps"],"url":"caixin.com/","description":"说明：此 RSS feed 会自动抓取财新网的最新文章，但不包含 FM 及视频内容。","location":"latest.ts"}' />

说明：此 RSS feed 会自动抓取财新网的最新文章，但不包含 FM 及视频内容。

## 参考消息 <Site url="cankaoxiaoxi.com"/>

### 栏目 <Site url="cankaoxiaoxi.com" size="sm" />

<Route namespace="cankaoxiaoxi" :data='{"path":["/column/:id?","/:id?"],"categories":["traditional-media"],"example":"/cankaoxiaoxi/column/diyi","parameters":{"id":"栏目 id，默认为 `diyi`，即第一关注"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"栏目","maintainers":["yuxinliu-alex","nczitzk"],"description":"| 栏目           | id       |\n  | -------------- | -------- |\n  | 第一关注       | diyi     |\n  | 中国           | zhongguo |\n  | 国际           | gj       |\n  | 观点           | guandian |\n  | 锐参考         | ruick    |\n  | 体育健康       | tiyujk   |\n  | 科技应用       | kejiyy   |\n  | 文化旅游       | wenhualy |\n  | 参考漫谈       | cankaomt |\n  | 研究动态       | yjdt     |\n  | 海外智库       | hwzk     |\n  | 业界信息・观点 | yjxx     |\n  | 海外看中国城市 | hwkzgcs  |\n  | 译名趣谈       | ymymqt   |\n  | 译名发布       | ymymfb   |\n  | 双语汇         | ymsyh    |\n  | 参考视频       | video    |\n  | 军事           | junshi   |\n  | 参考人物       | cankaorw |","location":"index.ts"}' />

| 栏目           | id       |
  | -------------- | -------- |
  | 第一关注       | diyi     |
  | 中国           | zhongguo |
  | 国际           | gj       |
  | 观点           | guandian |
  | 锐参考         | ruick    |
  | 体育健康       | tiyujk   |
  | 科技应用       | kejiyy   |
  | 文化旅游       | wenhualy |
  | 参考漫谈       | cankaomt |
  | 研究动态       | yjdt     |
  | 海外智库       | hwzk     |
  | 业界信息・观点 | yjxx     |
  | 海外看中国城市 | hwkzgcs  |
  | 译名趣谈       | ymymqt   |
  | 译名发布       | ymymfb   |
  | 双语汇         | ymsyh    |
  | 参考视频       | video    |
  | 军事           | junshi   |
  | 参考人物       | cankaorw |

### 栏目 <Site url="cankaoxiaoxi.com" size="sm" />

<Route namespace="cankaoxiaoxi" :data='{"path":["/column/:id?","/:id?"],"categories":["traditional-media"],"example":"/cankaoxiaoxi/column/diyi","parameters":{"id":"栏目 id，默认为 `diyi`，即第一关注"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"栏目","maintainers":["yuxinliu-alex","nczitzk"],"description":"| 栏目           | id       |\n  | -------------- | -------- |\n  | 第一关注       | diyi     |\n  | 中国           | zhongguo |\n  | 国际           | gj       |\n  | 观点           | guandian |\n  | 锐参考         | ruick    |\n  | 体育健康       | tiyujk   |\n  | 科技应用       | kejiyy   |\n  | 文化旅游       | wenhualy |\n  | 参考漫谈       | cankaomt |\n  | 研究动态       | yjdt     |\n  | 海外智库       | hwzk     |\n  | 业界信息・观点 | yjxx     |\n  | 海外看中国城市 | hwkzgcs  |\n  | 译名趣谈       | ymymqt   |\n  | 译名发布       | ymymfb   |\n  | 双语汇         | ymsyh    |\n  | 参考视频       | video    |\n  | 军事           | junshi   |\n  | 参考人物       | cankaorw |","location":"index.ts"}' />

| 栏目           | id       |
  | -------------- | -------- |
  | 第一关注       | diyi     |
  | 中国           | zhongguo |
  | 国际           | gj       |
  | 观点           | guandian |
  | 锐参考         | ruick    |
  | 体育健康       | tiyujk   |
  | 科技应用       | kejiyy   |
  | 文化旅游       | wenhualy |
  | 参考漫谈       | cankaomt |
  | 研究动态       | yjdt     |
  | 海外智库       | hwzk     |
  | 业界信息・观点 | yjxx     |
  | 海外看中国城市 | hwkzgcs  |
  | 译名趣谈       | ymymqt   |
  | 译名发布       | ymymfb   |
  | 双语汇         | ymsyh    |
  | 参考视频       | video    |
  | 军事           | junshi   |
  | 参考人物       | cankaorw |

## 第一财经 <Site url="yicai.com"/>

### DT 财经 <Site url="yicai.com" size="sm" />

<Route namespace="yicai" :data='{"path":"/dt/:column?/:category?","categories":["traditional-media"],"example":"/yicai/dt/article","parameters":{"column":"栏目，见下表，默认为文章","category":"分类，见下表，默认为全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"DT 财经","maintainers":["nczitzk"],"description":"#### [文章](https://dt.yicai.com/article)\n\n  | 分类     | ID         |\n  | -------- | ---------- |\n  | 全部     | article/0  |\n  | 新流行   | article/31 |\n  | 新趋势   | article/32 |\n  | 商业黑马 | article/33 |\n  | 新品     | article/34 |\n  | 营销     | article/35 |\n  | 大公司   | article/36 |\n  | 城市生活 | article/38 |\n\n  #### [报告](https://dt.yicai.com/report)\n\n  | 分类       | ID        |\n  | ---------- | --------- |\n  | 全部       | report/0  |\n  | 人群观念   | report/9  |\n  | 人群行为   | report/22 |\n  | 美妆个护   | report/23 |\n  | 3C 数码    | report/24 |\n  | 营销趋势   | report/25 |\n  | 服饰鞋包   | report/27 |\n  | 互联网     | report/28 |\n  | 城市与居住 | report/29 |\n  | 消费趋势   | report/30 |\n  | 生活趋势   | report/37 |\n\n  #### [可视化](https://dt.yicai.com/visualization)\n\n  | 分类     | ID               |\n  | -------- | ---------------- |\n  | 全部     | visualization/0  |\n  | 新流行   | visualization/39 |\n  | 新趋势   | visualization/40 |\n  | 商业黑马 | visualization/41 |\n  | 新品     | visualization/42 |\n  | 营销     | visualization/43 |\n  | 大公司   | visualization/44 |\n  | 城市生活 | visualization/45 |","location":"dt.ts"}' />

#### [文章](https://dt.yicai.com/article)

  | 分类     | ID         |
  | -------- | ---------- |
  | 全部     | article/0  |
  | 新流行   | article/31 |
  | 新趋势   | article/32 |
  | 商业黑马 | article/33 |
  | 新品     | article/34 |
  | 营销     | article/35 |
  | 大公司   | article/36 |
  | 城市生活 | article/38 |

  #### [报告](https://dt.yicai.com/report)

  | 分类       | ID        |
  | ---------- | --------- |
  | 全部       | report/0  |
  | 人群观念   | report/9  |
  | 人群行为   | report/22 |
  | 美妆个护   | report/23 |
  | 3C 数码    | report/24 |
  | 营销趋势   | report/25 |
  | 服饰鞋包   | report/27 |
  | 互联网     | report/28 |
  | 城市与居住 | report/29 |
  | 消费趋势   | report/30 |
  | 生活趋势   | report/37 |

  #### [可视化](https://dt.yicai.com/visualization)

  | 分类     | ID               |
  | -------- | ---------------- |
  | 全部     | visualization/0  |
  | 新流行   | visualization/39 |
  | 新趋势   | visualization/40 |
  | 商业黑马 | visualization/41 |
  | 新品     | visualization/42 |
  | 营销     | visualization/43 |
  | 大公司   | visualization/44 |
  | 城市生活 | visualization/45 |

### VIP 频道 <Site url="yicai.com" size="sm" />

<Route namespace="yicai" :data='{"path":"/vip/:id?","categories":["traditional-media"],"example":"/yicai/vip/428","parameters":{"id":"频道 id，可在对应频道页中找到，默认为一元点金"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["yicai.com/vip/product/:id","yicai.com/"],"target":"/vip/:id"}],"name":"VIP 频道","maintainers":["nczitzk"],"location":"vip.ts"}' />

### 关注 <Site url="yicai.com" size="sm" />

<Route namespace="yicai" :data='{"path":"/feed/:id?","categories":["traditional-media"],"example":"/yicai/feed/669","parameters":{"id":"主题 id，可在对应主题页中找到，默认为一财早报"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["yicai.com/feed/:id","yicai.com/feed"],"target":"/feed/:id"}],"name":"关注","maintainers":["nczitzk"],"description":":::tip\n  全部主题词见 [此处](https://www.yicai.com/feed/alltheme)\n  :::","location":"feed.ts"}' />

:::tip
  全部主题词见 [此处](https://www.yicai.com/feed/alltheme)
  :::

### 视听 <Site url="yicai.com" size="sm" />

<Route namespace="yicai" :data='{"path":"/video/:id?","categories":["traditional-media"],"example":"/yicai/video","parameters":{"id":"分类 id，见下表，可在对应分类页中找到，默认为视听"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["yicai.com/video/:id","yicai.com/video"],"target":"/video/:id"}],"name":"视听","maintainers":["nczitzk"],"description":"| Id                   | 名称                         |\n  | -------------------- | ---------------------------- |\n  | youliao              | 有料                         |\n  | appshipin            | 此刻                         |\n  | yicaisudi            | 速递                         |\n  | caishang             | 财商                         |\n  | shiji                | 史记                         |\n  | jinrigushi           | 今日股市                     |\n  | tangulunjin          | 谈股论金                     |\n  | gongsiyuhangye       | 公司与行业                   |\n  | cjyxx                | 财经夜行线                   |\n  | 6thtradingday        | 第六交易日                   |\n  | cjfw                 | 财经风味                     |\n  | chuangshidai         | 创时代                       |\n  | weilaiyaoqinghan     | 未来邀请函                   |\n  | tounaofengbao        | 头脑风暴                     |\n  | zhongguojingyingzhe  | 中国经营者                   |\n  | shichanglingjuli     | 市场零距离                   |\n  | huanqiucaijing       | 环球财经视界                 |\n  | zgjcqyjglsxftl       | 中国杰出企业家管理思想访谈录 |\n  | jiemacaishang        | 解码财商                     |\n  | sxpl                 | 首席评论                     |\n  | zhongguojingjiluntan | 中国经济论坛                 |\n  | opinionleader        | 意见领袖                     |\n  | xinjinrong           | 解码新金融                   |\n  | diyidichan           | 第一地产                     |\n  | zhichedaren          | 智车达人                     |\n  | chuangtoufengyun     | 创投风云                     |\n  | chunxiangrensheng    | 醇享人生                     |\n  | diyishengyin         | 第一声音                     |\n  | sanliangboqianjin    | 财智双全                     |\n  | weilaiyaoqinghan     | 未来邀请函                   |\n  | zjdy                 | 主角 ▪ 大医                 |\n  | leye                 | 乐业之城                     |\n  | sanrenxing           | 价值三人行                   |\n  | yuandongli           | 中国源动力                   |\n  | pioneerzone          | 直击引领区                   |","location":"video.ts"}' />

| Id                   | 名称                         |
  | -------------------- | ---------------------------- |
  | youliao              | 有料                         |
  | appshipin            | 此刻                         |
  | yicaisudi            | 速递                         |
  | caishang             | 财商                         |
  | shiji                | 史记                         |
  | jinrigushi           | 今日股市                     |
  | tangulunjin          | 谈股论金                     |
  | gongsiyuhangye       | 公司与行业                   |
  | cjyxx                | 财经夜行线                   |
  | 6thtradingday        | 第六交易日                   |
  | cjfw                 | 财经风味                     |
  | chuangshidai         | 创时代                       |
  | weilaiyaoqinghan     | 未来邀请函                   |
  | tounaofengbao        | 头脑风暴                     |
  | zhongguojingyingzhe  | 中国经营者                   |
  | shichanglingjuli     | 市场零距离                   |
  | huanqiucaijing       | 环球财经视界                 |
  | zgjcqyjglsxftl       | 中国杰出企业家管理思想访谈录 |
  | jiemacaishang        | 解码财商                     |
  | sxpl                 | 首席评论                     |
  | zhongguojingjiluntan | 中国经济论坛                 |
  | opinionleader        | 意见领袖                     |
  | xinjinrong           | 解码新金融                   |
  | diyidichan           | 第一地产                     |
  | zhichedaren          | 智车达人                     |
  | chuangtoufengyun     | 创投风云                     |
  | chunxiangrensheng    | 醇享人生                     |
  | diyishengyin         | 第一声音                     |
  | sanliangboqianjin    | 财智双全                     |
  | weilaiyaoqinghan     | 未来邀请函                   |
  | zjdy                 | 主角 ▪ 大医                 |
  | leye                 | 乐业之城                     |
  | sanrenxing           | 价值三人行                   |
  | yuandongli           | 中国源动力                   |
  | pioneerzone          | 直击引领区                   |

### 头条 <Site url="yicai.com/" size="sm" />

<Route namespace="yicai" :data='{"path":"/headline","categories":["traditional-media"],"example":"/yicai/headline","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["yicai.com/"]}],"name":"头条","maintainers":["nczitzk"],"url":"yicai.com/","location":"headline.ts"}' />

### 新闻 <Site url="yicai.com" size="sm" />

<Route namespace="yicai" :data='{"path":"/news/:id?","categories":["traditional-media"],"example":"/yicai/news","parameters":{"id":"分类 id，见下表，可在对应分类页中找到，默认为新闻"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["yicai.com/news/:id","yicai.com/news"],"target":"/news/:id"}],"name":"新闻","maintainers":["nczitzk"],"description":"| Id                       | 名称       |\n  | ------------------------ | ---------- |\n  | gushi                    | A 股       |\n  | kechuangban              | 科创板     |\n  | hongguan                 | 大政       |\n  | jinrong                  | 金融       |\n  | quanqiushichang          | 海外市场   |\n  | gongsi                   | 产经       |\n  | shijie                   | 全球       |\n  | kechuang                 | 科技       |\n  | quyu                     | 区域       |\n  | comment                  | 评论       |\n  | dafengwenhua             | 商业人文   |\n  | books                    | 阅读周刊   |\n  | loushi                   | 地产       |\n  | automobile               | 汽车       |\n  | china_financial_herald | 对话陆家嘴 |\n  | fashion                  | 时尚       |\n  | ad                       | 商业资讯   |\n  | info                     | 资讯       |\n  | jzfxb                    | 价值风向标 |\n  | shuducaijing             | 数读财经   |\n  | shujujiepan              | 数据解盘   |\n  | shudushenghuo            | 数读生活   |\n  | cbndata                  | CBNData    |\n  | dtcj                     | DT 财经    |\n  | xfsz                     | 消费数知   |","location":"news.ts"}' />

| Id                       | 名称       |
  | ------------------------ | ---------- |
  | gushi                    | A 股       |
  | kechuangban              | 科创板     |
  | hongguan                 | 大政       |
  | jinrong                  | 金融       |
  | quanqiushichang          | 海外市场   |
  | gongsi                   | 产经       |
  | shijie                   | 全球       |
  | kechuang                 | 科技       |
  | quyu                     | 区域       |
  | comment                  | 评论       |
  | dafengwenhua             | 商业人文   |
  | books                    | 阅读周刊   |
  | loushi                   | 地产       |
  | automobile               | 汽车       |
  | china_financial_herald | 对话陆家嘴 |
  | fashion                  | 时尚       |
  | ad                       | 商业资讯   |
  | info                     | 资讯       |
  | jzfxb                    | 价值风向标 |
  | shuducaijing             | 数读财经   |
  | shujujiepan              | 数据解盘   |
  | shudushenghuo            | 数读生活   |
  | cbndata                  | CBNData    |
  | dtcj                     | DT 财经    |
  | xfsz                     | 消费数知   |

### 一财号 <Site url="yicai.com" size="sm" />

<Route namespace="yicai" :data='{"path":"/author/:id?","categories":["traditional-media"],"example":"/yicai/author/100005663","parameters":{"id":"作者 id，可在对应作者页中找到，默认为第一财经研究院"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["yicai.com/author/:id","yicai.com/author"],"target":"/author/:id"}],"name":"一财号","maintainers":["nczitzk"],"location":"author.ts"}' />

### 正在 <Site url="yicai.com/brief" size="sm" />

<Route namespace="yicai" :data='{"path":"/brief","categories":["traditional-media"],"example":"/yicai/brief","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["yicai.com/brief"]}],"name":"正在","maintainers":["sanmmm","nczitzk"],"url":"yicai.com/brief","location":"brief.ts"}' />

### 最新 <Site url="yicai.com/" size="sm" />

<Route namespace="yicai" :data='{"path":"/latest","categories":["traditional-media"],"example":"/yicai/latest","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["yicai.com/"]}],"name":"最新","maintainers":["nczitzk"],"url":"yicai.com/","location":"latest.ts"}' />

## 东方网 <Site url="mini.eastday.com"/>

### 24 小时热闻 <Site url="mini.eastday.com/" size="sm" />

<Route namespace="eastday" :data='{"path":"/24/:category?","categories":["traditional-media"],"example":"/eastday/24","parameters":{"category":"分类，见下表，默认为社会"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["mini.eastday.com/"],"target":"/24"}],"name":"24 小时热闻","maintainers":["nczitzk"],"url":"mini.eastday.com/","description":"| 推荐 | 社会 | 娱乐 | 国际 | 军事 |\n  | ---- | ---- | ---- | ---- | ---- |\n\n  | 养生 | 汽车 | 体育 | 财经 | 游戏 |\n  | ---- | ---- | ---- | ---- | ---- |\n\n  | 科技 | 国内 | 宠物 | 情感 | 人文 | 教育 |\n  | ---- | ---- | ---- | ---- | ---- | ---- |","location":"24.ts"}' />

| 推荐 | 社会 | 娱乐 | 国际 | 军事 |
  | ---- | ---- | ---- | ---- | ---- |

  | 养生 | 汽车 | 体育 | 财经 | 游戏 |
  | ---- | ---- | ---- | ---- | ---- |

  | 科技 | 国内 | 宠物 | 情感 | 人文 | 教育 |
  | ---- | ---- | ---- | ---- | ---- | ---- |

### 上海新闻 <Site url="sh.eastday.com/" size="sm" />

<Route namespace="eastday" :data='{"path":"/sh","categories":["traditional-media"],"example":"/eastday/sh","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["sh.eastday.com/"]}],"name":"上海新闻","maintainers":["saury"],"url":"sh.eastday.com/","location":"sh.ts"}' />

### 原创 <Site url="www.eastday.com/" size="sm" />

<Route namespace="eastday" :data='{"path":"/portrait","categories":["traditional-media"],"example":"/eastday/portrait","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.eastday.com/"]}],"name":"原创","maintainers":["nczitzk"],"url":"www.eastday.com/","location":"portrait.ts"}' />

## 东网 <Site url="hk.on.cc"/>

### Money18 <Site url="hk.on.cc" size="sm" />

<Route namespace="oncc" :data='{"path":"/money18/:id?","categories":["traditional-media"],"example":"/oncc/money18/exp","parameters":{"id":"栏目 id，可在对应栏目页 URL 中找到，默认为 exp，即新聞總覽"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Money18","maintainers":["nczitzk"],"description":"| 新聞總覽 | 全日焦點 | 板塊新聞 | 國際金融 | 大行報告 | A 股新聞 | 地產新聞 | 投資理財  | 新股 IPO | 科技財情 |\n  | -------- | -------- | -------- | -------- | -------- | -------- | -------- | --------- | -------- | -------- |\n  | exp      | fov      | industry | int      | recagent | ntlgroup | pro      | weainvest | ipo      | tech     |","location":"money18.ts"}' />

| 新聞總覽 | 全日焦點 | 板塊新聞 | 國際金融 | 大行報告 | A 股新聞 | 地產新聞 | 投資理財  | 新股 IPO | 科技財情 |
  | -------- | -------- | -------- | -------- | -------- | -------- | -------- | --------- | -------- | -------- |
  | exp      | fov      | industry | int      | recagent | ntlgroup | pro      | weainvest | ipo      | tech     |

### 即時新聞 <Site url="hk.on.cc" size="sm" />

<Route namespace="oncc" :data='{"path":"/:language/:channel?","categories":["traditional-media"],"example":"/oncc/zh-hant/news","parameters":{"language":"`zh-hans` 为简体，`zh-hant` 为繁体","channel":"频道，默认为港澳"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"即時新聞","maintainers":["Fatpandac"],"description":"频道参数可以从官网的地址中获取，如：\n\n  `https://hk.on.cc/hk/finance/index_cn.html` 对应 `/oncc/zh-hans/finance`\n\n  `https://hk.on.cc/hk/finance/index.html` 对应 `/oncc/zh-hant/finance`","location":"index.ts"}' />

频道参数可以从官网的地址中获取，如：

  `https://hk.on.cc/hk/finance/index_cn.html` 对应 `/oncc/zh-hans/finance`

  `https://hk.on.cc/hk/finance/index.html` 对应 `/oncc/zh-hant/finance`

## 公視新聞網 <Site url="news.pts.org.tw"/>

### Unknown <Site url="news.pts.org.tw" size="sm" />

<Route namespace="pts" :data='{"path":"*","name":"Unknown","maintainers":[],"location":"index.ts"}' />

### 數位敘事 <Site url="news.pts.org.tw/projects" size="sm" />

<Route namespace="pts" :data='{"path":"/projects","categories":["traditional-media"],"example":"/pts/projects","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["news.pts.org.tw/projects","news.pts.org.tw/"]}],"name":"數位敘事","maintainers":["nczitzk"],"url":"news.pts.org.tw/projects","location":"projects.ts"}' />

### 整理報導 <Site url="news.pts.org.tw" size="sm" />

<Route namespace="pts" :data='{"path":"/live/:id","categories":["traditional-media"],"example":"/pts/live/62e8e4bbb4de2cbd74468b2b","parameters":{"id":"報導 id，可在对应整理報導页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["news.pts.org.tw/live/:id","news.pts.org.tw/"]}],"name":"整理報導","maintainers":[],"location":"live.ts"}' />

### 專題策展 <Site url="news.pts.org.tw/curations" size="sm" />

<Route namespace="pts" :data='{"path":"/curations","categories":["traditional-media"],"example":"/pts/curations","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["news.pts.org.tw/curations","news.pts.org.tw/"]}],"name":"專題策展","maintainers":["nczitzk"],"url":"news.pts.org.tw/curations","location":"curations.ts"}' />

## 共同网 <Site url="china.kyodonews.net"/>

### 最新报道 <Site url="china.kyodonews.net" size="sm" />

<Route namespace="kyodonews" :data='{"path":"/:language?/:keyword?","categories":["traditional-media"],"example":"/kyodonews","parameters":{"language":"语言: `china` = 简体中文 (默认), `tchina` = 繁體中文","keyword":"关键词"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"最新报道","maintainers":["Rongronggg9"],"description":"`keyword` 为关键词，由于共同网有许多关键词并不在主页列出，此处不一一列举，可从关键词页的 URL 的最后一级路径中提取。如 `日中关系` 的关键词页 URL 为 `https://china.kyodonews.net/news/japan-china_relationship`, 则将 `japan-china_relationship` 填入 `keyword`。特别地，当填入 `rss` 时，将从共同网官方 RSS 中抓取文章；略去时，将从首页抓取最新报道 (注意：首页更新可能比官方 RSS 稍慢)。","location":"index.ts"}' />

`keyword` 为关键词，由于共同网有许多关键词并不在主页列出，此处不一一列举，可从关键词页的 URL 的最后一级路径中提取。如 `日中关系` 的关键词页 URL 为 `https://china.kyodonews.net/news/japan-china_relationship`, 则将 `japan-china_relationship` 填入 `keyword`。特别地，当填入 `rss` 时，将从共同网官方 RSS 中抓取文章；略去时，将从首页抓取最新报道 (注意：首页更新可能比官方 RSS 稍慢)。

## 广州日报 <Site url="gzdaily.cn"/>

### 客户端 <Site url="gzdaily.cn" size="sm" />

<Route namespace="gzdaily" :data='{"path":"/app/:column?","categories":["traditional-media"],"example":"/gzdaily/app/74","parameters":{"column":"栏目 ID，点击对应栏目后在地址栏找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"客户端","maintainers":["TimWu007"],"description":":::tip\n  在北京时间深夜可能无法获取内容。\n  :::\n\n  常用栏目 ID：\n\n  | 栏目名 | ID   |\n  | ------ | ---- |\n  | 首页   | 74   |\n  | 时局   | 374  |\n  | 广州   | 371  |\n  | 大湾区 | 397  |\n  | 城区   | 2980 |","location":"app.ts"}' />

:::tip
  在北京时间深夜可能无法获取内容。
  :::

  常用栏目 ID：

  | 栏目名 | ID   |
  | ------ | ---- |
  | 首页   | 74   |
  | 时局   | 374  |
  | 广州   | 371  |
  | 大湾区 | 397  |
  | 城区   | 2980 |

## 河北网络广播电视台 <Site url="web.cmc.hebtv.com"/>

### 农博士在行动 <Site url="web.cmc.hebtv.com/cms/rmt0336/19/19js/st/ds/nmpd/nbszxd/index.shtml" size="sm" />

<Route namespace="hebtv" :data='{"path":"/nbszxd","categories":["traditional-media"],"example":"/hebtv/nbszxd","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":true,"supportPodcast":true,"supportScihub":false},"radar":[{"source":["web.cmc.hebtv.com/cms/rmt0336/19/19js/st/ds/nmpd/nbszxd/index.shtml"]}],"name":"农博士在行动","maintainers":["iamqiz","nczitzk"],"url":"web.cmc.hebtv.com/cms/rmt0336/19/19js/st/ds/nmpd/nbszxd/index.shtml","location":"nong-bo-shi-zai-xing-dong.ts"}' />

## 湖南日报 <Site url="voc.com.cn"/>

### 电子刊物 <Site url="voc.com.cn/" size="sm" />

<Route namespace="hnrb" :data='{"path":"/:id?","categories":["traditional-media"],"example":"/hnrb","parameters":{"id":"编号，见下表，默认为全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["voc.com.cn/"],"target":"/:id"}],"name":"电子刊物","maintainers":["nczitzk"],"url":"voc.com.cn/","description":"| 版                   | 编号 |\n  | -------------------- | ---- |\n  | 全部                 |      |\n  | 第 01 版：头版       | 1    |\n  | 第 02 版：要闻       | 2    |\n  | 第 03 版：要闻       | 3    |\n  | 第 04 版：深度       | 4    |\n  | 第 05 版：市州       | 5    |\n  | 第 06 版：理论・学习 | 6    |\n  | 第 07 版：观察       | 7    |\n  | 第 08 版：时事       | 8    |\n  | 第 09 版：中缝       | 9    |","location":"index.ts"}' />

| 版                   | 编号 |
  | -------------------- | ---- |
  | 全部                 |      |
  | 第 01 版：头版       | 1    |
  | 第 02 版：要闻       | 2    |
  | 第 03 版：要闻       | 3    |
  | 第 04 版：深度       | 4    |
  | 第 05 版：市州       | 5    |
  | 第 06 版：理论・学习 | 6    |
  | 第 07 版：观察       | 7    |
  | 第 08 版：时事       | 8    |
  | 第 09 版：中缝       | 9    |

## 华尔街见闻 <Site url="wallstreetcn.com"/>

### Unknown <Site url="wallstreetcn.com" size="sm" />

<Route namespace="wallstreetcn" :data='{"path":["/news/:category?","/:category?"],"radar":[{"source":["wallstreetcn.com/news/:category","wallstreetcn.com/"]}],"name":"Unknown","maintainers":["nczitzk"],"description":"| id           | 分类 |\n  | ------------ | ---- |\n  | global       | 最新 |\n  | shares       | 股市 |\n  | bonds        | 债市 |\n  | commodities  | 商品 |\n  | forex        | 外汇 |\n  | enterprise   | 公司 |\n  | asset-manage | 资管 |\n  | tmt          | 科技 |\n  | estate       | 地产 |\n  | car          | 汽车 |\n  | medicine     | 医药 |","location":"news.ts"}' />

| id           | 分类 |
  | ------------ | ---- |
  | global       | 最新 |
  | shares       | 股市 |
  | bonds        | 债市 |
  | commodities  | 商品 |
  | forex        | 外汇 |
  | enterprise   | 公司 |
  | asset-manage | 资管 |
  | tmt          | 科技 |
  | estate       | 地产 |
  | car          | 汽车 |
  | medicine     | 医药 |

### Unknown <Site url="wallstreetcn.com" size="sm" />

<Route namespace="wallstreetcn" :data='{"path":["/news/:category?","/:category?"],"radar":[{"source":["wallstreetcn.com/news/:category","wallstreetcn.com/"]}],"name":"Unknown","maintainers":["nczitzk"],"description":"| id           | 分类 |\n  | ------------ | ---- |\n  | global       | 最新 |\n  | shares       | 股市 |\n  | bonds        | 债市 |\n  | commodities  | 商品 |\n  | forex        | 外汇 |\n  | enterprise   | 公司 |\n  | asset-manage | 资管 |\n  | tmt          | 科技 |\n  | estate       | 地产 |\n  | car          | 汽车 |\n  | medicine     | 医药 |","location":"news.ts"}' />

| id           | 分类 |
  | ------------ | ---- |
  | global       | 最新 |
  | shares       | 股市 |
  | bonds        | 债市 |
  | commodities  | 商品 |
  | forex        | 外汇 |
  | enterprise   | 公司 |
  | asset-manage | 资管 |
  | tmt          | 科技 |
  | estate       | 地产 |
  | car          | 汽车 |
  | medicine     | 医药 |

### 实时快讯 <Site url="wallstreetcn.com" size="sm" />

<Route namespace="wallstreetcn" :data='{"path":"/live/:category?/:score?","categories":["traditional-media"],"example":"/wallstreetcn/live","parameters":{"category":"快讯分类，默认`global`，见下表","score":"快讯重要度，默认`1`全部快讯，可设置为`2`只看重要的"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["wallstreetcn.com/live/:category","wallstreetcn.com/"],"target":"/live/:category?"}],"name":"实时快讯","maintainers":["nczitzk"],"description":"| 要闻   | A 股    | 美股     | 港股     | 外汇  | 商品      | 理财      |\n  | ------ | ------- | -------- | -------- | ----- | --------- | --------- |\n  | global | a-stock | us-stock | hk-stock | forex | commodity | financing |","location":"live.ts"}' />

| 要闻   | A 股    | 美股     | 港股     | 外汇  | 商品      | 理财      |
  | ------ | ------- | -------- | -------- | ----- | --------- | --------- |
  | global | a-stock | us-stock | hk-stock | forex | commodity | financing |

### 最热文章 <Site url="wallstreetcn.com/" size="sm" />

<Route namespace="wallstreetcn" :data='{"path":"/hot/:period?","categories":["traditional-media"],"example":"/wallstreetcn/hot","parameters":{"period":"时期，可选 `day` 即 当日 或 `week` 即 当周，默认为当日"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["wallstreetcn.com/"]}],"name":"最热文章","maintainers":["nczitzk"],"url":"wallstreetcn.com/","location":"hot.ts"}' />

## 華視 <Site url="news.cts.com.tw"/>

### 新聞 <Site url="news.cts.com.tw" size="sm" />

<Route namespace="cts" :data='{"path":"/:category","categories":["traditional-media"],"example":"/cts/real","parameters":{"category":"类别"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["news.cts.com.tw/:category/index.html"]}],"name":"新聞","maintainers":["miles170"],"description":"| 即時 | 氣象    | 政治     | 國際          | 社會    | 運動   | 生活 | 財經  | 台語      | 地方  | 產業 | 綜合    | 藝文 | 娛樂      |\n  | ---- | ------- | -------- | ------------- | ------- | ------ | ---- | ----- | --------- | ----- | ---- | ------- | ---- | --------- |\n  | real | weather | politics | international | society | sports | life | money | taiwanese | local | pr   | general | arts | entertain |","location":"news.ts"}' />

| 即時 | 氣象    | 政治     | 國際          | 社會    | 運動   | 生活 | 財經  | 台語      | 地方  | 產業 | 綜合    | 藝文 | 娛樂      |
  | ---- | ------- | -------- | ------------- | ------- | ------ | ---- | ----- | --------- | ----- | ---- | ------- | ---- | --------- |
  | real | weather | politics | international | society | sports | life | money | taiwanese | local | pr   | general | arts | entertain |

## 环球网 <Site url="huanqiu.com"/>

### 分类 <Site url="huanqiu.com/" size="sm" />

<Route namespace="huanqiu" :data='{"path":"/news/:category?","categories":["traditional-media"],"example":"/huanqiu/news/china","parameters":{"category":"类别，可以使用二级域名作为参数，默认为：china"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["huanqiu.com/"]}],"name":"分类","maintainers":["yuxinliu-alex"],"url":"huanqiu.com/","description":"| 国内新闻 | 国际新闻 | 军事 | 台海   | 评论    |\n  | -------- | -------- | ---- | ------ | ------- |\n  | china    | world    | mil  | taiwai | opinion |","location":"index.ts"}' />

| 国内新闻 | 国际新闻 | 军事 | 台海   | 评论    |
  | -------- | -------- | ---- | ------ | ------- |
  | china    | world    | mil  | taiwai | opinion |

## 客家電視台 <Site url="hakkatv.org.tw"/>

### 新聞首頁 <Site url="hakkatv.org.tw/news" size="sm" />

<Route namespace="hakkatv" :data='{"path":"/news/:type?","categories":["traditional-media"],"example":"/hakkatv/news","parameters":{"type":"新聞，見下表，留空為全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["hakkatv.org.tw/news"],"target":"/news"}],"name":"新聞首頁","maintainers":["TonyRL"],"url":"hakkatv.org.tw/news","description":"| 客家焦點 | 政經要聞  | 民生醫療 | 地方風采 | 國際萬象      |\n  | -------- | --------- | -------- | -------- | ------------- |\n  | hakka    | political | medical  | local    | international |","location":"type.ts"}' />

| 客家焦點 | 政經要聞  | 民生醫療 | 地方風采 | 國際萬象      |
  | -------- | --------- | -------- | -------- | ------------- |
  | hakka    | political | medical  | local    | international |

## 理论网 <Site url="paper.cntheory.com"/>

### 学习时报 <Site url="paper.cntheory.com" size="sm" />

<Route namespace="cntheory" :data='{"path":"/paper/:id?","categories":["traditional-media"],"example":"/cntheory/paper","parameters":{"id":"板块，默认为全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"学习时报","maintainers":["nczitzk"],"description":"如订阅 **第 A1 版：国内大局**，路由为 [`/cntheory/paper/国内大局`](https://rsshub.app/cntheory/paper/国内大局)。","location":"paper.ts"}' />

如订阅 **第 A1 版：国内大局**，路由为 [`/cntheory/paper/国内大局`](https://rsshub.app/cntheory/paper/国内大局)。

## 联合早报 <Site url="www.zaobao.com"/>

:::warning
由于 [RSSHub#10309](https://github.com/DIYgod/RSSHub/issues/10309) 中的问题，使用靠近香港的服务器部署将从 hk 版联合早报爬取内容，造成输出的新闻段落顺序错乱。如有订阅此源的需求，建议寻求部署在远离香港的服务器上的 RSSHub，或者在自建时选择远离香港的服务器。
:::

### 互动新闻 <Site url="www.zaobao.com" size="sm" />

<Route namespace="zaobao" :data='{"path":"/interactive-graphics","categories":["traditional-media"],"example":"/zaobao/interactive-graphics","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"互动新闻","maintainers":["shunf4"],"location":"interactive.ts"}' />

### 即时新闻 <Site url="www.zaobao.com" size="sm" />

<Route namespace="zaobao" :data='{"path":"/realtime/:section?","categories":["traditional-media"],"example":"/zaobao/realtime/china","parameters":{"section":"分类，缺省为 china"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"即时新闻","maintainers":["shunf4"],"description":"| 中国  | 新加坡    | 国际  | 财经     |\n  | ----- | --------- | ----- | -------- |\n  | china | singapore | world | zfinance |","location":"realtime.ts"}' />

| 中国  | 新加坡    | 国际  | 财经     |
  | ----- | --------- | ----- | -------- |
  | china | singapore | world | zfinance |

### 其他栏目 <Site url="www.zaobao.com" size="sm" />

<Route namespace="zaobao" :data='{"path":"/:type?/:section?","categories":["traditional-media"],"example":"/zaobao/lifestyle/health","parameters":{"type":"https://www.zaobao.com/**lifestyle**/health 中的 **lifestyle**","section":"https://www.zaobao.com/lifestyle/**health** 中的 **health**"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"其他栏目","maintainers":["shunf4"],"description":"除了上面两个兼容规则之外，联合早报网站里所有页面形如 [https://www.zaobao.com/lifestyle/health](https://www.zaobao.com/lifestyle/health) 这样的栏目都能被这个规则解析到，早报的大部分栏目都是这个样式的。你可以测试之后再订阅。","location":"index.ts"}' />

除了上面两个兼容规则之外，联合早报网站里所有页面形如 [https://www.zaobao.com/lifestyle/health](https://www.zaobao.com/lifestyle/health) 这样的栏目都能被这个规则解析到，早报的大部分栏目都是这个样式的。你可以测试之后再订阅。

### 新闻 <Site url="www.zaobao.com" size="sm" />

<Route namespace="zaobao" :data='{"path":"/znews/:section?","categories":["traditional-media"],"example":"/zaobao/znews/china","parameters":{"section":"分类，缺省为 china"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"新闻","maintainers":["shunf4"],"description":"| 中国  | 新加坡    | 东南亚 | 国际  | 体育   |\n  | ----- | --------- | ------ | ----- | ------ |\n  | china | singapore | sea    | world | sports |","location":"znews.ts"}' />

| 中国  | 新加坡    | 东南亚 | 国际  | 体育   |
  | ----- | --------- | ------ | ----- | ------ |
  | china | singapore | sea    | world | sports |

## 聯合新聞網 <Site url="udn.com"/>

### 即時新聞 <Site url="udn.com" size="sm" />

<Route namespace="udn" :data='{"path":"/news/breakingnews/:id","categories":["traditional-media"],"example":"/udn/news/breakingnews/99","parameters":{"id":"类别"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["udn.com/news/breaknews/1/:id","udn.com/"]}],"name":"即時新聞","maintainers":["miles170"],"description":"| 0    | 1    | 2    | 3    | 4    | 5    | 6    | 7    | 8    | 9    | 11   | 12   | 13   | 99     |\n  | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ------ |\n  | 精選 | 要聞 | 社會 | 地方 | 兩岸 | 國際 | 財經 | 運動 | 娛樂 | 生活 | 股市 | 文教 | 數位 | 不分類 |","location":"breaking-news.ts"}' />

| 0    | 1    | 2    | 3    | 4    | 5    | 6    | 7    | 8    | 9    | 11   | 12   | 13   | 99     |
  | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ------ |
  | 精選 | 要聞 | 社會 | 地方 | 兩岸 | 國際 | 財經 | 運動 | 娛樂 | 生活 | 股市 | 文教 | 數位 | 不分類 |

### 轉角國際 - 首頁 <Site url="udn.com" size="sm" />

<Route namespace="udn" :data='{"path":"/global/:category?","categories":["traditional-media"],"example":"/udn/global","parameters":{"category":"分类，见下表，默认为首頁"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["global.udn.com/global_vision/index/:category","global.udn.com/"]}],"name":"轉角國際 - 首頁","maintainers":["nczitzk"],"description":"| 首頁 | 最新文章 | 熱門文章 |\n  | ---- | -------- | -------- |\n  |      | new      | hot      |","location":"global/index.ts"}' />

| 首頁 | 最新文章 | 熱門文章 |
  | ---- | -------- | -------- |
  |      | new      | hot      |

### 轉角國際 - 標籤 <Site url="udn.com" size="sm" />

<Route namespace="udn" :data='{"path":"/global/tag/:tag?","categories":["traditional-media"],"example":"/udn/global/tag/過去24小時","parameters":{"tag":"标签，可在对应标签页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["global.udn.com/search/tagging/1020/:tag","global.udn.com/"]}],"name":"轉角國際 - 標籤","maintainers":["emdoe","nczitzk"],"description":"| 過去 24 小時 | 鏡頭背後 | 深度專欄 | 重磅廣播 |\n  | ------------ | -------- | -------- | -------- |","location":"global/tag.ts"}' />

| 過去 24 小時 | 鏡頭背後 | 深度專欄 | 重磅廣播 |
  | ------------ | -------- | -------- | -------- |

## 南方都市报 <Site url="oeeee.com"/>

### Unknown <Site url="oeeee.com" size="sm" />

<Route namespace="oeeee" :data='{"path":"/app/channel/:id","name":"Unknown","maintainers":["TimWu007"],"location":"app/channel.ts"}' />

### 奥一网 <Site url="oeeee.com" size="sm" />

<Route namespace="oeeee" :data='{"path":"/web/:channel","categories":["traditional-media"],"example":"/oeeee/web/170","parameters":{"channel":"频道 ID"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"奥一网","maintainers":["TimWu007"],"description":"-   若在桌面端打开奥一网栏目页（如 `https://www.oeeee.com/api/channel.php?s=/index/index/channel/gz`），可查看该页源代码，搜索 `OECID`。\n  -   若在移动端打开奥一网栏目页（格式例：`https://m.oeeee.com/m.php?s=/m2/channel&channel_id=169`），即可从 url 中获取。需注意的是，如果该栏目页的 url 格式为 `https://m.oeeee.com/detailChannel_indexData.html?channel_id=266` ，则 `266` 并非为本路由可用的频道 ID，建议从桌面端获取。","location":"web.ts"}' />

-   若在桌面端打开奥一网栏目页（如 `https://www.oeeee.com/api/channel.php?s=/index/index/channel/gz`），可查看该页源代码，搜索 `OECID`。
  -   若在移动端打开奥一网栏目页（格式例：`https://m.oeeee.com/m.php?s=/m2/channel&channel_id=169`），即可从 url 中获取。需注意的是，如果该栏目页的 url 格式为 `https://m.oeeee.com/detailChannel_indexData.html?channel_id=266` ，则 `266` 并非为本路由可用的频道 ID，建议从桌面端获取。

### 南都客户端（按记者） <Site url="oeeee.com" size="sm" />

<Route namespace="oeeee" :data='{"path":"/app/reporter/:id","categories":["traditional-media"],"example":"/oeeee/app/reporter/249","parameters":{"id":"记者 UID"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"南都客户端（按记者）","maintainers":["TimWu007"],"description":"记者的 UID 可通过 `m.mp.oeeee.com` 下的文章页面获取。点击文章下方的作者头像，进入该作者的个人主页，即可从 url 中获取。","location":"app/reporter.ts"}' />

记者的 UID 可通过 `m.mp.oeeee.com` 下的文章页面获取。点击文章下方的作者头像，进入该作者的个人主页，即可从 url 中获取。

## 南方网 <Site url="nfapp.southcn.com"/>

### 南方 +（按栏目 ID） <Site url="nfapp.southcn.com" size="sm" />

<Route namespace="southcn" :data='{"path":"/nfapp/column/:column?","categories":["traditional-media"],"example":"/southcn/nfapp/column/38","parameters":{"column":"栏目或南方号 ID"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"南方 +（按栏目 ID）","maintainers":["TimWu007"],"description":":::tip\n  若此处输入的是栏目 ID（而非南方号 ID），则该接口会返回与输入栏目相关联栏目的文章。例如，输入栏目 ID `38`（广州），则返回的结果还会包含 ID 为 `3547`（市长报道集）的文章。\n  :::\n\n  1.  `pc.nfapp.southcn.com` 下的文章页面，可通过 url 查看，例：`http://pc.nfapp.southcn.com/13707/7491109.html` 的栏目 ID 为 `13707`。\n  2.  `static.nfapp.southcn.com` 下的文章页面，可查看网页源代码，搜索 `columnid`。\n  3.  [https://m.nfapp.southcn.com/column/all](https://m.nfapp.southcn.com/column/all) 列出了部分栏目，`id` 即为栏目 ID。","location":"nfapp/column.ts"}' />

:::tip
  若此处输入的是栏目 ID（而非南方号 ID），则该接口会返回与输入栏目相关联栏目的文章。例如，输入栏目 ID `38`（广州），则返回的结果还会包含 ID 为 `3547`（市长报道集）的文章。
  :::

  1.  `pc.nfapp.southcn.com` 下的文章页面，可通过 url 查看，例：`http://pc.nfapp.southcn.com/13707/7491109.html` 的栏目 ID 为 `13707`。
  2.  `static.nfapp.southcn.com` 下的文章页面，可查看网页源代码，搜索 `columnid`。
  3.  [https://m.nfapp.southcn.com/column/all](https://m.nfapp.southcn.com/column/all) 列出了部分栏目，`id` 即为栏目 ID。

### 南方 +（按作者） <Site url="nfapp.southcn.com" size="sm" />

<Route namespace="southcn" :data='{"path":"/nfapp/reporter/:reporter","categories":["traditional-media"],"example":"/southcn/nfapp/reporter/969927791","parameters":{"reporter":"作者 UUID"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"南方 +（按作者）","maintainers":["TimWu007"],"description":"作者的 UUID 只可通过 `static.nfapp.southcn.com` 下的文章页面获取。点击文章下方的作者介绍，进入该作者的个人主页，即可从 url 中获取。","location":"nfapp/reporter.ts"}' />

作者的 UUID 只可通过 `static.nfapp.southcn.com` 下的文章页面获取。点击文章下方的作者介绍，进入该作者的个人主页，即可从 url 中获取。

## 内蒙古广播电视台 <Site url="nmtv.cn"/>

### 点播 <Site url="nmtv.cn" size="sm" />

<Route namespace="nmtv" :data='{"path":"/column/:id?","categories":["traditional-media"],"example":"/nmtv/column/877","parameters":{"id":"栏目 id，可在对应栏目 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"点播","maintainers":["nczitzk"],"description":":::tip\n  如 [蒙古语卫视新闻联播](http://www.nmtv.cn/folder292/folder663/folder301/folder830/folder877) 的 URL 为 `http://www.nmtv.cn/folder292/folder663/folder301/folder830/folder877`，其栏目 id 为末尾数字编号，即 `877`。可以得到其对应路由为 [`/nmtv/column/877`](https://rsshub.app/nmtv/column/877)\n  :::","location":"column.ts"}' />

:::tip
  如 [蒙古语卫视新闻联播](http://www.nmtv.cn/folder292/folder663/folder301/folder830/folder877) 的 URL 为 `http://www.nmtv.cn/folder292/folder663/folder301/folder830/folder877`，其栏目 id 为末尾数字编号，即 `877`。可以得到其对应路由为 [`/nmtv/column/877`](https://rsshub.app/nmtv/column/877)
  :::

## 澎湃新闻 <Site url="thepaper.cn"/>

以下所有路由可使用参数`old`以采取旧全文获取方法。该方法会另外获取网页中的图片与视频资源。在原始 url 追加`?old=yes`以启用.

### Unknown <Site url="thepaper.cn/" size="sm" />

<Route namespace="thepaper" :data='{"path":"/sidebar/:sec?","radar":[{"source":["thepaper.cn/"],"target":"/sidebar"}],"name":"Unknown","maintainers":["bigfei"],"url":"thepaper.cn/","location":"sidebar.ts"}' />

### Unknown <Site url="thepaper.cn/" size="sm" />

<Route namespace="thepaper" :data='{"path":"/839studio/:id","radar":[{"source":["thepaper.cn/"]}],"name":"Unknown","maintainers":["umm233"],"url":"thepaper.cn/","location":"839studio/category.ts"}' />

### Unknown <Site url="thepaper.cn" size="sm" />

<Route namespace="thepaper" :data='{"path":"/839studio","name":"Unknown","maintainers":["umm233"],"location":"839studio/studio.ts"}' />

### 栏目 <Site url="thepaper.cn" size="sm" />

<Route namespace="thepaper" :data='{"path":"/list/:id","categories":["traditional-media"],"example":"/thepaper/list/25457","parameters":{"id":"栏目 id，可在栏目页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"栏目","maintainers":["nczitzk","bigfei"],"description":"| 栏目 ID | 栏目名       |\n  | ------- | ------------ |\n  | 26912   | 上直播       |\n  | 26913   | 七环视频     |\n  | 26965   | 温度计       |\n  | 26908   | 一级视场     |\n  | 27260   | World 湃     |\n  | 26907   | 湃客科技     |\n  | 33168   | 纪录湃       |\n  | 26911   | 围观         |\n  | 26918   | @所有人      |\n  | 26906   | 大都会       |\n  | 26909   | 追光灯       |\n  | 26910   | 运动装       |\n  | 26914   | 健寻记       |\n  | 82188   | AI 播报      |\n  | 89035   | 眼界         |\n  | 92278   | 关键帧       |\n  | 90069   | 战疫         |\n  | 25462   | 中国政库     |\n  | 25488   | 中南海       |\n  | 97924   | 初心之路     |\n  | 25489   | 舆论场       |\n  | 25490   | 打虎记       |\n  | 25423   | 人事风向     |\n  | 25426   | 法治中国     |\n  | 25424   | 一号专案     |\n  | 25463   | 港台来信     |\n  | 25491   | 长三角政商   |\n  | 25428   | 直击现场     |\n  | 68750   | 公益湃       |\n  | 27604   | 暖闻         |\n  | 25464   | 澎湃质量报告 |\n  | 25425   | 绿政公署     |\n  | 25429   | 澎湃国际     |\n  | 25481   | 外交学人     |\n  | 25430   | 澎湃防务     |\n  | 25678   | 唐人街       |\n  | 25427   | 澎湃人物     |\n  | 25422   | 浦江头条     |\n  | 25487   | 教育家       |\n  | 25634   | 全景现场     |\n  | 25635   | 美数课       |\n  | 25600   | 快看         |\n  | 25434   | 10% 公司     |\n  | 25436   | 能见度       |\n  | 25433   | 地产界       |\n  | 25438   | 财经上下游   |\n  | 25435   | 金改实验室   |\n  | 25437   | 牛市点线面   |\n  | 119963  | IPO 最前线   |\n  | 25485   | 澎湃商学院   |\n  | 25432   | 自贸区连线   |\n  | 37978   | 进博会在线   |\n  | 36079   | 湃客         |\n  | 27392   | 政务         |\n  | 77286   | 媒体         |\n  | 27234   | 科学湃       |\n  | 119445  | 生命科学     |\n  | 119447  | 未来 2%      |\n  | 119446  | 元宇宙观察   |\n  | 119448  | 科创 101     |\n  | 119449  | 科学城邦     |\n  | 25444   | 社论         |\n  | 27224   | 澎湃评论     |\n  | 26525   | 思想湃       |\n  | 26878   | 上海书评     |\n  | 25483   | 思想市场     |\n  | 25457   | 私家历史     |\n  | 25574   | 翻书党       |\n  | 25455   | 艺术评论     |\n  | 26937   | 古代艺术     |\n  | 25450   | 文化课       |\n  | 25482   | 逝者         |\n  | 25536   | 专栏         |\n  | 26506   | 异次元       |\n  | 97313   | 海平面       |\n  | 103076  | 一问三知     |\n  | 25445   | 澎湃研究所   |\n  | 25446   | 全球智库     |\n  | 26915   | 城市漫步     |\n  | 25456   | 市政厅       |\n  | 104191  | 世界会客厅   |\n  | 25448   | 有戏         |\n  | 26609   | 文艺范       |\n  | 25942   | 身体         |\n  | 26015   | 私・奔       |\n  | 25599   | 运动家       |\n  | 25842   | 私家地理     |\n  | 80623   | 非常品       |\n  | 26862   | 楼市         |\n  | 25769   | 生活方式     |\n  | 25990   | 澎湃联播     |\n  | 26173   | 视界         |\n  | 26202   | 亲子学堂     |\n  | 26404   | 赢家         |\n  | 26490   | 汽车圈       |\n  | 115327  | IP SH        |\n  | 117340  | 酒业         |","location":"list.ts"}' />

| 栏目 ID | 栏目名       |
  | ------- | ------------ |
  | 26912   | 上直播       |
  | 26913   | 七环视频     |
  | 26965   | 温度计       |
  | 26908   | 一级视场     |
  | 27260   | World 湃     |
  | 26907   | 湃客科技     |
  | 33168   | 纪录湃       |
  | 26911   | 围观         |
  | 26918   | @所有人      |
  | 26906   | 大都会       |
  | 26909   | 追光灯       |
  | 26910   | 运动装       |
  | 26914   | 健寻记       |
  | 82188   | AI 播报      |
  | 89035   | 眼界         |
  | 92278   | 关键帧       |
  | 90069   | 战疫         |
  | 25462   | 中国政库     |
  | 25488   | 中南海       |
  | 97924   | 初心之路     |
  | 25489   | 舆论场       |
  | 25490   | 打虎记       |
  | 25423   | 人事风向     |
  | 25426   | 法治中国     |
  | 25424   | 一号专案     |
  | 25463   | 港台来信     |
  | 25491   | 长三角政商   |
  | 25428   | 直击现场     |
  | 68750   | 公益湃       |
  | 27604   | 暖闻         |
  | 25464   | 澎湃质量报告 |
  | 25425   | 绿政公署     |
  | 25429   | 澎湃国际     |
  | 25481   | 外交学人     |
  | 25430   | 澎湃防务     |
  | 25678   | 唐人街       |
  | 25427   | 澎湃人物     |
  | 25422   | 浦江头条     |
  | 25487   | 教育家       |
  | 25634   | 全景现场     |
  | 25635   | 美数课       |
  | 25600   | 快看         |
  | 25434   | 10% 公司     |
  | 25436   | 能见度       |
  | 25433   | 地产界       |
  | 25438   | 财经上下游   |
  | 25435   | 金改实验室   |
  | 25437   | 牛市点线面   |
  | 119963  | IPO 最前线   |
  | 25485   | 澎湃商学院   |
  | 25432   | 自贸区连线   |
  | 37978   | 进博会在线   |
  | 36079   | 湃客         |
  | 27392   | 政务         |
  | 77286   | 媒体         |
  | 27234   | 科学湃       |
  | 119445  | 生命科学     |
  | 119447  | 未来 2%      |
  | 119446  | 元宇宙观察   |
  | 119448  | 科创 101     |
  | 119449  | 科学城邦     |
  | 25444   | 社论         |
  | 27224   | 澎湃评论     |
  | 26525   | 思想湃       |
  | 26878   | 上海书评     |
  | 25483   | 思想市场     |
  | 25457   | 私家历史     |
  | 25574   | 翻书党       |
  | 25455   | 艺术评论     |
  | 26937   | 古代艺术     |
  | 25450   | 文化课       |
  | 25482   | 逝者         |
  | 25536   | 专栏         |
  | 26506   | 异次元       |
  | 97313   | 海平面       |
  | 103076  | 一问三知     |
  | 25445   | 澎湃研究所   |
  | 25446   | 全球智库     |
  | 26915   | 城市漫步     |
  | 25456   | 市政厅       |
  | 104191  | 世界会客厅   |
  | 25448   | 有戏         |
  | 26609   | 文艺范       |
  | 25942   | 身体         |
  | 26015   | 私・奔       |
  | 25599   | 运动家       |
  | 25842   | 私家地理     |
  | 80623   | 非常品       |
  | 26862   | 楼市         |
  | 25769   | 生活方式     |
  | 25990   | 澎湃联播     |
  | 26173   | 视界         |
  | 26202   | 亲子学堂     |
  | 26404   | 赢家         |
  | 26490   | 汽车圈       |
  | 115327  | IP SH        |
  | 117340  | 酒业         |

### 明查 <Site url="factpaper.cn/" size="sm" />

<Route namespace="thepaper" :data='{"path":"/factpaper/:status?","categories":["traditional-media"],"example":"/thepaper/factpaper","parameters":{"status":"状态 id，可选 `1` 即 有定论 或 `0` 即 核查中，默认为 `1`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["factpaper.cn/"],"target":"/factpaper/:status"}],"name":"明查","maintainers":["nczitzk"],"url":"factpaper.cn/","location":"factpaper.ts"}' />

### 频道 <Site url="thepaper.cn" size="sm" />

<Route namespace="thepaper" :data='{"path":"/channel/:id","categories":["traditional-media"],"example":"/thepaper/channel/25950","parameters":{"id":"频道 id，可在频道页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"频道","maintainers":["xyqfer","nczitzk","bigfei"],"description":"| 频道 ID | 频道名 |\n  | ------- | ------ |\n  | 26916   | 视频   |\n  | 108856  | 战疫   |\n  | 25950   | 时事   |\n  | 25951   | 财经   |\n  | 36079   | 澎湃号 |\n  | 119908  | 科技   |\n  | 25952   | 思想   |\n  | 119489  | 智库   |\n  | 25953   | 生活   |\n  | 26161   | 问吧   |\n  | 122908  | 国际   |\n  | -21     | 体育   |\n  | -24     | 评论   |","location":"channel.ts"}' />

| 频道 ID | 频道名 |
  | ------- | ------ |
  | 26916   | 视频   |
  | 108856  | 战疫   |
  | 25950   | 时事   |
  | 25951   | 财经   |
  | 36079   | 澎湃号 |
  | 119908  | 科技   |
  | 25952   | 思想   |
  | 119489  | 智库   |
  | 25953   | 生活   |
  | 26161   | 问吧   |
  | 122908  | 国际   |
  | -21     | 体育   |
  | -24     | 评论   |

### 首页头条 <Site url="thepaper.cn/" size="sm" />

<Route namespace="thepaper" :data='{"path":"/featured","categories":["traditional-media"],"example":"/thepaper/featured","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["thepaper.cn/"]}],"name":"首页头条","maintainers":["HenryQW","nczitzk","bigfei"],"url":"thepaper.cn/","location":"featured.ts"}' />

## 人民网 <Site url="people.com.cn"/>

### Unknown <Site url="people.com.cn" size="sm" />

<Route namespace="people" :data='{"path":"/:site?/:category{.+}?","name":"Unknown","maintainers":[],"location":"index.ts"}' />

### 领导留言板 <Site url="liuyan.people.com.cn/" size="sm" />

<Route namespace="people" :data='{"path":"/liuyan/:id/:state?","categories":["traditional-media"],"example":"/people/liuyan/539","parameters":{"id":"编号，可在对应人物页 URL 中找到","state":"状态，见下表，默认为全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["liuyan.people.com.cn/"]}],"name":"领导留言板","maintainers":["nczitzk"],"url":"liuyan.people.com.cn/","description":"| 全部 | 待回复 | 办理中 | 已办理 |\n  | ---- | ------ | ------ | ------ |\n  | 1    | 2      | 3      | 4      |","location":"liuyan.ts"}' />

| 全部 | 待回复 | 办理中 | 已办理 |
  | ---- | ------ | ------ | ------ |
  | 1    | 2      | 3      | 4      |

### 习近平系列重要讲话 <Site url="people.com.cn/" size="sm" />

<Route namespace="people" :data='{"path":"/xjpjh/:keyword?/:year?","categories":["traditional-media"],"example":"/people/xjpjh","parameters":{"keyword":"关键词，默认不填","year":"年份，默认 all"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["people.com.cn/"],"target":"/:site?/:category?"}],"name":"习近平系列重要讲话","maintainers":[],"url":"people.com.cn/","location":"xjpjh.ts"}' />

## 三立新聞網 <Site url="setn.com"/>

### 新聞 <Site url="setn.com/ViewAll.aspx" size="sm" />

<Route namespace="setn" :data='{"path":"/:category?","categories":["traditional-media"],"example":"/setn","parameters":{"category":"分类，见下表，默认为即時"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["setn.com/ViewAll.aspx","setn.com/"],"target":""}],"name":"新聞","maintainers":["nczitzk"],"url":"setn.com/ViewAll.aspx","description":"| 即時 | 熱門 | 娛樂 | 政治 | 社會 |\n  | ---- | ---- | ---- | ---- | ---- |\n\n  | 國際 | 兩岸 | 生活 | 健康 | 旅遊 |\n  | ---- | ---- | ---- | ---- | ---- |\n\n  | 運動 | 地方 | 財經 | 富房網 | 名家 |\n  | ---- | ---- | ---- | ------ | ---- |\n\n  | 新奇 | 科技 | 汽車 | 寵物 | 女孩 | HOT 焦點 |\n  | ---- | ---- | ---- | ---- | ---- | -------- |","location":"index.ts"}' />

| 即時 | 熱門 | 娛樂 | 政治 | 社會 |
  | ---- | ---- | ---- | ---- | ---- |

  | 國際 | 兩岸 | 生活 | 健康 | 旅遊 |
  | ---- | ---- | ---- | ---- | ---- |

  | 運動 | 地方 | 財經 | 富房網 | 名家 |
  | ---- | ---- | ---- | ------ | ---- |

  | 新奇 | 科技 | 汽車 | 寵物 | 女孩 | HOT 焦點 |
  | ---- | ---- | ---- | ---- | ---- | -------- |

## 厦门网 <Site url="epaper.xmnn.cn"/>

### Unknown <Site url="epaper.xmnn.cn" size="sm" />

<Route namespace="xmnn" :data='{"path":"/news/:category{.+}?","name":"Unknown","maintainers":[],"location":"news.ts"}' />

### 数字媒体 <Site url="epaper.xmnn.cn" size="sm" />

<Route namespace="xmnn" :data='{"path":"/epaper/:id?","categories":["traditional-media"],"example":"/xmnn/epaper/xmrb","parameters":{"id":"报纸 id，见下表，默认为 `xmrb`，即厦门日报"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["epaper.xmnn.cn/:id"],"target":"/epaper/:id"}],"name":"数字媒体","maintainers":["nczitzk"],"description":"| 厦门日报 | 厦门晚报 | 海西晨报 | 城市捷报 |\n  | -------- | -------- | -------- | -------- |\n  | xmrb     | xmwb     | hxcb     | csjb     |","location":"epaper.ts"}' />

| 厦门日报 | 厦门晚报 | 海西晨报 | 城市捷报 |
  | -------- | -------- | -------- | -------- |
  | xmrb     | xmwb     | hxcb     | csjb     |

## 四川广播电视台 <Site url="sctv.com"/>

### 电视回放 <Site url="sctv.com" size="sm" />

<Route namespace="sctv" :data='{"path":"/programme/:id?/:limit?/:isFull?","categories":["traditional-media"],"example":"/sctv/programme/1","parameters":{"id":"节目 id，可在对应节目页中找到，默认为 `1`，即四川新闻联播","limit":"期数，默认为 15，即单次获取最新 15 期","isFull":"是否仅获取完整视频，填写 true/yes 表示是、false/no 表示否，默认是"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"电视回放","maintainers":["nczitzk"],"description":":::tip\n  参数 **是否仅获取完整视频** 设置为 `true` `yes` `t` `y` 等值后，路由仅返回当期节目的完整视频，而不会返回节目所提供的节选视频。\n\n  查看更多电视节目请前往 [电视回放](https://www.sctv.com/column/list)\n  :::\n\n  | 节目                   | id      |\n  | ---------------------- | ------- |\n  | 四川新闻联播           | 1       |\n  | 早安四川               | 2       |\n  | 今日视点               | 3       |\n  | 龙门阵摆四川           | 10523   |\n  | 非常话题               | 1014756 |\n  | 新闻现场               | 8385    |\n  | 黄金三十分             | 8386    |\n  | 全媒直播间             | 8434    |\n  | 晚报十点半             | 8435    |\n  | 现场快报               | 8436    |\n  | 四川乡村新闻           | 3673    |\n  | 四川文旅报道           | 8174    |\n  | 乡村会客厅             | 3674    |\n  | 金字招牌               | 3675    |\n  | 问您所 “？”            | 3677    |\n  | 蜀你最能               | 3679    |\n  | 美丽乡村印象           | 3678    |\n  | 美丽乡村               | 3676    |\n  | 乡村大篷车             | 3680    |\n  | 华西论健               | 3681    |\n  | 乡村聚乐部             | 3682    |\n  | 医保近距离             | 6403    |\n  | 音你而来               | 7263    |\n  | 吃八方                 | 7343    |\n  | 世界那么大             | 7344    |\n  | 风云川商               | 7345    |\n  | 麻辣烫                 | 7346    |\n  | 财经快报               | 7473    |\n  | 医生来了               | 7873    |\n  | 安逸的旅途             | 8383    |\n  | 运动 +                 | 8433    |\n  | 好戏连台               | 9733    |\n  | 防癌大讲堂             | 1018673 |\n  | 消费新观察             | 1017153 |\n  | 天天耍大牌             | 1014753 |\n  | 廉洁四川               | 1014754 |\n  | 看世界                 | 1014755 |\n  | 金熊猫说教育（资讯版） | 1014757 |\n  | 她说                   | 1014759 |\n  | 嗨宝贝                 | 1014762 |\n  | 萌眼看世界             | 1014764 |\n  | 乡村大讲堂             | 1014765 |\n  | 四川党建               | 1014766 |\n  | 健康四川               | 1014767 |\n  | 技能四川               | 12023   |","location":"programme.ts"}' />

:::tip
  参数 **是否仅获取完整视频** 设置为 `true` `yes` `t` `y` 等值后，路由仅返回当期节目的完整视频，而不会返回节目所提供的节选视频。

  查看更多电视节目请前往 [电视回放](https://www.sctv.com/column/list)
  :::

  | 节目                   | id      |
  | ---------------------- | ------- |
  | 四川新闻联播           | 1       |
  | 早安四川               | 2       |
  | 今日视点               | 3       |
  | 龙门阵摆四川           | 10523   |
  | 非常话题               | 1014756 |
  | 新闻现场               | 8385    |
  | 黄金三十分             | 8386    |
  | 全媒直播间             | 8434    |
  | 晚报十点半             | 8435    |
  | 现场快报               | 8436    |
  | 四川乡村新闻           | 3673    |
  | 四川文旅报道           | 8174    |
  | 乡村会客厅             | 3674    |
  | 金字招牌               | 3675    |
  | 问您所 “？”            | 3677    |
  | 蜀你最能               | 3679    |
  | 美丽乡村印象           | 3678    |
  | 美丽乡村               | 3676    |
  | 乡村大篷车             | 3680    |
  | 华西论健               | 3681    |
  | 乡村聚乐部             | 3682    |
  | 医保近距离             | 6403    |
  | 音你而来               | 7263    |
  | 吃八方                 | 7343    |
  | 世界那么大             | 7344    |
  | 风云川商               | 7345    |
  | 麻辣烫                 | 7346    |
  | 财经快报               | 7473    |
  | 医生来了               | 7873    |
  | 安逸的旅途             | 8383    |
  | 运动 +                 | 8433    |
  | 好戏连台               | 9733    |
  | 防癌大讲堂             | 1018673 |
  | 消费新观察             | 1017153 |
  | 天天耍大牌             | 1014753 |
  | 廉洁四川               | 1014754 |
  | 看世界                 | 1014755 |
  | 金熊猫说教育（资讯版） | 1014757 |
  | 她说                   | 1014759 |
  | 嗨宝贝                 | 1014762 |
  | 萌眼看世界             | 1014764 |
  | 乡村大讲堂             | 1014765 |
  | 四川党建               | 1014766 |
  | 健康四川               | 1014767 |
  | 技能四川               | 12023   |

## 天下雜誌 <Site url="cw.com.tw"/>

### 主頻道 <Site url="cw.com.tw" size="sm" />

<Route namespace="cw" :data='{"path":"/master/:channel","categories":["traditional-media"],"example":"/cw/master/8","parameters":{"channel":"主頻道 ID，可在 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":true,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"主頻道","maintainers":["TonyRL"],"description":"| 主頻道名稱 | 主頻道 ID |\n  | ---------- | --------- |\n  | 財經       | 8         |\n  | 產業       | 7         |\n  | 國際       | 9         |\n  | 管理       | 10        |\n  | 環境       | 12        |\n  | 教育       | 13        |\n  | 人物       | 14        |\n  | 政治社會   | 77        |\n  | 調查排行   | 15        |\n  | 健康關係   | 79        |\n  | 時尚品味   | 11        |\n  | 運動生活   | 103       |\n  | 重磅外媒   | 16        |","location":"master.ts"}' />

| 主頻道名稱 | 主頻道 ID |
  | ---------- | --------- |
  | 財經       | 8         |
  | 產業       | 7         |
  | 國際       | 9         |
  | 管理       | 10        |
  | 環境       | 12        |
  | 教育       | 13        |
  | 人物       | 14        |
  | 政治社會   | 77        |
  | 調查排行   | 15        |
  | 健康關係   | 79        |
  | 時尚品味   | 11        |
  | 運動生活   | 103       |
  | 重磅外媒   | 16        |

### 子頻道 <Site url="cw.com.tw" size="sm" />

<Route namespace="cw" :data='{"path":"/sub/:channel","categories":["traditional-media"],"example":"/cw/sub/615","parameters":{"channel":"子頻道 ID，可在 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":true,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"子頻道","maintainers":["TonyRL"],"location":"sub.ts"}' />

### 最新上線 <Site url="cw.com.tw/today" size="sm" />

<Route namespace="cw" :data='{"path":"/today","categories":["traditional-media"],"example":"/cw/today","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":true,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["cw.com.tw/today","cw.com.tw/"]}],"name":"最新上線","maintainers":["TonyRL"],"url":"cw.com.tw/today","location":"today.ts"}' />

### 作者 <Site url="cw.com.tw" size="sm" />

<Route namespace="cw" :data='{"path":"/author/:channel","categories":["traditional-media"],"example":"/cw/author/57","parameters":{"channel":"作者 ID，可在 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":true,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["cw.com.tw/author/:channel"]}],"name":"作者","maintainers":["TonyRL"],"location":"author.ts"}' />

## 无线新闻 <Site url="tvb.com"/>

### 新闻 <Site url="tvb.com" size="sm" />

<Route namespace="tvb" :data='{"path":"/news/:category?/:language?","categories":["traditional-media"],"example":"/tvb/news","parameters":{"category":"分类，见下表，默认为要聞","language":"语言，见下表"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["tvb.com/:language/:category","tvb.com/"]}],"name":"新闻","maintainers":["nczitzk"],"description":"分类\n\n  | 要聞  | 快訊    | 港澳  | 兩岸         | 國際  | 財經    | 體育   | 法庭       | 天氣    |\n  | ----- | ------- | ----- | ------------ | ----- | ------- | ------ | ---------- | ------- |\n  | focus | instant | local | greaterchina | world | finance | sports | parliament | weather |\n\n  语言\n\n  | 繁 | 简 |\n  | -- | -- |\n  | tc | sc |","location":"news.ts"}' />

分类

  | 要聞  | 快訊    | 港澳  | 兩岸         | 國際  | 財經    | 體育   | 法庭       | 天氣    |
  | ----- | ------- | ----- | ------------ | ----- | ------- | ------ | ---------- | ------- |
  | focus | instant | local | greaterchina | world | finance | sports | parliament | weather |

  语言

  | 繁 | 简 |
  | -- | -- |
  | tc | sc |

## 希望之声 <Site url="soundofhope.org"/>

### 频道 <Site url="soundofhope.org" size="sm" />

<Route namespace="soundofhope" :data='{"path":"/:channel/:id","categories":["traditional-media"],"example":"/soundofhope/term/203","parameters":{"channel":"频道","id":"子频道 ID"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["soundofhope.org/:channel/:id"]}],"name":"频道","maintainers":["Fatpandac"],"description":"参数均可在官网获取，如：\n\n  `https://www.soundofhope.org/term/203` 对应 `/soundofhope/term/203`","location":"channel.ts"}' />

参数均可在官网获取，如：

  `https://www.soundofhope.org/term/203` 对应 `/soundofhope/term/203`

## 香港经济日报 <Site url="china.hket.com"/>

### 新闻 <Site url="www.hket.com/" size="sm" />

<Route namespace="hket" :data='{"path":"/:category?","categories":["traditional-media"],"example":"/hket/sran001","parameters":{"category":"分类，默认为全部新闻，可在 URL 中找到，部分见下表"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.hket.com/"],"target":""}],"name":"新闻","maintainers":["TonyRL"],"url":"www.hket.com/","description":"香港经济日报已有提供简单 RSS，详细可前往官方网站： [https://www.hket.com/rss](https://www.hket.com/rss)\n\n此路由主要补全官方 RSS 全文输出及完善分类输出。\n\n  <details>\n    <summary>分类</summary>\n\n    | sran001  | sran008  | sran010  | sran011  | sran012  | srat006  |\n    | -------- | -------- | -------- | -------- | -------- | -------- |\n    | 全部新闻 | 财经地产 | 科技信息 | 国际新闻 | 商业新闻 | 香港新闻 |\n\n    | sran009  | sran009-1 | sran009-2 | sran009-3  | sran009-4 | sran009-5 | sran009-6 |\n    | -------- | --------- | --------- | ---------- | --------- | --------- | --------- |\n    | 即时财经 | 股市      | 新股 IPO  | 新经济追踪 | 当炒股    | 宏观解读  | Hot Talk  |\n\n    | sran011-1 | sran011-2    | sran011-3    |\n    | --------- | ------------ | ------------ |\n    | 环球政治  | 环球经济金融 | 环球社会热点 |\n\n    | sran016    | sran016-1  | sran016-2  | sran016-3  | sran016-4  | sran016-5      |\n    | ---------- | ---------- | ---------- | ---------- | ---------- | -------------- |\n    | 大湾区主页 | 大湾区发展 | 大湾区工作 | 大湾区买楼 | 大湾区消费 | 大湾区投资理财 |\n\n    | srac002  | srac003  | srac004  | srac005  |\n    | -------- | -------- | -------- | -------- |\n    | 即时中国 | 经济脉搏 | 国情动向 | 社会热点 |\n\n    | srat001 | srat008 | srat055  | srat069  | srat070   |\n    | ------- | ------- | -------- | -------- | --------- |\n    | 话题    | 观点    | 休闲消费 | 娱乐新闻 | TOPick TV |\n\n    | srat052  | srat052-1 | srat052-2  | srat052-3 |\n    | -------- | --------- | ---------- | --------- |\n    | 健康主页 | 食用安全  | 医生诊症室 | 保健美颜  |\n\n    | srat053  | srat053-1 | srat053-2 | srat053-3 | srat053-4  |\n    | -------- | --------- | --------- | --------- | ---------- |\n    | 亲子主页 | 儿童健康  | 育儿经    | 教育      | 亲子好去处 |\n\n    | srat053-6   | srat053-61 | srat053-62 | srat053-63 | srat053-64 |\n    | ----------- | ---------- | ---------- | ---------- | ---------- |\n    | Band 1 学堂 | 幼稚园     | 中小学     | 尖子教室   | 海外升学   |\n\n    | srat072-1  | srat072-2  | srat072-3        | srat072-4         |\n    | ---------- | ---------- | ---------------- | ----------------- |\n    | 健康身心活 | 抗癌新方向 | 「糖」「心」解密 | 风湿不再 你我自在 |\n\n    | sraw007  | sraw009  | sraw010  | sraw011  | sraw012  | sraw014  | sraw018  | sraw019  |\n    | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |\n    | 全部博客 | Bloggers | 收息攻略 | 精明消费 | 退休规划 | 个人增值 | 财富管理 | 绿色金融 |\n\n    | sraw015  | sraw015-07 | sraw015-08 | sraw015-09 | sraw015-10 |\n    | -------- | ---------- | ---------- | ---------- | ---------- |\n    | 移民百科 | 海外置业   | 移民攻略   | 移民点滴   | 海外理财   |\n\n    | sraw020  | sraw020-1    | sraw020-2 | sraw020-3 | sraw020-4 |\n    | -------- | ------------ | --------- | --------- | --------- |\n    | ESG 主页 | ESG 趋势政策 | ESG 投资  | ESG 企业  | ESG 社会  |\n  </details>","location":"index.ts"}' />

香港经济日报已有提供简单 RSS，详细可前往官方网站： [https://www.hket.com/rss](https://www.hket.com/rss)

此路由主要补全官方 RSS 全文输出及完善分类输出。

  <details>
    <summary>分类</summary>

    | sran001  | sran008  | sran010  | sran011  | sran012  | srat006  |
    | -------- | -------- | -------- | -------- | -------- | -------- |
    | 全部新闻 | 财经地产 | 科技信息 | 国际新闻 | 商业新闻 | 香港新闻 |

    | sran009  | sran009-1 | sran009-2 | sran009-3  | sran009-4 | sran009-5 | sran009-6 |
    | -------- | --------- | --------- | ---------- | --------- | --------- | --------- |
    | 即时财经 | 股市      | 新股 IPO  | 新经济追踪 | 当炒股    | 宏观解读  | Hot Talk  |

    | sran011-1 | sran011-2    | sran011-3    |
    | --------- | ------------ | ------------ |
    | 环球政治  | 环球经济金融 | 环球社会热点 |

    | sran016    | sran016-1  | sran016-2  | sran016-3  | sran016-4  | sran016-5      |
    | ---------- | ---------- | ---------- | ---------- | ---------- | -------------- |
    | 大湾区主页 | 大湾区发展 | 大湾区工作 | 大湾区买楼 | 大湾区消费 | 大湾区投资理财 |

    | srac002  | srac003  | srac004  | srac005  |
    | -------- | -------- | -------- | -------- |
    | 即时中国 | 经济脉搏 | 国情动向 | 社会热点 |

    | srat001 | srat008 | srat055  | srat069  | srat070   |
    | ------- | ------- | -------- | -------- | --------- |
    | 话题    | 观点    | 休闲消费 | 娱乐新闻 | TOPick TV |

    | srat052  | srat052-1 | srat052-2  | srat052-3 |
    | -------- | --------- | ---------- | --------- |
    | 健康主页 | 食用安全  | 医生诊症室 | 保健美颜  |

    | srat053  | srat053-1 | srat053-2 | srat053-3 | srat053-4  |
    | -------- | --------- | --------- | --------- | ---------- |
    | 亲子主页 | 儿童健康  | 育儿经    | 教育      | 亲子好去处 |

    | srat053-6   | srat053-61 | srat053-62 | srat053-63 | srat053-64 |
    | ----------- | ---------- | ---------- | ---------- | ---------- |
    | Band 1 学堂 | 幼稚园     | 中小学     | 尖子教室   | 海外升学   |

    | srat072-1  | srat072-2  | srat072-3        | srat072-4         |
    | ---------- | ---------- | ---------------- | ----------------- |
    | 健康身心活 | 抗癌新方向 | 「糖」「心」解密 | 风湿不再 你我自在 |

    | sraw007  | sraw009  | sraw010  | sraw011  | sraw012  | sraw014  | sraw018  | sraw019  |
    | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
    | 全部博客 | Bloggers | 收息攻略 | 精明消费 | 退休规划 | 个人增值 | 财富管理 | 绿色金融 |

    | sraw015  | sraw015-07 | sraw015-08 | sraw015-09 | sraw015-10 |
    | -------- | ---------- | ---------- | ---------- | ---------- |
    | 移民百科 | 海外置业   | 移民攻略   | 移民点滴   | 海外理财   |

    | sraw020  | sraw020-1    | sraw020-2 | sraw020-3 | sraw020-4 |
    | -------- | ------------ | --------- | --------- | --------- |
    | ESG 主页 | ESG 趋势政策 | ESG 投资  | ESG 企业  | ESG 社会  |
  </details>

## 新蓝网（浙江广播电视集团） <Site url="cztv.com"/>

### 浙江新闻联播 - 每日合集 <Site url="cztv.com/videos/zjxwlb" size="sm" />

<Route namespace="cztv" :data='{"path":"/zjxwlb/daily","categories":["traditional-media"],"example":"/cztv/zjxwlb/daily","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["cztv.com/videos/zjxwlb","cztv.com/"]}],"name":"浙江新闻联播 - 每日合集","maintainers":["yhkang"],"url":"cztv.com/videos/zjxwlb","location":"daily.ts"}' />

### 浙江新闻联播 <Site url="cztv.com/videos/zjxwlb" size="sm" />

<Route namespace="cztv" :data='{"path":"/zjxwlb","categories":["traditional-media"],"example":"/cztv/zjxwlb","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["cztv.com/videos/zjxwlb","cztv.com/"]}],"name":"浙江新闻联播","maintainers":["yhkang"],"url":"cztv.com/videos/zjxwlb","location":"zjxwlb.ts"}' />

## 新华每日电讯 <Site url="mrdx.cn"/>

### 今日 <Site url="mrdx.cn*" size="sm" />

<Route namespace="mrdx" :data='{"path":"/today","categories":["traditional-media"],"example":"/mrdx/today","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["mrdx.cn*"]}],"name":"今日","maintainers":["Dustin-Jiang"],"url":"mrdx.cn*","location":"daily.ts"}' />

## 新唐人电视台 <Site url="www.ntdtv.com"/>

### 频道 <Site url="www.ntdtv.com" size="sm" />

<Route namespace="ntdtv" :data='{"path":"/:language/:id","categories":["traditional-media"],"example":"/ntdtv/b5/prog1201","parameters":{"language":"语言，简体为`gb`，繁体为`b5`","id":"子频道名称"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.ntdtv.com/:language/:id"]}],"name":"频道","maintainers":["Fatpandac"],"description":"参数均可在官网获取，如：\n\n  `https://www.ntdtv.com/b5/prog1201` 对应 `/ntdtv/b5/prog1201`","location":"channel.ts"}' />

参数均可在官网获取，如：

  `https://www.ntdtv.com/b5/prog1201` 对应 `/ntdtv/b5/prog1201`

## 新快报 <Site url="xkb.com.cn"/>

### 新闻 <Site url="xkb.com.cn" size="sm" />

<Route namespace="xkb" :data='{"path":"/:channel","categories":["traditional-media"],"example":"/xkb/350","parameters":{"channel":"栏目 ID，点击对应栏目后在地址栏找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"新闻","maintainers":["TimWu007"],"description":"常用栏目 ID：\n\n  | 栏目名 | ID  |\n  | ------ | --- |\n  | 首页   | 350 |\n  | 重点   | 359 |\n  | 广州   | 353 |\n  | 湾区   | 360 |\n  | 天下   | 355 |","location":"index.ts"}' />

常用栏目 ID：

  | 栏目名 | ID  |
  | ------ | --- |
  | 首页   | 350 |
  | 重点   | 359 |
  | 广州   | 353 |
  | 湾区   | 360 |
  | 天下   | 355 |

## 信报财经新闻 <Site url="hkej.com"/>

### 即时新闻 <Site url="hkej.com/" size="sm" />

<Route namespace="hkej" :data='{"path":"/:category?","categories":["traditional-media"],"example":"/hkej/index","parameters":{"category":"分类，默认为全部新闻"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["hkej.com/"]}],"name":"即时新闻","maintainers":["TonyRL"],"url":"hkej.com/","description":"| index    | stock    | hongkong | china    | international | property | current  |\n  | -------- | -------- | -------- | -------- | ------------- | -------- | -------- |\n  | 全部新闻 | 港股直击 | 香港财经 | 中国财经 | 国际财经      | 地产新闻 | 时事脉搏 |","location":"index.ts"}' />

| index    | stock    | hongkong | china    | international | property | current  |
  | -------- | -------- | -------- | -------- | ------------- | -------- | -------- |
  | 全部新闻 | 港股直击 | 香港财经 | 中国财经 | 国际财经      | 地产新闻 | 时事脉搏 |

## 央视新闻 <Site url="news.cctv.com"/>

### 栏目 <Site url="news.cctv.com" size="sm" />

<Route namespace="cctv" :data='{"path":"/lm/:id?","categories":["traditional-media"],"example":"/cctv/lm/xwzk","parameters":{"id":"栏目 id，可在对应栏目页 URL 中找到，默认为 `xwzk` 即 新闻周刊"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["news.cctv.com/:category"],"target":"/:category"}],"name":"栏目","maintainers":["nczitzk"],"description":"| 焦点访谈 | 等着我 | 今日说法 | 开讲啦 |\n  | -------- | ------ | -------- | ------ |\n  | jdft     | dzw    | jrsf     | kjl    |\n\n  | 正大综艺 | 经济半小时 | 第一动画乐园 |\n  | -------- | ---------- | ------------ |\n  | zdzy     | jjbxs      | dydhly       |\n\n  :::tip\n  更多栏目请看 [这里](https://tv.cctv.com/lm)\n  :::","location":"lm.ts"}' />

| 焦点访谈 | 等着我 | 今日说法 | 开讲啦 |
  | -------- | ------ | -------- | ------ |
  | jdft     | dzw    | jrsf     | kjl    |

  | 正大综艺 | 经济半小时 | 第一动画乐园 |
  | -------- | ---------- | ------------ |
  | zdzy     | jjbxs      | dydhly       |

  :::tip
  更多栏目请看 [这里](https://tv.cctv.com/lm)
  :::

### 新闻联播 <Site url="tv.cctv.com/lm/xwlb" size="sm" />

<Route namespace="cctv" :data='{"path":"/xwlb","categories":["traditional-media"],"example":"/cctv/xwlb","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["tv.cctv.com/lm/xwlb","tv.cctv.com/"]}],"name":"新闻联播","maintainers":["zengxs"],"url":"tv.cctv.com/lm/xwlb","description":"新闻联播内容摘要。","location":"xwlb.ts"}' />

新闻联播内容摘要。

### 央视网图片《镜象》 <Site url="photo.cctv.com/jx" size="sm" />

<Route namespace="cctv" :data='{"path":"/photo/jx","categories":["traditional-media"],"example":"/cctv/photo/jx","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["photo.cctv.com/jx","photo.cctv.com/"]}],"name":"央视网图片《镜象》","maintainers":["nczitzk"],"url":"photo.cctv.com/jx","location":"jx.ts"}' />

### 专题 <Site url="news.cctv.com" size="sm" />

<Route namespace="cctv" :data='{"path":"/:category","categories":["traditional-media"],"example":"/cctv/world","parameters":{"category":"分类名"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["news.cctv.com/:category"]}],"name":"专题","maintainers":["idealclover","xyqfer"],"description":"| 新闻 | 国内  | 国际  | 社会    | 法治 | 文娱 | 科技 | 生活 | 教育 | 每周质量报告 | 新闻 1+1  |\n  | ---- | ----- | ----- | ------- | ---- | ---- | ---- | ---- | ---- | ------------ | --------- |\n  | news | china | world | society | law  | ent  | tech | life | edu  | mzzlbg       | xinwen1j1 |","location":"category.ts"}' />

| 新闻 | 国内  | 国际  | 社会    | 法治 | 文娱 | 科技 | 生活 | 教育 | 每周质量报告 | 新闻 1+1  |
  | ---- | ----- | ----- | ------- | ---- | ---- | ---- | ---- | ---- | ------------ | --------- |
  | news | china | world | society | law  | ent  | tech | life | edu  | mzzlbg       | xinwen1j1 |

## 羊城晚报金羊网 <Site url="xwlb.com.cn"/>

### 新闻 <Site url="xwlb.com.cn" size="sm" />

<Route namespace="ycwb" :data='{"path":"/:node","categories":["traditional-media"],"example":"/ycwb/1","parameters":{"node":"栏目 id"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"新闻","maintainers":["TimWu007"],"description":"注：小部分栏目的 URL 会给出 nodeid。如未给出，可打开某条新闻链接后，查看网页源代码，搜索 nodeid 的值。\n\n  常用栏目节点：\n\n  | 首页 | 中国 | 国际 | 体育 | 要闻 | 珠江评论 | 民生观察 | 房产 | 金羊教育 | 金羊财富 | 金羊文化 | 金羊健康 | 金羊汽车 |\n  | ---- | ---- | ---- | ---- | ---- | -------- | -------- | ---- | -------- | -------- | -------- | -------- | -------- |\n  | 1    | 14   | 15   | 16   | 22   | 1875     | 21773    | 222  | 5725     | 633      | 5281     | 21692    | 223      |\n\n  | 广州 | 广州 - 广州要闻 | 广州 - 社会百态 | 广州 - 深读广州 | 广州 - 生活服务 | 今日大湾区 | 广东 - 政经热闻 | 广东 - 民生视点 | 广东 - 滚动新闻 |\n  | ---- | --------------- | --------------- | --------------- | --------------- | ---------- | --------------- | --------------- | --------------- |\n  | 18   | 5261            | 6030            | 13352           | 83422           | 100418     | 13074           | 12252           | 12212           |","location":"index.ts"}' />

注：小部分栏目的 URL 会给出 nodeid。如未给出，可打开某条新闻链接后，查看网页源代码，搜索 nodeid 的值。

  常用栏目节点：

  | 首页 | 中国 | 国际 | 体育 | 要闻 | 珠江评论 | 民生观察 | 房产 | 金羊教育 | 金羊财富 | 金羊文化 | 金羊健康 | 金羊汽车 |
  | ---- | ---- | ---- | ---- | ---- | -------- | -------- | ---- | -------- | -------- | -------- | -------- | -------- |
  | 1    | 14   | 15   | 16   | 22   | 1875     | 21773    | 222  | 5725     | 633      | 5281     | 21692    | 223      |

  | 广州 | 广州 - 广州要闻 | 广州 - 社会百态 | 广州 - 深读广州 | 广州 - 生活服务 | 今日大湾区 | 广东 - 政经热闻 | 广东 - 民生视点 | 广东 - 滚动新闻 |
  | ---- | --------------- | --------------- | --------------- | --------------- | ---------- | --------------- | --------------- | --------------- |
  | 18   | 5261            | 6030            | 13352           | 83422           | 100418     | 13074           | 12252           | 12212           |

## 浙江在线 <Site url="zjol.com.cn"/>

### 浙报集团系列报刊 <Site url="zjol.com.cn" size="sm" />

<Route namespace="zjol" :data='{"path":"/paper/:id?","categories":["traditional-media"],"example":"/zjol/paper/zjrb","parameters":{"id":"报纸 id，见下表，默认为 `zjrb`，即浙江日报"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"浙报集团系列报刊","maintainers":["nczitzk"],"description":"| 浙江日报 | 钱江晚报 | 美术报 | 浙江老年报 | 浙江法制报 | 江南游报 |\n  | -------- | -------- | ------ | ---------- | ---------- | -------- |\n  | zjrb     | qjwb     | msb    | zjlnb      | zjfzb      | jnyb     |","location":"paper.ts"}' />

| 浙江日报 | 钱江晚报 | 美术报 | 浙江老年报 | 浙江法制报 | 江南游报 |
  | -------- | -------- | ------ | ---------- | ---------- | -------- |
  | zjrb     | qjwb     | msb    | zjlnb      | zjfzb      | jnyb     |

## 中国环球电视网 <Site url="cgtn.com"/>

### 播客 <Site url="cgtn.com" size="sm" />

<Route namespace="cgtn" :data='{"path":"/podcast/:category/:id","categories":["traditional-media"],"example":"/cgtn/podcast/ezfm/4","parameters":{"category":"类型名","id":"播客 id"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["cgtn.com/podcast/column/:category/*/:id"]}],"name":"播客","maintainers":["5upernova-heng"],"description":"> 类型名与播客 id 可以在播客对应的 URL 中找到\n  > 如 URL `https://radio.cgtn.com/podcast/column/ezfm/More-to-Read/4` ，其 `category` 为 `ezfm` ，`id` 为 `4`，对应的订阅路由为 [`/podcast/ezfm/4`](https://rsshub.app/podcast/ezfm/4)","location":"podcast.ts"}' />

> 类型名与播客 id 可以在播客对应的 URL 中找到
  > 如 URL `https://radio.cgtn.com/podcast/column/ezfm/More-to-Read/4` ，其 `category` 为 `ezfm` ，`id` 为 `4`，对应的订阅路由为 [`/podcast/ezfm/4`](https://rsshub.app/podcast/ezfm/4)

## 中央通讯社 <Site url="cna.com.tw"/>

### 分类 <Site url="cna.com.tw" size="sm" />

<Route namespace="cna" :data='{"path":"/:id?","categories":["traditional-media"],"example":"/cna/aall","parameters":{"id":"分类 id 或新闻专题 id。分类 id 见下表，新闻专题 id 為 https://www.cna.com.tw/list/newstopic.aspx 中，連結的數字部份。此參數默认为 aall"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"分类","maintainers":["nczitzk"],"description":"| 即時 | 政治 | 國際 | 兩岸 | 產經 | 證券 | 科技 | 生活 | 社會 | 地方 | 文化 | 運動 | 娛樂 |\n  | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |\n  | aall | aipl | aopl | acn  | aie  | asc  | ait  | ahel | asoc | aloc | acul | aspt | amov |","location":"index.ts"}' />

| 即時 | 政治 | 國際 | 兩岸 | 產經 | 證券 | 科技 | 生活 | 社會 | 地方 | 文化 | 運動 | 娛樂 |
  | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
  | aall | aipl | aopl | acn  | aie  | asc  | ait  | ahel | asoc | aloc | acul | aspt | amov |

### 分类 (网页爬虫方法) <Site url="cna.com.tw" size="sm" />

<Route namespace="cna" :data='{"path":"/web/:id?","categories":["traditional-media"],"example":"/cna/web/aall","parameters":{"id":"分类 id，见上表。此參數默认为 aall"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"分类 (网页爬虫方法)","maintainers":["dzx-dzx"],"location":"web/index.ts"}' />

## 中国新闻周刊 <Site url="inewsweek.cn"/>

### 栏目 <Site url="inewsweek.cn" size="sm" />

<Route namespace="inewsweek" :data='{"path":"/:channel","categories":["traditional-media"],"example":"/inewsweek/survey","parameters":{"channel":"栏目"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["inewsweek.cn/:channel","inewsweek.cn/"]}],"name":"栏目","maintainers":["changren-wcr"],"description":"提取文章全文。\n\n  | 封面  | 时政     | 社会    | 经济    | 国际  | 调查   | 人物   |\n  | ----- | -------- | ------- | ------- | ----- | ------ | ------ |\n  | cover | politics | society | finance | world | survey | people |","location":"index.ts"}' />

提取文章全文。

  | 封面  | 时政     | 社会    | 经济    | 国际  | 调查   | 人物   |
  | ----- | -------- | ------- | ------- | ----- | ------ | ------ |
  | cover | politics | society | finance | world | survey | people |

## 中国科技网 <Site url="digitalpaper.stdaily.com"/>

### 科技日报 <Site url="digitalpaper.stdaily.com" size="sm" />

<Route namespace="stdaily" :data='{"path":"/digitalpaper","categories":["traditional-media"],"example":"/stdaily/digitalpaper","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"科技日报","maintainers":["lyqluis"],"location":"digitalpaper.ts"}' />

