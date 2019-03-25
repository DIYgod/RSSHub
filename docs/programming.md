# 编程

## 掘金

<Route name="分类" author="DIYgod" example="/juejin/category/frontend" path="/juejin/category/:category" :paramsDesc="['分类名']">

| 前端     | Android | iOS | 后端    | 设计   | 产品    | 工具资源 | 阅读    | 人工智能 |
| -------- | ------- | --- | ------- | ------ | ------- | -------- | ------- | -------- |
| frontend | android | ios | backend | design | product | freebie  | article | ai       |

</Route>

<Route name="标签" author="isheng5" example="/juejin/tag/架构" path="/juejin/tag/:tag" :paramsDesc="['标签名, 可在标签 URL 中找到']"/>

<Route name="热门" author="moaix" example="/juejin/trending/ios/monthly" path="/juejin/trending/:category/:type" :paramsDesc="['分类名', '类型']">

| category | 标签     |
| -------- | -------- |
| android  | Android  |
| frontend | 前端     |
| ios      | iOS      |
| backend  | 后端     |
| design   | 设计     |
| product  | 产品     |
| freebie  | 工具资源 |
| article  | 阅读     |
| ai       | 人工智能 |
| devops   | 运维     |
| all      | 全部     |

| type       | 类型     |
| ---------- | -------- |
| weekly     | 本周最热 |
| monthly    | 本月最热 |
| historical | 历史最热 |

</Route>

<Route name="小册" author="xyqfer" example="/juejin/books" path="/juejin/books"/>

> 掘金小册需要付费订阅, RSS 仅做更新提醒, 不含付费内容.

<Route name="沸点" author="xyqfer" example="/juejin/pins" path="/juejin/pins"/>

<Route name="专栏" author="Maecenas" example="/juejin/posts/56852b2460b2a099cdc1d133" path="/juejin/posts/:id" :paramsDesc="['用户 id, 可在用户页 URL 中找到']"/>

## Dockone

<Route name="周报" author="csi0n" example="/dockone/weekly" path="/dockone/weekly"/>

## 开发者头条

<Route name="今天头条" author="jjeejj" example="/toutiao/today" path="/toutiao/today"/>

<Route name="独家号" author="jjeejj" example="/toutiao/user/140544" path="/toutiao/user/:id" :paramsDesc="['独家号 id, 可在对应独家号页 URL 中找到']"/>

## 众成翻译

<Route name="首页" author="SirM2z" example="/zcfy" path="/zcfy/index"/>

<Route name="热门" author="SirM2z" example="/zcfy/hot" path="/zcfy/hot"/>

## V2EX

<Route name="最热/最新主题" author="WhiteWorld" example="/v2ex/topics/latest" path="/v2ex/topics/:type" :paramsDesc="['hot 或 latest']"/>

## GitHub

::: tip 提示

GitHub 官方也提供了一些 RSS:

-   仓库 releases: https://github.com/:owner/:repo/releases.atom
-   仓库 commits: https://github.com/:owner/:repo/commits.atom
-   用户动态: https://github.com/:user.atom
-   专属动态: https://github.com/:user.private.atom?token=:secret (登录后在[仪表盘页面](https://github.com)找到 **Subscribe to your news feed** 字样即可)

:::

<Route name="用户仓库" author="DIYgod" example="/github/repos/DIYgod" path="/github/repos/:user" :paramsDesc="['用户名']"/>

<Route name="Trending" author="DIYgod" example="/github/trending/daily/javascript" path="/github/trending/:since/:language?" :paramsDesc="['时间跨度, 可在 [Trending 页](https://github.com/trending/javascript?since=monthly) URL 中找到, 可选 daily weekly monthly', '语言, 可在 [Trending 页](https://github.com/trending/javascript?since=monthly) URL 中找到']"/>

<Route name="仓库 Issue" author="HenryQW" example="/github/issue/DIYgod/RSSHub" path="/github/issue/:user/:repo" :paramsDesc="['用户名', '仓库名']"/>

<Route name="仓库 Pull Requests" author="hashman" example="/github/pull/DIYgod/RSSHub" path="/github/pull/:user/:repo" :paramsDesc="['用户名', '仓库名']"/>

<Route name="用户" author="HenryQW" example="/github/user/followers/HenryQW" path="/github/user/followers/:user" :paramsDesc="['用户名']"/>

<Route name="仓库 Stars" author="HenryQW" example="/github/stars/DIYgod/RSSHub" path="/github/stars/:user/:repo" :paramsDesc="['用户名', '仓库名']"/>

<Route name="搜索结果" author="LogicJake" example="/github/search/RSSHub/bestmatch/desc" path="/github/search/:query/:sort?/:order?" :paramsDesc="['搜索关键词', '排序选项（默认为bestmatch）','排序顺序，desc和asc（默认desc降序）']"/>

| 排序选项           | sort      |
| ------------------ | --------- |
| 最佳匹配           | bestmatch |
| 根据 star 数量排序 | stars     |
| 根据 fork 数量排序 | forks     |
| 根据更新时间排序   | updated   |

## 开源中国

<Route name="资讯" author="tgly307" example="/oschina/news" path="/oschina/news"/>
<Route name="用户博客" author="dxmpalb" example="/oschina/user/xxiaobian" path="/oschina/user/:id" :paramsDesc="['用户 id, 可通过查看用户博客网址得到，如果博客以 u/数字结尾，使用下一条路由']">

| 小小编辑  |
| --------- |
| xxiaobian |

</Route>
<Route name="数字型账号用户博客" author="dxmpalb" example="/oschina/u/3920392" path="/oschina/u/:id" :paramsDesc="['用户 id, 可通过查看用户博客网址得到，以 u/数字结尾，数字即为 id']">

