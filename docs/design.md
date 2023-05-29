---
pageClass: routes
---

# 设计

## Axis Studios

### Work type

<Route author="MisteryMonster" example="/axis-studios/work/full-service-cg-production" path="/axis-studios/:type/:tag?" :paramsDesc="['`work`, `blog`','文章内的 Work type URL: `compositing`, `full-service-cg-production`, `vfx-supervision`, `realtime`, `art-direction`, `animation`']">

文章内 Work type 指向的栏目地址，比如： <https://axisstudiosgroup.com/work/full-service-cg-production> 的 tag 为 `full-service-cg-production`，要注意的是 tag 和文章的目录是一样的。

有一些 tag 并不经常使用： `Script`, `direction`, `production`, `design-concept` 等等。

</Route>

## Behance

### 用户作品

<Route author="MisteryMonster" example="/behance/mishapetrick" path="/behance/:user/:type?" :paramsDesc="['用户名', '类型，可选 `projects` 或 `appreciated`，默认为 `projects`']" radar="1">

Behance 用户主页 URL 获取用户名，如 <https://www.behance.net/mishapetrick> 的用户名为 `mishapetrick`。

</Route>

## Blow Studio

### 主页

<Route author="MisteryMonster" example="/blow-studio" path="/blow-studio" />

## Blur Studio

### Works

<Route author="MisteryMonster" example="/blur-studio" path="/blur-studio" />

## Digic Picture

### 作品和新闻

<Route author="MisteryMonster" example="/digic-pictures/works/real-time-engine" path="/digic-pictures/:menu/:tag?" :paramsDesc="['`news`, `works`', 'WORK 下项目类型: `/game-cinematics`, `/feature`, `/making-of`, `/commercials-vfx`, `/real-time-engine`']"/>

## Dribbble

### 流行

<Route author="DIYgod" example="/dribbble/popular/week" path="/dribbble/popular/:timeframe?" :paramsDesc="['时间维度, 支持 week month year ever']"/>

### 用户（团队）

<Route author="DIYgod" example="/dribbble/user/google" path="/dribbble/user/:name" :paramsDesc="['用户名, 可在该用户主页 URL 中找到']"/>

### 关键词

<Route author="DIYgod" example="/dribbble/keyword/player" path="/dribbble/keyword/:keyword" :paramsDesc="['想要订阅的关键词']"/>

## Eagle

### 博客

<Route author="Fatpandac" example="/eagle/blog" path="/eagle/blog/:cate?/:language?" :paramsDesc="['分类，默认为全部，见下表', '语言，`cn`、`tw`、`en` 默认为 `cn`']" radar="1" rsshub="1">

| 全部 | 设计资源         | 设计技巧     | 最新消息     |
| ---- | ---------------- | ------------ | ------------ |
| all  | design-resources | learn-design | inside-eagle |

</Route>

## Google

### Google Fonts

<Route author="Fatpandac" example="/google/fonts/date" path="/google/fonts/:sort?" :paramsDesc="['排序，见下表，默认为最新']" selfhost="1">

| 最新 |   趋势   |  最受欢迎  |  名字 | 风格数量 |
| :--: | :------: | :--------: | :---: | :------: |
| date | trending | popularity | alpha |   style  |

::: warning 注意

需要设置 API key，所以只能自建，详情见[部署页面](https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi)的配置模块。

:::

</Route>

## Inside Design

### Recent Stories

<Route author="miaoyafeng" example="/invisionapp/inside-design" path="/invisionapp/inside-design">
</Route>

## LogoNews 标志情报局

### 首页

<Route author="nczitzk" example="/logonews" path="/logonews"/>

### 文章分类

<Route author="nczitzk" example="/logonews/category/news/newsletter" path="/logonews/category/:category/:type" :paramsDesc="['分类，可在对应分类页 URL 中找到', '类型，可在对应分类页 URL 中找到']">

