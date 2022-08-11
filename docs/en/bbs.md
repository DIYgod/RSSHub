---
pageClass: routes
---

# BBS

## Discuz

### General Subforum - Auto detection

<RouteEn author="junfengP" example="/discuz/http%3a%2f%2fwww.u-share.cn%2fforum.php%3fmod%3dforumdisplay%26fid%3d56" path="/discuz/:link" :paramsDesc="['link of subforum, require url encoded ']"/>

### General Subforum - Manual version

<RouteEn author="junfengP" example="/discuz/x/https%3a%2f%2fwww.52pojie.cn%2fforum-16-1.html" path="/discuz/:ver/:link" :paramsDesc="['discuz version，see below table','link of subforum, require url encoded']" >

| Discuz X Series | Discuz 7.x Series |
| --------------- | ----------------- |
| x               | 7                 |

</RouteEn>

### General Subforum - Support cookie

<RouteEn author="junfengP" example="/discuz/x/00/https%3a%2f%2fbbs.zdfx.net%2fforum-2-1.html" path="/discuz/:ver/:cid/:link" :paramsDesc="['discuz version，see below table', 'Cookie id，require self hosted and set environment parameters, see Deploy - Configuration pages for detail','link of subforum, require url encoded']" >

| Discuz X Series | Discuz 7.x Series |
| --------------- | ----------------- |
| x               | 7                 |

</RouteEn>

## LowEndTalk

### Discussion

<RouteEn author="nczitzk" example="/lowendtalk/discussion/168480" path="/lowendtalk/discussion/:id?" :paramsDesc="['Discussion id']"/>

## Mobilism

### Forums

<RouteEn author="nitezs" example="/mobilism/forums/android/apps" path="/mobilism/forums/:category/:type/:fulltext?" :paramsDesc="['Category', 'subcategory','Retrieve fulltext, specify `y` to enable']">

| Android | iPhone | iPad |
| ------- | ------ | ---- |
| android | iphone | ipad |

| Apps | games |
| ---- | ----- |
| apps | games |

</RouteEn>

### Portal

<RouteEn author="nitezs" example="/mobilism/portal/androidapps" path="/mobilism/portal/:type/:fulltext?" :paramsDesc="['Sections', 'Retrieve fulltext, specify `y` to enable']">

| Android Apps | Android Games | ebook | iPad Apps | iPad Games | iPhone Apps | iPhone Games |
| ------------ | ------------- | ----- | --------- | ---------- | ----------- | ------------ |
| aapp         | agame         | ebook | ipapp     | ipgame     | iapp        | igame        |

</RouteEn>

## SCBOY forum

### Thread

<RouteEn author="totorowechat" example="/scboy/thread/188673" path="/scboy/thread/:tid" :paramsDesc="['thread tid']" radar="1">

If the url of the thread is <https://www.scboy.com/?thread-188673.htm> then tid would be `1789863`.

When accessing Joeyray's Bar, `SCBOY_BBS_TOKEN` needs to be filled in `environment`. See <https://docs.rsshub.app/en/install/#Deployment> for details. `SCBOY_BBS_TOKEN` is included in cookies with `bbs_token`.

</RouteEn>
