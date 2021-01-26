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

## ASML 阿斯麦

### Press releases & announcements

<Route author="nczitzk" example="/asml/press-releases" path="/asml/press-releases"/>

## Bell Labs

### Event and News

<Route author="nczitzk" example="/bell-labs/events-news" path="/bell-labs/events-news/:category?" :paramsDesc="['分类，见下表，默认为 Press releases']">

| Featured events | Latest recognition   | Press releases |
| --------------- | -------------------- | -------------- |
| events          | industry-recognition | press-releases |

</Route>

## BOF

### 首页

<Route author="kt286" example="/bof/home" path="/bof/home" />

## cfan

### 新闻

<Route author="kt286" example="/cfan/news" path="/cfan/news"/>

## CGTN

### Opinions

<Route author="nczitzk" example="/cgtn/opinions" path="/cgtn/opinions"/>

### Most Read & Most Share

<Route author="nczitzk" example="/cgtn/most/read/day" path="/cgtn/most/:type?/:time?" :paramsDesc="['类型，`read` 指最多阅读，`share` 指最多分享，默认为 `read`', '时间，`all` 指所有时间，`day` 指今天，`week` 指本周，`month` 指本月，`year` 指今年，默认为 `all`']"/>

### Top News

<Route author="nczitzk" example="/cgtn/top" path="/cgtn/top"/>

### Editors' Pick

<Route author="nczitzk" example="/cgtn/pick" path="/cgtn/pick"/>

## cnBeta

### 最新

<Route author="kt286 HaitianLiu" example="/cnbeta" path="/cnbeta"/>

## Day One

### Blog

<Route author="nczitzk" example="/dayone/blog" path="/dayone/blog"/>

## DeepL

### Blog

<Route author="nczitzk" example="/deepl/blog" path="/deepl/blog/:lang?" :paramsDesc="['语言，可选 `en` 指 英语 和 `zh` 指 汉语，默认为 en']"/>

## DeepMind

### Blog

<Route author="nczitzk" example="/deepmind/blog" path="/deepmind/blog/:category?" :paramsDesc="['分类，见下表']">

| All | Podcasts | Research | News |
| --- | -------- | -------- | ---- |
|     | Podcasts | Research | News |

</Route>

## Deutsche Welle 德国之声

<Route author="nczitzk" example="/dw/zh" path="/dw/:lang?/:caty?" :paramsDesc="['语言，可在对应语言版本页的 URL 中找到，默认为德语', '分类，见下表，默认为全部']">

| 全部 | 德语媒体 | 文化经纬 | 经济纵横 | 科技环境 |
| ---- | -------- | -------- | -------- | -------- |
| all  | press    | cul      | eco      | sci      |

</Route>

## DoNews

### 栏目

<Route author="HenryQW" example="/donews" path="/donews/:column?" :paramsDesc="['栏目代码, 默认为首页.']">

| 首页 | 商业    | 创业     | 互娱 | 科技    | 专栏    |
| ---- | ------- | -------- | ---- | ------- | ------- |
| (空) | company | business | ent  | digital | idonews |

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

## Esquirehk

### Tag

<Route author="nczitzk" example="/esquirehk/tag/Fashion" path="/esquirehk/tag/:id" :paramsDesc="['标签，可在对应标签页 URL 中找到']" />

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

## iDaily 每日环球视野

### 今日 Timeline

<Route author="zphw" example="/idaily/today" path="/idaily/today" />

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

## MakeUseOf

<Route author="nczitzk" example="/makeuseof" path="/makeuseof/:category?" :paramsDesc="['分类，默认为 Trending']"/>

## Matataki

::: tip 提示

在 Matataki 发表的文章会上传到星际文件系统（IPFS），永久保存。即使站内文章因为各种原因消失，用 RSS 获取过带 IPFS 连接的 Feed Item 的话，还是可以从 RSS 阅读器找回文章的。
IPFS 网关有可能失效，那时候换成其他网关。

:::

### 最热作品

<Route author="whyouare111" example="/matataki/posts/hot" path="/matataki/posts/hot/:ipfsFlag?" :paramsDesc="['IPFS标识，置空item指向主站，有值item指向IPFS网关']" radar="1"/>

### 最新作品

<Route author="whyouare111" example="/matataki/posts/latest/ipfs" path="/matataki/posts/latest/:ipfsFlag?" :paramsDesc="['IPFS标识，置空item指向主站，有值item指向IPFS网关']" radar="1"/>

### 作者创作

<Route author="whyouare111" example="/matataki/users/9/posts" path="/matataki/users/:authorId/posts/:ipfsFlag?" :paramsDesc="['作者ID', 'IPFS标识，置空item指向主站，有值item指向IPFS网关']"  radar="1"/>

### Fan 票关联作品

