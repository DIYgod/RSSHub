# 🖼️ Picture

## 1X {#1x}

### Photos {#1x-photos}

<Route author="nczitzk" example="/1x" path="/1x/:category?" paramsDesc={['Category, Latest awarded by default, see below']}>

| Category         | Title         |
| ---------------- | ------------- |
| Latest awarded   | latest        |
| Popular          | popular       |
| Latest published | published     |
| Abstract         | abstract      |
| Action           | action        |
| Animals          | animals       |
| Architecture     | architecture  |
| Conceptual       | conceptual    |
| Creative edit    | creative-edit |
| Documentary      | documentary   |
| Everyday         | everyday      |
| Fine Art Nude    | fine-art-nude |
| Humour           | humour        |
| Landscape        | landscape     |
| Macro            | macro         |
| Mood             | mood          |
| Night            | night         |
| Performance      | performance   |
| Portrait         | portrait      |
| Still life       | still-life    |
| Street           | street        |
| Underwater       | underwater    |
| Wildlife         | wildlife      |

</Route>

## 35PHOTO {#35photo}

### New photos {#35photo-new-photos}

<Route author="nczitzk" example="/35photo/new" path="/35photo/new"/>

### Featured photos {#35photo-featured-photos}

<Route author="nczitzk" example="/35photo/actual" path="/35photo/actual"/>

### New interesting {#35photo-new-interesting}

<Route author="nczitzk" example="/35photo/interesting" path="/35photo/interesting"/>

### Photos on the world map {#35photo-photos-on-the-world-map}

<Route author="nczitzk" example="/35photo/map" path="/35photo/map"/>

### Genre {#35photo-genre}

<Route author="nczitzk" example="/35photo/genre/99"  path="/35photo/genre/:id" paramsDesc={['id, can be found in URL']}/>

### Author {#35photo-author}

<Route author="nczitzk" example="/35photo/author/mariuszsix"  path="/35photo/author/:id" paramsDesc={['id, can be found in URL']}/>

## 500px 摄影社区 {#500px-she-ying-she-qu}

### 部落影集 {#500px-she-ying-she-qu-bu-luo-ying-ji}

<Route author="TonyRL" example="/500px/tribe/set/f5de0b8aa6d54ec486f5e79616418001"  path="/500px/tribe/set/:id" paramsDesc={['部落 ID']} radar="1"/>

### 摄影师作品 {#500px-she-ying-she-qu-she-ying-shi-zuo-pin}

<Route author="TonyRL" example="/500px/user/works/hujunli"  path="/500px/user/works/:id" paramsDesc={['摄影师 ID']} radar="1"/>

## 8KCosplay {#8kcosplay}

### 最新 {#8kcosplay-zui-xin}

<Route author="KotoriK" example="/8kcos/"  path="/8kcos/"/>

### 分类 {#8kcosplay-fen-lei}

<Route author="KotoriK" example="/8kcos/cat/8kasianidol"  path="/8kcos/cat/:cat*" paramsDesc={['默认值为8kasianidol，将目录页面url中 /category/ 后面的部分填入。如：https://www.8kcosplay.com/category/8kchineseidol/%e9%a3%8e%e4%b9%8b%e9%a2%86%e5%9f%9f/ 对应的RSS页面为/8kcos/cat/8kchineseidol/%e9%a3%8e%e4%b9%8b%e9%a2%86%e5%9f%9f/。']}/>

### 标签 {#8kcosplay-biao-qian}

<Route author="KotoriK" example="/8kcos/tag/cosplay"  path="/8kcos/tag/:tag" paramsDesc={['标签名']}/>

## Asian to lick {#asian-to-lick}

### Home {#asian-to-lick-home}

<Route author="nczitzk" example="/asiantolick" path="/asiantolick"/>

### Category {#asian-to-lick-category}

<Route author="nczitzk" example="/asiantolick/category/90" path="/asiantolick/category/:category?" paramsDesc={['Category, the id can be found in URL, homepage by default']}/>

### Tag {#asian-to-lick-tag}

<Route author="nczitzk" example="/asiantolick/tag/1045" path="/asiantolick/tag/:tag?" paramsDesc={['Tag, the id can be found in URL, homepage by default']}/>

### Search {#asian-to-lick-search}

