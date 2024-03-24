# 💰 金融

## AInvest <Site url="ainvest.com"/>

### Latest Article <Site url="ainvest.com/news" size="sm" />

<Route namespace="ainvest" :data='{"path":"/article","categories":["finance"],"example":"/ainvest/article","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["ainvest.com/news"]}],"name":"Latest Article","maintainers":["TonyRL"],"url":"ainvest.com/news","location":"article.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### Latest News <Site url="ainvest.com/news" size="sm" />

<Route namespace="ainvest" :data='{"path":"/news","categories":["finance"],"example":"/ainvest/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["ainvest.com/news"]}],"name":"Latest News","maintainers":["TonyRL"],"url":"ainvest.com/news","location":"news.ts"}' :test='{"code":0}' />

## BigQuant <Site url="bigquant.com"/>

### 专题报告 <Site url="bigquant.com/" size="sm" />

<Route namespace="bigquant" :data='{"path":"/collections","categories":["finance"],"example":"/bigquant/collections","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["bigquant.com/"]}],"name":"专题报告","maintainers":["nczitzk"],"url":"bigquant.com/","location":"collections.ts"}' :test='{"code":0}' />

## Bloomberg <Site url="www.bloomberg.com"/>

### Authors <Site url="www.bloomberg.com" size="sm" />

<Route namespace="bloomberg" :data='{"path":"/authors/:id/:slug/:source?","categories":["finance"],"example":"/bloomberg/authors/ARbTQlRLRjE/matthew-s-levine","parameters":{"id":"Author ID, can be found in URL","slug":"Author Slug, can be found in URL","source":"Data source, either `api` or `rss`,`api` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.bloomberg.com/*/authors/:id/:slug","www.bloomberg.com/authors/:id/:slug"],"target":"/authors/:id/:slug"}],"name":"Authors","maintainers":["josh"],"location":"authors.ts"}' :test='{"code":0}' />

### Unknown <Site url="www.bloomberg.com" size="sm" />

<Route namespace="bloomberg" :data='{"path":["/:site","/"],"name":"Unknown","maintainers":[],"location":"index.ts"}' :test='undefined' />

### Unknown <Site url="www.bloomberg.com" size="sm" />

<Route namespace="bloomberg" :data='{"path":["/:site","/"],"name":"Unknown","maintainers":[],"location":"index.ts"}' :test='undefined' />

## DT 财经 <Site url="dtcj.com"/>

### 数据侠专栏 <Site url="dtcj.com" size="sm" />

<Route namespace="dtcj" :data='{"path":"/datahero/:category?","categories":["finance"],"example":"/dtcj/datahero","parameters":{"category":"分类，见下表，默认为全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"数据侠专栏","maintainers":["nczitzk"],"description":"| 侠创 | 纽约数据科学学院 | RS 实验所 | 阿里云天池 |\n  | ---- | ---------------- | --------- | ---------- |\n  | 5    | 6                | 9         | 10         |","location":"datahero.ts"}' :test='{"code":0}' />

| 侠创 | 纽约数据科学学院 | RS 实验所 | 阿里云天池 |
  | ---- | ---------------- | --------- | ---------- |
  | 5    | 6                | 9         | 10         |

### 数据洞察 <Site url="dtcj.com/dtcj/datainsight" size="sm" />

<Route namespace="dtcj" :data='{"path":"/datainsight/:id?","categories":["finance"],"example":"/dtcj/datainsight","parameters":{"id":"分类，见下表，默认为全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["dtcj.com/insighttopic/:id"],"target":"/datainsight/:id"}],"name":"数据洞察","maintainers":["nczitzk"],"url":"dtcj.com/dtcj/datainsight","description":"| 城数 | NEXT 情报局 | 专业精选 |\n  | ---- | ----------- | -------- |\n  | 3    | 1           | 4        |","location":"datainsight.ts"}' :test='{"code":0}' />

| 城数 | NEXT 情报局 | 专业精选 |
  | ---- | ----------- | -------- |
  | 3    | 1           | 4        |

## Finology Insider <Site url="insider.finology.in"/>

### Bullets <Site url="insider.finology.in/bullets" size="sm" />

<Route namespace="finology" :data='{"path":"/bullets","categories":["finance"],"example":"/finology/bullets","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["insider.finology.in/bullets"]}],"name":"Bullets","maintainers":["Rjnishant530"],"url":"insider.finology.in/bullets","location":"bullets.ts"}' :test='{"code":1,"message":"expected NaN to be greater than -432000000"}' />

### Category <Site url="insider.finology.in" size="sm" />

<Route namespace="finology" :data='{"path":["/:category","/tag/:topic"],"categories":["finance"],"example":"/finology/success-stories","parameters":{"category":"N"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["insider.finology.in/:category"]}],"name":"Category","maintainers":["Rjnishant530"],"description":":::note Category\n  | Category              | Link               |\n  | --------------------- | ------------------ |\n  | **Business**          | business           |\n  | Big Shots             | entrepreneurship   |\n  | Startups              | startups-india     |\n  | Brand Games           | success-stories    |\n  | Juicy Scams           | juicy-scams        |\n  | **Finance**           | finance            |\n  | Macro Moves           | economy            |\n  | News Platter          | market-news        |\n  | Tax Club              | tax                |\n  | Your Money            | your-money         |\n  | **Invest**            | investing          |\n  | Stock Market          | stock-market       |\n  | Financial Ratios      | stock-ratios       |\n  | Investor&#39;s Psychology | behavioral-finance |\n  | Mutual Funds          | mutual-fund        |\n  :::","location":"tag.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

:::note Category
  | Category              | Link               |
  | --------------------- | ------------------ |
  | **Business**          | business           |
  | Big Shots             | entrepreneurship   |
  | Startups              | startups-india     |
  | Brand Games           | success-stories    |
  | Juicy Scams           | juicy-scams        |
  | **Finance**           | finance            |
  | Macro Moves           | economy            |
  | News Platter          | market-news        |
  | Tax Club              | tax                |
  | Your Money            | your-money         |
  | **Invest**            | investing          |
  | Stock Market          | stock-market       |
  | Financial Ratios      | stock-ratios       |
  | Investor's Psychology | behavioral-finance |
  | Mutual Funds          | mutual-fund        |
  :::

### Category <Site url="insider.finology.in" size="sm" />

<Route namespace="finology" :data='{"path":["/:category","/tag/:topic"],"categories":["finance"],"example":"/finology/success-stories","parameters":{"category":"N"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["insider.finology.in/:category"]}],"name":"Category","maintainers":["Rjnishant530"],"description":":::note Category\n  | Category              | Link               |\n  | --------------------- | ------------------ |\n  | **Business**          | business           |\n  | Big Shots             | entrepreneurship   |\n  | Startups              | startups-india     |\n  | Brand Games           | success-stories    |\n  | Juicy Scams           | juicy-scams        |\n  | **Finance**           | finance            |\n  | Macro Moves           | economy            |\n  | News Platter          | market-news        |\n  | Tax Club              | tax                |\n  | Your Money            | your-money         |\n  | **Invest**            | investing          |\n  | Stock Market          | stock-market       |\n  | Financial Ratios      | stock-ratios       |\n  | Investor&#39;s Psychology | behavioral-finance |\n  | Mutual Funds          | mutual-fund        |\n  :::","location":"tag.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

:::note Category
  | Category              | Link               |
  | --------------------- | ------------------ |
  | **Business**          | business           |
  | Big Shots             | entrepreneurship   |
  | Startups              | startups-india     |
  | Brand Games           | success-stories    |
  | Juicy Scams           | juicy-scams        |
  | **Finance**           | finance            |
  | Macro Moves           | economy            |
  | News Platter          | market-news        |
  | Tax Club              | tax                |
  | Your Money            | your-money         |
  | **Invest**            | investing          |
  | Stock Market          | stock-market       |
  | Financial Ratios      | stock-ratios       |
  | Investor's Psychology | behavioral-finance |
  | Mutual Funds          | mutual-fund        |
  :::

### Most Viewed <Site url="insider.finology.in" size="sm" />

<Route namespace="finology" :data='{"path":"/most-viewed/:time","categories":["finance"],"example":"/finology/most-viewed/monthly","parameters":{"time":"N"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["insider.finology.in/:category"],"target":"/:category"}],"name":"Most Viewed","maintainers":["Rjnishant530"],"location":"most-viewed.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

## finviz <Site url="finviz.com"/>

### News <Site url="finviz.com/news.ashx" size="sm" />

<Route namespace="finviz" :data='{"path":"/:category?","categories":["finance"],"example":"/finviz","parameters":{"category":"Category, see below, News by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["finviz.com/news.ashx","finviz.com/"]}],"name":"News","maintainers":["nczitzk"],"url":"finviz.com/news.ashx","description":"| News | Blog |\n  | ---- | ---- |\n  | news | blog |","location":"news.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

| News | Blog |
  | ---- | ---- |
  | news | blog |

### US Stock News <Site url="finviz.com" size="sm" />

<Route namespace="finviz" :data='{"path":"/news/:ticker","categories":["finance"],"example":"/finviz/news/AAPL","parameters":{"ticker":"The stock ticker"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"US Stock News","maintainers":["HenryQW"],"location":"quote.ts"}' :test='{"code":1,"message":"expected NaN to be greater than -432000000"}' />

## Followin <Site url="followin.io"/>

### Home <Site url="followin.io" size="sm" />

<Route namespace="followin" :data='{"path":"/:categoryId?/:lang?","categories":["finance"],"example":"/followin","parameters":{"categoryId":"Category ID, see table below, `1` by default","lang":"Language, see table below, `en` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Home","maintainers":["TonyRL"],"description":"Category ID\n\n  | For You | Market | Meme | BRC20 | NFT | Thread | In-depth | Tutorials | Videos |\n  | ------- | ------ | ---- | ----- | --- | ------ | -------- | --------- | ------ |\n  | 1       | 9      | 13   | 14    | 3   | 5      | 6        | 8         | 11     |\n\n  Language\n\n  | English | 简体中文 | 繁體中文 | Tiếng Việt |\n  | ------- | -------- | -------- | ---------- |\n  | en      | zh-Hans  | zh-Hant  | vi         |","location":"index.ts"}' :test='{"code":0}' />

