# 🖊️️ Blog

## Amazon {#amazon}

### AWS Blogs {#amazon-aws-blogs}

<Route author="HankChow" example="/amazon/awsblogs" path="/awsblogs/:locale?" paramsDesc={['Blog postes in a specified language, only the following options are supported. Default `zh_CN`']}>

| zh_CN | en_US | fr_FR | de_DE | ja_JP | ko_KR | pt_BR | es_ES | ru_RU | id_ID | tr_TR |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Chinese    | English    | French    | German    | Japanese    | Korean    | Portuguese  | Spainish  | Russian    | Indonesian   | Turkish  |

</Route>

## Apache {#apache}

### APISIX 博客 {#apache-apisix-bo-ke}

<Route author="aneasystone" example="/apache/apisix/blog" path="/apache/apisix/blog"/>

## archdaily {#archdaily}

### Home {#archdaily-home}

<Route author="kt286" example="/archdaily" path="/archdaily"/>

## Benedict Evans {#benedict-evans}

<Route author="emdoe" example="/benedictevans" path="/benedictevans"/>

## CSDN {#csdn}

### User Feed {#csdn-user-feed}

<Route author="Jkker" example="/csdn/blog/csdngeeknews" path="/csdn/blog/:user" radar="1" paramsDesc={['`user` is the username of a CSDN blog which can be found in the url of the home page']} />

## Delta Lake {#delta-lake}

### Blogs {#delta-lake-blogs}

<Route author="RengarLee" example="/deltaio/blog" path="/deltaio/blog" radar="1"/>

## DevolverDigital {#devolverdigital}

### Official Blogs {#devolverdigital-official-blogs}

<Route author="XXY233" example="/devolverdigital/blog" path="/devolverdigital/blog" radar="1" />

## FreeBuf {#freebuf}

### 文章 {#freebuf-wen-zhang}

<Route author="trganda" example="/freebuf/articles/web" path="/freebuf/articles/:type" paramsDesc={['文章类别', '文章id号，可选']}>

:::tip

Freebuf 的文章页面带有反爬虫机制，所以目前无法获取文章的完整内容。

:::

</Route>

## Geocaching {#geocaching}

### Official Blogs {#geocaching-official-blogs}

<Route author="HankChow" example="/geocaching/blogs" path="/geocaching/blogs" radar="1"/>

## Google Sites {#google-sites}

### Articles {#google-sites-articles}

<Route author="hoilc" example="/google/sites/outlierseconomics" path="/google/sites/:id" paramsDesc={['Site ID, can be found in URL']} />

### Recent Changes {#google-sites-recent-changes}

<Route author="nczitzk" example="/google/sites/recentChanges/outlierseconomics" path="/google/sites/recentChanges/:id" paramsDesc={['Site ID, can be found in URL']}/>

## Gwern Branwen {#gwern-branwen}

### 博客 {#gwern-branwen-bo-ke}

<Route author="cerebrater" example="/gwern/newest" path="/gwern/:category" paramsDesc={['網誌主頁的分類訊息']}/>

## hashnode {#hashnode}

### 用户博客 {#hashnode-yong-hu-bo-ke}

<Route author="hnrainll" example="/hashnode/blog/inklings" path="/hashnode/blog/:username" paramsDesc={['博主名称，用户头像 URL 中找到']}>

:::tip

username 为博主用户名，而非`xxx.hashnode.dev`中`xxx`所代表的 blog 地址。

:::

</Route>

## Hedwig.pub {#hedwig.pub}

### 博客 {#hedwig.pub-bo-ke}

<Route author="zwithz" example="/blogs/hedwig/zmd" path="/blogs/hedwig/:type" paramsDesc={['分类, 见下表']}/>

| 呆唯的 Newsletter | 0neSe7en 的技术周刊 | 地心引力 | 宪学宪卖 | Comeet 每周精选 | 无鸡之谈 | 我有一片芝麻地 |
| ----------------- | ------------------- | -------- | -------- | --------------- | -------- | -------------- |
| hirasawayui       | se7en               | walnut   | themez   | comeet          | sunskyxh | zmd            |

> 原则上只要是 {type}.hedwig.pub 都可以匹配。

## Hexo {#hexo}

### Blog using Next theme {#hexo-blog-using-next-theme}

