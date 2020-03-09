---
pageClass: routes
---

# Social Media

## Disqus

### Comment

<RouteEn path="/disqus/posts/:forum" example="/disqus/posts/diygod-me" :paramsDesc="['forum, disqus name of the target website']" />

## Facebook

### Page

<RouteEn author="maple3142" example="/facebook/page/SonetPCR" path="/facebook/page/:id" :paramsDesc="['page id']" anticrawler="1"/>

## Instagram

### User

<RouteEn path="/instagram/user/:id" example="/instagram/user/diygod" :paramsDesc="['Instagram id']" anticrawler="1"/>

### Hashtag

<RouteEn author="widyakumara" path="/instagram/tag/:tag" example="/instagram/tag/urbantoys" :paramsDesc="['Instagram hashtag']"  anticrawler="1"/>

### Stories

<RouteEn author="Maecenas" path="/instagram/story/:username" example="/instagram/story/instagram" :paramsDesc="['user name']"/>

## Lofter

::: tip

Official user RSS: http://**:username**.lofter.com/rss

:::

### Tag

<RouteEn author="hoilc" example="/lofter/tag/名侦探柯南/date" path="/lofter/tag/:name/:type?" :paramsDesc="['tag name', 'ranking type, default to new, can be new date week month total']"/>

## Mastodon

### Timeline

<RouteEn author="hoilc" example="/mastodon/timeline/pawoo.net/true" path="/mastodon/timeline/:site/:only_media?" :paramsDesc="['instance address, noly domain, no `http://` or `https://` protocol header', 'whether only display media content, default to false, any value to true']"/>

## piapro

### User latest works

<RouteEn author="hoilc" example="/piapro/user/shine_longer" path="/piapro/user/:pid" :paramsDesc="['User ID, can be found in url']"/>

### Website latest works

<RouteEn author="hoilc" example="/piapro/public/music/miku/2" path="/piapro/public/:type/:tag?/:category?" :paramsDesc="['work type, can be `music`,`illust`,`text`','`tag` parameter in url','category ID, `categoryId` parameter in url']"/>

## pixiv

### User Bookmark

<RouteEn author="EYHN" path="/pixiv/user/bookmarks/:id" example="/pixiv/user/bookmarks/15288095" :paramsDesc="['user id, available in user\'s homepage URL']" radar="1" />

### User Activity

<RouteEn author="EYHN" path="/pixiv/user/:id" example="/pixiv/user/15288095" :paramsDesc="['user id, available in user\'s homepage URL']" radar="1" />

### Rankings

<RouteEn author="EYHN" path="/pixiv/ranking/:mode/:date?" example="/pixiv/ranking/week" :paramsDesc="['rank type', 'format: `2018-4-25`']" radar="1" >

| pixiv daily rank | pixiv weekly rank | pixiv monthly rank | pixiv male rank | pixiv female rank | pixiv original rank | pixiv rookie user rank |
| ---------------- | ----------------- | ------------------ | --------------- | ----------------- | ------------------- | ---------------------- |
| day              | week              | month              | day_male        | day_female        | week_original       | week_rookie            |

| pixiv R-18 daily rank | pixiv R-18 male rank | pixiv R-18 female rank | pixiv R-18 weekly rank | pixiv R-18G rank |
| --------------------- | -------------------- | ---------------------- | ---------------------- | ---------------- |
| day_r18               | day_male_r18         | day_female_r18         | week_r18               | week_r18g        |

</RouteEn>

### Keyword

<RouteEn author="DIYgod" example="/pixiv/search/麻衣/popular/2" path="/pixiv/search/:keyword/:order?/:r18?" :paramsDesc="['keyword', 'rank mode, empty or other for time order, popular for popular order', 'filte R18 content, 0 to no filter, 1 to only not R18, 2 to only R18, default to 0']" radar="1"/>

### Following timeline

<RouteEn author="ClarkeCheng" example="/pixiv/user/illustfollows" path="/pixiv/user/illustfollows" radar="1"/>
::: warning

Only for self-hosted

:::
</RouteEn>

## Telegram

### Channel

<RouteEn path="/telegram/channel/:username" example="/telegram/channel/awesomeDIYgod" :paramsDesc="['channel name']">

::: tip

Due to Telegram restrictions, some channels involving pornography, copyright, and politics cannot be subscribed. You can confirm by visiting https://t.me/s/:username.

:::

</RouteEn>

### Sticker Pack

<RouteEn author="DIYgod" example="/telegram/stickerpack/DIYgod" path="/telegram/stickerpack/:name" :paramsDesc="['Sticker Pack name, available in the sharing URL']"/>

### Telegram Blog

<RouteEn author="fengkx" example="/telegram/blog" path="/telegram/blog" />

## Twitter

### User timeline

<RouteEn path="/twitter/user/:id/:type?" example="/twitter/user/DIYgod" :paramsDesc="['user id', 'Extra options `exclude_replies` exclude replies,`exclude_rts` exclude retweets,`exclude_rts_replies` exclude replies and retweets, for default include all.']" radar="1" />

## User following timeline

<RouteEn author="DIYgod" example="/twitter/followings/DIYgod" path="/twitter/followings/:id" :paramsDesc="['user id']" radar="1">

::: warning

This route requires Twitter token's corresponding id, therefore it's only availble when self-hosting, refer to the [Deploy Guide](/en/install/#route-specific-configurations) for route-specific configurations.

:::

</RouteEn>

### List timeline

<RouteEn author="xyqfer" example="/twitter/list/ladyleet/javascript" path="/twitter/list/:id/:name" :paramsDesc="['user name', 'list name']" radar="1"/>

### User likes

<RouteEn author="xyqfer" example="/twitter/likes/DIYgod" path="/twitter/likes/:id" :paramsDesc="['user name']" radar="1"/>

### Keyword

<RouteEn author="DIYgod" example="/twitter/keyword/RSSHub" path="/twitter/keyword/:keyword" :paramsDesc="['keyword']" radar="1"/>

## Youtube

::: tip Tiny Tiny RSS users please notice

Tiny Tiny RSS will add `sandbox="allow-scripts"` to all iframe elements, as a result, YouTube embedded videos cannot be loaded. If you need to use embedded videos, please install plugin [remove_iframe_sandbox](https://github.com/DIYgod/ttrss-plugin-remove-iframe-sandbox) for Tiny Tiny RSS.

:::

### User

<RouteEn path="/youtube/user/:username/:embed?" example="/youtube/user/JFlaMusic" :paramsDesc="['YouTuber id', 'Default to embed the video, set to any value to disable embedding']" radar="1" />

### Channel

<RouteEn path="/youtube/channel/:id/:embed?" example="/youtube/channel/UCDwDMPOZfxVV0x_dz0eQ8KQ" :paramsDesc="['YouTube channel id', 'Default to embed the video, set to any value to disable embedding']" radar="1" />

### Playlist

<RouteEn path="/youtube/playlist/:id/:embed?" example="/youtube/playlist/PLqQ1RwlxOgeLTJ1f3fNMSwhjVgaWKo_9Z" :paramsDesc="['YouTube playlist id', 'Default to embed the video, set to any value to disable embedding']" radar="1" />
