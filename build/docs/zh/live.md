# 🎥 直播

## Bilibili <Site url="www.bilibili.com"/>

### 直播分区 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/live/area/:areaID/:order","categories":["live"],"example":"/bilibili/live/area/207/online","parameters":{"areaID":"分区 ID 分区增删较多, 可通过 [分区列表](https://api.live.bilibili.com/room/v1/Area/getList) 查询","order":"排序方式, live_time 开播时间, online 人气"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"直播分区","maintainers":["Qixingchen"],"description":":::warning\n  由于接口未提供开播时间，如果直播间未更换标题与分区，将视为一次。如果直播间更换分区与标题，将视为另一项\n  :::","location":"live-area.ts"}' />

:::warning
  由于接口未提供开播时间，如果直播间未更换标题与分区，将视为一次。如果直播间更换分区与标题，将视为另一项
  :::

### 直播开播 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/live/room/:roomID","categories":["live"],"example":"/bilibili/live/room/3","parameters":{"roomID":"房间号, 可在直播间 URL 中找到, 长短号均可"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["live.bilibili.com/:roomID"]}],"name":"直播开播","maintainers":["Qixingchen"],"location":"live-room.ts"}' />

### 直播搜索 <Site url="www.bilibili.com" size="sm" />

<Route namespace="bilibili" :data='{"path":"/live/search/:key/:order","categories":["live"],"example":"/bilibili/live/search/dota/online","parameters":{"key":"搜索关键字","order":"排序方式, live_time 开播时间, online 人气"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"直播搜索","maintainers":["Qixingchen"],"location":"live-search.ts"}' />

## LiSA <Site url="www.sonymusic.co.jp"/>

### Latest Discography <Site url="www.lxixsxa.com/" size="sm" />

<Route namespace="lxixsxa" :data='{"path":"/disco","categories":["live"],"example":"/lxixsxa/disco","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.lxixsxa.com/","www.lxixsxa.com/discography"]}],"name":"Latest Discography","maintainers":["Kiotlin"],"url":"www.lxixsxa.com/","location":"discography.ts"}' />

### News <Site url="www.lxixsxa.com/" size="sm" />

<Route namespace="lxixsxa" :data='{"path":"/info","categories":["live"],"example":"/lxixsxa/info","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.lxixsxa.com/","www.lxixsxa.com/info"]}],"name":"News","maintainers":["Kiotlin"],"url":"www.lxixsxa.com/","location":"information.ts"}' />

## Twitch <Site url="www.twitch.tv"/>

### Channel Video <Site url="www.twitch.tv" size="sm" />

<Route namespace="twitch" :data='{"path":"/video/:login/:filter?","categories":["live"],"example":"/twitch/video/riotgames/highlights","parameters":{"login":"Twitch username","filter":"Video type, Default to all"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.twitch.tv/:login/videos"],"target":"/video/:login"}],"name":"Channel Video","maintainers":["hoilc"],"description":"| archive           | highlights                    | all        |\n| ----------------- | ----------------------------- | ---------- |\n| Recent broadcasts | Recent highlights and uploads | All videos |","location":"video.ts"}' />

| archive           | highlights                    | all        |
| ----------------- | ----------------------------- | ---------- |
| Recent broadcasts | Recent highlights and uploads | All videos |

### Live <Site url="www.twitch.tv" size="sm" />

<Route namespace="twitch" :data='{"path":"/live/:login","categories":["live"],"example":"/twitch/live/riotgames","parameters":{"login":"Twitch username"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Live","maintainers":["hoilc"],"location":"live.ts"}' />

### Stream Schedule <Site url="www.twitch.tv" size="sm" />

<Route namespace="twitch" :data='{"path":"/schedule/:login","categories":["live"],"example":"/twitch/schedule/riotgames","parameters":{"login":"Twitch username"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.twitch.tv/:login/schedule"]}],"name":"Stream Schedule","maintainers":["hoilc"],"location":"schedule.ts"}' />

## Yoasobi Official <Site url="www.yoasobi-music.jp"/>

