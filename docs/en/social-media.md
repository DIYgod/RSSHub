---
pageClass: routes
---

# Social Media

## CuriousCat

### User

<RouteEn author="lucasew" path="/curiouscat/user/:name" example="/curiouscat/user/username" :paramsDesc="['name, username that is in the URL']" />

## Dev.to

### Top Posts

<RouteEn author="dwemerx" example="/dev.to/top/month" path="/dev.to/top/:period" :paramsDesc="['period']">

| dev.to weekly top | dev.to monthly top | dev.to yearly top | dev.to top posts of all time |
| ----------------- | ------------------ | ----------------- | ---------------------------- |
| week              | month              | year              | infinity                     |

</RouteEn>

## Disqus

### Comment

<RouteEn path="/disqus/posts/:forum" example="/disqus/posts/diygod-me" :paramsDesc="['forum, disqus name of the target website']" />

## Facebook

### Page

<RouteEn author="maple3142" example="/facebook/page/SonetPCR" path="/facebook/page/:id" :paramsDesc="['page id']" anticrawler="1"/>

## Fur Affinity

### Home

<RouteEn author="TigerCubDen" example="/furaffinity/home" path="/furaffinity/home/:type?/:nsfw?" :paramsDesc="['Art Type, default to be `artwork`', 'NSFW Mode, do not filter NSFW contents when value set to `1`']" radar="1">

Type

| artwork | crafts | music | writing | 
| ---- | ---- | ---- | ---- | 
| artwork | crafts | music | writing |

</RouteEn>

### Browse

<RouteEn author="TigerCubDen" example="/furaffinity/browse" path="/furaffinity/browse/:nsfw?" :paramsDesc="['NSFW Mode, do not filter NSFW contents when value set to `1`']" radar="1"/>

### Website Status

<RouteEn author="TigerCubDen" example="/furaffinity/status" path="/furaffinity/status" radar="1"/>

### Userpage Profile

<RouteEn author="TigerCubDen" example="/furaffinity/user/tiger-jungle" path="/furaffinity/user/:username" :paramsDesc="['Username, can find in userpage']" radar="1"/>

### Search

<RouteEn author="TigerCubDen" example="/furaffinity/search/tiger" path="/furaffinity/search/:keyword/:nsfw?" :paramsDesc="['Search keyword, enter any words you want to search, require English', 'NSFW Mode，do not filter NSFW contents when value set to `1`']" radar="1"/>

### User's Watching List

<RouteEn author="TigerCubDen" example="/furaffinity/watching/okami9312" path="/furaffinity/watching/:username" :paramsDesc="['Username, can find in userpage']" radar="1"/>

### User's Watcher List

<RouteEn author="TigerCubDen" example="/furaffinity/watchers/malikshadowclaw" path="/furaffinity/watchers/:username" :paramsDesc="['Username, can find in userpage']" radar="1"/>

### User's Commission Information 

<RouteEn author="TigerCubDen" example="/furaffinity/commissions/flashlioness" path="/furaffinity/commissions/:username" :paramsDesc="['Username, can find in userpage']" radar="1"/>

### User's Shouts

<RouteEn author="TigerCubDen" example="/furaffinity/shouts/redodgft" path="/furaffinity/shouts/:username" :paramsDesc="['Username, can find in userpage']" radar="1"/>

### User's Journals

<RouteEn author="TigerCubDen" example="/furaffinity/journals/rukis" path="/furaffinity/journals/:username" :paramsDesc="['Username, can find in userpage']" radar="1"/>

### User's Gallery

<RouteEn author="TigerCubDen" example="/furaffinity/gallery/flashlioness" path="/furaffinity/gallery/:username/:nsfw?" :paramsDesc="['Username, can find in userpage', 'NSFW Mode, do not filter NSFW contents when value set to `1`']" radar="1"/>

### User's Scraps

<RouteEn author="TigerCubDen" example="/furaffinity/scraps/flashlioness" path="/furaffinity/scraps/:username/:nsfw?" :paramsDesc="['Username, can find in userpage', 'NSFW Mode, do not filter NSFW contents when value set to `1`']" radar="1"/>

### User's Favorites

<RouteEn author="TigerCubDen" example="/furaffinity/favorites/tiger-jungle" path="/furaffinity/favorites/:username/:nsfw?" :paramsDesc="['Username, can find in userpage', 'NSFW Mode, do not filter NSFW contents when value set to `1`']" radar="1"/>

### Submission Comments

