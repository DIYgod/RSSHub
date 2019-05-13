---
pageClass: routes
---

# 编程

## Dockone

### 周报

<Route author="csi0n" example="/dockone/weekly" path="/dockone/weekly"/>

## GitChat

### 最新

<Route author="xyqfer" example="/gitchat/newest" path="/gitchat/newest"/>

> GitChat 需要付费订阅, RSS 仅做更新提醒, 不含付费内容.

## Gitea

### 博客

<Route author="cnzgray" example="/gitea/blog" path="/gitea/blog">

> gitea 博客一般发布最新的 release 信息，路由选择用 blog 名称主要因为其地址名为 blog，而非 changlog，慎重起见还是用 blog 命名。

</Route>

## GitHub

::: tip 提示

GitHub 官方也提供了一些 RSS:

-   仓库 releases: https://github.com/:owner/:repo/releases.atom
-   仓库 commits: https://github.com/:owner/:repo/commits.atom
-   用户动态: https://github.com/:user.atom
-   专属动态: https://github.com/:user.private.atom?token=:secret (登录后在[仪表盘页面](https://github.com)找到 **Subscribe to your news feed** 字样即可)

:::

### 用户仓库

<Route author="DIYgod" example="/github/repos/DIYgod" path="/github/repos/:user" :paramsDesc="['用户名']"/>

### Trending

<Route author="DIYgod" example="/github/trending/daily/javascript" path="/github/trending/:since/:language?" :paramsDesc="['时间跨度, 可在 [Trending 页](https://github.com/trending/javascript?since=monthly) URL 中找到, 可选 daily weekly monthly', '语言, 可在 [Trending 页](https://github.com/trending/javascript?since=monthly) URL 中找到']"/>

### 仓库 Issue

<Route author="HenryQW" example="/github/issue/DIYgod/RSSHub" path="/github/issue/:user/:repo" :paramsDesc="['用户名', '仓库名']"/>

### 仓库 Pull Requests

<Route author="hashman" example="/github/pull/DIYgod/RSSHub" path="/github/pull/:user/:repo" :paramsDesc="['用户名', '仓库名']"/>

### 用户

<Route author="HenryQW" example="/github/user/followers/HenryQW" path="/github/user/followers/:user" :paramsDesc="['用户名']"/>

### 仓库 Stars

<Route author="HenryQW" example="/github/stars/DIYgod/RSSHub" path="/github/stars/:user/:repo" :paramsDesc="['用户名', '仓库名']"/>

### 仓库 Branches

<Route author="max-arnold" example="/github/branches/DIYgod/RSSHub" path="/github/branches/:user/:repo" :paramsDesc="['用户名', '仓库名']"/>

### 文件 Commits

<Route author="zengxs" example="/github/file/DIYgod/RSSHub/master/lib/router.js" path="/github/file/:user/:repo/:branch/:filepath+" :paramsDesc="['用户名', '仓库名', '分支名', '文件路径']">

| 用户名   | 仓库名   | 分支名   | 文件路径        |
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

| 排序选项           | sort      |
| ------------------ | --------- |
| 最佳匹配           | bestmatch |
| 根据 star 数量排序 | stars     |
| 根据 fork 数量排序 | forks     |
| 根据更新时间排序   | updated   |

## GitLab

### Explore

<Route author="imlonghao" example="/gitlab/explore/trending" path="/gitlab/explore/:type" :paramsDesc="['分类']">

| Trending | Most stars | All |
| -------- | ---------- | --- |
| trending | starred    | all |

</Route>

## LeetCode

### 文章

<Route author="LogicJake" example="/leetcode/articles" path="/leetcode/articles"/>

## LinkedKeeper

### 博文

<Route author="imlonghao" example="/linkedkeeper/sub/1" path="/linkedkeeper/:type/:id?" :paramsDesc="['博文分类, 为 URL 中 `.action` 的文件名', '分区或标签的 ID, 对应 URL 中的 `sid` 或 `tid`']"/>

## Linux Patchwork

### Patch Comments

