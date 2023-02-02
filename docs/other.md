---
pageClass: routes
---

# 其他

## 4399 论坛

### 4399 论坛

<Route author="DIYgod" example="/forum4399/mtag-83932" path="/forum4399/:mtag" :paramsDesc="['mtag,必选-论坛网址最后的mtag字段']" selfhost="1"/>

::: warning 注意

需要用户 cookie 值，详情见部署页面的配置模块。

:::

</Route>

## acwifi 路由器交流

### 新闻

<Route author="cc798461" example="/acwifi" path="/acwifi"/>

## Amazfit Watch Faces

手表型号可在网站中选择后到地址栏查看

| Amazfit Bip | Amazfit Cor | Amazfit GTR | Amazfit GTS | Amazfit Stratos | Amazfit T-Rex | Amazfit Verge | Amazfit Verge Lite | Honor Band 5 | Honor Watch Magic | Huawei Watch GT | Xiaomi Mi Band 4 |
| ----------- | ----------- | ----------- | ----------- | --------------- | ------------- | ------------- | ------------------ | ------------ | ----------------- | --------------- | ---------------- |
| bip         | cor         | gtr         | gts         | pace            | t-rex         | verge         | verge-lite         | honor-band-5 | honor-watch-magic | huawei-watch-gt | mi-band-4        |

### 新品上架

<Route author="nczitzk" example="/amazfitwatchfaces/fresh/bip/Bip/zh" path="/amazfitwatchfaces/fresh/:model/:type?/:lang?" :paramsDesc="['手表型号', '手表款式，款式代码可在目标网站选择后到地址栏查看，`all` 指 全部款式', '表盘语言，语言代码可在目标网站选择后到地址栏查看，如 `zh` 指 中文']"/>

### 最近更新

<Route author="nczitzk" example="/amazfitwatchfaces/updated/bip/Bip/zh" path="/amazfitwatchfaces/updated/:model/:type?/:lang?" :paramsDesc="['手表型号', '手表款式，款式代码可在目标网站选择后到地址栏查看，`all` 指 全部款式', '表盘语言，语言代码可在目标网站选择后到地址栏查看，如 `zh` 指 中文']"/>

### 排行榜

<Route author="nczitzk" example="/amazfitwatchfaces/top/bip/Bip/month/views/zh" path="/amazfitwatchfaces/top/:model/:type?/:time?/:sortBy?/:lang?" :paramsDesc="['手表型号', '手表款式，款式代码可在目标网站选择后到地址栏查看，`all` 指 全部款式', '统计时间，`week` 指 上周，`month` 指 上月，`alltime` 指 全部时间', '排序参数，`download` 指 下载量，`views` 指 查看量，`fav` 指 收藏数', '表盘语言，语言代码可在目标网站选择后到地址栏查看，如 `zh` 指 中文']"/>

### 搜索结果

<Route author="nczitzk" example="/amazfitwatchfaces/search/bip/battery" path="/amazfitwatchfaces/search/:model/:keyword?/:sortBy?" :paramsDesc="['手表型号', '关键词，多个关键词用半角逗号隔开', '排序参数，`fresh` 指 新品上架，`updated` 指 已更新的，`views` 指 查看量，`download` 指 下载量，`fav` 指 收藏数']"/>

## Apple

### 更换和维修扩展计划

<Route author="metowolf HenryQW kt286" example="/apple/exchange_repair/zh-cn" path="/apple/exchange_repair/:country?" :paramsDesc="['苹果官网 URL 中的国家代码, 默认美国 ，中国 `zh-cn`']"/>

### 苹果邮件

