---
pageClass: routes
---

# 其他

## 36kr

### 搜索文章

<Route author="xyqfer kt286" example="/36kr/search/article/ofo" path="/36kr/search/article/:keyword" :paramsDesc="['关键字']" />

## 99% Invisible

### Transcript

<Route author="Ji4n1ng" example="/99percentinvisible/transcript" path="/99percentinvisible/transcript"/>

## 9To5

### 9To5 分站

<Route author="HenryQW" example="/9to5/mac" path="/9to5/:type" :paramsDesc="['分站名字']">

支持分站：
| Mac | Google | Toys |
| --- | ------ | ---- |
| Mac | Google | Toys |

</Route>

## Apple

### 更换和维修扩展计划

<Route author="metowolf HenryQW" example="/apple/exchange_repair" path="/apple/exchange_repair/:country?" :paramsDesc="['苹果官网 URL 中的国家代码, 默认中国 `cn`']"/>

### App Store/Mac App Store

见 [#app-store-mac-app-store](/program-update.html#app-store-mac-app-store)

## archdaily

### 首页

<Route author="kt286" example="/archdaily" path="/archdaily"/>

## AutoTrader

### 搜索结果

<Route author="HenryQW" example="/autotrader/radius=50&postcode=sw1a1aa&onesearchad=Used&onesearchad=Nearly%20New&onesearchad=New&price-to=9000&year-from=2012&body-type=Hatchback&transmission=Automatic&exclude-writeoff-categories=on" path="/autotrader/:query" :paramsDesc="['查询语句']">

1. 在 AutoTrader 选择筛选条件进行搜索
1. 复制查询结果 URL 中`?`后的部分，例如 `https://www.autotrader.co.uk/car-search?radius=50&postcode=sw1a1aa&onesearchad=Used&onesearchad=Nearly%20New&onesearchad=New&price-to=9000&year-from=2012&body-type=Hatchback&transmission=Automatic&exclude-writeoff-categories=on` 则为 `radius=50&postcode=sw1a1aa&onesearchad=Used&onesearchad=Nearly%20New&onesearchad=New&price-to=9000&year-from=2012&body-type=Hatchback&transmission=Automatic&exclude-writeoff-categories=on`

</Route>

## BOF

### 首页

<Route author="kt286" example="/bof/home" path="/bof/home" />

## checkee.info

### 美国签证 check 动态

<Route author="lalxyy" example="/checkee/2019-03" path="/checkee/:month" :paramsDesc="['签证被 check 的年份-月份，如 2019-03']" />

## cnBeta

### 最新

<Route author="kt286" example="/cnbeta" path="/cnbeta"/>

## Dilbert Comic Strip

<Route name="Daily Strip" author="Maecenas" example="/dilbert/strip" path="/dilbert/strip">

通过提取漫画，提供比官方源更佳的阅读体验。

</Route>

## DoNews

### 栏目

<Route author="HenryQW" example="/donews" path="/donews/:column?" :paramsDesc="['栏目代码, 默认为首页.']">

| 首页 | 商业    | 创业     | 互娱 | 科技       | 专栏    |
| ---- | ------- | -------- | ---- | ---------- | ------- |
| (空) | company | business | ent  | technology | idonews |

</Route>

## Google

### 谷歌学术关键词更新

<Route author="HenryQW" example="/google/scholar/data+visualization" path="/google/scholar/:query" :paramsDesc="['查询语句, 支持「简单」和「高级」两种模式:']" crawlerBadge="1">

1. 简单模式, 例如「data visualization」, <https://rsshub.app/google/scholar/data+visualization>.
2. 高级模式, 前往 [Google Scholar](https://scholar.google.com/schhp?hl=zh-cn&as_sdt=0,5), 点击左上角, 选择高级搜索并提交查询. 此时 URL 应为: <https://scholar.google.com/scholar?as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=zh-CN&as_sdt=0%2C5>, 复制`https://scholar.google.com/scholar?`后的所有语句作为本路由的查询参数. 例子所对应的完整路由为<https://rsshub.app/google/scholar/as_q=data+visualization&as_epq=&as_oq=&as_eq=&as_occt=any&as_sauthors=&as_publication=&as_ylo=2018&as_yhi=&hl=zh-CN&as_sdt=0%2C5>.

</Route>

### 谷歌学术作者引用更新

<Route author="KellyHwong" example="/google/citations/mlmE4JMAAAAJ" path="/google/citations/:id" crawlerBadge="1">

路由中的参数 id，即用户谷歌学术引用页面 url 中的 id，如 https://scholar.google.com/citations?hl=zh-CN&user=mlmE4JMAAAAJ 中 user= 后的 mlmE4JMAAAAJ。

</Route>

### Google Doodles

<Route author="xyqfer" example="/google/doodles/zh-CN" path="/google/doodles/:language?" :paramsDesc="['语言，默认为`zh-CN`简体中文，如需其他语言值可从[Google Doodles 官网](https://www.google.com/doodles)获取']" />

## gradCafe

### gradCafe result

<Route author="liecn" example="/gradcafe/result" path="/gradcafe/result" />

### gradCafe result by key words

<Route author="liecn" example="/gradcafe/result/computer" path="/gradcafe/result/:type" :paramsDesc="['按关键词进行搜索，如 computer']"/>

## Hexo

### Next 主题博客

<Route author="fengkx" example="/hexo/next/fengkx.top" path="/hexo/next/:url" :paramsDesc="['博客 Url 不带协议头']"/>

### Yilia 主题博客

<Route author="aha2mao" example="/hexo/yilia/cloudstone.xin" path="/hexo/yilia/:url" :paramsDesc="['博客 Url 不带协议头']"/>

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

## Instapaper

### 个人分享

<Route author="LogicJake" example="/instapaper/person/viridiano" path="/instapaper/person"/>

## IT 桔子

### 投融资事件

<Route author="xyqfer" example="/itjuzi/invest" path="/itjuzi/invest"/>

### 并购事件

<Route author="xyqfer" example="/itjuzi/merge" path="/itjuzi/merge"/>

## Keep

### 运动日记

<Route author="Dectinc DIYgod" example="/keep/user/556b02c1ab59390afea671ea" path="/keep/user/:id" :paramsDesc="['Keep 用户 id']"/>

## MobData

### 分析报告

<Route author="brilon" example="/mobdata/report" path="/mobdata/report"/>

## NBA

### 头条新闻

<Route author="alizeegod" example="/nba/app_news" path="/nba/app_news"/>

## ONE · 一个

### 图片文字问答

<Route author="fengkx" example="/one" path="/one"/>

## Readhub

### 分类

<Route author="WhiteWorld" example="/readhub/category/topic" path="/readhub/category/:category" :paramsDesc="['分类名']">

| 热门话题 | 科技动态 | 开发者资讯 | 区块链快讯 | 每日早报 |
| -------- | -------- | ---------- | ---------- | -------- |
| topic    | news     | technews   | blockchain | daily    |

</Route>

## sixthtone

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

## TSSstatus（iOS 降级通道）

### Status

<Route author="xyqfer" example="/tssstatus/j42dap/14W585a" path="/tssstatus/:board/:build" :paramsDesc="['平台 id', '版本 id']">

board 和 build 可在[这里](http://api.ineal.me/tss/status)查看

</Route>

## UI 中国

### 推荐文章

<Route author="WenryXu" example="/ui-cn/article" path="/ui-cn/article"/>

### 个人作品

<Route author="WenryXu" example="/ui-cn/user/85974" path="/ui-cn/user/:id" :paramsDesc="['用户id']"/>

## WeGene

### 最近更新

<Route author="LogicJake" example="/wegene/newest" path="/wegene/newest"/>
### 栏目

<Route author="LogicJake" example="/wegene/column/all/all" path="/wegene/column/:type/:category" :paramsDesc="['栏目类型，all（全部项目） 或 weapp（专业版）','栏目分类']">

:::
type 为 all 时，category 参数不支持 cost 和 free
:::

| 全部 | 祖源分析 | 付费 | 遗传性疾病 | 药物指南 | 免费 | 运动基因 | 营养代谢   | 心理特质   | 健康风险 | 皮肤特性 | 遗传特征 |
| ---- | -------- | ---- | ---------- | -------- | ---- | -------- | ---------- | ---------- | -------- | -------- | -------- |
| all  | ancestry | cost | disease    | drug     | free | genefit  | metabolism | psychology | risk     | skin     | traits   |

</Route>

## ZAKER

### source

<Route author="LogicJake" example="/zaker/source/12291" path="/zaker/source/:id" :paramsDesc="['source id，可在 URL 中找到']"/>

### channel

<Route author="kt286" example="/zaker/channel/13" path="/zaker/source/:id" :paramsDesc="['channel id，可在 URL 中找到']"/>

## 爱发电

### 发现用户

<Route author="sanmmm" example="/afdian/explore/hot/所有" path="/afdian/explore/:type/:category?" :paramsDesc="['分类', '目录类型, 默认为 `所有`']">
分类

| 最新 | 推荐 | 最热 |
| ---- | ---- | ---- |
| new  | rec  | hot  |

目录类型

| 所有 | 绘画 | 视频 | 写作 | 游戏 | 音乐 | 播客 | 摄影 | 技术 | Vtuber | 舞蹈 | 体育 | 旅游 | 美食 | 时尚 | 数码 | 动画 | 其他 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ------ | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 所有 | 绘画 | 视频 | 写作 | 游戏 | 音乐 | 播客 | 摄影 | 技术 | Vtuber | 舞蹈 | 体育 | 旅游 | 美食 | 时尚 | 数码 | 动画 | 其他 |

</Route>

## 爱范儿 ifanr

### 爱范儿频道

<Route author="HenryQW" example="/ifanr/app" path="/ifanr/:channel?" :paramsDesc="['默认 app，部分频道如下']">

-   频道为单一路径, 如 https://www.ifanr.com/`coolbuy` 则为 `/ifanr/coolbuy`.
-   频道包含多重路径, 如 https://www.ifanr.com/`category/intelligentcar` 则替换 `/` 为 `-` `/ifanr/category-intelligentcar`.

| AppSolution | 玩物志  | 董车会                  |
| ----------- | ------- | ----------------------- |
| app         | coolbuy | category-intelligentcar |

</Route>

## 艾瑞

### 产业研究报告

<Route author="brilon" example="/iresearch/report" path="/iresearch/report"/>

## 巴比特

### 作者专栏

<Route author="kt286" example="/8btc/45703" path="/8btc/:authorid" :paramsDesc="['作者ID，可在对应专辑页面的 URL 中找到']"/>

## 百度

### 百度趣画

<Route author="xyqfer" example="/baidu/doodles" path="/baidu/doodles"/>

### 搜索风云榜

<Route author="xyqfer" example="/baidu/topwords/1" path="/baidu/topwords/:boardId?" :paramsDesc="['榜单 id, 默认为`1`']">

| 实时热点 | 今日热点 | 七日热点 | 民生热点 | 娱乐热点 | 体育热点 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| 1        | 341      | 42       | 342      | 344      | 11       |

</Route>

## 北京天文馆

### 每日一图

<Route author="HenryQW" example="/bjp/apod" path="/bjp/apod"/>

## 毕马威

### 洞察

<Route author="LogicJake" example="/kpmg/insights" path="/kpmg/insights" />

## 播客 IBC 岩手放送｜ IBC ラジオ　イヤーマイッタマイッタ

### IBC 岩手放送｜ IBC ラジオ　イヤーマイッタマイッタ

<Route author="fengkx" example="/maitta" path="/maitta" supportPodcast="1" />

## 财新博客

### 用户博客

<Route author="Maecenas" example="/caixin/blog/zhangwuchang" path="/caixin/blog/:column" :paramsDesc="['博客名称，可在博客主页的 URL 找到']">

通过提取文章全文，以提供比官方源更佳的阅读体验.

</Route>

## 抽屉

### 新热榜

<Route author="xyqfer" example="/chouti/hot" path="/chouti/:subject?" :paramsDesc="['主题名称']">

| 热榜 | 42 区 | 段子  | 图片 | 挨踢 1024 | 你问我答 |
| ---- | ----- | ----- | ---- | --------- | -------- |
| hot  | news  | scoff | pic  | tec       | ask      |

</Route>

## 创业邦

### 作者

<Route author="xyqfer" example="/cyzone/author/1225562" path="/cyzone/author/:id" :paramsDesc="['作者 id']"/>

### 标签

<Route author="LogicJake" example="/cyzone/label/创业邦周报" path="/cyzone/label/:name" :paramsDesc="['标签名称']"/>

## 大侠阿木

### 首页

<Route author="kt286" example="/daxiaamu/home" path="/daxiaamu/home"/>

## 大众点评

### 用户

<Route author="brilon"  example="/dianping/user/35185271" path="/dianping/user/:id" :paramsDesc="['用户id，可在 URL 中找到']"/>

## 电商在线

### 电商在线

<Route author="LogicJake" example="/imaijia/category/xls" path="/imaijia/category/:category" :paramsDesc="['类别id，可在 URL 中找到']" />

## 懂球帝

::: tip 提示

-   可以通过头条新闻+参数过滤的形式获得早报、专题等内容。
-   不支持 gif 集锦播放

:::

### 头条新闻

<Route author="dxmpalb" example="/dongqiudi/top_news" path="/dongqiudi/top_news"/>

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

## 飞地

### 分类

<Route author="LogicJake" example="/enclavebooks/category/1" path="/enclavebooks/category/:id" :paramsDesc="['类别 id，可在[分类api](https://app.enclavebooks.cn/v2/discovery)返回数据中的category查看']"/>

## 福利资源-met.red

### 福利资源-met.red

<Route author="junfengP" example="/metred/fuli" path="/metred/fuli" />

## 个人博客

### 敬维

<Route author="a180285" example="/blogs/jingwei.link" path="/blogs/jingwei.link"/>

### 王垠-当然我在扯淡

<Route author="junbaor" example="/blogs/wangyin" path="/blogs/wangyin"/>

## 古诗文网

### 首页推荐

<Route author="LogicJake" example="/gushiwen/recommend" path="/gushiwen/recommend"/>

## 观察者风闻话题

### 观察者风闻话题

<Route author="occupy5" example="/guanchazhe/topic/113" path="/guanchazhe/topic/:id" :paramsDesc="['话题id， 可在URL中找到']" />

## 果壳网

### 科学人

<Route author="alphardex" example="/guokr/scientific" path="/guokr/scientific"/>

## 后续

### Live

<Route author="ciaranchen" example="/houxu/live/5/original" path="/houxu/live/:id/:timeline?" :paramsDesc="['Live ID', '时间线筛选条件。默认为all。']">

| 全部 | 原创     | 精选     |
| ---- | -------- | -------- |
| all  | original | featured |

</Route>

### 最新 Live

<Route author="ciaranchen" example="/houxu/lives/new" path="/houxu/lives/:type" :paramsDesc="['类型']">

| Live 实时（往事进展） | 最近 Live（最新关注） |
| --------------------- | --------------------- |
| realtime              | new                   |

</Route>

### 最新专栏

<Route author="ciaranchen" example="/houxu/events" path="/houxu/events"/>

## 虎嗅

### 标签

<Route author="xyqfer HenryQW" example="/huxiu/tag/291" path="/huxiu/tag/:id" :paramsDesc="['标签 id']" />

### 搜索

<Route author="xyqfer HenryQW" example="/huxiu/search/%E8%99%8E%E5%97%85%E6%97%A9%E6%8A%A5" path="/huxiu/search/:keyword" :paramsDesc="['关键字']" />

### 作者

<Route author="HenryQW" example="/huxiu/author/29318" path="/huxiu/author/:id" :paramsDesc="['用户 id']" />

## 汇通网

### 7x24 小时快讯

<Route author="occupy5" example="/fx678/kx" path="/fx678/kx" />

## 惠誉评级

### 板块信息

<Route author="LogicJake" example="/fitchratings/site/economics" path="/fitchratings/site/:type" :paramsDesc="['板块名称，在网址 site 后面']"/>

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

## 巨潮资讯

### 公司公告

<Route author="LogicJake" example="/cninfo/stock_announcement/000410" path="/cninfo/stock_announcement/:code" :paramsDesc="['股票代码']"/>

## 决胜网

### 最新资讯

<Route author="WenryXu" example="/juesheng" path="/juesheng"/>

## 空气质量

### 实时 AQI

<Route author="xapool" example="/aqicn/beijing" path="/aqicn/:city" :paramsDesc="['城市拼音或地区 ID，详见[aqicn.org](http://aqicn.org/city/)']"/>

## 快科技（原驱动之家）

### 最新新闻

<Route author="kt286" example="/kkj/news" path="/kkj/news"/>

## 老司机

### 首页

<Route author="xyqfer" example="/laosiji/feed" path="/laosiji/feed"/>
### 24小时热门

<Route author="xyqfer" example="/laosiji/hot" path="/laosiji/hot"/>
### 节目

<Route author="xyqfer" example="/laosiji/hotshow/128" path="/laosiji/hotshow/:id" :paramsDesc="['节目 id']"/>

## 裏垢女子まとめ

### 主页

<Route author="SettingDust"  example="/uraaka-joshi" path="/uraaka-joshi"/>

### 用户

<Route author="SettingDust"  example="/uraaka-joshi/_rrwq" path="/uraaka-joshi/:id" :paramsDesc="['用户名']"/>

## 洛谷

### 日报

<Route author="LogicJake" example="/luogu/daily" path="/luogu/daily/:id?" :paramsDesc="['年度日报所在帖子id，可在 URL 中找到，不填默认为2019年日报']"/>

## 马良行

### 马良行

<Route author="junfengP" example="/mlhang" path="/mlhang" />

## 镁客网 im2maker

### 镁客网频道

<Route author="jin12180000" example="/im2maker/" path="/im2maker/:channel?" :paramsDesc="['默认不填为 最新文章 ，频道如下']">

| 最新文章 | 行业快讯 | 行业观察 | 镁客请讲 | 硬科技 100 人 | 投融界   | 万象       |
| -------- | -------- | -------- | -------- | ------------- | -------- | ---------- |
| 默认空   | fresh    | industry | talk     | intech        | investor | everything |

</Route>

## 每日安全

### 推送

<Route author="LogicJake" example="/security/pulses" path="/security/pulses"/>

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

## 且听风吟福利

### 分类

<Route author="qiwihui" example="/qtfyfl/guoji" path="/qtfyfl/:category" :paramsDesc="['分类，可在 URL 中找到']">

| 最新文章 | 福利社  | 求出处    | 套图集  | 门事件     | 内涵图   | 电影下载       | 影视资讯 |
| -------- | ------- | --------- | ------- | ---------- | -------- | -------------- | -------- |
| latest   | fulishe | qiuchuchu | taotuji | menshijian | neihantu | dianyingxiazai | yingshi  |

| 电视剧下载 | 动漫下载 | 电影彩蛋 | 影视剧情 | 涨姿势     | 娱乐 | 明星八卦 | 音乐歌曲 |
| ---------- | -------- | -------- | -------- | ---------- | ---- | -------- | -------- |
| dianshiju  | dongman  | caidan   | juqing   | zhangzishi | yule | mingxing | music    |

| 游戏  | 电脑软件 | 实时热点     | 心灵鸡汤 | 符号大全 | 国际新闻 | 科技苑 | 其他  |
| ----- | -------- | ------------ | -------- | -------- | -------- | ------ | ----- |
| games | software | shishiredian | xljt     | fhdq     | xljt     | tech   | other |

</Route>

## 親子王國

### 板块

<Route author="LogicJake"  example="/babykingdom/19/view" path="/babykingdom/:id/:order?" :paramsDesc="['板块id，可在 URL 中找到', '排序方式']">

| 发帖时间 | 回复/查看 | 查看 | 最后发表 | 热门 |
| -------- | --------- | ---- | -------- | ---- |
| dateline | reply     | view | lastpost | heat |

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

### 用户收藏

<Route author="LogicJake" example="/woshipm/bookmarks/324696" path="/woshipm/bookmarks/:id" :paramsDesc="['用户 id']"/>

### 用户文章

<Route author="LogicJake" example="/woshipm/user_article/324696" path="/woshipm/user_article/:id" :paramsDesc="['用户 id']"/>

## 日报 | D2 资源库

### 日报 | D2 资源库

<Route author="Andiedie" example="/d2/daily" path="/d2/daily"/>

## 扇贝

### 打卡

<Route author="DIYgod" example="/shanbay/checkin/ddwej" path="/shanbay/checkin/:id" :paramsDesc="['用户 id']" />

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

<Route author="SunShinenny" example="/sspai/author/796518" path="/sspai/author/:id"  :paramsDesc="['作者 id，可在作者主页URL中找到']"/>

### 专题

<Route author="SunShinenny" example="/sspai/topics" path="/sspai/topics">
此为专题广场更新提示=>集合型而非单篇文章.与下方"专题内文章更新"存在明显区别!
</Route>

### 专题内文章更新

<Route author="SunShinenny" example="/sspai/topic/250" path="/sspai/topic/:id"  :paramsDesc="['专题 id，可在专题主页URL中找到']"/>

## 世界卫生组织

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

## 刷屏

### 最新

<Route author="xyqfer" example="/weseepro/newest" path="/weseepro/newest"/>
### 最新（无中间页）

<Route author="xyqfer yefoenix" example="/weseepro/newest-direct" path="/weseepro/newest-direct"/>
### 朋友圈

<Route author="xyqfer" example="/weseepro/circle" path="/weseepro/circle"/>

## 搜狗

### 搜狗特色 LOGO

<Route author="xyqfer" example="/sogou/doodles" path="/sogou/doodles"/>

## 探物

### 产品

<Route author="xyqfer" example="/tanwu/products" path="/tanwu/products"/>

## 淘股吧股票论坛

### 论坛总版

<Route author="emdoe" example="/taoguba/index" path="/taoguba/index"/>
### 用户博客

<Route author="emdoe" example="/taoguba/user/252069" path="/taoguba/user/:uid" :paramsDesc="['用户 id']" />

## 腾讯大家

### 首页

<Route author="xyqfer" example="/dajia" path="/dajia"/>
### 作者作品

<Route author="LogicJake" example="/dajia/author/404" path="/dajia/author/:uid" :paramsDesc="['作者id']"/>
### 专栏

<Route author="LogicJake" example="/dajia/zhuanlan/404" path="/dajia/zhuanlan/:uid" :paramsDesc="['专栏id']"/>

## 腾讯谷雨

### 栏目

<Route author="LogicJake" example="/tencent/guyu/channel/lab" path="/tencent/guyu/channel/:name" :paramsDesc="['栏目名称，包括lab，report，story，shalong']"/>

## 腾讯吐个槽

### 吐槽新帖

<Route author="Qixingchen" example="/tucaoqq/post/28564/CdRI0728" path="/tucaoqq/post/:project/:key" :paramsDesc="['产品 ID', '产品密钥']"/>

## 天津产权交易中心

### 产权转让

<Route author="kt286" example="/tprtc/cqzr" path="/tprtc/cqzr"/>

### 企业资产转让

<Route author="kt286" example="/tprtc/qyzc" path="/tprtc/qyzc"/>

### 新闻动态

<Route author="kt286" example="/tprtc/news" path="/tprtc/news"/>

## 推酷

### 周刊

<Route author="zpcc" example="/tuicool/mags/tech" path="/tuicool/mags/:type" :paramsDesc="['类型如下']">

| 编程狂人 | 设计匠艺 | 创业周刊 | 科技周刊 |
| -------- | -------- | -------- | -------- |
| prog     | design   | startup  | tech     |

</Route>

## 维基百科

### 中国大陆新闻动态

<Route author="HenryQW" example="/wikipedia/mainland" path="/wikipedia/mainland"/>

## 西祠胡同

### 频道

<Route author="LogicJake" example="/xici" path="/xici/:id?" :paramsDesc="['频道id，默认为首页推荐']">

| 首页推荐 | 民生 | 情感 | 亲子 |
| -------- | ---- | ---- | ---- |
| (空)     | ms   | qg   | qz   |

</Route>

## 下厨房

### 用户作品

<Route author="xyqfer" example="/xiachufang/user/cooked/103309404" path="/xiachufang/user/cooked/:id" :paramsDesc="['用户 id, 可在用户主页 URL 中找到']"/>

### 用户菜谱

<Route author="xyqfer" example="/xiachufang/user/created/103309404" path="/xiachufang/user/created/:id" :paramsDesc="['用户 id, 可在用户主页 URL 中找到']"/>

### 作品动态

<Route author="xyqfer" example="/xiachufang/popular/hot" path="/xiachufang/popular/:timeframe?" :paramsDesc="['默认最新上传']">

| 正在流行 | 24 小时最佳 | 本周最受欢迎 | 新秀菜谱 | 月度最佳   |
| -------- | ----------- | ------------ | -------- | ---------- |
| hot      | pop         | week         | rising   | monthhonor |

</Route>

## 香水时代

### 首页

<Route author="kt286" example="/nosetime/home" path="/nosetime/home"/>

### 香评

<Route author="kt286" example="/nosetime/59247733/discuss/new" path="/nosetime/:id/:type/:sort?" :paramsDesc="['用户id，可在用户主页 URL 中找到', '类型，short 一句话香评  discuss 香评', '排序， new 最新  agree 最有用']"/>

## 新浪专栏

### 创事记

<Route author="xapool" example="/sina/csj" path="/sina/csj"/>

## 异次元软件世界

### 首页

<Route author="kimi360" example="/iplay/home" path="/iplay/home"/>

## 移动支付网

### 新闻

<Route author="LogicJake" example="/mpaypass/news" path="/mpaypass/news"/>

### 分类

<Route author="zhuan-zhu" example="/mpaypass/main/policy" path="mpaypass/main/:type?"
:paramsDesc="['新闻类型,类型可在URL中找到，类似policy，eye等，空或其他任意值展示最新新闻']"/>

## 油价

### 今日油价

<Route author="xyqfer" example="/oilprice/shanghai" path="/oilprice/:area" :paramsDesc="['地区拼音，详见[成品油价格网](http://oil.usd-cny.com/)']"/>

## 语雀

### 知识库

<Route author="aha2mao" example="/yuque/doc/75258" path="/yuque/doc/:repo_id" :paramsDesc="['仓库id，可在对应知识库主页的`/api/books/${repo_id}/docs`请求里找到']">

| Node.js 专栏 | 阮一峰每周分享 | 语雀使用手册 |
| ------------ | -------------- | ------------ |
| 75258        | 102804         | 75257        |

</Route>

## 中国大学 MOOC(慕课)

### 最新

<Route author="xyqfer" example="/icourse163/newest" path="/icourse163/newest" />

## 中国银行

### 中国银行外汇牌价

<Route author="LogicJake HenryQW" example="/boc/whpj/zs?filter_title=%E8%8B%B1%E9%95%91" path="/boc/whpj/:format?" :paramsDesc="['输出的标题格式，默认为标题 + 所有价格。短格式仅包含货币名称。']">

| 短格式 | 中行折算价 | 现汇买卖 | 现钞买卖 | 现汇买入 | 现汇卖出 | 现钞买入 | 现钞卖出 |
| ------ | ---------- | -------- | -------- | -------- | -------- | -------- | -------- |
| short  | zs         | xh       | xc       | xhmr     | xhmc     | xcmr     | xcmc     |

</Route>

## 自如

### 房源

<Route author="DIYgod" example="/ziroom/room/sh/1/2/五角场" path="/ziroom/room/:city/:iswhole/:room/:keyword" :paramsDesc="['城市, 北京 bj; 上海 sh; 深圳 sz; 杭州 hz; 南京 nj; 广州 gz; 成都 cd; 武汉 wh; 天津 tj', '是否整租', '房间数', '关键词']"/>

## 紫竹张先生

### 全文

<Route author="HenryQW" example="/zzz" path="/zzz/index"/>
