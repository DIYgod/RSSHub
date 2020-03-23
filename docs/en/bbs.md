---
pageClass: routes
---

# BBS

## Discuz

### General Subforum - Auto detection

<Route author="junfengP" example="/discuz/http%3a%2f%2fwww.u-share.cn%2fforum.php%3fmod%3dforumdisplay%26fid%3d56" path="/discuz/:link" :paramsDesc="['link of subforum, require url encoded ']"/>

### General Subforum - Manual version

<Route author="junfengP" example="/discuz/x/https%3a%2f%2fwww.52pojie.cn%2fforum-16-1.html" path="/discuz/:ver/:link" :paramsDesc="['discuz version，see below table','link of subforum, require url encoded']" >

| Discuz X Series | Discuz 7.x Series |
| --------------- | ----------------- |
| x               | 7                 |

</Route>

### General Subforum - Support cookie

<Route author="junfengP" example="/discuz/x/00/https%3a%2f%2fbbs.zdfx.net%2fforum-2-1.html" path="/discuz/:ver/:cid/:link" :paramsDesc="['discuz version，see below table', 'Cookie id，require self hosted and set environment parameters, see Deploy - Configuration pages for detail','link of subforum, require url encoded']" >

| Discuz X Series | Discuz 7.x Series |
| --------------- | ----------------- |
| x               | 7                 |

</Route>
