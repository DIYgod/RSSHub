---
pageClass: routes
---

# Uncategorized

## Apple

### Exchange and Repair Extension Programs

<RouteEn author="metowolf HenryQW" example="/apple/exchange_repair" path="/apple/exchange_repair/:country?" :paramsDesc="['country code in apple.com URL (exception: for `United States` please use `us`), default to China `cn`']" />

### App Store/Mac App Store

See [#app-store-mac-app-store](/en/program-update.html#app-store-mac-app-store)

## AutoTrader

### Search

<RouteEn author="HenryQW" example="/autotrader/radius=50&postcode=sw1a1aa&onesearchad=Used&onesearchad=Nearly%20New&onesearchad=New&price-to=9000&year-from=2012&body-type=Hatchback&transmission=Automatic&exclude-writeoff-categories=on" path="/autotrader/:query" :paramsDesc="['the search query']">

1. Conduct a search with desired filters on AutoTrader
1. Copy everything in the URL after `?`, for example: `https://www.autotrader.co.uk/car-search?radius=50&postcode=sw1a1aa&onesearchad=Used&onesearchad=Nearly%20New&onesearchad=New&price-to=9000&year-from=2012&body-type=Hatchback&transmission=Automatic&exclude-writeoff-categories=on` will produce `radius=50&postcode=sw1a1aa&onesearchad=Used&onesearchad=Nearly%20New&onesearchad=New&price-to=9000&year-from=2012&body-type=Hatchback&transmission=Automatic&exclude-writeoff-categories=on`

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

## Lever

### Recruitment

<RouteEn author="tsarlewey" example="/lever/lever" path="/lever/:domain" :paramsDesc="['Company with Lever Board']"/>

## MITRE

### All Publications

<RouteEn author="sbilly" example="/mitre/publications" path="/mitre/publications" />

## Mozilla

### Firefox Monitor

<RouteEn author="TonyRL" example="/firefox/breaches" path="/firefox/breaches"/>

## Nobel Prize

### List

<RouteEn author="nczitzk" example="/nobelprize" path="/nobelprize/:caty" :paramsDesc="['Category, see below, all by default']">

| Physics | Chemistry | Physiology or Medicine | Literature | Peace | Economic Science |
| ------- | --------- | ---------------------- | ---------- | ----- | ----------------- |
| physics | chemistry | physiology-or-medicine | literature | peace | economic-sciences |

</RouteEn>

## Panda

### Feeds

<RouteEn author="lyrl" example="/usepanda/feeds/5718e53e7a84fb1901e059cc" path="/usepanda/feeds/:id" :paramsDesc="['Feed ID']">

| Channel                   | feedId                    |
| -------------------- | ------------------------ |
| Github | 5718e53e7a84fb1901e059cc |

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

## Trending Search Keyword Aggregator

### Aggregated Keyword Tracker

Track entries containing specific keywords on major social media platforms.

Current listings: *Weibo Search*、*Toutiao Search*、*Zhihu Search*、*Zhihu Videos*、*Zhihu Topics*。

Data Source: [trending-in-one](https://github.com/huqi-pr/trending-in-one)

<RouteEn author="Jkker" example="/trending/taiwan/3" path="/trending/:keywords/:numberOfDays?" radar="1" :paramsDesc="['List of keywords separated by commas', 'Number of previous days (defaults to 3)']"/>

## TSSstatus (iOS downgrade channel)

### Status

<RouteEn author="xyqfer" example="/tssstatus/j42dap/14W585a" path="/tssstatus/:board/:build" :paramsDesc="['Board id', 'Build id']">

Board and Build can be found in [here](http://api.ineal.me/tss/status)

</RouteEn>

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