<Route author="fengkx" path="/hexo/next/:url" example="/hexo/next/archive.diygod.me" paramsDesc={['the blog URL without the protocol (http:// and https://)']} selfhost="1"/>

### Blog using Yilia theme {#hexo-blog-using-yilia-theme}

<Route author="aha2mao" path="/hexo/yilia/:url" example="/hexo/yilia/cloudstone.xin" paramsDesc={['the blog URL without the protocol (http:// and https://)']} selfhost="1"/>

### Blog using Fluid theme {#hexo-blog-using-fluid-theme}

<Route author="gkkeys" path="/hexo/fluid/:url" example="/hexo/fluid/blog.tonyzhao.xyz" paramsDesc={['the blog URL without the protocol (http:// and https://)']} selfhost="1"/>

## Hi, DIYgod {#hi-diygod}

### DIYgod 的动森日记 {#hi-diygod-diygod-de-dong-sen-ri-ji}

<Route author="DIYgod" example="/blogs/diygod/animal-crossing" path="/blogs/diygod/animal-crossing"/>

### DIYgod 的可爱的手办们 {#hi-diygod-diygod-de-ke-ai-de-shou-ban-men}

<Route author="DIYgod" example="/blogs/diygod/gk" path="/blogs/diygod/gk"/>

## JustRun {#justrun}

### JustRun {#justrun-justrun}

<Route author="nczitzk" example="/justrun" path="/justrun"/>

## Kun Cheng {#kun-cheng}

### Essay {#kun-cheng-essay}

<Route author="nczitzk" example="/kunchengblog/essay" path="/kunchengblog/essay" radar="1"/>

## LaTeX 开源小屋 {#latex-kai-yuan-xiao-wu}

### 首页 {#latex-kai-yuan-xiao-wu-shou-ye}

<Route author="kt286 nczitzk" example="/latexstudio/home" path="/latexstudio/home"/>

## LeeMeng {#leemeng}

### blog {#leemeng-blog}

<Route author="xyqfer" example="/leemeng" path="/leemeng"/>

## Love the Problem {#love-the-problem}

### Ash Maurya's blog {#love-the-problem-ash-maurya-s-blog}

<Route author="james-tindal" example="/ash-maurya" path="/ash-maurya"/>

## MacMenuBar {#macmenubar}

### Recently {#macmenubar-recently}

<Route author="5upernova-heng" example="/macmenubar/recently/developer-apps,system-tools" path="/macmenubar/recently/:category?" paramsDesc={['Category path name, seperate by comma, default is all categories. Category path name can be found in url']} radar="1" />

## Medium {#medium}

### List {#medium-list}

<Route author="ImSingee" example="/medium/list/imsingee/f2d8d48096a9" path="/medium/list/:user/:catalogId" paramsDesc={['Username', 'List ID']}>

The List ID is the last part of the URL after `-`, for example, the username in <https://medium.com/@imsingee/list/collection-7e67004f23f9> is `imsingee`, and the ID is `7e67004f23f9`.

:::caution

To access private lists, only self-hosting is supported.

:::

</Route>

### Personalized Recommendations - For You {#medium-personalized-recommendations-for-you}

<Route author="ImSingee" example="/medium/for-you/imsingee" path="/medium/for-you/:user" paramsDesc={['Username']} selfhost="1">

:::caution

Personalized recommendations require the cookie value after logging in, so only self-hosting is supported. See the configuration module on the deployment page for details.

:::

</Route>

### Personalized Recommendations - Following {#medium-personalized-recommendations-following}

<Route author="ImSingee" example="/medium/following/imsingee" path="/medium/following/:user" paramsDesc={['Username']} selfhost="1">

:::caution

Personalized recommendations require the cookie value after logging in, so only self-hosting is supported. See the configuration module on the deployment page for details.

:::

</Route>

### Personalized Recommendations - Tag {#medium-personalized-recommendations-tag}

<Route author="ImSingee" example="/medium/tag/imsingee/cybersecurity" path="/medium/tag/:user/:tag" paramsDesc={['Username', 'Subscribed Tag']} selfhost="1">

There are many tags, which can be obtained by clicking on a tag from the homepage and looking at the URL. For example, if the URL is `https://medium.com/?tag=web3`, then the tag is `web3`.

:::caution

Personalized recommendations require the cookie value after logging in, so only self-hosting is supported. See the configuration module on the deployment page for details.

:::

</Route>

