---
pageClass: routes
---

# 游戏

## 3DMGame

### 新闻中心

<Route author="zhboner" example="/3dm/news" path="/3dm/news"/>

### 游戏资讯

<Route author="sinchang jacky2001114 HenryQW" example="/3dm/detroitbecomehuman/news" path="/3dm/:name/:type" :paramsDesc="['游戏的名字, 可以在专题页的 url 中找到', '资讯类型']">

| 新闻 | 攻略 | 下载资源 | 区块链快讯 |
| ---- | ---- | -------- | ---------- |
| news | gl   | resource | blockchain |

</Route>

## a9vgNews 游戏新闻

### a9vgNews 游戏新闻

<Route author="monner-henster" example="/a9vg/a9vg" path="/a9vg/a9vg"/>

## GNN.tw 游戏新闻

### GNN.tw 游戏新闻

<Route author="monner-henster" example="/gnn/gnn" path="/gnn/gnn"/>

## Indienova

### indienova 文章

<Route author="GensouSakuya" example="/indienova/article" path="indienova/article"/>

## MaxNews

### Dota 2

<Route author="dearrrfish" example="/maxnews/dota2" path="maxnews/dota2" />

## Nintendo

### eShop 新发售游戏

<Route author="HFO4" example="/nintendo/eshop/hk" path="/nintendo/eshop/:region" :paramsDesc="['地区标识，可为`hk`(港服),`jp`(日服),`us`(美服)']"/>

### 首页资讯（香港）

<Route author="HFO4" example="/nintendo/news" path="/nintendo/news"/>

### 直面会

<Route author="HFO4" example="/nintendo/direct" path="/nintendo/direct"/>

## PlayStation Store

### 游戏列表

<Route author="DIYgod" example="/ps/list/STORE-MSF86012-PLUS_FTT_CONTENT" path="/ps/list/:gridName" :paramsDesc="['列表的 grid 名']">

适用于 URL 如 <https://store.playstation.com/zh-hans-hk/grid/STORE-MSF86012-PLUS_FTT_CONTENT> 的列表页，比如 [PSN 每月免费游戏](https://store.playstation.com/zh-hans-hk/grid/STORE-MSF86012-PLUS_FTT_CONTENT) 的 gridName 为 STORE-MSF86012-PLUS_FTT_CONTENT

</Route>

## psnine

### 首页-白金攻略/游戏开箱

<Route author="LightStrawberry" example="/psnine/index" path="/psnine/index"/>

### 新闻-游戏资讯

<Route author="LightStrawberry" example="/psnine/news" path="/psnine/news"/>
### 数折-折扣信息推送

<Route author="LightStrawberry" example="/psnine/shuzhe" path="/psnine/shuzhe"/>
### 闲游-二手盘信息

<Route author="LightStrawberry" example="/psnine/trade" path="/psnine/trade"/>
### 游戏-新游戏奖杯信息

<Route author="LightStrawberry" example="/psnine/game" path="/psnine/game"/>

## Steam

### Steam search

<Route author="maple3142" example="/steam/search/specials=1&term=atelier" path="/steam/search/:params" :paramsDesc="['搜寻参数']">

参数 params 请从 Steam 的 URL 取得

Example: `https://store.steampowered.com/search/?specials=1&term=atelier` 中的 params 是 `specials=1&term=atelier`，将它填入 RSSHub 的路由就好

</Route>

### Steam news

<Route author="maple3142" example="/steam/news/282800" path="/steam/news/:appids" :paramsDesc="['游戏 id']"/>

## SteamGifts

### Discussions

<Route author="whtsky" example="/steamgifts/discussions" path="/steamgifts/discussions/:category?" :paramsDesc="['分类名称，默认为All']"/>

## 怪物猎人

### 更新

<Route author="DIYgod" example="/monsterhunter/update" path="/monsterhunter/update"/>

## 旅法师营地

### 旅法师营地

