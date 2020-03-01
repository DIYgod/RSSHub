---
pageClass: routes
---

# 新媒体

## 36kr

### 快讯

<Route author="hillerliao" example="/36kr/newsflashes" path="/36kr/newsflashes" />

### 搜索文章

<Route author="xyqfer kt286" example="/36kr/search/article/ofo" path="/36kr/search/article/:keyword" :paramsDesc="['关键字']" />

## 9To5

### 9To5 分站

<Route author="HenryQW" example="/9to5/mac/aapl" path="/9to5/:subsite/:tag?" :paramsDesc="['分站名字','标签，可在文章标签 URL 中找到']">

支持分站：
| 9To5Mac | 9To5Google | 9To5Toys |
| --- | ------ | ---- |
| Mac | Google | Toys |

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

| 繁體中文 | 簡體中文 | US  | 日文     |
| -------- | -------- | --- | -------- |
| chinese  | cn       | us  | japanese |

</Route>

## iDownloadBlog

### blog

<Route author="HenryQW" example="/iDownloadBlog" path="/iDownloadBlog/index">

通过提取文章全文, 以提供比官方源更佳的阅读体验.

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

## IT 桔子

### 投融资事件

<Route author="xyqfer" example="/itjuzi/invest" path="/itjuzi/invest"/>

### 并购事件

<Route author="xyqfer" example="/itjuzi/merge" path="/itjuzi/merge"/>

## Letterboxd

### User diary

<Route author="loganrockmore" example="/letterboxd/user/diary/demiadejuyigbe" path="/letterboxd/user/diary/:username" :paramsDesc="['username']" />

### Following diary

<Route author="loganrockmore" example="/letterboxd/user/followingdiary/demiadejuyigbe" path="/letterboxd/user/followingdiary/:username" :paramsDesc="['username']" />

## Matters

### 最新排序

<Route author="xyqfer Cerebrater" example="/matters/latest" path="/matters/latest" />

### 熱門文章

<Route author="Cerebrater" example="/matters/hot" path="/matters/hot" />

### 标签

<Route author="Cerebrater" example="/matters/tags/VGFnOjk3Mg" path="/matters/tags/:tid" :paramsDesc="['標籤 id，可在標籤所在的 URL 找到']"/>

### 作者

<Route author="Cerebrater" example="/matters/author/az" path="/matters/author/:uid" :paramsDesc="['作者 id，可在作者主頁的 URL 找到']"/>

## Nautilus

### 话题

<Route author="emdoe" example="/nautilus/topic/Art" path="/nautilus/topic/:tid" :paramsDesc="['话题 id, 可在页面上方 TOPICS 栏目处找到']"/>

## PMCAFF

### 今日推荐/精选

<Route author="Jeason0228" example="/pmcaff/list/2" path="/pmcaff/list/:typeid" :paramsDesc="['分类 id,1=今天推荐,2=精选']"/>

### 社区

<Route author="WenryXu" example="/pmcaff/feed/1" path="/pmcaff/feed/:typeid" :paramsDesc="['分类 id']"/>

| 发现 | 待回答 | 最热 | 问答专场 | 投稿 | 深度 | 专栏 |
| ---- | ------ | ---- | -------- | ---- | ---- | ---- |
| 1    | 2      | 3    | 4        | 5    | 6    | 7    |

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

通过提取文章全文, 以提供比官方源更佳的阅读体验.

</Route>

## TOPYS

### 分类

<Route author="kt286" example="/topys/7" path="/topys/:category" :paramsDesc="['分类ID，可在对应页面的 URL 中找到']"/>

## Vulture

<Route author="loganrockmore" example="/vulture/movies" path="/vulture/:type" :paramsDesc="['The sub-site name']">

Supported sub-sites：
| TV | Movies | Comedy | Music | TV Recaps | Books | Theater | Art | Awards | Video |
| ----- | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| tv | movies | comedy | music | tvrecaps | books | theater | art | awards | video |

</Route>

## ZAKER

### source

<Route author="LogicJake" example="/zaker/source/12291" path="/zaker/source/:id" :paramsDesc="['source id，可在 URL 中找到']"/>

### channel

<Route author="kt286" example="/zaker/channel/13" path="/zaker/source/:id" :paramsDesc="['channel id，可在 URL 中找到']"/>

