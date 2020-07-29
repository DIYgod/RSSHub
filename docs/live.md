---
pageClass: routes
---

# 直播

## SHOWROOM 直播

### 直播间开播

<Route author="nwindz" example="/showroom/room/93401" path="/showroom/room/:id" :paramsDesc="['直播间 id, 打开浏览器控制台，刷新页面，找到请求中的room_id参数']"/>

## 哔哩哔哩直播

### 直播开播

<Route author="Qixingchen" example="/bilibili/live/room/3" path="/bilibili/live/room/:roomID" :paramsDesc="['房间号, 可在直播间 URL 中找到, 长短号均可']"/>

### 直播搜索

<Route author="Qixingchen" example="/bilibili/live/search/编程/online" path="/bilibili/live/search/:key/:order" :paramsDesc="['搜索关键字', '排序方式, live_time 开播时间, online 人气']"/>

### 直播分区

<Route author="Qixingchen" example="/bilibili/live/area/143/online" path="/bilibili/live/area/:areaID/:order" :paramsDesc="['分区 ID 分区增删较多, 可通过 [分区列表](https://api.live.bilibili.com/room/v1/Area/getList) 查询', '排序方式, live_time 开播时间, online 人气']">

::: warning 注意

由于接口未提供开播时间，如果直播间未更换标题与分区，将视为一次。如果直播间更换分区与标题，将视为另一项

:::

</Route>

## 斗鱼直播

### 直播间开播

<Route author="DIYgod" example="/douyu/room/24422" path="/douyu/room/:id" :paramsDesc="['直播间 id, 可在主播直播间页 URL 中找到']"/>

## 虎牙直播

### 直播间开播

<Route author="SettingDust xyqfer" example="/huya/live/edmunddzhang" path="/huya/live/:id" :paramsDesc="['直播间id或主播名(有一些id是名字，如上)']"/>

## 浪 Play (原 kingkong) 直播

### 直播间开播

<Route author="MittWillson" example="/langlive/room/666666" path="/langlive/room/:id" :paramsDesc="['直播间 id, 可在主播直播间页 URL 中找到']"/>

## 猎趣 TV

### 直播间开播

<Route author="hoilc" example="/liequtv/room/175435" path="/liequtv/room/:id" :paramsDesc="['直播间 id, 可在主播直播间页 URL 中找到']"/>

## 企鹅电竞

### 直播间开播

<Route author="hoilc" example="/egameqq/room/497383565" path="/egameqq/room/:id" :paramsDesc="['直播间 id, 可在主播直播间页 URL 中找到']"/>

## 战旗直播

### 直播间开播

<Route author="cssxsh" example="/zhanqi/room/anime" path="/zhanqi/room/:id" :paramsDesc="['直播间 id, 可在主播直播间页 URL 中找到']"/>
