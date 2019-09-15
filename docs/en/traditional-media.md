---
pageClass: routes
---

# News

## BBC

### BBC

<RouteEn author="HenryQW" example="/bbc/chinese" path="/bbc/:channel?" :paramsDesc="['channel, default to `top stories`']">

Provides a better reading experience (full text articles) over the official ones.

Support major channels, refer to [BBC RSS feeds](https://www.bbc.co.uk/news/10628494). Eg, `business` for `https://feeds.bbci.co.uk/news/business/rss.xml`.

-   Channel with a single path, such as `https://feeds.bbci.co.uk/news/business/rss.xml`, use `/bbc/business`.
-   Channel contains multiple paths, such as `https://feeds.bbci.co.uk/news/world/asia/rss.xml`, replace `/` with `-`, `/bbc/world-asia`.
-   Exemption: use `/bbc/chinese` for BBC News Chinese.

</RouteEn>

## The Guardian

### Editorial

<RouteEn author="HenryQW" example="/guardian/editorial" path="/guardian/editorial">

Provides a better reading experience (full text articles) over the official one.

</RouteEn>