## Miris Whispers {#miris-whispers}

### Blog {#miris-whispers-blog}

<Route author="chazeon" example="/miris/blog" path="/miris/blog" />

## Paul Graham {#paul-graham}

### Essays {#paul-graham-essays}

<Route author="Maecenas" example="/blogs/paulgraham" path="/blogs/paulgraham"/>

## Phrack Magazine {#phrack-magazine}

### Article {#phrack-magazine-article}

<Route author="CitrusIce" example="/phrack" path="/phrack" />

## Polkadot {#polkadot}

### Blog {#polkadot-blog}

<Route author="iceqing" example="/polkadot/blog" path="/polkadot/blog"/>

## PolkaWorld {#polkaworld}

### Newest Articles {#polkaworld-newest-articles}

<Route author="iceqing" example="/polkaworld/newest" path="/polkaworld/newest"/>

:::tip

Limit the number of entries to be retrieved by adding `?limit=x` to the end of the route, default value is `10`.

:::

## Stratechery by Ben Thompson {#stratechery-by-ben-thompson}

### Blog {#stratechery-by-ben-thompson-blog}

<Route author="chazeon" example="/stratechery" path="/stratechery" />

## Uber 优步 {#uber-you-bu}

### Engineering {#uber-you-bu-engineering}

<Route author="hulb" example="/uber/blog" path="/uber/blog/:maxPage?" paramsDesc={['max number of pages to retrieve, default to 1 page at most']} />

## v1tx {#v1tx}

### 最新文章 {#v1tx-zui-xin-wen-zhang}

<Route author="TonyRL" example="/v1tx" path="/v1tx" radar="1" rssbud="1" />

## Whoscall {#whoscall}

### 最新文章 {#whoscall-zui-xin-wen-zhang}

<Route author="nczitzk" example="/whoscall" path="/whoscall"/>

### 分類 {#whoscall-fen-lei}

<Route author="nczitzk" example="/whoscall/categories/5-Whoscall 百科" path="/whoscall/categories/:category?" paramsDesc={['分类，见下表，可在对应分類页 URL 中找到，默认为最新文章']}>

| News   | Whoscall 百科   | 防詐小學堂     | Whoscall 日常   |
| ------ | --------------- | -------------- | --------------- |
| 1-News | 5-Whoscall 百科 | 4 - 防詐小學堂 | 6-Whoscall 日常 |

</Route>

### 標籤 {#whoscall-biao-qian}

<Route author="nczitzk" example="/whoscall/tags/whoscall小百科" path="/whoscall/tags/:tag?" paramsDesc={['標籤，见下表，可在对应標籤页 URL 中找到，默认为最新文章']}>

| 防疫也防詐 | 防詐專家 | 來電辨識 | whoscall 日常 |
| ---------- | -------- | -------- | ------------- |

</Route>

## WordPress {#wordpress}

### Blog {#wordpress-blog}

<Route author="Lonor" example="/blogs/wordpress/lawrence.code.blog" path="/blogs/wordpress/:domain/:https?" paramsDesc={['WordPress blog domain', 'use https by default. options: `http` or `https`']}/>

## yuzu emulator {#yuzu-emulator}

### Entry {#yuzu-emulator-entry}

<Route author="nczitzk" example="/yuzu-emu/entry" path="/yuzu-emu/entry" />

## 阿里云系统组技术博客 {#a-li-yun-xi-tong-zu-ji-shu-bo-ke}

### 首页 {#a-li-yun-xi-tong-zu-ji-shu-bo-ke-shou-ye}

<Route author="attenuation" example="/aliyun-kernel/index" path="/aliyun-kernel/index"/>

## 博客园 {#bo-ke-yuan}

### 10 天推荐排行榜 {#bo-ke-yuan-10-tian-tui-jian-pai-hang-bang}

<Route author="hujingnb" example="/cnblogs/aggsite/topdiggs" path="/cnblogs/aggsite/topdiggs" radar="1" rssbud="1"/>

### 48 小时阅读排行 {#bo-ke-yuan-48-xiao-shi-yue-du-pai-hang}

<Route author="hujingnb" example="/cnblogs/aggsite/topviews" path="/cnblogs/aggsite/topviews" radar="1" rssbud="1"/>

### 编辑推荐 {#bo-ke-yuan-bian-ji-tui-jian}