<Route author="ysc3839" example="/patchwork.kernel.org/comments/10723629" path="/patchwork.kernel.org/comments/:id" :paramsDesc="['Patch ID']"/>

## segmentfault

### 频道

<Route author="LogicJake" example="/segmentfault/channel/frontend" path="/segmentfault/channel/:name" :paramsDesc="['频道名称，在频道 URL 可以找到']"/>

## TesterHome

### 最新发布

<Route author="xyqfer" example="/testerhome/newest" path="/testerhome/newest"/>

## V2EX

### 最热/最新主题

<Route author="WhiteWorld" example="/v2ex/topics/latest" path="/v2ex/topics/:type" :paramsDesc="['hot 或 latest']"/>

## 安全客

::: tip 提示

官方提供了混合的主页资讯 RSS: https://api.anquanke.com/data/v1/rss

:::

### 最新漏洞列表

<Route author="qwertyuiop6" example="/aqk/vul" path="/aqk/vul"/>

### 分类订阅

<Route author="qwertyuiop6" example="/aqk/week" path="/aqk/:category" :paramsDesc="['分类订阅']">

| 360 网络安全周报 | 活动     | 知识      | 资讯 | 招聘 |
| ---------------- | -------- | --------- | ---- | ---- |
| week             | activity | knowledge | news | job  |

</Route>

## 极客时间

### 专栏文章

<Route author="fengchang" example="/geektime/column/48" path="/geektime/column/:cid" :paramsDesc="['专栏 id, 可从[全部专栏](https://time.geekbang.org/paid-content)进入专栏介绍页, 在 URL 中找到']"/>
### 极客新闻

<Route author="zhangzhxb520" example="/geektime/news" path="/geektime/news"/>

> -   极客时间专栏需要付费订阅, RSS 仅做更新提醒, 不含付费内容.
> -   极客新闻不需要付费,可通过 RSS 订阅.

## 技术头条

### 最新分享

<Route author="xyqfer" example="/blogread/newest" path="/blogread/newest"/>

## 掘金

### 分类

<Route author="DIYgod" example="/juejin/category/frontend" path="/juejin/category/:category" :paramsDesc="['分类名']">

| 前端     | Android | iOS | 后端    | 设计   | 产品    | 工具资源 | 阅读    | 人工智能 |
| -------- | ------- | --- | ------- | ------ | ------- | -------- | ------- | -------- |
| frontend | android | ios | backend | design | product | freebie  | article | ai       |

</Route>

### 标签

<Route author="isheng5" example="/juejin/tag/架构" path="/juejin/tag/:tag" :paramsDesc="['标签名, 可在标签 URL 中找到']"/>

### 热门

<Route author="moaix" example="/juejin/trending/ios/monthly" path="/juejin/trending/:category/:type" :paramsDesc="['分类名', '类型']">

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

### 小册

<Route author="xyqfer" example="/juejin/books" path="/juejin/books"/>

> 掘金小册需要付费订阅, RSS 仅做更新提醒, 不含付费内容.

### 沸点

<Route author="xyqfer" example="/juejin/pins" path="/juejin/pins"/>

### 专栏

<Route author="Maecenas" example="/juejin/posts/56852b2460b2a099cdc1d133" path="/juejin/posts/:id" :paramsDesc="['用户 id, 可在用户页 URL 中找到']"/>

### 收藏集

<Route author="isQ" example="/juejin/collections/5791879979bc440066171bdb" path="/juejin/collections/:userId" :paramsDesc="['用户唯一标志符, 在浏览器地址栏URL中能够找到']"/>

### 单个收藏夹

<Route author="isQ" example="/juejin/collection/5cbf079df265da03462270f9" path="/juejin/collection/:collectionId" :paramsDesc="['收藏夹唯一标志符, 在浏览器地址栏URL中能够找到']"/>

### 分享

<Route author="qiwihui" example="/juejin/shares/56852b2460b2a099cdc1d133" path="/juejin/shares/:userId" :paramsDesc="['用户 id, 可在用户页 URL 中找到']"/>

## 开发者头条

### 今天头条

