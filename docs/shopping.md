---
pageClass: routes
---

# 购物

## 0818 团

### 分类

<Route author="TonyRL" example="/0818tuan" path="/0818tuan/:listId?" :paramsDesc="['活动分类，见下表，默认为 `1`']" radar="1">

| 最新线报 | 实测活动 | 优惠券 |
| ---- | ---- | --- |
| 1    | 2    | 3   |

</Route>

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

| 最近一天 | 最近一周 | 所有时间    |
| ---- | ---- | ------- |
| 24h  | week | alltime |

::: tip 提示

参数 `time` 仅在选择 `mostwanted` 作为分类的时候有效。

:::

</Route>

## Bellroy

### 新发布

<Route author="NavePnow" example="/bellroy/new-releases" path="/bellroy/new-releases" />

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

## Gumroad

### 商品

<Route author="Fatpandac" example="/gumroad/afkmaster/Eve10" path="/gumroad/:username/:products" :paramsDesc="['链接中用户名称，可在链接中获取', '商品名称，可在链接中获取']" radar="1" rssbud="1">

如：`https://afkmaster.gumroad.com/l/Eve10` 则为 `/gumroad/afkmaster/Eve10`

</Route>

## hotukdeals

### thread

<Route author="DIYgod" example="/hotukdeals/hot" path="/hotukdeals/:type" :paramsDesc="['should be one of highlights, hot, new, discussed']" ></Route>

### hottest

<Route author="DIYgod" example="/hotukdeals/hottest" path="/hotukdeals/hottest"></Route>

## IKEA 宜家

### 英国 - 商品上新

<Route author="HenryQW" example="/ikea/gb/new" path="/ikea/gb/new" radar="1"/>

### 英国 - 促销

<Route author="HenryQW" example="/ikea/gb/offer" path="/ikea/gb/offer" radar="1"/>

### 中国 - 会员特惠

<Route author="jzhangdev" example="/ikea/cn/family_offers" path="/ikea/cn/family_offers" radar="1"/>

### 中国 - 低价优选

<Route author="jzhangdev" example="/ikea/cn/low_price" path="/ikea/cn/low_price" radar="1"/>

### 中国 - 当季新品推荐

<Route author="jzhangdev" example="/ikea/cn/new" path="/ikea/cn/new" radar="1"/>

## lativ

### 订阅价格

<Route author="Fatpandac" example="/lativ/54220021" path="/lativ/:id" :paramsDesc="['商品id，网址上可以直接拿到']"/>

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

## MyFigureCollection

### 活動

<Route author="nczitzk" example="/myfigurecollection/activity" path="/myfigurecollection/activity/:category?/:language?/:latestAdditions?/:latestEdits?/:latestAlerts?/:latestPictures?" :paramsDesc="['分类，见下表，默认为全部', '语言，见下表，默认为空，即 `en`', '最新加入，默认为开启，即 `1`，可选不开启，即 `0`', '變動，默认为开启，即 `1`，可选不开启，即 `0`', '通知，默认为开启，即 `1`，可选不开启，即 `0`', '圖片，默认为开启，即 `1`，可选不开启，即 `0`']">

分类

| Figures 一覽 | 物品 | 媒体 |
| ---------- | -- | -- |
| 0          | 1  | 2  |

语言

| id | 语言         |
| -- | ---------- |
|    | en         |
| de | Deutsch    |
| es | Español    |
| fi | Suomeksi   |
| fr | Français   |
| it | Italiano   |
| ja | 日本語        |
| nl | Nederlands |
| no | Norsk      |
| pl | Polski     |
| pt | Português  |
| ru | Русский    |
| sv | Svenska    |
| zh | 中文         |

</Route>

### 資料庫

<Route author="nczitzk" example="/myfigurecollection/figure" path="/myfigurecollection/:category?/:language?" :paramsDesc="['分类，默认为 Figures一覽', '语言，见上表，默认为空，即 `en`']">

