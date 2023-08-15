import Route from '@site/src/components/Route';

# 🎮 游戏

## 3DMGame {#3dmgame}

### 新闻中心 {#3dmgame-xin-wen-zhong-xin}

<Route author="zhboner" example="/3dmgame/news" path="/3dmgame/news/:category?" paramsDesc={['分类名或 ID，见下表，默认为新闻推荐，ID 可从分类 URL 中找到，如 Steam 为 `22221`']} radar="1">

| 新闻推荐 | 游戏新闻 | 动漫影视 | 智能数码 | 时事焦点  |
| -------- | -------- | -------- | -------- | --------- |
|          | game     | acg      | next     | news_36_1 |

</Route>

### 游戏资讯 {#3dmgame-you-xi-zi-xun}

<Route author="sinchang jacky2001114 HenryQW" example="/3dmgame/detroitbecomehuman/news" path="/3dm/:name/:type?" paramsDesc={['游戏名字，可以在专题页的 url 中找到', '资讯类型，见下表，默认为 `news`']} radar="1">

| 新闻 | 攻略 | 资源     |
| ---- | ---- | -------- |
| news | gl   | resource |

</Route>

## 4Gamers 新闻 {#4gamers-xin-wen}

### 分类 {#4gamers-xin-wen-fen-lei}

<Route author="hoilc" example="/4gamers/category/352" path="/4gamers/category/:category" paramsDesc={['分类 ID, 可从分类 URL 中找到']}/>

### 标签 {#4gamers-xin-wen-biao-qian}

<Route author="hoilc" example="/4gamers/tag/英雄聯盟" path="/4gamers/tag/:tag" paramsDesc={['标签名, 可在标签 URL 中找到']}/>

### 主題 {#4gamers-xin-wen-zhu-ti}

<Route author="bestpika" example="/4gamers/topic/gentlemen-topic" path="/4gamers/topic/:topic" paramsDesc={['主题, 可在首页上方页面内找到']} />

## 5EPLAY {#5eplay}

### 新闻列表 {#5eplay-xin-wen-lie-biao}

<Route author="Dlouxgit" example="/5eplay/article" path="/5eplay/article"/>

## a9vgNews 游戏新闻 {#a9vgnews-you-xi-xin-wen}

### a9vgNews 游戏新闻 {#a9vgnews-you-xi-xin-wen-a9vgnews-you-xi-xin-wen}

<Route author="monner-henster" example="/a9vg/a9vg" path="/a9vg/a9vg"/>

## Blizzard {#blizzard}

### News {#blizzard-news}

<Route author="nczitzk" example="/blizzard/news" path="/blizzard/news/:language?/:category?" paramsDesc={['语言代码，见下表，默认为 en-US', '分类，见下表，默认为全部新闻']}>

分类

| 分类                   | 分类名              |
| ---------------------- | ------------------- |
| 所有新闻               |                     |
| Diablo II: Resurrected | diablo2             |
| 暗黑破坏神 III         | diablo3             |
| 暗黑破坏神 IV          | diablo4             |
| 暗黑破坏神：不朽       | diablo-immortal     |
| 炉石传说               | hearthstone         |
| 风暴英雄               | heroes-of-the-storm |
| 守望先锋 2             | overwatch           |
| 星际争霸：重制版       | starcraft           |
| 星际争霸 II            | starcraft2          |
| 魔兽世界               | world-of-warcraft   |
| 魔兽争霸 III：重制版   | warcraft3           |
| Battle.net             | battlenet           |
| 暴雪嘉年华             | blizzcon            |
| 走进暴雪               | blizzard            |

语言代码

| 语言               | 语言代码 |
| ------------------ | -------- |
| Deutsch            | de-de    |
| English (US)       | en-us    |
| English (EU)       | en-gb    |
| Español (EU)       | es-es    |
| Español (Latino)   | es-mx    |
| Français           | fr-fr    |
| Italiano           | it-it    |
| Português (Brasil) | pt-br    |
| Polski             | pl-pl    |
| Русский            | ru-ru    |
| 한국어             | ko-kr    |
| ภาษาไทย            | th-th    |
| 日本語             | ja-jp    |
| 繁體中文           | zh-tw    |

</Route>

## dekudeals {#dekudeals}

### 分类 {#dekudeals-fen-lei}

<Route author="LogicJake" example="/dekudeals/most-wanted" path="/dekudeals/:type" paramsDesc={['分类名称，可在 URL 中查看']}/>

## Dorohedoro {#dorohedoro}

### News {#dorohedoro-news}

<Route author="nczitzk" example="/dorohedoro/news" path="/dorohedoro/news" />

## Epic Games Store {#epic-games-store}

### 免费游戏 {#epic-games-store-mian-fei-you-xi}

<Route author="Zyx-A nczitzk KotaHv" example="/epicgames/freegames" path="/epicgames/freegames/:locale?/:country?" paramsDesc={['地区，默认为 en_US', '国家，默认为 en_US']}/>

## Fate Grand Order {#fate-grand-order}

### News {#fate-grand-order-news}

<Route author="nczitzk" example="/fgo/news" path="/fgo/news"/>

## Fortnite {#fortnite}

### News {#fortnite-news}

<Route author="lyqluis" example="/fortnite/news" path="/fortnite/news/:options?" paramsDesc={['参数']} radar="1" puppeteer="1">