### Live <Site url="www.yoasobi-music.jp/" size="sm" />

<Route namespace="yoasobi-music" :data='{"path":"/live","categories":["live"],"example":"/yoasobi-music/live","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.yoasobi-music.jp/","www.yoasobi-music.jp/live"]}],"name":"Live","maintainers":["Kiotlin"],"url":"www.yoasobi-music.jp/","location":"live.ts"}' />

### Media <Site url="www.yoasobi-music.jp/" size="sm" />

<Route namespace="yoasobi-music" :data='{"path":"/media","categories":["live"],"example":"/yoasobi-music/media","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.yoasobi-music.jp/","www.yoasobi-music.jp/media"]}],"name":"Media","maintainers":["Kiotlin"],"url":"www.yoasobi-music.jp/","location":"media.ts"}' />

### News & Biography <Site url="www.yoasobi-music.jp/" size="sm" />

<Route namespace="yoasobi-music" :data='{"path":"/info/:category?","categories":["live"],"example":"/yoasobi-music/info/news","parameters":{"category":"`news`, `biography`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.yoasobi-music.jp/","www.yoasobi-music.jp/:category"],"target":"/info/:category"}],"name":"News & Biography","maintainers":[],"url":"www.yoasobi-music.jp/","location":"info.ts"}' />

## YouTube Live <Site url="charts.youtube.com"/>

### Live <Site url="charts.youtube.com" size="sm" />

<Route namespace="youtube" :data='{"path":"/live/:username/:embed?","categories":["live"],"example":"/youtube/live/@GawrGura","parameters":{"username":"YouTuber id","embed":"Default to embed the video, set to any value to disable embedding"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Live","maintainers":["sussurr127"],"location":"live.ts"}' />

## 抖音直播 <Site url="douyin.com"/>

:::warning
反爬严格，需要启用 puppeteer。抖音的视频 CDN 会验证 Referer，意味着许多阅读器都无法直接播放内嵌视频，以下是一些变通解决方案：

1.  启用内嵌视频 (`embed=1`), 参考 [通用参数 -> 多媒体处理](/parameter#多媒体处理) 配置 `multimedia_hotlink_template` **或** `wrap_multimedia_in_iframe`。
2.  关闭内嵌视频 (`embed=0`)，手动点击 `视频直链` 超链接，一般情况下均可成功播放视频。若仍然出现 HTTP 403，请复制 URL 以后到浏览器打开。
3.  点击原文链接打开抖音网页版的视频详情页播放视频。
:::

额外参数

| 键      | 含义             | 值                     | 默认值  |
| ------- | ---------------- | ---------------------- | ------- |
| `embed` | 是否启用内嵌视频 | `0`/`1`/`true`/`false` | `false` |

### 直播间开播 <Site url="douyin.com" size="sm" />

<Route namespace="douyin" :data='{"path":"/live/:rid","categories":["live"],"example":"/douyin/live/685317364746","parameters":{"rid":"直播间 id, 可在主播直播间页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":true,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["live.douyin.com/:rid"]}],"name":"直播间开播","maintainers":["TonyRL"],"location":"live.ts"}' />

## 斗鱼直播 <Site url="www.douyu.com"/>

### 直播间开播 <Site url="www.douyu.com" size="sm" />

<Route namespace="douyu" :data='{"path":"/room/:id","categories":["live"],"example":"/douyu/room/24422","parameters":{"id":"直播间 id, 可在主播直播间页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.douyu.com/:id","www.douyu.com/"]}],"name":"直播间开播","maintainers":["DIYgod"],"location":"room.ts"}' />

## 浪 Play 直播 <Site url="lang.live"/>

### 直播间开播 <Site url="lang.live" size="sm" />

<Route namespace="lang" :data='{"path":"/live/room/:id","categories":["live"],"example":"/lang/live/room/1352360","parameters":{"id":"直播间 id, 可在主播直播间页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["lang.live/room/:id"]}],"name":"直播间开播","maintainers":["MittWillson"],"location":"room.ts"}' />

