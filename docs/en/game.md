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
| Diablo II: Resurrected | diablo2             |
| Diablo III             | diablo3             |
| Diablo IV              | diablo4             |
| Diablo: Immortal       | diablo-immortal     |
| Hearthstone            | hearthstone         |
| Heroes of the Storm    | heroes-of-the-storm |
| Overwatch 2            | overwatch           |
| StarCraft: Remastered  | starcraft           |
| StarCraft II           | starcraft2          |
| World of Warcraft      | world-of-warcraft   |
| Warcraft III: Reforged | warcraft3           |
| Battle.net             | battlenet           |
| BlizzCon               | blizzcon            |
| Inside Blizzard        | blizzard            |

Language codes

| Language       | Code  |
| -------------- | ----- |
| Deutsch        | de-de    |
| English (US)   | en-us    |
| English (EU)   | en-gb    |
| Español (EU)   | es-es    |
| Español (Latino)   | es-mx    |
| Français       | fr-fr    |
| Italiano       | it-it    |
| Português (Brasil) | pt-br    |
| Polski         | pl-pl    |
| Русский        | ru-ru    |
| 한국어          | ko-kr    |
| ภาษาไทย        | th-th    |
| 日本語          | ja-jp    |
| 繁體中文        | zh-tw    |

</RouteEn>

## dekudeals

### Category

<RouteEn author="LogicJake" example="/dekudeals/most-wanted" path="/dekudeals/:type" :paramsDesc="['Category name']"/>

## Epic Games Store

### Free games

<RouteEn author="Zyx-A nczitzk  KotaHv" example="/epicgames/freegames" path="/epicgames/freegames/:locale?/:country?" :paramsDesc="['Locale, en_US by default', 'Country, en_US by default']"/>

## FINAL FANTASY XIV

### FINAL FANTASY XIV (The Lodestone)

<RouteEn author="chengyuhui" example="/ff14/global/na/all" path="/ff14/global/:lang/:type?" :paramsDesc="['Region', 'Category, `all` by default']">

Region

| North Ameria | Europe | France | Germany | Japan |
| ------------ | ------ | ------ | ------- | ----- |
| na           | eu     | fr     | de      | jp    |

Category

| all | topics | notices | maintenance | updates | status   | developers |
| --- | ------ | ------- | ----------- | ------- | -------- | ---------- |

</RouteEn>

## Fortnite

### News

<RouteEn author="lyqluis" example="/fortnite/news" path="/fortnite/news/:options?" :paramsDesc="['Params']" radar="1" puppeteer="1">

