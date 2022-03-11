---
pageClass: routes
---

# 编程

## ACM

### 图灵奖获得者

<Route author="nczitzk" example="/acm/amturingaward" path="/acm/amturingaward"/>

## ACM-ECNU 比赛

### 华东师范大学 ACM OJ 比赛列表

<Route author="a180285" example="/acm-ecnu/contest/public" path="/acm-ecnu/contest/:category?" radar="1" rssbud="1" :paramsDesc="['分类可选，不写代表全部，public 代表仅订阅公开比赛']" />

## AI 研习社

### 首页

<Route author="kt286" example="/aiyanxishe/109/hot" path="/aiyanxishe/:id/:sort?" :paramsDesc="['领域 id，全部领域为 all，单独领域 id 抓包可得','排序方式，默认为 new（最新），也可选择 hot（最热）或 recommend（推荐）']"/>

## AlgoCasts

### 视频更新

<Route author="ImSingee" example="/algocasts" path="/algocasts" radar="1" rssbud="1"></Route>

> AlgoCasts 需要付费订阅，RSS 仅做更新提醒，不含付费内容.

## AtCoder

### Present Contests

<Route author="nczitzk" example="/atcoder/contest/en/upcoming" path="/atcoder/contest/:language?/:status?" :paramsDesc="['语言，可选 `jp` 即日语 或 `en` 即英语，默认为英语', '状态，见下表，默认为 Recent Contests']">

状态

| Active Contests | Upcoming Contests | Recent Contests |
| --------------- | ----------------- | --------------- |
| active          | upcoming          | recent          |

</Route>

### Contests Archive

<Route author="nczitzk" example="/atcoder/contest" path="/atcoder/contest/:language?/:rated?/:category?/:keyword?" :paramsDesc="['语言，可选 `jp` 即日语 或 `en` 即英语，默认为英语', 'Rated 对象，见下表，默认为全部', '分类，见下表，默认为全部', '关键字，默认为空']">

Rated 对象

| ABC Class (Rated for ~1999) | ARC Class (Rated for ~2799) | AGC Class (Rated for ~9999) |
| --------------------------- | --------------------------- | --------------------------- |
| 1                           | 2                           | 3                           |

分类

| All | AtCoder Typical Contest | PAST Archive | Unofficial(unrated) |
| --- | ----------------------- | ------------ | ------------------- |
| 0   | 6                       | 50           | 101                 |

| JOI Archive | Sponsored Tournament | Sponsored Parallel(rated) |
| ----------- | -------------------- | ------------------------- |
| 200         | 1000                 | 1001                      |

| Sponsored Parallel(unrated) | Optimization Contest |
| --------------------------- | -------------------- |
| 1002                        | 1200                 |

</Route>

### Posts

<Route author="nczitzk" example="/atcoder/post" path="/atcoder/post/:language?/:keyword?" :paramsDesc="['语言，可选 `jp` 即日语 或 `en` 即英语，默认为英语', '关键字，默认为空']"/>

## BBC News Labs

### News

<Route author="elxy" example="/bbcnewslabs/news" path="/bbcnewslabs/news"/>

## Bitmovin

### Blog

<Route author="elxy" example="/bitmovin/blog" path="/bitmovin/blog"/>

## Codeforces

#### 最新比赛

<Route author="Fatpandac" example="/codeforces/contests" path="/codeforces/contests"/>

## cve.mitre.org

### 搜索结果

<Route author="fengkx" example="/cve/search/PostgreSQL" path="/cve/search/:keyword" :paramsDesc="['关键词']" />

## dbaplus 社群

### 栏目

<Route author="nczitzk" example="/dbaplus" path="/dbaplus/:tab?" :paramsDesc="['栏目，见下表，默认为全部']">

| 全部  | 数据库 | 运维  | 大数据 | 架构  | PaaS 云 | 职场生涯 | 这里有毒 |
| --- | --- | --- | --- | --- | ------ | ---- | ---- |
| All | 153 | 134 | 73  | 141 | 72     | 149  | 21   |

</Route>

### 活动

<Route author="nczitzk" example="/dbaplus/activity" path="/dbaplus/activity/:type?" :paramsDesc="['分类，见下表，默认为线上分享']">

| 线上分享   | 线下峰会    |
| ------ | ------- |
| online | offline |

</Route>

## deeplearning.ai

### TheBatch 周报

<Route author="nczitzk" example="/deeplearningai/thebatch" path="/deeplearningai/thebatch"/>

## Distill

### Latest

<Route author="nczitzk" example="/distill" path="/distill"/>

## Dockone

### 周报

<Route author="csi0n" example="/dockone/weekly" path="/dockone/weekly"/>

## GitChat

### 最新文章

<Route author="hoilc" example="/gitchat/newest" path="/gitchat/newest/:category?/:selected?" :paramsDesc="['分类 ID, 置空或`all`代表全部, 具体值需要抓取前端请求, 以下列出可能有变动, 仅供参考','是否只显示严选文章, 任意值为是, 置空为否']" />

