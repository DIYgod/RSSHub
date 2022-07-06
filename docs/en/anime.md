---
pageClass: routes
---

# ACG

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
