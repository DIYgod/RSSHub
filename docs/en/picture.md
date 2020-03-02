---
pageClass: routes
---

# Picture

## 1X

### Magazine

<RouteEn author="emdoe" example="/1x/magazine" path="/1x/magazine"/>

## Awesome Pigtails

### New

<RouteEn author="Chingyat" example="/pigtails" path="/pigtails/index"/>

## Bing Wallpaper

### Daily Wallpaper

<RouteEn author="FHYunCai" example="/bing" path="/bing" radar="1"/>

## Dilbert Comic Strip

<RouteEn name="Daily Strip" author="Maecenas" example="/dilbert/strip" path="/dilbert/strip"/>

## Google Doodles

### Update

<RouteEn author="xyqfer" example="/google/doodles/zh-CN" path="/google/doodles/:language?" :paramsDesc="['Language, default to `zh-CN`, for other language values, you can get it from [Google Doodles official website](https://www.google.com/doodles)']" />

## Google Photos

### Public Albums

<Route author="hoilc" example="/google/album/msFFnAzKmQmWj76EA" path="/google/album/:id" :paramsDesc="['album ID, can be found in URL, for example, `https://photos.app.goo.gl/msFFnAzKmQmWj76EA` to `msFFnAzKmQmWj76EA`']" radar="1" />

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
