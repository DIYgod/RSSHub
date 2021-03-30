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

### User Works

<Route author="MisteryMonster" example="/behance/mishapetrick" path="/behance/:user/:type?" :paramsDesc="['用户名', '类型，可选 `projects` 或 `appreciated`']" radar="1">

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

## Inside Design

### Recent Stories

<Route author="miaoyafeng" example="/invisionapp/inside-design" path="/invisionapp/inside-design">
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

<Route author="nczitzk" example="/notefolio" path="/notefolio/:caty?/:order?/:time?/:query?" :paramsDesc="['分类，见下表，默认为 `all`', '排序，可选 `pick` 指 Notefolio 精选，`newest` 指 最新，`noted` 指 知名，默认为 `pick`', '时间，可选 `all` 指 全部，`day` 指 最近24小时，`week` 指 最近一周，`month` 指 最近一个月，`month3` 指 最近三个月，默认为`all`', '关键词，默认为空']">

| 分类 | 韩文分类名      | 中文分类名      |
| ---- | --------------- | --------------- |
| all  | 전체            | 全部            |
| A7   | 공예            | 工艺品          |
| J7   | 그래픽 디자인   | 平面设计        |
| B7   | 디지털 아트     | 数字艺术        |
| C7   | 영상/모션그래픽 | 视频 / 图形动画 |
| D7   | 브랜딩/편집     | 品牌创建 / 编辑 |
| E7   | 산업 디자인     | 工业设计        |
| F7   | UI/UX           | UI/UX           |
| G7   | 일러스트레이션  | 插画            |
| K7   | 타이포그래피    | 字体            |
| H7   | 파인아트        | 纯艺术          |
| I7   | 포토그래피      | 摄影            |

</Route>

## UI 中国

### 推荐文章

<Route author="WenryXu" example="/ui-cn/article" path="/ui-cn/article"/>

### 个人作品

<Route author="WenryXu" example="/ui-cn/user/85974" path="/ui-cn/user/:id" :paramsDesc="['用户id']"/>

## Unit Image

### Films

<Route author="MisteryMonster" example="/unit-image/films/vfx" path="/unit-image/films/:type?" :paramsDesc="['Films 下分类，`vfx`, `game-trailer`, `animation`, `commercials`, `making-of`']"/>

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

### 推荐

<Route author="junbaor" example="/zcool/recommend/all" path="/zcool/recommend/:type" :paramsDesc="['推荐类型,详见下面的表格']" radar="1" rssbud="1">

推荐类型

| all      | home     | edit     | article  |
| -------- | -------- | -------- | -------- |
| 全部推荐 | 首页推荐 | 编辑推荐 | 文章推荐 |

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

### 发现

<Route author="nczitzk" example="/zcool/discover/0/0/0/中国/0/2/0" path="/zcool/discover/:cate?/:subCate?/:hasVideo?/:city?/:collage?/:recommendLevel?/:sort?" :paramsDesc="['分类，见下表，默认为精选', '子分类，见下表，默认为该父分类全部', '是否为视频，`0` 指非视频，`1` 指视频，默认为非视频内容', '地区代码，填入发现页中 `选择城市` 中的各级地名，如 `亚洲`、`中国`、`北京`、`纽约`、`巴黎`等', '学校名称，默认为 `0`，即全部学校', '推荐等级，见下表，默认为编辑推荐', '排序方式，`0` 指最新排序，`9` 指默认排序，默认为最新排序']" radar="1" rssbud="1">

以下是两个例子：