<Route author="nczitzk" example="/asiantolick/search/lolita" path="/asiantolick/search/:keyword?" paramsDesc={['Keyword, empty by default']}/>

## BabeHub {#babehub}

### Category {#babehub-category}

<Route author="nczitzk" example="/babehub" path="/babehub/:category?" paramsDesc={['Category, see below, Home by default']}>

| Home | Most Viewed | Picture Archive | Video Archive |
| - | - | - | - |
| | most-viewed | picture | video |

</Route>

### Search {#babehub-search}

<Route author="nczitzk" example="/babehub/search/babe" path="/babehub/search/:keyword?" paramsDesc={['关键字']}/>

## Bing Wallpaper {#bing-wallpaper}

### Daily Wallpaper {#bing-wallpaper-daily-wallpaper}

<Route author="FHYunCai" example="/bing" path="/bing" radar="1" rssbud="1"/>

## Booru {#booru}

### MMDArchive 标签查询 {#booru-mmdarchive-biao-qian-cha-xun}

<Route author="N78Wy" example="/booru/mmda/tags/full_body+blue_eyes" path="/booru/mmda/tags/:tags?" paramsDesc={['标签，多个标签使用空格` `或者`%20`连接，如需根据作者查询则在`user:`后接上作者名，如：`user:xxxx`']}>

For example:

-   默认查询(什么tag都不加)：`/booru/mmda/tags`
-   默认查询单个tag：`/booru/mmda/tags/full_body`
-   默认查询多个tag：`/booru/mmda/tags/full_body%20blue_eyes`
-   默认查询根据作者查询：`/booru/mmda/tags/user:xxxx`

</Route>

## CNU 视觉联盟 {#cnu-shi-jue-lian-meng}

### 每日精选 {#cnu-shi-jue-lian-meng-mei-ri-jing-xuan}

<Route author="hoilc" example="/cnu/selected" path="/cnu/selected" />

### 发现 {#cnu-shi-jue-lian-meng-fa-xian}

<Route author="hoilc" example="/cnu/discovery/hot/自然" path="/cnu/discovery/:type?/:category?" paramsDesc={['板块类型, 默认为`热门`, 具体参见下表', '图片类别, 默认为`0`代表全部, 可参见[这里](http://www.cnu.cc/discoveryPage/hot-0)']}/>

| 热门 | 推荐      | 最新   |
| ---- | --------- | ------ |
| hot  | recommend | recent |

## DailyArt 每日艺术 {#dailyart-mei-ri-yi-shu}

### DailyArt {#dailyart-mei-ri-yi-shu-dailyart}

<Route author="zphw" example="/dailyart/en" path="/dailyart/:language?" paramsDesc={['Support en, es, fr, de, it, zh, jp, etc. English by default.']} />

## Dilbert Comic Strip {#dilbert-comic-strip}

### Dilbert Comic Strip {#dilbert-comic-strip-dilbert-comic-strip}

<Route name="Daily Strip" author="Maecenas" example="/dilbert/strip" path="/dilbert/strip">

通过提取漫画，提供比官方源更佳的阅读体验。

</Route>

## E-Hentai {#e-hentai}

For RSS content, specify options in the `routeParams` parameter in query string format to control additional functionality

| Key         | Meaning                                                                          | Accepted keys  | Default value |
| ----------- | -------------------------------------------------------------------------------- | -------------- | ------------- |
| bittorrent  | Whether include a link to the latest torrent                                     | 0/1/true/false | false         |
| embed_thumb | Whether the cover image is embedded in the RSS feed rather than given as a link  | 0/1/true/false | false         |

### Favorites {#e-hentai-favorites}

<Route author="yindaheng98" example="/ehentai/favorites/0/posted/1" path="/ehentai/favorites/:favcat?/:order?/:page?/:routeParams?" paramsDesc={['Favorites folder number','`posted`(Sort by gallery release time) , `favorited`(Sort by time added to favorites)', 'Page number', 'Additional parameters, see the table above']} anticrawler="1" supportBT="1" />

### Tag {#e-hentai-tag}

<Route author="yindaheng98" example="/ehentai/tag/language:chinese/1" path="/ehentai/tag/:tag/:page?/:routeParams?" paramsDesc={['Tag', 'Page number', 'Additional parameters, see the table above']} anticrawler="1" supportBT="1" />

### Search {#e-hentai-search}

