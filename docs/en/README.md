---
sidebar: auto
---

<p align="center">
<img src="https://i.imgur.com/NZpRScX.png" alt="RSSHub" width="100">
</p>
<h1 align="center" class="logo">RSSHub</h1>

> 🍰 Everything is RSSible

RSSHub is a lightweight and extensible RSS feed aggregator, it's able to generate feeds from pretty much everything.

## Special Thanks

### Special Sponsors

<p>
<a href="https://rixcloud.app/rsshub" target="_blank">
    <img width="200px" src="https://i.imgur.com/PpcSVCZ.png">
</a>
</p>
<p>
<a href="https://werss.app?utm_source=rsshub" target="_blank">
    <img width="150px" src="https://cdn.weapp.design/werss/werss-logo.png">
</a>
</p>

### Sponsors

-   [Liuyang](https://github.com/lingllting)

-   Zuyang

-   [Sayori Studio](https://t.me/SayoriStudio)

[![](https://opencollective.com/static/images/become_sponsor.svg)](https://docs.rsshub.app/support/)

### Contributors

[![](https://opencollective.com/RSSHub/contributors.svg?width=890)](https://github.com/DIYgod/RSSHub/graphs/contributors)

::: tip

Free feel to test the [demo instance](https://rsshub.app), the cache expiry time is set to 10 minutes.

:::

## Parameters

::: tip

All parameters can be used together to generate a complex feed

:::

### Filtering

The following URL query parameters are supported, Regex support is built-in

Set `filter` to include the content

-   filter: filter title and description

-   filter_title: filter title only

-   filter_description: filter description only

For example: [https://rsshub.app/dribbble/popular?filter=Blue|Yellow|Black](https://rsshub.app/dribbble/popular?filter=Blue|Yellow|Black)

Set `filterout` to exclude unwanted content

-   filterout: filter title and description

-   filterout_title: filter title only

-   filterout_description: filter description only

For example: [https://rsshub.app/dribbble/popular?filterout=Blue|Yellow|Black](https://rsshub.app/dribbble/popular?filterout=Blue|Yellow|Black)

### Limit Entries

Set `limit` to limit the number of articles in the feed,

Eg: Dribbble Popular Top 10 [https://rsshub.app/dribbble/popular?limit=10](https://rsshub.app/dribbble/popular?limit=10)

### Output Formats

RSSHub supports RSS 2.0、Atom and [JSON Feed](https://jsonfeed.org/) as the output formats, simply append `.rss` `.atom` or `.json` to the end of the feed address, default to RSS 2.0

For exmaple:

-   Default (RSS 2.0) - [https://rsshub.app/dribbble/popular](https://rsshub.app/dribbble/popular)
-   RSS 2.0 - [https://rsshub.app/dribbble/popular.rss](https://rsshub.app/dribbble/popular.rss)
-   Atom - [https://rsshub.app/dribbble/popular.atom](https://rsshub.app/dribbble/popular.atom)
-   JSON Feed - [https://rsshub.app/dribbble/popular.json](https://rsshub.app/dribbble/popular.json)
-   Apply filters or URL query [https://rsshub.app/dribbble/popular.atom?filterout=Blue|Yellow|Black](https://rsshub.app/dribbble/popular.atom?filterout=Blue|Yellow|Black)

## Application Updates

### RSSHub

Eg: [https://rsshub.app/rsshub/rss](https://rsshub.app/rsshub/rss)

Route: `/rsshub/rss`

Parameters: N/A

### MIUI <Author uid="Indexyz"/>

Eg: [https://rsshub.app/miui/aries/](https://rsshub.app/miui/aries/)

Route: `/miui/:device/:type?`

Parameters:

device: the device `codename` eg. `aries` for Mi 2S

type: type, optional

| stable  | development |
| ------- | ----------- |
| release | dev         |

### Firefox New Release <Author uid="fengkx"/>

Eg: [https://rsshub.app/firefox/release/desktop](https://rsshub.app/firefox/release/desktop)

Route: `/firefox/release/:platform`

Parameters:

-   platform

| Desktop | Android | Beta | Nightly | Android Beta |
| ------- | ------- | ---- | ------- | ------------ |
| desktop | android | beta | nightly | android-beta |

### App Store/Mac App Store Updates <Author uid="cielpy"/>

Eg: [https://rsshub.app/appstore/update/us/id697846300](https://rsshub.app/appstore/update/us/id697846300)

Route: `/appstore/update/:country/:id`

Parameters：

country, App Store Country, obtain from the app URL `https://itunes.apple.com/us/app/reeder-3/id697846300?mt=8`, in this case, `us`.

id, App Store app id, obtain from the app URL `https://itunes.apple.com/us/app/reeder-3/id697846300?mt=8`, in this case, `id697846300`.

### App Store/Mac App Store Price Drop Alert <Author uid="HenryQW"/>

eg: [https://rsshub.app/appstore/price/us/mac/id1152443474](https://rsshub.app/appstore/price/cn/mac/id1152443474)

Route: `/appstore/price/:country/:type/:id`

Parameters：

-   country, App Store Country, obtain from the app URL https://itunes.apple.com/us/app/id1152443474, in this case, `us`.

-   type, App type，either `iOS` or `mac`

-   id, App Store app id, obtain from the app URL https://itunes.apple.com/us/app/id1152443474, in this case, `id1152443474`.

### App Store/Mac App Store In-App-Purchase Price Drop Alert <Author uid="HenryQW"/>

Eg: [https://rsshub.app/appstore/iap/cn/id1152443474](https://rsshub.app/appstore/price/cn/id1152443474)

Route: `/appstore/iap/:country/:id`

Parameters:

-   country, App Store Country, obtain from the app URL https://itunes.apple.com/us/app/id953286746, in this case, `us`.

-   id, App Store app id, obtain from the app URL https://itunes.apple.com/us/app/id953286746, in this case, `id953286746`.

## pixiv

### User Bookmark <Author uid="EYHN"/>

Eg: [https://rsshub.app/pixiv/user/bookmarks/15288095](https://rsshub.app/pixiv/user/bookmarks/15288095)

Route: `/pixiv/user/bookmarks/:id`

Parameters:

-   id, user id, available in user's homepage URL

### User Activity <Author uid="EYHN"/>

Eg: [https://rsshub.app/pixiv/user/11](https://rsshub.app/pixiv/user/11)

Route: `/pixiv/user/:id`

Parameters:

-   id, user id, available in user's homepage URL

### Rankings <Author uid="EYHN"/>

Eg: [https://rsshub.app/pixiv/ranking/week](https://rsshub.app/pixiv/ranking/week)

Route: `/pixiv/ranking/:mode/:date?`

Parameters

-   mode: rank type

    | pixiv daily rank | pixiv weekly rank | pixiv monthly rank | pixiv male rank | pixiv female rank | pixiv original rank | pixiv rookie user rank |
    | ---------------- | ----------------- | ------------------ | --------------- | ----------------- | ------------------- | ---------------------- |
    | day              | week              | month              | day_male        | day_female        | week_original       | week_rookie            |

    | pixiv R-18 daily rank | pixiv R-18 male rank | pixiv R-18 female rank | pixiv R-18 weekly rank | pixiv R-18G rank |
    | --------------------- | -------------------- | ---------------------- | ---------------------- | ---------------- |
    | day_r18               | day_male_r18         | day_female_r18         | week_r18               | week_r18g        |

-   date: date, format: `2018-4-25`

## Disqus

### Comment

Eg: [https://rsshub.app/disqus/posts/diygod-me](https://rsshub.app/disqus/posts/diygod-me)

Route: `/disqus/posts/:forum`

Parameters:

-   forum, disqus name of the target website

## Twitter

### User

Eg: [https://rsshub.app/twitter/user/DIYgod](https://rsshub.app/twitter/user/DIYgod)

Route: `/twitter/user/:id`

Parameters:

-   id, twitter handler

## Instagram

### User

Eg: [https://rsshub.app/instagram/user/diygod](https://rsshub.app/instagram/user/diygod)

Route: `/instagram/user/:id`

Parameters:

-   id, Instagram id

## Youtube

### User

Eg: [https://rsshub.app/youtube/user/JFlaMusic](https://rsshub.app/youtube/user/JFlaMusic)

Route: `/youtube/user/:username`

Parameters:

-   username, Youtuber's username

### Channel

Eg: [https://rsshub.app/youtube/channel/UCDwDMPOZfxVV0x_dz0eQ8KQ](https://rsshub.app/youtube/channel/UCDwDMPOZfxVV0x_dz0eQ8KQ)

Route: `/youtube/channel/:id`

Parameters:

-   id, channel id

## Dribbble

### Popular

Eg:

[https://rsshub.app/dribbble/popular](https://rsshub.app/dribbble/popular)

[https://rsshub.app/dribbble/popular/week](https://rsshub.app/dribbble/popular/week)

Route: `/dribbble/popular/:timeframe?`

Parameters:

-   timeframe, optional, support the following values: week, month, year and ever

### User (or team)

Eg: [https://rsshub.app/dribbble/user/google](https://rsshub.app/dribbble/user/google)

Route: `/dribbble/user/:name`

Parameters:

-   name, username, available in user's homepage URL

### Keyword

Eg: [https://rsshub.app/dribbble/keyword/player](https://rsshub.app/dribbble/keyword/player)

Route: `/dribbble/keyword/:keyword`

Parameters:

-   keyword, the desired keyword

## Telegram

### Channel

::: tip

Bot initialization required: Add Telegram Bot [@RSSHub_bot](https://t.me/RSSHub_bot) as an admin to the channel and send at least one message in the channel for the bot to obtain the chat_id.

:::

Eg: [https://rsshub.app/telegram/channel/awesomeDIYgod](https://rsshub.app/telegram/channel/awesomeDIYgod)

Route: `/telegram/channel/:username`

Parameters:

-   username, channel name

## GitHub

::: tip

GitHub provides some official RSS feeds:

-   Repo releases: https://github.com/:owner/:repo/releases.atom
-   Repo commits: https://github.com/:owner/:repo/commits.atom
-   User activities: https://github.com/:user.atom

:::

### User Repo <Author uid="dragon-yuan"/>

Eg: [https://rsshub.app/github/repos/DIYgod](https://rsshub.app/github/repos/DIYgod)

Route: `/github/repos/:user`

Parameters:

-   user, username

### Trending

Eg:

[https://rsshub.app/github/trending/daily](https://rsshub.app/github/trending/daily)

[https://rsshub.app/github/trending/daily/javascript](https://rsshub.app/github/trending/daily/javascript)

Route: `/github/trending/:since/:language?`

Parameters:

-   since, time frame, available in [Trending page](https://github.com/trending/javascript?since=monthly) 's URL, possible values are: daily, weekly or monthly

-   language, the feed language, available in [Trending page](https://github.com/trending/javascript?since=monthly) 's URL

### Issue <Author uid="HenryQW"/>

Eg: [https://rsshub.app/github/issue/DIYgod/RSSHub](https://rsshub.app/github/issue/DIYgod/RSSHub)

Route: `/github/issue/:user/:repo`

Parameters:

-   user, username

-   repo, repo name

### Follower <Author uid="HenryQW"/>

Eg: [https://rsshub.app/github/user/followers/HenryQW](https://rsshub.app/github/user/followers/HenryQW)

Route: `/github/user/follower/:user`

Parameters:

-   user, username

### Star <Author uid="HenryQW"/>

Eg: [https://rsshub.app/github/stars/DIYGod/RSSHub](https://rsshub.app/github/stars/DIYGod/RSSHub)

Route: `/github/stars/:user/:repo`

Parameters:

-   user, username

-   repo, repo name

## EZTV

::: tip

EZTV provides an official RSS feed of all torrents: https://eztv.ag/ezrss.xml

:::

### Torrent Lookup by IMDB ID <Author uid="Songkeys"/>

Eg: [https://rsshub.app/eztv/torrents/6048596](https://rsshub.app/eztv/torrent/6048596)

Route: `/eztv/torrents/:imdb_id`

Parameters:

-   imdb_id, search for the IMDB ID of the desired show, available at [IMDB](https://www.imdb.com)

## Hexo Blog

### Blog using Next theme <Author uid="fengkx"/>

Eg: [http://rsshub.app/hexo/next/fengkx.top](http://rsshub.app/hexo/next/fengkx.top)

Route: `/hexo/next/:url`

Parameters:

-   url, the blog URL without the protocol (http:// and https://)

## Greasy Fork

### Script Update <Author uid="imlonghao"/>

Eg: [https://rsshub.app/greasyfork/en/google.com](https://rsshub.app/greasyfork/en/google.com)

Route: `/greasyfork/:language/:domain?`

Parameters:

-   language, language, located on the top right corner of Greasy Fork's search page, set to `all` for including all languages

-   domain, the script's target domain, optional

## All the Flight Deals

### Flight Deals <Author uid="HenryQW"/>

Eg: [https://rsshub.app/atfd/us+new york,gb+london/1](https://rsshub.app/atfd/us+new%20york,gb+london/1)

Route: `/atfd/:locations/:nearby?`

Parameters:

-   locations: the departing city, consists of an 「ISO 3166-1 country code」 and a 「city name」. They are not case sensitive. :

    1. Origin's ISO 3166-1 country code + city name, eg. `us+new york`, [https://rsshub.app/atfd/us+new york](https://rsshub.app/atfd/us+new%20york)
    2. Multiple origins are supported via a comma separated string, eg. `us+new york,gb+london`, [https://rsshub.app/atfd/us+new york,gb+london/](https://rsshub.app/atfd/us+new%20york,gb+london/)

For ISO 3166-1 country codes please refer to [Wikipedia ISO_3166-1](https://en.wikipedia.org/wiki/ISO_3166-1)

-   nearby: whether includes nearby airports, optional value of 0 or 1, default to 0 (exclude nearby airports)

::: tip

If the city name contains a space like `Mexico City`, replace the space with `%20`, `Mexico%20City`.

:::

## Google

### Google Scholar Keywords Monitoring <Author uid="HenryQW"/>

::: warning

Google Scholar has strict anti-crawling mechanism implemented, the demo below doesn't guarantee availability. Please deploy your own instance as it might increase the stability.

:::

Eg: [https://rsshub.app/google/scholar/data+visualization](https://rsshub.app/google/scholar/data+visualization)

Route: `/google/scholar/:query`

Parameters:

-   query, query statement which supports「Basic」and「Advanced」modes:

    1. Basic mode, sample query is the keywords desired, eg.「data visualization」, [https://rsshub.app/google/scholar/data+visualization](https://rsshub.app/google/scholar/data+visualization).

    2. Advanced mode, visit [Google Scholar](https://scholar.google.com/schhp?hl=en&as_sdt=0,5), click the top left corner and select「Advanced Search」, fill in your conditions and submit the search. The URL should look like this: [https://scholar.google.com/scholar?as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5](https://scholar.google.com/scholar?as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5), copy everything after `https://scholar.google.com/scholar?` from the URL and use it as the query for this route. The complete URL for the above example should look like this: [https://rsshub.app/google/scholar/as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5](https://rsshub.app/google/scholar/as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=en&as_sdt=0%2C5).

## Hopper

### Hopper Flight Deals <Author uid="HenryQW"/>

This route returns a list of flight deals (in most cases, 6 flight deals) for a period defined by Hopper's algorithm, which means the travel date will be totally random (could be tomorrow or 10 months from now).

Eg: London Heathrow Airport &#9992; Beijing Capital International Airport [https://rsshub.app/hopper/1/LHR/PEK](https://rsshub.app/hopper/1/LHR/PEK)

Route: `/hopper/:lowestOnly/:from/:to?`

Parameters:

-   lowestOnly, set to `1` will return the cheapest deal only, instead of all deals, so you don't get spammed

-   from, origin airport IATA code

-   to, destination airport IATA code, optional, if unset the destination will be set to `anywhere`

For airport IATA code please refer to [Wikipedia List of airports by IATA code](https://en.wikipedia.org/wiki/List_of_airports_by_IATA_code:_A)