<Route author="whyouare111" example="/matataki/tokens/22/posts/3" path="/matataki/tokens/:tokenId/posts/:filterCode/:ipfsFlag?" :paramsDesc="['Fan票ID', '过滤条件,见下表', 'IPFS标识，置空item指向主站，有值item指向IPFS网关']" radar="1">

| 需持票 | 需支付 | 全部 |
| ------ | ------ | ---- |
| 1      | 2      | 3    |

</Route>

### 标签关联作品

<Route author="whyouare111" example="/matataki/tags/150/区块链/posts" path="/matataki/tags/:tagId/:tagName/posts/:ipfsFlag?" :paramsDesc="['标签ID', '标签名称','IPFS标识，置空item指向主站，有值item指向IPFS网关']"  radar="1"/>

### 收藏夹

<Route author="whyouare111" example="/matataki/users/3017/favorites/155/posts" path="/matataki/users/:userId/favorites/:favoriteListId/posts/:ipfsFlag?" :paramsDesc="['用户ID', '收藏夹ID','IPFS标识，置空item指向主站，有值item指向IPFS网关']"  radar="1"/>

## Matters

### 熱門文章

<Route author="Cerebrater" example="/matters/hot" path="/matters/hot" radar="1" rssbud="1"/>

### 最新、熱議、精華

<Route author="xyqfer Cerebrater" example="/matters/latest/heat" path="/matters/latest/:type?" :paramsDesc="['默認爲 latest, 見下表']" radar="1" rssbud="1">

| 最新   | 熱議 | 精華    |
| ------ | ---- | ------- |
| latest | heat | essence |

</Route>

### 标签

<Route author="Cerebrater" example="/matters/tags/VGFnOjk3Mg" path="/matters/tags/:tid" :paramsDesc="['標籤 id，可在標籤所在的 URL 找到']" radar="1" rssbud="1"/>

### 作者

<Route author="Cerebrater" example="/matters/author/az" path="/matters/author/:uid" :paramsDesc="['作者 id，可在作者主頁的 URL 找到']" radar="1" rssbud="1"/>

## MIT 科技评论

### 首页

<Route author="EsuRt queensferryme" example="/mittrchina/hot" path="/mittrchina/:type" :paramsDesc="['类型 type，可以是 index（首页资讯）或 hot（本周热榜）']"/>

## Nautilus

### 话题

<Route author="emdoe" example="/nautilus/topic/Art" path="/nautilus/topic/:tid" :paramsDesc="['话题 id, 可在页面上方 TOPICS 栏目处找到']"/>

## OpenAI

### Blog

<Route author="ncziztk" example="/openai/blog" path="/openai/blog/:tag" :paramsDesc="['标签，见下表，默认为 All']">

| All | Research | Announcements | Events | Milestones |
| --- | -------- | ------------- | ------ | ---------- |
|     | research | announcements | events | milestones |

</Route>

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

## Polar

### Blog

<Route author="nczitzk" example="/polar/blog" path="/polar/blog"/>

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

## The Brain

### Blog

<Route author="nczitzk" example="/thebrain/blog" path="/thebrain/blog/:category?" :paramsDesc="['分类, 见下表，默认为 Blog']">

| Blog | Recorded Events | Big Thinkers |
| ---- | --------------- | ------------ |
| blog | recorded-events | big-thinkers |

</Route>

## The Verge

### The Verge

<Route author="HenryQW" example="/verge" path="/verge">

通过提取文章全文，以提供比官方源更佳的阅读体验.

</Route>

## Thrillist

<Route author="loganrockmore" example="/thrillist/food-and-drink" path="/vulture/:tag" :paramsDesc="['Tag']">

Provides all of the Thrillist articles with the specified tag.

</Route>

## TOPYS

### 分类

<Route author="kt286" example="/topys/7" path="/topys/:category" :paramsDesc="['分类ID，可在对应页面的 URL 中找到']"/>

## VOA News

### Day in Photos

<Route author="nczitzk" example="/voa/day-photos" path="/voa/day-photos"/>

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

### 櫻坂 46 博客

<Route author="victor21813" example="/sakurazaka46/blog" path="/sakurazaka46/blog" />

### 日向坂 46 新闻

<Route author="crispgm" example="/hinatazaka46/news" path="/hinatazaka46/news" />

### 日向坂 46 博客

<Route author="nwindz" example="/hinatazaka46/blog" path="/hinatazaka46/blog" />

## 半月谈

### 时事大事库

<Route author="nczitzk" example="/banyuetan/byt" path="/banyuetan/byt/:time?" :paramsDesc="['时间，见下表，默认为每周']">

| 每周          | 每月  |
| ------------- | ----- |
| shishidashiku | yiyue |

</Route>

## 報導者

### 最新

<Route author="emdoe" example="/twreporter/newest" path="/twreporter/newest"/>

### 摄影

<Route author="emdoe" example="/twreporter/photography" path="/twreporter/photography"/>

