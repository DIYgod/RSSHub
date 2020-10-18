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

## Hentaimama

### Recent Videos

<RouteEn author="everyonus" example="/hentaimama/videos" path="/hentaimama/videos" />

## JavLibrary

### Videos

<RouteEn author="Diygod junfengP" example="/javlibrary/videos/bestrated" path="/javlibrary/videos/:vtype" :paramsDesc="['video type']" radar="1" rssbud="1">
|New Comments|New Release|New Entries|Most Wanted|Best Rated|
|-----|------|------|-----|------|
|update|newrelease|newentries|mostwanted|bestrated|
</RouteEn>

### Stars

<RouteEn author="Diygod junfengP" example="/javlibrary/stars/afisw" path="/javlibrary/stars/:sid" :paramsDesc="['star id, find it from link']" radar="1" rssbud="1"/>

### Users

<RouteEn author="Diygod junfengP" example="/javlibrary/users/mangudai/userposts" path="/javlibrary/users/:uid/:utype" :paramsDesc="['user id','user choice, see table below']" radar="1" rssbud="1">
|User wanted|User watched|User owned|User posts|
|-----|------|------|-----|
|userwanted|userwatched|userowned|userposts|
</RouteEn>

### Bestreviews

<RouteEn author="DCJaous" example="/javlibrary/bestreviews" path="/javlibrary/bestreviews" radar="1" rssbud="1"/>

## Nyaa

### Seatch Result

<RouteEn author="Lava-Swimmer" example="/nyaa/search/psycho-pass" path="/nyaa/search/:keyword" :paramsDesc="['Search keyword']" supportBT="1"/>

## PornHub

### Category

<RouteEn author="nczitzk" example="/pornhub/category/popular-with-women" path="/pornhub/category/:caty" :paramsDesc="['category，see [categories](https://cn.pornhub.com/webmasters/categories)']"/>

### Keyword Search

<RouteEn author="nczitzk" example="/pornhub/search/stepsister" path="/pornhub/search/:keyword" :paramsDesc="['keyword']"/>

### Users

<RouteEn author="I2IMk" example="/pornhub/users/0maru0" path="/pornhub/users/:username" :paramsDesc="['username, part of the url e.g. `pornhub.com/users/0maru0`']" />

### Verified amateur / Model

<RouteEn author="I2IMk" example="/pornhub/model/stacy-starando" path="/pornhub/model/:username/:sort?" :paramsDesc="['username, part of the url e.g. `pornhub.com/model/stacy-starando`', 'sorting method, see below']" />

### Verified model / Pornstar

<RouteEn author="I2IMk" example="/pornhub/pornstar/june-liu" path="/pornhub/pornstar/:username/:sort?" :paramsDesc="['username, part of the url e.g. `pornhub.com/pornstar/june-liu`', 'sorting method, see below']" />

**`sort`**

| mr          | mv          | tr        | lg      | cm     |
| ----------- | ----------- | --------- | ------- | ------ |
| Most Recent | Most Viewed | Top Rated | Longest | Newest |



### Video List

<RouteEn author="I2IMk" example="/pornhub/category_url/video%3Fc%3D15%26o%3Dmv%26t%3Dw%26cc%3Djp" path="/pornhub/category_url/:url?" :paramsDesc="['relative path after `pornhub.com/`, need to be URL encoded']"/>


## Sankaku Complex

### Post

<RouteEn author="xyqfer" example="/sankakucomplex/post" path="/sankakucomplex/post"/>

## SoundCloud

### Tracks

<RouteEn author="fallenhh" example="/soundcloud/tracks/angeart" path="/soundcloud/tracks/:user" :paramsDesc="['User name']" />

## Youtube

Refer to [#youtube](/en/social-media.html#youtube)
