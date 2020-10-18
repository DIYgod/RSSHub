---
pageClass: routes
---

# 新媒体

## 199IT

### 首页更新

<Route author="xfangbao" example="/199it" path="/199it" />

### 分类

<Route author="nczitzk" example="/199it/category/199itdata" path="/199it/category/:caty" :paramsDesc="['分类, 可在分类页 URL 中找到']">

分类为单一路径，如 `http://www.199it.com/archives/category/199itdata` 则路由为 `/199it/category/199itdata`.

分类包含多重路径，如 `http://www.199it.com/archives/category/emerging/5g` 则替换 `/` 为 `|`，即路由为 `/199it/category/emerging|5g`.

</Route>

### 标签

<Route author="nczitzk" example="/199it/tag/数据早报" path="/199it/tag/:tag" :paramsDesc="['标签, 可在标签页 URL 中找到']"/>

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

## CGTN

### Most Read & Most Share

<Route author="nczitzk" example="/cgtn/most/read/day" path="/cgtn/most/:type?/:time?" :paramsDesc="['类型，`read` 指最多阅读，`share` 指最多分享，默认为 `read`', '时间，`all` 指所有时间，`day` 指今天，`week` 指本周，`month` 指本月，`year` 指今年，默认为 `all`']"/>

### Top News

<Route author="nczitzk" example="/cgtn/top" path="/cgtn/top"/>

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

## GQ

### GQ 台湾

<Route author="nczitzk" example="/gq/tw/fashion" path="/gq/tw/:caty?/:subcaty?" :paramsDesc="['分类，见下表', '子分类，见下表']">

分类

| Fashion | Entertainment | Life | Gadget | Better Men | Video | Tag |
| ------- | ------------- | ---- | ------ | ---------- | ----- | --- |
| fashion | entertainment | life | gadget | bettermen  | video | tag |

子分类

Fashion

| 最新推薦 | 新訊         | 編輯推薦 | 穿搭指南 | 特別報導 |
| -------- | ------------ | -------- | -------- | -------- |
|          | fashion-news | shopping | guide    | special  |

Entertainment

| 最新推薦 | 電影  | 娛樂       | 名人        | 美女 | 體育   | 特別報導 |
| -------- | ----- | ---------- | ----------- | ---- | ------ | -------- |
|          | movie | popculture | celebrities | girl | sports | special  |

Life

| 最新推薦 | 美食 | 微醺 | 戶外生活 | 設計生活 | 風格幕後         | 特別報導 |
| -------- | ---- | ---- | -------- | -------- | ---------------- | -------- |
|          | food | wine | outdoor  | design   | lifestyleinsider | special  |

Gadget

| 最新推薦 | 3C | 車   | 腕錶  | 特別報導 |
| -------- | -- | ---- | ----- | -------- |
|          | 3c | auto | watch | special  |

Better Men

| 最新推薦 | 保養健身  | 感情關係     | 性愛 | 特別報導 |
| -------- | --------- | ------------ | ---- | -------- |
|          | wellbeing | relationship | sex  | special  |

Video

| 最新推薦 | 名人   | 全球娛樂            | 玩家收藏 | 穿搭  | 生活 |
| -------- | ------ | ------------------- | -------- | ----- | ---- |
|          | people | globalentertainment | collect  | style | life |

Tag

| 奧斯卡                    |
| ------------------------- |
| `the-oscars-奧斯卡金像獎` |

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

<Route author="luyuhuang" example="/ithome/it" path="/ithome/:caty" :paramsDesc="['类别']" radar="1" rssbud="1">

| it      | soft     | win10      | iphone      | ipad      | android      | digi     | next     |
| ------- | -------- | ---------- | ----------- | --------- | ------------ | -------- | -------- |
| IT 资讯 | 软件之家 | win10 之家 | iphone 之家 | ipad 之家 | android 之家 | 数码之家 | 智能时代 |

</Route>

### 热榜

<Route author="immmortal luyuhuang" example="/ithome/ranking/24h" path="/ithome/ranking/:type" :paramsDesc="['类别']" radar="1" rssbud="1">

| 24h           | 7days    | monthly |
| ------------- | -------- | ------- |
| 24 小时阅读榜 | 7 天最热 | 月榜    |

</Route>

## IT 桔子

### 投融资事件

<Route author="xyqfer" example="/itjuzi/invest" path="/itjuzi/invest"/>

### 并购事件

