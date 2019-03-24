# 游戏资讯

## 3DMGame

<Route name="新闻中心" author="zhboner" example="/3dm/news" path="/3dm/news"/>

<Route name="游戏资讯" author="sinchang jacky2001114 HenryQW" example="/3dm/detroitbecomehuman/news" path="/3dm/:name/:type" :paramsDesc="['游戏的名字, 可以在专题页的 url 中找到', '资讯类型']">

| 新闻 | 攻略 | 下载资源 | 区块链快讯 |
| ---- | ---- | -------- | ---------- |
| news | gl   | resource | blockchain |

</Route>

## 米哈游

<Route name="崩坏 2-游戏公告" author="deepred5" example="/mihoyo/bh2/gach" path="/mihoyo/bh2/:type" :paramsDesc="['公告种类']">

| 最新公告 | 版本信息 | 祈愿信息 | 活动介绍 |
| -------- | -------- | -------- | -------- |
| new      | version  | gach     | event    |

</Route>

<Route name="崩坏 3-游戏公告" author="deepred5" example="/mihoyo/bh3/strategy" path="/mihoyo/bh3/:type" :paramsDesc="['公告种类']">

| 最新   | 公告   | 新闻 | 活动     | 攻略     |
| ------ | ------ | ---- | -------- | -------- |
| latest | notice | news | activity | strategy |

</Route>

## きららファンタジア｜奇拉拉幻想曲

<Route name="公告" author="magic-akari" example="/kirara/news" path="/kirara/news"/>

## 旅法师营地

<Route name="旅法师营地" author="qwertyuiop6" example="/lfsyd/1" path="/lfsyd/:typecode" :paramsDesc="['订阅分区类型']">

| 主页资讯 | 炉石传说 | 万智牌 | 昆特牌 | 游戏王 | 电子游戏 | 手机游戏 | 桌面游戏 |
| -------- | -------- | ------ | ------ | ------ | -------- | -------- | -------- |
| 1        | 2        | 3      | 14     | 16     | 4        | 22       | 9        |

| 影之诗 | Artifact | 玩家杂谈 | 营地电台 | 2047 | 魂武 |
| ------ | -------- | -------- | -------- | ---- | ---- |
| 17     | 67       | 21       | 5        | 62   | 68   |

</Route>

## GNN.tw 游戏新闻

<Route name="GNN.tw 游戏新闻" author="monner-henster" example="/gnn/gnn" path="/gnn/gnn"/>

## a9vgNews 游戏新闻

<Route name="a9vgNews 游戏新闻" author="monner-henster" example="/a9vg/a9vg" path="/a9vg/a9vg"/>

## Steam

<Route name="Steam search" author="maple3142" example="/steam/search/specials=1&term=atelier" path="/steam/search/:params" :paramsDesc="['搜寻参数']">

参数 params 请从 Steam 的 URL 取得

Example: `https://store.steampowered.com/search/?specials=1&term=atelier` 中的 params 是 `specials=1&term=atelier`，将它填入 RSSHub 的路由就好

</Route>

<Route name="Steam news" author="maple3142" example="/steam/news/282800" path="/steam/news/:appids" :paramsDesc="['游戏 id']"/>

## 小黑盒

<Route name="用户动态" author="LogicJake" example="/xiaoheihe/user/7775687" path="xiaoheihe/user/:id" :paramsDesc="['用户 id']"/>

<Route name="游戏新闻" author="MyFaith" example="/xiaoheihe/news" path="xiaoheihe/news"/>

<Route name="游戏打折情况" author="MyFaith" example="/xiaoheihe/discount" path="xiaoheihe/discount"/>

## Indienova

<Route name="indienova 文章" author="GensouSakuya" example="/indienova/article" path="indienova/article"/>

## 游戏时光

<Route name="游戏时光新闻" author="MyFaith" example="/vgtime/news" path="vgtime/news"/>

<Route name="游戏时光游戏发售表" author="MyFaith" example="/vgtime/release" path="vgtime/release"/>

## 游民星空

<Route name="游民星空今日推荐" author="LightStrawberry" example="/gamersky/news" path="/gamersky/news"/>

## 游研社

<Route name="游研社" author="LightStrawberry" example="/yystv/category/:category" path="/yystv/category/:category" :paramsDesc="['专栏类型']"/>

| 推游      | 游戏史  | 大事件 | 文化    | 趣闻 | 经典回顾 |
| --------- | ------- | ------ | ------- | ---- | -------- |
| recommend | history | big    | culture | news | retro    |

</Route>

## psnine

<Route name="首页-白金攻略/游戏开箱" author="LightStrawberry" example="/psnine/index" path="/psnine/index"/>
<Route name="新闻-游戏资讯" author="LightStrawberry" example="/psnine/news" path="/psnine/news"/>
<Route name="数折-折扣信息推送" author="LightStrawberry" example="/psnine/shuzhe" path="/psnine/shuzhe"/>
<Route name="闲游-二手盘信息" author="LightStrawberry" example="/psnine/trade" path="/psnine/trade"/>
<Route name="游戏-新游戏奖杯信息" author="LightStrawberry" example="/psnine/game" path="/psnine/game"/>
