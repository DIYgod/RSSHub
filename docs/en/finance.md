---
pageClass: routes
---

# Finance

## CFD

### Indices Dividend Adjustment (GBP)

<RouteEn author="HenryQW" example="/cfd/div_gbp" path="/cfd/div_gbp" />

## finviz

### News

<RouteEn author="nczitzk" example="/finviz" path="/finviz/:category?" :paramsDesc="['Category, see below, News by default']">

| News | Blog |
| ---- | ---- |
| news | blog |

</RouteEn>

### US Stock News

<RouteEn author="HenryQW" example="/finviz/news/AAPL" path="/finviz/news/:ticker" :paramsDesc="['The stock ticker']"/>

## FX Markets

### Channel

<RouteEn author="mikkkee" example="/fx-markets/trading" path="/fx-markets/:channel" :paramsDesc="['channel, can be found in the navi bar links at the home page']">

| Trading | Infrastructure | Tech and Data | Regulation |
| ------- | -------------- | ------------- | ---------- |
| trading | infrastructure | tech-and-data | regulation |

</RouteEn>

## Seeking Alpha

### Summary

<RouteEn author="TonyRL" example="/seekingalpha/TSM/transcripts" path="/seekingalpha/:symbol/:category?" :paramsDesc="['Stock symbol', 'Category, see below, `news` by default']" radar="1" rssbud="1">

| Analysis | News | Transcripts | Press Releases | Related Analysis |
| ------- | ------- | -------- | ---- | ------ |
| analysis | news | transcripts | press-releases | related-analysis |

</RouteEn>

## TokenInsight

::: tip Tips

TokenInsight also provides official RSS, you can take a look at <https://api.tokeninsight.com/reference/rss>.

:::

### Blogs

<RouteEn author="fuergaosi233" example="/tokeninsight/blog/en" path="/tokeninsight/blog/:lang?" :paramsDesc="['Language, see below, Chinese by default']" />

### Latest

<RouteEn author="fuergaosi233" example="/tokeninsight/bulletin/en" path="/tokeninsight/bulletin/:lang?" :paramsDesc="['Language, see below, Chinese by default']" />

### Research

<RouteEn author="fuergaosi233" example="/tokeninsight/report/en" path="/tokeninsight/report/:lang?" :paramsDesc="['Language, see below, Chinese by default']">

Language:

| Chinese | English |
| ------- | ------- |
| zh      | en      |

</RouteEn>

## World Economic Forum

### Report

<RouteEn author="nczitzk" example="/weforum/report" path="/weforum/report/:lang?/:year?/:platform?" :paramsDesc="['Language, see below, `en` by default', 'Year, filter by year, all by default', 'Platform, filter by platform, all by default']">

Languages

| English | Español | Français | 中文 | 日本語 |
| ------- | ------- | -------- | ---- | ------ |
| en      | es      | fr       | cn   | jp     |

See filters in [Report](https://www.weforum.org/reports) for Year and Platform these two parameters.

</RouteEn>