-   `options.lang`，可选，语言，实例：`/fortnite/news/lang=en-US`，常见语言见下表，更多语言参考 [官网](https://www.fortnite.com/news)

| 英语（默认） | 日语 | 法语 | 韩语 |
| ------------ | ---- | ---- | ---- |
| en-US        | ja   | fr   | ko   |

</Route>

## GameApps.hk 香港手机游戏网 {#gameapps.hk-xiang-gang-shou-ji-you-xi-wang}

### 最新消息 {#gameapps.hk-xiang-gang-shou-ji-you-xi-wang-zui-xin-xiao-xi}

<Route author="TonyRL" example="/gameapps" path="/gameapps"/>

## Gamer Secret {#gamer-secret}

### 最新資訊 {#gamer-secret-zui-xin-zi-xun}

<Route author="nczitzk" example="/gamersecret" path="/gamersecret"/>

### 分類 {#gamer-secret-fen-lei}

<Route author="nczitzk" example="/gamersecret/pc" path="/gamersecret/:type?/:category?" paramsDesc={['类型，见下表，默认为 Latest News', '分类，见下表，默认为空']}>

| Latest News | PC | Playstation | Nintendo | Xbox | Moblie |
| ----------- | -- | ----------- | -------- | ---- | ------ |
| latest-news | pc | playstation | nintendo | xbox | moblie |

或者

| GENERAL          | GENERAL EN         | MOBILE          | MOBILE EN         |
| ---------------- | ------------------ | --------------- | ----------------- |
| category/general | category/generalen | category/mobile | category/mobileen |

| NINTENDO          | NINTENDO EN         | PC          | PC EN         |
| ----------------- | ------------------- | ----------- | ------------- |
| category/nintendo | category/nintendoen | category/pc | category/pcen |

| PLAYSTATION          | PLAYSTATION EN         | REVIEWS          |
| -------------------- | ---------------------- | ---------------- |
| category/playstation | category/playstationen | category/reviews |

| XBOX          | XBOX EN         |
| ------------- | --------------- |
| category/xbox | category/xboxen |

</Route>

## GameRes 游资网 {#gameres-you-zi-wang}

### 热点推荐 {#gameres-you-zi-wang-re-dian-tui-jian}

<Route author="nczitzk" example="/gameres/hot" path="/gameres/hot"/>

### 列表 {#gameres-you-zi-wang-lie-biao}

<Route author="nczitzk" example="/gameres/list/26" path="/gameres/list/:id" paramsDesc={['列表 id']}>

产业

| 厂商・专访 | 观察・投资 | 产品 | 政策 | 电子竞技 | 直播 | 区块链 |
| ---------- | ---------- | ---- | ---- | -------- | ---- | ------ |
| 1          | 11         | 6    | 45   | 14       | 42   | 41     |

平台

| 手游 | 页游・H5 | 端游・PC | 主机 | 虚拟・VR・AR | 云游戏 |
| ---- | -------- | -------- | ---- | ------------ | ------ |
| 5    | 17       | 18       | 21   | 16           | 48     |

研发

| 拆解分析 | 策划 | 程序・引擎 | 美术 | 音乐 | 测试 |
| -------- | ---- | ---------- | ---- | ---- | ---- |
| 24       | 25   | 26         | 27   | 28   | 29   |

市场

| 职场・创业 | 运营・渠道 | 海外 | 数据・报告 | App Store | Steam |
| ---------- | ---------- | ---- | ---------- | --------- | ----- |
| 38         | 34         | 47   | 33         | 46        | 40    |

其他

| 原创 | 硬件・周边 | 八卦 | 活动 | 综合 |
| ---- | ---------- | ---- | ---- | ---- |
| 43   | 44         | 15   | 22   | 39   |

</Route>

## GNN.tw 游戏新闻 {#gnn.tw-you-xi-xin-wen}

### GNN.tw 游戏新闻 {#gnn.tw-you-xi-xin-wen-gnn.tw-you-xi-xin-wen}

<Route author="monner-henster" example="/gnn/gnn" path="/gnn/gnn"/>

## Indienova {#indienova}

### indienova 文章 {#indienova-indienova-wen-zhang}

<Route author="GensouSakuya kt286" example="/indienova/article" path="indienova/:type" paramsDesc={['类型: `article` 文章，`development` 开发']}/>

## itch.io {#itch.io}

### Browse {#itch.io-browse}

<Route author="nczitzk" example="/itch/games/new-and-popular/featured" path="/itch/:params?" paramsDesc={['参数']}>

参数为对应页面 URL 中 `itch.io` 后的字段，如 [Top rated Games tagged Singleplayer](https://itch.io/games/top-rated/tag-singleplayer) 的 URL 是 <https://itch.io/games/top-rated/tag-singleplayer>，其中 `itch.io` 后的字段为 `/games/top-rated/tag-singleplayer`。

所以路由为 [`/itch/games/top-rated/tag-singleplayer`](https://rsshub.app/itch/games/top-rated/tag-singleplayer)。

:::tip 提示

你可以在 [这里](https://itch.io/tags)，浏览所有的 tags。

:::

</Route>

### Developer Logs {#itch.io-developer-logs}

<Route author="nczitzk" example="/itch/devlog/teamterrible/the-baby-in-yellow" path="/itch/devlog/:user/:id" paramsDesc={['用户 id，可在对应页面地址栏中找到', '项目 id，可在对应页面地址栏中找到']}>

用户 id 为对应页面 URL 中 `.itch.io` 前的字段，如 [The Baby In Yellow Devlog](https://teamterrible.itch.io/the-baby-in-yellow/devlog) 的 URL 是 <https://teamterrible.itch.io/the-baby-in-yellow/devlog>，其中 `.itch.io` 前的字段为 `teamterrible`；

项目 id 为对应页面 URL 中 `itch.io` 与 `/devlog` 之间的字段，如 [The Baby In Yellow Devlog](https://teamterrible.itch.io/the-baby-in-yellow/devlog) 的 URL 是 <https://teamterrible.itch.io/the-baby-in-yellow/devlog>，其中 `itch.io` 与 `/devlog` 之间的字段为 `the-baby-in-yellow`。

所以路由为 [`/itch/devlogs/teamterrible/the-baby-in-yellow`](https://rsshub.app/itch/devlogs/teamterrible/the-baby-in-yellow)。

</Route>

### Posts {#itch.io-posts}

<Route author="nczitzk" example="/itch/posts/9539/introduce-yourself" path="/itch/posts/:topic/:id" paramsDesc={['话题 id，可在对应页面地址栏中找到', '话题名，可在对应页面地址栏中找到']}/>

## JUMP {#jump}

### 游戏折扣 {#jump-you-xi-zhe-kou}

<Route author="zytomorrow" path="/jump/discount/:platform/:filter?/:countries?" example="/jump/discount/ps5/all" paramsDesc={['平台:switch,ps4,ps5,xbox,steam,epic', '过滤参数,all-全部，jx-精选，sd-史低，dl-独立，vip-会员', '地区，具体支持较多，可自信查看地区简写']}>
| switch | ps4  | ps5  | xbox   | steam | epic   |
| ------ | ---- | ---- | ------ | ----- | ------ |
| 可用   | 可用 | 可用 | 不可用 | 可用  | 不可用 |

| filter | switch | ps4 | ps5 | steam |
| ------ | ------ | --- | --- | ----- |
| all    | ✔      | ✔   | ✔   | ✔     |
| jx     | ✔      | ✔   | ❌  | ✔     |
| sd     | ✔      | ✔   | ✔   | ✔     |
| dl     | ❌     | ✔   | ❌  | ✔     |
| vip    | ❌     | ❌  | ✔   | ❌    |

| 北美 | 欧洲（英语） | 法国 | 德国 | 日本 |
| ---- | ------------ | ---- | ---- | ---- |
| na   | eu           | fr   | de   | jp   |

</Route>

## Konami {#konami}

### PES Mobile 公告 {#konami-pes-mobile-gong-gao}

<Route author="HenryQW" example="/konami/pesmobile/zh-cn/ios" path="/konami/pesmobile/:lang?/:os?" paramsDesc={['语言，在URL中获得，如zh-cn, zh-tw, en', '操作系统，iOS 或 Android']}/>

## Liquipedia {#liquipedia}

### Dota2 战队最近比赛结果 {#liquipedia-dota2-zhan-dui-zui-jin-bi-sai-jie-guo}

<Route author="wzekin" example="/liquipedia/dota2/matches/Team_Aster" path="liquipedia/dota2/matches/:id" paramsDesc={['战队名称，可在url中找到。例如:https://liquipedia.net/dota2/Team_Aster']}/>

## Maxjia News {#maxjia-news}

### Dota 2 {#maxjia-news-dota-2}

<Route author="dearrrfish" example="/maxnews/dota2" path="maxnews/dota2" />

## Metacritic {#metacritic}

### 新游发行 {#metacritic-xin-you-fa-xing}

<Route author="HenryQW" example="/metacritic/release/switch/coming" path="/metacritic/release/:platform/:type?/:sort?" paramsDesc={['主机平台', '发行类型，默认为 `new`', '排序类型，默认为`date`']}>

支持的主机平台:

| PS 4 | Xbox One | Switch | PC | Wii U | 3DS | PS Vita | iOS |
| ---- | -------- | ------ | -- | ----- | --- | ------- | --- |
| ps4  | xboxone  | switch | pc | wii-u | 3ds | vita    | ios |

发行类型，默认为 `new`:

| 新游发行 | 即将发行 | 全部 |
| -------- | -------- | ---- |
| new      | coming   | all  |

排序类型，默认为`date`:

| 日期 | Metacritic 评分 | 用户评分  |
| ---- | --------------- | --------- |
| date | metascore       | userscore |

</Route>

## Minecraft {#minecraft}

### Java 版游戏更新 {#minecraft-java-ban-you-xi-geng-xin}

<Route author="TheresaQWQ" example="/minecraft/version" path="/minecraft/version" />

### CurseForge Mod 更新 {#minecraft-curseforge-mod-geng-xin}

<Route author="Indexyz Discreater" example="/curseforge/files/jei" path="/curseforge/files/:project" paramsDesc={['项目的 ID， 可在 mod 主页的 `About This Project` 中找到']}/>

### Feed The Beast (FTB) 模组包更新 {#minecraft-feed-the-beast-(ftb)-mo-zu-bao-geng-xin}

<Route author="gucheen" example="/feed-the-beast/modpack/ftb_presents_direwolf20_1_16" path="/feed-the-beast/modpack/:modpackEntry" paramsDesc={['模组包的短名.']}>
| 参数         | 说明                                                                                                                                                        |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| modpackEntry | 模组包的短名从模组包的页面链接中找到，例如 `https://www.feed-the-beast.com/modpack/ftb_presents_direwolf20_1_16`，短名就是 `ftb_presents_direwolf20_1_16`。 |
</Route>

## Nintendo {#nintendo}

### eShop 新发售游戏 {#nintendo-eshop-xin-fa-shou-you-xi}

<Route author="HFO4" example="/nintendo/eshop/hk" path="/nintendo/eshop/:region" paramsDesc={['地区标识，可为`hk`(港服),`jp`(日服),`us`(美服), `cn`(国服)']}/>

### 首页资讯（香港） {#nintendo-shou-ye-zi-xun-%EF%BC%88-xiang-gang-%EF%BC%89}

<Route author="HFO4" example="/nintendo/news" path="/nintendo/news"/>

### 首页资讯（中国） {#nintendo-shou-ye-zi-xun-%EF%BC%88-zhong-guo-%EF%BC%89}

<Route author="NeverBehave" example="/nintendo/news/china" path="/nintendo/news/china"/>

### 直面会 {#nintendo-zhi-mian-hui}

<Route author="HFO4" example="/nintendo/direct" path="/nintendo/direct"/>

### Switch 本体更新情报（日本） {#nintendo-switch-ben-ti-geng-xin-qing-bao-%EF%BC%88-ri-ben-%EF%BC%89}

<Route author="hoilc" example="/nintendo/system-update" path="/nintendo/system-update"/>

## PlayStation {#playstation}

### PlayStation Store 游戏列表 {#playstation-playstation-store-you-xi-lie-biao}

<Route author="DIYgod" example="/ps/list/STORE-MSF86012-PLUS_FTT_CONTENT" path="/ps/list/:gridName" paramsDesc={['列表的 grid 名']} radar="1" rssbud="1">

适用于 URL 如 <https://store.playstation.com/zh-hans-hk/grid/STORE-MSF86012-PLUS_FTT_CONTENT> 的列表页，比如 [PSN 每月免费游戏](https://store.playstation.com/zh-hans-hk/grid/STORE-MSF86012-PLUS_FTT_CONTENT) 的 gridName 为 STORE-MSF86012-PLUS_FTT_CONTENT

</Route>

### PlayStation Store 游戏折扣 | 价格 {#playstation-playstation-store-you-xi-zhe-kou-%7C-jia-ge}

<Route author="MisteryMonster" example="/ps/product/UP9000-CUSA00552_00-THELASTOFUS00000" path="/ps/:lang/product/:gridName" paramsDesc={['地区语言','游戏的 grid 名']} radar="1" rssbud="1">

地区语言如 `zh-hans-hk` 代表香港区简体中文， `zh-hant-tw` 为台湾繁体中文。不同地区游戏 gridName 不同，非中文地区使用英文提示。

适用于 URL 如 <https://store.playstation.com/zh-hans-hk/product/HP4497-CUSA16570_00-ASIAFULLGAME0000> 的游戏。

比如 PlayStation Store 香港简体中文区的 [《赛博朋克 2077》](https://store.playstation.com/zh-hans-hk/product/HP4497-CUSA16570\_00-ASIAFULLGAME0000) 的 lang 为 `zh-hans-hk`， gridName 为 `HP4497-CUSA16570_00-ASIAFULLGAME0000`

</Route>

### PlayStation Network 用户奖杯 {#playstation-playstation-network-yong-hu-jiang-bei}

<Route author="DIYgod" example="/ps/trophy/DIYgod_" path="/ps/trophy/:id" paramsDesc={['用户 ID']} radar="1" rssbud="1"/>

### PlayStation 4 系统更新纪录 {#playstation-playstation-4-xi-tong-geng-xin-ji-lu}

<Route author="Jeason0228" example="/ps/ps4updates/" path="/ps/ps4updates/" radar="1" rssbud="1"/>

## psnine {#psnine}

### 首页 - 白金攻略 / 游戏开箱 {#psnine-shou-ye---bai-jin-gong-l%C3%BCe-%2F-you-xi-kai-xiang}

<Route author="LightStrawberry" example="/psnine/index" path="/psnine/index"/>

### 节点 {#psnine-jie-dian}

<Route author="nczitzk" example="/psnine/node/news" path="/psnine/node/:id?/:order?" paramsDesc={['节点 id，见下表，默认为 news', '排序，可选 `date` 即最新，默认为 `obdate` 即综合排序']}>

| 站务 | 活动  | 旅记   | 折扣 | 会免 |
| ---- | ----- | ------ | ---- | ---- |
| p9   | event | travel | off  | plus |

| 新闻 | 攻略  | 测评   | 心得 | 开箱    |
| ---- | ----- | ------ | ---- | ------- |
| news | guide | review | exp  | openbox |

| 游列     | 游计     | Ps4 | Ps5 |
| -------- | -------- | --- | --- |
| gamelist | planlist | ps4 | ps5 |

| 发米通  | Ign | Ucg |
| ------- | --- | --- |
| famitsu | ign | ucg |

</Route>

### 数折 - 折扣信息推送 {#psnine-shu-zhe---zhe-kou-xin-xi-tui-song}

<Route author="LightStrawberry" example="/psnine/shuzhe" path="/psnine/shuzhe"/>

### 闲游 - 二手盘信息 {#psnine-xian-you---er-shou-pan-xin-xi}

<Route author="LightStrawberry" example="/psnine/trade" path="/psnine/trade"/>

### 游戏 - 新游戏奖杯信息 {#psnine-you-xi---xin-you-xi-jiang-bei-xin-xi}

<Route author="LightStrawberry" example="/psnine/game" path="/psnine/game"/>

## Rockstar Games Social Club {#rockstar-games-social-club}

### 在线活动 {#rockstar-games-social-club-zai-xian-huo-dong}

<Route author="kookxiang" example="/socialclub/events/GTAV" path="/socialclub/events/:game?" paramsDesc={['游戏代码（默认所有）']}>

| 游戏代码 | 游戏名称     |
| -------- | ------------ |
| GTAV     | 侠盗猎车手 5 |
| RDR2     | 荒野大镖客 2 |

</Route>

## ScoreSaber {#scoresaber}

### 用户动态 {#scoresaber-yong-hu-dong-tai}

<Route author="zhangpeng2k" example="/scoresaber/user/76561198400378578" path="/scoresaber/user/:id" paramsDesc={['用户 id, 用户主页URL中获取']}/>

## Steam {#steam}

### Steam search {#steam-steam-search}

<Route author="maple3142" example="/steam/search/specials=1" path="/steam/search/:params" paramsDesc={['搜寻参数']} radar="1" rssbud="1">

参数 params 请从 Steam 的 URL 取得

Example: `https://store.steampowered.com/search/?specials=1&term=atelier` 中的 params 是 `specials=1&term=atelier`，将它填入 RSSHub 的路由就好

</Route>

### Steam 新闻中心 {#steam-steam-xin-wen-zhong-xin}

:::tip

Steam 新闻中心支持官方的 RSS 订阅:

-   新闻中心首页订阅地址为：<https://store.steampowered.com/feeds/news/?l=schinese> 其中参数 `l=english` 指定语言，`l=schinese` 为简体中文。
-   Steam 游戏新闻可以在该游戏的 RSS 按钮订阅: <https://store.steampowered.com/news/app/648800/> ，获取的订阅链接类似为： <https://store.steampowered.com/feeds/news/app/648800/?cc=US&l=english>
-   STEAM 组可以在 Steam 社区链接尾部添加 `/rss` 订阅: <https://steamcommunity.com/groups/SteamLabs/rss> 或者在 Steam 新闻中心的 URL 里添加 `/feeds` 订阅 <https://store.steampowered.com/feeds/news/group/35143931/>

:::

## SteamGifts {#steamgifts}

### Discussions {#steamgifts-discussions}

<Route author="whtsky" example="/steamgifts/discussions" path="/steamgifts/discussions/:category?" paramsDesc={['分类名称，默认为All']}/>

## TapTap {#taptap}

:::caution 注意

由于区域限制，需要在有国内 IP 的机器上自建才能正常获取 RSS。\
而对于《TapTap 国际版》则需要部署在具有海外出口的 IP 上才可正常获取 RSS。

:::

### 游戏论坛 {#taptap-you-xi-lun-tan}

<Route author="hoilc TonyRL" example="/taptap/topic/142793/official" path="/taptap/topic/:id/:type?/:sort?/:lang?" paramsDesc={['游戏 ID，游戏主页 URL 中获取', '论坛版块，默认显示所有帖子，论坛版块 URL 中 `type` 参数，见下表，默认为 `feed `', '排序，见下表，默认为 `created `', '语言，`zh-CN`或`zh-TW`，默认为`zh-CN`']}>

| 全部 | 精华  | 官方     | 影片  |
| ---- | ----- | -------- | ----- |
| feed | elite | official | video |

| 发布时间 | 回复时间  |
| -------- | --------- |
| created  | commented |

</Route>

### 游戏更新 {#taptap-you-xi-geng-xin}

<Route author="hoilc ETiV" example="/taptap/changelog/60809/en_US" path="/taptap/changelog/:id/:lang?" paramsDesc={['游戏 ID，游戏主页 URL 中获取', '语言，默认使用 `zh_CN`，亦可使用 `en_US`']}/>

### 游戏更新 - 国际版 {#taptap-you-xi-geng-xin---guo-ji-ban}

<Route author="hoilc ETiV" example="/taptap/intl/changelog/191001/zh_TW" path="/taptap/intl/changelog/:id/:lang?" paramsDesc={['游戏 ID，游戏主页 URL 中获取', '语言代码，默认使用 `en_US`，可选项目见下表']}>

#### 语言代码

| English (US) | 繁體中文 | 한국어 | 日本語 |
| ------------ | -------- | ------ | ------ |
| en_US        | zh_TW    | ko_KR  | ja_JP  |

</Route>

### 游戏评价 {#taptap-you-xi-ping-jia}

<Route author="hoilc TonyRL" example="/taptap/review/142793/hot" path="/taptap/review/:id/:order?/:lang?" paramsDesc={['游戏 ID，游戏主页 URL 中获取', '排序方式，空为默认排序，可选如下', '语言，`zh-CN`或`zh-TW`，默认为`zh-CN`']}>

| 最新   | 最热 | 游戏时长 | 默认排序 |
| ------ | ---- | -------- | -------- |
| update | hot  | spent    | default  |

</Route>

### 游戏评价 - 国际版 {#taptap-you-xi-ping-jia---guo-ji-ban}

<Route author="hoilc TonyRL ETiV" example="/taptap/intl/review/82354/new" path="/taptap/intl/review/:id/:order?/:lang?" paramsDesc={['游戏 ID，游戏主页 URL 中获取', '排序方式，空为默认排序，可选如下', '语言代码，默认使用 `en_US`，可选项目见下表']}>

#### 排序方式

| 最相关  | 最新 |
| ------- | ---- |
| default | new  |

#### 语言代码

| English (US) | 繁體中文 | 한국어 | 日本語 |
| ------------ | -------- | ------ | ------ |
| en_US        | zh_TW    | ko_KR  | ja_JP  |

</Route>

## War Thunder {#war-thunder}

### 英文 News {#war-thunder-ying-wen-news}

<Route author="axojhf" example="/warthunder/news" path="/warthunder/news">

News 的数据来自 <https://warthunder.com/en/news/>
在 UTC 时区下提供的年月日与官网上一致，请忽略具体的时间！！！

</Route>

## 巴哈姆特 {#ba-ha-mu-te}

### GNN 新聞 {#ba-ha-mu-te-gnn-xin-wen}

<Route author="Arracc" example="/gamer/gnn/1" path="/gamer/gnn/:category?"  paramsDesc={['版块']}>

| 首頁 | PC | TV 掌機 | 手機遊戲 | 動漫畫 | 主題報導 | 活動展覽 | 電競 |
| ---- | -- | ------- | -------- | ------ | -------- | -------- | ---- |
| 缺省 | 1  | 3       | 4        | 5      | 9        | 11       | 13   |

| Switch | PS5 | PS4 | XboxOne | XboxSX | PC 單機 | PC 線上 | iOS | Android | Web | 漫畫  | 動畫  |
| ------ | --- | --- | ------- | ------ | ------- | ------- | --- | ------- | --- | ----- | ----- |
| ns     | ps5 | ps4 | xbone   | xbsx   | pc      | olg     | ios | android | web | comic | anime |

</Route>

## 触乐 {#chu-le}

<Route author="laampui" example="/chuapp/index/daily" path="/chuapp/index/:category?" paramsDesc={['默认为 night']}>

| 每日聚焦 | 最好玩 | 触乐夜话 | 动态资讯 |
| -------- | ------ | -------- | -------- |
| daily    | pcz    | night    | news     |

</Route>

## 二柄 APP {#er-bing-app}

### 新闻 {#er-bing-app-xin-wen}

<Route author="wushijishan" example="/diershoubing/news" path="/diershoubing/news"/>

## 公主链接 {#gong-zhu-lian-jie}

### 日服公告 {#gong-zhu-lian-jie-ri-fu-gong-gao}

<Route author="SayaSS" example="/pcr/news" path="/pcr/news"/>

### 台服公告 {#gong-zhu-lian-jie-tai-fu-gong-gao}

<Route author="hoilc" example="/pcr/news-tw" path="/pcr/news-tw"/>

### 国服公告 {#gong-zhu-lian-jie-guo-fu-gong-gao}

<Route author="KotoriK" example="/pcr/news-cn" path="/pcr/news-cn"/>

## 怪物猎人世界 {#guai-wu-lie-ren-shi-jie}

### 更新情报 {#guai-wu-lie-ren-shi-jie-geng-xin-qing-bao}

<Route author="DIYgod" example="/mhw/update" path="/mhw/update" radar="1" rssbud="1"/>

### 最新消息 {#guai-wu-lie-ren-shi-jie-zui-xin-xiao-xi}

<Route author="DIYgod" example="/mhw/news" path="/mhw/news" radar="1" rssbud="1"/>

## 盒心光环 {#he-xin-guang-huan}

### 资讯 {#he-xin-guang-huan-zi-xun}

<Route author="XXY233" example="/xboxfan/news" path="/xboxfan/news" radar="1"/>

## 剑网 3 {#jian-wang-3}

### 新闻资讯 {#jian-wang-3-xin-wen-zi-xun}

<Route author="nczitzk" example="/jx3" path="/jx3/:caty?" paramsDesc={['分类，见下表，默认为最新']}>

| 最新    | 新闻  | 活动 | 公告     |
| ------- | ----- | ---- | -------- |
| allnews | press | hd   | announce |

</Route>

## 旅法师营地 {#l%C3%BC-fa-shi-ying-di}

### 首页 {#l%C3%BC-fa-shi-ying-di-shou-ye}

<Route author="auto-bot-ty" example="/lfsyd/home" path="/lfsyd/home" radar="1" rssbud="1"/>

### 首页（旧版） {#l%C3%BC-fa-shi-ying-di-shou-ye-%EF%BC%88-jiu-ban-%EF%BC%89}

<Route author="auto-bot-ty" example="/lfsyd/old_home" path="/lfsyd/old_home" radar="1" rssbud="1"/>

### 分区 {#l%C3%BC-fa-shi-ying-di-fen-qu}

<Route author="auto-bot-ty" example="/lfsyd/tag/17" path="/lfsyd/tag/:tagId" paramsDesc={['订阅分区类型']} radar="1" rssbud="1">

| 炉石传说 | 万智牌 | 游戏王 | 昆特牌 | 影之诗 | 符文之地传奇 | 阴阳师百闻牌 |
| :------: | :----: | :----: | :----: | :----: | :----------: | :----------: |
|    17    |   18   |   16   |   19   |   20   |      329     |      221     |

| 英雄联盟 | 电子游戏 | 桌面游戏 | 卡牌游戏 | 玩家杂谈 | 二次元 |
| :------: | :------: | :------: | :------: | :------: | :----: |
|    112   |    389   |    24    |    102   |    23    |   117  |

</Route>

### 用户的帖子 {#l%C3%BC-fa-shi-ying-di-yong-hu-de-tie-zi}

<Route author="auto-bot-ty" example="/lfsyd/user/55547" path="/lfsyd/user/:id" paramsDesc={['用户 id']} radar="1" rssbud="1"/>

可以在用户主页的 URL 中找到

Example：`https://www.iyingdi.com/tz/people/55547` ，id 是 `55547`

## 米哈游 {#mi-ha-you}

### 崩坏 2 - 游戏公告 {#mi-ha-you-beng-huai-2---you-xi-gong-gao}

<Route author="deepred5" example="/mihoyo/bh2/gach" path="/mihoyo/bh2/:type" paramsDesc={['公告种类']}>

| 最新公告 | 版本信息 | 祈愿信息 | 活动介绍 |
| -------- | -------- | -------- | -------- |
| new      | version  | gach     | event    |

</Route>

### 崩坏 3 - 游戏公告 {#mi-ha-you-beng-huai-3---you-xi-gong-gao}

<Route author="deepred5 nczitzk" example="/mihoyo/bh3/latest" path="/mihoyo/bh3/:type" paramsDesc={['公告种类']}>

| 最新   | 动态 | 公告   | 活动     | 补给     |
| ------ | ---- | ------ | -------- | -------- |
| latest | news | notice | activity | strategy |

</Route>

### 米游社 - 官方公告 {#mi-ha-you-mi-you-she---guan-fang-gong-gao}

<Route author="CaoMeiYouRen" example="/mihoyo/bbs/official/2/3/20/" path="/bbs/official/:gids/:type?/:page_size?/:last_id?" paramsDesc={['游戏id','公告类型，默认为 2(即 活动)','分页大小，默认为 20 ','跳过的公告数，例如指定为 40 就是从第 40 条公告开始，可用于分页']} radar="1">

游戏 id

| 崩坏三 | 原神 | 崩坏二 | 未定事件簿 | 星穹铁道 | 绝区零 |
| ------ | ---- | ------ | ---------- | -------- | ------ |
| 1      | 2    | 3      | 4          | 6        | 8      |

公告类型

| 公告 | 活动 | 资讯 |
| ---- | ---- | ---- |
| 1    | 2    | 3    |

</Route>

### 原神 {#mi-ha-you-yuan-shen}

#### 新闻

<Route author="nczitzk" example="/mihoyo/ys" path="/mihoyo/ys/:location?/:category?" paramsDesc={['区域，可选 `main`（简中）或 `zh-tw`（繁中）', '分类，见下表，默认为最新']}>

| 最新   | 新闻 | 公告   | 活动     |
| ------ | ---- | ------ | -------- |
| latest | news | notice | activity |

</Route>

### 崩坏：星穹铁道 {#mi-ha-you-beng-huai-%EF%BC%9A-xing-qiong-tie-dao}

#### 新闻

<Route author="shinanory" example="/mihoyo/sr" path="/mihoyo/sr/:location?/:category?" paramsDesc={['区域，可选 `zh-cn`（国服，简中）或 `zh-tw`（国际服，繁中）','分类，见下表，默认为最新']}>

| 最新     | 新闻 | 公告   | 活动     |
| -------- | ---- | ------ | -------- |
| news-all | news | notice | activity |

</Route>

## 明日方舟 {#ming-ri-fang-zhou}

### 游戏公告与新闻 {#ming-ri-fang-zhou-you-xi-gong-gao-yu-xin-wen}

<Route author="Astrian" example="/arknights/news" path="/arknights/news"/>

### 游戏内公告 {#ming-ri-fang-zhou-you-xi-nei-gong-gao}

<Route author="swwind" example="/arknights/announce" path="/arknights/announce/:platform?/:group?" paramsDesc={['平台，默认为 Android','分组，默认为 ALL']}>

平台

|  安卓服 | iOS 服 |   B 服   |
| :-----: | :----: | :------: |
| Android |   IOS  | Bilibili |

分组

| 全部 | 系统公告 | 活动公告 |
| :--: | :------: | :------: |
|  ALL |  SYSTEM  | ACTIVITY |

</Route>

### アークナイツ (日服新闻) {#ming-ri-fang-zhou-%E3%82%A2%E3%83%BC%E3%82%AF%E3%83%8A%E3%82%A4%E3%83%84-(-ri-fu-xin-wen-)}

<Route author="ofyark" example="/arknights/japan" path="/arknights/japan"/>

### 塞壬唱片 {#ming-ri-fang-zhou-sai-ren-chang-pian}

<Route author="rikkablue" example="/siren/news" path="/siren/news"/>

## 奶牛关 {#nai-niu-guan}

### 元素文章 {#nai-niu-guan-yuan-su-wen-zhang}

<Route author="hoilc" example="/cowlevel/element/1370" path="/cowlevel/element/:id" paramsDesc={['元素 ID, 可在 URL 中找到']} radar="1" rssbud="1"/>

## 其乐 {#qi-le}

### 论坛 {#qi-le-lun-tan}

<Route author="nczitzk" example="/keylol" path="/keylol/:path+" paramsDesc={['路径，默认为热点聚焦']}>

:::tip 提示

若订阅 [热点聚焦](https://keylol.com/f161-1)，网址为 <https://keylol.com/f161-1>。截取 `https://keylol.com/` 到末尾的部分 `f161-1` 作为参数，此时路由为 [`/keylol/f161-1`](https://rsshub.app/keylol/f161-1)。

若订阅子分类 [试玩免费 - 热点聚焦](https://keylol.com/forum.php?mod=forumdisplay&fid=161&filter=typeid&typeid=459)，网址为 <https://keylol.com/forum.php?mod=forumdisplay&fid=161&filter=typeid&typeid=459>。截取 `https://keylol.com/forum.php?mod=forumdisplay&` 到末尾的部分 `fid=161&filter=typeid&typeid=459` 作为参数，此时路由为 [`/keylol/fid=161&filter=typeid&typeid=459`](https://rsshub.app/keylol/fid=161&filter=typeid&typeid=459)。

:::

</Route>

## 少女前线 {#shao-n%C3%BC-qian-xian}

### 情报局 {#shao-n%C3%BC-qian-xian-qing-bao-ju}

<Route author="nczitzk" example="/gf-cn/news" path="/gf-cn/news/:category?" paramsDesc={['分类，见下表，默认为新闻']}>

| 新闻 | 公告 |
| ---- | ---- |
| 1    | 3    |

</Route>

## 世界计划 多彩舞台 ｜ ProjectSekai ｜ プロセカ {#shi-jie-ji-hua-duo-cai-wu-tai-%EF%BD%9C-projectsekai-%EF%BD%9C-%E3%83%97%E3%83%AD%E3%82%BB%E3%82%AB}

### 公告 {#shi-jie-ji-hua-duo-cai-wu-tai-%EF%BD%9C-projectsekai-%EF%BD%9C-%E3%83%97%E3%83%AD%E3%82%BB%E3%82%AB-gong-gao}

<Route author="15x15G" example="/pjsk/news" path="/pjsk/news"/>

## 王者荣耀 {#wang-zhe-rong-yao}

### 新闻中心 {#wang-zhe-rong-yao-xin-wen-zhong-xin}

<Route author="Jeason0228 HenryQW" example="/tencent/pvp/newsindex/all" path="/tencent/pvp/newsindex/:type" paramsDesc={['栏目分类，见下表']}>

| 全部 | 热门 | 新闻 | 公告 | 活动 | 赛事 | 优化 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| all  | rm   | xw   | gg   | hd   | ss   | yh   |

</Route>

## 网易大神 {#wang-yi-da-shen}

### 用户发帖 {#wang-yi-da-shen-yong-hu-fa-tie}

<Route author="luyuhuang" example="/163/ds/63dfbaf4117741daaf73404601165843" path="/163/ds/:id" paramsDesc={['用户ID']}/>

## 小黑盒 {#xiao-hei-he}

### 用户动态 {#xiao-hei-he-yong-hu-dong-tai}

<Route author="auto-bot-ty" example="/xiaoheihe/user/7775687" path="xiaoheihe/user/:id" paramsDesc={['用户 id']}/>

### 游戏新闻 {#xiao-hei-he-you-xi-xin-wen}

<Route author="MyFaith" example="/xiaoheihe/news" path="xiaoheihe/news"/>

### 游戏折扣信息 {#xiao-hei-he-you-xi-zhe-kou-xin-xi}

<Route author="MyFaith" example="/xiaoheihe/discount/pc" path="xiaoheihe/discount/:platform?" paramsDesc={['平台，默认为 Steam']}>

| Steam | PlatStation4 | Switch |
| ----- | ------------ | ------ |
| pc    | ps4          | switch |

</Route>

## 英雄联盟 {#ying-xiong-lian-meng}

### 国服新闻 {#ying-xiong-lian-meng-guo-fu-xin-wen}

<Route author="Jeason0228" example="/lol/newsindex/all" path="/lol/newsindex/:type" paramsDesc={['栏目分类，见下表']}>

| 全部 | 综合 | 公告 | 赛事 | 攻略 | 社区 |
| ---- | ---- | ---- | ---- | ---- | ---- |
| all  | zh   | gg   | ss   | gl   | sq   |

</Route>

### 台服新闻 {#ying-xiong-lian-meng-tai-fu-xin-wen}

<Route author="hoilc" example="/loltw/news" path="/loltw/news/:category?" paramsDesc={['新闻分类，置空为全部新闻']} radar="1" rssbud="1">

| 活动  | 资讯 | 系统   | 电竞   | 版本资讯 | 战棋资讯 |
| ----- | ---- | ------ | ------ | -------- | -------- |
| event | info | system | esport | patch    | TFTpatch |

</Route>

## 游民星空 {#you-min-xing-kong}

### 游民星空今日推荐 {#you-min-xing-kong-you-min-xing-kong-jin-ri-tui-jian}

<Route author="LightStrawberry" example="/gamersky/news" path="/gamersky/news"/>

### 游民娱乐 {#you-min-xing-kong-you-min-yu-le}

<Route author="LogicJake" example="/gamersky/ent/ymfl" path="/gamersky/ent/:category" paramsDesc={['分类类型']}>

| 趣囧时间 | 游民影院 | 游观天下 | 壁纸图库 | 游民盘点 | 游民福利 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| qysj     | ymyy     | ygtx     | bztk     | ympd     | ymfl     |

</Route>

## 游戏打折情报 {#you-xi-da-zhe-qing-bao}

### 游戏折扣 {#you-xi-da-zhe-qing-bao-you-xi-zhe-kou}

<Route author="LogicJake nczitzk" example="/yxdzqb/popular_cn" path="/yxdzqb/:type" paramsDesc={['折扣类型']}>

| Steam 最新折扣 | Steam 热门游戏折扣 | Steam 热门中文游戏折扣 | Steam 历史低价 | Steam 中文游戏历史低价 |
| -------------- | ------------------ | ---------------------- | -------------- | ---------------------- |
| discount       | popular            | popular_cn             | low            | low_cn                 |

</Route>

## 游戏动力 {#you-xi-dong-li}

### 游戏资讯 {#you-xi-dong-li-you-xi-zi-xun}

<Route author="wy916787036" example="/vgn" path="/vgn/:platform?" paramsDesc={['平台，见下表，默认为全部']}>

| Switch | PS4 | PC | Xbox |
| ------ | --- | -- | ---- |
| 1      | 2   | 3  | 4    |

</Route>

## 游戏年轮 {#you-xi-nian-lun}

### 分类 {#you-xi-nian-lun-fen-lei}

<Route author="nczitzk" example="/bibgame/sgame" path="/bibgame/:category?/:type?" paramsDesc={['分类，见下表，默认为 PC 游戏', '类型，可在各分类页中导航栏中找到']}>

| PC 游戏 | PS4 游戏 | Switch 游戏 | NS 其他板块 | galgame | VR 游戏 | 3DS 游戏 | psv 游戏 | xbox360 游戏 | ps3 游戏 | 其他掌机 |
| ------- | -------- | ----------- | ----------- | ------- | ------- | -------- | -------- | ------------ | -------- | -------- |
| pcgame  | ps4      | sgame       | nsaita      | ps      | bt      | 3ds      | psv      | jiaocheng    | ps3yx    | zhangji  |

</Route>

## 游戏日报 {#you-xi-ri-bao}

### 分类 {#you-xi-ri-bao-fen-lei}

<Route author="TonyRL" example="/yxrb/info" path="/yxrb/:category?" paramsDesc={['分类，见下表，预设为 `info`']} radar="1">

| 资讯 | 访谈    | 服务    | 游理游据 |
| ---- | ------- | ------- | -------- |
| info | talking | service | comments |

</Route>

## 游戏时光 {#you-xi-shi-guang}

### 游戏时光新闻 {#you-xi-shi-guang-you-xi-shi-guang-xin-wen}

<Route author="MyFaith" example="/vgtime/news" path="/vgtime/news" radar="1" rssbud="1"/>

### 游戏时光游戏发售表 {#you-xi-shi-guang-you-xi-shi-guang-you-xi-fa-shou-biao}

<Route author="MyFaith" example="/vgtime/release" path="/vgtime/release" radar="1" rssbud="1"/>

### 关键词资讯 {#you-xi-shi-guang-guan-jian-ci-zi-xun}

<Route author="DIYgod" example="/vgtime/keyword/怪物猎人" path="/vgtime/keyword/:keyword" radar="1" rssbud="1"/>

## 游讯网 {#you-xun-wang}

### 资讯 {#you-xun-wang-zi-xun}

<Route author="nczitzk" example="/yxdown/news" path="/yxdown/news/:category?" paramsDesc={['分类，见下表，默认为资讯首页']}>

| 资讯首页 | 业界动态 | 视频预告 | 新作发布 | 游戏资讯 | 游戏评测 | 网络游戏 | 手机游戏 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
|          | dongtai  | yugao    | xinzuo   | zixun    | pingce   | wangluo  | shouyou  |

</Route>

### 精彩推荐 {#you-xun-wang-jing-cai-tui-jian}

<Route author="nczitzk" example="/yxdown/recommend" path="/yxdown/recommend"/>

## 游研社 {#you-yan-she}

### 游研社 - 分类文章 {#you-yan-she-you-yan-she---fen-lei-wen-zhang}

<Route author="LightStrawberry" example="/yystv/category/recommend" path="/yystv/category/:category" paramsDesc={['专栏类型']}>

| 推游      | 游戏史  | 大事件 | 文化    | 趣闻 | 经典回顾 |
| --------- | ------- | ------ | ------- | ---- | -------- |
| recommend | history | big    | culture | news | retro    |

</Route>

### 游研社 - 全部文章 {#you-yan-she-you-yan-she---quan-bu-wen-zhang}

<Route author="HaitianLiu" example="/yystv/docs" path="/yystv/docs" />

## 遊戲基地 Gamebase {#you-xi-ji-di-gamebase}

### 新聞 {#you-xi-ji-di-gamebase-xin-wen}

<Route author="nczitzk" example="/gamebase/news" path="/gamebase/news/:type?/:category?" paramsDesc={['类型，见下表，默认为 newslist', '分类，可在对应分类页 URL 中找到，默认为 `all` 即全部']}>

类型

| newslist | r18list |
| -------- | ------- |

</Route>

## 掌上英雄联盟 {#zhang-shang-ying-xiong-lian-meng}

### 推荐 {#zhang-shang-ying-xiong-lian-meng-tui-jian}

<Route author="alizeegod" example="/lolapp/recommend" path="/lolapp/recommend"/>

### 用户文章 {#zhang-shang-ying-xiong-lian-meng-yong-hu-wen-zhang}

<Route author="ztmzzz" example="/lolapp/article/ee97e19c-4a64-4637-b916-b9ee23744d1f" path="/lolapp/article/:uuid" paramsDesc={['用户UUID，可在文章html中获取']}/>

## 掌游宝 {#zhang-you-bao}

### 推荐 {#zhang-you-bao-tui-jian}

<Route author="ztmzzz" example="/zhangyoubao/lol" path="/zhangyoubao/:category" paramsDesc={['分类，见下表']}>

| 英雄联盟 | 炉石传说 | DNF | 守望先锋 | 王者荣耀 | 单机综合 | 手游综合 | 云顶之弈 | 部落冲突 | 皇室战争 | DNF 手游 | 荒野乱斗   |
| -------- | -------- | --- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | ---------- |
| lol      | lscs     | dnf | swxf     | yxzj     | steam    | mobile   | lolchess | blzz     | hszz     | dnfm     | brawlstars |

</Route>

## 最终幻想 14 {#zui-zhong-huan-xiang-14}

### 最终幻想 14 国服 {#zui-zhong-huan-xiang-14-zui-zhong-huan-xiang-14-guo-fu}

<Route author="Kiotlin" example="/ff14/zh/news" path="/ff14/zh/:type?" paramsDesc={['分类名，预设为 `all`']}>

| 新闻 | 公告     | 活动   | 广告      | 所有 |
| ---- | -------- | ------ | --------- | ---- |
| news | announce | events | advertise | all  |

</Route>

### 最终幻想 14 国际服 （Lodestone） {#zui-zhong-huan-xiang-14-zui-zhong-huan-xiang-14-guo-ji-fu-%EF%BC%88lodestone%EF%BC%89}

<Route author="chengyuhui" example="/ff14/global/na/all" path="/ff14/global/:lang/:type?" paramsDesc={['地区', '分类名，预设为 `all`']}>

| 北美 | 欧洲（英语） | 法国 | 德国 | 日本 |
| ---- | ------------ | ---- | ---- | ---- |
| na   | eu           | fr   | de   | jp   |

| 所有 | 话题   | 公告    | 维护        | 更新    | 服务状态 | 开发者博客 |
| ---- | ------ | ------- | ----------- | ------- | -------- | ---------- |
| all  | topics | notices | maintenance | updates | status   | developers |

</Route>

## きららファンタジア｜奇拉拉幻想曲 {#%E3%81%8D%E3%82%89%E3%82%89%E3%83%95%E3%82%A1%E3%83%B3%E3%82%BF%E3%82%B8%E3%82%A2%EF%BD%9C-qi-la-la-huan-xiang-qu}

### 公告 {#%E3%81%8D%E3%82%89%E3%82%89%E3%83%95%E3%82%A1%E3%83%B3%E3%82%BF%E3%82%B8%E3%82%A2%EF%BD%9C-qi-la-la-huan-xiang-qu-gong-gao}

<Route author="magic-akari" example="/kirara/news" path="/kirara/news"/>

## ファミ通 {#%E3%83%95%E3%82%A1%E3%83%9F-tong}

### 分类 {#%E3%83%95%E3%82%A1%E3%83%9F-tong-fen-lei}

<Route author="TonyRL" example="/famitsu/category/new-article" path="/famitsu/category/:category?" paramsDesc={['分类，见下表，预设为 `new-article`']} radar="1">

| 新着        | PS5 | Switch | PS4 | ニュース | ゲームニュース | PR TIMES | 動画   | 特集・企画記事  | インタビュー | 取材・リポート | レビュー | インディーゲーム |
| ----------- | --- | ------ | --- | -------- | -------------- | -------- | ------ | --------------- | ------------ | -------------- | -------- | ---------------- |
| new-article | ps5 | switch | ps4 | news     | news-game      | prtimes  | videos | special-article | interview    | event-report   | review   | indie-game       |

</Route>

## マギアレコード（Magia Record, 魔法纪录） {#%E3%83%9E%E3%82%AE%E3%82%A2%E3%83%AC%E3%82%B3%E3%83%BC%E3%83%89%EF%BC%88magia-record%2C-mo-fa-ji-lu-%EF%BC%89}

### 游戏公告 {#%E3%83%9E%E3%82%AE%E3%82%A2%E3%83%AC%E3%82%B3%E3%83%BC%E3%83%89%EF%BC%88magia-record%2C-mo-fa-ji-lu-%EF%BC%89-you-xi-gong-gao}

<Route author="y2361547758" example="/magireco/announcements" path="/magireco/announcements"/>

### 游戏横幅 {#%E3%83%9E%E3%82%AE%E3%82%A2%E3%83%AC%E3%82%B3%E3%83%BC%E3%83%89%EF%BC%88magia-record%2C-mo-fa-ji-lu-%EF%BC%89-you-xi-heng-fu}

<Route author="y2361547758" example="/magireco/event_banner" path="/magireco/event_banner"/>
