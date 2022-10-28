---
pageClass: routes
---

# Social Media

## CuriousCat

### User

<RouteEn author="lucasew" path="/curiouscat/user/:name" example="/curiouscat/user/kretyn" :paramsDesc="['name, username that is in the URL']" />

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
| ------- | ------ | ----- | ------- |
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

<RouteEn author="hoilc nczitzk" example="/lofter/user/i" path="/lofter/user/:name?" :paramsDesc="['Lofter user name, can be found in the URL']"/>

### Tag

<RouteEn author="hoilc nczitzk" example="/lofter/tag/摄影/date" path="/lofter/tag/:name?/:type?" :paramsDesc="['tag name, such as `名侦探柯南`, `摄影` by default', 'ranking type, see below, new by default']">

| new  | date | week | month | total |
| ---- | ---- | ---- | ----- | ----- |
| 最新 | 日榜 | 周榜 | 月榜  | 总榜  |

</Route>

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

<RouteEn author="hoilc Rongronggg9" example="/picuki/profile/stefaniejoosten" path="/picuki/profile/:id/:functionalFlag?" :paramsDesc="['Instagram id','functional flag, see the table below']" radar="1" rssbud="1">

| functionalFlag | Video embedding                         | Fetching Instagram Stories |
| -------------- | --------------------------------------- | -------------------------- |
| 0              | off, only show video poster as an image | off                        |
| 1 (default)    | on                                      | off                        |
| 10             | on                                      | on                         |

::: warning

Instagram Stories do not have a reliable guid. It is possible that your RSS reader show the same story more than once.
Though, every Story expires after 24 hours, so it may be not so serious.

:::

</RouteEn>

## pixiv

### User Bookmark

<RouteEn author="EYHN" path="/pixiv/user/bookmarks/:id" example="/pixiv/user/bookmarks/15288095" :paramsDesc="['user id, available in user\'s homepage URL']" radar="1" rssbud="1"/>

### User Activity

<RouteEn author="EYHN" path="/pixiv/user/:id" example="/pixiv/user/15288095" :paramsDesc="['user id, available in user\'s homepage URL']" radar="1" rssbud="1"/>

### User Novels

<RouteEn author="TonyRL" example="/pixiv/user/novels/27104704" path="/pixiv/user/novels/:id" :paramsDesc="['User id, available in user\'s homepage URL']" radar="1" rssbud="1"/>

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

<RouteEn author="DIYgod" example="/pixiv/search/麻衣/popular/2" path="/pixiv/search/:keyword/:order?/:mode?" :paramsDesc="['keyword', 'rank mode, empty or other for time order, popular for popular order', 'filte R18 content']" radar="1" rssbud="1">

| only not R18 | only R18 | no filter      |
| ------------ | -------- | -------------- |
| safe         | r18      | empty or other |

</RouteEn>

### Following timeline

<RouteEn author="ClarkeCheng" example="/pixiv/user/illustfollows" path="/pixiv/user/illustfollows" radar="1" rssbud="1" selfhost="1">

::: warning

Only for self-hosted

:::

</RouteEn>

## pixivFANBOX

### User

<RouteEn author="sgqy" example="/fanbox/otomeoto" path="/fanbox/:user?" :paramsDesc="['User name. Can be found in URL. Default is official news']"/>

## Plurk

### Topic

<RouteEn author="TonyRL" path="/plurk/topic/:topic" example="/plurk/topic/standwithukraine" :paramsDesc="['Topic ID, can be found in URL']" radar="1" rssbud="1"/>

### Top

<RouteEn author="TonyRL" path="/plurk/top/:category?/:lang?" example="/plurk/top/topReplurks" :paramsDesc="['Category, see the table below, `topReplurks` by default', 'Language, see the table below, `en` by default']" radar="1" rssbud="1">

| Top Replurks | Top Favorites | Top Responded |
| ------------ | ------------- | ------------- |
| topReplurks  | topFavorites  | topResponded  |

| English | 中文（繁體） |
| ------- | ----------- |
| en     | zh      |

</RouteEn>

### Anonymous

<RouteEn author="TonyRL" path="/plurk/anonymous" example="/plurk/anonymous" radar="1" rssbud="1"/>

### Search

<RouteEn author="TonyRL" path="/plurk/search/:keyword" example="/plurk/search/FGO" :paramsDesc="['Search keyword']" radar="1" rssbud="1"/>

### Hotlinks

<RouteEn author="TonyRL" path="/plurk/hotlinks" example="/plurk/hotlinks" radar="1" rssbud="1"/>

