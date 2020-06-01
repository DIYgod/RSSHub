---
pageClass: routes
---

# 新媒体

## 199IT

### 首页更新

<Route author="xfangbao" example="/199it" path="/199it" />
## 36kr

### 资讯

<Route author="nczitzk" example="/36kr/news/latest" path="/36kr/news/:caty" :paramsDesc="['资讯分类']">

| 最新   | 推荐      | 创投    | 中概股 | 汽车   | 科技       | 企服              | 金融    | 生活 | 创新     | 房产        | 职场      | 其他  |
| ------ | --------- | ------- | ------ | ------ | ---------- | ----------------- | ------- | ---- | -------- | ----------- | --------- | ----- |
| latest | recommend | contact | ccs    | travel | technology | enterpriseservice | banking | life | innovate | real_estate | workplace | other |

</Route>

### 快讯

<Route author="hillerliao" example="/36kr/newsflashes" path="/36kr/newsflashes" />

### 用户文章

<Route author="nczitzk" example="/36kr/user/747305693" path="/36kr/user/:uid" :paramsDesc="['用户ID']" />

### 主题文章

<Route author="nczitzk" example="/36kr/motif/452" path="/36kr/motif/:mid" :paramsDesc="['主题ID']" />

### 搜索文章

<Route author="xyqfer kt286" example="/36kr/search/article/ofo" path="/36kr/search/article/:keyword" :paramsDesc="['关键字']" />

## 9To5

### 9To5 分站

<Route author="HenryQW" example="/9to5/mac/aapl" path="/9to5/:subsite/:tag?" :paramsDesc="['分站名字','标签，可在文章标签 URL 中找到']">

支持分站：

| 9To5Mac | 9To5Google | 9To5Toys |
| ------- | ---------- | -------- |
| Mac     | Google     | Toys     |

</Route>

## AEON

<Route author="emdoe" example="/aeon/ideas" path="/aeon/:category" :paramsDesc="['类别']">

支持以文体分类：

| Ideas | Essays | Videos |
| ----- | ------ | ------ |
| ideas | essays | videos |

同样支持以话题分类：

| Culture | Philosophy | Psychology | Society | Science |
| ------- | ---------- | ---------- | ------- | ------- |
| culture | philosophy | psychology | society | science |

</Route>

## Aljazeera 半岛网

### 新闻

<Route author="nczitzk" example="/aljazeera/news" path="/aljazeera/news"/>

## BOF

### 首页

<Route author="kt286" example="/bof/home" path="/bof/home" />

## cfan

### 新闻

<Route author="kt286" example="/cfan/news" path="/cfan/news"/>

## cnBeta

### 最新

<Route author="kt286" example="/cnbeta" path="/cnbeta"/>

## DoNews

### 栏目

<Route author="HenryQW" example="/donews" path="/donews/:column?" :paramsDesc="['栏目代码, 默认为首页.']">

| 首页 | 商业    | 创业     | 互娱 | 科技       | 专栏    |
| ---- | ------- | -------- | ---- | ---------- | ------- |
| (空) | company | business | ent  | technology | idonews |

</Route>

## Engadget 瘾科技

### 中文全文

<Route author="JamesWDGu" example="/engadget-cn" path="/engadget-cn"/>

### 多語言

<Route author="JamesWDGu KeiLongW" example="/engadget/chinese" path="/engadget/:lang" :paramsDesc="['語言']">

| 繁體中文 | 簡體中文 | US | 日文     |
| -------- | -------- | -- | -------- |
| chinese  | cn       | us | japanese |

</Route>

## Grub Street

### Posts

<Route author="loganrockmore" example="/grubstreet" path="/grubstreet" />

## iDownloadBlog

### blog

<Route author="HenryQW" example="/iDownloadBlog" path="/iDownloadBlog/index">

通过提取文章全文，以提供比官方源更佳的阅读体验.

</Route>

## InfoQ 中文

### 推荐

<Route author="brilon" example="/infoq/recommend" path="/infoq/recommend"/>

### 话题

<Route author="brilon" example="/infoq/topic/1" path="/infoq/topic/:id" :paramsDesc="['话题id，可在[InfoQ全部话题](https://www.infoq.cn/topics)页面找到URL里的话题id']" />

## IT 之家

### 分类资讯

<Route author="luyuhuang" example="/ithome/it" path="/ithome/:caty" :paramsDesc="['类别']" radar="1">

| it      | soft     | win10      | iphone      | ipad      | android      | digi     | next     |
| ------- | -------- | ---------- | ----------- | --------- | ------------ | -------- | -------- |
| IT 资讯 | 软件之家 | win10 之家 | iphone 之家 | ipad 之家 | android 之家 | 数码之家 | 智能时代 |

</Route>

### 热榜