Category ID

  | For You | Market | Meme | BRC20 | NFT | Thread | In-depth | Tutorials | Videos |
  | ------- | ------ | ---- | ----- | --- | ------ | -------- | --------- | ------ |
  | 1       | 9      | 13   | 14    | 3   | 5      | 6        | 8         | 11     |

  Language

  | English | 简体中文 | 繁體中文 | Tiếng Việt |
  | ------- | -------- | -------- | ---------- |
  | en      | zh-Hans  | zh-Hant  | vi         |

### KOL <Site url="followin.io" size="sm" />

<Route namespace="followin" :data='{"path":"/kol/:kolId/:lang?","categories":["finance"],"example":"/followin/kol/4075592991","parameters":{"kolId":"KOL ID, can be found in URL","lang":"Language, see table above, `en` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["followin.io/:lang/kol/:kolId","followin.io/kol/:kolId"]}],"name":"KOL","maintainers":["TonyRL"],"location":"kol.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### News <Site url="followin.io" size="sm" />

<Route namespace="followin" :data='{"path":"/news/:lang?","categories":["finance"],"example":"/followin/news","parameters":{"lang":"Language, see table above, `en` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["followin.io/:lang?/news","followin.io/news"]}],"name":"News","maintainers":["TonyRL"],"location":"news.ts"}' :test='{"code":0}' />

### Tag <Site url="followin.io" size="sm" />

<Route namespace="followin" :data='{"path":"/tag/:tagId/:lang?","categories":["finance"],"example":"/followin/tag/177008","parameters":{"tagId":"Tag ID, can be found in URL","lang":"Language, see table above, `en` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["followin.io/:lang/tag/:tagId","followin.io/tag/:tagId"]}],"name":"Tag","maintainers":["TonyRL"],"location":"tag.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### Topic <Site url="followin.io" size="sm" />

<Route namespace="followin" :data='{"path":"/topic/:topicId/:lang?","categories":["finance"],"example":"/followin/topic/40","parameters":{"topicId":"Topic ID, can be found in URL","lang":"Language, see table above, `en` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["followin.io/:lang/topic/:topicId","followin.io/topic/:topicId"]}],"name":"Topic","maintainers":["TonyRL"],"location":"topic.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

## FX Markets <Site url="fx-markets.com"/>

### Channel <Site url="fx-markets.com" size="sm" />

<Route namespace="fx-markets" :data='{"path":"/:channel","categories":["finance"],"example":"/fx-markets/trading","parameters":{"channel":"channel, can be found in the navi bar links at the home page"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Channel","maintainers":[],"description":"| Trading | Infrastructure | Tech and Data | Regulation |\n  | ------- | -------------- | ------------- | ---------- |\n  | trading | infrastructure | tech-and-data | regulation |","location":"channel.ts"}' :test='undefined' />

| Trading | Infrastructure | Tech and Data | Regulation |
  | ------- | -------------- | ------------- | ---------- |
  | trading | infrastructure | tech-and-data | regulation |

## Paradigm <Site url="paradigm.xyz"/>

### Writing <Site url="paradigm.xyz/writing" size="sm" />

<Route namespace="paradigm" :data='{"path":"/writing","categories":["finance"],"example":"/paradigm/writing","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["paradigm.xyz/writing"]}],"name":"Writing","maintainers":["Fatpandac"],"url":"paradigm.xyz/writing","location":"writing.ts"}' :test='{"code":0}' />

## Seeking Alpha <Site url="seekingalpha.com"/>

### Summary <Site url="seekingalpha.com" size="sm" />

<Route namespace="seekingalpha" :data='{"path":"/:symbol/:category?","categories":["finance"],"example":"/seekingalpha/TSM/transcripts","parameters":{"symbol":"Stock symbol","category":"Category, see below, `news` by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["seekingalpha.com/symbol/:symbol/:category","seekingalpha.com/symbol/:symbol/earnings/:category"],"target":"/:symbol/:category"}],"name":"Summary","maintainers":["TonyRL"],"description":"| Analysis | News | Transcripts | Press Releases | Related Analysis |\n  | -------- | ---- | ----------- | -------------- | ---------------- |\n  | analysis | news | transcripts | press-releases | related-analysis |","location":"index.ts"}' :test='{"code":0}' />

| Analysis | News | Transcripts | Press Releases | Related Analysis |
  | -------- | ---- | ----------- | -------------- | ---------------- |
  | analysis | news | transcripts | press-releases | related-analysis |

## Stock Edge <Site url="web.stockedge.com"/>

### Daily Updates News <Site url="web.stockedge.com/daily-updates/news" size="sm" />

<Route namespace="stockedge" :data='{"path":"/daily-updates/news","categories":["finance"],"example":"/stockedge/daily-updates/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["web.stockedge.com/daily-updates/news"]}],"name":"Daily Updates News","maintainers":["Rjnishant530"],"url":"web.stockedge.com/daily-updates/news","location":"daily-news.ts"}' :test='{"code":1,"message":"expected [ …(9) ] to not include &#39;https://web.stockedge.com/share/hindu…&#39;"}' />

## TokenInsight <Site url="tokeninsight.com"/>

