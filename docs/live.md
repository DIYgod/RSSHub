---
pageClass: routes
---

# 直播

## kingkong 直播

### 直播间开播

<Route author="LogicJake" example="/kingkong/room/2133342" path="/kingkong/room/:id" :paramsDesc="['直播间 id, 可在主播直播间页 URL 中找到']"/>

## 哔哩哔哩直播

### 直播开播

<Route author="Qixingchen" example="/bilibili/live/room/3" path="/bilibili/live/room/:roomID" :paramsDesc="['房间号, 可在直播间 URL 中找到, 长短号均可']"/>

### 直播搜索

<Route author="Qixingchen" example="/bilibili/live/search/编程/online" path="/bilibili/live/search/:key/:order" :paramsDesc="['搜索关键字', '排序方式, live_time 开播时间, online 人气']"/>

### 直播分区

<Route author="Qixingchen" example="/bilibili/live/area/143/online" path="/bilibili/live/area/:areaID/:order" :paramsDesc="['分区 ID 分区增删较多, 可通过 [分区列表](https://api.live.bilibili.com/room/v1/Area/getList) 查询', '排序方式, live_time 开播时间, online 人气']">

::: warning 注意

由于接口未提供开播时间, 如果直播间未更换标题与分区, 将视为一次. 如果直播间更换分区与标题, 将视为另一项

:::

</Route>

## 斗鱼直播

### 直播间开播

<Route author="DIYgod" example="/douyu/room/24422" path="/douyu/room/:id" :paramsDesc="['直播间 id, 可在主播直播间页 URL 中找到']"/>

## 虎牙直播

### 直播间开播

<Route author="SettingDust xyqfer" example="/huya/live/edmunddzhang" path="/huya/live/:id" :paramsDesc="['直播间id或主播名(有一些id是名字，如上)']"/>

## 战旗直播

### 直播间开播

<Route author="cssxsh" example="/zhanqi/room/anime" path="/zhanqi/room/:id" :paramsDesc="['直播间 id, 可在主播直播间页 URL 中找到']"/>