<Route author="xyqfer" example="/itjuzi/merge" path="/itjuzi/merge"/>

## Kotaku

### Story

<Route author="CYTMWIA" example="/kotaku/story/news" path="/kotaku/story/:type" :paramsDesc="['Story类型']">

可在 url 中找到，例如`https://kotaku.com/c/news`和`https://kotaku.com/c/kotaku-east`中的`news`和`kotaku-east`

注意，无论是`news`还是`kotaku-east`之前都有`/c/`

所以，如果您把`https://kotaku.com/latest`中的`latest`填入，该路由并不会正常工作

</Route>

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

<Route author="xyqfer Cerebrater" example="/matters/latest" path="/matters/latest" radar="1" rssbud="1"/>

### 熱門文章

<Route author="Cerebrater" example="/matters/hot" path="/matters/hot" radar="1" rssbud="1"/>

### 标签

<Route author="Cerebrater" example="/matters/tags/VGFnOjk3Mg" path="/matters/tags/:tid" :paramsDesc="['標籤 id，可在標籤所在的 URL 找到']" radar="1" rssbud="1"/>

### 作者

<Route author="Cerebrater" example="/matters/author/az" path="/matters/author/:uid" :paramsDesc="['作者 id，可在作者主頁的 URL 找到']" radar="1" rssbud="1"/>

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

## SocialBeta

### 首页

<Route author="nczitzk" example="/socialbeta/home" path="/socialbeta/home"/>

### 案例

<Route author="nczitzk" example="/socialbeta/hunt" path="/socialbeta/hunt"/>

## Soomal

### 话题

<Route author="zoenglinghou" example="/soomal/topics/最新文章" path="/soomal/topics/:category/:language?" :paramsDesc="['话题，可在顶部菜单找到对应名称', '语言，默认为简体中文']">

-   可选语言：

| 简体中文 | 正体中文 | 英语 |
| -------- | -------- | ---- |
| zh       | zh_tw    | en   |

-   可选话题（按语言分类）：

| 语言     |          |       |          |          |          |              |
| -------- | -------- | ----- | -------- | -------- | -------- | ------------ |
| 简体中文 | 最新文章 | 科普  | 测评报告 | 发烧入门 | 摄影入门 | 古典音乐入门 |
| 正体中文 | 最新文章 | 科普  | 測評報告 | 發燒入門 | 攝影入門 | 古典音樂入門 |
| 英语     | Phone    | Audio | Album    | Review   |          |              |

-   Soomal 提供官方 RSS 订阅
    -   Soomal 网站更新：<http://www.soomal.com/doc/101.rss.xml>
    -   Soomal 论坛与留言系统的更新：<http://www.soomal.com/bbs/101.rss.xml>

</Route>

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

## 八阕

### 广角新闻

<Route author="nczitzk" example="/popyard" path="/popyard/:caty?" :paramsDesc="['分类, 默认为全景']">

| 全景 | 中国 | 国际 | 科教 | 军事 | 体育 | 娱乐 | 艺术 | 文史 | 观点 | 生活 | 产经 | 其它 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 0    | 1    | 2    | 3    | 4    | 5    | 6    | 7    | 8    | 9    | 10   | 11   | 12   |

</Route>

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

## 不安全

### 全文

<Route author="22k" example="/buaq" path="/buaq/index"/>

## 差评

### 图片墙

<Route author="nczitzk" example="/chaping/banner" path="/chaping/banner"/>

### 资讯

<Route author="nczitzk" example="/chaping/news/15" path="/chaping/news/:caty?" :paramsDesc="['分类，默认为全部资讯']">

| 编号 | 分类       |
| ---- | ---------- |
| 15   | 直播       |
| 3    | 科技新鲜事 |
| 7    | 互联网槽点 |
| 5    | 趣味科技   |
| 6    | DEBUG TIME |
| 1    | 游戏       |
| 8    | 视频       |
| 9    | 公里每小时 |

</Route>

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

## 电商报

### 分区

<Route author="FlashWingShadow" example="/dsb/area/lingshou" path="/dsb/area/:area" :paramsDesc="['分区']"/>

area 分区选项

| 零售     | 物流  | O2O | 金融    | B2B | 人物  | 跨境    | 行业观察 |
| -------- | ----- | --- | ------- | --- | ----- | ------- | -------- |
| lingshou | wuliu | O2O | jinrong | B2B | renwu | kuajing | guancha  |

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