<Route author="hujingnb" example="/cnblogs/aggsite/headline" path="/cnblogs/aggsite/headline" radar="1" rssbud="1"/>

### 分类 {#bo-ke-yuan-fen-lei}

<Route author="hujingnb" example="/cnblogs/cate/go" path="/cnblogs/cate/:type" paramsDesc={['类型']} radar="1" rssbud="1">

在博客园主页的分类出可查看所有类型。例如，go 的分类地址为: `https://www.cnblogs.com/cate/go/`, 则: [`/cnblogs/cate/go`](https://rsshub.app/cnblogs/cate/go)

</Route>

### 精华区 {#bo-ke-yuan-jing-hua-qu}

<Route author="hujingnb" example="/cnblogs/pick" path="/cnblogs/pick" radar="1" rssbud="1"/>

## 财新博客 {#cai-xin-bo-ke}

### 用户博客 {#cai-xin-bo-ke-yong-hu-bo-ke}

<Route author="Maecenas" example="/caixin/blog/zhangwuchang" path="/caixin/blog/:column" paramsDesc={['博客名称，可在博客主页的 URL 找到']}>

通过提取文章全文，以提供比官方源更佳的阅读体验.

</Route>

## 大侠阿木 {#da-xia-a-mu}

### 首页 {#da-xia-a-mu-shou-ye}

<Route author="kt286" example="/daxiaamu/home" path="/daxiaamu/home"/>

## 大眼仔旭 {#da-yan-zai-xu}

### 分类 {#da-yan-zai-xu-fen-lei}

<Route author="nitezs" example="/dayanzai/windows" path="/dayanzai/:category/:fulltext?" paramsDesc={['分类','是否获取全文，需要获取则传入参数`y`']} radar="1">

| 微软应用 | 安卓应用 | 教程资源 | 其他资源 |
| -------- | -------- | -------- | -------- |
| windows  | android  | tutorial | other    |

</Route>

## 虎皮椒 {#hu-pi-jiao}

### 文章 {#hu-pi-jiao-wen-zhang}

<Route author="wxluckly" example="/xunhupay/blog" path="/xunhupay/blog" radar="1"/>

## 華康字型故事 {#hua-kang-zi-xing-gu-shi}

### 博客 {#hua-kang-zi-xing-gu-shi-bo-ke}

<Route author="tpnonthealps" example="/fontstory" path="/fontstory" />

## 黄健宏博客 {#huang-jian-hong-bo-ke}

### 文章 {#huang-jian-hong-bo-ke-wen-zhang}

<Route author="stormbuf" example="/huangz" path="/huangz" radar="1"/>

## 建宁闲谈 {#jian-ning-xian-tan}

### 文章 {#jian-ning-xian-tan-wen-zhang}

<Route author="changlan" example="/blogs/jianning" path="/blogs/jianning" radar="1" rssbud="1"/>

## 劍心．回憶 {#jian-xin-hui-yi}

### 分类 {#jian-xin-hui-yi-fen-lei}

<Route author="nczitzk" example="/kenshin" path="/kenshin/:category?/:type?" paramsDesc={['分类，见下表，默认为首页', '子分类，见下表，默认为首页']}>

:::tip

如 `藝能新聞` 的 `日劇新聞` 分类，路由为 `/jnews/news_drama`

:::

藝能新聞 jnews

| 日劇新聞   | 日影新聞   | 日樂新聞   | 日藝新聞           |
| ---------- | ---------- | ---------- | ------------------ |
| news_drama | news_movie | news_music | news_entertainment |

| 動漫新聞 | 藝人美照     | 清涼寫真   | 日本廣告 | 其他日聞    |
| -------- | ------------ | ---------- | -------- | ----------- |
| news_acg | artist-photo | photoalbum | jpcm     | news_others |

旅遊情報 jpnews

| 日本美食情報 | 日本甜點情報  | 日本零食情報  | 日本飲品情報  | 日本景點情報       |
| ------------ | ------------- | ------------- | ------------- | ------------------ |
| jpnews-food  | jpnews-sweets | jpnews-okashi | jpnews-drinks | jpnews-attractions |

| 日本玩樂情報 | 日本住宿情報 | 日本活動情報  | 日本購物情報    | 日本社會情報   |
| ------------ | ------------ | ------------- | --------------- | -------------- |
| jpnews-play  | jpnews-hotel | jpnews-events | jpnews-shopping | jpnews-society |

| 日本交通情報   | 日本天氣情報   |
| -------------- | -------------- |
| jpnews-traffic | jpnews-weather |

日劇世界 jdrama

| 每周劇評            | 日劇總評           | 資料情報   |
| ------------------- | ------------------ | ---------- |
| drama_review_weekly | drama_review_final | drama_data |

| 深度日劇   | 收視報告     | 日劇專欄     | 劇迷互動          |
| ---------- | ------------ | ------------ | ----------------- |
| drama_deep | drama_rating | drama_column | drama_interactive |

</Route>

## 交流岛资源网 {#jiao-liu-dao-zi-yuan-wang}

### 最新文章 {#jiao-liu-dao-zi-yuan-wang-zui-xin-wen-zhang}

<Route author="TonyRL" example="/jiaoliudao" path="/jiaoliudao" radar="1" />

## 敬维博客 {#jing-wei-bo-ke}

### 文章 {#jing-wei-bo-ke-wen-zhang}

<Route author="a180285" example="/blogs/jingwei.link" path="/blogs/jingwei.link"/>

## 每日安全 {#mei-ri-an-quan}

### 推送 {#mei-ri-an-quan-tui-song}

<Route author="LogicJake" example="/security/pulses" path="/security/pulses"/>

## 美团技术团队 {#mei-tuan-ji-shu-tuan-dui}

### 最近更新 {#mei-tuan-ji-shu-tuan-dui-zui-jin-geng-xin}

<Route author="kt286" example="/meituan/tech/home" path="/meituan/tech/home"/>

## 十年之约 {#shi-nian-zhi-yue}

### 专题展示 - 文章 {#shi-nian-zhi-yue-zhuan-ti-zhan-shi-wen-zhang}

<Route author="7Wate a180285" example="/foreverblog/feeds" path="/foreverblog/feeds" radar="1" rssbud="1" />

## 土猛的员外 {#tu-meng-de-yuan-wai}

### 文章 {#tu-meng-de-yuan-wai-wen-zhang}

<Route author="Levix" example="/luxiangdong/archive" path="/luxiangdong/archive"/>

## 王五四文集 {#wang-wu-si-wen-ji}

### 文章 {#wang-wu-si-wen-ji-wen-zhang}

<Route author="prnake" example="/blogs/wang54" path="/blogs/wang54/:id?" paramsDesc={['RSS抓取地址：https://wangwusiwj.blogspot.com/:id?，默认为2020']}/>

## 王垠博客 {#wang-yin-bo-ke}

### 文章 {#wang-yin-bo-ke-wen-zhang}

<Route author="junbaor SkiTiSu" example="/blogs/wangyin" path="/blogs/wangyin"/>

## 新语丝 {#xin-yu-si}

### 新到资料 {#xin-yu-si-xin-dao-zi-liao}

<Route author="wenzhenl" example="/xys/new" path="/xys/new" radar="1" />

## 雨苁博客 {#yu-cong-bo-ke}

### 首页 {#yu-cong-bo-ke-shou-ye}

<Route author="XinRoom" example="/ddosi" path="/ddosi"/>

### 分类 {#yu-cong-bo-ke-fen-lei}

<Route author="XinRoom" example="/ddosi/category/黑客工具" path="/ddosi/category/:category?"/>

## 云原生社区 {#yun-yuan-sheng-she-qu}

### 博客 {#yun-yuan-sheng-she-qu-bo-ke}

<Route author="aneasystone" example="/cloudnative/blog" path="/cloudnative/blog"/>

## 支流科技 {#zhi-liu-ke-ji}

### 博客 {#zhi-liu-ke-ji-bo-ke}

<Route author="aneasystone" example="/apiseven/blog" path="/apiseven/blog"/>

## 竹白 {#zhu-bai}

### 文章 {#zhu-bai-wen-zhang}

<Route author="naixy28" example="/zhubai/via" path="/zhubai/:id"  paramsDesc={['`id` 为竹白主页 url 中的三级域名，如 via.zhubai.love 的 `id` 为 `via`']}>

:::tip

在路由末尾处加上 `?limit=限制获取数目` 来限制获取条目数量，默认值为`20`

:::

</Route>

### TOP 20 {#zhu-bai-top-20}

<Route author="nczitzk" example="/zhubai/top20" path="/zhubai/top20"/>
