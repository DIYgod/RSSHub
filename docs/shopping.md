---
pageClass: routes
---

# 购物

## Alter 中国

### 新闻

<Route author="luyuhuang" example="/alter-cn/news" path="/alter-cn/news"/>

## AppSales

### Apps

<Route author="nczitzk" example="/appsales/highlights" path="/appsales/:caty?/:time?" :paramsDesc="['分类，默认为 `highlights`', '时间，默认为 `24h`']">

分类

| Highlights | Active Sales | Now Free | Watchlist Charts |
| ---------- | ------------ | -------- | ---------------- |
| highlights | activesales  | nowfree  | mostwanted       |

时间

| 最近一天 | 最近一周 | 所有时间 |
| -------- | -------- | -------- |
| 24h      | week     | alltime  |

::: tip 提示

参数 `time` 仅在选择 `mostwanted` 作为分类的时候有效。

:::

</Route>

## booth.pm

### 店铺

<Route author="KTachibanaM" example="/booth.pm/shop/annn-boc0123" path="/booth.pm/shop/:subdomain" :paramsDesc="['店铺子域名']" />

## Craigslist

### 商品搜索

<Route author="lxiange" example="/craigslist/sfbay/sso?query=folding+bike&sort=rel" path="/craigslist/:location/:type?" :paramsDesc="['位置，即Craigslist的子域，如sfbay', '搜索类型，如sso']"/>

> 由于 Craigslist 取消了 RSS 订阅搜索功能，因此用 RSSHub 来实现了类似效果。
> 一个完整原始搜索会像这样：
> <https://sfbay.craigslist.org/search/sso?query=folding+bike&sort=rel>
>
> /search/xxx 后跟的 "xxx" 为搜索类型，直接参考原始请求即可。
> query string 是实际的搜索内容。

## Furstar

### 最新售卖角色列表

<Route author="NeverBehave" example="/furstar/characters/cn" path="/furstar/characters/:lang?" :paramsDesc="['语言, 留空为jp, 支持cn, en']"/>

### 已经出售的角色列表

<Route author="NeverBehave" example="/furstar/archive/cn" path="/furstar/archive/:lang?" :paramsDesc="['语言, 留空为jp, 支持cn, en']"/>

### 画师列表

<Route author="NeverBehave" example="/furstar/artists/cn" path="/furstar/artists/:lang?" :paramsDesc="['语言, 留空为jp, 支持cn, en']"/>

## Guiltfree.pl

### Onsale

<Route author="nczitzk" example="/guiltfree/onsale" path="/guiltfree/onsale"/>

## hotukdeals

### thread

<Route author="DIYgod" example="/hotukdeals/hot" path="/hotukdeals/:type" :paramsDesc="['should be one of highlights, hot, new, discussed']" ></Route>

## LeBonCoin

### Ads

Transform any search into a feed.

<Route author="Platane" example="/leboncoin/ad/category=10&locations=Paris_75015" path="/leboncoin/ad/:query" :paramsDesc="['search page querystring']">

For instance, in <https://www.leboncoin.fr/recherche/?**category=10&locations=Paris_75015>, the query is `category=10&locations=Paris_75015`

</Route>

## Mercari

### 商品

<Route author="nczitzk" example="/mercari/category/1" path="/mercari/:type/:id" :paramsDesc="['类型，可选 `category` 指按类别浏览，`brand` 指按品牌浏览，`search` 指搜索关键词浏览', 'id，可在对应分类或品牌页 URL 中找到。若选择 `search` 作为 `type` 则此处填写关键词']">

