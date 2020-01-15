---
pageClass: routes
---

# News

## BBC

### BBC

<RouteEn author="HenryQW" example="/bbc/chinese" path="/bbc/:channel?" :paramsDesc="['channel, default to `top stories`']">

Provides a better reading experience (full text articles) over the official ones.

Support major channels, refer to [BBC RSS feeds](https://www.bbc.co.uk/news/10628494). Eg, `business` for `https://feeds.bbci.co.uk/news/business/rss.xml`.

-   Channel with a single path, such as `https://feeds.bbci.co.uk/news/business/rss.xml`, use `/bbc/business`.
-   Channel contains multiple paths, such as `https://feeds.bbci.co.uk/news/world/asia/rss.xml`, replace `/` with `-`, `/bbc/world-asia`.
-   Exemption: use `/bbc/chinese` for BBC News Chinese, `/bbc/traditionalchinese` for Traditional Chinese.

</RouteEn>

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

| Default to Chinese | Chinese-English | English |
| ------------------ | --------------- | ------- |
| (空)               | dual            | en      |

</RouteEn>
