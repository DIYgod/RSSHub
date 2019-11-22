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

## 4Gamers 新闻

### 分类

<Route author="hoilc" example="/4gamers/category/352" path="/4gamers/category/:category" :paramsDesc="['分类 ID, 可从分类 URL 中找到']"/>

### 标签

<Route author="hoilc" example="/4gamers/tag/英雄聯盟" path="/4gamers/tag/:tag" :paramsDesc="['标签名, 可在标签 URL 中找到']"/>

## a9vgNews 游戏新闻

### a9vgNews 游戏新闻

<Route author="monner-henster" example="/a9vg/a9vg" path="/a9vg/a9vg"/>

## dekudeals

### 分类

<Route author="LogicJake" example="/dekudeals/most-wanted" path="/dekudeals/:type" :paramsDesc="['分类名称，可在 URL 中查看']"/>

## GNN.tw 游戏新闻

### GNN.tw 游戏新闻

<Route author="monner-henster" example="/gnn/gnn" path="/gnn/gnn"/>

## Indienova

### indienova 文章

<Route author="GensouSakuya kt286" example="/indienova/article" path="indienova/:type" :paramsDesc="['类型: `article` 文章，`development` 开发']"/>

## Maxjia News

### Dota 2

<Route author="dearrrfish" example="/maxnews/dota2" path="maxnews/dota2" />

## Metacritic

### 新游发行

<Route author="HenryQW" example="/metacritic/release/switch/coming" path="/metacritic/release/:platform/:type?/:sort?" :paramsDesc="['主机平台', '发行类型，默认为 `new`', '排序类型，默认为`date`']">

支持的主机平台:

| PS 4 | Xbox One | Switch | PC  | Wii U | 3DS | PS Vita | iOS |
| ---- | -------- | ------ | --- | ----- | --- | ------- | --- |
| ps4  | xboxone  | switch | pc  | wii-u | 3ds | vita    | ios |

发行类型，默认为 `new`:

| 新游发行 | 即将发行 | 全部 |
| -------- | -------- | ---- |
| new      | coming   | all  |

排序类型，默认为`date`:

| 日期 | Metacritic 评分 | 用户评分  |
| ---- | --------------- | --------- |
| date | metascore       | userscore |

</Route>

## Nintendo

### eShop 新发售游戏

<Route author="HFO4" example="/nintendo/eshop/hk" path="/nintendo/eshop/:region" :paramsDesc="['地区标识，可为`hk`(港服),`jp`(日服),`us`(美服)']"/>

### 首页资讯（香港）

<Route author="HFO4" example="/nintendo/news" path="/nintendo/news"/>

### 直面会

<Route author="HFO4" example="/nintendo/direct" path="/nintendo/direct"/>

### Switch 本体更新情报（日本）

<Route author="hoilc" example="/nintendo/system-update" path="/nintendo/system-update"/>

## PlayStation

### PlayStation Store 游戏列表

<Route author="DIYgod" example="/ps/list/STORE-MSF86012-PLUS_FTT_CONTENT" path="/ps/list/:gridName" :paramsDesc="['列表的 grid 名']" radar="1">

适用于 URL 如 <https://store.playstation.com/zh-hans-hk/grid/STORE-MSF86012-PLUS_FTT_CONTENT> 的列表页，比如 [PSN 每月免费游戏](https://store.playstation.com/zh-hans-hk/grid/STORE-MSF86012-PLUS_FTT_CONTENT) 的 gridName 为 STORE-MSF86012-PLUS_FTT_CONTENT

</Route>

### PlayStation Network 用户奖杯

<Route author="DIYgod" example="/ps/trophy/DIYgod_" path="/ps/trophy/:id" :paramsDesc="['用户 ID']" radar="1"/>

### PlayStation 4 系统更新纪录

<Route author="Jeason0228" example="/ps/ps4updates/" path="/ps/ps4updates/" radar="1"/>

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

## TapTap

::: warning 注意

由于区域限制，需要在有国内 IP 的机器上自建才能正常获取 RSS

:::

### 游戏论坛

<Route author="hoilc" example="/taptap/topic/142793/official" path="/taptap/topic/:id/:label?" :paramsDesc="['游戏ID, 游戏主页URL中获取', '论坛版块ID, 默认显示所有帖子, 论坛版块URL中`group_label_id`参数，特别的有']"/>

