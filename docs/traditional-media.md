---
pageClass: routes
---

# 传统媒体

## 21 财经

### 频道

<Route author="brilon" example="/21caijing/channel/readnumber" path="/21caijing/channel/:name" :paramsDesc="['频道名称，可在 [https://m.21jingji.com/](https://m.21jingji.com/) 页面 URL 中找到']"/>

## ABC News

### 子站

<Route author="nczitzk" example="/abc/chinese" path="/abc/:site?" :paramsDesc="['子站，见下表']">

子站

| Just In | Politics | World | Business | Analysis             | Sport | Science | Health | Arts         | Fact Check | 中文新闻 | Berita Bahasa Indonesia | Tok Pisin |
| ------- | -------- | ----- | -------- | -------------------- | ----- | ------- | ------ | ------------ | ---------- | -------- | ----------------------- | --------- |
| justin  | politics | world | business | analysis-and-opinion | sport | science | health | arts-culture | factcheck  | chinese  | indonesian              | tok-pisin |

</Route>

## AP News

### 话题

<Route author="mjysci" example="/apnews/topics2/ap-top-news" path="/apnews/topics2/:topic" :paramsDesc="['话题名称，可在 URL 中找到，例如 AP Top News [https://apnews.com/hub/ap-top-news](https://apnews.com/hub/ap-top-news) 的话题为 `ap-top-news`']"  anticrawler="1"/>
采用了 `puppeteer` 规避 `Project Shield`，无全文抓取，建议自建。

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

