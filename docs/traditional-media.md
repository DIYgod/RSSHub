# 传统媒体

## 央视新闻

<Route name="专题" author="idealclover xyqfer" example="/cctv/world" path="/cctv/:category" :paramsDesc="['分类名']">

| 国内  | 国际  | 视频  | 科技 | 社会    | 法律 | 娱乐 | 每周质量报告 |
| ----- | ----- | ----- | ---- | ------- | ---- | ---- | ------------ |
| china | world | video | tech | society | law  | ent  | mzzlbg       |

</Route>

## 财新网

> 网站部分内容需要付费订阅, RSS 仅做更新提醒, 不含付费内容.

<Route name="新闻分类" author="idealclover" example="/caixin/finance/regulation" path="/caixin/:column/:category" :paramsDesc="['栏目名', '栏目下的子分类名']">

Column 列表:

| 经济    | 金融    | 政经  | 环科    | 世界          | 观点网  | 文化    | 周刊   |
| ------- | ------- | ----- | ------- | ------------- | ------- | ------- | ------ |
| economy | finance | china | science | international | opinion | culture | weekly |

以金融板块为例的 category 列表: （其余 column 以类似方式寻找）

| 监管       | 银行 | 证券基金 | 信托保险        | 投资       | 创新       | 市场   |
| ---------- | ---- | -------- | --------------- | ---------- | ---------- | ------ |
| regulation | bank | stock    | insurance_trust | investment | innovation | market |

Category 列表:

| 封面报道   | 开卷  | 社论      | 时事            | 编辑寄语    | 经济    | 金融    | 商业     | 环境与科技             | 民生    | 副刊   |
| ---------- | ----- | --------- | --------------- | ----------- | ------- | ------- | -------- | ---------------------- | ------- | ------ |
| coverstory | first | editorial | current_affairs | editor_desk | economy | finance | business | environment_technology | cwcivil | column |

</Route>

## 南方周末

<Route name="新闻分类" author="ranpox" example="/infzm/5" path="/infzm/:id" :paramsDesc="['南方周末内容分区 id, 可在该内容分区的 URL 中找到(即http://www.infzm.com/contents/:id), 注意 contents 为内容分区, content 为文章页, 添加前请留意.']">

下面给出部分参考:

| 全站 | 新闻 | 经济 | 文化 | 评论 | 图片 | 生活 | 时政 | 社会 | 科技 | 绿色 | 头条 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 0    | 5    | 6    | 7    | 8    | 9    | 10   | 11   | 12   | 13   | 1374 | 2553 |

</Route>

## 纽约时报

<Route name="官方 RSS" author="HenryQW" example="/nytimes/dual" path="/nytimes/index/:lang?" :paramsDesc="['语言, 缺省中文']">

通过提取文章全文，以提供比官方源更佳的阅读体验。

| 默认中文 | 中英对照 | 英文 |
| -------- | -------- | ---- |
| (空)     | dual     | en   |

</Route>

<Route name="每日简报" author="xyqfer" example="/nytimes/morning_post" path="/nytimes/morning_post"/>

## 新京报

<Route name="栏目" author="DIYgod" example="/bjnews/realtime" path="/bjnews/:category" :paramsDesc="['新京报的栏目名, 点击对应栏目后在地址栏找到']"/>

## 界面新闻

<Route name="栏目" author="WenhuWee" example="/jiemian/list/79" path="/jiemian/list/:category" :paramsDesc="['对应栏目后在地址栏找到']"/>

## 澎湃新闻

<Route name="首页头条" author="HenryQW" example="/thepaper/featured" path="/thepaper/featured"/>

<Route name="频道" author="xyqfer" example="/thepaper/channel/27224" path="/thepaper/channel/:id" :paramsDesc="['频道 id']"/>

## 联合早报

<Route name="即时新闻" author="lengthmin" example="/zaobao/realtime/china" path="/zaobao/realtime/:type?" :paramsDesc="['分类, 缺省为中港台']">

| 中港台 | 新加坡    | 国际  | 财经     |
| ------ | --------- | ----- | -------- |
| china  | singapore | world | zfinance |

</Route>

<Route name="新闻" author="lengthmin" example="/zaobao/znews/greater-china" path="/zaobao/znews/:type?" :paramsDesc="['分类, 缺省为中港台']">

| 中港台        | 新加坡    | 东南亚 | 国际          | 体育   |
| ------------- | --------- | ------ | ------------- | ------ |
| greater-china | singapore | sea    | international | sports |

</Route>

## NHK

<Route name="News Web Easy" author="Andiedie" example="/nhk/news_web_easy" path="/nhk/news_web_easy"/>

## BBC

<Route name="BBC" author="HenryQW" example="/bbc/chinese" path="/bbc/:channel?" :paramsDesc="['频道, 缺省为热门']">

通过提取文章全文, 以提供比官方源更佳的阅读体验.

