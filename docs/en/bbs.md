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
