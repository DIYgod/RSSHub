import RouteEn from '@site/src/components/RouteEn';

# 💰 Finance

## Bloomberg

### News

<RouteEn author="bigfei" example="/bloomberg" path="/bloomberg/:site?" paramsDesc={['Site, see below, News by default']} anticrawler="1">

| Site | Name |
| ---- | ---- |
| / | News |
| bpol | Politics |
| bbiz | Business |
| markets | Markets |
| technology | Technology |
| green | Green |
| wealth | Wealth |
| pursuits | Pursuits |
| bview | Opinion |
| equality | Equality |
| businessweek | Businessweek |
| citylab | CityLab |

</RouteEn>

### Authors

<RouteEn author="josh" example="/bloomberg/authors/ARbTQlRLRjE/matthew-s-levine" path="/bloomberg/authors/:id/:slug/:source?" paramsDesc={['Author ID, can be found in URL', 'Author Slug, can be found in URL', 'Data source, either `api` or `rss`,`api` by default']} anticrawler="1" radar="1"/>

## CFD

### Indices Dividend Adjustment (GBP)

<RouteEn author="HenryQW" example="/cfd/div_gbp" path="/cfd/div_gbp" />

## Finology Insider

### Bullets

<RouteEn author="Rjnishant530" example="/finology/bullets" path="/finology/bullets" radar="1"/>

### Category

<RouteEn author="Rjnishant530" example="/finology/success-stories" path="/finology/:category" paramDesc={['Refer Table below or find in URL']} radar="1">

:::note Category

| Category           | Link                  |
|---------------------|-----------------------|
| **Business**       | business              |
| Big Shots          | entrepreneurship     |
| Startups           | startups-india        |
| Brand Games        | success-stories       |
| Juicy Scams        | juicy-scams           |
| **Finance**        | finance               |
| Macro Moves        | economy               |
| News Platter       | market-news           |
| Tax Club           | tax                   |
| Your Money         | your-money            |
| **Invest**         | investing             |
| Stock Market       | stock-market          |
| Financial Ratios   | stock-ratios          |
| Investor's Psychology | behavioral-finance  |
| Mutual Funds       | mutual-fund           |

:::

</RouteEn>

### Most Viewed

<RouteEn author="Rjnishant530" example="/finology/most-viewed/monthly" path="/finology/most-viewed/:time" paramDesc={['Accepts : `alltime` or `monthly` only']} radar="1"/>

### Trending Topic

<RouteEn author="Rjnishant530" example="/finology/tag/startups" path="/tag/:topic" paramDesc={['Refer Table below or find in URL']} radar="1">

:::note Topic

| Topic              | Link                  |
|---------------------|-----------------------|
| Investment Decisions | investment-decisions |
| Investing 101       | investing-101         |
| Stock Markets      | stock-markets         |
| business news india | business-news-india   |
| Company Analysis   | company-analysis      |
| Business and brand tales | business-and-brand-tales |
| Featured           | featured              |
| Fundamental Analysis | fundamental-analysis |
| Business Story     | business-story        |
| All Biz            | all-biz               |
| Stock Analysis     | stock-analysis        |
| Automobile Industry | automobile-industry   |
| Indian Economy     | indian-economy        |
| Govt's Words       | govt%27s-words        |
| Behavioral Finance | behavioral-finance    |
| Global Economy     | global-economy        |
| Startups           | startups              |
| GST                | gst                   |
| Product Review     | product-review        |
| My Pocket          | my-pocket             |
| Business Games     | business-games        |
| Business Models    | business-models       |
| Indian Indices     | indian-indices        |
| Banking System     | banking-system        |
| Debt               | debt                  |
| World News         | world-news            |
| Technology         | technology            |
| Regulatory Bodies  | regulatory-bodies     |

:::

</RouteEn>

## finviz

### News

<RouteEn author="nczitzk" example="/finviz" path="/finviz/:category?" paramsDesc={['Category, see below, News by default']}>

| News | Blog |
| ---- | ---- |
| news | blog |

</RouteEn>

### US Stock News

<RouteEn author="HenryQW" example="/finviz/news/AAPL" path="/finviz/news/:ticker" paramsDesc={['The stock ticker']}/>

## Followin

### Home

<RouteEn author="TonyRL" example="/followin" path="/followin/:categoryId?/:lang?" paramsDesc={['Category ID, see table below, `1` by default', 'Language, see table below, `en` by default']} radar="1">