## 爱范儿 ifanr

### 爱范儿频道

<Route author="HenryQW" example="/ifanr/app" path="/ifanr/:channel?" :paramsDesc="['默认 app，部分频道如下']">

-   频道为单一路径, 如 https://www.ifanr.com/`coolbuy` 则为 `/ifanr/coolbuy`.
-   频道包含多重路径, 如 https://www.ifanr.com/`category/intelligentcar` 则替换 `/` 为 `-` `/ifanr/category-intelligentcar`.

| AppSolution | 玩物志  | 董车会                  |
| ----------- | ------- | ----------------------- |
| app         | coolbuy | category-intelligentcar |

</Route>

## 巴比特

### 作者专栏

<Route author="kt286" example="/8btc/45703" path="/8btc/:authorid" :paramsDesc="['作者ID，可在对应专辑页面的 URL 中找到']"/>

### 快讯

<Route author="hillerliao" example="/8btc/news/flash" path="/8btc/news/flash"/>

## 白鲸出海

### 首页最新帖子

<Route author="jeffcottLu" example="/baijing" path="/baijing"></Route>

## 坂道系列官网新闻

### 乃木坂 46

<Route author="crispgm" example="/nogizaka46/news" path="/nogizaka46/news" />

### 欅坂 46

<Route author="crispgm" example="/keyakizaka46/news" path="/keyakizaka46/news" />

### 日向坂 46

<Route author="crispgm" example="/hinatazaka46/news" path="/hinatazaka46/news" />

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

-   可以通过头条新闻+参数过滤的形式获得早报、专题等内容。

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

## 观察者网-中国关怀 全球视野

### 观察者首页

<Route author="Jeason0228" example="/guanchazhe/index/all" path="/guanchazhe/index/:type" :paramsDesc="['新闻汇总:默认home输出头条+3列新闻,others则为滚动新闻+热点+观察者付费,all则包括以上']" />

### 观察者风闻话题

<Route author="occupy5" example="/guanchazhe/topic/113" path="/guanchazhe/topic/:id" :paramsDesc="['话题id， 可在URL中找到']" />

### 个人主页文章

<Route author="Jeason0228" example="/guanchazhe/personalpage/243983" path="/guanchazhe/personalpage/:uid" :paramsDesc="['用户id， 可在URL中找到']" />

## 果壳网

### 科学人

<Route author="alphardex" example="/guokr/scientific" path="/guokr/scientific"/>

### 果壳网专栏

<Route author="DHPO" example="/guokr/calendar" path="/guokr/:category" :paramsDesc="['专栏类别']">
| 物种日历 | 吃货研究所 | 美丽也是技术活 |
| ------- | ---------| ------------ |
| calendar | institute | beauty |
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

<Route author="ciaranchen" example="/houxu/events" path="/houxu/events"/>

## 虎嗅

### 首页资讯

<Route author="HenryQW" example="/huxiu/article" path="/huxiu/article" />

### 标签

<Route author="xyqfer HenryQW" example="/huxiu/tag/291" path="/huxiu/tag/:id" :paramsDesc="['标签 id']" />

### 搜索

<Route author="xyqfer HenryQW" example="/huxiu/search/%E8%99%8E%E5%97%85%E6%97%A9%E6%8A%A5" path="/huxiu/search/:keyword" :paramsDesc="['关键字']" />

### 作者

<Route author="HenryQW" example="/huxiu/author/29318" path="/huxiu/author/:id" :paramsDesc="['用户 id']" />

## 汇通网

### 7x24 小时快讯

<Route author="occupy5" example="/fx678/kx" path="/fx678/kx" />

## 机核网

### 分类

<Route author="MoguCloud" example="/gcores/category/news" path="/gcores/category/:category" :paramsDesc="['分类名']">

| 资讯 | 视频   | 电台   | 文章     |
| ---- | ------ | ------ | -------- |
| news | videos | radios | articles |

</Route>

## 今日热榜

### 榜单

<Route author="LogicJake"  example="/tophub/Om4ejxvxEN" path="/tophub/:id" :paramsDesc="['榜单id，可在 URL 中找到']"/>

## 今日头条

### 关键词

<Route author="uni-zheng" example="/jinritoutiao/keyword/AI" path="/jinritoutiao/keyword/:keyword" :paramsDesc="['关键词']"/>