见 [#中国邮政速递物流](/other.html#zhong-guo-you-zheng-su-di-wu-liu)

### App Store/Mac App Store

见 [#app-store-mac-app-store](/program-update.html#app-store-mac-app-store)

## AutoTrader

### 搜索结果

<Route author="HenryQW" example="/autotrader/radius=50&postcode=sw1a1aa&onesearchad=Used&onesearchad=Nearly%20New&onesearchad=New&price-to=9000&year-from=2012&body-type=Hatchback&transmission=Automatic&exclude-writeoff-categories=on" path="/autotrader/:query" :paramsDesc="['查询语句']">

1.  在 AutoTrader 选择筛选条件进行搜索
2.  复制查询结果 URL 中`?`后的部分，例如 `https://www.autotrader.co.uk/car-search?radius=50&postcode=sw1a1aa&onesearchad=Used&onesearchad=Nearly%20New&onesearchad=New&price-to=9000&year-from=2012&body-type=Hatchback&transmission=Automatic&exclude-writeoff-categories=on` 则为 `radius=50&postcode=sw1a1aa&onesearchad=Used&onesearchad=Nearly%20New&onesearchad=New&price-to=9000&year-from=2012&body-type=Hatchback&transmission=Automatic&exclude-writeoff-categories=on`

</Route>

## BOOKSOURCE.STORE

### 书源仓库更新

<Route author="vhxubo" example="/booksource" path="/booksource"/>

## BOOKWALKERTW

### 热门新书

<Route author="wushijishan" example="/bookwalkertw/news" path="/bookwalkertw/news"/>

## checkee.info

### 美国签证 check 动态

<Route author="lalxyy" example="/checkee/2019-03" path="/checkee/:month" :paramsDesc="['签证被 check 的年份-月份，如 2019-03']" />

## ClickMe

### 文章

<Route author="hoilc" example="/clickme/default/category/beauty" path="/clickme/:site/:grouping/:name" :paramsDesc="['站点，`default`为普通站，`r18`为成人站，其它值默认为普通站','分组方式，`category`为分类，`tag`为标签，其他值默认为分类','分类名或标签名，分类名为英文，可以在分类 URL 中找到']" radar="1"/>

## Darwin Awards

### Award Winners

<Route author="zoenglinghou nciztzk" example="/darwinawards" path="/darwinawards" />

## dcinside

### board

<Route author="zfanta" example="/dcinside/board/programming" path="/dcinside/board/:id" :paramsDesc="['board id']" />

## DHL

### DHL 国际快递包裹追踪

<Route author="ntzyz" example="/dhl/12345678" path="/dhl/:shipment_id" :paramsDesc="['运单号']"/>

## Etherscan

### Etherscan 转账追踪

<Route author="Pretty9" example="/etherscan/transactions/0x283af0b28c62c092c9727f1ee09c02ca627eb7f5" path="/etherscan/transactions/:address" :paramsDesc="['地址']"/>

## Grand-Challenge

### Challenge 列表

<Route author="WhoIsSure" example="/grandchallenge/challenges" path="/grandchallenge/challenges"/>

### 用户参加的 Challenge

<Route author="WhoIsSure" example="/grandchallenge/user/Isensee" path="/grandchallenge/user/:id" :paramsDesc="['用户ID,必选-用户页面网址里面的用户ID']"/>

## HackerOne

### HackerOne Hacker Activity

<Route author="imlonghao" example="/hackerone/hacktivity" path="/hackerone/hacktivity" radar="1" rssbud="1"/>

## Instapaper

### 个人分享

<Route author="LogicJake" example="/instapaper/person/viridiano" path="/instapaper/person"/>

## iYouport

### 首页（旧版）

<Route author="EsuRt" example="/iyouport/article" path="/iyouport/article"/>

### 分类

支持 iyouport.org 页面 Header 全部分类。例如，`https://www.iyouport.org/category/osint` 对应 `/iyouport/osint`。若不填写 `category`，则输出全部文章，但比旧版首页 feed 有更多元数据。

<Route author="proletarius101" example="/iyouport/osint" path="/iyouport/:category?"/>

## Layoffs.fyi

### 裁员数据跟踪

<Route author="BrandNewLifeJackie26" example="/layoffs" path="/layoffs" radar="1"/>

该网站原始 RSS 数据源无人维护，故重新抓取数据并生成数据源。

## LinkedIn 领英中国

### Jobs

<Route author="bigfei" example="/linkedin/cn/jobs/Software" path="/linkedin/cn/jobs/:keywords?" :paramsDesc="['搜索关键字']" radar="1">

另外，可以通过添加额外的以下 query 参数来输出满足特定要求的工作职位：

| 参数         | 描述                               | 举例                                        | 默认值     |
| ---------- | -------------------------------- | ----------------------------------------- | ------- |
| `geo`      | geo 编码                           | 102890883（中国）、102772228（上海）、103873152（北京） | 空       |
| `remote`   | 是否只显示远程工作                        | `true/false`                              | `false` |
| `location` | 工作地点                             | `china/shanghai/beijing`                  | 空       |
| `relevant` | 排序方式 (true: 按相关性排序，false： 按日期排序) | `true/false`                              | `false` |
| `period`   | 发布时间                             | `1/7/30`                                  | 空       |

例如：
[`/linkedin/cn/jobs/Software?location=shanghai&period=1`](https://rsshub.app/linkedin/cn/jobs/Software?location=shanghai\&period=1): 查找所有在上海的今日发布的所有 Software 工作

**为了方便起见，建议您在 [LinkedIn.cn](https://www.linkedin.cn/incareer/jobs/search) 上进行搜索，并使用 [RSSHub Radar](https://github.com/DIYgod/RSSHub-Radar) 加载特定的 feed。**

</Route>

## MiniFlux

因需设置 API Key，故请自行架设 RSSHub。API 密钥则请于 MiniFlux 实例中的 `设置` -> `API密钥` -> `创建一个新的API密钥` 处获取。

### 订阅列表

<Route author="emdoe" example="/miniflux/subscription/categories=科技,影音" path="/miniflux/subscription/:parameters?" :paramsDesc="['分类名或分类 ID 或/且 订阅源名称或订阅源 ID']" selfhost="1">

1.  如无指定参数，默认输出全部订阅源
2.  分类 ID 或订阅源 ID 请于`分类`（快捷键 `g` `c`）或`源`（快捷键 `g` `f`）页面获取，每个分类（或订阅源）的网址即显示其 ID 信息。
3.  支持分类名称和分类 ID，如需输出多个分类，请重复输入 `category=` 并用 `&` 连接，或者不同的分类名之间直接用**英文**逗号连接。举例来说，可以通过 `/miniflux/subscription/category=科技&category=1` 或者 `/miniflux/subscription/categories=科技,1` 实现订阅。
4.  支持指定订阅源名称或订阅源 ID，方法与分类的设定类似。举例来说，可以通过 `/miniflux/subscription/feed=1&feed=Archdaily` 或者 `/miniflux/subscription/feeds=1,Archdaily` 实现订阅。
5.  支持同时指定订阅源信息和分类信息，将输出满足分类选项的订阅源信息。考虑一例：通过 `/miniflux/subscription/feeds=1,archdaily&category=art,7`，则如果订阅源 ID 为 1 或者订阅源名称为 ArchDaily 确实在分类 `art` 或者分类 ID 为 7 的分类下，则输出该订阅源信息。

</Route>

### 获取订阅源内容

<Route author="emdoe" example="/miniflux/feeds=1&2&3/mark=read&limit=7&status=unread" path="/miniflux/:feeds/:parameters?" :paramsDesc="['订阅源 ID 或获取全部', '过滤及设置参数，多个请用 `&` 连接']" selfhost="1">

1.  支持获取全部内容：即可通过 `/miniflux/all` 或 `/miniflux/default` 等关键字获取全部订阅源下的内容。
2.  支持通过订阅源的 ID 获取指定订阅源的订阅内容，订阅源 ID 请于`源`（快捷键 `g` `f`）所在的页面获取，每个分类（或订阅源）的网址即显示其 ID 信息。而格式上有如下选择：
    1.  支持 `/miniflux/feed=[feed_id]`，请将 `[feed_id]` 替换为实际订阅的订阅源 ID（注意不包含括号，即单纯为一个数字）
    2.  支持 `/miniflux/feed=[feed1_id]&feed=[feed2_id]` 或 `/miniflux/feeds=[feed1_id]&[feed2_id]` 订阅多个订阅源
    3.  以上还支持简写，即直接使用订阅源 ID：`/miniflux/[feed1_id]&[feed2_id]`
3.  可进一步根据需要，指定参数：
    1.  支持 MiniFlux 提供的所有参数[选项](https://miniflux.app/docs/api.html#endpoint-get-feed-entries)。同其文档所注相同，多个过滤选项之间请用 `&` 连接。除去 `status` 外，多个相同的过滤选项应只会读取第一个。
    2.  特别的，本路由将默认指定排序方式为从新到旧排序（`direction=desc`）。
    3.  此外，本路由另支持额外的选项，包括：
        1.  利用 `feed_name` 参数控制标题格式，`feed_name=1` 即输出的每一篇标题会变为 `文章标题 | 订阅源名称`，默认为 `feed_name=0`，即只输出文章标题。
        2.  利用 `mark` 参数控制在 RSSHub 获取订阅内容之后的动作，包括维持不变（`unchanged`，默认），标记为已读（`read`），移除（`removed`），以及标记为未读（`unread`）。**注意，请不要将标记为已读简单的理解为是用于实现某种同步服务的**，这个功能更像是在辅助 MiniFlux 的自动清理功能。
        3.  未来可能会支持利用 `link` 参数控制输出内容的网址（支持这个功能需要 MiniFlux 未来提供相应的接口），设定为通过 MiniFlux 实体的分享功能生成的网址或原始内容的网址。请注意，如果利用 MiniFlux 的分享功能，这些文章内容均不会被自动清理。
        4.  可以通过 `limit` 参数控制输出内容的数量，默认输出全部符合其它条件的所有内容，但**建议用户设置该参数**。不过众所周知，RSSHub 提供全局参数 `?limit` 控制输出内容的数量，但如果用户存在设置错误，则可能出现一些奇怪的问题：不妨考虑用户的参数设定为 `miniflux/all/limit=5&status=unread&mark=read?limit=3`，那么则有两篇用户未读的文章自动被标记为已读，用户却很可能从未发现。为避免出现这样的情形，本路由对该参数的设定作出如下调整：
            1.  选择输出全部内容时，如果同时设定两个参数，则取设定数值较小的那个，否则按照用户设定控制输出内容的数量。
            2.  选择输出指定订阅源时，`&limit=` 参数控制**每一个**订阅源的输出数量，`?limit=` 控制**最终**输出内容的数量。不妨假设用户指定聚合两个订阅源，那么 `/miniflux/1&2/mark=read&limit=3` 与 `/miniflux/1&2/mark=read?limit=6` 的效果相同，除非
            3.  用户设定的 `&limit` 值小于 `?limit`，路由会以 `&limit` 设定为准：即最终输出内容数量 = `&limit` 参数值 \* 订阅源数量，或者如果
            4.  用户设定的 `&limit` 值大于 `?limit` 参数，又或者 `?limit` 参数并非是订阅源数量的整数倍，则路由将用 `?limit` 参数除去订阅源数量，并向下取整，每个订阅源将输出所得数字篇内容（如果得数为 0，则修改为每个订阅源输出 1 篇文章）。
            5.  考虑一例：`/miniflux/1&2&3/status=unread&limit=2?limit=5` 或 `/miniflux/1&2&3/status=unread&limit=2?limit=7`，最终的输出结果均为 `/miniflux/1&2&3/status=unread&limit=2`，等效于 `/miniflux/1&2&3/status=unread?limit=6`
            6.  考虑另一例：`/miniflux/1&2&3/status=unread?limit=2`，因为 2 / 3 ≈ 0.667 -> 0 -> 1，所以等效于 `/miniflux/1&2&3/status=unread?limit=3`，亦等效于 `/miniflux/1&2&3/status=unread&limit=1`
        5.  以上选项均与 MiniFlux 的 API 的行为保持一致，如果用户错误重复设定某参数，只读取第一个设定的值。

一例：如果用户希望输出全部订阅源中，最旧的两篇未读的文章，并希望在文章的标题栏显示订阅源的名字，同时希望输出内容在 MiniFlux 中被标为已读，那么路由设置应为：`/miniflux/all/direction=asc&status=unread&feed_name=1&mark=read&limit=2`

</Route>

## MITRE

### 全部出版物

<Route author="sbilly" example="/mitre/publications" path="/mitre/publications" />

## MobData

### 分析报告

<Route author="brilon" example="/mobdata/report" path="/mobdata/report"/>

## Mozilla

### Firefox Monitor

<Route author="TonyRL" example="/firefox/breaches" path="/firefox/breaches"/>

## NOI 全国青少年信息学奥林匹克竞赛

### 新闻

<Route author="WenryXu" example="/noi" path="/noi"/>

### 获奖名单

<Route author="WenryXu" example="/noi/winners-list" path="/noi/winners-list"/>

### 各省新闻

<Route author="WenryXu" example="/noi/province-news" path="/noi/province-news"/>

### 报名新闻

<Route author="WenryXu" example="/noi/rg-news" path="/noi/rg-news"/>

## ONE・一个

### 图片文字问答

<Route author="fengkx" example="/one" path="/one"/>

## Panda

### Feeds

<Route author="lyrl" example="/usepanda/feeds/5718e53e7a84fb1901e059cc" path="/usepanda/feeds/:id" :paramsDesc="['频道id/feedId']">

| 频道          | feedId                   |
| ----------- | ------------------------ |
| Github 热门推荐 | 5718e53e7a84fb1901e059cc |

</Route>

## Parcel Tracking

### Hermes UK

<Route author="HenryQW" example="/parcel/hermesuk/[tracking number]" path="/parcel/hermesuk/:tracking" :paramsDesc="['Tracking number']"/>

## Pocket

### Trending

<Route author="hoilc" example="/pocket/trending" path="/pocket/trending"/>

## Product Hunt

> 官方 Feed 地址为: <https://www.producthunt.com/feed>

### Today Popular

<Route author="miaoyafeng Fatpandac" example="/producthunt/today" path="/producthunt/today">
</Route>

## SANS Institute

### 最新会议材料

<Route author="sbilly" example="/sans/summit_archive" path="/sans/summit_archive" />

## TSSstatus（iOS 降级通道）

### Status

<Route author="xyqfer" example="/tssstatus/j42dap/14W585a" path="/tssstatus/:board/:build" :paramsDesc="['平台 id', '版本 id']">

board 和 build 可在[这里](http://api.ineal.me/tss/status)查看

</Route>

## WeGene

### 最近更新

<Route author="LogicJake" example="/wegene/newest" path="/wegene/newest" radar="1" rssbud="1"/>
### 栏目

<Route author="LogicJake" example="/wegene/column/all/all" path="/wegene/column/:type/:category" :paramsDesc="['栏目类型，all（全部项目） 或 weapp（专业版）','栏目分类']" radar="1" rssbud="1">

:::
type 为 all 时，category 参数不支持 cost 和 free
:::

| 全部  | 祖源分析     | 付费   | 遗传性疾病   | 药物指南 | 免费   | 运动基因    | 营养代谢       | 心理特质       | 健康风险 | 皮肤特性 | 遗传特征   |
| --- | -------- | ---- | ------- | ---- | ---- | ------- | ---------- | ---------- | ---- | ---- | ------ |
| all | ancestry | cost | disease | drug | free | genefit | metabolism | psychology | risk | skin | traits |

</Route>

## wikiHow

### 首页

<Route author="sanmmm" example="/wikihow/index" path="/wikihow/index"/>

### 分类目录

<Route author="sanmmm" example="/wikihow/category/饮食与休闲/all" path="/wikihow/category/:category/:type?" :paramsDesc="['目录分类', '类型, 默认为`all`']">

顶级目录分类可在目录分类页[查看](https://zh.wikihow.com/Special:CategoryListing), 支持二级目录

类型

| 所有  | 推荐  |
| --- | --- |
| all | rec |

</Route>

## Wise

### 昨日汇率变动

<Route author="HenryQW" example="/wise/pair/GBP/USD" path="/wise/pair/:source/:target" :paramsDesc="['本币缩写','外币缩写']" radar="1">

参见支持的 [货币列表](https://wise.com/tools/exchange-rate-alerts/)。

</Route>

## 艾瑞

### 产业研究报告

<Route author="brilon Fatpandac" example="/iresearch/report" path="/iresearch/report"/>

### 周度市场观察

<Route author="nczitzk" example="/iresearch/weekly" path="/iresearch/weekly:category?" :paramsDesc="['分类，见下表，默认为全部']">

| 家电行业 | 服装行业 | 美妆行业 | 食品饮料行业 |
| ---- | ---- | ---- | ------ |

</Route>

## 爱 Q 生活网

### 最近更新

<Route author="nczitzk" example="/3k8/latest" path="/3k8/latest"/>

## 爱发电

### 发现用户

<Route author="sanmmm" example="/afdian/explore/hot/所有" path="/afdian/explore/:type/:category?" :paramsDesc="['分类', '目录类型，默认为 `所有`']">
分类

| 推荐  | 最热  |
| --- | --- |
| rec | hot |

目录类型

| 所有 | 绘画 | 视频 | 写作 | 游戏 | 音乐 | 播客 | 摄影 | 技术 | Vtuber | 舞蹈 | 体育 | 旅游 | 美食 | 时尚 | 数码 | 动画 | 其他 |
| -- | -- | -- | -- | -- | -- | -- | -- | -- | ------ | -- | -- | -- | -- | -- | -- | -- | -- |
| 所有 | 绘画 | 视频 | 写作 | 游戏 | 音乐 | 播客 | 摄影 | 技术 | Vtuber | 舞蹈 | 体育 | 旅游 | 美食 | 时尚 | 数码 | 动画 | 其他 |

</Route>

### 用户动态

<Route author="sanmmm" example="/afdian/dynamic/@afdian" path="/afdian/dynamic/:uid?" :paramsDesc="['用户id，用户动态页面url里可找到']"/>

## 澳門特別行政區政府各公共部門獎助貸學金服務平台

官方網址：<https://www.bolsas.gov.mo/>

<Route author="KeiLongW" example="/macau-bolsas" path="/macau-bolsas/:lang?" :paramsDesc="['語言']" >

| 中文 | 葡文 |
| -- | -- |
| ch | pt |

</Route>

## 百度热搜

### 榜单

<Route author="xyqfer" example="/baidu/top" path="/baidu/top/:board?" :paramsDesc="['榜单，默认为 `realtime`']" radar="1">

| 热搜榜      | 小说榜   | 电影榜   | 电视剧榜     | 汽车榜 | 游戏榜  |
| -------- | ----- | ----- | -------- | --- | ---- |
| realtime | novel | movie | teleplay | car | game |

</Route>

## 贝壳研究院

### 研究成果

<Route author="shaomingbo" example="/ke/researchResults"  path="/ke/researchResults" radar="1"/>

## 毕马威

### 洞察

<Route author="LogicJake" example="/kpmg/insights" path="/kpmg/insights" />

## 成都住建蓉 e 办

### 商品住房购房登记

<Route author="TonyRL" example="/cdzjryb/zw/projectList" path="/cdzjryb/zw/projectList" radar="1"/>

## 滴答清单

### 习惯打卡

::: warning 注意

需要账号密码，详情见部署文档部分 RSS 模块配置

:::

<Route author="DIYgod" example="/dida365/habit/checkins" path="/dida365/habit/checkins" selfhost="1"/>

## 福利资源 - met.red

### 福利资源 - met.red

<Route author="junfengP queensferryme" example="/metred/fuli" path="/metred/fuli" />

## 古诗文网

### 首页推荐

<Route author="LogicJake" example="/gushiwen/recommend/zhushang" path="/gushiwen/recommend/:annotation?"/>

`annotation` 字段为添加哪些附加信息。可从以下表格中选择值后按顺序拼接。例如如果需要注释和赏析，则为`zhushang`。

| 翻译 | 注释  | 赏析    |
| -- | --- | ----- |
| yi | zhu | shang |

</Route>

## 骨朵数据

### 日榜

<Route author="Gem1ni" example="/guduodata/daily" path="/guduodata/daily" />

## 光大银行

### 外汇牌价

#### 总览

<Route author="linbuxiao" example="/quotation/all" path="/quotation/all" />

#### 历史牌价

<Route author="linbuxiao" example="/quotation/history/usd" path="/quotation/history/:type" :paramsDesc="['货币的缩写，见下表']">

| 美元  | 英镑  | 港币  | 瑞士法郎 | 瑞典克郎 | 丹麦克郎 | 挪威克郎 | 日元  | 加拿大元 | 澳大利亚元 | 新加坡元 | 欧元  | 澳门元 | 泰国铢 | 新西兰元 | 韩圆  |
| --- | --- | --- | ---- | ---- | ---- | ---- | --- | ---- | ----- | ---- | --- | --- | --- | ---- | --- |
| usd | gbp | hkd | chf  | sek  | dkk  | nok  | jpy | cad  | aud   | sgd  | eur | mop | thb | nzd  | krw |

</Route>

## 国家留学网

### 通知

<Route author="Derekmini markmingjie" example="/csc/notice/lxtz" path="/csc/notice/:type?" :paramsDesc="['分类, 默认为 `lxtz`']" radar="1" rssbud="1">

| 遴选通知 | 综合项目专栏 | 常见问题解答 | 录取公告 | 新闻资讯 | 新闻公告 |
| ---- | ------ | ------ | ---- | ---- | ---- |
| lxtz | xmzl   | wtjd   | lqgg | xwzx | xwgg |

</Route>

## 好队友

### 工作机会

<Route author="lotosbin" example="/network360/jobs" path="/network360/jobs"/>

## 惠誉评级

### 板块信息

<Route author="LogicJake" example="/fitchratings/site/economics" path="/fitchratings/site/:type" :paramsDesc="['板块名称，在网址 site 后面']"/>

## 静态模型爱好者

### 新品信息

<Route author="cc798461" example="/moxingfans" path="/moxingfans"/>

## 巨量算数 - 算数指数

### 抖音指数波峰

<Route author="Jkker" example="/oceanengine/index/教材" path="/oceanengine/index/:keyword" :paramsDesc="['热点关键词']" anticrawler="1" puppeteer="1"/>

爬取巨量算数近 6 个月的抖音指数，解密后提取指数波峰当日的热门搜索关键词，生成为 RSS。可用于追踪新闻热点事件。

### 头条指数波峰

<Route author="Jkker" example="/oceanengine/index/教材/toutiao" path="/oceanengine/index/:keyword/toutiao" :paramsDesc="['热点关键词']" anticrawler="1" puppeteer="1"/>

爬取巨量算数近 6 个月的头条指数，解密后提取指数波峰当日的热门搜索关键词，生成为 RSS。可用于追踪新闻热点事件。

## 考研帮

### 考研帮调剂信息

<Route author="shengmaosu" example="/kaoyan" path="/kaoyan" />

## 空气质量

### 实时 AQI

<Route author="xapool" example="/aqicn/beijing/pm25,pm10" path="/aqicn/:city/:pollution?" :paramsDesc="['城市拼音或地区 ID，详见[aqicn.org](http://aqicn.org/city/)', '可选择显示更详细的空气污染成分']"/>

| 参数   | 污染成分  |
| ---- | ----- |
| pm25 | PM2.5 |
| pm10 | PM10  |
| o3   | O3    |
| no2  | NO2   |
| so2  | SO2   |
| co   | CO    |

举例: [https://rsshub.app/aqicn/beijing/pm25,pm10](https://rsshub.app/aqicn/beijing/pm25.pm10)

1.  显示单个污染成分，例如「pm25」, <https://rsshub.app/aqicn/beijing/pm25>
2.  逗号分隔显示多个污染成分，例如「pm25,pm10」，[https://rsshub.app/aqicn/beijing/pm25,pm10](https://rsshub.app/aqicn/beijing/pm25.pm10)

## 快递 100

### 快递订单追踪

<Route author="NeverBehave" example="/kuaidi100/track/shunfeng/SF1007896781640/0383" path="/kuaidi100/track/:number/:id/:phone?" :paramsDesc="['快递公司代号', '订单号', '手机号后四位（仅顺丰）']" radar="1">

快递公司代号如果不能确定，可通过下方快递列表获得。

::: warning 注意

1.  构造链接前请确认所有参数正确：错误`快递公司 - 订单号`组合将会缓存信息一小段时间防止产生无用查询
2.  正常查询的订单在未签收状态下不会被缓存：请控制查询频率
3.  订单完成后请尽快取消订阅，避免资源浪费

:::

</Route>

### 支持的快递公司列表

<Route author="NeverBehave" example="/kuaidi100/company" path="/kuaidi100/company" radar="1" rssbud="1"/>

## 裏垢女子まとめ

### 主页

<Route author="SettingDust Halcao" example="/uraaka-joshi" path="/uraaka-joshi" radar="1" rssbud="1" puppeteer="1"/>

### 用户

<Route author="SettingDust Halcao" example="/uraaka-joshi/_rrwq" path="/uraaka-joshi/:id" :paramsDesc="['用户名']" radar="1" rssbud="1" puppeteer="1"/>

## 律师事务所文章

### 君合

<Route author="snipersteve" example="/law/jh" path="/law/jh" />

### 通商

<Route author="snipersteve" example="/law/ts" path="/law/ts" />

### 海问

<Route author="snipersteve" example="/law/hw" path="/law/hw" />

### 环球

<Route author="snipersteve" example="/law/hq" path="/law/hq" />

### 国枫

<Route author="snipersteve" example="/law/gf" path="/law/gf" />

### 中伦

<Route author="snipersteve" example="/law/zl" path="/law/zl" />

### 锦天城

<Route author="snipersteve" example="/law/jtc" path="/law/jtc" />

### 德恒

<Route author="snipersteve" example="/law/dh" path="/law/dh" />

### 金诚同达

<Route author="snipersteve" example="/law/jctd" path="/law/jctd" />

## 马良行

### 产品更新

<Route author="junfengP" example="/mlhang" path="/mlhang" />

## 每日生猪价格

### 每日生猪价格更新

<Route author="importcjj" example="/pork-price" path="/pork-price" />

## 米坛社区

### 表盘更新

<Route author="hoilc" example="/watchface/mi4/" path="/watchface/:watch_type?/:list_type?" :paramsDesc="['手环型号, 默认为`小米手环4`', '列表类型, 默认为`最新上传`']">

表盘型号

| 小米手环 4 | 华米 GTR 47mm | 华米智能手表青春版 |
| ------ | ----------- | --------- |
| mi4    | gtr47       | gvlite    |

列表类型

| 最新上传 | 最多下载 | 编辑推荐       |
| ---- | ---- | ---------- |
| 0    | 1    | recommends |

</Route>

## 模型网

### 新闻

<Route author="cc798461" example="/moxingnet" path="/moxingnet"/>

## 诺贝尔奖

### 获奖名单

<Route author="nczitzk" example="/nobelprize" path="/nobelprize/:caty" :paramsDesc="['类别，见下表，默认为全部']">

| 物理学     | 化学        | 生理学或医学                 | 文学         | 和平    | 经济学               |
| ------- | --------- | ---------------------- | ---------- | ----- | ----------------- |
| physics | chemistry | physiology-or-medicine | literature | peace | economic-sciences |

</Route>

## 且听风吟福利

### 分类

<Route author="qiwihui" example="/qtfyfl/guoji" path="/qtfyfl/:category" :paramsDesc="['分类，可在 URL 中找到']">

| 最新文章   | 福利社     | 求出处       | 套图集     | 门事件        | 内涵图      | 电影下载           | 影视资讯    |
| ------ | ------- | --------- | ------- | ---------- | -------- | -------------- | ------- |
| latest | fulishe | qiuchuchu | taotuji | menshijian | neihantu | dianyingxiazai | yingshi |

| 电视剧下载     | 动漫下载    | 电影彩蛋   | 影视剧情   | 涨姿势        | 娱乐   | 明星八卦     | 音乐歌曲  |
| --------- | ------- | ------ | ------ | ---------- | ---- | -------- | ----- |
| dianshiju | dongman | caidan | juqing | zhangzishi | yule | mingxing | music |

| 游戏    | 电脑软件     | 实时热点         | 心灵鸡汤 | 符号大全 | 国际新闻 | 科技苑  | 其他    |
| ----- | -------- | ------------ | ---- | ---- | ---- | ---- | ----- |
| games | software | shishiredian | xljt | fhdq | xljt | tech | other |

</Route>

## 親子王國

### 板块

<Route author="LogicJake"  example="/babykingdom/19/view" path="/babykingdom/:id/:order?" :paramsDesc="['板块id，可在 URL 中找到', '排序方式']">

| 发帖时间     | 回复 / 查看 | 查看   | 最后发表     | 热门   |
| -------- | ------- | ---- | -------- | ---- |
| dateline | reply   | view | lastpost | heat |

</Route>

## 热搜聚合

### 关键词聚合追踪

追踪各大热搜榜上包含特定关键词的条目。

当前收录榜单：*微博热搜*、*今日头条热搜*、*知乎热搜*、*知乎热门视频*、*知乎热门话题*。

数据源: [trending-in-one](https://github.com/huqi-pr/trending-in-one)

<Route author="Jkker" example="/trending/唐山,打人/3" path="/trending/:keywords/:numberOfDays?" radar="1" :paramsDesc="['通过逗号区隔的关键词列表', '向前追溯的天数，默认为3天']"/>

## 日本郵便

### 郵便追跡サービス

<Route author="tuzi3040" example="/japanpost/track/EJ123456789JP/ja" path="/japanpost/track/:reqCode/:locale?" :paramsDesc="['运单号', '语言，默认为`ja`']" radar="1" rssbud="1">

| 日语 | 英语 |
| -- | -- |
| ja | en |

</Route>

## 守望先锋

### 补丁说明

<Route author="nczitzk" example="/ow/patch" path="/ow/patch"/>

## 四川省科学技术厅

### 四川省科学技术厅 - 公示公告

<Route author="Cubernet" example="/sckjt/news" path="/sckjt/news/:type?" :paramsDesc="['默认为`tz`']">

| 通知 | 公示公告 |
| -- | ---- |
| tz | gs   |

</Route>

## 搜狗

### 搜狗特色 LOGO

<Route author="xyqfer" example="/sogou/doodles" path="/sogou/doodles"/>

## 腾讯吐个槽

### 吐槽新帖

<Route author="Qixingchen" example="/tucaoqq/post/28564/CdRI0728" path="/tucaoqq/post/:project/:key" :paramsDesc="['产品 ID', '产品密钥']"/>

## 腾讯新闻较真查证平台

### 最新辟谣

<Route author="hoilc" example="/factcheck" path="/factcheck"/>

## 天津产权交易中心

### 产权转让

<Route author="kt286" example="/tprtc/cqzr" path="/tprtc/cqzr"/>

### 企业资产转让

<Route author="kt286" example="/tprtc/qyzc" path="/tprtc/qyzc"/>

### 新闻动态

<Route author="kt286" example="/tprtc/news" path="/tprtc/news"/>

## 天眼查

### 热门搜索

<Route author="nczitzk" example="/tianyancha/hot" path="/tianyancha/hot" anticrawler="1"/>

## 无讼案例

### 案例

<Route author="alienmao" example="/itslaw/judgements/regulation+1121495748+13+中华人民共和国公司法（2018）第二十一条" path="/itslaw/judgements/:conditions" :paramsDesc="['筛选条件，见示例']"/>

## 新冠肺炎疫情新闻动态

### 国家卫健委 - 疫情通报

<Route author="Cielpy DIYgod" example="/coronavirus/nhc" path="/coronavirus/nhc"/>

### 财新网 - 新冠肺炎防疫全纪录

<Route author="DIYgod" example="/coronavirus/caixin" path="/coronavirus/caixin"/>

### 丁香园 - 新冠病毒疫情实时播报

<Route author="DIYgod" example="/coronavirus/dxy" path="/coronavirus/dxy"/>

### 丁香园 - 新冠病毒疫情数据统计

<Route author="DIYgod HenryQW" example="/coronavirus/dxy/data/湖北/武汉" path="/coronavirus/dxy/data/:province?/:city?" :paramsDesc="['省/直辖市名，缺省或错误则返回国内数据','城市名，缺省或错误则返回全省数据。直辖市请使用区/县名。']"/>

### 腾讯新闻 - 新型冠状病毒肺炎实时辟谣

<Route author="DIYgod" example="/coronavirus/qq/fact" path="/coronavirus/qq/fact"/>

### 腾讯新闻 - 新型冠状病毒肺炎疫情实时追踪

数据来源：<https://news.qq.com/zt2020/page/feiyan.htm#/>

#### 中国本土数据统计

<Route author="CaoMeiYouRen" example="/tencent/news/coronavirus/total" path="/tencent/news/coronavirus/total"/>

#### 省市疫情数据

<Route author="CaoMeiYouRen" example="/tencent/news/coronavirus/data/湖北/武汉" path="/tencent/news/coronavirus/data/:province?/:city?" :paramsDesc="['省/直辖市名，缺省则返回国内数据','城市名，缺省则返回全省数据。直辖市请使用区/县名。']"/>

### South China Morning Post - China coronavirus outbreak

<Route author="DIYgod" example="/coronavirus/scmp" path="/coronavirus/scmp"/>

### 澳門特別行政區政府 抗疫專頁：最新消息

官方網址：<https://www.ssm.gov.mo/apps1/PreventWuhanInfection/ch.aspx>

<Route author="KeiLongW" example="/coronavirus/mogov-2019ncov/ch" path="/coronavirus/mogov-2019ncov/:lang" :paramsDesc="['語言']"/>

| 中文 | 英文 | 葡文 |
| -- | -- | -- |
| ch | en | pt |

### Singapore Ministry of Health - Past Updates on 2019-nCov Local Situation in Singapore

<Route author="Gnnng" example="/coronavirus/sg-moh" path="/coronavirus/sg-moh"/>

### Yahoo Japan 新型コロナウイルス感染症まとめ

新闻主页：<https://news.yahoo.co.jp/pages/article/20200207>

<Route author="sgqy" example="/coronavirus/yahoo-japan" path="/coronavirus/yahoo-japan/:tdfk?" :paramsDesc="['都道府県的拼音，可从地图详情页的链接中获取。例如：京都府 = kyoto']"/>

## 新趣集

> 官方 Feed 地址为: <https://xinquji.com/rss>

### 今日最佳

<Route author="kiddyuchina" example="/xinquji/today" path="/xinquji/today">
</Route>

### 今日国内

<Route author="kiddyuchina" example="/xinquji/today/internal" path="/xinquji/today/internal">
</Route>

## 新田惠海官方网站

### 最近的更新

<Route author="luyuhuang" example="/emi-nitta/updates" path="/emi-nitta/updates"/>

### 新闻

<Route author="luyuhuang" example="/emi-nitta/news" path="/emi-nitta/news"/>

## 邮箱

### 邮件列表

> 仅支持 IMAP 协议，邮件密码等设置见 [邮件设置](/install/#其他应用配置)

<Route author="kt286" example="/mail/imap/rss@rsshub.app" path="/mail/imap/:email" :paramsDesc="['邮箱账号']" selfhost="1"/>

## 油价

### 今日油价

<Route author="xyqfer" example="/oilprice/shanghai" path="/oilprice/:area" :paramsDesc="['地区拼音，详见[成品油价格网](http://oil.usd-cny.com/)']"/>

## 有据

### 最新文章列表

<Route author="kdanfly" example="/chinafactcheck" path="/chinafactcheck" radar="1" rssbud="1"/>

## 源仓库

### 源仓库更新

<Route author="vhxubo" example="/ku" path="/ku/:name?" :paramsDesc="['默认为 `yuedu`']">
| 阅读  | 异次元   | 海阔   |
| ----- | -------- | ------ |
| yuedu | yiciyuan | haikuo |

</Route>

## 远程 work

### 远程 work 招聘信息

<Route author="luyuhuang" example="/remote-work/all" path="/remote-work/:caty?" :paramsDesc="['职位类型, 默认为全部职位']" radar="1" rssbud="1">

| 所有职位 |      技术     |   设计   |     运营    |    产品   |   其他  |     市场    |   销售  |
| :--: | :---------: | :----: | :-------: | :-----: | :---: | :-------: | :---: |
|  all | development | design | operation | product | other | marketing | sales |

</Route>

## 正版中国

### 分类列表

<Route author="sanmmm" example="/getitfree/category/8" path="/getitfree/category/:category?" :paramsDesc="['内容类型, 默认为`全部`']">

类型

| 全部文章 | 永久免费 | 限时折扣 | 限时免费 | PC | Mac | Android | UWP |
| ---- | ---- | ---- | ---- | -- | --- | ------- | --- |
| all  | 311  | 309  | 310  | 8  | 50  | 17      | 312 |

</Route>

### 搜索

<Route author="sanmmm" example="/getitfree/search/windows" path="/getitfree/search/:keyword" :paramsDesc="['搜索关键词']"/>

## 智联招聘

### 搜索

<Route author="SunShinenny" example="/zhilian/台州/JavaScript" path="/zhilian/:city/:keyword" :paramsDesc="['城市「如若无该城市数据，将会报错」','搜索关键词']"/>

## 中国工程科技知识中心

### 知识应用

<Route author="nczitzk" example="/cktest/app" path="/cktest/app/:ctgroup?/:domain?" :paramsDesc="['所属类别，见下表，默认为全部类别', '领域，见下表，默认为全部列表']">

所属类别

| 专题知识服务 | 知识分析 | 知识工具 | 综合性知识服务 | 全部类别 |
| ------ | ---- | ---- | ------- | ---- |
| 2      | 3    | 4    | 1       | 0    |

领域

| 综合 | 农业 | 航天 | 地质 | 信息技术 | 林业 | 医药卫生 | 战略性新兴产业 | 能源 | 冶金 | 化工 | 地理信息 | 营养健康 | 工程科教图书 | 交通 | 创新设计 | 地理资源与生态 | 材料 | 气象 | 渔业 | 环境工程 | 试验技术 | 中草药 | 水利 | 海洋工程 |
| -- | -- | -- | -- | ---- | -- | ---- | ------- | -- | -- | -- | ---- | ---- | ------ | -- | ---- | ------- | -- | -- | -- | ---- | ---- | --- | -- | ---- |

</Route>

### 产业政策

<Route author="nczitzk" example="/cktest/policy" path="/cktest/policy"/>

## 中国银行

### 中国银行外汇牌价

<Route author="LogicJake HenryQW" example="/boc/whpj/zs?filter_title=%E8%8B%B1%E9%95%91" path="/boc/whpj/:format?" :paramsDesc="['输出的标题格式，默认为标题 + 所有价格。短格式仅包含货币名称。']">

| 短格式   | 中行折算价 | 现汇买卖 | 现钞买卖 | 现汇买入 | 现汇卖出 | 现钞买入 | 现钞卖出 |
| ----- | ----- | ---- | ---- | ---- | ---- | ---- | ---- |
| short | zs    | xh   | xc   | xhmr | xhmc | xcmr | xcmc |

</Route>

## 中国邮政速递物流

### 新闻

<Route author="luyuhuang" example="/ems/news" path="/ems/news" radar="1" rssbud="1"/>

### 苹果邮件

<Route author="Fatpandac" example="/ems/apple/EZ319397281CN" path="/ems/apple/:id" :paramsDesc="['苹果邮件编号']"/>

## 自如

### 房源

<Route author="DIYgod" example="/ziroom/room/sh/1/2/五角场" path="/ziroom/room/:city/:iswhole/:room/:keyword" :paramsDesc="['城市, 北京 bj; 上海 sh; 深圳 sz; 杭州 hz; 南京 nj; 广州 gz; 成都 cd; 武汉 wh; 天津 tj', '是否整租', '房间数', '关键词']"/>

## 佐川急便

### 查询快递

<Route author="nczitzk" example="/sagawa/359554419420" path="/sagawa/:id" :paramsDesc="['快递编号']"/>

## はてな

### はてな匿名ダイアリー - 人気記事アーカイブ

<Route author="masakichi" example="/hatena/anonymous_diary/archive" path="/hatena/anonymous_diary/archive"/>