| 全部 | 精华  | 官方     |
| ---- | ----- | -------- |
| all  | elite | official |

### 游戏更新

<Route author="hoilc" example="/taptap/changelog/142793" path="/taptap/changelog/:id" :paramsDesc="['游戏ID, 游戏主页URL中获取']"/>

### 游戏评价

<Route author="hoilc" example="/taptap/review/142793/hot" path="/taptap/review/:id/:order?" :paramsDesc="['游戏ID, 游戏主页URL中获取', '排序方式, 空为默认排序, 可选如下']"/>

| 最新   | 最热 | 游戏时长 |
| ------ | ---- | -------- |
| update | hot  | spent    |

## 篝火营地

### 游戏资讯

<Route author="sintak" example="/gouhuo/news/switch" path="/gouhuo/news/:category" :paramsDesc="['资讯类型']">

| 精选       | 海外     | 原创    | PS4 | Xboxone | PC  | Switch | 掌机     | 手游       | 新闻 | 评测   | 文化    | 视频  | 音频  | 折扣     |
| ---------- | -------- | ------- | --- | ------- | --- | ------ | -------- | ---------- | ---- | ------ | ------- | ----- | ----- | -------- |
| choiceness | overseas | orignal | ps4 | xboxone | pc  | switch | handheld | mobilegame | news | review | culture | video | audio | discount |

</Route>

### 游戏攻略

<Route author="sintak" example="/gouhuo/strategy" path="/gouhuo/strategy"/>

## 怪物猎人世界

### 更新情报

<Route author="DIYgod" example="/mhw/update" path="/mhw/update" radar="1"/>

### 最新消息

<Route author="DIYgod" example="/mhw/news" path="/mhw/news" radar="1"/>

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

## 明日方舟

### 游戏公告与新闻

<Route author="Astrian" example="/arknights/news" path="/arknights/news"/>

## 王者荣耀

### 新闻中心

<Route author="Jeason0228" example="/pvp/newsindex/all" path="/pvp/newsindex/:type" :paramsDesc="['栏目分类,all=全部,rm=热门，xw=新闻,gg=公告,hd=活动,ss=赛事']"/>

## 小黑盒

### 用户动态

<Route author="LogicJake" example="/xiaoheihe/user/7775687" path="xiaoheihe/user/:id" :paramsDesc="['用户 id']"/>

### 游戏新闻

<Route author="MyFaith" example="/xiaoheihe/news" path="xiaoheihe/news"/>

### 游戏打折情况

<Route author="MyFaith" example="/xiaoheihe/discount" path="xiaoheihe/discount"/>

## 英雄联盟

### 新闻中心

<Route author="Jeason0228" example="/lol/newsindex/all" path="/lol/newsindex/:type" :paramsDesc="['栏目分类,all=全部,zh=综合,gg=公告,ss=赛事,gl=攻略,sq=社区']"/>

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

<Route author="MyFaith" example="/vgtime/news" path="/vgtime/news" radar="1"/>

### 游戏时光游戏发售表

<Route author="MyFaith" example="/vgtime/release" path="/vgtime/release" radar="1"/>

### 关键词资讯

<Route author="DIYgod" example="/vgtime/keyword/怪物猎人" path="/vgtime/keyword/:keyword" radar="1"/>

## 游研社

### 游研社

<Route author="LightStrawberry" example="/yystv/category/:category" path="/yystv/category/:category" :paramsDesc="['专栏类型']">

| 推游      | 游戏史  | 大事件 | 文化    | 趣闻 | 经典回顾 |
| --------- | ------- | ------ | ------- | ---- | -------- |
| recommend | history | big    | culture | news | retro    |

</Route>

## 掌上英雄联盟

### 推荐

<Route author="alizeegod" example="/lolapp/recommend" path="/lolapp/recommend"/>

## 最终幻想 14

### 最终幻想 14 国服

<Route author="Kiotlin" example="/ff14/ff14_zh/news" path="/ff14/ff14_zh/:type" :paramsDesc="['分类名']"/>

| 新闻 | 公告     | 活动   | 广告      | 所有 |
| ---- | -------- | ------ | --------- | ---- |
| news | announce | events | advertise | all  |

## きららファンタジア｜奇拉拉幻想曲

### 公告

<Route author="magic-akari" example="/kirara/news" path="/kirara/news"/>