## 鲸跃汽车

### 首页

<Route author="LogicJake" example="/whalegogo/home" path="/whalegogo/home"/>

### 其他栏目

<Route author="Jeason0228" example="/whalegogo/portal/2" path="/whalegogo/portal/:type_id/:tagid?/" :paramsDesc="['type_id,栏目id','tagid,标签id']">

| 快讯                 | 文章                 | 活动                 | 评测                 | 视频               | 访谈               |
| -------------------- | -------------------- | -------------------- | -------------------- | ------------------ | ------------------ |
| type_id=2,tagid 不填 | type_id=1,tagid 不填 | type_id=7,tagid 不填 | type_id=8,tagid 不填 | type_id=1,tagid=70 | type_id=1,tagid=73 |

</Route>

## 巨潮资讯

### 公司公告

<Route author="LogicJake" example="/cninfo/stock_announcement/000410" path="/cninfo/stock_announcement/:code" :paramsDesc="['股票代码']"/>

### 公司公告-A 股港股

<Route author="LogicJake hillerliao" example="/cninfo/announcement/002024/gqjl" path="/cninfo/announcement/:code/:category?" :paramsDesc="['股票代码, 若不指定公司则填 all', '公告分类，对A股有效如 gqjl 表示 股权激励 分类']">

| 年报 | 半年报 | 一季报 | 三季报 | 业绩预告 | 权益分派 | 董事会 | 监事会 | 股东大会 | 日常经营 | 公司治理 | 中介报告 | 首发 | 增发 | 股权激励 | 配股 | 解禁 | 债券 | 其他融资 | 股权变动 | 补充更正 | 澄清致歉 | 风险提示 | 特别处理和退市 |
| ---- | ------ | ------ | ------ | -------- | -------- | ------ | ------ | -------- | -------- | -------- | -------- | ---- | ---- | -------- | ---- | ---- | ---- | -------- | -------- | -------- | -------- | -------- | -------------- |
| ndbg | bndbg  | yjdbg  | sjdbg  | yjygjxz  | qyfpxzcs | dshgg  | jshgg  | gddh     | rcjy     | gszl     | zj       | sf   | zf   | gqjl     | pg   | jj   | zq   | qtrz     | gqbd     | bcgz     | cqdq     | fxts     | tbclts         |

</Route>

### 基金公告

<Route author="hillerliao" example="/cninfo/fund_announcement/159977/基金合同" path="/cninfo/fund_announcement/:code/:searchkey" :paramsDesc="['基金代码, 若不指定则填 all', '过滤词，若不指定则填all']"/>

## 决胜网

### 最新资讯

<Route author="WenryXu" example="/juesheng" path="/juesheng"/>

## 快科技（原驱动之家）

### 最新新闻

<Route author="kt286" example="/kkj/news" path="/kkj/news"/>

## 快知

### 话题

<Route author="hoilc" example="/kzfeed/topic/KklZRd9a04OgA" path="/kzfeed/topic/:id" :paramsDesc="['话题ID, 可以从话题URL中获得']"/>

## 老司机

### 首页

<Route author="xyqfer" example="/laosiji/feed" path="/laosiji/feed"/>
### 24小时热门

<Route author="xyqfer" example="/laosiji/hot" path="/laosiji/hot"/>
### 节目

<Route author="xyqfer" example="/laosiji/hotshow/128" path="/laosiji/hotshow/:id" :paramsDesc="['节目 id']"/>

## 镁客网 im2maker

### 镁客网频道

<Route author="jin12180000" example="/im2maker/" path="/im2maker/:channel?" :paramsDesc="['默认不填为 最新文章 ，频道如下']">

| 最新文章 | 行业快讯 | 行业观察 | 镁客请讲 | 硬科技 100 人 | 投融界   | 万象       |
| -------- | -------- | -------- | -------- | ------------- | -------- | ---------- |
| 默认空   | fresh    | industry | talk     | intech        | investor | everything |

</Route>

## 摩根大通研究所

### 新闻

<Route author="howel52" example="/jpmorganchase" path="/jpmorganchase"/>

## 派代

### 首页

<Route author="qiwihui" example="/paidai" path="/paidao" />

### 论坛

<Route author="qiwihui" example="/paidai/bbs" path="/paidao/bbs" />

### 商道

