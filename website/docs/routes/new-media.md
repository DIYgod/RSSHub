# 📱 New media

## 199IT {#199it}

### 首页更新 {#199it-shou-ye-geng-xin}

<Route author="xfangbao" example="/199it" path="/199it" />

### 分类 {#199it-fen-lei}

<Route author="nczitzk" example="/199it/category/199itdata" path="/199it/category/:caty" paramsDesc={['分类，可在分类页 URL 中找到']}>

分类为单一路径，如 `http://www.199it.com/archives/category/199itdata` 则路由为 `/199it/category/199itdata`.

分类包含多重路径，如 `http://www.199it.com/archives/category/emerging/5g` 则替换 `/` 为 `|`，即路由为 `/199it/category/emerging|5g`.

</Route>

### 标签 {#199it-biao-qian}

<Route author="nczitzk" example="/199it/tag/数据早报" path="/199it/tag/:tag" paramsDesc={['标签，可在标签页 URL 中找到']}/>

## 36kr {#36kr}

### 资讯 {#36kr-zi-xun}

<Route author="nczitzk" example="/36kr/information/web_news" path="/36kr/information/:category?" paramsDesc={['资讯分类，见下表，默认为最新']}>

| 最新     | 推荐          | 创投    | 财经 |
| -------- | ------------- | ------- | ---- |
| web_news | web_recommend | contact | ccs  |

| 汽车   | 科技       | 企服              | 生活       |
| ------ | ---------- | ----------------- | ---------- |
| travel | technology | enterpriseservice | happy_life |

| 创新     | 房产        | 职场         | 企业号  | 其他  |
| -------- | ----------- | ------------ | ------- | ----- |
| innovate | real_estate | web_zhichang | qiyehao | other |

</Route>

### 快讯 {#36kr-kuai-xun}

<Route author="hillerliao nczitzk" example="/36kr/newsflashes" path="/36kr/newsflashes" />

### 用户文章 {#36kr-yong-hu-wen-zhang}

<Route author="nczitzk" example="/36kr/user/747305693" path="/36kr/user/:id" paramsDesc={['用户 id，可在对应用户页面 URL 中找到']} />

### 主题文章 {#36kr-zhu-ti-wen-zhang}

<Route author="nczitzk" example="/36kr/motif/452" path="/36kr/motif/:id" paramsDesc={['主题 id，可在对应主题页面 URL 中找到']} />

### 专题文章 {#36kr-zhuan-ti-wen-zhang}

<Route author="nczitzk" example="/36kr/topics/1818512662032001" path="/36kr/topics/:id" paramsDesc={['专题 id，可在对应专题页面 URL 中找到']} />

### 搜索文章 {#36kr-sou-suo-wen-zhang}

<Route author="xyqfer kt286 nczitzk" example="/36kr/search/articles/ofo" path="/36kr/search/articles/:keyword" paramsDesc={['关键字']} />

### 搜索快讯 {#36kr-sou-suo-kuai-xun}

<Route author="nczitzk" example="/36kr/search/newsflashes/ofo" path="/36kr/search/newsflashes/:keyword" paramsDesc={['关键字']} />

### 资讯热榜 {#36kr-zi-xun-re-bang}

<Route author="nczitzk" example="/36kr/hot-list" path="/36kr/hot-list/:category?" paramsDesc={['分类，默认为24小时热榜']}>

| 24 小时热榜 | 资讯人气榜 | 资讯综合榜 | 资讯收藏榜 |
| ----------- | ---------- | ---------- | ---------- |
| 24          | renqi      | zonghe     | shoucang   |

</Route>

## 52hrtt 华人头条 {#52hrtt-hua-ren-tou-tiao}

### 新闻 {#52hrtt-hua-ren-tou-tiao-xin-wen}

<Route author="nczitzk" example="/52hrtt/global" path="/52hrtt/:area?/:type?" paramsDesc={['地区，默认为全球', '分类，默认为新闻']}>

地区和分类皆可在浏览器地址栏中找到，下面是一个例子。

访问华人头条全球站的国际分类，会跳转到 <https://www.52hrtt.com/global/n/w?infoTypeId=A1459145516533>。其中 `global` 即为 **全球** 对应的地区代码，`A1459145516533` 即为 **国际** 对应的分类代码。

</Route>

### 专题 {#52hrtt-hua-ren-tou-tiao-zhuan-ti}

<Route author="nczitzk" example="/52hrtt/symposium/F1626082387819" path="/52hrtt/symposium/:id?/:classId?" paramsDesc={['专题 id', '子分类 id']}>

专题 id 和 子分类 id 皆可在浏览器地址栏中找到，下面是一个例子。

访问 “邱毅看平潭” 专题，会跳转到 <https://www.52hrtt.com/global/n/w/symposium/F1626082387819>。其中 `F1626082387819` 即为 **专题 id** 对应的地区代码。

:::tip

