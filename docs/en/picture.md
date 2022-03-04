---
pageClass: routes
---

# Picture

## 1X

### Photos

<RouteEn author="nczitzk" example="/1x" path="/1x/:category?" :paramsDesc="['Category, Latest awarded by default, see below']">

| Category         | Title         |
| ---------------- | ------------- |
| Latest awarded   | latest        |
| Popular          | popular       |
| Latest published | published     |
| Abstract         | abstract      |
| Action           | action        |
| Animals          | animals       |
| Architecture     | architecture  |
| Conceptual       | conceptual    |
| Creative edit    | creative-edit |
| Documentary      | documentary   |
| Everyday         | everyday      |
| Fine Art Nude    | fine-art-nude |
| Humour           | humour        |
| Landscape        | landscape     |
| Macro            | macro         |
| Mood             | mood          |
| Night            | night         |
| Performance      | performance   |
| Portrait         | portrait      |
| Still life       | still-life    |
| Street           | street        |
| Underwater       | underwater    |
| Wildlife         | wildlife      |

</RouteEn>

## Asian to lick

### Home

<RouteEn author="nczitzk" example="/asiantolick" path="/asiantolick"/>

### Category

<RouteEn author="nczitzk" example="/asiantolick/category/90" path="/asiantolick/category/:category?" :paramsDesc="['Category, the id can be found in URL, homepage by default']"/>

### Tag

<RouteEn author="nczitzk" example="/asiantolick/tag/1045" path="/asiantolick/tag/:tag?" :paramsDesc="['Tag, the id can be found in URL, homepage by default']"/>

### Search

<RouteEn author="nczitzk" example="/asiantolick/search/lolita" path="/asiantolick/search/:keyword?" :paramsDesc="['Keyword, empty by default']"/>

## BabeHub

### Category

<RouteEn author="nczitzk" example="/babehub" path="/babehub/:category?" :paramsDesc="['Category, see below, Home by default']">

| Home | Most Viewed | Picture Archive | Video Archive |
| - | - | - | - |
| | most-viewed | picture | video |

</RouteEn>

### Search

<RouteEn author="nczitzk" example="/babehub/search/babe" path="/babehub/search/:keyword?" :paramsDesc="['关键字']"/>

## Bing Wallpaper

### Daily Wallpaper

<RouteEn author="FHYunCai" example="/bing" path="/bing" radar="1" rssbud="1"/>

## ComicsKingdom Comic Strips

<RouteEn author="stjohnjohnson" example="/comicskingdom/baby-blues" path="/comicskingdom/:strip" :paramsDesc="['URL path of the strip on comicskingdom.com']" />

## DailyArt

<RouteEn author="zphw" example="/dailyart/en" path="/dailyart/:language?" :paramsDesc="['Support en, es, fr, de, it, zh, jp, etc. English by default.']" />

## Dilbert Comic Strip

<RouteEn name="Daily Strip" author="Maecenas" example="/dilbert/strip" path="/dilbert/strip"/>

## Elite Babes

### Home

<RouteEn author="nczitzk" example="/elitebabes" path="/elitebabes/:category?" :paramsDesc="['Category, see below, Home by default']"/>

| Home | Hot | Popular | Recent |
| ---- | --- | ------- | ------ |
|      | hot | popular | recent |

</Route>

### Videos

<RouteEn author="nczitzk" example="/elitebabes/videos" path="/elitebabes/videos/:sort?" :paramsDesc="['Sort, see below, Popular by default']" />

| Popular | Recent |
| ------- | ------ |
| popular | recent |

</Route>

### Search

<RouteEn author="nczitzk" example="/elitebabes/search/pose" path="/elitebabes/search/:keyword?" :paramsDesc="['Keyword']"/>

## GoComics Comic Strips

<RouteEn author="stjohnjohnson" example="/gocomics/foxtrot" path="/gocomics/:strip" :paramsDesc="['URL path of the strip on gocomics.com']" />

## Google Doodles

### Update

<RouteEn author="xyqfer" example="/google/doodles/zh-CN" path="/google/doodles/:language?" :paramsDesc="['Language, default to `zh-CN`, for other language values, you can get it from [Google Doodles official website](https://www.google.com/doodles)']" />

## Google Photos

### Public Albums

<RouteEn author="hoilc" example="/google/album/msFFnAzKmQmWj76EA" path="/google/album/:id" :paramsDesc="['album ID, can be found in URL, for example, `https://photos.app.goo.gl/msFFnAzKmQmWj76EA` to `msFFnAzKmQmWj76EA`']" radar="1"/>

## Konachan Anime Wallpapers

::: tip