### 分类

<Route author="emdoe" example="/twreporter/category/reviews" path="/twreporter/category/:tid" :paramsDesc="['分类（议题）名称，于主页获取']"/>

## 北屋

<Route author="nczitzk" example="/northhouse" path="/northhouse/:category?" :paramsDesc="['分类，见下表，默认为首页']">

| 首页 | 最新资讯和灾难信息 | 生存主义 survival | 运动户外 | 玩物尚志 | 分享下载 | 知行生活 | 商务服务 |
| ---- | ------------------ | ----------------- | -------- | -------- | -------- | -------- | -------- |
|      | 最新资讯和灾难信息 | 生存主义 survival | 运动户外 | 玩物尚志 | 分享下载 | 知行生活 | 商务服务 |

</Route>

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

## 城农 Growin' City

### 城农资讯观点

<Route author="nczitzk" example="/growincity/news" path="/growincity/news/:id?" anticrawler="1" :paramsDesc="['分类 id，见下表，默认为原创内容']">

| 原创内容 | 商业投资 | 观点评论 | 农业科技 |
| -------- | -------- | -------- | -------- |
| 48       | 55       | 88       | 98       |

| 农艺管理 | 农业机械 | 设施农业 | 畜牧水产 |
| -------- | -------- | -------- | -------- |
| 101      | 83       | 85       | 87       |

| 食品科技 | 科技产品 | 食品创新 | 研究报告 |
| -------- | -------- | -------- | -------- |
| 86       | 100      | 99       | 76       |

| 教育拓展 | 展会培训 | 业界访谈 |
| -------- | -------- | -------- |
| 61       | 77       | 72       |

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

## 得到

### 首页

<Route author="nczitzk" example="/dedao/list/年度日更" path="/dedao/list/:caty?" :paramsDesc="['分类名，默认为年度日更']"/>

### 新闻

<Route author="nczitzk" example="/dedao/news" path="/dedao/news"/>

### 人物故事

<Route author="nczitzk" example="/dedao/figure" path="/dedao/figure"/>

### 视频

<Route author="nczitzk" example="/dedao/video" path="/dedao/video"/>

### 知识城邦

<Route author="nczitzk" example="/dedao/knowledge" path="/dedao/knowledge/:topic?/:type?" :paramsDesc="['话题 id，可在话题页 URL 中找到', '分享类型，`true` 指精选，`false` 指最新，默认为精选']"/>

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

## 丁香园

### 新冠疫苗实时动态

<Route author="nczitzk" example="/dxy/vaccine/北京" path="/dxy/vaccine/:province?/:city?/:location?" :paramsDesc="['省', '市', '区']">

查看北京市的新冠疫苗接种点，路由为 `/dxy/vaccine/北京`；

查看北京市朝阳区的新冠疫苗接种点，路由为 `/dxy/vaccine/北京/北京/朝阳区`；

查看湖北省武汉市的新冠疫苗接种点，路由为 `/dxy/vaccine/湖北/武汉`；

查看湖北省武汉市武昌区的新冠疫苗接种点，路由为 `/dxy/vaccine/湖北/武汉/武昌区`。

::: tip 提示

若参数为空，则返回全国所有新冠疫苗接种点。

:::

</Route>

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

## 东西智库

### 分类

<Route author="nczitzk" example="/dx2025" path="/dx2025/:type?/:category?" :paramsDesc="['内容类别，见下表，默认为空', '行业分类，见下表，默认为空']">

内容类别

| 产业观察             | 行业报告         | 政策 & 成效        |
| -------------------- | ---------------- | ------------------ |
| industry-observation | industry-reports | policy-achievement |

行业分类

| 行业                 | 行业名称                                                          |
| -------------------- | ----------------------------------------------------------------- |
| 新一代信息技术       | next-generation-information-technology-industry-reports           |
| 高档数控机床和机器人 | high-grade-cnc-machine-tools-and-robots-industry-reports          |
| 航空航天装备         | aerospace-equipment-industry-reports                              |
| 海工装备及高技术船舶 | marine-engineering-equipment-and-high-tech-ships-industry-reports |
| 先进轨道交通装备     | advanced-rail-transportation-equipment-industry-reports           |
| 节能与新能源汽车     | energy-saving-and-new-energy-vehicles-industry-reports            |
| 电力装备             | electric-equipment-industry-reports                               |
| 农机装备             | agricultural-machinery-equipment-industry-reports                 |
| 新材料               | new-material-industry-reports                                     |
| 生物医药及医疗器械   | biomedicine-and-medical-devices-industry-reports                  |
| 现代服务业           | modern-service-industry-industry-reports                          |
| 制造业人才           | manufacturing-talent-industry-reports                             |

</Route>

### 标签

<Route author="nczitzk" example="/dx2025/tag/3d_printing" path="/dx2025/tag/:category" :paramsDesc="['标签分类，见下表，默认为空']">

