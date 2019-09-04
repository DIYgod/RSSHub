---
pageClass: routes
---

# Gaming

## Game List（Hong Kong only）

<RouteEn author="DIYgod" example="/ps/list/STORE-MSF86012-PLUS_FTT_CONTENT" path="/ps/list/:gridName" :paramsDesc="['gridName from the list']">

Compatible with lists with an URL like <https://store.playstation.com/zh-hans-hk/grid/STORE-MSF86012-PLUS_FTT_CONTENT>. For instance [PSN Free to Play](https://store.playstation.com/zh-hans-hk/grid/STORE-MSF86012-PLUS_FTT_CONTENT), the gridName is STORE-MSF86012-PLUS_FTT_CONTENT

</RouteEn>

# Metacritic

## Game Releases

<RouteEn author="HenryQW" example="/metacritic/release/switch/coming" path="/metacritic/release/:platform/:type?/:sort?" :paramsDesc="['console platform', 'release type, default to `new`', 'sorting type, default to `date`']">

Platforms supported:

| PS 4 | Xbox One | Switch | PC  | Wii U | 3DS | PS Vita | iOS |
| ---- | -------- | ------ | --- | ----- | --- | ------- | --- |
| ps4  | xboxone  | switch | pc  | wii-u | 3ds | vita    | ios |

Release types, default to `new`:

| New | Coming Soon | All |
| --- | ----------- | --- |
| new | coming      | all |

Sorting types, default to `date`:

| Date | Metacritic Score | User Score |
| ---- | ---------------- | ---------- |
| date | metascore        | userscore  |

</RouteEn>

## Nintendo

### eShop New Game Releases

<RouteEn author="HFO4" example="/nintendo/eshop/hk" path="/nintendo/eshop/:region" :paramsDesc="['Region, currently supports `hk`(Hong Kong), `jp`(Japan) and `us`(USA)']"/>

### Nintendo Direct

<RouteEn author="HFO4" example="/nintendo/direct" path="/nintendo/direct"/>

### News（Hong Kong only）

<Route author="HFO4" example="/nintendo/news" path="/nintendo/news"/>

# PlayStation Store

## Steam

### Steam search

<RouteEn author="maple3142" example="/steam/search/specials=1&term=atelier" path="/steam/search/:params" :paramsDesc="['search parameters']">

Get serach parameters from the URL.

For instance, in `https://store.steampowered.com/search/?specials=1&term=atelier`, the parameters are `specials=1&term=atelier`.

</RouteEn>

### Steam news

<RouteEn author="maple3142" example="/steam/news/282800" path="/steam/news/:appids" :paramsDesc="['game id']"/>

## SteamGifts

### Discussions

<RouteEn author="whtsky" example="/steamgifts/discussions" path="/steamgifts/discussions/:category?" :paramsDesc="['category name, default to All']"/>