<Route author="qiwihui" example="/paidai/news" path="/paidao/news" />

## 品途商业评论

### 文章

<Route author="DIYgod" example="/pintu360/0" path="/pintu360/:type?" :paramsDesc="['类型, 默认为 `0` 推荐']">

类型

| 推荐 | 零售前沿 | 智能科技 | 泛文娱 | 教育 | 大健康 | 新消费 | 创业投资 |
| ---- | -------- | -------- | ------ | ---- | ------ | ------ | -------- |
| 0    | 7        | 10       | 9      | 98   | 70     | 8      | 72       |

</Route>

## 品玩

### 实时要闻

<Route author="sanmmm" example="/pingwest/status" path="/pingwest/status"/>

### 话题动态

<Route author="sanmmm" path="/pingwest/tag/:tag/:type" example="/pingwest/tag/ChinaJoy/1" :paramsDesc="['话题名或话题id, 可从话题页url中得到', '内容类型']">

内容类型

| 最新 | 最热 |
| ---- | ---- |
| 1    | 2    |

</Route>

### 用户

<Route author="sanmmm" path="/pingwest/user/:uid/:type?" example="/pingwest/user/7781550877/article" :paramsDesc="['用户id, 可从用户主页中得到', '内容类型, 默认为`article`']">

内容类型

| 文章    | 动态  |
| ------- | ----- |
| article | state |

</Route>

## 趣头条

### 分类

<Route author="alphardex LogicJake" example="/qutoutiao/category/1" path="/qutoutiao/category/:cid" :paramsDesc="['分类 id']">

| 推荐 | 热点 | 娱乐 | 健康 | 养生 | 励志 | 科技 | ... |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | --- |
| 255  | 1    | 6    | 42   | 5    | 4    | 7    | ... |

