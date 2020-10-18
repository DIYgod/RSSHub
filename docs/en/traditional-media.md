---
pageClass: routes
---

# News

## ABC News

### Site

<Route author="nczitzk" example="/abc" path="/abc/:site?" :paramsDesc="['Site, see below']">

Site

| Just In | Politics | World | Business | Analysis | Sport | Science | Health | Arts | Fact Check | 中文新闻 | Berita Bahasa Indonesia | Tok Pisin |
| - | - | - | - | - | - | - | - | - | - | - | - | - | - |
| justin | politics | world | business | analysis-and-opinion | sport | science | health | arts-culture | factcheck | chinese | indonesian | tok-pisin |

</Route>

## AP News

### Topics

<RouteEn author="zoenglinghou" example="/apnews/topics/apf-topnews" path="/apnews/topics/:topic" :paramsDesc="['Topic name，can be found in URL. For example: the topic name of AP Top News [https://apnews.com/apf-topnews](https://apnews.com/apf-topnews) is `apf-topnews`']" radar="1" rssbud="1"/>

## BBC

### BBC

<RouteEn author="HenryQW" example="/bbc/world-asia" path="/bbc/:channel?" :paramsDesc="['channel, default to `top stories`']">

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

## NHK

### News Web Easy

<RouteEn author="Andiedie" example="/nhk/news_web_easy" path="/nhk/news_web_easy"/>

## Reuters

### Channel

<RouteEn author="HenryQW proletarius101" example="/reuters/channel/uk/personalFinance" path="/reuters/channel/:site/:channel" :paramsDesc="['sub-site, see the supported list below','channel, please note it\'s case-sensitive']">

Supported sub-sites:

-   中国分站 `cn`：
    See [路透社中国分站](../traditional-media.html#lu-tou-she)

-   US site `us`：
    | Business | Markets | World | Politics | Tech | Breakingviews | Wealth | Life |
    | -------- | ------- | ----- | -------- | ---------- | ------------- | ------ | --------- |
    | business | markets | world | politics | technology | breakingviews | wealth | lifestyle |

-   UK site `uk`：
    | Business | World | UK | Tech | Money | Breakingviews | Life |
    | -------- | ----- | --- | ---------- | --------------- | ------------- | --------- |
    | business | world | uk | technology | personalFinance | breakingviews | lifestyle |

</RouteEn>

## RTHK

### News

RTHK offical provides full text RSS, check the offical website for detail information: <https://news.rthk.hk/rthk/en/rss.htm>

This route adds the missing photo and Link element. (Offical RSS doesn't have Link element may cause issue on some RSS client)

<RouteEn author="KeiLongW" example="/rthk-news/hk/international" path="/rthk-news/:lang/:category" :paramsDesc="['Language，Traditional Chinese`hk`，English`en`','Category']">

| local      | greaterchina       | international | finance      | sport      |
| ---------- | ------------------ | ------------- | ------------ | ---------- |
| Local News | Greater China News | World News    | Finance News | Sport News |

</RouteEn>

## SCMP

### News

<RouteEn author="proletarius101" example="/scmp/3" path="/scmp/:category_id" :paramsDesc="['Category']">

See the [official RSS page](https://www.scmp.com/rss) to get the ID of each category. This route provides fulltext that the offical feed doesn't.

</RouteEn>
## The Economist

### Category

<RouteEn author="ImSingee" example="/the-economist/latest" path="/the-economist/:endpoint" :paramsDesc="['Category name, can be found on the [official page](https://www.economist.com/rss). For example, https://www.economist.com/china/rss.xml to china']"/>

### GRE Vocabulary

<RouteEn author="xyqfer" example="/the-economist/gre-vocabulary" path="/the-economist/gre-vocabulary" />

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

通过提取文章全文，以提供比官方源更佳的阅读体验。

| Default to Chinese | Chinese-English | English | Chinese-English (Traditional Chinese) | Traditional Chinese |
| ------------------ | --------------- | ------- | ------------------------------------- | ------------------- |
| (空)               | dual            | en      | dual-traditionalchinese               | traditionalchinese  |

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
