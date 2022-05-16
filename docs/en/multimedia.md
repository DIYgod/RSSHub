---
pageClass: routes
---

# Multimedia

## 60-Second Science - Scientific American

<RouteEn author="emdoe" example="/60s-science" path="/60s-science"/>

Full transcript support for better user experience.

## 99% Invisible

### Transcript

<RouteEn author="Ji4n1ng" example="/99percentinvisible/transcript" path="/99percentinvisible/transcript"/>

## Bandcamp

### Weekly

<RouteEn author="nczitzk" example="/bandcamp/weekly" path="/bandcamp/weekly"/>

### Tag

<RouteEn author="nczitzk" example="/bandcamp/tag/united-kingdom" path="/bandcamp/tag/:tag?" :paramsDesc="['Tag, can be found in URL']"/>

### Upcoming Live Streams

<RouteEn author="nczitzk" example="/bandcamp/live" path="/bandcamp/live"/>

## Coomer

### Artist

<RouteEn author="nczitzk" example="/coomer/artist/belledelphine" path="/coomer/artist/:id" :paramsDesc="['Artist id, can be found in URL']"/>

### Recent Posts

<RouteEn author="nczitzk" example="/coomer/posts" path="/coomer/posts"/>

## EZTV

::: tip

Official RSS: <https://eztv.io/ezrss.xml>

:::

### Lookup Torrents by IMDB ID

<RouteEn author="Songkeys" example="/eztv/torrents/6048596" path="/eztv/torrents/:imdb_id" :paramsDesc="['The IMDB ID corresponding to the seed of show you want to search can be found on the official website [IMDB](https://www.imdb.com)']" supportBT="1"/>

## Hentaimama

### Recent Videos

<RouteEn author="everyonus" example="/hentaimama/videos" path="/hentaimama/videos" />

## JAVLibrary

### Recently Discussed Videos

<RouteEn author="nczitzk" example="/javlibrary/update/en" path="/javlibrary/update/:language?" :paramsDesc="['Language, see below, Japanese by default, as `ja`']" radar="1" rssbud="1"/>

### New Releases

<RouteEn author="nczitzk" example="/javlibrary/newrelease/en" path="/javlibrary/newrelease/:language?/:mode?" :paramsDesc="['Language, see below, Japanese by default, as `ja`', 'Mode, see below, videos with comments (by date) by default, as `1`']" radar="1" rssbud="1">

| videos with comments (by date) | everything (by date) |
| ------------------------------ | -------------------- |
| 1                              | 2                    |

</RouteEn>

### Recently Inserted Videos

<RouteEn author="nczitzk" example="/javlibrary/newentries/en" path="/javlibrary/newentries/:language?" :paramsDesc="['Language, see below, Japanese by default, as `ja`']" radar="1" rssbud="1"/>

### Most Wanted Videos

<RouteEn author="nczitzk" example="/javlibrary/mostwanted/en" path="/javlibrary/mostwanted/:language?/:mode?" :paramsDesc="['Language, see below, Japanese by default, as `ja`', 'Mode, see below, Last Month by default, as `1`']" radar="1" rssbud="1">

| Last Month | All Time |
| ---------- | -------- |
| 1          | 2        |

</RouteEn>

### Best Rated Videos

<RouteEn author="nczitzk" example="/javlibrary/bestrated/en" path="/javlibrary/bestrated/:language?/:mode?" :paramsDesc="['Language, see below, Japanese by default, as `ja`', 'Mode, see below, Last Month by default, as `1`']" radar="1" rssbud="1">

| Last Month | All Time |
| ---------- | -------- |
| 1          | 2        |

</RouteEn>

### Best Reviews

<RouteEn author="DCJaous nczitzk" example="/javlibrary/bestreviews/en" path="/javlibrary/bestreviews/:language?/:mode?" :paramsDesc="['Language, see below, Japanese by default, as `ja`', 'Mode, see below, Last Month by default, as `1`']" radar="1" rssbud="1">

| Last Month | All Time |
| ---------- | -------- |
| 1          | 2        |

</RouteEn>

### Videos by categories

<RouteEn author="nczitzk" example="/javlibrary/genre/amjq/en" path="/javlibrary/genre/:genre?/:language?/:mode?" :paramsDesc="['Category, Acme · Orgasm by default, as `amjq`', 'Language, see below, Japanese by default, as `ja`', 'Mode, see below, videos with comments (by date) by default, as `1`']" radar="1" rssbud="1">

| videos with comments (by date) | everything (by date) |
| ------------------------------ | -------------------- |
| 1                              | 2                    |

::: tip Tip

