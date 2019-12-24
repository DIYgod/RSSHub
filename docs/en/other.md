---
pageClass: routes
---

# Uncategorized

## All Poetry

### Poems

<RouteEn author="HenryQW" example="/allpoetry/newest" path="/allpoetry/:order?" :paramsDesc="['order by type, `best` or `newest`, default to `best`']"/>

## Apple

### Exchange and Repair Extension Programs

<RouteEn author="metowolf HenryQW" example="/apple/exchange_repair" path="/apple/exchange_repair/:country?" :paramsDesc="['country code in apple.com URL (exception: for `United States` please use `us`), default to China `cn`']" />

## aptonic

### New Dropzone Actions

<RouteEn author="HenryQW" example="/aptonic/action" path="/aptonic/action"/>

## AutoTrader

### Search

<RouteEn author="HenryQW" example="/autotrader/radius=50&postcode=sw1a1aa&onesearchad=Used&onesearchad=Nearly%20New&onesearchad=New&price-to=9000&year-from=2012&body-type=Hatchback&transmission=Automatic&exclude-writeoff-categories=on" path="/autotrader/:query" :paramsDesc="['the search query']">

1. Conduct a search with desired filters on AutoTrader
1. Copy everything in the URL after `?`, for example: `https://www.autotrader.co.uk/car-search?radius=50&postcode=sw1a1aa&onesearchad=Used&onesearchad=Nearly%20New&onesearchad=New&price-to=9000&year-from=2012&body-type=Hatchback&transmission=Automatic&exclude-writeoff-categories=on` will produce `radius=50&postcode=sw1a1aa&onesearchad=Used&onesearchad=Nearly%20New&onesearchad=New&price-to=9000&year-from=2012&body-type=Hatchback&transmission=Automatic&exclude-writeoff-categories=on`

</RouteEn>

## Emi Nitta official website

### Recent update

<Route author="luyuhuang" example="/emi-nitta/updates" path="/emi-nitta/updates"/>

### News

<Route author="luyuhuang" example="/emi-nitta/news" path="/emi-nitta/news"/>

## EZTV

::: tip

EZTV provides an official RSS feed of all torrents: https://eztv.ag/ezrss.xml

:::

### Torrent Lookup by IMDB ID

<RouteEn author="Songkeys" path="/eztv/torrents/:imdb_id" example="/eztv/torrents/6048596" :paramsDesc="['search for the IMDB ID of the desired show, available at [IMDB](https://www.imdb.com)']" />

## Japanpost

### Track & Trace Service

<RouteEn author="tuzi3040" example="/japanpost/EJ123456789JP" path="/japanpost/:reqCode" :paramsDesc="['Package Number']"/>

## Parcel Tracking

### Hermes UK

<RouteEn author="HenryQW" example="/parcel/hermesuk/[tracking number]" path="/parcel/hermesuk/:tracking" :paramsDesc="['Tracking number']"/>

## Remote.work

### Remote.work Job Information

<RouteEn author="luyuhuang" example="/remote-work/all" path="/remote-work/:caty?" :paramsDesc="['Job category, default to all']" radar="1">

| All Jobs | Development | Design | Operation | Product | Other | Marketing | Sales |
| :------: | :---------: | :----: | :-------: | :-----: | :---: | :-------: | :---: |
|   all    | development | design | operation | product | other | marketing | sales |

</RouteEn>

## TransferWise

### FX Pair Yesterday

<RouteEn author="HenryQW" example="/transferwise/pair/GBP/USD" path="/transferwise/pair/:source/:target" :paramsDesc="['Base currency abbreviation','Quote currency abbreviation']">

See [the list of supported currencies](https://transferwise.com/tools/exchange-rate-alerts/).

</RouteEn>
