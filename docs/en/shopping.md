---
pageClass: routes
---

# Shopping

## Alter China

### News

<RouteEn author="luyuhuang" example="/alter-cn/news" path="/alter-cn/news"/>

## AppSales

### Apps

<RouteEn author="nczitzk" example="/appsales/highlights" path="/appsales/:caty?/:time?" :paramsDesc="['Category, `highlights` by default', 'Time, `24h` by default']">

Category

| Highlights | Active Sales | Now Free | Watchlist Charts |
| ---------- | ------------ | -------- | ---------------- |
| highlights | activesales  | nowfree  | mostwanted       |

Time

| the latest 24 hours | the latest week | all the time |
| ------------------- | --------------- | ------------ |
| 24h                 | week            | alltime      |

::: tip Tip

Parameter `time` only works when `mostwanted` is chosen as the category.

:::

</RouteEn>

## booth.pm

### Shop

<RouteEn author="KTachibanaM" example="/booth.pm/shop/annn-boc0123" path="/booth.pm/shop/:subdomain" :paramsDesc="['Shop subdomain']" />

## Craigslist

### Shop

<RouteEn author="lxiange" example="/craigslist/sfbay/sso?query=folding+bike&sort=rel" path="/craigslist/:location/:type?" :paramsDesc="['location, Craigslist subdomain, e.g., `sfbay`', 'search type, e.g., `sso`']"/>

> We use RSSHub to implement the searching of Craigslist
> An example of a full original search url:
> <https://sfbay.craigslist.org/search/sso?query=folding+bike&sort=rel>
>
> the `xxx` in `/search/xxx` is the search type, just refer to the original search url.
> The query string is the actual name of query, in this case is folding bike


## Guiltfree.pl

### Onsale

<RouteEn author="nczitzk" example="/guiltfree/onsale" path="/guiltfree/onsale"/>

## hotukdeals

### thread

<RouteEn author="DIYgod" example="/hotukdeals/hot" path="/hotukdeals/:type" :paramsDesc="['should be one of highlights, hot, new, discussed']"/>

## IKEA

### UK - New Product Release

<RouteEn author="HenryQW" example="/ikea/uk/new" path="/ikea/uk/new"/>

### UK - Offers

<RouteEn author="HenryQW" example="/ikea/uk/offer" path="/ikea/uk/offer"/>

## LeBonCoin

### Ads

Transform any search into a feed.

<RouteEn author="Platane" example="/leboncoin/ad/category=10&locations=Paris_75015" path="/leboncoin/ad/:query" :paramsDesc="['search page querystring']">

For instance, in https://www.leboncoin.fr/recherche/?**category=10&locations=Paris_75015**, the query is **category=10&locations=Paris_75015**

</RouteEn>

## Mercari

### Goods

<RouteEn author="nczitzk" example="/mercari/category/1" path="/mercari/:type/:id" :paramsDesc="['`category` as seaching by category, `brand` as searching by brand, `search` as searching for keyword', 'can be found in URL of the category or brand page. If you choose `search` as `type`, then put keyword here']">

All categories, see [Category list](https://www.mercari.com/jp/category/)

All brands, see [Brand list](https://www.mercari.com/jp/brand/)

</RouteEn>

## ShopBack

### Store

<RouteEn author="nczitzk" example="/shopback/shopee-mart" path="/shopback/:store" :paramsDesc="['Store, can be found in URL']"/>

## The Independent

### PS5 stock UK

<RouteEn author="DIYgod" example="/independent/ps5-stock-uk" path="/independent/ps5-stock-uk"/>
