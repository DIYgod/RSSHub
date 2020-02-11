---
pageClass: routes
---

# News

## AP News

### Topics

<Route author="zoenglinghou" example="/apnews/topics/apf-topnews" path="/apnews/topics/:topic" :paramsDesc="['Topic name，can be found in URL. For example: the topic name of AP Top News [https://apnews.com/apf-topnews](https://apnews.com/apf-topnews) is `apf-topnews`']"/>

## BBC

### BBC

<RouteEn author="HenryQW" example="/bbc/chinese" path="/bbc/:channel?" :paramsDesc="['channel, default to `top stories`']">

Provides a better reading experience (full text articles) over the official ones.

Support major channels, refer to [BBC RSS feeds](https://www.bbc.co.uk/news/10628494). Eg, `business` for `https://feeds.bbci.co.uk/news/business/rss.xml`.

-   Channel with a single path, such as `https://feeds.bbci.co.uk/news/business/rss.xml`, use `/bbc/business`.
-   Channel contains multiple paths, such as `https://feeds.bbci.co.uk/news/world/asia/rss.xml`, replace `/` with `-`, `/bbc/world-asia`.
-   Exemption: use `/bbc/chinese` for BBC News Chinese, `/bbc/traditionalchinese` for Traditional Chinese.

</RouteEn>

## China Dialogue

### Topics

<Route author="zoenglinghou" example="/chinadialogue/topics/cities" path="/chinadialogue/topics/:topic" :paramsDesc="['Topics']">

| Business | Cities | Climate Change            | Conservation | Governance & Law   | Health and Food | Natural Disasters | Pollution | Science & Tech   | Security | Water |
| -------- | ------ | ------------------------- | ------------ | ------------------ | --------------- | ----------------- | --------- | ---------------- | -------- | ----- |
| business | cities | climate-change-and-energy | conservation | governance-and-law | health-and-food | natural-disasters | pollution | science-and-tech | security | water |

</Route>

### Columns

<Route author="zoenglinghou" example="/chinadialogue/article" path="/chinadialogue/:column" :paramsDesc="['栏目分类']">

| Articles | Blogs | Culture | Reports |
| -------- | ----- | ------- | ------- |
| article  | blog  | culture | reports |

</Route>

## China Times

### News

<RouteEn author="luyuhuang" example="/chinatimes/realtimenews" path="/chinatimes/:caty" :paramsDesc="['category']" radar="1">

| realtimenews   | politic | opinion | life | star    | money   | society | hottopic   | tube   | world | armament | chinese           | fashion | sports | technologynews  | travel | album   |
| -------------- | ------- | ------- | ---- | ------- | ------- | ------- | ---------- | ------ | ----- | -------- | ----------------- | ------- | ------ | --------------- | ------ | ------- |
| Real Time News | Politic | Opinion | Life | Showbiz | Finance | Society | Hot Topics | Videos | World | Military | Mainland & Taiwan | Fashion | Sports | Technology News | Travel | Columns |

</RouteEn>

## NHK

### News Web Easy

<RouteEn author="Andiedie" example="/nhk/news_web_easy" path="/nhk/news_web_easy"/>

## RTHK

### News

RTHK offical provides full text RSS, check the offical website for detail information: <https://news.rthk.hk/rthk/en/rss.htm>

This route adds the missing photo and Link element. (Offical RSS doesn't have Link element may cause issue on some RSS client)

<Route author="KeiLongW" example="/rthk-news/hk/international" path="/rthk-news/:lang/:category" :paramsDesc="['Language，Traditional Chinese`hk`，English`en`','Category']">

| local      | greaterchina       | international | finance      | sport      |
| ---------- | ------------------ | ------------- | ------------ | ---------- |
| Local News | Greater China News | World News    | Finance News | Sport News |

</Route>

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

<Route author="KeiLongW" example="/yahoo-news/hk/world" path="/yahoo-news/:region/:category?" :paramsDesc="['Region','Category']">

`Region`
| Hong Kong | Taiwan | US |
| --------- | ------ | --- |
| hk | tw | en |

`Category`
| All | World | Business | Entertainment | Sports | Health |
| ------- | ----- | -------- | ------------- | ------ | ------ |
| (Empty) | world | business | entertainment | sports | health |

</Route>
