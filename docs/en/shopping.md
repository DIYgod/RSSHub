---
pageClass: routes
---

# Shopping

## Alter China

### News

<Route author="luyuhuang" example="/alter-cn/news" path="/alter-cn/news"/>

## LeBonCoin

### Ads

Transform any search into a feed.

<RouteEn author="Platane" example="/leboncoin/ad/category=10&locations=Paris_75015" path="/leboncoin/ad/:query" :paramsDesc="['search page querystring']">

For instance, in https://www.leboncoin.fr/recherche/?**category=10&locations=Paris_75015**, the query is **category=10&locations=Paris_75015**

</RouteEn>