Category ID

| For You | Market | Meme | BRC20 | NFT | Thread | In-depth | Tutorials | Videos |
| ------- | ------ | ---- | ----- | --- | ------ | -------- | --------- | ------ |
| 1       | 9      | 13   | 14    | 3   | 5      | 6        | 8         | 11     |

Language

| English | 简体中文 | 繁體中文 | Tiếng Việt |
| ------- | ------- | -------- | ---------- |
| en      | zh-Hans | zh-Hant  | vi      |

</RouteEn>

### News

<RouteEn author="TonyRL" example="/followin/news" path="/followin/news/:lang?" paramsDesc={['Language, see table above, `en` by default']} radar="1" />

### KOL

<RouteEn author="TonyRL" example="/followin/kol/4075592991" path="/followin/kol/:kolId/:lang?" paramsDesc={['KOL ID, can be found in URL', 'Language, see table above, `en` by default']} radar="1" />

### Topic

<RouteEn author="TonyRL" example="/followin/topic/40" path="/followin/topic/:topicId/:lang?" paramsDesc={['Topic ID, can be found in URL', 'Language, see table above, `en` by default']} radar="1" />

### Tag

<RouteEn author="TonyRL" example="/followin/tag/177008" path="/followin/tag/:tagId/:lang?" paramsDesc={['Tag ID, can be found in URL', 'Language, see table above, `en` by default']} radar="1" />

## Futubull

### Headlines

<RouteEn author="Wsine nczitzk" example="/futunn/main" path="/futunn/main" />

## FX Markets

### Channel

<RouteEn author="mikkkee" example="/fx-markets/trading" path="/fx-markets/:channel" paramsDesc={['channel, can be found in the navi bar links at the home page']}>

| Trading | Infrastructure | Tech and Data | Regulation |
| ------- | -------------- | ------------- | ---------- |
| trading | infrastructure | tech-and-data | regulation |

</RouteEn>

## Paradigm

### Writing

<RouteEn author="Fatpandac" example="/paradigm/writing" path="/paradigm/writing" />

## Seeking Alpha

### Summary

<RouteEn author="TonyRL" example="/seekingalpha/TSM/transcripts" path="/seekingalpha/:symbol/:category?" paramsDesc={['Stock symbol', 'Category, see below, `news` by default']} radar="1" rssbud="1">

| Analysis | News | Transcripts | Press Releases | Related Analysis |
| ------- | ------- | -------- | ---- | ------ |
| analysis | news | transcripts | press-releases | related-analysis |

</RouteEn>

## Stock Edge

### Daily Updates News

<RouteEn author="Rjnishant530" example="/stockedge/daily-updates/news" path="/stockedge/daily-updates/news" radar="1"/>

## TokenInsight

:::tip Tips

TokenInsight also provides official RSS, you can take a look at <https://api.tokeninsight.com/reference/rss>.

:::

### Blogs

<RouteEn author="fuergaosi233" example="/tokeninsight/blog/en" path="/tokeninsight/blog/:lang?" paramsDesc={['Language, see below, Chinese by default']} />

### Latest

<RouteEn author="fuergaosi233" example="/tokeninsight/bulletin/en" path="/tokeninsight/bulletin/:lang?" paramsDesc={['Language, see below, Chinese by default']} />

### Research

<RouteEn author="fuergaosi233" example="/tokeninsight/report/en" path="/tokeninsight/report/:lang?" paramsDesc={['Language, see below, Chinese by default']}>

Language:

| Chinese | English |
| ------- | ------- |
| zh      | en      |

</RouteEn>

## Unusual Whales

### News Flow

<RouteEn author="TonyRL" example="/unusualwhales/news" path="/unusualwhales/news" radar="1" rssbud="1" />

## World Economic Forum

### Report

<RouteEn author="nczitzk" example="/weforum/report" path="/weforum/report/:lang?/:year?/:platform?" paramsDesc={['Language, see below, `en` by default', 'Year, filter by year, all by default', 'Platform, filter by platform, all by default']}>

Languages

| English | Español | Français | 中文 | 日本語 |
| ------- | ------- | -------- | ---- | ------ |
| en      | es      | fr       | cn   | jp     |

See filters in [Report](https://www.weforum.org/reports) for Year and Platform these two parameters.

</RouteEn>
