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

<Route author="MisteryMonster" example="/behance/mishapetrick" path="/behance/:user" :paramsDesc="['用户名']" radar="1">

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

## UI 中国

### 推荐文章

<Route author="WenryXu" example="/ui-cn/article" path="/ui-cn/article"/>

### 个人作品

<Route author="WenryXu" example="/ui-cn/user/85974" path="/ui-cn/user/:id" :paramsDesc="['用户id']"/>

## Unit Image

### Films

<Route author="MisteryMonster" example="/unit-image/films/vfx" path="/unit-image/films/:type?" :paramsDesc="['Films 下分类，`vfx`, `game-trailer`, `animation`, `commercials`, `making-of`']"/>

## 站酷

### 推荐

<Route author="junbaor" example="/zcool/recommend/all" path="/zcool/recommend/:type" :paramsDesc="['推荐类型,详见下面的表格']" radar="1">

推荐类型

| all      | home     | edit     | article  |
| -------- | -------- | -------- | -------- |
| 全部推荐 | 首页推荐 | 编辑推荐 | 文章推荐 |

</Route>

### 作品总榜单

<Route author="mexunco" example="/zcool/top/design" path="/zcool/top/:type" :paramsDesc="['推荐类型,详见下面的表格']" radar="1">

榜单类型

| design   | article  |
| -------- | -------- |
| 作品榜单 | 文章榜单 |

</Route>

### 用户作品

<Route author="junbaor" example="/zcool/user/baiyong" path="/zcool/user/:uid" :paramsDesc="['个性域名前缀或者用户ID']" radar="1">

例如:

站酷的个人主页 `https://baiyong.zcool.com.cn` 对应 rss 路径 `/zcool/user/baiyong`

站酷的个人主页 `https://www.zcool.com.cn/u/568339` 对应 rss 路径 `/zcool/user/568339`

</Route>
