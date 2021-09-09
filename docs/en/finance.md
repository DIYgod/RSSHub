---
pageClass: routes
---

# Finance

## CFD

### Indices Dividend Adjustment (GBP)

<RouteEn author="HenryQW" example="/cfd/div_gbp" path="/cfd/div_gbp" />

## finviz

### US Stock News

<RouteEn author="HenryQW" example="/finviz/news/AAPL" path="/finviz/news/:ticker" :paramsDesc="['The stock ticker']"/>

## TokenInsight

### Research

<RouteEn author="nczitzk" example="/tokeninsight/research" path="/tokeninsight/research/:category?/:language?" :paramsDesc="['Category, see below, News by default', 'Language, see below, English by default']">

Category

| News | Latest | Report |
| ---- | ------ | ------ |
| news | latest | report |

Language

| English | 中文 |
| ------- | ---- |
| en      | cn   |

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