<Route author="yindaheng98" example="/ehentai/search/f_search=artist%3Amana%24/1" path="/ehentai/search/:params?/:page?/:routeParams?" paramsDesc={['Search parameters. You can copy the content after `https://e-hentai.org/?`', 'Page number', 'Additional parameters, see the table above']} anticrawler="1" supportBT="1" />

## Elite Babes {#elite-babes}

### Home {#elite-babes-home}

<Route author="nczitzk" example="/elitebabes" path="/elitebabes/:category?" paramsDesc={['Category, see below, Home by default']}>

| Home | Hot | Popular | Recent |
| ---- | --- | ------- | ------ |
|      | hot | popular | recent |

</Route>

### Videos {#elite-babes-videos}

<Route author="nczitzk" example="/elitebabes/videos" path="/elitebabes/videos/:sort?" paramsDesc={['Sort, see below, Popular by default']}>

| Popular | Recent |
| ------- | ------ |
| popular | recent |

</Route>

### Search {#elite-babes-search}

<Route author="nczitzk" example="/elitebabes/search/pose" path="/elitebabes/search/:keyword?" paramsDesc={['Keyword']}/>

## Fantia {#fantia}

### Search {#fantia-search}

<Route author="nczitzk" example="/fantia/search/posts/all/daily" path="/fantia/search/:type?/:caty?/:period?/:order?/:rating?/:keyword?" paramsDesc={['Type, see the table below, `posts` by default', 'Category, see the table below, can also be found in search page URL, `すべてのクリエイター` by default', 'Ranking period, see the table below, empty by default' ,'Sorting, see the table below, `更新の新しい順` by default', 'Rating, see the table below, `すべて` by default', 'Keyword, empty by default']}>

Type

| クリエイター   | 投稿    | 商品       | コミッション      |
| -------- | ----- | -------- | ----------- |
| fanclubs | posts | products | commissions |

Category

| 分类           | 分类名        |
| ------------ | ---------- |
| イラスト         | illust     |
| 漫画           | comic      |
| コスプレ         | cosplay    |
| YouTuber・配信者 | youtuber   |
| Vtuber       | vtuber     |
| 音声作品・ASMR    | voice      |
| 声優・歌い手       | voiceactor |
| アイドル         | idol       |
| アニメ・映像・写真    | anime      |
| 3D           | 3d         |
| ゲーム制作        | game       |
| 音楽           | music      |
| 小説           | novel      |
| ドール          | doll       |
| アート・デザイン     | art        |
| プログラム        | program    |
| 創作・ハンドメイド    | handmade   |
| 歴史・評論・情報     | history    |
| 鉄道・旅行・ミリタリー  | railroad   |
| ショップ         | shop       |
| その他          | other      |

Ranking period

| デイリー  | ウィークリー | マンスリー   | 全期間 |
| ----- | ------ | ------- | --- |
| daily | weekly | monthly | all |

Sorting

| 更新の新しい順 | 更新の古い順     | 投稿の新しい順 | 投稿の古い順     | お気に入り数順 |
| ------- | ---------- | ------- | ---------- | ------- |
| updater | update_old | newer   | create_old | popular |

Rating

| すべて | 一般のみ    | R18 のみ |
| --- | ------- | ------ |
| all | general | adult  |

</Route>

### User Posts {#fantia-user-posts}

<Route author="nczitzk" example="/fantia/user/3498" path="/fantia/user/:id" paramsDesc={['User id, can be found in user profile URL']} />

## GirlImg {#girlimg}

### album {#girlimg-album}

<Route author="junfengP" example="/girlimg/album" path="/girlimg/album/:tag?/:mode?" paramsDesc={['过滤标签，在链接参数中&tab=部分，如：中国,BoLoLi','加载模式，留空为简单模式，获取20篇文章标题与封面；非空为详细模式，加载10篇文章内容']} />

## GoComics Comic Strips {#gocomics-comic-strips}

<Route author="stjohnjohnson" example="/gocomics/foxtrot" path="/gocomics/:strip" paramsDesc={['URL path of the strip on gocomics.com']} />

## Google Doodles {#google-doodles}

### Update {#google-doodles-update}

<Route author="xyqfer" example="/google/doodles/zh-CN" path="/google/doodles/:language?" paramsDesc={['Language, default to `zh-CN`, for other language values, you can get it from [Google Doodles official website](https://www.google.com/doodles)']} />

