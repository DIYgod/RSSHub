---
pageClass: routes
---

# Social Media

## Disqus

### Comment

<RouteEn path="/disqus/posts/:forum" example="/disqus/posts/diygod-me" :paramsDesc="['forum, disqus name of the target website']" />

## Instagram

### User

<RouteEn path="/instagram/user/:id" example="/instagram/user/diygod" :paramsDesc="['Instagram id']" anticrawler="1"/>

### Hashtag

<RouteEn author="widyakumara" path="/instagram/tag/:tag" example="/instagram/tag/urbantoys" :paramsDesc="['Instagram hashtag']"  anticrawler="1"/>

## pixiv

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

### Keyword

<Route author="DIYgod" example="/pixiv/search/麻衣/popular/2" path="/pixiv/search/:keyword/:order?/:r18?" :paramsDesc="['keyword', 'rank mode, empty or other for time order, popular for popular order', 'filte R18 content, 0 to no filter, 1 to only not R18, 2 to only R18, default to 0']" radar="1"/>

## Telegram

### Channel

<RouteEn path="/telegram/channel/:username" example="/telegram/channel/awesomeDIYgod" :paramsDesc="['channel name']" />

### Sticker Pack

<RouteEn author="DIYgod" example="/telegram/stickerpack/DIYgod" path="/telegram/stickerpack/:name" :paramsDesc="['Sticker Pack name, available in the sharing URL']"/>

### Telegram Blog

<RouteEn author="fengkx" example="/telegram/blog" path="/telegram/blog" />

## Twitter

### User timeline

<RouteEn path="/twitter/user/:id" example="/twitter/user/DIYgod" :paramsDesc="['user id']" />

## User following timeline

<RouteEn author="DIYgod" example="/twitter/followings/DIYgod" path="/twitter/followings/:id" :paramsDesc="['user id']">

::: warning

This route requires Twitter token's corresponding id, therefore it's only availble when self-hosting, refer to the [Deploy Guide](/en/install/#route-specific-configurations) for route-specific configurations.

:::

</RouteEn>

### List timeline

<RouteEn author="xyqfer" example="/twitter/list/ladyleet/javascript" path="/twitter/list/:id/:name" :paramsDesc="['user name', 'list name']"/>

### User likes

<RouteEn author="xyqfer" example="/twitter/likes/DIYgod" path="/twitter/likes/:id" :paramsDesc="['user name']"/>

### Keyword

<Route author="DIYgod" example="/twitter/keyword/RSSHub" path="/twitter/keyword/:keyword" :paramsDesc="['keyword']" radar="1"/>

## Youtube

### User

<RouteEn path="/youtube/user/:username/:embed?" example="/youtube/user/JFlaMusic" :paramsDesc="['YouTuber id', 'Default to embed the video, set to any value to disable embedding']" />

### Channel

<RouteEn path="/youtube/channel/:id/:embed?" example="/youtube/channel/UCDwDMPOZfxVV0x_dz0eQ8KQ" :paramsDesc="['YouTube channel id', 'Default to embed the video, set to any value to disable embedding']" />

### Playlist

<RouteEn path="/youtube/playlist/:id/:embed?" example="/youtube/playlist/PLqQ1RwlxOgeLTJ1f3fNMSwhjVgaWKo_9Z" :paramsDesc="['YouTube playlist id', 'Default to embed the video, set to any value to disable embedding']" />
