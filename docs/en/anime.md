---
pageClass: routes
---

# ACG

## Hanime.tv

### Recently updated

<RouteEn author="EsuRt" example="/hanime/video" path="/hanime/video"/>

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