| 分类       | 分类名                            | 分类           | 分类名                    |
| ---------- | --------------------------------- | -------------- | ------------------------- |
| 3D 打印    | 3d_printing                       | 大数据         | dashuju                   |
| 5G         | 5g                                | 大湾区         | d_w_q                     |
| AI         | AI                                | 宏观经济       | macro_economy             |
| 世界经济   | world_economy                     | 工业互联网     | industrial_internet       |
| 云计算     | cloud_computing                   | 工业软件       | g_y_r_j                   |
| 人工智能   | rengongzhineng                    | 数字化转型     | digital_transformation    |
| 人才       | personnel                         | 数字孪生       | digital_twin              |
| 企业研究   | enterprise_research               | 数字经济       | digital_economy           |
| 信息安全   | information_safety                | 数字货币       | digital-currency          |
| 创新       | innovate                          | 数据中心       | data_center               |
| 制造业     | manufacturing                     | 数据安全       | data_security             |
| 动力电池   | power_battery                     | 新一代信息技术 | x_y_d_x_x_j_s             |
| 区块链     | qukuailian                        | 新基建         | new_infrastructure        |
| 医疗器械   | medical_apparatus_and_instruments | 新材料         | x_c_l                     |
| 半导体芯片 | semiconductor_chip                | 新能源         | x_n_y                     |
| 新能源汽车 | new_energy_vehicles               | 智能制造       | intelligent_manufacturing |
| 机器人     | robot                             | 机床           | machine_tool              |
| 海工装备   | marine_engineering_equipment      | 物联网         | wulianwang                |
| 现代服务   | x_d_f_w                           | 生物医药       | biomedicine               |
| 电力装备   | electric_equipment                | 网络安全       | wangluoanquan             |
| 航空航天   | aerospace                         | 虚拟现实       | virtual_reality           |
| 装备制造业 | equipment_manufacturing_industry  | 赋能           | empowerment               |
| 轨道交通   | rail_transit                      |                |                           |

</Route>

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

## 观察者网

### 头条

<Route author="nczitzk" example="/guancha/headline" path="/guancha/headline" />

### 首页

<Route author="nczitzk Jeason0228" example="/guancha" path="/guancha/:caty?" :paramsDesc="['分类，见下表，默认为全部']">

| 全部 | 评论 & 研究 | 要闻  | 风闻    | 热点新闻 | 滚动新闻 |
| ---- | ----------- | ----- | ------- | -------- | -------- |
| all  | review      | story | fengwen | redian   | gundong  |

home = 评论 & 研究 + 要闻 + 风闻

others = 热点新闻 + 滚动新闻

::: tip 提示

观察者网首页左中右的三个 column 分别对应 **评论 & 研究**、**要闻**、**风闻** 三个部分。

:::

</Route>

### 观学院

<Route author="nczitzk" example="/guancha/member/recommend" path="/guancha/member/:caty?" :paramsDesc="['分类，见下表']">

| 精选      | 观书堂 | 在线课  | 观学院   |
| --------- | ------ | ------- | -------- |
| recommend | books  | courses | huodongs |

</Route>

### 风闻话题

<Route author="occupy5 nczitzk" example="/guancha/topic/110/1" path="/guancha/topic/:id?/:order?" :paramsDesc="['话题 id，可在URL中找到，默认为全部，即为 `0`', '排序参数，见下表']">

| 最新回复 | 最新发布 | 24 小时最热 | 3 天最热 | 7 天最热 | 3 个月最热 | 专栏文章 |
| -------- | -------- | ----------- | -------- | -------- | ---------- | -------- |
| 1        | 2        | 3           | 6        | 7        | 8          | 5        |

::: tip 提示

仅在话题 id 为 0，即选择 全部 时，**3 个月最热**、**24 小时最热**、**3 天最热**、**7 天最热** 和 **专栏文章** 参数生效。

:::

</Route>

### 个人主页文章

<Route author="Jeason0228" example="/guancha/personalpage/243983" path="/guancha/personalpage/:uid" :paramsDesc="['用户id， 可在URL中找到']" />

## 广告门

### 板块

<Route author="nczitzk" example="/adquan/info" path="/adquan/:type?" :paramsDesc="['分类, 置空为首页']">

| 行业观察 | 案例库   |
| -------- | -------- |
| info     | creative |

</Route>

## 国际教育研究所

### Blog

<Route author="nczitzk" example="/iie/blog" path="/iie/blog" />

## 国际能源署

### 新闻及活动

<Route author="nczitzk" example="/iea/news-and-events" path="/iea/:category?" :paramsDesc="['分类，见下表，默认为 Featured']">

| Featured        | News | Calendar | Past events |
| --------------- | ---- | -------- | ----------- |
| news-and-events | news | calendar | past-events |

</Route>

## 国际数学联合会