<Route author="jjeejj" example="/toutiao/today" path="/toutiao/today"/>

### 独家号

<Route author="jjeejj" example="/toutiao/user/140544" path="/toutiao/user/:id" :paramsDesc="['独家号 id, 可在对应独家号页 URL 中找到']"/>

## 开源中国

### 资讯

<Route author="tgly307 zengxs" example="/oschina/news/project" path="/oschina/news/:category?" :paramsDesc="['板块名']">

| [综合资讯][osc_gen] | [软件更新资讯][osc_proj] | [行业资讯][osc_ind] | [编程语言资讯][osc_pl] |
| ------------------- | ------------------------ | ------------------- | ---------------------- |
| industry            | project                  | industry-news       | programming            |

订阅[全部板块资讯][osc_all]可以使用 <https://rsshub.app/oschina/news>

[osc_all]: https://www.oschina.net/news '开源中国-全部资讯'
[osc_gen]: https://www.oschina.net/news/industry '开源中国-综合资讯'
[osc_proj]: https://www.oschina.net/news/project '开源中国-软件更新资讯'
[osc_ind]: https://www.oschina.net/news/industry-news '开源中国-行业资讯'
[osc_pl]: https://www.oschina.net/news/programming '开源中国-编程语言资讯'

</Route>

### 用户博客

<Route author="dxmpalb" example="/oschina/user/xxiaobian" path="/oschina/user/:id" :paramsDesc="['用户 id, 可通过查看用户博客网址得到，如果博客以 u/数字结尾，使用下一条路由']">

| 小小编辑  |
| --------- |
| xxiaobian |

</Route>
### 数字型账号用户博客

<Route author="dxmpalb" example="/oschina/u/3920392" path="/oschina/u/:id" :paramsDesc="['用户 id, 可通过查看用户博客网址得到，以 u/数字结尾，数字即为 id']">

| EAWorld 的博客 |
| -------------- |
| 3920392        |

</Route>

## 看雪

### 论坛

<Route author="renzhexigua" example="/pediy/topic/android/digest" path="/pediy/topic/:category?/:type?" :paramsDesc="['版块, 缺省为`all`', '类型, 缺省为`latest`']"/>

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

## 牛客网

### 讨论区

<Route author="LogicJake" example="/nowcoder/discuss/2/4" path="/nowcoder/discuss/:type/:order" :paramsDesc="['讨论区分区id 在 URL 中可以找到', '排序方式']">

| 最新回复 | 最新发表 | 最新 | 精华 |
| -------- | -------- | ---- | ---- |
| 0        | 3        | 1    | 4    |

</Route>

## 腾讯游戏开发者社区

::: warning 注意

有部分输出全文带有未进行样式处理的代码内容，显示效果不佳，建议跳转原文阅读

:::

### 分类

<Route author="xyqfer" example="/gameinstitute/community/hot" path="/gameinstitute/community/:tag?" :paramsDesc="['标签名称，默认为热门']">

| 热门 | 策划 | 程序    | 技术前沿 | 音频  | 项目管理 | 游戏运营 | 游戏测试 |
| ---- | ---- | ------- | -------- | ----- | -------- | -------- | -------- |
| hot  | plan | program | tech     | audio | project  | yunying  | test     |

</Route>

## 知晓程序

### 文章

<Route author="HenryQW" example="/miniapp/article/cloud" path="/miniapp/article/:category" :paramsDesc="['分类名称']">

| 全部 | 小程序资讯 | 知晓云 | 小程序推荐     | 榜单 | 晓组织 | 新能力     | 小程序问答 |
| ---- | ---------- | ------ | -------------- | ---- | ------ | ---------- | ---------- |
| all  | news       | cloud  | recommendation | rank | group  | capability | qa         |

</Route>

### 小程序商店-最新

<Route author="xyqfer" example="/miniapp/store/newest" path="/miniapp/store/newest"/>

## 众成翻译

### 首页

<Route author="SirM2z" example="/zcfy" path="/zcfy/index"/>

### 热门

<Route author="SirM2z" example="/zcfy/hot" path="/zcfy/hot"/>