所有分类参见 [分类清单](https://www.mercari.com/jp/category/)

所有品牌参见 [品牌清单](https://www.mercari.com/jp/brand/)

</Route>

## The Independent

### PS5 stock UK

<Route author="DIYgod" example="/independent/ps5-stock-uk" path="/independent/ps5-stock-uk"/>

## Westore

### 新品

<Route author="xyqfer" example="/westore/new" path="/westore/new"/>

## 大麦网

### 票务更新

<Route author="hoilc" example="/damai/activity/上海/音乐会/全部/柴可夫斯基" path="/damai/activity/:city/:category/:subcategory/:keyword?" :paramsDesc="['城市, 如果不需要限制, 请填入`全部`', '分类, 如果不需要限制, 请填入`全部`', '子分类, 如果不需要限制, 请填入`全部`', '搜索关键字, 置空为不限制']"/>

城市、分类名、子分类名，请参见[大麦网搜索页面](https://search.damai.cn/search.htm)

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
| 全部 | 闪购    | 秒发   | 跨境     | 尾货专场 |
| ---- | ------- | ------ | -------- | -------- |
| home | shangou | miaofa | csborder | weihuo   |

</Route>

## 礼物说

### 礼物说

<Route author="sanmmm" example="/liwushuo/index" path="/liwushuo/index"/>

## 麦当劳

### 麦当劳活动资讯

<Route author="huyyi" example="/mcdonalds/sales+event" path="/mcdonalds/:category" :paramsDesc="['分类名（可用+连接多个分类）']">

| 全部分类  | 社会责任       | 人员品牌 | 产品故事 | 优惠  | 品牌文化 | 活动速报 |
| --------- | -------------- | -------- | -------- | ----- | -------- | -------- |
| news_list | responsibility | brand    | product  | sales | culture  | event    |

</Route>

## 缺书网

### 促销

<Route author="kt286" example="/queshu/sale" path="/queshu/sale"/>

### 单品活动信息

<Route author="kt286" example="/queshu/book/34626813" path="/queshu/book/:bookid" :paramsDesc="['图书ID，可在链接中获取']"/>

## 人民邮电出版社

### 图书列表

<Route author="hoilc" example="/ptpress/book/new" path="/ptpress/book/:type?" :paramsDesc="['排序方式，默认`new`为最新图书，可选`hot`为最热图书']"/>

## 什么值得买

::: tip 提示

网站也提供了部分 RSS: <https://www.smzdm.com/dingyue>

:::

### 关键词

<Route author="DIYgod" example="/smzdm/keyword/女装" path="/smzdm/keyword/:keyword" :paramsDesc="['你想订阅的关键词']" radar="1" rssbud="1"/>

### 排行榜

<Route author="DIYgod" example="/smzdm/ranking/pinlei/11/3" path="/smzdm/ranking/:rank_type/:rank_id/:hour" :paramsDesc="['榜单类型','榜单ID','时间跨度']" radar="1" rssbud="1">

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

### 用户文章

<Route author="xfangbao" example="/smzdm/article/6902738986" path="/smzdm/article/:uid" :paramsDesc="['用户id，网址上直接可以看到']"/>

### 用户爆料

<Route author="nczitzk" example="/smzdm/baoliao/7367111021" path="/smzdm/baoliao/:uid" :paramsDesc="['用户id，网址上直接可以看到']"/>

## 它惠网

### 线报

<Route author="nczitzk" example="/tahui/rptlist" path="/tahui/rptlist"/>

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

## 消费明鉴

### 最新新闻

<Route author="nczitzk" example="/mingjian" path="/mingjian"/>

## 消费者报道

### 要闻

<Route author="EsuRt" example="/ccreports/article" path="/ccreports"/>

## 小米

### 小米众筹

<Route author="DIYgod" example="/mi/crowdfunding" path="/mi/crowdfunding"/>

### 小米有品众筹

<Route author="DIYgod" example="/mi/youpin/crowdfunding" path="/mi/youpin/crowdfunding"/>

### 小米有品每日上新

<Route author="xyqfer DIYgod" example="/mi/youpin/new" path="/mi/youpin/new/:sort?" :paramsDesc="['排序，见下表']">

| 个性化排序 | 按销量从高到低 | 按好评从高到低 | 按上新时间从近到远 |
| ---------- | -------------- | -------------- | ------------------ |
| 0          | 1              | 2              | 3                  |

</Route>

## 宜家 IKEA

### 宜家 IKEA（英国）- 商品上新

<Route author="HenryQW" example="/ikea/uk/new" path="/ikea/uk/new"/>

### 宜家 IKEA（英国）- 促销

<Route author="HenryQW" example="/ikea/uk/offer" path="/ikea/uk/offer"/>

## 优衣库

### Stylingbook

<Route author="LunaXu" example="/uniqlo/stylingbook/women" path="/uniqlo/stylingbook/:category?" :paramsDesc="['类别']">
| 女式  | 男式 | 小孩 | 婴儿 |
| ----- | ---- | ---- | ---- |
| women | men  | kids | baby |
</Route>

## 有赞

### 商品上新

<Route author="LogicJake" example="/youzan/goods/13328377" path="/youzan/goods/:id" :paramsDesc="['商铺id']"/>