| 分类名  | 分类 ID                    |
| :--- | :----------------------- |
| 前端   | 58e84f875295227534aad506 |
| 后端   | 5d8b7c3786194a1921979122 |
| 移动开发 | 5d8b7c3786194a1921979123 |
| 运维   | 5901bd477b61a76bc4016423 |
| 测试   | 58e84f425295227534aad502 |
| 架构   | 58e84f6bad952d6b3428af9a |
| 人工智能 | 58e84f53ec8e9e7b34457809 |
| 职场   | 58e84f1584c651693437f27c |
| 互联网  | 5d8b7c3786194a1921979124 |

> GitChat 需要付费订阅，RSS 仅做更新提醒，不含付费内容.

## Gitea

### 博客

<Route author="cnzgray" example="/gitea/blog" path="/gitea/blog">

> gitea 博客一般发布最新的 release 信息，路由选择用 blog 名称主要因为其地址名为 blog，而非 changlog，慎重起见还是用 blog 命名。

</Route>

## GitHub

::: tip 提示

GitHub 官方也提供了一些 RSS:

-   仓库 releases: `https://github.com/:owner/:repo/releases.atom`
-   仓库 commits: `https://github.com/:owner/:repo/commits.atom`
-   用户动态: `https://github.com/:user.atom`
-   专属动态: `https://github.com/:user.private.atom?token=:secret` (登录后在[仪表盘页面](https://github.com)找到 **Subscribe to your news feed** 字样即可)

:::

### 用户仓库

<Route author="DIYgod" example="/github/repos/DIYgod" path="/github/repos/:user" :paramsDesc="['用户名']" radar="1" rssbud="1"/>

### Trending

<Route author="DIYgod" example="/github/trending/daily/javascript/zh" path="/github/trending/:since/:language/:spoken_language?" :paramsDesc="['时间跨度, 可在 [Trending 页](https://github.com/trending/javascript?since=monthly&spoken_language_code=zh) URL 中找到, 可选 `daily` `weekly` `monthly`', '语言, 可在 [Trending 页](https://github.com/trending/javascript?since=monthly&spoken_language_code=zh) URL 中找到，`any`表示不设语言限制', '自然语言, 可在 [Trending 页](https://github.com/trending/javascript?since=monthly&spoken_language_code=zh) URL 中找到']" radar="1" rssbud="1"/>

### Topics

<Route author="queensferryme" example="/github/topics/framework" path="/github/topics/:name/:qs?" :paramsDesc="['名称，可以在相关 [Topics 页](https://github.com/topics/framework) URL 中找到', '过滤规则，形如 `l=php&o=desc&s=stars`，详见下表']" radar="1" rssbud="1">

| 参数名 | 描述   | 可选值                                                                          |
| --- | ---- | ---------------------------------------------------------------------------- |
| `l` | 编程语言 | 例如 `php`，可以在相关 [Topics 页](https://github.com/topics/framework?l=php) URL 中找到 |
| `o` | 排序方法 | `asc`（升序）<br>`desc`（降序）                                                      |
| `s` | 排序标准 | `stars`（按 star 数量排序）<br>`forks`（按 fork 数量排序）<br>`updated`（按更新日期排序）           |

例如 `/github/topics/framework/l=php&o=desc&s=stars` 会生成对应[此页面](https://github.com/topics/framework?l=php\&o=desc\&s=stars)的 RSS。

</Route>

### 仓库 Issues

<Route author="HenryQW AndreyMZ" example="/github/issue/DIYgod/RSSHub/open/RSS%20wanted" path="/github/issue/:user/:repo/:state?/:labels?" :paramsDesc="['用户名', '仓库名', 'issue 状态，可选`open`,`closed`或`all`，默认为`open`', '标签列表，以逗号分隔']" radar="1" rssbud="1"/>

### 仓库 Pull Requests

<Route author="hashman" example="/github/pull/DIYgod/RSSHub" path="/github/pull/:user/:repo" :paramsDesc="['用户名', '仓库名']" radar="1" rssbud="1"/>

### 用户 Followers

<Route author="HenryQW" example="/github/user/followers/HenryQW" path="/github/user/followers/:user" :paramsDesc="['用户名']" radar="1" rssbud="1"/>

### 仓库 Stars

<Route author="HenryQW" example="/github/stars/DIYgod/RSSHub" path="/github/stars/:user/:repo" :paramsDesc="['用户名', '仓库名']" radar="1" rssbud="1"/>

### 仓库 Branches

<Route author="max-arnold" example="/github/branches/DIYgod/RSSHub" path="/github/branches/:user/:repo" :paramsDesc="['用户名', '仓库名']" radar="1" rssbud="1"/>

### 文件 Commits

<Route author="zengxs" example="/github/file/DIYgod/RSSHub/master/lib/router.js" path="/github/file/:user/:repo/:branch/:filepath+" :paramsDesc="['用户名', '仓库名', '分支名', '文件路径']" radar="1" rssbud="1">

| 用户名      | 仓库名      | 分支名      | 文件路径            |
| -------- | -------- | -------- | --------------- |
| `DIYgod` | `RSSHub` | `master` | `lib/router.js` |

> -   **分支名**中如果有 `/` 等特殊字符需使用 urlencode 进行编码，通常 `/` 需要被替换成 `%2f`
> -   **文件路径**中如果有特殊字符同样需使用 urlencode 进行编码，但文件路径可以正常识别 `/` 字符
> -   **文件路径**如果以 `.rss`, `.atom`, `.json` 结尾，需要将后缀中的 `.` 替换成 `%2e`
>     > Reeder 订阅 `%2erss` 或类似后缀的时候会出错，此时再在路由后面加上 `.rss` 即可正常订阅
>     >
>     > 如： `https://rsshub.app/github/file/DIYgod/RSSHub/master/lib/router%2ejs` 替换成 `https://rsshub.app/github/file/DIYgod/RSSHub/master/lib/router%2ejs.rss` 即可

</Route>

### 搜索结果

<Route author="LogicJake" example="/github/search/RSSHub/bestmatch/desc" path="/github/search/:query/:sort?/:order?" :paramsDesc="['搜索关键词', '排序选项（默认为bestmatch）','排序顺序，desc和asc（默认desc降序）']"/>

| 排序选项         | sort      |
| ------------ | --------- |
| 最佳匹配         | bestmatch |
| 根据 star 数量排序 | stars     |
| 根据 fork 数量排序 | forks     |
| 根据更新时间排序     | updated   |

### 用户 Star 的仓库

<Route author="LanceZhu" example="/github/starred_repos/DIYgod" path="/github/starred_repos/:user" :paramsDesc="['用户名']" radar="1" rssbud="1"/>

### 仓库 Contirbutors

<Route author="zoenglinghou" example="/github/contributors/DIYgod/RSSHub" path="/github/contributors/:user/:repo/:order?/:anon?" :paramsDesc="['用户名', '仓库名', 'Commit 数量排序顺序，desc和asc（默认desc降序）', '是否包括匿名用户，默认不包含，任意值包含匿名用户']" radar="1" rssbud="1"/>

### Issues / Pull Requests 评论

<Route author="TonyRL" example="/github/comments/DIYgod/RSSHub/issues/8116" path="/github/comments/:user/:repo/:type/:number" :paramsDesc="['用户名', '仓库', '类型，`issues`或`pull`', '编号']"/>

## GitLab

### Explore

<Route author="imlonghao zoenglinghou" example="/gitlab/explore/trending" path="/gitlab/explore/:type/:host?" :paramsDesc="['分类', '服务器地址，缺省为 gitlab.com']">

| Trending | Most stars | All |
| -------- | ---------- | --- |
| trending | starred    | all |

</Route>

### Releases

<Route author="zoenglinghou" example="/gitlab/release/pleroma/pleroma/git.pleroma.social" path="/gitlab/release/:namespace/:project/:host?" :paramsDesc="['项目所有者或命名空间。斜杠`/`需要替代为`%2F`', '项目名称', '服务器地址，缺省为 gitlab.com']" />

### Tags

<Route author="zoenglinghou" example="/gitlab/tag/rluna-open-source%2Ffile-management%2Fowncloud/core/gitlab.com" path="/gitlab/tag/:namespace/:project/:host?" :paramsDesc="['项目所有者或命名空间。斜杠`/`需要替代为`%2F`', '项目名称', '服务器地址，缺省为 gitlab.com']" />

## Gitpod

### 博客

<Route author="TonyRL" example="/gitpod/blog" path="/gitpod/blog" />

### 更新日志

<Route author="TonyRL" example="/gitpod/changelog" path="/gitpod/changelog" />

## Go 语言中文网

### 周刊

<Route author="Weilet" example="/go-weekly" path="/go-weekly"/>

## GoCN

### 文章

<Route author="AtlanCI" example="/gocn" path="/gocn"/>

## Hacker News

### 分区

<Route author="cf020031308 nczitzk" example="/hackernews" path="/hackernews/:section?/:type?/:user?" :paramsDesc="['内容分区，见下表，默认为 `index`', '链接类型，见下表，默认为 `sources`', '设定用户，只在 `threads` 和 `submitted` 分区有效']">

内容分区

| homepage                              | new                                           | past                                        | comments                                                | ask                                     | show                                      | jobs                                      | best                                      | threads                                                 | submitted                                                   |
| ------------------------------------- | --------------------------------------------- | ------------------------------------------- | ------------------------------------------------------- | --------------------------------------- | ----------------------------------------- | ----------------------------------------- | ----------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------- |
| [index](https://news.ycombinator.com) | [newest](https://news.ycombinator.com/newest) | [front](https://news.ycombinator.com/front) | [newcomments](https://news.ycombinator.com/newcomments) | [ask](https://news.ycombinator.com/ask) | [show](https://news.ycombinator.com/show) | [jobs](https://news.ycombinator.com/jobs) | [best](https://news.ycombinator.com/best) | [threads](https://news.ycombinator.com/threads?id=dang) | [submitted](https://news.ycombinator.com/submitted?id=dang) |

条目指向链接类型

| 用户分享的来源地址 | Hacker News 上的讨论页面 | 读取回复列表        |
| --------- | ------------------ | ------------- |
| sources   | comments           | comments_list |

> 网站有默认的 RSS：<https://news.ycombinator.com/rss> 内容同 homepage，应优先考虑。

</Route>

### 用户

订阅特定用户的内容

<Route author="cf020031308 nczitzk xie-dongping" example="/hackernews/threads/comments_list/dang" path="/hackernews/:section?/:type?/:user?" :paramsDesc="['内容分区，见上表，默认为 `index`', '链接类型，见上表，默认为 `sources`', '设定用户，只在 `threads` 和 `submitted` 分区有效']" />

## HelloGitHub

### 文章列表

<Route author="moke8" example="/hellogithub/article" path="/hellogithub/article"/>

### 编程语言排行榜

<Route author="moke8" example="/hellogithub/ranking" path="/hellogithub/ranking/:type?" :paramsDesc="['分类，见下表']">

| 编程语言排行 | 数据库排行 | 服务端语言排行   |
| ------ | ----- | --------- |
| tiobe  | db    | webserver |

</Route>

### 月刊

<Route author="moke8" example="/hellogithub/month" path="/hellogithub/month"/>

## Hex-Rays

### Hex-Rays News

<Route author="hellodword" example="/hex-rays/news" path="/hex-rays/news"/>

## ITSlide

### 最新

<Route author="Yangshuqing" example="/itslide/new" path="/itslide/new" radar="1" rssbud="1"/>

## Kaggle

### Discussion

<Route author="LogicJake" example="/kaggle/discussion/387811/active" path="/kaggle/discussion/:forumId/:sort?" :paramsDesc="['讨论区 id, 打开网页请求, 搜索 forumId；填 all 可以订阅全站讨论区', '排序方式见下表, 默认为 hot']">

| hot     | recent          | new             | top        | active        |
| ------- | --------------- | --------------- | ---------- | ------------- |
| Hotness | Recent Comments | Recently Posted | Most Votes | Most Comments |

</Route>

### Competitions

<Route author="LogicJake" example="/kaggle/competitions" path="/kaggle/competitions/:category?" :paramsDesc="['类别, 默认为空']">

| 空              | featured | research | recruitment | gettingStarted  | masters | playground | analytics |
| -------------- | -------- | -------- | ----------- | --------------- | ------- | ---------- | --------- |
| All Categories | Featured | Research | Recruitment | Getting started | Masters | Playground | Analytics |

</Route>

### User Discussion

<Route author="nczitzk" example="/kaggle/user/antgoldbloom" path="/kaggle/user/:user" :paramsDesc="['用户名']"/>

## LeetCode

### 文章

<Route author="LogicJake" example="/leetcode/articles" path="/leetcode/articles"/>

### 打卡

<Route author="NathanDai" example="/leetcode/submission/us/nathandai" path="/leetcode/submission/:country/:user" :paramsDesc="['国家 country, 中国(cn)和美国(us)', '用户名 user, 可在LeetCode用户主页的 URL 中找到']"/>

## LinkedKeeper

### 博文

<Route author="imlonghao" example="/linkedkeeper/sub/1" path="/linkedkeeper/:type/:id?" :paramsDesc="['博文分类, 为 URL 中 `.action` 的文件名', '分区或标签的 ID, 对应 URL 中的 `sid` 或 `tid`']"/>

## Linux Patchwork

### Patch Comments

<Route author="ysc3839" example="/patchwork.kernel.org/comments/10723629" path="/patchwork.kernel.org/comments/:id" :paramsDesc="['Patch ID']"/>

## LWN.net

### Security alerts

<Route author="zengxs" example="/lwn/alerts/CentOS" path="/lwn/alerts/:distributor" :paramsDesc="['对应发行版标识']">

| 发行版              | 标识                 |
| :--------------- | :----------------- |
| Arch Linux       | `Arch_Linux`       |
| CentOS           | `CentOS`           |
| Debian           | `Debian`           |
| Fedora           | `Fedora`           |
| Gentoo           | `Gentoo`           |
| Mageia           | `Mageia`           |
| openSUSE         | `openSUSE`         |
| Oracle           | `Oracle`           |
| Red Hat          | `Red_Hat`          |
| Scientific Linux | `Scientific_Linux` |
| Slackware        | `Slackware`        |
| SUSE             | `SUSE`             |
| Ubuntu           | `Ubuntu`           |

::: tip 提示

注意标识大小写

:::

</Route>

## Node.js

### News

<Route author="nczitzk" example="/nodejs/blog" path="/nodejs/blog/:language?" :paramsDesc="['语言，见下表，默认为 en']">

| العربية | Catalan | Deutsch | Español | زبان فارسی |
| ------- | ------- | ------- | ------- | ---------- |
| ar      | ca      | de      | es      | fa         |

| Français | Galego | Italiano | 日本語 | 한국어 |
| -------- | ------ | -------- | --- | --- |
| fr       | gl     | it       | ja  | ko  |

| Português do Brasil | limba română | Русский | Türkçe | Українська |
| ------------------- | ------------ | ------- | ------ | ---------- |
| pt-br               | ro           | ru      | tr     | uk         |

| 简体中文  | 繁體中文  |
| ----- | ----- |
| zh-cn | zh-tw |

</Route>

## NOSEC.org

### Posts

<Route author="hellodword" example="/nosec/hole" path="/nosec/:keykind?" :paramsDesc="['对应文章分类']">

| 分类   | 标识         |
| :--- | :--------- |
| 威胁情报 | `threaten` |
| 安全动态 | `security` |
| 漏洞预警 | `hole`     |
| 数据泄露 | `leakage`  |
| 专题报告 | `speech`   |
| 技术分析 | `skill`    |
| 安全工具 | `tool`     |

</Route>

## project-zero issues

### issues

<Route author="hellodword" example="/project-zero-issues" path="/project-zero-issues" />

## react

### react-native

<Route author="xixi" example="/react/react-native-weekly" path="/react/react-native-weekly" />

## Scala

### Scala Blog

<Route author="fengkx" example="/scala/blog/posts" path="/scala/blog/:part?" :paramsDesc="['部分, 默认为All, part参数可在url中获得']" />

## segmentfault

### 频道

<Route author="LogicJake Fatpandac" example="/segmentfault/channel/frontend" path="/segmentfault/channel/:name" :paramsDesc="['频道名称，在频道 URL 可以找到']"/>

### 用户

<Route author="leyuuu Fatpandac" example="/segmentfault/user/minnanitkong" path="/segmentfault/user/:name" :paramsDesc="['用户Id，用户详情页URL可以找到']"/>

## TesterHome

### 最新发布

<Route author="xyqfer" example="/testerhome/newest" path="/testerhome/newest"/>

## Visual Studio Code Marketplace

### Visual Studio Code 插件

<Route author="SeanChao" example="/vscode/marketplace" path="/vscode/marketplace/:category?" :paramsDesc="['分类']">

| Featured | Trending Weekly | Trending Monthly | Trending Daily | Most Popular | Recently Added |
| -------- | --------------- | ---------------- | -------------- | ------------ | -------------- |
| featured | trending        | trending_m       | trending_d     | popular      | new            |

</Route>

## wolley

### posts

<Route author="umm233" example="/wolley" path="/wolley/index"/>

### user post

<Route author="umm233" example="/wolley/user/kyth" path="/wolley/user/:id" :paramsDesc="['用户 id']" />

### host

<Route author="umm233" example="/wolley/host/www.youtube.com" path="/wolley/host/:host" :paramsDesc="['文章对应 host 分类']" />

## 阿里云

### 数据库内核月报

<Route author="junbaor" example="/aliyun/database_month" path="/aliyun/database_month"/>

### 公告

<Route author="muzea" example="/aliyun/notice" path="/aliyun/notice/:type?"/>

| 类型   | type |
| ---- | ---- |
| 全部   |      |
| 升级公告 | 1    |
| 安全公告 | 2    |
| 备案公告 | 3    |
| 其他   | 4    |

### 开发者社区 - 主题

<Route author="umm233" example="/aliyun/developer/group/alitech" path="/aliyun/developer/group/:type" :paramsDesc="['对应技术领域分类']" />

## 安全客

::: tip 提示

官方提供了混合的主页资讯 RSS: <https://api.anquanke.com/data/v1/rss>

:::

### 最新漏洞列表

<Route author="qwertyuiop6" example="/aqk/vul" path="/aqk/vul"/>

### 分类订阅

<Route author="qwertyuiop6" example="/aqk/week" path="/aqk/:category" :paramsDesc="['分类订阅']">

| 360 网络安全周报 | 活动       | 知识        | 资讯   | 招聘  |
| ---------- | -------- | --------- | ---- | --- |
| week       | activity | knowledge | news | job |

</Route>

## 安全内参

### 分类

<Route author="XinRoom" example="/secrss/category/产业趋势" path="/secrss/category/:category"/>

### 作者

<Route author="XinRoom" example="/secrss/author/网络安全威胁和漏洞信息共享平台" path="/secrss/author/:author"/>

## 安全文摘

### 首页

<Route author="kaiili" example="/secnews" path="/secnews" />

## 饿了么开放平台

### 商家开放平台公告

<Route author="phantomk" example="/eleme/open/announce" path="/eleme/open/announce"/>

### 饿百零售开放平台公告

<Route author="phantomk" example="/eleme/open-be/announce" path="/eleme/open-be/announce"/>

## 极客时间

### 专栏文章

<Route author="fengchang" example="/geektime/column/48" path="/geektime/column/:cid" :paramsDesc="['专栏 id, 可从[全部专栏](https://time.geekbang.org/paid-content)进入专栏介绍页, 在 URL 中找到']"/>
### 极客新闻

<Route author="zhangzhxb520" example="/geektime/news" path="/geektime/news"/>

> -   极客时间专栏需要付费订阅，RSS 仅做更新提醒，不含付费内容.
> -   极客新闻不需要付费，可通过 RSS 订阅.

## 技术头条

### 最新分享

<Route author="xyqfer" example="/blogread/newest" path="/blogread/newest"/>

## 掘金

### 分类

<Route author="DIYgod" example="/juejin/category/frontend" path="/juejin/category/:category" :paramsDesc="['分类名']">

| 后端      | 前端       | Android | iOS | 人工智能 | 开发工具    | 代码人生   | 阅读      |
| ------- | -------- | ------- | --- | ---- | ------- | ------ | ------- |
| backend | frontend | android | ios | ai   | freebie | career | article |

</Route>

### 标签

<Route author="isheng5" example="/juejin/tag/架构" path="/juejin/tag/:tag" :paramsDesc="['标签名, 可在标签 URL 中找到']"/>

### 热门

<Route author="moaix" example="/juejin/trending/ios/monthly" path="/juejin/trending/:category/:type" :paramsDesc="['分类名', '类型']">

| category | 标签      |
| -------- | ------- |
| android  | Android |
| frontend | 前端      |
| ios      | iOS     |
| backend  | 后端      |
| design   | 设计      |
| product  | 产品      |
| freebie  | 工具资源    |
| article  | 阅读      |
| ai       | 人工智能    |
| devops   | 运维      |
| all      | 全部      |

| type       | 类型   |
| ---------- | ---- |
| weekly     | 本周最热 |
| monthly    | 本月最热 |
| historical | 历史最热 |

</Route>

### 小册

<Route author="xyqfer" example="/juejin/books" path="/juejin/books"/>

> 掘金小册需要付费订阅，RSS 仅做更新提醒，不含付费内容.

### 沸点

<Route author="xyqfer laampui" example="/juejin/pins/6824710202487472141" :paramsDesc="['默认为 recommend，见下表']" path="/juejin/pins/:type?">

| 推荐        | 热门  | 上班摸鱼                | 内推招聘                | 一图胜千言               | 今天学到了               | 每天一道算法题             | 开发工具推荐              | 树洞一下                |
| --------- | --- | ------------------- | ------------------- | ------------------- | ------------------- | ------------------- | ------------------- | ------------------- |
| recommend | hot | 6824710203301167112 | 6819970850532360206 | 6824710202487472141 | 6824710202562969614 | 6824710202378436621 | 6824710202000932877 | 6824710203112423437 |

</Route>

### 专栏

<Route author="Maecenas" example="/juejin/posts/3051900006845944" path="/juejin/posts/:id" :paramsDesc="['用户 id, 可在用户页 URL 中找到']" radar="1" rssbud="1"/>

### 收藏集

<Route author="isQ" example="/juejin/collections/1697301682482439" path="/juejin/collections/:userId" :paramsDesc="['用户唯一标志符, 在浏览器地址栏URL中能够找到']"/>

### 单个收藏夹

<Route author="isQ" example="/juejin/collection/6845243180586123271" path="/juejin/collection/:collectionId" :paramsDesc="['收藏夹唯一标志符, 在浏览器地址栏URL中能够找到']"/>

### 分享

<Route author="qiwihui" example="/juejin/shares/56852b2460b2a099cdc1d133" path="/juejin/shares/:userId" :paramsDesc="['用户 id, 可在用户页 URL 中找到']"/>

## 开源中国

### 资讯

<Route author="tgly307 zengxs" example="/oschina/news/project" path="/oschina/news/:category?" :paramsDesc="['板块名']">

| [综合资讯][osc_gen] | [软件更新资讯][osc_proj] | [行业资讯][osc_ind] | [编程语言资讯][osc_pl] |
| --------------- | ------------------ | --------------- | ---------------- |
| industry        | project            | industry-news   | programming      |

订阅[全部板块资讯][osc_all]可以使用 <https://rsshub.app/oschina/news>

[osc_all]: https://www.oschina.net/news "开源中国 - 全部资讯"

[osc_gen]: https://www.oschina.net/news/industry "开源中国 - 综合资讯"

[osc_proj]: https://www.oschina.net/news/project "开源中国 - 软件更新资讯"

[osc_ind]: https://www.oschina.net/news/industry-news "开源中国 - 行业资讯"

[osc_pl]: https://www.oschina.net/news/programming "开源中国 - 编程语言资讯"

</Route>

### 用户博客

<Route author="dxmpalb" example="/oschina/user/xxiaobian" path="/oschina/user/:id" :paramsDesc="['用户 id, 可通过查看用户博客网址得到，如果博客以 u/数字结尾，使用下一条路由']">

| 小小编辑      |
| --------- |
| xxiaobian |

</Route>

### 数字型账号用户博客

<Route author="dxmpalb" example="/oschina/u/3920392" path="/oschina/u/:id" :paramsDesc="['用户 id, 可通过查看用户博客网址得到，以 u/数字结尾，数字即为 id']">

| EAWorld 的博客 |
| ----------- |
| 3920392     |

</Route>

### 问答主题

<Route author="loveely7" example="/oschina/topic/weekly-news" path="/oschina/topic/:topic" :paramsDesc="['主题名, 可从[全部主题](https://www.oschina.net/question/topics)进入主题页, 在 URL 中找到']"/>

## 拉勾网

::: tip 提示

拉勾网官方提供职位的[邮件订阅](https://www.lagou.com/s/subscribe.html)，请根据自身需要选择使用。

:::

### 职位招聘

<Route author="hoilc" example="/lagou/jobs/JavaScript/上海" path="/lagou/jobs/:position/:city" :paramsDesc="['职位名，可以参考[拉勾网首页](https://www.lagou.com)的职位列表', '城市名，请参考[拉勾网支持的全部城市](https://www.lagou.com/jobs/allCity.html)']" anticrawler="1"/>

## 蓝桥云课

### 全站发布的课程

<Route author="huhuhang" example="/lanqiao/courses/latest/all" path="/lanqiao/courses/:sort/:tag"  :paramsDesc="['排序规则 sort, 默认(`default`)、最新(`latest`)、最热(`hotest`)', '课程标签 `tag`，可在该页面找到：https://www.lanqiao.cn/courses/']" radar="1" rssbud="1"/>

### 作者发布的课程

<Route author="huhuhang" example="/lanqiao/author/1701267" path="/lanqiao/author/:uid"  :paramsDesc="['作者 `uid` 可在作者主页 URL 中找到']" radar="1" rssbud="1"/>

### 技术社区

<Route author="huhuhang" example="/lanqiao/questions/2" path="/lanqiao/questions/:id" :paramsDesc="['topic_id 主题 `id` 可在社区板块 URL 中找到']" radar="1" rssbud="1"/>

## 洛谷

### 日报

<Route author="LogicJake prnake nczitzk" example="/luogu/daily" path="/luogu/daily/:id?" :paramsDesc="['年度日报所在帖子id，可在 URL 中找到，不填默认为2020年日报']"/>

### 近期比赛

<Route author="prnake" example="/luogu/contest" path="/luogu/contest"/>

### 用户动态

<Route author="solstice23" example="/luogu/user/feed/1" path="/luogu/user/feed/:uid" :paramsDesc="['用户 UID']"/>

## 码农俱乐部

### 话题

<Route author="mlogclub" example="/mlog-club/topics/newest" path="/mlog-club/topics/:node" :paramsDesc="['node']">

| node      | 名称   |
| --------- | ---- |
| newest    | 最新话题 |
| recommend | 热门话题 |
| 1         | 交流   |
| 2         | 开源   |
| 3         | 提问   |

</Route>

### 开源项目

<Route author="mlogclub" example="/mlog-club/projects" path="/mlog-club/projects" />

## 码农网

### 最新

<Route author="kt286" example="/codeceo/home" path="/codeceo/home"/>

### 分类

<Route author="kt286" example="/codeceo/category/java" path="/codeceo/category/:category?" :paramsDesc="['category']">

| category        | 名称          |
| --------------- | ----------- |
| news            | 资讯          |
| java            | JAVA 开发     |
| cpp             | C/C++ 开发    |
| donet           | .NET 开发     |
| web             | WEB 开发      |
| android         | Android 开发  |
| ios             | iOS 开发      |
| cloud           | 云计算 / 大数据   |
| os              | 操作系统        |
| database        | 数据库         |
| machine         | 机器学习 / 人工智能 |
| algorithm       | 算法设计        |
| design-patterns | 设计模式        |
| programmer      | 程序员人生       |
| weekly          | 《快乐码农》      |
| project         | 开源软件        |

</Route>

### 标签

<Route author="kt286" example="/codeceo/tag/node.js" path="/codeceo/tag/:category?" :paramsDesc="['tag']">

| tag        | 名称         |
| ---------- | ---------- |
| java       | java       |
| javascript | javascript |
| php        | php        |
| ios        | ios        |
| android    | android    |
| html5      | html5      |
| css3       | css3       |
| linux      | linux      |
| c          | c++        |
| python     | python     |
| csharp     | c#         |
| nodejs     | nodejs     |

</Route>

## 码农周刊

### issues

<Route author="tonghs" example="/manong-weekly" path="/manong-weekly" />

## 美团开放平台

### 美团开放平台公告

<Route author="youzipi" example="/meituan/open/announce" path="/meituan/open/announce"/>

## 平安银河实验室

### posts

<Route author="hellodword" example="/galaxylab" path="/galaxylab">
</Route>

## 前端艺术家 && 飞冰早报

### 列表

<Route author="kouchao" example="/jskou/0" path="/jskou/:type?" :paramsDesc="['分类']">

| 前端艺术家 | 飞冰早报 |
| ----- | ---- |
| 0     | 1    |

</Route>

## 日报 | D2 资源库

### 日报 | D2 资源库

<Route author="Andiedie" example="/d2/daily" path="/d2/daily"/>

## 顺丰

### 顺丰丰桥开放平台公告

<Route author="phantomk" example="/sf/sffq-announce" path="/sf/sffq-announce"/>

## 腾讯大数据

<Route author="nczitzk" example="/tencent/bigdata" path="/tencent/bigdata"/>

## 腾讯游戏开发者社区

::: warning 注意

有部分输出全文带有未进行样式处理的代码内容，显示效果不佳，建议跳转原文阅读

:::

### 分类

<Route author="xyqfer" example="/gameinstitute/community/hot" path="/gameinstitute/community/:tag?" :paramsDesc="['标签名称，默认为热门']">

| 热门  | 策划   | 程序      | 技术前沿 | 音频    | 项目管理    | 游戏运营    | 游戏测试 |
| --- | ---- | ------- | ---- | ----- | ------- | ------- | ---- |
| hot | plan | program | tech | audio | project | yunying | test |

</Route>

## 微信开放平台

### 微信开放社区 - 小程序公告

<Route author="phantomk" example="/wechat-open/community/xcx-announce" path="/wechat-open/community/xcx-announce"/>

### 微信开放社区 - 小游戏公告

<Route author="phantomk" example="/wechat-open/community/xyx-announce" path="/wechat-open/community/xyx-announce"/>

### 微信开放社区 - 微信支付公告

<Route author="phantomk" example="/wechat-open/community/pay-announce" path="/wechat-open/community/pay-announce"/>

### 微信开放社区 - 小游戏问答

<Route author="bestony" example="/wechat-open/community/xyx-question/0" path="/wechat-open/community/xyx-question/:category" :paramsDesc="['0','hot','topic']">

| 全部 | 游戏引擎 | 规则   | 账号    | 运营   | 游戏审核 | API 和组件 | 框架 | 管理后台 | 开发者工具 | 客户端 | 插件  | 云开发  | 教程反馈 | 其他 |
| -- | ---- | ---- | ----- | ---- | ---- | ------- | -- | ---- | ----- | --- | --- | ---- | ---- | -- |
| 0  | 4096 | 8192 | 16384 | 2048 | 1    | 2       | 64 | 4    | 8     | 16  | 256 | 1024 | 128  | 32 |

</Route>

### 微信开放社区 - 小程序问答

<Route author="bestony" example="/wechat-open/community/xcx-question/new" path="/wechat-open/community/xcx-question/:tag" :paramsDesc="['new','hot','topic']">

| 最新  | 最热  | 热门话题  |
| --- | --- | ----- |
| new | hot | topic |

</Route>

### 微信支付 - 商户平台公告

<Route author="phantomk" example="/wechat-open/pay/announce" path="/wechat-open/pay/announce"/>

## 微信小程序

### 基础库更新日志

<Route author="magicLaLa nczitzk" example="/weixin/miniprogram/framework" path="/weixin/miniprogram/framework"/>

### 开发者工具更新日志

<Route author="nczitzk" example="/weixin/miniprogram/devtools" path="/weixin/miniprogram/devtools"/>

### 云开发更新日志

<Route author="nczitzk" example="/weixin/miniprogram/wxcloud/cloud-sdk" path="/weixin/miniprogram/wxcloud/:caty?" :paramsDesc="['日志分类']">

| 小程序基础库更新日志（云开发部分） | IDE 云开发 & 云控制台更新日志 | wx-server-sdk 更新日志 |
| ----------------- | ------------------ | ------------------ |
| cloud-sdk         | ide                | server-sdk         |

</Route>

## 印记中文周刊

### 最新一期

<Route author="daijinru" example="/docschina/jsweekly" path="/docschina/jsweekly"/>

## 知晓程序

### 文章

<Route author="HenryQW" example="/miniapp/article/cloud" path="/miniapp/article/:category" :paramsDesc="['分类名称']">

| 全部  | 小程序资讯 | 知晓云   | 小程序推荐          | 榜单   | 晓组织   | 新能力        | 小程序问答 |
| --- | ----- | ----- | -------------- | ---- | ----- | ---------- | ----- |
| all | news  | cloud | recommendation | rank | group | capability | qa    |

</Route>

### 小程序商店 - 最新

<Route author="xyqfer" example="/miniapp/store/newest" path="/miniapp/store/newest"/>

## 众成翻译

### 首页

<Route author="SirM2z" example="/zcfy" path="/zcfy/index"/>

### 热门

<Route author="SirM2z" example="/zcfy/hot" path="/zcfy/hot"/>