更多的专题可以点击 [这里](https://www.52hrtt.com/global/n/w/symposium)

:::

</Route>

## 8 视界 {#8-shi-jie}

### 分类 {#8-shi-jie-fen-lei}

<Route author="nczitzk" example="/8world" path="/8world/:category?" paramsDesc={['分类 id，见下表，默认为即时 REALTIME']}>

| 分类                   | id             |
| ---------------------- | -------------- |
| 即时 REALTIME          | realtime       |
| 新加坡 SINGAPORE       | singapore      |
| 东南亚 SOUTH-EAST ASIA | southeast-asia |
| 中港台 GREATER CHINA   | greater-china  |
| 国际 WORLD             | world          |
| 财经 FINANCE           | finance        |
| 体育 SPORTS            | sports         |
| 社团 COMMUNITY         | community      |

</Route>

### 标签 {#8-shi-jie-biao-qian}

<Route author="nczitzk" example="/8world/topic/xianggang-3" path="/8world/topic/:id" paramsDesc={['标签 id，可在对应标签页中找到']} />

## 9To5 {#9to5}

### 9To5 Sub-site {#9to5-9to5-sub-site}

<Route author="HenryQW" example="/9to5/mac/aapl" path="/9to5/:subsite/:category?" paramsDesc={['Subsite name', 'Tag name inside the url of the tag page']} rssbud="1" radar="1">

Supported sub-sites：

| 9To5Mac | 9To5Google | 9To5Toys |
| ------- | ---------- | -------- |
| Mac     | Google     | Toys     |

</Route>

## AEON {#aeon}

### Types {#aeon-types}

<Route author="emdoe" example="/aeon/essays" path="/aeon/:type" paramsDesc={['Type']}>

Supported types: Essays, Videos, and Audio.

Compared to the official one, the RSS feed generated by RSSHub not only has more fine-grained options, but also eliminates pull quotes, which can't be easily distinguished from other paragraphs by any RSS reader, but only disrupt the reading flow. This feed also provides users with a bio of the author at the top.

However, The content generated under `audio` does not contain links to audio files.

</Route>

### Categories {#aeon-categories}

<Route author="emdoe" example="/aeon/category/philosophy" path="/aeon/category/:category" paramsDesc={['Category']}>

Supported categories: Philosophy, Science, Psychology, Society, and Culture.

</Route>

## AG⓪RA {#ag%E2%93%AAra}

### 零博客 {#ag%E2%93%AAra-ling-bo-ke}

<Route author="nczitzk" example="/agora0/initium" path="/agora0/:category?" paramsDesc={['分类，见下表，默认为 initium，即端传媒']} radar="1" rssbud="1">

| muitinⒾ | aidemnⒾ | srettaⓂ | qⓅ | sucoⓋ |
| ------- | ------- | ------- | -- | ----- |
| initium | inmedia | matters | pq | vocus |

</Route>

### 共和報 {#ag%E2%93%AAra-gong-he-bao}

<Route author="TonyRL" example="/agora0/pen0" path="/agora0/pen0" radar="1" rssbud="1"/>

## American Federation of Labor and Congress of Industrial Organizations {#american-federation-of-labor-and-congress-of-industrial-organizations}

### Blog {#american-federation-of-labor-and-congress-of-industrial-organizations-blog}

<Route author="nczitzk" example="/aflcio/blog" path="/aflcio/blog"/>

## AppleInsider {#appleinsider}

### Category {#appleinsider-category}

<Route author="nczitzk" example="/appleinsider" path="/appleinsider/:category?" paramsDesc={['Category, see below, News by default']}>

| News | Reviews | How-tos |
| ---- | ------- | ------- |
|      | reviews | how-to  |

</Route>

## ASML Holding N.V {#asml-holding-n.v}

### Press releases & announcements {#asml-holding-n.v-press-releases-%26-announcements}

<Route author="nczitzk" example="/asml/press-releases" path="/asml/press-releases"/>

## Bad.news {#bad.news}

### 通用 {#bad.news-tong-yong}

<Route author="nczitzk" example="/bad" path="/bad/:path+" paramsDesc={['路径，默认为首页热门']}>

:::tip

若订阅 [每日热点 - 最新](https://bad.news/tag/每日热点/sort-new)，网址为 [https://bad.news/tag/ 每日热点 /sort-new](https://bad.news/tag/每日热点/sort-new)。截取 `https://bad.news` 到末尾的部分 `/tag/每日热点/sort-new` 作为参数，此时路由为 [`/bad/tag/每日热点/sort-new`](https://rsshub.app/bad/tag/每日热点/sort-new)。

若订阅子分类 [大陆资讯 - 热门](https://bad.news/tag/大陆资讯/sort-hot)，网址为 [https://bad.news/tag/ 大陆资讯 /sort-hot](https://bad.news/tag/大陆资讯/sort-hot)。截取 `https://bad.news` 到末尾的部分 `/tag/大陆资讯/sort-hot` 作为参数，路由为 [`/bad/tag/大陆资讯/sort-hot`](https://rsshub.app/bad/tag/大陆资讯/sort-hot)。

:::

</Route>

## Bell Labs {#bell-labs}

### Event and News {#bell-labs-event-and-news}

<Route author="nczitzk" example="/bell-labs/events-news" path="/bell-labs/events-news/:category?" paramsDesc={['Category, see below, Press releases by default']}>

| Featured events | Latest recognition   | Press releases |
| --------------- | -------------------- | -------------- |
| events          | industry-recognition | press-releases |

</Route>

## biodiscover.com 生物探索 {#biodiscover.com-sheng-wu-tan-suo}

### Channel {#biodiscover.com-sheng-wu-tan-suo-channel}

<Route author="aidistan" example="/biodiscover" path="/biodiscover/:channel" paramsDesc={['channel, see below']}>

| Research | Interview | Industry | Activity |
| -------- | --------- | -------- | -------- |
| reaseach | interview | industry | activity |

</Route>

## BOF {#bof}

### Home {#bof-home}

<Route author="kt286" example="/bof/home" path="/bof/home" />

## C114 通信网 {#c114-tong-xin-wang}

### 滚动新闻 {#c114-tong-xin-wang-gun-dong-xin-wen}

<Route author="nczitzk" example="/c114/roll" path="/c114/roll"/>

## CBNData {#cbndata}

### 看点 {#cbndata-kan-dian}

<Route author="nczitzk" example="/cbndata/information" path="/cbndata/information/:category?" paramsDesc={['分类，见下表，默认为看点']}>

| 看点 | 餐饮零售 | 美妆个护 | 服饰鞋包 | 家电数码 | 宠物 | 营销 |
| ---- | -------- | -------- | -------- | -------- | ---- | ---- |
|      | 2560     | 1        | 2559     | 59       | 2419 | 2484 |

</Route>

## cfan {#cfan}

### News {#cfan-news}

<Route author="kt286" example="/cfan/news" path="/cfan/news"/>

## CGTN {#cgtn}

### Opinions {#cgtn-opinions}

<Route author="nczitzk" example="/cgtn/opinions" path="/cgtn/opinions"/>

### Most Read & Most Share {#cgtn-most-read-%26-most-share}

<Route author="nczitzk" example="/cgtn/most/read/day" path="/cgtn/most/:type?/:time?" paramsDesc={['Type, `read` as most read, `share` as most share, `read` by default', 'Time range, `all` as all the time, `day` as today, `week` as this week, `month` as this month, `year` as this year, `all` by default']}/>

### Top News {#cgtn-top-news}

<Route author="nczitzk" example="/cgtn/top" path="/cgtn/top"/>

### Editors' Pick {#cgtn-editors'-pick}

<Route author="nczitzk" example="/cgtn/pick" path="/cgtn/pick"/>

## China Labour Bulletin 中国劳工通讯 {#china-labour-bulletin-zhong-guo-lao-gong-tong-xun}

### Commentary and Analysis {#china-labour-bulletin-zhong-guo-lao-gong-tong-xun-commentary-and-analysis}

<Route author="nczitzk" example="/clb/commentary" path="/clb/commentary/:lang?" paramsDesc={['Language, Simplified Chinese by default, or `en` as English']}/>

## China Labour Watch 中国劳工观察 {#china-labour-watch-zhong-guo-lao-gong-guan-cha}

### Reports {#china-labour-watch-zhong-guo-lao-gong-guan-cha-reports}

<Route author="nczitzk" example="/chinalaborwatch/reports" path="/chinalaborwatch/reports/:lang?/:industry?" paramsDesc={['Language, English by default, or `cn` as Simplified Chinese', 'Industry id, see below, all by default']}>

| All | Automotive | Cookware | Electronics | Footwear | Furniture | Garment | General | Printing | Retail | Toys |
| --- | ---------- | -------- | ----------- | -------- | --------- | ------- | ------- | -------- | ------ | ---- |
|     | 2          | 6        | 14          | 3        | 4         | 10      | 8       | 1        | 9      | 7    |

</Route>

## China.com 中华网 {#china.com-zhong-hua-wang}

### Military - Military News 军事 - 军事新闻 {#china.com-zhong-hua-wang-military---military-news-jun-shi---jun-shi-xin-wen}

<Route author="jiaaoMario" example="/china/news/military" path="/china/news/military">
</Route>

### News and current affairs 时事新闻 {#china.com-zhong-hua-wang-news-and-current-affairs-shi-shi-xin-wen}

<Route author="jiaaoMario" example="/china/news" path="/china/news/:category?" paramsDesc={['Category of news. See the form below for details, default is china news.']}>

Category of news

| China News | International News | Social News | Breaking News |
| ---------- | ------------------ | ----------- | ------------- |
| domestic   | international      | social      | news100       |

</Route>

## cnBeta.COM {#cnbeta.com}

### 头条资讯 {#cnbeta.com-tou-tiao-zi-xun}

<Route author="kt286 HaitianLiu nczitzk" example="/cnbeta" path="/cnbeta" />

### 分类 {#cnbeta.com-fen-lei}

<Route author="nczitzk" example="/cnbeta/category/movie" path="/cnbeta/category/:id" paramsDesc={['分类 id，可在对应分类页的 URL 中找到']}>

| 影视  | 音乐  | 游戏 | 动漫  | 趣闻  | 科学    | 软件 |
| ----- | ----- | ---- | ----- | ----- | ------- | ---- |
| movie | music | game | comic | funny | science | soft |

</Route>

### 主题 {#cnbeta.com-zhu-ti}

<Route author="cczhong11 nczitzk" example="/cnbeta/topics/453" path="/cnbeta/topics/:id" paramsDesc={['主题 id，可在对应主题页的 URL 中找到']}>

:::tip

完整的主题列表参见 [主题列表](https://www.cnbeta.com.tw/topics.htm)

:::

</Route>

## CoinDesk Consensus Magazine {#coindesk-consensus-magazine}

### 新闻周刊 {#coindesk-consensus-magazine-xin-wen-zhou-kan}

<Route author="jameshih" example="/coindesk/consensus-magazine" path="/coindesk/consensus-magazine"/>

## Common App {#common-app}

### Blog {#common-app-blog}

<Route author="nczitzk" example="/commonapp/blog" path="/commonapp/blog"/>

## Day One {#day-one}

### Blog {#day-one-blog}

<Route author="nczitzk" example="/dayone/blog" path="/dayone/blog"/>

## DCFever {#dcfever}

### 新聞中心 {#dcfever-xin-wen-zhong-xin}

<Route author="TonyRL" example="/dcfever/news" path="/dcfever/news/:type?" paramsDesc={['分類，預設為所有新聞']} radar="1">

| 所有新聞 | 攝影器材 | 手機通訊 | 汽車熱話 | 攝影文化    | 影片攝錄    | 測試報告 | 生活科技 | 攝影技巧  |
| -------- | -------- | -------- | -------- | ----------- | ----------- | -------- | -------- | --------- |
|          | camera   | mobile   | auto     | photography | videography | reviews  | gadget   | technique |

</Route>

### 測試報告 {#dcfever-ce-shi-bao-gao}

<Route author="TonyRL" example="/dcfever/reviews/cameras" path="/dcfever/reviews/:type?" paramsDesc={['分類，預設為 `cameras`']} radar="1">

| 相機及鏡頭 | 手機平板 | 試車報告 |
| ---------- | -------- | -------- |
| cameras    | phones   | cars     |

</Route>

### 二手市集 {#dcfever-er-shou-shi-ji}

<Route author="TonyRL" example="/dcfever/trading/1" path="/dcfever/trading/:id" paramsDesc={['分類 ID，見下表']} radar="1">

[所有物品分類](https://www.dcfever.com/trading/index.php#all_cats)

| 攝影產品 | 電腦 | 手機通訊 | 影音產品 | 遊戲機、模型 | 電器傢俱 | 潮流服飾 | 手錶 | 單車及運動 | 其它 |
| -------- | ---- | -------- | -------- | ------------ | -------- | -------- | ---- | ---------- | ---- |
| 1        | 2    | 3        | 44       | 43           | 104      | 45       | 99   | 109        | 4    |

</Route>

### 二手市集 - 物品搜尋 {#dcfever-er-shou-shi-ji---wu-pin-sou-xun}

<Route author="TonyRL" example="/dcfever/trading/search/Sony" path="/dcfever/trading/search/:keyword/:mainCat?" paramsDesc={['關鍵字', '主要分類 ID，見上表']} radar="1" />

## Deadline {#deadline}

### Latest Article {#deadline-latest-article}

<Route author="TonyRL" example="/deadline" path="/deadline" radar="1"/>

## DeepL {#deepl}

### Blog {#deepl-blog}

<Route author="nczitzk" example="/deepl/blog" path="/deepl/blog/:lang?" paramsDesc={['语言，可选 `en` 指 英语 和 `zh` 指 汉语，默认为 en']}/>

## DeepMind {#deepmind}

### Blog {#deepmind-blog}

<Route author="nczitzk" example="/deepmind/blog" path="/deepmind/blog" radar="1" rssbud="1"/>

## DoNews {#donews}

### 栏目 {#donews-lan-mu}

<Route author="HenryQW" example="/donews" path="/donews/:column?" paramsDesc={['栏目代码, 默认为首页.']}>

| 首页 | 商业    | 创业     | 互娱 | 科技    | 专栏    |
| ---- | ------- | -------- | ---- | ------- | ------- |
| (空) | company | business | ent  | digital | idonews |

</Route>

## e 公司 {#e-gong-si}

### 快讯 {#e-gong-si-kuai-xun}

<Route author="hillerliao" example="/egsea/flash" path="/egsea/flash" />

## Engadget 瘾科技 {#engadget-yin-ke-ji}

### 中文全文 {#engadget-yin-ke-ji-zhong-wen-quan-wen}

<Route author="JamesWDGu" example="/engadget-cn" path="/engadget-cn"/>

### Multi-language {#engadget-yin-ke-ji-multi-language}

<Route author="JamesWDGu KeiLongW" example="/engadget/chinese" path="/engadget/:lang" paramsDesc={['Language']}>

| Traditional Chinese | Simplified Chinese | US  | Japanese |
| ------------------- | ------------------ | --- | -------- |
| chinese             | cn                 | us  | japanese |

</Route>

## ePrice {#eprice}

<Route author="TonyRL" example="/eprice/tw" path="/eprice/:region?" paramsDesc={['地区，预设为 tw']}>

地区：

| hk   | tw   |
| ---- | ---- |
| 香港 | 台湾 |

</Route>

## Esquirehk {#esquirehk}

### Tag {#esquirehk-tag}

<Route author="nczitzk" example="/esquirehk/tag/Fashion" path="/esquirehk/tag/:id" paramsDesc={['标签，可在对应标签页 URL 中找到']} />

## EU Disinfo Lab {#eu-disinfo-lab}

### Publications {#eu-disinfo-lab-publications}

<Route author="nczitzk" example="/disinfo/publications" path="/disinfo/publications"/>

## Europa Press {#europa-press}

### Category {#europa-press-category}

<Route author="nczitzk" example="/europapress" path="/europapress/:category?" paramsDesc={['Category, see below, Home by default']}>

Categories

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

## ezone.hk {#ezone.hk}

### Category {#ezone.hk-category}

<Route author="nczitzk" example="/ezone" path="/ezone/:category?" paramsDesc={['Category,see below, latest news by default']}>

| 科技焦點 | 網絡生活 | 教學評測 | IT Times |
| -------- | -------- | -------- | -------- |
| srae001  | srae008  | srae017  | srae021  |

</Route>

## Fashion Network {#fashion-network}

### Headline {#fashion-network-headline}

<Route author="nczitzk" example="/fashionnetwork/headline" path="/fashionnetwork/headline/:country?" paramsDesc={['Country, see below, `ww` by default']}/>

### News {#fashion-network-news}

<Route author="nczitzk" example="/fashionnetwork/news/5,6/15,112" path="/fashionnetwork/news/:sectors?/:categories?/:country?" paramsDesc={['Sectors, see below, `all` by default', 'Categories, see below, `all` by default', 'Country, see below, `ww` as Worldwide by default']}>

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

## Fermilab {#fermilab}

### News {#fermilab-news}

<Route author="nczitzk" example="/fnal/news" path="/fnal/news/:category?" paramsDesc={['Category, see below, All News by default']}>

| All News | Fermilab features | Press releases | Symmetry features |
| -------- | ----------------- | -------------- | ----------------- |
| allnews  | 269               | 55             | 12580             |

</Route>

## Focus Taiwan {#focus-taiwan}

### Category {#focus-taiwan-category}

<Route author="nczitzk" example="/focustaiwan" path="/focustaiwan/:category?" paramsDesc={['分类，见下表，默认为 news']}>

| Latest | Editor's Picks | Photos of the Day |
| ------ | -------------- | ----------------- |
| news   | editorspicks   | photos            |

| Politics | Cross-strait | Business | Society | Science & Tech | Culture | Sports |
| -------- | ------------ | -------- | ------- | -------------- | ------- | ------ |
| politics | cross-strait | business | society | science & tech | culture | sports |

</Route>

## Foresight News {#foresight-news}

### 首页 {#foresight-news-shou-ye}

<Route author="nczitzk" example="/foresightnews" path="/foresightnews"/>

### 文章 {#foresight-news-wen-zhang}

<Route author="nczitzk" example="/foresightnews/article" path="/foresightnews/article"/>

### 快讯 {#foresight-news-kuai-xun}

<Route author="nczitzk" example="/foresightnews/news" path="/foresightnews/news"/>

### 专栏 {#foresight-news-zhuan-lan}

<Route author="nczitzk" example="/foresightnews/column/1" path="/foresightnews/column/:id" paramsDesc={['专栏 id, 可在对应专栏页 URL 中找到']}/>

## Global Disinformation Index {#global-disinformation-index}

### Research {#global-disinformation-index-research}

<Route author="nczitzk" example="/disinformationindex/research" path="/disinformationindex/research"/>

### Blog {#global-disinformation-index-blog}

<Route author="nczitzk" example="/disinformationindex/blog" path="/disinformationindex/blog"/>

## Good.news {#good.news}

### 今日要闻 {#good.news-jin-ri-yao-wen}

<Route author="nczitzk" example="/good" path="/good" />

## Google News {#google-news}

### News {#google-news-news}

<Route author="zoenglinghou" example="/google/news/Top stories/hl=en-US&gl=US&ceid=US:en" path="/google/news/:category/:locale" paramsDesc={['Category Title', 'locales, could be found behind `?`, including `hl`, `gl`, and `ceid` as parameters']}/>

## GQ {#gq}

### GQ Taiwan {#gq-gq-taiwan}

<Route author="nczitzk" example="/gq/tw/fashion" path="/gq/tw/:caty?/:subcaty?" paramsDesc={['分类，见下表', '子分类，见下表']} radar="1">

分类

| Fashion | Shopping      | Entertainment | Life | Gadget | Better Men | Video | Tag |
| ------- | ------------- | ------------- | ---- | ------ | ---------- | ----- | --- |
| fashion | gq-recommends | entertainment | life | gadget | bettermen  | video | tag |

子分类

Fashion

| 最新推薦 | 新訊         | 編輯推薦 | 穿搭指南 | 特別報導 |
| -------- | ------------ | -------- | -------- | -------- |
|          | fashion-news | shopping | guide    | special  |

Entertainment

| All topics | 電影  | 娛樂       | 名人        | 美女 | 體育   | 特別報導 |
| ---------- | ----- | ---------- | ----------- | ---- | ------ | -------- |
|            | movie | popculture | celebrities | girl | sports | special  |

Life

| All topics | 美食 | 微醺 | 戶外生活 | 設計生活 | 風格幕後         | 特別報導 |
| ---------- | ---- | ---- | -------- | -------- | ---------------- | -------- |
|            | food | wine | outdoor  | design   | lifestyleinsider | special  |

Gadget

| All topics | 3C | 車   | 腕錶  | 特別報導 |
| ---------- | -- | ---- | ----- | -------- |
|            | 3c | auto | watch | special  |

Better Men

| All topics | 保養健身  | 感情關係     | 性愛 | 特別報導 |
| ---------- | --------- | ------------ | ---- | -------- |
|            | wellbeing | relationship | sex  | special  |

Tag

| 奧斯卡                    | MOTY |
| ------------------------- | ---- |
| `the-oscars-奧斯卡金像獎` | moty |

</Route>

## Grist {#grist}

### Articles {#grist-articles}

<Route author="Rjnishant530" example="/grist" path="/grist" radar="1"/>

### Featured {#grist-featured}

<Route author="Rjnishant530" example="/grist/featured" path="/grist/featured" radar="1"/>

### Series {#grist-series}

<Route author="Rjnishant530" example="/grist/series/best-of-grist" path="/grist/series/:series" paramsDesc={['Find in the URL which has /series/']} radar="1"/>

### Topic {#grist-topic}

<Route author="Rjnishant530" example="/grist/topic/extreme-heat" path="/grist/topic/:topic" paramsDesc={['Any Topic from Table below']} radar="1">

Topics

| Topic Name          | Topic Link          |
|---------------------|---------------------|
| Accountability     | accountability     |
| Agriculture        | agriculture        |
| Ask Umbra          | ask-umbra-series   |
| Buildings          | buildings          |
| Cities             | cities             |
| Climate & Energy   | climate-energy     |
| Climate Fiction    | climate-fiction    |
| Climate of Courage | climate-of-courage |
| COP26              | cop26              |
| COP27              | cop27              |
| Culture            | culture            |
| Economics          | economics          |
| Energy             | energy             |
| Equity             | equity             |
| Extreme Weather    | extreme-weather    |
| Fix                | fix                |
| Food               | food               |
| Grist              | grist              |
| Grist News         | grist-news         |
| Health             | health             |
| Housing            | housing            |
| Indigenous Affairs | indigenous         |
| International      | international      |
| Labor              | labor              |
| Language           | language           |
| Migration          | migration          |
| Opinion            | opinion            |
| Politics           | politics           |
| Protest            | protest            |
| Race               | race               |
| Regulation         | regulation         |
| Science            | science            |
| Shift Happens Newsletter | shift-happens |
| Solutions          | solutions          |
| Spanish            | spanish            |
| Sponsored          | sponsored          |
| Technology         | technology         |
| Temperature Check  | temperature-check  |
| Uncategorized     | article            |
| Updates            | updates            |
| Video              | video              |

</Route>

## Grub Street {#grub-street}

### Posts {#grub-street-posts}

<Route author="loganrockmore" example="/grubstreet" path="/grubstreet" />

## Harvard Business Review {#harvard-business-review}

### Topic {#harvard-business-review-topic}

<Route author="nczitzk" example="/hbr/topic/leadership" path="/hbr/topic/:topic?/:type?" paramsDesc={['Topic, can be found in URL, Leadership by default', 'Type, see below, Latest by default']}>

| LATEST | POPULAR | FROM THE STORE | FOR YOU |
| ------ | ------- | -------------- | ------- |
| Latest | Popular | From the Store | For You |

:::tip

Click here to view [All Topics](https://hbr.org/topics)

:::

</Route>

## Harvard Health Publishing {#harvard-health-publishing}

### Harvard Health Blog {#harvard-health-publishing-harvard-health-blog}

<Route author="nczitzk" example="/harvard/health/blog" path="/harvard/health/blog" />

## HKEPC {#hkepc}

### HKEPC 电脑领域 {#hkepc-hkepc-dian-nao-ling-yu}

<Route author="TonyRL" example="/hkepc/news" path="/hkepc/:category?" paramsDesc={['分类，见下表，默认为最新消息']}>

| 专题报导   | 新闻中心 | 新品快递 | 超频领域 | 流动数码 | 生活娱乐      | 会员消息 | 脑场新闻 | 业界资讯 | 最新消息 |
| ---------- | -------- | -------- | -------- | -------- | ------------- | -------- | -------- | -------- | -------- |
| coverStory | news     | review   | ocLab    | digital  | entertainment | member   | price    | press    | latest   |

</Route>

## HKJunkCall 資訊中心 {#hkjunkcall-zi-xun-zhong-xin}

### 近期資訊 {#hkjunkcall-zi-xun-zhong-xin-jin-qi-zi-xun}

<Route author="nczitzk" example="/hkjunkcall" path="/hkjunkcall" />

## iDaily 每日环球视野 {#idaily-mei-ri-huan-qiu-shi-ye}

### 今日 Timeline {#idaily-mei-ri-huan-qiu-shi-ye-jin-ri-timeline}

<Route author="zphw" example="/idaily/today" path="/idaily/today" />

## iDownloadBlog {#idownloadblog}

### blog {#idownloadblog-blog}

<Route author="HenryQW" example="/iDownloadBlog" path="/iDownloadBlog/index">

Provides a better reading experience (full text articles) over the official one.

</Route>

## Indians in Kuwait {#indians-in-kuwait}

### News {#indians-in-kuwait-news}

<Route author="TonyRL" example="/indiansinkuwait/latest" path="/indiansinkuwait/latest" radar="1" rssbud="1"/>

## InfoQ 中文 {#infoq-zhong-wen}

### 推荐 {#infoq-zhong-wen-tui-jian}

<Route author="brilon" example="/infoq/recommend" path="/infoq/recommend"/>

### 话题 {#infoq-zhong-wen-hua-ti}

<Route author="brilon" example="/infoq/topic/1" path="/infoq/topic/:id" paramsDesc={['话题id，可在 [InfoQ全部话题](https://www.infoq.cn/topics) 页面找到URL里的话题id']} />

## Institute of International Education {#institute-of-international-education}

### Blog {#institute-of-international-education-blog}

<Route author="nczitzk" example="/iie/blog" path="/iie/blog" />

## International Energy Agency {#international-energy-agency}

### News and events {#international-energy-agency-news-and-events}

<Route author="nczitzk" example="/iea/news-and-events" path="/iea/:category?" paramsDesc={['Category, see below, Featured by default']}>

| Featured        | News | Calendar | Past events |
| --------------- | ---- | -------- | ----------- |
| news-and-events | news | calendar | past-events |

</Route>

## International Mathematical Union {#international-mathematical-union}

### Fields Medal {#international-mathematical-union-fields-medal}

<Route author="nczitzk" example="/mathunion/fields-medal" path="/mathunion/fields-medal"/>

## IT 之家 {#it-zhi-jia}

### 分类资讯 {#it-zhi-jia-fen-lei-zi-xun}

<Route author="luyuhuang" example="/ithome/it" path="/ithome/:caty" paramsDesc={['类别']} radar="1" rssbud="1">

| it      | soft     | win10      | win11      | iphone      | ipad      | android      | digi     | next     |
| ------- | -------- | ---------- | ---------- | ----------- | --------- | ------------ | -------- | -------- |
| IT 资讯 | 软件之家 | win10 之家 | win11 之家 | iphone 之家 | ipad 之家 | android 之家 | 数码之家 | 智能时代 |

</Route>

### 热榜 {#it-zhi-jia-re-bang}

<Route author="immmortal luyuhuang" example="/ithome/ranking/24h" path="/ithome/ranking/:type" paramsDesc={['类别']} radar="1" rssbud="1">

| 24h           | 7days    | monthly |
| ------------- | -------- | ------- |
| 24 小时阅读榜 | 7 天最热 | 月榜    |

</Route>

### 专题 {#it-zhi-jia-zhuan-ti}

<Route author="nczitzk" example="/ithome/zt/xijiayi" path="/ithome/zt/:id" paramsDesc={['专题 id']} radar="1" rssbud="1">

所有专题请见[此处](https://www.ithome.com/zt)

</Route>

### 标签 {#it-zhi-jia-biao-qian}

<Route author="Fatpandac" example="/ithome/tag/win11" path="/ithome/tag/:name" paramsDesc={['标签名称，可从网址链接中获取']} radar="1" rssbud="1"/>

## IT 桔子 {#it-ju-zi}

### 投融资事件 {#it-ju-zi-tou-rong-zi-shi-jian}

<Route author="xyqfer" example="/itjuzi/invest" path="/itjuzi/invest"/>

### 并购事件 {#it-ju-zi-bing-gou-shi-jian}

<Route author="xyqfer" example="/itjuzi/merge" path="/itjuzi/merge"/>

## iThome 台灣 {#ithome-tai-wan}

### Feeds {#ithome-tai-wan-feeds}

<Route author="miles170" example="/ithome/tw/feeds/news" path="/ithome/tw/feeds/:category" paramsDesc={['類別']} radar="1">

| 新聞 | AI       | Cloud | DevOps | 資安     |
| ---- | -------- | ----- | ------ | -------- |
| news | big-data | cloud | devops | security |

</Route>

## KBS {#kbs}

### News {#kbs-news}

<Route author="nczitzk" example="/kbs/news" path="/kbs/news/:category?/:language?" paramsDesc={['Category, can be found in Url as `id`, all by default', 'Language, see below, e as English by default']}>

| 한국어 | عربي | 中国语 | English | Français | Deutsch | Bahasa Indonesia | 日本語 | Русский | Español | Tiếng Việt |
| ------ | ---- | ------ | ------- | -------- | ------- | ---------------- | ------ | ------- | ------- | ---------- |
| k      | a    | c      | e       | f        | g       | i                | j      | r       | s       | v          |

</Route>

### Today {#kbs-today}

<Route author="nczitzk" example="/kbs/today" path="/kbs/today/:language?" paramsDesc={['Language, see below, e as English by default']}>

| 한국어 | عربي | 中国语 | English | Français | Deutsch | Bahasa Indonesia | 日本語 | Русский | Español | Tiếng Việt |
| ------ | ---- | ------ | ------- | -------- | ------- | ---------------- | ------ | ------- | ------- | ---------- |
| k      | a    | c      | e       | f        | g       | i                | j      | r       | s       | v          |

</Route>

## Kotaku {#kotaku}

### Story {#kotaku-story}

<Route author="CYTMWIA" example="/kotaku/story/news" path="/kotaku/story/:type" paramsDesc={['Story类型']}>

可在 url 中找到，例如`https://kotaku.com/c/news`和`https://kotaku.com/c/kotaku-east`中的`news`和`kotaku-east`

注意，无论是`news`还是`kotaku-east`之前都有`/c/`

所以，如果您把`https://kotaku.com/latest`中的`latest`填入，该路由并不会正常工作

</Route>

## Krankenkassen 德国新闻社卫健新闻 {#krankenkassen-de-guo-xin-wen-she-wei-jian-xin-wen}

### dpa news {#krankenkassen-de-guo-xin-wen-she-wei-jian-xin-wen-dpa-news}

<Route author="howel52" example="/krankenkassen" path="/krankenkassen"/>

## Kuwait Local {#kuwait-local}

### Latest News {#kuwait-local-latest-news}

<Route author="TonyRL" example="/kuwaitlocal" path="/kuwaitlocal" radar="1" rssbud="1"/>

### Categorised News {#kuwait-local-categorised-news}

<Route author="TonyRL" example="/kuwaitlocal/article" path="/kuwaitlocal/:category?" paramsDesc={['Category name, can be found in URL, `latest` by default']} radar="1" rssbud="1"/>

## Letterboxd {#letterboxd}

### User diary {#letterboxd-user-diary}

<Route author="loganrockmore" example="/letterboxd/user/diary/demiadejuyigbe" path="/letterboxd/user/diary/:username" paramsDesc={['username']} />

### Following diary {#letterboxd-following-diary}

<Route author="loganrockmore" example="/letterboxd/user/followingdiary/demiadejuyigbe" path="/letterboxd/user/followingdiary/:username" paramsDesc={['username']} />

## LINE {#line}

### TODAY {#line-today}

<Route author="nczitzk" example="/line/today" path="/line/today/:edition?/:tab?" paramsDesc={['Edition, see below, Taiwan by default', 'Tag, can be found in URL, `top` by default']}>

Edition

| Taiwan | Thailand | Hong Kong |
| ------ | -------- | --------- |
| tw     | th       | hk        |

</Route>

### TODAY - Channel {#line-today---channel}

<Route author="TonyRL" example="/line/today/th/publisher/101048" path="/line/today/:edition/publisher/:id" paramsDesc={['Edition, see table above', 'Channel ID, can be found in URL']} radar="1" />

## LVV2 {#lvv2}

### 频道 {#lvv2-pin-dao}

<Route author="Fatpandac" example="/lvv2/news/sort-score" path="/news/:channel/:sort?" paramsDesc={['频道，见下表', '排序方式，仅得分和24小时榜可选填该参数，见下表']}>

|   热门   |   最新   |    得分    |   24 小时榜   |
| :------: | :------: | :--------: | :-----------: |
| sort-hot | sort-new | sort-score | sort-realtime |

| 排序方式 | 一小时内 | 一天内 | 一个周内 | 一个月内 |
| :------: | :------: | :----: | :------: | :------: |
|          |  t-hour  |  t-day |  t-week  |  t-month |

</Route>

### 24 小时点击排行 Top 10 {#lvv2-24-xiao-shi-dian-ji-pai-hang-top-10}

<Route author="Fatpandac" example="/lvv2/top/sort-score" path="/top/:channel/:sort?" paramsDesc={['频道，见下表', '排序方式，仅得分和24小时榜可选填该参数，见下表']}>

|   热门   |   最新   |    得分    |   24 小时榜   |
| :------: | :------: | :--------: | :-----------: |
| sort-hot | sort-new | sort-score | sort-realtime |

| 排序方式 | 一小时内 | 一天内 | 一个周内 | 一个月内 |
| :------: | :------: | :----: | :------: | :------: |
|          |  t-hour  |  t-day |  t-week  |  t-month |

</Route>

## Macfilos {#macfilos}

### Blog {#macfilos-blog}

<Route author="nczitzk" example="/macfilos/blog" path="/macfilos/blog" />

## MakeUseOf {#makeuseof}

<Route author="nczitzk" example="/makeuseof" path="/makeuseof/:category?" paramsDesc={['Category, Trending by default']}/>

## Matataki {#matataki}

:::tip

在 Matataki 发表的文章会上传到星际文件系统（IPFS），永久保存。即使站内文章因为各种原因消失，用 RSS 获取过带 IPFS 连接的 Feed Item 的话，还是可以从 RSS 阅读器找回文章的。
IPFS 网关有可能失效，那时候换成其他网关。

:::

### 最热作品 {#matataki-zui-re-zuo-pin}

<Route author="whyouare111" example="/matataki/posts/hot" path="/matataki/posts/hot/:ipfsFlag?" paramsDesc={['IPFS标识，置空item指向主站，有值item指向IPFS网关']} radar="1"/>

### 最新作品 {#matataki-zui-xin-zuo-pin}

<Route author="whyouare111" example="/matataki/posts/latest/ipfs" path="/matataki/posts/latest/:ipfsFlag?" paramsDesc={['IPFS标识，置空item指向主站，有值item指向IPFS网关']} radar="1"/>

### 作者创作 {#matataki-zuo-zhe-chuang-zuo}

<Route author="whyouare111" example="/matataki/users/9/posts" path="/matataki/users/:authorId/posts/:ipfsFlag?" paramsDesc={['作者ID', 'IPFS标识，置空item指向主站，有值item指向IPFS网关']}  radar="1"/>

### Fan 票关联作品 {#matataki-fan-piao-guan-lian-zuo-pin}

<Route author="whyouare111" example="/matataki/tokens/22/posts/3" path="/matataki/tokens/:tokenId/posts/:filterCode/:ipfsFlag?" paramsDesc={['Fan票ID', '过滤条件,见下表', 'IPFS标识，置空item指向主站，有值item指向IPFS网关']} radar="1">

| 需持票 | 需支付 | 全部 |
| ------ | ------ | ---- |
| 1      | 2      | 3    |

</Route>

### 标签关联作品 {#matataki-biao-qian-guan-lian-zuo-pin}

<Route author="whyouare111" example="/matataki/tags/150/区块链/posts" path="/matataki/tags/:tagId/:tagName/posts/:ipfsFlag?" paramsDesc={['标签ID', '标签名称','IPFS标识，置空item指向主站，有值item指向IPFS网关']}  radar="1"/>

### 收藏夹 {#matataki-shou-cang-jia}

<Route author="whyouare111" example="/matataki/users/3017/favorites/155/posts" path="/matataki/users/:userId/favorites/:favoriteListId/posts/:ipfsFlag?" paramsDesc={['用户ID', '收藏夹ID','IPFS标识，置空item指向主站，有值item指向IPFS网关']}  radar="1"/>

## Matters {#matters}

### Latest, heat, essence {#matters-latest%2C-heat%2C-essence}

<Route author="xyqfer Cerebrater xosdy" example="/matters/latest/heat" path="/matters/latest/:type?" paramsDesc={['Defaults to latest, see table below']} radar="1" rssbud="1">

| 最新   | 热门 | 精华    |
| ------ | ---- | ------- |
| latest | heat | essence |

</Route>

### Tags {#matters-tags}

<Route author="Cerebrater" example="/matters/tags/VGFnOjk3Mg" path="/matters/tags/:tid" paramsDesc={['Tag id, can be found in the url of the tag page']} radar="1" rssbud="1"/>

### Author {#matters-author}

<Route author="Cerebrater xosdy" example="/matters/author/az" path="/matters/author/:uid" paramsDesc={['Author id, can be found at author\'s homepage url']} radar="1" rssbud="1"/>

## McLaren Racing {#mclaren-racing}

### Articles {#mclaren-racing-articles}

<Route author="Bubbu0129" example="/mclaren/en/all" path="/mclaren/:lang/:category?" paramsDesc={['Supports English(en), Simplified Chinese(zh), and Spanish(es).', 'Default to exporting all media (all); See the table below for details']} radar="1" rssbud="1">

| All Media | Article | Report | Gallery | Video | Blog | Photo Essay  |
| --------- | ------- | ------ | ------- | ----- | ---- | ------------ |
| all       | article | report | gallery | video | blog | photo\_essay |

</Route>

## Mirror {#mirror}

### User {#mirror-user}

<Route author="fifteen42 rde9 nczitzk" example="/mirror/tingfei.eth" path="/mirror/:id" paramsDesc={['user id']} />

## MIT 科技评论 {#mit-ke-ji-ping-lun}

### 首页 {#mit-ke-ji-ping-lun-shou-ye}

<Route author="EsuRt queensferryme" example="/mittrchina/hot" path="/mittrchina/:type" paramsDesc={['类型 type，可以是 index（首页资讯）或 hot（本周热榜）']}/>

## MyGoPen {#mygopen}

### 分類 {#mygopen-fen-lei}

<Route author="nczitzk" example="/mygopen" path="/mygopen/:label?" paramsDesc={['分類，见下表，默认为首页']}>

| 謠言 | 詐騙 | 真實資訊 | 教學 |
| ---- | ---- | -------- | ---- |

</Route>

## National Association of Colleges and Employers {#national-association-of-colleges-and-employers}

### Blog {#national-association-of-colleges-and-employers-blog}

<Route author="nczitzk" example="/nace/blog" path="/nace/blog/:sort?" paramsDesc={['Sort, see below, Most Recent by default']}>

| Most Recent | Top Rated | Most Read     |
| ----------- | --------- | ------------- |
|             | top-blogs | mostreadblogs |

</Route>

## Nautilus {#nautilus}

### Topics {#nautilus-topics}

<Route author="emdoe" example="/nautil/topic/arts" path="/nautil/topic/:tid" paramsDesc={['topic']}>

This route provides a flexible plan with full text content to subscribe specific topic(s) on the Nautilus. Please visit [nautil.us](https://nautil.us) and click `Topics` to acquire whole topic list.

</Route>

## Netflix {#netflix}

### Newsroom {#netflix-newsroom}

<Route author="nczitzk" example="/netflix/newsroom" path="/netflix/newsroom/:category?/:region?" paramsDesc={['分类，见下表，默认为 0 即 全部', '地区，可在地区页 URL 中找到，默认为 en 即 英语地区']}>

分类

| 全部报道 | 业务     | 创新          | 娱乐       | 巴西制作 | 社会影响 |
| -------- | -------- | ------------- | ---------- | -------- | -------- |
| all      | business | entertainment | innovation | brazil   | impact   |

</Route>

## NGOCN {#ngocn}

### 首页 {#ngocn-shou-ye}

<Route author="nczitzk" example="/ngocn2" path="/ngocn2/:category?" paramsDesc={['分类，见下表，默认为所有文章']} radar="1" rssbud="1">

| 所有文章 | 早报        | 热点     |
| -------- | ----------- | -------- |
| article  | daily-brief | trending |

</Route>

## NL Times {#nl-times}

### News {#nl-times-news}

<Route author="Hivol" example="/nltimes/news/top-stories" path="/nltimes/news/:category?" paramsDesc={['category']} >

| Top Stories (default) | Health | Crime | Politics | Business | Tech | Culture | Sports | Weird | 1-1-2 |
| --------------------- | ------ | ----- | -------- | -------- | ---- | ------- | ------ | ----- | ----- |
| top-stories           | health | crime | politics | business | tech | culture | sports | weird | 1-1-2 |

</Route>

## Oak Ridge National Laboratory {#oak-ridge-national-laboratory}

### News {#oak-ridge-national-laboratory-news}

<Route author="nczitzk" example="/ornl/news" path="/ornl/news"/>

## Odaily 星球日报 {#odaily-xing-qiu-ri-bao}

### 快讯 {#odaily-xing-qiu-ri-bao-kuai-xun}

<Route author="ncziztk" example="/odaily/newsflash" path="/odaily/newsflash"/>

### 搜索快讯 {#odaily-xing-qiu-ri-bao-sou-suo-kuai-xun}

<Route author="snowraincloud" example="/odaily/search/news/Lens%20Protocol" path="/odaily/search/news/:keyword" paramsDesc={['搜索关键字']}/>

### 文章 {#odaily-xing-qiu-ri-bao-wen-zhang}

<Route author="ncziztk" example="/odaily" path="/odaily/:id?" paramsDesc={['id，见下表，默认为最新']}>

| 最新 | 新品 | DeFi | NFT | 存储 | 波卡 | 行情 | 活动 |
| ---- | ---- | ---- | --- | ---- | ---- | ---- | ---- |
| 280  | 333  | 331  | 334 | 332  | 330  | 297  | 296  |

</Route>

### 用户文章 {#odaily-xing-qiu-ri-bao-yong-hu-wen-zhang}

<Route author="ncziztk" example="/odaily/user/2147486902" path="/odaily/user/:id" paramsDesc={['用户 id，可在用户页地址栏中找到']}/>

### 活动 {#odaily-xing-qiu-ri-bao-huo-dong}

<Route author="ncziztk" example="/odaily/activity" path="/odaily/activity"/>

## OpenAI {#openai}

### Blog {#openai-blog}

<Route author="ncziztk StevenRCE0" example="/openai/blog" path="/openai/blog/:tag?" paramsDesc={['Tag, see below, All by default']}>

| All | Announcements | Events | Safety & Alignment | Community | Product | Culture & Careers   | Milestones | Research |
| --- | ------------- | ------ | ------------------ | --------- | ------- | ------------------- | ---------- | -------- |
|     | announcements | events | safety-alignment   | community | product | culture-and-careers | milestones | research |

</Route>

### ChatGPT - Release Notes {#openai-chatgpt---release-notes}

<Route author="ETiV" example="/openai/chatgpt/release-notes" path="/openai/chatgpt/release-notes" />

### Research {#openai-research}

<Route author="yuguorui" example="/openai/research" path="/openai/research" />

## OR {#or}

### 频道 {#or-pin-dao}

<Route author="ncziztk" example="/or" path="/or/id?" paramsDesc={['id，见下表，默认为首页']}>

| 首页 | 商业 | 金融  | 政经 | 社会与文化 | 领导力 | 生活时尚 | 视频   |
| ---- | ---- | ----- | ---- | ---------- | ------ | -------- | ------ |
|      | 7174 | 15176 | 8943 | 14910      | 11813  | 24138    | 324234 |

</Route>

## PANews {#panews}

### 深度 {#panews-shen-du}

<Route author="nczitzk" example="/panewslab" path="/panewslab/:category?" paramsDesc={['分类，见下表，默认为精选']}>

| 精选 | 链游 | 元宇宙 | NFT | DeFi | 监管 | 央行数字货币 | 波卡 | Layer 2 | DAO | 融资 | 活动 |
| ---- | ---- | ------ | --- | ---- | ---- | ------------ | ---- | ------- | --- | ---- | ---- |

</Route>

### 快讯 {#panews-kuai-xun}

<Route author="nczitzk" example="/panewslab/news" path="/panewslab/news"/>

### 专栏 {#panews-zhuan-lan}

<Route author="nczitzk" example="/panewslab/author/166" path="/panewslab/author/:id" paramsDesc={['专栏 id，可在地址栏 URL 中找到']}/>

### 专题 {#panews-zhuan-ti}

<Route author="nczitzk" example="/panewslab/topic/1629365774078402" path="/panewslab/topic/:id" paramsDesc={['专题 id，可在地址栏 URL 中找到']}/>

## PeoPo 公民新聞 {#peopo-gong-min-xin-wen}

### 新聞分類 {#peopo-gong-min-xin-wen-xin-wen-fen-lei}

<Route author="TonyRL" example="/peopo/topic/159" path="/peopo/topic/:topicId?" paramsDesc={['分類 ID，見下表，默認為社會關懷']} radar="1" rssbud="1">

| 分類     | ID  |
| -------- | --- |
| 社會關懷 | 159 |
| 生態環保 | 113 |
| 文化古蹟 | 143 |
| 社區改造 | 160 |
| 教育學習 | 161 |
| 農業     | 163 |
| 生活休閒 | 162 |
| 媒體觀察 | 164 |
| 運動科技 | 165 |
| 政治經濟 | 166 |
| 北台灣   | 223 |
| 中台灣   | 224 |
| 南台灣   | 225 |
| 東台灣   | 226 |
| 校園中心 | 167 |
| 原住民族 | 227 |
| 天然災害 | 168 |

</Route>

## Phoronix {#phoronix}

### News & Reviews {#phoronix-news-%26-reviews}

<Route author="oppliate" example="/phoronix/news_topic/Intel" path="/phoronix/:page/:queryOrItem?" paramsDesc={['Page name', 'For `category` it corresponds to `item`, for other pages it\'s `q`. You may find available parameters from their navigator links. E.g. to subscribe to the category page `https://www.phoronix.com/scan.php?page=category&item=Computers`, fill in the path `/phoronix/category/Computers`']} radar="1"/>

## PMCAFF {#pmcaff}

### 今日推荐 / 精选 {#pmcaff-jin-ri-tui-jian-%2F-jing-xuan}

<Route author="Jeason0228" example="/pmcaff/list/2" path="/pmcaff/list/:typeid" paramsDesc={['分类 id,1=今天推荐,2=精选']}/>

### 社区 {#pmcaff-she-qu}

<Route author="WenryXu" example="/pmcaff/feed/1" path="/pmcaff/feed/:typeid" paramsDesc={['分类 id']}/>

| 发现 | 待回答 | 最热 | 问答专场 | 投稿 | 深度 | 专栏 |
| ---- | ------ | ---- | -------- | ---- | ---- | ---- |
| 1    | 2      | 3    | 4        | 5    | 6    | 7    |

### 用户文章 {#pmcaff-yong-hu-wen-zhang}

<Route author="SChen1024" example="/pmcaff/user/Oak7mqnEQJ" path="/pmcaff/user/:userid" paramsDesc={['用户 id, 用户界面对应的 URL 最后面的字符']}/>

## Polar {#polar}

### Blog {#polar-blog}

<Route author="nczitzk" example="/polar/blog" path="/polar/blog"/>

## Quanta Magazine {#quanta-magazine}

### Archive {#quanta-magazine-archive}

<Route author="emdoe" example="/quantamagazine/archive" path="/quantamagazine/archive">

Compared to the official one, this feed:

1.  supports LaTeX formulas, and
2.  displays all pictures in the article (except those print-hidden multimedia materials).

</Route>

## QuestMobile {#questmobile}

### 行业研究报告 {#questmobile-hang-ye-yan-jiu-bao-gao}

<Route author="nczitzk" example="/questmobile/report" path="/questmobile/report/:category?/:label?" paramsDesc={['行业，见下表，默认为全部行业', '标签，见下表，默认为全部标签']}>

行业

| 全部行业 | 移动视频 | 移动社交 | 移动购物 |
| -------- | -------- | -------- | -------- |
| 0        | 10       | 1        | 2        |

| 系统工具 | 新闻资讯 | 移动音乐 | 生活服务 |
| -------- | -------- | -------- | -------- |
| 17       | 21       | 11       | 5        |

| 数字阅读 | 汽车服务 | 拍摄美化 | 旅游服务 |
| -------- | -------- | -------- | -------- |
| 16       | 4        | 12       | 8        |

| 健康美容 | 医疗服务 | 教育学习 | 金融理财 |
| -------- | -------- | -------- | -------- |
| 22       | 23       | 14       | 3        |

| 办公商务 | 智能设备 | 手机游戏 | 出行服务 | 内容平台 |
| -------- | -------- | -------- | -------- | -------- |
| 9        | 19       | 20       | 26       | 29       |

标签

| 全部标签 | 5G | 双十一 | 直播带货 | 电商平台 |
| -------- | -- | ------ | -------- | -------- |
| 0        | 75 | 74     | 73       | 72       |

| 新蓝领 | 市场竞争 | KOL | 品牌营销 | 互联网研究 |
| ------ | -------- | --- | -------- | ---------- |
| 71     | 70       | 69  | 68       | 67         |

| 广告效果 | 媒介策略 | App 和小程序 | App 增长 |
| -------- | -------- | ------------ | -------- |
| 66       | 65       | 64           | 63       |

| 小程序数据 | 移动大数据 | 互联网报告 | 数据报告 |
| ---------- | ---------- | ---------- | -------- |
| 62         | 61         | 60         | 59       |

| 互联网数据 | 智能终端 | 小程序 | 私域流量 |
| ---------- | -------- | ------ | -------- |
| 58         | 57       | 56     | 55       |

| 运动消费 | 用户争夺 | 运动健身 | 新消费 |
| -------- | -------- | -------- | ------ |
| 54       | 53       | 52       | 48     |

| 增长模式 | 下沉 | 新中产 | 银发族 |
| -------- | ---- | ------ | ------ |
| 42       | 41   | 36     | 31     |

| 粉丝经济 | 泛娱乐 | 网购少女 | 二次元 |
| -------- | ------ | -------- | ------ |
| 30       | 29     | 28       | 27     |

| 兴趣圈层 | 大学生 | 广告营销 | Z 世代 |
| -------- | ------ | -------- | ------ |
| 26       | 25     | 23       | 22     |

| 付费用户 | 精细化运营 | 00 后 | 90 后 |
| -------- | ---------- | ----- | ----- |
| 18       | 17         | 14    | 11    |

| 春节报告 | 低幼经济 | 季度报告 | 年度报告 |
| -------- | -------- | -------- | -------- |
| 10       | 9        | 7        | 6        |

| 全景生态 | 消费者洞察 |
| -------- | ---------- |
| 5        | 2          |

</Route>

## Radio-Canada.ca {#radio-canada.ca}

### Latest News {#radio-canada.ca-latest-news}

<Route author="nczitzk" example="/radio-canada/latest" path="/radio-canada/latest/:language?" paramsDesc={['Language, see below, English by default']}>

| Français | English | Español | 简体中文 | 繁體中文 | العربية | ਪੰਜਾਬੀ | Tagalog |
| -------- | ------- | ------- | -------- | -------- | ------- | --- | ------- |
| fr       | en      | es      | zh-hans  | zh-hant  | ar      | pa  | tl      |

</Route>

## Readhub {#readhub}

### 分类 {#readhub-fen-lei}

<Route author="WhiteWorld nczitzk Fatpandac" example="/readhub" path="/readhub/:category?/:overview?" paramsDesc={['分类，见下表，默认为热门话题', '获取概述，任意值获取概述，默认为不获取']}>

| 热门话题 | 科技动态 | 技术资讯 | 区块链快讯 | 每日早报 |
| -------- | -------- | -------- | ---------- | -------- |
| topic    | news     | tech     | blockchain | daily    |

</Route>

## Sakamichi Series 坂道系列官网资讯 {#sakamichi-series-ban-dao-xi-lie-guan-wang-zi-xun}

### Nogizaka46 News 乃木坂 46 新闻 {#sakamichi-series-ban-dao-xi-lie-guan-wang-zi-xun-nogizaka46-news-nai-mu-ban-46-xin-wen}

<Route author="crispgm Fatpandac" example="/nogizaka46/news" path="/nogizaka46/news" />

### Nogizaka46 Blog 乃木坂 46 博客 {#sakamichi-series-ban-dao-xi-lie-guan-wang-zi-xun-nogizaka46-blog-nai-mu-ban-46-bo-ke}

<Route author="Kasper4649 akashigakki" example="/nogizaka46/blog" path="/nogizaka46/blog/:id?" paramsDesc={['Member ID, see below, `all` by default']}>

Member ID

| Member ID | Name                  |
| --------- | --------------------- |
| 55401     | 岡本 姫奈             |
| 55400     | 川﨑 桜                |
| 55397     | 池田 瑛紗             |
| 55396     | 五百城 茉央           |
| 55395     | 中西 アルノ           |
| 55394     | 奥田 いろは           |
| 55393     | 冨里 奈央             |
| 55392     | 小川 彩               |
| 55391     | 菅原 咲月             |
| 55390     | 一ノ瀬 美空           |
| 55389     | 井上 和               |
| 55387     | 弓木 奈於             |
| 55386     | 松尾 美佑             |
| 55385     | 林 瑠奈               |
| 55384     | 佐藤 璃果             |
| 55383     | 黒見 明香             |
| 48014     | 清宮 レイ             |
| 48012     | 北川 悠理             |
| 48010     | 金川 紗耶             |
| 48019     | 矢久保 美緒           |
| 48018     | 早川 聖来             |
| 48009     | 掛橋 沙耶香           |
| 48008     | 賀喜 遥香             |
| 48017     | 筒井 あやめ           |
| 48015     | 田村 真佑             |
| 48013     | 柴田 柚菜             |
| 48006     | 遠藤 さくら           |
| 36760     | 与田 祐希             |
| 36759     | 吉田 綾乃クリスティー |
| 36758     | 山下 美月             |
| 36757     | 向井 葉月             |
| 36756     | 中村 麗乃             |
| 36755     | 佐藤 楓               |
| 36754     | 阪口 珠美             |
| 36753     | 久保 史緒里           |
| 36752     | 大園 桃子             |
| 36751     | 梅澤 美波             |
| 36750     | 岩本 蓮加             |
| 36749     | 伊藤 理々杏           |
| 264       | 齋藤 飛鳥             |

</Route>

### Keyakizaka46 News 欅坂 46 新闻 {#sakamichi-series-ban-dao-xi-lie-guan-wang-zi-xun-keyakizaka46-news-ju-ban-46-xin-wen}

<Route author="crispgm" example="/keyakizaka46/news" path="/keyakizaka46/news" />

### Keyakizaka46 Blog 欅坂 46 博客 {#sakamichi-series-ban-dao-xi-lie-guan-wang-zi-xun-keyakizaka46-blog-ju-ban-46-bo-ke}

<Route author="nwindz" example="/keyakizaka46/blog" path="/keyakizaka46/blog" />

### Sakurazaka46 News 櫻坂 46 新闻 {#sakamichi-series-ban-dao-xi-lie-guan-wang-zi-xun-sakurazaka46-news-ying-ban-46-xin-wen}

<Route author="nczitzk" example="/sakurazaka46/news" path="/sakurazaka46/news" />

### Sakurazaka46 Blog 櫻坂 46 博客 {#sakamichi-series-ban-dao-xi-lie-guan-wang-zi-xun-sakurazaka46-blog-ying-ban-46-bo-ke}

<Route author="victor21813 nczitzk akashigakki" example="/sakurazaka46/blog" path="/sakurazaka46/blog/:id?/:page?" paramsDesc={['Member ID, see below, `all` by default', 'Page, `0` by default']}>

Member ID

| Member ID | Name         |
| --------- | ------------ |
| 2000      | 三期生リレー |
| 69        | 山下 瞳月    |
| 68        | 村山 美羽    |
| 67        | 村井 優      |
| 66        | 向井 純葉    |
| 65        | 的野 美青    |
| 64        | 中嶋 優月    |
| 63        | 谷口 愛季    |
| 62        | 小島 凪紗    |
| 61        | 小田倉 麗奈  |
| 60        | 遠藤 理子    |
| 59        | 石森 璃花    |
| 58        | 守屋 麗奈    |
| 57        | 増本 綺良    |
| 56        | 幸阪 茉里乃  |
| 55        | 大沼 晶保    |
| 54        | 大園 玲      |
| 53        | 遠藤 光莉    |
| 51        | 山﨑 天       |
| 50        | 森田 ひかる  |
| 48        | 松田 里奈    |
| 47        | 藤吉 夏鈴    |
| 46        | 田村 保乃    |
| 45        | 武元 唯衣    |
| 44        | 関 有美子    |
| 43        | 井上 梨名    |
| 15        | 原田 葵      |
| 14        | 土生 瑞穂    |
| 11        | 菅井 友香    |
| 08        | 齋藤 冬優花  |
| 07        | 小林 由依    |
| 06        | 小池 美波    |
| 04        | 尾関 梨香    |
| 03        | 上村 莉菜    |

</Route>

### Hinatazaka46 News 日向坂 46 新闻 {#sakamichi-series-ban-dao-xi-lie-guan-wang-zi-xun-hinatazaka46-news-ri-xiang-ban-46-xin-wen}

<Route author="crispgm akashigakki" example="/hinatazaka46/news" path="/hinatazaka46/news" />

### Hinatazaka46 Blog 日向坂 46 博客 {#sakamichi-series-ban-dao-xi-lie-guan-wang-zi-xun-hinatazaka46-blog-ri-xiang-ban-46-bo-ke}

<Route author="nwindz akashigakki" example="/hinatazaka46/blog" path="/hinatazaka46/blog/:id?/:page?" paramsDesc={['Member ID, see below, `all` by default', 'Page, `0` by default']}>

Member ID

| Member ID | Name         |
| --------- | ------------ |
| 2000      | 四期生リレー |
| 36        | 渡辺 莉奈    |
| 35        | 山下 葉留花  |
| 34        | 宮地 すみれ  |
| 33        | 藤嶌 果歩    |
| 32        | 平岡 海月    |
| 31        | 平尾 帆夏    |
| 30        | 竹内 希来里  |
| 29        | 正源司 陽子  |
| 28        | 清水 理央    |
| 27        | 小西 夏菜実  |
| 26        | 岸 帆夏      |
| 25        | 石塚 瑶季    |
| 24        | 山口 陽世    |
| 23        | 森本 茉莉    |
| 22        | 髙橋 未来虹  |
| 21        | 上村 ひなの  |
| 18        | 松田 好花    |
| 17        | 濱岸 ひより  |
| 16        | 丹生 明里    |
| 15        | 富田 鈴花    |
| 14        | 小坂 菜緒    |
| 13        | 河田 陽菜    |
| 12        | 金村 美玖    |
| 11        | 東村 芽依    |
| 10        | 高本 彩花    |
| 9         | 高瀬 愛奈    |
| 8         | 佐々木 美玲  |
| 7         | 佐々木 久美  |
| 6         | 齊藤 京子    |
| 5         | 加藤 史帆    |
| 4         | 影山 優佳    |
| 2         | 潮 紗理菜    |

> Note: The personal blogs of the fourth-generation members have not been opened yet. The unified blog number is `2000`.

</Route>

## Samsung {#samsung}

### Research Blog {#samsung-research-blog}

<Route author="nczitzk" example="/samsung/research/blog" path="/samsung/research/blog"/>

## Semiconductor Industry Association {#semiconductor-industry-association}

### Latest News {#semiconductor-industry-association-latest-news}

<Route author="nczitzk" example="/semiconductors/latest-news" path="/semiconductors/latest-news"/>

## Sensor Tower {#sensor-tower}

### Blog {#sensor-tower-blog}

<Route author="nczitzk" example="/sensortower/blog" path="/sensortower/blog/:language?" paramsDesc={['Language, see below, English by default']}>

| English | Chinese | Japanese | Korean |
| ------- | ------- | -------- | ------ |
|         | zh-CN   | ja       | ko     |

</Route>

## Simons Foundation {#simons-foundation}

### Articles {#simons-foundation-articles}

<Route author="emdoe" example="/simonsfoundation/articles" path="/simonsfoundation/articles"/>

### What We’re Reading {#simons-foundation-what-we%E2%80%99re-reading}

<Route author="emdoe" example="/simonsfoundation/recommend" path="/simonsfoundation/recommend"/>

## Sixth Tone {#sixth-tone}

### News {#sixth-tone-news}

<Route author="kt286" example="/sixthtone/news" path="/sixthtone/news"/>

## Sky Sports {#sky-sports}

### News {#sky-sports-news}

<Route author="nczitzk" example="/skysports/news/ac-milan" path="/skysports/news/:team" paramsDesc={['Team id, can be found in URL to the team page']} />

## SocialBeta {#socialbeta}

### 首页 {#socialbeta-shou-ye}

<Route author="nczitzk" example="/socialbeta/home" path="/socialbeta/home"/>

### 案例 {#socialbeta-an-li}

<Route author="nczitzk" example="/socialbeta/hunt" path="/socialbeta/hunt"/>

## Soomal {#soomal}

### 话题 {#soomal-hua-ti}

<Route author="zoenglinghou" example="/soomal/topics/Phone/en" path="/soomal/topics/:category/:language?" paramsDesc={['Topic, found on the top menu bar', 'locale, default to simplified Chinese']}>

-   Available languages：

| Simplified Chinese | Traditional Chinese | English |
| ------------------ | ------------------- | ------- |
| zh                 | zh_tw               | en      |

-   Available topics by locale：

| Languages           |          |       |          |          |          |
| ------------------- | -------- | ----- | -------- | -------- | -------- |
| Simplified Chinese  | 最新文章 | 科普  | 测评报告 | 发烧入门 | 摄影入门 | 古典音乐入门 |
| Traditional Chinese | 最新文章 | 科普  | 測評報告 | 發燒入門 | 攝影入門 | 古典音樂入門 |
| English             | Phone    | Audio | Album    | Review   |

-   Soomal offers official RSS subscriptions
  -   Soomal website：[http://www.soomal.com/doc/101.rss.xml](http://www.soomal.com/doc/101.rss.xml)
  -   Soomal forum and comments：[http://www.soomal.com/bbs/101.rss.xml](http://www.soomal.com/bbs/101.rss.xml)

</Route>

## SupChina {#supchina}

### Feed {#supchina-feed}

<Route author="nczitzk" example="/supchina" path="/supchina"/>

### Podcasts {#supchina-podcasts}

<Route author="nczitzk" example="/supchina/podcasts" path="/supchina/podcasts"/>

## swissinfo {#swissinfo}

### Category {#swissinfo-category}

<Route author="nczitzk" example="/swissinfo/eng/latest-news" path="/swissinfo/:language?/:category?" paramsDesc={['Language, eng by default', 'Category, Latest News by default']}/>

## TANC 艺术新闻 {#tanc-yi-shu-xin-wen}

### 分类 {#tanc-yi-shu-xin-wen-fen-lei}

<Route author="nczitzk" example="/tanchinese" path="/tanchinese/:category?" paramsDesc={['分类，见下表，默认为 INDEX 首页']}>

| INDEX 首页 | ENGLISH 英文版 | NEWS 新闻 | MUSEUM 博物馆 | EXHIBITIONS 展览 |
| ---------- | -------------- | --------- | ------------- | ---------------- |
|            | english        | news      | museum        | exhibitions      |

| COMMENTS 评论 | FEATURE 特写 | INTERVIEW 专访 | VIDEO 影像之选 | ART MARKET 艺术市场 |
| ------------- | ------------ | -------------- | -------------- | ------------------- |
| comments      | feature      | interview      | video          | art-market          |

</Route>

## TechCrunch {#techcrunch}

### News {#techcrunch-news}

<Route author="NavePnow" example="/techcrunch/news" path="/techcrunch/news"/>

## TechPowerUp {#techpowerup}

### Latest Content {#techpowerup-latest-content}

<Route author="TonyRL" example="/techpowerup" path="/techpowerup" radar="1" />

### Reviews {#techpowerup-reviews}

<Route author="TonyRL" example="/techpowerup/review/4090" path="/techpowerup/review/:keyword?" paramsDesc={['Search Keyword']} radar="1" />

## The Brain {#the-brain}

### Blog {#the-brain-blog}

<Route author="nczitzk" example="/thebrain/blog" path="/thebrain/blog/:category?" paramsDesc={['Category, see below, Blog by default']}>

| Blog | Recorded Events | Big Thinkers |
| ---- | --------------- | ------------ |
| blog | recorded-events | big-thinkers |

</Route>

## The News Lens 關鍵評論 {#the-news-lens-guan-jian-ping-lun}

### 最新 {#the-news-lens-guan-jian-ping-lun-zui-xin}

<Route author="nczitzk" example="/thenewslens/latest-article" path="/thenewslens/latest-article/:sort?" paramsDesc={['排序方式，见下表，可在对应排序页 URL 中找到']}>

| 最新文章 | 最多觀看 | 最多分享 | 本日      | 本週     | 本月      | 今年     | 去年         | 有史以來    |
| -------- | -------- | -------- | --------- | -------- | --------- | -------- | ------------ | ----------- |
|          | hot      | social   | hot/today | hot/week | hot/month | hot/year | hot/lastYear | hot/history |

</Route>

### 新闻 {#the-news-lens-guan-jian-ping-lun-xin-wen}

<Route author="nczitzk" example="/thenewslens/news" path="/thenewslens/news/:sort?" paramsDesc={['排序方式，见下表，可在对应排序页 URL 中找到']}>

| 最新文章 | 最多觀看 | 最多分享 |
| -------- | -------- | -------- |
|          | hot      | social   |

</Route>

### 作者 {#the-news-lens-guan-jian-ping-lun-zuo-zhe}

<Route author="nczitzk" example="/thenewslens/author/BBC" path="/thenewslens/author/:id/:sort?" paramsDesc={['作者 id，可在对应作者页 URL 中找到', '排序方式，同上表，可在对应排序页 URL 中找到']} />

### 分类 {#the-news-lens-guan-jian-ping-lun-fen-lei}

<Route author="nczitzk" example="/thenewslens/category/politics" path="/thenewslens/category/:id/:sort?" paramsDesc={['分类 id，可在对应分类页 URL 中找到', '排序方式，同上表，可在对应排序页 URL 中找到']} />

### 标签 {#the-news-lens-guan-jian-ping-lun-biao-qian}

<Route author="nczitzk" example="/thenewslens/tag/中國" path="/thenewslens/tag/:id/:sort?" paramsDesc={['标签 id，可在对应标签页 URL 中找到', '排序方式，同上表，可在对应排序页 URL 中找到']} />

### 频道 {#the-news-lens-guan-jian-ping-lun-pin-dao}

<Route author="nczitzk" example="/thenewslens/channel/hk" path="/thenewslens/channel/:id/:sort?" paramsDesc={['标签 id，可在对应标签页 URL 中找到', '排序方式，同上表，可在对应排序页 URL 中找到']} />

### 评论 {#the-news-lens-guan-jian-ping-lun-ping-lun}

<Route author="nczitzk" example="/thenewslens/review" path="/thenewslens/review/:sort?" paramsDesc={['排序方式，同上表，可在对应排序页 URL 中找到']} />

### 影音 {#the-news-lens-guan-jian-ping-lun-ying-yin}

<Route author="nczitzk" example="/thenewslens/videos/Projects" path="/thenewslens/videos/Projects/:sort?" paramsDesc={['排序方式，同上表，可在对应排序页 URL 中找到']} />

## The Partnership on AI {#the-partnership-on-ai}

### Resources {#the-partnership-on-ai-resources}

<Route author="nczitzk" example="/partnershiponai/resources" path="/partnershiponai/resources"/>

## The Verge {#the-verge}

### The Verge {#the-verge-the-verge}

<Route author="HenryQW vbali" example="/theverge" path="/theverge/:hub?" paramsDesc={['Hub, see below, All Posts by default']}>

| Hub         | Hub name            |
| ----------- | ------------------- |
|             | All Posts           |
| android     | Android             |
| apple       | Apple               |
| apps        | Apps & Software     |
| blackberry  | BlackBerry          |
| culture     | Culture             |
| gaming      | Gaming              |
| hd          | HD & Home           |
| microsoft   | Microsoft           |
| photography | Photography & Video |
| policy      | Policy & Law        |
| web         | Web & Social        |

Provides a better reading experience (full text articles) over the official one.

</Route>

## Thrillist {#thrillist}

<Route author="loganrockmore" example="/thrillist/food-and-drink" path="/vulture/:tag" paramsDesc={['Tag']}>

Provides all of the Thrillist articles with the specified tag.

</Route>

## Topbook {#topbook}

### Overview {#topbook-overview}

<Route author="nczitzk" example="/topbook/overview/24" path="/topbook/overview/:id?" paramsDesc={['id，可在对应页面 URL 中找到，默认为今天看什么']}/>

### 今天看什么 {#topbook-jin-tian-kan-shen-me}

<Route author="nczitzk" example="/topbook/today" path="/topbook/today"/>

## TOPYS {#topys}

### 关键字 {#topys-guan-jian-zi}

<Route author="nczitzk" example="/topys" path="/topys/:keyword?" paramsDesc={['关键字，可在对应结果页的 URL 中找到']}>

| 创意 | 设计 | 商业 | 艺术 | 文化 | 科技 |
| ---- | ---- | ---- | ---- | ---- | ---- |

</Route>

## Tribal Football {#tribal-football}

### Latest News {#tribal-football-latest-news}

<Route author="Rongronggg9" example="/tribalfootball" path="/tribalfootball" />

## UNTAG {#untag}

### 时间线 {#untag-shi-jian-xian}

<Route author="nczitzk" example="/utgd/timeline" path="/utgd/timeline" />

### 分类 {#untag-fen-lei}

<Route author="nczitzk" example="/utgd/method" path="/utgd/:category?" paramsDesc={['分类，可在对应分类页的 URL 中找到，默认为方法']}>

| 方法   | 观点    |
| ------ | ------- |
| method | opinion |

</Route>

### 专题 {#untag-zhuan-ti}

<Route author="nczitzk" example="/utgd/topic/在线阅读专栏" path="/utgd/topic/:topic?" paramsDesc={['专题，默认为在线阅读专栏']}>

| 在线阅读专栏 | 卡片笔记专题 |
| ------------ | ------------ |

更多专栏请见 [专题广场](https://utgd.net/topic)

</Route>

## Uwants {#uwants}

### 版塊 {#uwants-ban-kuai}

<Route author="nczitzk" example="/uwants/1520" path="/uwants/:fid" paramsDesc={['fid，可在对应板块页的 URL 中找到']}/>

## VERSE {#verse}

### 專文 {#verse-zhuan-wen}

<Route author="miles170" example="/verse/articles" path="/verse/articles/:category?" paramsDesc={['分类，见下表，默认为全部']} radar="1">

| 新聞       | 人物   | 文化    | 觀念      | 地方  | 飲食   | 專題     |
| ---------- | ------ | ------- | --------- | ----- | ------ | -------- |
| verse-news | figure | culture | new-ideas | local | eating | features |

</Route>

## VOA News {#voa-news}

### Day in Photos {#voa-news-day-in-photos}

<Route author="nczitzk" example="/voa/day-photos" path="/voa/day-photos"/>

## Vulture {#vulture}

<Route author="loganrockmore" example="/vulture/movies" path="/vulture/:type/:excludetags?" paramsDesc={['The sub-site name', 'Comma-delimited list of tags. If an article includes one of these tags, it will be excluded from the RSS feed.']}>

Supported sub-sites:

| TV | Movies | Comedy | Music | TV Recaps | Books | Theater | Art | Awards | Video |
| -- | ------ | ------ | ----- | --------- | ----- | ------- | --- | ------ | ----- |
| tv | movies | comedy | music | tvrecaps  | books | theater | art | awards | video |

</Route>

## Web3Caff {#web3caff}

### 发现 {#web3caff-fa-xian}

<Route author="nczitzk" example="/web3caff" path="/web3caff/:path?" paramsDesc={['路径，默认为首页']}>

:::tip

路径处填写对应页面 URL 中 `https://web3caff.com/` 后的字段。下面是一个例子。

若订阅 [叙事 - Web3Caff](https://web3caff.com/zh/archives/category/news_zh) 则将对应页面 URL <https://web3caff.com/zh/archives/category/news_zh> 中 `https://web3caff.com/` 后的字段 `zh/archives/category/news_zh` 作为路径填入。此时路由为 [`/web3caff/zh/archives/category/news_zh`](https://rsshub.app/web3caff/zh/archives/category/news_zh)

:::

</Route>

## World Happiness {#world-happiness}

### Blog {#world-happiness-blog}

<Route author="nczitzk" example="/worldhappiness/blog" path="/worldhappiness/blog"/>

### Archive {#world-happiness-archive}

<Route author="nczitzk" example="/worldhappiness/archive" path="/worldhappiness/archive"/>

## ZAKER {#zaker}

### 分类 {#zaker-fen-lei}

<Route author="LogicJake kt286 TonyRL" example="/zaker/channel/13" path="/zaker/channel/:id?" paramsDesc={['channel id，可在 URL 中找到，默认为 1']}/>

### 精读 {#zaker-jing-du}

<Route author="AlexdanerZe TonyRL" example="/zaker/focusread" path="/zaker/focusread" />

## zyw {#zyw}

### 今日热榜 {#zyw-jin-ri-re-bang}

<Route author="nczitzk" example="/zyw/hot" path="/zyw/hot/:site?" paramsDesc={['站点，见下表，默认为空，即全部']}>

:::tip

全部站点请见 [此处](https://hot.zyw.asia/#/list)

:::

| 哔哩哔哩 | 微博 | 知乎 | 36 氪 | 百度 | 少数派 | IT 之家 | 澎湃新闻 | 今日头条 | 百度贴吧 | 稀土掘金 | 腾讯新闻 |
| -------- | ---- | ---- | ----- | ---- | ------ | ------- | -------- | -------- | -------- | -------- | -------- |

</Route>

## 阿里研究院 {#a-li-yan-jiu-yuan}

### 资讯 {#a-li-yan-jiu-yuan-zi-xun}

<Route author="nczitzk" example="/aliresearch/information" path="/aliresearch/information/:type?" paramsDesc={['类型，见下表，默认为新闻']}>

| 新闻 | 观点 | 案例 |
| ---- | ---- | ---- |

</Route>

## 艾莱资讯 {#ai-lai-zi-xun}

### 世界轨道交通资讯网 {#ai-lai-zi-xun-shi-jie-gui-dao-jiao-tong-zi-xun-wang}

<Route author="Rongronggg9" example="/ally/rail/hyzix/chengguijiaotong/" path="/ally/rail/:category?/:topic?" paramsDesc={['分类，可在 URL 中找到；略去则抓取首页', '话题，可在 URL 中找到；并非所有页面均有此字段']} radar="1" rssbud="1">

:::tip

默认抓取前 20 条，可通过 `?limit=` 改变。

:::

</Route>

## 爱范儿 ifanr {#ai-fan-er-ifanr}

### 爱范儿频道 {#ai-fan-er-ifanr-ai-fan-er-pin-dao}

<Route author="HenryQW" example="/ifanr/app" path="/ifanr/:channel?" paramsDesc={['默认 app，部分频道如下']}>

-   频道为单一路径，如 <https://www.ifanr.com/`coolbuy`> 则为 `/ifanr/coolbuy`.
-   频道包含多重路径，如 <https://www.ifanr.com/`category/intelligentcar`> 则替换 `/` 为 `-` `/ifanr/category-intelligentcar`.

| AppSolution | 玩物志  | 董车会                  |
| ----------- | ------- | ----------------------- |
| app         | coolbuy | category-intelligentcar |

</Route>

## 八阕 {#ba-que}

### 广角新闻 {#ba-que-guang-jiao-xin-wen}

<Route author="nczitzk" example="/popyard" path="/popyard/:caty?" paramsDesc={['分类, 默认为全景']}>

| 全景 | 中国 | 国际 | 科教 | 军事 | 体育 | 娱乐 | 艺术 | 文史 | 观点 | 生活 | 产经 | 其它 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 0    | 1    | 2    | 3    | 4    | 5    | 6    | 7    | 8    | 9    | 10   | 11   | 12   |

</Route>

## 巴比特 {#ba-bi-te}

### 作者专栏 {#ba-bi-te-zuo-zhe-zhuan-lan}

<Route author="kt286" example="/8btc/45703" path="/8btc/:authorid" paramsDesc={['作者ID，可在对应专辑页面的 URL 中找到']}/>

### 快讯 {#ba-bi-te-kuai-xun}

<Route author="hillerliao" example="/8btc/news/flash" path="/8btc/news/flash"/>

## 白话区块链 {#bai-hua-qu-kuai-lian}

### 首页 {#bai-hua-qu-kuai-lian-shou-ye}

<Route author="Fatpandac" example="/hellobtc/information/latest" path="/hellobtc/information/:channel?" paramsDesc={['类型，可填 `latest` 和 `application` 及最新和应用，默认为最新']}/>

### 快讯 {#bai-hua-qu-kuai-lian-kuai-xun}

<Route author="Fatpandac" example="/hellobtc/news" path="/hellobtc/news"/>

### 科普 {#bai-hua-qu-kuai-lian-ke-pu}

<Route author="Fatpandac" example="/hellobtc/kepu/latest" path="/hellobtc/kepu/:channel?" paramsDesc={['类型，见下表，默认为最新']}>

| latest | bitcoin | ethereum | defi | inter_blockchain | mining | safety | satoshi_nakomoto | public_blockchain |
| ------ | ------- | -------- | ---- | ---------------- | ------ | ------ | ---------------- | ----------------- |
| 最新   | 比特币  | 以太坊   | DeFi | 跨链             | 挖矿   | 安全   | 中本聪           | 公链              |

</Route>

### 专栏 {#bai-hua-qu-kuai-lian-zhuan-lan}

<Route author="Fatpandac" example="/hellobtc/topic/276" path="/hellobtc/topic/:id" paramsDesc={['专栏 ID，可在网址中获取']}/>

## 白鲸出海 {#bai-jing-chu-hai}

### 最新 {#bai-jing-chu-hai-zui-xin}

<Route author="jeffcottLu nczitzk" example="/baijing" path="/baijing" />

### 资讯 {#bai-jing-chu-hai-zi-xun}

<Route author="nczitzk" example="/baijing/1" path="/baijing/:type?" paramsDesc={['分类 id，见下表，默认为最新文章']}>

| 最新文章 | 7×24h | 干货 | 专栏 | 手游 | 跨境电商 | 投融资 | 数据报告 | 智能手机 | 活动 |
| -------- | ----- | ---- | ---- | ---- | -------- | ------ | -------- | -------- | ---- |
|          | 1     | 2    | 4    | 3    | 5        | 10     | 9        | 7        | 6    |

</Route>

## 百度知道日报 {#bai-du-zhi-dao-ri-bao}

### 精选 {#bai-du-zhi-dao-ri-bao-jing-xuan}

<Route author="1813927768" example="/baidu/daily" path="/baidu/daily"/>

## 半月谈 {#ban-yue-tan}

### 时事大事库 {#ban-yue-tan-shi-shi-da-shi-ku}

<Route author="nczitzk" example="/banyuetan/byt" path="/banyuetan/byt/:time?" paramsDesc={['时间，见下表，默认为每周']}>

| 每周          | 每月  |
| ------------- | ----- |
| shishidashiku | yiyue |

</Route>

## 報導者 {#bao-dao-zhe}

### 最新 {#bao-dao-zhe-zui-xin}

<Route author="emdoe" example="/twreporter/newest" path="/twreporter/newest"/>

### 摄影 {#bao-dao-zhe-she-ying}

<Route author="emdoe" example="/twreporter/photography" path="/twreporter/photography"/>

### 分类 {#bao-dao-zhe-fen-lei}

<Route author="emdoe" example="/twreporter/category/reviews" path="/twreporter/category/:tid" paramsDesc={['分类（议题）名称，于主页获取']}/>

## 北京市科学技术协会 {#bei-jing-shi-ke-xue-ji-shu-xie-hui}

### 通用 {#bei-jing-shi-ke-xue-ji-shu-xie-hui-tong-yong}

<Route author="nczitzk" example="/bast/col/col31266" path="/bast/:path+" paramsDesc={['路径，默认为通知公告']}>

:::tip

路径处填写对应页面 URL 中 `https://www.bast.net.cn/` 后的字段。下面是两个例子。

若订阅 [通知公告](https://www.bast.net.cn/col/col31266) 则将对应页面 URL <https://www.bast.net.cn/col/col31266> 中 `https://www.bast.net.cn/` 后的字段 `col/col31266` 作为路径填入。此时路由为 [`/bast/col/col31266`](https://rsshub.app/bast/col/col31266)

若订阅 [学术动态](https://www.bast.net.cn/col/col31530) 则将对应页面 URL <https://www.bast.net.cn/col/col31530> 中 `https://www.bast.net.cn/` 后的字段 `col/col31530` 作为路径填入。此时路由为 [`/bast/col/col31530`](https://rsshub.app/bast/col/col31530)

如果路由符合 `/col/colXXXXX` 的格式，可以由 [`/bast/col/col31266`](https://rsshub.app/bast/col/col31266) 精简为 [`/bast/31266`](https://rsshub.app/bast/31266)

:::

</Route>

## 北屋 {#bei-wu}

<Route author="nczitzk" example="/northhouse" path="/northhouse/:category?" paramsDesc={['分类，见下表，默认为首页']}>

| 首页 | 最新资讯和灾难信息 | 生存主义 survival | 运动户外 | 玩物尚志 | 分享下载 | 知行生活 | 商务服务 |
| ---- | ------------------ | ----------------- | -------- | -------- | -------- | -------- | -------- |
|      | 最新资讯和灾难信息 | 生存主义 survival | 运动户外 | 玩物尚志 | 分享下载 | 知行生活 | 商务服务 |

</Route>

## 本地宝 {#ben-di-bao}

### 焦点资讯 {#ben-di-bao-jiao-dian-zi-xun}

<Route author="nczitzk" example="/bendibao/news/bj" path="/bendibao/news/:city" paramsDesc={['城市缩写，可在该城市页面的 URL 中找到']}>

| 城市名 | 缩写 |
| ------ | ---- |
| 北京   | bj   |
| 上海   | sh   |
| 广州   | gz   |
| 深圳   | sz   |

更多城市请参见 [这里](http://www.bendibao.com/city.htm)

> **香港特别行政区** 和 **澳门特别行政区** 的本地宝城市页面不更新资讯。

</Route>

## 币世界 {#bi-shi-jie}

### 快讯 {#bi-shi-jie-kuai-xun}

<Route author="kt286" example="/bishijie/kuaixun" path="/bishijie/kuaixun"/>

## 不安全 {#bu-an-quan}

### 全文 {#bu-an-quan-quan-wen}

<Route author="22k" example="/buaq" path="/buaq/index"/>

## 财富中文网 {#cai-fu-zhong-wen-wang}

### 分类 {#cai-fu-zhong-wen-wang-fen-lei}

<Route author="nczitzk" example="/fortunechina" path="/fortunechina/:category?" paramsDesc={['分类，见下表，默认为首页']}>

| 商业    | 领导力    | 科技 | 研究   |
| ------- | --------- | ---- | ------ |
| shangye | lindgaoli | keji | report |

</Route>

## 差评 {#cha-ping}

### 图片墙 {#cha-ping-tu-pian-qiang}

<Route author="nczitzk" example="/chaping/banner" path="/chaping/banner"/>

### 资讯 {#cha-ping-zi-xun}

<Route author="nczitzk" example="/chaping/news/15" path="/chaping/news/:caty?" paramsDesc={['分类，默认为全部资讯']}>

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

### 快讯 {#cha-ping-kuai-xun}

<Route author="Fatpandac" example="/chaping/newsflash" path="/chaping/newsflash"/>

## 产品沉思录 {#chan-pin-chen-si-lu}

### 首页 {#chan-pin-chen-si-lu-shou-ye}

<Route author="nczitzk" example="/pmthinking" path="/pmthinking" />

## 城农 Growin' City {#cheng-nong-growin'-city}

### 城农资讯观点 {#cheng-nong-growin'-city-cheng-nong-zi-xun-guan-dian}

<Route author="nczitzk" example="/growincity/news" path="/growincity/news/:id?" anticrawler="1" paramsDesc={['分类 id，见下表，默认为原创内容']}>

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

## 抽屉新热榜 {#chou-ti-xin-re-bang}

### 最新 {#chou-ti-xin-re-bang-zui-xin}

<Route author="xyqfer" example="/chouti/hot" path="/chouti/:subject?" paramsDesc={['主题名称']}>

| 热榜 | 42 区 | 段子  | 图片 | 挨踢 1024 | 你问我答 |
| ---- | ----- | ----- | ---- | --------- | -------- |
| hot  | news  | scoff | pic  | tec       | ask      |

</Route>

### 最热榜 TOP10 {#chou-ti-xin-re-bang-zui-re-bang-top10}

<Route author="DIYgod" example="/chouti/top/24" path="/chouti/top/:hour?" paramsDesc={['排行榜周期，可选 24 72 168 三种，默认 24']} />

## 创业邦 {#chuang-ye-bang}

### 资讯 {#chuang-ye-bang-zi-xun}

<Route author="nczitzk" example="/cyzone" path="/cyzone/:id?" paramsDesc={['频道 id，可在对应频道页 URL 中找到，默认为 news，即最新资讯']}>

| 最新 | 快鲤鱼 | 创投 | 科创板 | 汽车 |
| ---- | ------ | ---- | ------ | ---- |
| news | 5      | 14   | 13     | 8    |

| 海外 | 消费 | 科技 | 医疗 | 文娱 |
| ---- | ---- | ---- | ---- | ---- |
| 10   | 9    | 7    | 27   | 11   |

| 城市 | 政策 | 特写 | 干货 | 科技股 |
| ---- | ---- | ---- | ---- | ------ |
| 16   | 15   | 6    | 12   | 33     |

</Route>

### 作者 {#chuang-ye-bang-zuo-zhe}

<Route author="xyqfer nczitzk" example="/cyzone/author/1225562" path="/cyzone/author/:id" paramsDesc={['作者 id，可在对应作者页 URL 中找到']}/>

### 标签 {#chuang-ye-bang-biao-qian}

<Route author="LogicJake nczitzk" example="/cyzone/label/创业邦周报" path="/cyzone/label/:name" paramsDesc={['标签名称，可在对应标签页 URL 中找到']}/>

## 創新拿鐵 {#chuang-xin-na-tie}

### 分类 {#chuang-xin-na-tie-fen-lei}

<Route author="nczitzk" example="/startuplatte" path="/startuplatte/:category?" paramsDesc={['分类，见下表，默认为首頁']}>

| 首頁 | 大師智慧 | 深度分析 | 新知介紹 |
| ---- | -------- | -------- | -------- |
|      | quote    | analysis | trend    |

</Route>

## 大河财立方 {#da-he-cai-li-fang}

### 新闻 {#da-he-cai-li-fang-xin-wen}

<Route author="linbuxiao" example="/dahecube" path="/dahecube/:type?" paramsDesc={['板块，见下表，默认为推荐']}>

| 推荐      | 党史    | 豫股  | 财经     | 投教      | 金融    | 科创    | 投融   | 专栏   |
| --------- | ------- | ----- | -------- | --------- | ------- | ------- | ------ | ------ |
| recommend | history | stock | business | education | finance | science | invest | column |

</Route>

## 島民衛星 Islander {#dao-min-wei-xing-islander}

### 事件分析 {#dao-min-wei-xing-islander-shi-jian-fen-xi}

<Route author="TonyRL" example="/islander/search" path="/islander/search" radar="1" rssbud="1"/>

### 單日焦點 {#dao-min-wei-xing-islander-dan-ri-jiao-dian}

<Route author="TonyRL" example="/islander/top30event" path="/islander/top30event" radar="1" rssbud="1"/>

## 得到 {#de-dao}

### 首页 {#de-dao-shou-ye}

<Route author="nczitzk" example="/dedao/list/年度日更" path="/dedao/list/:category?" paramsDesc={['分类名，默认为年度日更']}/>

### 新闻 {#de-dao-xin-wen}

<Route author="nczitzk" example="/dedao/news" path="/dedao/news"/>

### 人物故事 {#de-dao-ren-wu-gu-shi}

<Route author="nczitzk" example="/dedao/figure" path="/dedao/figure"/>

### 视频 {#de-dao-shi-pin}

<Route author="nczitzk" example="/dedao/video" path="/dedao/video"/>

### 知识城邦 {#de-dao-zhi-shi-cheng-bang}

<Route author="nczitzk" example="/dedao/knowledge" path="/dedao/knowledge/:topic?/:type?" paramsDesc={['话题 id，可在对应话题页 URL 中找到', '分享类型，`true` 指精选，`false` 指最新，默认为精选']}/>

### 用户主页 {#de-dao-yong-hu-zhu-ye}

<Route author="nczitzk" example="/dedao/user/VkA5OqLX4RyGxmZRNBMlwBrDaJQ9og" path="/dedao/user/:id/:type?" paramsDesc={['用户 id，可在对应用户主页 URL 中找到', '类型，见下表，默认为`0`，即动态']}>

| 动态 | 书评 | 视频 |
| ---- | ---- | ---- |
| 0    | 7    | 12   |

</Route>

## 电动邦 {#dian-dong-bang}

### 资讯 {#dian-dong-bang-zi-xun}

<Route author="Fatpandac" example="/diandong/news" path="/diandong/news/:cate?" paramsDesc={['分类，见下表，默认为推荐']}>

分类

| 推荐 | 新车 | 导购 | 试驾 | 用车 | 技术 | 政策 | 行业 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 0    | 29   | 61   | 30   | 75   | 22   | 24   | 23   |

</Route>

### 电动号 {#dian-dong-bang-dian-dong-hao}

<Route author="Fatpandac" example="/diandong/ddh" path="/diandong/ddh/:cate?" paramsDesc={['分类，见下表，默认为全部']}>

分类

| 全部 | 新车 | 导购 | 评测 | 新闻 | 技术 | 政策 | 用车 | 二手车 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ------ |
| 0    | 1    | 2    | 3    | 4    | 5    | 6    | 7    | 8      |

</Route>

## 电商报 {#dian-shang-bao}

### 分区 {#dian-shang-bao-fen-qu}

<Route author="FlashWingShadow" example="/dsb/area/lingshou" path="/dsb/area/:area" paramsDesc={['分区']}>

area 分区选项

| 零售     | 物流  | O2O | 金融    | B2B | 人物  | 跨境    | 行业观察 |
| -------- | ----- | --- | ------- | --- | ----- | ------- | -------- |
| lingshou | wuliu | O2O | jinrong | B2B | renwu | kuajing | guancha  |

</Route>

## 电商在线 {#dian-shang-zai-xian}

### 电商在线 {#dian-shang-zai-xian-dian-shang-zai-xian}

<Route author="LogicJake" example="/imaijia/category/xls" path="/imaijia/category/:category" paramsDesc={['类别id，可在 URL 中找到']} />

## 电獭少女 {#dian-ta-shao-n%C3%BC}

### 分类 {#dian-ta-shao-n%C3%BC-fen-lei}

<Route author="TonyRL" example="/agirls/app" path="/agirls/:category?" paramsDesc={['分类，默认为最新文章，可在对应主题页的 URL 中找到，下表仅列出部分']} radar="1" rssbud="1">

| App 评测 | 手机开箱 | 笔电开箱 | 3C 周边     | 教学小技巧 | 科技情报 |
| -------- | -------- | -------- | ----------- | ---------- | -------- |
| app      | phone    | computer | accessories | tutorial   | techlife |

</Route>

### 精选主题 {#dian-ta-shao-n%C3%BC-jing-xuan-zhu-ti}

<Route author="TonyRL" example="/agirls/topic/iphone13" path="/agirls/topic/:topic" paramsDesc={['精选主题，可通过下方精选主题列表获得']} radar="1" rssbud="1"/>

### 当前精选主题列表 {#dian-ta-shao-n%C3%BC-dang-qian-jing-xuan-zhu-ti-lie-biao}

<Route author="TonyRL" example="/agirls/topic_list" path="/agirls/topic_list" radar="1" rssbud="1"/>

## 电子工程专辑 {#dian-zi-gong-cheng-zhuan-ji}

### 芯语 {#dian-zi-gong-cheng-zhuan-ji-xin-yu}

<Route author="nczitzk" example="/eet-china/mp" path="/eet-china/mp/:category?" paramsDesc={['分类，见下表，默认为最新']}>

| 最新 | 半导体 | 通信网络 | 消费电子 / 手机 | 汽车电子 |
| ---- | ------ | -------- | --------------- | -------- |
|      | 1      | 2        | 3               | 4        |

| 物联网 | 工控 | 硬件设计 | 嵌入式 / FPGA | 电源 / 能源 |
| ------ | ---- | -------- | ------------- | ----------- |
| 5      | 6    | 7        | 8             | 9           |

| 测试测量 | 人工智能 / 机器人 | 科技前沿 | 供应链 | 工程师职场 |
| -------- | ----------------- | -------- | ------ | ---------- |
| 10       | 11                | 12       | 13     | 14         |

</Route>

### 芯语标签 {#dian-zi-gong-cheng-zhuan-ji-xin-yu-biao-qian}

<Route author="nczitzk" example="/eet-china/mp/tags/36806" path="/eet-china/mp/tags/:id" paramsDesc={['标签 id，可在对应标签页中找到']}/>

## 丁香园 {#ding-xiang-yuan}

### 新冠疫苗实时动态 {#ding-xiang-yuan-xin-guan-yi-miao-shi-shi-dong-tai}

<Route author="nczitzk" example="/dxy/vaccine/北京" path="/dxy/vaccine/:province?/:city?/:location?" paramsDesc={['省', '市', '区']}>

查看北京市的新冠疫苗接种点，路由为 `/dxy/vaccine/北京`；

查看北京市朝阳区的新冠疫苗接种点，路由为 `/dxy/vaccine/北京/北京/朝阳区`；

查看湖北省武汉市的新冠疫苗接种点，路由为 `/dxy/vaccine/湖北/武汉`；

查看湖北省武汉市武昌区的新冠疫苗接种点，路由为 `/dxy/vaccine/湖北/武汉/武昌区`。

:::tip

若参数为空，则返回全国所有新冠疫苗接种点。

:::

</Route>

## 东西智库 {#dong-xi-zhi-ku}

### 分类 {#dong-xi-zhi-ku-fen-lei}

<Route author="nczitzk" example="/dx2025" path="/dx2025/:type?/:category?" paramsDesc={['内容类别，见下表，默认为空', '行业分类，见下表，默认为空']}>

内容类别

| 产业观察             | 行业报告         | 政策   | 数据 |
| -------------------- | ---------------- | ------ | ---- |
| industry-observation | industry-reports | policy | data |

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

### 标签 {#dong-xi-zhi-ku-biao-qian}

<Route author="nczitzk" example="/dx2025/tag/3d_printing" path="/dx2025/tag/:category" paramsDesc={['标签分类，见下表，默认为空']}>

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

## 懂球帝 {#dong-qiu-di}

:::tip

-   可以通过头条新闻 + 参数过滤的形式获得早报、专题等内容。

:::

### 新闻 {#dong-qiu-di-xin-wen}

<Route author="HendricksZheng" example="/dongqiudi/top_news/1" path="/dongqiudi/top_news/:id?" paramsDesc={['类别 id，不填默认头条新闻']}>

| 头条 | 深度 | 闲情 | D 站 | 中超 | 国际 | 英超 | 西甲 | 意甲 | 德甲 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 1    | 55   | 37   | 219  | 56   | 120  | 3    | 5    | 4    | 6    |

</Route>

### 专题 {#dong-qiu-di-zhuan-ti}

<Route author="dxmpalb" example="/dongqiudi/special/41" path="/dongqiudi/special/:id" paramsDesc={['专题 id, 可自行通过 https://www.dongqiudi.com/special/+数字匹配']}>

| 新闻大爆炸 | 懂球帝十佳球 | 懂球帝本周 MVP |
| ---------- | ------------ | -------------- |
| 41         | 52           | 53             |

</Route>

### 早报 {#dong-qiu-di-zao-bao}

<Route author="HenryQW" example="/dongqiudi/daily" path="/dongqiudi/daily"/>

:::tip

部分球队和球员可能会有两个 id, 正确 id 应该由 `5000` 开头.

:::

### 足球赛果 {#dong-qiu-di-zu-qiu-sai-guo}

<Route author="HenryQW" example="/dongqiudi/result/50001755" path="/dongqiudi/result/:team" paramsDesc={['球队 id, 可在[懂球帝数据](https://www.dongqiudi.com/data)中找到']}/>

### 球队新闻 {#dong-qiu-di-qiu-dui-xin-wen}

<Route author="HenryQW" example="/dongqiudi/team_news/50001755" path="/dongqiudi/team_news/:team" paramsDesc={['球队 id, 可在[懂球帝数据](https://www.dongqiudi.com/data)中找到']}/>

### 球员新闻 {#dong-qiu-di-qiu-yuan-xin-wen}

<Route author="HenryQW" example="/dongqiudi/player_news/50000339" path="/dongqiudi/player_news/:id" paramsDesc={['球员 id, 可在[懂球帝数据](https://www.dongqiudi.com/data)中通过其队伍找到']}/>

## 端传媒 {#duan-chuan-mei}

通过提取文章全文，以提供比官方源更佳的阅读体验。

:::caution

付费内容全文可能需要登陆获取，详情见部署页面的配置模块。

:::

### 专题・栏目 {#duan-chuan-mei-zhuan-ti-%E3%83%BB-lan-mu}

<Route author="prnake" example="/theinitium/channel/latest/zh-hans" path="/theinitium/channel/:type?/:language?" paramsDesc={['栏目，缺省为最新', '语言，简体`zh-hans`，繁体`zh-hant`，缺省为简体']}>

Type 栏目：

| 最新   | 深度    | What’s New | 广场              | 科技       | 风物    | 特约    | ... |
| ------ | ------- | ---------- | ----------------- | ---------- | ------- | ------- | --- |
| latest | feature | news-brief | notes-and-letters | technology | culture | pick_up | ... |

更多栏目名称可通过 <https://theinitium.com/section/special/> 及 <https://theinitium.com/section/hot_channel/> 获取。

</Route>

### 话题・标签 {#duan-chuan-mei-hua-ti-%E3%83%BB-biao-qian}

<Route author="AgFlore" example="/theinitium/tags/2019_10/zh-hans" path="/theinitium/tags/:type/:language?" paramsDesc={['话题 ID，可从话题页 URL 中获取，如 <https://theinitium.com/tags/2019_10/>', '语言，简体`zh-hans`，繁体`zh-hant`，缺省为简体']}/>

### 作者 {#duan-chuan-mei-zuo-zhe}

<Route author="AgFlore" example="/theinitium/author/ninghuilulu/zh-hans" path="/theinitium/author/:type/:language?" paramsDesc={['作者 ID，可从作者主页 URL 中获取，如<https://theinitium.com/author/ninghuilulu/>','语言，简体`zh-hans`，繁体`zh-hant`，缺省为简体']}/>

### 个人订阅追踪动态 {#duan-chuan-mei-ge-ren-ding-yue-zhui-zong-dong-tai}

<Route author="AgFlore" example="/theinitium/follow/articles/zh-hans" path="/theinitium/follow/articles/:language?" paramsDesc={['语言，简体`zh-hans`，繁体`zh-hant`，缺省为简体']}>

:::caution

需要自建，详情见部署页面的配置模块。

:::

</Route>

## 多知网 {#duo-zhi-wang}

### 首页 {#duo-zhi-wang-shou-ye}

<Route author="WenryXu" example="/duozhi" path="/duozhi"/>

## 法律白話文運動 {#fa-l%C3%BC-bai-hua-wen-yun-dong}

### 最新文章 {#fa-l%C3%BC-bai-hua-wen-yun-dong-zui-xin-wen-zhang}

<Route author="emdoe" example="/plainlaw/archives" path="/plainlaw/archives"/>

## 樊登读书 {#fan-deng-du-shu}

### 樊登福州运营中心 {#fan-deng-du-shu-fan-deng-fu-zhou-yun-ying-zhong-xin}

<Route author="Fatpandac" example="/dushu/fuzhou" path="/dushu/fuzhou" />

## 飞雪娱乐网 {#fei-xue-yu-le-wang}

<Route author="nczitzk" example="/feixuew/rj" path="/feixuew/:id?" paramsDesc={['分类 id，可在对应分类页面的 URL 中找到，默认为首页最近更新']}>

| 实用软件 | 网站源码 | 技术教程 | 游戏助手 | 游戏资源 | 值得一看 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| rj       | wzym     | jsjc     | yx       | yxzy     | zdyk     |

</Route>

## 封面新闻 {#feng-mian-xin-wen}

### 频道 {#feng-mian-xin-wen-pin-dao}

<Route author="yuxinliu-alex" example="/thecover/channel/3560" path="/thecover/channel/:id?" paramsDesc={['对应id,可在频道链接中获取，默认为3892']}>

| 天下 | 四川 | 辟谣 | 国际 | 云招考 | 30 秒 | 拍客 | 体育 | 国内 | 帮扶铁军 | 文娱 | 宽窄 | 商业 | 千面 | 封面号 |
| ---- | ---- | ---- | ---- | ------ | ----- | ---- | ---- | ---- | -------- | ---- | ---- | ---- | ---- | ------ |
| 3892 | 3560 | 3909 | 3686 | 11     | 3902  | 3889 | 3689 | 1    | 4002     | 12   | 46   | 4    | 21   | 17     |

</Route>

## 風傳媒 {#feng-chuan-mei}

### 分类 {#feng-chuan-mei-fen-lei}

<Route author="nczitzk" example="/storm" path="/storm/:category?/:id?" paramsDesc={['分类，见下表，默认为新聞總覽', '子分类 ID，可在 URL 中找到']}>

| 新聞總覽 | 地方新聞      | 歷史頻道 | 評論總覽    |
| -------- | ------------- | -------- | ----------- |
| articles | localarticles | history  | all-comment |

:::tip

支持形如 <https://www.storm.mg/category/118> 的路由，即 [`/storm/category/118`](https://rsshub.app/storm/category/118)

支持形如 <https://www.storm.mg/localarticle-category/s149845> 的路由，即 [`/storm/localarticle-category/s149845`](https://rsshub.app/storm/localarticle-category/s149845)

:::

</Route>

## 凤凰网 {#feng-huang-wang}

### 资讯 {#feng-huang-wang-zi-xun}

<Route author="nczitzk" example="/ifeng/news" path="/ifeng/news/:path?" paramsDesc={['路径，对应分类资讯页 URL 路径，默认为空']}>

:::tip

路径处填写对应页面 URL 中 `https://news.ifeng.com/` 后的字段。下面是一个例子。

若订阅 [大湾区\_资讯\_凤凰网](https://news.ifeng.com/shanklist/3-305565-) 则将对应页面 URL <https://news.ifeng.com/shanklist/3-305565-> 中 `https://news.ifeng.com/` 后的字段 `shanklist/3-305565-` 作为路径填入。此时路由为 [`/ifeng/news/shanklist/3-305565-`](https://rsshub.app/ifeng/news/shanklist/3-305565-)

:::

</Route>

### 大风号 {#feng-huang-wang-da-feng-hao}

<Route author="Jamch" example="/ifeng/feng/2583/doc" path="/ifeng/feng/:id/:type" paramsDesc={['对应 id，可在 大风号作者页面 找到','类型，见下表']}>

| 文章 | 视频  |
| ---- | ----- |
| doc  | video |

</Route>

## 福利年 {#fu-li-nian}

### 文章 {#fu-li-nian-wen-zhang}

<Route author="nczitzk" example="/fulinian" path="/fulinian/:caty?" paramsDesc={['分类, 默认为首页最新发布']}>

| 技术教程         | 精品软件         | 网络资源         | 福利年惠 | 创业知识 | 正版教程         |
| ---------------- | ---------------- | ---------------- | -------- | -------- | ---------------- |
| technical-course | quality-software | network-resource | fulinian | chuangye | authentic-course |

</Route>

## 高科技行业门户 {#gao-ke-ji-hang-ye-men-hu}

### 新闻 {#gao-ke-ji-hang-ye-men-hu-xin-wen}

<Route author="luyuhuang" example="/ofweek/news" path="/ofweek/news"/>

## 公众号 360 {#gong-zhong-hao-360}

### 公众号 {#gong-zhong-hao-360-gong-zhong-hao}

<Route author="Rongronggg9" example="/gzh360/gzh/北京青年报" path="/gzh360/gzh/:name" paramsDesc={['公众号名，也可以是公众号 360 的内部 id']} radar="1" />

### 分类 {#gong-zhong-hao-360-fen-lei}

<Route author="Rongronggg9" example="/gzh360/category/5d357964e2eb992114a3d588" path="/gzh360/category/:id?" paramsDesc={['分类 id，见下表']} radar="1">

| `id`                       | 分类   |   | `id`                       | 分类 |
| -------------------------- | ------ | - | -------------------------- | ---- |
|                            | 首页   |   | `5d357ae6e2eb992114a3d592` | 育儿 |
| `5d357964e2eb992114a3d588` | 热门   |   | `5d357b00e2eb992114a3d593` | 旅游 |
| `5d3579a2e2eb992114a3d589` | 搞笑   |   | `5d357b17e2eb992114a3d594` | 职场 |
| `5d3579b0e2eb992114a3d58a` | 健康   |   | `5d357b34e2eb992114a3d595` | 美食 |
| `5d3579bae2eb992114a3d58b` | 私房话 |   | `5d357b4ae2eb992114a3d596` | 历史 |
| `5d357a10e2eb992114a3d58c` | 八卦精 |   | `5d357b60e2eb992114a3d597` | 教育 |
| `5d357a4ae2eb992114a3d58d` | 科技咖 |   | `5d357b76e2eb992114a3d598` | 星座 |
| `5d357a72e2eb992114a3d58e` | 财经迷 |   | `5d357b8de2eb992114a3d599` | 体育 |
| `5d357a8be2eb992114a3d58f` | 汽车控 |   | `5d357b9be2eb992114a3d59a` | 军事 |
| `5d357aa1e2eb992114a3d590` | 生活家 |   | `5d357bc2e2eb992114a3d59b` | 游戏 |
| `5d357ab6e2eb992114a3d591` | 时尚圈 |   | `5d357bd4e2eb992114a3d59c` | 萌宠 |

</Route>

## 观察者网 {#guan-cha-zhe-wang}

### 头条 {#guan-cha-zhe-wang-tou-tiao}

<Route author="nczitzk" example="/guancha/headline" path="/guancha/headline" />

### 首页 {#guan-cha-zhe-wang-shou-ye}

<Route author="nczitzk Jeason0228" example="/guancha" path="/guancha/:category?" paramsDesc={['分类，见下表，默认为全部']}>

| 全部 | 评论 & 研究 | 要闻  | 风闻    | 热点新闻 | 滚动新闻 |
| ---- | ----------- | ----- | ------- | -------- | -------- |
| all  | review      | story | fengwen | redian   | gundong  |

home = 评论 & 研究 + 要闻 + 风闻

others = 热点新闻 + 滚动新闻

:::tip

观察者网首页左中右的三个 column 分别对应 **评论 & 研究**、**要闻**、**风闻** 三个部分。

:::

</Route>

### 观学院 {#guan-cha-zhe-wang-guan-xue-yuan}

<Route author="nczitzk" example="/guancha/member/recommend" path="/guancha/member/:category?" paramsDesc={['分类，见下表']}>

| 精选      | 观书堂 | 在线课  | 观学院   |
| --------- | ------ | ------- | -------- |
| recommend | books  | courses | huodongs |

</Route>

### 风闻话题 {#guan-cha-zhe-wang-feng-wen-hua-ti}

<Route author="occupy5 nczitzk" example="/guancha/topic/110/1" path="/guancha/topic/:id?/:order?" paramsDesc={['话题 id，可在URL中找到，默认为全部，即为 `0`', '排序参数，见下表']}>

| 最新回复 | 最新发布 | 24 小时最热 | 3 天最热 | 7 天最热 | 3 个月最热 | 专栏文章 |
| -------- | -------- | ----------- | -------- | -------- | ---------- | -------- |
| 1        | 2        | 3           | 6        | 7        | 8          | 5        |

:::tip

仅在话题 id 为 0，即选择 全部 时，**3 个月最热**、**24 小时最热**、**3 天最热**、**7 天最热** 和 **专栏文章** 参数生效。

:::

</Route>

### 个人主页文章 {#guan-cha-zhe-wang-ge-ren-zhu-ye-wen-zhang}

<Route author="Jeason0228" example="/guancha/personalpage/243983" path="/guancha/personalpage/:uid" paramsDesc={['用户id， 可在URL中找到']} />

## 观点网 {#guan-dian-wang}

### 资讯 {#guan-dian-wang-zi-xun}

<Route author="drgnchan" example="/guandian/finance" path="/guandian/:category" paramsDesc={['资讯分类，可在URL中找到']} radar="1"/>

## 观海新闻 {#guan-hai-xin-wen}

### 首页 {#guan-hai-xin-wen-shou-ye}

<Route author="TonyRL" example="/guanhai" path="/guanhai" radar="1" rssbud="1"/>

## 广告门 {#guang-gao-men}

### 板块 {#guang-gao-men-ban-kuai}

<Route author="nczitzk" example="/adquan/info" path="/adquan/:type?" paramsDesc={['分类, 置空为首页']}>

| 行业观察 | 案例库   |
| -------- | -------- |
| info     | creative |

</Route>

## 国家高端智库 / 综合开发研究院 {#guo-jia-gao-duan-zhi-ku-%2F-zong-he-kai-fa-yan-jiu-yuan}

### 栏目 {#guo-jia-gao-duan-zhi-ku-%2F-zong-he-kai-fa-yan-jiu-yuan-lan-mu}

<Route author="nczitzk" example="/cdi" path="/cdi/:id?" paramsDesc={['分类，见下表，默认为综研国策']}>

| 樊纲观点 | 综研国策 | 综研观察 | 综研专访 | 综研视点 | 银湖新能源 |
| -------- | -------- | -------- | -------- | -------- | ---------- |
| 102      | 152      | 150      | 153      | 154      | 151        |

</Route>

## 果壳网 {#guo-ke-wang}

### 科学人 {#guo-ke-wang-ke-xue-ren}

<Route author="alphardex nczitzk" example="/guokr/scientific" path="/guokr/scientific"/>

### 果壳网专栏 {#guo-ke-wang-guo-ke-wang-zhuan-lan}

<Route author="DHPO hoilc" example="/guokr/calendar" path="/guokr/:channel" paramsDesc={['专栏类别']}>

| 物种日历 | 吃货研究所 | 美丽也是技术活 |
| -------- | ---------- | -------------- |
| calendar | institute  | beauty         |

</Route>

## 好奇心日报 {#hao-qi-xin-ri-bao}

### 标签，栏目，分类 {#hao-qi-xin-ri-bao-biao-qian-%EF%BC%8C-lan-mu-%EF%BC%8C-fen-lei}

<Route author="WenhuWee emdoe SivaGao HenryQW" example="/qdaily/column/59" path="/qdaily/:type/:id" paramsDesc={['类型，见下表', '对应 id，可在 URL 找到']} radar="1" rssbud="1">

| 标签 | 栏目   | 分类     |
| ---- | ------ | -------- |
| tag  | column | category |

</Route>

## 后续 {#hou-xu}

### 热点 {#hou-xu-re-dian}

<Route author="nczitzk" example="/houxu" path="/houxu" />

### 跟踪 {#hou-xu-gen-zong}

<Route author="nczitzk" example="/houxu/memory" path="/houxu/memory" />

### 专栏 {#hou-xu-zhuan-lan}

<Route author="ciaranchen nczitzk" example="/houxu/events" path="/houxu/events"/>

### Live {#hou-xu-live}

<Route author="ciaranchen sanmmm nczitzk" example="/houxu/lives/33899" path="/houxu/lives/:id" paramsDesc={['编号，可在对应 Live 页面的 URL 中找到']}/>

## 虎嗅 {#hu-xiu}

### 首页资讯 {#hu-xiu-shou-ye-zi-xun}

<Route author="HenryQW" example="/huxiu/article" path="/huxiu/article" />

### 24 小时 {#hu-xiu-24-xiao-shi}

<Route author="nczitzk" example="/huxiu/moment" path="/huxiu/moment" />

### 标签 {#hu-xiu-biao-qian}

<Route author="xyqfer HenryQW" example="/huxiu/tag/291" path="/huxiu/tag/:id" paramsDesc={['标签 id']} />

### 搜索 {#hu-xiu-sou-suo}

<Route author="xyqfer HenryQW" example="/huxiu/search/%E8%99%8E%E5%97%85%E6%97%A9%E6%8A%A5" path="/huxiu/search/:keyword" paramsDesc={['关键字']} />

### 作者 {#hu-xiu-zuo-zhe}

<Route author="HenryQW" example="/huxiu/author/29318" path="/huxiu/author/:id" paramsDesc={['用户 id']} />

### 文集 {#hu-xiu-wen-ji}

<Route author="AlexdanerZe" example="/huxiu/collection/212" path="/huxiu/collection/:id" paramsDesc={['文集 id']} />

### 简报 {#hu-xiu-jian-bao}

<Route author="Fatpandac" example="/huxiu/briefcolumn/1" path="/huxiu/briefcolumn/:id" paramsDesc={['简报 id']} />

## 互动吧 {#hu-dong-ba}

### 活动 {#hu-dong-ba-huo-dong}

<Route author="nczitzk" example="/hudongba/beijing/98-0-2-0-1-1" path="/hudongba/:city/:id" paramsDesc={['城市，可在选定所在城市后的页面 URL 中找到', '编号，可在选定筛选条件后的页面 URL 中找到']}>

如例子 `/hudongba/beijing/98-0-2-0-1-1` 对应的网址 `https://www.hudongba.com/beijing/98-0-2-0-0-1` 中，`beijing` 即所在城市为北京；`98-0-2-0-0-1` 则是所选择的分类编号，指分类不限、时间不限、综合排序的所有亲子活动。

</Route>

## 机核网 {#ji-he-wang}

### 分类 {#ji-he-wang-fen-lei}

<Route author="MoguCloud" example="/gcores/category/news" path="/gcores/category/:category" paramsDesc={['分类名']} radar="1">

| 资讯 | 视频   | 电台   | 文章     |
| ---- | ------ | ------ | -------- |
| news | videos | radios | articles |

</Route>

### 标签 {#ji-he-wang-biao-qian}

<Route author="StevenRCE0" example="/gcores/tag/42/articles" path="/gcores/tag/:tag/:category?" paramsDesc={['标签名，可在选定标签分类页面的 URL 中找到，如视觉动物——42', '分类名']} radar="1">

分类名同上。

</Route>

### 专题文章 {#ji-he-wang-zhuan-ti-wen-zhang}

<Route author="kudryavka1013" example="/gcores/collections/64" path="/gcores/collections/:collection" paramsDesc={['专题id，可在专题页面的 URL 中找到，如 游戏开发设计心得分享 -- 64']} radar="1" />

### 播客 {#ji-he-wang-bo-ke}

<Route author="eternasuno" example="/gcores/radios/45" path="/gcores/radios/:category?" paramsDesc={['分类名，默认为全部，可在分类页面的 URL 中找到，如 Gadio News -- 45']} radar="1" supportPodcast="1" />

## 纪妖 {#ji-yao}

### 通用 {#ji-yao-tong-yong}

<Route author="nczitzk" example="/cbaigui" path="/cbaigui/:path+" paramsDesc={['路径，默认为首页']}>

:::tip

若订阅 [标签：妖](https://www.cbaigui.com/post-tag/妖)，网址为 [https://www.cbaigui.com/post-tag/ 妖](https://www.cbaigui.com/post-tag/妖)。截取 `https://www.cbaigui.com` 到末尾的部分 `/post-tag/妖` 作为参数，此时路由为 [`/cbaigui/post-tag/妖`](https://rsshub.app/cbaigui/post-tag/妖)。

若订阅 [分类：埃及](https://www.cbaigui.com/post-category/世界/非洲/埃及)，网址为 [https://www.cbaigui.com/post-category/ 世界 / 非洲 / 埃及](https://www.cbaigui.com/post-category/世界/非洲/埃及)。截取 `https://www.cbaigui.com` 到末尾的部分 `/post-category/世界/非洲/埃及` 作为参数，此时路由为 [`/cbaigui/post-category/世界/非洲/埃及`](https://rsshub.app/cbaigui/post-category/世界/非洲/埃及)。

若订阅 [词条：白泽图](https://www.cbaigui.com/post-category/词条/白泽图)，网址为 [https://www.cbaigui.com/post-category/ 词条 / 白泽图](https://www.cbaigui.com/post-category/词条/白泽图)。截取 `https://www.cbaigui.com` 到末尾的部分 `/post-category/词条/白泽图` 作为参数，此时路由为 [`/cbaigui/post-category/词条/白泽图`](https://rsshub.app/cbaigui/post-category/词条/白泽图)。

:::

</Route>

## 加美财经 {#jia-mei-cai-jing}

### 分类 {#jia-mei-cai-jing-fen-lei}

<Route author="nczitzk" example="/caus" path="/caus/:category?" paramsDesc={['分类，见下表，默认为全部']} radar="1">

| 全部 | 要闻 | 商业 | 快讯 | 财富 | 生活 |
| ---- | ---- | ---- | ---- | -------- | ---- |
| 0    | 1    | 2    | 3    | 8        | 6    |

</Route>

## 贾真的电商 108 将 {#jia-zhen-de-dian-shang-108-jiang}

### 「108 将」实战分享 {#jia-zhen-de-dian-shang-108-jiang-%E3%80%8C108-jiang-%E3%80%8D-shi-zhan-fen-xiang}

<Route author="nczitzk" example="/jiazhen108" path="/jiazhen108" />

## 簡訊設計 {#jian-xun-she-ji}

### 志祺七七 {#jian-xun-she-ji-zhi-qi-qi-qi}

<Route author="haukeng" example="/simpleinfo" path="/simpleinfo/:category?" radar="1" rssbud="1" paramsDesc={['分类名']}>

| 夥伴聊聊 | 專案設計 |
| -------- | -------- |
| work     | talk     |

| 國內外新聞 | 政治百分百 | 社會觀察家 | 心理與哲學            |
| ---------- | ---------- | ---------- | --------------------- |
| news       | politics   | society    | psychology-philosophy |

| 科學大探索 | 環境與健康         | ACG 快樂聊 | 好書籍分享   | 其它主題     |
| ---------- | ------------------ | ---------- | ------------ | ------------ |
| science    | environment-health | acg        | book-sharing | other-topics |

</Route>

## 健康界 {#jian-kang-jie}

### 首页 {#jian-kang-jie-shou-ye}

<Route author="qnloft" example="/cn-healthcare/index" path="/cn-healthcare/index" />

## 今日热榜 {#jin-ri-re-bang}

:::caution

由于需要登录后的 Cookie 值才能获取原始链接，所以需要自建，需要在环境变量中配置 `TOPHUB_COOKIE`，详情见部署页面的配置模块。

:::

### 榜单 {#jin-ri-re-bang-bang-dan}

<Route author="LogicJake"  example="/tophub/Om4ejxvxEN" path="/tophub/:id" paramsDesc={['榜单id，可在 URL 中找到']}/>

## 今日头条 {#jin-ri-tou-tiao}

### 关键词 {#jin-ri-tou-tiao-guan-jian-ci}

<Route author="uni-zheng" example="/jinritoutiao/keyword/AI" path="/jinritoutiao/keyword/:keyword" paramsDesc={['关键词']} anticrawler="1"/>

## 金色财经 {#jin-se-cai-jing}

### 快讯 {#jin-se-cai-jing-kuai-xun}

<Route author="nczitzk" example="/jinse/lives" path="/jinse/lives"/>

### 头条 {#jin-se-cai-jing-tou-tiao}

<Route author="nczitzk" example="/jinse/timeline" path="/jinse/timeline"/>

### 分类 {#jin-se-cai-jing-fen-lei}

<Route author="nczitzk" example="/jinse/catalogue/zhengce" path="/jinse/catalogue/:caty" paramsDesc={['分类名，参见下表']}>

| 政策    | 行情         | DeFi | 矿业  | 以太坊 2.0 | 产业     | IPFS | 技术 | 百科  | 研报          |
| ------- | ------------ | ---- | ----- | ---------- | -------- | ---- | ---- | ----- | ------------- |
| zhengce | fenxishishuo | defi | kuang | 以太坊 2.0 | industry | IPFS | tech | baike | capitalmarket |

</Route>

## 鲸跃汽车 {#jing-yue-qi-che}

### 首页 {#jing-yue-qi-che-shou-ye}

<Route author="LogicJake" example="/whalegogo/home" path="/whalegogo/home"/>

### 其他栏目 {#jing-yue-qi-che-qi-ta-lan-mu}

<Route author="Jeason0228" example="/whalegogo/portal/2" path="/whalegogo/portal/:type_id/:tagid?/" paramsDesc={['type_id,栏目id','tagid,标签id']}>

| 快讯                 | 文章                 | 活动                 | 评测                 | 视频               | 访谈               |
| -------------------- | -------------------- | -------------------- | -------------------- | ------------------ | ------------------ |
| type_id=2,tagid 不填 | type_id=1,tagid 不填 | type_id=7,tagid 不填 | type_id=8,tagid 不填 | type_id=1,tagid=70 | type_id=1,tagid=73 |

</Route>

## 九三学社 {#jiu-san-xue-she}

### 分类 {#jiu-san-xue-she-fen-lei}

<Route author="nczitzk" example="/93/lxzn-yzjy" path="/93/:category?" paramsDesc={['分类，可在对应分类页的 URL 中找到']}/>

## 巨潮资讯 {#ju-chao-zi-xun}

<Route author="LogicJake hillerliao laampui nczitzk" example="/cninfo/announcement/szse/000002/gssz0000002/category_ndbg_szsh" path="/cninfo/announcement/:column/:code/:orgId/:category?/:search?" paramsDesc={['szse 深圳证券交易所; sse 上海证券交易所; third 新三板; hke 港股; fund 基金', '股票或基金代码', 'orgId 组织 id', '公告分类，A 股及新三板，见下表，默认为全部', '标题关键字，默认为空']}>

column 为 szse 或 sse 时可选的 category:

| 全部 | 年报               | 半年报              | 一季报              | 三季报              | 业绩预告              | 权益分派               | 董事会              | 监事会              | 股东大会           | 日常经营           | 公司治理           | 中介报告         | 首发             | 增发             | 股权激励           | 配股             | 解禁             | 公司债             | 可转债             | 其他融资           | 股权变动           | 补充更正           | 澄清致歉           | 风险提示           | 特别处理和退市       | 退市整理期          |
| ---- | ------------------ | ------------------- | ------------------- | ------------------- | --------------------- | ---------------------- | ------------------- | ------------------- | ------------------ | ------------------ | ------------------ | ---------------- | ---------------- | ---------------- | ------------------ | ---------------- | ---------------- | ------------------ | ------------------ | ------------------ | ------------------ | ------------------ | ------------------ | ------------------ | -------------------- | ------------------- |
| all  | category_ndbg_szsh | category_bndbg_szsh | category_yjdbg_szsh | category_sjdbg_szsh | category_yjygjxz_szsh | category_qyfpxzcs_szsh | category_dshgg_szsh | category_jshgg_szsh | category_gddh_szsh | category_rcjy_szsh | category_gszl_szsh | category_zj_szsh | category_sf_szsh | category_zf_szsh | category_gqjl_szsh | category_pg_szsh | category_jj_szsh | category_gszq_szsh | category_kzzq_szsh | category_qtrz_szsh | category_gqbd_szsh | category_bcgz_szsh | category_cqdq_szsh | category_fxts_szsh | category_tbclts_szsh | category_tszlq_szsh |

column 为 third 时可选的 category:

| 全部 | 临时公告      | 定期公告      | 中介机构公告  | 持续信息披露  | 首次信息披露  |
| ---- | ------------- | ------------- | ------------- | ------------- | ------------- |
| all  | category_lsgg | category_dqgg | category_zjjg | category_cxpl | category_scpl |

:::tip

需要筛选多个 category 时，应使用 `;` 将多个字段连接起来。

如 “年报 + 半年报” 即 `category_ndbg_szsh;category_bndbg_szsh`

:::

</Route>

## 决胜网 {#jue-sheng-wang}

### 最新资讯 {#jue-sheng-wang-zui-xin-zi-xun}

<Route author="WenryXu" example="/juesheng" path="/juesheng"/>

## 卡卡洛普 {#ka-ka-luo-pu}

### 宅宅新聞 - 分類 {#ka-ka-luo-pu-zhai-zhai-xin-wen---fen-lei}

<Route author="TonyRL" example="/gamme/news" path="/gamme/news/:category?" paramsDesc={['分類名，可在 URL 找到，預設為 `all`']} radar="1" rssbud="1"/>

### 宅宅新聞 - 標籤 {#ka-ka-luo-pu-zhai-zhai-xin-wen---biao-qian}

<Route author="TonyRL" example="/gamme/news/tag/歐派" path="/gamme/news/tag/:tag" paramsDesc={['標籤，可在 URL 找到']} radar="1" rssbud="1"/>

### 西斯新聞 - 分類 {#ka-ka-luo-pu-xi-si-xin-wen---fen-lei}

<Route author="TonyRL" example="/gamme/sexynews" path="/gamme/sexynews/:category?" paramsDesc={['分類名，可在 URL 找到，預設為 `all`']} radar="1" rssbud="1"/>

### 西斯新聞 - 標籤 {#ka-ka-luo-pu-xi-si-xin-wen---biao-qian}

<Route author="TonyRL" example="/gamme/sexynews/tag/歐派" path="/gamme/sexynews/tag/:tag" paramsDesc={['標籤，可在 URL 找到']} radar="1" rssbud="1"/>

## 科技島讀 {#ke-ji-dao-du}

### 分類 {#ke-ji-dao-du-fen-lei}

<Route author="nczitzk" example="/daodu" path="/daodu/:caty?" paramsDesc={['分類，默認為全部']}>

| 全部 | 文章    | Podcast |
| ---- | ------- | ------- |
| all  | article | podcast |

</Route>

## 科学网 {#ke-xue-wang}

### 精选博客 {#ke-xue-wang-jing-xuan-bo-ke}

<Route author="nczitzk" example="/sciencenet/blog" path="/sciencenet/blog/:type?/:time?/:sort?" paramsDesc={['类型，见下表，默认为推荐', '时间，见下表，默认为所有时间', '排序，见下表，默认为按发表时间排序']}>

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

### 用户博客 {#ke-xue-wang-yong-hu-bo-ke}

<Route author="nczitzk" example="/sciencenet/user/tony8310" path="/sciencenet/user/:id" paramsDesc={['用户 id，可在对用户博客页 URL 中找到']}/>

## 快科技 {#kuai-ke-ji}

### 新闻 {#kuai-ke-ji-xin-wen}

<Route author="nczitzk" example="/mydrivers" path="/mydrivers/:type?/:id?" paramsDesc={['类型，见下表，默认为最新', '编号，可在对应页面地址栏中找到']}>

:::tip

使用 **类型** 表中的两个参数时，编号应留空，如：**最新** 为 [`/mydrivers/new`](https://rsshub.app/mydrivers/new)

使用 **编号** 表中的参数不应遗漏对应类型参数，如 **电脑** 为 [`/mydrivers/bcid/801`](https://rsshub.app/mydrivers/bcid/801)

:::

类型

| 最新 | 热门 |
| ---- | ---- |
| new  | hot  |

编号

| 最新   | 最热   | 电脑     | 手机     | 汽车     | 业界     |
| ------ | ------ | -------- | -------- | -------- | -------- |
| ac/new | ac/hot | bcid/801 | bcid/802 | bcid/807 | bcid/803 |

| 科学     | 排行     | 评测     | 安卓     | 苹果    | CPU    |
| -------- | -------- | -------- | -------- | ------- | ------ |
| tid/1000 | tid/1001 | tid/1002 | icid/121 | cid/201 | cid/13 |

| 显卡   | 一图     | 阿里     | 微软    | 百度    | 影视     |
| ------ | -------- | -------- | ------- | ------- | -------- |
| cid/12 | tid/1003 | icid/270 | icid/90 | icid/67 | bcid/809 |

| 游戏     | 路由器 | PS5       | Xbox     | 华为     | OPPO     |
| -------- | ------ | --------- | -------- | -------- | -------- |
| bcid/806 | cid/38 | icid/6950 | icid/194 | icid/136 | icid/148 |

| 小米      | VIVO     | 三星     | 魅族     | 一加     | 特斯拉    |
| --------- | -------- | -------- | -------- | -------- | --------- |
| icid/9355 | icid/288 | icid/154 | icid/140 | icid/385 | icid/1193 |

| 比亚迪   | 小鹏      | 蔚来      | 理想       | 奔驰     | 宝马     | 大众     |
| -------- | --------- | --------- | ---------- | -------- | -------- | -------- |
| icid/770 | icid/7259 | icid/7318 | icid/12947 | icid/429 | icid/461 | icid/481 |

</Route>

### 最新新闻 {#kuai-ke-ji-zui-xin-xin-wen}

<Route author="kt286" example="/kkj/news" path="/kkj/news"/>

## 快媒体 {#kuai-mei-ti}

### 首页更新 {#kuai-mei-ti-shou-ye-geng-xin}

<Route author="xfangbao" example="/kuai" path="/kuai" />

### 具体栏目更新 {#kuai-mei-ti-ju-ti-lan-mu-geng-xin}

<Route author="xfangbao" example="/kuai/1" path="/kuai/:id" />

具体栏目编号，去网站上看标签

| 网址                                                                                              | 对应路由 |
| ------------------------------------------------------------------------------------------------- | -------- |
| kuai.media                                                                                        | /kuai    |
| [www.kuai.media/portal.php?mod=list&catid=38](http://www.kuai.media/portal.php?mod=list&catid=38) | /kuai/38 |

## 快知 {#kuai-zhi}

### 话题 {#kuai-zhi-hua-ti}

<Route author="hoilc" example="/kzfeed/topic/KklZRd9a04OgA" path="/kzfeed/topic/:id" paramsDesc={['话题ID, 可以从话题URL中获得']}/>

## 老司机 {#lao-si-ji}

### 首页 {#lao-si-ji-shou-ye}

<Route author="xyqfer" example="/laosiji/feed" path="/laosiji/feed"/>

### 24 小时热门 {#lao-si-ji-24-xiao-shi-re-men}

<Route author="xyqfer" example="/laosiji/hot" path="/laosiji/hot"/>

### 节目 {#lao-si-ji-jie-mu}

<Route author="xyqfer" example="/laosiji/hotshow/128" path="/laosiji/hotshow/:id" paramsDesc={['节目 id']}/>

## 雷峰网 {#lei-feng-wang}

### 最新文章 {#lei-feng-wang-zui-xin-wen-zhang}

<Route author="vlcheng" example="/leiphone" path="/leiphone"/>

### 业界资讯 {#lei-feng-wang-ye-jie-zi-xun}

<Route author="vlcheng" example="/leiphone/newsflash" path="/leiphone/newsflash"/>

### 栏目 {#lei-feng-wang-lan-mu}

<Route author="vlcheng" example="/leiphone/category/industrynews" path="/leiphone/category/:catname" paramsDesc={['网站顶部分类栏目']}>

-   主栏目

| 业界         | 人工智能 | 智能驾驶       | 数智化          | 金融科技 | 医疗科技 | 芯片  | 政企安全   | 智慧城市  | 行业云        | 工业互联网         | AIoT |
| ------------ | -------- | -------------- | --------------- | -------- | -------- | ----- | ---------- | --------- | ------------- | ------------------ | ---- |
| industrynews | ai       | transportation | digitalindustry | fintech  | aihealth | chips | gbsecurity | smartcity | industrycloud | IndustrialInternet | iot  |

-   子栏目

-   人工智能

| 学术     | 开发者   |
| -------- | -------- |
| academic | yanxishe |

-   数智化

| 零售数智化 | 金融数智化 | 工业数智化 | 医疗数智化 | 城市数智化  |
| ---------- | ---------- | ---------- | ---------- | ----------- |
| redigital  | findigital | mandigital | medigital  | citydigital |

-   金融科技

| 科技巨头 | 银行 AI | 金融云       | 风控与安全   |
| -------- | ------- | ------------ | ------------ |
| BigTech  | bank    | FinanceCloud | DataSecurity |

-   医疗科技

| 医疗 AI  | 投融资 | 医疗器械 | 互联网医疗       | 生物医药     | 健康险       |
| -------- | ------ | -------- | ---------------- | ------------ | ------------ |
| healthai | touzi  | qixie    | hulianwangyiliao | shengwuyiyao | jiankangxian |

-   芯片

| 材料设备  | 芯片设计   | 晶圆代工      | 封装测试  |
| --------- | ---------- | ------------- | --------- |
| materials | chipdesign | manufacturing | packaging |

-   智慧城市

| 智慧安防      | 智慧教育       | 智慧交通            | 智慧社区       | 智慧零售       | 智慧政务        | 智慧地产 |
| ------------- | -------------- | ------------------- | -------------- | -------------- | --------------- | -------- |
| smartsecurity | smarteducation | smarttransportation | smartcommunity | smartretailing | smartgovernment | proptech |

-   工业互联网

| 工业软件   | 工业安全 | 5G 工业互联网 | 工业转型实践 |
| ---------- | -------- | ------------- | ------------ |
| gysoftware | gysafety | 5ggy          | gypratice    |

-   AIoT

| 物联网 | 智能硬件 | 机器人 | 智能家居  |
| ------ | -------- | ------ | --------- |
| 5G     | arvr     | robot  | smarthome |

</Route>

## 链捕手 ChainCatcher {#lian-bu-shou-chaincatcher}

### 首页 {#lian-bu-shou-chaincatcher-shou-ye}

<Route author="TonyRL" example="/chaincatcher" path="/chaincatcher"  radar="1" rssbud="1"/>

### 快讯 {#lian-bu-shou-chaincatcher-kuai-xun}

<Route author="TonyRL" example="/chaincatcher/news" path="/chaincatcher/news"  radar="1" rssbud="1"/>

## 链新闻 ABMedia {#lian-xin-wen-abmedia}

### 首页最新新闻 {#lian-xin-wen-abmedia-shou-ye-zui-xin-xin-wen}

<Route author="Fatpandac" example="/abmedia/index" path="/abmedia/index"/>

### 类别 {#lian-xin-wen-abmedia-lei-bie}

<Route author="Fatpandac" example="/abmedia/technology-development" path="/abmedia/:category?" paramsDesc={['类别，默认为产品技术']}>

参数可以从链接中拿到，如：

`https://www.abmedia.io/category/technology-development` 对应 `/abmedia/technology-development`

</Route>

## 留园网 {#liu-yuan-wang}

### 分站 {#liu-yuan-wang-fen-zhan}

<Route author="nczitzk" example="/6park" path="/6park/:id?" paramsDesc={['分站，见下表，默认为史海钩沉']}>

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

:::tip

酷 18 文档参见 [此处](https://docs.rsshub.app/picture#ku-18)

禁忌书屋文档参见 [此处](https://docs.rsshub.app/routes/reading#jin-ji-shu-wu)

:::

</Route>

### 精华区 {#liu-yuan-wang-jing-hua-qu}

<Route author="nczitzk" example="/6park/chan1/gold" path="/6park/:id/gold" paramsDesc={['分站，见上表']}/>

### 搜索关键字 {#liu-yuan-wang-sou-suo-guan-jian-zi}

<Route author="nczitzk" example="/6park/chan1/keywords/都市" path="/6park/:id/keywords/:keyword?" paramsDesc={['分站，见上表', '关键字']}/>

### 新闻栏目 {#liu-yuan-wang-xin-wen-lan-mu}

<Route author="nczitzk" example="/6park/news" path="/6park/news/:site?/:id?" paramsDesc={['分站，见下表，默认为 newspark', '栏目 id']}>

分站

| newspark | local |
| -------- | ----- |

:::tip

若订阅 [时政](https://www.6parknews.com/newspark/index.php?type=1)，其网址为 <https://www.6parknews.com/newspark/index.php?type=1>，其中 `newspark` 为分站，`1` 为栏目 id。

若订阅 [美国](https://local.6parknews.com/index.php?type_id=1)，其网址为 <https://local.6parknews.com/index.php?type_id=1>，其中 `local` 为分站，`1` 为栏目 id。

:::

</Route>

### 头条精选 {#liu-yuan-wang-tou-tiao-jing-xuan}

<Route author="nczitzk" example="/6park/news/newspark/gold" path="/6park/news/newspark/gold"/>

### 新闻搜索 {#liu-yuan-wang-xin-wen-sou-suo}

<Route author="nczitzk" example="/6park/news/newspark/keywords/搜索" path="/6park/news/newspark/keywords/:keyword?" paramsDesc={['关键字']}/>

## 隆众资讯 {#long-zhong-zi-xun}

### 资讯 {#long-zhong-zi-xun-zi-xun}

<Route author="nczitzk" example="/oilchem/list/140/18263" path="/oilchem/:type?/:category?/:subCategory?" paramsDesc={['类别 id，可在对应类别页中找到，默认为首页', '分类 id，可在对应分类页中找到', '子分类 id，可在对应分类页中找到']}>

以下是几个例子：

[**化工**](https://chem.oilchem.net) <https://chem.oilchem.net> 中，类别 id 为 `chem`，分类 id 为空，子分类 id 为空，对应路由即为 [`/oilchem/chem`](https://rsshub.app/oilchem/list/140/18263)

[**甲醇**](https://chem.oilchem.net/chemical/methanol.shtml) 的相关资讯有两个页面入口：其一 <https://chem.oilchem.net/chemical/methanol.shtml> 中，类别 id 为 `chem`，分类 id 为 `chemical`，子分类 id 为 `methanol`，对应路由即为 [`/oilchem/chem/chemical/methanol`](https://rsshub.app/oilchem/chem/chemical/methanol) 或其二 <https://list.oilchem.net/140> 中，类别 id 为 `list`，分类 id 为 `140`，子分类 id 为空，对应路由即为 [`/oilchem/list/140`](https://rsshub.app/oilchem/list/140)；

[**甲醇热点聚焦**](https://list.oilchem.net/140/18263) <https://list.oilchem.net/140/18263> 中，类别 id 为 `list`，分类 id 为 `140`，子分类 id 为 `18263`，对应路由即为 [`/oilchem/list/140/18263`](https://rsshub.app/oilchem/list/140/18263)

</Route>

## 律动 {#l%C3%BC-dong}

### 新闻快讯 {#l%C3%BC-dong-xin-wen-kuai-xun}

<Route author="Fatpandac jameshih" example="/blockbeats/newsflash" path="/blockbeats/:channel?" paramsDesc={['类型，见下表，默认为快讯']}>

|    快讯   |   文章  |
| :-------: | :-----: |
| newsflash | article |

</Route>

## 論盡媒體 AllAboutMacau Media {#lun-jin-mei-ti-allaboutmacau-media}

### 话题 {#lun-jin-mei-ti-allaboutmacau-media-hua-ti}

<Route author="nczitzk" example="/aamacau" path="/aamacau/:category?/:id?" paramsDesc={['分类，见下表，默认为即時報道', 'id，可在对应页面 URL 中找到，默认为空']}>

| 即時報道     | 每週專題    | 藝文爛鬼樓 | 論盡紙本 | 新聞事件 | 特別企劃 |
| ------------ | ----------- | ---------- | -------- | -------- | -------- |
| breakingnews | weeklytopic | culture    | press    | case     | special  |

:::tip

除了直接订阅分类全部文章（如 [每週專題](https://aamacau.com/topics/weeklytopic) 的对应路由为 [/aamacau/weeklytopic](https://rsshub.app/aamacau/weeklytopic)），你也可以订阅特定的专题，如 [【9-12】2021 澳門立法會選舉](https://aamacau.com/topics/【9-12】2021澳門立法會選舉) 的对应路由为 [/【9-12】2021 澳門立法會選舉](https://rsshub.app/aamacau/【9-12】2021澳門立法會選舉)。

分类中的专题也可以单独订阅，如 [新聞事件](https://aamacau.com/topics/case) 中的 [「武漢肺炎」新聞檔案](https://aamacau.com/topics/case/「武漢肺炎」新聞檔案) 对应路由为 [/case/「武漢肺炎」新聞檔案](https://rsshub.app/aamacau/case/「武漢肺炎」新聞檔案)。

同理，其他分类同上例子也可以订阅特定的单独专题。

:::

</Route>

## 妈咪帮 {#ma-mi-bang}

<Route author="nczitzk" example="/mamibuy" path="/mamibuy/:caty?/:age?/:sort?" paramsDesc={['分类，见下表，默认为全分類', '岁数，见下表，默认为不限', '排序，见下表，默认为最新']}>

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

## 慢雾科技 {#man-wu-ke-ji}

### 动态 {#man-wu-ke-ji-dong-tai}

<Route author="AtlasQuan" example="/slowmist/research" path="/slowmist/:type?" paramsDesc={['分类，见下表，默认为公司新闻']}>

| 公司新闻 | 漏洞披露 | 技术研究 |
| -------- | -------- | -------- |
| news     | vul      | research |

</Route>

## 貓奴日常 {#mao-nu-ri-chang}

### 分類 {#mao-nu-ri-chang-fen-lei}

<Route author="TonyRL" example="/thecatcity" path="/thecatcity/:term?" paramsDesc={['見下表，留空為全部文章']} radar="1" rssbud="1">

| 貓物分享 | 貓咪新聞 | 養貓大全 | 貓奴景點 | 新手養貓教學 |
| -------- | -------- | -------- | -------- | ------------ |
| 1        | 2        | 3        | 4        | 5            |

</Route>

## 梅花网 {#mei-hua-wang}

### 作品 {#mei-hua-wang-zuo-pin}

<Route author="nczitzk" example="/meihua/shots/latest" path="/meihua/shots/:caty">

| 最新   | 热门 | 推荐      |
| ------ | ---- | --------- |
| latest | hot  | recommend |

</Route>

### 文章 {#mei-hua-wang-wen-zhang}

<Route author="nczitzk" example="/meihua/article/latest" path="/meihua/article/:caty">

| 最新   | 热门 |
| ------ | ---- |
| latest | hot  |

</Route>

## 梅斯医学 MedSci {#mei-si-yi-xue-medsci}

### 资讯 {#mei-si-yi-xue-medsci-zi-xun}

<Route author="nczitzk" example="/medsci" path="/medsci/:sid?/:tid?" paramsDesc={['科室，见下表，默认为推荐', '亚专业，可在对应科室页 URL 中找到，默认为该科室的全部']}>

:::tip

下表为科室对应的 sid，若想获得 tid，可以到对应科室页面 URL 中寻找 `t_id` 字段的值，下面是一个例子：

如 [肿瘤 - NSCLC](https://www.medsci.cn/department/details?s_id=5&t_id=277) 的 URL 为 <https://www.medsci.cn/department/details?s_id=5&t_id=277>，可以看到此时 `s_id` 对应 `sid` 的值为 5， `t_id` 对应 `tid` 的值为 277，所以可以得到路由 [`/medsci/5/277`](https://rsshub.app/medsci/5/277)

:::

| 心血管 | 内分泌 | 消化 | 呼吸 | 神经科 |
| ------ | ------ | ---- | ---- | ------ |
| 2      | 6      | 4    | 12   | 17     |

| 传染科 | 精神心理 | 肾内科 | 风湿免疫 | 血液科 |
| ------ | -------- | ------ | -------- | ------ |
| 9      | 13       | 14     | 15       | 21     |

| 老年医学 | 胃肠外科 | 血管外科 | 肝胆胰外 | 骨科 |
| -------- | -------- | -------- | -------- | ---- |
| 19       | 76       | 92       | 91       | 10   |

| 普通外科 | 胸心外科 | 神经外科 | 泌尿外科 | 烧伤科 |
| -------- | -------- | -------- | -------- | ------ |
| 23       | 24       | 25       | 26       | 27     |

| 整形科 | 麻醉疼痛 | 罕见病 | 康复医学 | 药械 |
| ------ | -------- | ------ | -------- | ---- |
| 28     | 29       | 304    | 95       | 11   |

| 儿科 | 耳鼻咽喉 | 口腔科 | 眼科 | 政策人文 |
| ---- | -------- | ------ | ---- | -------- |
| 18   | 30       | 31     | 32   | 33       |

| 营养全科 | 预防公卫 | 妇产科 | 中医科 | 急重症 |
| -------- | -------- | ------ | ------ | ------ |
| 34       | 35       | 36     | 37     | 38     |

| 皮肤性病 | 影像放射 | 转化医学 | 检验病理 | 护理 |
| -------- | -------- | -------- | -------- | ---- |
| 39       | 40       | 42       | 69       | 79   |

| 糖尿病 | 冠心病 | 肝病 | 乳腺癌 |
| ------ | ------ | ---- | ------ |
| 8      | 43     | 22   | 89     |

</Route>

## 镁客网 im2maker {#mei-ke-wang-im2maker}

### 镁客网频道 {#mei-ke-wang-im2maker-mei-ke-wang-pin-dao}

<Route author="jin12180000" example="/im2maker/" path="/im2maker/:channel?" paramsDesc={['默认不填为 最新文章 ，频道如下']}>

| 最新文章 | 行业快讯 | 行业观察 | 镁客请讲 | 硬科技 100 人 | 投融界   | 万象       |
| -------- | -------- | -------- | -------- | ------------- | -------- | ---------- |
| 默认空   | fresh    | industry | talk     | intech        | investor | everything |

</Route>

## 摩点 {#mo-dian}

### 众筹 {#mo-dian-zhong-chou}

<Route author="nczitzk" example="/modian/zhongchou" path="/modian/zhongchou/:category?/:sort?/:status?" paramsDesc={['分类，见下表，默认为全部', '排序，见下表，默认为最新上线', '状态，见下表，默认为全部']}>

分类

| 全部 | 游戏  | 动漫   | 出版       | 桌游       |
| ---- | ----- | ------ | ---------- | ---------- |
| all  | games | comics | publishing | tablegames |

| 卡牌  | 潮玩模型 | 影视       | 音乐  | 活动       |
| ----- | -------- | ---------- | ----- | ---------- |
| cards | toys     | film-video | music | activities |

| 设计   | 科技       | 食品 | 爱心通道 | 动物救助 |
| ------ | ---------- | ---- | -------- | -------- |
| design | technology | food | charity  | animals  |

| 个人愿望 | 其他   |
| -------- | ------ |
| wishes   | others |

排序

| 最新上线 | 金额最高  | 评论最多    |
| -------- | --------- | ----------- |
| top_time | top_money | top_comment |

状态

| 全部 | 创意 | 预热    | 众筹中 | 众筹成功 |
| ---- | ---- | ------- | ------ | -------- |
| all  | idea | preheat | going  | success  |

</Route>

## 摩根大通研究所 {#mo-gen-da-tong-yan-jiu-suo}

### 新闻 {#mo-gen-da-tong-yan-jiu-suo-xin-wen}

<Route author="howel52" example="/jpmorganchase" path="/jpmorganchase"/>

## 木木博客 {#mu-mu-bo-ke}

### 频道 {#mu-mu-bo-ke-pin-dao}

<Route author="nczitzk" example="/liulinblog" path="/liulinblog/:channel?" paramsDesc={['频道 id，可在对应频道页 URL 中找到，见下表，默认为最新']} radar="1" rssbud="1">

| 最新 | 60秒读懂世界 | 精品资源 | 视频资源 | 音频资源 |
| ---- | ------------ | -------- | -------- | -------- |
|      | kuaixun      | ziyuan   | video    | yinpin   |

| 绝版资源 | 实用文档 | PPT素材   | 后期素材 | 技能教程  |
| -------- | -------- | --------- | -------- | --------- |
| jueban   | wendang  | ppt-sucai | sucai    | jiaocheng |

| 创业副业 | 单机游戏 | 冒险解谜 | 竞技格斗    | 赛车竞技 |
| -------- | -------- | -------- | ----------- | -------- |
| money    | game     | mxjm     | jingjigedou | saiche   |

| 模拟经营 | 角色扮演 | 飞行游戏 | 塔防策略 | 射击游戏 |
| -------- | -------- | -------- | -------- | -------- |
| moni     | jiaose   | feixing  | tafang   | sheji    |

| 恐怖冒险 | 策略生存 | 动作冒险 | 电商运营  | 互联网早报 |
| -------- | -------- | -------- | --------- | ---------- |
| kongbu   | celve    | dongzuo  | dianshang | internet   |

| 站长圈 | 自媒体运营 | 短视频      |
| ------ | ---------- | ----------- |
| seo    | zimeiti    | duan-shipin |

</Route>

### 标签 {#mu-mu-bo-ke-biao-qian}

<Route author="nczitzk" example="/liulinblog/tag/qukuailian" path="/liulinblog/tag/:id" paramsDesc={['标签 id，可在对应标签页 URL 中找到，见下表']} radar="1" rssbud="1">

| 区块链     | 小红书      | 小说项目 | 微信公众号 | 微信营销 |
| ---------- | ----------- | -------- | ---------- | -------- |
| qukuailian | xiaohongshu | xiaoshuo | 微信公众号 | we-chat  |

| 抖音 | 抖音直播 | 拼多多    | 支付宝 | 教育 |
| ---- | -------- | --------- | ------ | ---- |
| 抖音 | 抖音直播 | pinduoduo | alipay | 教育 |

| chrome插件 | galgame汉化游戏 | honeyselect 汉化游戏 | PSD笔刷素材 | ps插件     |
| ---------- | --------------- | -------------------- | ----------- | ---------- |
| chrome插件 | galgame         | honey-select         | psd-bishua  | ps-chajian |

| vip视频    | windows实用技巧 | 下载软件 | 丝袜玉足 | 免费字体下载 |
| ---------- | --------------- | -------- | -------- | ------------ |
| vip-shipin | computer        | download | siwa     | ziti         |

| 二战游戏下载 | 冒险解谜游戏 | 动作游戏下载 | 安卓游戏     | 策略游戏   |
| ------------ | ------------ | ------------ | ------------ | ---------- |
| war-games    | 冒险解谜游戏 | 动作游戏下载 | android-game | game-celve |

| Pr插件 | Python | seo优化 | VLOG | wordpress | word技巧 |
| ------ | ------ | ------- | ---- | --------- | -------- |
| pr插件 | python | seo     | vlog | wordpress | word     |

</Route>

### 专题 {#mu-mu-bo-ke-zhuan-ti}

<Route author="nczitzk" example="/liulinblog/series/xunlei" path="/liulinblog/series/:id" paramsDesc={['专题 id，可在对应标签页 URL 中找到，见下表']} radar="1" rssbud="1">

| 【免费速存】迅雷资源合集 | 直播带货教程 | 电商培训课程    | 拼多多运营培训 | 小红书运营  | 抖音运营      | 闲鱼运营      | 短视频运营        |
| ------------------------ | ------------ | --------------- | -------------- | ----------- | ------------- | ------------- | ----------------- |
| xunlei                   | zhibodaihuo  | dianshangpeixun | pinduoduo      | xiaohongshu | douyinyunying | xianyuyunying | duanshipinyunying |

</Route>

### 搜索 {#mu-mu-bo-ke-sou-suo}

<Route author="nczitzk" example="/liulinblog/search/单机游戏" path="/liulinblog/search/:keyword" paramsDesc={['关键字']} radar="1" rssbud="1"/>

### 60秒读懂世界 {#mu-mu-bo-ke-60-miao-du-dong-shi-jie}

<Route author="Fatpandac nczitzk" example="/liulinblog/kuaixun" path="/liulinblog/kuaixun"/>

### 网络营销 {#mu-mu-bo-ke-wang-luo-ying-xiao}

<Route author="Fatpandac nczitzk" example="/liulinblog/itnews" path="/liulinblog/itnews/:channel?" paramsDesc={['频道，默认为网络营销']}>

| 网络营销 | 电商运营  | 互联网早报 | 站长圈 |
| -------- | --------- | ---------- | ------ |
|          | dianshang | internet   | seo    |

</Route>

## 鸟哥笔记 {#niao-ge-bi-ji}

### 首页 {#niao-ge-bi-ji-shou-ye}

<Route author="WenryXu" example="/ngbj" path="/ngbj"/>

### 今日事 {#niao-ge-bi-ji-jin-ri-shi}

<Route author="KotoriK" example="/ngbj/today" path="/ngbj/today"/>

### 分类目录 {#niao-ge-bi-ji-fen-lei-mu-lu}

<Route author="KotoriK" example="/ngbj/cat/103" path="/ngbj/cat/:cat" paramsDesc={['如https://www.niaogebiji.com/cat/103,最后的数字就是要填写在这的id']}/>

## 派代 {#pai-dai}

### 首页 {#pai-dai-shou-ye}

<Route author="qiwihui" example="/paidai" path="/paidao" />

### 论坛 {#pai-dai-lun-tan}

<Route author="qiwihui" example="/paidai/bbs" path="/paidao/bbs" />

### 商道 {#pai-dai-shang-dao}

<Route author="qiwihui" example="/paidai/news" path="/paidao/news" />

## 跑野大爆炸 {#pao-ye-da-bao-zha}

### 最新文章 {#pao-ye-da-bao-zha-zui-xin-wen-zhang}

<Route author="TonyRL" example="/runtrail" path="/runtrail" radar="1" rssbud="1"/>

## 品途商业评论 {#pin-tu-shang-ye-ping-lun}

### 文章 {#pin-tu-shang-ye-ping-lun-wen-zhang}

<Route author="DIYgod" example="/pintu360/0" path="/pintu360/:type?" paramsDesc={['类型, 默认为 `0` 推荐']}>

类型

| 推荐 | 零售前沿 | 智能科技 | 泛文娱 | 教育 | 大健康 | 新消费 | 创业投资 |
| ---- | -------- | -------- | ------ | ---- | ------ | ------ | -------- |
| 0    | 7        | 10       | 9      | 98   | 70     | 8      | 72       |

</Route>

## 品玩 {#pin-wan}

### 实时要闻 {#pin-wan-shi-shi-yao-wen}

<Route author="sanmmm" example="/pingwest/status" path="/pingwest/status"/>

### 话题动态 {#pin-wan-hua-ti-dong-tai}

<Route author="sanmmm" path="/pingwest/tag/:tag/:type/:option?" example="/pingwest/tag/ChinaJoy/1" paramsDesc={['话题名或话题id, 可从话题页url中得到', '内容类型', '参数, 默认无']}>

内容类型

| 最新 | 热门 |
| ---- | ---- |
| 1    | 2    |

参数

-   `fulltext`，全文输出，例如：`/pingwest/tag/ChinaJoy/1/fulltext`

:::tip

该路由一次最多显示 30 条文章

:::

</Route>

### 用户 {#pin-wan-yong-hu}

<Route author="sanmmm" path="/pingwest/user/:uid/:type?/:option?" example="/pingwest/user/7781550877/article" paramsDesc={['用户id, 可从用户主页中得到', '内容类型, 默认为`article`', '参数']}>

内容类型

| 文章    | 动态  |
| ------- | ----- |
| article | state |

参数

-   `fulltext`，全文输出，例如：`/pingwest/user/7781550877/article/fulltext`

</Route>

## 千篇网 {#qian-pian-wang}

### 知识库／资讯 {#qian-pian-wang-zhi-shi-ku-%EF%BC%8F-zi-xun}

<Route author="TonyRL" example="/qianp/news" path="/qianp/news/:path*" paramsDesc={['路径，可在URL中找到，默认为 `news/recommend`']} radar="1" rssbud="1"/>

## 求是网 {#qiu-shi-wang}

### 分类 {#qiu-shi-wang-fen-lei}

<Route author="nczitzk" example="/qstheory" path="/qstheory/:category?" paramsDesc={['分类，见下表']}>

| 网评 | 视频 | 原创   | 经济    | 政治     | 文化    | 社会    | 党建 | 科教    | 生态    | 国防    | 国际          | 图书  | 学习笔记 |
| ---- | ---- | ------ | ------- | -------- | ------- | ------- | ---- | ------- | ------- | ------- | ------------- | ----- | -------- |
| qswp | qssp | qslgxd | economy | politics | culture | society | cpc  | science | zoology | defense | international | books | xxbj     |

</Route>

## 趨勢科技防詐達人 {#qu-shi-ke-ji-fang-zha-da-ren}

### 最新詐騙情報 {#qu-shi-ke-ji-fang-zha-da-ren-zui-xin-zha-pian-qing-bao}

<Route author="nczitzk" example="/getdr" path="/getdr"/>

## 趣头条 {#qu-tou-tiao}

### 分类 {#qu-tou-tiao-fen-lei}

<Route author="alphardex LogicJake" example="/qutoutiao/category/1" path="/qutoutiao/category/:cid" paramsDesc={['分类 id']}>

| 推荐 | 热点 | 娱乐 | 健康 | 养生 | 励志 | 科技 | ... |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | --- |
| 255  | 1    | 6    | 42   | 5    | 4    | 7    | ... |

更多的 cid 可通过访问[官网](http://home.qutoutiao.net)切换分类，观察 url 获得。

</Route>

## 全国港澳研究会 {#quan-guo-gang-ao-yan-jiu-hui}

### 分类 {#quan-guo-gang-ao-yan-jiu-hui-fen-lei}

<Route author="nczitzk" example="/cahkms" path="/cahkms/:category?" paramsDesc={['分类，见下表，默认为重要新闻']}>

| 关于我们 | 港澳新闻 | 重要新闻 | 顾问点评、会员观点 | 专题汇总 |
| -------- | -------- | -------- | ------------------ | -------- |
| 01       | 02       | 03       | 04                 | 05       |

| 港澳时评 | 图片新闻 | 视频中心 | 港澳研究 | 最新书讯 | 研究资讯 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| 06       | 07       | 08       | 09       | 10       | 11       |

</Route>

## 全民健康网 {#quan-min-jian-kang-wang}

<Route author="nczitzk" example="/qm120/news" path="/qm120/news/:category?" paramsDesc={['分类，见下表，默认为健康焦点']}>

| 健康焦点 | 行业动态 | 医学前沿 | 法规动态 |
| -------- | -------- | -------- | -------- |
| jdxw     | hydt     | yxqy     | fgdt     |

| 食品安全 | 医疗事故 | 医药会展 | 医药信息 |
| -------- | -------- | -------- | -------- |
| spaq     | ylsg     | yyhz     | yyxx     |

| 新闻专题 | 行业新闻 |
| -------- | -------- |
| zhuanti  | xyxw     |

</Route>

## 全球化智库 {#quan-qiu-hua-zhi-ku}

### 分类 {#quan-qiu-hua-zhi-ku-fen-lei}

<Route author="nczitzk" example="/ccg" path="/ccg/:category?" paramsDesc={['分类，见下表']}>

| 新闻动态 | 媒体报道 | 观点 |
| -------- | -------- | ---- |
| news     | mtbd     | view |

</Route>

## 全现在 {#quan-xian-zai}

### 首页 {#quan-xian-zai-shou-ye}

<Route author="nczitzk" example="/allnow" path="/allnow"/>

### 专栏 {#quan-xian-zai-zhuan-lan}

<Route author="nczitzk" example="/allnow/column/199" path="/allnow/column/:id" paramsDesc={['专栏 id']}/>

### 话题 {#quan-xian-zai-hua-ti}

<Route author="nczitzk" example="/allnow/tag/678" path="/allnow/tag/:id" paramsDesc={['话题 id']}/>

### 用户 {#quan-xian-zai-yong-hu}

<Route author="nczitzk" example="/allnow/user/1891141" path="/allnow/user/:id" paramsDesc={['用户 id']}/>

## 人民论坛网 {#ren-min-lun-tan-wang}

### 思想理论 {#ren-min-lun-tan-wang-si-xiang-li-lun}

<Route author="nczitzk" example="/rmlt/idea" path="/rmlt/idea/:category?" paramsDesc={['分类，见下表，默认为首页']}>

| 首页 | 独家连线   | 深度原创   | 中外思潮 | 时事洞察 |
| ---- | ---------- | ---------- | -------- | -------- |
|      | connection | yuanchuang | sichao   | dongcha  |

| 中国声音 | 全球观察 | 思想名人堂  | 学术人生 |
| -------- | -------- | ----------- | -------- |
| shengyin | guancha  | mingrentang | xueshu   |

| 前沿理论 | 比较研究 |
| -------- | -------- |
| lilun    | yanjiu   |

</Route>

## 人人都是产品经理 {#ren-ren-dou-shi-chan-pin-jing-li}

### 热门文章 {#ren-ren-dou-shi-chan-pin-jing-li-re-men-wen-zhang}

<Route author="WenryXu" example="/woshipm/popular" path="/woshipm/popular/:range?" paramsDesc={['时间，见下表，默认为 `daily`']} radar="1">

| 日榜  | 周榜   | 月榜    |
| ----- | ------ | ------- |
| daily | weekly | monthly |

</Route>

### 天天问 {#ren-ren-dou-shi-chan-pin-jing-li-tian-tian-wen}

<Route author="WenryXu" example="/woshipm/wen" path="/woshipm/wen" radar="1"/>

### 用户收藏 {#ren-ren-dou-shi-chan-pin-jing-li-yong-hu-shou-cang}

<Route author="LogicJake" example="/woshipm/bookmarks/324696" path="/woshipm/bookmarks/:id" paramsDesc={['用户 id']} radar="1"/>

### 用户文章 {#ren-ren-dou-shi-chan-pin-jing-li-yong-hu-wen-zhang}

<Route author="LogicJake" example="/woshipm/user_article/324696" path="/woshipm/user_article/:id" paramsDesc={['用户 id']} radar="1"/>

### 最新文章 {#ren-ren-dou-shi-chan-pin-jing-li-zui-xin-wen-zhang}

<Route author="Director-0428" example="/woshipm/latest" path="/woshipm/latest" radar="1"/>

## 人人都是自媒体 {#ren-ren-dou-shi-zi-mei-ti}

### 发现 {#ren-ren-dou-shi-zi-mei-ti-fa-xian}

<Route author="Joey" example="/iiilab" path="/iiilab" radar="1" />

## 软餐 {#ruan-can}

### 首页 {#ruan-can-shou-ye}

<Route author="nczitzk" example="/ruancan" path="/ruancan"/>

### 分类 {#ruan-can-fen-lei}

<Route author="nczitzk" example="/ruancan/category/news" path="/ruancan/category/:category?" paramsDesc={['分类 id，可在对应分类页 URL 中找到，默认为业界']}/>

### 搜索 {#ruan-can-sou-suo}

<Route author="nczitzk" example="/ruancan/search/Windows" path="/ruancan/search/:keyword?" paramsDesc={['关键字，默认为空']}/>

### 用户文章 {#ruan-can-yong-hu-wen-zhang}

<Route author="nczitzk" example="/ruancan/user/72" path="/ruancan/user/:id?" paramsDesc={['用户 id，可在对应用户页 URL 中找到']}/>

## 上下游 News&Market {#shang-xia-you-news%26market}

### 分類 {#shang-xia-you-news%26market-fen-lei}

<Route author="nczitzk" example="/newsmarket" path="/newsmarket/:category?" paramsDesc={['分类，见下表，默认为首页']}>

| 時事。政策  | 食安        | 新知      | 愛地方       | 種好田       | 好吃。好玩    |
| ----------- | ----------- | --------- | ------------ | ------------ | ------------- |
| news-policy | food-safety | knowledge | country-life | good-farming | good-food-fun |

| 食農教育       | 人物               | 漁業。畜牧           | 綠生活。國際        | 評論    |
| -------------- | ------------------ | -------------------- | ------------------- | ------- |
| food-education | people-and-history | raising-and-breeding | living-green-travel | opinion |

</Route>

## 少数派 sspai {#shao-shu-pai-sspai}

### 首页 {#shao-shu-pai-sspai-shou-ye}

<Route author="HenryQW" example="/sspai/index" path="/sspai/index" radar="1" />

### 最新上架付费专栏 {#shao-shu-pai-sspai-zui-xin-shang-jia-fu-fei-zhuan-lan}

<Route author="HenryQW" example="/sspai/series" path="/sspai/series" radar="1">

> 少数派专栏需要付费订阅，RSS 仅做更新提醒，不含付费内容.

</Route>

### 付费专栏文章更新 {#shao-shu-pai-sspai-fu-fei-zhuan-lan-wen-zhang-geng-xin}

<Route author="TonyRL" example="/sspai/series/77" path="/sspai/series/:id" paramsDesc={['专栏 id']} radar="1" />

### Shortcuts Gallery {#shao-shu-pai-sspai-shortcuts-gallery}

<Route author="Andiedie" example="/sspai/shortcuts" path="/sspai/shortcuts" radar="1"/>

### Matrix {#shao-shu-pai-sspai-matrix}

<Route author="feigaoxyz" example="/sspai/matrix" path="/sspai/matrix" radar="1"/>

### 专栏 {#shao-shu-pai-sspai-zhuan-lan}

<Route author="LogicJake" example="/sspai/column/262" path="/sspai/column/:id"  paramsDesc={['专栏 id']} radar="1"/>

### 作者 {#shao-shu-pai-sspai-zuo-zhe}

<Route author="SunShinenny hoilc" example="/sspai/author/796518" path="/sspai/author/:id"  paramsDesc={['作者 slug 或 id，slug 可在作者主页URL中找到，id 不易查找，仅作兼容']} radar="1"/>

### 作者动态 {#shao-shu-pai-sspai-zuo-zhe-dong-tai}

<Route author="umm233" example="/sspai/activity/urfp0d9i" path="/sspai/activity/:slug"  paramsDesc={['作者 slug，可在作者主页URL中找到']} radar="1"/>

### 用户收藏 {#shao-shu-pai-sspai-yong-hu-shou-cang}

<Route author="curly210102" example="/sspai/bookmarks/urfp0d9i" path="/sspai/bookmarks/:slug"  paramsDesc={['用户 slug，可在个人主页URL中找到']} radar="1"/>

### 专题 {#shao-shu-pai-sspai-zhuan-ti}

<Route author="SunShinenny" example="/sspai/topics" path="/sspai/topics" radar="1">

此为专题广场更新提示 => 集合型而非单篇文章。与下方 "专题内文章更新" 存在明显区别！

</Route>

### 专题内文章更新 {#shao-shu-pai-sspai-zhuan-ti-nei-wen-zhang-geng-xin}

<Route author="SunShinenny" example="/sspai/topic/250" path="/sspai/topic/:id"  paramsDesc={['专题 id，可在专题主页URL中找到']} radar="1"/>

### 标签订阅 {#shao-shu-pai-sspai-biao-qian-ding-yue}

<Route author="Jeason0228" example="/sspai/tag/apple" path="/sspai/tag/:keyword" paramsDesc={['关键词']} radar="1"/>

## 深潮 TechFlow {#shen-chao-techflow}

### 首页 {#shen-chao-techflow-shou-ye}

<Route author="nczitzk" example="/techflowpost" path="/techflowpost" />

### 快讯 {#shen-chao-techflow-kuai-xun}

<Route author="nczitzk" example="/techflowpost/express" path="/techflowpost/express" />

## 深焦 {#shen-jiao}

### 分类 {#shen-jiao-fen-lei}

<Route author="nczitzk" example="/filmdeepfocus" path="/filmdeepfocus/:category?" paramsDesc={['分类，见下表，默认为影评']}>

| 影评 | 影人       | 特别策划   | 专访       | 书评       |
| ---- | ---------- | ---------- | ---------- | ---------- |
| page | new-page-3 | new-page-2 | new-page-4 | new-page-1 |

</Route>

## 深圳新闻网 {#shen-zhen-xin-wen-wang}

### 深圳市政府新闻发布厅 {#shen-zhen-xin-wen-wang-shen-zhen-shi-zheng-fu-xin-wen-fa-bu-ting}

<Route author="nczitzk" example="/sznews/press" path="/sznews/press"/>

### 排行榜 {#shen-zhen-xin-wen-wang-pai-hang-bang}

<Route author="nczitzk" example="/sznews/ranking" path="/sznews/ranking"/>

## 生命时报 {#sheng-ming-shi-bao}

### 栏目 {#sheng-ming-shi-bao-lan-mu}

<Route author="nczitzk" example="/lifetimes" path="/lifetimes/:category?" paramsDesc={['栏目，见下表，默认为新闻']}>

| 新闻 | 医药     | 养生            | 生活 | 母亲行动 | 长寿      | 视频  | 时评         | 调查    | 产业经济 |
| ---- | -------- | --------------- | ---- | -------- | --------- | ----- | ------------ | ------- | -------- |
| news | medicine | healthpromotion | life | mothers  | longevity | video | news-comment | hotspot | industry |

</Route>

## 生物谷 {#sheng-wu-gu}

### 最新资讯 {#sheng-wu-gu-zui-xin-zi-xun}

<Route author="nczitzk" example="/bioon/latest" path="/bioon/latest"/>

## 时刻新闻 {#shi-ke-xin-wen}

### 新闻 {#shi-ke-xin-wen-xin-wen}

<Route author="linbuxiao" example="/timednews/news" path="/timednews/news/:type?" paramsDesc={['子分类，见下表，默认为全部']}>

子分类

| 全部 | 时政           | 财经    | 科技       | 社会   | 体娱   | 国际          | 美国 | 中国 | 欧洲   | 评论     |
| ---- | -------------- | ------- | ---------- | ------ | ------ | ------------- | ---- | ---- | ------ | -------- |
| all  | currentAffairs | finance | technology | social | sports | international | usa  | cn   | europe | comments |

</Route>

## 时事一点通 {#shi-shi-yi-dian-tong}

### 资讯 {#shi-shi-yi-dian-tong-zi-xun}

<Route author="nczitzk" example="/ssydt/article" path="/ssydt/article/:id?" paramsDesc={['id，见下表，默认为推荐']}>

| 推荐 | 时事日报 | 时事专题 | 备考技巧 | 招考信息 | 时事月报 | 重要会议 | 领导讲话 | 时事周刊 | 官网公告 | 时事评论 |
| ---- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 0    | 3        | 6        | 13       | 12       | 4        | 10       | 11       | 5        | 8        | 7        |

</Route>

## 识媒体 {#shi-mei-ti}

### 频道 {#shi-mei-ti-pin-dao}

<Route author="Fatpandac" example="/knowmedia/jqgx" path="/knowmedia/:category?" paramsDesc={['分类，见下表，默认为近期更新']}>

分类

| 近期更新 | 精选专栏 | 活动讯息 | 影音专区 |
| :------: | :------: | :------: | :------: |
|   jqgx   |   jxzl   |   hdxx   |   yyzq   |

</Route>

## 世界新聞網 {#shi-jie-xin-wen-wang}

### 新聞 {#shi-jie-xin-wen-wang-xin-wen}

<Route author="TonyRL" example="/worldjournal" path="/worldjournal/:path*" paramsDesc={['URL 中 `/wj/` 後的路徑，預設為 `cate/breaking`']} radar="1" rssbud="1" />

## 数英网 {#shu-ying-wang}

### 数英网最新文章 {#shu-ying-wang-shu-ying-wang-zui-xin-wen-zhang}

<Route author="occupy5" example="/digitaling/index" path="/digitaling/index" paramsDesc={['首页最新文章，数英网']} />

### 数英网文章专题 {#shu-ying-wang-shu-ying-wang-wen-zhang-zhuan-ti}

<Route author="occupy5" example="/digitaling/articles/latest" path="/digitaling/articles/:category/:subcate?" paramsDesc={['文章专题分类','hot 分类下的子类']}>

| 最新文章 | 头条     | 热文 | 精选   |
| -------- | -------- | ---- | ------ |
| latest   | headline | hot  | choice |

分类`hot`下的子类

| 近期热门文章 | 近期最多收藏 | 近期最多赞 |
| ------------ | ------------ | ---------- |
| views        | collects     | zan        |

</Route>

### 数英网项目专题 {#shu-ying-wang-shu-ying-wang-xiang-mu-zhuan-ti}

<Route author="occupy5" example="/digitaling/projects/all" path="/digitaling/projects/:category" paramsDesc={['项目专题分类 ']}>

| 全部 | 每周项目精选 | 每月项目精选 | 海外项目精选  | 近期热门项目 | 近期最多收藏 |
| ---- | ------------ | ------------ | ------------- | ------------ | ------------ |
| all  | weekly       | monthly      | international | hot          | favorite     |

</Route>

## 水果派 {#shui-guo-pai}

### 首页 {#shui-guo-pai-shou-ye}

<Route author="nczitzk" example="/shuiguopai" path="/shuiguopai" />

## 搜狐号 {#sou-hu-hao}

### 更新 {#sou-hu-hao-geng-xin}

<Route author="HenryQW" example="/sohu/mp/119097" path="/sohu/mp/:id" paramsDesc={['搜狐号 ID', '见如下说明']}>

1.  通过浏览器搜索相关搜狐号 `果壳 site: mp.sohu.com`。
2.  通过浏览器控制台执行 `contentData.mkey`，返回的即为搜狐号 ID。

</Route>

## 探物 {#tan-wu}

### 产品 {#tan-wu-chan-pin}

<Route author="xyqfer" example="/tanwu/products" path="/tanwu/products"/>

## 唐书房 {#tang-shu-fang}

### 分类 {#tang-shu-fang-fen-lei}

<Route author="nczitzk" example="/tangshufang" path="/tangshufang/:category?" paramsDesc={['分类，见下表，默认为首页']}>

| 首页 | 老唐实盘 | 书房拾遗 | 理念 & 估值 | 经典陪读 | 财务套利 |
| ---- | -------- | -------- | ----------- | -------- | -------- |
|      | shipan   | wenda    | linian      | peidu    | taoli    |

| 企业分析 | 白酒企业 | 腾讯控股 | 分众传媒 | 海康威视 | 其他企业 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| qiye     | baijiu   | tengxun  | fenzhong | haikang  | qita     |

| 核心五篇 | 读者投稿 | 读书随笔 | 财报浅析 | 出行游记 | 巴芒连载 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| hexin    | tougao   | suibi    | caibao   | youji    | bamang   |

</Route>

## 腾讯 NBA {#teng-xun-nba}

### 头条新闻 {#teng-xun-nba-tou-tiao-xin-wen}

<Route author="alizeegod" example="/nba/app_news" path="/nba/app_news"/>

## 腾讯谷雨 {#teng-xun-gu-yu}

### 栏目 {#teng-xun-gu-yu-lan-mu}

<Route author="LogicJake" example="/tencent/guyu/channel/lab" path="/tencent/guyu/channel/:name" paramsDesc={['栏目名称，包括lab，report，story，shalong']}/>

## 腾讯企鹅号 {#teng-xun-qi-e-hao}

### 更新 {#teng-xun-qi-e-hao-geng-xin}

<Route author="LogicJake" example="/tencent/news/author/5933889" path="/tencent/news/author/:mid" paramsDesc={['企鹅号 ID']} radar="1"/>

## 腾讯研究院 {#teng-xun-yan-jiu-yuan}

### 最近更新 {#teng-xun-yan-jiu-yuan-zui-jin-geng-xin}

<Route author="Fatpandac" example="/tisi/latest" path="/tisi/latest"/>

## 通識・現代中國 {#tong-shi-%E3%83%BB-xian-dai-zhong-guo}

### 議題熱話 {#tong-shi-%E3%83%BB-xian-dai-zhong-guo-yi-ti-re-hua}

<Route author="nczitzk" example="/chiculture/topic" path="/chiculture/topic/:category?" paramsDesc={['分类，见下表，默认为全部']}>

| 全部 | 現代中國 | 今日香港 | 全球化 | 一周時事通識 |
| ---- | -------- | -------- | ------ | ------------ |
|      | 76       | 479      | 480    | 379          |

</Route>

## 投中网 {#tou-zhong-wang}

### 分类 {#tou-zhong-wang-fen-lei}

<Route author="yunxinliu-alex" example="/chinaventure/news/78" path="/chinaventure/news/:id?" paramsDesc={['分类，见下表，默认为推荐']}>

| 推荐 | 商业深度 | 资本市场 | 5G | 健康 | 教育 | 地产 | 金融 | 硬科技 | 新消费 |
| ---- | -------- | -------- | -- | ---- | ---- | ---- | ---- | ------ | ------ |
|      | 78       | 80       | 83 | 111  | 110  | 112  | 113  | 114    | 116    |

</Route>

## 推酷 {#tui-ku}

### 周刊 {#tui-ku-zhou-kan}

<Route author="zpcc" example="/tuicool/mags/tech" path="/tuicool/mags/:type" paramsDesc={['类型如下']}>

| 编程狂人 | 设计匠艺 | 创业周刊 | 科技周刊 |
| -------- | -------- | -------- | -------- |
| prog     | design   | startup  | tech     |

</Route>

## 歪脑 wainao.me {#wai-nao-wainao.me}

### 所有文章 {#wai-nao-wainao.me-suo-you-wen-zhang}

<Route author="shuiRong" example="/wainao-reads/all-articles" path="/wainao-reads/all-articles" />

## 湾区日报 {#wan-qu-ri-bao}

### 最新推荐 {#wan-qu-ri-bao-zui-xin-tui-jian}

<Route author="Fatpandac" example="/wanqu/news" path="/wanqu/news" radar="1" />

## 晚点 LatePost {#wan-dian-latepost}

### 报道 {#wan-dian-latepost-bao-dao}

<Route author="HaitianLiu nczitzk" example="/latepost" path="/latepost/:proma?" paramsDesc={['栏目 id，见下表，默认为最新报道']}>

| 最新报道 | 晚点独家 | 人物访谈 | 晚点早知道 | 长报道 |
| -------- | -------- | -------- | ---------- | ------ |
|          | 1        | 2        | 3          | 4      |

</Route>

## 万联网 {#wan-lian-wang}

### 资讯 {#wan-lian-wang-zi-xun}

<Route author="kt286" example="/10000link/news/My01" path="/10000link/news/:category?" paramsDesc={['栏目代码, 默认为全部']}>

| 全部 | 天下大势 | 企业动态 | 专家观点 | 研究报告 |
| ---- | -------- | -------- | -------- | -------- |
| (空) | My01     | My02     | My03     | My04     |

</Route>

## 网易独家 {#wang-yi-du-jia}

### 栏目 {#wang-yi-du-jia-lan-mu}

<Route author="nczitzk" example="/163/exclusive/qsyk" path="/163/exclusive/:id?" paramsDesc={['栏目, 默认为首页']}>

| 分类     | 编号 |
| -------- | ---- |
| 首页     |      |
| 轻松一刻 | qsyk |
| 槽值     | cz   |
| 人间     | rj   |
| 大国小民 | dgxm |
| 三三有梗 | ssyg |
| 数读     | sd   |
| 看客     | kk   |
| 下划线   | xhx  |
| 谈心社   | txs  |
| 哒哒     | dd   |
| 胖编怪聊 | pbgl |
| 曲一刀   | qyd  |
| 今日之声 | jrzs |
| 浪潮     | lc   |
| 沸点     | fd   |

</Route>

## 网易号 {#wang-yi-hao}

### 更新 {#wang-yi-hao-geng-xin}

<Route author="HendricksZheng" example="/163/dy/W4983108759592548559" path="/163/dy/:id" paramsDesc={['网易号 ID', '见如下说明']}>

1.  在[网易号搜索页面](https://dy.163.com/v2/media/tosearch.html) 搜索想要订阅的网易号。
2.  打开网易号的任意文章。
3.  查看源代码，搜索 `data-wemediaid`，查看紧随其后的引号内的属性值（类似 `W1966190042455428950`）即为网易号 ID。

</Route>

### 网易号（通用） {#wang-yi-hao-wang-yi-hao-%EF%BC%88-tong-yong-%EF%BC%89}

<Route author="mjysci" example="/163/dy2/T1555591616739" path="/163/dy2/:id" paramsDesc={['id，该网易号主页网址最后一项html的文件名']} anticrawler="1"/>

优先使用方法一，若是网易号搜索页面搜不到的小众网易号（文章页面不含`data-wemediaid`）则可使用此法。
触发反爬会只抓取到标题，建议自建。

## 网易新闻 {#wang-yi-xin-wen}

:::caution

若视频因防盗链而无法播放，请参考 [通用参数 -> 多媒体处理](/parameter#多媒体处理) 配置 `multimedia_hotlink_template` **或** `wrap_multimedia_in_iframe`。

:::

### 今日关注 {#wang-yi-xin-wen-jin-ri-guan-zhu}

<Route author="nczitzk" example="/163/today" path="/163/today/:need_content?" paramsDesc={['需要获取全文，填写 true/yes 表示需要，默认需要']}>

:::tip

参数 **需要获取全文** 设置为 `true` `yes` `t` `y` 等值后，RSS 会携带该新闻条目的对应全文。

:::

</Route>

### 排行榜 {#wang-yi-xin-wen-pai-hang-bang}

<Route author="nczitzk" example="/163/news/rank/whole/click/day" path="/163/news/rank/:category?/:type?/:time?" paramsDesc={['新闻分类，参见下表，默认为“全站”','排行榜类型，“点击榜”对应`click`，“跟贴榜”对应`follow`，默认为“点击榜”','统计时间，“1小时”对应`hour`，“24小时”对应`day`，“本周”对应`week`，“本月”对应`month`，默认为“24小时”']}>

:::tip

全站新闻 **点击榜** 的统计时间仅包含 “24 小时”、“本周”、“本月”，不包含 “1 小时”。即可用的`time`参数为`day`、`week`、`month`。

其他分类 **点击榜** 的统计时间仅包含 “1 小时”、“24 小时”、“本周”。即可用的`time`参数为`hour`、`day`、`week`。

而所有分类（包括全站）的 **跟贴榜** 的统计时间皆仅包含 “24 小时”、“本周”、“本月”。即可用的`time`参数为`day`、`week`、`month`。

:::

新闻分类：

| 全站  | 新闻 | 娱乐          | 体育   | 财经  | 科技 | 汽车 | 女人 | 房产  | 游戏 | 旅游   | 教育 |
| ----- | ---- | ------------- | ------ | ----- | ---- | ---- | ---- | ----- | ---- | ------ | ---- |
| whole | news | entertainment | sports | money | tech | auto | lady | house | game | travel | edu  |

</Route>

### 专栏 {#wang-yi-xin-wen-zhuan-lan}

<Route author="Solist-X" example="/163/news/special/1" path="/163/news/special/:type?" paramsDesc={['栏目']}>

| 轻松一刻 | 槽值 | 人间 | 大国小民 | 三三有梗 | 数读 | 看客 | 下划线 | 谈心社 | 哒哒 | 胖编怪聊 | 曲一刀 | 今日之声 | 浪潮 | 沸点 |
| -------- | ---- | ---- | -------- | -------- | ---- | ---- | ------ | ------ | ---- | -------- | ------ | -------- | ---- | ---- |
| 1        | 2    | 3    | 4        | 5        | 6    | 7    | 8      | 9      | 10   | 11       | 12     | 13       | 14   | 15   |

</Route>

### 人间 {#wang-yi-xin-wen-ren-jian}

<Route author="nczitzk" example="/163/renjian/texie" path="/163/renjian/:category?" paramsDesc={['分类，见下表，默认为特写']}>

| 特写  | 记事  | 大写  | 好读  | 看客  |
| ----- | ----- | ----- | ----- | ----- |
| texie | jishi | daxie | haodu | kanke |

</Route>

## 網路天文館 {#wang-lu-tian-wen-guan}

### 天象預報 {#wang-lu-tian-wen-guan-tian-xiang-yu-bao}

<Route author="nczitzk" example="/tam/forecast" path="/tam/forecast"/>

## 微小领 {#wei-xiao-ling}

### 微信公众号 {#wei-xiao-ling-wei-xin-gong-zhong-hao}

<Route author="TonyRL" example="/wxkol/show/3590876722" path="/wxkol/show/:id" paramsDesc={['公众号 id，可在 URL 找到']} radar="1"/>

## 微信 {#wei-xin}

:::tip

公众号直接抓取困难，故目前提供几种间接抓取方案，请自行选择

:::

### 公众号（CareerEngine 来源） {#wei-xin-gong-zhong-hao-%EF%BC%88careerengine-lai-yuan-%EF%BC%89}

<Route author="HenryQW" example="/wechat/ce/595a5b14d7164e53908f1606" path="/wechat/ce/:id" paramsDesc={['公众号 id，在 [CareerEngine](https://search.careerengine.us/) 搜索公众号，通过 URL 中找到对应的公众号 id']} anticrawler="1"/>

### 公众号（二十次幂来源） {#wei-xin-gong-zhong-hao-%EF%BC%88-er-shi-ci-mi-lai-yuan-%EF%BC%89}

<Route author="sanmmm" example="/wechat/ershicimi/813oxJOl" path="/wechat/ershicimi/:id" paramsDesc={['公众号id，打开公众号页，在 URL 中找到 id']} anticrawler="1"/>

### 公众号（Telegram 频道来源） {#wei-xin-gong-zhong-hao-%EF%BC%88telegram-pin-dao-lai-yuan-%EF%BC%89}

<Route author="LogicJake Rongronggg9" example="/wechat/tgchannel/lifeweek" path="/wechat/tgchannel/:id/:mpName?/:searchQueryType?" paramsDesc={['公众号绑定频道 id', '欲筛选的公众号全名（URL-encoded，精确匹配），在频道订阅了多个公众号时可选用', '搜索查询类型，见下表']}>

| 搜索查询类型 | 将使用的搜索关键字 |            适用于           |
| :----------: | :----------------: | :-------------------------: |
|      `0`     |     (禁用搜索)     |       所有情况 (默认)       |
|      `1`     |     公众号全名     | 未启用 efb-patch-middleware |
|      `2`     |     #公众号全名    | 已启用 efb-patch-middleware |

:::tip

启用搜索有助于在订阅了过多公众号的频道里有效筛选，不易因为大量公众号同时推送导致一些公众号消息被遗漏，但必须正确选择搜索查询类型，否则会搜索失败。

:::

:::caution

该方法需要通过 efb 进行频道绑定，具体操作见<https://github.com/DIYgod/RSSHub/issues/2172>

:::

</Route>

### 公众号（自由微信来源） {#wei-xin-gong-zhong-hao-%EF%BC%88-zi-you-wei-xin-lai-yuan-%EF%BC%89}

见 [#自由微信](#zi-you-wei-xin)

### 公众号（Wechat2RSS 来源） {#wei-xin-gong-zhong-hao-%EF%BC%88wechat2rss-lai-yuan-%EF%BC%89}

<Route author="TonyRL" example="/wechat/wechat2rss/5b925323244e9737c39285596c53e3a2f4a30774" path="/wechat/wechat2rss/:id" paramsDesc={['公众号 id，打开 `https://wechat2rss.xlab.app/posts/list/`，在 URL 中找到 id；注意不是公众号页的 id，而是订阅的 id']} radar="1"/>

### 公众号（微小领来源） {#wei-xin-gong-zhong-hao-%EF%BC%88-wei-xiao-ling-lai-yuan-%EF%BC%89}

见 [#微小领](#wei-xiao-ling)

### 公众号栏目 (非推送 & 历史消息) {#wei-xin-gong-zhong-hao-lan-mu-(-fei-tui-song-%26-li-shi-xiao-xi-)}

<Route author="MisteryMonster" example="/wechat/mp/homepage/MzA3MDM3NjE5NQ==/16" path="/wechat/mp/homepage/:biz/:hid/:cid?" paramsDesc={['公众号id', '分页id', '页内栏目']} radar="1" rssbud="1" anticrawler="1">

只适用拥有首页模板 (分享链接带有 homepage) 的公众号。例如从公众号分享出来的链接为 <https://mp.weixin.qq.com/mp/homepage?__biz=MzA3MDM3NjE5NQ==&hid=4>，`biz` 为 `MzA3MDM3NjE5NQ==`，`hid` 为 `4`。

有些页面里会有分栏， `cid` 可以通过元素选择器选中栏目查看`data-index`。如[链接](https://mp.weixin.qq.com/mp/homepage?\__biz=MzA3MDM3NjE5NQ==&hid=4)里的 `京都职人` 栏目的 `cid` 为 `0`，`文艺时光` 栏目的 `cid` 为 `2`。如果不清楚的话最左边的栏目为`0`，其右方栏目依次递增 `1`。

</Route>

### 公众号文章话题 Tag {#wei-xin-gong-zhong-hao-wen-zhang-hua-ti-tag}

<Route author="MisteryMonster" example="/wechat/mp/msgalbum/MzA3MDM3NjE5NQ==/1375870284640911361" path="/wechat/mp/msgalbum/:biz/:aid" paramsDesc={['公众号id', 'Tag id', ]} radar="1" rssbud="1" anticrawler="1">

一些公众号（如看理想）会在微信文章里添加 Tag ，点入 Tag 的链接如 <https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzA3MDM3NjE5NQ==&action=getalbum&album_id=1375870284640911361>，其中`biz` 为 `MzA3MDM3NjE5NQ==`，`aid` 为 `1375870284640911361`。

</Route>

### 公众号（优读来源） {#wei-xin-gong-zhong-hao-%EF%BC%88-you-du-lai-yuan-%EF%BC%89}

<Route author="kt286" example="/wechat/uread/shensing" path="/wechat/uread/:userid" paramsDesc={['公众号的微信号, 可在 微信-公众号-更多资料 中找到。并不是所有的都支持，能不能用随缘']}/>

### 公众号（公众号 360 来源） {#wei-xin-gong-zhong-hao-%EF%BC%88-gong-zhong-hao-360-lai-yuan-%EF%BC%89}

见 [#公众号 360](#gong-zhong-hao-360)

### 公众号（微阅读来源） {#wei-xin-gong-zhong-hao-%EF%BC%88-wei-yue-du-lai-yuan-%EF%BC%89}

<Route author="Rongronggg9" example="/wechat/data258/gh_cbbad4c1d33c" path="/data258/:id?" paramsDesc={['公众号 id 或分类 id，可在公众号页或分类页 URL 中找到；若略去，则抓取首页']} anticrawler="1" radar="1" rssbud="1" selfhost="1">

:::caution

由于使用了一些针对反爬的缓解措施，本路由响应较慢。默认只抓取前 5 条，可通过 `?limit=` 改变（不推荐，容易被反爬）。\
该网站使用 IP 甄别访客，且应用严格的每日阅读量限额（约 15 次），请自建并确保正确配置缓存；如使用内存缓存而非 Redis 缓存，请增大缓存容量。该限额足够订阅至少 3 个公众号 (假设公众号每日仅更新一次)；首页 / 分类页更新相当频繁，不推荐订阅。

:::

</Route>

### 公众号（搜狗来源） {#wei-xin-gong-zhong-hao-%EF%BC%88-sou-gou-lai-yuan-%EF%BC%89}

<Route author="NavePnow" example="/wechat/sogou/qimao0908" path="/wechat/sogou/:id" paramsDesc={['公众号 id, 打开 weixin.sogou.com 并搜索相应公众号， 在 URL 中找到 id']}/>

## 维基百科 {#wei-ji-bai-ke}

### 中国大陆新闻动态 {#wei-ji-bai-ke-zhong-guo-da-lu-xin-wen-dong-tai}

<Route author="HenryQW" example="/wikipedia/mainland" path="/wikipedia/mainland"/>

## 维基新闻 {#wei-ji-xin-wen}

### 最新新闻 {#wei-ji-xin-wen-zui-xin-xin-wen}

<Route author="KotoriK" example="/wikinews/latest" path="/wikinews/latest">

根据维基新闻的[sitemap](https://zh.wikinews.org/wiki/Special:%E6%96%B0%E9%97%BB%E8%AE%A2%E9%98%85)获取新闻全文。目前仅支持中文维基新闻。

</Route>

## 未名新闻 {#wei-ming-xin-wen}

### 分类 {#wei-ming-xin-wen-fen-lei}

<Route author="nczitzk" example="/mitbbs" path="/mitbbs/:caty?" paramsDesc={['新闻分类，参见下表，默认为“新闻大杂烩”']}>

| 新闻大杂烩 | 军事     | 国际   | 体育 | 娱乐 | 科技 | 财经    |
| ---------- | -------- | ------ | ---- | ---- | ---- | ------- |
|            | zhongguo | haiwai | tiyu | yule | keji | caijing |

</Route>

## 沃草 {#wo-cao}

### 文件列表 {#wo-cao-wen-jian-lie-biao}

<Route author="nczitzk" example="/watchout" path="/watchout"/>

## 乌有之乡 {#wu-you-zhi-xiang}

### 栏目 {#wu-you-zhi-xiang-lan-mu}

<Route author="nczitzk" example="/wyzxwk/article/shushe" path="/wyzxwk/article/:id?" paramsDesc={['栏目 id，可在栏目页 URL 中找到，默认为时代观察']}>

时政

| 时代观察 | 舆论战争 |
| -------- | -------- |
| shidai   | yulun    |

经济

| 经济视点 | 社会民生 | 三农关注 | 产业研究 |
| -------- | -------- | -------- | -------- |
| jingji   | shehui   | sannong  | chanye   |

国际

| 国际纵横 | 国防外交 |
| -------- | -------- |
| guoji    | guofang  |

思潮

| 理想之旅 | 思潮碰撞 | 文艺新生 | 读书交流 |
| -------- | -------- | -------- | -------- |
| lixiang  | sichao   | wenyi    | shushe   |

历史

| 历史视野 | 中华文化 | 中华医药 | 共产党人 |
| -------- | -------- | -------- | -------- |
| lishi    | zhonghua | zhongyi  | cpers    |

争鸣

| 风华正茂 | 工农之声 | 网友杂谈 | 网友时评 |
| -------- | -------- | -------- | -------- |
| qingnian | gongnong | zatan    | shiping  |

活动

| 乌有公告 | 红色旅游 | 乌有讲堂  | 书画欣赏 |
| -------- | -------- | --------- | -------- |
| gonggao  | lvyou    | jiangtang | shuhua   |

</Route>

## 无产者评论 {#wu-chan-zhe-ping-lun}

### 分类 {#wu-chan-zhe-ping-lun-fen-lei}

<Route author="nczitzk" example="/proletar" path="/proletar/categories/:id?" paramsDesc={['分类，见下表，默认为全部文章']}>

| 全部文章 | 中流击水 | 革命文艺 | 当代中国 | 理论视野 | 国际观察 | 史海沉钩 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- |
|          | 中流击水 | 革命文艺 | 当代中国 | 理论视野 | 国际观察 | 史海沉钩 |

</Route>

### 标签 {#wu-chan-zhe-ping-lun-biao-qian}

<Route author="nczitzk" example="/proletar" path="/proletar/tags/:id?" paramsDesc={['标签，默认为全部文章']}>

:::tip

标签名参见 [所有标签](https://review.proletar.ink/tags)

:::

</Route>

## 西祠胡同 {#xi-ci-hu-tong}

### 频道 {#xi-ci-hu-tong-pin-dao}

<Route author="LogicJake" example="/xici" path="/xici/:id?" paramsDesc={['频道id，默认为首页推荐']}>

| 首页推荐 | 民生 | 情感 | 亲子 |
| -------- | ---- | ---- | ---- |
| (空)     | ms   | qg   | qz   |

</Route>

## 香港 01 {#xiang-gang-01}

### 热门 {#xiang-gang-01-re-men}

<Route author="hoilc Fatpandac nczitzk" example="/hk01/hot" path="/hk01/hot" radar="1" rssbud="1"/>

### 栏目 {#xiang-gang-01-lan-mu}

<Route author="hoilc Fatpandac nczitzk" example="/hk01/zone/11" path="/hk01/zone/:id" paramsDesc={['栏目 id, 可在 URL 中找到']} radar="1" rssbud="1"/>

### 子栏目 {#xiang-gang-01-zi-lan-mu}

<Route author="hoilc Fatpandac nczitzk" example="/hk01/channel/391" path="/hk01/channel/:id" paramsDesc={['子栏目 id, 可在 URL 中找到']} radar="1" rssbud="1"/>

### 专题 {#xiang-gang-01-zhuan-ti}

<Route author="hoilc Fatpandac nczitzk" example="/hk01/issue/649" path="/hk01/issue/:id" paramsDesc={['专题 id, 可在 URL 中找到']} radar="1" rssbud="1"/>

### 标签 {#xiang-gang-01-biao-qian}

<Route author="hoilc Fatpandac nczitzk" example="/hk01/tag/2787" path="/hk01/tag/:id" paramsDesc={['标签 id, 可在 URL 中找到']} radar="1" rssbud="1"/>

### 即時 {#xiang-gang-01-ji-shi}

<Route author="5upernove-heng" example="/hk01/latest" path="/hk01/latest" radar="1" rssbud="1"/>

## 香港高登 {#xiang-gang-gao-deng}

### 頻道 {#xiang-gang-gao-deng-bin-dao}

<Route author="nczitzk" example="/hkgolden/BW" path="/hkgolden/:id?/:limit?/:sort?" paramsDesc={['頻道，见下表，默认为吹水台，可在对应频道页的 URL 中找到', '類型，见下表，默认为全部', '排序，见下表，默认为最後回應時間']}>

頻道

| 吹水台 | 高登熱 | 最新 | 時事台 | 娛樂台 |
| ------ | ------ | ---- | ------ | ------ |
| BW     | HT     | NW   | CA     | ET     |

| 體育台 | 財經台 | 學術台 | 講故台 | 創意台 |
| ------ | ------ | ------ | ------ | ------ |
| SP     | FN     | ST     | SY     | EP     |

| 硬件台 | 電訊台 | 軟件台 | 手機台 | Apps 台 |
| ------ | ------ | ------ | ------ | ------- |
| HW     | IN     | SW     | MP     | AP      |

| 遊戲台 | 飲食台 | 旅遊台 | 潮流台 | 動漫台 |
| ------ | ------ | ------ | ------ | ------ |
| GM     | ED     | TR     | CO     | AN     |

| 玩具台 | 音樂台 | 影視台 | 攝影台 | 汽車台 |
| ------ | ------ | ------ | ------ | ------ |
| TO     | MU     | VI     | DC     | TS     |

| 上班台 | 感情台 | 校園台 | 親子台 | 寵物台 |
| ------ | ------ | ------ | ------ | ------ |
| WK     | LV     | SC     | BB     | PT     |

| 站務台 | 電台 | 活動台 | 買賣台 | 直播台 | 成人台 | 考古台 |
| ------ | ---- | ------ | ------ | ------ | ------ | ------ |
| MB     | RA   | AC     | BS     | JT     | AU     | OP     |

排序

| 最後回應時間 | 發表時間 | 熱門 |
| ------------ | -------- | ---- |
| 0            | 1        | 2    |

類型

| 全部 | 正式 | 公海 |
| ---- | ---- | ---- |
| -1   | 1    | 0    |

</Route>

## 香港討論區 {#xiang-gang-tao-lun-qu}

### 版塊 {#xiang-gang-tao-lun-qu-ban-kuai}

<Route author="nczitzk" example="/discuss/62" path="/discuss/:fid" paramsDesc={['fid，可在对应板块页的 URL 中找到']}/>

## 香水时代 {#xiang-shui-shi-dai}

### 首页 {#xiang-shui-shi-dai-shou-ye}

<Route author="kt286" example="/nosetime/home" path="/nosetime/home"/>

### 香评 {#xiang-shui-shi-dai-xiang-ping}

<Route author="kt286" example="/nosetime/59247733/discuss/new" path="/nosetime/:id/:type/:sort?" paramsDesc={['用户id，可在用户主页 URL 中找到', '类型，short 一句话香评  discuss 香评', '排序， new 最新  agree 最有用']}/>

## 消费者委员会 {#xiao-fei-zhe-wei-yuan-hui}

### 文章 {#xiao-fei-zhe-wei-yuan-hui-wen-zhang}

<Route author="nczitzk" example="/consumer" path="/consumer/:category?/:language?/:keyword?" paramsDesc={['分类，见下表，默认为測試及調查', '语言，见下表，默认为繁体中文', '关键字，默认为空']}>

分类

| 测试及调查 | 生活资讯 | 投诉实录  | 议题评论 |
| ---------- | -------- | --------- | -------- |
| test       | life     | complaint | topic    |

语言

| 简体中文 | 繁体中文 |
| -------- | -------- |
| sc       | tc       |

</Route>

## 小刀娱乐网 {#xiao-dao-yu-le-wang}

### 分类 {#xiao-dao-yu-le-wang-fen-lei}

<Route author="nczitzk" example="/x6d/34" path="/x6d/:id?" paramsDesc={['分类 id，可在对应分类页面的 URL 中找到，默认为首页最近更新']} radar="1">

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

## 小专栏 {#xiao-zhuan-lan}

### 专栏 {#xiao-zhuan-lan-zhuan-lan}

<Route author="TonyRL" example="/xiaozhuanlan/column/olddriver-selection" path="/xiaozhuanlan/column/:id" paramsDesc={['专栏 ID，可在专栏页 URL 中找到']} radar="1" rssbud="1" />

## 辛華社 {#xin-hua-she}

### 首页 {#xin-hua-she-shou-ye}

<Route author="nczitzk" example="/hotchina" path="/hotchina"/>

### 分类 {#xin-hua-she-fen-lei}

<Route author="nczitzk" example="/hotchina" path="/hotchina/category/:id?" paramsDesc={['分类，见下表，默认为首页']}>

| 攝徒日記 | 辛華社特約報導 | 小粉紅觀察 | 維權消息 | 讀者投書 | 中國牆內 | 台灣國 | 國際 |
| -------- | -------------- | ---------- | -------- | -------- | -------- | ------ | ---- |

</Route>

### 标签 {#xin-hua-she-biao-qian}

<Route author="nczitzk" example="/hotchina" path="/hotchina/tag/:id?" paramsDesc={['标签，可在对应标签页的 URL 中找到，默认为首页']}>

以下为 Top Tags：

| 辱華 | 小粉紅 | 中國限電 | 徵稿 | 特約報導 | 舔共藝人 | 中共國慶 |
| ---- | ------ | -------- | ---- | -------- | -------- | -------- |

</Route>

## 新华网 {#xin-hua-wang}

### 新华社新闻 {#xin-hua-wang-xin-hua-she-xin-wen}

<Route author="nczitzk" example="/news/whxw" path="/news/whxw"/>

## 新浪 {#xin-lang}

### 科技 - 科学探索 {#xin-lang-ke-ji---ke-xue-tan-suo}

<Route author="LogicJake" example="/sina/discovery/zx" path="/sina/discovery/:type" paramsDesc={['订阅分区类型，见下表']} radar="1">

| 最新 | 天文航空 | 动物植物 | 自然地理 | 历史考古 | 生命医学 | 生活百科 | 科技前沿 |
| ---- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| zx   | twhk     | dwzw     | zrdl     | lskg     | smyx     | shbk     | kjqy     |

</Route>

### 滚动新闻 {#xin-lang-gun-dong-xin-wen}

<Route author="xyqfer" example="/sina/rollnews" path="/sina/rollnews/:lid?" paramsDesc={['分区 id，可在 URL 中找到，默认为 `2509`']} radar="1">

| 全部 | 国内 | 国际 | 社会 | 体育 | 娱乐 | 军事 | 科技 | 财经 | 股市 | 美股 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 2509 | 2510 | 2511 | 2669 | 2512 | 2513 | 2514 | 2515 | 2516 | 2517 | 2518 |

</Route>

### 体育 - 综合 {#xin-lang-ti-yu---zong-he}

<Route author="nczitzk" example="/sina/sports/volley" path="/sina/sports/:type" paramsDesc={['运动类型，见下表']} radar="1">

| 排球   | 游泳 | 乒乓球   | 羽毛球 | 台球    | 田径     | 体操  | 冰雪   | 射击 | 马术  | 拳击搏击 | UFC | 其他   |
| ------ | ---- | -------- | ------ | ------- | -------- | ----- | ------ | ---- | ----- | -------- | --- | ------ |
| volley | swim | pingpang | badmin | snooker | tianjing | ticao | winter | sh   | horse | kungfu   | ufc | others |

</Route>

### 财经－国內 {#xin-lang-cai-jing-%EF%BC%8D-guo-nei}

<Route author="yubinbai" example="/sina/finance/china" path="/sina/finance/china/:lid?" paramsDesc={['分区 id，见下表，默认为 `1686`']} radar="1">

| 国内滚动 | 宏观经济 | 金融新闻 | 地方经济 | 部委动态 | 今日财经 TOP10 |
| -------- | -------- | -------- | -------- | -------- | -------------- |
| 1686     | 1687     | 1690     | 1688     | 1689     | 3231           |

</Route>

### 美股 {#xin-lang-mei-gu}

<Route author="TonyRL" example="/sina/finance/stock/usstock" path="/sina/finance/stock/usstock/:cids?" paramsDesc={['分区 id，见下表，默认为 `57045`']} radar="1">

| 最新报道 | 中概股 | 国际财经 | 互联网 |
| -------- | ------ | -------- | ------ |
| 57045    | 57046  | 56409    | 40811  |

</Route>

### 专栏 - 创事记 {#xin-lang-zhuan-lan---chuang-shi-ji}

<Route author="xapool" example="/sina/csj" path="/sina/csj" radar="1"/>

## 选股宝 {#xuan-gu-bao}

### 主题 {#xuan-gu-bao-zhu-ti}

<Route author="hillerliao" example="/xuangubao/subject/41" path="/xuangubao/subject/:subject_id" paramsDesc={['主题 id，网址 https://xuangubao.cn/subject/41 中最后的数字']}/>

## 妖火网 {#yao-huo-wang}

<Route author="nczitzk" example="/yaohuo/new" path="/yaohuo/:type?" paramsDesc={['排序类型，可选 `new` 指最新，`hot` 指最热，默认为 `new`']}/>

## 一兜糖 {#yi-dou-tang}

### 首页精选 {#yi-dou-tang-shou-ye-jing-xuan}

<Route author="sanmmm" example="/yidoutang/index" path="/yidoutang/index"/>

### 文章 {#yi-dou-tang-wen-zhang}

<Route author="sanmmm" example="/yidoutang/guide" path="/yidoutang/guide"/>

### 众测 {#yi-dou-tang-zhong-ce}

<Route author="sanmmm" example="/yidoutang/mtest" path="/yidoutang/mtest"/>

### 全屋记 {#yi-dou-tang-quan-wu-ji}

<Route author="sanmmm" example="/yidoutang/case/hot" path="/yidoutang/:type?" paramsDesc={['类型, 默认为`default`']}>

类型

| 默认    | 最热 | 最新 |
| ------- | ---- | ---- |
| default | hot  | new  |

</Route>

## 壹蘋新聞網 {#yi-pin-xin-wen-wang}

### 最新新聞 {#yi-pin-xin-wen-wang-zui-xin-xin-wen}

<Route author="miles170" example="/nextapple/realtime/latest" path="/nextapple/realtime/:category?" paramsDesc={['類別，見下表，默認為首頁']}>

| 首頁   | 焦點      | 熱門 | 娛樂          | 生活 | 女神     | 社會  |
| ------ | --------- | ---- | ------------- | ---- | -------- | ----- |
| latest | recommend | hit  | entertainment | life | gorgeous | local |

| 政治     | 國際          | 財經    | 體育   | 旅遊美食  | 3C 車市 |
| -------- | ------------- | ------- | ------ | --------- | ------- |
| politics | international | finance | sports | lifestyle | gadget  |

</Route>

## 移动支付网 {#yi-dong-zhi-fu-wang}

### 新闻 {#yi-dong-zhi-fu-wang-xin-wen}

<Route author="LogicJake genghis-yang" example="/mpaypass/news" path="/mpaypass/news"/>

### 分类 {#yi-dong-zhi-fu-wang-fen-lei}

<Route author="zhuan-zhu" example="/mpaypass/main/policy" path="mpaypass/main/:type?" paramsDesc={['新闻类型，类型可在URL中找到，类似`policy`，`eye`等，空或其他任意值展示最新新闻']}/>

## 亿欧网 {#yi-ou-wang}

### 资讯 {#yi-ou-wang-zi-xun}

<Route author="WenryXu" example="/iyiou" path="/iyiou"/>

## 异次元软件世界 {#yi-ci-yuan-ruan-jian-shi-jie}

### 首页 {#yi-ci-yuan-ruan-jian-shi-jie-shou-ye}

<Route author="kimi360" example="/iplay/home" path="/iplay/home"/>

## 游戏葡萄 {#you-xi-pu-tao}

### 文章 {#you-xi-pu-tao-wen-zhang}

<Route author="KotoriK nczitzk" example="/gamegrape/13" path="/gamegrape/:id?" paramsDesc={['分类 id，见下表，默认为全部']}>

| 全部 | 深度 | 资讯 | DemoWall | 酷玩 | 海外 | 专栏 | 葡萄观察 |
| ---- | ---- | ---- | -------- | ---- | ---- | ---- | -------- |
|      | 13   | 14   | 15       | 16   | 17   | 18   | 19       |

</Route>

## 有趣天文奇观 {#you-qu-tian-wen-qi-guan}

### 首页 {#you-qu-tian-wen-qi-guan-shou-ye}

<Route author="nczitzk" example="/interesting-sky" path="/interesting-sky"/>

### 年度天象（天文年历） {#you-qu-tian-wen-qi-guan-nian-du-tian-xiang-%EF%BC%88-tian-wen-nian-li-%EF%BC%89}

<Route author="nczitzk" example="/interesting-sky/astronomical_events" path="/interesting-sky/astronomical_events/:year?" paramsDesc={['年份，默认为当前年份']}/>

### 近期事件专题 {#you-qu-tian-wen-qi-guan-jin-qi-shi-jian-zhuan-ti}

<Route author="nczitzk" example="/interesting-sky/recent-interesting" path="/interesting-sky/recent-interesting"/>

## 鱼塘热榜 {#yu-tang-re-bang}

<Route author="TheresaQWQ" example="/mofish/2" path="/mofish/:id" paramsDesc={['分类id，可以在 https://api.tophub.fun/GetAllType 获取']} />

## 遠見 {#yuan-jian}

<Route author="laampui" example="/gvm/index/health" path="/gvm/index/:category?" paramsDesc={['見下表, 默認爲 newest']}>

| 最新文章 | 你可能會喜歡 | 名家專欄 | 專題  | 時事熱點 | 政治     | 社會    | 人物報導 | 國際  | 全球焦點    | 兩岸                  | 金融理財 | 投資理財   | 保險規劃  | 退休理財 | 金融 Fintech | 房地產      | 總體經濟 | 科技 | 科技趨勢   | 能源   | 產經     | 傳產     | 消費服務 | 生技醫藥 | 傳承轉型                   | 創業新創 | 管理       | 農業        | 教育      | 高教             | 技職          | 親子教育 | 國際文教        | 體育   | 好享生活 | 時尚設計 | 心靈成長    | 藝文影視 | 旅遊   | 環境生態    | 健康   | 美食 | 職場生涯 | 調查   | 縣市   | CSR |
| -------- | ------------ | -------- | ----- | -------- | -------- | ------- | -------- | ----- | ----------- | --------------------- | -------- | ---------- | --------- | -------- | ------------ | ----------- | -------- | ---- | ---------- | ------ | -------- | -------- | -------- | -------- | -------------------------- | -------- | ---------- | ----------- | --------- | ---------------- | ------------- | -------- | --------------- | ------ | -------- | -------- | ----------- | -------- | ------ | ----------- | ------ | ---- | -------- | ------ | ------ | --- |
| newest   | recommend    | opinion  | topic | news     | politics | society | figure   | world | world_focus | cross_strait_politics | money    | investment | insurance | retire   | fintech      | real_estate | economy  | tech | tech_trend | energy | business | industry | service  | medical  | family_business_succession | startup  | management | agriculture | education | higher_education | technological | parent   | world_education | sports | life     | art      | self_growth | film     | travel | environment | health | food | career   | survey | county | csr |

</Route>

## 云奇网 {#yun-qi-wang}

### 微语简报 {#yun-qi-wang-wei-yu-jian-bao}

<Route author="x2009again" example="/yunspe/newsflash" path="/yunspe/newsflash" />

## 早报网 {#zao-bao-wang}

### 每日早报 {#zao-bao-wang-mei-ri-zao-bao}

<Route author="nczitzk" example="/qqorw" path="/qqorw/:category?" paramsDesc={['分类，见下表，默认为首页']} radar="1" rssbud="1">

| 首页 | 每日早报 | 国际早报 | 生活冷知识 |
| ---- | -------- | -------- | ---------- |
|      | mrzb     | zbapp    | zbzzd      |

</Route>

## 知园 {#zhi-yuan}

### Newsletter {#zhi-yuan-newsletter}

<Route author="TonyRL" example="/zhiy/letters/messy" path="/zhiy/letters/:author" paramsDesc={['作者 ID，可在URL中找到']} radar="1" rssbud="1"/>

### 笔记 {#zhi-yuan-bi-ji}

<Route author="TonyRL" example="/zhiy/posts/long" path="/zhiy/posts/:author" paramsDesc={['作者 ID，可在URL中找到']} radar="1" rssbud="1"/>

## 中国纺织经济信息网 {#zhong-guo-fang-zhi-jing-ji-xin-xi-wang}

### 资讯 {#zhong-guo-fang-zhi-jing-ji-xin-xi-wang-zi-xun}

<Route author="nczitzk" example="/ctei/news/bwzq" path="/ctei/news/:id?" paramsDesc={['分类 id，可在分类页的 URL 中找到，默认为本网专区']}>

| 要闻   | 国内     | 国际     | 企业    | 品牌  | 外贸  | 政策   | 科技       | 流行    | 服装    | 家纺    |
| ------ | -------- | -------- | ------- | ----- | ----- | ------ | ---------- | ------- | ------- | ------- |
| newsyw | domestic | internal | company | brand | trade | policy | Technology | fashion | apparel | hometex |

</Route>

## 中国工人出版社 {#zhong-guo-gong-ren-chu-ban-she}

### 新闻中心 {#zhong-guo-gong-ren-chu-ban-she-xin-wen-zhong-xin}

<Route author="nczitzk" example="/wp-china/news" path="/wp-china/news/:category?" paramsDesc={['分类，见下表，默认为最新资讯']}>

| 最新资讯 | 专题报道 |
| -------- | -------- |
| latest   | stories  |

</Route>

## 中国机械工程学会 {#zhong-guo-ji-xie-gong-cheng-xue-hui}

### 学会新闻 {#zhong-guo-ji-xie-gong-cheng-xue-hui-xue-hui-xin-wen}

<Route author="nczitzk" example="/cmes/news" path="/cmes/news/:category?" paramsDesc={['分类，见下表，默认为 学会要闻']}>

| 学会要闻    | 学会动态 | 科技新闻 |
| ----------- | -------- | -------- |
| Information | Dynamics | TechNews |

</Route>

## 中国科学院青年创新促进会 {#zhong-guo-ke-xue-yuan-qing-nian-chuang-xin-cu-jin-hui}

### 最新博文 {#zhong-guo-ke-xue-yuan-qing-nian-chuang-xin-cu-jin-hui-zui-xin-bo-wen}

<Route author="nczitzk" example="/yicas/blog" path="/yicas/blog"/>

## 中国收入分配研究院 {#zhong-guo-shou-ru-fen-pei-yan-jiu-yuan}

### 分类 {#zhong-guo-shou-ru-fen-pei-yan-jiu-yuan-fen-lei}

<Route author="nczitzk" example="/ciidbnu" path="/ciidbnu/:id?" paramsDesc={['分类 id，可在分类页地址栏 URL 中找到']}>

| 社会动态 | 院内新闻 | 学术观点 | 文献书籍 | 工作论文 | 专题讨论 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| 1        | 5        | 3        | 4        | 6        | 8        |

</Route>

## 中国橡胶网 {#zhong-guo-xiang-jiao-wang}

### 新闻资讯 {#zhong-guo-xiang-jiao-wang-xin-wen-zi-xun}

<Route author="nczitzk" example="/cria/news/1" path="/cria/news/:id?" paramsDesc={['列表 id，可在列表页的 URL 中找到，默认为首页']}/>

## 重构 {#zhong-gou}

### 推荐 {#zhong-gou-tui-jian}

<Route author="nczitzk" example="/allrecode/recommends" path="/allrecode/recommends" />

### 快讯 {#zhong-gou-kuai-xun}

<Route author="nczitzk" example="/allrecode/news" path="/allrecode/news" />

### 资讯 {#zhong-gou-zi-xun}

<Route author="nczitzk" example="/allrecode/posts" path="/allrecode/:category?" paramsDesc={['分类，见下表，默认为全部']}>

| 分类     | id                 |
| -------- | ------------------ |
| 全部     | posts              |
| NFT      | non-fungible-token |
| DAO      | dao                |
| Web3     | web3               |
| 安全     | security           |
| 政策     | global-policy      |
| 元宇宙   | metaverse          |
| 区块链   | blockchain         |
| 融资新闻 | financing-news     |
| 趋势观察 | trend-observation  |

</Route>

## 眾新聞 {#zhong-xin-wen}

### 眾聞 {#zhong-xin-wen-zhong-wen}

<Route author="nczitzk" example="/hkcnews/news" path="/hkcnews/news/:category?" paramsDesc={['分类，见下表，默认为全部']}>

| 全部 | 經濟 | 社會 | 生活 | 政治 | 國際 | 台灣 | 人物 | 中國 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
|      | 13   | 15   | 14   | 12   | 16   | 20   | 21   | 19   |

</Route>

## 珠海网 {#zhu-hai-wang}

### 栏目 {#zhu-hai-wang-lan-mu}

<Route author="nczitzk" example="/hizu" path="/hizu/:column?" paramsDesc={['栏目，见下表，默认为热点']}>

| 分类     | 编号                     |
| -------- | ------------------------ |
| 热点     | 5dd92265e4b0bf88dd8c1175 |
| 订阅     | 5dd921a7e4b0bf88dd8c116f |
| 学党史   | 604f1cbbe4b0cf5c2234d470 |
| 政经     | 5dd92242e4b0bf88dd8c1174 |
| 合作区   | 61259fd6e4b0d294f7f9786d |
| 名记名播 | 61dfe511e4b0248b60d1c568 |
| 大湾区   | 5dd9222ce4b0bf88dd8c1173 |
| 网评     | 617805e4e4b037abacfd4820 |
| TV 新闻  | 5dd9220de4b0bf88dd8c1172 |
| 音频     | 5e6edd50e4b02ebde0ab061e |
| 澳门     | 600e8ad4e4b02c3a6af6aaa8 |
| 政务     | 600f760fe4b0e33cf6f8e68e |
| 教育     | 5ff7c0fde4b0e2f210d05e20 |
| 深圳     | 5fc88615e4b0e3055e693e0a |
| 中山     | 600e8a93e4b02c3a6af6aa80 |
| 民生     | 5dd921ece4b0bf88dd8c1170 |
| 社区     | 61148184e4b08d3215364396 |
| 专题     | 5dd9215fe4b0bf88dd8c116b |
| 战疫     | 5e2e5107e4b0c14b5d0e3d04 |
| 横琴     | 5f88eaf2e4b0a27cd404e09e |
| 香洲     | 5f86a3f5e4b09d75f99dde7d |
| 金湾     | 5e8c42b4e4b0347c7e5836e0 |
| 斗门     | 5ee70534e4b07b8a779a1ad6 |
| 高新     | 607d37ade4b05c59ac2f3d40 |

</Route>

## 装备前线 {#zhuang-bei-qian-xian}

### 首页最新帖子 {#zhuang-bei-qian-xian-shou-ye-zui-xin-tie-zi}

<Route author="Jeason0228" example="/zfrontier/postlist/:byReplyTime" path="/zfrontier/postlist" paramsDesc={['内容标签, 点击标签后地址栏有显示']}/>

### 子板块帖子 {#zhuang-bei-qian-xian-zi-ban-kuai-tie-zi}

<Route author="c4605" example="/zfrontier/board/56" path="/zfrontier/board/:boardId" paramsDesc={['板块 ID']}>

QueryString:

-   `sort`：排序方式

| 根据创建时间（默认） | 根据回复时间 | 根据热度 |
| -------------------- | ------------ | -------- |
| byCtime              | byReplyTime  | byScore  |

</Route>

## 紫竹张先生 {#zi-zhu-zhang-xian-sheng}

### 全文 {#zi-zhu-zhang-xian-sheng-quan-wen}

<Route author="HenryQW nczitzk" example="/zzz" path="/zzz/:category?/:language?" paramsDesc={['分类，见下表，默认为全部', '语言，见下表，默认为简体中文']}>

分类

| 全部 | 房股财经     | 时事评论      | 每日一见    | 随心杂谈    | 精彩推荐       | 历史新撰     |
| ---- | ------------ | ------------- | ----------- | ----------- | -------------- | ------------ |
| all  | fangshigushi | shishipinglun | meiriyijian | suixinzatan | jingcaituijian | lishixinzuan |

语言

| 简体中文 | 港澳繁體 | 台灣正體 |
| -------- | -------- | -------- |
|          | zh-hk    | zh-tw    |

</Route>

## 字节点击 {#zi-jie-dian-ji}

### 首页 {#zi-jie-dian-ji-shou-ye}

<Route author="TonyRL" example="/byteclicks" path="/byteclicks" radar="1" />

### 标签 {#zi-jie-dian-ji-biao-qian}

<Route author="TonyRL" example="/byteclicks/tag/人工智能" path="/byteclicks/tag/:tag" radar="1" paramsDesc={['标签，可在URL中找到']}/>

## 自由微信 {#zi-you-wei-xin}

### 公众号 {#zi-you-wei-xin-gong-zhong-hao}

<Route author="TonyRL" example="/freewechat/profile/MzI5NTUxNzk3OA==" path="/freewechat/profile/:id" paramsDesc={['公众号 ID，可在URL中找到']} radar="1" rssbud="1" anticrawler="1"/>