### 菲尔兹奖

<Route author="nczitzk" example="/mathunion/fields-medal" path="/mathunion/fields-medal"/>

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

## 贾真的电商 108 将

### 「108 将」实战分享

<Route author="nczitzk" example="/jiazhen108" path="/jiazhen108" />

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

## 九三学社

### 分类

<Route author="nczitzk" example="/93/lxzn-yzjy" path="/93/:category?" :paramsDesc="['分类，可在对应分类页的 URL 中找到']"/>

## 巨潮资讯

<Route author="LogicJake hillerliao laampui nczitzk" example="/cninfo/announcement/szse/000002/gssz0000002/category_ndbg_szsh" path="/cninfo/announcement/:column/:code/:orgId/:category?/:search?" :paramsDesc="['szse 深圳证券交易所; sse 上海证券交易所; third 新三板; hke 港股; fund 基金', '股票或基金代码', 'orgId 组织 id', '公告分类，A 股及新三板，见下表，默认为全部', '标题关键字，默认为空']">

column 为 szse 或 sse 时可选的 category:

| 全部 | 年报               | 半年报              | 一季报              | 三季报              | 业绩预告              | 权益分派               | 董事会              | 监事会              | 股东大会           | 日常经营           | 公司治理           | 中介报告         | 首发             | 增发             | 股权激励           | 配股             | 解禁             | 公司债             | 可转债             | 其他融资           | 股权变动           | 补充更正           | 澄清致歉           | 风险提示           | 特别处理和退市       | 退市整理期          |
| ---- | ------------------ | ------------------- | ------------------- | ------------------- | --------------------- | ---------------------- | ------------------- | ------------------- | ------------------ | ------------------ | ------------------ | ---------------- | ---------------- | ---------------- | ------------------ | ---------------- | ---------------- | ------------------ | ------------------ | ------------------ | ------------------ | ------------------ | ------------------ | ------------------ | -------------------- | ------------------- |
| all  | category_ndbg_szsh | category_bndbg_szsh | category_yjdbg_szsh | category_sjdbg_szsh | category_yjygjxz_szsh | category_qyfpxzcs_szsh | category_dshgg_szsh | category_jshgg_szsh | category_gddh_szsh | category_rcjy_szsh | category_gszl_szsh | category_zj_szsh | category_sf_szsh | category_zf_szsh | category_gqjl_szsh | category_pg_szsh | category_jj_szsh | category_gszq_szsh | category_kzzq_szsh | category_qtrz_szsh | category_gqbd_szsh | category_bcgz_szsh | category_cqdq_szsh | category_fxts_szsh | category_tbclts_szsh | category_tszlq_szsh |

column 为 third 时可选的 category:

| 全部 | 临时公告      | 定期公告      | 中介机构公告  | 持续信息披露  | 首次信息披露  |
| ---- | ------------- | ------------- | ------------- | ------------- | ------------- |
| all  | category_lsgg | category_dqgg | category_zjjg | category_cxpl | category_scpl |

::: tip 提示

需要筛选多个 category 时，应使用 `;` 将多个字段连接起来。

如 “年报 + 半年报” 即 `category_ndbg_szsh;category_bndbg_szsh`

:::

</Route>

## 决胜网

### 最新资讯

<Route author="WenryXu" example="/juesheng" path="/juesheng"/>

## 看点快报

### 首页

<Route author="nczitzk" example="/kuaibao" path="/kuaibao/index"/>

## 科技島讀

### 分類

<Route author="nczitzk" example="/daodu" path="/daodu/:caty?" :paramsDesc="['分類，默認為全部']">

| 全部 | 文章    | Podcast |
| ---- | ------- | ------- |
| all  | article | podcast |

</Route>

## 科学网

### 博客

<Route author="nczitzk" example="/sciencenet/blog" path="/sciencenet/blog/:type?/:time?/:sort?" :paramsDesc="['类型，见下表，默认为推荐', '时间，见下表，默认为所有时间', '排序，见下表，默认为按发表时间排序']">

类型

| 精选      | 最新 | 热门 |
| --------- | ---- | ---- |
| recommend | new  | hot  |

时间

| 36 小时内精选博文 | 一周内精选博文 | 一月内精选博文 | 半年内精选博文 | 所有时间精选博文 |
| ----------------- | -------------- | -------------- | -------------- | ---------------- |
| 1                 | 2              | 3              | 4              | 5                |

排序

| 按发表时间排序 | 按评论数排序 | 按点击数排序 |
| -------------- | ------------ | ------------ |
| 1              | 2            | 3            |

</Route>

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

### 24 小时热门

<Route author="xyqfer" example="/laosiji/hot" path="/laosiji/hot"/>

### 节目

<Route author="xyqfer" example="/laosiji/hotshow/128" path="/laosiji/hotshow/:id" :paramsDesc="['节目 id']"/>