| Figures 一覽 | 物品    | 媒体    |
| ---------- | ----- | ----- |
| figures    | goods | media |

</Route>

### 圖片

<Route author="nczitzk" example="/myfigurecollection/potd" path="/myfigurecollection/:category?/:language?" :paramsDesc="['分类，默认为每日圖片', '语言，见上表，默认为空，即 `en`']">

| 每日圖片 | 每週圖片 | 每月圖片 |
| ---- | ---- | ---- |
| potd | potw | potm |

</Route>

## ShopBack

### Store

<Route author="nczitzk" example="/shopback/shopee-mart" path="/shopback/:store" :paramsDesc="['店铺名，可在 URL 中找到']"/>

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

## 逛丢

### 国内折扣

<Route author="Fatpandac" example="/guangdiu/k=daily" path="/guangdiu/:query?" :paramsDesc="['链接参数，对应网址问号后的内容']"/>

### 海外折扣

<Route author="Fatpandac" example="/guangdiu/k=daily&c=us" path="/guangdiu/:query?" :paramsDesc="['链接参数，对应网址问号后的内容']"/>

### 一小时风云榜

<Route author="Fatpandac" example="/guangdiu/rank" path="/guangdiu/rank"/>

### 九块九

<Route author="Fatpandac" example="/guangdiu/cheaps/k=clothes" path="/guangdiu/cheaps/:query?" :paramsDesc="['链接参数，对应网址问号后的内容']"/>

## 好好住

### 整屋案例

<Route author="hoilc" example="/haohaozhu/whole-house/日式" path="/haohaozhu/whole-house/:keyword?" :paramsDesc="['分类名或关键字，请使用中文']"/>

### 发现

<Route author="hoilc" example="/haohaozhu/discover/厨房" path="/haohaozhu/discover/:keyword?" :paramsDesc="['分类名或关键字，请使用中文']"/>

## 京东

### 商品价格

<Route author="nczitzk" example="/jd/price/526835" path="/jd/price/:id" :paramsDesc="['商品 id，可在商品详情页 URL 中找到']">

::: tip 提示

如商品 <https://item.jd.com/526835.html> 中的 id 为 `526835`，所以路由为 [`/jd/price/526835`](https://rsshub.app/jd/price/526835)

:::

</Route>

## 京东众筹

### 众筹项目

<Route author="LogicJake" example="/jingdong/zhongchou/all/zcz/zhtj" path="/jingdong/zhongchou/:type/:status/:sort" :paramsDesc="['类型','状态','排序方式']">

类型

| 全部  | 科技 | 美食 | 家电 | 设计 | 娱乐 | 文化 | 公益 | 其他 |
| --- | -- | -- | -- | -- | -- | -- | -- | -- |
| all | kj | ms | jd | sj | yl | wh | gy | qt |

状态

| 全部  | 预热中 | 众筹中 | 众筹成功 | 项目成功 |
| --- | --- | --- | ---- | ---- |
| all | yrz | zcz | zccg | xmcg |

排序方式

| 综合推荐 | 最新上线 | 金额最多 | 支持最多 | 即将结束 |
| ---- | ---- | ---- | ---- | ---- |
| zhtj | zxsx | jezg | zczd | jjjs |

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

| 全部分类      | 社会责任           | 人员品牌  | 产品故事    | 优惠    | 品牌文化    | 活动速报  |
| --------- | -------------- | ----- | ------- | ----- | ------- | ----- |
| news_list | responsibility | brand | product | sales | culture | event |

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

| 好价品类榜  | 好价电商榜     | 海淘 TOP 榜 | 好文排行榜  | 好物排行榜 |
| ------ | --------- | -------- | ------ | ----- |
| pinlei | dianshang | haitao   | haowen | haowu |

-   榜单 ID

好价品类榜