-   Tags can be copied after `tags=` in [konachan](https://konachan.com/post) URL
-   The route can be / konachan or /konachan.com or /konachan.net, where the first two are the same, and .net is an all-age healthy wallpaper ♡
-   Official Posts RSS: https://konachan.com/post/piclens?tags=[tags]

:::

### Popular Recent Posts

<RouteEn author="magic-akari" example="/konachan/post/popular_recent" path="/konachan/post/popular_recent/:period?" :paramsDesc="['Default to 24 hours']">

For example:

-   24 hours:<https://rsshub.app/konachan/post/popular_recent/1d>
-   1 week:<https://rsshub.app/konachan/post/popular_recent/1w>
-   1 month:<https://rsshub.app/konachan/post/popular_recent/1m>
-   1 year:<https://rsshub.app/konachan/post/popular_recent/1y>

</RouteEn>

## LoveHeaven

### Manga Updates

<RouteEn author="hoilc" example="/loveheaven/update/kimetsu-no-yaiba" path="/loveheaven/update/:slug" :paramsDesc="['Manga slug, can be found in URL, including neither `manga-` nor `.html`']" />

## NASA Astronomy Picture of the Day

### NASA

<RouteEn author="nczitzk" example="/nasa/apod" path="/nasa/apod" />

### Cheng Kung University Mirror

<RouteEn author="nczitzk" example="/nasa/apod-ncku" path="/nasa/apod-ncku" />

## nHentai

### Filter

<RouteEn author="MegrezZhu hoilc" example="/nhentai/language/chinese" path="/nhentai/:key/:keyword/:mode?" :paramsDesc="['Filter term, can be: parody, character, tag, artist, group, language, category','Filter value', 'mode, `simple` to only cover，`detail` to all content, `torrent` to include Magnet URI, need login, refer to [Route-specific Configurations](/en/install/#route-specific-configurations), default to `simple`']" anticrawler="1" supportBT="1" />

### Advanced Search

<RouteEn author="MegrezZhu hoilc" example="/nhentai/search/language%3Ajapanese+-scat+-yaoi+-guro+-%22mosaic+censorship%22" path="/nhentai/search/:keyword/:mode?" :paramsDesc="['Keywords for search. You can copy the content after `q=` after searching on the original website, or you can enter it directly. See the [official website](https://nhentai.net/info/) for details', 'mode, `simple` to only cover，`detail` to all content, `torrent` to include Magnet URI, need login, refer to [Route-specific Configurations](/en/install/#route-specific-configurations), default to `simple`']" anticrawler="1" supportBT="1"/>

## Tits Guru

### Home

<RouteEn author="MegrezZhu" example="/tits-guru/home" path="/tits-guru/home"/>
### Daily Best

<RouteEn author="MegrezZhu" example="/tits-guru/daily" path="/tits-guru/daily"/>
### Models

<RouteEn author="MegrezZhu" example="/tits-guru/model/mila-azul" path="/tits-guru/model/:name" :paramsDesc="['Module name, see [here](https://tits-guru.com/models) for details']"/>
### Categories

<RouteEn author="MegrezZhu" example="/tits-guru/category/bikini" path="/tits-guru/category/:type" :paramsDesc="['Category, see [here](https://tits-guru.com/categories) for details']"/>

## wallhaven

::: tip Tip

When parameter **Need Details** is set to `true` `yes` `t` `y`, RSS will add the title, uploader, upload time, and category information of each image, which can support the filtering function of RSS reader.

However, the number of requests to the site increases a lot when it is turned on, which causes the site to return `Response code 429 (Too Many Requests)`. So you need to specify a smaller `limit` parameter, i.e. add `?limit=<the number of posts for a request>` after the route, here is an example.

For example [Latest Wallpapers](https://wallhaven.cc/latest), the route turning on **Need Details** is [/wallhaven/latest/true](https://rsshub.app/wallhaven/latest/true), and then specify a smaller `limit`. We can get [/wallhaven/latest/true?limit=5](https://rsshub.app/wallhaven/latest/true?limit=5).

:::

### Category

<RouteEn author="nczitzk Fatpandac" example="/wallhaven/latest" path="/wallhaven/:category?/:needDetails?" :paramsDesc="['Category, see below, Latest by default', 'Need Details, `true/yes` as yes, no by default']">

| Latest | Hot | Toplist | Random |
| ------ | --- | ------- | ------ |
| latest | hot | toplist | random |

</RouteEn>

### Search

<RouteEn author="nczitzk Fatpandac" example="/wallhaven/search/categories=110&purity=110&sorting=date_added&order=desc" path="/wallhaven/search/:filter?/:needDetails?" :paramsDesc="['Filter, empty by default', 'Need Details, `true`/`yes` as yes, no by default']">

::: tip Tip

Subscribe pages starting with `https://wallhaven.cc/search`, fill the text after `?` as `filter` in the route. The following is an example:

The text after `?` is `q=id%3A711&sorting=random&ref=fp&seed=8g0dgd` for [Wallpaper Search: #landscape - wallhaven.cc](https://wallhaven.cc/search?q=id%3A711&sorting=random&ref=fp&seed=8g0dgd), so the route is [/wallhaven/q=id%3A711&sorting=random&ref=fp&seed=8g0dgd](https://rsshub.app/wallhaven/q=id%3A711&sorting=random&ref=fp&seed=8g0dgd)

:::

</RouteEn>

## yande.re

::: tip

-   Official RSS: https://yande.re/post/piclens?tags=[tags]

:::

### Popular Recent Posts

<RouteEn author="magic-akari SettingDust" example="/yande.re/post/popular_recent" path="/yande.re/post/popular_recent/:period?" :paramsDesc="['Default to 24 hours']">

For example:

-   24 hours:<https://rsshub.app/yande.re/post/popular_recent/1d>
-   1 week:<https://rsshub.app/yande.re/post/popular_recent/1w>
-   1 month:<https://rsshub.app/yande.re/post/popular_recent/1m>
-   1 year:<https://rsshub.app/yande.re/post/popular_recent/1y>

</RouteEn>
