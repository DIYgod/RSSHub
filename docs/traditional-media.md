---
pageClass: routes
---

# 传统媒体

## 21 财经

### 频道

<Route author="brilon" example="/21caijing/channel/readnumber" path="/21caijing/channel/:name" :paramsDesc="['频道名称，可在 [https://m.21jingji.com/](https://m.21jingji.com/) 页面 URL 中找到']"/>

## ABC News

### Channel & Topic

<Route author="nczitzk" example="/abc" path="/abc/:id?" :paramsDesc="['id，可在对应 Channel 或 Topic 页面中找到，也可以填入对应页源代码中的 `documentId`，部分见下表，默认为 Just In']">

::: tip 提示

支持 [Topic Library](https://abc.net.au/news/topics) 中的所有 Topic，你可以填入其 URL 中 `topic` 后的字段，也可以填入对应的 `documentId`。

如 [Computers and Technology](https://www.abc.net.au/news/topic/computers-and-technology) 的 URL 是 <https://www.abc.net.au/news/topic/computers-and-technology>，其 `topic` 后的字段为 `computers-and-technology`，且该 Topic 的 `documentId` 为 `2302`，所以路由为 [/abc/computers-and-technology](https://rsshub.app/abc/computers-and-technology) 以及 [/abc/2302](https://rsshub.app/abc/2302)。

支持的 Channel 在下表已经全部列出，同上，其他 Channel 请找到对应 Channel 页面的源代码中的 `documentId` 填入。

:::

以下是部分支持 Channel 和 Topic id：

| Just In | Coronavirus | Politics | World |
| ------- | ----------- | -------- | ----- |
| justin  | coronavirus | politics | world |

| Asia Pacific | Business | Analysis & Opinion   | Sport |
| ------------ | -------- | -------------------- | ----- |
| asia-pacific | business | analysis-and-opinion | sport |

| AFL | Rugby League | Rugby Union | Football |
| --- | ------------ | ----------- | -------- |
| afl | rugbyleague  | rugbyunion  | football |

| Cricket | Science | Astronomy (Space) | Computers and Technology |
| ------- | ------- | ----------------- | ------------------------ |
| cricket | science | astronomy-space   | computers-and-technology |

| Environment | Archaeology | Health | Exercise and Fitness |
| ----------- | ----------- | ------ | -------------------- |
| environment | archaeology | health | exercise-and-fitness |

| Pharmaceuticals | Mental Health | Diet and Nutrition | Arts & Culture |
| --------------- | ------------- | ------------------ | -------------- |
| pharmaceuticals | mental-health | diet-and-nutrition | arts-culture   |

| Fact Check | ABC 中文 | 澳洲时政           | 聚焦中港台     |
| ---------- | -------- | ------------------ | -------------- |
| factcheck  | chinese  | australia-politics | focus-on-china |

| 观点与分析              | 澳洲华人             | 解读澳洲          | Berita dalam Bahasa Indonesia | Tok Pisin |
| ----------------------- | -------------------- | ----------------- | ----------------------------- | --------- |
| analysis-and-opinion-zh | chinese-in-australia | curious-australia | indonesian                    | tok-pisin |

</Route>

## Aljazeera 半岛电视台

### 新闻

<Route author="nczitzk" example="/aljazeera/chinese/news" path="/aljazeera/:language?/:category?" :paramsDesc="['语言，见下表，默认为 arbric，即阿拉伯文', '分类，可在对应新闻分类页 URL 中找到，默认为空，即首页']">

语言

| 阿拉伯文 | 中文    | 英文    |
| -------- | ------- | ------- |
| arbric   | chinese | english |

::: tip 提示

若订阅 [Al Jazeera English - Economy](https://www.aljazeera.com/economy)，其语言为 `english`，路径为 `economy`，可得到其路由为 [`/aljazeera/english/economy`](https://rsshub.app/aljazeera/english/economy)

若订阅 [半岛电视台中文频道 - 政治](https://chinese.aljazeera.net/news/political)，其语言为 `chinese`，路径为 `news/political`，可得到其路由为 [`/aljazeera/chinese/news/political`](https://rsshub.app/aljazeera/chinese/news/political)

:::

</Route>

### 标签

<Route author="nczitzk" example="/aljazeera/english/tag/science-and-technology" path="/aljazeera/:language?/tag/:id" :paramsDesc="['语言，见下表，默认为 arbric，即阿拉伯文', '标签 id，可在对应标签页 URL 中找到']">

语言

| 阿拉伯文 | 中文    | 英文    |
| -------- | ------- | ------- |
| arbric   | chinese | english |

::: tip 提示

若订阅 [Al Jazeera English - Science and Technology](https://www.aljazeera.com/tag/science-and-technology)，其语言为 `english`，标签 id 为 `science-and-technology`，可得到其路由为 [`/aljazeera/english/tag/science-and-technology`](https://rsshub.app/aljazeera/english/tag/science-and-technology)

:::

</Route>

### 官方 RSS

<Route author="nczitzk" example="/aljazeera/english/rss" path="/aljazeera/:language?/rss" :paramsDesc="['语言，见下表，默认为 arbric，即阿拉伯文']">

语言

| 阿拉伯文 | 中文    | 英文    |
| -------- | ------- | ------- |
| arbric   | chinese | english |

::: tip 提示

半岛电视台中文频道无对应的 RSS，故默认返回首页内容

:::

</Route>

## AP News

### 话题

<Route author="zoenglinghou mjysci TonyRL" example="/apnews/topics/ap-top-news" path="/apnews/topics/:topic?" :paramsDesc="['话题名称，可在 URL 中找到，例如 AP Top News [https://apnews.com/hub/ap-top-news](https://apnews.com/hub/ap-top-news) 的话题为 `ap-top-news`，默认为 `trending-news`']" radar="1" rssbud="1" />

## BBC

### BBC 英文

<Route author="HenryQW DIYgod" example="/bbc/world-asia" path="/bbc/:channel" :paramsDesc="['频道，缺省为热门']">

通过提取文章全文，以提供比官方源更佳的阅读体验。

支持大部分频道，频道名称见 [BBC 官方 RSS](https://www.bbc.co.uk/news/10628494)。

-   频道为单一路径，如 `https://feeds.bbci.co.uk/news/business/rss.xml` 则为 `/bbc/business`.
-   频道包含多重路径，如 `https://feeds.bbci.co.uk/news/world/asia/rss.xml` 则替换 `/` 为 `-` `/bbc/world-asia`.

</Route>

### BBC 中文网

<Route author="HenryQW" example="/bbc/chinese/business" path="/bbc/:lang/:channel?" :paramsDesc="['简体或繁体','频道，缺省为热门']">

通过提取文章全文，以提供比官方源更佳的阅读体验。

支持大部分频道，频道名称见 [BBC 中文网官方 RSS](https://www.bbc.com/zhongwen/simp/services/2009/09/000000\_rss)。

简体版：

-   频道，如金融财经 `http://www.bbc.co.uk/zhongwen/simp/business/index.xml` 则为 `/bbc/chinese/business`.

繁体版：

-   频道，如金融财经 `http://www.bbc.co.uk/zhongwen/trad/business/index.xml` 则为 `/bbc/traditionalchinese/business`.

</Route>

## Boston.com

### 新闻

<Route author="oppilate" example="/boston/technology" path="/boston/:tag?" :paramsDesc="['Tag']">

生成官方未提供的全文订阅点。
有哪些 tag 请参考 [Boston.com 官网上的订阅页面](https://www.boston.com/rss-feeds)。例如，`https://www.boston.com/tag/local-news/?feed=rss` 对应 RSSHub 路由 `/boston/local-news`。

</Route>

## CBC

通过提取文章全文，以提供比官方源更佳的阅读体验。

<Route author="wb14123" example="/cbc/topics" path="/cbc/topics/:topic?" :paramsDesc="['CBC 频道。默认为 Top Stories。二级话题如 canada/toronto，需要用 `-` 替换掉 `/`。']"/>

## Chicago Tribune

### 新闻

<Route author="oppilate" example="/chicagotribune/nation-world" path="/chicagotribune/:category/:subcategory?" :paramsDesc="['目录分类', '子分类']">

相比官方 RSS，多提供全文。
目录分类 [见其网站](https://www.chicagotribune.com/about/ct-chicago-tribune-rss-feeds-htmlstory.html)。例如，`https://www.chicagotribune.com/arcio/rss/category/nation-world/` 对应的 RSSHub 路由是 `/chicagotribune/nation-world`。由于官方源的部分路由有两级，因此这里也相应需要填写子分类。

</Route>

## ChinaFile

<Route author="oppilate" example="/chinafile/all" path="/chinafile/:category?" :paramsDesc="['分类，默认 `all`']">

通过提取文章全文，以提供比官方源更佳的阅读体验。

| 全部 | The China NGO Project |
| ---- | --------------------- |
| all  | ngo                   |

</Route>

## CNBC

### 全文 RSS

<Route author="TonyRL" example="/cnbc/rss" path="/cnbc/rss/:id?" :paramsDesc="['频道 ID，可在官方频道 RSS URL 中找到，留空为 `100003114` (Top News)']">

通过提取文章全文，以提供比官方源更佳的阅读体验。

支持所有频道，频道名称见 [官方频道 RSS](https://www.cnbc.com/rss-feeds/)。

</Route>

## Deutsche Welle 德国之声

### 新闻

<Route author="nczitzk" example="/dw/zh" path="/dw/:lang?/:caty?" :paramsDesc="['语言，可在对应语言版本页的 URL 中找到，默认为德语', '分类，见下表，默认为全部']">

| 全部 | 德语媒体 | 文化经纬 | 经济纵横 | 科技环境 |
| ---- | -------- | -------- | -------- | -------- |
| all  | press    | cul      | eco      | sci      |

</Route>

## Financial Times

### FT 中文网

<Route author="HenryQW xyqfer" example="/ft/chinese/hotstoryby7day" path="/ft/:language/:channel?" :paramsDesc="['语言，简体`chinese`，繁体`traditional`', '频道，缺省为每日更新']">

::: tip 提示

-   不支持付费文章。

:::

通过提取文章全文，以提供比官方源更佳的阅读体验。

支持所有频道，频道名称见 [官方频道 RSS](http://www.ftchinese.com/channel/rss.html).

-   频道为单一路径，如 `http://www.ftchinese.com/rss/news` 则为 `/ft/chinese/news`.
-   频道包含多重路径，如 `http://www.ftchinese.com/rss/column/007000002` 则替换 `/` 为 `-` `/ft/chinese/column-007000002`.

</Route>

### myFT 个人 RSS

<Route author="HenryQW" example="/ft/myft/rss-key" path="/ft/myft/:key" :paramsDesc="['myFT 个人 RSS 地址末尾的字符串']">

::: tip 提示

-   在 ft.com -> myFT -> Contact Preferences 中开启个人 RSS feed，见 [官方说明](https://help.ft.com/faq/email-alerts-and-contact-preferences/what-is-myft-rss-feed/)
-   从 RSS 地址结尾的字符串中获取 key，格式为 `12345678-abcd-4036-82db-vdv20db024b8`

:::

</Route>

## i-CABLE 有線新聞

<Route author="tpnonthealps" example="/icable/all" path="/icable/:category/:option?" :paramsDesc="['栏目', '选项（不指定时预设为「全文输出 （含题图）」的 `withphoto` ）']">

细则：

-   `:category` 栏目参数：

    -   `all`: 全站
    -   `local`: 港聞
    -   `international`: 兩岸國際
    -   `china`: 有線中國組
    -   `sports`: 體育

-   `:option?` 可开启的选项：

    -   `plain`: 全文输出为纯文字
    -   `brief`: 输出为 100 字简讯

-   全文输出转换为简体字：`?opencc=t2s`
    (`opencc` 是 RSSHub 的通用参数，详情请参阅 [「中文简繁体转换」](https://docs.rsshub.app/parameter.html#zhong-wen-jian-fan-ti-zhuan-huan))

</Route>

## NHK

### News Web Easy

<Route author="Andiedie" example="/nhk/news_web_easy" path="/nhk/news_web_easy"/>

### WORLD-JAPAN - 新闻提要

<Route author="TonyRL" example="/nhk/news/en" path="/nhk/news/:lang?" :paramsDesc="['语言，见下表，默认为`English`']" radar="1" rssbud="1">

| العربية | বাংলা | မြန်မာဘာသာစကား | 中文（简体） | 中文（繁體） | English | Français |
| ------- | ----- | -------------- | ------------ | ------------ | ------- | -------- |
| ar      | bn    | my             | zh           | zt           | en      | fr       |

| हिन्दी | Bahasa Indonesia | 코리언 | فارسی | Português | Русский | Español |
| ------ | ---------------- | ------ | ----- | --------- | ------- | ------- |
| hi     | id               | ko     | fa    | pt        | ru      | es      |

| Kiswahili | ภาษาไทย | Türkçe | Українська | اردو | Tiếng Việt |
| --------- | ------- | ------ | ---------- | ---- | ---------- |
| sw        | th      | tr     | uk         | ur   | vi         |

</Route>

## Now 新聞

### 新聞

<Route author="nczitzk" example="/now/news" path="/now/news/:category?/:id?" :paramsDesc="['分类，见下表，默认为首页', '编号，可在对应专题/节目页 URL 中找到 topicId']">

::: tip 提示

**编号** 仅对事件追蹤、評論節目、新聞專題三个分类起作用，例子如下：

对于 [事件追蹤](https://news.now.com/home/tracker) 中的 [塔利班奪權](https://news.now.com/home/tracker/detail?catCode=123\&topicId=1056) 话题，其网址为<https://news.now.com/home/tracker/detail?catCode=123&topicId=1056>，其中 `topicId` 为 1056，则对应路由为 [`/now/news/tracker/1056`](https://rsshub.app/now/news/tracker/1056)

:::

| 首頁 | 港聞  | 兩岸國際      | 娛樂          |
| ---- | ----- | ------------- | ------------- |
|      | local | international | entertainment |

| 生活 | 科技       | 財經    | 體育   |
| ---- | ---------- | ------- | ------ |
| life | technology | finance | sports |

| 事件追蹤 | 評論節目 | 新聞專題 |
| -------- | -------- | -------- |
| tracker  | feature  | opinion  |

</Route>

### 熱門

<Route author="nczitzk" example="/now/news/rank" path="/now/news/rank"/>

## RTHK 傳媒透視

<Route author="tpnonthealps" example="/mediadigest/latest" path="/mediadigest/:range" :paramsDesc="['时间范围']">

细则：

-   `:range` 时间范围参数
    (可为 `latest` 或 `四位数字的年份`)

    -   `latest`: 最新的 50 篇文章
    -   `2020`: 2020 年的所有文章

-   全文输出转换为简体字: `?opencc=t2s`
    (`opencc` 是 RSSHub 的通用参数，详情请参阅 [「中文简繁体转换」](https://docs.rsshub.app/parameter.html#zhong-wen-jian-fan-ti-zhuan-huan))

</Route>

## SBS

### 中文

<Route author="nczitzk" example="/sbs/chinese" path="/sbs/chinese/:category?/:id?/:dialect?/:language?" :paramsDesc="['分类，可选 `news` 和 `podcast`，默认为 `news`', 'id，见下表，可在对应页地址栏中找到，默认为 `news`', '方言，可选 `mandarin` 和 `cantonese`，默认为 `mandarin`', '语言，可选 `zh-hans` 和 `zh-hant`，默认为 `zh-hans`']">

::: tip 提示

当订阅播客时，请为 `category` 填入 **podcast**。如 [SBS 普通话电台](https://www.sbs.com.au/chinese/mandarin/zh-hans/podcast/sbs-mandarin) 的 URL 为 <https://www.sbs.com.au/chinese/mandarin/zh-hans/podcast/sbs-mandarin>，其中 `id` 为 **sbs-mandarin**，`dialect` 为 **mandarin**，`language` 为 **zh-hans**，其路由即为 [`/sbs/chinese/podcast/sbs-mandarin/mandarin/zh-hans`](https://rsshub.app/sbs/chinese/podcast/sbs-mandarin/mandarin/zh-hans)。

:::

| 新闻 | 澳大利亚新闻    | 国际新闻           | ​商业与财经      |
| ---- | --------------- | ------------------ | ---------------- |
| news | australian-news | international-news | business-finance |

| 澳中关系                  | ​移民与签证 | Stories in English |
| ------------------------- | ----------- | ------------------ |
| australia-china-relations | immigration | english            |

| COVID-19 专题报道 | 澳大利亚华人       | 澳大利亚生活      | 教育      |
| ----------------- | ------------------ | ----------------- | --------- |
| coronavirus       | australian-chinese | life-in-australia | education |

| 健康   | 吃喝玩乐                  | 艺术人文        | 澳洲定居指南     |
| ------ | ------------------------- | --------------- | ---------------- |
| health | food-travel-entertainment | cultural-events | settlement-guide |

SBS 普通话节目：

| SBS 普通话播客 | 解读澳洲            | 疫苗快报                   |
| -------------- | ------------------- | -------------------------- |
| sbs-mandarin   | australia-explained | covid-vaccine-daily-update |

SBS 廣東話節目：

| SBS 廣東話節目 Podcast | 疫苗快報            | 美食速遞        | 我不是名人          |
| ---------------------- | ------------------- | --------------- | ------------------- |
| sbs-cantonese          | covid-vaccine-daily | gourmet-express | my-australian-story |

| 健康快樂人         | 園藝趣談       | 寰宇金融       | 文化 360    | 科技世界         |
| ------------------ | -------------- | -------------- | ----------- | ---------------- |
| healthy-happy-life | gardening-tips | global-finance | culture-360 | technology-world |

::: tip 提示

大部分时候你可以省略 `language` 字段，因为默认搭配 madarin 为 zh-hans，cantonese 为 zh-hant。如 [SBS 普通话电台](https://www.sbs.com.au/chinese/mandarin/zh-hans/podcast/sbs-mandarin) 路由为 [`/sbs/chinese/podcast/sbs-mandarin/mandarin/zh-hans`](https://rsshub.app/sbs/chinese/podcast/sbs-mandarin/mandarin/zh-hans)，你可以省略为 [`/sbs/chinese/podcast/sbs-mandarin/mandarin`](https://rsshub.app/sbs/chinese/podcast/sbs-mandarin/mandarin)。

你仍可以自定义 `language`，但需要注意的是，并非所有页面都有对应的双语版本。

:::

</Route>

## Solidot

### 最新消息

<Route author="sgqy" example="/solidot/linux" path="/solidot/:type?" :paramsDesc="['消息类型。默认为 www. 在网站上方选择后复制子域名即可']">

::: tip 提示

Solidot 提供的 feed:

-   <https://www.solidot.org/index.rss>

:::

| 全部 | 创业    | Linux | 科学    | 科技       | 移动   | 苹果  | 硬件     | 软件     | 安全     | 游戏  | 书籍  | ask | idle | 博客 | 云计算 | 奇客故事 |
| ---- | ------- | ----- | ------- | ---------- | ------ | ----- | -------- | -------- | -------- | ----- | ----- | --- | ---- | ---- | ------ | -------- |
| www  | startup | linux | science | technology | mobile | apple | hardware | software | security | games | books | ask | idle | blog | cloud  | story    |

</Route>

## Telecompaper

### News

<Route author="nczitzk" example="/telecompaper/news/mobile/2020/China/News" path="/telecompaper/news/:caty/:year?/:country?/:type?" :paramsDesc="['分类，见下表', '年份，可在所选分类页中 Filter 的 `Years` 选择器中选择相应年份，不限年份则填入 `all`，默认为不限', '国家或大洲，可在所选分类页中 Filter 的 `Countries` 选择器中选择相应国家或大洲，不限国家或大洲则填入 `all`，默认为不限', '类型，可在所选分类页中 Filter 的 `Types` 选择器中选择相应类型，不限类型则填入 `all`，默认为不限']">

可选分类如下

| WIRELESS | BROADBAND | VIDEO     | GENERAL | IT | INDUSTRY RESOURCES |
| -------- | --------- | --------- | ------- | -- | ------------------ |
| mobile   | internet  | boardcast | general | it | industry-resources |

::: tip 提示

若 `country` 或 `type` 参数包含空格，则用 `-` 替代。如 `United States` 更换为 `United-States`，`White paper` 更换为 `White-paper`

[INDUSTRY RESOURCES](https://www.telecompaper.com/industry-resources) 分类页的 Filter 仅提供了 `Content Type` 选择器，对应路由中 `type` 参数。`year` 和 `country` 参数则对该分类无效。

:::

</Route>

### Search

<Route author="nczitzk" example="/telecompaper/search/Nokia" path="/telecompaper/search/:keyword?/:company?/:sort?/:period?" :paramsDesc="['关键词', '公司名，默认为不限', '排序，见下表，默认为 Date Descending', '发表在时间段内，默认为 12 months']">

排序

| Date Ascending | Date Descending |
| -------------- | --------------- |
| 1              | 2               |

发表在时间段内

| 1 month | 3 months | 6 months | 12 months | 24 months |
| ------- | -------- | -------- | --------- | --------- |
| 1       | 3        | 6        | 12        | 24        |

</Route>

## The Atlantic

### News

<Route author="NavePnow" example="/theatlantic/latest" path="/theatlantic/:category" :paramsDesc="['分类, 见下表']">

| Popular      | Latest | Politics | Technology | Business |
| ------------ | ------ | -------- | ---------- | -------- |
| most-popular | latest | politics | technology | business |

More categories (except photo) can be found within the navigation bar at <https://www.theatlantic.com/>

</Route>

## The Economist

### 分类

<Route author="ImSingee" example="/economist/latest" path="/economist/:endpoint" :paramsDesc="['分类名称，可在 [官方 RSS 页面 ](https://www.economist.com/rss) 找到，例如 https://www.economist.com/china/rss.xml 即为 china']" radar="1" rssbud="1"/>

### Espresso

<Route author="TonyRL" example="/economist/espresso" path="/economist/espresso" radar="1" rssbud="1"/>

### GRE Vocabulary

<Route author="xyqfer" example="/economist/gre-vocabulary" path="/economist/gre-vocabulary" radar="1" rssbud="1"/>

### 商论

<Route author="prnake" example="/economist/global-business-review/cn-en" path="/economist/global-business-review/:language?" :paramsDesc="['语言，支持简体 cn、繁体 tw、英文 en ，可选择多个语言，默认为 cn-en']"  radar="1" rssbud="1"/>

### 下载

<Route author="nczitzk" example="/economist/download" path="/economist/download" >

下载站：<http://www.cgx02.xyz/index.php?dir=/te>

</Route>

## Voice of America (VOA)

透過提取全文，以獲得更好的閱讀體驗

<Route author="zphw" example="/voa/cantonese/zprtie-ttp" path="/voa/:language/:channel?" :paramsDesc="['語言','頻道，可於官網獲取']">

`语言`

| 粵語      | 中文    | 藏語    |
| --------- | ------- | ------- |
| cantonese | chinese | tibetan |

`频道`

可於各語言官網聚合新聞處 (如 <https://www.voacantonese.com/rssfeeds>) 獲取

例如 `https://www.voacantonese.com/api/zyrtyequty` 將對應 `/voa/cantonese/zyrtyequty`

</Route>

## Yahoo

### 新聞

<Route author="KeiLongW" example="/yahoo/news/hk/world" path="/yahoo/news/:region/:category?" :paramsDesc="['地区','类别']" radar="1">

`地区`

| 香港 | 台灣 | 美國 |
| ---- | ---- | ---- |
| hk   | tw   | en   |

`类別`

| 新聞總集 | 兩岸國際 | 財經     | 娛樂          | 體育   | 健康   |
| -------- | -------- | -------- | ------------- | ------ | ------ |
| （空）   | world    | business | entertainment | sports | health |

</Route>

## Yahoo! by Author

### 新聞

<Route author="loganrockmore" example="/yahoo-author/hannah-keyser" path="/yahoo-news/:author" :paramsDesc="['Author']">

Provides all of the articles by the specified Yahoo! author.

</Route>

## 半月谈

### 板块

<Route author="LogicJake" example="/banyuetan/jicengzhili" path="/banyuetan/:name" :paramsDesc="['板块名称，可在 URL 中找到']"/>

## 北极星电力网

### 环保要闻

<Route author="zsimple" example="/bjx/huanbao" path="/bjx/huanbao" radar="1" rssbud="1"/>

### 光伏

<Route author="Sxuet" example="/bjx/gf/sc" path="/bjx/gf/:type" :paramsDesc="['分类，北极星光伏最后的`type`字段']" radar="1" rssbud="1">

`:type` 类型可选如下

| 要闻 | 政策 | 市场行情 | 企业动态 | 独家观点 | 项目工程 | 招标采购 | 财经 | 国际行情 | 价格趋势 | 技术跟踪 |
| ---- | ---- | -------- | -------- | -------- | -------- | -------- | ---- | -------- | -------- | -------- |
| yw   | zc   | sc       | mq       | dj       | xm       | zb       | cj   | gj       | sj       | js       |

</Route>

## 财新网

> 网站部分内容需要付费订阅，RSS 仅做更新提醒，不含付费内容。

### 新闻分类

<Route author="idealclover" example="/caixin/finance/regulation" path="/caixin/:column/:category" :paramsDesc="['栏目名', '栏目下的子分类名']" supportPodcast="1">

Column 列表：

| 经济    | 金融    | 政经  | 环科    | 世界          | 观点网  | 文化    | 周刊   |
| ------- | ------- | ----- | ------- | ------------- | ------- | ------- | ------ |
| economy | finance | china | science | international | opinion | culture | weekly |

以金融板块为例的 category 列表：（其余 column 以类似方式寻找）

| 监管       | 银行 | 证券基金 | 信托保险        | 投资       | 创新       | 市场   |
| ---------- | ---- | -------- | --------------- | ---------- | ---------- | ------ |
| regulation | bank | stock    | insurance_trust | investment | innovation | market |

Category 列表：

| 封面报道   | 开卷  | 社论      | 时事            | 编辑寄语    | 经济    | 金融    | 商业     | 环境与科技             | 民生    | 副刊   |
| ---------- | ----- | --------- | --------------- | ----------- | ------- | ------- | -------- | ---------------------- | ------- | ------ |
| coverstory | first | editorial | current_affairs | editor_desk | economy | finance | business | environment_technology | cwcivil | column |

</Route>

### 首页新闻

<Route author="EsuRt"  example="/caixin/article" path="/caixin/article" radar="1" supportPodcast="1"/>

### 最新文章

<Route author="tpnonthealps" example="/caixin/latest" path="/caixin/latest" radar="1">

说明：此 RSS feed 会自动抓取财新网的最新文章，但不包含 FM 及视频内容。

</Route>

### 财新数据通

<Route author="nczitzk" example="/caixin/database" path="/caixin/database" radar="1"/>

### 财新一线

<Route author="boypt"  example="/caixin/k" path="/caixin/k" radar="1" supportPodcast="1"/>

## 参考消息

### 栏目

<Route author="yuxinliu-alex nczitzk" example="/cankaoxiaoxi/column/diyi" path="/cankaoxiaoxi/column/:id?" :paramsDesc="['栏目 id，默认为 diyi，即第一关注']">

| 栏目           | id       |
| -------------- | -------- |
| 第一关注       | diyi     |
| 中国           | zhongguo |
| 国际           | gj       |
| 观点           | guandian |
| 锐参考         | ruick    |
| 体育健康       | tiyujk   |
| 科技应用       | kejiyy   |
| 文化旅游       | wenhualy |
| 参考漫谈       | cankaomt |
| 研究动态       | yjdt     |
| 海外智库       | hwzk     |
| 业界信息・观点 | yjxx     |
| 海外看中国城市 | hwkzgcs  |
| 译名趣谈       | ymymqt   |
| 译名发布       | ymymfb   |
| 双语汇         | ymsyh    |
| 参考视频       | video    |
| 军事           | junshi   |
| 参考人物       | cankaorw |

</Route>

## 朝日新聞中文網（繁體中文版）

::: tip 提示

朝日新闻中文网已于 2021 年 3 月 31 日关闭。

:::

### 新聞

<Route author="nczitzk" example="/asahi" path="/asahi/:genre?/:category?" :paramsDesc="['类型，见下表，默认为トップ', '分类，见下表，默认为空，即该类型下所有新闻']">

::: tip 提示

以下小标题即类型 `genre`，标题下表格中为对应类型的分类 `category`，两者需要配合使用。

如订阅 **社会** 类型中的 **事件・事故・裁判** 分类，填入 [`/asahi/national/incident`](http://rsshub.app/asahi/national/incident)。

若类型下没有分类，如 **トップ** 类型，直接填入 [`/asahi/top`](http://rsshub.app/asahi/top)。

或者欲订阅该类型下的所有分类，如订阅 **社会** 中的所有分类，则直接将分类 `category` 留空，即 [`/asahi/national`](http://rsshub.app/asahi/national)。

:::

トップ top

社会 national

| 事件・事故・裁判 | 災害・交通情報 | その他・話題 | おくやみ   |
| ---------------- | -------------- | ------------ | ---------- |
| incident         | calamity       | etc          | obituaries |

経済 business

| 産業・商品 | 金融・財政 | 経済政策       | 労働・雇用 | 市況・統計 |
| ---------- | ---------- | -------------- | ---------- | ---------- |
| industry   | finance    | economicpolicy | work       | statistics |

政治 politics

| 国政       | 地方政治 | 発言録       | 世論調査 |
| ---------- | -------- | ------------ | -------- |
| government | local    | hatsugenroku | yoron    |

国際 international

| アジア・太平洋 | 北米     | 中南米   | ヨーロッパ | 中東       | アフリカ | 国連・その他 |
| -------------- | -------- | -------- | ---------- | ---------- | -------- | ------------ |
| asia           | namerica | samerica | europe     | middleeast | africa   | etc          |

スポーツ sports

| 野球     | サッカー | 相撲 | フィギュア         | ゴルフ | 一般スポーツ | 東京オリンピック 2020 | 東京パラリンピック 2020 |
| -------- | -------- | ---- | ------------------ | ------ | ------------ | --------------------- | ----------------------- |
| baseball | soccer   | sumo | winter_figureskate | golf   | general      | olympics              | paralympics             |

IT・科学 tech_science

| 環境・エネルギー | 科学    | デジもの | 企業・サービス | 製品ファイル |
| ---------------- | ------- | -------- | -------------- | ------------ |
| eco              | science | digital  | service        | products     |

文化・芸能 culture

| 映画   | 音楽  | アイドル | アート | テレビ・芸能 | 舞台・演芸 | マンガ・アニメ・ゲーム | ひと・歴史 | 囲碁 | 将棋   |
| ------ | ----- | -------- | ------ | ------------ | ---------- | ---------------------- | ---------- | ---- | ------ |
| movies | music | idol     | art    | showbiz      | stage      | manga                  | history    | igo  | shougi |

ライフ life

| 介護      | 働き方・就活 | 食・料理 |
| --------- | ------------ | -------- |
| eldercare | hataraku     | food     |

教育・子育て edu

| 小中高  | 大学       | 教育制度・話題 | 教育問題 | 地域の教育ニュース | 吹奏楽    | 合唱   | 子育て   | ハグスタ |
| ------- | ---------- | -------------- | -------- | ------------------ | --------- | ------ | -------- | -------- |
| student | university | system         | issue    | chiiki             | suisogaku | gassho | hagukumu | msta     |

</Route>

## 朝日新聞デジタル

<Route author="nczitzk" example="/asahi/area/hokkaido" path="/asahi/area/:id" :paramsDesc="['地方 id，见下表']">

北海道・東北

| 北海道   | 青森   | 秋田  | 岩手  | 山形     | 宮城   | 福島      |
| -------- | ------ | ----- | ----- | -------- | ------ | --------- |
| hokkaido | aomori | akita | iwate | yamagata | miyagi | fukushima |

関東

| 群馬  | 茨城    | 栃木    | 埼玉    | 千葉  | 東京  | 神奈川   |
| ----- | ------- | ------- | ------- | ----- | ----- | -------- |
| gunma | ibaraki | tochigi | saitama | chiba | tokyo | kanagawa |

東海・甲信越

| 静岡     | 岐阜 | 愛知  | 三重 | 新潟    | 山梨      | 長野   |
| -------- | ---- | ----- | ---- | ------- | --------- | ------ |
| shizuoka | gifu | aichi | mie  | niigata | yamanashi | nagano |

近畿・北陸

| 滋賀  | 京都  | 奈良 | 和歌山   | 大阪  | 兵庫  | 富山   | 石川     | 福井  |
| ----- | ----- | ---- | -------- | ----- | ----- | ------ | -------- | ----- |
| shiga | kyoto | nara | wakayama | osaka | hyogo | toyama | ishikawa | fukui |

中国・四国

| 鳥取    | 島根    | 岡山    | 広島      | 山口      | 香川   | 愛媛  | 徳島      | 高知  |
| ------- | ------- | ------- | --------- | --------- | ------ | ----- | --------- | ----- |
| tottori | shimane | okayama | hiroshima | yamaguchi | kagawa | ehime | tokushima | kochi |

九州・沖縄

| 福岡    | 大分 | 宮崎     | 鹿児島    | 佐賀 | 長崎     | 熊本     | 沖縄    |
| ------- | ---- | -------- | --------- | ---- | -------- | -------- | ------- |
| fukuoka | oita | miyazaki | kagoshima | saga | nagasaki | kumamoto | okinawa |

</Route>

## 朝鲜中央通讯社

### 新闻

<Route author="Rongronggg9" example="/kcna/cn" path="/kcna/:lang/:category?" :paramsDesc="['语言，见下表', '分类，见下表']" anticrawler="1" radar="1" rssbud="1">

| 语言    | 조선어 | English | 中国语 | Русский | Español | 日本語 |
| ------- | ------ | ------- | ------ | ------- | ------- | ------ |
| `:lang` | `kp`   | `en`    | `cn`   | `ru`    | `es`    | `jp`   |

| 分类                                       | `:category`                        |
| ------------------------------------------ | ---------------------------------- |
| 朝鲜劳动党总书记**金正恩**同志革命活动新闻 | `54c0ca4ca013a92cc9cf95bd4004c61a` |
| 最新新闻 (默认)                            | `1ee9bdb7186944f765208f34ecfb5407` |
| 主要新闻                                   | `5394b80bdae203fadef02522cfb578c0` |
| 国内新闻                                   | `b2b3bcc1b0a4406ab0c36e45d5db58db` |
| 文件                                       | `a8754921399857ebdbb97a98a1e741f5` |
| 国际新闻                                   | `593143484cf15d48ce85c26139582395` |
| 社会－生活                                 | `93102e5a735d03979bc58a3a7aefb75a` |
| 对外关系                                   | `0f98b4623a3ef82aeea78df45c423fd0` |
| 时事解说                                   | `12c03a49f7dbe829bceea8ac77088c21` |

</Route>

## 第一财经

### 最新

<Route author="nczitzk" example="/yicai/latest" path="/yicai/latest" />

### 头条

<Route author="nczitzk" example="/yicai/headline" path="/yicai/headline" />

### VIP 频道

<Route author="nczitzk" example="/yicai/vip/428" path="/yicai/vip/:id?" :paramsDesc="['频道 id，可在对应频道页中找到，默认为一元点金']" />

### 新闻

<Route author="nczitzk" example="/yicai/news" path="/yicai/news/:id?" :paramsDesc="['分类 id，见下表，可在对应分类页中找到，默认为新闻']" >

| Id                     | 名称       |
| ---------------------- | ---------- |
| gushi                  | A 股       |
| kechuangban            | 科创板     |
| hongguan               | 大政       |
| jinrong                | 金融       |
| quanqiushichang        | 海外市场   |
| gongsi                 | 产经       |
| shijie                 | 全球       |
| kechuang               | 科技       |
| quyu                   | 区域       |
| comment                | 评论       |
| dafengwenhua           | 商业人文   |
| books                  | 阅读周刊   |
| loushi                 | 地产       |
| automobile             | 汽车       |
| china_financial_herald | 对话陆家嘴 |
| fashion                | 时尚       |
| ad                     | 商业资讯   |
| info                   | 资讯       |
| jzfxb                  | 价值风向标 |
| shuducaijing           | 数读财经   |
| shujujiepan            | 数据解盘   |
| shudushenghuo          | 数读生活   |
| cbndata                | CBNData    |
| dtcj                   | DT 财经    |
| xfsz                   | 消费数知   |

</Route>

### 关注

<Route author="nczitzk" example="/yicai/feed/669" path="/yicai/feed/:id?" :paramsDesc="['主题 id，可在对应主题页中找到，默认为一财早报']">

::: tip 提示

全部主题词见 [此处](https://www.yicai.com/feed/alltheme)

:::

</Route>

### 视听

<Route author="nczitzk" example="/yicai/video" path="/yicai/video/:id?" :paramsDesc="['分类 id，见下表，可在对应分类页中找到，默认为视听']">

| Id                   | 名称                         |
| -------------------- | ---------------------------- |
| youliao              | 有料                         |
| appshipin            | 此刻                         |
| yicaisudi            | 速递                         |
| caishang             | 财商                         |
| shiji                | 史记                         |
| jinrigushi           | 今日股市                     |
| tangulunjin          | 谈股论金                     |
| gongsiyuhangye       | 公司与行业                   |
| cjyxx                | 财经夜行线                   |
| 6thtradingday        | 第六交易日                   |
| cjfw                 | 财经风味                     |
| chuangshidai         | 创时代                       |
| weilaiyaoqinghan     | 未来邀请函                   |
| tounaofengbao        | 头脑风暴                     |
| zhongguojingyingzhe  | 中国经营者                   |
| shichanglingjuli     | 市场零距离                   |
| huanqiucaijing       | 环球财经视界                 |
| zgjcqyjglsxftl       | 中国杰出企业家管理思想访谈录 |
| jiemacaishang        | 解码财商                     |
| sxpl                 | 首席评论                     |
| zhongguojingjiluntan | 中国经济论坛                 |
| opinionleader        | 意见领袖                     |
| xinjinrong           | 解码新金融                   |
| diyidichan           | 第一地产                     |
| zhichedaren          | 智车达人                     |
| chuangtoufengyun     | 创投风云                     |
| chunxiangrensheng    | 醇享人生                     |
| diyishengyin         | 第一声音                     |
| sanliangboqianjin    | 财智双全                     |
| weilaiyaoqinghan     | 未来邀请函                   |
| zjdy                 | 主角 ▪ 大医                  |
| leye                 | 乐业之城                     |
| sanrenxing           | 价值三人行                   |
| yuandongli           | 中国源动力                   |
| pioneerzone          | 直击引领区                   |

</Route>

### 正在

<Route author="sanmmm nczitzk" example="/yicai/brief" path="/yicai/brief" />

### 一财号

<Route author="nczitzk" example="/yicai/author/100005663" path="/yicai/author/:id?" :paramsDesc="['作者 id，可在对应作者页中找到，默认为第一财经研究院']" />

## 东方网

### 上海新闻

<Route author="saury" example="/eastday/sh" path="/eastday/sh"/>

### 热点搜索

<Route author="nczitzk" example="/eastday/find" path="/eastday/find"/>

### 原创

<Route author="nczitzk" example="/eastday/portrait" path="/eastday/portrait"/>

### 24 小时热闻

<Route author="nczitzk" example="/eastday/24" path="/eastday/24/:category?" :paramsDesc="['分类，见下表，默认为社会']">

| 推荐 | 社会 | 娱乐 | 国际 | 军事 |
| ---- | ---- | ---- | ---- | ---- |

| 养生 | 汽车 | 体育 | 财经 | 游戏 |
| ---- | ---- | ---- | ---- | ---- |

| 科技 | 国内 | 宠物 | 情感 | 人文 | 教育 |
| ---- | ---- | ---- | ---- | ---- | ---- |

</Route>

## 东网

### 即時新聞

<Route author="Fatpandac" example="/oncc/zh-hant/news" path="/oncc/:language/:channel?" :paramsDesc="['`zh-hans` 为简体，`zh-hant` 为繁体', '频道，默认为港澳']">

频道参数可以从官网的地址中获取，如：

`https://hk.on.cc/hk/finance/index_cn.html` 对应 `/oncc/zh-hans/finance`

`https://hk.on.cc/hk/finance/index.html` 对应 `/oncc/zh-hant/finance`

</Route>

### Money18

<Route author="nczitzk" example="/oncc/money18/exp" path="/oncc/money18/:id?" :paramsDesc="['栏目 id，可在对应栏目页 URL 中找到，默认为 exp，即新聞總覽']">

| 新聞總覽 | 全日焦點 | 板塊新聞 | 國際金融 | 大行報告 | A 股新聞 | 地產新聞 | 投資理財  | 新股 IPO | 科技財情 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | --------- | -------- | -------- |
| exp      | fov      | industry | int      | recagent | ntlgroup | pro      | weainvest | ipo      | tech     |

</Route>

## 読売新聞

### 新聞

<Route author="Arracc" example="/yomiuri/news" path="/yomiuri/:category" :paramsDesc="['板块']">

无料全文，综合页 (新着・速報) 文章标题补充板块标签。

| 新着・速報 | 社会     | 政治     | 経済    | スポーツ | 国際  | 科学・ＩＴ | 選挙・世論調査 | エンタメ・文化 | 囲碁・将棋 | ライフ | 地域  | 社説      | 皇室      |
| ---------- | -------- | -------- | ------- | -------- | ----- | ---------- | -------------- | -------------- | ---------- | ------ | ----- | --------- | --------- |
| news       | national | politics | economy | sports   | world | science    | election       | culture        | igoshougi  | life   | local | editorial | koushitsu |

</Route>

## 俄罗斯卫星通讯社

### 分类

<Route author="nczitzk" example="/sputniknews" path="/sputniknews/:category?/:language?" :paramsDesc="['分类，可在对应分类页 URL 中找到，默认为 news', '语言，见下表，默认为 English']">

以下为国际站的部分分类：

| WORLD | COVID-19 | BUSINESS | SPORT | TECH | OPINION |
| ----- | -------- | -------- | ----- | ---- | ------- |
| world | covid-19 | business | sport | tech | opinion |

以下为中国站的部分分类：

| 新闻 | 中国  | 俄罗斯 | 国际           | 俄中关系               | 评论    |
| ---- | ----- | ------ | -------------- | ---------------------- | ------- |
| news | china | russia | category_guoji | russia_china_relations | opinion |

语言

| 语言        | 编号        |
| ----------- | ----------- |
| English     | english     |
| Spanish     | spanish     |
| German      | german      |
| French      | french      |
| Greek       | greek       |
| Italian     | italian     |
| Czech       | czech       |
| Polish      | polish      |
| Serbian     | serbian     |
| Latvian     | latvian     |
| Lithuanian  | lithuanian  |
| Moldavian   | moldavian   |
| Belarusian  | belarusian  |
| Armenian    | armenian    |
| Abkhaz      | abkhaz      |
| Ssetian     | ssetian     |
| Georgian    | georgian    |
| Azerbaijani | azerbaijani |
| Arabic      | arabic      |
| Turkish     | turkish     |
| Persian     | persian     |
| Dari        | dari        |
| Kazakh      | kazakh      |
| Kyrgyz      | kyrgyz      |
| Uzbek       | uzbek       |
| Tajik       | tajik       |
| Vietnamese  | vietnamese  |
| Japanese    | japanese    |
| Chinese     | chinese     |
| Portuguese  | portuguese  |

</Route>

## 公視新聞網

### 即時新聞

<Route author="nczitzk" example="/pts/dailynews" path="/pts/dailynews"/>

### 專題策展

<Route author="nczitzk" example="/pts/curations" path="/pts/curations"/>

### 觀點

<Route author="nczitzk" example="/pts/opinion" path="/pts/opinion"/>

### 數位敘事

<Route author="nczitzk" example="/pts/projects" path="/pts/projects"/>

### 深度報導

<Route author="nczitzk" example="/pts/report" path="/pts/report"/>

### 分類

<Route author="nczitzk" example="/pts/category/9" path="/pts/category/:id" :paramsDesc="['分類 id，见下表，可在对应分類页 URL 中找到']">

| 名称     | 编号 |
| -------- | ---- |
| 政治     | 1    |
| 社會     | 7    |
| 全球     | 4    |
| 生活     | 5    |
| 兩岸     | 9    |
| 地方     | 11   |
| 產經     | 10   |
| 文教科技 | 6    |
| 環境     | 3    |
| 社福人權 | 12   |

</Route>

### 標籤

<Route author="nczitzk" example="/pts/tag/230" path="/pts/tag/:id" :paramsDesc="['標籤 id，可在对应標籤页 URL 中找到']"/>

### 整理報導

<Route author="nczitzk" example="/pts/live/62e8e4bbb4de2cbd74468b2b" path="/pts/live/:id" :paramsDesc="['報導 id，可在对应整理報導页 URL 中找到']"/>

## 共同网

### 最新报道

<Route author="Rongronggg9" example="/kyodonews" path="/kyodonews/:language?/:keyword?" :paramsDesc="['语言: `china` = 简体中文 (默认), `tchina` = 繁體中文', '关键词']">

`keyword` 为关键词，由于共同网有许多关键词并不在主页列出，此处不一一列举，可从关键词页的 URL 的最后一级路径中提取。如 `日中关系` 的关键词页 URL 为 `https://china.kyodonews.net/news/japan-china_relationship`, 则将 `japan-china_relationship` 填入 `keyword`。特别地，当填入 `rss` 时，将从共同网官方 RSS 中抓取文章；略去时，将从首页抓取最新报道 (注意：首页更新可能比官方 RSS 稍慢)。

</Route>

## 广州日报

### 客户端

<Route author="TimWu007" example="/gzdaily/app/74" path="/gzdaily/app/:column?" :paramsDesc="['栏目 ID，点击对应栏目后在地址栏找到']">

::: tip 提示

在北京时间深夜可能无法获取内容。

:::

常用栏目 ID：

| 栏目名 | ID   |
| ------ | ---- |
| 首页   | 74   |
| 时局   | 374  |
| 广州   | 371  |
| 大湾区 | 397  |
| 城区   | 2980 |

</Route>

### 新花城（广州市融媒体中心）

<Route author="TimWu007" example="/gzdaily/cmc/shouye" path="/gzdaily/cmc/:channel?" :paramsDesc="['频道名']">

::: tip 提示

`频道名（channel）` 可在对应频道 url 后的参数中获取，如 `首页` 的栏目 url 为`https://huacheng.gz-cmc.com/channel/shouye/index.html`, `频道名` 即为 `shouye`。

:::

</Route>

## 国际金融报栏目

### 栏目

<Route author="Origami404" example="/ifnews/48" path="/ifnews/:cid" :paramsDesc="['栏目 ID']">

`cid`可在对应栏目的 url 后的参数中获取，如`热点快报`的栏目 url 为`http://www.ifnews.com/column.html?cid=48`, `cid`即为`48`.

</Route>

## 衡阳全搜索

### 衡阳日报

<Route author="nczitzk" example="/hyqss/hyrb" path="/hyqss/hyrb/:id?" :paramsDesc="['编号，见下表，默认为全部']">

| 版                | 编号 |
| ----------------- | ---- |
| 全部              |      |
| 第 A01 版：版面一 | 1    |
| 第 A02 版：版面二 | 2    |
| 第 A03 版：版面三 | 3    |
| 第 A04 版：版面四 | 4    |
| 第 A05 版：版面五 | 5    |
| 第 A06 版：版面六 | 6    |
| 第 A07 版：版面七 | 7    |
| 第 A08 版：版面八 | 8    |

</Route>

### 衡阳晚报

<Route author="nczitzk" example="/hyqss/hywb" path="/hyqss/hywb/:id?" :paramsDesc="['编号，见下表，默认为全部']">

| 版                | 编号 |
| ----------------- | ---- |
| 全部              |      |
| 第 A01 版：版面一 | 1    |
| 第 A02 版：版面二 | 2    |
| 第 A03 版：版面三 | 3    |
| 第 A04 版：版面四 | 4    |
| 第 A05 版：版面五 | 5    |
| 第 A06 版：版面六 | 6    |
| 第 A07 版：版面七 | 7    |
| 第 A08 版：版面八 | 8    |

</Route>

## 湖南日报

### 电子刊物

<Route author="nczitzk" example="/hnrb" path="/hnrb/:id?" :paramsDesc="['编号，见下表，默认为全部']" anticrawler="1">

| 版                   | 编号 |
| -------------------- | ---- |
| 全部                 |      |
| 第 01 版：头版       | 1    |
| 第 02 版：要闻       | 2    |
| 第 03 版：要闻       | 3    |
| 第 04 版：深度       | 4    |
| 第 05 版：市州       | 5    |
| 第 06 版：理论・学习 | 6    |
| 第 07 版：观察       | 7    |
| 第 08 版：时事       | 8    |
| 第 09 版：中缝       | 9    |

</Route>

## 华尔街见闻

### 资讯

<Route author="nczitzk" example="/wallstreetcn/global" path="/wallstreetcn/:category?" :paramsDesc="['资讯分类，默认`global`，见下表']">

| id           | 分类 |
| ------------ | ---- |
| global       | 最新 |
| shares       | 股市 |
| bonds        | 债市 |
| commodities  | 商品 |
| forex        | 外汇 |
| enterprise   | 公司 |
| asset-manage | 资管 |
| tmt          | 科技 |
| estate       | 地产 |
| car          | 汽车 |
| medicine     | 医药 |

</Route>

### 最新

<Route author="conanjunn nczitzk" example="/wallstreetcn/news/global" path="/wallstreetcn/news/global" />

### 实时快讯

<Route author="nczitzk" example="/wallstreetcn/live" path="/wallstreetcn/live/:category?/:score?" :paramsDesc="['快讯分类，默认`global`，见下表', '快讯重要度，默认`1`全部快讯，可设置为`2`只看重要的']">

| 要闻   | A 股    | 美股     | 港股     | 外汇  | 商品      | 理财      |
| ------ | ------- | -------- | -------- | ----- | --------- | --------- |
| global | a-stock | us-stock | hk-stock | forex | commodity | financing |

</Route>

### 最热文章

<Route author="nczitzk" example="/wallstreetcn/hot" path="/wallstreetcn/hot/:period?" :paramsDesc="['时期，可选 `day` 即 当日 或 `week` 即 当周，默认为当日']"/>

## 华尔街日报 The Wall Street Journal (WSJ)

### 新闻

<Route author="oppilate NavePnow" example="/wsj/en-us/opinion" path="/wsj/:lang/:category?" :paramsDesc="['语言，支持 `en-us`、`zh-cn`、`zh-tw`', '分类，见下表']">

en_us

| World | U.S. | Politics | Economy | Business | Tech       | Markets | Opinion | Books & Arts | Real Estate | Life & Work | Sytle               | Sports |
| ----- | ---- | -------- | ------- | -------- | ---------- | ------- | ------- | ------------ | ----------- | ----------- | ------------------- | ------ |
| world | us   | politics | economy | business | technology | markets | opinion | books-arts   | realestate  | life-work   | style-entertainment | sports |

zh-cn / zh-tw

| 国际  | 中国  | 金融市场 | 经济    | 商业     | 科技       | 派        | 专栏与观点 |
| ----- | ----- | -------- | ------- | -------- | ---------- | --------- | ---------- |
| world | china | markets  | economy | business | technology | life-arts | opinion    |

通过提取文章全文，以提供比官方源更佳的阅读体验。

</Route>

## 華視

### 新聞

<Route author="miles170" example="/cts/real" path="/cts/:category" :paramsDesc="['类别']" radar="1">

| 即時 | 氣象    | 政治     | 國際          | 社會    | 運動   | 生活 | 財經  | 台語      | 地方  | 產業 | 綜合    | 藝文 | 娛樂      |
| ---- | ------- | -------- | ------------- | ------- | ------ | ---- | ----- | --------- | ----- | ---- | ------- | ---- | --------- |
| real | weather | politics | international | society | sports | life | money | taiwanese | local | pr   | general | arts | entertain |

</Route>

## 环球网

### 分类

<Route author="yuxinliu-alex" example="/huanqiu/news/china" path="/huanqiu/news/:category?" :paramsDesc="['类别，可以使用二级域名作为参数，默认为：china']">

| 国内新闻 | 国际新闻 | 军事 | 台海   | 评论    |
| -------- | -------- | ---- | ------ | ------- |
| china    | world    | mil  | taiwai | opinion |

</Route>

## 极客公园

### 全球快讯

<Route author="xyqfer" example="/geekpark/breakingnews" path="/geekpark/breakingnews" />

## 界面新闻

### 快报

<Route author="nczitzk" example="/jiemian" path="/jiemian" />

### 栏目

<Route author="WenhuWee nczitzk" example="/jiemian/list/65" path="/jiemian/list/:id?" :paramsDesc="['栏目，可在对应栏目页 URL 中找到，默认为 `4` 即快报']" />

## 经济观察网

### 栏目

<Route author="nczitzk" example="/eeo/yaowen/dashi" path="/eeo/:column?/:category?" :paramsDesc="['栏目，见下表，默认为 商业产业', '分类，见下表，默认为该栏目下所有分类']">

::: tip 提示

以下小标题即栏目 `column`，标题下表格中为对应栏目的分类 `category`，两者需要配合使用。

如订阅 **时事・政策・宏观** 栏目中的 **大宗商品** 分类，填入 [`/eeo/yaowen/dzsp`](http://rsshub.app/eeo/yaowen/dzsp)。

若栏目下没有分类，如 **商业产业** 栏目，直接填入 [`/eeo/shangyechanye`](http://rsshub.app/eeo/shangyechanye)。

或者欲订阅该栏目下的所有分类，如订阅 **时事・政策・宏观** 中的所有分类，则直接将分类 `category` 留空，即 [`/eeo/yaowen`](http://rsshub.app/eeo/yaowen)。

:::

商业产业 shangyechanye [`/eeo/shangyechanye`](http://rsshub.app/eeo/shangyechanye)

财经 caijing [`/eeo/caijing`](http://rsshub.app/eeo/caijing)

上市公司 ssgsn [`/eeo/ssgsn`](http://rsshub.app/eeo/ssgsn)

地产 dichan [`/eeo/dichan`](http://rsshub.app/eeo/dichan)

汽车 qiche [`/eeo/qiche`](http://rsshub.app/eeo/qiche)

TMT tmt [`/eeo/tmt`](http://rsshub.app/eeo/tmt)

评论 pinglun [`/eeo/pinglun`](http://rsshub.app/eeo/pinglun)

研究院 yanjiuyuan [`/eeo/yanjiuyuan`](http://rsshub.app/eeo/yanjiuyuan)

::: tip 建议

请优先选择订阅以上栏目，下面的栏目大部分已经很久没有更新。

:::

两会 lianghui [`/eeo/lianghui`](http://rsshub.app/eeo/lianghui)

时事・政策・宏观 yaowen [`/eeo/yaowen`](http://rsshub.app/eeo/yaowen)

| 时事  | 政策   | 宏观    | 智库       | 首席观点 | 大宗商品 |
| ----- | ------ | ------- | ---------- | -------- | -------- |
| dashi | hfggzc | hfshuju | hfdongjian | sxgd     | dzsp     |

证券・资本・理财 jinrong [`/eeo/jinrong`](http://rsshub.app/eeo/jinrong)

| 债市    | 资本  | 理财  | 证券      | 银行  |
| ------- | ----- | ----- | --------- | ----- |
| zhaishi | ziben | licai | zhengquan | jijin |

| 保险    | PE / 创投 | 科创板      | 新三板    | 互联网金融 |
| ------- | --------- | ----------- | --------- | ---------- |
| jinkong | chuangtou | kechuangban | xinsanban | hlwjr      |

新科技・互联网・O2O shangye [`/eeo/shangye`](http://rsshub.app/eeo/shangye)

| 新科技      | 互联网    | 大健康 | O2O   | 花蕾之约     | 创业家笔记 | 环境     |
| ----------- | --------- | ------ | ----- | ------------ | ---------- | -------- |
| xinnengyuan | dianshang | yiliao | wuliu | hualeizhiyue | cyjbj      | huanjing |

房产・汽车・消费 fcqcxf [`/eeo/fcqcxf`](http://rsshub.app/eeo/fcqcxf)

| 房产   | 汽车  | 消费    |
| ------ | ----- | ------- |
| dichan | qiche | xiaofei |

影视・体育・娱乐 yule [`/eeo/yule`](http://rsshub.app/eeo/yule)

| 娱乐 | 影视    | 体育 | 教育   |
| ---- | ------- | ---- | ------ |
| yule | yingshi | tiyu | jiaoyu |

观察家・书评・思想 gcj [`/eeo/gcj`](http://rsshub.app/eeo/gcj)

| 观察家     | 专栏     | 个人历史 | 书评    |
| ---------- | -------- | -------- | ------- |
| guanchajia | zhuanlan | lishi    | shuping |

| 纵深     | 文化   | 领读   |
| -------- | ------ | ------ |
| zongshen | wenhua | lingdu |

</Route>

### 分类资讯

<Route author="epirus" example="/eeo/15" path="/eeo/:category" :paramsDesc="['分类']">

category 对应的关键词有

| 时事 | 政策 | 证券 | 资本 | 理财 | 新科技 | 大健康 | 房产 | 汽车 | 消费 | 影视 | 娱乐 | 体育 | 教育 | 观察家 | 专栏 | 书评 | 个人历史 | 宏观 |
| ---- | ---- | ---- | ---- | ---- | ------ | ------ | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ------ | ---- | ---- | -------- | ---- |
| 01   | 02   | 03   | 04   | 05   | 06     | 07     | 08   | 09   | 10   | 11   | 12   | 13   | 14   | 15     | 16   | 17   | 18       | 19   |

</Route>

## 靠谱新闻

### 新闻聚合

<Route author="wushijishan nczitzk" example="/kaopunews/:language?" path="/kaopunews" :paramsDesc="['语言，可选 zh-hans 即简体中文，或 zh-hant 即繁体中文']"/>

## 客家電視台

### 新聞首頁

<Route author="TonyRL" example="/hakkatv/news" path="/hakkatv/news/:type?" :paramsDesc="['新聞，見下表，留空為全部']" radar="1" rssbud="1">

| 客家焦點 | 政經要聞  | 民生醫療 | 地方風采 | 國際萬象      |
| -------- | --------- | -------- | -------- | ------------- |
| hakka    | political | medical  | local    | international |

</Route>

## 劳动新闻

### 新闻

<Route author="TonyRL" example="/rodong/news" path="/rodong/news/:language?" :paramsDesc="['语言，见下表，默认 `ko`']" radar="1">

| 조선어 | English | 中文 |
| ------ | ------- | ---- |
| ko     | en      | cn   |

</Route>

## 理论网

### 学习时报

<Route author="nczitzk" example="/cntheory/paper" path="/cntheory/paper/:id?" :paramsDesc="['板块，默认为全部']">

如订阅 **第 A1 版：国内大局**，路由为 [`/cntheory/paper/国内大局`](https://rsshub.app/cntheory/paper/国内大局)。

</Route>

## 连线 Wired

非订阅用户每月有阅读全文次数限制。

### 标签

<Route author="Naiqus" example="/wired/tag/bitcoin" path="/wired/tag/:tag" :paramsDesc="['标签']"/>

## 联合早报

::: warning 注意

由于 [RSSHub#10309](https://github.com/DIYgod/RSSHub/issues/10309) 中的问题，使用靠近香港的服务器部署将从 hk 版联合早报爬取内容，造成输出的新闻段落顺序错乱。如有订阅此源的需求，建议寻求部署在远离香港的服务器上的 RSSHub，或者在自建时选择远离香港的服务器。

:::

### 即时新闻

<Route author="lengthmin" example="/zaobao/realtime/china" path="/zaobao/realtime/:section?" :paramsDesc="['分类，缺省为 china']">

| 中国  | 新加坡    | 国际  | 财经     |
| ----- | --------- | ----- | -------- |
| china | singapore | world | zfinance |

</Route>

### 新闻

<Route author="lengthmin" example="/zaobao/znews/china" path="/zaobao/znews/:section?" :paramsDesc="['分类，缺省为 china']">

| 中国  | 新加坡    | 东南亚 | 国际  | 体育   |
| ----- | --------- | ------ | ----- | ------ |
| china | singapore | sea    | world | sports |

</Route>

### 其他栏目

除了上面两个兼容规则之外，联合早报网站里所有页面形如 <https://www.zaobao.com/wencui/politic> 这样的栏目都能被这个规则解析到，早报的大部分栏目都是这个样式的。你可以测试之后再订阅。

<Route author="lengthmin" example="/zaobao/wencui/politic" path="/zaobao/:type?/:section?" :paramsDesc="['https://www.zaobao.com/**wencui**/politic 中的 **wencui**', 'https://www.zaobao.com/wencui/**politic** 中的 **politic**']" />

### 互动新闻

<Route author="shunf4" example="/zaobao/interactive-graphics" path="/zaobao/interactive-graphics" />

## 聯合新聞網

### 即時新聞

<Route author="miles170" example="/udn/news/breakingnews/99" path="/udn/news/breakingnews/:id" :paramsDesc="['类别']" radar="1">

| 0    | 1    | 2    | 3    | 4    | 5    | 6    | 7    | 8    | 9    | 11   | 12   | 13   | 99     |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ------ |
| 精選 | 要聞 | 社會 | 地方 | 兩岸 | 國際 | 財經 | 運動 | 娛樂 | 生活 | 股市 | 文教 | 數位 | 不分類 |

</Route>

### 轉角國際 - 首頁

<Route author="emdoe nczitzk" example="/udn/global" path="/udn/global/:category?" :paramsDesc="['分类，见下表，默认为首頁']">

| 首頁 | 最新文章 | 熱門文章 |
| ---- | -------- | -------- |
|      | new      | hot      |

</Route>

### 轉角國際 - 標籤

<Route author="nczitzk" example="/udn/global/tag/過去24小時" path="/udn/global/tag/:tag?" :paramsDesc="['标签，可在对应标签页 URL 中找到']">

| 過去 24 小時 | 鏡頭背後 | 深度專欄 | 重磅廣播 |
| ------------ | -------- | -------- | -------- |

</Route>

## 路透社

::: warning 迁移说明

1.  路透社中文网站 (`cn.reuters.com`) 和英国网站 (`uk.reuters.com`) 已经关闭，并重定向至主站 (`www.reuters.com`)
2.  旧路由已被废弃，请迁移至下面列出的新路由

:::

### 分类 / 话题 / 作者

<Route author="HenryQW proletarius101 LyleLee" example="/reuters/world/us" path="/reuters/:category/:topic?" :paramsDesc="['可在 URL 中找到，或参考下面的表格', '可在 URL 中找到，或参考下面的表格']">

-   `:category`:
    | World | Business | Legal | Markets | Breakingviews | Technology |
    | ----- | -------- | ----- | ------- | ------------- | ---------- |
    | world | business | legal | markets | breakingviews | technology |

-   `world/:topic`:

    | All | Africa | Americas | Asia Pacific | China | Europe | India | Middle East | United Kingdom | United States | The Great Reboot | Reuters Next |
    | --- | ------ | -------- | ------------ | ----- | ------ | ----- | ----------- | -------------- | ------------- | ---------------- | ------------ |
    |     | africa | americas | asia-pacific | china | europe | india | middle-east | uk             | us            | the-great-reboot | reuters-next |

-   `business/:topic`:

    | All | Aerospace & Defense | Autos & Transportation | Energy | Environment | Finance | Healthcare & Pharmaceuticals | Media & Telecom | Retail & Consumer | Sustainable Business | Charged | Future of Health | Future of Money | Take Five | Reuters Impact |
    | --- | ------------------- | ---------------------- | ------ | ----------- | ------- | ---------------------------- | --------------- | ----------------- | -------------------- | ------- | ---------------- | --------------- | --------- | -------------- |
    |     | aerospace-defense   | autos-transportation   | energy | environment | finance | healthcare-pharmaceuticals   | media-telecom   | retail-consumer   | sustainable-business | charged | future-of-health | futrue-of-money | take-five | reuters-impact |

-   `legal/:topic`:

    | All | Goverment | Legal Industry | Litigation | Transaction |
    | --- | --------- | -------------- | ---------- | ----------- |
    |     | goverment | legalindustry  | litigation | transaction |

-   `authors/:topic`:

    | 默认    | Jonathan Landay | 其他作者                |
    | ------- | --------------- | ----------------------- |
    | reuters | jonathan-landay | 作者名，可在 URL 中找到 |

可在分类 / 话题页的 URL 中找到更多。

</Route>

### 深度调查栏目

<Route author="LyleLee" example="/reuters/investigates" path="/reuters/investigates" />

## 蒙古之声

### 新闻

<Route author="zphw" example="/vom/featured" path="/vom/featured/:lang?" :paramsDesc="['语言，见下表，默认 `mn`']">

| English | 日本語 | Монгол | Русский | 简体中文 |
| ------- | ------ | ------ | ------- | -------- |
| en      | ja     | mn     | ru      | zh       |

</Route>

## 明报

### 即时新闻

<Route author="TonyRL" example="/mingpao/ins/all" path="/mingpao/ins/:category?" :paramsDesc="['频道，预设为总目录']">

| category | 即时新闻频道 |
| -------- | ------------ |
| all      | 总目录       |
| s00001   | 港闻         |
| s00002   | 经济         |
| s00003   | 地产         |
| s00004   | 两岸         |
| s00005   | 国际         |
| s00006   | 体育         |
| s00007   | 娱乐         |
| s00022   | 文摘         |
| s00024   | 热点         |

</Route>

### 每日明报

<Route author="TonyRL" example="/mingpao/pns/s00001" path="/mingpao/pns/:category?" :paramsDesc="['频道，预设为要闻']">

| category | 每日明报频道 |
| -------- | ------------ |
| s00001   | 要闻         |
| s00002   | 港闻         |
| s00003   | 社评         |
| s00004   | 经济         |
| s00005   | 副刊         |
| s00011   | 教育         |
| s00012   | 观点         |
| s00013   | 中国         |
| s00014   | 国际         |
| s00015   | 体育         |
| s00016   | 娱乐         |
| s00017   | 英文         |
| s00018   | 作家专栏     |

</Route>

## 南方周末

### 新闻分类

<Route author="ranpox xyqfer" example="/infzm/2" path="/infzm/:id" :paramsDesc="['南方周末内容分区 id, 可在该内容分区的 URL 中找到（即 https://www.infzm.com/contents?term_id=:id)']">

下面给出部分参考：

| 推荐 | 新闻 | 观点 | 文化 | 人物 | 影像 | 专题 | 生活 | 视频 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 1    | 2    | 3    | 4    | 7    | 8    | 6    | 5    | 131  |

</Route>

## 南湖清风

### 嘉兴日报

<Route author="nczitzk" example="/cnjxol/jxrb" path="/cnjxol/jxrb/:id?" :paramsDesc="['编号，见下表，默认为全部']" anticrawler="1">

| 版                   | 编号 |
| -------------------- | ---- |
| 全部                 |      |
| 第 01 版：要闻       | 01   |
| 第 02 版：要闻       | 02   |
| 第 03 版：要闻       | 03   |
| 第 04 版：嘉一度     | 04   |
| 第 05 版：聚焦       | 05   |
| 第 06 版：党报热线   | 06   |
| 第 07 版：天下       | 07   |
| 第 08 版：聚焦       | 08   |
| 第 09 版：南湖新闻   | 09   |
| 第 10 版：综合       | 10   |
| 第 11 版：梅花洲     | 11   |
| 第 12 版：南湖纵横   | 12   |
| 第 13 版：秀洲新闻   | 13   |
| 第 14 版：综合       | 14   |
| 第 15 版：秀・观察   | 15   |
| 第 16 版：走进高新区 | 16   |

</Route>

### 南湖晚报

<Route author="nczitzk" example="/cnjxol/nhwb" path="/cnjxol/nhwb/:id?" :paramsDesc="['编号，见下表，默认为全部']" anticrawler="1">

| 版                                   | 编号 |
| ------------------------------------ | ---- |
| 全部                                 |      |
| 第 01 版：要闻                       | 01   |
| 第 02 版：品质嘉兴・红船旁的美丽城镇 | 02   |
| 第 03 版：嘉兴新闻                   | 03   |
| 第 04 版：嘉兴新闻                   | 04   |
| 第 05 版：今日聚焦                   | 05   |
| 第 06 版：嘉兴新闻                   | 06   |
| 第 07 版：热线新闻                   | 07   |
| 第 08 版：财经新闻                   | 08   |
| 第 09 版：热线新闻                   | 09   |
| 第 10 版：公益广告                   | 10   |
| 第 11 版：消费周刊                   | 11   |
| 第 12 版：悦读坊                     | 12   |

</Route>

## 南华早报 SCMP

### 新闻

<Route author="proletarius101" example="/scmp/3" path="/scmp/:category_id" :paramsDesc="['栏目分类']">

栏目分类对应的数字编号见 [官方 RSS](https://www.scmp.com/rss)。相比官方提供的 RSS，多提供了全文输出。

</Route>

## 内蒙古广播电视台

### 点播

<Route author="nczitzk" example="/nmtv/column/877" path="/nmtv/column/:id?" :paramsDesc="['栏目 id，可在对应栏目 URL 中找到']">

::: tip 提示

如 [蒙古语卫视新闻联播](http://www.nmtv.cn/folder292/folder663/folder301/folder830/folder877) 的 URL 为 <http://www.nmtv.cn/folder292/folder663/folder301/folder830/folder877>，其栏目 id 为末尾数字编号，即 `877`。可以得到其对应路由为 [`/nmtv/column/877`](https://rsshub.app/nmtv/column/877)

:::

</Route>

## 纽约时报

### 新闻

<Route author="HenryQW" example="/nytimes/dual" path="/nytimes/:lang?" :paramsDesc="['语言，缺省中文']" puppeteer="1">

通过提取文章全文，以提供比官方源更佳的阅读体验。

| 默认中文 | 中英对照 | 英文 | 中英对照 （繁体中文）   | 繁体中文           |
| -------- | -------- | ---- | ----------------------- | ------------------ |
| （空）   | dual     | en   | dual-traditionalchinese | traditionalchinese |

</Route>

### 作者新闻

<Route author="kevinschaul" example="/nytimes/author/farhad-manjoo" path="/nytimes/author/:byline" :paramsDesc="['Author’s name in New York Times’ URL format']">

提供指定作者的所有文章。

</Route>

### 新闻简报

<Route author="yueyericardo nczitzk" example="/nytimes/daily_briefing_chinese" path="/nytimes/daily_briefing_chinese">

网站地址：<https://www.nytimes.com/zh-hans/series/daily-briefing-chinese>

</Route>

### 畅销书排行榜

<Route author="melvinto" example="/nytimes/book/combined-print-and-e-book-nonfiction" path="/nytimes/book/:category?">

| Category                             | 中文              |
| ------------------------------------ | ----------------- |
| combined-print-and-e-book-nonfiction | 非虚构类 - 综合   |
| hardcover-nonfiction                 | 非虚构类 - 精装本 |
| paperback-nonfiction                 | 非虚构类 - 平装本 |
| advice-how-to-and-miscellaneous      | 工具类            |
| combined-print-and-e-book-fiction    | 虚构类 - 综合     |
| hardcover-fiction                    | 虚构类 - 精装本   |
| trade-fiction-paperback              | 虚构类 - 平装本   |
| childrens-middle-grade-hardcover     | 儿童 - 中年级     |
| picture-books                        | 儿童 - 绘本       |
| series-books                         | 儿童 - 系列图书   |
| young-adult-hardcover                | 青少年            |

</Route>

## 澎湃新闻

### 首页头条

<Route author="HenryQW nczitzk bigfei" example="/thepaper/featured" path="/thepaper/featured"/>

### 频道

<Route author="xyqfer nczitzk bigfei" example="/thepaper/channel/25950" path="/thepaper/channel/:id" :paramsDesc="['频道 id，可在频道页 URL 中找到']">

| 频道 ID | 频道名 |
| ------- | ------ |
| 26916   | 视频   |
| 108856  | 战疫   |
| 25950   | 时事   |
| 25951   | 财经   |
| 36079   | 澎湃号 |
| 119908  | 科技   |
| 25952   | 思想   |
| 119489  | 智库   |
| 25953   | 生活   |
| 26161   | 问吧   |
| 122908  | 国际   |
| -21     | 体育   |
| -24     | 评论   |

</Route>

### 栏目

<Route author="nczitzk bigfei" example="/thepaper/list/25457" path="/thepaper/list/:id" :paramsDesc="['栏目 id，可在栏目页 URL 中找到']">

| 栏目 ID | 栏目名       |
| ------- | ------------ |
| 26912   | 上直播       |
| 26913   | 七环视频     |
| 26965   | 温度计       |
| 26908   | 一级视场     |
| 27260   | World 湃     |
| 26907   | 湃客科技     |
| 33168   | 纪录湃       |
| 26911   | 围观         |
| 26918   | @所有人      |
| 26906   | 大都会       |
| 26909   | 追光灯       |
| 26910   | 运动装       |
| 26914   | 健寻记       |
| 82188   | AI 播报      |
| 89035   | 眼界         |
| 92278   | 关键帧       |
| 90069   | 战疫         |
| 25462   | 中国政库     |
| 25488   | 中南海       |
| 97924   | 初心之路     |
| 25489   | 舆论场       |
| 25490   | 打虎记       |
| 25423   | 人事风向     |
| 25426   | 法治中国     |
| 25424   | 一号专案     |
| 25463   | 港台来信     |
| 25491   | 长三角政商   |
| 25428   | 直击现场     |
| 68750   | 公益湃       |
| 27604   | 暖闻         |
| 25464   | 澎湃质量报告 |
| 25425   | 绿政公署     |
| 25429   | 澎湃国际     |
| 25481   | 外交学人     |
| 25430   | 澎湃防务     |
| 25678   | 唐人街       |
| 25427   | 澎湃人物     |
| 25422   | 浦江头条     |
| 25487   | 教育家       |
| 25634   | 全景现场     |
| 25635   | 美数课       |
| 25600   | 快看         |
| 25434   | 10% 公司     |
| 25436   | 能见度       |
| 25433   | 地产界       |
| 25438   | 财经上下游   |
| 25435   | 金改实验室   |
| 25437   | 牛市点线面   |
| 119963  | IPO 最前线   |
| 25485   | 澎湃商学院   |
| 25432   | 自贸区连线   |
| 37978   | 进博会在线   |
| 36079   | 湃客         |
| 27392   | 政务         |
| 77286   | 媒体         |
| 27234   | 科学湃       |
| 119445  | 生命科学     |
| 119447  | 未来 2%      |
| 119446  | 元宇宙观察   |
| 119448  | 科创 101     |
| 119449  | 科学城邦     |
| 25444   | 社论         |
| 27224   | 澎湃评论     |
| 26525   | 思想湃       |
| 26878   | 上海书评     |
| 25483   | 思想市场     |
| 25457   | 私家历史     |
| 25574   | 翻书党       |
| 25455   | 艺术评论     |
| 26937   | 古代艺术     |
| 25450   | 文化课       |
| 25482   | 逝者         |
| 25536   | 专栏         |
| 26506   | 异次元       |
| 97313   | 海平面       |
| 103076  | 一问三知     |
| 25445   | 澎湃研究所   |
| 25446   | 全球智库     |
| 26915   | 城市漫步     |
| 25456   | 市政厅       |
| 104191  | 世界会客厅   |
| 25448   | 有戏         |
| 26609   | 文艺范       |
| 25942   | 身体         |
| 26015   | 私・奔       |
| 25599   | 运动家       |
| 25842   | 私家地理     |
| 80623   | 非常品       |
| 26862   | 楼市         |
| 25769   | 生活方式     |
| 25990   | 澎湃联播     |
| 26173   | 视界         |
| 26202   | 亲子学堂     |
| 26404   | 赢家         |
| 26490   | 汽车圈       |
| 115327  | IP SH        |
| 117340  | 酒业         |

</Route>

### 侧边栏

<Route author="bigfei" example="/thepaper/sidebar/hotNews" path="/thepaper/sidebar/sec?" :paramsDesc="['边栏 id，如下， 默认hotNews']">

| 边栏 ID                  | 边栏名   |
| ------------------------ | -------- |
| hotNews                  | 澎湃热榜 |
| financialInformationNews | 澎湃财讯 |
| morningEveningNews       | 早晚报   |

</Route>

### 明查

<Route author="nczitzk" example="/thepaper/factpaper" path="/thepaper/factpaper/:status?" :paramsDesc="['状态 id，可选 `1` 即 有定论 或 `0` 即 核查中，默认为 `1`']"/>

### 澎湃美数组作品集

<Route author="umm233" example="/thepaper/839studio/2" path="/thepaper/839studio/:id?" :paramsDesc="['分类 id 可选，默认订阅全部分类']">

| 视频 | 交互 | 信息图 | 数据故事 |
| ---- | ---- | ------ | -------- |
| 2    | 4    | 3      | 453      |

</Route>

## 苹果新闻网

### 频道

<Route author="Fatpandac" example="/appledaily/home" path="/appledaily/:channel?" :paramsDesc="['频道，默认为主页']">

频道参数均可在官网获取，如：

`https://tw.appledaily.com/realtime/micromovie/` 对应 `/appledaily/micromovie`

`https://tw.appledaily.com/home/` 对应 `/appledaily/home`

</Route>

## 齐鲁晚报

### 新闻

<Route author="nczitzk" example="/qlwb/news" path="/qlwb/news"/>

### 今日城市

<Route author="nczitzk" example="/qlwb/city/:city" path="/qlwb/city" :paramsDesc="['城市代码']">

| 今日临沂 | 今日德州 | 今日威海 | 今日枣庄  | 今日淄博 | 今日烟台 | 今日潍坊 | 今日菏泽 | 今日日照 | 今日泰山 | 今日聊城  | 今日济宁 |
| -------- | -------- | -------- | --------- | -------- | -------- | -------- | -------- | -------- | -------- | --------- | -------- |
| linyi    | dezhou   | weihai   | zaozhuang | zibo     | yantai   | weifang  | heze     | rizhao   | taishan  | liaocheng | jining   |

</Route>

## 人民网

### 通用

<Route author="nczitzk" example="/people" path="/people/:site?/:category?" :paramsDesc="['站点，可在对应站点 URL 中找到', '分类，可在对应分类页中找到']">

订阅 **单级** 栏目如 [滚动 -- 生态 -- 人民网](http://env.people.com.cn/GB/74877/index.html) 分类栏目，分为 3 步：

1.  将 URL <http://env.people.com.cn/GB/74877/index.html> 中 `http://` 与 `.people.com.cn/` 中间的 `env` 作为 `site` 参数填入；
2.  将 `http://env.people.com.cn/GB/` 与 `/index.html` 间的 `74877` 作为 `category` 参数填入；
3.  最终可获得 [`/people/env/74877`](https://rsshub.app/people/env/74877)。

订阅 **多级** 栏目如 [经济观察 -- 观点 -- 人民网](http://opinion.people.com.cn/GB/427456/434878/index.html) 分类栏目，同样分为 3 步：

1.  将 URL <http://opinion.people.com.cn/GB/427456/434878/index.html> 中 `http://` 与 `.people.com.cn/` 中间的 `opinion` 作为 `site` 参数填入；
2.  把 `http://opinion.people.com.cn/GB/` 与 `/index.html` 间 `427456/434878` 作为 `category` 参数填入；
3.  最终可获得 [`/people/opinion/427456/434878`](https://rsshub.app/people/opinion/427456/434878)。

::: tip 提示

人民网大部分站点支持上述通用规则进行订阅。

:::

</Route>

### 习近平系列重要讲话

<Route author="LogicJake" example="/people/xjpjh" path="/people/xjpjh/:keyword?/:year?" :paramsDesc="['关键词，默认不填','年份，默认 all']"/>

### 中国共产党新闻网 24 小时滚动新闻

<Route author="nczitzk" example="/people/cpc/24h" path="/people/cpc/24h"/>

### 领导留言板

<Route author="nczitzk" example="/people/liuyan/539" path="/people/liuyan/:id/:state?" :paramsDesc="['编号，可在对应人物页 URL 中找到', '状态，见下表，默认为全部']">

| 全部 | 待回复 | 办理中 | 已办理 |
| ---- | ------ | ------ | ------ |
| 1    | 2      | 3      | 4      |

</Route>

## 日本经济新闻

### 首页

<Route author="zjysdhr" example="/nikkei/index" path="/nikkei/index" radar="1" rssbud="1" />

### 新聞

<Route author="Arracc" example="/nikkei/news" path="/nikkei/:category/:article_type?" :paramsDesc="['版块', '文章类型，`free` 仅无料全文，缺省为无料全文、有料非全文']">

综合页文章标题添加板块标签

| 総合 | オピニオン | 経済    | 政治     | 金融      | マーケット | ビジネス | マネーのまなび | テック     | 国際          | スポーツ | 社会・調査 | 地域  | 文化    | ライフスタイル |
| ---- | ---------- | ------- | -------- | --------- | ---------- | -------- | -------------- | ---------- | ------------- | -------- | ---------- | ----- | ------- | -------------- |
| news | opinion    | economy | politics | financial | business   | 不支持   | 不支持         | technology | international | sports   | society    | local | culture | lifestyle      |

</Route>

### 中文版新闻

<Route author="nczitzk" example="/nikkei/cn" path="/nikkei/cn/:language?/:path?" :paramsDesc="['语言，可选 `zh` 即 繁体中文，`cn` 即 简体中文', '类目路径，默认为空，可在对应类目页 URL 中找到']" radar="1" rssbud="1">

::: tip 提示

如 [中国 经济 日经中文网](https://cn.nikkei.com/china/ceconomy.html) 的 URL 为 <https://cn.nikkei.com/china/ceconomy.html> 对应路由为 [`/nikkei/cn/cn/china/ceconomy`](https://rsshub.app/nikkei/cn/cn/china/ceconomy)

如 [中國 經濟 日經中文網](https://zh.cn.nikkei.com/china/ceconomy.html) 的 URL 为 <https://zh.cn.nikkei.com/china/ceconomy.html> 对应路由为 [`/nikkei/cn/zh/china/ceconomy`](https://rsshub.app/nikkei/cn/zh/china/ceconomy)

特别地，当 `path` 填入 `rss` 后（如路由为 [`/nikkei/cn/cn/rss`](https://rsshub.app/nikkei/cn/cn/rss)），此时返回的是 [官方 RSS 的内容](https://cn.nikkei.com/rss.html)

:::

</Route>

### Nikkei Asia 最新新闻

<Route author="rainrdx" example="/nikkei/asia" path="/nikkei/asia" radar="1"/>

## 厦门网

### 数字媒体

<Route author="nczitzk" example="/xmnn/epaper/xmrb" path="/xmnn/epaper/:id?" :paramsDesc="['报纸 id，见下表，默认为 `xmrb`，即厦门日报']">

| 厦门日报 | 厦门晚报 | 海西晨报 | 城市捷报 |
| -------- | -------- | -------- | -------- |
| xmrb     | xmwb     | hxcb     | csjb     |

</Route>

## 四川广播电视台

### 电视回放

<Route author="nczitzk" example="/sctv/programme/1" path="/sctv/programme/:id?/:limit?/:isFull?" :paramsDesc="['节目 id，可在对应节目页中找到，默认为 `1`，即四川新闻联播', '期数，默认为 15，即单次获取最新 15 期', '是否仅获取完整视频，填写 true/yes 表示是、false/no 表示否，默认是']">

::: tip 提示

参数 **是否仅获取完整视频** 设置为 `true` `yes` `t` `y` 等值后，路由仅返回当期节目的完整视频，而不会返回节目所提供的节选视频。

查看更多电视节目请前往 [电视回放](https://www.sctv.com/column/list)

:::

| 节目                   | id      |
| ---------------------- | ------- |
| 四川新闻联播           | 1       |
| 早安四川               | 2       |
| 今日视点               | 3       |
| 龙门阵摆四川           | 10523   |
| 非常话题               | 1014756 |
| 新闻现场               | 8385    |
| 黄金三十分             | 8386    |
| 全媒直播间             | 8434    |
| 晚报十点半             | 8435    |
| 现场快报               | 8436    |
| 四川乡村新闻           | 3673    |
| 四川文旅报道           | 8174    |
| 乡村会客厅             | 3674    |
| 金字招牌               | 3675    |
| 问您所 “？”            | 3677    |
| 蜀你最能               | 3679    |
| 美丽乡村印象           | 3678    |
| 美丽乡村               | 3676    |
| 乡村大篷车             | 3680    |
| 华西论健               | 3681    |
| 乡村聚乐部             | 3682    |
| 医保近距离             | 6403    |
| 音你而来               | 7263    |
| 吃八方                 | 7343    |
| 世界那么大             | 7344    |
| 风云川商               | 7345    |
| 麻辣烫                 | 7346    |
| 财经快报               | 7473    |
| 医生来了               | 7873    |
| 安逸的旅途             | 8383    |
| 运动 +                 | 8433    |
| 好戏连台               | 9733    |
| 防癌大讲堂             | 1018673 |
| 消费新观察             | 1017153 |
| 天天耍大牌             | 1014753 |
| 廉洁四川               | 1014754 |
| 看世界                 | 1014755 |
| 金熊猫说教育（资讯版） | 1014757 |
| 她说                   | 1014759 |
| 嗨宝贝                 | 1014762 |
| 萌眼看世界             | 1014764 |
| 乡村大讲堂             | 1014765 |
| 四川党建               | 1014766 |
| 健康四川               | 1014767 |
| 技能四川               | 12023   |

</Route>

## 台湾中央通讯社

### 分类

<Route author="nczitzk" example="/cna/aall" path="/cna/:id?" :paramsDesc="['分类 id 或新闻专题 id。分类 id 见下表，新闻专题 id 為 https://www.cna.com.tw/list/newstopic.aspx 中，連結的數字部份。此參數默认为 aall']">

| 即時 | 政治 | 國際 | 兩岸 | 產經 | 證券 | 科技 | 生活 | 社會 | 地方 | 文化 | 運動 | 娛樂 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| aall | aipl | aopl | acn  | aie  | asc  | ait  | ahel | asoc | aloc | acul | aspt | amov |

</Route>

## 台灣英文新聞

### 最新熱門消息

<Route author="TonyRL" example="/taiwannews/hot" path="/taiwannews/hot/:lang?" :paramsDesc="['語言，`en` 或 `zh`，默認 `en`']" radar="1" rssbud="1"/>

## 天下雜誌

### 最新上線

<Route author="TonyRL" example="/cw/today" path="/cw/today" radar="1" rssbud="1" puppeteer="1"/>

### 主頻道

<Route author="TonyRL" example="/cw/master/8" path="/cw/master/:channel" :paramsDesc="['主頻道 ID，可在 URL 中找到']" radar="1" rssbud="1" puppeteer="1">

| 主頻道名稱 | 主頻道 ID |
| ---------- | --------- |
| 財經       | 8         |
| 產業       | 7         |
| 國際       | 9         |
| 管理       | 10        |
| 環境       | 12        |
| 教育       | 13        |
| 人物       | 14        |
| 政治社會   | 77        |
| 調查排行   | 15        |
| 健康關係   | 79        |
| 時尚品味   | 11        |
| 運動生活   | 103       |
| 重磅外媒   | 16        |

</Route>

### 子頻道

<Route author="TonyRL" example="/cw/sub/615" path="/cw/sub/:channel" :paramsDesc="['子頻道 ID，可在 URL 中找到']" radar="1" rssbud="1" puppeteer="1"/>

### 作者

<Route author="TonyRL" example="/cw/author/57" path="/cw/author/:channel" :paramsDesc="['作者 ID，可在 URL 中找到']" radar="1" rssbud="1" puppeteer="1"/>

## 卫报 The Guardian

通过提取文章全文，以提供比官方源更佳的阅读体验。

### Editorial

<Route author="HenryQW" example="/guardian/editorial" path="/guardian/editorial"/>

### China

<Route author="Polynomia" example="/guardian/china" path="/guardian/china"/>

## 文汇报

### 分类

<Route author="hoilc" example="/whb/bihui" path="/whb/:category" :paramsDesc="['文汇报分类名，可在该分类的 URL 中找到（即 http://www.whb.cn/zhuzhan/:category/index.html)']" />

## 无线新闻

### 新闻

<Route author="nczitzk" example="/tvb/news" path="/tvb/news/:category?/:language?" :paramsDesc="['分类，见下表，默认为要聞', '语言，见下表']">

分类

| 要聞  | 快訊    | 港澳  | 兩岸         | 國際  | 財經    | 體育   | 法庭       | 天氣    |
| ----- | ------- | ----- | ------------ | ----- | ------- | ------ | ---------- | ------- |
| focus | instant | local | greaterchina | world | finance | sports | parliament | weather |

语言

| 繁 | 简 |
| -- | -- |
| tc | sc |

</Route>

## 希望之声

<Route author="Fatpandac" example="/soundofhope/term/203" path="/soundofhope/:channel/:id" :paramsDesc="['频道', '子频道 ID']">

参数均可在官网获取，如：

`https://www.soundofhope.org/term/203` 对应 `/soundofhope/term/203`

</Route>

## 香港 01

### 热门

<Route author="hoilc Fatpandac nczitzk" example="/hk01/hot" path="/hk01/hot" radar="1" rssbud="1"/>

### 栏目

<Route author="hoilc Fatpandac nczitzk" example="/hk01/zone/11" path="/hk01/zone/:id" :paramsDesc="['栏目 id, 可在 URL 中找到']" radar="1" rssbud="1"/>

### 子栏目

<Route author="hoilc Fatpandac nczitzk" example="/hk01/channel/391" path="/hk01/channel/:id" :paramsDesc="['子栏目 id, 可在 URL 中找到']" radar="1" rssbud="1"/>

### 专题

<Route author="hoilc Fatpandac nczitzk" example="/hk01/issue/649" path="/hk01/issue/:id" :paramsDesc="['专题 id, 可在 URL 中找到']" radar="1" rssbud="1"/>

### 标签

<Route author="hoilc Fatpandac nczitzk" example="/hk01/tag/2787" path="/hk01/tag/:id" :paramsDesc="['标签 id, 可在 URL 中找到']" radar="1" rssbud="1"/>

## 香港電台

### 新聞

香港電台官方已有提供全文 RSS，詳細可前往官方網站： <https://news.rthk.hk/rthk/ch/rss.htm>

此路由主要補回官方 RSS 缺少的圖片以及 Link 元素。（官方 RSS 沒有 Link 元素可能導致某些 RSS 客戶端出現問題）

<Route author="KeiLongW" example="/rthk-news/hk/international" path="/rthk-news/:lang/:category" :paramsDesc="['语言，繁体`hk`，英文`en`','类别']">

| local    | greaterchina | international | finance  | sport    |
| -------- | ------------ | ------------- | -------- | -------- |
| 本地新聞 | 大中華新聞   | 國際新聞      | 財經新聞 | 體育新聞 |

</Route>

## 香港经济日报

### 新闻

香港经济日报已有提供简单 RSS，详细可前往官方网站： <https://www.hket.com/rss>

此路由主要补全官方 RSS 全文输出及完善分类输出。

<Route author="TonyRL" example="/hket/sran001" path="/hket/:category?" :paramsDesc="['分类，默认为全部新闻，可在 URL 中找到，部分见下表']" radar="1" rssbud="1">

| sran001  | sran008  | sran010  | sran011  | sran012  | srat006  |
| -------- | -------- | -------- | -------- | -------- | -------- |
| 全部新闻 | 财经地产 | 科技信息 | 国际新闻 | 商业新闻 | 香港新闻 |

| sran009  | sran009-1 | sran009-2 | sran009-3  | sran009-4 | sran009-5 | sran009-6 |
| -------- | --------- | --------- | ---------- | --------- | --------- | --------- |
| 即时财经 | 股市      | 新股 IPO  | 新经济追踪 | 当炒股    | 宏观解读  | Hot Talk  |

| sran011-1 | sran011-2    | sran011-3    |
| --------- | ------------ | ------------ |
| 环球政治  | 环球经济金融 | 环球社会热点 |

| sran016    | sran016-1  | sran016-2  | sran016-3  | sran016-4  | sran016-5      |
| ---------- | ---------- | ---------- | ---------- | ---------- | -------------- |
| 大湾区主页 | 大湾区发展 | 大湾区工作 | 大湾区买楼 | 大湾区消费 | 大湾区投资理财 |

| srac002  | srac003  | srac004  | srac005  |
| -------- | -------- | -------- | -------- |
| 即时中国 | 经济脉搏 | 国情动向 | 社会热点 |

| srat001 | srat008 | srat055  | srat069  | srat070   |
| ------- | ------- | -------- | -------- | --------- |
| 话题    | 观点    | 休闲消费 | 娱乐新闻 | TOPick TV |

| srat052  | srat052-1 | srat052-2  | srat052-3 |
| -------- | --------- | ---------- | --------- |
| 健康主页 | 食用安全  | 医生诊症室 | 保健美颜  |

| srat053  | srat053-1 | srat053-2 | srat053-3 | srat053-4  |
| -------- | --------- | --------- | --------- | ---------- |
| 亲子主页 | 儿童健康  | 育儿经    | 教育      | 亲子好去处 |

| srat053-6   | srat053-61 | srat053-62 | srat053-63 | srat053-64 |
| ----------- | ---------- | ---------- | ---------- | ---------- |
| Band 1 学堂 | 幼稚园     | 中小学     | 尖子教室   | 海外升学   |

| srat072-1  | srat072-2  | srat072-3        | srat072-4         |
| ---------- | ---------- | ---------------- | ----------------- |
| 健康身心活 | 抗癌新方向 | 「糖」「心」解密 | 风湿不再 你我自在 |

| sraw007  | sraw009  | sraw010  | sraw011  | sraw012  | sraw014  | sraw018  | sraw019  |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 全部博客 | Bloggers | 收息攻略 | 精明消费 | 退休规划 | 个人增值 | 财富管理 | 绿色金融 |

| sraw015  | sraw015-07 | sraw015-08 | sraw015-09 | sraw015-10 |
| -------- | ---------- | ---------- | ---------- | ---------- |
| 移民百科 | 海外置业   | 移民攻略   | 移民点滴   | 海外理财   |

| sraw020  | sraw020-1    | sraw020-2 | sraw020-3 | sraw020-4 |
| -------- | ------------ | --------- | --------- | --------- |
| ESG 主页 | ESG 趋势政策 | ESG 投资  | ESG 企业  | ESG 社会  |

</Route>

## 香港商报

### PDF 版

<Route author="nczitzk" example="/hkcd/pdf" path="/hkcd/pdf"/>

## 新华每日电讯

### 今日

<Route author="Dustin-Jiang" example="/mrdx/today" path="/mrdx/today" />

## 新假期周刊

### 最新文章

<Route author="TonyRL" example="/weekendhk" path="/weekendhk" radar="1" rssbud="1" />

## 新京报

### 栏目

<Route author="DIYgod" example="/bjnews/realtime" path="/bjnews/:category" :paramsDesc="['新京报的栏目名，点击对应栏目后在地址栏找到']"/>

### 电子报

<Route author="MisteryMonster" example="/bjnews/epaper/A" path="/bjnews/epaper/:cat" :paramsDesc="['新京报叠名：`A`,`B`,`C`,`D`, 特刊为`special`']"/>

## 新快报

### 新闻

<Route author="TimWu007" example="/xkb/350" path="/xkb/:channel" :paramsDesc="['栏目 ID，点击对应栏目后在地址栏找到']">

常用栏目 ID：

| 栏目名 | ID  |
| ------ | --- |
| 首页   | 350 |
| 重点   | 359 |
| 广州   | 353 |
| 湾区   | 360 |
| 天下   | 355 |

</Route>

## 新蓝网（浙江广播电视集团）

### 浙江新闻联播

<Route author="yhkang" example="/cztv/zjxwlb" path="/cztv/zjxwlb" />

### 浙江新闻联播 - 每日合集

<Route author="yhkang" example="/cztv/zjxwlb/daily" path="/cztv/zjxwlb/daily" />

## 新浪科技

### 科学探索

<Route author="LogicJake" example="/sina/discovery/zx" path="/sina/discovery/:type" :paramsDesc="['订阅分区类型']">

分类：

| zx   | twhk     | dwzw     | zrdl     | lskg     | smyx     | shbk     | kjqy     |
| ---- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 最新 | 天文航空 | 动物植物 | 自然地理 | 历史考古 | 生命医学 | 生活百科 | 科技前沿 |

</Route>

### 滚动新闻

<Route author="xyqfer" example="/sina/rollnews" path="/sina/rollnews" />

## 新浪体育

### 综合

<Route author="nczitzk" example="/sina/sports/volley" path="/sina/sports/:type" :paramsDesc="['运动类型，见下表']">

| 排球   | 游泳 | 乒乓球   | 羽毛球 | 台球    | 田径     | 体操  | 冰雪   | 射击 | 马术  | 拳击搏击 | UFC | 其他   |
| ------ | ---- | -------- | ------ | ------- | -------- | ----- | ------ | ---- | ----- | -------- | --- | ------ |
| volley | swim | pingpang | badmin | snooker | tianjing | ticao | winter | sh   | mashu | kungfu   | ufc | others |

</Route>

## 新唐人电视台

### 频道

<Route author="Fatpandac" example="/ntdtv/b5/prog1201" path="/ntdtv/:language/:id" :paramsDesc="['语言，简体为`gb`，繁体为`b5`', '子频道名称']">

参数均可在官网获取，如：

`https://www.ntdtv.com/b5/prog1201` 对应 `/ntdtv/b5/prog1201`

</Route>

## 信报财经新闻

### 即时新闻

<Route author="TonyRL" example="/hkej/index" path="/hkej/:category?" :paramsDesc="['分类，默认为全部新闻']">

| index    | stock    | hongkong | china    | international | property | current  |
| -------- | -------- | -------- | -------- | ------------- | -------- | -------- |
| 全部新闻 | 港股直击 | 香港财经 | 中国财经 | 国际财经      | 地产新闻 | 时事脉搏 |

</Route>

## 星島日報

### 即時

<Route author="TonyRL" example="/stheadline/std/realtime/即時" path="/stheadline/std/realtime/:category*" :paramsDesc="['分類路徑，URL 中 `/realtime/` 後的部分，預設為`即時`']" radar ="1" rssbud="1"/>

## 星洲网

### 首页

<Route author="nczitzk" example="/sinchew" path="/sinchew" />

### 最新

<Route author="nczitzk" example="/sinchew/latest" path="/sinchew/latest" />

### 分类

<Route author="nczitzk" example="/sinchew/category/头条" path="/sinchew/category/:category?" :paramsDesc="['分类，见下表，亦可以在对应分类页 URL 中找到']">

| 头条 | 国内 | 国际 | 言路 | 财经 | 地方 | 副刊 | 娱乐 | 体育 | 百格 | 星角攝 | 好运来 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ------ | ------ |

::: tip 提示

若订阅单级分类 [头条](https://www.sinchew.com.my/category/头条)，其 URL 为 [https://www.sinchew.com.my/category/ 头条](https://www.sinchew.com.my/category/头条)，则路由为 [`/sinchew/category/头条`](https://rsshub.app/sinchew/category/头条)。

若订阅多级分类 [国际 > 天下事](https://www.sinchew.com.my/category/国际/天下事)，其 URL 为 [https://www.sinchew.com.my/category/ 国际 / 天下事](https://www.sinchew.com.my/category/国际/天下事)，则路由为 [`/sinchew/category/国际/天下事`](https://rsshub.app/sinchew/category/国际/天下事)。

:::

</Route>

## 央视新闻

### 新闻联播

<Route author="zengxs" example="/cctv/xwlb" path="/cctv/xwlb" radar="1" rssbud="1">

新闻联播内容摘要。

</Route>

### 栏目

<Route author="nczitzk" example="/cctv/lm/xwzk" path="/cctv/lm/:id?" :paramsDesc="['栏目 id，可在对应栏目页 URL 中找到，默认为 `xwzk` 即 新闻周刊']" radar="1" rssbud="1">

| 焦点访谈 | 等着我 | 今日说法 | 开讲啦 |
| -------- | ------ | -------- | ------ |
| jdft     | dzw    | jrsf     | kjl    |

| 正大综艺 | 经济半小时 | 第一动画乐园 |
| -------- | ---------- | ------------ |
| zdzy     | jjbxs      | dydhly       |

::: tip 提示

更多栏目请看 [这里](https://tv.cctv.com/lm)

:::

</Route>

### 新闻专题

<Route author="nczitzk" example="/cctv/special/315" path="/cctv/special/:id?" :paramsDesc="['专题 id，可在对应专题页 URL 中找到，默认为 `315` 即 3·15 晚会']" radar="1" rssbud="1">

::: tip 提示

如 [2020 年国家网络安全宣传周](https://news.cctv.com/special/2020gjwlaqxcz/index.shtml) 的专题页 URL 为 <https://news.cctv.com/special/2020gjwlaqxcz/index.shtml。其专题> id 即为 `2020gjwlaqxcz`。

:::

此处查看 [所有新闻专题](http://news.cctv.com/special/index.shtml)

</Route>

### 专题

<Route author="idealclover xyqfer" example="/cctv/world" path="/cctv/:category" :paramsDesc="['分类名']" radar="1" rssbud="1">

| 新闻 | 国内  | 国际  | 社会    | 法治 | 文娱 | 科技 | 生活 | 教育 | 每周质量报告 | 新闻 1+1  |
| ---- | ----- | ----- | ------- | ---- | ---- | ---- | ---- | ---- | ------------ | --------- |
| news | china | world | society | law  | ent  | tech | life | edu  | mzzlbg       | xinwen1j1 |

</Route>

### 新闻联播文字版

<Route author="luyuhuang" example="/xinwenlianbo/index" path="/xinwenlianbo/index" radar="1" rssbud="1"/>

### 新闻联播文字版完整版

<Route author="xfangbao" example="/xwlb" path="/xwlb/index" radar="1" rssbud="1"/>

### 央视网图片《镜象》

<Route author="nczitzk" example="/cctv/photo/jx" path="/cctv/photo/jx" radar="1" rssbud="1"/>

## 羊城晚报金羊网

### 新闻

<Route author="TimWu007" example="/ycwb/1" path="/ycwb/:node" :paramsDesc="['栏目 id']">

注：小部分栏目的 URL 会给出 nodeid。如未给出，可打开某条新闻链接后，查看网页源代码，搜索 nodeid 的值。

常用栏目节点：

| 首页 | 中国 | 国际 | 体育 | 要闻 | 珠江评论 | 民生观察 | 房产 | 金羊教育 | 金羊财富 | 金羊文化 | 金羊健康 | 金羊汽车 |
| ---- | ---- | ---- | ---- | ---- | -------- | -------- | ---- | -------- | -------- | -------- | -------- | -------- |
| 1    | 14   | 15   | 16   | 22   | 1875     | 21773    | 222  | 5725     | 633      | 5281     | 21692    | 223      |

| 广州 | 广州 - 广州要闻 | 广州 - 社会百态 | 广州 - 深读广州 | 广州 - 生活服务 | 今日大湾区 | 广东 - 政经热闻 | 广东 - 民生视点 | 广东 - 滚动新闻 |
| ---- | --------------- | --------------- | --------------- | --------------- | ---------- | --------------- | --------------- | --------------- |
| 18   | 5261            | 6030            | 13352           | 83422           | 100418     | 13074           | 12252           | 12212           |

</Route>

## 浙江在线

### 浙报集团系列报刊

<Route author="nczitzk" example="/zjol/paper/zjrb" path="/zjol/paper/:id?" :paramsDesc="['报纸 id，见下表，默认为 `zjrb`，即浙江日报']">

| 浙江日报 | 钱江晚报 | 美术报 | 浙江老年报 | 浙江法制报 | 江南游报 |
| -------- | -------- | ------ | ---------- | ---------- | -------- |
| zjrb     | qjwb     | msb    | zjlnb      | zjfzb      | jnyb     |

</Route>

## 中国环球电视网

### 播客

<Route author="5upernova-heng" example="/cgtn/podcast/ezfm/4" path="/cgtn/podcast/:category/:id" :paramsDesc="['类型名','播客 id']" radar=1> 

> 类型名与播客 id 可以在播客对应的 URL 中找到
> 如 URL `https://radio.cgtn.com/podcast/column/ezfm/More-to-Read/4` ，其 `category` 为 `ezfm` ，`id` 为 `4`，对应的订阅路由为 [`/podcast/ezfm/4`](https://rsshub.app/podcast/ezfm/4)

</Route>

## 中国日报

### 英语点津

<Route author="sanmmm" example="/chinadaily/english/thelatest" path="/chinadaily/english/:category" :paramsDesc="['目录分类']">

目录分类

| 最新      | 双语           | 热词          | 口语            | 译词          | 视频        | 听力     | 专栏      | 文件                     | 考试         |
| --------- | -------------- | ------------- | --------------- | ------------- | ----------- | -------- | --------- | ------------------------ | ------------ |
| thelatest | news_bilingual | news_hotwords | practice_tongue | trans_collect | video_links | audio_cd | columnist | 5af95d44a3103f6866ee845c | englishexams |

</Route>

## 中国新闻网

### 最新

<Route author="yuxinliu-alex" example="/chinanews" path="/chinanews" radar="1" rssbud="1" />

## 中国新闻周刊

### 栏目

提取文章全文。

<Route author="changren-wcr" example="/inewsweek/survey" path="/inewsweek/:channel" :paramsDesc="['栏目']">

| 封面  | 时政     | 社会    | 经济    | 国际  | 调查   | 人物   |
| ----- | -------- | ------- | ------- | ----- | ------ | ------ |
| cover | politics | society | finance | world | survey | people |

</Route>

## 中山网

### 中山网新闻

<Route author="laampui" example="/zsnews/index/35" path="/zsnews/index/:cateid" :paramsDesc="['类别']">

| 35   | 36   | 37   | 38   | 39   |
| ---- | ---- | ---- | ---- | ---- |
| 本地 | 镇区 | 热点 | 社会 | 综合 |

</Route>

## 中時電子報

### 新聞

<Route author="luyuhuang" example="/chinatimes/realtimenews" path="/chinatimes/:caty" :paramsDesc="['类别']" radar="1" rssbud="1">

| realtimenews | politic | opinion | life | star | money | society | hottopic | tube    | world | armament | chinese | fashion | sports | technologynews | travel | album |
| ------------ | ------- | ------- | ---- | ---- | ----- | ------- | -------- | ------- | ----- | -------- | ------- | ------- | ------ | -------------- | ------ | ----- |
| 即時         | 政治    | 言論    | 生活 | 娛樂 | 財經  | 社會    | 話題     | 快點 TV | 國際  | 軍事     | 兩岸    | 時尚    | 體育   | 科技           | 玩食   | 專輯  |

</Route>

## 中外对话

### 主题

<Route author="zoenglinghou" example="/chinadialogue/topics/cities" path="/chinadialogue/topics/:topic" :paramsDesc="['主题分类']">

| 商业     | 城市化 | 气候变化与能源            | 自然保护     | 管制与法律         | 健康与食品      | 自然灾害          | 污染      | 科学与技术       | 安全     | 水    |
| -------- | ------ | ------------------------- | ------------ | ------------------ | --------------- | ----------------- | --------- | ---------------- | -------- | ----- |
| business | cities | climate-change-and-energy | conservation | governance-and-law | health-and-food | natural-disasters | pollution | science-and-tech | security | water |

</Route>

### 栏目

<Route author="zoenglinghou" example="/chinadialogue/article" path="/chinadialogue/:column" :paramsDesc="['栏目分类']">

| 文章    | 博客 | 文化    | 报告    |
| ------- | ---- | ------- | ------- |
| article | blog | culture | reports |

</Route>

### 福建新闻

<Route author="jjlzg" example="/fjnews/fj/30" path="/fjnews/fznews"/>

### 福州新闻

<Route author="jjlzg" example="/fjnews/fz/30" path="/fjnews/fznews"/>

### 九江新闻

<Route author="jjlzg" example="/fjnews/jjnews" path="/fjnews/jjnews"/>

## 自由亚洲电台

### 新闻

<Route author="zphw" example="/rfa/mandarin" path="/rfa/:language?/:channel?/:subChannel?" :paramsDesc="['语言，默认 English', '频道', '子频道（如存在）']">

通过指定频道参数，提供比官方源更佳的阅读体验。

参数均可在官网获取，如：

`https://www.rfa.org/cantonese/news` 对应 `/rfa/cantonese/news`

`https://www.rfa.org/cantonese/news/htm` 对应 `/rfa/cantonese/news/htm`

</Route>

## 组织人事报

### 电子报

<Route author="5upernove-heng" example="/zuzhirenshi" path="/zuzhirenshi/:id?" :paramsDesc="['报纸版号，默认为全部']" radar="1">

| 第一版 要闻 | 第二版 要闻 | 第三版 人才 | 第四版 人社工作 | 第五版 基层党建 | 第六版 理论评论 | 第七版 史事通鉴 | 第八版 关注 |
| ----------- | ----------- | ----------- | --------------- | --------------- | --------------- | --------------- | ----------- |
| 1           | 2           | 3           | 4               | 5               | 6               | 7               | 8           |

</Route>