更多的 cid 可通过访问[官网](http://home.qutoutiao.net)切换分类，观察 url 获得。

</Route>

## 人人都是产品经理

### 热门文章

<Route author="WenryXu" example="/woshipm/popular" path="/woshipm/popular"/>

### 天天问

<Route author="WenryXu" example="/woshipm/wen" path="/woshipm/wen"/>

### 用户收藏

<Route author="LogicJake" example="/woshipm/bookmarks/324696" path="/woshipm/bookmarks/:id" :paramsDesc="['用户 id']"/>

### 用户文章

<Route author="LogicJake" example="/woshipm/user_article/324696" path="/woshipm/user_article/:id" :paramsDesc="['用户 id']"/>

## 少数派 sspai

### 最新上架付费专栏

<Route author="HenryQW" example="/sspai/series" path="/sspai/series">

> 少数派专栏需要付费订阅, RSS 仅做更新提醒, 不含付费内容.

</Route>

### Shortcuts Gallery

<Route author="Andiedie" example="/sspai/shortcuts" path="/sspai/shortcuts" />

### Matrix

<Route author="feigaoxyz" example="/sspai/matrix" path="/sspai/matrix" />

### 专栏

<Route author="LogicJake" example="/sspai/column/104" path="/sspai/column/:id"  :paramsDesc="['专栏 id']"/>

### 作者

<Route author="SunShinenny hoilc" example="/sspai/author/796518" path="/sspai/author/:id"  :paramsDesc="['作者 slug 或 id，slug 可在作者主页URL中找到，id 不易查找，仅作兼容']"/>

### 作者动态

<Route author="umm233" example="/sspai/activity/d0u947vr" path="/sspai/activity/:slug"  :paramsDesc="['作者 slug，可在作者主页URL中找到']"/>

### 专题

<Route author="SunShinenny" example="/sspai/topics" path="/sspai/topics">

此为专题广场更新提示=>集合型而非单篇文章.与下方"专题内文章更新"存在明显区别!

</Route>

### 专题内文章更新

<Route author="SunShinenny" example="/sspai/topic/250" path="/sspai/topic/:id"  :paramsDesc="['专题 id，可在专题主页URL中找到']"/>

### 标签订阅

<Route author="Jeason0228" example="/sspai/tag/apple" path="/sspai/tag/:keyword" :paramsDesc="['关键词']"/>

## 世界卫生组织 WHO

### 媒体中心

<Route author="LogicJake" example="/who/news-room/feature-stories" path="/who/news-room/:type" :paramsDesc="['类别，可在 URL 中找到']"/>

## 数英网

### 数英网最新文章

<Route author="occupy5" example="/digitaling/index" path="/digitaling/index" :paramsDesc="['首页最新文章, 数英网']" />

### 数英网文章专题

<Route author="occupy5" example="/digitaling/articles/latest" path="/digitaling/articles/:category/:subcate?" :paramsDesc="['文章专题分类 ','hot分类下的子类']" />

| 最新文章 | 头条     | 热文 | 精选   |
| -------- | -------- | ---- | ------ |
| latest   | headline | hot  | choice |

分类`hot`下的子类

| 近期热门文章 | 近期最多收藏 | 近期最多赞 |
| ------------ | ------------ | ---------- |
| views        | collects     | zan        |

### 数英网项目专题

<Route author="occupy5" example="/digitaling/projects/all" path="/digitaling/projects/:category" :paramsDesc="['项目专题分类 ']" />

| 全部 | 每周项目精选 | 每月项目精选 | 海外项目精选  | 近期热门项目 | 近期最多收藏 |
| ---- | ------------ | ------------ | ------------- | ------------ | ------------ |
| all  | weekly       | monthly      | international | hot          | favorite     |

## 搜狐号

### 更新

<Route author="HenryQW" example="/sohu/mp/119097" path="/sohu/mp/:id" :paramsDesc="['搜狐号 ID', '见如下说明']">

1. 通过浏览器搜索相关搜狐号 `果壳 site: mp.sohu.com`。
2. 通过浏览器控制台执行 `cfgs.author_id`，返回的即为搜狐号 ID。

</Route>

## 探物

### 产品

<Route author="xyqfer" example="/tanwu/products" path="/tanwu/products"/>

## 腾讯 NBA

### 头条新闻

<Route author="alizeegod" example="/nba/app_news" path="/nba/app_news"/>

## 腾讯谷雨

### 栏目

<Route author="LogicJake" example="/tencent/guyu/channel/lab" path="/tencent/guyu/channel/:name" :paramsDesc="['栏目名称，包括lab，report，story，shalong']"/>

## 腾讯企鹅号

### 更新

<Route author="LogicJake" example="/tencent/news/author/5933889" path="/tencent/news/author/:mid" :paramsDesc="['企鹅号 ID']"/>

## 推酷

### 周刊

<Route author="zpcc" example="/tuicool/mags/tech" path="/tuicool/mags/:type" :paramsDesc="['类型如下']">

| 编程狂人 | 设计匠艺 | 创业周刊 | 科技周刊 |
| -------- | -------- | -------- | -------- |
| prog     | design   | startup  | tech     |

</Route>

## 万联网

### 资讯

<Route author="kt286" example="/10000link/news/My01" path="/10000link/news/:category?" :paramsDesc="['栏目代码, 默认为全部']">

| 全部 | 天下大势 | 企业动态 | 专家观点 | 研究报告 |
| ---- | -------- | -------- | -------- | -------- |
| (空) | My01     | My02     | My03     | My04     |

</Route>

## 网易号

### 更新

<Route author="HendricksZheng" example="/netease/dy/W4983108759592548559" path="/netease/dy/:id" :paramsDesc="['网易号 ID', '见如下说明']">

1. 在[网易号搜索页面](https://dy.163.com/v2/media/tosearch.html) 搜索想要订阅的网易号。
2. 打开网易号文章页面。
3. 通过浏览器控制台执行 `$('#contain').dataset.wemediaid`，返回的即为网易号 ID。

</Route>

## 维基百科

### 中国大陆新闻动态

<Route author="HenryQW" example="/wikipedia/mainland" path="/wikipedia/mainland"/>

## 微信

::: tip 提示

公众号直接抓取困难, 故目前提供几种间接抓取方案, 请自行选择

:::

### 公众号（ wemp.app 来源）

<Route author="HenryQW" example="/wechat/wemp/36836fbe-bdec-4758-8967-7cc82722952d" path="/wechat/wemp/:id" :paramsDesc="['wemp 公众号 id, 可在搜索引擎使用 `site:wemp.app` 搜索公众号（例如: 人民日报 site:wemp.app), 打开公众号页, 在 URL 中找到 id']" anticrawler="1"/>

### 公众号（传送门来源）

<Route author="HenryQW" example="/wechat/csm/huxiu_com" path="/wechat/csm/:id" :paramsDesc="['公众号 id, 打开公众号页, 在 URL 中找到 id']"/>

### 公众号（CareerEngine 来源）

<Route author="HenryQW" example="/wechat/ce/595a5b14d7164e53908f1606" path="/wechat/ce/:id" :paramsDesc="['公众号 id, 在 [CareerEngine](https://search.careerengine.us/) 搜索公众号，通过 URL 中找到对应的公众号 id']"/>

### 公众号（Telegram 频道来源）

<Route author="LogicJake" example="/wechat/tgchannel/lifeweek" path="/wechat/tgchannel/:id" :paramsDesc="['公众号绑定频道 id']">

::: warning 注意

该方法需要通过 efb 进行频道绑定，具体操作见[https://github.com/DIYgod/RSSHub/issues/2172](https://github.com/DIYgod/RSSHub/issues/2172)
:::
</Route>

### 公众号 (优读来源)

<Route author="kt286" example="/wechat/uread/shensing" path="/wechat/uread/:userid" :paramsDesc="['公众号的微信号, 可在 微信-公众号-更多资料 中找到。并不是所有的都支持，能不能用随缘']"/>

### 公众号 (二十次幂来源)

<Route author="sanmmm" example="/wechat/ershicimi/59" path="/wechat/ershicimi/:id" :paramsDesc="['公众号id, 打开公众号页, 在 URL 中找到 id']"/>

### 公众平台系统公告栏目

<Route author="xyqfer" example="/wechat/announce" path="/wechat/announce" />

### 小程序插件

<Route author="xyqfer" example="/wechat/miniprogram/plugins" path="/wechat/miniprogram/plugins" />

## 西祠胡同

### 频道

<Route author="LogicJake" example="/xici" path="/xici/:id?" :paramsDesc="['频道id，默认为首页推荐']">

| 首页推荐 | 民生 | 情感 | 亲子 |
| -------- | ---- | ---- | ---- |
| (空)     | ms   | qg   | qz   |

</Route>

## 香水时代

### 首页

<Route author="kt286" example="/nosetime/home" path="/nosetime/home"/>

### 香评

<Route author="kt286" example="/nosetime/59247733/discuss/new" path="/nosetime/:id/:type/:sort?" :paramsDesc="['用户id，可在用户主页 URL 中找到', '类型，short 一句话香评  discuss 香评', '排序， new 最新  agree 最有用']"/>

## 新浪专栏

### 创事记

<Route author="xapool" example="/sina/csj" path="/sina/csj"/>

## 选股宝

### 主题

<Route author="hillerliao" example="/xuangubao/subject/41" path="/xuangubao/subject/:subject_id" :paramsDesc="['主题 id，网址 https://xuangubao.cn/subject/41 中最后的数字']"/>

## 异次元软件世界

### 首页

<Route author="kimi360" example="/iplay/home" path="/iplay/home"/>

## 移动支付网

### 新闻

<Route author="LogicJake" example="/mpaypass/news" path="/mpaypass/news"/>

### 分类

<Route author="zhuan-zhu" example="/mpaypass/main/policy" path="mpaypass/main/:type?"
:paramsDesc="['新闻类型,类型可在URL中找到，类似policy，eye等，空或其他任意值展示最新新闻']"/>

## 一兜糖

### 首页精选

<Route author="sanmmm" example="/yidoutang/index" path="/yidoutang/index"/>

### 文章

<Route author="sanmmm" example="/yidoutang/guide" path="/yidoutang/guide"/>

### 众测

<Route author="sanmmm" example="/yidoutang/mtest" path="/yidoutang/mtest"/>

### 全屋记

<Route author="sanmmm" example="/yidoutang/case/hot" path="/yidoutang/:type?" :paramsDesc="['类型, 默认为`default`']">

类型

| 默认    | 最热 | 最新 |
| ------- | ---- | ---- |
| default | hot  | new  |

</Route>

## 装备前线

### 首页最新帖子

<Route author="Jeason0228" example="/zfrontier/postlist/:byReplyTime" path="/zfrontier/postlist" :paramsDesc="['内容标签, 点击标签后地址栏有显示']"/>

## 紫竹张先生

### 全文

<Route author="HenryQW" example="/zzz" path="/zzz/index"/>
