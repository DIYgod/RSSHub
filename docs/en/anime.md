---
pageClass: routes
---

# ACG

## Hanime.tv

### Recently updated

<RouteEn author="EsuRt" example="/hanime/video" path="/hanime/video"/>

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

For example: https://www.webtoons.com/zh-hant/drama/gongzhuweimian/list?title_no=894, `lang=zh-hant`,`category=drama`,`name=gongzhucheyeweimian`,`id=894`.

### [Naver](https://comic.naver.com)

<RouteEn author="zfanta" example="/webtoons/naver/651673" path="/webtoons/naver/:titleId" :paramsDesc="['titleId of naver webtoon']" />