## 飞雪娱乐网

<Route author="nczitzk" example="/feixuew/rj" path="/feixuew/:id?" :paramsDesc="['分类 id，可在对应分类页面的 URL 中找到，默认为首页最近更新']">

| 实用软件 | 网站源码 | 技术教程 | 游戏助手 | 游戏资源 | 值得一看 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| rj       | wzym     | jsjc     | yx       | yxzy     | zdyk     |

</Route>

## 凤凰网

### 大风号

<Route author="Jamch" example="/ifeng/feng/2583/doc" path="/ifeng/feng/:id/:type" :paramsDesc="['对应 id，可在 大风号作者页面 找到','类型，见下表']"/>

| 文章 | 视频  |
| ---- | ----- |
| doc  | video |

## 福利年

### 文章

<Route author="nczitzk" example="/fulinian" path="/fulinian/:caty?" :paramsDesc="['分类, 默认为首页最新发布']">

| 技术教程         | 精品软件         | 网络资源         | 福利年惠 | 创业知识 | 正版教程         |
| ---------------- | ---------------- | ---------------- | -------- | -------- | ---------------- |
| technical-course | quality-software | network-resource | fulinian | chuangye | authentic-course |

</Route>

## 高科技行业门户

### 新闻

<Route author="luyuhuang" example="/ofweek/news" path="/ofweek/news"/>

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

<Route author="WenhuWee emdoe SivaGao HenryQW" example="/qdaily/column/59" path="/qdaily/:type/:id" :paramsDesc="['类型，见下表', '对应 id，可在 URL 找到']" radar="1" rssbud="1">

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

## 互动吧

### 活动

<Route author="nczitzk" example="/hudongba/beijing/98-0-2-0-1-1" path="/hudongba/:city/:id" :paramsDesc="['城市，可在选定所在城市后的页面 URL 中找到', '编号，可在选定筛选条件后的页面 URL 中找到']">

如例子 `/hudongba/beijing/98-0-2-0-1-1` 对应的网址 `https://www.hudongba.com/beijing/98-0-2-0-0-1` 中，`beijing` 即所在城市为北京；`98-0-2-0-0-1` 则是所选择的分类编号，指分类不限、时间不限、综合排序的所有亲子活动。

</Route>

## 虎嗅

### 首页资讯

<Route author="HenryQW" example="/huxiu/article" path="/huxiu/article" />

### 标签

<Route author="xyqfer HenryQW" example="/huxiu/tag/291" path="/huxiu/tag/:id" :paramsDesc="['标签 id']" />

### 搜索

<Route author="xyqfer HenryQW" example="/huxiu/search/%E8%99%8E%E5%97%85%E6%97%A9%E6%8A%A5" path="/huxiu/search/:keyword" :paramsDesc="['关键字']" />

### 作者

<Route author="HenryQW" example="/huxiu/author/29318" path="/huxiu/author/:id" :paramsDesc="['用户 id']" />

### 文集

<Route author="AlexdanerZe" example="/huxiu/collection/212" path="/huxiu/collection/:id" :paramsDesc="['文集 id']" />

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

<Route author="uni-zheng" example="/jinritoutiao/keyword/AI" path="/jinritoutiao/keyword/:keyword" :paramsDesc="['关键词']" anticrawler="1"/>

## 金色财经

### 快讯

<Route author="nczitzk" example="/jinse/lives" path="/jinse/lives"/>

### 头条

<Route author="nczitzk" example="/jinse/timeline" path="/jinse/timeline"/>

### 分类

<Route author="nczitzk" example="/jinse/catalogue/zhengce" path="/jinse/catalogue/:caty" :paramsDesc="['分类名，参见下表']">

| 政策    | 行情         | DeFi | 矿业  | 以太坊 2.0 | 产业     | IPFS | 技术 | 百科  | 研报          |
| ------- | ------------ | ---- | ----- | ---------- | -------- | ---- | ---- | ----- | ------------- |
| zhengce | fenxishishuo | defi | kuang | 以太坊 2.0 | industry | IPFS | tech | baike | capitalmarket |

</Route>

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

### 公司公告 - A 股港股

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

## 看点快报

### 首页

<Route author="nczitzk" example="/kuaibao" path="/kuaibao/index"/>

## 快科技（原驱动之家）

### 最新新闻

<Route author="kt286" example="/kkj/news" path="/kkj/news"/>

## 快媒体

### 首页更新