:::tip
TokenInsight also provides official RSS, you can take a look at [https://api.tokeninsight.com/reference/rss](https://api.tokeninsight.com/reference/rss).
:::

### Blogs <Site url="tokeninsight.com" size="sm" />

<Route namespace="tokeninsight" :data='{"path":"/blog/:lang?","categories":["finance"],"example":"/tokeninsight/blog/en","parameters":{"lang":"Language, see below, Chinese by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["tokeninsight.com/:lang/blogs"],"target":"/blog/:lang"}],"name":"Blogs","maintainers":["fuergaosi233"],"location":"blog.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### Latest <Site url="tokeninsight.com" size="sm" />

<Route namespace="tokeninsight" :data='{"path":"/bulletin/:lang?","categories":["finance"],"example":"/tokeninsight/bulletin/en","parameters":{"lang":"Language, see below, Chinese by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["tokeninsight.com/:lang/latest"],"target":"/bulletin/:lang"}],"name":"Latest","maintainers":[],"location":"bulletin.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### Research <Site url="tokeninsight.com" size="sm" />

<Route namespace="tokeninsight" :data='{"path":"/report/:lang?","categories":["finance"],"example":"/tokeninsight/report/en","parameters":{"lang":"Language, see below, Chinese by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["tokeninsight.com/:lang/report"],"target":"/report/:lang"}],"name":"Research","maintainers":[],"description":"Language:\n\n  | Chinese | English |\n  | ------- | ------- |\n  | zh      | en      |","location":"report.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

Language:

  | Chinese | English |
  | ------- | ------- |
  | zh      | en      |

## Unusual Whales <Site url="unusualwhales.com"/>

### News Flow <Site url="unusualwhales.com/news" size="sm" />

<Route namespace="unusualwhales" :data='{"path":"/news","categories":["finance"],"example":"/unusualwhales/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["unusualwhales.com/news","unusualwhales.com/"]}],"name":"News Flow","maintainers":["TonyRL"],"url":"unusualwhales.com/news","location":"news.ts"}' :test='{"code":0}' />

## 巴伦周刊中文版 <Site url="barronschina.com.cn"/>

### 栏目 <Site url="barronschina.com.cn/" size="sm" />

<Route namespace="barronschina" :data='{"path":"/:id?","categories":["finance"],"example":"/barronschina","parameters":{"id":"栏目 id，默认为快讯"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["barronschina.com.cn/"],"target":"/:category?"}],"name":"栏目","maintainers":["nczitzk"],"url":"barronschina.com.cn/","description":":::tip\n  栏目 id 留空则返回快讯，在对应页地址栏 `columnId=` 后可以看到。\n  :::","location":"index.ts"}' :test='{"code":1,"message":"expected [ Array(1) ] to not include &#39;http://www.barronschina.com.cn/index/…&#39;"}' />

:::tip
  栏目 id 留空则返回快讯，在对应页地址栏 `columnId=` 后可以看到。
  :::

## 百度 <Site url="www.baidu.com"/>

### 首页指数 <Site url="gushitong.baidu.com/" size="sm" />

<Route namespace="baidu" :data='{"path":"/gushitong/index","categories":["finance"],"example":"/baidu/gushitong/index","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["gushitong.baidu.com/"]}],"name":"首页指数","maintainers":["CaoMeiYouRen"],"url":"gushitong.baidu.com/","location":"gushitong/index.ts"}' :test='{"code":0}' />

## 北京证券交易所 <Site url="bse.cn"/>

### 栏目 <Site url="bse.cn/" size="sm" />

<Route namespace="bse" :data='{"path":"/:category?/:keyword?","categories":["finance"],"example":"/bse","parameters":{"category":"分类，见下表，默认为本所要闻","keyword":"关键字，默认为空"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["bse.cn/"]}],"name":"栏目","maintainers":["nczitzk"],"url":"bse.cn/","description":"| 本所要闻        | 人才招聘 | 采购信息 | 业务通知   |\n  | --------------- | -------- | -------- | ---------- |\n  | important_news | recruit  | purchase | news_list |\n\n  | 法律法规  | 公开征求意见    | 部门规章         | 发行融资   |\n  | --------- | --------------- | ---------------- | ---------- |\n  | law_list | public_opinion | regulation_list | fxrz_list |\n\n  | 持续监管   | 交易管理   | 市场管理   | 上市委会议公告  |\n  | ---------- | ---------- | ---------- | --------------- |\n  | cxjg_list | jygl_list | scgl_list | meeting_notice |\n\n  | 上市委会议结果公告 | 上市委会议变更公告 | 并购重组委会议公告 |\n  | ------------------ | ------------------ | ------------------ |\n  | meeting_result    | meeting_change    | bgcz_notice       |\n\n  | 并购重组委会议结果公告 | 并购重组委会议变更公告 | 终止审核           | 注册结果      |\n  | ---------------------- | ---------------------- | ------------------ | ------------- |\n  | bgcz_result           | bgcz_change           | termination_audit | audit_result |","location":"index.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

| 本所要闻        | 人才招聘 | 采购信息 | 业务通知   |
  | --------------- | -------- | -------- | ---------- |
  | important_news | recruit  | purchase | news_list |

  | 法律法规  | 公开征求意见    | 部门规章         | 发行融资   |
  | --------- | --------------- | ---------------- | ---------- |
  | law_list | public_opinion | regulation_list | fxrz_list |

  | 持续监管   | 交易管理   | 市场管理   | 上市委会议公告  |
  | ---------- | ---------- | ---------- | --------------- |
  | cxjg_list | jygl_list | scgl_list | meeting_notice |

  | 上市委会议结果公告 | 上市委会议变更公告 | 并购重组委会议公告 |
  | ------------------ | ------------------ | ------------------ |
  | meeting_result    | meeting_change    | bgcz_notice       |

  | 并购重组委会议结果公告 | 并购重组委会议变更公告 | 终止审核           | 注册结果      |
  | ---------------------- | ---------------------- | ------------------ | ------------- |
  | bgcz_result           | bgcz_change           | termination_audit | audit_result |

## 财经网 <Site url="roll.caijing.com.cn"/>

### 滚动新闻 <Site url="roll.caijing.com.cn/index1.html" size="sm" />

<Route namespace="caijing" :data='{"path":"/roll","categories":["finance"],"example":"/caijing/roll","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["roll.caijing.com.cn/index1.html","roll.caijing.com.cn/"]}],"name":"滚动新闻","maintainers":["TonyRL"],"url":"roll.caijing.com.cn/index1.html","location":"roll.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

## 财联社 <Site url="cls.cn"/>

### 电报 <Site url="cls.cn/telegraph" size="sm" />

<Route namespace="cls" :data='{"path":"/telegraph/:category?","categories":["finance"],"example":"/cls/telegraph","parameters":{"category":"分类，见下表，默认为全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["cls.cn/telegraph","cls.cn/"],"target":"/telegraph"}],"name":"电报","maintainers":["nczitzk"],"url":"cls.cn/telegraph","description":"| 看盘  | 公司         | 解读    | 加红 | 推送  | 提醒   | 基金 | 港股 |\n  | ----- | ------------ | ------- | ---- | ----- | ------ | ---- | ---- |\n  | watch | announcement | explain | red  | jpush | remind | fund | hk   |","location":"telegraph.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

| 看盘  | 公司         | 解读    | 加红 | 推送  | 提醒   | 基金 | 港股 |
  | ----- | ------------ | ------- | ---- | ----- | ------ | ---- | ---- |
  | watch | announcement | explain | red  | jpush | remind | fund | hk   |

### 热门文章排行榜 <Site url="cls.cn/" size="sm" />

<Route namespace="cls" :data='{"path":"/hot","categories":["finance"],"example":"/cls/hot","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["cls.cn/"]}],"name":"热门文章排行榜","maintainers":["5upernova-heng","nczitzk"],"url":"cls.cn/","location":"hot.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### 深度 <Site url="cls.cn" size="sm" />

<Route namespace="cls" :data='{"path":"/depth/:category?","categories":["finance"],"example":"/cls/depth/1000","parameters":{"category":"分类代码，可在首页导航栏的目标网址 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"深度","maintainers":["nczitzk"],"description":"| 头条 | 股市 | 港股 | 环球 | 公司 | 券商 | 基金 | 地产 | 金融 | 汽车 | 科创 | 创业版 | 品见 | 期货 | 投教 |\n  | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ------ | ---- | ---- | ---- |\n  | 1000 | 1003 | 1135 | 1007 | 1005 | 1118 | 1110 | 1006 | 1032 | 1119 | 1111 | 1127   | 1160 | 1124 | 1176 |","location":"depth.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

| 头条 | 股市 | 港股 | 环球 | 公司 | 券商 | 基金 | 地产 | 金融 | 汽车 | 科创 | 创业版 | 品见 | 期货 | 投教 |
  | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ------ | ---- | ---- | ---- |
  | 1000 | 1003 | 1135 | 1007 | 1005 | 1118 | 1110 | 1006 | 1032 | 1119 | 1111 | 1127   | 1160 | 1124 | 1176 |

## 东方财富 <Site url="data.eastmoney.com"/>

### 搜索 <Site url="data.eastmoney.com" size="sm" />

<Route namespace="eastmoney" :data='{"path":"/search/:keyword","categories":["finance"],"example":"/eastmoney/search/web3","parameters":{"keyword":"关键词，可以设置为自己需要检索的关键词"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"搜索","maintainers":["drgnchan"],"location":"search/index.ts"}' :test='{"code":0}' />

### 天天基金用户动态 <Site url="data.eastmoney.com" size="sm" />

<Route namespace="eastmoney" :data='{"path":"/ttjj/user/:uid","categories":["finance"],"example":"/eastmoney/ttjj/user/6551094298949188","parameters":{"uid":"用户id, 可以通过天天基金App分享用户主页到浏览器，在相应的URL中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"天天基金用户动态","maintainers":["zidekuls"],"location":"ttjj/user.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### 研究报告 <Site url="data.eastmoney.com" size="sm" />

<Route namespace="eastmoney" :data='{"path":"/report/:category","categories":["finance"],"example":"/eastmoney/report/strategyreport","parameters":{"category":"研报类型"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["data.eastmoney.com/report/:category"]}],"name":"研究报告","maintainers":["syzq"],"description":"| 策略报告       | 宏观研究    | 券商晨报     | 行业研究 |\n  | -------------- | ----------- | ------------ | -------- |\n  | strategyreport | macresearch | brokerreport | industry |","location":"report/index.ts"}' :test='{"code":0}' />

| 策略报告       | 宏观研究    | 券商晨报     | 行业研究 |
  | -------------- | ----------- | ------------ | -------- |
  | strategyreport | macresearch | brokerreport | industry |

## 法布财经 <Site url="fastbull.cn"/>

### 快讯 <Site url="fastbull.cn/express-news" size="sm" />

<Route namespace="fastbull" :data='{"path":"/express-news","categories":["finance"],"example":"/fastbull/express-news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["fastbull.cn/express-news","fastbull.cn/"]}],"name":"快讯","maintainers":["nczitzk"],"url":"fastbull.cn/express-news","location":"express-news.ts"}' :test='{"code":0}' />

### 新闻 <Site url="fastbull.cn/news" size="sm" />

<Route namespace="fastbull" :data='{"path":["/news","/"],"categories":["finance"],"example":"/fastbull/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["fastbull.cn/news","fastbull.cn/"]}],"name":"新闻","maintainers":["nczitzk"],"url":"fastbull.cn/news","location":"news.ts"}' :test='{"code":0}' />

### 新闻 <Site url="fastbull.cn/news" size="sm" />

<Route namespace="fastbull" :data='{"path":["/news","/"],"categories":["finance"],"example":"/fastbull/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["fastbull.cn/news","fastbull.cn/"]}],"name":"新闻","maintainers":["nczitzk"],"url":"fastbull.cn/news","location":"news.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

## 格隆汇 <Site url="gelonghui.com"/>

### 实时快讯 <Site url="gelonghui.com/live" size="sm" />

<Route namespace="gelonghui" :data='{"path":"/live","categories":["finance"],"example":"/gelonghui/live","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["gelonghui.com/live","gelonghui.com/"]}],"name":"实时快讯","maintainers":[],"url":"gelonghui.com/live","location":"live.ts"}' :test='{"code":0}' />

### 首页 <Site url="gelonghui.com" size="sm" />

<Route namespace="gelonghui" :data='{"path":"/home/:tag?","categories":["finance"],"example":"/gelonghui/home","parameters":{"tag":"分类标签，见下表，默认为 `web_home_page`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"首页","maintainers":["TonyRL"],"description":"| 推荐            | 股票  | 基金 | 新股       | 研报     |\n  | --------------- | ----- | ---- | ---------- | -------- |\n  | web_home_page | stock | fund | new_stock | research |","location":"home.ts"}' :test='{"code":0}' />

| 推荐            | 股票  | 基金 | 新股       | 研报     |
  | --------------- | ----- | ---- | ---------- | -------- |
  | web_home_page | stock | fund | new_stock | research |

### 搜索关键字 <Site url="gelonghui.com" size="sm" />

<Route namespace="gelonghui" :data='{"path":"/keyword/:keyword","categories":["finance"],"example":"/gelonghui/keyword/早报","parameters":{"keyword":"搜索关键字"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"搜索关键字","maintainers":["nczitzk"],"location":"keyword.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

### 用户文章 <Site url="gelonghui.com" size="sm" />

<Route namespace="gelonghui" :data='{"path":"/user/:id","categories":["finance"],"example":"/gelonghui/user/5273","parameters":{"id":"用户编号，可在用户页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["gelonghui.com/user/:id"]}],"name":"用户文章","maintainers":["nczitzk"],"location":"user.ts"}' :test='{"code":0}' />

### 主题文章 <Site url="gelonghui.com" size="sm" />

<Route namespace="gelonghui" :data='{"path":"/subject/:id","categories":["finance"],"example":"/gelonghui/subject/4","parameters":{"id":"主题编号，可在主题页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["gelonghui.com/subject/:id"]}],"name":"主题文章","maintainers":["nczitzk"],"location":"subject.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### 最热文章 <Site url="gelonghui.com/" size="sm" />

<Route namespace="gelonghui" :data='{"path":"/hot-article/:type?","categories":["finance"],"example":"/gelonghui/hot-article","parameters":{"type":"`day` 为日排行，`week` 为周排行，默认为 `day`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["gelonghui.com/"],"target":"/hot-article"}],"name":"最热文章","maintainers":[],"url":"gelonghui.com/","location":"hot-article.ts"}' :test='{"code":0}' />

## 国家金融与发展实验室 <Site url="www.nifd.cn"/>

### 研究 <Site url="www.nifd.cn" size="sm" />

<Route namespace="nifd" :data='{"path":"/research/:categoryGuid?","categories":["finance"],"example":"/nifd/research/3333d2af-91d6-429b-be83-28b92f31b6d7","parameters":{"categoryGuid":"资讯类型，默认为周报"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"研究","maintainers":["Fatpandac"],"description":"资讯类型可以从网址中获取，如：\n\n  `http://www.nifd.cn/Research?categoryGuid=7a6a826d-b525-42aa-b550-4236e524227f` 对应 `/nifd/research/7a6a826d-b525-42aa-b550-4236e524227f`","location":"research.ts"}' :test='{"code":0}' />

资讯类型可以从网址中获取，如：

  `http://www.nifd.cn/Research?categoryGuid=7a6a826d-b525-42aa-b550-4236e524227f` 对应 `/nifd/research/7a6a826d-b525-42aa-b550-4236e524227f`

## 华储网 <Site url="mrm.com.cn"/>

### 通知 <Site url="mrm.com.cn" size="sm" />

<Route namespace="mrm" :data='{"path":"/:category?","categories":["finance"],"example":"/mrm","parameters":{"category":"N"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"通知","maintainers":["TonyRL"],"description":"| 交易通知     | 政策规定             | 业务通知          |\n  | ------------ | -------------------- | ----------------- |\n  | zonghezixun3 | zhengceguiding_list | yewutongzhi_list |","location":"index.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

| 交易通知     | 政策规定             | 业务通知          |
  | ------------ | -------------------- | ----------------- |
  | zonghezixun3 | zhengceguiding_list | yewutongzhi_list |

## 汇通网 <Site url="fx678.com"/>

### 7x24 小时快讯 <Site url="fx678.com/kx" size="sm" />

<Route namespace="fx678" :data='{"path":"/kx","categories":["finance"],"example":"/fx678/kx","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["fx678.com/kx"]}],"name":"7x24 小时快讯","maintainers":["occupy5","dousha"],"url":"fx678.com/kx","location":"kx.ts"}' :test='{"code":0}' />

## 金十数据 <Site url="jin10.com"/>

### 市场快讯 <Site url="jin10.com/" size="sm" />

<Route namespace="jin10" :data='{"path":"/:important?","categories":["finance"],"example":"/jin10","parameters":{"important":"只看重要，任意值开启，留空关闭"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["jin10.com/"],"target":""}],"name":"市场快讯","maintainers":["laampui"],"url":"jin10.com/","location":"index.ts"}' :test='{"code":0}' />

### 主题文章 <Site url="jin10.com/" size="sm" />

<Route namespace="jin10" :data='{"path":"/topic/:id","categories":["finance"],"example":"/jin10/topic/396","parameters":{"id":"N"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["xnews.jin10.com/topic/:id"]}],"name":"主题文章","maintainers":["miles170"],"url":"jin10.com/","location":"topic.ts"}' :test='{"code":0}' />

## 金色财经 <Site url="jinse.cn"/>

### 分类 <Site url="jinse.cn" size="sm" />

<Route namespace="jinse" :data='{"path":"/:category?","categories":["finance"],"example":"/jinse/zhengce","parameters":{"category":"分类，见下表，默认为政策"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"分类","maintainers":["nczitzk"],"description":"| 政策    | 行情         | DeFi | 矿业  | 以太坊 2.0 |\n  | ------- | ------------ | ---- | ----- | ---------- |\n  | zhengce | fenxishishuo | defi | kuang | 以太坊 2.0 |\n\n  | 产业     | IPFS | 技术 | 百科  | 研报          |\n  | -------- | ---- | ---- | ----- | ------------- |\n  | industry | IPFS | tech | baike | capitalmarket |","location":"catalogue.ts"}' :test='{"code":0}' />

| 政策    | 行情         | DeFi | 矿业  | 以太坊 2.0 |
  | ------- | ------------ | ---- | ----- | ---------- |
  | zhengce | fenxishishuo | defi | kuang | 以太坊 2.0 |

  | 产业     | IPFS | 技术 | 百科  | 研报          |
  | -------- | ---- | ---- | ----- | ------------- |
  | industry | IPFS | tech | baike | capitalmarket |

### 快讯 <Site url="jinse.cn" size="sm" />

<Route namespace="jinse" :data='{"path":"/lives/:category?","categories":["finance"],"example":"/jinse/lives","parameters":{"category":"分类，见下表，默认为全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"快讯","maintainers":["nczitzk"],"description":"| 全部 | 精选 | 政策 | 数据 | NFT | 项目 |\n  | ---- | ---- | ---- | ---- | --- | ---- |\n  | 0    | 1    | 2    | 3    | 4   | 5    |","location":"lives.ts"}' :test='{"code":0}' />

| 全部 | 精选 | 政策 | 数据 | NFT | 项目 |
  | ---- | ---- | ---- | ---- | --- | ---- |
  | 0    | 1    | 2    | 3    | 4   | 5    |

### 首页 <Site url="jinse.cn" size="sm" />

<Route namespace="jinse" :data='{"path":"/timeline/:category?","categories":["finance"],"example":"/jinse/timeline","parameters":{"category":"分类，见下表，默认为头条"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"首页","maintainers":["nczitzk"],"description":"| 头条   | 独家 | 铭文    | 产业       | 项目 |\n  | ------ | ---- | ------- | ---------- | ---- |\n  | 政策   | AI   | Web 3.0 | 以太坊 2.0 | DeFi |\n  | Layer2 | NFT  | DAO     | 百科       |      |","location":"timeline.ts"}' :test='{"code":0}' />

| 头条   | 独家 | 铭文    | 产业       | 项目 |
  | ------ | ---- | ------- | ---------- | ---- |
  | 政策   | AI   | Web 3.0 | 以太坊 2.0 | DeFi |
  | Layer2 | NFT  | DAO     | 百科       |      |

## 老虎社区 <Site url="laohu8.com"/>

### 个人主页 <Site url="laohu8.com" size="sm" />

<Route namespace="laohu8" :data='{"path":"/personal/:id","categories":["finance"],"example":"/laohu8/personal/3527667596890271","parameters":{"id":"用户 ID，见网址链接"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["laohu8.com/personal/:id"]}],"name":"个人主页","maintainers":["Fatpandac"],"location":"personal.ts"}' :test='{"code":0}' />

## 律动 <Site url="rszhaopin.theblockbeats.info"/>

### 新闻快讯 <Site url="rszhaopin.theblockbeats.info" size="sm" />

<Route namespace="theblockbeats" :data='{"path":"/:channel?","categories":["finance"],"example":"/theblockbeats/newsflash","parameters":{"channel":"类型，见下表，默认为快讯"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"新闻快讯","maintainers":["Fatpandac","jameshih"],"description":"|    快讯   |   文章  |\n  | :-------: | :-----: |\n  | newsflash | article |","location":"index.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

|    快讯   |   文章  |
  | :-------: | :-----: |
  | newsflash | article |

## 麦肯锡 <Site url="mckinsey.com.cn"/>

### 洞见 <Site url="mckinsey.com.cn" size="sm" />

<Route namespace="mckinsey" :data='{"path":"/cn/:category?","categories":["finance"],"example":"/mckinsey/cn","parameters":{"category":"分类，见下表，默认为全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"洞见","maintainers":["laampui"],"description":"| 分类 | 分类名             |\n  | ---- | ------------------ |\n  | 25   | 全部洞见           |\n  | 2    | 汽车               |\n  | 3    | 金融服务           |\n  | 4    | 消费者             |\n  | 5    | 医药               |\n  | 7    | 数字化             |\n  | 8    | 制造业             |\n  | 9    | 私募               |\n  | 10   | 技术，媒体与通信   |\n  | 12   | 城市化与可持续发展 |\n  | 13   | 创新               |\n  | 16   | 人才与领导力       |\n  | 18   | 宏观经济           |\n  | 19   | 麦肯锡全球研究院   |\n  | 37   | 麦肯锡季刊         |\n  | 41   | 资本项目和基础设施 |\n  | 42   | 旅游、运输和物流   |\n  | 45   | 全球基础材料       |","location":"cn/index.ts"}' :test='{"code":0}' />

| 分类 | 分类名             |
  | ---- | ------------------ |
  | 25   | 全部洞见           |
  | 2    | 汽车               |
  | 3    | 金融服务           |
  | 4    | 消费者             |
  | 5    | 医药               |
  | 7    | 数字化             |
  | 8    | 制造业             |
  | 9    | 私募               |
  | 10   | 技术，媒体与通信   |
  | 12   | 城市化与可持续发展 |
  | 13   | 创新               |
  | 16   | 人才与领导力       |
  | 18   | 宏观经济           |
  | 19   | 麦肯锡全球研究院   |
  | 37   | 麦肯锡季刊         |
  | 41   | 资本项目和基础设施 |
  | 42   | 旅游、运输和物流   |
  | 45   | 全球基础材料       |

## 每经网 <Site url="nbd.com.cn"/>

### 分类 <Site url="nbd.com.cn/" size="sm" />

<Route namespace="nbd" :data='{"path":"/:id?","categories":["finance"],"example":"/nbd","parameters":{"id":"分类 id，见下表，默认为要闻"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["nbd.com.cn/","nbd.com.cn/columns/:id?"]}],"name":"分类","maintainers":["nczitzk"],"url":"nbd.com.cn/","description":"| 头条 | 要闻 | 图片新闻 | 推荐 |\n  | ---- | ---- | -------- | ---- |\n  | 2    | 3    | 4        | 5    |","location":"index.ts"}' :test='{"code":0}' />

| 头条 | 要闻 | 图片新闻 | 推荐 |
  | ---- | ---- | -------- | ---- |
  | 2    | 3    | 4        | 5    |

### 重磅原创 <Site url="nbd.com.cn/" size="sm" />

<Route namespace="nbd" :data='{"path":"/daily","categories":["finance"],"example":"/nbd/daily","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["nbd.com.cn/","nbd.com.cn/columns/332"]}],"name":"重磅原创","maintainers":["yuuow"],"url":"nbd.com.cn/","location":"daily.ts"}' :test='{"code":1,"message":"expected &#39;RSSHub&#39; not to be &#39;RSSHub&#39; // Object.is equality"}' />

## 前瞻网 <Site url="qianzhan.com"/>

### 排行榜 <Site url="qianzhan.com/analyst" size="sm" />

<Route namespace="qianzhan" :data='{"path":"/analyst/rank/:type?","categories":["finance"],"example":"/qianzhan/analyst/rank/week","parameters":{"type":"分类，见下表"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["qianzhan.com/analyst","qianzhan.com/"],"target":"/analyst/rank"}],"name":"排行榜","maintainers":["moke8"],"url":"qianzhan.com/analyst","description":"| 周排行 | 月排行 |\n  | ------ | ------ |\n  | week   | month  |","location":"rank.ts"}' :test='{"code":0}' />

| 周排行 | 月排行 |
  | ------ | ------ |
  | week   | month  |

### 文章列表 <Site url="qianzhan.com" size="sm" />

<Route namespace="qianzhan" :data='{"path":"/analyst/column/:type?","categories":["finance"],"example":"/qianzhan/analyst/column/all","parameters":{"type":"分类，见下表"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"文章列表","maintainers":["moke8"],"description":"| 全部 | 研究员专栏 | 规划师专栏 | 观察家专栏 |\n  | ---- | ---------- | ---------- | ---------- |\n  | all  | 220        | 627        | 329        |","location":"column.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

| 全部 | 研究员专栏 | 规划师专栏 | 观察家专栏 |
  | ---- | ---------- | ---------- | ---------- |
  | all  | 220        | 627        | 329        |

## 上海证券交易所 <Site url="bond.sse.com.cn"/>

### 本所业务指南与流程 <Site url="bond.sse.com.cn" size="sm" />

<Route namespace="sse" :data='{"path":"/lawandrules/:slug?","categories":["finance"],"example":"/sse/lawandrules","parameters":{"slug":"见下文，默认为 `latest`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"本所业务指南与流程","maintainers":["nczitzk"],"description":"将目标栏目的网址拆解为 `https://www.sse.com.cn/lawandrules/guide/` 和后面的字段，把后面的字段中的 `/` 替换为 `-`，即为该路由的 slug\n\n  如：（最新指南与流程）`https://www.sse.com.cn/lawandrules/guide/latest` 的网址在 `https://www.sse.com.cn/lawandrules/guide/` 后的字段是 `latest`，则对应的 slug 为 `latest`，对应的路由即为 `/sse/lawandrules/latest`\n\n  又如：（主板业务指南与流程 - 发行承销业务指南）`https://www.sse.com.cn/lawandrules/guide/zbywznylc/fxcxywzn` 的网址在 `https://www.sse.com.cn/lawandrules/guide/` 后的字段是 `zbywznylc/fxcxywzn`，则对应的 slug 为 `zbywznylc-fxcxywzn`，对应的路由即为 `/sse/lawandrules/zbywznylc-fxcxywzn`","location":"lawandrules.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

将目标栏目的网址拆解为 `https://www.sse.com.cn/lawandrules/guide/` 和后面的字段，把后面的字段中的 `/` 替换为 `-`，即为该路由的 slug

  如：（最新指南与流程）`https://www.sse.com.cn/lawandrules/guide/latest` 的网址在 `https://www.sse.com.cn/lawandrules/guide/` 后的字段是 `latest`，则对应的 slug 为 `latest`，对应的路由即为 `/sse/lawandrules/latest`

  又如：（主板业务指南与流程 - 发行承销业务指南）`https://www.sse.com.cn/lawandrules/guide/zbywznylc/fxcxywzn` 的网址在 `https://www.sse.com.cn/lawandrules/guide/` 后的字段是 `zbywznylc/fxcxywzn`，则对应的 slug 为 `zbywznylc-fxcxywzn`，对应的路由即为 `/sse/lawandrules/zbywznylc-fxcxywzn`

### 监管问询 <Site url="www.sse.com.cn/disclosure/credibility/supervision/inquiries" size="sm" />

<Route namespace="sse" :data='{"path":"/inquire","categories":["finance"],"example":"/sse/inquire","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.sse.com.cn/disclosure/credibility/supervision/inquiries","www.sse.com.cn/"]}],"name":"监管问询","maintainers":["Jeason0228"],"url":"www.sse.com.cn/disclosure/credibility/supervision/inquiries","location":"inquire.ts"}' :test='{"code":0}' />

### 科创板项目动态 <Site url="kcb.sse.com.cn/home" size="sm" />

<Route namespace="sse" :data='{"path":"/renewal","categories":["finance"],"example":"/sse/renewal","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["kcb.sse.com.cn/home","kcb.sse.com.cn/"]}],"name":"科创板项目动态","maintainers":["Jeason0228"],"url":"kcb.sse.com.cn/home","location":"renewal.ts"}' :test='{"code":0}' />

### 可转换公司债券公告 <Site url="bond.sse.com.cn" size="sm" />

<Route namespace="sse" :data='{"path":"/convert/:query?","categories":["finance"],"example":"/sse/convert/beginDate=2018-08-18&endDate=2019-08-18&companyCode=603283&title=股份","parameters":{"query":"筛选条件，见示例"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"可转换公司债券公告","maintainers":["kt286"],"location":"convert.ts"}' :test='{"code":0}' />

### 上市公司信息最新公告披露 <Site url="bond.sse.com.cn" size="sm" />

<Route namespace="sse" :data='{"path":"/disclosure/:query?","categories":["finance"],"example":"/sse/disclosure/beginDate=2018-08-18&endDate=2020-08-25&productId=600696","parameters":{"query":"筛选条件，见示例"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"上市公司信息最新公告披露","maintainers":["harveyqiu"],"location":"disclosure.ts"}' :test='{"code":0}' />

## 深圳证券交易所 <Site url="szse.cn"/>

### 创业板项目动态 <Site url="listing.szse.cn/projectdynamic/1/index.html" size="sm" />

<Route namespace="szse" :data='{"path":"/projectdynamic/:type?/:stage?/:status?","categories":["finance"],"example":"/szse/projectdynamic","parameters":{"type":"类型，见下表，默认为IPO","stage":"阶段，见下表，默认为全部","status":"状态，见下表，默认为全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["listing.szse.cn/projectdynamic/1/index.html","listing.szse.cn/projectdynamic/2/index.html","listing.szse.cn/projectdynamic/3/index.html","listing.szse.cn/"]}],"name":"创业板项目动态","maintainers":["nczitzk"],"url":"listing.szse.cn/projectdynamic/1/index.html","description":"类型\n\n  | IPO | 再融资 | 重大资产重组 |\n  | --- | ------ | ------------ |\n  | 1   | 2      | 3            |\n\n  阶段\n\n  | 全部 | 受理 | 问询 | 上市委会议 |\n  | ---- | ---- | ---- | ---------- |\n  | 0    | 10   | 20   | 30         |\n\n  | 提交注册 | 注册结果 | 中止 | 终止 |\n  | -------- | -------- | ---- | ---- |\n  | 35       | 40       | 50   | 60   |\n\n  状态\n\n  | 全部 | 新受理 | 已问询 | 通过 | 未通过 |\n  | ---- | ------ | ------ | ---- | ------ |\n  | 0    | 20     | 30     | 45   | 44     |\n\n  | 暂缓审议 | 复审通过 | 复审不通过 | 提交注册 |\n  | -------- | -------- | ---------- | -------- |\n  | 46       | 56       | 54         | 60       |\n\n  | 注册生效 | 不予注册 | 补充审核 | 终止注册 |\n  | -------- | -------- | -------- | -------- |\n  | 70       | 74       | 78       | 76       |\n\n  | 中止 | 审核不通过 | 撤回 |\n  | ---- | ---------- | ---- |\n  | 80   | 90         | 95   |","location":"projectdynamic.ts"}' :test='{"code":0}' />

类型

  | IPO | 再融资 | 重大资产重组 |
  | --- | ------ | ------------ |
  | 1   | 2      | 3            |

  阶段

  | 全部 | 受理 | 问询 | 上市委会议 |
  | ---- | ---- | ---- | ---------- |
  | 0    | 10   | 20   | 30         |

  | 提交注册 | 注册结果 | 中止 | 终止 |
  | -------- | -------- | ---- | ---- |
  | 35       | 40       | 50   | 60   |

  状态

  | 全部 | 新受理 | 已问询 | 通过 | 未通过 |
  | ---- | ------ | ------ | ---- | ------ |
  | 0    | 20     | 30     | 45   | 44     |

  | 暂缓审议 | 复审通过 | 复审不通过 | 提交注册 |
  | -------- | -------- | ---------- | -------- |
  | 46       | 56       | 54         | 60       |

  | 注册生效 | 不予注册 | 补充审核 | 终止注册 |
  | -------- | -------- | -------- | -------- |
  | 70       | 74       | 78       | 76       |

  | 中止 | 审核不通过 | 撤回 |
  | ---- | ---------- | ---- |
  | 80   | 90         | 95   |

### 上市公告 - 可转换债券 <Site url="szse.cn/disclosure/notice/company/index.html" size="sm" />

<Route namespace="szse" :data='{"path":"/notice","categories":["finance"],"example":"/szse/notice","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["szse.cn/disclosure/notice/company/index.html","szse.cn/"]}],"name":"上市公告 - 可转换债券","maintainers":["Jeason0228","nczitzk"],"url":"szse.cn/disclosure/notice/company/index.html","location":"notice.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### 问询函件 <Site url="szse.cn/disclosure/supervision/inquire/index.html" size="sm" />

<Route namespace="szse" :data='{"path":"/inquire/:category?/:select?/:keyword?","categories":["finance"],"example":"/szse/inquire","parameters":{"category":"类型，见下表，默认为 `0` 即 主板","select":"函件类别, 见下表，默认为全部函件类别","keyword":"公司代码或简称，默认为空"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["szse.cn/disclosure/supervision/inquire/index.html","szse.cn/"],"target":"/inquire"}],"name":"问询函件","maintainers":["Jeason0228","nczitzk"],"url":"szse.cn/disclosure/supervision/inquire/index.html","description":"类型\n\n  | 主板 | 创业板 |\n  | ---- | ------ |\n  | 0    | 1      |\n\n  函件类别\n\n  | 全部函件类别 | 非许可类重组问询函 | 问询函 | 违法违规线索分析报告 | 许可类重组问询函 | 监管函（会计师事务所模板） | 提请关注函（会计师事务所模板） | 年报问询函 | 向中介机构发函 | 半年报问询函 | 关注函 | 公司部函 | 三季报问询函 |\n  | ------------ | ------------------ | ------ | -------------------- | ---------------- | -------------------------- | ------------------------------ | ---------- | -------------- | ------------ | ------ | -------- | ------------ |","location":"inquire.ts"}' :test='{"code":0}' />

类型

  | 主板 | 创业板 |
  | ---- | ------ |
  | 0    | 1      |

  函件类别

  | 全部函件类别 | 非许可类重组问询函 | 问询函 | 违法违规线索分析报告 | 许可类重组问询函 | 监管函（会计师事务所模板） | 提请关注函（会计师事务所模板） | 年报问询函 | 向中介机构发函 | 半年报问询函 | 关注函 | 公司部函 | 三季报问询函 |
  | ------------ | ------------------ | ------ | -------------------- | ---------------- | -------------------------- | ------------------------------ | ---------- | -------------- | ------------ | ------ | -------- | ------------ |

### 最新规则 <Site url="szse.cn/lawrules/rule/new" size="sm" />

<Route namespace="szse" :data='{"path":"/rule","categories":["finance"],"example":"/szse/rule","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["szse.cn/lawrules/rule/new","szse.cn/"]}],"name":"最新规则","maintainers":["nczitzk"],"url":"szse.cn/lawrules/rule/new","location":"rule.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

## 深潮 TechFlow <Site url="techflowpost.com"/>

### Unknown <Site url="techflowpost.com/" size="sm" />

<Route namespace="techflowpost" :data='{"path":"/","radar":[{"source":["techflowpost.com/"],"target":""}],"name":"Unknown","maintainers":["nczitzk"],"url":"techflowpost.com/","location":"index.ts"}' :test='undefined' />

### 快讯 <Site url="techflowpost.com/newsletter/index.html" size="sm" />

<Route namespace="techflowpost" :data='{"path":["/express","/newsflash"],"categories":["finance"],"example":"/techflowpost/express","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["techflowpost.com/newsletter/index.html"]}],"name":"快讯","maintainers":["nczitzk"],"url":"techflowpost.com/newsletter/index.html","location":"express.ts"}' :test='{"code":0}' />

### 快讯 <Site url="techflowpost.com/newsletter/index.html" size="sm" />

<Route namespace="techflowpost" :data='{"path":["/express","/newsflash"],"categories":["finance"],"example":"/techflowpost/express","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["techflowpost.com/newsletter/index.html"]}],"name":"快讯","maintainers":["nczitzk"],"url":"techflowpost.com/newsletter/index.html","location":"express.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

## 淘股吧 <Site url="taoguba.com.cn"/>

### Unknown <Site url="taoguba.com.cn" size="sm" />

<Route namespace="taoguba" :data='{"path":["/index","/:category?"],"name":"Unknown","maintainers":["nczitzk"],"description":"| 淘股论坛 | 社区总版 | 精华加油 | 网友点赞 |\n  | -------- | -------- | -------- | -------- |\n  | bbs      | zongban  | jinghua  | dianzan  |","location":"index.ts"}' :test='undefined' />

| 淘股论坛 | 社区总版 | 精华加油 | 网友点赞 |
  | -------- | -------- | -------- | -------- |
  | bbs      | zongban  | jinghua  | dianzan  |

### Unknown <Site url="taoguba.com.cn" size="sm" />

<Route namespace="taoguba" :data='{"path":["/index","/:category?"],"name":"Unknown","maintainers":["nczitzk"],"description":"| 淘股论坛 | 社区总版 | 精华加油 | 网友点赞 |\n  | -------- | -------- | -------- | -------- |\n  | bbs      | zongban  | jinghua  | dianzan  |","location":"index.ts"}' :test='undefined' />

| 淘股论坛 | 社区总版 | 精华加油 | 网友点赞 |
  | -------- | -------- | -------- | -------- |
  | bbs      | zongban  | jinghua  | dianzan  |

### 用户博客 <Site url="taoguba.com.cn" size="sm" />

<Route namespace="taoguba" :data='{"path":["/blog/:id","/user/:id"],"categories":["finance"],"example":"/taoguba/blog/252069","parameters":{"id":"博客 id，可在对应博客页中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["taoguba.com.cn/blog/:id","taoguba.com.cn/"]}],"name":"用户博客","maintainers":["nczitzk"],"location":"blog.ts"}' :test='{"code":0}' />

### 用户博客 <Site url="taoguba.com.cn" size="sm" />

<Route namespace="taoguba" :data='{"path":["/blog/:id","/user/:id"],"categories":["finance"],"example":"/taoguba/blog/252069","parameters":{"id":"博客 id，可在对应博客页中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["taoguba.com.cn/blog/:id","taoguba.com.cn/"]}],"name":"用户博客","maintainers":["nczitzk"],"location":"blog.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

## 乌拉邦 <Site url="www.ulapia.com"/>

### 频道 <Site url="www.ulapia.com" size="sm" />

<Route namespace="ulapia" :data='{"path":"/reports/:category?","categories":["finance"],"example":"/ulapia/reports/stock_research","parameters":{"category":"频道类型，默认为券商晨报（今日晨报）"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"频道","maintainers":["Fatpandac"],"description":"|     个股研报    |      行业研报      |      策略研报      |     宏观研报    |    新股研报   | 券商晨报（今日晨报） |\n  | :-------------: | :----------------: | :----------------: | :-------------: | :-----------: | :------------------: |\n  | stock_research | industry_research | strategy_research | macro_research | ipo_research |    brokerage_news   |","location":"index.ts"}' :test='{"code":0}' />

|     个股研报    |      行业研报      |      策略研报      |     宏观研报    |    新股研报   | 券商晨报（今日晨报） |
  | :-------------: | :----------------: | :----------------: | :-------------: | :-----------: | :------------------: |
  | stock_research | industry_research | strategy_research | macro_research | ipo_research |    brokerage_news   |

### 最新研报 <Site url="www.ulapia.com/" size="sm" />

<Route namespace="ulapia" :data='{"path":"/research/latest","categories":["finance"],"example":"/ulapia/research/latest","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.ulapia.com/"]}],"name":"最新研报","maintainers":[],"url":"www.ulapia.com/","location":"research.ts"}' :test='{"code":0}' />

## 雪球 <Site url="danjuanapp.com"/>

### 蛋卷基金净值更新 <Site url="danjuanapp.com" size="sm" />

<Route namespace="xueqiu" :data='{"path":"/fund/:id","categories":["finance"],"example":"/xueqiu/fund/040008","parameters":{"id":"基金代码, 可在基金主页 URL 中找到. 此路由的数据为场外基金 (`F`开头)"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"蛋卷基金净值更新","maintainers":["HenryQW","NathanDai"],"location":"fund.ts"}' :test='{"code":0}' />

### 股票评论 <Site url="danjuanapp.com" size="sm" />

<Route namespace="xueqiu" :data='{"path":"/stock_comments/:id","categories":["finance"],"example":"/xueqiu/stock_comments/SZ002626","parameters":{"id":"股票代码（需要带上交易所）"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["xueqiu.com/S/:id"]}],"name":"股票评论","maintainers":[],"location":"stock-comments.ts"}' :test='{"code":0}' />

### 股票信息 <Site url="danjuanapp.com" size="sm" />

<Route namespace="xueqiu" :data='{"path":"/stock_info/:id/:type?","categories":["finance"],"example":"/xueqiu/stock_info/SZ000002","parameters":{"id":"股票代码（需要带上交易所）","type":"动态的类型, 不填则为股票公告"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["xueqiu.com/S/:id","xueqiu.com/s/:id"],"target":"/stock_info/:id"}],"name":"股票信息","maintainers":["YuYang"],"description":"| 公告         | 新闻 | 研报     |\n  | ------------ | ---- | -------- |\n  | announcement | news | research |","location":"stock-info.ts"}' :test='{"code":0}' />

| 公告         | 新闻 | 研报     |
  | ------------ | ---- | -------- |
  | announcement | news | research |

### 今日话题 <Site url="xueqiu.com/today" size="sm" />

<Route namespace="xueqiu" :data='{"path":"/today","categories":["finance"],"example":"/xueqiu/today","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["xueqiu.com/today"]}],"name":"今日话题","maintainers":["nczitzk"],"url":"xueqiu.com/today","location":"today.ts"}' :test='{"code":0}' />

### 热帖 <Site url="xueqiu.com/" size="sm" />

<Route namespace="xueqiu" :data='{"path":"/hots","categories":["finance"],"example":"/xueqiu/hots","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["xueqiu.com/"]}],"name":"热帖","maintainers":["hillerliao"],"url":"xueqiu.com/","location":"hots.ts"}' :test='{"code":0}' />

### 用户专栏 <Site url="danjuanapp.com" size="sm" />

<Route namespace="xueqiu" :data='{"path":"/column/:id","categories":["finance"],"example":"/xueqiu/column/9962554712","parameters":{"id":"用户 id, 可在用户主页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["xueqiu.com/:id/column"]}],"name":"用户专栏","maintainers":["TonyRL"],"location":"column.ts"}' :test='{"code":0}' />

### 用户收藏动态 <Site url="danjuanapp.com" size="sm" />

<Route namespace="xueqiu" :data='{"path":"/favorite/:id","categories":["finance"],"example":"/xueqiu/favorite/8152922548","parameters":{"id":"用户 id, 可在用户主页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["xueqiu.com/u/:id"]}],"name":"用户收藏动态","maintainers":["imlonghao"],"location":"favorite.ts"}' :test='{"code":0}' />

### 用户自选动态 <Site url="danjuanapp.com" size="sm" />

<Route namespace="xueqiu" :data='{"path":"/user_stock/:id","categories":["finance"],"example":"/xueqiu/user_stock/1247347556","parameters":{"id":"用户 id, 可在用户主页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["xueqiu.com/u/:id"]}],"name":"用户自选动态","maintainers":["hillerliao"],"location":"user-stock.ts"}' :test='{"code":1,"message":"expected 348647517945 to be less than 311040000000"}' />

### 用户动态 <Site url="danjuanapp.com" size="sm" />

<Route namespace="xueqiu" :data='{"path":"/user/:id/:type?","categories":["finance"],"example":"/xueqiu/user/8152922548","parameters":{"id":"用户 id, 可在用户主页 URL 中找到","type":"动态的类型, 不填则默认全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["xueqiu.com/u/:id"],"target":"/user/:id"}],"name":"用户动态","maintainers":["imlonghao"],"description":"| 原发布 | 长文 | 问答 | 热门 | 交易 |\n  | ------ | ---- | ---- | ---- | ---- |\n  | 0      | 2    | 4    | 9    | 11   |","location":"user.ts"}' :test='{"code":0}' />

| 原发布 | 长文 | 问答 | 热门 | 交易 |
  | ------ | ---- | ---- | ---- | ---- |
  | 0      | 2    | 4    | 9    | 11   |

### 组合最新调仓信息 <Site url="danjuanapp.com" size="sm" />

<Route namespace="xueqiu" :data='{"path":"/snb/:id","categories":["finance"],"example":"/xueqiu/snb/ZH1288184","parameters":{"id":"组合代码, 可在组合主页 URL 中找到."},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["xueqiu.com/P/:id","xueqiu.com/p/:id"]}],"name":"组合最新调仓信息","maintainers":["ZhishanZhang"],"location":"snb.ts"}' :test='{"code":0}' />

## 有知有行 <Site url="youzhiyouxing.cn"/>

### 有知文章 <Site url="youzhiyouxing.cn/materials" size="sm" />

<Route namespace="youzhiyouxing" :data='{"path":"/materials/:id?","categories":["finance"],"example":"/youzhiyouxing/materials","parameters":{"id":"分类，见下表，默认为全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["youzhiyouxing.cn/materials"],"target":"/materials"}],"name":"有知文章","maintainers":["broven","Fatpandac","nczitzk"],"url":"youzhiyouxing.cn/materials","description":"| 全部 | 知行小酒馆 | 知行黑板报 | 无人知晓 | 孟岩专栏 | 知行读书会 | 你好，同路人 |\n  | :--: | :--------: | :--------: | :------: | :------: | :--------: | :----------: |\n  |   0  |      4     |      2     |    10    |     1    |      3     |      11      |","location":"materials.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

| 全部 | 知行小酒馆 | 知行黑板报 | 无人知晓 | 孟岩专栏 | 知行读书会 | 你好，同路人 |
  | :--: | :--------: | :--------: | :------: | :------: | :--------: | :----------: |
  |   0  |      4     |      2     |    10    |     1    |      3     |      11      |

## 证券时报网 <Site url="stcn.com"/>

### 栏目 <Site url="stcn.com" size="sm" />

<Route namespace="stcn" :data='{"path":"/:id?","categories":["finance"],"example":"/stcn/yw","parameters":{"id":"栏目 id，见下表，默认为要闻"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"栏目","maintainers":["nczitzk"],"description":"| 快讯 | 要闻 | 股市 | 公司    | 数据 |\n  | ---- | ---- | ---- | ------- | ---- |\n  | kx   | yw   | gs   | company | data |\n\n  | 基金 | 金融    | 评论    | 产经 | 创投 |\n  | ---- | ------- | ------- | ---- | ---- |\n  | fund | finance | comment | cj   | ct   |\n\n  | 科创板 | 新三板 | 投教 | ESG | 滚动 |\n  | ------ | ------ | ---- | --- | ---- |\n  | kcb    | xsb    | tj   | zk  | gd   |\n\n  | 股市一览 | 独家解读 |\n  | -------- | -------- |\n  | gsyl     | djjd     |\n\n  | 公司新闻 | 公司动态 |\n  | -------- | -------- |\n  | gsxw     | gsdt     |\n\n  | 独家数据 | 看点数据 | 资金流向 | 科创板  | 行情总貌 |\n  | -------- | -------- | -------- | ------- | -------- |\n  | djsj     | kd       | zj       | sj_kcb | hq       |\n\n  | 专栏 | 作者   |\n  | ---- | ------ |\n  | zl   | author |\n\n  | 行业 | 汽车 |\n  | ---- | ---- |\n  | cjhy | cjqc |\n\n  | 投教课堂 | 政策知识 | 投教动态 | 专题活动 |\n  | -------- | -------- | -------- | -------- |\n  | tjkt     | zczs     | tjdt     | zthd     |","location":"index.ts"}' :test='{"code":0}' />

| 快讯 | 要闻 | 股市 | 公司    | 数据 |
  | ---- | ---- | ---- | ------- | ---- |
  | kx   | yw   | gs   | company | data |

  | 基金 | 金融    | 评论    | 产经 | 创投 |
  | ---- | ------- | ------- | ---- | ---- |
  | fund | finance | comment | cj   | ct   |

  | 科创板 | 新三板 | 投教 | ESG | 滚动 |
  | ------ | ------ | ---- | --- | ---- |
  | kcb    | xsb    | tj   | zk  | gd   |

  | 股市一览 | 独家解读 |
  | -------- | -------- |
  | gsyl     | djjd     |

  | 公司新闻 | 公司动态 |
  | -------- | -------- |
  | gsxw     | gsdt     |

  | 独家数据 | 看点数据 | 资金流向 | 科创板  | 行情总貌 |
  | -------- | -------- | -------- | ------- | -------- |
  | djsj     | kd       | zj       | sj_kcb | hq       |

  | 专栏 | 作者   |
  | ---- | ------ |
  | zl   | author |

  | 行业 | 汽车 |
  | ---- | ---- |
  | cjhy | cjqc |

  | 投教课堂 | 政策知识 | 投教动态 | 专题活动 |
  | -------- | -------- | -------- | -------- |
  | tjkt     | zczs     | tjdt     | zthd     |

## 智通财经网 <Site url="zhitongcaijing.com"/>

### 推荐 <Site url="zhitongcaijing.com" size="sm" />

<Route namespace="zhitongcaijing" :data='{"path":"/:id?/:category?","categories":["finance"],"example":"/zhitongcaijing","parameters":{"id":"栏目 id，可在对应栏目页 URL 中找到，默认为 recommend，即推荐","category":"分类 id，可在对应栏目子分类页 URL 中找到，默认为全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"推荐","maintainers":["nczitzk"],"description":"| id           | 栏目 |\n  | ------------ | ---- |\n  | recommend    | 推荐 |\n  | hkstock      | 港股 |\n  | meigu        | 美股 |\n  | agu          | 沪深 |\n  | ct           | 创投 |\n  | esg          | ESG  |\n  | aqs          | 券商 |\n  | ajj          | 基金 |\n  | focus        | 要闻 |\n  | announcement | 公告 |\n  | research     | 研究 |\n  | shares       | 新股 |\n  | bazaar       | 市场 |\n  | company      | 公司 |","location":"index.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

| id           | 栏目 |
  | ------------ | ---- |
  | recommend    | 推荐 |
  | hkstock      | 港股 |
  | meigu        | 美股 |
  | agu          | 沪深 |
  | ct           | 创投 |
  | esg          | ESG  |
  | aqs          | 券商 |
  | ajj          | 基金 |
  | focus        | 要闻 |
  | announcement | 公告 |
  | research     | 研究 |
  | shares       | 新股 |
  | bazaar       | 市场 |
  | company      | 公司 |

## 中国货币网 <Site url="chinamoney.com.cn"/>

### 公告 <Site url="chinamoney.com.cn" size="sm" />

<Route namespace="chinamoney" :data='{"path":"/:channelId?","categories":["finance"],"example":"/chinamoney","parameters":{"channelId":"分类，见下表，默认为 `2834`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"公告","maintainers":["TonyRL"],"description":"<details>\n    <summary>市场公告</summary>\n\n    外汇市场公告\n\n    | 最新 | 市场公告通知 | 中心会员公告 | 会员信息公告 |\n    | ---- | ------------ | ------------ | ------------ |\n    | 2834 | 2835         | 2836         | 2837         |\n\n    本币市场公告\n\n    | 最新           | 市场公告通知 | 中心会员公告 | 会员信息公告 |\n    | -------------- | ------------ | ------------ | ------------ |\n    | 2839,2840,2841 | 2839         | 2840         | 2841         |\n\n    央行业务公告\n\n    | 最新      | 公开市场操作 | 中央国库现金管理 |\n    | --------- | ------------ | ---------------- |\n    | 2845,2846 | 2845         | 2846             |\n  </details>\n\n  <details>\n    <summary>本币市场</summary>\n\n    贷款市场报价利率\n\n    | LPR 市场公告 |\n    | ------------ |\n    | 3686         |\n  </details>","location":"notice.ts"}' :test='{"code":0}' />

<details>
    <summary>市场公告</summary>

    外汇市场公告

    | 最新 | 市场公告通知 | 中心会员公告 | 会员信息公告 |
    | ---- | ------------ | ------------ | ------------ |
    | 2834 | 2835         | 2836         | 2837         |

    本币市场公告

    | 最新           | 市场公告通知 | 中心会员公告 | 会员信息公告 |
    | -------------- | ------------ | ------------ | ------------ |
    | 2839,2840,2841 | 2839         | 2840         | 2841         |

    央行业务公告

    | 最新      | 公开市场操作 | 中央国库现金管理 |
    | --------- | ------------ | ---------------- |
    | 2845,2846 | 2845         | 2846             |
  </details>

  <details>
    <summary>本币市场</summary>

    贷款市场报价利率

    | LPR 市场公告 |
    | ------------ |
    | 3686         |
  </details>

## 中证网 <Site url="cs.com.cn"/>

### Unknown <Site url="cs.com.cn" size="sm" />

<Route namespace="cs" :data='{"path":["/news/zzkx","/zzkx"],"name":"Unknown","maintainers":[],"location":"zzkx.ts"}' :test='undefined' />

### Unknown <Site url="cs.com.cn" size="sm" />

<Route namespace="cs" :data='{"path":["/news/zzkx","/zzkx"],"name":"Unknown","maintainers":[],"location":"zzkx.ts"}' :test='undefined' />

### 栏目 <Site url="cs.com.cn" size="sm" />

<Route namespace="cs" :data='{"path":"/:category{.+}?","name":"栏目","parameters":{"category":"分类，见下表，默认为首页"},"maintainers":["nczitzk"],"description":"| 要闻 | 公司 | 市场 | 基金 |\n    | ---- | ---- | ---- | ---- |\n    | xwzx | ssgs | gppd | tzjj |\n\n    | 科创 | 产经   | 期货     | 海外   |\n    | ---- | ------ | -------- | ------ |\n    | 5g   | cj2020 | zzqh2020 | hw2020 |\n\n    <details>\n      <summary>更多栏目</summary>\n\n      #### 要闻\n\n      | 财经要闻 | 观点评论 | 民生消费  |\n      | -------- | -------- | --------- |\n      | xwzx/hg  | xwzx/jr  | xwzx/msxf |\n\n      #### 公司\n\n      | 公司要闻  | 公司深度  | 公司巡礼  |\n      | --------- | --------- | --------- |\n      | ssgs/gsxw | ssgs/gssd | ssgs/gsxl |\n\n      #### 市场\n\n      | A 股市场  | 港股资讯  | 债市研究  | 海外报道  | 期货报道  |\n      | --------- | --------- | --------- | --------- | --------- |\n      | gppd/gsyj | gppd/ggzx | gppd/zqxw | gppd/hwbd | gppd/qhbd |\n\n      #### 基金\n\n      | 基金动态  | 基金视点  | 基金持仓  | 私募基金  | 基民学苑  |\n      | --------- | --------- | --------- | --------- | --------- |\n      | tzjj/jjdt | tzjj/jjks | tzjj/jjcs | tzjj/smjj | tzjj/tjdh |\n\n      #### 机构\n\n      | 券商 | 银行 | 保险 |\n      | ---- | ---- | ---- |\n      | qs   | yh   | bx   |\n\n      #### 其他\n\n      | 中证快讯 7x24 | IPO 鉴真 | 公司能见度 |\n      | ------------- | -------- | ---------- |\n      | sylm/jsbd     | yc/ipojz | yc/gsnjd   |\n    </details>","location":"index.ts"}' :test='undefined' />

| 要闻 | 公司 | 市场 | 基金 |
    | ---- | ---- | ---- | ---- |
    | xwzx | ssgs | gppd | tzjj |

    | 科创 | 产经   | 期货     | 海外   |
    | ---- | ------ | -------- | ------ |
    | 5g   | cj2020 | zzqh2020 | hw2020 |

    <details>
      <summary>更多栏目</summary>

      #### 要闻

      | 财经要闻 | 观点评论 | 民生消费  |
      | -------- | -------- | --------- |
      | xwzx/hg  | xwzx/jr  | xwzx/msxf |

      #### 公司

      | 公司要闻  | 公司深度  | 公司巡礼  |
      | --------- | --------- | --------- |
      | ssgs/gsxw | ssgs/gssd | ssgs/gsxl |

      #### 市场

      | A 股市场  | 港股资讯  | 债市研究  | 海外报道  | 期货报道  |
      | --------- | --------- | --------- | --------- | --------- |
      | gppd/gsyj | gppd/ggzx | gppd/zqxw | gppd/hwbd | gppd/qhbd |

      #### 基金

      | 基金动态  | 基金视点  | 基金持仓  | 私募基金  | 基民学苑  |
      | --------- | --------- | --------- | --------- | --------- |
      | tzjj/jjdt | tzjj/jjks | tzjj/jjcs | tzjj/smjj | tzjj/tjdh |

      #### 机构

      | 券商 | 银行 | 保险 |
      | ---- | ---- | ---- |
      | qs   | yh   | bx   |

      #### 其他

      | 中证快讯 7x24 | IPO 鉴真 | 公司能见度 |
      | ------------- | -------- | ---------- |
      | sylm/jsbd     | yc/ipojz | yc/gsnjd   |
    </details>

### 中证视频 <Site url="cs.com.cn" size="sm" />

<Route namespace="cs" :data='{"path":"/video/:category?","categories":["finance"],"example":"/cs/video/今日聚焦","parameters":{"category":"分类，见下表，默认为今日聚焦"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"中证视频","description":"| 今日聚焦 | 传闻求证 | 高端访谈 | 投教课堂 | 直播汇 |\n    | -------- | -------- | -------- | -------- | ------ |","maintainers":["nczitzk"],"location":"video.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

| 今日聚焦 | 传闻求证 | 高端访谈 | 投教课堂 | 直播汇 |
    | -------- | -------- | -------- | -------- | ------ |

## 中国人民银行 <Site url="kjt.ah.gov.cn"/>

<details>
  <summary>*业务咨询* 和 *投诉建议* 可用的站点参数</summary>

  | 上海市   | 北京市  | 天津市  | 河北省 |
  | -------- | ------- | ------- | ------ |
  | shanghai | beijing | tianjin | hebei  |

  | 山西省 | 内蒙古自治区 | 辽宁省   | 吉林省 |
  | ------ | ------------ | -------- | ------ |
  | shanxi | neimenggu    | liaoning | jilin  |

  | 黑龙江省     | 江苏省  | 浙江省   | 安徽省 |
  | ------------ | ------- | -------- | ------ |
  | heilongjiang | jiangsu | zhejiang | anhui  |

  | 福建省 | 江西省  | 山东省   | 河南省 |
  | ------ | ------- | -------- | ------ |
  | fujian | jiangxi | shandong | henan  |

  | 湖北省 | 湖南省 | 广东省    | 广西壮族自治区 |
  | ------ | ------ | --------- | -------------- |
  | hubei  | hunan  | guangdong | guangxi        |

  | 海南省 | 重庆市    | 四川省  | 贵州省  |
  | ------ | --------- | ------- | ------- |
  | hainan | chongqing | sichuan | guizhou |

  | 云南省 | 西藏自治区 | 陕西省  | 甘肃省 |
  | ------ | ---------- | ------- | ------ |
  | yunnan | xizang     | shaanxi | gansu  |

  | 青海省  | 宁夏回族自治区 | 新疆维吾尔自治区 | 大连市 |
  | ------- | -------------- | ---------------- | ------ |
  | qinghai | ningxia        | xinjiang         | dalian |

  | 宁波市 | 厦门市 | 青岛市  | 深圳市   |
  | ------ | ------ | ------- | -------- |
  | ningbo | xiamen | qingdao | shenzhen |
</details>

### 工作论文 <Site url="pbc.gov.cn/redianzhuanti/118742/4122386/4122692/index.html" size="sm" />

<Route namespace="gov" :data='{"path":"/pbc/gzlw","categories":["finance"],"example":"/gov/pbc/gzlw","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["pbc.gov.cn/redianzhuanti/118742/4122386/4122692/index.html"]}],"name":"工作论文","maintainers":["Fatpandac"],"url":"pbc.gov.cn/redianzhuanti/118742/4122386/4122692/index.html","location":"pbc/gzlw.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### 沟通交流 <Site url="pbc.gov.cn/goutongjiaoliu/113456/113469/index.html" size="sm" />

<Route namespace="gov" :data='{"path":"/pbc/goutongjiaoliu","categories":["finance"],"example":"/gov/pbc/goutongjiaoliu","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":true,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["pbc.gov.cn/goutongjiaoliu/113456/113469/index.html"]}],"name":"沟通交流","maintainers":["nczitzk"],"url":"pbc.gov.cn/goutongjiaoliu/113456/113469/index.html","location":"pbc/goutongjiaoliu.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### 货币政策司公开市场交易公告 <Site url="kjt.ah.gov.cn" size="sm" />

<Route namespace="gov" :data='{"path":"/pbc/tradeAnnouncement","categories":["finance"],"example":"/gov/pbc/tradeAnnouncement","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":true,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"货币政策司公开市场交易公告","maintainers":["nczitzk"],"location":"pbc/trade-announcement.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

