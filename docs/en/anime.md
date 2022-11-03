---
pageClass: routes
---

# ACG

## Bangumi Moe

### Latest

<RouteEn author="nczitzk" example="/bangumi/moe" path="/bangumi/moe"/>

### Tags

<RouteEn author="nczitzk" example="/bangumi/moe/chs/1080p" path="/bangumi/moe/:tags?" :paramsDesc="['Tags, empty by default, multiple tags separated by `/`']">

For more tags, please go to [Search torrent](https://bangumi.moe/search/index)

</RouteEn>

## Comics Kingdom

### Archive

<RouteEn author="stjohnjohnson" example="/comicskingdom/pardon-my-planet" path="/comicskingdom/:name" :paramsDesc="['URL path of the strip on comicskingdom.com']" />

## Hanime.tv

### Recently updated

<RouteEn author="EsuRt" example="/hanime/video" path="/hanime/video"/>

## iwara

### User

<RouteEn author="Fatpandac" example="/iwara/users/kelpie/video" path="/iwara/users/:username/:type?" :paramsDesc="['username, can find in userpage', 'video by default']" radar="1" rssbud="1">

| type | video | image |
| :--: | :---: | :---: |
|      | video | image |

</RouteEn>

### User Subscriptions

<RouteEn author="FeCCC" example="/iwara/subscriptions" path="/iwara/subscriptions" radar="1" rssbud="1" selfhost="1">

::: warning

This route requires Cookie, therefore it's only available when self-hosting, refer to the [Deploy Guide](/en/install/#route-specific-configurations) for route-specific configurations.

:::

</RouteEn>

## Kemono

### Posts

<RouteEn author="nczitzk" example="/kemono" path="/kemono/:source?/:id?" :paramsDesc="['Source, see below, Posts by default', 'User id, can be found in URL']">

Sources

| Posts | Patreon | Pixiv Fanbox | Gumroad | SubscribeStar | DLsite | Discord | Fantia |
| ----- | ------- | ------------ | ------- | ------------- | ------ | ------- | ------ |
| posts | patreon | fanbox       | gumroad | subscribestar | dlsite | discord | fantia |

::: tip Tip

When `posts` is selected as the value of the parameter **source**, the parameter **id** does not take effect.

:::

</RouteEn>

## lovelive-anime

### Love Live! Official Website Latest NEWS

<RouteEn author="axojhf" example="/lovelive-anime/news" path="/lovelive-anime/news/:option?" :paramsDesc="['Crawl full text when `option` is `detail`.']" radar="1"/>

### Love Live Official Website Categories Topics

<RouteEn author="axojhf" example="/lovelive-anime/topics/otonokizaka" path="/lovelive-anime/topics/:abbr/:category?/:option?" :paramsDesc="['The path to the Love Live series of sub-projects on the official website is detailed in the table below', 'The official website lists the Topics category, `category` is `detail` when crawling the full text, other categories see the following table for details', 'Crawl full text when `option` is `detail`.']" radar="1">

| Sub-project Name (not full name) | Lovelive!   | Lovelive! Sunshine!! | Lovelive! Nijigasaki High School Idol Club | Lovelive! Superstar!! | 幻日のヨハネ | ラブライブ！スクールアイドルミュージカル |
|----------------------------------|-------------|----------------------|--------------------------------------------|-----------------------|--------|----------------------|
| `abbr`parameter                  | otonokizaka | uranohoshi           | nijigasaki                                 | yuigaoka              | yohane | musical              |


| Category Name       | 全てのニュース               | 音楽商品  | アニメ映像商品     | キャスト映像商品   | 劇場      | アニメ放送/配信 | キャスト配信/ラジオ | ライブ/イベント | ブック   | グッズ   | ゲーム  | メディア  | ご当地情報 | その他   | キャンペーン   |
|---------------------|-----------------------|-------|-------------|------------|---------|----------|------------|----------|-------|-------|------|-------|-------|-------|----------|
| `category`parameter | <u>*No parameter*</u> | music | anime_movie | cast_movie | theater | onair    | radio      | event    | books | goods | game | media | local | other | campaign |

</RouteEn>

### Love Live Official Website Schedule

<RouteEn author="axojhf" example="/lovelive-anime/schedules" path="/schedules/:serie?/:category?" :paramsDesc="['Love Live! Series sub-projects abbreviation, see the following table', 'The official website lists the categories, see the following table for details']" radar="1">

::: tip Please note!
The schedule and other information obtained by this route is subject to the official website announcement!
The RSS routing has not been rigorously tested and the information provided cannot be guaranteed accurate!
:::

| Sub-project Name (not full name) | 全シリーズ                        | Lovelive!  | Lovelive! Sunshine!! | Lovelive! Nijigasaki High School Idol Club | Lovelive! Superstar!! | ラブライブ！スクールアイドルミュージカル |
|----------------------------------|------------------------------|------------|----------------------|--------------------------------------------|-----------------------|----------------------|
| `serie`parameter                 | <u>*No parameter*</u>or`all` | `lovelive` | `sunshine`           | `nijigasaki`                               | `superstar`           | `musical`            |

| Category Name       | 全て                           | ライブ    | イベント    | 生配信       |
|---------------------|------------------------------|--------|---------|-----------|
| `category`parameter | <u>*No parameter*</u>or`all` | `live` | `event` | `haishin` |

</RouteEn>

## THBWiki

### Calendar

<RouteEn author="aether17" path="/thwiki/calendar/:before?/:after?" example="/thwiki/calendar" :paramsDesc="['From how many days ago (default 30)', 'To how many days after (default 30)']" radar="1" rssbud="1"/>

## Touhougarakuta

### Articles

<RouteEn author="ttyfly" path="/touhougarakuta/:language/:type" example="/touhougarakuta/ja/news" :paramsDesc="['language', 'article type']">

Languages:

| Chinese | Japanese | Korean |
| ---- | ---- | ---- |
|  cn  |  ja  |  ko  |

Article types:

|  Index   | Series | Interviews | Novels | Comics | News |
| -------- | ------ | ---------- | ------ | ------ | ---- |
|  index   | series | interviews | novels | comics | news |

| Music review | Game review | Book review  | Where are you |
| ------------ | ----------- | ------------ | ------------- |
| music_review | game_review | book_review  | where_are_you |

**Note:** The index type includes all types of articles. Think twice before using it.

</RouteEn>

## Vol.moe

### vol

<RouteEn author="CoderTonyChan" example="/vol/finish" path="/vol/:mode?" :paramsDesc="['mode type']">

| Comics are serialized | Comics is finshed |
| --------------------- | ----------------- |
| serial                | finish            |

</RouteEn>

## Webtoons

### Comic updates

<RouteEn author="machsix" path="/webtoons/:lang/:category/:name/:id" example="/webtoons/zh-hant/drama/gongzhuweimian/894" :paramsDesc="['Language','Category','Name','ID']"/>

For example: <https://www.webtoons.com/zh-hant/drama/gongzhuweimian/list?title_no=894>, `lang=zh-hant`,`category=drama`,`name=gongzhucheyeweimian`,`id=894`.

### [Naver](https://comic.naver.com)

<RouteEn author="zfanta" example="/webtoons/naver/651673" path="/webtoons/naver/:titleId" :paramsDesc="['titleId of naver webtoon']" />

## 俺の3Dエロ動画(oreno3d)

::: tip Tip

You can use some RSS parsing libraries (like `feedpraser` in `Python`) to receive the video update messages and download them automatically

:::

### Keyword Search

<RouteEn author="xueli-sherryli" example="/oreno3d/search/bronya/latest/1" path="/oreno3d/search/:keyword/:sort/:pagelimit?" :paramsDesc="['Search keyword', 'Sort method, see the table below', 'The maximum number of pages to be crawled, the default is 1']" radar="1" rssbud="1">

| favorites | hot  | latest | popularity |
| --------- | ---- | ------ | ---------- |
| favorites | hot  | latest | popularity |

</RouteEn>

### Character Search

<RouteEn author="xueli-sherryli" example="/oreno3d/characters/283/latest/1" path="/oreno3d/characters/:characterid/:sort/:pagelimit?" :paramsDesc="['Character id, can be found in URL' , 'Sort method, see the table above', 'The maximum number of pages to be crawled, the default is 1']" radar="1" rssbud="1"/>

### Author Search

<RouteEn author="xueli-sherryli" example="/oreno3d/authors/3189/latest/1" path="/oreno3d/authors/:authorid/:sort/:pagelimit?" :paramsDesc="['Author id, can be found in URL' , 'Sort method, see the table above', 'The maximum number of pages to be crawled, the default is 1']" radar="1" rssbud="1"/>

### Tags Search

<RouteEn author="xueli-sherryli" example="/oreno3d/tags/177/latest/1" path="/oreno3d/tags/:tagid/:sort/:pagelimit?" :paramsDesc="['Tag id, can be found in URL', 'Sort method, see the table above', 'The maximum number of pages to be crawled, the default is 1']" radar="1" rssbud="1"/>

### Origins Search

<RouteEn author="xueli-sherryli" example="/oreno3d/origins/3/latest/1" path="/oreno3d/origins/:originid/:sort/:pagelimit?" :paramsDesc="['Origin id, can be found in URL' , 'Sort method, see the table above', 'The maximum number of pages to be crawled, the default is 1']" radar="1" rssbud="1"/>