### Plurk News

<RouteEn author="TonyRL" path="/plurk/news/:lang?" example="/plurk/news/:lang?" :paramsDesc="['Language, see the table above, `en` by default']" radar="1" rssbud="1"/>

### User

<RouteEn author="TonyRL" path="/plurk/user/:user" example="/plurk/user/plurkoffice" :paramsDesc="['User ID, can be found in URL']" radar="1" rssbud="1"/>

## Telegram

### Channel

<RouteEn author="DIYgod Rongronggg9" path="/telegram/channel/:username/:routeParams?" example="/telegram/channel/awesomeDIYgod/searchQuery=%23DIYgod的豆瓣动态" :paramsDesc="['channel username', 'extra parameters, see the table below']" radar="1" rssbud="1">

| Key                   | Description                                                           | Accepts                                              | Defaults to       |
| --------------------- | --------------------------------------------------------------------- | ---------------------------------------------------- | ----------------- |
| showLinkPreview       | Show the link preview from Telegram                                   | 0/1/true/false                                       | true              |
| showViaBot            | For messages sent via bot, show the bot                               | 0/1/true/false                                       | true              |
| showReplyTo           | For reply messages, show the target of the reply                      | 0/1/true/false                                       | true              |
| showFwdFrom           | For forwarded messages, show the forwarding source                    | 0/1/true/false                                       | true              |
| showFwdFromAuthor     | For forwarded messages, show the author of the forwarding source      | 0/1/true/false                                       | true              |
| showInlineButtons     | Show inline buttons                                                   | 0/1/true/false                                       | false             |
| showMediaTagInTitle   | Show media tags in the title                                          | 0/1/true/false                                       | true              |
| showMediaTagAsEmoji   | Show media tags as emoji                                              | 0/1/true/false                                       | true              |
| includeFwd            | Include forwarded messages                                            | 0/1/true/false                                       | true              |
| includeReply          | Include reply messages                                                | 0/1/true/false                                       | true              |
| includeServiceMsg     | Include service messages (e.g. message pinned, channel photo updated) | 0/1/true/false                                       | true              |
| includeUnsupportedMsg | Include messages unsupported by t.me                                  | 0/1/true/false                                       | false             |
| searchQuery           | search query                                                          | keywords; replace `#` by `%23` for hashtag searching | (search disabled) |

Specify different option values than default values can meet different needs, URL

```
https://rsshub.app/telegram/channel/NewlearnerChannel/showLinkPreview=0&showViaBot=0&showReplyTo=0&showFwdFrom=0&showFwdFromAuthor=0&showInlineButtons=0&showMediaTagInTitle=1&showMediaTagAsEmoji=1&includeFwd=0&includeReply=1&includeServiceMsg=0&includeUnsupportedMsg=0
```

generates an RSS without any link previews and annoying metadata, with emoji media tags in the title, without forwarded messages (but with reply messages), and without messages you don't care about (service messages and unsupported messages), for people who prefer pure subscriptions.

::: tip

For backward compatibility reasons, invalid `routeParams` will be treated as `searchQuery` .

Due to Telegram restrictions, some channels involving pornography, copyright, and politics cannot be subscribed. You can confirm by visiting `https://t.me/s/:username`.

:::

</RouteEn>

### Sticker Pack

<RouteEn author="DIYgod" example="/telegram/stickerpack/DIYgod" path="/telegram/stickerpack/:name" :paramsDesc="['Sticker Pack name, available in the sharing URL']"/>

### Telegram Blog

<RouteEn author="fengkx" example="/telegram/blog" path="/telegram/blog" />

## TikTok

### User

<RouteEn author="TonyRL" example="/tiktok/user/@linustech" path="/tiktok/user/:user" :paramsDesc="['User ID, including @']" anticrawler="1" puppeteer="1" radar="1" rssbud="1"/>

## Twitter

::: warning

Due to restrictions from Twitter, currently only tweets within 7 days are available in some routes.

