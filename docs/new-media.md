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

<Route author="nczitzk" example="/36kr/information/web_news" path="/36kr/information/:category?" :paramsDesc="['资讯分类，见下表，默认为最新']">

| 最新       | 推荐            | 创投      | 财经  |
| -------- | ------------- | ------- | --- |
| web_news | web_recommend | contact | ccs |

| 汽车     | 科技         | 企服                | 生活         |
| ------ | ---------- | ----------------- | ---------- |
| travel | technology | enterpriseservice | happy_life |

| 创新       | 房产          | 职场           | 企业号     | 其他    |
| -------- | ----------- | ------------ | ------- | ----- |
| innovate | real_estate | web_zhichang | qiyehao | other |

</Route>

### 快讯

<Route author="hillerliao nczitzk" example="/36kr/newsflashes" path="/36kr/newsflashes" />

### 用户文章

<Route author="nczitzk" example="/36kr/user/747305693" path="/36kr/user/:id" :paramsDesc="['用户 id，可在对应用户页面 URL 中找到']" />

### 主题文章

<Route author="nczitzk" example="/36kr/motif/452" path="/36kr/motif/:id" :paramsDesc="['主题 id，可在对应主题页面 URL 中找到']" />

### 专题文章

<Route author="nczitzk" example="/36kr/topics/1818512662032001" path="/36kr/topics/:id" :paramsDesc="['专题 id，可在对应专题页面 URL 中找到']" />

### 搜索文章

<Route author="xyqfer kt286 nczitzk" example="/36kr/search/articles/ofo" path="/36kr/search/articles/:keyword" :paramsDesc="['关键字']" />

### 搜索快讯

<Route author="nczitzk" example="/36kr/search/newsflashes/ofo" path="/36kr/search/newsflashes/:keyword" :paramsDesc="['关键字']" />

## 52hrtt 华人头条

### 新闻

<Route author="nczitzk" example="/52hrtt/global" path="/52hrtt/:area?/:type?" :paramsDesc="['地区，默认为全球', '分类，默认为新闻']">

地区和分类皆可在浏览器地址栏中找到，下面是一个例子。

访问华人头条全球站的国际分类，会跳转到 <https://www.52hrtt.com/global/n/w?infoTypeId=A1459145516533>。其中 `global` 即为 **全球** 对应的地区代码，`A1459145516533` 即为 **国际** 对应的分类代码。

</Route>

### 专题

<Route author="nczitzk" example="/52hrtt/symposium/F1626082387819" path="/52hrtt/symposium/:id?/:classId?" :paramsDesc="['专题 id', '子分类 id']">

专题 id 和 子分类 id 皆可在浏览器地址栏中找到，下面是一个例子。

访问 “邱毅看平潭” 专题，会跳转到 <https://www.52hrtt.com/global/n/w/symposium/F1626082387819>。其中 `F1626082387819` 即为 **专题 id** 对应的地区代码。

::: tip 提示

