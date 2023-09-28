# 🛍️ Shopping

## 0818 团 {#0818-tuan}

### 分类 {#0818-tuan-fen-lei}

<Route author="TonyRL" example="/0818tuan" path="/0818tuan/:listId?" paramsDesc={['活动分类，见下表，默认为 `1`']} radar="1">

| 最新线报 | 实测活动 | 优惠券 |
| -------- | -------- | ------ |
| 1        | 2        | 3      |

</Route>

## Alter 中国 {#alter-zhong-guo}

### 新闻 {#alter-zhong-guo-xin-wen}

<Route author="luyuhuang" example="/alter-cn/news" path="/alter-cn/news"/>

## AppSales {#appsales}

### Apps {#appsales-apps}

<Route author="nczitzk" example="/appsales/highlights" path="/appsales/:caty?/:time?" paramsDesc={['Category, `highlights` by default', 'Time, `24h` by default']}>

Category

| Highlights | Active Sales | Now Free | Watchlist Charts |
| ---------- | ------------ | -------- | ---------------- |
| highlights | activesales  | nowfree  | mostwanted       |

Time

| the latest 24 hours | the latest week | all the time |
| ------------------- | --------------- | ------------ |
| 24h                 | week            | alltime      |

:::tip

Parameter `time` only works when `mostwanted` is chosen as the category.

:::

</Route>

## Arcteryx {#arcteryx}

### New Arrivals {#arcteryx-new-arrivals}

<Route author="NavePnow" example="/arcteryx/new-arrivals/us/mens" path="/arcteryx/new-arrivals/:country/:gender" paramsDesc={['country', 'gender']}>

Country

| United States | Canada | United Kingdom |
| ------------- | ------ | -------------- |
| us            | ca     | gb             |

gender

| male | female |
| ---- | ------ |
| mens | womens |

:::tip

Parameter `country` can be found within the url of `Arcteryx` website.

:::

</Route>

### Outlet {#arcteryx-outlet}

<Route author="NavePnow" example="/arcteryx/outlet/us/mens" path="/arcteryx/outlet/:country/:gender" paramsDesc={['country', 'gender']}>

Country

| United States | Canada | United Kingdom |
| ------------- | ------ | -------------- |
| us            | ca     | gb             |

gender

| male | female |
| ---- | ------ |
| mens | womens |

:::tip

Parameter `country` can be found within the url of `Arcteryx` website.

:::

</Route>

### Regear New Arrivals {#arcteryx-regear-new-arrivals}

<Route author="NavePnow" example="/arcteryx/regear/new-arrivals" path="/arcteryx/regear/new-arrivals" />

## Bellroy {#bellroy}

### New Releases {#bellroy-new-releases}

<Route author="NavePnow" example="/bellroy/new-releases" path="/bellroy/new-releases" />

## booth.pm {#booth.pm}

### Shop {#booth.pm-shop}

<Route author="KTachibanaM" example="/booth.pm/shop/annn-boc0123" path="/booth.pm/shop/:subdomain" paramsDesc={['Shop subdomain']} />

## Craigslist {#craigslist}

### Shop {#craigslist-shop}

<Route author="lxiange" example="/craigslist/sfbay/sso?query=folding+bike&sort=rel" path="/craigslist/:location/:type?" paramsDesc={['location, Craigslist subdomain, e.g., `sfbay`', 'search type, e.g., `sso`']}/>

> We use RSSHub to implement the searching of Craigslist
> An example of a full original search url:
> <https://sfbay.craigslist.org/search/sso?query=folding+bike&sort=rel>
>
> the `xxx` in `/search/xxx` is the search type, just refer to the original search url.
> The query string is the actual name of query, in this case is folding bike

## Furstar {#furstar}

### 最新售卖角色列表 {#furstar-zui-xin-shou-mai-jue-se-lie-biao}

<Route author="NeverBehave" example="/furstar/characters/cn" path="/furstar/characters/:lang?" paramsDesc={['语言, 留空为jp, 支持cn, en']}/>

### 已经出售的角色列表 {#furstar-yi-jing-chu-shou-de-jue-se-lie-biao}

