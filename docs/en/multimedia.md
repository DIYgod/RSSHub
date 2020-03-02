---
pageClass: routes
---

# Multimedia

## 60-Second Science - Scientific American

### Transcript

<RouteEn author="emdoe" example="/60s-science/transcript" path="/60s-science/transcript"/>

## 99% Invisible

### Transcript

<RouteEn author="Ji4n1ng" example="/99percentinvisible/transcript" path="/99percentinvisible/transcript"/>

## EZTV

::: tip

Official RSS: https://eztv.io/ezrss.xml

:::

### Lookup Torrents by IMDB ID

<RouteEn author="Songkeys" example="/eztv/torrents/6048596" path="/eztv/torrents/:imdb_id" :paramsDesc="['The IMDB ID corresponding to the seed of show you want to search can be found on the official website [IMDB](https://www.imdb.com)']" supportBT="1"/>

## JavLibrary

### Videos

<Route author="Diygod junfengP" example="/javlibrary/videos/bestrated" path="/javlibrary/videos/:vtype" :paramsDesc="['video type']" radar="1" >
|New Comments|New Release|New Entries|Most Wanted|Best Rated|
|-----|------|------|-----|------|
|update|newrelease|newentries|mostwanted|bestrated|
</Route>

### Stars

<Route author="Diygod junfengP" example="/javlibrary/stars/afisw" path="/javlibrary/stars/:sid" :paramsDesc="['star id, find it from link']" radar="1" />

### Users

<Route author="Diygod junfengP" example="/javlibrary/users/mangudai/userposts" path="/javlibrary/users/:uid/:utype" :paramsDesc="['user id','user choice, see table below']" radar="1" >
|User wanted|User watched|User owned|User posts|
|-----|------|------|-----|
|userwanted|userwatched|userowned|userposts|
</Route>

### Bestreviews

<Route author="DCJaous" example="/javlibrary/bestreviews" path="/javlibrary/bestreviews" radar="1" />

## Nyaa

### Seatch Result

<RouteEn author="Lava-Swimmer" example="/nyaa/search/psycho-pass" path="/nyaa/search/:keyword" :paramsDesc="['Search keyword']" supportBT="1"/>

## Sankaku Complex

### Post

<RouteEn author="xyqfer" example="/sankakucomplex/post" path="/sankakucomplex/post"/>

## SoundCloud

### Tracks

<RouteEn author="fallenhh" example="/soundcloud/tracks/angeart" path="/soundcloud/tracks/:user" :paramsDesc="['User name']" />

## Youtube

Refer to [#youtube](/en/social-media.html#youtube)