## Google Photos {#google-photos}

### Public Albums {#google-photos-public-albums}

<Route author="hoilc" example="/google/album/msFFnAzKmQmWj76EA" path="/google/album/:id" paramsDesc={['album ID, can be found in URL, for example, `https://photos.app.goo.gl/msFFnAzKmQmWj76EA` to `msFFnAzKmQmWj76EA`']} radar="1"/>

## Hentai Cosplay {#hentai-cosplay}

### 最新图片 {#hentai-cosplay-zui-xin-tu-pian}

<Route author="hoilc" example="/hentai-cosplays/tag/swimsuit" path="/hentai-cosplays/:type?/:name?" paramsDesc={['搜索类型, `tag`为标签, `keyword`为关键字, 默认留空为全部','搜索内容, 可在 URL 中找到，默认留空为全部']} />

## Konachan Anime Wallpapers {#konachan-anime-wallpapers}

:::tip

-   Tags can be copied after `tags=` in [konachan](https://konachan.com/post) URL
-   The route can be / konachan or /konachan.com or /konachan.net, where the first two are the same, and .net is an all-age healthy wallpaper ♡
-   Official Posts RSS: https://konachan.com/post/piclens?tags=[tags]

:::

### Popular Recent Posts {#konachan-anime-wallpapers-popular-recent-posts}

<Route author="magic-akari" example="/konachan/post/popular_recent" path="/konachan/post/popular_recent/:period?" paramsDesc={['Default to 24 hours']}>

For example:

-   24 hours:<https://rsshub.app/konachan/post/popular_recent/1d>
-   1 week:<https://rsshub.app/konachan/post/popular_recent/1w>
-   1 month:<https://rsshub.app/konachan/post/popular_recent/1m>
-   1 year:<https://rsshub.app/konachan/post/popular_recent/1y>

</Route>

## LoveHeaven {#loveheaven}

### Manga Updates {#loveheaven-manga-updates}

<Route author="hoilc" example="/loveheaven/update/kimetsu-no-yaiba" path="/loveheaven/update/:slug" paramsDesc={['Manga slug, can be found in URL, including neither `manga-` nor `.html`']} />

## Mic Mic Idol {#mic-mic-idol}

### Latest {#mic-mic-idol-latest}

<Route author="KotoriK" example="/micmicidol" path="/micmicidol"/>

### 标签 {#mic-mic-idol-biao-qian}

<Route author="KotoriK" example="/micmicidol/search/Young%20Jump?limit=50" path="/micmicidol/search/:label" paramsDesc={['标签名']}/>

获取数量可以通过 [limit](/parameter#条数限制) 参数控制。默认值为`50`。

## MM 范 {#mm-fan}

### 分类 {#mm-fan-fen-lei}

<Route author="nczitzk" example="/95mm/tab/热门" path="/95mm/tab/:tab?" paramsDesc={['分类，见下表，默认为最新']}>

| 最新 | 热门 | 校花 | 森系 | 清纯 | 童颜 | 嫩模 | 少女 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |

</Route>

### 标签 {#mm-fan-biao-qian}

<Route author="nczitzk" example="/95mm/tag/黑丝" path="/95mm/tag/:tag" paramsDesc={['标签，可在对应标签页中找到']}/>

### 集合 {#mm-fan-ji-he}

<Route author="nczitzk" example="/95mm/category/1" path="/95mm/category/:category" paramsDesc={['集合，见下表']}>

| 清纯唯美 | 摄影私房 | 明星写真 | 三次元 | 异域美景 | 性感妖姬 | 游戏主题 | 美女壁纸 |
| -------- | -------- | -------- | ------ | -------- | -------- | -------- | -------- |
| 1        | 2        | 4        | 5      | 6        | 7        | 9        | 11       |

</Route>

## NASA Astronomy Picture of the Day {#nasa-astronomy-picture-of-the-day}

### NASA {#nasa-astronomy-picture-of-the-day-nasa}

<Route author="nczitzk" example="/nasa/apod" path="/nasa/apod" />

### Cheng Kung University Mirror {#nasa-astronomy-picture-of-the-day-cheng-kung-university-mirror}

<Route author="nczitzk" example="/nasa/apod-ncku" path="/nasa/apod-ncku" />

### NASA 中文 {#nasa-astronomy-picture-of-the-day-nasa-zhong-wen}

<Route author="nczitzk" example="/nasa/apod-cn" path="/nasa/apod-cn">

:::tip

[NASA 中文](https://www.nasachina.cn/) 提供了每日天文图的中英双语图文说明，但在更新上偶尔略有一两天的延迟。

:::

</Route>

## National Geographic {#national-geographic}

### Photo of the Day {#national-geographic-photo-of-the-day}

<Route author="LogicJake OrangeEd1t TonyRL" example="/natgeo/dailyphoto" path="/natgeo/dailyphoto"/>

### 每日一图 {#national-geographic-mei-ri-yi-tu}

<Route author="LogicJake OrangeEd1t TonyRL" example="/natgeo/dailyphoto" path="/natgeo/dailyphoto"/>

## Pixabay {#pixabay}

### Search {#pixabay-search}

<Route author="TonyRL" example="/pixabay/search/cat" path="/pixabay/search/:q/:order?" paramsDesc={['Search term', 'Order, `popular` or `latest`, `latest` by default']} radar="1" selfhost="1"/>

## Porn Image XXX {#porn-image-xxx}

### 最新图片 {#porn-image-xxx-zui-xin-tu-pian}

<Route author="hoilc" example="/porn-images-xxx/tag/jk" path="/porn-images-xxx/:type?/:name?" paramsDesc={['搜索类型, `tag`为标签, `keyword`为关键字, 默认留空为全部','搜索内容, 可在 URL 中找到，默认留空为全部']} />

## Rare Historical Photos {#rare-historical-photos}

### Home {#rare-historical-photos-home}

<Route author="TonyRL" example="/rarehistoricalphotos" path="/rarehistoricalphotos" radar="1"/>

## Tits Guru {#tits-guru}

### Home {#tits-guru-home}

<Route author="MegrezZhu" example="/tits-guru/home" path="/tits-guru/home"/>

### Daily Best {#tits-guru-daily-best}

<Route author="MegrezZhu" example="/tits-guru/daily" path="/tits-guru/daily"/>

### Models {#tits-guru-models}

<Route author="MegrezZhu" example="/tits-guru/model/mila-azul" path="/tits-guru/model/:name" paramsDesc={['Module name, see [here](https://tits-guru.com/models) for details']}/>

### Categories {#tits-guru-categories}

<Route author="MegrezZhu" example="/tits-guru/category/bikini" path="/tits-guru/category/:type" paramsDesc={['Category, see [here](https://tits-guru.com/categories) for details']}/>

## wallhaven {#wallhaven}

:::tip

When parameter **Need Details** is set to `true` `yes` `t` `y`, RSS will add the title, uploader, upload time, and category information of each image, which can support the filtering function of RSS reader.

However, the number of requests to the site increases a lot when it is turned on, which causes the site to return `Response code 429 (Too Many Requests)`. So you need to specify a smaller `limit` parameter, i.e. add `?limit=<the number of posts for a request>` after the route, here is an example.

For example [Latest Wallpapers](https://wallhaven.cc/latest), the route turning on **Need Details** is [/wallhaven/latest/true](https://rsshub.app/wallhaven/latest/true), and then specify a smaller `limit`. We can get [/wallhaven/latest/true?limit=5](https://rsshub.app/wallhaven/latest/true?limit=5).

:::

### Category {#wallhaven-category}

<Route author="nczitzk Fatpandac" example="/wallhaven/latest" path="/wallhaven/:category?/:needDetails?" paramsDesc={['Category, see below, Latest by default', 'Need Details, `true/yes` as yes, no by default']}>

| Latest | Hot | Toplist | Random |
| ------ | --- | ------- | ------ |
| latest | hot | toplist | random |

</Route>

### Search {#wallhaven-search}

<Route author="nczitzk Fatpandac" example="/wallhaven/search/categories=110&purity=110&sorting=date_added&order=desc" path="/wallhaven/search/:filter?/:needDetails?" paramsDesc={['Filter, empty by default', 'Need Details, `true`/`yes` as yes, no by default']}>

:::tip

Subscribe pages starting with `https://wallhaven.cc/search`, fill the text after `?` as `filter` in the route. The following is an example:

The text after `?` is `q=id%3A711&sorting=random&ref=fp&seed=8g0dgd` for [Wallpaper Search: #landscape - wallhaven.cc](https://wallhaven.cc/search?q=id%3A711&sorting=random&ref=fp&seed=8g0dgd), so the route is [/wallhaven/q=id%3A711&sorting=random&ref=fp&seed=8g0dgd](https://rsshub.app/wallhaven/q=id%3A711&sorting=random&ref=fp&seed=8g0dgd)

:::

</Route>

## WallpaperHub {#wallpaperhub}

### Wallpapers {#wallpaperhub-wallpapers}

<Route author="nczitzk" example="/wallpaperhub" path="/wallpaperhub" radar="1" rssbud="1"/>

## yande.re {#yande.re}

:::tip

-   Official RSS: https://yande.re/post/piclens?tags=[tags]

:::

### Popular Recent Posts {#yande.re-popular-recent-posts}

<Route author="magic-akari SettingDust" example="/yande.re/post/popular_recent" path="/yande.re/post/popular_recent/:period?" paramsDesc={['Default to 24 hours']}>

For example:

-   24 hours:<https://rsshub.app/yande.re/post/popular_recent/1d>
-   1 week:<https://rsshub.app/yande.re/post/popular_recent/1w>
-   1 month:<https://rsshub.app/yande.re/post/popular_recent/1m>
-   1 year:<https://rsshub.app/yande.re/post/popular_recent/1y>

</Route>

## 百度趣画 {#bai-du-qu-hua}

### 更新 {#bai-du-qu-hua-geng-xin}

<Route author="xyqfer" example="/baidu/doodles" path="/baidu/doodles"/>

## 北京天文馆 {#bei-jing-tian-wen-guan}

### 每日一图 {#bei-jing-tian-wen-guan-mei-ri-yi-tu}

<Route author="HenryQW" example="/bjp/apod" path="/bjp/apod" radar="1"/>

## 不羞涩 {#bu-xiu-se}

### 分类 {#bu-xiu-se-fen-lei}

<Route author="kba977" example="/dbmv" path="/dbmv/:category?" paramsDesc={['分类 id - 若不填该参数, 默认所有']}>

| 大胸妹 | 小翘臀 | 黑丝袜 | 美腿控 | 有颜值 | 大杂烩 |
| ------ | ------ | ------ | ------ | ------ | ------ |
| 2      | 6      | 7      | 3      | 4      | 5      |

</Route>

## 煎蛋 {#jian-dan}

### 板块 {#jian-dan-ban-kuai}

<Route author="nczitzk" example="/jandan/top" path="/jandan/:category?" paramsDesc={['板块，见下表，默认为无聊图热榜']}>

| 问答 | 树洞     | 动物园 | 女装 | 随手拍 | 无聊图 | 鱼塘 |
| ---- | -------- | ------ | ---- | ------ | ------ | ---- |
| qa   | treehole | zoo    | girl | ooxx   | pic    | pond |

</Route>

### 热榜 {#jian-dan-re-bang}

<Route author="kobemtl Xuanwo xyqfer 9uanhuo nczitzk" example="/jandan/top-4h" path="/jandan/:category?" paramsDesc={['板块，见下表，默认为无聊图热榜']}/>

| 4 小时热门 | 吐槽      | 无聊图 | 随手拍   | 动物园  | 优评         | 3 日最佳  | 7 日最佳  |
| ---------- | --------- | ------ | -------- | ------- | ------------ | --------- | --------- |
| top-4h     | top-tucao | top    | top-ooxx | top-zoo | top-comments | top-3days | top-7days |

### 首页 {#jian-dan-shou-ye}

<Route author="lonelykid nczitzk" example="/jandan" path="/jandan"/>

## 绝对领域 {#jue-dui-ling-yu}

### 图集文章 {#jue-dui-ling-yu-tu-ji-wen-zhang}

<Route author="Kherrisan" example="/jdlingyu/tuji" path="/jdlingyu/:type" paramsDesc={['分区名']}/>

| 图集 | 文章 |
| ---- | ---- |
| tuji | as   |

## 酷 18 {#ku-18}

### 分站 {#ku-18-fen-zhan}

<Route author="nczitzk" example="/cool18" path="/cool18/:id?" paramsDesc={['分站，见下表，默认为禁忌书屋']}>

| 性趣贴图 | 色色动漫 | 情色靓影 | 私房自拍 | 禁忌书屋 | 性趣论坛 | 情色无忌 | 成人影视 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| bbs      | bbs7     | bbs2     | bbs6     | bbs4     | bj       | bbs5     | bbs3     |

:::tip

留园网文档参见 [此处](https://docs.rsshub.app/routes/new-media#liu-yuan-wang)

禁忌书屋文档参见 [此处](https://docs.rsshub.app/routes/reading#jin-ji-shu-wu)

:::

</Route>

### 精华区 {#ku-18-jing-hua-qu}

<Route author="nczitzk" example="/cool18/bbs/gold" path="/cool18/:id/gold" paramsDesc={['分站，见上表，默认为禁忌书屋']}/>

### 搜索关键字 {#ku-18-sou-suo-guan-jian-zi}

<Route author="nczitzk" example="/cool18/bbs/keywords/都市" path="/cool18/:id/keywords/:keyword?" paramsDesc={['分站，见上表，默认为禁忌书屋', '关键字']}/>

## 妹图社 {#mei-tu-she}

### 最新 {#mei-tu-she-zui-xin}

<Route author="ocleo1" example="/meituclub/latest" path="/meituclub/latest" />

## 妹子图 {#mei-zi-tu}

### 首页（最新） {#mei-zi-tu-shou-ye-zui-xin}

<Route author="gee1k xyqfer LogicJake" example="/mzitu/home" path="/mzitu/home/:type?" paramsDesc={['类型，默认最新，可选`hot`最热或`best`推荐']} anticrawler="1"/>

### 分类 {#mei-zi-tu-fen-lei}

<Route author="gee1k xyqfer LogicJake" example="/mzitu/category/xinggan" path="/mzitu/category/:category" paramsDesc={['分类名']} anticrawler="1">

| 性感妹子 | 日本妹子 | 台湾妹子 | 清纯妹子 |
| -------- | -------- | -------- | -------- |
| xinggan  | japan    | taiwan   | mm       |

</Route>

### 所有专题 {#mei-zi-tu-suo-you-zhuan-ti}

<Route author="gee1k xyqfer LogicJake" example="/mzitu/tags" path="/mzitu/tags" anticrawler="1"/>

### 专题详情 {#mei-zi-tu-zhuan-ti-xiang-qing}

<Route author="gee1k xyqfer LogicJake" example="/mzitu/tag/shishen" path="/mzitu/tag/:tag" paramsDesc={['专题名, 可在专题页 URL 中找到']} anticrawler="1"/>

### 详情 {#mei-zi-tu-xiang-qing}

<Route author="gee1k xyqfer LogicJake" example="/mzitu/post/129452" path="/mzitu/post/:id" paramsDesc={['详情 id, 可在详情页 URL 中找到']} anticrawler="1"/>

## 喷嚏 {#pen-ti}

### 图卦 {#pen-ti-tu-gua}

<Route author="tgly307" example="/dapenti/tugua" path="/dapenti/tugua"/>

### 主题 {#pen-ti-zhu-ti}

<Route author="xyqfer" example="/dapenti/subject/184" path="/dapenti/subject/:id" paramsDesc={['主题 id']}/>

## 奇葩买家秀 {#qi-pa-mai-jia-xiu}

### 频道 {#qi-pa-mai-jia-xiu-pin-dao}

<Route author="Fatpandac nczitzk" example="/qipamaijia/fuli" path="/qipamaijia/:cate?" paramsDesc={['频道名，可在对应网址中找到，默认为最新']} radar="1" rssbud="1"/>

## 涂鸦王国 {#tu-ya-wang-guo}

### 用户上传作品和用户喜欢作品 {#tu-ya-wang-guo-yong-hu-shang-chuan-zuo-pin-he-yong-hu-xi-huan-zuo-pin}

<Route author="LanceZhu" example="/gracg/user11968EIcqS3" path="/gracg/:user/:love?" paramsDesc={['用户访问ID，用户主页URL获取', '是否切换为用户喜欢作品, 不选或为 0 不切换，1则切换']}/>

## 致美化 {#zhi-mei-hua}

### 最新主题 {#zhi-mei-hua-zui-xin-zhu-ti}

<Route author="nczitzk" example="/zhutix/latest" path="/zhutix/latest"/>

