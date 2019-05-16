---
sidebar: auto
---

<p align="center" class="logo-img">
    <img src="/logo.png" alt="RSSHub" width="100">
</p>
<h1 align="center" class="logo-text">RSSHub</h1>

> 🍰 Everything is RSSible

RSSHub is a lightweight and extensible RSS feed aggregator, it's able to generate feeds from pretty much everything.

## Special Thanks

### Special Sponsors

<a href="https://rixcloud.app/rsshub" target="_blank"><img width="240px" src="https://i.imgur.com/qRP0eMg.png"></a>

### Sponsors

| [Eternal Proxy](https://proxy.eternalstudio.cn/?from=rsshub) | [Liuyang](https://github.com/lingllting) | [Sayori Studio](https://t.me/SayoriStudio) | 匿名 | [Sion Kazama](https://blog.sion.moe) |
| :----------------------------------------------------------: | :--------------------------------------: | :----------------------------------------: | :--: | :----------------------------------: |


[![](https://opencollective.com/static/images/become_sponsor.svg)](https://docs.rsshub.app/support/)

### Contributors

[![](https://opencollective.com/RSSHub/contributors.svg?width=890)](https://github.com/DIYgod/RSSHub/graphs/contributors)

Logo designed by [sheldonrrr](https://dribbble.com/sheldonrrr)

::: tip

Free feel to test the [demo instance](https://rsshub.app), the cache expiry time is set to 10 minutes.

:::

## Parameters

::: tip

All parameters can be linked with `&` to used together to generate a complex feed

:::

### Filtering

The following URL query parameters are supported, Regex support is built-in

Set `filter` to include the content

-   filter: filter title and description

-   filter_title: filter title only

-   filter_description: filter description only

-   filter_author: filter author only

For example: [https://rsshub.app/dribbble/popular?filter=Blue|Yellow|Black](https://rsshub.app/dribbble/popular?filter=Blue|Yellow|Black)

Set `filterout` to exclude unwanted content

-   filterout: filter title and description

-   filterout_title: filter title only

-   filterout_description: filter description only

-   filterout_author: filter author only

For example: [https://rsshub.app/dribbble/popular?filterout=Blue|Yellow|Black](https://rsshub.app/dribbble/popular?filterout=Blue|Yellow|Black)

### Limit Entries

Set `limit` to limit the number of articles in the feed,

Eg: Dribbble Popular Top 10 [https://rsshub.app/dribbble/popular?limit=10](https://rsshub.app/dribbble/popular?limit=10)

### Output Formats

RSSHub supports RSS 2.0 and Atom as the output formats, simply append `.rss` `.atom` to the end of the feed address, default to RSS 2.0

For exmaple:

-   Default (RSS 2.0) - [https://rsshub.app/dribbble/popular](https://rsshub.app/dribbble/popular)
-   RSS 2.0 - [https://rsshub.app/dribbble/popular.rss](https://rsshub.app/dribbble/popular.rss)
-   Atom - [https://rsshub.app/dribbble/popular.atom](https://rsshub.app/dribbble/popular.atom)
-   Apply filters or URL query [https://rsshub.app/dribbble/popular.atom?filterout=Blue|Yellow|Black](https://rsshub.app/dribbble/popular.atom?filterout=Blue|Yellow|Black)

## API

::: warning Warning
The API is under active development and is subject to change. All suggestions are welcome!
:::

RSSHub provides the following APIs:

### List of Public Routes

::: tip Tip
This API **will not** return any routes under `lib/protected_router.js`.
:::

Eg: <https://rsshub.app/api/routes/github>

Route: `/api/routes/:name?`

Parameters:

-   name, route's top level name as in [https://github.com/DIYgod/RSSHub/tree/master/lib/routes](https://github.com/DIYgod/RSSHub/tree/master/lib/routes). Optional, **returns all public routes if not specified**.

A successful request returns a HTTP status code `200 OK` with the result in JSON:

```js
{
    "status": "success",
    "data": {
        "github": {
            "routes": [
                "/github/trending/:since/:language?",
                "/github/issue/:user/:repo",
                "/github/user/followers/:user",
                "/github/stars/:user/:repo"
            ]
        }
    },
    "message": "request returned 4 routes"
}
```

If no matching results were found, the server returns only a HTTP status code `204 No Content`.

## Application Updates

### RSSHub

### Update

<RouteEn path="/rsshub/rss" example="/rsshub/rss" />

### MIUI

### New firmware

<RouteEn author="Indexyz" example="/miui/aries/" path="/miui/:device/:type?" :paramsDesc="['the device `codename` eg. `aries` for Mi 2S','type']" >

| stable  | development |
| ------- | ----------- |
| release | dev         |

</RouteEn>

### Firefox

### New Release

<RouteEn author="fengkx" example="/firefox/release/desktop" path="/firefox/release/:platform" :paramsDesc="['the platform']" >

| Desktop | Android | Beta | Nightly | Android Beta | ESR           |
| ------- | ------- | ---- | ------- | ------------ | ------------- |
| desktop | android | beta | nightly | android-beta | organizations |

</RouteEn>

### Thunderbird

### Update

<RouteEn author="garywill" path="/thunderbird/release" example="/thunderbird/release" />

### App Store/Mac App Store

### App Update

<RouteEn author="cielpy" example="/appstore/update/us/id697846300" path="/appstore/update/:country/:id" :paramsDesc="['App Store Country, obtain from the app URL `https://itunes.apple.com/us/app/reeder-3/id697846300?mt=8`, in this case, `us`', 'App Store app id, obtain from the app URL `https://itunes.apple.com/us/app/reeder-3/id697846300?mt=8`, in this case, `id697846300`']" />

### App Update

<RouteEn author="HenryQW" example="/appstore/price/us/mac/id1152443474" path="/appstore/price/:country/:type/:id" :paramsDesc="['App Store Country, obtain from the app URL https://itunes.apple.com/us/app/id1152443474, in this case, `us`', 'App type，either `iOS` or `mac`', 'App Store app id, obtain from the app URL https://itunes.apple.com/us/app/id1152443474, in this case, `id1152443474`']" />

### In-App-Purchase Price Drop Alert

<RouteEn author="HenryQW" example="/appstore/iap/us/id953286746" path="/appstore/iap/:country/:id" :paramsDesc="['App Store Country, obtain from the app URL https://itunes.apple.com/us/app/id953286746, in this case, `us`', 'App Store app id, obtain from the app URL https://itunes.apple.com/us/app/id953286746, in this case, `id953286746`']" />

### F-Droid

### App Update

<RouteEn author="garywill" example="/fdroid/apprelease/com.termux" path="/fdroid/apprelease/:app" :paramsDesc="['App\'s package name']" />

### Greasy Fork

### Script Update

<RouteEn author="imlonghao" path="/greasyfork/:language/:domain?" example="/greasyfork/en/google.com" :paramsDesc="['language, located on the top right corner of Greasy Fork\'s search page, set to `all` for including all languages', 'the script\'s target domain']" />

### Thunderbird

### Changelog

<RouteEn author="garywill" example="/thunderbird/release" path="/thunderbird/release"/>

### Nvidia Web Driver

### Changelog

<RouteEn author="cielpy" example="/nvidia/webdriverupdate" path="/nvidia/webdriverupdate"/>

### Docker Hub

### Image New Build

<RouteEn author="HenryQW" example="/dockerhub/build/wangqiru/ttrss" path="/dockerhub/build/:owner/:image/:tag?" :paramsDesc="['Image owner', 'Image name', 'Image tag，default to latest']"/>

## Social Media

### pixiv

### User Bookmark

<RouteEn author="EYHN" path="/pixiv/user/bookmarks/:id" example="/pixiv/user/bookmarks/15288095" :paramsDesc="['user id, available in user\'s homepage URL']" />

### User Activity

<RouteEn author="EYHN" path="/pixiv/user/:id" example="/pixiv/user/15288095" :paramsDesc="['user id, available in user\'s homepage URL']" />

### Rankings

<RouteEn author="EYHN" path="/pixiv/ranking/:mode/:date?" example="/pixiv/ranking/week" :paramsDesc="['rank type', 'format: `2018-4-25`']" >

| pixiv daily rank | pixiv weekly rank | pixiv monthly rank | pixiv male rank | pixiv female rank | pixiv original rank | pixiv rookie user rank |
| ---------------- | ----------------- | ------------------ | --------------- | ----------------- | ------------------- | ---------------------- |
| day              | week              | month              | day_male        | day_female        | week_original       | week_rookie            |

| pixiv R-18 daily rank | pixiv R-18 male rank | pixiv R-18 female rank | pixiv R-18 weekly rank | pixiv R-18G rank |
| --------------------- | -------------------- | ---------------------- | ---------------------- | ---------------- |
| day_r18               | day_male_r18         | day_female_r18         | week_r18               | week_r18g        |

</RouteEn>

### Disqus

### Comment

<RouteEn path="/disqus/posts/:forum" example="/disqus/posts/diygod-me" :paramsDesc="['forum, disqus name of the target website']" />

### Twitter

### User

<RouteEn path="/twitter/user/:id" example="/twitter/user/DIYgod" :paramsDesc="['twitter handler']" />

### List

<RouteEn author="xyqfer" example="/twitter/list/ladyleet/javascript" path="/twitter/list/:id/:name" :paramsDesc="['user name', 'list name']"/>

### Instagram

### User

<RouteEn path="/instagram/user/:id" example="/instagram/user/diygod" :paramsDesc="['Instagram id']" />

### Hashtag

<RouteEn author="widyakumara" path="/instagram/tag/:tag" example="/instagram/tag/urbantoys" :paramsDesc="['Instagram hashtag']" />

### Youtube

### User

<RouteEn path="/youtube/user/:username/:embed?" example="/youtube/user/JFlaMusic" :paramsDesc="['YouTuber id', 'Default to embed the video, set to any value to disable embedding']" />

### Channel

<RouteEn path="/youtube/channel/:id/:embed?" example="/youtube/channel/UCDwDMPOZfxVV0x_dz0eQ8KQ" :paramsDesc="['YouTube channel id', 'Default to embed the video, set to any value to disable embedding']" />

### Playlist

<RouteEn path="/youtube/playlist/:id/:embed?" example="/youtube/playlist/PLqQ1RwlxOgeLTJ1f3fNMSwhjVgaWKo_9Z" :paramsDesc="['YouTube playlist id', 'Default to embed the video, set to any value to disable embedding']" />

### Telegram

### Channel

<RouteEn path="/telegram/channel/:username" example="/telegram/channel/awesomeDIYgod" :paramsDesc="['channel name']" >

::: tip

Bot initialization required: add Telegram Bot [@RSSHub_bot](https://t.me/RSSHub_bot) as an admin to the channel and send at least one message in the channel for the bot to obtain the _chat_id_.

For private channels, pass the channel `id` (such as `-1001001234567`) intstead of `:username`. The easiest way to get id is [described here](https://stackoverflow.com/a/39943226/3160483).

:::

</RouteEn>

### Sticker Pack

<RouteEn author="DIYgod" example="/telegram/stickerpack/DIYgod" path="/telegram/stickerpack/:name" :paramsDesc="['Sticker Pack name, available in the sharing URL']"/>

## ACG

### Vol.moe

### vol

<RouteEn author="CoderTonyChan" example="/vol/finsh" path="/vol/:mode?" :paramsDesc="['mode type']">

| Comics are serialized | Comics is finshed |
| --------------------- | ----------------- |
| serial                | finish            |

</RouteEn>

## Travel

### All the Flight Deals

### Flight Deals

<RouteEn author="HenryQW" path="/atfd/:locations/:nearby?" example="/atfd/us+new%20york,gb+london/1" :paramsDesc="['the departing city, consists of an 「ISO 3166-1 country code」 and a 「city name」.  Origin\'s ISO 3166-1 country code + city name, eg. `us+new york`, [https://rsshub.app/atfd/us+new york](https://rsshub.app/atfd/us+new%20york). Multiple origins are supported via a comma separated string, eg. `us+new york,gb+london`, [https://rsshub.app/atfd/us+new york,gb+london/](https://rsshub.app/atfd/us+new%20york,gb+london/).', 'whether includes nearby airports, optional value of 0 or 1, default to 0 (exclude nearby airports)']" >

For ISO 3166-1 country codes please refer to [Wikipedia ISO_3166-1](https://en.wikipedia.org/wiki/ISO_3166-1)

::: tip

If the city name contains a space like `Mexico City`, replace the space with `%20`, `Mexico%20City`.

:::

</RouteEn>

### Hopper

### Flight Deals

<RouteEn author="HenryQW" path="/hopper/:lowestOnly/:from/:to?" example="/hopper/1/LHR/PEK" :paramsDesc="['set to `1` will return the cheapest deal only, instead of all deals, so you don\'t get spammed', 'origin airport IATA code', 'destination airport IATA code, if unset the destination will be set to `anywhere`']" >

This route returns a list of flight deals (in most cases, 6 flight deals) for a period defined by Hopper's algorithm, which means the travel date will be totally random (could be tomorrow or 10 months from now).

For airport IATA code please refer to [Wikipedia List of airports by IATA code](https://en.wikipedia.org/wiki/List_of_airports_by_IATA_code:_A)

</RouteEn>

## News

### BBC

### BBC

<RouteEn author="HenryQW" example="/bbc/chinese" path="/bbc/:channel?" :paramsDesc="['channel, default to `top stories`']">

Provides a better reading experience (full text articles) over the official ones.

Support major channels, refer to [BBC RSS feeds](https://www.bbc.co.uk/news/10628494). Eg, `business` for `https://feeds.bbci.co.uk/news/business/rss.xml`.

-   Channel with a single path, such as `https://feeds.bbci.co.uk/news/business/rss.xml`, use `/bbc/business`.
-   Channel contains multiple paths, such as `https://feeds.bbci.co.uk/news/world/asia/rss.xml`, replace `/` with `-`, `/bbc/world-asia`.
-   Exemption: use `/bbc/chinese` for BBC News Chinese.

</RouteEn>

## Programming

### GitHub

::: tip

GitHub provides some official RSS feeds:

-   Repo releases: https://github.com/:owner/:repo/releases.atom
-   Repo commits: https://github.com/:owner/:repo/commits.atom
-   User activities: https://github.com/:user.atom
-   Private feed: https://github.com/:user.private.atom?token=:secret (You can find **Subscribe to your news feed** in [dashboard](https://github.com) page after login)

:::

### User Repo

<RouteEn author="dragon-yuan" path="/github/repos/:user" example="/github/repos/DIYgod" :paramsDesc="['GitHub username']" />

### Trending

<RouteEn path="/github/trending/:since/:language?" example="/github/trending/daily/javascript" :paramsDesc="['time frame, available in [Trending page](https://github.com/trending/javascript?since=monthly) \'s URL, possible values are: daily, weekly or monthly', 'the feed language, available in [Trending page](https://github.com/trending/javascript?since=monthly) \'s URL']" />

### Issue

<RouteEn author="HenryQW" path="/github/issue/:user/:repo" example="/github/issue/DIYgod/RSSHub" :paramsDesc="['GitHub username', 'GitHub repo name']" />

### Follower

<RouteEn author="HenryQW" path="/github/user/follower/:user" example="/github/user/followers/HenryQW" :paramsDesc="['GitHub username']" />

### Star

<RouteEn author="HenryQW" path="/github/stars/:user/:repo" example="/github/stars/DIYGod/RSSHub" :paramsDesc="['GitHub username', 'GitHub repo name']" />

### GitLab

### Explore

<RouteEn author="imlonghao" example="/gitlab/explore/trending" path="/gitlab/explore/:type" :paramsDesc="['type']">

| Trending | Most stars | All |
| -------- | ---------- | --- |
| trending | starred    | all |

</RouteEn>

## Parcel Tracking

### Hermes

### Hermes UK

<RouteEn author="HenryQW" example="/parcel/hermesuk/[tracking number]" path="/parcel/hermesuk/:tracking" :paramsDesc="['Tracking number']"/>

## Uncategorized

### EZTV

::: tip

EZTV provides an official RSS feed of all torrents: https://eztv.ag/ezrss.xml

:::

### Torrent Lookup by IMDB ID

<RouteEn author="Songkeys" path="/eztv/torrents/:imdb_id" example="/eztv/torrents/6048596" :paramsDesc="['search for the IMDB ID of the desired show, available at [IMDB](https://www.imdb.com)']" />

### Hexo Blog

### Blog using Next theme

<RouteEn author="fengkx" path="/hexo/next/:url" example="/hexo/next/fengkx.top" :paramsDesc="['the blog URL without the protocol (http:// and https://)']" />

### Blog using Yilia theme

<RouteEn author="aha2mao" path="/hexo/yilia/:url" example="/hexo/yilia/cloudstone.xin" :paramsDesc="['the blog URL without the protocol (http:// and https://)']" />

### Google

### Google Scholar Keywords Monitoring

<RouteEn author="HenryQW" path="/google/scholar/:query" example="/google/scholar/data+visualization" :paramsDesc="['query statement which supports「Basic」and「Advanced」modes']" >

::: warning

Google Scholar has strict anti-crawling mechanism implemented, the demo below doesn't guarantee availability. Please deploy your own instance as it might increase the stability.

:::

1. Basic mode, sample query is the keywords desired, eg.「data visualization」, [https://rsshub.app/google/scholar/data+visualization](https://rsshub.app/google/scholar/data+visualization).

2. Advanced mode, visit [Google Scholar](https://scholar.google.com/schhp?hl=en&as_sdt=0,5), click the top left corner and select「Advanced Search」, fill in your conditions and submit the search. The URL should look like this: [https://scholar.google.com/scholar?as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5](https://scholar.google.com/scholar?as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5), copy everything after `https://scholar.google.com/scholar?` from the URL and use it as the query for this route. The complete URL for the above example should look like this: [https://rsshub.app/google/scholar/as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5](https://rsshub.app/google/scholar/as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5).

</RouteEn>

### Dribbble

### Popular

<RouteEn path="/dribbble/popular/:timeframe?" example="/dribbble/popular" :paramsDesc="['support the following values: week, month, year and ever']" />

### User (or team)

<RouteEn path="/dribbble/user/:name" example="/dribbble/user/google" :paramsDesc="['username, available in user\'s homepage URL']" />

### Keyword

<RouteEn path="/dribbble/keyword/:keyword" example="/dribbble/keyword/player" :paramsDesc="['desired keyword']" />

### Apple

### Exchange and Repair Extension Programs

<RouteEn author="metowolf HenryQW" example="/apple/exchange_repair" path="/apple/exchange_repair/:country?" :paramsDesc="['country code in apple.com URL (exception: for `United States` please use `us`), default to China `cn`']" />

### The Verge

### The Verge

<RouteEn author="HenryQW" example="/verge" path="/verge">

Provides a better reading experience (full text articles) over the official one.

</RouteEn>

### 99% Invisible

### Transcript

<RouteEn author="Ji4n1ng" example="/99percentinvisible/transcript" path="/99percentinvisible/transcript"/>

### AutoTrader

### Search

<RouteEn author="HenryQW" example="/autotrader/radius=50&postcode=sw1a1aa&onesearchad=Used&onesearchad=Nearly%20New&onesearchad=New&price-to=9000&year-from=2012&body-type=Hatchback&transmission=Automatic&exclude-writeoff-categories=on" path="/autotrader/:query" :paramsDesc="['the search query']">

1. Conduct a search with desired filters on AutoTrader
1. Copy everything in the URL after `?`, for example: `https://www.autotrader.co.uk/car-search?radius=50&postcode=sw1a1aa&onesearchad=Used&onesearchad=Nearly%20New&onesearchad=New&price-to=9000&year-from=2012&body-type=Hatchback&transmission=Automatic&exclude-writeoff-categories=on` will produce `radius=50&postcode=sw1a1aa&onesearchad=Used&onesearchad=Nearly%20New&onesearchad=New&price-to=9000&year-from=2012&body-type=Hatchback&transmission=Automatic&exclude-writeoff-categories=on`

</RouteEn>

### United Nations

### Security Council Vetoed a Resolution

<RouteEn author="HenryQW" example="/un/scveto" path="/un/scveto"/>

### The Guardian

### Editorial

<RouteEn author="HenryQW" example="/guardian/editorial" path="/guardian/editorial">

Provides a better reading experience (full text articles) over the official one.

</RouteEn>

### iDownloadBlog

### iDownloadBlog

<RouteEn author="HenryQW" example="/iDownloadBlog" path="/iDownloadBlog/index">

Provides a better reading experience (full text articles) over the official one.

</RouteEn>

### 9To5

### 9To5 Sub-site

<RouteEn author="HenryQW" example="/9to5/mac" path="/9to5/:type" :paramsDesc="['The sub-site name']">

Supported sub-sites：
| Mac | Google | Toys |
| --- | ------ | ---- |
| Mac | Google | Toys |

</RouteEn>

### All Poetry

### Poems

<RouteEn author="HenryQW" example="/allpoetry/newest" path="/allpoetry/:order?" :paramsDesc="['order by type, `best` or `newest`, default to `best`']"/>