<Route author="NeverBehave" example="/furstar/archive/cn" path="/furstar/archive/:lang?" paramsDesc={['语言, 留空为jp, 支持cn, en']}/>

### 画师列表 {#furstar-hua-shi-lie-biao}

<Route author="NeverBehave" example="/furstar/artists/cn" path="/furstar/artists/:lang?" paramsDesc={['语言, 留空为jp, 支持cn, en']}/>

## Guiltfree.pl {#guiltfree.pl}

### Onsale {#guiltfree.pl-onsale}

<Route author="nczitzk" example="/guiltfree/onsale" path="/guiltfree/onsale"/>

## Gumroad {#gumroad}

### Products {#gumroad-products}

<Route author="Fatpandac" example="/gumroad/afkmaster/Eve10" path="/gumroad/:username/:products" paramsDesc={['username, can be found in URL', 'products name, can be found in URL']} radar="1" rssbud="1">

`https://afkmaster.gumroad.com/l/Eve10` -> `/gumroad/afkmaster/Eve10`

</Route>

## hotukdeals {#hotukdeals}

### thread {#hotukdeals-thread}

<Route author="DIYgod" example="/hotukdeals/hot" path="/hotukdeals/:type" paramsDesc={['should be one of highlights, hot, new, discussed']}/>

### hottest {#hotukdeals-hottest}

<Route author="DIYgod" example="/hotukdeals/hottest" path="/hotukdeals/hottest"></Route>

## IKEA {#ikea}

### UK - New Product Release {#ikea-uk-new-product-release}

<Route author="HenryQW" example="/ikea/gb/new" path="/ikea/gb/new"/>

### UK - Offers {#ikea-uk-offers}

<Route author="HenryQW" example="/ikea/gb/offer" path="/ikea/gb/offer"/>

### 中国 - 会员特惠 {#ikea-zhong-guo-hui-yuan-te-hui}

<Route author="jzhangdev" example="/ikea/cn/family_offers" path="/ikea/cn/family_offers" radar="1"/>

### 中国 - 低价优选 {#ikea-zhong-guo-di-jia-you-xuan}

<Route author="jzhangdev" example="/ikea/cn/low_price" path="/ikea/cn/low_price" radar="1"/>

### 中国 - 当季新品推荐 {#ikea-zhong-guo-dang-ji-xin-pin-tui-jian}

<Route author="jzhangdev" example="/ikea/cn/new" path="/ikea/cn/new" radar="1"/>

## lativ {#lativ}

### 订阅价格 {#lativ-ding-yue-jia-ge}

<Route author="Fatpandac" example="/lativ/54220021" path="/lativ/:id" paramsDesc={['商品id，网址上可以直接拿到']}/>

## LeBonCoin {#leboncoin}

### Ads {#leboncoin-ads}

Transform any search into a feed.

<Route author="Platane" example="/leboncoin/ad/category=10&locations=Paris_75015" path="/leboncoin/ad/:query" paramsDesc={['search page querystring']}>

For instance, in <https://www.leboncoin.fr/recherche/?category=10&locations=Paris_75015>, the query is **category=10&locations=Paris_75015**

</Route>

## Mercari {#mercari}

### Goods {#mercari-goods}

<Route author="nczitzk" example="/mercari/category/1" path="/mercari/:type/:id" paramsDesc={['`category` as seaching by category, `brand` as searching by brand, `search` as searching for keyword', 'can be found in URL of the category or brand page. If you choose `search` as `type`, then put keyword here']}>