<Route author="immmortal" example="/ithome/ranking/1" path="/ithome/ranking/:type" :paramsDesc="['类别']">

| 1             | 2    | 3        | 4    |
| ------------- | ---- | -------- | ---- |
| 24 小时阅读榜 | 周榜 | 7 天热评 | 月榜 |

</Route>

## IT 桔子

### 投融资事件

<Route author="xyqfer" example="/itjuzi/invest" path="/itjuzi/invest"/>

### 并购事件

<Route author="xyqfer" example="/itjuzi/merge" path="/itjuzi/merge"/>

## Krankenkassen 德国新闻社卫健新闻

### dpa news

<Route author="howel52" example="/krankenkassen" path="/krankenkassen"/>

## Letterboxd

### User diary

<Route author="loganrockmore" example="/letterboxd/user/diary/demiadejuyigbe" path="/letterboxd/user/diary/:username" :paramsDesc="['username']" />

### Following diary

<Route author="loganrockmore" example="/letterboxd/user/followingdiary/demiadejuyigbe" path="/letterboxd/user/followingdiary/:username" :paramsDesc="['username']" />

## Matters

### 最新排序

<Route author="xyqfer Cerebrater" example="/matters/latest" path="/matters/latest" radar="1"/>

### 熱門文章

<Route author="Cerebrater" example="/matters/hot" path="/matters/hot" radar="1"/>

### 标签

<Route author="Cerebrater" example="/matters/tags/VGFnOjk3Mg" path="/matters/tags/:tid" :paramsDesc="['標籤 id，可在標籤所在的 URL 找到']" radar="1"/>

### 作者

<Route author="Cerebrater" example="/matters/author/az" path="/matters/author/:uid" :paramsDesc="['作者 id，可在作者主頁的 URL 找到']" radar="1"/>

## MIT 科技评论

### 首页

<Route author="EsuRt" example="/mittrchina/article" path="/mittrchina"/>
## Nautilus

### 话题

<Route author="emdoe" example="/nautilus/topic/Art" path="/nautilus/topic/:tid" :paramsDesc="['话题 id, 可在页面上方 TOPICS 栏目处找到']"/>

## PMCAFF

### 今日推荐 / 精选

<Route author="Jeason0228" example="/pmcaff/list/2" path="/pmcaff/list/:typeid" :paramsDesc="['分类 id,1=今天推荐,2=精选']"/>

### 社区

<Route author="WenryXu" example="/pmcaff/feed/1" path="/pmcaff/feed/:typeid" :paramsDesc="['分类 id']"/>

| 发现 | 待回答 | 最热 | 问答专场 | 投稿 | 深度 | 专栏 |
| ---- | ------ | ---- | -------- | ---- | ---- | ---- |
| 1    | 2      | 3    | 4        | 5    | 6    | 7    |

### 用户文章

<Route author="SChen1024" example="/pmcaff/user/Oak7mqnEQJ" path="/pmcaff/user/:userid" :paramsDesc="['用户 id, 用户界面对应的 URL 最后面的字符']"/>

## Quanta Magazine

### 全部

<Route author="emdoe" example="/quantamagazine/archive" path="/quantamagazine/archive"/>

## Readhub

### 分类

<Route author="WhiteWorld" example="/readhub/category/topic" path="/readhub/category/:category" :paramsDesc="['分类名']">

| 热门话题 | 科技动态 | 开发者资讯 | 区块链快讯 | 每日早报 |
| -------- | -------- | ---------- | ---------- | -------- |
| topic    | news     | technews   | blockchain | daily    |

</Route>

## Simons Foundation

### 文章

<Route author="emdoe" example="/simonsfoundation/articles" path="/simonsfoundation/articles"/>

### 推荐

<Route author="emdoe" example="/simonsfoundation/recommend" path="/simonsfoundation/recommend"/>

## Sixth Tone

### 最新文章

<Route author="kt286" example="/sixthtone/news" path="/sixthtone/news"/>

## The Verge

### The Verge

<Route author="HenryQW" example="/verge" path="/verge">

通过提取文章全文，以提供比官方源更佳的阅读体验.

</Route>

## TOPYS

### 分类

<Route author="kt286" example="/topys/7" path="/topys/:category" :paramsDesc="['分类ID，可在对应页面的 URL 中找到']"/>

## Vulture

<Route author="loganrockmore" example="/vulture/movies" path="/vulture/:type/:excludetags?" :paramsDesc="['The sub-site name', '逗号分隔的标签列表。 如果文章包含这些标签之一，则该文章将从RSS feed中排除']">

Supported sub-sites:

| TV | Movies | Comedy | Music | TV Recaps | Books | Theater | Art | Awards | Video |
| -- | ------ | ------ | ----- | --------- | ----- | ------- | --- | ------ | ----- |
| tv | movies | comedy | music | tvrecaps  | books | theater | art | awards | video |