`/zcool/discover` 为 [发现页](https://www.zcool.com.cn/discover) 默认内容；

`/zcool/discover/0/0/0/中国/0/2/0` 则返回 `精选` 分类的 `全部` 子分类中为 `非视频内容` 且来自 `中国` 的 `编辑推荐` 内容并以 `最新排序` 排序。

分类 cate

| 精选 | 平面 | 插画 | UI | 网页 | 摄影 | 三维 | 影视 | 空间 | 工业 / 产品 | 动漫 | 纯艺术 | 手工艺 |
| ---- | ---- | ---- | -- | ---- | ---- | ---- | ---- | ---- | ----------- | ---- | ------ | ------ |
| 0    | 8    | 1    | 17 | 607  | 33   | 24   | 610  | 609  | 499         | 608  | 612    | 611    |

子分类 subCate

精选 0

| 全部 | 运营设计 | 包装 | 动画 / 影视 | 人像摄影 | 商业插画 | 电商 | APP 界面 | 艺术插画 | 家装设计 | 海报 |
| ---- | -------- | ---- | ----------- | -------- | -------- | ---- | -------- | -------- | -------- | ---- |
| 0    | 617      | 9    | 30          | 34       | 2        | 616  | 757      | 292      | 637      | 10   |

平面 8

| 全部 | 包装 | 海报 | 品牌 | IP 形象 | 字体 / 字形 | Logo | 书籍 / 画册 | 宣传物料 | 图案 | 信息图表 | PPT/Keynote | 其他平面 | 文章 |
| ---- | ---- | ---- | ---- | ------- | ----------- | ---- | ----------- | -------- | ---- | -------- | ----------- | -------- | ---- |
| 0    | 9    | 10   | 15   | 779     | 14          | 13   | 12          | 534      | 624  | 625      | 626         | 11       | 809  |

插画 1

| 全部 | 商业插画 | 概念设定 | 游戏原画 | 绘本 | 儿童插画 | 艺术插画 | 创作习作 | 新锐潮流插画 | 像素画 | 文章 |
| ---- | -------- | -------- | -------- | ---- | -------- | -------- | -------- | ------------ | ------ | ---- |
| 0    | 2        | 5        | 685      | 631  | 684      | 292      | 7        | 3            | 4      | 819  |

UI 17

| 全部 | APP 界面 | 游戏 UI | 软件界面 | 图标 | 主题 / 皮肤 | 交互 / UE | 动效设计 | 闪屏 / 壁纸 | 其他 UI | 文章 |
| ---- | -------- | ------- | -------- | ---- | ----------- | --------- | -------- | ----------- | ------- | ---- |
| 0    | 757      | 692     | 621      | 20   | 19          | 623       | 797      | 21          | 23      | 822  |

网页 607

| 全部 | 电商 | 企业官网 | 游戏 / 娱乐 | 运营设计 | 移动端网页 | 门户网站 | 个人网站 | 其他网页 | 文章 |
| ---- | ---- | -------- | ----------- | -------- | ---------- | -------- | -------- | -------- | ---- |
| 0    | 616  | 614      | 693         | 617      | 777        | 615      | 618      | 620      | 823  |

摄影 33

| 全部 | 人像摄影 | 风光摄影 | 人文 / 纪实摄影 | 美食摄影 | 产品摄影 | 环境 / 建筑摄影 | 时尚 / 艺术摄影 | 修图 / 后期 | 宠物摄影 | 婚礼摄影 | 其他摄影 | 文章 |
| ---- | -------- | -------- | --------------- | -------- | -------- | --------------- | --------------- | ----------- | -------- | -------- | -------- | ---- |
| 0    | 34       | 35       | 36              | 825      | 686      | 38              | 800             | 687         | 40       | 808      | 43       | 810  |

三维 24

| 全部 | 动画 / 影视 | 机械 / 交通 | 人物 / 生物 | 产品 | 场景 | 建筑 / 空间 | 其他三维 | 文章 |
| ---- | ----------- | ----------- | ----------- | ---- | ---- | ----------- | -------- | ---- |
| 0    | 30          | 25          | 27          | 807  | 26   | 29          | 32       | 818  |

影视 610

| 全部 | 短片 | Motion Graphic | 宣传片 | 影视后期 | 栏目片头 | MV  | 设定 / 分镜 | 其他影视 | 文章 |
| ---- | ---- | -------------- | ------ | -------- | -------- | --- | ----------- | -------- | ---- |
| 0    | 645  | 649            | 804    | 646      | 647      | 644 | 650         | 651      | 817  |

空间 609

| 全部 | 家装设计 | 酒店餐饮设计 | 商业空间设计 | 建筑设计 | 舞台美术 | 展陈设计 | 景观设计 | 其他空间 | 文章 |
| ---- | -------- | ------------ | ------------ | -------- | -------- | -------- | -------- | -------- | ---- |
| 0    | 637      | 811          | 641          | 636      | 638      | 639      | 640      | 642      | 812  |

工业 / 产品 499

| 全部 | 生活用品 | 电子产品 | 交通工具 | 工业用品 / 机械 | 人机交互 | 玩具 | 其他工业 / 产品 | 文章 |
| ---- | -------- | -------- | -------- | --------------- | -------- | ---- | --------------- | ---- |
| 0    | 508      | 506      | 509      | 511             | 510      | 689  | 514             | 813  |

动漫 608

| 全部 | 短篇 / 格漫 | 中 / 长篇漫画 | 网络表情 | 单幅漫画 | 动画片 | 其他动漫 | 文章 |
| ---- | ----------- | ------------- | -------- | -------- | ------ | -------- | ---- |
| 0    | 628         | 629           | 632      | 627      | 633    | 635      | 820  |

纯艺术 612

| 全部 | 绘画 | 雕塑 | 书法 | 实验艺术 | 文章 |
| ---- | ---- | ---- | ---- | -------- | ---- |
| 0    | 659  | 662  | 668  | 657      | 821  |

手工艺 611

| 全部 | 工艺品设计 | 手办 / 模玩 | 首饰设计 | 其他手工艺 | 文章 |
| ---- | ---------- | ----------- | -------- | ---------- | ---- |
| 0    | 654        | 656         | 756      | 658        | 816  |

服装 613

| 全部 | 休闲 / 流行服饰 | 正装 / 礼服 | 传统 / 民族服饰 | 配饰 | 鞋履设计 | 儿童服饰 | 其他服装 | 文章 |
| ---- | --------------- | ----------- | --------------- | ---- | -------- | -------- | -------- | ---- |
| 0    | 672             | 671         | 814             | 677  | 676      | 673      | 680      | 815  |

其他 44

| 全部 | 文案 / 策划 | VR 设计 | 独立游戏 | 其他 | 文章 |
| ---- | ----------- | ------- | -------- | ---- | ---- |
| 0    | 417         | 798     | 683      | 45   | 824  |

推荐等级 recommendLevel

| 全部 | 编辑精选 | 首页推荐 | 全部推荐 |
| ---- | -------- | -------- | -------- |
| 0    | 2        | 3        | 1        |

</Route>

### 发现（+ 查询参数）

<Route author="nczitzk" example="/zcool/discover/cate=0&subCate=0" path="/zcool/discover/:query?" :paramsDesc="['查询参数']" radar="1" rssbud="1">

在 [发现页](https://www.zcool.com.cn/discover) 中选择查询参数后会跳转到对应搜索结果页面。此时地址栏 `https://www.zcool.com.cn/discover/` 后的字段即为查询参数。

如：<https://www.zcool.com.cn/discover/cate=0&subCate=0> 查询参数为 `cate=0&subCate=0`

</Route>