All categories, see [Category list](https://www.mercari.com/jp/category/)

All brands, see [Brand list](https://www.mercari.com/jp/brand/)

</Route>

## MyFigureCollection {#myfigurecollection}

### Activity {#myfigurecollection-activity}

<Route author="nczitzk" example="/myfigurecollection/activity" path="/myfigurecollection/activity/:category?/:language?/:latestAdditions?/:latestEdits?/:latestAlerts?/:latestPictures?" paramsDesc={['Category, Figures by default', 'Language, as above, `en` by default', 'Latest Additions, on as `1` by default, off as `0`', 'Changes, on as `1` by default, off as `0`', 'Alerts, on as `1` by default, off as `0`', 'Pictures, on as `1` by default, off as `0`']}>

Category

| Figures | Goods | Media |
| ------- | ----- | ----- |
| 0       | 1     | 2     |

Language

| Id  | Language   |
| --- | ---------- |
|     | en         |
| de  | Deutsch    |
| es  | Español    |
| fi  | Suomeksi   |
| fr  | Français   |
| it  | Italiano   |
| ja  | 日本語     |
| nl  | Nederlands |
| no  | Norsk      |
| pl  | Polski     |
| pt  | Português  |
| ru  | Русский    |
| sv  | Svenska    |
| zh  | 中文       |

</Route>

### Pictures {#myfigurecollection-pictures}

<Route author="nczitzk" example="/myfigurecollection/potd" path="/myfigurecollection/:category?/:language?" paramsDesc={['Category, Pictures OTD by default', 'Language, as above, `en` by default']}>

| Pictures OTD | Pictures OTW | Pictures OTM |
| ------------ | ------------ | ------------ |
| potd         | potw         | potm         |

</Route>

### 圖片 {#myfigurecollection-tu-pian}

<Route author="nczitzk" example="/myfigurecollection/potd" path="/myfigurecollection/:category?/:language?" paramsDesc={['分类，默认为每日圖片', '语言，见上表，默认为空，即 `en`']}>

| 每日圖片 | 每週圖片 | 每月圖片 |
| -------- | -------- | -------- |
| potd     | potw     | potm     |

</Route>

## Patagonia {#patagonia}

### New Arrivals {#patagonia-new-arrivals}

<Route author="NavePnow" example="/patagonia/new-arrivals/mens" path="/patagonia/new-arrivals/:category" paramsDesc={['category, see below']}>

| Men's | Women's | Kids' & Baby | Packs & Gear |
| ----- | ------- | ------------ | ------------ |
| mens  | womens  | kids         | luggage      |

</Route>

## ShopBack {#shopback}

### Store {#shopback-store}

<Route author="nczitzk" example="/shopback/shopee-mart" path="/shopback/:store" paramsDesc={['Store, can be found in URL']}/>

## Snow Peak {#snow-peak}

### New Arrivals(USA) {#snow-peak-new-arrivals-usa}

<Route author="NavePnow" example="/snowpeak/us/new-arrivals" path="/snowpeak/us/new-arrivals"/>

## The Independent {#the-independent}

### PS5 stock UK {#the-independent-ps5-stock-uk}

<Route author="DIYgod" example="/independent/ps5-stock-uk" path="/independent/ps5-stock-uk"/>

## Westore {#westore}

### 新品 {#westore-xin-pin}

<Route author="xyqfer" example="/westore/new" path="/westore/new"/>

## Zagg {#zagg}

### New Arrivals {#zagg-new-arrivals}

<Route author="NavePnow" example="/zagg/new-arrivals/brand=164&cat=3038,3041" path="/zagg/new-arrivals/:query?" paramsDesc={['query, search page querystring']}/>

For instance, in <https://www.zagg.com/en_us/new-arrivals?brand=164&cat=3038%2C3041>, the query is `brand=164&cat=3038%2C3041`

## 大麦网 {#da-mai-wang}

### 票务更新 {#da-mai-wang-piao-wu-geng-xin}

<Route author="hoilc" example="/damai/activity/上海/音乐会/全部/柴可夫斯基" path="/damai/activity/:city/:category/:subcategory/:keyword?" paramsDesc={['城市, 如果不需要限制, 请填入`全部`', '分类, 如果不需要限制, 请填入`全部`', '子分类, 如果不需要限制, 请填入`全部`', '搜索关键字, 置空为不限制']}/>

城市、分类名、子分类名，请参见[大麦网搜索页面](https://search.damai.cn/search.htm)

## 多抓鱼 {#duo-zhua-yu}

### 搜索结果 {#duo-zhua-yu-sou-suo-jie-guo}

<Route author="fengkx" example="/duozhuayu/search/JavaScript" path="/duozhuayu/search/:wd" paramsDesc={['搜索关键词']} radar="1"/>

## 逛丢 {#guang-diu}

### 国内折扣 {#guang-diu-guo-nei-zhe-kou}

<Route author="Fatpandac" example="/guangdiu/k=daily" path="/guangdiu/:query?" paramsDesc={['链接参数，对应网址问号后的内容']}/>

### 海外折扣 {#guang-diu-hai-wai-zhe-kou}

<Route author="Fatpandac" example="/guangdiu/k=daily&c=us" path="/guangdiu/:query?" paramsDesc={['链接参数，对应网址问号后的内容']}/>

### 一小时风云榜 {#guang-diu-yi-xiao-shi-feng-yun-bang}

<Route author="Fatpandac" example="/guangdiu/rank" path="/guangdiu/rank"/>

### 九块九 {#guang-diu-jiu-kuai-jiu}

<Route author="Fatpandac" example="/guangdiu/cheaps/k=clothes" path="/guangdiu/cheaps/:query?" paramsDesc={['链接参数，对应网址问号后的内容']}/>

## 好好住 {#hao-hao-zhu}

### 整屋案例 {#hao-hao-zhu-zheng-wu-an-li}

<Route author="hoilc" example="/haohaozhu/whole-house/日式" path="/haohaozhu/whole-house/:keyword?" paramsDesc={['分类名或关键字，请使用中文']}/>

### 发现 {#hao-hao-zhu-fa-xian}

<Route author="hoilc" example="/haohaozhu/discover/厨房" path="/haohaozhu/discover/:keyword?" paramsDesc={['分类名或关键字，请使用中文']}/>

## 京东 {#jing-dong}

### 商品价格 {#jing-dong-shang-pin-jia-ge}

<Route author="nczitzk" example="/jd/price/526835" path="/jd/price/:id" paramsDesc={['商品 id，可在商品详情页 URL 中找到']}>

:::tip

如商品 <https://item.jd.com/526835.html> 中的 id 为 `526835`，所以路由为 [`/jd/price/526835`](https://rsshub.app/jd/price/526835)

:::

</Route>

## 京东众筹 {#jing-dong-zhong-chou}

### 众筹项目 {#jing-dong-zhong-chou-zhong-chou-xiang-mu}

<Route author="LogicJake" example="/jingdong/zhongchou/all/zcz/zhtj" path="/jingdong/zhongchou/:type/:status/:sort" paramsDesc={['类型','状态','排序方式']}>

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

## 酒云网 {#jiu-yun-wang}

### 最新商品 {#jiu-yun-wang-zui-xin-shang-pin}

<Route author="MeXunco" example="/wineyun/home" path="/wineyun/:category" paramsDesc={['分类名']} >

| 全部 | 闪购    | 秒发   | 跨境     | 尾货专场 |
| ---- | ------- | ------ | -------- | -------- |
| home | shangou | miaofa | csborder | weihuo   |

</Route>

## 礼物说 {#li-wu-shuo}

### 礼物说 {#li-wu-shuo-li-wu-shuo}

<Route author="sanmmm" example="/liwushuo/index" path="/liwushuo/index"/>

## 麦当劳 {#mai-dang-lao}

### 麦当劳活动资讯 {#mai-dang-lao-mai-dang-lao-huo-dong-zi-xun}

<Route author="huyyi" example="/mcdonalds/sales+event" path="/mcdonalds/:category" paramsDesc={['分类名（可用+连接多个分类）']}>

| 全部分类  | 社会责任       | 人员品牌 | 产品故事 | 优惠  | 品牌文化 | 活动速报 |
| --------- | -------------- | -------- | -------- | ----- | -------- | -------- |
| news_list | responsibility | brand    | product  | sales | culture  | event    |

</Route>

## 缺书网 {#que-shu-wang}

### 促销 {#que-shu-wang-cu-xiao}

<Route author="kt286" example="/queshu/sale" path="/queshu/sale"/>

### 单品活动信息 {#que-shu-wang-dan-pin-huo-dong-xin-xi}

<Route author="kt286" example="/queshu/book/34626813" path="/queshu/book/:bookid" paramsDesc={['图书ID，可在链接中获取']}/>

## 人民邮电出版社 {#ren-min-you-dian-chu-ban-she}

### 图书列表 {#ren-min-you-dian-chu-ban-she-tu-shu-lie-biao}

<Route author="hoilc" example="/ptpress/book/new" path="/ptpress/book/:type?" paramsDesc={['排序方式，默认`new`为最新图书，可选`hot`为最热图书']}/>

## 上海文化广场 {#shang-hai-wen-hua-guang-chang}

### 节目列表 {#shang-hai-wen-hua-guang-chang-jie-mu-lie-biao}

<Route author="fuzy112" example="/shcstheatre/programs" path="/shcstheatre/programs"/>

## 什么值得买 {#shen-me-zhi-de-mai}

:::tip

网站也提供了部分 RSS: <https://www.smzdm.com/dingyue>

:::

### 关键词 {#shen-me-zhi-de-mai-guan-jian-ci}

<Route author="DIYgod" example="/smzdm/keyword/女装" path="/smzdm/keyword/:keyword" paramsDesc={['你想订阅的关键词']} radar="1" rssbud="1"/>

### 排行榜 {#shen-me-zhi-de-mai-pai-hang-bang}

<Route author="DIYgod" example="/smzdm/ranking/pinlei/11/3" path="/smzdm/ranking/:rank_type/:rank_id/:hour" paramsDesc={['榜单类型','榜单ID','时间跨度']} radar="1" rssbud="1">

-   榜单类型

| 好价品类榜 | 好价电商榜 | 海淘 TOP 榜 | 好文排行榜 | 好物排行榜 |
| ---------- | ---------- | ----------- | ---------- | ---------- |
| pinlei     | dianshang  | haitao      | haowen     | haowu      |

-   榜单 ID

好价品类榜

| 全部 | 食品生鲜 | 电脑数码 | 运动户外 | 家用电器 | 白菜 | 服饰鞋包 | 日用百货 |
| ---- | -------- | -------- | -------- | -------- | ---- | -------- | -------- |
| 11   | 12       | 13       | 14       | 15       | 17   | 74       | 75       |

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

-   时间跨度

| 3 小时 | 12 小时 | 24 小时 |
| ------ | ------- | ------- |
| 3      | 12      | 24      |

</Route>

### 好文 {#shen-me-zhi-de-mai-hao-wen}

<Route author="LogicJake" example="/smzdm/haowen/1" path="/smzdm/haowen/:day?" paramsDesc={['以天为时间跨度，默认为 `all`，其余可以选择 `1`，`7`，`30`，`365`']}/>

### 好文分类 {#shen-me-zhi-de-mai-hao-wen-fen-lei}

<Route author="LogicJake" example="/smzdm/haowen/fenlei/shenghuodianqi" path="/smzdm/haowen/fenlei/:name/:sort?" paramsDesc={['分类名，可在 URL 中查看','排序方式，默认为最新']}>

| 最新 | 周排行 | 月排行 |
| ---- | ------ | ------ |
| 0    | 7      | 30     |

</Route>

### 用户文章 {#shen-me-zhi-de-mai-yong-hu-wen-zhang}

<Route author="xfangbao" example="/smzdm/article/6902738986" path="/smzdm/article/:uid" paramsDesc={['用户id，网址上直接可以看到']}/>

### 用户爆料 {#shen-me-zhi-de-mai-yong-hu-bao-liao}

<Route author="nczitzk" example="/smzdm/baoliao/7367111021" path="/smzdm/baoliao/:uid" paramsDesc={['用户id，网址上直接可以看到']}/>

## 它惠网 {#ta-hui-wang}

### 线报 {#ta-hui-wang-xian-bao}

<Route author="nczitzk" example="/tahui/rptlist" path="/tahui/rptlist"/>

## 淘宝众筹 {#tao-bao-zhong-chou}

### 众筹项目 {#tao-bao-zhong-chou-zhong-chou-xiang-mu}

<Route author="xyqfer Fatpandac" example="/taobao/zhongchou/all" path="/taobao/zhongchou/:type?" paramsDesc={['类型, 默认为 `all` 全部']}>

| 全部 | 科技 | 食品        | 动漫 | 设计   | 公益 | 娱乐 | 影音  | 书籍 | 游戏 | 其他  |
| ---- | ---- | ----------- | ---- | ------ | ---- | ---- | ----- | ---- | ---- | ----- |
| all  | tech | agriculture | acg  | design | love | tele | music | book | game | other |

</Route>

## 特斯拉中国 {#te-si-la-zhong-guo}

### 价格 {#te-si-la-zhong-guo-jia-ge}

<Route author="xiaokyo" example="/tesla/price" path="/tesla/price" radar="1"/>

### 权益中心 {#te-si-la-zhong-guo-quan-yi-zhong-xin}

<Route author="simonsmh nczitzk" example="/tesla/cx/生活方式/北京" path="/tesla/cx/:category?/:city?" paramsDesc={['分类，见下表，默认为空，即全部', '城市，默认为空，即全国']} radar="1" rssbud="1">

| 充电免停 | 酒店 | 美食 | 生活方式 |
| -------- | ---- | ---- | -------- |

:::tip

分类为 **充电免停** 时，城市参数不起作用

:::

<details>
  <summary>可选城市</summary>

  | 成都 | 深圳 | 洛阳 | 北京 | 南京 | 绍兴 |
  | ---- | ---- | ---- | ---- | ---- | ---- |

  | 西安 | 上海 | 阿坝藏族羌族自治州 | 重庆 | 郑州 | 天津 |
  | ---- | ---- | ------------------ | ---- | ---- | ---- |

  | 晋中 | 三亚 | 湖州 | 苏州 | 扬州 | 秦皇岛 |
  | ---- | ---- | ---- | ---- | ---- | ------ |

  | 长沙 | 武汉 | 安阳 | 温州 | 瑞安 | 石家庄 |
  | ---- | ---- | ---- | ---- | ---- | ------ |

  | 佛山 | 广州 | 杭州 | 烟台 | 沧州 | 张家港 |
  | ---- | ---- | ---- | ---- | ---- | ------ |

  | 金华 | 临沧 | 大理 | 南昌 | 贵阳 | 信阳 |
  | ---- | ---- | ---- | ---- | ---- | ---- |

  | 张家口 | 铜仁 | 沈阳 | 合肥 | 黔东 | 高邮 |
  | ------ | ---- | ---- | ---- | ---- | ---- |

  | 三河 | 安顺 | 莆田 | 阳江 | 南宁 | 台州 |
  | ---- | ---- | ---- | ---- | ---- | ---- |
  
  | 余姚 | 淄博 | 三明 | 中山 | 宁波 | 厦门 |
  | ---- | ---- | ---- | ---- | ---- | ---- |

  | 永康 | 慈溪 | 台山 | 福州 | 无锡 | 宜昌 |
  | ---- | ---- | ---- | ---- | ---- | ---- |

  | 泉州 | 肇庆 | 太仓 | 珠海 | 邢台 | 衡水 |
  | ---- | ---- | ---- | ---- | ---- | ---- |

  | 温岭 | 宜兴 | 东莞 | 威海 | 南通 | 舟山 |
  | ---- | ---- | ---- | ---- | ---- | ---- |

  | 都匀 | 长治 | 江阴 | 云浮 | 常州 | 唐山 |
  | ---- | ---- | ---- | ---- | ---- | ---- |

  | 平湖 | 商丘 | 保定 | 泰州 | 青岛 | 龙口 |
  | ---- | ---- | ---- | ---- | ---- | ---- |

  | 泰安 | 岳阳 | 惠州 | 徐州 | 哈尔滨 | 潍坊 |
  | ---- | ---- | ---- | ---- | ------ | ---- |

  | 大同 | 嘉兴 | 毕节 | 临汾 | 江门 | 诸暨 |
  | ---- | ---- | ---- | ---- | ---- | ---- |

  | 儋州 | 衢州 | 大连 | 昆山 | 靖江 | 常熟 |
  | ---- | ---- | ---- | ---- | ---- | ---- |

  | 罗定 | 丽江 | 晋江 | 乐清 | 茂名 | 福清 |
  | ---- | ---- | ---- | ---- | ---- | ---- |

  | 廊坊 | 兰溪 | 汕尾 | 滨州 | 昆明 | 玉环 |
  | ---- | ---- | ---- | ---- | ---- | ---- |

  | 绵阳 | 漳州 | 德州 | 聊城 | 龙岩 | 临沂 |
  | ---- | ---- | ---- | ---- | ---- | ---- |

  | 新沂 | 桐乡 | 迪庆藏族自治州 | 汕头 | 潮州 | 驻马店 |
  | ---- | ---- | -------------- | ---- | ---- | ------ |

  | 曲阜 | 郴州 | 济源 | 兴义 |
  | ---- | ---- | ---- | ---- |

</details>

</Route>

## 玩物志 {#wan-wu-zhi}

### 最新 {#wan-wu-zhi-zui-xin}

<Route author="xyqfer" example="/coolbuy/newest" path="/coolbuy/newest"/>

## 微店 {#wei-dian}

### 商品上新 {#wei-dian-shang-pin-shang-xin}

<Route author="LogicJake" example="/weidian/goods/431508863" path="/weidian/goods/:id" paramsDesc={['商铺 id']}/>

## 消费明鉴 {#xiao-fei-ming-jian}

### 最新新闻 {#xiao-fei-ming-jian-zui-xin-xin-wen}

<Route author="nczitzk" example="/mingjian" path="/mingjian"/>

## 消费者报道 {#xiao-fei-zhe-bao-dao}

### 要闻 {#xiao-fei-zhe-bao-dao-yao-wen}

<Route author="EsuRt Fatpandac" example="/ccreports/article" path="/ccreports/article"/>

## 小米 {#xiao-mi}

### 小米众筹 {#xiao-mi-xiao-mi-zhong-chou}

<Route author="DIYgod" example="/mi/crowdfunding" path="/mi/crowdfunding"/>

## 小米有品 {#xiao-mi-you-pin}

### 小米有品众筹 {#xiao-mi-you-pin-xiao-mi-you-pin-zhong-chou}

<Route author="bigfei" example="/xiaomiyoupin/crowdfunding" path="/xiaomiyoupin/crowdfunding"/>

### 小米有品每日上新 {#xiao-mi-you-pin-xiao-mi-you-pin-mei-ri-shang-xin}

<Route author="xyqfer DIYgod bigfei" example="/xiaomiyoupin/latest" path="/xiaomiyoupin/latest" />

## 优衣库 {#you-yi-ku}

### Stylingbook {#you-yi-ku-stylingbook}

<Route author="LunaXu" example="/uniqlo/stylingbook/women" path="/uniqlo/stylingbook/:category?" paramsDesc={['类别']}>

| 女式  | 男式 | 小孩 | 婴儿 |
| ----- | ---- | ---- | ---- |
| women | men  | kids | baby |

</Route>

## 有赞 {#you-zan}

### 商品上新 {#you-zan-shang-pin-shang-xin}

<Route author="LogicJake" example="/youzan/goods/13328377" path="/youzan/goods/:id" paramsDesc={['商铺id']}/>

## 正版中国 {#zheng-ban-zhong-guo}

### 分类 {#zheng-ban-zhong-guo-fen-lei}

<Route author="nczitzk" example="/getitfree" path="/getitfree/:category?" paramsDesc={['分类，见下表，默认为所有类别']}>

| 所有类别 | Android | iOS | Mac | PC | UWP | 公告         | 永久免费 | 限时免费 | 限时折扣 |
| -------- | ------- | --- | --- | -- | --- | ------------ | -------- | -------- | -------- |
|          | android | ios | mac | pc | uwp | notification | free     | giveaway | discount |

</Route>