<Route author="xfangbao" example="/kuai" path="/kuai" />

### 具体栏目更新

<Route author="xfangbao" example="/kuai/1" path="/kuai/:id" />

具体栏目编号，去网站上看标签

| 网址                                                                                              | 对应路由 |
| ------------------------------------------------------------------------------------------------- | -------- |
| kuai.media                                                                                        | /kuai    |
| [www.kuai.media/portal.php?mod=list&catid=38](http://www.kuai.media/portal.php?mod=list&catid=38) | /kuai/38 |

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

## 妈咪帮

<Route author="nczitzk" example="/mamibuy" path="/mamibuy/:caty?/:age?/:sort?" :paramsDesc="['分类，见下表，默认为全分類', '岁数，见下表，默认为不限', '排序，见下表，默认为最新']">

分类

| 全分類 | 小兒醫護 | 幼兒教育 | 育兒成長 | 母乳餵哺 | 寶寶飲食 | 用品交流 | 女人聊天 | 居家生活 | 親子旅遊 / 好去處 | 媽咪扮靚 | 生活閒談 | 懷孕交流 |
| ------ | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | ----------------- | -------- | -------- | -------- |
| 0      | 1        | 2        | 3        | 4        | 5        | 6        | 7        | 8        | 9                 | 10       | 11       | 12       |

岁数

| 不限 | 懷孕中 | 生產後 | 0~1 歲 | 1~3 歲 | 3~6 歲 | 6 歲以上 |
| ---- | ------ | ------ | ------ | ------ | ------ | -------- |
| 0    | 1      | 2      | 3      | 4      | 5      | 6        |

排序

| 最新 | 推薦 | 熱門 |
| ---- | ---- | ---- |
| 1    | 2    | 3    |

</Route>

## 梅花网

### 作品

<Route author="nczitzk" example="/meihua/shots/latest" path="/meihua/shots/:caty">

| 最新   | 热门 | 推荐      |
| ------ | ---- | --------- |
| latest | hot  | recommend |

</Route>

### 文章

<Route author="nczitzk" example="/meihua/article/latest" path="/meihua/article/:caty">

| 最新   | 热门 |
| ------ | ---- |
| latest | hot  |

</Route>

## 镁客网 im2maker

### 镁客网频道

<Route author="jin12180000" example="/im2maker/" path="/im2maker/:channel?" :paramsDesc="['默认不填为 最新文章 ，频道如下']">

| 最新文章 | 行业快讯 | 行业观察 | 镁客请讲 | 硬科技 100 人 | 投融界   | 万象       |
| -------- | -------- | -------- | -------- | ------------- | -------- | ---------- |
| 默认空   | fresh    | industry | talk     | intech        | investor | everything |

</Route>

## 梅斯医学 MedSci

### 推荐

<Route author="nczitzk" example="/medsci/recommend" path="/medsci/recommend"/>

## 摩根大通研究所

### 新闻

<Route author="howel52" example="/jpmorganchase" path="/jpmorganchase"/>

## 鸟哥笔记

### 今日事

<Route author="KotoriK" example="/ngbj/today" path="/ngbj/today"/>

### 分类目录

<Route author="KotoriK" example="/ngbj/cat/103" path="/ngbj/cat/:cat" :paramsDesc="['如https://www.niaogebiji.com/cat/103,最后的数字就是要填写在这的id']"/>

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

## 全现在

<Route author="nczitzk" example="/allnow/column/199" path="/allnow/column/:id" :paramsDesc="['专栏 id']"/>

## 人人都是产品经理

### 热门文章

<Route author="WenryXu" example="/woshipm/popular" path="/woshipm/popular"/>

### 天天问

<Route author="WenryXu" example="/woshipm/wen" path="/woshipm/wen"/>

### 用户收藏

<Route author="LogicJake" example="/woshipm/bookmarks/324696" path="/woshipm/bookmarks/:id" :paramsDesc="['用户 id']"/>

### 用户文章

<Route author="LogicJake" example="/woshipm/user_article/324696" path="/woshipm/user_article/:id" :paramsDesc="['用户 id']"/>

### 最新文章

<Route author="Director-0428" example="/woshipm/latest" path="/woshipm/latest"/>

## 少数派 sspai

### 最新上架付费专栏

<Route author="HenryQW" example="/sspai/series" path="/sspai/series">

> 少数派专栏需要付费订阅，RSS 仅做更新提醒，不含付费内容.

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

此为专题广场更新提示 => 集合型而非单篇文章。与下方 "专题内文章更新" 存在明显区别！

</Route>

### 专题内文章更新

<Route author="SunShinenny" example="/sspai/topic/250" path="/sspai/topic/:id"  :paramsDesc="['专题 id，可在专题主页URL中找到']"/>

### 标签订阅

<Route author="Jeason0228" example="/sspai/tag/apple" path="/sspai/tag/:keyword" :paramsDesc="['关键词']"/>

## 生物谷

### 最新资讯

<Route author="nczitzk" example="/bioon/latest" path="/bioon/latest"/>

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

1.  通过浏览器搜索相关搜狐号 `果壳 site: mp.sohu.com`。
2.  通过浏览器控制台执行 `cfgs.author_id`，返回的即为搜狐号 ID。

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

## 外接大脑

### 文章

<Route author="nczitzk" example="/waijiedanao/article/all" path="/waijiedanao/article/:caty" :paramsDesc="['文章分类']">

| 全部 | 新闻 | 金融    | 区块链     | 互联网   | 科技 | 新媒体   | 商业思考 | 行业 100 强 | 电商      | 娱乐          | 生活 |
| ---- | ---- | ------- | ---------- | -------- | ---- | -------- | -------- | ----------- | --------- | ------------- | ---- |
| all  | news | finance | blockchain | internet | tech | newmedia | business | hundred     | ecommerce | entertainment | life |

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

1.  在[网易号搜索页面](https://dy.163.com/v2/media/tosearch.html) 搜索想要订阅的网易号。
2.  打开网易号文章页面。
3.  通过浏览器控制台执行 `$('#contain').dataset.wemediaid`，返回的即为网易号 ID。

</Route>

## 网易新闻

### 排行榜

<Route author="nczitzk" example="/netease/news/rank/whole/click/day" path="/netease/news/rank/:category?/:type?/:time?" :paramsDesc="['新闻分类，参见下表，默认为“全站”','排行榜类型，“点击榜”对应`click`，“跟贴榜”对应`follow`，默认为“点击榜”','统计时间，“1小时”对应`hour`，“24小时”对应`day`，“本周”对应`week`，“本月”对应`month`，默认为“24小时”']">

::: tip 提示

全站新闻 **点击榜** 的统计时间仅包含 “24 小时”、“本周”、“本月”，不包含 “1 小时”。即可用的`time`参数为`day`、`week`、`month`。

其他分类 **点击榜** 的统计时间仅包含 “1 小时”、“24 小时”、“本周”。即可用的`time`参数为`hour`、`day`、`week`。

而所有分类（包括全站）的 **跟贴榜** 的统计时间皆仅包含 “24 小时”、“本周”、“本月”。即可用的`time`参数为`day`、`week`、`month`。

:::

新闻分类：

| 全站  | 新闻 | 娱乐          | 体育   | 财经  | 科技 | 汽车 | 女人 | 房产  | 游戏 | 旅游   | 教育 |
| ----- | ---- | ------------- | ------ | ----- | ---- | ---- | ---- | ----- | ---- | ------ | ---- |
| whole | news | entertainment | sports | money | tech | auto | lady | house | game | travel | edu  |

</Route>

## 维基百科

### 中国大陆新闻动态

<Route author="HenryQW" example="/wikipedia/mainland" path="/wikipedia/mainland"/>

## 微信

::: tip 提示

公众号直接抓取困难，故目前提供几种间接抓取方案，请自行选择

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

该方法需要通过 efb 进行频道绑定，具体操作见<https://github.com/DIYgod/RSSHub/issues/2172>
:::
</Route>

### 公众号 (优读来源)

<Route author="kt286" example="/wechat/uread/shensing" path="/wechat/uread/:userid" :paramsDesc="['公众号的微信号, 可在 微信-公众号-更多资料 中找到。并不是所有的都支持，能不能用随缘']"/>

### 公众号 (二十次幂来源)

<Route author="sanmmm" example="/wechat/ershicimi/59" path="/wechat/ershicimi/:id" :paramsDesc="['公众号id, 打开公众号页, 在 URL 中找到 id']"/>

### 公众号 (外接大脑来源)

<Route author="BugWriter2" example="/wechat/wjdn/5d5e683c82339df472988f59" path="/wechat/wjdn/:id" :paramsDesc="['公众号 id, 打开公众号页, 在 URL 中找到 id']"/>

### 公众号栏目 (非推送 & 历史消息)

<Route author="MisteryMonster" example="/wechat/mp/homepage/MzA3MDM3NjE5NQ==/16" path="/wechat/mp/homepage/:biz/:hid/:cid?" :paramsDesc="['公众号id', '分页id', '页内栏目']" radar="1" rssbud="1" anticrawler="1">

只适用拥有首页模板 (分享链接带有 homepage) 的公众号。例如从公众号分享出来的链接为 <https://mp.weixin.qq.com/mp/homepage?__biz=MzA3MDM3NjE5NQ==&hid=4>，`biz` 为 `MzA3MDM3NjE5NQ==`，`hid` 为 `4`。

有些页面里会有分栏， `cid` 可以通过元素选择器选中栏目查看`data-index`。如[链接](https://mp.weixin.qq.com/mp/homepage?__biz=MzA3MDM3NjE5NQ==&hid=4)里的 `京都职人` 栏目的 `cid` 为 `0`，`文艺时光` 栏目的 `cid` 为 `2`。如果不清楚的话最左边的栏目为`0`，其右方栏目依次递增 `1`。

</Route>

### 公众号文章话题 Tag

<Route author="MisteryMonster" example="/wechat/mp/msgalbum/MzA3MDM3NjE5NQ==/1375870284640911361" path="/wechat/mp/msgalbum/:biz/:aid" :paramsDesc="['公众号id', 'Tag id', ]" radar="1" rssbud="1" anticrawler="1">

一些公众号（如看理想）会在微信文章里添加 Tag ，点入 Tag 的链接如 <https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzA3MDM3NjE5NQ==&action=getalbum&album_id=1375870284640911361>，其中`biz` 为 `MzA3MDM3NjE5NQ==`，`aid` 为 `1375870284640911361`。

</Route>

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

## 小刀娱乐网

<Route author="nczitzk" example="/x6d/34" path="/x6d/:id?" :paramsDesc="['分类 id，可在对应分类页面的 URL 中找到，默认为首页最近更新']">

| 技巧分享 | QQ 技巧 | 微信技巧 | 其他教程 | 其他分享 |
| -------- | ------- | -------- | -------- | -------- |
| 31       | 55      | 112      | 33       | 88       |

| 宅家自学 | 健身养生 | 摄影剪辑 | 长点知识 | 自我提升 | 两性相关 | 编程办公 | 职场关系 | 新媒体运营 | 其他教程 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | ---------- | -------- |
| 18       | 98       | 94       | 93       | 99       | 100      | 21       | 22       | 19         | 44       |

| 活动线报 | 流量话费 | 免费会员 | 实物活动 | 游戏活动 | 红包活动 | 空间域名 | 其他活动 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 34       | 35       | 91       | 92       | 39       | 38       | 37       | 36       |

| 值得一看 | 找点乐子 | 热门事件 | 节目推荐 |
| -------- | -------- | -------- | -------- |
| 65       | 50       | 77       | 101      |

| 值得一听 | 每日一听 | 歌单推荐 |
| -------- | -------- | -------- |
| 71       | 87       | 79       |

| 资源宝库 | 书籍资料 | 设计资源 | 剪辑资源 | 办公资源 | 壁纸资源 | 编程资源 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 106      | 107      | 108      | 109      | 110      | 111      | 113      |

</Route>

## 新浪专栏

### 创事记

<Route author="xapool" example="/sina/csj" path="/sina/csj"/>

## 选股宝

### 主题

<Route author="hillerliao" example="/xuangubao/subject/41" path="/xuangubao/subject/:subject_id" :paramsDesc="['主题 id，网址 https://xuangubao.cn/subject/41 中最后的数字']"/>

## 妖火网

<Route author="nczitzk" example="/yaohuo/new" path="/yaohuo/:type?" :paramsDesc="['排序类型，可选 `new` 指最新，`hot` 指最热，默认为 `new`']"/>

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

### 子板块帖子

<Route author="c4605" example="/zfrontier/board/56" path="/zfrontier/board/:boardId" :paramsDesc="['板块 ID']"/>

QueryString:

-   `sort`：排序方式

| 根据创建时间（默认） | 根据回复时间 | 根据热度 |
| -------------------- | ------------ | -------- |
| byCtime              | byReplyTime  | byScore  |

## 紫竹张先生

### 全文

<Route author="HenryQW" example="/zzz" path="/zzz/index"/>
