---
pageClass: routes
---

# Uncategorized

## 591 Rental house

### Rental house

<RouteEn author="Yukaii" example="/591/tw/rent/order=posttime&orderType=desc" path="/591/:country/rent/:query?" :paramsDesc="['Country code. Only tw is supported now', 'Query Parameters']">

::: tip Tip

Copy the URL of the 591 filter housing page and remove the front part "<https://rent.591.com.tw/>?", you will get the query parameters.

:::

</RouteEn>

## Apple

### Exchange and Repair Extension Programs

<RouteEn author="metowolf HenryQW" example="/apple/exchange_repair" path="/apple/exchange_repair/:country?" :paramsDesc="['country code in apple.com URL (exception: for `United States` please use `us`), default to China `cn`']" />

### App Store/Mac App Store

See [#app-store-mac-app-store](/en/program-update.html#app-store-mac-app-store)

## AutoTrader

### Search

<RouteEn author="HenryQW" example="/autotrader/radius=50&postcode=sw1a1aa&onesearchad=Used&onesearchad=Nearly%20New&onesearchad=New&price-to=9000&year-from=2012&body-type=Hatchback&transmission=Automatic&exclude-writeoff-categories=on" path="/autotrader/:query" :paramsDesc="['the search query']">

1.  Conduct a search with desired filters on AutoTrader
1.  Copy everything in the URL after `?`, for example: `https://www.autotrader.co.uk/car-search?radius=50&postcode=sw1a1aa&onesearchad=Used&onesearchad=Nearly%20New&onesearchad=New&price-to=9000&year-from=2012&body-type=Hatchback&transmission=Automatic&exclude-writeoff-categories=on` will produce `radius=50&postcode=sw1a1aa&onesearchad=Used&onesearchad=Nearly%20New&onesearchad=New&price-to=9000&year-from=2012&body-type=Hatchback&transmission=Automatic&exclude-writeoff-categories=on`

</RouteEn>

## checkee.info

### US Visa check status

<RouteEn author="lalxyy" example="/checkee/2019-03" path="/checkee/:month" :paramsDesc="['Year-month of visa check，for example 2019-03']" />

## Corona Virus Disease 2019

### South China Morning Post - Coronavirus outbreak

<RouteEn author="DIYgod" example="/coronavirus/scmp" path="/coronavirus/scmp"/>

### Macao Pagina Electrónica Especial Contra Epidemias: What’s New

Official Website: [https://www.ssm.gov.mo/apps1/PreventWuhanInfection/en.aspx](https://www.ssm.gov.mo/apps1/PreventWuhanInfection/en.aspx)

<RouteEn author="KeiLongW" example="/coronavirus/mogov-2019ncov/ch" path="/coronavirus/mogov-2019ncov/:lang" :paramsDesc="['Language']" />

| Chinese | English | Portuguese |
| ------- | ------- | ---------- |
| ch      | en      | pt         |

### Singapore Ministry of Health - Past Updates on 2019-nCov Local Situation in Singapore

<RouteEn author="Gnnng" example="/coronavirus/sg-moh" path="/coronavirus/sg-moh"/>

### Yahoo Japan COVID19 news collection

Official Website: <https://news.yahoo.co.jp/pages/article/20200207>

<RouteEn author="sgqy" example="/coronavirus/yahoo-japan" path="/coronavirus/yahoo-japan/:tdfk?" :paramsDesc="['Romaji of Todofuken. Can be got from URLs on area detail page. Example: kyoto']"/>

## Darwin Awards

### Award Winners

<RouteEn author="zoenglinghou nciztzk" example="/darwinawards" path="/darwinawards" />

## dcinside

### board

<RouteEn author="zfanta" example="/dcinside/board/programming" path="/dcinside/board/:id" :paramsDesc="['board id']" />

## DHL

### DHL express

<RouteEn author="ntzyz" example="/dhl/12345678" path="/dhl/:shipment_id" :paramsDesc="['Waybill number']"/>

## Email

### Email list

> Only support IMAP protocol, email password and other settings refer to [Email setting](/en/install)

<RouteEn author="kt286" example="/mail/imap/rss@rsshub.app" path="/mail/imap/:email" :paramsDesc="['Email account']" selfhost="1"/>

## Emi Nitta official website

### Recent update

<RouteEn author="luyuhuang" example="/emi-nitta/updates" path="/emi-nitta/updates"/>

### News

<RouteEn author="luyuhuang" example="/emi-nitta/news" path="/emi-nitta/news"/>

## Fisher Spb

### News

<RouteEn author="denis-ya" example="/fisher-spb/news" path="/fisher-spb/news" />

## HackerOne

### HackerOne Hacker Activity

<RouteEn author="imlonghao" example="/hackerone/hacktivity" path="/hackerone/hacktivity" radar="1" rssbud="1"/>
<RouteEn author="imlonghao" example="/hackerone/search/rocket_chat" path="/hackerone/search/:search" :paramsDesc="['Search string']" radar="1" rssbud="1"/>

## Instapaper

### Personal sharing

<RouteEn author="LogicJake" example="/instapaper/person/viridiano" path="/instapaper/person"/>

## Instructables

### Projects

<RouteEn author="wolfg1969" example="/instructables/projects/circuits" path="/instructables/projects/:category?" :paramsDesc="['Category, empty by default, can be found in URL or see the table below']" radar="1">

| All | Circuits | Workshop | Craft | Cooking | Living | Outside | Teachers |
| --- | -------- | -------- | ----- | ------- | ------ | ------- | -------- |
|     | circuits | workshop | craft | cooking | living | outside | teachers |

</RouteEn>

## Japanpost

### Track & Trace Service

<RouteEn author="tuzi3040" example="/japanpost/track/EJ123456789JP/en" path="/japanpost/track/:reqCode/:locale?" :paramsDesc="['Package Number', 'Language, default to japanese `ja`']" radar="1" rssbud="1">

| Japanese | English |
| -------- | ------- |
| ja       | en      |

</RouteEn>

## King Arthur

### Baking

<RouteEn author="loganrockmore" example="/kingarthur/story" path="/instapaper/:category">

| Story | Recipes | Tips and Techniques |
| ----- | ------- | ------------------- |
| story | recipes | tips-and-techniques |

</RouteEn>

## Layoffs.fyi

### Layoff Data Tracker

<RouteEn author="BrandNewLifeJackie26" example="/layoffs" path="/layoffs" radar="1"/>

RSS source in the original site is outdated.

## Lever

### Recruitment

<RouteEn author="tsarlewey" example="/lever/lever" path="/lever/:domain" :paramsDesc="['Company with Lever Board']"/>

## LinkedIn

### Jobs

<RouteEn author="BrandNewLifeJackie26" example="/linkedin/jobs/C-P/1/software engineer" path="/linkedin/jobs/:job_types/:exp_levels/:keywords?" :paramsDesc="['See the following table for details, use \'-\' as delimiter', 'See the following table for details, use \'-\' as delimiter', 'keywords']" radar="1">

#### `job_types` list

| Full Time | Part Time | Contractor | All |
| --------- | --------- | ---------- | --- |
| F         | P         | C          | all |

#### `exp_levels` list

| Intership | Entry Level | Associate | Mid-Senior Level | Director | All |
| --------- | ----------- | --------- | ---------------- | -------- | --- |
| 1         | 2           | 3         | 4                | 5        | all |

For example:

1.  If we want to search software engineer jobs of all levels and all job types, use `/linkedin/jobs/all/all/software engineer`
2.  If we want to search all entry level contractor/part time software engineer jobs, use `/linkedin/jobs/P-C/2/software engineer`

**To make it easier, the recommended way is to start a search on <a href="https://www.linkedin.com/jobs/search">LinkedIn</a> and use <a href="https://github.com/DIYgod/RSSHub-Radar">RSSHub Radar</a> to load the specific feed.**

</RouteEn>

## MITRE

### All Publications

<RouteEn author="sbilly" example="/mitre/publications" path="/mitre/publications" />

## Mozilla

### Firefox Monitor

<RouteEn author="TonyRL" example="/firefox/breaches" path="/firefox/breaches"/>

## Nobel Prize

### List

<RouteEn author="nczitzk" example="/nobelprize" path="/nobelprize/:caty" :paramsDesc="['Category, see below, all by default']">

| Physics | Chemistry | Physiology or Medicine | Literature | Peace | Economic Science  |
| ------- | --------- | ---------------------- | ---------- | ----- | ----------------- |
| physics | chemistry | physiology-or-medicine | literature | peace | economic-sciences |

</RouteEn>

## Notion

::: warning Warning

Need to set up Notion integration, please refer to [Route-specific Configurations](https://docs.rsshub.app/en/install/#Deployment) for details.

:::

::: tip Recommendation

It is recommended to use with clipping tools such as Notion Web Clipper.

:::

### Database

<RouteEn author="curly210102" example="/notion/database/a7cc133b68454f138011f1530a13531e" path="/notion/database/:databaseId" :paramsDesc="['Database ID']" selfhost="1" radar="1">

There is an optional query parameter called `properties=` that can be used to customize field mapping. There are three built-in fields: author, pubTime and link, which can be used to add additional information.

For example, if you have set up three properties in your database - "Publish Time", "Author", and "Original Article Link" - then execute the following JavaScript code to get the result for the properties parameter.

```js
encodeURIComponent(JSON.stringify({"pubTime": "Publish Time", "author": "Author", "link": "Original Article Link"}))
```

There is an optional query parameter called `query=` that can be used to customize the search rules for your database, such as custom sorting and filtering rules.

please refer to the [Notion API documentation](https://developers.notion.com/reference/post-database-query) and execute `encodeURIComponent(JSON.stringify(custom rules))` to provide the query parameter.

</RouteEn>

## oshwhub

### OpenSource Square

<RouteEn author="tylinux" example="/oshwhub" path="/oshwhub/:sortType?" :paramsDesc="['sortType']" radar="1" rssbud="1"/>

## Panda

### Feeds

<RouteEn author="lyrl" example="/usepanda/feeds/5718e53e7a84fb1901e059cc" path="/usepanda/feeds/:id" :paramsDesc="['Feed ID']">

| Channel | feedId                   |
| ------- | ------------------------ |
| Github  | 5718e53e7a84fb1901e059cc |

</RouteEn>

## Parcel Tracking

### Hermes UK

<RouteEn author="HenryQW" example="/parcel/hermesuk/[tracking number]" path="/parcel/hermesuk/:tracking" :paramsDesc="['Tracking number']"/>

## Pocket

### Trending

<RouteEn author="hoilc" example="/pocket/trending" path="/pocket/trending"/>

## Product Hunt

> The official feed: [https://www.producthunt.com/feed](https://www.producthunt.com/feed)

### Today Popular

<RouteEn author="miaoyafeng Fatpandac" example="/producthunt/today" path="/producthunt/today">
</RouteEn>

## Remote.work

### Remote.work Job Information

<RouteEn author="luyuhuang" example="/remote-work/all" path="/remote-work/:caty?" :paramsDesc="['Job category, default to all']" radar="1" rssbud="1">

| All Jobs | Development | Design | Operation | Product | Other | Marketing | Sales |
| :------: | :---------: | :----: | :-------: | :-----: | :---: | :-------: | :---: |
|   all    | development | design | operation | product | other | marketing | sales |

</RouteEn>

## SANS Institute

### Latest conference materials

<RouteEn author="sbilly" example="/sans/summit_archive" path="/sans/summit_archive" />

## Transformation

Pass URL and transformation rules to convert HTML/JSON into RSS.

### HTML

Specify options (in the format of query string) in parameter `routeParams` parameter to extract data from HTML.

| Key            | Meaning                                            | Accepted Values | Default                 |
| -------------- | -------------------------------------------------- | --------------- | ----------------------- |
| `title`        | The title of the RSS                               | `string`        | Extract from `<title>`  |
| `item`         | The HTML elements as `item` using CSS selector     | `string`        | html                    |
| `itemTitle`    | The HTML elements as `title` in `item` using CSS selector | `string` | `item` element          |
| `itemTitleAttr` | The attributes of `title` element as title        | `string`        | Element text            |
| `itemLink`     | The HTML elements as `link` in `item` using CSS selector | `string`  | `item` element          |
| `itemLinkAttr` | The attributes of `link` element as link           | `string`        | `href`                  |
| `itemDesc`     | The HTML elements as `descrption` in `item` using CSS selector | `string` | `item` element     |
| `itemDescAttr` | The attributes of `descrption` element as description | `string`     | Element html            |

<RouteEn author="ttttmr" example="/rsshub/transform/html/https%3A%2F%2Fwechat2rss.xlab.app%2Fposts%2Flist%2F/item=div%5Bclass%3D%27post%2Dcontent%27%5D%20p%20a" path="/rsshub/transform/html/:url/:routeParams" :paramsDesc="['`encodeURIComponent`ed URL address', 'Transformation rules, requires URL encode']" selfhost="1">

Parameters parsing in the above example:

| Parameter    | Value                                     |
| ------------ | ----------------------------------------- |
| `url`        | `https://wechat2rss.xlab.app/posts/list/` |
| `routeParams`| `item=div[class='post-content'] p a`      |

Parsing of `routeParams` parameter:

| Parameter | Value                           |
| --------- | ------------------------------- |
| `item`    | `div[class='post-content'] p a` |

</RouteEn>

### JSON

Specify options (in the format of query string) in parameter `routeParams` parameter to extract data from JSON.

| Key         | Meaning                                  | Accepted Values | Default                                    |
| ----------  | ----------------------------- ---------- | --------------- | ----------  ------------------------------ |
| `title`     | The title of the RSS                     | `string`        | Extracted from home page of current domain |
| `item`      | The JSON Path as `item` element          | `string`        | Entire JSON response                       |
| `itemTitle` | The JSON Path as `title` in `item`       | `string`        | None                                       |
| `itemLink`  | The JSON Path as `link` in `item`        | `string`        | None                                       |
| `itemDesc`  | The JSON Path as `description` in `item` | `string`        | None                                       |

::: tip Note

JSON Path only supports format like `a.b.c`. if you need to access arrays, like `a[0].b`, you can write it as `a.0.b`.

:::

<RouteEn author="ttttmr" example="/rsshub/transform/json/https%3A%2F%2Fapi.github.com%2Frepos%2Fginuerzh%2Fgost%2Freleases/title=Gost%20releases&itemTitle=tag_name&itemLink=html_url&itemDesc=body" path="/rsshub/transform/json/:url/:routeParams" :paramsDesc="['`encodeURIComponent`ed URL address', 'Transformation rules, requires URL encode']" selfhost="1">

Parameters parsing in the above example:

| Parameter     | Value                                           |
| ------------- | ----------------------------------------------- |
| `url`         | `https://api.github.com/repos/ginuerzh/gost/releases` |
| `routeParams` | `title=Gost releases&itemTitle=tag_name&itemLink=html_url&itemDesc=body` |

Parsing of `routeParams` parameter:

| Parameter    | Value            |
| ------------ | ---------------- |
| `title`      | `Gost releases`  |
| `itemTitle`  | `tag_name`       |
| `itemLink`   | `html_url`       |
| `itemDesc`   | `body`           |

</RouteEn>

## Trending Search Keyword Aggregator

### Aggregated Keyword Tracker

Track entries containing specific keywords on major social media platforms.

Current listings: _Weibo Search_、_Toutiao Search_、_Zhihu Search_、_Zhihu Videos_、_Zhihu Topics_。

Data Source: [trending-in-one](https://github.com/huqi-pr/trending-in-one)

<RouteEn author="Jkker" example="/trending/taiwan/3" path="/trending/:keywords/:numberOfDays?" radar="1" :paramsDesc="['List of keywords separated by commas', 'Number of previous days (defaults to 3)']"/>

## TSSstatus (iOS downgrade channel)

### Status

<RouteEn author="xyqfer" example="/tssstatus/j42dap/14W585a" path="/tssstatus/:board/:build" :paramsDesc="['Board id', 'Build id']">

Board and Build can be found in [here](http://api.ineal.me/tss/status)

</RouteEn>

## Urban Dictionary

### Random words

<RouteEn author="TonyRL" example="/urbandictionary/random" path="/urbandictionary/random" radar="1" rssbud="1"/>

## WFDF

### News

<RouteEn author="HankChow" example="/wfdf/news" path="/wfdf/news" radar="1"/>

## wikiHow

### Home

<RouteEn author="sanmmm" example="/wikihow/index" path="/wikihow/index"/>

### Category

<RouteEn author="sanmmm" example="/wikihow/category/饮食与休闲/all" path="/wikihow/category/:category/:type?" :paramsDesc="['Category', 'Type, default to `all`']">

Top category can be found in [category Page](https://zh.wikihow.com/Special:CategoryListing), support secondary directories

Type

| All | Recommend |
| --- | --------- |
| all | rec       |

</RouteEn>

## Wise

### FX Pair Yesterday

<RouteEn author="HenryQW" example="/wise/pair/GBP/USD" path="/wise/pair/:source/:target" :paramsDesc="['Base currency abbreviation','Quote currency abbreviation']" radar="1">

Refer to [the list of supported currencies](https://wise.com/tools/exchange-rate-alerts/).

</RouteEn>

## 裏垢女子まとめ

### Homepage

<RouteEn author="SettingDust Halcao" example="/uraaka-joshi" path="/uraaka-joshi" radar="1" rssbud="1" puppeteer="1"/>

### User

<RouteEn author="SettingDust Halcao" example="/uraaka-joshi/_rrwq" path="/uraaka-joshi/:id" :paramsDesc="['User ID']" radar="1" rssbud="1" puppeteer="1"/>