<RouteEn author="TigerCubDen" example="/furaffinity/submission_comments/34909983" path="/furaffinity/submission_comments/:id" :paramsDesc="['Submission id, can find in URL of submission page']" radar="1"/>

### Journal Comments

<RouteEn author="TigerCubDen" example="/furaffinity/journal_comments/9750669" path="/furaffinity/journal_comments/:id" :paramsDesc="['Journal id, can find in URL of journal page']" radar="1"/>

## Gab

### User's Posts

<RouteEn author="zphw" example="/gab/user/realdonaldtrump" path="/gab/user/:username" :paramsDesc="['Username']" />

### Popular Posts

<RouteEn author="zphw" example="/gab/popular/hot" path="/gab/popular/:sort?" :paramsDesc="['Sort by, `hot` to be Hot Posts and `top` to be Top Posts. Default: hot']" />

## Instagram

::: warning

Due to Instagram API restrictions, you have to setup your credentials on the server. See deployment guide for more.

If you don't want to setup credentials, use Picuki.

:::

### User Profile

<RouteEn author="oppilate DIYgod" example="/instagram/user/stefaniejoosten" path="/instagram/:category/:key" :paramsDesc="['Feed category. Only user category is supported for now.','Key for such category. E.g. username/ID for user feed']" radar="1" anticrawler="1"/>

## Lofter

### User

<RouteEn author="hoilc" example="/lofter/user/tingtingtingtingzhi" path="/lofter/user/:name" :paramsDesc="['Lofter user name, in the URL']"/>

### Tag

<RouteEn author="hoilc" example="/lofter/tag/名侦探柯南/date" path="/lofter/tag/:name/:type?" :paramsDesc="['tag name', 'ranking type, default to new, can be new date week month total']"/>

## Mastodon

::: tip

Official user RSS:

