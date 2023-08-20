# 🎨️ Design

## Axis Studios {#axis-studios}

### Work type {#axis-studios-work-type}

<Route author="MisteryMonster" example="/axis-studios/work/full-service-cg-production" path="/axis-studios/:type/:tag?" paramsDesc={['`work`, `blog`', 'Work type URL: `compositing`, `full-service-cg-production`, `vfx-supervision`, `realtime`, `art-direction`, `animation`']}>

Work type URL in articles. Such as： 'https://axisstudiosgroup.com/work/full-service-cg-production' the tag will be `full-service-cg-production`.

Some tags are rarely used： `Script`, `direction`, `production`, `design-concept` etc。

</Route>

## Behance {#behance}

### User Works {#behance-user-works}

<Route author="MisteryMonster" example="/behance/mishapetrick" path="/behance/:user/:type?" paramsDesc={['username', 'type, `projects` or `appreciated`, `projects` by default']} radar="1">

Behance user's profile URL, like <https://www.behance.net/mishapetrick> the username will be `mishapetrick`。

</Route>

## Blow Studio {#blow-studio}

### Home {#blow-studio-home}

<Route author="MisteryMonster" example="/blow-studio" path="/blow-studio" />

## Blur Studio {#blur-studio}

### Works {#blur-studio-works}

<Route author="MisteryMonster" example="/blur-studio" path="/blur-studio" />

## Digic Picture {#digic-picture}

### Works & News {#digic-picture-works-%26-news}

<Route author="MisteryMonster" example="/digic-pictures/works/real-time-engine" path="/digic-pictures/:menu/:tag?" paramsDesc={['`news`, `works`', 'Under WORK types: `/game-cinematics`, `/feature`, `/making-of`, `/commercials-vfx`, `/real-time-engine`']} />

## Dribbble {#dribbble}

### Popular {#dribbble-popular}

<Route path="/dribbble/popular/:timeframe?" example="/dribbble/popular" paramsDesc={['support the following values: week, month, year and ever']} />

### User (or team) {#dribbble-user-(or-team)}

<Route path="/dribbble/user/:name" example="/dribbble/user/google" paramsDesc={['username, available in user\'s homepage URL']} />

### Keyword {#dribbble-keyword}

<Route path="/dribbble/keyword/:keyword" example="/dribbble/keyword/player" paramsDesc={['desired keyword']} />

## Eagle {#eagle}

### Blog {#eagle-blog}

<Route author="Fatpandac" example="/eagle/blog/en" path="/eagle/blog/:cate?/:language?" paramsDesc={['Category, get by URL, `all` by default', 'Language, `cn`, `tw`, `en`, `en` by default']} radar="1" rsshub="1"/>

## Google {#google}

### Google Fonts {#google-google-fonts}

<Route author="Fatpandac" example="/google/fonts/date" path="/google/fonts/:sort?" paramsDesc={['Sorting type, see below, default to `date`']} selfhost="1">

| Newest | Trending | Most popular | Name  | Number of styles |
| :----: | :------: | :----------: | :--:  | :--------------: |
| date   | trending | popularity   | alpha | style            |

:::caution

This route requires API key, therefore it's only available when self-hosting, refer to the [Deploy Guide](https://docs.rsshub.app/install/#configuration-route-specific-configurations) for route-specific configurations.

:::

</Route>

## Inside Design {#inside-design}

### Recent Stories {#inside-design-recent-stories}

<Route author="miaoyafeng" example="/invisionapp/inside-design" path="/invisionapp/inside-design">
</Route>

## LogoNews 标志情报局 {#logonews-biao-zhi-qing-bao-ju}

### 首页 {#logonews-biao-zhi-qing-bao-ju-shou-ye}

<Route author="nczitzk" example="/logonews" path="/logonews"/>

### 文章分类 {#logonews-biao-zhi-qing-bao-ju-wen-zhang-fen-lei}

<Route author="nczitzk" example="/logonews/category/news/newsletter" path="/logonews/category/:category/:type" paramsDesc={['分类，可在对应分类页 URL 中找到', '类型，可在对应分类页 URL 中找到']}>

