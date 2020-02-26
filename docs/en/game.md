---
pageClass: routes
---

# Gaming

## dekudeals

### Category

<RouteEn author="LogicJake" example="/dekudeals/most-wanted" path="/dekudeals/:type" :paramsDesc="['Category name']"/>

## Epic Games Store

### Free games

<RouteEn author="Zyx-A" example="/epicgames/freegames" path="/epicgames/freegames"/>

## Metacritic

### Game Releases

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

## Minecraft

### Java Game Update

<Route author="TheresaQWQ" example="/minecraft/version" path="/minecraft/version" />

### CurseForge Mod Update

<RouteEn author="Indexyz" example="/curseforge/files/jei" path="/curseforge/files/:project" :paramsDesc="['Progect shortname or `Project ID`. The short name of the project can be found in the address bar, for exmaple `https://minecraft.curseforge.com/projects/non-update` to `non-update`. `Project ID` can be found in `About This Project` in `Overview`']"/>

## Nintendo

### eShop New Game Releases

<RouteEn author="HFO4" example="/nintendo/eshop/hk" path="/nintendo/eshop/:region" :paramsDesc="['Region, currently supports `hk`(Hong Kong), `jp`(Japan) and `us`(USA)']"/>

### Nintendo Direct

<RouteEn author="HFO4" example="/nintendo/direct" path="/nintendo/direct"/>

### News（Hong Kong only）

<RouteEn author="HFO4" example="/nintendo/news" path="/nintendo/news"/>

### Switch System Update（Japan）

<RouteEn author="hoilc" example="/nintendo/system-update" path="/nintendo/system-update"/>

## PlayStation Store

### Game List（Hong Kong）

<RouteEn author="DIYgod" example="/ps/list/STORE-MSF86012-PLUS_FTT_CONTENT" path="/ps/list/:gridName" :paramsDesc="['gridName from the list']">

Compatible with lists with an URL like <https://store.playstation.com/zh-hans-hk/grid/STORE-MSF86012-PLUS_FTT_CONTENT>. For instance [PSN Free to Play](https://store.playstation.com/zh-hans-hk/grid/STORE-MSF86012-PLUS_FTT_CONTENT), the gridName is STORE-MSF86012-PLUS_FTT_CONTENT

</RouteEn>

### PlayStation Network user trophy

<RouteEn author="DIYgod" example="/ps/trophy/DIYgod_" path="/ps/trophy/:id" :paramsDesc="['User ID']" radar="1"/>

### PlayStation 4 System Update

<RouteEn author="Jeason0228" example="/ps/ps4updates/" path="/ps/ps4updates/" radar="1"/>

## Steam

### Steam search

<RouteEn author="maple3142" example="/steam/search/specials=1&term=atelier" path="/steam/search/:params" :paramsDesc="['search parameters']" radar="1">

Get serach parameters from the URL.

For instance, in `https://store.steampowered.com/search/?specials=1&term=atelier`, the parameters are `specials=1&term=atelier`.

</RouteEn>

### Steam news

<RouteEn author="maple3142" example="/steam/news/282800" path="/steam/news/:appids" :paramsDesc="['game id']" radar="1"/>

## SteamGifts

### Discussions

<RouteEn author="whtsky" example="/steamgifts/discussions" path="/steamgifts/discussions/:category?" :paramsDesc="['category name, default to All']"/>
