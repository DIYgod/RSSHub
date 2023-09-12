
# 🎥 Live

## LiSA {#lisa}

### News {#lisa-news}

<Route author="Kiotlin" example="/lxixsxa/info" path="/lxixsxa/info" radar="1" rssbud="1" />

### Latest Discography {#lisa-latest-discography}

<Route author="Kiotlin" example="/lxixsxa/disco" path="/lxixsxa/disco" radar="1" rssbud="1" />

## SHOWROOM 直播 {#showroom-zhi-bo}

### 直播间开播 {#showroom-zhi-bo-zhi-bo-jian-kai-bo}

<Route author="nwindz" example="/showroom/room/93401" path="/showroom/room/:id" paramsDesc={['直播间 id, 打开浏览器控制台，刷新页面，找到请求中的room_id参数']}/>

## V LIVE {#v-live}

### Board {#v-live-board}

<Route author="TonyRL" example="/vlive/channel/FD53B/board/3530" path="/vlive/channel/:channel/board/:board" paramsDesc={['Channel ID, can be found in the URL', 'Board ID, can be found in the URL']} radar="1" rssbud="1" />

## Yoasobi Official {#yoasobi-official}

### News & Biography {#yoasobi-official-news-biography}

<Route author="Kiotlin" example="/yoasobi-music/info/news" path="/yoasobi-music/info/:category?" paramsDesc={['`news`, `biography`']} radar="1" rssbud="1" />

### Live {#yoasobi-official-live}

<Route author="Kiotlin" example="/yoasobi-music/live" path="/yoasobi-music/live" radar="1" rssbud="1" />

### Media {#yoasobi-official-media}

<Route author="Kiotlin" example="/yoasobi-music/media" path="/yoasobi-music/media" radar="1" rssbud="1" />

## YouTube Live {#youtube-live}

### Live {#youtube-live-live}

<Route author="sussurr127" path="/youtube/live/:username/:embed?" example="/youtube/live/@GawrGura" paramsDesc={['YouTuber id', 'Default to embed the video, set to any value to disable embedding']} radar="1"/>

## 哔哩哔哩直播 {#bi-li-bi-li-zhi-bo}

### 直播开播 {#bi-li-bi-li-zhi-bo-zhi-bo-kai-bo}

<Route author="Qixingchen" example="/bilibili/live/room/3" path="/bilibili/live/room/:roomID" paramsDesc={['房间号, 可在直播间 URL 中找到, 长短号均可']}/>

### 直播搜索 {#bi-li-bi-li-zhi-bo-zhi-bo-sou-suo}

<Route author="Qixingchen" example="/bilibili/live/search/编程/online" path="/bilibili/live/search/:key/:order" paramsDesc={['搜索关键字', '排序方式, live_time 开播时间, online 人气']}/>

### 直播分区 {#bi-li-bi-li-zhi-bo-zhi-bo-fen-qu}

<Route author="Qixingchen" example="/bilibili/live/area/207/online" path="/bilibili/live/area/:areaID/:order" paramsDesc={['分区 ID 分区增删较多, 可通过 [分区列表](https://api.live.bilibili.com/room/v1/Area/getList) 查询', '排序方式, live_time 开播时间, online 人气']}>

:::caution

由于接口未提供开播时间，如果直播间未更换标题与分区，将视为一次。如果直播间更换分区与标题，将视为另一项

:::

</Route>

## 抖音直播 {#dou-yin-zhi-bo}

### 直播间开播 {#dou-yin-zhi-bo-zhi-bo-jian-kai-bo}

<Route author="TonyRL" example="/douyin/live/685317364746" path="/douyin/live/:rid" paramsDesc={['直播间 id, 可在主播直播间页 URL 中找到']} anticrawler="1" radar="1" rssbud="1" puppeteer="1"/>

## 斗鱼直播 {#dou-yu-zhi-bo}

### 直播间开播 {#dou-yu-zhi-bo-zhi-bo-jian-kai-bo}

<Route author="DIYgod" example="/douyu/room/24422" path="/douyu/room/:id" paramsDesc={['直播间 id, 可在主播直播间页 URL 中找到']}/>

## 虎牙直播 {#hu-ya-zhi-bo}

### 直播间开播 {#hu-ya-zhi-bo-zhi-bo-jian-kai-bo}

<Route author="SettingDust xyqfer" example="/huya/live/edmunddzhang" path="/huya/live/:id" paramsDesc={['直播间id或主播名(有一些id是名字，如上)']} radar="1" rssbud="1"/>

## 浪 Play 直播 {#lang-play-zhi-bo}

### 直播间开播 {#lang-play-zhi-bo-zhi-bo-jian-kai-bo}

<Route author="MittWillson" example="/lang/live/room/1352360" path="/lang/live/room/:id" paramsDesc={['直播间 id, 可在主播直播间页 URL 中找到']}/>

## 猎趣 TV {#lie-qu-tv}

### 直播间开播 {#lie-qu-tv-zhi-bo-jian-kai-bo}

<Route author="hoilc" example="/liequtv/room/175435" path="/liequtv/room/:id" paramsDesc={['直播间 id, 可在主播直播间页 URL 中找到']}/>

## 企鹅电竞 {#qi-e-dian-jing}

### 直播间开播 {#qi-e-dian-jing-zhi-bo-jian-kai-bo}

<Route author="hoilc" example="/egameqq/room/497383565" path="/egameqq/room/:id" paramsDesc={['直播间 id, 可在主播直播间页 URL 中找到']}/>

## 企鹅直播 {#qi-e-zhi-bo}

### 直播间开播 {#qi-e-zhi-bo-zhi-bo-jian-kai-bo}

<Route author="nczitzk" example="/qq/live/10012045" path="/qq/live/:id" paramsDesc={['直播间 id, 可在主播直播间页 URL 中找到']}/>

## 旺球体育 {#wang-qiu-ti-yu}

### 直播间开播 {#wang-qiu-ti-yu-zhi-bo-jian-kai-bo}

<Route author="nczitzk" example="/wangqiutiyu/anchor/444" path="/wangqiutiyu/anchor/:id" paramsDesc={['直播间 id, 可在主播直播间页 URL 中找到']}/>

## 战旗直播 {#zhan-qi-zhi-bo}

### 直播间开播 {#zhan-qi-zhi-bo-zhi-bo-jian-kai-bo}

<Route author="cssxsh" example="/zhanqi/room/anime" path="/zhanqi/room/:id" paramsDesc={['直播间 id, 可在主播直播间页 URL 中找到']}/>

