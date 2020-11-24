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

<Route author="nczitzk" example="/zcool/discovery" path="/zcool/discovery/:query?" :paramsDesc="['查询参数']" radar="1" rssbud="1">

在 [发现页](https://www.zcool.com.cn/discover) 中选择查询参数后会跳转到对应搜索结果页面。此时地址栏 `https://www.zcool.com.cn/discover/` 后的字段即为查询参数。

如：<https://www.zcool.com.cn/discover/0!0!0!0!0!!!!2!-1!1> 查询参数为 `0!0!0!0!0!!!!2!-1!1`

</Route>