</Route>

## ZAKER

### source

<Route author="LogicJake" example="/zaker/source/12291" path="/zaker/source/:id" :paramsDesc="['source id，可在 URL 中找到']"/>

### channel

<Route author="kt286" example="/zaker/channel/13" path="/zaker/source/:id" :paramsDesc="['channel id，可在 URL 中找到']"/>

### 精读

<Route author="AlexdanerZe" example="/zaker/focusread" path="/zaker/focusread" />

## 爱范儿 ifanr

### 爱范儿频道

<Route author="HenryQW" example="/ifanr/app" path="/ifanr/:channel?" :paramsDesc="['默认 app，部分频道如下']">

-   频道为单一路径，如 <https://www.ifanr.com/`coolbuy`> 则为 `/ifanr/coolbuy`.
-   频道包含多重路径，如 <https://www.ifanr.com/`category/intelligentcar`> 则替换 `/` 为 `-` `/ifanr/category-intelligentcar`.

| AppSolution | 玩物志  | 董车会                  |
| ----------- | ------- | ----------------------- |
| app         | coolbuy | category-intelligentcar |

</Route>

## 巴比特

### 作者专栏

<Route author="kt286" example="/8btc/45703" path="/8btc/:authorid" :paramsDesc="['作者ID，可在对应专辑页面的 URL 中找到']"/>

### 快讯

<Route author="hillerliao" example="/8btc/news/flash" path="/8btc/news/flash"/>

## 百度知道日报

### 精选

<Route author="1813927768" example="/baidu/daily" path="/baidu/daily"/>

## 白鲸出海

### 首页最新帖子

<Route author="jeffcottLu" example="/baijing" path="/baijing"></Route>

## 坂道系列官网资讯

### 乃木坂 46 新闻

<Route author="crispgm" example="/nogizaka46/news" path="/nogizaka46/news" />

### 欅坂 46 新闻

<Route author="crispgm" example="/keyakizaka46/news" path="/keyakizaka46/news" />

### 欅坂 46 博客

<Route author="nwindz" example="/keyakizaka46/blog" path="/keyakizaka46/blog" />

### 日向坂 46 新闻

<Route author="crispgm" example="/hinatazaka46/news" path="/hinatazaka46/news" />

### 日向坂 46 博客

<Route author="nwindz" example="/hinatazaka46/blog" path="/hinatazaka46/blog" />

## 本地宝

### 焦点资讯

<Route author="nczitzk" example="/bendibao/news/bj" path="/bendibao/news/:city" :paramsDesc="['城市缩写，可在该城市页面的 URL 中找到']">

| 城市名 | 缩写 |
| ------ | ---- |
| 北京   | bj   |
| 上海   | sh   |
| 广州   | gz   |
| 深圳   | sz   |