支持大部分频道, 频道名称见[官方频道 RSS](https://www.bbc.co.uk/news/10628494).

-   频道为单一路径, 如 https://feeds.bbci.co.uk/news/`business`/rss.xml 则为 `/bbc/business`.
-   频道包含多重路径, 如 https://feeds.bbci.co.uk/news/`world/asia`/rss.xml 则替换 `/` 为 `-` `/bbc/world-asia`.
-   例外: BBC 中文网为 `/bbc/chinese`.

</Route>

## FT 中文网

<Route name="FT 中文网" author="HenryQW xyqfer" example="/ft/chinese/hotstoryby7day" path="/ft/:language/:channel?" :paramsDesc="['语言，简体`chinese`，繁体`traditional`', '频道, 缺省为每日更新']">

::: tip 提示

-   不支持付费文章.
-   由于未知原因 FT 中文网的 SSL 证书不被信任 (参见[SSL Labs 报告](https://www.ssllabs.com/ssltest/analyze.html?d=www.ftchinese.com&latest)), 所有文章通过 http 协议获取.

:::

通过提取文章全文, 以提供比官方源更佳的阅读体验.

支持所有频道, 频道名称见[官方频道 RSS](http://www.ftchinese.com/channel/rss.html).

-   频道为单一路径, 如 http://www.ftchinese.com/rss/`news` 则为 `/ft/chinese/news`.
-   频道包含多重路径, 如 http://www.ftchinese.com/rss/`column/007000002` 则替换 `/` 为 `-` `/ft/chinese/column-007000002`.

</Route>

## 卫报 The Guardian

通过提取文章全文，以提供比官方源更佳的阅读体验。

<Route name="Editorial" author="HenryQW" example="/guardian/editorial" path="/guardian/editorial"/>

<Route name="China" author="Polynomia" example="/guardian/china" path="/guardian/china"/>

## 多维新闻网

<Route name="要闻" author="HenryQW" example="/dwnews/yaowen/global" path="/dwnews/yaowen/:region?" :paramsDesc="['要闻地区，默认`全部`，可选地区如下']">

| 全部   | 国际   | 中国  | 香港     | 台湾   |
| ------ | ------ | ----- | -------- | ------ |
| yaowen | global | china | hongkong | taiwan |

</Route>

<Route name="新闻排行榜" author="HenryQW" example="/dwnews/rank/photo/7" path="/dwnews/rank/:type/:range" :paramsDesc="['榜单类型，`news`为普通新闻，`photo`为图集新闻','榜单范围（天），`1` 或 `7`']"/>

## Solidot

<Route name="最新消息" author="sgqy" example="/solidot/linux" path="/solidot/:type?" :paramsDesc="['消息类型. 默认为 www. 在网站上方选择后复制子域名即可']">

::: tip 提示

Solidot 提供的 feed:

-   https://www.solidot.org/index.rss

:::

| 全部 | 创业    | Linux | 科学    | 科技       | 移动   | 苹果  | 硬件     | 软件     | 安全     | 游戏  | 书籍  | ask | idle | 博客 | 云计算 |
| ---- | ------- | ----- | ------- | ---------- | ------ | ----- | -------- | -------- | -------- | ----- | ----- | --- | ---- | ---- | ------ |
| www  | startup | linux | science | technology | mobile | apple | hardware | software | security | games | books | ask | idle | blog | cloud  |

</Route>

## 极客公园

<Route name="全球快讯" author="xyqfer" example="/geekpark/breakingnews" path="/geekpark/breakingnews" />

## 华尔街见闻

<Route name="华尔街见闻" author="conanjunn" example="/wallstreetcn/news/global" path="/wallstreetcn/news/global" />

## 经济观察网

<Route name="分类资讯" author="epirus" example="/eeo/15" path="/eeo/:category" :paramsDesc="['分类']">

category 对应的关键词有

| 时事 | 政策 | 证券 | 资本 | 理财 | 新科技 | 大健康 | 房产 | 汽车 | 消费 | 影视 | 娱乐 | 体育 | 教育 | 观察家 | 专栏 | 书评 | 个人历史 | 宏观 |
| ---- | ---- | ---- | ---- | ---- | ------ | ------ | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ------ | ---- | ---- | -------- | ---- |
| 01   | 02   | 03   | 04   | 05   | 06     | 07     | 08   | 09   | 10   | 11   | 12   | 13   | 14   | 15     | 16   | 17   | 18       | 19   |

</Route>

## 新浪科技

<Route name="科学探索" author="LogicJake" example="/sina/discovery/zx" path="/sina/discovery/:type" :paramsDesc="['订阅分区类型']">

分类：
| zx | twhk | dwzw | zrdl | lskg | smyx | shbk | kjqy |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 最新 | 天文航空 | 动物植物 | 自然地理 | 历史考古 | 生命医学 | 生活百科 | 科技前沿 |

</Route>

## 人民日报

<Route name="观点" author="LogicJake"  example="/people/opinion/223228" path="/people/opinion/:id" :paramsDesc="['板块id，可在 URL 中找到']"/>

## 半月谈

<Route name="板块" author="LogicJake" example="/banyuetan/jicengzhili" path="/banyuetan/:name" :paramsDesc="['板块名称，可在 URL 中找到']"/>
