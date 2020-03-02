---
pageClass: routes
---

# 购物

## Alter 中国

### 新闻

<Route author="luyuhuang" example="/alter-cn/news" path="/alter-cn/news"/>

## LeBonCoin

### Ads

Transform any search into a feed.

<Route author="Platane" example="/leboncoin/ad/category=10&locations=Paris_75015" path="/leboncoin/ad/:query" :paramsDesc="['search page querystring']">

For instance, in https://www.leboncoin.fr/recherche/?**category=10&locations=Paris_75015**, the query is **category=10&locations=Paris_75015**

</Route>

## Westore

### 新品

<Route author="xyqfer" example="/westore/new" path="/westore/new"/>

## 大麦网

### 票务更新

<Route author="hoilc" example="/damai/activity/上海/音乐会/全部/柴可夫斯基" path="/damai/activity/:city/:category/:subcategory/:keyword?" :paramsDesc="['城市, 如果不需要限制, 请填入`全部`', '分类, 如果不需要限制, 请填入`全部`', '子分类, 如果不需要限制, 请填入`全部`', '搜索关键字, 置空为不限制']"/>

城市、分类名、子分类名, 请参见[大麦网搜索页面](https://search.damai.cn/search.htm)

## 多抓鱼

### 搜索结果

<Route author="fengkx" example="/duozhuayu/search/JavaScript" path="/duozhuayu/search/:wd" :paramsDesc="['搜索关键词']"/>

## 好好住

### 整屋案例

<Route author="hoilc" example="/haohaozhu/whole-house/日式" path="/haohaozhu/whole-house/:keyword?" :paramsDesc="['分类名或关键字，请使用中文']"/>

### 发现

<Route author="hoilc" example="/haohaozhu/discover/厨房" path="/haohaozhu/discover/:keyword?" :paramsDesc="['分类名或关键字，请使用中文']"/>

## 京东众筹

### 众筹项目

<Route author="LogicJake" example="/jingdong/zhongchou/all/zcz/zhtj" path="/jingdong/zhongchou/:type/:status/:sort" :paramsDesc="['类型','状态','排序方式']">

类型

| 全部 | 科技 | 美食 | 家电 | 设计 | 娱乐 | 文化 | 公益 | 其他 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| all  | kj   | ms   | jd   | sj   | yl   | wh   | gy   | qt   |

状态

| 全部 | 预热中 | 众筹中 | 众筹成功 | 项目成功 |
| ---- | ------ | ------ | -------- | -------- |
| all  | yrz    | zcz    | zccg     | xmcg     |

排序方式

| 综合推荐 | 最新上线 | 金额最多 | 支持最多 | 即将结束 |
| -------- | -------- | -------- | -------- | -------- |
| zhtj     | zxsx     | jezg     | zczd     | jjjs     |

</Route>

## 酒云网

### 最新商品

<Route author="MeXunco" example="/wineyun/home" path="/wineyun/:category" :paramsDesc="['分类名']" >
| 全部     | 闪购 | 秒发 | 跨境    | 尾货专场 |
| -------- | ------- | --- | ------- | ------ |
| home | shangou | miaofa | csborder | weihuo |

</Route>

## 礼物说

### 礼物说

<Route author="sanmmm" example="/liwushuo/index" path="/liwushuo/index"/>

## 缺书网

### 促销

<Route author="kt286" example="/queshu/sale" path="/queshu/sale"/>

### 单品活动信息

<Route author="kt286" example="/queshu/book/34626813" path="/queshu/book/:bookid" :paramsDesc="['图书ID，可在链接中获取']"/>

## 什么值得买

::: tip 提示

网站也提供了部分 RSS: https://www.smzdm.com/dingyue

:::

### 关键词

<Route author="DIYgod" example="/smzdm/keyword/女装" path="/smzdm/keyword/:keyword" :paramsDesc="['你想订阅的关键词']" radar="1"/>

### 排行榜

<Route author="DIYgod" example="/smzdm/ranking/pinlei/11/3" path="/smzdm/ranking/:rank_type/:rank_id/:hour" :paramsDesc="['榜单类型','榜单ID','时间跨度']" radar="1">

-   榜单类型

| 好价品类榜 | 好价电商榜 | 海淘 TOP 榜 | 好文排行榜 | 好物排行榜 |
| ---------- | ---------- | ----------- | ---------- | ---------- |
| pinlei     | dianshang  | haitao      | haowen     | haowu      |

-   榜单 ID

好价品类榜

| 全部 | 时尚运动 | 3C 家电 | 食品家居 | 日百母婴 | 出行游玩 | 白菜 | 凑单品 |
| ---- | -------- | ------- | -------- | -------- | -------- | ---- | ------ |
| 11   | 12       | 13      | 14       | 15       | 16       | 17   | 22     |

好价电商榜

| 券活动 | 京东 | 天猫 | 亚马逊中国 | 国美在线 | 苏宁易购 | 网易 | 西集网 | 美国亚马逊 | 日本亚马逊 | ebay |
| ------ | ---- | ---- | ---------- | -------- | -------- | ---- | ------ | ---------- | ---------- | ---- |
| 24     | 23   | 25   | 26         | 27       | 28       | 29   | 30     | 31         | 32         | 33   |

海淘 TOP 榜

| 全部 | 海外直邮 | 美国榜 | 欧洲榜 | 澳新榜 | 亚洲榜 | 晒物榜 |
| ---- | -------- | ------ | ------ | ------ | ------ | ------ |
| 39   | 34       | 35     | 36     | 37     | 38     | hsw    |

好文排行榜

| 原创 | 资讯 |
| ---- | ---- |
| yc   | zx   |

好物排行榜

| 新晋榜 | 消费众测 | 新锐品牌 | 好物榜单 |
| ------ | -------- | -------- | -------- |
| hwall  | zc       | nb       | hw       |

</Route>

### 好文

<Route author="LogicJake" example="/smzdm/haowen/1" path="/smzdm/haowen/:day" :paramsDesc="['以天为时间跨度，默认为all，其余可以选择1，7，30，365']"/>

### 好文分类

<Route author="LogicJake" example="/smzdm/haowen/fenlei/shenghuodianqi" path="/smzdm/haowen/fenlei/:name/:sort?" :paramsDesc="['分类名，可在 URL 中查看','排序方式，默认为最新']">

| 最新 | 周排行 | 月排行 |
| ---- | ------ | ------ |
| 0    | 7      | 30     |

</Route>

## 淘宝众筹

### 众筹项目

<Route author="xyqfer" example="/taobao/zhongchou/all" path="/taobao/zhongchou/:type?" :paramsDesc="['类型, 默认为 `all` 全部']">

| 全部 | 科技 | 食品        | 动漫 | 设计   | 公益 | 娱乐 | 影音  | 书籍 | 游戏 | 其他  |
| ---- | ---- | ----------- | ---- | ------ | ---- | ---- | ----- | ---- | ---- | ----- |
| all  | tech | agriculture | acg  | design | love | tele | music | book | game | other |

</Route>

## 玩物志

### 最新

<Route author="xyqfer" example="/coolbuy/newest" path="/coolbuy/newest"/>

## 微店

### 商品上新

<Route author="LogicJake" example="/weidian/goods/431508863" path="/weidian/goods/:id" :paramsDesc="['商铺 id']"/>

## 小米

### 小米众筹

<Route author="DIYgod" example="/mi/crowdfunding" path="/mi/crowdfunding"/>

### 小米有品众筹

<Route author="DIYgod" example="/mi/youpin/crowdfunding" path="/mi/youpin/crowdfunding"/>

### 小米有品每日上新

<Route author="xyqfer" example="/mi/youpin/new" path="/mi/youpin/new"/>

## 宜家 IKEA

### 宜家 IKEA（英国）- 商品上新

<Route author="HenryQW" example="/ikea/uk/new" path="/ikea/uk/new"/>

### 宜家 IKEA（英国）- 促销

<Route author="HenryQW" example="/ikea/uk/offer" path="/ikea/uk/offer"/>

## 有赞

### 商品上新

<Route author="LogicJake" example="/youzan/goods/13328377" path="/youzan/goods/:id" :paramsDesc="['商铺id']"/>