如 [简讯 - 标志情报局](https://www.logonews.cn/category/news/newsletter) 的 URL 为 <https://www.logonews.cn/category/news/newsletter>，可得路由为 [`/logonews/category/news/newsletter`](https://rsshub.app/logonews/category/news/newsletter)。

</Route>

### 文章标签

<Route author="nczitzk" example="/logonews/tag/china" path="/logonews/tag/:tag" :paramsDesc="['标签，可在对应标签页 URL 中找到']">

如 [中国 - 标志情报局](https://www.logonews.cn/tag/china) 的 URL 为 <https://www.logonews.cn/tag/china>，可得路由为 [`/logonews/tag/china`](https://rsshub.app/logonews/tag/china)。

</Route>

### 作品

<Route author="nczitzk" example="/logonews/work" path="/logonews/work"/>

### 作品分类

<Route author="nczitzk" example="/logonews/work/categorys/hotel-catering" path="/logonews/work/categorys/:category" :paramsDesc="['分类，可在对应分类页 URL 中找到']">

如 [LOGO 作品分类：酒店餐饮 - 标志情报局](https://www.logonews.cn/work/categorys/hotel-catering) 的 URL 为 <https://www.logonews.cn/work/categorys/hotel-catering>，可得路由为 [`/logonews/work/categorys/hotel-catering`](https://rsshub.app/logonews/work/categorys/hotel-catering)。

</Route>

### 作品标签

<Route author="nczitzk" example="/logonews/work/tags/旅游" path="/logonews/work/tags/:tag?" :paramsDesc="['标签，可在对应标签页 URL 中找到']">

如 [LOGO 标签：旅游 - 标志情报局](https://www.logonews.cn/work/tags/旅游) 的 URL 为 [https://www.logonews.cn/work/tags/ 旅游](https://www.logonews.cn/work/tags/旅游)，可得路由为 [`/logonews/work/tags/旅游`](https://rsshub.app/logonews/work/tags/旅游)。

</Route>

## Method Studios

### 菜单

<Route author="MisteryMonster" example="/method-studios/games" path="/method-studios/:menu?" :paramsDesc="['地址栏下 /en 后的栏目: `features`, `advertising`, `episodic`, `games`, `methodmade`']">

不支持`news`和`main`。

默认为 <https://www.methodstudios.com/en/features> 下的栏目。

</Route>

## Monotype

### Featured Article

<Route author="nczitzk" example="/monotype/article" path="/monotype/article" />

## Notefolio

### Works

<Route author="BianTan" example="/notefolio/search/1/pick/all/life" path="/notefolio/search/:category?/:order?/:time?/:query?" :paramsDesc="['分类，见下表，默认为 `all`', '排序，可选 `pick` 指 Notefolio 精选，`published` 指 最新，`like` 指 推荐，默认为 `pick`', '时间，可选 `all` 指 全部，`one-day` 指 最近24小时，`week` 指 最近一周，`month` 指 最近一个月，`three-month` 指 最近三个月，默认为`all`', '关键词，默认为空']">

| 分类 | 韩文分类名       | 中文分类名      |
| ---- | ---------------- | --------------- |
| all  | 전체             | 全部            |
| 1    | 영상/모션그래픽  | 视频 / 动态图像 |
| 2    | 그래픽 디자인    | 平面设计        |
| 3    | 브랜딩/편집      | 品牌创建 / 编辑 |
| 4    | UI/UX            | UI/UX           |
| 5    | 일러스트레이션   | 插画            |
| 6    | 디지털 아트      | 数字艺术        |
| 7    | 캐릭터 디자인    | 角色设计        |
| 8    | 품/패키지 디자인 | 产品 / 包装设计 |
| 9    | 포토그래피       | 摄影            |
| 10   | 타이포그래피     | 字体设计        |
| 11   | 공예             | 工艺品          |
| 12   | 파인아트         | 纯艺术          |

</Route>

## Shopping Design

### 文章列表

<Route author="miles170" example="/shoppingdesign/posts" path="/shoppingdesign/posts"/>

## UI 中国

### 推荐文章

<Route author="WenryXu" example="/ui-cn/article" path="/ui-cn/article"/>

### 个人作品

<Route author="WenryXu" example="/ui-cn/user/85974" path="/ui-cn/user/:id" :paramsDesc="['用户id']"/>

## Unit Image

### Films

<Route author="MisteryMonster" example="/unit-image/films/vfx" path="/unit-image/films/:type?" :paramsDesc="['Films 下分类，`vfx`, `game-trailer`, `animation`, `commercials`, `making-of`']"/>

## 爱果果

### 最新 H5

<Route author="yuxinliu-alex" example="/iguoguo/html5" path="/iguoguo/html5" />

## 优设网

### 设计专题

<Route author="nczitzk" example="/uisdc/zt/design-history" path="/uisdc/zt/:title?" :paramsDesc="['专题名称，可在标签页的 URL 中找到，如 `design-history`；也可填入 `hot` 展示最热门专题，默认展示最新鲜专题']">

更多设计专题请参见 [优设专题](https://www.uisdc.com/zt)

</Route>

### 细节猎人

<Route author="nczitzk" example="/uisdc/topic/all" path="/uisdc/topic/:title?/:sort?" :paramsDesc="['标签名称，可在标签页的 URL 中找到', '排序方式，`hot` 指最热门，默认为最新鲜']">

更多细节标签请参见 [全部标签](https://www.uisdc.com/alltopics)

</Route>

### 设计话题

<Route author="nczitzk" example="/uisdc/talk" path="/uisdc/talk/:sort?" :paramsDesc="['排序方式，`hot` 指最热门，默认为最新鲜']"/>

### 行业新闻

<Route author="nczitzk" example="/uisdc/hangye" path="/uisdc/hangye/:caty?" :paramsDesc="['分类，见下表，默认为全部新闻']">

| 全部新闻 | 活动赛事        | 品牌资讯   | 新品推荐     |
| -------- | --------------- | ---------- | ------------ |
|          | events-activity | brand-news | new-products |

</Route>

### 优设读报

<Route author="nczitzk" example="/uisdc/news" path="/uisdc/news"/>

## 站酷

### 发现（+ 推荐预设）

<Route author="junbaor nczitzk" example="/zcool/discover/all" path="/zcool/discover/:type?" :paramsDesc="['预设参数，见下表']" radar="1" rssbud="1">

推荐类型

| all      | home     | editor   | article  |
| -------- | -------- | -------- | -------- |
| 全部推荐 | 首页推荐 | 编辑精选 | 文章推荐 |

</Route>

### 发现（+ 查询参数）

<Route author="nczitzk" example="/zcool/discover/cate=0&subCate=0" path="/zcool/discover/:query?" :paramsDesc="['查询参数']" radar="1" rssbud="1">

在 [站酷发现页](https://www.zcool.com.cn/discover) 中选择好所有可选的查询参数后会跳转到对应搜索结果页面。此时地址栏 `https://www.zcool.com.cn/discover/` 后的字段即为查询参数。

如：选择 **精选** 分类下的 **运营设计** 子分类后，选择 **编辑精选**，默认 **视频** 取消勾选，默认 **城市** 和 **学校** 留空即全部，就会跳转到链接：

<https://www.zcool.com.cn/discover?cate=0&subCate=617&hasVideo=0&city=0&college=0&recommendLevel=2&sort=9>

此时其查询参数为 `cate=0&subCate=617&hasVideo=0&city=0&college=0&recommendLevel=2&sort=9`。其对应的路由即 [`/zcool/discover/cate=0&subCate=617&hasVideo=0&city=0&college=0&recommendLevel=2&sort=9`](https://rsshub.app/zcool/discover/cate=0\&subCate=617\&hasVideo=0\&city=0\&college=0\&recommendLevel=2\&sort=9)

</Route>

### 发现

<Route author="nczitzk" example="/zcool/discover" path="/zcool/discover/:query?/:subCate?/:hasVideo?/:city?/:college?/:recommendLevel?/:sort?" :paramsDesc="['查询参数或分类，若填写分类见下表，默认为空 或 `0` 即精选', '子分类，见下表，默认为 `0` 即该父分类下全部', '是否含视频，默认为 `0` 即全部，亦可选 `1` 即含视频', '地区代码，填入发现页中 `选择城市` 中的各级地名，如 `亚洲`、`中国`、`北京`、`纽约`、`巴黎`等', '学校，默认为 `0` 即全部', '推荐等级，见下表，默认为 `2` 即编辑精选', '排序方式，可选 `0` 即最新发布 或 `9` 即默认排序，默认为 `9`']" radar="1" rssbud="1">

查看 **精选** 分类下的全部内容，其他参数选择默认，可直接使用路由 [`/zcool/discover/0`](https://rsshub.app/zcool/discover/0)

查看 **精选** 分类下的 **运营设计** 子分类全部内容，其他参数选择默认，可直接使用路由 [`/zcool/discover/0/617`](https://rsshub.app/zcool/discover/0/617)

在 **精选** 分类下的 **运营设计** 子分类全部内容基础上，筛选出有 **视频**，可直接使用路由 [`/zcool/discover/0/617/1`](https://rsshub.app/zcool/discover/0/617/1)

在 **精选** 分类下的 **运营设计** 子分类全部内容基础上，筛选出有 **视频**，且城市选择 **北京**，可直接使用路由 [`/zcool/discover/0/617/1/北京`](https://rsshub.app/zcool/discover/0/617/1/北京)

::: tip 提示

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

### 作品总榜单

<Route author="mexunco" example="/zcool/top/design" path="/zcool/top/:type" :paramsDesc="['推荐类型,详见下面的表格']" radar="1" rssbud="1">

榜单类型

| design   | article  |
| -------- | -------- |
| 作品榜单 | 文章榜单 |

</Route>

### 用户作品

<Route author="junbaor" example="/zcool/user/baiyong" path="/zcool/user/:uid" :paramsDesc="['个性域名前缀或者用户ID']" radar="1" rssbud="1">

例如:

站酷的个人主页 `https://baiyong.zcool.com.cn` 对应 rss 路径 `/zcool/user/baiyong`

站酷的个人主页 `https://www.zcool.com.cn/u/568339` 对应 rss 路径 `/zcool/user/568339`

</Route>