-   RSS: `https://**:instance**/users/**:username**.rss` ([Example](https://pawoo.net/users/pawoo_support.rss))
-   Atom: ~~`https://**:instance**/users/**:username**.atom`~~ (Only for pawoo.net, [example](https://pawoo.net/users/pawoo_support.atom))

These feed do not include boosts (a.k.a. reblogs). RSSHub provides a feed for user timeline based on the Mastodon API, but to use that, you will need to create application on a Mastodon instance, and configure your RSSHub instance. Check the [Deploy Guide](/en/install/#route-specific-configurations) for route-specific configurations.

:::

### User timeline

<RouteEn author="notofoe" example="/mastodon/acct/CatWhitney@mastodon.social/statuses" path="/mastodon/acct/:acct/statuses/:only_media?" :paramsDesc="['Webfinger account URI', 'whether only display media content, default to false, any value to true']"/>

### Instance timeline (local)

<RouteEn author="hoilc" example="/mastodon/timeline/pawoo.net/true" path="/mastodon/timeline/:site/:only_media?" :paramsDesc="['instance address, only domain, no `http://` or `https://` protocol header', 'whether only display media content, default to false, any value to true']"/>

### Instance timeline (federated)

<RouteEn author="hoilc" example="/mastodon/remote/pawoo.net/true" path="/mastodon/remote/:site/:only_media?" :paramsDesc="['instance address, only domain, no `http://` or `https://` protocol header', 'whether only display media content, default to false, any value to true']"/>

### User timeline (backup)

<RouteEn author="notofoe" example="/mastodon/account_id/mastodon.social/23634/statuses/only_media" path="/mastodon/account/:site/:account_id/statuses/:only_media?" :paramsDesc="['instance address, only domain, no `http://` or `https://` protocol header', 'account id. login your instance, then search for the user profile; the account id is in the url', 'whether only display media content, default to false, any value to true']"/>

## piapro

### User latest works

<RouteEn author="hoilc" example="/piapro/user/shine_longer" path="/piapro/user/:pid" :paramsDesc="['User ID, can be found in url']"/>

### Website latest works

<RouteEn author="hoilc" example="/piapro/public/music/miku/2" path="/piapro/public/:type/:tag?/:category?" :paramsDesc="['work type, can be `music`,`illust`,`text`','`tag` parameter in url','category ID, `categoryId` parameter in url']"/>

## Picuki

### User Profile

<RouteEn author="hoilc" example="/picuki/profile/stefaniejoosten" path="/picuki/profile/:id/:displayVideo?" :paramsDesc="['Instagram id','Default to disable the embedded video, set to any value to enable embedding']" />

## pixiv

### User Bookmark

<RouteEn author="EYHN" path="/pixiv/user/bookmarks/:id" example="/pixiv/user/bookmarks/15288095" :paramsDesc="['user id, available in user\'s homepage URL']" radar="1" rssbud="1"/>

### User Activity

<RouteEn author="EYHN" path="/pixiv/user/:id" example="/pixiv/user/15288095" :paramsDesc="['user id, available in user\'s homepage URL']" radar="1" rssbud="1"/>

### Rankings

<RouteEn author="EYHN" path="/pixiv/ranking/:mode/:date?" example="/pixiv/ranking/week" :paramsDesc="['rank type', 'format: `2018-4-25`']" radar="1" rssbud="1">

| pixiv daily rank | pixiv weekly rank | pixiv monthly rank | pixiv male rank | pixiv female rank | pixiv original rank | pixiv rookie user rank |
| ---------------- | ----------------- | ------------------ | --------------- | ----------------- | ------------------- | ---------------------- |
| day              | week              | month              | day_male        | day_female        | week_original       | week_rookie            |

| pixiv R-18 daily rank | pixiv R-18 male rank | pixiv R-18 female rank | pixiv R-18 weekly rank | pixiv R-18G rank |
| --------------------- | -------------------- | ---------------------- | ---------------------- | ---------------- |
| day_r18               | day_male_r18         | day_female_r18         | week_r18               | week_r18g        |

</RouteEn>

### Keyword

<RouteEn author="DIYgod" example="/pixiv/search/麻衣/popular/2" path="/pixiv/search/:keyword/:order?/:r18?" :paramsDesc="['keyword', 'rank mode, empty or other for time order, popular for popular order', 'filte R18 content, 0 to no filter, 1 to only not R18, 2 to only R18, default to 0']" radar="1" rssbud="1"/>

### Following timeline

<RouteEn author="ClarkeCheng" example="/pixiv/user/illustfollows" path="/pixiv/user/illustfollows" radar="1" rssbud="1" selfhost="1"/>
::: warning

Only for self-hosted

:::
</RouteEn>

## pixiv-fanbox

<RouteEn author="sgqy" example="/fanbox/otomeoto" path="/fanbox/:user?" :paramsDesc="['User name. Can be found in URL. Default is official news']"/>

## Telegram

### Channel

<RouteEn path="/telegram/channel/:username/:searchQuery?" example="/telegram/channel/awesomeDIYgod/%23DIYgod的豆瓣动态" :paramsDesc="['channel name', 'search query; replace `#` by `%23` for tag searching']" radar="1" rssbud="1">

::: tip

Due to Telegram restrictions, some channels involving pornography, copyright, and politics cannot be subscribed. You can confirm by visiting https://t.me/s/:username.

:::

</RouteEn>

### Sticker Pack

<RouteEn author="DIYgod" example="/telegram/stickerpack/DIYgod" path="/telegram/stickerpack/:name" :paramsDesc="['Sticker Pack name, available in the sharing URL']"/>

### Telegram Blog

<RouteEn author="fengkx" example="/telegram/blog" path="/telegram/blog" />

## Twitter

::: warning

Due to Twitter API restrictions, the Twitter Routes currently supports tweets within 7 days

:::

Specify options (in query string's format) in parameter `routeParams` to control some extra features for Tweets

| Key    | Description | Accepts | Defaults to |
| ------ | ----------- | ------- | ------------ |
| readable                  | Enable readable layout    | 0/1/true/false | false |
| authorNameBold            | Display author name in bold | 0/1/true/false | false |
| showAuthorInTitle         | Show author name in title | 0/1/true/false | false (true in `/twitter/followings`) |
| showAuthorInDesc          | Show author name in description (RSS body) | 0/1/true/false | false (true in `/twitter/followings`) |
| showQuotedAuthorAvatarInDesc | Show avatar of quoted Tweet's author in description (RSS body) (Not recommended if your RSS reader extracts images from description) | 0/1/true/false | false |
| showAuthorAvatarInDesc    | Show avatar of author in description (RSS body) (Not recommended if your RSS reader extracts images from description)| 0/1/true/false | false |
| showEmojiForRetweetAndReply | Use "🔁" instead of "Rt", "↩️" & "💬" instead of "Re" | 0/1/true/false | false |
| showRetweetTextInTitle    | Show quote comments in title | 0/1/true/false | true |
| addLinkForPics           | Add clickable links for Tweet pictures | 0/1/true/false | false |
| showTimestampInDescription| Show timestamp in description | 0/1/true/false | false |
| showQuotedInTitle         | Show quoted tweet in title    | 0/1/true/false | false |
| widthOfPics               | Width of Tweet pictures | Unspecified/Integer      | Unspecified |
| heightOfPics              | Height of Tweet pictures | Unspecified/Integer | Unspecified |
| sizeOfAuthorAvatar        | Size of author's avatar | Integer | 48 |
| sizeOfQuotedAuthorAvatar  | Size of quoted tweet's author's avatar | Integer | 24 |
| excludeReplies            | Exclude replies, only available in "User timeline" | 0/1/true/false | false |
| includeRts                | Include retweets, only available in "User timeline" | 0/1/true/false | true |
| count                     | `count` parameter passed to Twitter API, only available in "User timeline" | Unspecified/Integer | Unspecified |

Specify different option values than default values to improve readablility. The URL

```
https://rsshub.app/twitter/user/durov/readable=1&authorNameBold=1&showAuthorInTitle=1&showAuthorInDesc=1&showQuotedAuthorAvatarInDesc=1&showAuthorAvatarInDesc=1&showEmojiForRetweetAndReply=1&showRetweetTextInTitle=0&addLinkForPics=1&showTimestampInDescription=1&showQuotedInTitle=1&heightOfPics=150
```

generates

<img src="/readable-twitter.png" alt="Readable Twitter RSS of Durov">

### User timeline

<RouteEn path="/twitter/user/:id/:routeParams?" example="/twitter/user/DIYgod" :paramsDesc="['user id', 'extra parameters, see the table above; particularly when `routeParams=exclude_replies`, replies are excluded; `routeParams=exclude_rts` excludes retweets,`routeParams=exclude_rts_replies` exclude replies and retweets; for default include all.']" radar="1" rssbud="1"/>

## User following timeline

<RouteEn author="DIYgod" example="/twitter/followings/DIYgod" path="/twitter/followings/:id/:routeParams?" :paramsDesc="['user id', 'extra parameters, see the table above']" radar="1" rssbud="1" selfhost="1">

::: warning

This route requires Twitter token's corresponding id, therefore it's only available when self-hosting, refer to the [Deploy Guide](/en/install/#route-specific-configurations) for route-specific configurations.

:::

</RouteEn>

### List timeline

<RouteEn author="xyqfer" example="/twitter/list/ladyleet/javascript" path="/twitter/list/:id/:name/:routeParams?" :paramsDesc="['user name', 'list name', 'extra parameters, see the table above']" radar="1" rssbud="1"/>

### User likes

<RouteEn author="xyqfer" example="/twitter/likes/DIYgod" path="/twitter/likes/:id/:routeParams?" :paramsDesc="['user name', 'extra parameters, see the table above']" radar="1" rssbud="1"/>

### Keyword

<RouteEn author="DIYgod" example="/twitter/keyword/RSSHub" path="/twitter/keyword/:keyword/:routeParams?" :paramsDesc="['keyword', 'extra parameters, see the table above']" radar="1" rssbud="1"/>

### Trends

<RouteEn author="sakamossan" example="/twitter/trends/23424856" path="/twitter/trends/:woeid?" :paramsDesc="['Yahoo! Where On Earth ID. default to woeid=1 (World Wide)']" radar="1" rssbud="1"/>

## YouTube

::: tip Tiny Tiny RSS users please notice

Tiny Tiny RSS will add `sandbox="allow-scripts"` to all iframe elements, as a result, YouTube embedded videos cannot be loaded. If you need to use embedded videos, please install plugin [remove_iframe_sandbox](https://github.com/DIYgod/ttrss-plugin-remove-iframe-sandbox) for Tiny Tiny RSS.

:::

### User

<RouteEn path="/youtube/user/:username/:embed?" example="/youtube/user/JFlaMusic" :paramsDesc="['YouTuber id', 'Default to embed the video, set to any value to disable embedding']" radar="1" rssbud="1"/>

### Channel

::: tip

YouTube provides official RSS feeds for channels, for instance <https://www.youtube.com/feeds/videos.xml?channel_id=UCDwDMPOZfxVV0x_dz0eQ8KQ>.

:::

<RouteEn path="/youtube/channel/:id/:embed?" example="/youtube/channel/UCDwDMPOZfxVV0x_dz0eQ8KQ" :paramsDesc="['YouTube channel id', 'Default to embed the video, set to any value to disable embedding']" radar="1" rssbud="1"/>

### Playlist

<RouteEn path="/youtube/playlist/:id/:embed?" example="/youtube/playlist/PLqQ1RwlxOgeLTJ1f3fNMSwhjVgaWKo_9Z" :paramsDesc="['YouTube playlist id', 'Default to embed the video, set to any value to disable embedding']" radar="1" rssbud="1"/>