支持大部分频道，频道名称见 [BBC 中文网官方 RSS](https://www.bbc.com/zhongwen/simp/services/2009/09/000000_rss)。

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

## e 公司

### 快讯

<Route author="hillerliao" example="/egsea/flash" path="/egsea/flash" />

## Financial Times

### FT 中文网

<Route author="HenryQW xyqfer" example="/ft/chinese/hotstoryby7day" path="/ft/:language/:channel?" :paramsDesc="['语言，简体`chinese`，繁体`traditional`', '频道，缺省为每日更新']">

::: tip 提示

-   不支持付费文章。
-   由于未知原因 FT 中文网的 SSL 证书不被信任 （参见 [SSL Labs 报告](https://www.ssllabs.com/ssltest/analyze.html?d=www.ftchinese.com&latest)), 所有文章通过 http 协议获取。

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
    -   `local`: 本地（港聞）
    -   `international`: 國際（兩岸國際）
    -   `finance`: 財經
    -   `china`: 兩岸（有線中國組）
    -   `sports`: 體育

-   `:option?` 可开启的选项：

    -   `plain`: 全文输出（纯文字）
    -   `withphoto`: 全文输出 （含题图） **（不指定 `:option?` 时将预设为此项）**

-   全文输出转换为简体字：`?opencc=t2s`  
    (`opencc` 是 RSSHub 的通用参数，详情请参阅 [「中文简繁体转换」](https://docs.rsshub.app/parameter.html#zhong-wen-jian-fan-ti-zhuan-huan))

</Route>

## NHK

### News Web Easy

<Route author="Andiedie" example="/nhk/news_web_easy" path="/nhk/news_web_easy"/>

## Phoronix

### 新闻与评测

<Route author="oppliate" example="/phoronix/news_topic/Intel" path="/phoronix/:page/:queryOrItem?" :paramsDesc="['页面', '对 `category` 页面是分类项目 `item`，对其它页面是主题 `q`，可以在网站顶部导航栏各项目链接里找出。如 `https://www.phoronix.com/scan.php?page=category&item=Computers` 对应 `/phoronix/category/Computers`']" />

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

## The Economist

### 分类

<Route author="ImSingee" example="/the-economist/latest" path="/the-economist/:endpoint" :paramsDesc="['分类名称，可在 [官方 RSS 页面 ](https://www.economist.com/rss) 找到，例如 https://www.economist.com/china/rss.xml 即为 china']"/>

### GRE Vocabulary

<Route author="xyqfer" example="/the-economist/gre-vocabulary" path="/the-economist/gre-vocabulary" />

### 下载

<Route author="nczitzk" example="/the-economist/download" path="/the-economist/download" >

下载站：<http://www.cgx02.xyz/index.php?dir=/te>

</Route>

## UDN

### 轉角國際

<Route author="emdoe" example="/udn/global/鏡頭背後" path="/udn/global/:tid" :paramsDesc="['標籤名稱，請在轉角國際首頁獲取；如果選擇輸入 `newest` 則輸出最新文章']">

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

<Route author="KeiLongW" example="/yahoo-news/hk/world" path="/yahoo-news/:region/:category?" :paramsDesc="['地区','类别']">

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

### 北极星环保

<Route author="zsimple"  example="/bjx/huanbao" path="/bjx/huanbao" />

## 财新网

> 网站部分内容需要付费订阅，RSS 仅做更新提醒，不含付费内容。

### 新闻分类

<Route author="idealclover" example="/caixin/finance/regulation" path="/caixin/:column/:category" :paramsDesc="['栏目名', '栏目下的子分类名']">

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

<Route author="EsuRt"  example="/caixin/article" path="/caixin/article"/>

### 最新文章

<Route author="tpnonthealps" example="/caixin/latest" path="/caixin/latest">

说明：此 RSS feed 会自动抓取财新网的最新文章，但不包含 FM 及视频内容。

</Route>

### 财新一线

<Route author="boypt"  example="/caixin/yxnews" path="/caixin/yxnews"/>

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

## 第一财经

### 直播区

<Route author="sanmmm" example="/yicai/brief" path="/yicai/brief" />

## 东方网

### 上海新闻

<Route author="saury" example="/eastday/sh" path="/eastday/sh" />

## 読売新聞

### 新聞

<Route author="Arracc" example="/yomiuri/news" path="/yomiuri/:category" :paramsDesc="['板块']">

无料全文，综合页文章标题添加板块标签。

| 総合 | 社会     | 政治     | 経済    | スポーツ | 国際  | 科学・ＩＴ | 選挙・世論調査 | エンタメ・文化 | 囲碁・将棋 | ライフ | 地域  | 社説      |
| ---- | -------- | -------- | ------- | -------- | ----- | ---------- | -------------- | -------------- | ---------- | ------ | ----- | --------- |
| news | national | politics | economy | sports   | world | science    | election       | culture        | igoshougi  | life   | local | editorial |

</Route>

## 端传媒

通过提取文章全文，以提供比官方源更佳的阅读体验。

::: warning 注意

付费内容全文可能需要登陆获取，详情见部署页面的配置模块。

:::

### 专题・栏目

<Route author="prnake" example="/initium/latest/zh-hans" path="/initium/:type?/:language?" :paramsDesc="['栏目，缺省为最新', '语言，简体`zh-hans`，繁体`zh-hant`，缺省为简体']"/>

Type 栏目：

| 最新   | 深度    | What’s New | 广场              | 科技       | 风物    | 特约    | ... |
| ------ | ------- | ---------- | ----------------- | ---------- | ------- | ------- | --- |
| latest | feature | news-brief | notes-and-letters | technology | culture | pick_up | ... |

更多栏目名称可通过 <https://theinitium.com/section/special/> 及 <https://theinitium.com/section/hot_channel/> 获取。

</Route>

### 话题・标签

<Route author="AgFlore" example="/theinitium/tags/2019_10/zh-hans" path="/theinitium/tags/:type/:language?" :paramsDesc="['话题 ID，可从话题页 URL 中获取，如<https://theinitium.com/tags/2019_10/>', '语言，简体`zh-hans`，繁体`zh-hant`，缺省为简体']"/>

### 作者

<Route author="AgFlore" example="/theinitium/author/ninghuilulu/zh-hans" path="theinitium/author/:type/:language?" :paramsDesc="['作者 ID，可从作者主页 URL 中获取，如<https://theinitium.com/author/ninghuilulu/>','语言，简体`zh-hans`，繁体`zh-hant`，缺省为简体']"/>

### 个人订阅追踪动态

<Route author="AgFlore" example="/theinitium/follow/articles/zh-hans" path="theinitium/follow/articles/:language?" :paramsDesc="['语言，简体`zh-hans`，繁体`zh-hant`，缺省为简体']">

::: warning 注意

需要自建，详情见部署页面的配置模块。

:::
</Route>

## 多维新闻网

### 要闻

<Route author="HenryQW" example="/dwnews/yaowen/global" path="/dwnews/yaowen/:region?" :paramsDesc="['要闻地区，默认`全部`，可选地区如下']">

| 全部   | 国际   | 中国  | 香港     | 台湾   | 经济   | 视觉   |
| ------ | ------ | ----- | -------- | ------ | ------ | ------ |
| yaowen | global | china | hongkong | taiwan | jingji | shijue |

</Route>

### 24 小时新闻排行榜

<Route author="HenryQW" example="/dwnews/rank" path="/dwnews/rank"/>

## 华尔街见闻

### 华尔街见闻

<Route author="conanjunn" example="/wallstreetcn/news/global" path="/wallstreetcn/news/global" />

### 实时快讯

<Route author="nczitzk" example="/wallstreetcn/live" path="/wallstreetcn/live/:channel?" :paramsDesc="['快讯分类，默认`global`，见下表']">

| 要闻   | A 股    | 美股     | 港股     | 外汇  | 商品      | 理财      |
| ------ | ------- | -------- | -------- | ----- | --------- | --------- |
| global | a-stock | us-stock | hk-stock | forex | commodity | financing |

</Route>

## 华尔街日报 The Wall Street Journal (WSJ)

### 新闻

<Route author="oppilate" example="/wsj/en-us/opinion" path="/wsj/:lang/:category?" :paramsDesc="['语言，支持 `en-us`、`zh-cn`、`zh-tw`', '分类，仅 `en-us` 支持分类订阅。支持 `opinion`, `world_news`, `us_bussiness`, `market_news`, `technology`, `lifestyle`。']">

通过提取文章全文，以提供比官方源更佳的阅读体验。

</Route>

## 极客公园

### 全球快讯

<Route author="xyqfer" example="/geekpark/breakingnews" path="/geekpark/breakingnews" />

## 界面新闻

### 栏目

<Route author="WenhuWee" example="/jiemian/list/79" path="/jiemian/list/:category" :paramsDesc="['对应栏目后在地址栏找到']"/>

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

<Route author="wushijishan" example="/kaopunews/all" path="/kaopunews/all"/>

## 连线 Wired

非订阅用户每月有阅读全文次数限制。

### 标签

<Route author="Naiqus" example="/wired/tag/bitcoin" path="/wired/tag/:tag" :paramsDesc="['标签']"/>

## 联合早报

### 即时新闻

<Route author="lengthmin" example="/zaobao/realtime/china" path="/zaobao/realtime/:type?" :paramsDesc="['分类，缺省为 china']">

| 中国  | 新加坡    | 国际  | 财经     |
| ----- | --------- | ----- | -------- |
| china | singapore | world | zfinance |

</Route>

### 新闻

<Route author="lengthmin" example="/zaobao/znews/china" path="/zaobao/znews/:type?" :paramsDesc="['分类，缺省为 china']">

| 中国  | 新加坡    | 东南亚 | 国际  | 体育   | 早报现在 |
| ----- | --------- | ------ | ----- | ------ | -------- |
| china | singapore | sea    | world | sports | fukan    |

</Route>

### 其他栏目

除了上面两个兼容规则之外，联合早报网站里所有页面形如 <https://www.zaobao.com/wencui/politic> 这样的栏目都能被这个规则解析到，早报的大部分栏目都是这个样式的。你可以测试之后再订阅。

<Route author="lengthmin" example="/zaobao/wencui/politic" path="/zaobao/:type/:section" :paramsDesc="['https://www.zaobao.com/**wencui**/politic 中的 **wencui**', 'https://www.zaobao.com/wencui/**politic** 中的 **politic**']" />

## 路透社

### 实时资讯

<Route author="black-desk" example="/reuters/theWire" path="/reuters/theWire" />

### 频道

<Route author="HenryQW proletarius101" example="/reuters/channel/cn/analyses" path="/reuters/channel/:site/:channel" :paramsDesc="['语言，支持的分站列表如下','频道名，请注意大小写需与如下表格中一致。']">

支持语言列表

-   中国分站 `cn`：

    -   主频道：

    | 深度分析 | 时事要闻    | 生活 | 投资      |
    | -------- | ----------- | ---- | --------- |
    | analyses | generalnews | life | investing |

    -   资讯子频道：

    | 中国财经 | 国际财经              | 新闻人物  | 财经视点 |
    | -------- | --------------------- | --------- | -------- |
    | china    | internationalbusiness | newsmaker | opinions |

    -   专栏子频道：

    | 中国财经专栏 | 国际财经专栏 | 大宗商品专栏 |
    | ------------ | ------------ | ------------ |
    | CnColumn     | IntColumn    | ComColumn    |

-   美国分站 `us`：

    -   主频道：

    | Business | Markets | World | Politics | Tech       | Breakingviews | Wealth | Life      |
    | -------- | ------- | ----- | -------- | ---------- | ------------- | ------ | --------- |
    | business | markets | world | politics | technology | breakingviews | wealth | lifestyle |

-   英国分站 `uk`：

    -   主频道：

    | Business | Markets | World | UK | Tech       | Money           | Breakingviews | Sport  | Life      |
    | -------- | ------- | ----- | -- | ---------- | --------------- | ------------- | ------ | --------- |
    | business | markets | world | uk | technology | personalFinance | breakingviews | sports | lifestyle |

</Route>

## 南方周末

### 新闻分类

<Route author="ranpox xyqfer" example="/infzm/2" path="/infzm/:id" :paramsDesc="['南方周末内容分区 id, 可在该内容分区的 URL 中找到（即 https://www.infzm.com/contents?term_id=:id)']">

下面给出部分参考：

| 推荐 | 新闻 | 观点 | 文化 | 人物 | 影像 | 专题 | 生活 | 视频 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 1    | 2    | 3    | 4    | 7    | 8    | 6    | 5    | 131  |

</Route>

## 南华早报 SCMP

### 新闻

<Route author="proletarius101" example="/scmp/3" path="/scmp/:category_id" :paramsDesc="['栏目分类']">

栏目分类对应的数字编号见 [官方 RSS](https://www.scmp.com/rss)。相比官方提供的 RSS，多提供了全文输出。

</Route>

## 纽约时报

### 新闻

<Route author="HenryQW" example="/nytimes/dual" path="/nytimes/:lang?" :paramsDesc="['语言，缺省中文']">

通过提取文章全文，以提供比官方源更佳的阅读体验。

| 默认中文 | 中英对照 | 英文 | 中英对照 （繁体中文）   | 繁体中文           |
| -------- | -------- | ---- | ----------------------- | ------------------ |
| （空）   | dual     | en   | dual-traditionalchinese | traditionalchinese |

</Route>

### 新闻简报

<Route author="yueyericardo" example="/nytimes/daily_briefing_chinese" path="/nytimes/daily_briefing_chinese"/>
网站地址：<https://www.nytimes.com/zh-hans/series/daily-briefing-chinese/>

### 畅销书排行榜

<Route author="melvinto" example="/nytimes/book/combined-print-and-e-book-nonfiction" path="/nytimes/book/:category?"/>

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

## 澎湃新闻

### 首页头条

<Route author="HenryQW nczitzk" example="/thepaper/featured" path="/thepaper/featured"/>

### 频道

<Route author="xyqfer nczitzk" example="/thepaper/channel/27224" path="/thepaper/channel/:id" :paramsDesc="['频道 id，可在频道页 URL 中找到']">

| 视频  | 时事  | 财经  | 思想  | 澎湃号 | 生活  |
| ----- | ----- | ----- | ----- | ------ | ----- |
| 26916 | 25950 | 25951 | 25952 | 36079  | 25953 |

</Route>

### 列表

<Route author="nczitzk" example="/thepaper/list/25457" path="/thepaper/list/:id" :paramsDesc="['列表 id，可在列表页 URL 中找到']"/>

### 澎湃美数组作品集

<Route author="umm233" example="/thepaper/839studio/2" path="/thepaper/839studio/:id?" :paramsDesc="['分类 id 可选，默认订阅全部分类']">

| 视频 | 交互 | 信息图 | 数据故事 |
| ---- | ---- | ------ | -------- |
| 2    | 4    | 3      | 453      |

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

## 人民日报

### 观点

<Route author="LogicJake"  example="/people/opinion/223228" path="/people/opinion/:id" :paramsDesc="['板块 id，可在 URL 中找到']"/>

### 环保频道

<Route author="zsimple"  example="/people/env/74877" path="/people/env/:id" :paramsDesc="['板块 id，可在 URL 中找到']"/>

### 习近平系列重要讲话

<Route author="LogicJake"  example="/people/xjpjh" path="/people/xjpjh/:keyword?/:year?" :paramsDesc="['关键词，默认不填','年份，默认 all']"/>

### 中国共产党新闻网 24 小时滚动新闻

<Route author="nczitzk" example="/people/cpc/24h" path="/people/cpc/24h"/>

## 人民日报社 国际金融报

### 栏目

<Route author="Origami404" example="/ifnews/48" path="/ifnews/:cid" :paramsDesc="['栏目 ID']">

`cid`可在对应栏目的 url 后的参数中获取，如`热点快报`的栏目 url 为`http://www.ifnews.com/column.html?cid=48`, `cid`即为`48`.

</Route>

## 日本経済新聞

### ホームページ

<Route author="zjysdhr" example="/nikkei/index" path="/nikkei/index" radar="1" rssbud="1">

日文版首页

</Route>

### 新聞

<Route author="Arracc" example="/nikkei/news" path="/nikkei/:category/:article_type?" :paramsDesc="['版块','文章类型，free 仅无料全文，缺省为无料全文、有料非全文']">

综合页文章标题添加板块标签

| 総合 | マネーのまなび | 経済・金融 | 政治     | ビジネス | マネーのまなび | テクノロジー | 国際          | スポーツ | 社会・くらし | オピニオン | 文化    | FT     | 地域  | 日経ビジネス | ライフ |
| ---- | -------------- | ---------- | -------- | -------- | -------------- | ------------ | ------------- | -------- | ------------ | ---------- | ------- | ------ | ----- | ------------ | ------ |
| news | 未支持         | economy    | politics | business | 未支持         | technology   | international | sports   | society      | opinion    | culture | 未支持 | local | 未支持       | 未支持 |

</Route>

## 台湾中央通讯社

### 分类

<Route author="nczitzk" example="/cna/aall" path="/cna/:id?" :paramsDesc="['分类 id 或新闻专题 id。分类 id 见下表，新闻专题 id 為 https://www.cna.com.tw/list/newstopic.aspx 中，連結的數字部份。此參數默认为 aall']">

| 即時 | 政治 | 國際 | 兩岸 | 產經 | 證券 | 科技 | 生活 | 社會 | 地方 | 文化 | 運動 | 娛樂 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| aall | aipl | aopl | acn  | aie  | asc  | ait  | ahel | asoc | aloc | acul | aspt | amov |

</Route>

## 卫报 The Guardian

通过提取文章全文，以提供比官方源更佳的阅读体验。

### Editorial

<Route author="HenryQW" example="/guardian/editorial" path="/guardian/editorial"/>

### China

<Route author="Polynomia" example="/guardian/china" path="/guardian/china"/>

## 文汇报

### 分类

<Route author="hoilc" example="/whb/bihui" path="/whb/:category" :paramsDesc="['文汇报分类名，可在该分类的 URL 中找到（即 http://www.whb.cn/zhuzhan/:category/index.html)']" />

## 香港 01

### 热门

<Route author="hoilc" example="/hk01/hot" path="/hk01/hot" radar="1" rssbud="1"/>

### 栏目

<Route author="hoilc" example="/hk01/zone/11" path="/hk01/zone/:id" :paramsDesc="['栏目 id, 可在 URL 中找到']" radar="1" rssbud="1"/>

### 子栏目

<Route author="hoilc" example="/hk01/channel/391" path="/hk01/channel/:id" :paramsDesc="['子栏目 id, 可在 URL 中找到']" radar="1" rssbud="1"/>

### 专题

<Route author="hoilc" example="/hk01/issue/649" path="/hk01/issue/:id" :paramsDesc="['专题 id, 可在 URL 中找到']" radar="1" rssbud="1"/>

### 标签

<Route author="hoilc" example="/hk01/tag/2787" path="/hk01/tag/:id" :paramsDesc="['标签 id, 可在 URL 中找到']" radar="1" rssbud="1"/>

## 香港電台

### 新聞

香港電台官方已有提供全文 RSS，詳細可前往官方網站： <https://news.rthk.hk/rthk/ch/rss.htm>

此路由主要補回官方 RSS 缺少的圖片以及 Link 元素。（官方 RSS 沒有 Link 元素可能導致某些 RSS 客戶端出現問題）

<Route author="KeiLongW" example="/rthk-news/hk/international" path="/rthk-news/:lang/:category" :paramsDesc="['语言，繁体`hk`，英文`en`','类别']">

| local    | greaterchina | international | finance  | sport    |
| -------- | ------------ | ------------- | -------- | -------- |
| 本地新聞 | 大中華新聞   | 國際新聞      | 財經新聞 | 體育新聞 |

</Route>

## 香港商报

### PDF 版

<Route author="nczitzk" example="/hkcd/pdf" path="/hkcd/pdf"/>

## 新京报

### 栏目

<Route author="DIYgod" example="/bjnews/realtime" path="/bjnews/:category" :paramsDesc="['新京报的栏目名，点击对应栏目后在地址栏找到']"/>

### 电子报

<Route author="MisteryMonster" example="/bjnews/epaper/A" path="/bjnews/epaper/:cat" :paramsDesc="['新京报叠名：`A`,`B`,`C`,`D`, 特刊为`special`']"/>

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

## 央视新闻

### 新闻联播

<Route author="zengxs" example="/cctv/xwlb" path="/cctv/xwlb">

新闻联播内容摘要。

</Route>

### 新闻专题

<Route author="nczitzk" example="/cctv-special/315" path="/cctv-special/:id?" :paramsDesc="['专题 id，可在对应专题页 URL 中找到，默认为 `315` 即 3·15 晚会']">

::: tip 提示

如 [2020 年国家网络安全宣传周](https://news.cctv.com/special/2020gjwlaqxcz/index.shtml) 的专题页 URL 为 <https://news.cctv.com/special/2020gjwlaqxcz/index.shtml。其专题> id 即为 `2020gjwlaqxcz`。

:::

此处查看 [所有新闻专题](http://news.cctv.com/special/index.shtml)

</Route>

### 专题

<Route author="idealclover xyqfer" example="/cctv/world" path="/cctv/:category" :paramsDesc="['分类名']">

| 新闻 | 国内  | 国际  | 社会    | 法治 | 文娱 | 科技 | 生活 | 教育 | 每周质量报告 |
| ---- | ----- | ----- | ------- | ---- | ---- | ---- | ---- | ---- | ------------ |
| news | china | world | society | law  | ent  | tech | life | edu  | mzzlbg       |

</Route>

### 新闻联播文字版

<Route author="luyuhuang" example="/xinwenlianbo/index" path="/xinwenlianbo/index" radar="1" rssbud="1"/>

### 新闻联播文字版全文

<Route author="xfangbao" example="/xwlb" path="/xwlb/index" />

### 央视网图片《镜象》

<Route author="nczitzk" example="/cctv/photo/jx" path="/cctv/photo/jx" />

## 中国日报

### 英语点津

<Route author="sanmmm" example="/chinadaily/english/thelatest" path="/chinadaily/english/:category" :paramsDesc="['目录分类']">

目录分类

| 最新      | 双语           | 热词          | 口语            | 译词          | 视频        | 听力     | 专栏      | 文件                     | 考试         |
| --------- | -------------- | ------------- | --------------- | ------------- | ----------- | -------- | --------- | ------------------------ | ------------ |
| thelatest | news_bilingual | news_hotwords | practice_tongue | trans_collect | video_links | audio_cd | columnist | 5af95d44a3103f6866ee845c | englishexams |

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

<Route author="zphw" example="/rfa/mandarin" path="/rfa/:language?/:channel?/:subChannel?" :paramsDesc="['语言，默认 English', '频道', '子频道（如存在）']" />

通过指定频道参数，提供比官方源更佳的阅读体验。

参数均可在官网获取，如：

`https://www.rfa.org/cantonese/news` 对应 `/rfa/cantonese/news`

`https://www.rfa.org/cantonese/news/htm` 对应 `/rfa/cantonese/news/htm`
