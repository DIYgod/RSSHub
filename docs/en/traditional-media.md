---
pageClass: routes
---

# News

## ABC News

### Channel & Topic

<RouteEn author="nczitzk" example="/abc" path="/abc/:id?" :paramsDesc="['id, can be found in the Channel or Topic page, can also be filled in the `documentId` in the source code of the page, see below, Just In by default']">

::: tip Tip

All Topics in [Topic Library](https://abc.net.au/news/topics) are supported, you can fill in the field after `topic` in its URL, or fill in the `documentId`.

For example, the URL for [Computers and Technology](https://www.abc.net.au/news/topic/computers-and-technology) is <https://www.abc.net.au/news/topic/computers-and-technology>, the field after `topic` is `computers-and-technology`, and the `documentId` of the Topic is `2302`, so the route is [/abc/computers-and-technology](https://rsshub.app/abc/computers-and-technology) and [/abc/2302](https://rsshub.app/abc/2302).

The supported channels are all listed in the table below. For other channels, please find the `documentId` in the source code of the channel page and fill it in as above.

:::

The following are some of the supported Channel and Topic ids.

| Just In | Coronavirus | Politics | World |
| ------- | ----------- | -------- | ----- |
| justin  | coronavirus | politics | world |

| Asia Pacific | Business | Analysis & Opinion   | Sport |
| ------------ | -------- | -------------------- | ----- |
| asia-pacific | business | analysis-and-opinion | sport |

| AFL | Rugby League | Rugby Union | Football |
| --- | ------------ | ----------- | -------- |
| afl | rugbyleague  | rugbyunion  | football |

| Cricket | Science | Astronomy (Space) | Computers and Technology |
| ------- | ------- | ----------------- | ------------------------ |
| cricket | science | astronomy-space   | computers-and-technology |

| Environment | Archaeology | Health | Exercise and Fitness |
| ----------- | ----------- | ------ | -------------------- |
| environment | archaeology | health | exercise-and-fitness |

| Pharmaceuticals | Mental Health | Diet and Nutrition | Arts & Culture |
| --------------- | ------------- | ------------------ | -------------- |
| pharmaceuticals | mental-health | diet-and-nutrition | arts-culture   |

| Fact Check | ABC 中文 | 澳洲时政           | 聚焦中港台     |
| ---------- | -------- | ------------------ | -------------- |
| factcheck  | chinese  | australia-politics | focus-on-china |

| 观点与分析              | 澳洲华人             | 解读澳洲          | Berita dalam Bahasa Indonesia | Tok Pisin |
| ----------------------- | -------------------- | ----------------- | ----------------------------- | --------- |
| analysis-and-opinion-zh | chinese-in-australia | curious-australia | indonesian                    | tok-pisin |

</RouteEn>

## AP News

### Topics

<RouteEn author="zoenglinghou mjysci" example="/apnews/topics/apf-topnews" path="/apnews/topics/:topic" :paramsDesc="['Topic name，can be found in URL. For example: the topic name of AP Top News [https://apnews.com/apf-topnews](https://apnews.com/apf-topnews) is `apf-topnews`']" radar="1" rssbud="1" anticrawler="1" puppeteer="1"/>

## BBC

### BBC

<RouteEn author="HenryQW DIYgod" example="/bbc/world-asia" path="/bbc/:channel?" :paramsDesc="['channel, default to `top stories`']">

Provides a better reading experience (full text articles) over the official ones.

Support major channels, refer to [BBC RSS feeds](https://www.bbc.co.uk/news/10628494). Eg, `business` for `https://feeds.bbci.co.uk/news/business/rss.xml`.

-   Channel contains sub-directories, such as `https://feeds.bbci.co.uk/news/world/asia/rss.xml`, replace `/` with `-`, `/bbc/world-asia`.

</RouteEn>

### BBC Chinese

<RouteEn author="HenryQW" example="/bbc/chinese/business" path="/bbc/:lang/:channel?" :paramsDesc="['lang, Simplified or Traditional Chinese','channel, default to `top stories`']">

See [BBC 中文网](../traditional-media.html#bbc-bbc-zhong-wen-wang).

</RouteEn>

## Boston.com

### News

<RouteEn author="oppilate" example="/boston/technology" path="/boston/:tag?" :paramsDesc="['Tag']">

Generates full-text feeds that the official feed doesn't provide.
Refer to [Boston.com's feed page](https://www.boston.com/rss-feeds) for tags. For instance, `https://www.boston.com/tag/local-news/?feed=rss` corresponds to `/boston/local-news`.

</RouteEn>

## CBC

Provide full article RSS for CBC topics.

<RouteEn author="wb14123" example="/cbc/topics" path="/cbc/topics/:topic?" :paramsDesc="['CBC topics. Default to Top Stories. For second level topics like canada/toronto, need to replace `/` by `-`.']"/>

## Chicago Tribune

### News

<RouteEn author="oppilate" example="/chicagotribune/nation-world" path="/chicagotribune/:category/:subcategory?" :paramsDesc="['Category', 'Subcategory']">

Generates full-text that the official feed doesn't provide.
Refer to [Chicago Tribune's feed page](https://www.chicagotribune.com/about/ct-chicago-tribune-rss-feeds-htmlstory.html) for categories. For instance, `https://www.chicagotribune.com/arcio/rss/category/nation-world/` corresponds to `/chicagotribune/nation-world`.

</RouteEn>

## China Dialogue

### Topics

<RouteEn author="zoenglinghou" example="/chinadialogue/topics/cities" path="/chinadialogue/topics/:topic" :paramsDesc="['Topics']">

| Business | Cities | Climate Change            | Conservation | Governance & Law   | Health and Food | Natural Disasters | Pollution | Science & Tech   | Security | Water |
| -------- | ------ | ------------------------- | ------------ | ------------------ | --------------- | ----------------- | --------- | ---------------- | -------- | ----- |
| business | cities | climate-change-and-energy | conservation | governance-and-law | health-and-food | natural-disasters | pollution | science-and-tech | security | water |

</RouteEn>

### Columns

<RouteEn author="zoenglinghou" example="/chinadialogue/article" path="/chinadialogue/:column" :paramsDesc="['栏目分类']">

| Articles | Blogs | Culture | Reports |
| -------- | ----- | ------- | ------- |
| article  | blog  | culture | reports |

</RouteEn>

## China Times

### News

<RouteEn author="luyuhuang" example="/chinatimes/realtimenews" path="/chinatimes/:caty" :paramsDesc="['category']" radar="1" rssbud="1">

| realtimenews   | politic | opinion | life | star    | money   | society | hottopic   | tube   | world | armament | chinese           | fashion | sports | technologynews  | travel | album   |
| -------------- | ------- | ------- | ---- | ------- | ------- | ------- | ---------- | ------ | ----- | -------- | ----------------- | ------- | ------ | --------------- | ------ | ------- |
| Real Time News | Politic | Opinion | Life | Showbiz | Finance | Society | Hot Topics | Videos | World | Military | Mainland & Taiwan | Fashion | Sports | Technology News | Travel | Columns |

</RouteEn>

## ChinaFile

### Reporting & Opinion

<RouteEn author="oppilate" example="/chinafile/all" path="/chinafile/:category?" :paramsDesc="['Category, by default `all`']">

Generates full-text feeds that the official feed doesn't provide.

| All | The China NGO Project |
| --- | --------------------- |
| all | ngo                   |

</RouteEn>

## Financial Times

### myFT personal RSS

<RouteEn author="HenryQW" example="/ft/myft/rss-key" path="/ft/myft/:key" :paramsDesc="['the last part of myFT personal RSS address']">

::: tip tips

-   Visit ft.com -> myFT -> Contact Preferences to enable personal RSS feed, see [help.ft.com](https://help.ft.com/faq/email-alerts-and-contact-preferences/what-is-myft-rss-feed/)
-   Obtain the key from the personal RSS address, it looks like `12345678-abcd-4036-82db-vdv20db024b8`

:::

</RouteEn>

## Korean Central News Agency (KCNA)

### News

<RouteEn author="Rongronggg9" example="/kcna/en" path="/kcna/:lang/:category?" :paramsDesc="['Language, refer to the table below', 'Category, refer to the table below']" anticrawler="1" radar="1" rssbud="1">

| Language | 조선어  | English | 中国语  | Русский | Español | 日本語  |
|----------|------|---------|------|---------|---------|------|
| `:lang`  | `kp` | `en`    | `cn` | `ru`    | `es`    | `jp` |

| Category                                                         | `:category`                        |
|------------------------------------------------------------------|------------------------------------|
| WPK General Secretary **Kim Jong Un**'s Revolutionary Activities | `54c0ca4ca013a92cc9cf95bd4004c61a` |
| Latest News (default)                                            | `1ee9bdb7186944f765208f34ecfb5407` |
| Top News                                                         | `5394b80bdae203fadef02522cfb578c0` |
| Home News                                                        | `b2b3bcc1b0a4406ab0c36e45d5db58db` |
| Documents                                                        | `a8754921399857ebdbb97a98a1e741f5` |
| World                                                            | `593143484cf15d48ce85c26139582395` |
| Society-Life                                                     | `93102e5a735d03979bc58a3a7aefb75a` |
| External                                                         | `0f98b4623a3ef82aeea78df45c423fd0` |
| News Commentary                                                  | `12c03a49f7dbe829bceea8ac77088c21` |

</RouteEn>

## Ming Pao

### Ming Pao Daily

<RouteEn author="TonyRL" example="/mingpao/pns/s00017" path="/mingpao/pns/:category?" :paramsDesc="['channel，default to brief']"/>

::: tip tips
Only `s00017` is in English.
:::

| category | Channel       |
| -------- | ------------- |
| s00001   | Brief         |
| s00002   | Local         |
| s00003   | Editorial     |
| s00004   | Economy       |
| s00005   | Supplement    |
| s00011   | Education     |
| s00012   | Views         |
| s00013   | China         |
| s00014   | International |
| s00015   | Sports        |
| s00016   | Entertainment |
| s00017   | English       |
| s00018   | Columnist     |

## NHK

### News Web Easy

<RouteEn author="Andiedie" example="/nhk/news_web_easy" path="/nhk/news_web_easy"/>

### WORLD-JAPAN - Top Stories

<RouteEn author="TonyRL" example="/nhk/news/en" path="/nhk/news/:lang?" :paramsDesc="['Language, see below, `en` by default']" radar="1" rssbud="1">

| العربية | বাংলা | မြန်မာဘာသာစကား | 中文（简体） | 中文（繁體） | English | Français |
| ------- | ----- | -------------- | ------ | ------ | ------- | -------- |
| ar      | bn    | my             | zh     | zt     | en      | fr       |

| हिन्दी | Bahasa Indonesia | 코리언 | فارسی | Português | Русский | Español |
| ------  | ---------------- | --- | ----- | --------- | ------- | ------- |
| hi     | id               | ko  | fa    | pt        | ru      | es      |

| Kiswahili | ภาษาไทย | Türkçe | Українська | اردو | Tiếng Việt |
| --------- | | ------- | ------ | ---------- | ---- | ---------- |
| sw        | th      | tr     | uk         | ur   | vi         |

</RouteEn>

## Nikkei Asia

### Latest News

<RouteEn author="rainrdx" example="/nikkei-asia" path="/nikkei-asia"/>

## Phoronix

### News & Reviews

<RouteEn author="oppliate" example="/phoronix/news_topic/Intel" path="/phoronix/:page/:queryOrItem?" :paramsDesc="['Page name', 'For `category` it corresponds to `item`, for other pages it\'s `q`. You may find available parameters from their navigator links. E.g. to subscribe to the category page `https://www.phoronix.com/scan.php?page=category&item=Computers`, fill in the path `/phoronix/category/Computers`']" />

## Radio Free Asia (RFA)

### News

<RouteEn author="zphw" example="/rfa/english" path="/rfa/:language?/:channel?/:subChannel?" :paramsDesc="['language, English by default', 'channel', 'subchannel, where applicable']" />

Delivers a better experience by supporting parameter specification.

Parameters can be obtained from the official website, for instance:

`https://www.rfa.org/cantonese/news` corresponds to `/rfa/cantonese/news`

`https://www.rfa.org/cantonese/news/htm` corresponds to `/rfa/cantonese/news/htm`

## Reuters

::: warning Migration notes

1. Reuters Chinese site (`cn.reuters.com`) and British site (`uk.reuters.com`) have been terminated, redirecting to the main site (`www.reuters.com`)
2. The old routes are deprecated. Please migrate to the new routes documented below

:::

### Category/Topic/Author

<RouteEn author="HenryQW proletarius101 LyleLee" example="/reuters/world/us" path="/reuters/:category/:topic?" :paramsDesc="['find it in the URL, or tables below', 'find it in the URL, or tables below']">

-   `:category`:
    | World    | Business | Legal | Markets  | Breakingviews | Technology |
    | -------- | -------  | ----- | -------- | ------------- | ---------- |
    | world    | business | legal | markets  | breakingviews | technology |


-   `world/:topic`:

    | All  | Africa   | Americas | Asia Pacific | China | Europe | India | Middle East | United Kingdom | United States | The Great Reboot | Reuters Next |
    | ---- | -------  | -------- | ------------ | ----- | ------ | ----- | ----------- | -------------- | ------------- | ---------------- | ------------ |
    |      | africa    | americas | asia-pacific | china | europe | india | middle-east | uk             | us            | the-great-reboot | reuters-next |


-   `business/:topic`:

    | All  | Aerospace & Defense | Autos & Transportation | Energy | Environment | Finance | Healthcare & Pharmaceuticals | Media & Telecom | Retail & Consumer | Sustainable Business | Charged | Future of Health | Future of Money | Take Five | Reuters Impact |
    | ---- | ------------------- | ---------------------- | ------ | ----------- | ------- | ---------------------------- | --------------- | ----------------- | -------------------- | ------- | ---------------- | --------------- | --------- | -------------- |
    |      | aerospace-defense   | autos-transportation   | energy | environment | finance | healthcare-pharmaceuticals   | media-telecom   | retail-consumer   | sustainable-business | charged | future-of-health | futrue-of-money | take-five | reuters-impact |

-   `legal/:topic`:

    | All | Goverment | Legal Industry | Litigation | Transaction |
    | --- | --------- | -------------- | ---------- | ----------- |
    |     | goverment | legalindustry  | litigation | transaction |

-   `authors/:topic`:

    | Default | Jonathan Landay | any other authors |
    | ------- | --------------- | ----------------- |
    | reuters | jonathan-landay | their name in URL |

More could be found in the URL of the category/topic page.

</RouteEn>

### Inverstigates

<RouteEn author="LyleLee" example="/reuters/inverstigates" path="/reuters/inverstigates" />

## RTHK

### News

RTHK offical provides full text RSS, check the offical website for detail information: <https://news.rthk.hk/rthk/en/rss.htm>

This route adds the missing photo and Link element. (Offical RSS doesn't have Link element may cause issue on some RSS client)

<RouteEn author="KeiLongW" example="/rthk-news/hk/international" path="/rthk-news/:lang/:category" :paramsDesc="['Language，Traditional Chinese`hk`，English`en`','Category']">

| local      | greaterchina       | international | finance      | sport      |
| ---------- | ------------------ | ------------- | ------------ | ---------- |
| Local News | Greater China News | World News    | Finance News | Sport News |

</RouteEn>

## SBS

### Chinese

<RouteEn author="nczitzk" example="/sbs/chinese" path="/sbs/chinese/:category?/:id?/:dialect?/:language?" :paramsDesc="['Category, `news` or `podcast`, `news` by default', 'Id, see below, can be found in URL, `news` by default', 'Dialect, `mandarin` or `cantonese`, `mandarin` by default', 'Language, `zh-hans` or `zh-hant`, `zh-hans` by default']">

::: tip Tip

When subscribing to podcasts, fill `category` with **podcast**. For example, URL to [SBS 普通话电台](https://www.sbs.com.au/chinese/mandarin/zh-hans/podcast/sbs-mandarin) is <https://www.sbs.com.au/chinese/mandarin/zh-hans/podcast/sbs-mandarin>, with **sbs-mandarin** as `id`, **mandarin** as `dialect`, `language` as **zh-hans**, and the route is [`/sbs/chinese/podcast/sbs-mandarin/mandarin/zh-hans`](https://rsshub.app/sbs/chinese/podcast/sbs-mandarin/mandarin/zh-hans).

:::

| 新闻 | 澳大利亚新闻    | 国际新闻           | ​商业与财经      |
| ---- | --------------- | ------------------ | ---------------- |
| news | australian-news | international-news | business-finance |

| 澳中关系                  | ​移民与签证 | Stories in English |
| ------------------------- | ----------- | ------------------ |
| australia-china-relations | immigration | english            |

| COVID-19 专题报道 | 澳大利亚华人       | 澳大利亚生活      | 教育      |
| ----------------- | ------------------ | ----------------- | --------- |
| coronavirus       | australian-chinese | life-in-australia | education |

| 健康   | 吃喝玩乐                  | 艺术人文        | 澳洲定居指南     |
| ------ | ------------------------- | --------------- | ---------------- |
| health | food-travel-entertainment | cultural-events | settlement-guide |

SBS Mandarin Programs:

| SBS 普通话播客 | 解读澳洲            | 疫苗快报                   |
| -------------- | ------------------- | -------------------------- |
| sbs-mandarin   | australia-explained | covid-vaccine-daily-update |

SBS Cantonese Programs:

| SBS 廣東話節目 Podcast | 疫苗快報            | 美食速遞        | 我不是名人          |
| ---------------------- | ------------------- | --------------- | ------------------- |
| sbs-cantonese          | covid-vaccine-daily | gourmet-express | my-australian-story |

| 健康快樂人         | 園藝趣談       | 寰宇金融       | 文化 360    | 科技世界         |
| ------------------ | -------------- | -------------- | ----------- | ---------------- |
| healthy-happy-life | gardening-tips | global-finance | culture-360 | technology-world |

::: tip Tip

Mostly, you can omit `language`, for the reason that **madarin** is with **zh-hans** and **cantonese** is with **zh-hant** by default. For example, the route of [SBS 普通话电台](https://www.sbs.com.au/chinese/mandarin/zh-hans/podcast/sbs-mandarin) is [`/sbs/chinese/podcast/sbs-mandarin/mandarin/zh-hans`](https://rsshub.app/sbs/chinese/podcast/sbs-mandarin/mandarin/zh-hans), which can also be [`/sbs/chinese/podcast/sbs-mandarin/mandarin`](https://rsshub.app/sbs/chinese/podcast/sbs-mandarin/mandarin).

You still can customize `language`, however, it is important to note that not all pages are available in bilingual versions.

:::

</RouteEn>

## SCMP

### News

<RouteEn author="proletarius101" example="/scmp/3" path="/scmp/:category_id" :paramsDesc="['Category']">

See the [official RSS page](https://www.scmp.com/rss) to get the ID of each category. This route provides fulltext that the offical feed doesn't.

</RouteEn>

## Sputnik News

### Category

<RouteEn author="nczitzk" example="/sputniknews" path="/sputniknews/:category?/:language?" :paramsDesc="['Categort, can be found in URL, `news` by default', 'Language, see below, English by default']">

Categories for International site:

| WORLD | COVID-19 | BUSINESS | SPORT | TECH | OPINION |
| ----- | -------- | -------- | ----- | ---- | ------- |
| world | covid-19 | business | sport | tech | opinion |

Categories for Chinese site:

| 新闻   | 中国    | 俄罗斯    | 国际             | 俄中关系                   | 评论      |
| ---- | ----- | ------ | -------------- | ---------------------- | ------- |
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

</RouteEn>

## The Economist

### Category

<RouteEn author="ImSingee" example="/economist/latest" path="/economist/:endpoint" :paramsDesc="['Category name, can be found on the [official page](https://www.economist.com/rss). For example, https://www.economist.com/china/rss.xml to china']" radar="1" rssbud="1"/>

### Espresso

<RouteEn author="TonyRL" example="/economist/espresso" path="/economist/espresso" radar="1" rssbud="1"/>

### GRE Vocabulary

<RouteEn author="xyqfer" example="/economist/gre-vocabulary" path="/economist/gre-vocabulary" />

### Download

<RouteEn author="nczitzk" example="/economist/download" path="/economist/download" >

The download site: <http://www.cgx02.xyz/index.php?dir=/te>

</RouteEn>

## The Guardian

### Editorial

<RouteEn author="HenryQW" example="/guardian/editorial" path="/guardian/editorial">

Provides a better reading experience (full text articles) over the official one.

</RouteEn>

### China

<RouteEn author="Polynomia" example="/guardian/china" path="/guardian/china"/>

## The New York Times

### News

<RouteEn author="HenryQW" example="/nytimes/dual" path="/nytimes/:lang?" :paramsDesc="['language, default to Chinese']">

By extracting the full text of articles, we provide a better reading experience (full text articles) over the official one.

| Default to Chinese | Chinese-English | English | Chinese-English (Traditional Chinese) | Traditional Chinese |
| ------------------ | --------------- | ------- | ------------------------------------- | ------------------- |
| (empty)            | dual            | en      | dual-traditionalchinese               | traditionalchinese  |

</RouteEn>

### News by author

<RouteEn author="kevinschaul" example="/nytimes/author/farhad-manjoo" path="/nytimes/author/:byline" :paramsDesc="['Author’s name in New York Times’ URL format']">

Provides all of the articles by the specified New York Times author.

</RouteEn>

### Best Seller Books

<RouteEn author="melvinto" example="/nytimes/book/combined-print-and-e-book-nonfiction" path="/nytimes/book/:category?"/>

| Category |
| -------- |
| combined-print-and-e-book-nonfiction |
| hardcover-nonfiction|
| paperback-nonfiction|
| advice-how-to-and-miscellaneous|
| combined-print-and-e-book-fiction|
| hardcover-fiction|
| trade-fiction-paperback|
| childrens-middle-grade-hardcover|
| picture-books|
| series-books|
| young-adult-hardcover|

## The Wall Street Journal (WSJ)

### News

<RouteEn author="oppilate" example="/wsj/en-us/opinion" path="/wsj/:lang/:category?" :paramsDesc="['Language, `en-us`, `zh-cn`, `zh-tw` are supported', 'Category, only supported in `en-us`. Supports `opinion`, `world_news`, `us_bussiness`, `market_news`, `technology`, `lifestyle`.']">

Provide full article RSS for WSJ topics.

</RouteEn>

## Yahoo

### News

<RouteEn author="KeiLongW" example="/yahoo-news/hk/world" path="/yahoo-news/:region/:category?" :paramsDesc="['Region','Category']">

`Region`
| Hong Kong | Taiwan | US |
| --------- | ------ | --- |
| hk | tw | en |

`Category`
| All | World | Business | Entertainment | Sports | Health |
| ------- | ----- | -------- | ------------- | ------ | ------ |
| (Empty) | world | business | entertainment | sports | health |

</RouteEn>

## Yahoo! by Author

### News

<RouteEn author="loganrockmore" example="/yahoo-author/hannah-keyser" path="/yahoo-news/:author" :paramsDesc="['Author']">

Provides all of the articles by the specified Yahoo! author.

</RouteEn>

## Yomiuri Shimbun 読売新聞

### News

<RouteEn author="Arracc" example="/yomiuri/news" path="/yomiuri/:category" :paramsDesc="['category']">

Free articles only.

| 新着・速報   | 　　社会     | 政治       | 経済      | スポーツ   | 国際    | 科学・ＩＴ   | 選挙・世論調査  | エンタメ・文化 | 囲碁・将棋     | ライフ  | 地域    | 社説        |    皇室    |
| ------- | -------- | -------- | ------- | ------ | ----- | ------- | -------- | ------- | --------- | ---- | ----- | --------- | --------- |
| 　news 　 | national | politics | economy | sports | world | science | election | culture | igoshougi | life | local | editorial | koushitsu |

</RouteEn>

## 公視新聞網

### Daily News

<RouteEn author="nczitzk" example="/pts/dailynews" path="/pts/dailynews"/>