## 留园网

### 分站

<Route author="nczitzk" example="/6park" path="/6park/:id?" :paramsDesc="['分站，见下表，默认为史海钩沉']">

| 婚姻家庭 | 魅力时尚 | 女性频道 | 生活百态 | 美食厨房 | 非常影音 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| life9    | life1    | chan10   | life2    | life6    | fr       |

| 车迷沙龙 | 游戏天地 | 卡通漫画 | 体坛纵横 | 运动健身 | 电脑前线 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| enter7   | enter3   | enter6   | enter5   | sport    | know1    |

| 数码家电 | 旅游风向 | 摄影部落 | 奇珍异宝 | 笑口常开 | 娱乐八卦 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| chan6    | life7    | chan8    | page     | enter1   | enter8   |

| 吃喝玩乐 | 文化长廊 | 军事纵横 | 百家论坛 | 科技频道 | 爱子情怀 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| netstar  | life10   | nz       | other    | chan2    | chan5    |

| 健康人生 | 博论天下 | 史海钩沉 | 网际谈兵 | 经济观察 | 谈股论金 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| life5    | bolun    | chan1    | military | finance  | chan4    |

| 杂论闲侃 | 唯美乐园 | 学习园地 | 命理玄机 | 宠物情缘 | 网络歌坛 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| pk       | gz1      | gz2      | gz3      | life8    | chan7    |

| 音乐殿堂 | 情感世界 |
| -------- | -------- |
| enter4   | life3    |

::: tip 提示