Some routes rely on the Twitter Developer API, which requires to be specially configured to enable.\
There are two routes (`/twitter/user` and `/twitter/keyword`) comes with Web API implementation which does not require to be specially configured to enable along with the Developer API implementation. By default, the Developer API is prioritized, but if it is not configured or errors, the Web API will be used. However, there are some differences between the two APIs, e.g. `excludeReplies` in the Developer API will treat [threads](https://blog.twitter.com/official/en_us/topics/product/2017/nicethreads.html) (self-replied tweets) as replies and exclude them, while in the Web API it will not. If you would like to exclude replies but include threads, enable `forceWebApi` in the `/twitter/user` route.

:::

Specify options (in the format of query string) in parameter `routeParams` to control some extra features for Tweets

| Key                            | Description                                                                                                                          | Accepts                | Defaults to                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | ----------------------------------------- |
| `readable`                     | Enable readable layout                                                                                                               | `0`/`1`/`true`/`false` | `false`                                   |
| `authorNameBold`               | Display author name in bold                                                                                                          | `0`/`1`/`true`/`false` | `false`                                   |
| `showAuthorInTitle`            | Show author name in title                                                                                                            | `0`/`1`/`true`/`false` | `false` (`true` in `/twitter/followings`) |
| `showAuthorInDesc`             | Show author name in description (RSS body)                                                                                           | `0`/`1`/`true`/`false` | `false` (`true` in `/twitter/followings`) |
| `showQuotedAuthorAvatarInDesc` | Show avatar of quoted Tweet's author in description (RSS body) (Not recommended if your RSS reader extracts images from description) | `0`/`1`/`true`/`false` | `false`                                   |
| `showAuthorAvatarInDesc`       | Show avatar of author in description (RSS body) (Not recommended if your RSS reader extracts images from description)                | `0`/`1`/`true`/`false` | `false`                                   |
| `showEmojiForRetweetAndReply`  | Use "🔁" instead of "Rt", "↩️" & "💬" instead of "Re"                                                                                | `0`/`1`/`true`/`false` | `false`                                   |
| `showRetweetTextInTitle`       | Show quote comments in title (if `false`, only the retweeted tweet will be shown in the title)                                       | `0`/`1`/`true`/`false` | `true`                                    |
| `addLinkForPics`               | Add clickable links for Tweet pictures                                                                                               | `0`/`1`/`true`/`false` | `false`                                   |
| `showTimestampInDescription`   | Show timestamp in description                                                                                                        | `0`/`1`/`true`/`false` | `false`                                   |
| `showQuotedInTitle`            | Show quoted tweet in title                                                                                                           | `0`/`1`/`true`/`false` | `false`                                   |
| `widthOfPics`                  | Width of Tweet pictures                                                                                                              | Unspecified/Integer    | Unspecified                               |
| `heightOfPics`                 | Height of Tweet pictures                                                                                                             | Unspecified/Integer    | Unspecified                               |
| `sizeOfAuthorAvatar`           | Size of author's avatar                                                                                                              | Integer                | `48`                                      |
| `sizeOfQuotedAuthorAvatar`     | Size of quoted tweet's author's avatar                                                                                               | Integer                | `24`                                      |
| `excludeReplies`               | Exclude replies, only available in `/twitter/user`                                                                                   | `0`/`1`/`true`/`false` | `false`                                   |
| `includeRts`                   | Include retweets, only available in `/twitter/user`                                                                                  | `0`/`1`/`true`/`false` | `true`                                    |
| `forceWebApi`                  | Force using Web API even if Developer API is configured, only available in `/twitter/user` and `/twitter/keyword`                    | `0`/`1`/`true`/`false` | `false`                                   |
| `count`                        | `count` parameter passed to Twitter API, only available in `/twitter/user`                                                           | Unspecified/Integer    | Unspecified                               |

Specify different option values than default values to improve readability. The URL

```
https://rsshub.app/twitter/user/durov/readable=1&authorNameBold=1&showAuthorInTitle=1&showAuthorInDesc=1&showQuotedAuthorAvatarInDesc=1&showAuthorAvatarInDesc=1&showEmojiForRetweetAndReply=1&showRetweetTextInTitle=0&addLinkForPics=1&showTimestampInDescription=1&showQuotedInTitle=1&heightOfPics=150
```

generates

<img src="/readable-twitter.png" alt="Readable Twitter RSS of Durov">

### User timeline

<RouteEn author="DIYgod yindaheng98 Rongronggg9" path="/twitter/user/:id/:routeParams?" example="/twitter/user/DIYgod" :paramsDesc="['user id', 'extra parameters, see the table above; particularly when `routeParams=exclude_replies`, replies are excluded; `routeParams=exclude_rts` excludes retweets,`routeParams=exclude_rts_replies` exclude replies and retweets; for default include all.']" radar="1" rssbud="1"/>

### User media

<RouteEn author="yindaheng98 Rongronggg9" path="/twitter/media/:id/:routeParams?" example="/twitter/media/DIYgod" :paramsDesc="['user id', 'extra parameters, see the table above.']" radar="1" rssbud="1"/>

### User following timeline

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

<RouteEn author="DIYgod yindaheng98 Rongronggg9" example="/twitter/keyword/RSSHub" path="/twitter/keyword/:keyword/:routeParams?" :paramsDesc="['keyword', 'extra parameters, see the table above']" radar="1" rssbud="1"/>

### Trends

<RouteEn author="sakamossan" example="/twitter/trends/23424856" path="/twitter/trends/:woeid?" :paramsDesc="['Yahoo! Where On Earth ID. default to woeid=1 (World Wide)']" radar="1" rssbud="1"/>

### Collection

<RouteEn author="TonyRL" example="/twitter/collection/DIYgod/1527857429467172864" path="/twitter/collection/:uid/:collectionId/:routeParams?" :paramsDesc="['User name, should match the generated token', 'Collection ID, can be found in URL', 'extra parameters, see the table above']" radar="1" rssbud="1" selfhost="1"/>

::: warning

This route requires Twitter token's corresponding id, therefore it's only available when self-hosting, refer to the [Deploy Guide](/en/install/#route-specific-configurations) for route-specific configurations.

:::

</RouteEn>

## Vimeo

### User Profile

<RouteEn author="MisteryMonster" example="/vimeo/user/filmsupply/picks" path="/vimeo/user/:username/:cat?" :paramsDesc="['In this example [https://vimeo.com/filmsupply](https://vimeo.com/filmsupply)  is `filmsupply`', 'deafult for all latest videos, others categories in this example such as `Docmentary`, `Narrative`, `Drama`. Set `picks` for promote orders, just orderd like web page. When `picks` added, published date won\'t show up']">
::: tip Special category name attention

Some of the categories contain slash like `3D/CG` , must change the slash `/` to the vertical bar`|`.

:::

</RouteEn>

### Channel

<RouteEn author="MisteryMonster" example="/vimeo/channel/bestoftheyear" path="/vimeo/channel/:channel" :paramsDesc="['channel name can get from url like `bestoftheyear` in  [https://vimeo.com/channels/bestoftheyear/videos](https://vimeo.com/channels/bestoftheyear/videos) .']" radar="1"/>

### Category

<RouteEn author="MisteryMonster" example="/vimeo/category/documentary/staffpicks" path="/vimeo/category/:category/:staffpicks?" :paramsDesc="['Category name can get from url like `documentary` in [https://vimeo.com/categories/documentary/videos](https://vimeo.com/categories/documentary/videos) ', 'type `staffpicks` to sort with staffpicks']" radar="1"/>

## YouTube

::: tip Tiny Tiny RSS users please notice

Tiny Tiny RSS will add `sandbox="allow-scripts"` to all iframe elements, as a result, YouTube embedded videos cannot be loaded. If you need to use embedded videos, please install plugin [remove_iframe_sandbox](https://github.com/DIYgod/ttrss-plugin-remove-iframe-sandbox) for Tiny Tiny RSS.

:::

### User

<RouteEn author="DIYgod" path="/youtube/user/:username/:embed?" example="/youtube/user/JFlaMusic" :paramsDesc="['YouTuber id', 'Default to embed the video, set to any value to disable embedding']" radar="1" rssbud="1"/>

### Channel

::: tip

YouTube provides official RSS feeds for channels, for instance <https://www.youtube.com/feeds/videos.xml?channel_id=UCDwDMPOZfxVV0x_dz0eQ8KQ>.

:::

<RouteEn author="DIYgod" path="/youtube/channel/:id/:embed?" example="/youtube/channel/UCDwDMPOZfxVV0x_dz0eQ8KQ" :paramsDesc="['YouTube channel id', 'Default to embed the video, set to any value to disable embedding']" radar="1" rssbud="1"/>

### Custom URL

<RouteEn author="TonyRL" path="/youtube/c/:id/:embed?" example="/youtube/c/YouTubeCreators" :paramsDesc="['YouTube custom URL', 'Default to embed the video, set to any value to disable embedding']" radar="1" rssbud="1"/>

### Playlist

<RouteEn author="HenryQW" path="/youtube/playlist/:id/:embed?" example="/youtube/playlist/PLqQ1RwlxOgeLTJ1f3fNMSwhjVgaWKo_9Z" :paramsDesc="['YouTube playlist id', 'Default to embed the video, set to any value to disable embedding']" radar="1" rssbud="1"/>

### Subscriptions

<RouteEn author="TonyRL" path="/youtube/subscriptions/:embed?" example="/youtube/subscriptions" :paramsDesc="['Default to embed the video, set to any value to disable embedding']" selfhost="1" radar="1" rssbud="1"/>