See [Categories](https://www.javlibrary.com/en/genres.php) to view all categories.

:::

</RouteEn>

### Videos by star

<RouteEn author="Diygod junfengP nczitzk" example="/javlibrary/star/abbds/en" path="/javlibrary/star/:id/:language?/:mode?" :paramsDesc="['Star id, can be found in URL', 'Language, see below, Japanese by default, as `ja`', 'Mode, see below, videos with comments (by date) by default, as `1`']" radar="1" rssbud="1">

| videos with comments (by date) | everything (by date) |
| ------------------------------ | -------------------- |
| 1                              | 2                    |

::: tip Tip

See [Ranking](https://www.javlibrary.com/en/star_mostfav.php) to view stars by ranks.

See [Directory](https://www.javlibrary.com/en/star_list.php) to view all stars.

:::

</RouteEn>

### Posts published by user

<RouteEn author="Diygod junfengP nczitzk" example="/javlibrary/userposts/mangudai/en" path="/javlibrary/userposts/:id/:language?" :paramsDesc="['User id, can be found in URL', 'Language, see below, Japanese by default, as `ja`']" radar="1" rssbud="1"/>

### Videos by user

<RouteEn author="Diygod junfengP nczitzk" example="/javlibrary/userwatched/mangudai/en" path="/javlibrary/:type/:id/:language?" :paramsDesc="['Type, see below', 'User id, can be found in URL', 'Language, see below, Japanese by default, as `ja`']" radar="1" rssbud="1">

| Wanted     | Watched     | Owned     |
| ---------- | ----------- | --------- |
| userwanted | userwatched | userowned |

</RouteEn>

## Melon

### Chart

<RouteEn author="nczitzk" example="/melon/chart" path="/melon/chart/:category?" :paramsDesc="['Category, see below, 24H by default']">

| 24H | 일간 | 주간 | 월간 |
| - | - | - | - |
| | day | week | month |

</RouteEn>

## Nyaa

### Seatch Result

<RouteEn author="Lava-Swimmer" example="/nyaa/search/psycho-pass" path="/nyaa/search/:keyword" :paramsDesc="['Search keyword']" supportBT="1"/>

## PornHub

### Category

<RouteEn author="nczitzk" example="/pornhub/category/popular-with-women" path="/pornhub/category/:caty" :paramsDesc="['category，see [categories](https://cn.pornhub.com/webmasters/categories)']"/>

### Keyword Search

<RouteEn author="nczitzk" example="/pornhub/search/stepsister" path="/pornhub/search/:keyword" :paramsDesc="['keyword']"/>

### Users

<RouteEn author="I2IMk queensferryme" example="/pornhub/users/pornhubmodels" path="/pornhub/:language?/users/:username" :paramsDesc="['language, see below', 'username, part of the url e.g. `pornhub.com/users/pornhubmodels`']" />

### Verified amateur / Model

<RouteEn author="I2IMk queensferryme" example="/pornhub/model/stacy-starando" path="/pornhub/:language?/model/:username/:sort?" :paramsDesc="['language, see below', 'username, part of the url e.g. `pornhub.com/model/stacy-starando`', 'sorting method, see below']" />

### Verified model / Pornstar

<RouteEn author="I2IMk queensferryme" example="/pornhub/pornstar/june-liu" path="/pornhub/:language?/pornstar/:username/:sort?" :paramsDesc="['language, see below', 'username, part of the url e.g. `pornhub.com/pornstar/june-liu`', 'sorting method, see below']" />

**`sort`**

| mr          | mv          | tr        | lg      | cm     |
| ----------- | ----------- | --------- | ------- | ------ |
| Most Recent | Most Viewed | Top Rated | Longest | Newest |

### Video List

<RouteEn author="I2IMk queensferryme" example="/pornhub/category_url/video%3Fc%3D15%26o%3Dmv%26t%3Dw%26cc%3Djp" path="/pornhub/:language?/category_url/:url?" :paramsDesc="['language, see below', 'relative path after `pornhub.com/`, need to be URL encoded']"/>

**`language`**

Refer to [Pornhub F.A.Qs](https://help.pornhub.com/hc/en-us/articles/360044327034-How-do-I-change-the-language-), English by default. For example:

- `cn` (Chinese), for Pornhub in China <https://cn.pornhub.com/>；

- `jp` (Japanese), for Pornhub in Japan <https://jp.pornhub.com/> etc.

## s-hentai

### Category

<RouteEn author="nczitzk" example="/s-hentai" path="/hentai/:id?" :paramsDesc="['id, see below, ready-to-download by default']">

| Doujin | HCG | Games・Animes | Voices・ASMR | Ready to Download |
| ------ | --- | ------------- | ------------ | ----------------- |
| 1      | 2   | 3             | 4            | ready-to-download |

</RouteEn>

## Sankaku Complex

### Post

<RouteEn author="xyqfer" example="/sankakucomplex/post" path="/sankakucomplex/post"/>

## SoundCloud

### Tracks

<RouteEn author="fallenhh" example="/soundcloud/tracks/angeart" path="/soundcloud/tracks/:user" :paramsDesc="['User name']" />

## Spotify

### Artist Albums

<RouteEn author="outloudvi" example="/spotify/artist/6k9TBCxyr4bXwZ8Y21Kwn1" path="/spotify/artist/:id" :paramsDesc="['Artist ID']" />

### Playlist

<RouteEn author="outloudvi" example="/spotify/playlist/4UBVy1LttvodwivPUuwJk2" path="/spotify/playlist/:id" :paramsDesc="['Playlist ID']" />

### Personal Saved Tracks

<RouteEn author="outloudvi" example="/spotify/saved/50" path="/spotify/saved/:limit?" :paramsDesc="['Track count, 50 by default']" />

### Personal Top Tracks

<RouteEn author="outloudvi" example="/spotify/top/tracks" path="/spotify/top/tracks" />

### Personal Top Artists

<RouteEn author="outloudvi" example="/spotify/top/artists" path="/spotify/top/artists" />

## Trakt.tv

### User Collection

<RouteEn author="hoilc" example="/trakt/collection/tomyangsh/movies" path="/trakt/collection/:username/:type?" :paramsDesc="['Username','Collection type, can be `movies`,`shows`,`episodes`,`all`, default to `all`']" radar="1" rssbud="1" />

## YouTube

Refer to [#youtube](/en/social-media.html#youtube)