更多的专题可以点击 [这里](https://www.52hrtt.com/global/n/w/symposium)

:::

</Route>

## 8 视界

### 分类

<Route author="nczitzk" example="/8world" path="/8world/:category?" :paramsDesc="['分类，见下表，默认为即时']">

| 即时       | 新加坡       | 东南亚            | 中港台           | 国际    | 财经      | 体育     |
| -------- | --------- | -------------- | ------------- | ----- | ------- | ------ |
| realtime | singapore | southeast-asia | greater-china | world | finance | sports |

</Route>

## 9To5

### 9To5 分站

<Route author="HenryQW" example="/9to5/mac/aapl" path="/9to5/:subsite/:tag?" :paramsDesc="['分站名字','标签，可在文章标签 URL 中找到']" radar="1" rssbud="1">

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

## AppleInsider

### 分类

<Route author="nczitzk" example="/appleinsider" path="/appleinsider/:category?" :paramsDesc="['分类，见下表，默认为空，即 News']">

| News | Reviews | How-tos |
| ---- | ------- | ------- |
|      | reviews | how-to  |

</Route>

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

## C114 通信网

### 滚动新闻

<Route author="nczitzk" example="/c114/roll" path="/c114/roll"/>

## CBNData

### 看点

<Route author="nczitzk" example="/cbndata/information" path="/cbndata/information/:category?" :paramsDesc="['分类，见下表，默认为看点']">

| 看点 | 餐饮零售 | 美妆个护 | 服饰鞋包 | 家电数码 | 宠物   | 营销   |
| -- | ---- | ---- | ---- | ---- | ---- | ---- |
|    | 2560 | 1    | 2559 | 59   | 2419 | 2484 |

</Route>

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

<Route author="kt286 HaitianLiu nczitzk" example="/cnbeta" path="/cnbeta">

::: tip 提示

最新的内容来源于 [官方 RSS](https://www.cnbeta.com/backend.php)

:::

</Route>

### 分类

<Route author="nczitzk" example="/cnbeta/category/movie" path="/cnbeta/category/:id" :paramsDesc="['分类 id，可在对应分类页的 URL 中找到']">

| 影视    | 音乐    | 游戏   | 动漫    | 趣闻    | 科学      | 软件   |
| ----- | ----- | ---- | ----- | ----- | ------- | ---- |
| movie | music | game | comic | funny | science | soft |

</Route>

### 主题

<Route author="cczhong11 nczitzk" example="/cnbeta/topics/453" path="/cnbeta/topics/:id" :paramsDesc="['主题 id，可在对应主题页的 URL 中找到']">

::: tip 提示

完整的主题列表参见 [主题列表](https://www.cnbeta.com/topics.htm)

:::

</Route>

## Common App

### Blog

<Route author="nczitzk" example="/commonapp/blog" path="/commonapp/blog"/>

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

| 全部  | 德语媒体  | 文化经纬 | 经济纵横 | 科技环境 |
| --- | ----- | ---- | ---- | ---- |
| all | press | cul  | eco  | sci  |

</Route>

## DoNews

### 栏目

<Route author="HenryQW" example="/donews" path="/donews/:column?" :paramsDesc="['栏目代码, 默认为首页.']">

| 首页  | 商业      | 创业       | 互娱  | 科技      | 专栏      |
| --- | ------- | -------- | --- | ------- | ------- |
| (空) | company | business | ent | digital | idonews |

</Route>

## Engadget 瘾科技

### 中文全文

<Route author="JamesWDGu" example="/engadget-cn" path="/engadget-cn"/>

### 多語言

<Route author="JamesWDGu KeiLongW" example="/engadget/chinese" path="/engadget/:lang" :paramsDesc="['語言']">

| 繁體中文    | 簡體中文 | US | 日文       |
| ------- | ---- | -- | -------- |
| chinese | cn   | us | japanese |

</Route>

## ePrice

<Route author="TonyRL" example="/eprice/tw" path="/eprice/:region?" :paramsDesc="['地区，预设为 tw']">

地区：

| hk | tw |
| -- | -- |
| 香港 | 台湾 |

</Route>

## Esquirehk

### Tag

<Route author="nczitzk" example="/esquirehk/tag/Fashion" path="/esquirehk/tag/:id" :paramsDesc="['标签，可在对应标签页 URL 中找到']" />

## EU Disinfo Lab

### Publications

<Route author="nczitzk" example="/disinfo/publications" path="/disinfo/publications"/>

## Europa Press

### 分类

<Route author="nczitzk" example="/europapress" path="/europapress/:category?" :paramsDesc="['分类，见下表，默认为首页']">

| España   | Internacional | Economía | Deportes |
| -------- | ------------- | -------- | -------- |
| nacional | internacional | economía | deportes |

| Cultura | Sociedad | Ciencia | Salud |
| ------- | -------- | ------- | ----- |
| cultura | sociedad | ciencia | salud |

| Tecnología | Comunicados | Estar donde estés |
| ---------- | ----------- | ----------------- |
| tecnología | comunicados | estar-donde-estes |

| Andalucía | Aragón | Cantabria | Castilla-La Mancha |
| --------- | ------ | --------- | ------------------ |
| andalucia | aragon | cantabria | castilla-lamancha  |

| Castilla y León | Cataluña  | Extremadura | Galicia |
| --------------- | --------- | ----------- | ------- |
| castilla-y-leon | catalunya | extremadura | galicia |

| Islas Canarias | Islas Baleares | Madrid | País Vasco |
| -------------- | -------------- | ------ | ---------- |
| islas-canarias | illes-balears  | madrid | euskadi    |

| La Rioja | C. Valenciana        | Navarra | Asturias |
| -------- | -------------------- | ------- | -------- |
| la-rioja | comunitat-valenciana | navarra | asturias |

| Murcia | Ceuta y Melilla |
| ------ | --------------- |
| murcia | ceuta-y-melilla |

</Route>

## ezone.hk

### 分类

<Route author="nczitzk" example="/ezone" path="/ezone/:category?" :paramsDesc="['分类，见下表，默认为最新内容']">

| 科技焦點    | 網絡生活    | 教學評測    | IT Times |
| ------- | ------- | ------- | -------- |
| srae001 | srae008 | srae017 | srae021  |

</Route>

## Fashion Network

### Headline

<Route author="nczitzk" example="/fashionnetwork/headline" path="/fashionnetwork/headline/:country?" :paramsDesc="['国家，见下表，默认为 `ww`']">
</Route>

### News

<Route author="nczitzk" example="/fashionnetwork/news/5,6/15,112" path="/fashionnetwork/news/:sectors?/:categories?/:country?" :paramsDesc="['分区，见下表，默认为 `all`', '分类，见下表，默认为 `all`', '国家，见下表，默认为 `ww`']">

Sectoies

Fashion 1

| Ready-to-wear | Accessories | Footwear | Sports | Denim | Lingerie | Swimwear | Eyewear | Bridal wear | Textile | Miscellaneous |
| ------------- | ----------- | -------- | ------ | ----- | -------- | -------- | ------- | ----------- | ------- | ------------- |
| 5             | 6           | 7        | 8      | 9     | 10       | 11       | 12      | 13          | 14      | 31            |

Luxury 2

| Ready-to-wear | Accessories | Footwear | Watches | Jewellery | Miscellaneous |
| ------------- | ----------- | -------- | ------- | --------- | ------------- |
| 15            | 16          | 17       | 18      | 19        | 32            |

Beauty 3

| Perfume | Cosmetics | Aesthetics | Wellness | Hair | Miscellaneous |
| ------- | --------- | ---------- | -------- | ---- | ------------- |
| 21      | 22        | 23         | 24       | 33   |               |

Lifestyle 4

| Home decor | Tableware | Hospitality | Fine foods | Tourism | Miscellaneous |
| ---------- | --------- | ----------- | ---------- | ------- | ------------- |
| 25         | 26        | 27          | 28         | 29      | 34            |

Others 30

Category

| Retail | Business | Industry | Trade shows |
| ------ | -------- | -------- | ----------- |
| 15     | 112      | 5        | 12          |

| Innovations | Collection | Catwalks | Design |
| ----------- | ---------- | -------- | ------ |
| 113         | 114        | 60       | 70     |

| Media | Campaigns | People | Events | Appointments |
| ----- | --------- | ------ | ------ | ------------ |
| 50    | 115       | 80     | 90     | 95           |

Country

| Latin America | Brazil | China | France |
| ------------- | ------ | ----- | ------ |
| pe            | br     | cn    | fr     |

| Germany | India | Italy | Japan |
| ------- | ----- | ----- | ----- |
| de      | in    | it    | jp    |

| Mexico | Portugal | Russia | Spain |
| ------ | -------- | ------ | ----- |
| mx     | pt       | ru     | es    |

| Turkey | United Kingdom | USA | Worldwide |
| ------ | -------------- | --- | --------- |
| tr     | uk             | us  | ww        |

</Route>

## Focus Taiwan

### Category

<Route author="nczitzk" example="/focustaiwan" path="/focustaiwan/:category?" :paramsDesc="['分类，见下表，默认为 news']">

| Latest | Editor's Picks | Photos of the Day |
| ------ | -------------- | ----------------- |
| news   | editorspicks   | photos            |

| Politics | Cross-strait | Business | Society | Science & Tech | Culture | Sports |
| -------- | ------------ | -------- | ------- | -------------- | ------- | ------ |
| politics | cross-strait | business | society | science & tech | culture | sports |

</Route>

## Foresight News

### 首页

<Route author="nczitzk" example="/foresightnews" path="/foresightnews"/>

### 文章

<Route author="nczitzk" example="/foresightnews/article" path="/foresightnews/article">

::: tip 提示

**文章** 来自 **首页** 时间流，并筛除 **首页** 时间流中的 **快讯** 获得，所以 `limit` 参数不能按预期返回指定数目的文章。

:::

</Route>

### 快讯

<Route author="nczitzk" example="/foresightnews/news" path="/foresightnews/news"/>

### 专栏

<Route author="nczitzk" example="/foresightnews/column/1" path="/foresightnews/column/:id" :paramsDesc="['专栏 id, 可在专栏页 URL 中找到']"/>

## Global Disinformation Index

### Research

<Route author="nczitzk" example="/disinformationindex/research" path="/disinformationindex/research"/>

### Blog

<Route author="nczitzk" example="/disinformationindex/blog" path="/disinformationindex/blog"/>

## GQ

### GQ 台湾

<Route author="nczitzk" example="/gq/tw/fashion" path="/gq/tw/:caty?/:subcaty?" :paramsDesc="['分类，见下表', '子分类，见下表']">

分类

| Fashion | Entertainment | Life | Gadget | Better Men | Video | Tag |
| ------- | ------------- | ---- | ------ | ---------- | ----- | --- |
| fashion | entertainment | life | gadget | bettermen  | video | tag |

子分类

Fashion

| 最新推薦 | 新訊           | 編輯推薦     | 穿搭指南  | 特別報導    |
| ---- | ------------ | -------- | ----- | ------- |
|      | fashion-news | shopping | guide | special |

Entertainment

| 最新推薦 | 電影    | 娛樂         | 名人          | 美女   | 體育     | 特別報導    |
| ---- | ----- | ---------- | ----------- | ---- | ------ | ------- |
|      | movie | popculture | celebrities | girl | sports | special |

Life

| 最新推薦 | 美食   | 微醺   | 戶外生活    | 設計生活   | 風格幕後             | 特別報導    |
| ---- | ---- | ---- | ------- | ------ | ---------------- | ------- |
|      | food | wine | outdoor | design | lifestyleinsider | special |

Gadget

| 最新推薦 | 3C | 車    | 腕錶    | 特別報導    |
| ---- | -- | ---- | ----- | ------- |
|      | 3c | auto | watch | special |

Better Men

| 最新推薦 | 保養健身      | 感情關係         | 性愛  | 特別報導    |
| ---- | --------- | ------------ | --- | ------- |
|      | wellbeing | relationship | sex | special |

Video

| 最新推薦 | 名人     | 全球娛樂                | 玩家收藏    | 穿搭    | 生活   |
| ---- | ------ | ------------------- | ------- | ----- | ---- |
|      | people | globalentertainment | collect | style | life |

Tag

| 奧斯卡                 |
| ------------------- |
| `the-oscars-奧斯卡金像獎` |

</Route>

## Grub Street

### Posts

<Route author="loganrockmore" example="/grubstreet" path="/grubstreet" />

## Harvard Business Review

### Topic

<Route author="nczitzk" example="/hbr/topic/leadership" path="/hbr/topic/:topic?/:type?" :paramsDesc="['话题，可在，默认为 Leadership', '类别，见下表，默认为 Latest']">

| LATEST | POPULAR | FROM THE STORE | FOR YOU |
| ------ | ------- | -------------- | ------- |
| Latest | Popular | From the Store | For You |

::: tip 提示

点击此处查看 [所有话题](https://hbr.org/topics)

:::

</Route>

## Harvard Health Publishing

### Harvard Health Blog

<Route author="nczitzk" example="/harvard/health/blog" path="/harvard/health/blog" />

## HKEPC

### HKEPC 电脑领域

<Route author="TonyRL" example="/hkepc/news" path="/hkepc/:category?" :paramsDesc="['分类，见下表，默认为最新消息']">

| 专题报导       | 新闻中心 | 新品快递   | 超频领域  | 流动数码    | 生活娱乐          | 会员消息   | 脑场新闻  | 业界资讯  | 最新消息   |
| ---------- | ---- | ------ | ----- | ------- | ------------- | ------ | ----- | ----- | ------ |
| coverStory | news | review | ocLab | digital | entertainment | member | price | press | latest |

</Route>

## HKJunkCall 資訊中心

### 近期資訊

<Route author="nczitzk" example="/hkjunkcall" path="/hkjunkcall" />

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

<Route author="brilon" example="/infoq/topic/1" path="/infoq/topic/:id" :paramsDesc="['话题id，可在 [InfoQ全部话题](https://www.infoq.cn/topics) 页面找到URL里的话题id']" />

## IT 之家

### 分类资讯

<Route author="luyuhuang" example="/ithome/it" path="/ithome/:caty" :paramsDesc="['类别']" radar="1" rssbud="1">

| it    | soft | win10    | win11    | iphone    | ipad    | android    | digi | next |
| ----- | ---- | -------- | -------- | --------- | ------- | ---------- | ---- | ---- |
| IT 资讯 | 软件之家 | win10 之家 | win11 之家 | iphone 之家 | ipad 之家 | android 之家 | 数码之家 | 智能时代 |

</Route>

### 热榜

<Route author="immmortal luyuhuang" example="/ithome/ranking/24h" path="/ithome/ranking/:type" :paramsDesc="['类别']" radar="1" rssbud="1">

| 24h      | 7days | monthly |
| -------- | ----- | ------- |
| 24 小时阅读榜 | 7 天最热 | 月榜      |

</Route>

### 专题

<Route author="nczitzk" example="/ithome/zt/xijiayi" path="/ithome/zt/:id" :paramsDesc="['专题 id']" radar="1" rssbud="1">

所有专题请见[此处](https://www.ithome.com/zt)

</Route>

### 标签

<Route author="Fatpandac" example="/ithome/tag/win11" path="/ithome/tag/:name" :paramsDesc="['标签名称，可从网址链接中获取']" radar="1" rssbud="1"/>

## IT 桔子

### 投融资事件

<Route author="xyqfer" example="/itjuzi/invest" path="/itjuzi/invest"/>

### 并购事件

<Route author="xyqfer" example="/itjuzi/merge" path="/itjuzi/merge"/>

## KBS

### News

<Route author="nczitzk" example="/kbs/news" path="/kbs/news/:category?/:language?" :paramsDesc="['分类，可在分类页地址中找到对应 id 字段，默认为 all 即 全部', '语言，见下表，默认为 e 即 English']">

| 한국어 | عربي | 中国语 | English | Français | Deutsch | Bahasa Indonesia | 日本語 | Русский | Español | Tiếng Việt |
| --- | ---- | --- | ------- | -------- | ------- | ---------------- | --- | ------- | ------- | ---------- |
| k   | a    | c   | e       | f        | g       | i                | j   | r       | s       | v          |

</Route>

### Today

<Route author="nczitzk" example="/kbs/today" path="/kbs/today/:language?" :paramsDesc="['语言，见下表，默认为 e 即 English']">

| 한국어 | عربي | 中国语 | English | Français | Deutsch | Bahasa Indonesia | 日本語 | Русский | Español | Tiếng Việt |
| --- | ---- | --- | ------- | -------- | ------- | ---------------- | --- | ------- | ------- | ---------- |
| k   | a    | c   | e       | f        | g       | i                | j   | r       | s       | v          |

</Route>

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

## Line

### Today

<Route author="nczitzk" example="/line/today" path="/line/today/:edition?/:tab?" :paramsDesc="['版本，见下表，默认为 Taiwan', '标签, 可在对应标签页的地址中找到, 默认为 top']">

Edition

| Taiwan | Thailand | Indonesia | Hong Kong |
| ------ | -------- | --------- | --------- |
| tw     | th       | id        | hk        |

</Route>

## LVV2

### 频道

<Route author="Fatpandac" example="/lvv2/news/sort-score" path="/news/:channel/:sort?" :paramsDesc="['频道，见下表', '排序方式，仅得分和24小时榜可选填该参数，见下表']">

|    热门    |    最新    |     得分     |     24 小时榜    |
| :------: | :------: | :--------: | :-----------: |
| sort-hot | sort-new | sort-score | sort-realtime |

| 排序方式 |  一小时内  |  一天内  |  一个周内  |   一个月内  |
| :--: | :----: | :---: | :----: | :-----: |
|      | t-hour | t-day | t-week | t-month |

</Route>

### 24 小时点击排行 Top 10

<Route author="Fatpandac" example="/lvv2/top/sort-score" path="/top/:channel/:sort?" :paramsDesc="['频道，见下表', '排序方式，仅得分和24小时榜可选填该参数，见下表']">

|    热门    |    最新    |     得分     |     24 小时榜    |
| :------: | :------: | :--------: | :-----------: |
| sort-hot | sort-new | sort-score | sort-realtime |

| 排序方式 |  一小时内  |  一天内  |  一个周内  |   一个月内  |
| :--: | :----: | :---: | :----: | :-----: |
|      | t-hour | t-day | t-week | t-month |

</Route>

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
| --- | --- | -- |
| 1   | 2   | 3  |

</Route>

### 标签关联作品

<Route author="whyouare111" example="/matataki/tags/150/区块链/posts" path="/matataki/tags/:tagId/:tagName/posts/:ipfsFlag?" :paramsDesc="['标签ID', '标签名称','IPFS标识，置空item指向主站，有值item指向IPFS网关']"  radar="1"/>

### 收藏夹

<Route author="whyouare111" example="/matataki/users/3017/favorites/155/posts" path="/matataki/users/:userId/favorites/:favoriteListId/posts/:ipfsFlag?" :paramsDesc="['用户ID', '收藏夹ID','IPFS标识，置空item指向主站，有值item指向IPFS网关']"  radar="1"/>

## Matters

### 最新、热门、精华

<Route author="xyqfer Cerebrater xosdy" example="/matters/latest/heat" path="/matters/latest/:type?" :paramsDesc="['默认为 latest, 见下表']" radar="1" rssbud="1">

| 最新     | 热门   | 精华      |
| ------ | ---- | ------- |
| latest | heat | essence |

</Route>

### 标签

<Route author="Cerebrater" example="/matters/tags/VGFnOjk3Mg" path="/matters/tags/:tid" :paramsDesc="['标签 id，可在标签所在的 URL 找到']" radar="1" rssbud="1"/>

### 作者

<Route author="Cerebrater xosdy" example="/matters/author/az" path="/matters/author/:uid" :paramsDesc="['作者 id，可在作者主页的 URL 找到']" radar="1" rssbud="1"/>

## Mirror

### User

<Route author="fifteen42 rde9 nczitzk" example="/mirror/tingfei.eth" path="/mirror/:id" :paramsDesc="['user id']" />

## MIT 科技评论

### 首页

<Route author="EsuRt queensferryme" example="/mittrchina/hot" path="/mittrchina/:type" :paramsDesc="['类型 type，可以是 index（首页资讯）或 hot（本周热榜）']"/>

## MyGoPen

### 分類

<Route author="nczitzk" example="/mygopen" path="/mygopen/:label?" :paramsDesc="['分類，见下表，默认为首页']">

| 謠言 | 詐騙 | 真實資訊 | 教學 |
| -- | -- | ---- | -- |

</Route>

## Nautilus

### 话题

<Route author="emdoe" example="/nautilus/topic/Art" path="/nautilus/topic/:tid" :paramsDesc="['话题 id, 可在页面上方 TOPICS 栏目处找到']"/>

## Netflix

### Newsroom

<Route author="nczitzk" example="/netflix/newsroom" path="/netflix/newsroom/:category?/:region?" :paramsDesc="['分类，见下表，默认为 0 即 全部', '地区，可在地区页 URL 中找到，默认为 en 即 英语地区']">

分类

| 全部报道 | 业务       | 创新            | 娱乐         | 巴西制作   | 社会影响   |
| ---- | -------- | ------------- | ---------- | ------ | ------ |
| all  | business | entertainment | innovation | brazil | impact |

</Route>

## NGOCN

### 首页

<Route author="nczitzk" example="/ngocn2" path="/ngocn2/:category?" :paramsDesc="['分类，见下表，默认为所有文章']" radar="1" rssbud="1">

| 所有文章    | 早报          | 热点       |
| ------- | ----------- | -------- |
| article | daily-brief | trending |

</Route>

## NL Times

### News

<Route author="Hivol" example="/nltimes/news/top-stories" path="/nltimes/news/:category?" :paramsDesc="['分类名']" >

| Top Stories (默认) | Health | Crime | Politics | Business | Tech | Culture | Sports | Weird | 1-1-2 |
| ---------------- | ------ | ----- | -------- | -------- | ---- | ------- | ------ | ----- | ----- |
| top-stories      | health | crime | politics | business | tech | culture | sports | weird | 1-1-2 |

</Route>

## Odaily 星球日报

### 快讯

<Route author="ncziztk" example="/odaily/newsflash" path="/odaily/newsflash"/>

### 文章

<Route author="ncziztk" example="/odaily" path="/odaily/:id?" :paramsDesc="['id，见下表，默认为最新']">

| 最新  | 新品  | DeFi | NFT | 存储  | 波卡  | 行情  | 活动  |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| 280 | 333 | 331  | 334 | 332 | 330 | 297 | 296 |

</Route>

### 用户文章

<Route author="ncziztk" example="/odaily/user/2147486902" path="/odaily/user/:id" :paramsDesc="['用户 id，可在用户页地址栏中找到']"/>

### 活动

<Route author="ncziztk" example="/odaily/activity" path="/odaily/activity"/>

## OpenAI

### Blog

<Route author="ncziztk" example="/openai/blog" path="/openai/blog/:tag" :paramsDesc="['标签，见下表，默认为 All']">

| All | Research | Announcements | Events | Milestones |
| --- | -------- | ------------- | ------ | ---------- |
|     | research | announcements | events | milestones |

</Route>

## OR

### 频道

<Route author="ncziztk" example="/or" path="/or/id?" :paramsDesc="['id，见下表，默认为首页']">

| 首页 | 商业   | 金融    | 政经   | 社会与文化 | 领导力   | 生活时尚  | 视频     |
| -- | ---- | ----- | ---- | ----- | ----- | ----- | ------ |
|    | 7174 | 15176 | 8943 | 14910 | 11813 | 24138 | 324234 |

</Route>

## PANews

### 深度

<Route author="nczitzk" example="/panewslab" path="/panewslab/:category?" :paramsDesc="['分类，见下表，默认为精选']">

| 精选 | 链游 | 元宇宙 | NFT | DeFi | 监管 | 央行数字货币 | 波卡 | Layer 2 | DAO | 融资 | 活动 |
| -- | -- | --- | --- | ---- | -- | ------ | -- | ------- | --- | -- | -- |

</Route>

### 快讯

<Route author="nczitzk" example="/panewslab/news" path="/panewslab/news"/>

### 专栏

<Route author="nczitzk" example="/panewslab/author/166" path="/panewslab/author/:id" :paramsDesc="['专栏 id，可在地址栏 URL 中找到']"/>

### 专题

<Route author="nczitzk" example="/panewslab/topic/1629365774078402" path="/panewslab/topic/:id" :paramsDesc="['专题 id，可在地址栏 URL 中找到']"/>

## PeoPo 公民新聞

### 新聞分類

<Route author="TonyRL" example="/peopo/topic/159" path="/peopo/topic/:topicId?" :paramsDesc="['分類 ID，見下表，默認為社會關懷']" radar="1" rssbud="1">

| 分類   | ID  |
| ---- | --- |
| 社會關懷 | 159 |
| 生態環保 | 113 |
| 文化古蹟 | 143 |
| 社區改造 | 160 |
| 教育學習 | 161 |
| 農業   | 163 |
| 生活休閒 | 162 |
| 媒體觀察 | 164 |
| 運動科技 | 165 |
| 政治經濟 | 166 |
| 北台灣  | 223 |
| 中台灣  | 224 |
| 南台灣  | 225 |
| 東台灣  | 226 |
| 校園中心 | 167 |
| 原住民族 | 227 |
| 天然災害 | 168 |

</Route>

## PMCAFF

### 今日推荐 / 精选

<Route author="Jeason0228" example="/pmcaff/list/2" path="/pmcaff/list/:typeid" :paramsDesc="['分类 id,1=今天推荐,2=精选']"/>

### 社区

<Route author="WenryXu" example="/pmcaff/feed/1" path="/pmcaff/feed/:typeid" :paramsDesc="['分类 id']"/>

| 发现 | 待回答 | 最热 | 问答专场 | 投稿 | 深度 | 专栏 |
| -- | --- | -- | ---- | -- | -- | -- |
| 1  | 2   | 3  | 4    | 5  | 6  | 7  |

### 用户文章

<Route author="SChen1024" example="/pmcaff/user/Oak7mqnEQJ" path="/pmcaff/user/:userid" :paramsDesc="['用户 id, 用户界面对应的 URL 最后面的字符']"/>

## Polar

### Blog

<Route author="nczitzk" example="/polar/blog" path="/polar/blog"/>

## Quanta Magazine

### 全部

<Route author="emdoe" example="/quantamagazine/archive" path="/quantamagazine/archive"/>

## QuestMobile

### 行业研究报告

<Route author="nczitzk" example="/questmobile/report" path="/questmobile/report/:category?/:label?" :paramsDesc="['行业，见下表，默认为全部行业', '标签，见下表，默认为全部标签']">

行业

| 全部行业 | 移动视频 | 移动社交 | 移动购物 |
| ---- | ---- | ---- | ---- |
| 0    | 10   | 1    | 2    |

| 系统工具 | 新闻资讯 | 移动音乐 | 生活服务 |
| ---- | ---- | ---- | ---- |
| 17   | 21   | 11   | 5    |

| 数字阅读 | 汽车服务 | 拍摄美化 | 旅游服务 |
| ---- | ---- | ---- | ---- |
| 16   | 4    | 12   | 8    |

| 健康美容 | 医疗服务 | 教育学习 | 金融理财 |
| ---- | ---- | ---- | ---- |
| 22   | 23   | 14   | 3    |

| 办公商务 | 智能设备 | 手机游戏 | 出行服务 | 内容平台 |
| ---- | ---- | ---- | ---- | ---- |
| 9    | 19   | 20   | 26   | 29   |

标签

| 全部标签 | 5G | 双十一 | 直播带货 | 电商平台 |
| ---- | -- | --- | ---- | ---- |
| 0    | 75 | 74  | 73   | 72   |

| 新蓝领 | 市场竞争 | KOL | 品牌营销 | 互联网研究 |
| --- | ---- | --- | ---- | ----- |
| 71  | 70   | 69  | 68   | 67    |

| 广告效果 | 媒介策略 | App 和小程序 | App 增长 |
| ---- | ---- | -------- | ------ |
| 66   | 65   | 64       | 63     |

| 小程序数据 | 移动大数据 | 互联网报告 | 数据报告 |
| ----- | ----- | ----- | ---- |
| 62    | 61    | 60    | 59   |

| 互联网数据 | 智能终端 | 小程序 | 私域流量 |
| ----- | ---- | --- | ---- |
| 58    | 57   | 56  | 55   |

| 运动消费 | 用户争夺 | 运动健身 | 新消费 |
| ---- | ---- | ---- | --- |
| 54   | 53   | 52   | 48  |

| 增长模式 | 下沉 | 新中产 | 银发族 |
| ---- | -- | --- | --- |
| 42   | 41 | 36  | 31  |

| 粉丝经济 | 泛娱乐 | 网购少女 | 二次元 |
| ---- | --- | ---- | --- |
| 30   | 29  | 28   | 27  |

| 兴趣圈层 | 大学生 | 广告营销 | Z 世代 |
| ---- | --- | ---- | ---- |
| 26   | 25  | 23   | 22   |

| 付费用户 | 精细化运营 | 00 后 | 90 后 |
| ---- | ----- | ---- | ---- |
| 18   | 17    | 14   | 11   |

| 春节报告 | 低幼经济 | 季度报告 | 年度报告 |
| ---- | ---- | ---- | ---- |
| 10   | 9    | 7    | 6    |

| 全景生态 | 消费者洞察 |
| ---- | ----- |
| 5    | 2     |

</Route>

## Readhub

### 分类

<Route author="WhiteWorld nczitzk Fatpandac" example="/readhub" path="/readhub/:category?/:overview?" :paramsDesc="['分类，见下表，默认为热门话题', '获取概述，任意值获取概述，默认为不获取']">

| 热门话题  | 科技动态 | 技术资讯 | 区块链快讯      | 每日早报  |
| ----- | ---- | ---- | ---------- | ----- |
| topic | news | tech | blockchain | daily |

</Route>

## Research Gate

### Publications

<Route author="nczitzk" example="/researchgate/publications/Somsak-Panha" path="/researchgate/publications/:username" :paramsDesc="['用户名，可在用户页地址栏中找到']"/>

## RSS3

### Blog

<Route author="nczitzk" example="/rss3/blog" path="/rss3/blog"/>

## Samsung

### Research Blog

<Route author="nczitzk" example="/samsung/research/blog" path="/samsung/research/blog"/>

## Simons Foundation

### 文章

<Route author="emdoe" example="/simonsfoundation/articles" path="/simonsfoundation/articles"/>

### 推荐

<Route author="emdoe" example="/simonsfoundation/recommend" path="/simonsfoundation/recommend"/>

## Sixth Tone

### 最新文章

<Route author="kt286" example="/sixthtone/news" path="/sixthtone/news"/>

## Sky Sports

### News

<Route author="nczitzk" example="/skysports/news/ac-milan" path="/skysports/news/:team" :paramsDesc="['球队 id，可在球队对应页面的 URL 中找到']" />

## SocialBeta

### 首页

<Route author="nczitzk" example="/socialbeta/home" path="/socialbeta/home"/>

### 案例

<Route author="nczitzk" example="/socialbeta/hunt" path="/socialbeta/hunt"/>

## Soomal

### 话题

<Route author="zoenglinghou" example="/soomal/topics/最新文章" path="/soomal/topics/:category/:language?" :paramsDesc="['话题，可在顶部菜单找到对应名称', '语言，默认为简体中文']">

-   可选语言：

| 简体中文 | 正体中文  | 英语 |
| ---- | ----- | -- |
| zh   | zh_tw | en |

-   可选话题（按语言分类）：

| 语言   |       |       |       |        |      |        |
| ---- | ----- | ----- | ----- | ------ | ---- | ------ |
| 简体中文 | 最新文章  | 科普    | 测评报告  | 发烧入门   | 摄影入门 | 古典音乐入门 |
| 正体中文 | 最新文章  | 科普    | 測評報告  | 發燒入門   | 攝影入門 | 古典音樂入門 |
| 英语   | Phone | Audio | Album | Review |      |        |

-   Soomal 提供官方 RSS 订阅
    -   Soomal 网站更新：<http://www.soomal.com/doc/101.rss.xml>
    -   Soomal 论坛与留言系统的更新：<http://www.soomal.com/bbs/101.rss.xml>

</Route>

## SupChina

### Feed

<Route author="nczitzk" example="/supchina" path="/supchina"/>

### Podcasts

<Route author="nczitzk" example="/supchina/podcasts" path="/supchina/podcasts"/>

## swissinfo

### 分类

<Route author="nczitzk" example="/swissinfo/chi/latest-news" path="/swissinfo/:language?/:category?" :paramsDesc="['语言，默认为 eng', '分类，默认为 Latest News']"/>

## TANC 艺术新闻

### 分类

<Route author="nczitzk" example="/tanchinese" path="/tanchinese/:category?" :paramsDesc="['分类，见下表，默认为 INDEX 首页']">

| INDEX 首页 | ENGLISH 英文版 | NEWS 新闻 | MUSEUM 博物馆 | EXHIBITIONS 展览 |
| -------- | ----------- | ------- | ---------- | -------------- |
|          | english     | news    | museum     | exhibitions    |

| COMMENTS 评论 | FEATURE 特写 | INTERVIEW 专访 | VIDEO 影像之选 | ART MARKET 艺术市场 |
| ----------- | ---------- | ------------ | ---------- | --------------- |
| comments    | feature    | interview    | video      | art-market      |

</Route>

## The Brain

### Blog

<Route author="nczitzk" example="/thebrain/blog" path="/thebrain/blog/:category?" :paramsDesc="['分类, 见下表，默认为 Blog']">

| Blog | Recorded Events | Big Thinkers |
| ---- | --------------- | ------------ |
| blog | recorded-events | big-thinkers |

</Route>

## The Partnership on AI

### Resources

<Route author="nczitzk" example="/partnershiponai/resources" path="/partnershiponai/resources"/>

## The Verge

### The Verge

<Route author="HenryQW" example="/verge" path="/verge">

通过提取文章全文，以提供比官方源更佳的阅读体验.

</Route>

## Thrillist

<Route author="loganrockmore" example="/thrillist/food-and-drink" path="/vulture/:tag" :paramsDesc="['Tag']">

Provides all of the Thrillist articles with the specified tag.

</Route>

## Topbook

### Overview

<Route author="nczitzk" example="/topbook/overview/24" path="/topbook/overview/:id?" :paramsDesc="['id，可在对应页面 URL 中找到，默认为今天看什么']"/>

### 今天看什么

<Route author="nczitzk" example="/topbook/today" path="/topbook/today"/>

## TOPYS

### 关键字

<Route author="nczitzk" example="/topys" path="/topys/:keyword?" :paramsDesc="['关键字，可在对应结果页的 URL 中找到']">

| 创意 | 设计 | 商业 | 艺术 | 文化 | 科技 |
| -- | -- | -- | -- | -- | -- |

</Route>

## Tribal Football

### Latest News

<Route author="Rongronggg9" example="/tribalfootball" path="/tribalfootball" />

## Uwants

### 版塊

<Route author="nczitzk" example="/uwants/1520" path="/uwants/:fid" :paramsDesc="['fid，可在对应板块页的 URL 中找到']"/>

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

## World Happiness

### Blog

<Route author="nczitzk" example="/worldhappiness/blog" path="/worldhappiness/blog"/>

### Archive

<Route author="nczitzk" example="/worldhappiness/archive" path="/worldhappiness/archive"/>

## ZAKER

### 分类

<Route author="LogicJake kt286 TonyRL" example="/zaker/channel/13" path="/zaker/channel/:id?" :paramsDesc="['channel id，可在 URL 中找到，默认为 1']"/>

### 精读

<Route author="AlexdanerZe TonyRL" example="/zaker/focusread" path="/zaker/focusread" />

## 艾莱资讯

### 世界轨道交通资讯网

<Route author="Rongronggg9" example="/ally/rail/hyzix/chengguijiaotong/" path="/ally/rail/:category?/:topic?" :paramsDesc="['分类，可在 URL 中找到；略去则抓取首页', '话题，可在 URL 中找到；并非所有页面均有此字段']" radar="1" rssbud="1">

::: tip 提示

默认抓取前 20 条，可通过 `?limit=` 改变。

:::

</Route>

## 爱范儿 ifanr

### 爱范儿频道

<Route author="HenryQW" example="/ifanr/app" path="/ifanr/:channel?" :paramsDesc="['默认 app，部分频道如下']">

-   频道为单一路径，如 <https://www.ifanr.com/`coolbuy`> 则为 `/ifanr/coolbuy`.
-   频道包含多重路径，如 <https://www.ifanr.com/`category/intelligentcar`> 则替换 `/` 为 `-` `/ifanr/category-intelligentcar`.

| AppSolution | 玩物志     | 董车会                     |
| ----------- | ------- | ----------------------- |
| app         | coolbuy | category-intelligentcar |

</Route>

## 八阕

### 广角新闻

<Route author="nczitzk" example="/popyard" path="/popyard/:caty?" :paramsDesc="['分类, 默认为全景']">

| 全景 | 中国 | 国际 | 科教 | 军事 | 体育 | 娱乐 | 艺术 | 文史 | 观点 | 生活 | 产经 | 其它 |
| -- | -- | -- | -- | -- | -- | -- | -- | -- | -- | -- | -- | -- |
| 0  | 1  | 2  | 3  | 4  | 5  | 6  | 7  | 8  | 9  | 10 | 11 | 12 |

</Route>

## 巴比特

### 作者专栏

<Route author="kt286" example="/8btc/45703" path="/8btc/:authorid" :paramsDesc="['作者ID，可在对应专辑页面的 URL 中找到']"/>

### 快讯

<Route author="hillerliao" example="/8btc/news/flash" path="/8btc/news/flash"/>

## 白话区块链

### 首页

<Route author="Fatpandac" example="/hellobtc/information/latest" path="/hellobtc/information/:channel?" :paramsDesc="['类型，可填 `latest` 和 `application` 及最新和应用，默认为最新']"/>

### 快讯

<Route author="Fatpandac" example="/hellobtc/news" path="/hellobtc/news"/>

### 科普

<Route author="Fatpandac" example="/hellobtc/kepu/latest" path="/hellobtc/kepu/:channel?" :paramsDesc="['类型，见下表，默认为最新']">

| latest | bitcoin | ethereum | defi | inter_blockchain | mining | safety | satoshi_nakomoto | public_blockchain |
| ------ | ------- | -------- | ---- | ---------------- | ------ | ------ | ---------------- | ----------------- |
| 最新     | 比特币     | 以太坊      | DeFi | 跨链               | 挖矿     | 安全     | 中本聪              | 公链                |

</Route>

### 专栏

<Route author="Fatpandac" example="/hellobtc/topic/276" path="/hellobtc/topic/:id" :paramsDesc="['专栏 ID，可在网址中获取']"/>

## 白鲸出海

### 最新

<Route author="jeffcottLu nczitzk" example="/baijing" path="/baijing" />

### 资讯

<Route author="nczitzk" example="/baijing/1" path="/baijing/:type?" :paramsDesc="['分类 id，见下表，默认为最新文章']">

| 最新文章 | 7×24h | 干货 | 专栏 | 手游 | 跨境电商 | 投融资 | 数据报告 | 智能手机 | 活动 |
| ---- | ----- | -- | -- | -- | ---- | --- | ---- | ---- | -- |
|      | 1     | 2  | 4  | 3  | 5    | 10  | 9    | 7    | 6  |

</Route>

## 百度知道日报

### 精选

<Route author="1813927768" example="/baidu/daily" path="/baidu/daily"/>

## 坂道系列官网资讯

### 乃木坂 46 新闻

<Route author="crispgm Fatpandac" example="/nogizaka46/news" path="/nogizaka46/news" />

### 乃木坂 46 博客

<Route author="Kasper4649" example="/nogizaka46/blog" path="/nogizaka46/blog" />

### 欅坂 46 新闻

<Route author="crispgm" example="/keyakizaka46/news" path="/keyakizaka46/news" />

### 欅坂 46 博客

<Route author="nwindz" example="/keyakizaka46/blog" path="/keyakizaka46/blog" />

### 櫻坂 46 新闻

<Route author="nczitzk" example="/sakurazaka46/news" path="/sakurazaka46/news" />

### 櫻坂 46 博客

<Route author="victor21813 nczitzk" example="/sakurazaka46/blog" path="/sakurazaka46/blog/:id?" :paramsDesc="['成员编号，见下表，默认为全部']">

| 编号 | 姓名     |
| -- | ------ |
| 03 | 上村 莉菜  |
| 04 | 尾関 梨香  |
| 06 | 小池 美波  |
| 07 | 小林 由依  |
| 08 | 齋藤 冬優花 |
| 11 | 菅井 友香  |
| 14 | 土生 瑞穂  |
| 15 | 原田 葵   |
| 43 | 井上 梨名  |
| 53 | 遠藤 光莉  |
| 54 | 大園 玲   |
| 55 | 大沼 晶保  |
| 56 | 幸阪 茉里乃 |
| 44 | 関 有美子  |
| 45 | 武元 唯衣  |
| 46 | 田村 保乃  |
| 47 | 藤吉 夏鈴  |
| 57 | 増本 綺良  |
| 48 | 松田 里奈  |
| 50 | 森田 ひかる |
| 58 | 守屋 麗奈  |
| 51 | 山﨑 天   |

</Route>

### 日向坂 46 新闻

<Route author="crispgm" example="/hinatazaka46/news" path="/hinatazaka46/news" />

### 日向坂 46 博客

<Route author="nwindz" example="/hinatazaka46/blog" path="/hinatazaka46/blog" />

## 半月谈

### 时事大事库

<Route author="nczitzk" example="/banyuetan/byt" path="/banyuetan/byt/:time?" :paramsDesc="['时间，见下表，默认为每周']">

| 每周            | 每月    |
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
| -- | --------- | ------------- | ---- | ---- | ---- | ---- | ---- |
|    | 最新资讯和灾难信息 | 生存主义 survival | 运动户外 | 玩物尚志 | 分享下载 | 知行生活 | 商务服务 |

</Route>

## 本地宝

### 焦点资讯

<Route author="nczitzk" example="/bendibao/news/bj" path="/bendibao/news/:city" :paramsDesc="['城市缩写，可在该城市页面的 URL 中找到']">

| 城市名 | 缩写 |
| --- | -- |
| 北京  | bj |
| 上海  | sh |
| 广州  | gz |
| 深圳  | sz |

更多城市请参见 [这里](http://www.bendibao.com/city.htm)

> **香港特别行政区** 和 **澳门特别行政区** 的本地宝城市页面不更新资讯。

</Route>

## 币世界

### 快讯

<Route author="kt286" example="/bishijie/kuaixun" path="/bishijie/kuaixun"/>

## 不安全

### 全文

<Route author="22k" example="/buaq" path="/buaq/index"/>

## 财富中文网

### 分类

<Route author="nczitzk" example="/fortunechina" path="/fortunechina/:category?" :paramsDesc="['分类，见下表，默认为首页']">

| 商业      | 领导力       | 科技   | 研究     |
| ------- | --------- | ---- | ------ |
| shangye | lindgaoli | keji | report |

</Route>

## 差评

### 图片墙

<Route author="nczitzk" example="/chaping/banner" path="/chaping/banner"/>

### 资讯

<Route author="nczitzk" example="/chaping/news/15" path="/chaping/news/:caty?" :paramsDesc="['分类，默认为全部资讯']">

| 编号 | 分类         |
| -- | ---------- |
| 15 | 直播         |
| 3  | 科技新鲜事      |
| 7  | 互联网槽点      |
| 5  | 趣味科技       |
| 6  | DEBUG TIME |
| 1  | 游戏         |
| 8  | 视频         |
| 9  | 公里每小时      |

</Route>

### 快讯

<Route author="Fatpandac" example="/chaping/newsflash" path="/chaping/newsflash"/>

## 产品沉思录

### 首页

<Route author="nczitzk" example="/pmthinking" path="/pmthinking" />

## 城农 Growin' City

### 城农资讯观点

<Route author="nczitzk" example="/growincity/news" path="/growincity/news/:id?" anticrawler="1" :paramsDesc="['分类 id，见下表，默认为原创内容']">

| 原创内容 | 商业投资 | 观点评论 | 农业科技 |
| ---- | ---- | ---- | ---- |
| 48   | 55   | 88   | 98   |

| 农艺管理 | 农业机械 | 设施农业 | 畜牧水产 |
| ---- | ---- | ---- | ---- |
| 101  | 83   | 85   | 87   |

| 食品科技 | 科技产品 | 食品创新 | 研究报告 |
| ---- | ---- | ---- | ---- |
| 86   | 100  | 99   | 76   |

| 教育拓展 | 展会培训 | 业界访谈 |
| ---- | ---- | ---- |
| 61   | 77   | 72   |

</Route>

## 抽屉新热榜

### 最新

<Route author="xyqfer" example="/chouti/hot" path="/chouti/:subject?" :paramsDesc="['主题名称']">

| 热榜  | 42 区 | 段子    | 图片  | 挨踢 1024 | 你问我答 |
| --- | ---- | ----- | --- | ------- | ---- |
| hot | news | scoff | pic | tec     | ask  |

</Route>

### 最热榜 TOP10

<Route author="DIYgod" example="/chouti/top/24" path="/chouti/top/:hour?" :paramsDesc="['排行榜周期，可选 24 72 168 三种，默认 24']" />

## 创业邦

### 作者

<Route author="xyqfer" example="/cyzone/author/1225562" path="/cyzone/author/:id" :paramsDesc="['作者 id']"/>

### 标签

<Route author="LogicJake" example="/cyzone/label/创业邦周报" path="/cyzone/label/:name" :paramsDesc="['标签名称']"/>

## 創新拿鐵

### 分类

<Route author="nczitzk" example="/startuplatte" path="/startuplatte/:category?" :paramsDesc="['分类，见下表，默认为首頁']">

| 首頁 | 大師智慧  | 深度分析     | 新知介紹  |
| -- | ----- | -------- | ----- |
|    | quote | analysis | trend |

</Route>

## 大河财立方

### 新闻

<Route author="linbuxiao" example="/dahecube" path="/dahecube/:type?" :paramsDesc="['板块，见下表，默认为推荐']">

| 推荐        | 党史      | 豫股    | 财经       | 投教        | 金融      | 科创      | 投融     | 专栏     |
| --------- | ------- | ----- | -------- | --------- | ------- | ------- | ------ | ------ |
| recommend | history | stock | business | education | finance | science | invest | column |

</Route>

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

## 电动邦

### 资讯

<Route author="Fatpandac" example="/diandong/news" path="/diandong/news/:cate?" :paramsDesc="['分类，见下表，默认为推荐']">

分类

| 推荐 | 新车 | 导购 | 试驾 | 用车 | 技术 | 政策 | 行业 |
| -- | -- | -- | -- | -- | -- | -- | -- |
| 0  | 29 | 61 | 30 | 75 | 22 | 24 | 23 |

</Route>

### 电动号

<Route author="Fatpandac" example="/diandong/ddh" path="/diandong/ddh/:cate?" :paramsDesc="['分类，见下表，默认为全部']">

分类

| 全部 | 新车 | 导购 | 评测 | 新闻 | 技术 | 政策 | 用车 | 二手车 |
| -- | -- | -- | -- | -- | -- | -- | -- | --- |
| 0  | 1  | 2  | 3  | 4  | 5  | 6  | 7  | 8   |

</Route>

## 电商报

### 分区

<Route author="FlashWingShadow" example="/dsb/area/lingshou" path="/dsb/area/:area" :paramsDesc="['分区']"/>

area 分区选项

| 零售       | 物流    | O2O | 金融      | B2B | 人物    | 跨境      | 行业观察    |
| -------- | ----- | --- | ------- | --- | ----- | ------- | ------- |
| lingshou | wuliu | O2O | jinrong | B2B | renwu | kuajing | guancha |

## 电商在线

### 电商在线

<Route author="LogicJake" example="/imaijia/category/xls" path="/imaijia/category/:category" :paramsDesc="['类别id，可在 URL 中找到']" />

## 电獭少女

### 分类

<Route author="TonyRL" example="/agirls/app" path="/agirls/:category?" :paramsDesc="['分类，默认为最新文章，可在对应主题页的 URL 中找到，下表仅列出部分']" radar="1" rssbud="1">

| App 评测 | 手机开箱  | 笔电开箱     | 3C 周边       | 教学小技巧    | 科技情报     |
| ------ | ----- | -------- | ----------- | -------- | -------- |
| app    | phone | computer | accessories | tutorial | techlife |

</Route>

### 精选主题

<Route author="TonyRL" example="/agirls/topic/iphone13" path="/agirls/topic/:topic" :paramsDesc="['精选主题，可通过下方精选主题列表获得']" radar="1" rssbud="1"/>

### 当前精选主题列表

<Route author="TonyRL" example="/agirls/topic_list" path="/agirls/topic_list" radar="1" rssbud="1"/>

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

## 东西智库

### 分类

<Route author="nczitzk" example="/dx2025" path="/dx2025/:type?/:category?" :paramsDesc="['内容类别，见下表，默认为空', '行业分类，见下表，默认为空']">

内容类别

| 产业观察                 | 行业报告             | 政策     | 数据   |
| -------------------- | ---------------- | ------ | ---- |
| industry-observation | industry-reports | policy | data |

行业分类

| 行业         | 行业名称                                                              |
| ---------- | ----------------------------------------------------------------- |
| 新一代信息技术    | next-generation-information-technology-industry-reports           |
| 高档数控机床和机器人 | high-grade-cnc-machine-tools-and-robots-industry-reports          |
| 航空航天装备     | aerospace-equipment-industry-reports                              |
| 海工装备及高技术船舶 | marine-engineering-equipment-and-high-tech-ships-industry-reports |
| 先进轨道交通装备   | advanced-rail-transportation-equipment-industry-reports           |
| 节能与新能源汽车   | energy-saving-and-new-energy-vehicles-industry-reports            |
| 电力装备       | electric-equipment-industry-reports                               |
| 农机装备       | agricultural-machinery-equipment-industry-reports                 |
| 新材料        | new-material-industry-reports                                     |
| 生物医药及医疗器械  | biomedicine-and-medical-devices-industry-reports                  |
| 现代服务业      | modern-service-industry-industry-reports                          |
| 制造业人才      | manufacturing-talent-industry-reports                             |

</Route>

### 标签

<Route author="nczitzk" example="/dx2025/tag/3d_printing" path="/dx2025/tag/:category" :paramsDesc="['标签分类，见下表，默认为空']">

| 分类    | 分类名                               | 分类      | 分类名                       |
| ----- | --------------------------------- | ------- | ------------------------- |
| 3D 打印 | 3d_printing                       | 大数据     | dashuju                   |
| 5G    | 5g                                | 大湾区     | d_w_q                     |
| AI    | AI                                | 宏观经济    | macro_economy             |
| 世界经济  | world_economy                     | 工业互联网   | industrial_internet       |
| 云计算   | cloud_computing                   | 工业软件    | g_y_r_j                   |
| 人工智能  | rengongzhineng                    | 数字化转型   | digital_transformation    |
| 人才    | personnel                         | 数字孪生    | digital_twin              |
| 企业研究  | enterprise_research               | 数字经济    | digital_economy           |
| 信息安全  | information_safety                | 数字货币    | digital-currency          |
| 创新    | innovate                          | 数据中心    | data_center               |
| 制造业   | manufacturing                     | 数据安全    | data_security             |
| 动力电池  | power_battery                     | 新一代信息技术 | x_y_d_x_x_j_s             |
| 区块链   | qukuailian                        | 新基建     | new_infrastructure        |
| 医疗器械  | medical_apparatus_and_instruments | 新材料     | x_c_l                     |
| 半导体芯片 | semiconductor_chip                | 新能源     | x_n_y                     |
| 新能源汽车 | new_energy_vehicles               | 智能制造    | intelligent_manufacturing |
| 机器人   | robot                             | 机床      | machine_tool              |
| 海工装备  | marine_engineering_equipment      | 物联网     | wulianwang                |
| 现代服务  | x_d_f_w                           | 生物医药    | biomedicine               |
| 电力装备  | electric_equipment                | 网络安全    | wangluoanquan             |
| 航空航天  | aerospace                         | 虚拟现实    | virtual_reality           |
| 装备制造业 | equipment_manufacturing_industry  | 赋能      | empowerment               |
| 轨道交通  | rail_transit                      |         |                           |

</Route>

## 懂球帝

::: tip 提示

-   可以通过头条新闻 + 参数过滤的形式获得早报、专题等内容。

:::

### 新闻

<Route author="HendricksZheng" example="/dongqiudi/top_news/1" path="/dongqiudi/top_news/:id?" :paramsDesc="['类别 id，不填默认头条新闻']" />

| 头条 | 深度 | 闲情 | D 站 | 中超 | 国际  | 英超 | 西甲 | 意甲 | 德甲 |
| -- | -- | -- | --- | -- | --- | -- | -- | -- | -- |
| 1  | 55 | 37 | 219 | 56 | 120 | 3  | 5  | 4  | 6  |

### 专题

<Route author="dxmpalb" example="/dongqiudi/special/41" path="/dongqiudi/special/:id" :paramsDesc="['专题 id, 可自行通过 https://www.dongqiudi.com/special/+数字匹配']">

| 新闻大爆炸 | 懂球帝十佳球 | 懂球帝本周 MVP |
| ----- | ------ | --------- |
| 41    | 52     | 53        |

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

## 樊登读书

### 樊登福州运营中心

<Route author="Fatpandac" example="/dushu/fuzhou" path="/dushu/fuzhou" />

## 飞雪娱乐网

<Route author="nczitzk" example="/feixuew/rj" path="/feixuew/:id?" :paramsDesc="['分类 id，可在对应分类页面的 URL 中找到，默认为首页最近更新']">

| 实用软件 | 网站源码 | 技术教程 | 游戏助手 | 游戏资源 | 值得一看 |
| ---- | ---- | ---- | ---- | ---- | ---- |
| rj   | wzym | jsjc | yx   | yxzy | zdyk |

</Route>

## 费米实验室

### 新闻

<Route author="nczitzk" example="/fnal/news" path="/fnal/news/:category?" :paramsDesc="['分类，见下表，默认为 All News']">

| All News | Fermilab features | Press releases | Symmetry features |
| -------- | ----------------- | -------------- | ----------------- |
| allnews  | 269               | 55             | 12580             |

</Route>

## 封面新闻

### 频道

<Route author="yuxinliu-alex" example="/thecover/channel/3560" path="/thecover/channel/:id?" :paramsDesc="['对应id,可在频道链接中获取，默认为3892']">

| 天下   | 四川   | 辟谣   | 国际   | 云招考 | 30 秒 | 拍客   | 体育   | 国内 | 帮扶铁军 | 文娱 | 宽窄 | 商业 | 千面 | 封面号 |
| ---- | ---- | ---- | ---- | --- | ---- | ---- | ---- | -- | ---- | -- | -- | -- | -- | --- |
| 3892 | 3560 | 3909 | 3686 | 11  | 3902 | 3889 | 3689 | 1  | 4002 | 12 | 46 | 4  | 21 | 17  |

</Route>

## 風傳媒

### 分类

<Route author="nczitzk" example="/storm" path="/storm/:category?/:id?" :paramsDesc="['分类，见下表，默认为新聞總覽', '子分类 ID，可在 URL 中找到']">

| 新聞總覽     | 地方新聞          | 歷史頻道    | 評論總覽        |
| -------- | ------------- | ------- | ----------- |
| articles | localarticles | history | all-comment |

::: tip 提示

支持形如 <https://www.storm.mg/category/118> 的路由，即 [`/storm/category/118`](https://rsshub.app/storm/category/118)

支持形如 <https://www.storm.mg/localarticle-category/s149845> 的路由，即 [`/storm/localarticle-category/s149845`](https://rsshub.app/storm/localarticle-category/s149845)

:::

</Route>

## 凤凰网

### 大风号

<Route author="Jamch" example="/ifeng/feng/2583/doc" path="/ifeng/feng/:id/:type" :paramsDesc="['对应 id，可在 大风号作者页面 找到','类型，见下表']"/>

| 文章  | 视频    |
| --- | ----- |
| doc | video |

## 福利年

### 文章

<Route author="nczitzk" example="/fulinian" path="/fulinian/:caty?" :paramsDesc="['分类, 默认为首页最新发布']">

| 技术教程             | 精品软件             | 网络资源             | 福利年惠     | 创业知识     | 正版教程             |
| ---------------- | ---------------- | ---------------- | -------- | -------- | ---------------- |
| technical-course | quality-software | network-resource | fulinian | chuangye | authentic-course |

</Route>

## 高科技行业门户

### 新闻

<Route author="luyuhuang" example="/ofweek/news" path="/ofweek/news"/>

## 公众号 360

### 公众号

<Route author="Rongronggg9" example="/gzh360/gzh/北京青年报" path="/gzh360/gzh/:name" :paramsDesc="['公众号名，也可以是公众号 360 的内部 id']" radar="1" />

### 分类

<Route author="Rongronggg9" example="/gzh360/category/5d357964e2eb992114a3d588" path="/gzh360/category/:id?" :paramsDesc="['分类 id，见下表']" radar="1">

| `id`                       | 分类  |   | `id`                       | 分类 |
| -------------------------- | --- | - | -------------------------- | -- |
|                            | 首页  |   | `5d357ae6e2eb992114a3d592` | 育儿 |
| `5d357964e2eb992114a3d588` | 热门  |   | `5d357b00e2eb992114a3d593` | 旅游 |
| `5d3579a2e2eb992114a3d589` | 搞笑  |   | `5d357b17e2eb992114a3d594` | 职场 |
| `5d3579b0e2eb992114a3d58a` | 健康  |   | `5d357b34e2eb992114a3d595` | 美食 |
| `5d3579bae2eb992114a3d58b` | 私房话 |   | `5d357b4ae2eb992114a3d596` | 历史 |
| `5d357a10e2eb992114a3d58c` | 八卦精 |   | `5d357b60e2eb992114a3d597` | 教育 |
| `5d357a4ae2eb992114a3d58d` | 科技咖 |   | `5d357b76e2eb992114a3d598` | 星座 |
| `5d357a72e2eb992114a3d58e` | 财经迷 |   | `5d357b8de2eb992114a3d599` | 体育 |
| `5d357a8be2eb992114a3d58f` | 汽车控 |   | `5d357b9be2eb992114a3d59a` | 军事 |
| `5d357aa1e2eb992114a3d590` | 生活家 |   | `5d357bc2e2eb992114a3d59b` | 游戏 |
| `5d357ab6e2eb992114a3d591` | 时尚圈 |   | `5d357bd4e2eb992114a3d59c` | 萌宠 |

</Route>

## 谷歌新闻

### 新闻

<Route author="zoenglinghou" example="/google/news/要闻/hl=zh-CN&gl=CN&ceid=CN:zh-Hans" path="/google/news/:category/:locale" :paramsDesc="['子分类标题', '地区语言设置，在地址栏 `?` 后，包含 `hl`，`gl`，以及 `ceid` 参数']"/>

## 观察者网

### 头条

<Route author="nczitzk" example="/guancha/headline" path="/guancha/headline" />

### 首页

<Route author="nczitzk Jeason0228" example="/guancha" path="/guancha/:category?" :paramsDesc="['分类，见下表，默认为全部']">

| 全部  | 评论 & 研究 | 要闻    | 风闻      | 热点新闻   | 滚动新闻    |
| --- | ------- | ----- | ------- | ------ | ------- |
| all | review  | story | fengwen | redian | gundong |

home = 评论 & 研究 + 要闻 + 风闻

others = 热点新闻 + 滚动新闻

::: tip 提示

观察者网首页左中右的三个 column 分别对应 **评论 & 研究**、**要闻**、**风闻** 三个部分。

:::

</Route>

### 观学院

<Route author="nczitzk" example="/guancha/member/recommend" path="/guancha/member/:category?" :paramsDesc="['分类，见下表']">

| 精选        | 观书堂   | 在线课     | 观学院      |
| --------- | ----- | ------- | -------- |
| recommend | books | courses | huodongs |

</Route>

### 风闻话题

<Route author="occupy5 nczitzk" example="/guancha/topic/110/1" path="/guancha/topic/:id?/:order?" :paramsDesc="['话题 id，可在URL中找到，默认为全部，即为 `0`', '排序参数，见下表']">

| 最新回复 | 最新发布 | 24 小时最热 | 3 天最热 | 7 天最热 | 3 个月最热 | 专栏文章 |
| ---- | ---- | ------- | ----- | ----- | ------ | ---- |
| 1    | 2    | 3       | 6     | 7     | 8      | 5    |

::: tip 提示

仅在话题 id 为 0，即选择 全部 时，**3 个月最热**、**24 小时最热**、**3 天最热**、**7 天最热** 和 **专栏文章** 参数生效。

:::

</Route>

### 个人主页文章

<Route author="Jeason0228" example="/guancha/personalpage/243983" path="/guancha/personalpage/:uid" :paramsDesc="['用户id， 可在URL中找到']" />

## 广告门

### 板块

<Route author="nczitzk" example="/adquan/info" path="/adquan/:type?" :paramsDesc="['分类, 置空为首页']">

| 行业观察 | 案例库      |
| ---- | -------- |
| info | creative |

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

## 国家高端智库 / 综合开发研究院

### 栏目

<Route author="nczitzk" example="/cdi" path="/cdi/:id?" :paramsDesc="['分类，见下表，默认为综研国策']">

| 樊纲观点 | 综研国策 | 综研观察 | 综研专访 | 综研视点 | 银湖新能源 |
| ---- | ---- | ---- | ---- | ---- | ----- |
| 102  | 152  | 150  | 153  | 154  | 151   |

</Route>

## 果壳网

### 科学人

<Route author="alphardex nczitzk" example="/guokr/scientific" path="/guokr/scientific"/>

### 果壳网专栏

<Route author="DHPO hoilc" example="/guokr/calendar" path="/guokr/:channel" :paramsDesc="['专栏类别']">
| 物种日历 | 吃货研究所 | 美丽也是技术活 |
| -------- | ---------- | -------------- |
| calendar | institute  | beauty         |
</Route>

## 好奇心日报

### 标签，栏目，分类

<Route author="WenhuWee emdoe SivaGao HenryQW" example="/qdaily/column/59" path="/qdaily/:type/:id" :paramsDesc="['类型，见下表', '对应 id，可在 URL 找到']" radar="1" rssbud="1">

| 标签  | 栏目     | 分类       |
| --- | ------ | -------- |
| tag | column | category |

</Route>

## 后续

### 热点

<Route author="nczitzk" example="/houxu" path="/houxu" />

### 跟踪

<Route author="nczitzk" example="/houxu/memory" path="/houxu/memory" />

### 专栏

<Route author="ciaranchen nczitzk" example="/houxu/events" path="/houxu/events"/>

### Live

<Route author="ciaranchen sanmmm nczitzk" example="/houxu/lives/33899" path="/houxu/lives/:id" :paramsDesc="['编号，可在对应 Live 页面的 URL 中找到']"/>

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

## 互动吧

### 活动

<Route author="nczitzk" example="/hudongba/beijing/98-0-2-0-1-1" path="/hudongba/:city/:id" :paramsDesc="['城市，可在选定所在城市后的页面 URL 中找到', '编号，可在选定筛选条件后的页面 URL 中找到']">

如例子 `/hudongba/beijing/98-0-2-0-1-1` 对应的网址 `https://www.hudongba.com/beijing/98-0-2-0-0-1` 中，`beijing` 即所在城市为北京；`98-0-2-0-0-1` 则是所选择的分类编号，指分类不限、时间不限、综合排序的所有亲子活动。

</Route>

## 汇通网

### 7x24 小时快讯

<Route author="occupy5" example="/fx678/kx" path="/fx678/kx" />

## 机核网

### 分类

<Route author="MoguCloud" example="/gcores/category/news" path="/gcores/category/:category" :paramsDesc="['分类名']" radar="1">

| 资讯   | 视频     | 电台     | 文章       |
| ---- | ------ | ------ | -------- |
| news | videos | radios | articles |

</Route>

### 标签

<Route author="StevenRCE0" example="/gcores/tag/42/articles" path="/gcores/tag/:tag/:category?" :paramsDesc="['标签名，可在选定标签分类页面的 URL 中找到，如视觉动物——42', '分类名']" radar="1">

分类名同上。

</Route>

## 加美财经

<Route author="nczitzk" example="/caus" path="/caus/:category?" :paramsDesc="['分类，见下表，默认为全部']">

| 全部 | 要闻 | 商业 | 快讯 | 投资理财 | 生活 |
| -- | -- | -- | -- | ---- | -- |
| 0  | 1  | 2  | 3  | 4    | 6  |

</Route>

## 加拿大国际广播电台

### 最新消息

<Route author="nczitzk" example="/radio-canada/latest" path="/radio-canada/latest/:language?" :paramsDesc="['语言，见下表，默认为 English']">

| Français | English | Español | 简体中文    | 繁體中文    | العربية | ਪੰਜਾਬੀ | Tagalog |
| -------- | ------- | ------- | ------- | ------- | ------- | ------ | ------- |
| fr       | en      | es      | zh-hans | zh-hant | ar      | pa     | tl      |

</Route>

## 贾真的电商 108 将

### 「108 将」实战分享

<Route author="nczitzk" example="/jiazhen108" path="/jiazhen108" />

## 健康界

### 首页

<Route author="qnloft" example="/cn-healthcare/index" path="/cn-healthcare/index" />

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

| 政策      | 行情           | DeFi | 矿业    | 以太坊 2.0 | 产业       | IPFS | 技术   | 百科    | 研报            |
| ------- | ------------ | ---- | ----- | ------- | -------- | ---- | ---- | ----- | ------------- |
| zhengce | fenxishishuo | defi | kuang | 以太坊 2.0 | industry | IPFS | tech | baike | capitalmarket |

</Route>

## 经济 50 人论坛

### 专家文章

<Route author="sddiky" example="/50forum" path="/50forum"/>

## 鲸跃汽车

### 首页

<Route author="LogicJake" example="/whalegogo/home" path="/whalegogo/home"/>

### 其他栏目

<Route author="Jeason0228" example="/whalegogo/portal/2" path="/whalegogo/portal/:type_id/:tagid?/" :paramsDesc="['type_id,栏目id','tagid,标签id']">

| 快讯                 | 文章                 | 活动                 | 评测                 | 视频                 | 访谈                 |
| ------------------ | ------------------ | ------------------ | ------------------ | ------------------ | ------------------ |
| type_id=2,tagid 不填 | type_id=1,tagid 不填 | type_id=7,tagid 不填 | type_id=8,tagid 不填 | type_id=1,tagid=70 | type_id=1,tagid=73 |

</Route>

## 九三学社

### 分类

<Route author="nczitzk" example="/93/lxzn-yzjy" path="/93/:category?" :paramsDesc="['分类，可在对应分类页的 URL 中找到']"/>

## 巨潮资讯

<Route author="LogicJake hillerliao laampui nczitzk" example="/cninfo/announcement/szse/000002/gssz0000002/category_ndbg_szsh" path="/cninfo/announcement/:column/:code/:orgId/:category?/:search?" :paramsDesc="['szse 深圳证券交易所; sse 上海证券交易所; third 新三板; hke 港股; fund 基金', '股票或基金代码', 'orgId 组织 id', '公告分类，A 股及新三板，见下表，默认为全部', '标题关键字，默认为空']">

column 为 szse 或 sse 时可选的 category:

| 全部  | 年报                 | 半年报                 | 一季报                 | 三季报                 | 业绩预告                  | 权益分派                   | 董事会                 | 监事会                 | 股东大会               | 日常经营               | 公司治理               | 中介报告             | 首发               | 增发               | 股权激励               | 配股               | 解禁               | 公司债                | 可转债                | 其他融资               | 股权变动               | 补充更正               | 澄清致歉               | 风险提示               | 特别处理和退市              | 退市整理期               |
| --- | ------------------ | ------------------- | ------------------- | ------------------- | --------------------- | ---------------------- | ------------------- | ------------------- | ------------------ | ------------------ | ------------------ | ---------------- | ---------------- | ---------------- | ------------------ | ---------------- | ---------------- | ------------------ | ------------------ | ------------------ | ------------------ | ------------------ | ------------------ | ------------------ | -------------------- | ------------------- |
| all | category_ndbg_szsh | category_bndbg_szsh | category_yjdbg_szsh | category_sjdbg_szsh | category_yjygjxz_szsh | category_qyfpxzcs_szsh | category_dshgg_szsh | category_jshgg_szsh | category_gddh_szsh | category_rcjy_szsh | category_gszl_szsh | category_zj_szsh | category_sf_szsh | category_zf_szsh | category_gqjl_szsh | category_pg_szsh | category_jj_szsh | category_gszq_szsh | category_kzzq_szsh | category_qtrz_szsh | category_gqbd_szsh | category_bcgz_szsh | category_cqdq_szsh | category_fxts_szsh | category_tbclts_szsh | category_tszlq_szsh |

column 为 third 时可选的 category:

| 全部  | 临时公告          | 定期公告          | 中介机构公告        | 持续信息披露        | 首次信息披露        |
| --- | ------------- | ------------- | ------------- | ------------- | ------------- |
| all | category_lsgg | category_dqgg | category_zjjg | category_cxpl | category_scpl |

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

| 全部  | 文章      | Podcast |
| --- | ------- | ------- |
| all | article | podcast |

</Route>

## 科学网

### 精选博客

<Route author="nczitzk" example="/sciencenet/blog" path="/sciencenet/blog/:type?/:time?/:sort?" :paramsDesc="['类型，见下表，默认为推荐', '时间，见下表，默认为所有时间', '排序，见下表，默认为按发表时间排序']">

类型

| 精选        | 最新  | 热门  |
| --------- | --- | --- |
| recommend | new | hot |

时间

| 36 小时内精选博文 | 一周内精选博文 | 一月内精选博文 | 半年内精选博文 | 所有时间精选博文 |
| ---------- | ------- | ------- | ------- | -------- |
| 1          | 2       | 3       | 4       | 5        |

排序

| 按发表时间排序 | 按评论数排序 | 按点击数排序 |
| ------- | ------ | ------ |
| 1       | 2      | 3      |

</Route>

### 用户博客

<Route author="nczitzk" example="/sciencenet/user/tony8310" path="/sciencenet/user/:id" :paramsDesc="['用户 id，可在对用户博客页 URL 中找到']"/>

## 快科技

### 新闻

<Route author="nczitzk" example="/mydrivers" path="/mydrivers/:type?/:id?" :paramsDesc="['类型，见下表，默认为最新', '编号，可在对应页面地址栏中找到']">

::: tip 提示

使用 **类型** 表中的两个参数时，编号应留空，如：**最新** 为 [`/mydrivers/new`](https://rsshub.app/mydrivers/new)

使用 **编号** 表中的参数不应遗漏对应类型参数，如 **电脑** 为 [`/mydrivers/bcid/801`](https://rsshub.app/mydrivers/bcid/801)

:::

类型

| 最新  | 热门  |
| --- | --- |
| new | hot |

编号

| 最新     | 最热     | 电脑       | 手机       | 汽车       | 业界       |
| ------ | ------ | -------- | -------- | -------- | -------- |
| ac/new | ac/hot | bcid/801 | bcid/802 | bcid/807 | bcid/803 |

| 科学       | 排行       | 评测       | 安卓       | 苹果      | CPU    |
| -------- | -------- | -------- | -------- | ------- | ------ |
| tid/1000 | tid/1001 | tid/1002 | icid/121 | cid/201 | cid/13 |

| 显卡     | 一图       | 阿里       | 微软      | 百度      | 影视       |
| ------ | -------- | -------- | ------- | ------- | -------- |
| cid/12 | tid/1003 | icid/270 | icid/90 | icid/67 | bcid/809 |

| 游戏       | 路由器    | PS5       | Xbox     | 华为       | OPPO     |
| -------- | ------ | --------- | -------- | -------- | -------- |
| bcid/806 | cid/38 | icid/6950 | icid/194 | icid/136 | icid/148 |

| 小米        | VIVO     | 三星       | 魅族       | 一加       | 特斯拉       |
| --------- | -------- | -------- | -------- | -------- | --------- |
| icid/9355 | icid/288 | icid/154 | icid/140 | icid/385 | icid/1193 |

| 比亚迪      | 小鹏        | 蔚来        | 理想         | 奔驰       | 宝马       | 大众       |
| -------- | --------- | --------- | ---------- | -------- | -------- | -------- |
| icid/770 | icid/7259 | icid/7318 | icid/12947 | icid/429 | icid/461 | icid/481 |

</Route>

### 最新新闻

<Route author="kt286" example="/kkj/news" path="/kkj/news"/>

## 快媒体

### 首页更新

<Route author="xfangbao" example="/kuai" path="/kuai" />

### 具体栏目更新

<Route author="xfangbao" example="/kuai/1" path="/kuai/:id" />

具体栏目编号，去网站上看标签

| 网址                                                                                                | 对应路由     |
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

## 雷峰网

### 最新文章

<Route author="vlcheng" example="/leiphone" path="/leiphone"/>

### 业界资讯

<Route author="vlcheng" example="/leiphone/newsflash" path="/leiphone/newsflash"/>

### 栏目

<Route author="vlcheng" example="/leiphone/category/industrynews" path="/leiphone/category/:catname" :paramsDesc="['网站顶部分类栏目']">

-   主栏目

| 业界           | 人工智能 | 智能驾驶           | 数智化             | 金融科技    | 医疗科技     | 芯片    | 政企安全       | 智慧城市      | 行业云           | 工业互联网              | AIoT |
| ------------ | ---- | -------------- | --------------- | ------- | -------- | ----- | ---------- | --------- | ------------- | ------------------ | ---- |
| industrynews | ai   | transportation | digitalindustry | fintech | aihealth | chips | gbsecurity | smartcity | industrycloud | IndustrialInternet | iot  |

-   子栏目

    -   人工智能

                | 学术       | 开发者      |
                | -------- | -------- |
                | academic | yanxishe |

    -   数智化

                | 零售数智化     | 金融数智化      | 工业数智化      | 医疗数智化     | 城市数智化       |
                | --------- | ---------- | ---------- | --------- | ----------- |
                | redigital | findigital | mandigital | medigital | citydigital |

    -   金融科技

                | 科技巨头    | 银行 AI | 金融云          | 风控与安全        |
                | ------- | ----- | ------------ | ------------ |
                | BigTech | bank  | FinanceCloud | DataSecurity |

    -   医疗科技

                | 医疗 AI    | 投融资   | 医疗器械  | 互联网医疗            | 生物医药         | 健康险          |
                | -------- | ----- | ----- | ---------------- | ------------ | ------------ |
                | healthai | touzi | qixie | hulianwangyiliao | shengwuyiyao | jiankangxian |

    -   芯片

                | 材料设备      | 芯片设计       | 晶圆代工          | 封装测试      |
                | --------- | ---------- | ------------- | --------- |
                | materials | chipdesign | manufacturing | packaging |

    -   智慧城市

                | 智慧安防          | 智慧教育           | 智慧交通                | 智慧社区           | 智慧零售           | 智慧政务            | 智慧地产     |
                | ------------- | -------------- | ------------------- | -------------- | -------------- | --------------- | -------- |
                | smartsecurity | smarteducation | smarttransportation | smartcommunity | smartretailing | smartgovernment | proptech |

    -   工业互联网

                | 工业软件       | 工业安全     | 5G 工业互联网 | 工业转型实践    |
                | ---------- | -------- | -------- | --------- |
                | gysoftware | gysafety | 5ggy     | gypratice |

    -   AIoT

                | 物联网 | 智能硬件 | 机器人   | 智能家居      |
                | --- | ---- | ----- | --------- |
                | 5G  | arvr | robot | smarthome |

</Route>

## 链新闻 ABMedia

### 首页最新新闻

<Route author="Fatpandac" example="/abmedia/index" path="/abmedia/index"/>

### 类别

<Route author="Fatpandac" example="/abmedia/technology-development" path="/abmedia/:category?" :paramsDesc="['类别，默认为产品技术']">

参数可以从链接中拿到，如：

`https://www.abmedia.io/category/technology-development` 对应 `/abmedia/technology-development`

</Route>

## 留园网

### 分站

<Route author="nczitzk" example="/6park" path="/6park/:id?" :paramsDesc="['分站，见下表，默认为史海钩沉']">

| 婚姻家庭  | 魅力时尚  | 女性频道   | 生活百态  | 美食厨房  | 非常影音 |
| ----- | ----- | ------ | ----- | ----- | ---- |
| life9 | life1 | chan10 | life2 | life6 | fr   |

| 车迷沙龙   | 游戏天地   | 卡通漫画   | 体坛纵横   | 运动健身  | 电脑前线  |
| ------ | ------ | ------ | ------ | ----- | ----- |
| enter7 | enter3 | enter6 | enter5 | sport | know1 |

| 数码家电  | 旅游风向  | 摄影部落  | 奇珍异宝 | 笑口常开   | 娱乐八卦   |
| ----- | ----- | ----- | ---- | ------ | ------ |
| chan6 | life7 | chan8 | page | enter1 | enter8 |

| 吃喝玩乐    | 文化长廊   | 军事纵横 | 百家论坛  | 科技频道  | 爱子情怀  |
| ------- | ------ | ---- | ----- | ----- | ----- |
| netstar | life10 | nz   | other | chan2 | chan5 |

| 健康人生  | 博论天下  | 史海钩沉  | 网际谈兵     | 经济观察    | 谈股论金  |
| ----- | ----- | ----- | -------- | ------- | ----- |
| life5 | bolun | chan1 | military | finance | chan4 |

| 杂论闲侃 | 唯美乐园 | 学习园地 | 命理玄机 | 宠物情缘  | 网络歌坛  |
| ---- | ---- | ---- | ---- | ----- | ----- |
| pk   | gz1  | gz2  | gz3  | life8 | chan7 |

| 音乐殿堂   | 情感世界  |
| ------ | ----- |
| enter4 | life3 |

::: tip 提示

酷 18 文档参见 [此处](https://docs.rsshub.app/picture.html#ku-18)

禁忌书屋文档参见 [此处](https://docs.rsshub.app/reading.html#jin-ji-shu-wu)

:::

</Route>

### 精华区

<Route author="nczitzk" example="/6park/chan1/gold" path="/6park/:id/gold" :paramsDesc="['分站，见上表']"/>

### 搜索关键字

<Route author="nczitzk" example="/6park/chan1/keywords/都市" path="/6park/:id/keywords/:keyword?" :paramsDesc="['分站，见上表', '关键字']"/>

## 隆众资讯

### 资讯

<Route author="nczitzk" example="/oilchem/list/140/18263" path="/oilchem/:type?/:category?/:subCategory?" :paramsDesc="['类别 id，可在对应类别页中找到，默认为首页', '分类 id，可在对应分类页中找到', '子分类 id，可在对应分类页中找到']">

以下是几个例子：

[**化工**](https://chem.oilchem.net) <https://chem.oilchem.net> 中，类别 id 为 `chem`，分类 id 为空，子分类 id 为空，对应路由即为 [`/oilchem/chem`](https://rsshub.app/oilchem/list/140/18263)

[**甲醇**](https://chem.oilchem.net/chemical/methanol.shtml) 的相关资讯有两个页面入口：其一 <https://chem.oilchem.net/chemical/methanol.shtml> 中，类别 id 为 `chem`，分类 id 为 `chemical`，子分类 id 为 `methanol`，对应路由即为 [`/oilchem/chem/chemical/methanol`](https://rsshub.app/oilchem/chem/chemical/methanol) 或其二 <https://list.oilchem.net/140> 中，类别 id 为 `list`，分类 id 为 `140`，子分类 id 为空，对应路由即为 [`/oilchem/list/140`](https://rsshub.app/oilchem/list/140)；

[**甲醇热点聚焦**](https://list.oilchem.net/140/18263) <https://list.oilchem.net/140/18263> 中，类别 id 为 `list`，分类 id 为 `140`，子分类 id 为 `18263`，对应路由即为 [`/oilchem/list/140/18263`](https://rsshub.app/oilchem/list/140/18263)

</Route>

## 律动

### 新闻快讯

<Route author="Fatpandac" example="/blockbeats/flash" path="/blockbeats/:channel?" :paramsDesc="['类型，见下表，默认为快讯']">

|   快讯  |  新闻  |
| :---: | :--: |
| flash | news |

</Route>

## 論盡媒體 AllAboutMacau Media

### 话题

<Route author="nczitzk" example="/aamacau" path="/aamacau/:category?/:id?" :paramsDesc="['分类，见下表，默认为即時報道', 'id，可在对应页面 URL 中找到，默认为空']">

| 即時報道         | 每週專題        | 藝文爛鬼樓   | 論盡紙本  | 新聞事件 | 特別企劃    |
| ------------ | ----------- | ------- | ----- | ---- | ------- |
| breakingnews | weeklytopic | culture | press | case | special |

::: tip 提示

除了直接订阅分类全部文章（如 [每週專題](https://aamacau.com/topics/weeklytopic) 的对应路由为 [/aamacau/weeklytopic](https://rsshub.app/aamacau/weeklytopic)），你也可以订阅特定的专题，如 [【9-12】2021 澳門立法會選舉](https://aamacau.com/topics/【9-12】2021澳門立法會選舉) 的对应路由为 [/【9-12】2021 澳門立法會選舉](https://rsshub.app/aamacau/【9-12】2021澳門立法會選舉)。

分类中的专题也可以单独订阅，如 [新聞事件](https://aamacau.com/topics/case) 中的 [「武漢肺炎」新聞檔案](https://aamacau.com/topics/case/「武漢肺炎」新聞檔案) 对应路由为 [/case/「武漢肺炎」新聞檔案](https://rsshub.app/aamacau/case/「武漢肺炎」新聞檔案)。

同理，其他分类同上例子也可以订阅特定的单独专题。

:::

</Route>

## 妈咪帮

<Route author="nczitzk" example="/mamibuy" path="/mamibuy/:caty?/:age?/:sort?" :paramsDesc="['分类，见下表，默认为全分類', '岁数，见下表，默认为不限', '排序，见下表，默认为最新']">

分类

| 全分類 | 小兒醫護 | 幼兒教育 | 育兒成長 | 母乳餵哺 | 寶寶飲食 | 用品交流 | 女人聊天 | 居家生活 | 親子旅遊 / 好去處 | 媽咪扮靚 | 生活閒談 | 懷孕交流 |
| --- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---------- | ---- | ---- | ---- |
| 0   | 1    | 2    | 3    | 4    | 5    | 6    | 7    | 8    | 9          | 10   | 11   | 12   |

岁数

| 不限 | 懷孕中 | 生產後 | 0~1 歲 | 1~3 歲 | 3~6 歲 | 6 歲以上 |
| -- | --- | --- | ----- | ----- | ----- | ----- |
| 0  | 1   | 2   | 3     | 4     | 5     | 6     |

排序

| 最新 | 推薦 | 熱門 |
| -- | -- | -- |
| 1  | 2  | 3  |

</Route>

## 慢雾科技

### 动态

<Route author="AtlasQuan" example="/slowmist/research" path="/slowmist/:type?" :paramsDesc="['分类，见下表，默认为公司新闻']">

| 公司新闻 | 漏洞披露 | 技术研究     |
| ---- | ---- | -------- |
| news | vul  | research |

</Route>

## 梅花网

### 作品

<Route author="nczitzk" example="/meihua/shots/latest" path="/meihua/shots/:caty">

| 最新     | 热门  | 推荐        |
| ------ | --- | --------- |
| latest | hot | recommend |

</Route>

### 文章

<Route author="nczitzk" example="/meihua/article/latest" path="/meihua/article/:caty">

| 最新     | 热门  |
| ------ | --- |
| latest | hot |

</Route>

## 梅斯医学 MedSci

### 资讯

<Route author="nczitzk" example="/medsci" path="/medsci/:sid?/:tid?" :paramsDesc="['科室，见下表，默认为推荐', '亚专业，可在对应科室页 URL 中找到，默认为该科室的全部']">

::: tip 提示

下表为科室对应的 sid，若想获得 tid，可以到对应科室页面 URL 中寻找 `t_id` 字段的值，下面是一个例子：

如 [肿瘤 - NSCLC](https://www.medsci.cn/department/details?s_id=5\&t_id=277) 的 URL 为 <https://www.medsci.cn/department/details?s_id=5&t_id=277>，可以看到此时 `s_id` 对应 `sid` 的值为 5， `t_id` 对应 `tid` 的值为 277，所以可以得到路由 [`/medsci/5/277`](https://rsshub.app/medsci/5/277)

:::

| 心血管 | 内分泌 | 消化 | 呼吸 | 神经科 |
| --- | --- | -- | -- | --- |
| 2   | 6   | 4  | 12 | 17  |

| 传染科 | 精神心理 | 肾内科 | 风湿免疫 | 血液科 |
| --- | ---- | --- | ---- | --- |
| 9   | 13   | 14  | 15   | 21  |

| 老年医学 | 胃肠外科 | 血管外科 | 肝胆胰外 | 骨科 |
| ---- | ---- | ---- | ---- | -- |
| 19   | 76   | 92   | 91   | 10 |

| 普通外科 | 胸心外科 | 神经外科 | 泌尿外科 | 烧伤科 |
| ---- | ---- | ---- | ---- | --- |
| 23   | 24   | 25   | 26   | 27  |

| 整形科 | 麻醉疼痛 | 罕见病 | 康复医学 | 药械 |
| --- | ---- | --- | ---- | -- |
| 28  | 29   | 304 | 95   | 11 |

| 儿科 | 耳鼻咽喉 | 口腔科 | 眼科 | 政策人文 |
| -- | ---- | --- | -- | ---- |
| 18 | 30   | 31  | 32 | 33   |

| 营养全科 | 预防公卫 | 妇产科 | 中医科 | 急重症 |
| ---- | ---- | --- | --- | --- |
| 34   | 35   | 36  | 37  | 38  |

| 皮肤性病 | 影像放射 | 转化医学 | 检验病理 | 护理 |
| ---- | ---- | ---- | ---- | -- |
| 39   | 40   | 42   | 69   | 79 |

| 糖尿病 | 冠心病 | 肝病 | 乳腺癌 |
| --- | --- | -- | --- |
| 8   | 43  | 22 | 89  |

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

## 美国劳工联合会 - 产业工会联合会

### 博客

<Route author="nczitzk" example="/aflcio/blog" path="/aflcio/blog"/>

## 镁客网 im2maker

### 镁客网频道

<Route author="jin12180000" example="/im2maker/" path="/im2maker/:channel?" :paramsDesc="['默认不填为 最新文章 ，频道如下']">

| 最新文章 | 行业快讯  | 行业观察     | 镁客请讲 | 硬科技 100 人 | 投融界      | 万象         |
| ---- | ----- | -------- | ---- | --------- | -------- | ---------- |
| 默认空  | fresh | industry | talk | intech    | investor | everything |

</Route>

## 摩点

### 众筹

<Route author="nczitzk" example="/modian/zhongchou" path="/modian/zhongchou/:category?/:sort?/:status?" :paramsDesc="['分类，见下表，默认为全部', '排序，见下表，默认为最新上线', '状态，见下表，默认为全部']">

分类

| 全部  | 游戏    | 动漫     | 出版         | 桌游         |
| --- | ----- | ------ | ---------- | ---------- |
| all | games | comics | publishing | tablegames |

| 卡牌    | 潮玩模型 | 影视         | 音乐    | 活动         |
| ----- | ---- | ---------- | ----- | ---------- |
| cards | toys | film-video | music | activities |

| 设计     | 科技         | 食品   | 爱心通道    | 动物救助    |
| ------ | ---------- | ---- | ------- | ------- |
| design | technology | food | charity | animals |

| 个人愿望   | 其他     |
| ------ | ------ |
| wishes | others |

排序

| 最新上线     | 金额最高      | 评论最多        |
| -------- | --------- | ----------- |
| top_time | top_money | top_comment |

状态

| 全部  | 创意   | 预热      | 众筹中   | 众筹成功    |
| --- | ---- | ------- | ----- | ------- |
| all | idea | preheat | going | success |

</Route>

## 摩根大通研究所

### 新闻

<Route author="howel52" example="/jpmorganchase" path="/jpmorganchase"/>

## 木木博客

### 每天六十秒（60 秒）读懂世界

<Route author="Fatpandac" example="/liulinblog/kuaixun" path="/liulinblog/kuaixun"/>

### 科技新闻

<Route author="Fatpandac" example="/liulinblog/itnews/seo" path="/liulinblog/itnews/:channel?" :paramsDesc="['频道，默认为互联网早报']">

|   互联网早报  | 站长圈 |
| :------: | :-: |
| internet | seo |

</Route>

## 鸟哥笔记

### 首页

<Route author="WenryXu" example="/ngbj" path="/ngbj"/>

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
| -- | ---- | ---- | --- | -- | --- | --- | ---- |
| 0  | 7    | 10   | 9   | 98 | 70  | 8   | 72   |

</Route>

## 品玩

### 实时要闻

<Route author="sanmmm" example="/pingwest/status" path="/pingwest/status"/>

### 话题动态

<Route author="sanmmm" path="/pingwest/tag/:tag/:type" example="/pingwest/tag/ChinaJoy/1" :paramsDesc="['话题名或话题id, 可从话题页url中得到', '内容类型']">

内容类型

| 最新 | 最热 |
| -- | -- |
| 1  | 2  |

</Route>

### 用户

<Route author="sanmmm" path="/pingwest/user/:uid/:type?" example="/pingwest/user/7781550877/article" :paramsDesc="['用户id, 可从用户主页中得到', '内容类型, 默认为`article`']">

内容类型

| 文章      | 动态    |
| ------- | ----- |
| article | state |

</Route>

## 求是网

### 分类

<Route author="nczitzk" example="/qstheory" path="/qstheory/:category?" :paramsDesc="['分类，见下表']">

| 网评   | 视频   | 原创     | 经济      | 政治       | 文化      | 社会      | 党建  | 科教      | 生态      | 国防      | 国际            | 图书    | 学习笔记 |
| ---- | ---- | ------ | ------- | -------- | ------- | ------- | --- | ------- | ------- | ------- | ------------- | ----- | ---- |
| qswp | qssp | qslgxd | economy | politics | culture | society | cpc | science | zoology | defense | international | books | xxbj |

</Route>

## 趨勢科技防詐達人

### 最新詐騙情報

<Route author="nczitzk" example="/getdr" path="/getdr"/>

## 趣头条

### 分类

<Route author="alphardex LogicJake" example="/qutoutiao/category/1" path="/qutoutiao/category/:cid" :paramsDesc="['分类 id']">

| 推荐  | 热点 | 娱乐 | 健康 | 养生 | 励志 | 科技 | ... |
| --- | -- | -- | -- | -- | -- | -- | --- |
| 255 | 1  | 6  | 42 | 5  | 4  | 7  | ... |

更多的 cid 可通过访问[官网](http://home.qutoutiao.net)切换分类，观察 url 获得。

</Route>

## 全国港澳研究会

### 分类

<Route author="nczitzk" example="/cahkms" path="/cahkms/:category?" :paramsDesc="['分类，见下表，默认为重要新闻']">

| 关于我们 | 港澳新闻 | 重要新闻 | 顾问点评、会员观点 | 专题汇总 |
| ---- | ---- | ---- | --------- | ---- |
| 01   | 02   | 03   | 04        | 05   |

| 港澳时评 | 图片新闻 | 视频中心 | 港澳研究 | 最新书讯 | 研究资讯 |
| ---- | ---- | ---- | ---- | ---- | ---- |
| 06   | 07   | 08   | 09   | 10   | 11   |

</Route>

## 全民健康网

<Route author="nczitzk" example="/qm120/news" path="/qm120/news/:category?" :paramsDesc="['分类，见下表，默认为健康焦点']">

| 健康焦点 | 行业动态 | 医学前沿 | 法规动态 |
| ---- | ---- | ---- | ---- |
| jdxw | hydt | yxqy | fgdt |

| 食品安全 | 医疗事故 | 医药会展 | 医药信息 |
| ---- | ---- | ---- | ---- |
| spaq | ylsg | yyhz | yyxx |

| 新闻专题    | 行业新闻 |
| ------- | ---- |
| zhuanti | xyxw |

</Route>

## 全球化智库

### 分类

<Route author="nczitzk" example="/ccg" path="/ccg/:category?" :paramsDesc="['分类，见下表']">

| 新闻动态 | 媒体报道 | 观点   |
| ---- | ---- | ---- |
| news | mtbd | view |

</Route>

## 全现在

### 首页

<Route author="nczitzk" example="/allnow" path="/allnow"/>

### 专栏

<Route author="nczitzk" example="/allnow/column/199" path="/allnow/column/:id" :paramsDesc="['专栏 id']"/>

### 话题

<Route author="nczitzk" example="/allnow/tag/678" path="/allnow/tag/:id" :paramsDesc="['话题 id']"/>

### 用户

<Route author="nczitzk" example="/allnow/user/1891141" path="/allnow/user/:id" :paramsDesc="['用户 id']"/>

## 人民论坛网

### 思想理论

<Route author="nczitzk" example="/rmlt/idea" path="/rmlt/idea/:category?" :paramsDesc="['分类，见下表，默认为首页']">

| 首页 | 独家连线       | 深度原创       | 中外思潮   | 时事洞察    |
| -- | ---------- | ---------- | ------ | ------- |
|    | connection | yuanchuang | sichao | dongcha |

| 中国声音     | 全球观察    | 思想名人堂       | 学术人生   |
| -------- | ------- | ----------- | ------ |
| shengyin | guancha | mingrentang | xueshu |

| 前沿理论  | 比较研究   |
| ----- | ------ |
| lilun | yanjiu |

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

### 最新文章

<Route author="Director-0428" example="/woshipm/latest" path="/woshipm/latest"/>

## 软餐

### 首页

<Route author="nczitzk" example="/ruancan" path="/ruancan"/>

### 分类

<Route author="nczitzk" example="/ruancan/sort/news" path="/ruancan/sort/:sort" :paramsDesc="['分类 id，可在对应分类页 URL 中找到']"/>

### 标签

<Route author="nczitzk" example="/ruancan/tag/oxygenos" path="/ruancan/tag/:tag" :paramsDesc="['标签 id，可在对应标签页 URL 中找到']"/>

### 搜索

<Route author="nczitzk" example="/ruancan/search/ColorOS" path="/ruancan/search/:keyword?" :paramsDesc="['关键字，默认为空']"/>

## 上下游 News\&Market

### 分類

<Route author="nczitzk" example="/newsmarket" path="/newsmarket/:category?" :paramsDesc="['分类，见下表，默认为首页']">

| 時事。政策       | 食安          | 新知        | 愛地方          | 種好田          | 好吃。好玩         |
| ----------- | ----------- | --------- | ------------ | ------------ | ------------- |
| news-policy | food-safety | knowledge | country-life | good-farming | good-food-fun |

| 食農教育           | 人物                 | 漁業。畜牧                | 綠生活。國際              | 評論      |
| -------------- | ------------------ | -------------------- | ------------------- | ------- |
| food-education | people-and-history | raising-and-breeding | living-green-travel | opinion |

</Route>

## 少数派 sspai

### 首页

<Route author="HenryQW" example="/sspai/index" path="/sspai/index" radar="1">

</Route>

### 最新上架付费专栏

<Route author="HenryQW" example="/sspai/series" path="/sspai/series" radar="1">

> 少数派专栏需要付费订阅，RSS 仅做更新提醒，不含付费内容.

</Route>

### 付费专栏文章更新

<Route author="TonyRL" example="/sspai/series/77" path="/sspai/series/:id" :paramsDesc="['专栏 id']" radar="1" />

### Shortcuts Gallery

<Route author="Andiedie" example="/sspai/shortcuts" path="/sspai/shortcuts" radar="1"/>

### Matrix

<Route author="feigaoxyz" example="/sspai/matrix" path="/sspai/matrix" radar="1"/>

### 专栏

<Route author="LogicJake" example="/sspai/column/262" path="/sspai/column/:id"  :paramsDesc="['专栏 id']" radar="1"/>

### 作者

<Route author="SunShinenny hoilc" example="/sspai/author/796518" path="/sspai/author/:id"  :paramsDesc="['作者 slug 或 id，slug 可在作者主页URL中找到，id 不易查找，仅作兼容']" radar="1"/>

### 作者动态

<Route author="umm233" example="/sspai/activity/d0u947vr" path="/sspai/activity/:slug"  :paramsDesc="['作者 slug，可在作者主页URL中找到']" radar="1"/>

### 专题

<Route author="SunShinenny" example="/sspai/topics" path="/sspai/topics" radar="1">

此为专题广场更新提示 => 集合型而非单篇文章。与下方 "专题内文章更新" 存在明显区别！

</Route>

### 专题内文章更新

<Route author="SunShinenny" example="/sspai/topic/250" path="/sspai/topic/:id"  :paramsDesc="['专题 id，可在专题主页URL中找到']" radar="1"/>

### 标签订阅

<Route author="Jeason0228" example="/sspai/tag/apple" path="/sspai/tag/:keyword" :paramsDesc="['关键词']" radar="1"/>

## 深潮 TechFlow

### 分类

<Route author="nczitzk" example="/techflow520" path="/techflow520/:category?" :paramsDesc="['分类，见下表，默认为头条']">

| 头条 | 元宇宙 | 项目 | DeFi | 矿业 | 隐私计算 | 碳中和 | 活动 | NFT | 产业 |
| -- | --- | -- | ---- | -- | ---- | --- | -- | --- | -- |

</Route>

### 快讯

<Route author="nczitzk" example="/techflow520/newsflash" path="/techflow520/newsflash"/>

## 深焦

### 分类

<Route author="nczitzk" example="/filmdeepfocus" path="/filmdeepfocus/:category?" :paramsDesc="['分类，见下表，默认为影评']">

| 影评   | 影人         | 特别策划       | 专访         | 书评         |
| ---- | ---------- | ---------- | ---------- | ---------- |
| page | new-page-3 | new-page-2 | new-page-4 | new-page-1 |

</Route>

## 深圳新闻网

### 深圳市政府新闻发布厅

<Route author="nczitzk" example="/sznews/press" path="/sznews/press"/>

### 排行榜

<Route author="nczitzk" example="/sznews/ranking" path="/sznews/ranking"/>

## 生命时报

### 栏目

<Route author="nczitzk" example="/lifetimes" path="/lifetimes/:category?" :paramsDesc="['栏目，见下表，默认为新闻']">

| 新闻   | 医药       | 养生              | 生活   | 母亲行动    | 长寿        | 视频    | 时评           | 调查      | 产业经济     |
| ---- | -------- | --------------- | ---- | ------- | --------- | ----- | ------------ | ------- | -------- |
| news | medicine | healthpromotion | life | mothers | longevity | video | news-comment | hotspot | industry |

</Route>

## 生物谷

### 最新资讯

<Route author="nczitzk" example="/bioon/latest" path="/bioon/latest"/>

## 生物探索

### 频道

<Route author="aidistan" example="/biodiscover" path="/biodiscover/:channel" :paramsDesc="['频道，见下表']">

| 最新研究     | 人物访谈      | 产业动态     | 活动发布     |
| -------- | --------- | -------- | -------- |
| reaseach | interview | industry | activity |

</Route>

## 时刻新闻

### 新闻

<Route author="linbuxiao" example="/timednews/news" path="/timednews/news/:type?" :paramsDesc="['子分类，见下表，默认为全部']">

子分类

| 全部  | 时政             | 财经      | 科技         | 社会     | 体娱     | 国际            | 美国  | 中国 | 欧洲     | 评论       |
| --- | -------------- | ------- | ---------- | ------ | ------ | ------------- | --- | -- | ------ | -------- |
| all | currentAffairs | finance | technology | social | sports | international | usa | cn | europe | comments |

</Route>

## 时事一点通

### 资讯

<Route author="nczitzk" example="/ssydt/article" path="/ssydt/article/:id?" :paramsDesc="['id，见下表，默认为推荐']">

| 推荐 | 时事日报 | 时事专题 | 备考技巧 | 招考信息 | 时事月报 | 重要会议 | 领导讲话 | 时事周刊 | 官网公告 | 时事评论 |
| -- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 0  | 3    | 6    | 13   | 12   | 4    | 10   | 11   | 5    | 8    | 7    |

</Route>

## 识媒体

### 频道

<Route author="Fatpandac" example="/knowmedia/jqgx" path="/knowmedia/:category?" :paramsDesc="['分类，见下表，默认为近期更新']">

分类

| 近期更新 | 精选专栏 | 活动讯息 | 影音专区 |
| :--: | :--: | :--: | :--: |
| jqgx | jxzl | hdxx | yyzq |

</Route>

## 数英网

### 数英网最新文章

<Route author="occupy5" example="/digitaling/index" path="/digitaling/index" :paramsDesc="['首页最新文章, 数英网']" />

### 数英网文章专题

<Route author="occupy5" example="/digitaling/articles/latest" path="/digitaling/articles/:category/:subcate?" :paramsDesc="['文章专题分类 ','hot分类下的子类']" />

| 最新文章   | 头条       | 热文  | 精选     |
| ------ | -------- | --- | ------ |
| latest | headline | hot | choice |

分类`hot`下的子类

| 近期热门文章 | 近期最多收藏   | 近期最多赞 |
| ------ | -------- | ----- |
| views  | collects | zan   |

### 数英网项目专题

<Route author="occupy5" example="/digitaling/projects/all" path="/digitaling/projects/:category" :paramsDesc="['项目专题分类 ']" />

| 全部  | 每周项目精选 | 每月项目精选  | 海外项目精选        | 近期热门项目 | 近期最多收藏   |
| --- | ------ | ------- | ------------- | ------ | -------- |
| all | weekly | monthly | international | hot    | favorite |

## 水果派

### 首页

<Route author="nczitzk" example="/shuiguopai" path="/shuiguopai" />

## 搜狐号

### 更新

<Route author="HenryQW" example="/sohu/mp/119097" path="/sohu/mp/:id" :paramsDesc="['搜狐号 ID', '见如下说明']">

1.  通过浏览器搜索相关搜狐号 `果壳 site: mp.sohu.com`。
2.  通过浏览器控制台执行 `contentData.mkey`，返回的即为搜狐号 ID。

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

## 腾讯研究院

### 最近更新

<Route author="Fatpandac" example="/tisi/latest" path="/tisi/latest"/>

## 通識・現代中國

### 議題熱話

<Route author="nczitzk" example="/chiculture/topic" path="/chiculture/topic/:category?" :paramsDesc="['分类，见下表，默认为全部']">

| 全部 | 現代中國 | 今日香港 | 全球化 | 一周時事通識 |
| -- | ---- | ---- | --- | ------ |
|    | 76   | 479  | 480 | 379    |

</Route>

## 投中网

### 分类

<Route author="yunxinliu-alex" example="/chinaventure/news/78" path="/chinaventure/news/:id?" :paramsDesc="['分类，见下表，默认为推荐']">

| 推荐 | 商业深度 | 资本市场 | 5G | 健康  | 教育  | 地产  | 金融  | 硬科技 | 新消费 |
| -- | ---- | ---- | -- | --- | --- | --- | --- | --- | --- |
|    | 78   | 80   | 83 | 111 | 110 | 112 | 113 | 114 | 116 |

</Route>

## 推酷

### 周刊

<Route author="zpcc" example="/tuicool/mags/tech" path="/tuicool/mags/:type" :paramsDesc="['类型如下']">

| 编程狂人 | 设计匠艺   | 创业周刊    | 科技周刊 |
| ---- | ------ | ------- | ---- |
| prog | design | startup | tech |

</Route>

## 歪脑 wainao.me

### 所有文章

<Route author="shuiRong" example="/wainao-reads/all-articles" path="/wainao-reads/all-articles" />

## 晚点 LatePost

### 报道

<Route author="HaitianLiu nczitzk" example="/latepost" path="/latepost/:proma?" :paramsDesc="['栏目 id，见下表，默认为最新报道']">

| 最新报道 | 晚点独家 | 人物访谈 | 晚点早知道 | 长报道 |
| ---- | ---- | ---- | ----- | --- |
|      | 1    | 2    | 3     | 4   |

</Route>

## 万联网

### 资讯

<Route author="kt286" example="/10000link/news/My01" path="/10000link/news/:category?" :paramsDesc="['栏目代码, 默认为全部']">

| 全部  | 天下大势 | 企业动态 | 专家观点 | 研究报告 |
| --- | ---- | ---- | ---- | ---- |
| (空) | My01 | My02 | My03 | My04 |

</Route>

## 网易独家

### 栏目

<Route author="nczitzk" example="/netease/exclusive/qsyk" path="/netease/exclusive/:id?" :paramsDesc="['栏目, 默认为首页']">

| 分类   | 编号   |
| ---- | ---- |
| 首页   |      |
| 轻松一刻 | qsyk |
| 槽值   | cz   |
| 人间   | rj   |
| 大国小民 | dgxm |
| 三三有梗 | ssyg |
| 数读   | sd   |
| 看客   | kk   |
| 下划线  | xhx  |
| 谈心社  | txs  |
| 哒哒   | dd   |
| 胖编怪聊 | pbgl |
| 曲一刀  | qyd  |
| 今日之声 | jrzs |
| 浪潮   | lc   |
| 沸点   | fd   |

</Route>

## 网易号

### 更新

<Route author="HendricksZheng" example="/netease/dy/W4983108759592548559" path="/netease/dy/:id" :paramsDesc="['网易号 ID', '见如下说明']">

1.  在[网易号搜索页面](https://dy.163.com/v2/media/tosearch.html) 搜索想要订阅的网易号。
2.  打开网易号的任意文章。
3.  查看源代码，搜索 `data-wemediaid`，查看紧随其后的引号内的属性值（类似 `W1966190042455428950`）即为网易号 ID。

</Route>

## 网易号（通用）

<Route author="mjysci" example="/netease/dy2/T1555591616739" path="/netease/dy2/:id" :paramsDesc="['id，该网易号主页网址最后一项html的文件名']" anticrawler="1"/>

优先使用方法一，若是网易号搜索页面搜不到的小众网易号（文章页面不含`data-wemediaid`）则可使用此法。
触发反爬会只抓取到标题，建议自建。

## 网易新闻

::: warning 注意

若视频因防盗链而无法播放，请参考 [通用参数 -> 多媒体处理](/parameter.html#duo-mei-ti-chu-li) 配置 `multimedia_hotlink_template` **或** `wrap_multimedia_in_iframe`。

:::

### 今日关注

<Route author="nczitzk" example="/netease/today" path="/netease/today/:need_content?" :paramsDesc="['需要获取全文，填写 true/yes 表示需要，默认需要']">

::: tip 提示

参数 **需要获取全文** 设置为 `true` `yes` `t` `y` 等值后，RSS 会携带该新闻条目的对应全文。

:::

</Route>

### 排行榜

<Route author="nczitzk" example="/netease/news/rank/whole/click/day" path="/netease/news/rank/:category?/:type?/:time?" :paramsDesc="['新闻分类，参见下表，默认为“全站”','排行榜类型，“点击榜”对应`click`，“跟贴榜”对应`follow`，默认为“点击榜”','统计时间，“1小时”对应`hour`，“24小时”对应`day`，“本周”对应`week`，“本月”对应`month`，默认为“24小时”']">

::: tip 提示

全站新闻 **点击榜** 的统计时间仅包含 “24 小时”、“本周”、“本月”，不包含 “1 小时”。即可用的`time`参数为`day`、`week`、`month`。

其他分类 **点击榜** 的统计时间仅包含 “1 小时”、“24 小时”、“本周”。即可用的`time`参数为`hour`、`day`、`week`。

而所有分类（包括全站）的 **跟贴榜** 的统计时间皆仅包含 “24 小时”、“本周”、“本月”。即可用的`time`参数为`day`、`week`、`month`。

:::

新闻分类：

| 全站    | 新闻   | 娱乐            | 体育     | 财经    | 科技   | 汽车   | 女人   | 房产    | 游戏   | 旅游     | 教育  |
| ----- | ---- | ------------- | ------ | ----- | ---- | ---- | ---- | ----- | ---- | ------ | --- |
| whole | news | entertainment | sports | money | tech | auto | lady | house | game | travel | edu |

</Route>

### 专栏

<Route author="Solist-X" example="/netease/news/special/1" path="/netease/news/special/:type?" :paramsDesc="['栏目']">

| 轻松一刻 | 槽值 | 人间 | 大国小民 | 三三有梗 | 数读 | 看客 | 下划线 | 谈心社 | 哒哒 | 胖编怪聊 | 曲一刀 | 今日之声 | 浪潮 | 沸点 |
| ---- | -- | -- | ---- | ---- | -- | -- | --- | --- | -- | ---- | --- | ---- | -- | -- |
| 1    | 2  | 3  | 4    | 5    | 6  | 7  | 8   | 9   | 10 | 11   | 12  | 13   | 14 | 15 |

</Route>

### 人间

<Route author="nczitzk" example="/netease/renjian/texie" path="/netease/renjian/:category?" :paramsDesc="['分类，见下表，默认为特写']">

| 特写    | 记事    | 大写    | 好读    | 看客    |
| ----- | ----- | ----- | ----- | ----- |
| texie | jishi | daxie | haodu | kanke |

</Route>

## 網路天文館

### 天象預報

<Route author="nczitzk" example="/tam/forecast" path="/tam/forecast"/>

## 微信

::: tip 提示

公众号直接抓取困难，故目前提供几种间接抓取方案，请自行选择

:::

### 公众号（wemp.app 来源）

<Route author="HenryQW" example="/wechat/wemp/36836fbe-bdec-4758-8967-7cc82722952d" path="/wechat/wemp/:id" :paramsDesc="['wemp 公众号 id, 可在搜索引擎使用 `site:wemp.app` 搜索公众号（例如: 人民日报 site:wemp.app), 打开公众号页, 在 URL 中找到 id']" anticrawler="1"/>

### 公众号（CareerEngine 来源）

<Route author="HenryQW" example="/wechat/ce/595a5b14d7164e53908f1606" path="/wechat/ce/:id" :paramsDesc="['公众号 id, 在 [CareerEngine](https://search.careerengine.us/) 搜索公众号，通过 URL 中找到对应的公众号 id']" anticrawler="1"/>

### 公众号（Telegram 频道来源）

<Route author="LogicJake Rongronggg9" example="/wechat/tgchannel/lifeweek" path="/wechat/tgchannel/:id/:mpName?/:searchQueryType?" :paramsDesc="['公众号绑定频道 id', '欲筛选的公众号全名（URL-encoded, 精确匹配），在频道订阅了多个公众号时可选用', '搜索查询类型，见下表']">

| 搜索查询类型 | 将使用的搜索关键字 |            适用于           |
| :----: | :-------: | :----------------------: |
|   `0`  |   (禁用搜索)  |         所有情况 (默认)        |
|   `1`  |   公众号全名   | 未启用 efb-patch-middleware |
|   `2`  |   #公众号全名  | 已启用 efb-patch-middleware |

::: tip 提示

启用搜索有助于在订阅了过多公众号的频道里有效筛选，不易因为大量公众号同时推送导致一些公众号消息被遗漏，但必须正确选择搜索查询类型，否则会搜索失败。

:::

::: warning 注意

该方法需要通过 efb 进行频道绑定，具体操作见<https://github.com/DIYgod/RSSHub/issues/2172>

:::

</Route>

### 公众号 (优读来源)

<Route author="kt286" example="/wechat/uread/shensing" path="/wechat/uread/:userid" :paramsDesc="['公众号的微信号, 可在 微信-公众号-更多资料 中找到。并不是所有的都支持，能不能用随缘']"/>

### 公众号 (二十次幂来源)

<Route author="sanmmm" example="/wechat/ershicimi/813oxJOl" path="/wechat/ershicimi/:id" :paramsDesc="['公众号id, 打开公众号页, 在 URL 中找到 id']" anticrawler="1"/>

### 公众号 (微阅读来源)

<Route author="Rongronggg9" example="/wechat/data258/gh_cbbad4c1d33c" path="/data258/:id?" :paramsDesc="['公众号 id 或分类 id，可在公众号页或分类页 URL 中找到；若略去，则抓取首页']" anticrawler="1" radar="1" rssbud="1" selfhost="1">

::: warning 注意

由于使用了一些针对反爬的缓解措施，本路由响应较慢。默认只抓取前 5 条，可通过 `?limit=` 改变（不推荐，容易被反爬）。\
该网站使用 IP 甄别访客，且应用严格的每日阅读量限额 (约 15 次)，请自建并确保正确配置缓存；如使用内存缓存而非 Redis 缓存，请增大缓存容量。该限额足够订阅至少 3 个公众号 (假设公众号每日仅更新一次)；首页 / 分类页更新相当频繁，不推荐订阅。

:::

</Route>

### 公众号 (wxnmh.com 来源)

<Route author="laampui" example="/wechat/wxnmh/51798" path="/wechat/wxnmh/:id" :paramsDesc="['公众号 id, 打开 wxnmh.com, 在 URL 中找到 id']" anticrawler="1"/>

### 公众号 (wechat-feeds 来源)

::: warning 注意

wechat-feeds 来源[已停止更新](https://github.com/hellodword/wechat-feeds/issues/3882)，历史文章可以正常订阅阅读

:::

<Route author="tylinux" example="/wechat/feeds/MzIwMzAwMzQxNw==" path="/wechat/feeds/:id" :paramsDesc="['公众号 id, 打开 `https://wechat.privacyhide.com/`, 在选定公众号的订阅 URL 中找到 id, 不包含最后的 .xml']"/>

### 公众号 (feeddd 来源)

<Route author="TonyRL Rongronggg9" example="/wechat/feeddd/6131e1441269c358aa0e2141" path="/wechat/feeddd/:id" :paramsDesc="['公众号 id, 打开 `https://feeddd.org/feeds` 或 `https://cdn.jsdelivr.net/gh/feeddd/feeds/feeds_all_rss.txt`, 在 URL 中找到 id; 注意不是公众号页的 id, 而是订阅的 id']"/>

### 公众号 (公众号 360 来源)

见 [#公众号 360](#gong-zhong-hao-360)

### 公众号栏目 (非推送 & 历史消息)

<Route author="MisteryMonster" example="/wechat/mp/homepage/MzA3MDM3NjE5NQ==/16" path="/wechat/mp/homepage/:biz/:hid/:cid?" :paramsDesc="['公众号id', '分页id', '页内栏目']" radar="1" rssbud="1" anticrawler="1">

只适用拥有首页模板 (分享链接带有 homepage) 的公众号。例如从公众号分享出来的链接为 <https://mp.weixin.qq.com/mp/homepage?__biz=MzA3MDM3NjE5NQ==&hid=4>，`biz` 为 `MzA3MDM3NjE5NQ==`，`hid` 为 `4`。

有些页面里会有分栏， `cid` 可以通过元素选择器选中栏目查看`data-index`。如[链接](https://mp.weixin.qq.com/mp/homepage?\__biz=MzA3MDM3NjE5NQ==\&hid=4)里的 `京都职人` 栏目的 `cid` 为 `0`，`文艺时光` 栏目的 `cid` 为 `2`。如果不清楚的话最左边的栏目为`0`，其右方栏目依次递增 `1`。

</Route>

### 公众号文章话题 Tag

<Route author="MisteryMonster" example="/wechat/mp/msgalbum/MzA3MDM3NjE5NQ==/1375870284640911361" path="/wechat/mp/msgalbum/:biz/:aid" :paramsDesc="['公众号id', 'Tag id', ]" radar="1" rssbud="1" anticrawler="1">

一些公众号（如看理想）会在微信文章里添加 Tag ，点入 Tag 的链接如 <https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzA3MDM3NjE5NQ==&action=getalbum&album_id=1375870284640911361>，其中`biz` 为 `MzA3MDM3NjE5NQ==`，`aid` 为 `1375870284640911361`。

</Route>

## 维基百科

### 中国大陆新闻动态

<Route author="HenryQW" example="/wikipedia/mainland" path="/wikipedia/mainland"/>

## 维基新闻

### 最新新闻

根据维基新闻的[sitemap](https://zh.wikinews.org/wiki/Special:%E6%96%B0%E9%97%BB%E8%AE%A2%E9%98%85)获取新闻全文。目前仅支持中文维基新闻。 <Route author="KotoriK" example="/wikinews/latest" path="/wikinews/latest"/>

## 未名新闻

### 分类

<Route author="nczitzk" example="/mitbbs" path="/mitbbs/:caty?" :paramsDesc="['新闻分类，参见下表，默认为“新闻大杂烩”']">

| 新闻大杂烩 | 军事       | 国际     | 体育   | 娱乐   | 科技   | 财经      |
| ----- | -------- | ------ | ---- | ---- | ---- | ------- |
|       | zhongguo | haiwai | tiyu | yule | keji | caijing |

</Route>

## 沃草

### 文件列表

<Route author="nczitzk" example="/watchout" path="/watchout"/>

## 乌有之乡

### 栏目

<Route author="nczitzk" example="/wyzxwk/article/shushe" path="/wyzxwk/article/:id?" :paramsDesc="['栏目 id，可在栏目页 URL 中找到，默认为时代观察']">

时政

| 时代观察   | 舆论战争  |
| ------ | ----- |
| shidai | yulun |

经济

| 经济视点   | 社会民生   | 三农关注    | 产业研究   |
| ------ | ------ | ------- | ------ |
| jingji | shehui | sannong | chanye |

国际

| 国际纵横  | 国防外交    |
| ----- | ------- |
| guoji | guofang |

思潮

| 理想之旅    | 思潮碰撞   | 文艺新生  | 读书交流   |
| ------- | ------ | ----- | ------ |
| lixiang | sichao | wenyi | shushe |

历史

| 历史视野  | 中华文化     | 中华医药    | 共产党人  |
| ----- | -------- | ------- | ----- |
| lishi | zhonghua | zhongyi | cpers |

争鸣

| 风华正茂     | 工农之声     | 网友杂谈  | 网友时评    |
| -------- | -------- | ----- | ------- |
| qingnian | gongnong | zatan | shiping |

活动

| 乌有公告    | 红色旅游  | 乌有讲堂      | 书画欣赏   |
| ------- | ----- | --------- | ------ |
| gonggao | lvyou | jiangtang | shuhua |

</Route>

## 无产者评论

### 分类

<Route author="nczitzk" example="/proletar" path="/proletar/categories/:id?" :paramsDesc="['分类，见下表，默认为全部文章']">

| 全部文章 | 中流击水 | 革命文艺 | 当代中国 | 理论视野 | 国际观察 | 史海沉钩 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- |
|      | 中流击水 | 革命文艺 | 当代中国 | 理论视野 | 国际观察 | 史海沉钩 |

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
| ---- | -- | -- | -- |
| (空)  | ms | qg | qz |

</Route>

## 香港高登

### 頻道

<Route author="nczitzk" example="/hkgolden/BW" path="/hkgolden/:id?/:limit?/:sort?" :paramsDesc="['頻道，见下表，默认为吹水台，可在对应频道页的 URL 中找到', '類型，见下表，默认为全部', '排序，见下表，默认为最後回應時間']">

頻道

| 吹水台 | 高登熱 | 最新 | 時事台 | 娛樂台 |
| --- | --- | -- | --- | --- |
| BW  | HT  | NW | CA  | ET  |

| 體育台 | 財經台 | 學術台 | 講故台 | 創意台 |
| --- | --- | --- | --- | --- |
| SP  | FN  | ST  | SY  | EP  |

| 硬件台 | 電訊台 | 軟件台 | 手機台 | Apps 台 |
| --- | --- | --- | --- | ------ |
| HW  | IN  | SW  | MP  | AP     |

| 遊戲台 | 飲食台 | 旅遊台 | 潮流台 | 動漫台 |
| --- | --- | --- | --- | --- |
| GM  | ED  | TR  | CO  | AN  |

| 玩具台 | 音樂台 | 影視台 | 攝影台 | 汽車台 |
| --- | --- | --- | --- | --- |
| TO  | MU  | VI  | DC  | TS  |

| 上班台 | 感情台 | 校園台 | 親子台 | 寵物台 |
| --- | --- | --- | --- | --- |
| WK  | LV  | SC  | BB  | PT  |

| 站務台 | 電台 | 活動台 | 買賣台 | 直播台 | 成人台 | 考古台 |
| --- | -- | --- | --- | --- | --- | --- |
| MB  | RA | AC  | BS  | JT  | AU  | OP  |

排序

| 最後回應時間 | 發表時間 | 熱門 |
| ------ | ---- | -- |
| 0      | 1    | 2  |

類型

| 全部 | 正式 | 公海 |
| -- | -- | -- |
| -1 | 1  | 0  |

</Route>

## 香港討論區

### 版塊

<Route author="nczitzk" example="/discuss/62" path="/discuss/:fid" :paramsDesc="['fid，可在对应板块页的 URL 中找到']"/>

## 香水时代

### 首页

<Route author="kt286" example="/nosetime/home" path="/nosetime/home"/>

### 香评

<Route author="kt286" example="/nosetime/59247733/discuss/new" path="/nosetime/:id/:type/:sort?" :paramsDesc="['用户id，可在用户主页 URL 中找到', '类型，short 一句话香评  discuss 香评', '排序， new 最新  agree 最有用']"/>

## 橡树岭国家实验室

### 新闻

<Route author="nczitzk" example="/ornl/news" path="/ornl/news"/>

## 消费者委员会

### 文章

<Route author="nczitzk" example="/consumer" path="/consumer/:category?/:language?/:keyword?" :paramsDesc="['分类，见下表，默认为測試及調查', '语言，见下表，默认为繁体中文', '关键字，默认为空']">

分类

| 测试及调查 | 生活资讯 | 投诉实录      | 议题评论  |
| ----- | ---- | --------- | ----- |
| test  | life | complaint | topic |

语言

| 简体中文 | 繁体中文 |
| ---- | ---- |
| sc   | tc   |

</Route>

## 小刀娱乐网

<Route author="nczitzk" example="/x6d/34" path="/x6d/:id?" :paramsDesc="['分类 id，可在对应分类页面的 URL 中找到，默认为首页最近更新']">

| 技巧分享 | QQ 技巧 | 微信技巧 | 其他教程 | 其他分享 |
| ---- | ----- | ---- | ---- | ---- |
| 31   | 55    | 112  | 33   | 88   |

| 宅家自学 | 健身养生 | 摄影剪辑 | 长点知识 | 自我提升 | 两性相关 | 编程办公 | 职场关系 | 新媒体运营 | 其他教程 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ----- | ---- |
| 18   | 98   | 94   | 93   | 99   | 100  | 21   | 22   | 19    | 44   |

| 活动线报 | 流量话费 | 免费会员 | 实物活动 | 游戏活动 | 红包活动 | 空间域名 | 其他活动 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 34   | 35   | 91   | 92   | 39   | 38   | 37   | 36   |

| 值得一看 | 找点乐子 | 热门事件 | 节目推荐 |
| ---- | ---- | ---- | ---- |
| 65   | 50   | 77   | 101  |

| 值得一听 | 每日一听 | 歌单推荐 |
| ---- | ---- | ---- |
| 71   | 87   | 79   |

| 资源宝库 | 书籍资料 | 设计资源 | 剪辑资源 | 办公资源 | 壁纸资源 | 编程资源 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 106  | 107  | 108  | 109  | 110  | 111  | 113  |

</Route>

## 小专栏

### 专栏

<Route author="TonyRL" example="/xiaozhuanlan/column/olddriver-selection" path="/xiaozhuanlan/column/:id" :paramsDesc="['专栏 ID，可在专栏页 URL 中找到']" radar="1" rssbud="1" />

## 辛華社

### 首页

<Route author="nczitzk" example="/hotchina" path="/hotchina"/>

### 分类

<Route author="nczitzk" example="/hotchina" path="/hotchina/category/:id?" :paramsDesc="['分类，见下表，默认为首页']">

| 攝徒日記 | 辛華社特約報導 | 小粉紅觀察 | 維權消息 | 讀者投書 | 中國牆內 | 台灣國 | 國際 |
| ---- | ------- | ----- | ---- | ---- | ---- | --- | -- |

</Route>

### 标签

<Route author="nczitzk" example="/hotchina" path="/hotchina/tag/:id?" :paramsDesc="['标签，可在对应标签页的 URL 中找到，默认为首页']">

以下为 Top Tags：

| 辱華 | 小粉紅 | 中國限電 | 徵稿 | 特約報導 | 舔共藝人 | 中共國慶 |
| -- | --- | ---- | -- | ---- | ---- | ---- |

</Route>

## 新华网

### 新华社新闻

<Route author="nczitzk" example="/news/whxw" path="/news/whxw"/>

## 新浪专栏

### 创事记

<Route author="xapool" example="/sina/csj" path="/sina/csj"/>

## 选股宝

### 主题

<Route author="hillerliao" example="/xuangubao/subject/41" path="/xuangubao/subject/:subject_id" :paramsDesc="['主题 id，网址 https://xuangubao.cn/subject/41 中最后的数字']"/>

## 妖火网

<Route author="nczitzk" example="/yaohuo/new" path="/yaohuo/:type?" :paramsDesc="['排序类型，可选 `new` 指最新，`hot` 指最热，默认为 `new`']"/>

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

| 默认      | 最热  | 最新  |
| ------- | --- | --- |
| default | hot | new |

</Route>

## 移动支付网

### 新闻

<Route author="LogicJake genghis-yang" example="/mpaypass/news" path="/mpaypass/news"/>

### 分类

<Route author="zhuan-zhu" example="/mpaypass/main/policy" path="mpaypass/main/:type?"
:paramsDesc="['新闻类型，类型可在URL中找到，类似`policy`，`eye`等，空或其他任意值展示最新新闻']"/>

## 亿欧网

### 资讯

<Route author="WenryXu" example="/iyiou" path="/iyiou"/>

## 异次元软件世界

### 首页

<Route author="kimi360" example="/iplay/home" path="/iplay/home"/>

## 游戏葡萄

### 文章

<Route author="KotoriK nczitzk" example="/gamegrape/13" path="/gamegrape/:id?" :paramsDesc="['分类 id，见下表，默认为全部']">

| 全部 | 深度 | 资讯 | DemoWall | 酷玩 | 海外 | 专栏 | 葡萄观察 |
| -- | -- | -- | -------- | -- | -- | -- | ---- |
|    | 13 | 14 | 15       | 16 | 17 | 18 | 19   |

</Route>

## 有趣天文奇观

### 首页

<Route author="nczitzk" example="/interesting-sky" path="/interesting-sky"/>

### 年度天象（天文年历）

<Route author="nczitzk" example="/interesting-sky/astronomical_events" path="/interesting-sky/astronomical_events/:year?" :paramsDesc="['年份，默认为当前年份']"/>

### 近期事件专题

<Route author="nczitzk" example="/interesting-sky/recent-interesting" path="/interesting-sky/recent-interesting"/>

## 鱼塘热榜

<Route author="TheresaQWQ" example="/mofish/2" path="/mofish/:id" :paramsDesc="['分类id，可以在 https://api.tophub.fun/GetAllType 获取']" />
## 遠見

<Route author="laampui" example="/gvm/index/health" path="/gvm/index/:category?" :paramsDesc="['見下表, 默認爲 newest']">

| 最新文章   | 你可能會喜歡    | 名家專欄    | 專題    | 時事熱點 | 政治       | 社會      | 人物報導   | 國際    | 全球焦點        | 兩岸                    | 金融理財  | 投資理財       | 保險規劃      | 退休理財   | 金融 Fintech | 房地產         | 總體經濟    | 科技   | 科技趨勢       | 能源     | 產經       | 傳產       | 消費服務    | 生技醫藥    | 傳承轉型                       | 創業新創    | 管理         | 農業          | 教育        | 高教               | 技職            | 親子教育   | 國際文教            | 體育     | 好享生活 | 時尚設計 | 心靈成長        | 藝文影視 | 旅遊     | 環境生態        | 健康     | 美食   | 職場生涯   | 調查     | 縣市     | CSR |
| ------ | --------- | ------- | ----- | ---- | -------- | ------- | ------ | ----- | ----------- | --------------------- | ----- | ---------- | --------- | ------ | ---------- | ----------- | ------- | ---- | ---------- | ------ | -------- | -------- | ------- | ------- | -------------------------- | ------- | ---------- | ----------- | --------- | ---------------- | ------------- | ------ | --------------- | ------ | ---- | ---- | ----------- | ---- | ------ | ----------- | ------ | ---- | ------ | ------ | ------ | --- |
| newest | recommend | opinion | topic | news | politics | society | figure | world | world_focus | cross_strait_politics | money | investment | insurance | retire | fintech    | real_estate | economy | tech | tech_trend | energy | business | industry | service | medical | family_business_succession | startup | management | agriculture | education | higher_education | technological | parent | world_education | sports | life | art  | self_growth | film | travel | environment | health | food | career | survey | county | csr |

</Route>

## 云奇网

### 微语简报

<Route author="x2009again" example="/yunspe/newsflash" path="/yunspe/newsflash" />

## 中国纺织经济信息网

### 资讯

<Route author="nczitzk" example="/ctei/news/bwzq" path="/ctei/news/:id?" :paramsDesc="['分类 id，可在分类页的 URL 中找到，默认为本网专区']">

| 要闻     | 国内       | 国际       | 企业      | 品牌    | 外贸    | 政策     | 科技         | 流行      | 服装      | 家纺      |
| ------ | -------- | -------- | ------- | ----- | ----- | ------ | ---------- | ------- | ------- | ------- |
| newsyw | domestic | internal | company | brand | trade | policy | Technology | fashion | apparel | hometex |

</Route>

## 中国工人出版社

### 新闻中心

<Route author="nczitzk" example="/wp-china/news" path="/wp-china/news/:category?" :paramsDesc="['分类，见下表，默认为最新资讯']">

| 最新资讯   | 专题报道    |
| ------ | ------- |
| latest | stories |

</Route>

## 中国机械工程学会

### 学会新闻

<Route author="nczitzk" example="/cmes/news" path="/cmes/news/:category?" :paramsDesc="['分类，见下表，默认为 学会要闻']">

| 学会要闻        | 学会动态     | 科技新闻     |
| ----------- | -------- | -------- |
| Information | Dynamics | TechNews |

</Route>

## 中国计算机学会

### 新闻

<Route author="nczitzk" example="/ccf/news" path="/ccf/news/:category?" :paramsDesc="['分类，见下表，默认为 CCF 新闻']">

| CCF 新闻     | CCF 聚焦 | ACM 信息   |
| ---------- | ------ | -------- |
| Media_list | Focus  | ACM_News |

</Route>

## 中国科学院青年创新促进会

### 最新博文

<Route author="nczitzk" example="/yicas/blog" path="/yicas/blog"/>

## 中国劳工观察

### 调查报告

<Route author="nczitzk" example="/chinalaborwatch/reports" path="/chinalaborwatch/reports/:lang?/:industry?" :paramsDesc="['语言，默认为英语，可选 `cn` 即 简体中文', '行业 id，见下表，默认为全部']">

| 全部 | 制鞋 | 印刷 | 厨具 | 家具 | 服饰 | 汽车制造 | 玩具 | 电子产品 | 综合 | 零售 |
| -- | -- | -- | -- | -- | -- | ---- | -- | ---- | -- | -- |
|    | 2  | 6  | 14 | 3  | 4  | 10   | 8  | 1    | 9  | 7  |

</Route>

## 中国劳工通讯

### 评论与特写

<Route author="nczitzk" example="/clb/commentary" path="/clb/commentary/:lang?" :paramsDesc="['语言，默认为简体中文，可选 `en` 即英文']"/>

## 中国收入分配研究院

### 分类

<Route author="nczitzk" example="/ciidbnu" path="/ciidbnu/:id?" :paramsDesc="['分类 id，可在分类页地址栏 URL 中找到']">

| 社会动态 | 院内新闻 | 学术观点 | 文献书籍 | 工作论文 | 专题讨论 |
| ---- | ---- | ---- | ---- | ---- | ---- |
| 1    | 5    | 3    | 4    | 6    | 8    |

</Route>

## 中国橡胶网

### 新闻资讯

<Route author="nczitzk" example="/cria/news/1" path="/cria/news/:id?" :paramsDesc="['列表 id，可在列表页的 URL 中找到，默认为首页']"/>

## 重构

### 推荐

<Route author="nczitzk" example="/allrecode/recommends" path="/allrecode/recommends" />

### 快讯

<Route author="nczitzk" example="/allrecode/news" path="/allrecode/news" />

### 资讯

<Route author="nczitzk" example="/allrecode/posts" path="/allrecode/:category?" :paramsDesc="['分类，见下表，默认为全部']">

| 分类   | id                 |
| ---- | ------------------ |
| 全部   | posts              |
| NFT  | non-fungible-token |
| DAO  | dao                |
| Web3 | web3               |
| 安全   | security           |
| 政策   | global-policy      |
| 元宇宙  | metaverse          |
| 区块链  | blockchain         |
| 融资新闻 | financing-news     |
| 趋势观察 | trend-observation  |

</Route>

## 眾新聞

### 眾聞

<Route author="nczitzk" example="/hkcnews/news" path="/hkcnews/news/:category?" :paramsDesc="['分类，见下表，默认为全部']">

| 全部 | 經濟 | 社會 | 生活 | 政治 | 國際 | 台灣 | 人物 | 中國 |
| -- | -- | -- | -- | -- | -- | -- | -- | -- |
|    | 13 | 15 | 14 | 12 | 16 | 20 | 21 | 19 |

</Route>

## 珠海网

### 栏目

<Route author="nczitzk" example="/hizu" path="/hizu/:column?" :paramsDesc="['栏目，见下表，默认为热点']">

| 分类    | 编号                       |
| ----- | ------------------------ |
| 热点    | 5dd92265e4b0bf88dd8c1175 |
| 订阅    | 5dd921a7e4b0bf88dd8c116f |
| 学党史   | 604f1cbbe4b0cf5c2234d470 |
| 政经    | 5dd92242e4b0bf88dd8c1174 |
| 合作区   | 61259fd6e4b0d294f7f9786d |
| 名记名播  | 61dfe511e4b0248b60d1c568 |
| 大湾区   | 5dd9222ce4b0bf88dd8c1173 |
| 网评    | 617805e4e4b037abacfd4820 |
| TV 新闻 | 5dd9220de4b0bf88dd8c1172 |
| 音频    | 5e6edd50e4b02ebde0ab061e |
| 澳门    | 600e8ad4e4b02c3a6af6aaa8 |
| 政务    | 600f760fe4b0e33cf6f8e68e |
| 教育    | 5ff7c0fde4b0e2f210d05e20 |
| 深圳    | 5fc88615e4b0e3055e693e0a |
| 中山    | 600e8a93e4b02c3a6af6aa80 |
| 民生    | 5dd921ece4b0bf88dd8c1170 |
| 社区    | 61148184e4b08d3215364396 |
| 专题    | 5dd9215fe4b0bf88dd8c116b |
| 战疫    | 5e2e5107e4b0c14b5d0e3d04 |
| 横琴    | 5f88eaf2e4b0a27cd404e09e |
| 香洲    | 5f86a3f5e4b09d75f99dde7d |
| 金湾    | 5e8c42b4e4b0347c7e5836e0 |
| 斗门    | 5ee70534e4b07b8a779a1ad6 |
| 高新    | 607d37ade4b05c59ac2f3d40 |

</Route>

## 装备前线

### 首页最新帖子

<Route author="Jeason0228" example="/zfrontier/postlist/:byReplyTime" path="/zfrontier/postlist" :paramsDesc="['内容标签, 点击标签后地址栏有显示']"/>

### 子板块帖子

<Route author="c4605" example="/zfrontier/board/56" path="/zfrontier/board/:boardId" :paramsDesc="['板块 ID']"/>

QueryString:

-   `sort`：排序方式

| 根据创建时间（默认） | 根据回复时间      | 根据热度    |
| ---------- | ----------- | ------- |
| byCtime    | byReplyTime | byScore |

## 紫竹张先生

### 全文

<Route author="HenryQW nczitzk" example="/zzz" path="/zzz/:category?/:language?" :paramsDesc="['分类，见下表，默认为全部', '语言，见下表，默认为简体中文']">

分类

| 全部  | 房股财经         | 时事评论          | 每日一见        | 随心杂谈        | 精彩推荐           | 历史新撰         |
| --- | ------------ | ------------- | ----------- | ----------- | -------------- | ------------ |
| all | fangshigushi | shishipinglun | meiriyijian | suixinzatan | jingcaituijian | lishixinzuan |

语言

| 简体中文 | 港澳繁體  | 台灣正體  |
| ---- | ----- | ----- |
|      | zh-hk | zh-tw |

 </Route>