酷 18 文档参见 [此处](https://docs.rsshub.app/picture.html#ku-18)

禁忌书屋文档参见 [此处](https://docs.rsshub.app/reading.html#jin-ji-shu-wu)

:::

</Route>

### 精华区

<Route author="nczitzk" example="/6park/chan1/gold" path="/6park/:id/gold" :paramsDesc="['分站，见上表']"/>

### 搜索关键字

<Route author="nczitzk" example="/6park/chan1/keywords/都市" path="/6park/:id/keywords/:keyword?" :paramsDesc="['分站，见上表', '关键字']"/>

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

## 美国半导体行业协会

### 新闻

<Route author="nczitzk" example="/semiconductors/latest-news" path="/semiconductors/latest-news"/>

## 美国大学和雇主协会

### 博客

<Route author="nczitzk" example="/nace/blog" path="/nace/blog/:sort?" :paramsDesc="['排序，见下表，默认为 Most Recent']">

| Most Recent | Top Rated | Most Read     |
| ----------- | --------- | ------------- |
|             | top-blogs | mostreadblogs |

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

## 求是网

### 分类

<Route author="nczitzk" example="/qstheory" path="/qstheory/:category?" :paramsDesc="['分类，见下表']">

| 网评 | 视频 | 原创   | 经济    | 政治     | 文化    | 社会    | 党建 | 科教    | 生态    | 国防    | 国际          | 图书  | 学习笔记 |
| ---- | ---- | ------ | ------- | -------- | ------- | ------- | ---- | ------- | ------- | ------- | ------------- | ----- | -------- |
| qswp | qssp | qslgxd | economy | politics | culture | society | cpc  | science | zoology | defense | international | books | xxbj     |

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

## 生命时报

### 栏目

<Route author="nczitzk" example="/lifetimes" path="/lifetimes/:category?" :paramsDesc="['栏目，见下表，默认为新闻']">

| 新闻 | 医药     | 养生            | 生活 | 母亲行动 | 长寿      | 视频  | 时评         | 调查    | 产业经济 |
| ---- | -------- | --------------- | ---- | -------- | --------- | ----- | ------------ | ------- | -------- |
| news | medicine | healthpromotion | life | mothers  | longevity | video | news-comment | hotspot | industry |

</Route>

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

## 通識・現代中國

### 議題熱話

<Route author="nczitzk" example="/chiculture/topic" path="/chiculture/topic/:category?" :paramsDesc="['分类，见下表，默认为全部']">

| 全部 | 現代中國 | 今日香港 | 全球化 | 一周時事通識 |
| ---- | -------- | -------- | ------ | ------------ |
|      | 76       | 479      | 480    | 379          |

</Route>

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

## 晚点 LatePost

<Route author="HaitianLiu nczitzk" example="/latepost" path="/latepost/:proma?" :paramsDesc="['栏目 id，见下表，默认为最新报道']">

| 最新报道 | 晚点独家 | 人物访谈 | 晚点早知道 | 长报道 |
| -------- | -------- | -------- | ---------- | ------ |
|          | 1        | 2        | 3          | 4      |

</Route>

## 万联网

### 资讯

<Route author="kt286" example="/10000link/news/My01" path="/10000link/news/:category?" :paramsDesc="['栏目代码, 默认为全部']">

| 全部 | 天下大势 | 企业动态 | 专家观点 | 研究报告 |
| ---- | -------- | -------- | -------- | -------- |
| (空) | My01     | My02     | My03     | My04     |

</Route>

## 網路天文館

### 天象預報

<Route author="nczitzk" example="/tam/forecast" path="/tam/forecast"/>

## 网易号

### 更新

<Route author="HendricksZheng" example="/netease/dy/W4983108759592548559" path="/netease/dy/:id" :paramsDesc="['网易号 ID', '见如下说明']">

1.  在[网易号搜索页面](https://dy.163.com/v2/media/tosearch.html) 搜索想要订阅的网易号。
2.  打开网易号的任意文章。
3.  查看源代码，搜索 `data-wemediaid`，查看紧随其后的引号内的属性值（类似 `W1966190042455428950`）即为网易号 ID。

</Route>

## 网易号（通用）

优先使用方法一，若是网易号搜索页面搜不到的小众网易号（文章页面不含`data-wemediaid`）则可使用此法。
触发反爬会只抓取到标题，建议自建。
<Route author="mjysci" example="/netease/dy2/T1555591616739" path="/netease/dy2/:id" :paramsDesc="['id，该网易号主页网址最后一项html的文件名']" anticrawler="1"/> 

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

### 专栏

<Route author="Solist-X" example="/netease/news/special/1" path="/netease/news/special/:type?" :paramsDesc="['栏目']">

| 轻松一刻 | 槽值 | 人间 | 大国小民 | 三三有梗 | 数读 | 看客 | 下划线 | 谈心社 | 哒哒 | 胖编怪聊 | 曲一刀 | 今日之声 | 浪潮 | 沸点 |
| -------- | ---- | ---- | -------- | -------- | ---- | ---- | ------ | ------ | ---- | -------- | ------ | -------- | ---- | ---- |
| 1        | 2    | 3    | 4        | 5        | 6    | 7    | 8      | 9      | 10   | 11       | 12     | 13       | 14   | 15   |

</Route>

## 维基百科

### 中国大陆新闻动态

<Route author="HenryQW" example="/wikipedia/mainland" path="/wikipedia/mainland"/>

## 未名新闻

### 分类

<Route author="nczitzk" example="/mitbbs" path="/mitbbs/:caty?" :paramsDesc="['新闻分类，参见下表，默认为“新闻大杂烩”']">

| 新闻大杂烩 | 军事     | 国际   | 体育 | 娱乐 | 科技 | 财经    |
| ---------- | -------- | ------ | ---- | ---- | ---- | ------- |
|            | zhongguo | haiwai | tiyu | yule | keji | caijing |

</Route>

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

<Route author="sanmmm" example="/wechat/ershicimi/813oxJOl" path="/wechat/ershicimi/:id" :paramsDesc="['公众号id, 打开公众号页, 在 URL 中找到 id']" anticrawler="1"/>

### 公众号 (外接大脑来源)

<Route author="BugWriter2" example="/wechat/wjdn/5d5e683c82339df472988f59" path="/wechat/wjdn/:id" :paramsDesc="['公众号 id, 打开公众号页, 在 URL 中找到 id']"/>

### 公众号 (wxnmh.com 来源)

<Route author="laampui" example="/wechat/wxnmh/51798" path="/wechat/wxnmh/:id" :paramsDesc="['公众号 id, 打开 wxnmh.com, 在 URL 中找到 id']"/>

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

## 无产者评论

### 分类

<Route author="nczitzk" example="/proletar" path="/proletar/categories/:id?" :paramsDesc="['分类，见下表，默认为全部文章']">

| 全部文章 | 中流击水 | 革命文艺 | 当代中国 | 理论视野 | 国际观察 | 史海沉钩 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- |
|          | 中流击水 | 革命文艺 | 当代中国 | 理论视野 | 国际观察 | 史海沉钩 |

</Route>

### 标签

<Route author="nczitzk" example="/proletar" path="/proletar/tags/:id?" :paramsDesc="['标签，默认为全部文章']">

::: tip 提示

标签名参见 [所有标签](https://review.proletar.ink/tags)

:::

</Route>

## 西祠胡同

### 频道

<Route author="LogicJake" example="/xici" path="/xici/:id?" :paramsDesc="['频道id，默认为首页推荐']">

| 首页推荐 | 民生 | 情感 | 亲子 |
| -------- | ---- | ---- | ---- |
| (空)     | ms   | qg   | qz   |

</Route>

## 橡树岭国家实验室

### 新闻

<Route author="nczitzk" example="/ornl/news" path="/ornl/news"/>

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

## 有趣天文奇观

### 首页

<Route author="nczitzk" example="/interesting-sky" path="/interesting-sky"/>

### 年度天象（天文年历）

<Route author="nczitzk" example="/interesting-sky/astronomical_events" path="/interesting-sky/astronomical_events/:year?" :paramsDesc="['年份，默认为当前年份']"/>

### 近期事件专题

<Route author="nczitzk" example="/interesting-sky/recent-interesting" path="/interesting-sky/recent-interesting"/>

## 游戏葡萄

无文章正文，仅有目录索引。

### 全部文章

<Route author="KotoriK" example="/gamegrape" path="/gamegrape/index"/>

### 分类

例子对应[深度分类](http://youxiputao.com/article/index/id/13)
<Route author="KotoriK" example="/gamegrape/13" path="/gamegrape/:id?"/>

## 鱼塘热榜

<Route author="TheresaQWQ" example="/mofish/2" path="/mofish/:id" :paramsDesc="['分类id，可以在 https://api.tophub.fun/GetAllType 获取']" />
## 遠見

<Route author="laampui" example="/gvm/index/health" path="/gvm/index/:category?" :paramsDesc="['見下表, 默認爲 newest']">

| 最新文章 | 你可能會喜歡 | 名家專欄 | 專題  | 時事熱點 | 政治     | 社會    | 人物報導 | 國際  | 全球焦點    | 兩岸                  | 金融理財 | 投資理財   | 保險規劃  | 退休理財 | 金融 Fintech | 房地產      | 總體經濟 | 科技 | 科技趨勢   | 能源   | 產經     | 傳產     | 消費服務 | 生技醫藥 | 傳承轉型                   | 創業新創 | 管理       | 農業        | 教育      | 高教             | 技職          | 親子教育 | 國際文教        | 體育   | 好享生活 | 時尚設計 | 心靈成長    | 藝文影視 | 旅遊   | 環境生態    | 健康   | 美食 | 職場生涯 | 調查   | 縣市   | CSR |
| -------- | ------------ | -------- | ----- | -------- | -------- | ------- | -------- | ----- | ----------- | --------------------- | -------- | ---------- | --------- | -------- | ------------ | ----------- | -------- | ---- | ---------- | ------ | -------- | -------- | -------- | -------- | -------------------------- | -------- | ---------- | ----------- | --------- | ---------------- | ------------- | -------- | --------------- | ------ | -------- | -------- | ----------- | -------- | ------ | ----------- | ------ | ---- | -------- | ------ | ------ | --- |
| newest   | recommend    | opinion  | topic | news     | politics | society | figure   | world | world_focus | cross_strait_politics | money    | investment | insurance | retire   | fintech      | real_estate | economy  | tech | tech_trend | energy | business | industry | service  | medical  | family_business_succession | startup  | management | agriculture | education | higher_education | technological | parent   | world_education | sports | life     | art      | self_growth | film     | travel | environment | health | food | career   | survey | county | csr |

</Route>

## 中国计算机学会

### 新闻

<Route author="nczitzk" example="/ccf/news" path="/ccf/news/:category?" :paramsDesc="['分类，见下表，默认为 CCF 新闻']">

| CCF 新闻   | CCF 聚焦 | ACM 信息 |
| ---------- | -------- | -------- |
| Media_list | Focus    | ACM_News |

</Route>

## 中国机械工程学会

### 学会新闻

<Route author="nczitzk" example="/cmes/news" path="/cmes/news/:category?" :paramsDesc="['分类，见下表，默认为 学会要闻']">

| 学会要闻    | 学会动态 | 科技新闻 |
| ----------- | -------- | -------- |
| Information | Dynamics | TechNews |

</Route>

## 中国科学院青年创新促进会

### 最新博文

<Route author="nczitzk" example="/yicas/blog" path="/yicas/blog"/>

## 中国劳工观察

### 调查报告

<Route author="nczitzk" example="/chinalaborwatch/reports" path="/chinalaborwatch/reports/:lang?/:industry?" :paramsDesc="['语言，默认为英语，可选 `cn` 即 简体中文', '行业 id，见下表，默认为全部']">

| 全部 | 制鞋 | 印刷 | 厨具 | 家具 | 服饰 | 汽车制造 | 玩具 | 电子产品 | 综合 | 零售 |
| ---- | ---- | ---- | ---- | ---- | ---- | -------- | ---- | -------- | ---- | ---- |
|      | 2    | 6    | 14   | 3    | 4    | 10       | 8    | 1        | 9    | 7    |

</Route>

## 中国劳工通讯

### 评论与特写

<Route author="nczitzk" example="/clb/commentary" path="/clb/commentary/:lang?" :paramsDesc="['语言，默认为简体中文，可选 `en` 即英文']"/>

## 眾新聞

### 眾聞

<Route author="nczitzk" example="/hkcnews/news" path="/hkcnews/news/:category?" :paramsDesc="['分类，见下表，默认为全部']">

| 全部 | 經濟 | 社會 | 生活 | 政治 | 國際 | 台灣 | 人物 | 中國 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
|      | 13   | 15   | 14   | 12   | 16   | 20   | 21   | 19   |

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