| EAWorld 的博客 |
| -------------- |
| 3920392        |

</Route>

## GitLab

<Route name="Explore" author="imlonghao" example="/gitlab/explore/trending" path="/gitlab/explore/:type" :paramsDesc="['分类']">

| Trending | Most stars | All |
| -------- | ---------- | --- |
| trending | starred    | all |

</Route>

## 极客时间

<Route name="专栏文章" author="fengchang" example="/geektime/column/48" path="/geektime/column/:cid" :paramsDesc="['专栏 id, 可从[全部专栏](https://time.geekbang.org/paid-content)进入专栏介绍页, 在 URL 中找到']"/>

> 极客时间专栏需要付费订阅, RSS 仅做更新提醒, 不含付费内容.

## 安全客

::: tip 提示

官方提供了混合的主页资讯 RSS: https://api.anquanke.com/data/v1/rss

:::

<Route name="最新漏洞列表" author="qwertyuiop6" example="/aqk/vul" path="/aqk/vul"/>

<Route name="分类订阅" author="qwertyuiop6" example="/aqk/week" path="/aqk/:category" :paramsDesc="['分类订阅']">

| 360 网络安全周报 | 活动     | 知识      | 资讯 | 招聘 |
| ---------------- | -------- | --------- | ---- | ---- |
| week             | activity | knowledge | news | job  |

</Route>

## LinkedKeeper

<Route name="博文" author="imlonghao" example="/linkedkeeper/sub/1" path="/linkedkeeper/:type/:id?" :paramsDesc="['博文分类, 为 URL 中 `.action` 的文件名', '分区或标签的 ID, 对应 URL 中的 `sid` 或 `tid`']"/>

## 看雪

<Route name="论坛" author="renzhexigua" example="/pediy/topic/android/digest" path="/pediy/topic/:category?/:type?" :paramsDesc="['版块, 缺省为`all`', '类型, 缺省为`latest`']"/>

| 版块         | category   |
| ------------ | ---------- |
| 智能设备     | iot        |
| 区块链安全   | blockchain |
| Android 安全 | android    |
| iOS 安全     | ios        |
| 软件逆向     | re         |
| 编程技术     | coding     |
| 加壳脱壳     | unpack     |
| 密码算法     | crypto     |
| 二进制漏洞   | vuln       |
| CrackMe      | crackme    |
| Pwn          | pwn        |
| WEB 安全     | web        |
| 全站         | all        |

| 类型     | type   |
| -------- | ------ |
| 最新主题 | latest |
| 精华主题 | digest |

## 腾讯游戏开发者社区

::: warning 注意

有部分输出全文带有未进行样式处理的代码内容，显示效果不佳，建议跳转原文阅读

:::

<Route name="分类" author="xyqfer" example="/gameinstitute/community/hot" path="/gameinstitute/community/:tag?" :paramsDesc="['标签名称，默认为热门']">

| 热门 | 策划 | 程序    | 技术前沿 | 音频  | 项目管理 | 游戏运营 | 游戏测试 |
| ---- | ---- | ------- | -------- | ----- | -------- | -------- | -------- |
| hot  | plan | program | tech     | audio | project  | yunying  | test     |

</Route>

## 知晓程序

<Route name="文章" author="HenryQW" example="/miniapp/article/cloud" path="/miniapp/article/:category" :paramsDesc="['分类名称']">

| 全部 | 小程序资讯 | 知晓云 | 小程序推荐     | 榜单 | 晓组织 | 新能力     | 小程序问答 |
| ---- | ---------- | ------ | -------------- | ---- | ------ | ---------- | ---------- |
| all  | news       | cloud  | recommendation | rank | group  | capability | qa         |

</Route>

<Route name="小程序商店-最新" author="xyqfer" example="/miniapp/store/newest" path="/miniapp/store/newest"/>

## 技术头条

<Route name="最新分享" author="xyqfer" example="/blogread/newest" path="/blogread/newest"/>

## GitChat

<Route name="最新" author="xyqfer" example="/gitchat/newest" path="/gitchat/newest"/>

> GitChat 需要付费订阅, RSS 仅做更新提醒, 不含付费内容.

## Gitea

<Route name="博客" author="cnzgray" example="/gitea/blog" path="/gitea/blog">

> gitea 博客一般发布最新的 release 信息，路由选择用 blog 名称主要因为其地址名为 blog，而非 changlog，慎重起见还是用 blog 命名。

</Route>

## TesterHome

<Route name="最新发布" author="xyqfer" example="/testerhome/newest" path="/testerhome/newest"/>

## Linux Patchwork

<Route name="Patch Comments" author="ysc3839" example="/patchwork.kernel.org/comments/10723629" path="/patchwork.kernel.org/comments/:id" :paramsDesc="['Patch ID']"/>

## LeetCode

<Route name="文章" author="LogicJake" example="/leetcode/articles" path="/leetcode/articles"/>

## segmentfault

<Route name="频道" author="LogicJake" example="/segmentfault/channel/frontend" path="/segmentfault/channel/:name" :paramsDesc="['频道名称，在频道 URL 可以找到']"/>

## 牛客网

<Route name="讨论区" author="LogicJake" example="/nowcoder/discuss/2/4" path="/nowcoder/discuss/:type/:order" :paramsDesc="['讨论区分区id 在 URL 中可以找到', '排序方式']">

| 最新回复 | 最新发表 | 最新 | 精华 |
| -------- | -------- | ---- | ---- |
| 0        | 3        | 1    | 4    |

</Route>
