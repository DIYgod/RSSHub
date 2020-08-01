---
pageClass: routes
---

# Shopping

## Alter China

### News

<RouteEn author="luyuhuang" example="/alter-cn/news" path="/alter-cn/news"/>

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