更多城市请参见 [这里](http://www.bendibao.com/city.htm)

> **香港特别行政区** 和 **澳门特别行政区** 的本地宝城市页面不更新资讯。

</Route>

## 币世界

### 快讯

<Route author="kt286" example="/bishijie/kuaixun" path="/bishijie/kuaixun"/>

## 抽屉新热榜

### 最新

<Route author="xyqfer" example="/chouti/hot" path="/chouti/:subject?" :paramsDesc="['主题名称']">

| 热榜 | 42 区 | 段子  | 图片 | 挨踢 1024 | 你问我答 |
| ---- | ----- | ----- | ---- | --------- | -------- |
| hot  | news  | scoff | pic  | tec       | ask      |

</Route>

### 最热榜 TOP10

<Route author="DIYgod" example="/chouti/top/24" path="/chouti/top/:hour?" :paramsDesc="['排行榜周期，可选 24 72 168 三种，默认 24']" />

## 创业邦

### 作者

<Route author="xyqfer" example="/cyzone/author/1225562" path="/cyzone/author/:id" :paramsDesc="['作者 id']"/>

### 标签

<Route author="LogicJake" example="/cyzone/label/创业邦周报" path="/cyzone/label/:name" :paramsDesc="['标签名称']"/>

## 电商在线

### 电商在线

<Route author="LogicJake" example="/imaijia/category/xls" path="/imaijia/category/:category" :paramsDesc="['类别id，可在 URL 中找到']" />

## 懂球帝

::: tip 提示

-   可以通过头条新闻 + 参数过滤的形式获得早报、专题等内容。

:::

### 新闻

<Route author="HendricksZheng" example="/dongqiudi/top_news/1" path="/dongqiudi/top_news/:id?" :paramsDesc="['类别 id，不填默认头条新闻']" />

| 头条 | 深度 | 闲情 | D 站 | 中超 | 国际 | 英超 | 西甲 | 意甲 | 德甲 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 1    | 55   | 37   | 219  | 56   | 120  | 3    | 5    | 4    | 6    |

### 专题

<Route author="dxmpalb" example="/dongqiudi/special/41" path="/dongqiudi/special/:id" :paramsDesc="['专题 id, 可自行通过 https://www.dongqiudi.com/special/+数字匹配']">

| 新闻大爆炸 | 懂球帝十佳球 | 懂球帝本周 MVP |
| ---------- | ------------ | -------------- |
| 41         | 52           | 53             |

</Route>

### 早报

<Route author="HenryQW" example="/dongqiudi/daily" path="/dongqiudi/daily"/>

::: tip 提示

部分球队和球员可能会有两个 id, 正确 id 应该由 `5000` 开头.

:::

### 足球赛果

<Route author="HenryQW" example="/dongqiudi/result/50001755" path="/dongqiudi/result/:team" :paramsDesc="['球队 id, 可在[懂球帝数据](https://www.dongqiudi.com/data)中找到']"/>

### 球队新闻

<Route author="HenryQW" example="/dongqiudi/team_news/50001755" path="/dongqiudi/team_news/:team" :paramsDesc="['球队 id, 可在[懂球帝数据](https://www.dongqiudi.com/data)中找到']"/>

### 球员新闻

<Route author="HenryQW" example="/dongqiudi/player_news/50000339" path="/dongqiudi/player_news/:id" :paramsDesc="['球员 id, 可在[懂球帝数据](https://www.dongqiudi.com/data)中通过其队伍找到']"/>

## 多知网

### 首页

<Route author="WenryXu" example="/duozhi" path="/duozhi"/>

## 法律白話文運動

### 最新文章

<Route author="emdoe" example="/plainlaw/archives" path="/plainlaw/archives"/>

## 凤凰网

### 大风号

<Route author="Jamch" example="/ifeng/feng/2583/doc" path="/ifeng/feng/:id/:type" :paramsDesc="['对应 id，可在 大风号作者页面 找到','类型，见下表']"/>

| 文章 | 视频  |
| ---- | ----- |
| doc  | video |

## 谷歌新闻

### 新闻

<Route author="zoenglinghou" example="/google/news/要闻/hl=zh-CN&gl=CN&ceid=CN:zh-Hans" path="/google/news/:category/:locale" :paramsDesc="['子分类标题', '地区语言设置，在地址栏 `?` 后，包含 `hl`，`gl`，以及 `ceid` 参数']"/>

## 观察者网 - 中国关怀 全球视野

### 观察者首页

<Route author="Jeason0228" example="/guanchazhe/index/all" path="/guanchazhe/index/:type" :paramsDesc="['新闻汇总:默认home输出头条+3列新闻,others则为滚动新闻+热点+观察者付费,all则包括以上']" />

### 观察者风闻话题

<Route author="occupy5" example="/guanchazhe/topic/113" path="/guanchazhe/topic/:id" :paramsDesc="['话题id， 可在URL中找到']" />

### 个人主页文章

<Route author="Jeason0228" example="/guanchazhe/personalpage/243983" path="/guanchazhe/personalpage/:uid" :paramsDesc="['用户id， 可在URL中找到']" />

## 广告门

### 板块

<Route author="nczitzk" example="/adquan/info" path="/adquan/:type?" :paramsDesc="['分类, 置空为首页']">

| 行业观察 | 案例库   |
| -------- | -------- |
| info     | creative |

</Route>

## 果壳网

### 科学人

<Route author="alphardex" example="/guokr/scientific" path="/guokr/scientific"/>

### 果壳网专栏

<Route author="DHPO hoilc" example="/guokr/calendar" path="/guokr/:channel" :paramsDesc="['专栏类别']">
| 物种日历 | 吃货研究所 | 美丽也是技术活 |
| -------- | ---------- | -------------- |
| calendar | institute  | beauty         |
</Route>

## 好奇心日报

### 标签，栏目，分类

<Route author="WenhuWee emdoe SivaGao HenryQW" example="/qdaily/column/59" path="/qdaily/:type/:id" :paramsDesc="['类型，见下表', '对应 id，可在 URL 找到']" radar="1">

| 标签 | 栏目   | 分类     |
| ---- | ------ | -------- |
| tag  | column | category |

</Route>

## 后续

### Live

<Route author="ciaranchen sanmmm" example="/houxu/live/5" path="/houxu/live/:id" :paramsDesc="['Live ID']" />

### 最新 Live

<Route author="ciaranchen" example="/houxu/lives/new" path="/houxu/lives/:type" :paramsDesc="['类型']">

| 往事进展 | 最新添加 |
| -------- | -------- |
| realtime | new      |

</Route>

### 最新专栏

&lt;Route author="ciaranchen" example="/houxu/events" path="/houxu/