| 全部 | 食品生鲜 | 电脑数码 | 运动户外 | 家用电器 | 白菜 | 服饰鞋包 | 日用百货 |
| -- | ---- | ---- | ---- | ---- | -- | ---- | ---- |
| 11 | 12   | 13   | 14   | 15   | 17 | 74   | 75   |

好价电商榜

| 券活动 | 京东 | 天猫 | 亚马逊中国 | 国美在线 | 苏宁易购 | 网易 | 西集网 | 美国亚马逊 | 日本亚马逊 | ebay |
| --- | -- | -- | ----- | ---- | ---- | -- | --- | ----- | ----- | ---- |
| 24  | 23 | 25 | 26    | 27   | 28   | 29 | 30  | 31    | 32    | 33   |

海淘 TOP 榜

| 全部 | 海外直邮 | 美国榜 | 欧洲榜 | 澳新榜 | 亚洲榜 | 晒物榜 |
| -- | ---- | --- | --- | --- | --- | --- |
| 39 | 34   | 35  | 36  | 37  | 38  | hsw |

好文排行榜

| 原创 | 资讯 |
| -- | -- |
| yc | zx |

好物排行榜

| 新晋榜   | 消费众测 | 新锐品牌 | 好物榜单 |
| ----- | ---- | ---- | ---- |
| hwall | zc   | nb   | hw   |

-   时间跨度

| 3 小时 | 12 小时 | 24 小时 |
| ---- | ----- | ----- |
| 3    | 12    | 24    |

</Route>

### 好文

<Route author="LogicJake" example="/smzdm/haowen/1" path="/smzdm/haowen/:day?" :paramsDesc="['以天为时间跨度，默认为 `all`，其余可以选择 `1`，`7`，`30`，`365`']"/>

### 好文分类

<Route author="LogicJake" example="/smzdm/haowen/fenlei/shenghuodianqi" path="/smzdm/haowen/fenlei/:name/:sort?" :paramsDesc="['分类名，可在 URL 中查看','排序方式，默认为最新']">

| 最新 | 周排行 | 月排行 |
| -- | --- | --- |
| 0  | 7   | 30  |

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

<Route author="xyqfer Fatpandac" example="/taobao/zhongchou/all" path="/taobao/zhongchou/:type?" :paramsDesc="['类型, 默认为 `all` 全部']">

| 全部  | 科技   | 食品          | 动漫  | 设计     | 公益   | 娱乐   | 影音    | 书籍   | 游戏   | 其他    |
| --- | ---- | ----------- | --- | ------ | ---- | ---- | ----- | ---- | ---- | ----- |
| all | tech | agriculture | acg | design | love | tele | music | book | game | other |

</Route>

## 特斯拉中国

### 价格

<Route author="xiaokyo" example="/tesla/price" path="/tesla/price" radar="1"/>

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

<Route author="EsuRt Fatpandac" example="/ccreports/article" path="/ccreports/article"/>

## 小米

### 小米众筹

<Route author="DIYgod" example="/mi/crowdfunding" path="/mi/crowdfunding"/>

## 小米有品

### 小米有品众筹

<Route author="bigfei" example="/xiaomiyoupin/crowdfunding" path="/xiaomiyoupin/crowdfunding"/>

### 小米有品每日上新

<Route author="xyqfer DIYgod bigfei" example="/xiaomiyoupin/latest" path="/xiaomiyoupin/latest" />

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

## 正版中国

### 分类

<Route author="nczitzk" example="/getitfree" path="/getitfree/:category?" :paramsDesc="['分类，见下表，默认为所有类别']">

| 所有类别 | Android | iOS | Mac | PC | UWP | 公告           | 永久免费 | 限时免费     | 限时折扣     |
| ---- | ------- | --- | --- | -- | --- | ------------ | ---- | -------- | -------- |
|      | android | ios | mac | pc | uwp | notification | free | giveaway | discount |

</Route>