<Route author="qwertyuiop6" example="/lfsyd/1" path="/lfsyd/:typecode" :paramsDesc="['订阅分区类型']">

| 主页资讯 | 炉石传说 | 万智牌 | 昆特牌 | 游戏王 | 电子游戏 | 手机游戏 | 桌面游戏 |
| -------- | -------- | ------ | ------ | ------ | -------- | -------- | -------- |
| 1        | 2        | 3      | 14     | 16     | 4        | 22       | 9        |

| 影之诗 | Artifact | 玩家杂谈 | 营地电台 | 2047 | 魂武 |
| ------ | -------- | -------- | -------- | ---- | ---- |
| 17     | 67       | 21       | 5        | 62   | 68   |

</Route>

## 米哈游

### 崩坏 2-游戏公告

<Route author="deepred5" example="/mihoyo/bh2/gach" path="/mihoyo/bh2/:type" :paramsDesc="['公告种类']">

| 最新公告 | 版本信息 | 祈愿信息 | 活动介绍 |
| -------- | -------- | -------- | -------- |
| new      | version  | gach     | event    |

</Route>

### 崩坏 3-游戏公告

<Route author="deepred5" example="/mihoyo/bh3/strategy" path="/mihoyo/bh3/:type" :paramsDesc="['公告种类']">

| 最新   | 公告   | 新闻 | 活动     | 攻略     |
| ------ | ------ | ---- | -------- | -------- |
| latest | notice | news | activity | strategy |

</Route>

## 小黑盒

### 用户动态

<Route author="LogicJake" example="/xiaoheihe/user/7775687" path="xiaoheihe/user/:id" :paramsDesc="['用户 id']"/>

### 游戏新闻

<Route author="MyFaith" example="/xiaoheihe/news" path="xiaoheihe/news"/>

### 游戏打折情况

<Route author="MyFaith" example="/xiaoheihe/discount" path="xiaoheihe/discount"/>

## 游民星空

### 游民星空今日推荐

<Route author="LightStrawberry" example="/gamersky/news" path="/gamersky/news"/>

### 游民娱乐

<Route author="LogicJake" example="/gamersky/ent/ymfl" path="/gamersky/ent/:category" :paramsDesc="['分类类型']">

| 趣囧时间 | 游民影院 | 游观天下 | 壁纸图库 | 游民盘点 | 游民福利 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| qysj     | ymyy     | ygtx     | bztk     | ympd     | ymfl     |

</Route>

## 游戏打折情报

### 游戏折扣

<Route author="LogicJake" example="/yxdzqb/hot_chinese" path="/yxdzqb/:type" :paramsDesc="['折扣类型']">

| Steam 最新折扣 | Steam 热门游戏折扣 | Steam 热门中文游戏折扣 | Steam 历史低价 | Steam 中文游戏历史低价 |
| -------------- | ------------------ | ---------------------- | -------------- | ---------------------- |
| new            | hot                | hot_chinese            | low            | low_chinese            |

</Route>

## 游戏时光

### 游戏时光新闻

<Route author="MyFaith" example="/vgtime/news" path="/vgtime/news"/>

### 游戏时光游戏发售表

<Route author="MyFaith" example="/vgtime/release" path="/vgtime/release"/>

### 关键词资讯

<Route author="DIYgod" example="/vgtime/keyword/怪物猎人" path="/vgtime/keyword/:keyword"/>

## 游研社

### 游研社

<Route author="LightStrawberry" example="/yystv/category/:category" path="/yystv/category/:category" :paramsDesc="['专栏类型']">

| 推游      | 游戏史  | 大事件 | 文化    | 趣闻 | 经典回顾 |
| --------- | ------- | ------ | ------- | ---- | -------- |
| recommend | history | big    | culture | news | retro    |

</Route>

## きららファンタジア｜奇拉拉幻想曲

### 公告

<Route author="magic-akari" example="/kirara/news" path="/kirara/news"/>