-   `options.lang`, optional, language, eg. `/fortnite/news/lang=en-US`, common languages are listed below, more languages are available one the [official website](https://www.fortnite.com/news)

| English (default) | Spanish | Japanese | French | Korean | Polish |
| ----------------- | ------- | -------- | ------ | ------ | ------ |
| en-US             | es-ES   | ja       | fr     | ko     | pl     |

</RouteEn>

## Gamer Secret

### Latest News

<RouteEn author="nczitzk" example="/gamersecret" path="/gamersecret"/>

### Category

<RouteEn author="nczitzk" example="/gamersecret" path="/gamersecret/:type?/:category?" :paramsDesc="['Type, see below, Latest News by default', 'Category, see below']">

| Latest News | PC | Playstation | Nintendo | Xbox | Moblie |
| ----------- | -- | ----------- | -------- | ---- | ------ |
| latest-news | pc | playstation | nintendo | xbox | moblie |

Or

| GENERAL          | GENERAL EN         | MOBILE          | MOBILE EN         |
| ---------------- | ------------------ | --------------- | ----------------- |
| category/general | category/generalen | category/mobile | category/mobileen |

| NINTENDO          | NINTENDO EN         | PC          | PC EN         |
| ----------------- | ------------------- | ----------- | ------------- |
| category/nintendo | category/nintendoen | category/pc | category/pcen |

| PLAYSTATION          | PLAYSTATION EN         | REVIEWS          |
| -------------------- | ---------------------- | ---------------- |
| category/playstation | category/playstationen | category/reviews |

| XBOX          | XBOX EN         |
| ------------- | --------------- |
| category/xbox | category/xboxen |

</RouteEn>

## itch.io

### Browse

<RouteEn author="nczitzk" example="/itch/games/new-and-popular/featured" path="/itch/:params?" :paramsDesc="['Params']">

`params` is the field after `itch.io` in the URL of the corresponding page, e.g. the URL of [Top Rated Games tagged Singleplayer](https://itch.io/games/top-rated/tag-singleplayer) is <https://itch.io/games/top-rated/tag-singleplayer>, where the field after `itch.io` is `/games/top-rated/tag-singleplayer`.

So the route is [`/itch/games/top-rated/tag-singleplayer`](https://rsshub.app/itch/games/top-rated/tag-singleplayer).

::: tip tips

You can browse all the tags at [here](https://itch.io/tags).

:::

</RouteEn>

### Developer Logs

<RouteEn author="nczitzk" example="/itch/devlog/teamterrible/the-baby-in-yellow" path="/itch/devlog/:user/:id" :paramsDesc="['User id, can be found in URL', 'Item id, can be found in URL']">

`User id` is the field before `.itch.io` in the URL of the corresponding page, e.g. the URL of [The Baby In Yellow Devlog](https://teamterrible.itch.io/the-baby-in-yellow/devlog) is <https://teamterrible.itch.io/the-baby-in-yellow/devlog>, where the field before `.itch.io` is `teamterrible`.

`Item id` is the field between `itch.io` and `/devlog` in the URL of the corresponding page, e.g. the URL for [The Baby In Yellow Devlog](https://teamterrible.itch.io/the-baby-in-yellow/devlog) is <https://teamterrible.itch.io/the-baby-in-yellow/devlog>, where the field between `itch.io` and `/devlog` is `the-baby-in-yellow`.

So the route is [`/itch/devlogs/teamterrible/the-baby-in-yellow`](https://rsshub.app/itch/devlogs/teamterrible/the-baby-in-yellow).

</RouteEn>

### Posts

<RouteEn author="nczitzk" example="/itch/posts/9539/introduce-yourself" path="/itch/posts/:topic/:id" :paramsDesc="['Topic id, can be found in URL', 'Topic name, can be found in URL']"/>

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

<RouteEn author="Indexyz" example="/curseforge/files/jei" path="/curseforge/files/:project" :paramsDesc="['Progect shortname or `Project ID`. The short name of the project can be found in the address bar, for example `https://minecraft.curseforge.com/projects/non-update` to `non-update`. `Project ID` can be found in `About This Project` in `Overview`']"/>

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

## ProjectSekai ｜ プロセカ

### News

<RouteEn author="15x15G" example="/pjsk/news" path="/pjsk/news"/>

## Steam

### Steam search

<RouteEn author="maple3142" example="/steam/search/specials=1" path="/steam/search/:params" :paramsDesc="['search parameters']" radar="1" rssbud="1">

Get serach parameters from the URL.

For instance, in `https://store.steampowered.com/search/?specials=1&term=atelier`, the parameters are `specials=1&term=atelier`.

</RouteEn>

### Steam news

::: tip

Steam provides some official RSS feeds:

-   News home page: [https://store.steampowered.com/feeds/news/?l=english](https://store.steampowered.com/feeds/news/?l=english) the parameter `l=english` specifiy the language.
-   Game news rss can get from the rss buttom in page like this: [https://store.steampowered.com/news/app/648800/](https://store.steampowered.com/news/app/648800/), rss link will looks like： [https://store.steampowered.com/feeds/news/app/648800/?cc=US&l=english](https://store.steampowered.com/feeds/news/app/648800/?cc=US&l=english)
-   Steam group can add `/rss` behind Steam community URL to subscribe: [https://steamcommunity.com/groups/SteamLabs/rss](https://steamcommunity.com/groups/SteamLabs/rss) or add the `/feeds` in Steam News : [https://store.steampowered.com/feeds/news/group/35143931/](https://store.steampowered.com/feeds/news/group/35143931/)

:::

## SteamGifts

### Discussions

<RouteEn author="whtsky" example="/steamgifts/discussions" path="/steamgifts/discussions/:category?" :paramsDesc="['category name, default to All']"/>

## TapTap International

::: warning Warning

Due to the regional restrictions, an RSSHub deployment in China Mainland may not work on accessing the TapTap International Website.

:::

### Game Topics

::: tip Tips

Unlike TapTap China Mainland Website, the International Website has no BBS.

:::

### Game's Changelog

<RouteEn author="hoilc ETiV" example="/taptap/intl/changelog/191001/zh_TW" path="/taptap/intl/changelog/:id/:lang?" :paramsDesc="['Game\'s App ID, you may find it from the URL of the Game', 'Language, checkout the table below for possible values, default is `en_US`']">

#### Language Code

| English (US) | 繁體中文 | 한국어 | 日本語 |
| ----- | ----- | ----- | ----- |
| en_US | zh_TW | ko_KR | ja_JP |

</RouteEn>

### Ratings & Reviews

<RouteEn author="hoilc TonyRL ETiV" example="/taptap/intl/review/82354/new/zh_TW" path="/taptap/intl/review/:id/:order?/:lang?" :paramsDesc="['Game\'s App ID, you may find it from the URL of the Game', 'Sort Method, you may use `new` as the **Most Recent**, use `default` or leave it empty for the **Most Relevant**', 'Language, checkout the table below for possible values, default is `en_US`']">

#### Sort Method

| Most Relevant  | Most Recent |
| -------------- | ---- |
| default        | new  |

#### Language Code

| English (US) | 繁體中文 | 한국어 | 日本語 |
| ----- | ----- | ----- | ----- |
| en_US | zh_TW | ko_KR | ja_JP |

</RouteEn>

## War Thunder

### News

<RouteEn author="axojhf" example="/warthunder/news" path="/warthunder/news">

News data from <https://warthunder.com/en/news/>
The year, month and day provided under UTC time zone are the same as the official website, so please ignore the specific time!!!

</RouteEn>

## ファミ通

### Category

<RouteEn author="TonyRL" example="/famitsu/category/new-article" path="/famitsu/category/:category?" :paramsDesc="['Category, see table below, `new-article` by default']" radar="1">

| 新着          | PS5 | Switch | PS4 | ニュース | ゲームニュース   | PR TIMES | 動画     | 特集・企画記事         | インタビュー    | 取材・リポート      | レビュー   | インディーゲーム   |
| ----------- | --- | ------ | --- | ---- | --------- | -------- | ------ | --------------- | --------- | ------------ | ------ | ---------- |
| new-article | ps5 | switch | ps4 | news | news-game | prtimes  | videos | special-article | interview | event-report | review | indie-game |

</RouteEn>