如 [简讯 - 标志情报局](https://www.logonews.cn/category/news/newsletter) 的 URL 为 <https://www.logonews.cn/category/news/newsletter>，可得路由为 [`/logonews/category/news/newsletter`](https://rsshub.app/logonews/category/news/newsletter)。

</Route>

### 文章标签 {#logonews-biao-zhi-qing-bao-ju-wen-zhang-biao-qian}

<Route author="nczitzk" example="/logonews/tag/china" path="/logonews/tag/:tag" paramsDesc={['标签，可在对应标签页 URL 中找到']}>

如 [中国 - 标志情报局](https://www.logonews.cn/tag/china) 的 URL 为 <https://www.logonews.cn/tag/china>，可得路由为 [`/logonews/tag/china`](https://rsshub.app/logonews/tag/china)。

</Route>

### 作品 {#logonews-biao-zhi-qing-bao-ju-zuo-pin}

<Route author="nczitzk" example="/logonews/work" path="/logonews/work"/>

### 作品分类 {#logonews-biao-zhi-qing-bao-ju-zuo-pin-fen-lei}

<Route author="nczitzk" example="/logonews/work/categorys/hotel-catering" path="/logonews/work/categorys/:category" paramsDesc={['分类，可在对应分类页 URL 中找到']}>

如 [LOGO 作品分类：酒店餐饮 - 标志情报局](https://www.logonews.cn/work/categorys/hotel-catering) 的 URL 为 <https://www.logonews.cn/work/categorys/hotel-catering>，可得路由为 [`/logonews/work/categorys/hotel-catering`](https://rsshub.app/logonews/work/categorys/hotel-catering)。

</Route>

### 作品标签 {#logonews-biao-zhi-qing-bao-ju-zuo-pin-biao-qian}

<Route author="nczitzk" example="/logonews/work/tags/旅游" path="/logonews/work/tags/:tag?" paramsDesc={['标签，可在对应标签页 URL 中找到']}>

如 [LOGO 标签：旅游 - 标志情报局](https://www.logonews.cn/work/tags/旅游) 的 URL 为 [https://www.logonews.cn/work/tags/ 旅游](https://www.logonews.cn/work/tags/旅游)，可得路由为 [`/logonews/work/tags/旅游`](https://rsshub.app/logonews/work/tags/旅游)。

</Route>

## Method Studios {#method-studios}

### Menus {#method-studios-menus}

<Route author="MisteryMonster" path="/method-studios/:menu?" example="/method-studios/games" paramsDesc={['URL behind /en: `features`, `advertising`, `episodic`, `games`, `methodmade`']}>

Not support `main`, `news`.

Default is under 'https://www.methodstudios.com/en/features'.

</Route>

## Monotype {#monotype}

### Featured Article {#monotype-featured-article}

<Route author="nczitzk" example="/monotype/article" path="/monotype/article" />

## Notefolio {#notefolio}

### Works {#notefolio-works}

<Route author="BianTan" example="/notefolio/search/1/pick/all/life" path="/notefolio/search/:category?/:order?/:time?/:query?" paramsDesc={['Category, see below, `all` by default', 'Order, `pick` as Notefolio Pick, `published` as Newest, `like` as like, `pick` by default', 'Time, `all` as All the time, `one-day` as Latest 24 hours, `week` as Latest week, `month` as Latest month, `three-month` as Latest 3 months, `all` by default', 'Keyword, empty by default']}>

| Category | Name in Korean | Name in English |
| ---- | --------------- | --------------- |
| all  | 전체            | All        |
| 1   | 영상/모션그래픽 | Video / Motion Graphics |
| 2   | 그래픽 디자인   | Graphic Design |
| 3   |  브랜딩/편집    | Branding / Editing |
| 4   | UI/UX       | UI/UX |
| 5   | 일러스트레이션  | Illustration |
| 6   | 디지털 아트     | Digital Art |
| 7   | 캐릭터 디자인   | Character Design |
| 8   | 제품/패키지 디자인 | Product Package Design |
| 9   | 포토그래피      | Photography |
| 10   | 타이포그래피    | Typography |
| 11   | 공예            | Crafts |
| 12   | 파인아트        | Fine Art|

</Route>

## Shopping Design {#shopping-design}

### 文章列表 {#shopping-design-wen-zhang-lie-biao}

<Route author="miles170" example="/shoppingdesign/posts" path="/shoppingdesign/posts"/>

## UI 中国 {#ui-zhong-guo}

### 推荐文章 {#ui-zhong-guo-tui-jian-wen-zhang}

<Route author="WenryXu" example="/ui-cn/article" path="/ui-cn/article"/>

### 个人作品 {#ui-zhong-guo-ge-ren-zuo-pin}

<Route author="WenryXu" example="/ui-cn/user/85974" path="/ui-cn/user/:id" paramsDesc={['用户id']}/>

## Unit Image {#unit-image}

### Films {#unit-image-films}

<Route author="MisteryMonster" example="/unit-image/films/vfx" path="/unit-image/films/:type?" paramsDesc={['Films type，`vfx`, `game-trailer`, `animation`, `commercials`, `making-of`']}/>

## 爱果果 {#ai-guo-guo}

### 最新 H5 {#ai-guo-guo-zui-xin-h5}

<Route author="yuxinliu-alex" example="/iguoguo/html5" path="/iguoguo/html5" />

## 优设网 {#you-she-wang}

### 设计专题 {#you-she-wang-she-ji-zhuan-ti}

<Route author="nczitzk" example="/uisdc/zt/design-history" path="/uisdc/zt/:title?" paramsDesc={['专题名称，可在标签页的 URL 中找到，如 `design-history`；也可填入 `hot` 展示最热门专题，默认展示最新鲜专题']}>

更多设计专题请参见 [优设专题](https://www.uisdc.com/zt)

</Route>

### 细节猎人 {#you-she-wang-xi-jie-lie-ren}

<Route author="nczitzk" example="/uisdc/topic/all" path="/uisdc/topic/:title?/:sort?" paramsDesc={['标签名称，可在标签页的 URL 中找到', '排序方式，`hot` 指最热门，默认为最新鲜']}>

更多细节标签请参见 [全部标签](https://www.uisdc.com/alltopics)

</Route>

### 设计话题 {#you-she-wang-she-ji-hua-ti}

<Route author="nczitzk" example="/uisdc/talk" path="/uisdc/talk/:sort?" paramsDesc={['排序方式，`hot` 指最热门，默认为最新鲜']}/>

### 行业新闻 {#you-she-wang-hang-ye-xin-wen}

<Route author="nczitzk" example="/uisdc/hangye" path="/uisdc/hangye/:caty?" paramsDesc={['分类，见下表，默认为全部新闻']}>

| 全部新闻 | 活动赛事        | 品牌资讯   | 新品推荐     |
| -------- | --------------- | ---------- | ------------ |
|          | events-activity | brand-news | new-products |

</Route>

### 优设读报 {#you-she-wang-you-she-du-bao}

<Route author="nczitzk" example="/uisdc/news" path="/uisdc/news"/>

## 站酷 {#zhan-ku}

### 发现（+ 推荐预设） {#zhan-ku-fa-xian-%EF%BC%88%2B-tui-jian-yu-she-%EF%BC%89}

<Route author="junbaor nczitzk" example="/zcool/discover/all" path="/zcool/discover/:type?" paramsDesc={['预设参数，见下表']} radar="1" rssbud="1">

推荐类型

| all      | home     | editor   | article  |
| -------- | -------- | -------- | -------- |
| 全部推荐 | 首页推荐 | 编辑精选 | 文章推荐 |

</Route>

### 发现（+ 查询参数） {#zhan-ku-fa-xian-%EF%BC%88%2B-cha-xun-can-shu-%EF%BC%89}

<Route author="nczitzk" example="/zcool/discover/cate=0&subCate=0" path="/zcool/discover/:query?" paramsDesc={['查询参数']} radar="1" rssbud="1">

在 [站酷发现页](https://www.zcool.com.cn/discover) 中选择好所有可选的查询参数后会跳转到对应搜索结果页面。此时地址栏 `https://www.zcool.com.cn/discover/` 后的字段即为查询参数。

如：选择 **精选** 分类下的 **运营设计** 子分类后，选择 **编辑精选**，默认 **视频** 取消勾选，默认 **城市** 和 **学校** 留空即全部，就会跳转到链接：

<https://www.zcool.com.cn/discover?cate=0&subCate=617&hasVideo=0&city=0&college=0&recommendLevel=2&sort=9>

此时其查询参数为 `cate=0&subCate=617&hasVideo=0&city=0&college=0&recommendLevel=2&sort=9`。其对应的路由即 [`/zcool/discover/cate=0&subCate=617&hasVideo=0&city=0&college=0&recommendLevel=2&sort=9`](https://rsshub.app/zcool/discover/cate=0&subCate=617&hasVideo=0&city=0&college=0&recommendLevel=2&sort=9)

</Route>

### 发现 {#zhan-ku-fa-xian}

<Route author="nczitzk" example="/zcool/discover" path="/zcool/discover/:query?/:subCate?/:hasVideo?/:city?/:college?/:recommendLevel?/:sort?" paramsDesc={['查询参数或分类，若填写分类见下表，默认为空 或 `0` 即精选', '子分类，见下表，默认为 `0` 即该父分类下全部', '是否含视频，默认为 `0` 即全部，亦可选 `1` 即含视频', '地区代码，填入发现页中 `选择城市` 中的各级地名，如 `亚洲`、`中国`、`北京`、`纽约`、`巴黎`等', '学校，默认为 `0` 即全部', '推荐等级，见下表，默认为 `2` 即编辑精选', '排序方式，可选 `0` 即最新发布 或 `9` 即默认排序，默认为 `9`']} radar="1" rssbud="1">

查看 **精选** 分类下的全部内容，其他参数选择默认，可直接使用路由 [`/zcool/discover/0`](https://rsshub.app/zcool/discover/0)

查看 **精选** 分类下的 **运营设计** 子分类全部内容，其他参数选择默认，可直接使用路由 [`/zcool/discover/0/617`](https://rsshub.app/zcool/discover/0/617)

在 **精选** 分类下的 **运营设计** 子分类全部内容基础上，筛选出有 **视频**，可直接使用路由 [`/zcool/discover/0/617/1`](https://rsshub.app/zcool/discover/0/617/1)

在 **精选** 分类下的 **运营设计** 子分类全部内容基础上，筛选出有 **视频**，且城市选择 **北京**，可直接使用路由 [`/zcool/discover/0/617/1/北京`](https://rsshub.app/zcool/discover/0/617/1/北京)

:::tip 

下方仅提供 **分类及其子分类** 参数的代码。**学校** 参数的代码可以在 [站酷发现页](https://www.zcool.com.cn/discover) 中选择跳转后，从浏览器地址栏中找到。

:::

分类 cate

| 精选 | 平面 | 插画 | UI | 网页 | 摄影 | 三维 | 影视 | 空间 | 工业 / 产品 | 动漫 | 纯艺术 | 手工艺 | 服装 | 其他 |
| ---- | ---- | ---- | -- | ---- | ---- | ---- | ---- | ---- | ----------- | ---- | ------ | ------ | ---- | ---- |
| 0    | 8    | 1    | 17 | 607  | 33   | 24   | 610  | 609  | 499         | 608  | 612    | 611    | 613  | 44   |

子分类 subCate

精选 0

| 运营设计 | 包装 | 动画 / 影视 | 人像摄影 | 商业插画 | 电商 | APP 界面 | 艺术插画 | 家装设计 | 海报 | 文章   |
| -------- | ---- | ----------- | -------- | -------- | ---- | -------- | -------- | -------- | ---- | ------ |
| 617      | 9    | 30          | 34       | 2        | 616  | 757      | 292      | 637      | 10   | 809824 |

平面 8

| 包装 | 海报 | 品牌 | IP 形象 | 字体 / 字形 | Logo | 书籍 / 画册 | 宣传物料 | 图案 | 信息图表 | PPT/Keynote | 其他平面 | 文章 |
| ---- | ---- | ---- | ------- | ----------- | ---- | ----------- | -------- | ---- | -------- | ----------- | -------- | ---- |
| 9    | 10   | 15   | 779     | 14          | 13   | 12          | 534      | 624  | 625      | 626         | 11       | 809  |

插画 1

| 商业插画 | 概念设定 | 游戏原画 | 绘本 | 儿童插画 | 艺术插画 | 创作习作 | 新锐潮流插画 | 像素画 | 文章 |
| -------- | -------- | -------- | ---- | -------- | -------- | -------- | ------------ | ------ | ---- |
| 2        | 5        | 685      | 631  | 684      | 292      | 7        | 3            | 4      | 819  |

UI 17

| APP 界面 | 游戏 UI | 软件界面 | 图标 | 主题 / 皮肤 | 交互 / UE | 动效设计 | 闪屏 / 壁纸 | 其他 UI | 文章 |
| -------- | ------- | -------- | ---- | ----------- | --------- | -------- | ----------- | ------- | ---- |
| 757      | 692     | 621      | 20   | 19          | 623       | 797      | 21          | 23      | 822  |

网页 607

| 电商 | 企业官网 | 游戏 / 娱乐 | 运营设计 | 移动端网页 | 门户网站 | 个人网站 | 其他网页 | 文章 |
| ---- | -------- | ----------- | -------- | ---------- | -------- | -------- | -------- | ---- |
| 616  | 614      | 693         | 617      | 777        | 615      | 618      | 620      | 823  |

摄影 33

| 人像摄影 | 风光摄影 | 人文 / 纪实摄影 | 美食摄影 | 产品摄影 | 环境 / 建筑摄影 | 时尚 / 艺术摄影 | 修图 / 后期 | 宠物摄影 | 婚礼摄影 | 其他摄影 | 文章 |
| -------- | -------- | --------------- | -------- | -------- | --------------- | --------------- | ----------- | -------- | -------- | -------- | ---- |
| 34       | 35       | 36              | 825      | 686      | 38              | 800             | 687         | 40       | 808      | 43       | 810  |

三维 24

| 动画 / 影视 | 机械 / 交通 | 人物 / 生物 | 产品 | 场景 | 建筑 / 空间 | 其他三维 | 文章 |
| ----------- | ----------- | ----------- | ---- | ---- | ----------- | -------- | ---- |
| 30          | 25          | 27          | 807  | 26   | 29          | 32       | 818  |

影视 610

| 短片 | Motion Graphic | 宣传片 | 影视后期 | 栏目片头 | MV  | 设定 / 分镜 | 其他影视 | 文章 |
| ---- | -------------- | ------ | -------- | -------- | --- | ----------- | -------- | ---- |
| 645  | 649            | 804    | 646      | 647      | 644 | 650         | 651      | 817  |

空间 609

| 家装设计 | 酒店餐饮设计 | 商业空间设计 | 建筑设计 | 舞台美术 | 展陈设计 | 景观设计 | 其他空间 | 文章 |
| -------- | ------------ | ------------ | -------- | -------- | -------- | -------- | -------- | ---- |
| 637      | 811          | 641          | 636      | 638      | 639      | 640      | 642      | 812  |

工业 / 产品 499

| 生活用品 | 电子产品 | 交通工具 | 工业用品 / 机械 | 人机交互 | 玩具 | 其他工业 / 产品 | 文章 |
| -------- | -------- | -------- | --------------- | -------- | ---- | --------------- | ---- |
| 508      | 506      | 509      | 511             | 510      | 689  | 514             | 813  |

动漫 608

| 短篇 / 格漫 | 中 / 长篇漫画 | 网络表情 | 单幅漫画 | 动画片 | 其他动漫 | 文章 |
| ----------- | ------------- | -------- | -------- | ------ | -------- | ---- |
| 628         | 629           | 632      | 627      | 633    | 635      | 820  |

纯艺术 612

| 绘画 | 雕塑 | 书法 | 实验艺术 | 文章 |
| ---- | ---- | ---- | -------- | ---- |
| 659  | 662  | 668  | 657      | 821  |

手工艺 611

| 工艺品设计 | 手办 / 模玩 | 首饰设计 | 其他手工艺 | 文章 |
| ---------- | ----------- | -------- | ---------- | ---- |
| 654        | 656         | 756      | 658        | 816  |

服装 613

| 休闲 / 流行服饰 | 正装 / 礼服 | 传统 / 民族服饰 | 配饰 | 鞋履设计 | 儿童服饰 | 其他服装 | 文章 |
| --------------- | ----------- | --------------- | ---- | -------- | -------- | -------- | ---- |
| 672             | 671         | 814             | 677  | 676      | 673      | 680      | 815  |

其他 44

| 文案 / 策划 | VR 设计 | 独立游戏 | 其他 | 文章 |
| ----------- | ------- | -------- | ---- | ---- |
| 417         | 798     | 683      | 45   | 824  |

推荐等级 recommendLevel

| 全部 | 编辑精选 | 首页推荐 | 全部推荐 |
| ---- | -------- | -------- | -------- |
| 0    | 2        | 3        | 1        |

</Route>

### 作品总榜单 {#zhan-ku-zuo-pin-zong-bang-dan}

<Route author="mexunco" example="/zcool/top/design" path="/zcool/top/:type" paramsDesc={['推荐类型,详见下面的表格']} radar="1" rssbud="1">

榜单类型

| design   | article  |
| -------- | -------- |
| 作品榜单 | 文章榜单 |

</Route>

### 用户作品 {#zhan-ku-yong-hu-zuo-pin}

<Route author="junbaor" example="/zcool/user/baiyong" path="/zcool/user/:uid" paramsDesc={['个性域名前缀或者用户ID']} radar="1" rssbud="1">

例如:

站酷的个人主页 `https://baiyong.zcool.com.cn` 对应 rss 路径 `/zcool/user/baiyong`

站酷的个人主页 `https://www.zcool.com.cn/u/568339` 对应 rss 路径 `/zcool/user/568339`

</Route>

