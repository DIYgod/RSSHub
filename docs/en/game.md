---
pageClass: routes
---

# Gaming

## Blizzard

### News

<RouteEn author="nczitzk" example="/blizzard/news" path="/blizzard/news/:language?/:category?" :paramsDesc="['Language code, see below, en-US by default', 'Category, see below, All News by default']">

Categories

| Category               | Slug                |
| ---------------------- | ------------------- |
| All News               |                     |
| Diablo III             | diablo3             |
| Diablo IV              | diablo4             |
| Diablo: Immortal       | diablo-immortal     |
| Hearthstone            | hearthstone         |
| Heroes of the Storm    | heroes-of-the-storm |
| Overwatch              | overwatch           |
| StarCraft: Remastered  | starcraft           |
| StarCraft II           | starcraft2          |
| World of Warcraft      | world-of-warcraft   |
| Warcraft III: Reforged | warcraft3           |
| BlizzCon               | blizzcon            |
| Inside Blizzard        | blizzard            |

Language codes

| Language       | Code  |
| -------------- | ----- |
| Deutsch        | de-de |
| English (US)   | en-us |
| English (EU)   | en-gb |
| Español (EU)   | es-es |
| Español (AL)   | es-mx |
| Français       | fr-fr |
| Italiano       | it-it |
| Português (AL) | pt-br |
| Polski         | pl-pl |
| Русский        | ru-ru |
| 한국어         | ko-kr |
| ภาษาไทย        | th-th |
| 日本語         | ja-jp |
| 繁體中文       | zh-tw |
| 简体中文       | zh-cn |

</RouteEn>

## dekudeals

### Category

<RouteEn author="LogicJake" example="/dekudeals/most-wanted" path="/dekudeals/:type" :paramsDesc="['Category name']"/>

## Epic Games Store

### Free games

<RouteEn author="Zyx-A" example="/epicgames/freegames" path="/epicgames/freegames"/>

## Konami

### PES Mobile Announcement

<RouteEn author="HenryQW" example="/konami/pesmobile/en/ios" path="/konami/pesmobile/:lang?/:os?" :paramsDesc="['language, obtained from the URL, eg. zh-cn, zh-tw, en', 'operating system，iOS or Android']"/>

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

<RouteEn author="TheresaQWQ" example="/minecraft/version" path="/minecraft/version" />

### CurseForge Mod Update

<RouteEn author="Indexyz" example="/curseforge/files/jei" path="/curseforge/files/:project" :paramsDesc="['Progect shortname or `Project ID`. The short name of the project can be found in the address bar, for exmaple `https://minecraft.curseforge.com/projects/non-update` to `non-update`. `Project ID` can be found in `About This Project` in `Overview`']"/>

### Feed The Beast Modpack Updates

<RouteEn author="gucheen" example="/feed-the-beast/modpack/ftb_presents_direwolf20_1_16" path="/feed-the-beast/modpack/:modpackEntry" :paramsDesc="['entry name of modpack.']">
| param | description |
| ------| ------------ |
| modpackEntry | The entry name of modpack, can be found in modpack\'s page link, for `https://www.feed-the-beast.com/modpack/ftb_presents_direwolf20_1_16`, use `ftb_presents_direwolf20_1_16`. |
</RouteEn>

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

### Game Product Price

<RouteEn author="MisteryMonster" example="/ps/product/UP9000-CUSA00552_00-THELASTOFUS00000" path="/ps/:lang/product/:gridName" :paramsDesc="['region','gridName from the product']" radar="1" rssbud="1">

Tested some countries, it should be work for most.

Compatible with Product with an URL like <https://store.playstation.com/en-us/product/HP4497-CUSA16570_00-ASIAFULLGAME0000>. For instance ['Cyberpunk 2077'](https://store.playstation.com/en-us/product/HP4497-CUSA16570_00-ASIAFULLGAME0000) the region is `en-us`, the gridName is `HP4497-CUSA16570_00-ASIAFULLGAME0000`

</RouteEn>

### PlayStation Network user trophy

<RouteEn author="DIYgod" example="/ps/trophy/DIYgod_" path="/ps/trophy/:id" :paramsDesc="['User ID']" radar="1" rssbud="1"/>

### PlayStation 4 System Update

<RouteEn author="Jeason0228" example="/ps/ps4updates/" path="/ps/ps4updates/" radar="1" rssbud="1"/>

## Steam

### Steam search

<RouteEn author="maple3142" example="/steam/search/specials=1&term=atelier" path="/steam/search/:params" :paramsDesc="['search parameters']" radar="1" rssbud="1">

Get serach parameters from the URL.

For instance, in `https://store.steampowered.com/search/?specials=1&term=atelier`, the parameters are `specials=1&term=atelier`.

</RouteEn>

### Steam news

<RouteEn author="maple3142" example="/steam/news/282800" path="/steam/news/:appids" :paramsDesc="['game id']" radar="1" rssbud="1"/>


::: tip

Steam provides some official RSS feeds:

-   Game News: https://store.steampowered.com/feeds/news/app/412830/
-   Curator/Group/Publisher/Developer News: https://store.steampowered.com/feeds/news/group/35143931/

Game News use the AppID while the rest are only available in the Steam News UI, it seems.

:::

## SteamGifts

### Discussions

<RouteEn author="whtsky" example="/steamgifts/discussions" path="/steamgifts/discussions/:category?" :paramsDesc="['category name, default to All']"/>
