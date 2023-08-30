# 💻 Programming

## A List Apart {#a-list-apart}

### Articles {#a-list-apart-articles}

<Route author="Rjnishant530" example="/alistapart" path="/alistapart" radar="1"/>

### Topics {#a-list-apart-topics}

<Route author="Rjnishant530" example="/alistapart/application-development" path="/alistapart/:topic" paramsDesc={['Any Topic or from the table below. Defaults to All Articles']} radar="1">

You have the option to utilize the main heading or use individual categories as topics for the path.

| **Code**                | _code_                  |
|-------------------------|-------------------------|
| **Application Development** | _application-development_ |
| **Browsers**             | _browsers_              |
| **CSS**                  | _css_                   |
| **HTML**                 | _html_                  |
| **JavaScript**           | _javascript_            |
| **The Server Side**      | _the-server-side_       |

| **Content**             | _content_               |
|-------------------------|-------------------------|
| **Community**           | _community_             |
| **Content Strategy**    | _content-strategy_      |
| **Writing**             | _writing_               |

| **Design**              | _design_                |
|-------------------------|-------------------------|
| **Brand Identity**      | _brand-identity_        |
| **Graphic Design**      | _graphic-design_        |
| **Layout & Grids**      | _layout-grids_          |
| **Mobile/Multidevice**  | _mobile-multidevice_    |
| **Responsive Design**   | _responsive-design_     |
| **Typography & Web Fonts** | _typography-web-fonts_ |

| **Industry & Business** | _industry-business_     |
|-------------------------|-------------------------|
| **Business**            | _business_              |
| **Career**              | _career_                |
| **Industry**            | _industry_              |
| **State of the Web**    | _state-of-the-web_      |

| **Process**             | _process_               |
|-------------------------|-------------------------|
| **Creativity**          | _creativity_            |
| **Project Management**  | _project-management_    |
| **Web Strategy**        | _web-strategy_          |
| **Workflow & Tools**    | _workflow-tools_        |

| **User Experience**     | _user-experience_       |
|-------------------------|-------------------------|
| **Accessibility**       | _accessibility_         |
| **Information Architecture** | _information-architecture_ |
| **Interaction Design**  | _interaction-design_    |
| **Usability**           | _usability_             |
| **User Research**       | _user-research_         |

</Route>

## ACM {#acm}

### A.M.Turing Award Winners {#acm-a.m.turing-award-winners}

<Route author="nczitzk" example="/acm/amturingaward" path="/acm/amturingaward"/>

## AI 研习社 {#ai-yan-xi-she}

### 首页 {#ai-yan-xi-she-shou-ye}

<Route author="kt286" example="/aiyanxishe/109/hot" path="/aiyanxishe/:id/:sort?" paramsDesc={['领域 id，全部领域为 `all`，单独领域 id 抓包可得','排序方式，默认为 `new`（最新），也可选择 `hot`（最热）或 `recommend`（推荐）']}/>

## AlgoCasts {#algocasts}

### 视频更新 {#algocasts-shi-pin-geng-xin}

<Route author="ImSingee" example="/algocasts" path="/algocasts" radar="1" rssbud="1">

> AlgoCasts 需要付费订阅，RSS 仅做更新提醒，不含付费内容.

</Route>

## AtCoder {#atcoder}

### Present Contests {#atcoder-present-contests}

<Route author="nczitzk" example="/atcoder/contest/en/upcoming" path="/atcoder/contest/:language?/:status?" paramsDesc={['Language, `jp` as Japanese or `en` as English, English by default', 'Status, see below, Recent Contests by default']}>

Status

| Active Contests | Upcoming Contests | Recent Contests |
| --------------- | ----------------- | --------------- |
| active          | upcoming          | recent          |

</Route>

### Contests Archive {#atcoder-contests-archive}

<Route author="nczitzk" example="/atcoder/contest" path="/atcoder/contest/:language?/:rated?/:category?/:keyword?" paramsDesc={['Language, `jp` as Japanese or `en` as English, English by default', 'Rated Range, see below, all by default', 'Category, see below, all by default', 'Keyword']}>

Rated Range

| ABC Class (Rated for ~1999) | ARC Class (Rated for ~2799) | AGC Class (Rated for ~9999) |
| --------------------------- | --------------------------- | --------------------------- |
| 1                           | 2                           | 3                           |

Category

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

### Posts {#atcoder-posts}

<Route author="nczitzk" example="/atcoder/post" path="/atcoder/post/:language?/:keyword?" paramsDesc={['Language, `jp` as Japanese or `en` as English, English by default', 'Keyword']}/>

## BBC News Labs {#bbc-news-labs}

### News {#bbc-news-labs-news}

<Route author="elxy" example="/bbcnewslabs/news" path="/bbcnewslabs/news"/>

## Bitbucket {#bitbucket}

### Commits {#bitbucket-commits}

<Route author="AuroraDysis" example="/bitbucket/commits/blaze-lib/blaze" path="/bitbucket/commits/:workspace/:repo_slug" paramsDesc={['Workspace', 'Repository']} radar="1" rssbud="1" />

### Tags {#bitbucket-tags}

<Route author="AuroraDysis" example="/bitbucket/tags/blaze-lib/blaze" path="/bitbucket/tags/:workspace/:repo_slug" paramsDesc={['Workspace', 'Repository']} radar="1" rssbud="1" />

## Bitmovin {#bitmovin}

### Blog {#bitmovin-blog}

<Route author="elxy" example="/bitmovin/blog" path="/bitmovin/blog"/>

## CNCF {#cncf}

### Category {#cncf-category}

<Route author="Fatpandac" example="/cncf" path="/cncf/:cate?" radar="1" rssbud="1" paramsDesc={['blog by default']}>

| Blog | News | Announcements | Reports |
|------|------|---------------|---------|
| blog | news | announcements | reports |

</Route>

## Codeforces {#codeforces}

### Latest contests {#codeforces-latest-contests}

<Route author="Fatpandac" example="/codeforces/contests" path="/codeforces/contests"/>

### Recent actions {#codeforces-recent-actions}

<Route author="ftiasch" example="/codeforces/recent-actions" path="/codeforces/recent-actions/:minrating?" paramsDesc={['The minimum blog/comment rating required. Default: 1']}/>

## cve.mitre.org {#cve.mitre.org}

### Search Result {#cve.mitre.org-search-result}

<Route author="fengkx" example="/cve/search/PostgreSQL" path="/cve/search/:keyword" paramsDesc={['keyword']} />

## dbaplus 社群 {#dbaplus-she-qun}

### 栏目 {#dbaplus-she-qun-lan-mu}

<Route author="nczitzk" example="/dbaplus" path="/dbaplus/:tab?" paramsDesc={['栏目，见下表，默认为全部']}>

| 全部 | 数据库 | 运维 | 大数据 | 架构 | PaaS 云 | 职场生涯 | 这里有毒 |
| ---- | ------ | ---- | ------ | ---- | ------- | -------- | -------- |
| All  | 153    | 134  | 73     | 141  | 72      | 149      | 21       |

</Route>

### 活动 {#dbaplus-she-qun-huo-dong}

<Route author="nczitzk" example="/dbaplus/activity" path="/dbaplus/activity/:type?" paramsDesc={['分类，见下表，默认为线上分享']}>

| 线上分享 | 线下峰会 |
| -------- | -------- |
| online   | offline  |

</Route>

## deeplearning.ai {#deeplearning.ai}

### TheBatch 周报 {#deeplearning.ai-thebatch-zhou-bao}

<Route author="nczitzk" example="/deeplearningai/thebatch" path="/deeplearningai/thebatch"/>

## Distill {#distill}

### Latest {#distill-latest}

<Route author="nczitzk" example="/distill" path="/distill"/>

## Dockone {#dockone}

### 周报 {#dockone-zhou-bao}

<Route author="csi0n" example="/dockone/weekly" path="/dockone/weekly"/>

## gihyo.jp {#gihyo.jp}

### Series {#gihyo.jp-series}

<Route author="masakichi" example="/gihyo/list/group/Ubuntu-Weekly-Recipe" path="/gihyo/list/group/:id" paramsDesc={['Series']}/>

## GitChat {#gitchat}

### 最新文章 {#gitchat-zui-xin-wen-zhang}

<Route author="hoilc" example="/gitchat/newest" path="/gitchat/newest/:category?/:selected?" paramsDesc={['分类 ID, 置空或`all`代表全部, 具体值需要抓取前端请求, 以下列出可能有变动, 仅供参考', '是否只显示严选文章, 任意值为是, 置空为否']} >

| 分类名   | 分类 ID                  |
| :------- | :----------------------- |
| 前端     | 58e84f875295227534aad506 |
| 后端     | 5d8b7c3786194a1921979122 |
| 移动开发 | 5d8b7c3786194a1921979123 |
| 运维     | 5901bd477b61a76bc4016423 |
| 测试     | 58e84f425295227534aad502 |
| 架构     | 58e84f6bad952d6b3428af9a |
| 人工智能 | 58e84f53ec8e9e7b34457809 |
| 职场     | 58e84f1584c651693437f27c |
| 互联网   | 5d8b7c3786194a1921979124 |

> GitChat 需要付费订阅，RSS 仅做更新提醒，不含付费内容.

</Route>

## Gitea {#gitea}

### 博客 {#gitea-bo-ke}

<Route author="cnzgray" example="/gitea/blog" path="/gitea/blog">

> gitea 博客一般发布最新的 release 信息，路由选择用 blog 名称主要因为其地址名为 blog，而非 changlog，慎重起见还是用 blog 命名。

</Route>

## Gitee {#gitee}

### 仓库 Releases {#gitee-cang-ku-releases}

<Route author="TonyRL" example="/gitee/releases/y_project/RuoYi" path="/gitee/releases/:owner/:repo" paramsDesc={['用户名', '仓库名']} radar="1" rssbud="1"/>

### 仓库提交 {#gitee-cang-ku-ti-jiao}

<Route author="TonyRL" example="/gitee/commits/y_project/RuoYi" path="/gitee/commits/:owner/:repo" paramsDesc={['用户名', '仓库名']} radar="1" rssbud="1"/>

### 用户公开动态 {#gitee-yong-hu-gong-kai-dong-tai}

<Route author="TonyRL" example="/gitee/events/y_project" path="/gitee/events/:username" paramsDesc={['用户名']} radar="1" rssbud="1"/>

### 仓库动态 {#gitee-cang-ku-dong-tai}

<Route author="TonyRL" example="/gitee/events/y_project/RuoYi" path="/gitee/events/:owner/:repo" paramsDesc={['用户名', '仓库名']} radar="1" rssbud="1"/>

## GitHub {#github}

:::tip

GitHub provides some official RSS feeds:

-   Repo releases: `https://github.com/:owner/:repo/releases.atom`
-   Repo commits: `https://github.com/:owner/:repo/commits.atom`
-   User activities: `https://github.com/:user.atom`
-   Private feed: `https://github.com/:user.private.atom?token=:secret` (You can find **Subscribe to your news feed** in [dashboard](https://github.com) page after login)
-   Wiki history: `https://github.com/:owner/:repo/wiki.atom`

:::

### User Repo {#github-user-repo}

<Route author="dragon-yuan" path="/github/repos/:user" example="/github/repos/DIYgod" paramsDesc={['GitHub username']} radar="1" rssbud="1"/>

### Trending {#github-trending}

<Route author="DIYgod" path="/github/trending/:since/:language/:spoken_language?" example="/github/trending/daily/javascript/en" paramsDesc={['time frame, available in [Trending page](https://github.com/trending/javascript?since=monthly) \'s URL, possible values are: `daily`, `weekly` or `monthly`', 'the feed language, available in [Trending page](https://github.com/trending/javascript?since=monthly) \'s URL, don\'t filter option is `any`', 'natural language, available in [Trending page](https://github.com/trending/javascript?since=monthly) \'s URL']} radar="1" rssbud="1" selfhost="1"/>

### Topics {#github-topics}

<Route author="queensferryme" example="/github/topics/framework" path="/github/topics/:name/:qs?" paramsDesc={['Topic name, which can be found in the URL of the corresponding [Topics Page](https://github.com/topics/framework)', 'Query string, like `l=php&o=desc&s=stars`. Details listed as follows:']} radar="1" rssbud="1">

| Parameter | Description      | Values                                                                                                                          |
| --------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `l`       | Language         | For instance `php`, which can be found in the URL of the corresponding [Topics page](https://github.com/topics/framework?l=php) |
| `o`       | Sorting Order    | `asc`, `desc`                                                                                                                   |
| `s`       | Sorting Criteria | `stars`, `forks`, `updated`                                                                                                     |

For instance, the `/github/topics/framework/l=php&o=desc&s=stars` route will generate the RSS feed corresponding to this [page](https://github.com/topics/framework?l=php&o=desc&s=stars).

</Route>

### Repo Issues {#github-repo-issues}

<Route author="HenryQW AndreyMZ" path="/github/issue/:user/:repo/:state?/:labels?" example="/github/issue/DIYgod/RSSHub/all/RSS%20proposal" paramsDesc={['GitHub username', 'GitHub repo name', 'the state of the issues. Can be either `open`, `closed`, or `all`. Default: `open`.', 'a list of comma separated label names']} radar="1" rssbud="1"/>

### Repo Pull Requests {#github-repo-pull-requests}

<Route author="hashman TonyRL" example="/github/pull/DIYgod/RSSHub" path="/github/pull/:user/:repo/:state?/:labels?" paramsDesc={['User name', 'Repo name', 'the state of pull requests. Can be either `open`, `closed`, or `all`. Default: `open`.', 'a list of comma separated label names']} radar="1" rssbud="1"/>

### User Followers {#github-user-followers}

<Route author="HenryQW" path="/github/user/followers/:user" example="/github/user/followers/HenryQW" paramsDesc={['GitHub username']} radar="1" rssbud="1"/>

### Repo Stars {#github-repo-stars}

<Route author="HenryQW" path="/github/stars/:user/:repo" example="/github/stars/DIYGod/RSSHub" paramsDesc={['GitHub username', 'GitHub repo name']} radar="1" rssbud="1"/>

### Repo Branches {#github-repo-branches}

<Route author="max-arnold" example="/github/branches/DIYgod/RSSHub" path="/github/branches/:user/:repo" paramsDesc={['User name', 'Repo name']} radar="1" rssbud="1"/>

### Files Commits {#github-files-commits}

<Route author="zengxs" example="/github/file/DIYgod/RSSHub/master/lib/router.js" path="/github/file/:user/:repo/:branch/:filepath+" paramsDesc={['User name', 'Repo name', 'Branch name', 'File path']} radar="1" rssbud="1">

| User name | Repo name | Branch name | File path       |
| --------- | --------- | ----------- | --------------- |
| `DIYgod`  | `RSSHub`  | `master`    | `lib/router.js` |

> -   If there are special characters such as `/` in the **branch name**, they need to be encoded with urlencode, usually `/` needs to be replaced with `%2f`
> -   If there are special characters in the **file path**, you need to use urlencode to encode them, but the file path can be recognized normally `/` characters
> -   If the **file path** ends with `.rss`, `.atom`, `.json`, you need to replace the `.` in the suffix with `%2e`
>
> > Reeder will make an error when subscribing to `% 2erss` or similar suffixes. At this time, add`.rss` after the route to subscribe
> >
> > Such as: replace `https://rsshub.app/github/file/DIYgod/RSSHub/master/lib/router%2ejs` to `https://rsshub.app/github/file/DIYgod/RSSHub/master/lib/router%2ejs.rss`

</Route>

### Search Result {#github-search-result}

<Route author="LogicJake" example="/github/search/RSSHub/bestmatch/desc" path="/github/search/:query/:sort?/:order?" paramsDesc={['search keyword', 'Sort options (default to bestmatch)','Sort order, desc and asc (desc descending by default)']}>

| Sort options     | sort      |
| ---------------- | --------- |
| Best match       | bestmatch |
| Most stars       | stars     |
| Most forks       | forks     |
| Recently updated | updated   |

</Route>

### User Starred Repositories {#github-user-starred-repositories}

<Route author="LanceZhu" example="/github/starred_repos/DIYgod" path="/github/starred_repos/:user" paramsDesc={['User name']} radar="1" rssbud="1"/>

### Repo Contributors {#github-repo-contributors}

<Route author="zoenglinghou" example="/github/contributors/DIYgod/RSSHub" path="/github/contributors/:user/:repo/:order?/:anon?" paramsDesc={['User name','Repo name','Sort order by commit numbers, desc and asc (descending by default)','Show anonymous users. Defaults to no, use any values for yes.']} radar="1" rssbud="1"/>

### Issue / Pull Request comments {#github-issue-%2F-pull-request-comments}

<Route author="TonyRL FliegendeWurst" example="/github/comments/DIYgod/RSSHub/8116" path="/github/comments/:user/:repo/:number?" paramsDesc={['User / Org name', 'Repo name', 'Issue or pull number (if omitted: all)']} radar="1" rssbud="1"/>

### Wiki History {#github-wiki-history}

<Route author="TonyRL" example="/github/wiki/flutter/flutter/Roadmap" path="/github/wiki/:user/:repo/:page?" paramsDesc={['User / Org name', 'Repo name', 'Page slug, can be found in URL, empty means Home']} radar="1" rssbud="1"/>

### Notifications {#github-notifications}

<Route author="zhzy0077" example="/github/notifications" path="/github/notifications" radar="1" rssbud="1" selfhost="1"/>

### Gist Commits {#github-gist-commits}

<Route author="TonyRL" example="/github/gist/d2c152bb7179d07015f336b1a0582679" path="/github/gist/:gistId" paramsDesc={['Gist ID']} radar="1" rssbud="1"/>

## GitLab {#gitlab}

### Explore {#gitlab-explore}

<Route author="imlonghao zoenglinghou" example="/gitlab/explore/trending" path="/gitlab/explore/:type/:host?" paramsDesc={['type', 'Gitlab instance hostname, default to gitlab.com']}>

| Trending | Most stars | All |
| -------- | ---------- | --- |
| trending | starred    | all |

</Route>

### Releases {#gitlab-releases}

<Route author="zoenglinghou" example="/gitlab/release/pleroma/pleroma/git.pleroma.social" path="/gitlab/release/:namespace/:project/:host?" paramsDesc={['owner or namespace. `/` needs to be replaced with `%2F`', 'project name', 'Gitlab instance hostname, default to gitlab.com']} />

### Tags {#gitlab-tags}

<Route author="zoenglinghou" example="/gitlab/tag/rluna-open-source%2Ffile-management%2Fowncloud/core/gitlab.com" path="/gitlab/tag/:namespace/:project/:host?" paramsDesc={['owner or namespace. `/` needs to be replaced with `%2F`', 'project name', 'Gitlab instance hostname, default to gitlab.com']} />

## Gitpod {#gitpod}

### Blog {#gitpod-blog}

<Route author="TonyRL" example="/gitpod/blog" path="/gitpod/blog" />

### Changelog {#gitpod-changelog}

<Route author="TonyRL" example="/gitpod/changelog" path="/gitpod/changelog" />

## Go 语言中文网 {#go-yu-yan-zhong-wen-wang}

### 板块 {#go-yu-yan-zhong-wen-wang-ban-kuai}

<Route author="nczitzk" example="/studygolang/go/daily" path="/studygolang/go/:id?" paramsDesc={['板块 id，默认为周刊']} radar="1"/>

### 周刊 {#go-yu-yan-zhong-wen-wang-zhou-kan}

<Route author="Weilet nczitzk" example="/studygolang/weekly" path="/studygolang/weekly" radar="1"/>

### 招聘 {#go-yu-yan-zhong-wen-wang-zhao-pin}

<Route author="CcccFz nczitzk" example="/studygolang/jobs" path="/studygolang/jobs" radar="1" rssbud="1"/>

## GoCN {#gocn}

### 文章 {#gocn-wen-zhang}

<Route author="AtlanCI CcccFz" example="/gocn" path="/gocn" radar="1" rssbud="1"/>

### 招聘 {#gocn-zhao-pin}

<Route author="CcccFz" example="/gocn/jobs" path="/gocn/jobs" radar="1" rssbud="1"/>

## Hacker News {#hacker-news}

### Follow User {#hacker-news-follow-user}

Subscribe to the updates (threads and submission) from a paritcular Hacker News user

<Route author="cf020031308 nczitzk xie-dongping" example="/hackernews/threads/comments_list/dang" path="/hackernews/:section?/:type?/:user?" paramsDesc={['Section, see above, `index` by default', 'Link, see above, `sources` by default', 'User, only valid for section `threads` and `submitted`']} />

### 用户 {#hacker-news-yong-hu}

订阅特定用户的内容

<Route author="cf020031308 nczitzk xie-dongping" example="/hackernews/threads/comments_list/dang" path="/hackernews/:section?/:type?/:user?" paramsDesc={['内容分区，见上表，默认为 `index`', '链接类型，见上表，默认为 `sources`', '设定用户，只在 `threads` 和 `submitted` 分区有效']} />

## Hacking8 {#hacking8}

### 信息流 {#hacking8-xin-xi-liu}

<Route author="nczitzk" example="/hacking8" path="/hacking8/:category?" paramsDesc={['分类，见下表，默认为最近更新']}>

| 推荐  | 最近更新 | 漏洞 / PoC 监控 | PDF |
| ----- | -------- | --------------- | --- |
| likes | index    | vul-poc         | pdf |

</Route>

### 搜索 {#hacking8-sou-suo}

<Route author="nczitzk" example="/hacking8/search/+node%3Ahackernews.cc" path="/hacking8/search/:keyword?" paramsDesc={['关键字，默认为空']}/>

## HackMD {#hackmd}

### Profile {#hackmd-profile}

<Route author="Yukaii kaiix" example="/hackmd/profile/hackmd" path="/hackmd/profile/:path" paramsDesc={['userpath or teampath']} radar="1"/>

## HelloGitHub {#hellogithub}

### 热门 {#hellogithub-re-men}

<Route author="nczitzk" example="/hellogithub/hot" path="/hellogithub/hot/:id?" paramsDesc={['标签 id，可在对应标签页 URL 中找到，默认为全部标签']}>

以下为部分标签：

| id         | 标签     |
| ---------- | -------- |
| Z8PipJsHCX | Python   |
| YQHn0gERoi | C        |
| WTbsu5GAfC | CLI      |
| juBLV86qa5 | 机器学习 |
| D4JBAUo967 | Rust     |
| dFA60uKLgr | GUI      |
| 0LByh3tjUO | 教程     |
| 4lpGK0sUyk | Web 应用 |
| yrZkGsUC9M | C++      |
| mbP20HIEYD | Ruby     |

</Route>

### 最近 {#hellogithub-zui-jin}

<Route author="nczitzk" example="/hellogithub/last" path="/hellogithub/last/:id?" paramsDesc={['标签 id，可在对应标签页 URL 中找到，默认为全部标签']}>

部分标签见上表

</Route>

### 文章 {#hellogithub-wen-zhang}

<Route author="moke8 nczitzk" example="/hellogithub/article" path="/hellogithub/article/:sort?/:id?" paramsDesc={['排序方式，见下表，默认为 `hot`，即热门', '标签 id，可在对应标签页 URL 中找到，默认为全部标签']}>

| 热门 | 最近 |
| ---- | ---- |
| hot  | last |

</Route>

### 排行榜 {#hellogithub-pai-hang-bang}

<Route author="moke8 nczitzk" example="/hellogithub/report" path="/hellogithub/report/:type?" paramsDesc={['分类，见下表，默认为编程语言排行榜']}>

| 编程语言 | 服务器   | 数据库     |
| -------- | -------- | ---------- |
| tiobe    | netcraft | db-engines |

</Route>

### 月刊 {#hellogithub-yue-kan}

<Route author="moke8 nczitzk CaoMeiYouRen" example="/hellogithub/volume" path="/hellogithub/volume"/>

## Hex-Rays {#hex-rays}

### Hex-Rays News {#hex-rays-hex-rays-news}

<Route author="hellodword" example="/hex-rays/news" path="/hex-rays/news" />

## Huggingface {#huggingface}

### Daily Papers {#huggingface-daily-papers}

<Route author="zeyugao" example="/huggingface/daily-papers" path="/huggingface/daily-papers" />

## Issue Hunt {#issue-hunt}

### Project Funded {#issue-hunt-project-funded}

<Route author="running-grass" radar="1" example="/issuehunt/funded/DIYgod/RSSHub" path="/issuehunt/funded/:username/:repo" paramsDesc={['Github user/org','Repository name']} />

## ITSlide {#itslide}

### 最新 {#itslide-zui-xin}

<Route author="Yangshuqing" example="/itslide/new" path="/itslide/new" radar="1" rssbud="1"/>

## Kaggle {#kaggle}

### Discussion {#kaggle-discussion}

<Route author="LogicJake" example="/kaggle/discussion/387811/active" path="/kaggle/discussion/:forumId/:sort?" paramsDesc={['Forum ID, open web request, search forumId; fill in all to subscribe to the whole site discussion forum', 'See the table below for sorting methods, default to hot']}>

| hot     | recent          | new             | top        | active        |
| ------- | --------------- | --------------- | ---------- | ------------- |
| Hotness | Recent Comments | Recently Posted | Most Votes | Most Comments |

</Route>

### Competitions {#kaggle-competitions}

<Route author="LogicJake" example="/kaggle/competitions" path="/kaggle/competitions/:category?" paramsDesc={['category, default to all']}>

| 空             | featured | research | recruitment | gettingStarted  | masters | playground | analytics |
| -------------- | -------- | -------- | ----------- | --------------- | ------- | ---------- | --------- |
| All Categories | Featured | Research | Recruitment | Getting started | Masters | Playground | Analytics |

</Route>

### User Discussion {#kaggle-user-discussion}

<Route author="nczitzk" example="/kaggle/user/antgoldbloom" path="/kaggle/user/:user" paramsDesc={['用户名']}/>

## Layer3 {#layer3}

### Quest {#layer3-quest}

<Route author="nczitzk" example="/layer3/quests" path="/layer3/quests" radar="1"/>

## LeetCode {#leetcode}

### Articles {#leetcode-articles}

<Route author="LogicJake" example="/leetcode/articles" path="/leetcode/articles"/>

### Submission {#leetcode-submission}

<Route author="NathanDai" example="/leetcode/submission/us/nathandai" path="/leetcode/submission/:country/:user" paramsDesc={['country, Chines(cn) and US(us)', 'Username, available at the URL of the LeetCode user homepage']}/>

### Daily Question {#leetcode-daily-question}

<Route author="NavePnow" example="/leetcode/dailyquestion/en" path="/leetcode/dailyquestion/:lang" paramsDesc={['site, Chines(cn) and Engligh(en)']}/>

### Daily Question Solution {#leetcode-daily-question-solution}

<Route author="woaidouya123" example="/leetcode/dailyquestion/solution/en" path="/leetcode/dailyquestion/solution/:lang" paramsDesc={['site, Chines(cn) and Engligh(en)']}/>

## LinkedKeeper {#linkedkeeper}

### 博文 {#linkedkeeper-bo-wen}

<Route author="imlonghao" example="/linkedkeeper/sub/1" path="/linkedkeeper/:type/:id?" paramsDesc={['博文分类, 为 URL 中 `.action` 的文件名', '分区或标签的 ID, 对应 URL 中的 `sid` 或 `tid`']}/>

## Linux Patchwork {#linux-patchwork}

### Patch Comments {#linux-patchwork-patch-comments}

<Route author="ysc3839" example="/patchwork.kernel.org/comments/10723629" path="/patchwork.kernel.org/comments/:id" paramsDesc={['Patch ID']}/>

## LWN.net {#lwn.net}

### Security alerts {#lwn.net-security-alerts}

<Route author="zengxs" example="/lwn/alerts/CentOS" path="/lwn/alerts/:distributor" paramsDesc={['Distribution identification']}>

| Distribution     | Identification     |
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

</Route>

## ModelScope 魔搭社区 {#modelscope-mo-da-she-qu}

### 数据集 {#modelscope-mo-da-she-qu-shu-ju-ji}

<Route author="TonyRL" example="/modelscope/datasets" path="/modelscope/datasets" radar="1" />

### 模型库 {#modelscope-mo-da-she-qu-mo-xing-ku}

<Route author="TonyRL" example="/modelscope/models" path="/modelscope/models" radar="1" />

### 创空间 {#modelscope-mo-da-she-qu-chuang-kong-jian}

<Route author="TonyRL" example="/modelscope/studios" path="/modelscope/studios" radar="1" />

### DevPress 官方社区 {#modelscope-mo-da-she-qu-devpress-guan-fang-she-qu}

<Route author="TonyRL" example="/modelscope/community" path="/modelscope/community" radar="1" />

## MySQL {#mysql}

### Release Notes {#mysql-release-notes}

<Route author="nczitzk" example="/mysql/release/8.0" path="/mysql/release/:version?" paramsDesc={['Version, see below, 8.0 by default']}>

| 8.0 | 5.7 | 5.6 |
| --- | --- | --- |

</Route>

## Node.js {#node.js}

### News {#node.js-news}

<Route author="nczitzk" example="/nodejs/blog" path="/nodejs/blog/:language?" paramsDesc={['Language, see below, en by default']}>

| العربية | Catalan | Deutsch | Español | زبان فارسی |
| ------- | ------- | ------- | ------- | ---------- |
| ar      | ca      | de      | es      | fa         |

| Français | Galego | Italiano | 日本語 | 한국어 |
| -------- | ------ | -------- | ------ | ------ |
| fr       | gl     | it       | ja     | ko     |

| Português do Brasil | limba română | Русский | Türkçe | Українська |
| ------------------- | ------------ | ------- | ------ | ---------- |
| pt-br               | ro           | ru      | tr     | uk         |

| 简体中文 | 繁體中文 |
| -------- | -------- |
| zh-cn    | zh-tw    |

</Route>

## NOSEC.org {#nosec.org}

### Posts {#nosec.org-posts}

<Route author="hellodword" example="/nosec/hole" path="/nosec/:keykind?" paramsDesc={['对应文章分类']}>

| 分类     | 标识       |
| :------- | :--------- |
| 威胁情报 | `threaten` |
| 安全动态 | `security` |
| 漏洞预警 | `hole`     |
| 数据泄露 | `leakage`  |
| 专题报告 | `speech`   |
| 技术分析 | `skill`    |
| 安全工具 | `tool`     |

</Route>

## project-zero issues {#project-zero-issues}

### issues {#project-zero-issues-issues}

<Route author="hellodword" example="/project-zero-issues" path="/project-zero-issues" />

## Quicker {#quicker}

### 动作分享 {#quicker-dong-zuo-fen-xiang}

<Route author="nczitzk" example="/quicker/share/Recent" path="/quicker/share/:category?" paramsDesc={['分类，见下表，默认为动作库最新更新']}>

| 动作库最新更新 | 动作库最多赞 | 动作库新动作 | 动作库最近赞 |
| -------------- | ------------ | ------------ | ------------ |
| Recent         | Recommended  | NewActions   | RecentLiked  |

| 子程序      | 扩展热键  | 文本指令     |
| ----------- | --------- | ------------ |
| SubPrograms | PowerKeys | TextCommands |

</Route>

### 讨论区 {#quicker-tao-lun-qu}

<Route author="Cesaryuan nczitzk" example="/quicker/qa" path="/quicker/qa/:category?/:state?" paramsDesc={['分类，见下表，默认为全部', '状态，见下表，默认为全部']}>

分类

| 使用问题 | 动作开发 | BUG 反馈 | 功能建议 |
| -------- | -------- | -------- | -------- |
| 1        | 9        | 3        | 4        |

| 动作需求 | 经验创意 | 动作推荐 | 信息发布 |
| -------- | -------- | -------- | -------- |
| 6        | 2        | 7        | 5        |

| 随便聊聊 | 异常报告 | 全部 |
| -------- | -------- | ---- |
| 8        | 10       | all  |

状态

| 全部 | 精华   | 已归档  |
| ---- | ------ | ------- |
|      | digest | achived |

</Route>

### 用户更新 {#quicker-yong-hu-geng-xin}

<Route author="Cesaryuan nczitzk" example="/quicker/user/Actions/3-CL" path="/quicker/user/:category/:id" paramsDesc={['分类，见下表', '用户 id，可在对应用户页 URL 中找到']}>

| 动作    | 子程序      | 动作单      |
| ------- | ----------- | ----------- |
| Actions | SubPrograms | ActionLists |

</Route>

## react {#react}

### react-native {#react-react-native}

<Route author="xixi" example="/react/react-native-weekly" path="/react/react-native-weekly" />

## Rust 语言中文社区 {#rust-yu-yan-zhong-wen-she-qu}

### 招聘 {#rust-yu-yan-zhong-wen-she-qu-zhao-pin}

<Route author="CcccFz" example="/rustcc/jobs" path="/rustcc/jobs" radar="1" rssbud="1"/>

## Scala {#scala}

### Scala Blog {#scala-scala-blog}

<Route author="fengkx" example="/scala/blog/posts" path="/scala/blog/:part?" paramsDesc={['part parmater can be found in the url of blog']} >
</Route>

## SecWiki - 安全维基 {#secwiki---an-quan-wei-ji}

### 最新周刊 {#secwiki---an-quan-wei-ji-zui-xin-zhou-kan}

<Route author="p7e4" example="/sec-wiki/weekly" path="/sec-wiki/weekly" />

## segmentfault {#segmentfault}

### 频道 {#segmentfault-pin-dao}

<Route author="LogicJake Fatpandac" example="/segmentfault/channel/frontend" path="/segmentfault/channel/:name" paramsDesc={['频道名称，在频道 URL 可以找到']} radar="1"/>

### 用户 {#segmentfault-yong-hu}

<Route author="leyuuu Fatpandac" example="/segmentfault/user/minnanitkong" path="/segmentfault/user/:name" paramsDesc={['用户 Id，用户详情页 URL 可以找到']} radar="1"/>

### 博客 {#segmentfault-bo-ke}

<Route author="shiluanzzz" example="/segmentfault/blogs/go" path="/segmentfault/blogs/:tag" paramsDesc={['标签名称, 在 https://segmentfault.com/tags 中可以找到']} radar="1"/>

## Smashing Magazine {#smashing-magazine}

### Articles {#smashing-magazine-articles}

<Route author="Rjnishant530" example="/smashingmagazine" path="/smashingmagazine" radar="1"/>

### Category {#smashing-magazine-category}

<Route author="Rjnishant530" example="/smashingmagazine/react" path="/smashingmagazine/:category?" paramsDesc={['Find in URL or Table below']} radar="1">

| **Category**         |                       |
|----------------------|-----------------------|
| Accessibility        | accessibility         |
| Best practices       | best-practices       |
| Business             | business              |
| Career               | career                |
| Checklists           | checklists            |
| CSS                  | css                   |
| Data Visualization   | data-visualization   |
| Design               | design                |
| Design Patterns      | design-patterns      |
| Design Systems       | design-systems       |
| E-Commerce           | e-commerce           |
| Figma                | figma                 |
| Freebies             | freebies              |
| HTML                 | html                  |
| Illustrator          | illustrator           |
| Inspiration          | inspiration           |
| JavaScript           | javascript           |
| Mobile               | mobile                |
| Performance          | performance           |
| Privacy              | privacy               |
| React                | react                 |
| Responsive Design    | responsive-design    |
| Round-Ups            | round-ups            |
| SEO                  | seo                   |
| Typography           | typography            |
| Tools                | tools                 |
| UI                   | ui                    |
| Usability            | usability             |
| UX                   | ux                    |
| Vue                  | vue                   |
| Wallpapers           | wallpapers            |
| Web Design           | web-design            |
| Workflow             | workflow              |

</Route>

## TesterHome {#testerhome}

### 最新发布 {#testerhome-zui-xin-fa-bu}

<Route author="xyqfer" example="/testerhome/newest" path="/testerhome/newest"/>

## ui.dev {#ui.dev}

### BYTES - Your weekly dose of JS {#ui.dev-bytes---your-weekly-dose-of-js}

Staying informed on the JavaScript ecosystem has never been so entertaining. Delivered every Monday and Thursday, for free. https://bytes.dev/

<Route author="meixger" example="/bytes" path="/bytes"/>

### React Newsletter {#ui.dev-react-newsletter}

Stay up to date on the latest React news, tutorials, resources, and more. Delivered every Tuesday, for free. https://reactnewsletter.com/

<Route author="meixger" example="/reactnewsletter" path="/reactnewsletter"/>

## Visual Studio Code Marketplace {#visual-studio-code-marketplace}

### Visual Studio Code Plugins Marketplace {#visual-studio-code-marketplace-visual-studio-code-plugins-marketplace}

<Route author="SeanChao" example="/vscode/marketplace" path="/vscode/marketplace/:category?" paramsDesc={['Category']} >

| Featured | Trending Weekly | Trending Monthly | Trending Daily | Most Popular | Recently Added |
| -------- | --------------- | ---------------- | -------------- | ------------ | -------------- |
| featured | trending        | trending_m       | trending_d     | popular      | new            |

</Route>

## wolley {#wolley}

### posts {#wolley-posts}

<Route author="umm233" example="/wolley" path="/wolley/index"/>

### user post {#wolley-user-post}

<Route author="umm233" example="/wolley/user/kyth" path="/wolley/user/:id" paramsDesc={['用户 id']} />

### host {#wolley-host}

<Route author="umm233" example="/wolley/host/www.youtube.com" path="/wolley/host/:host" paramsDesc={['文章对应 host 分类']} />

## zooTeam 政采云前端技术团队 {#zooteam-zheng-cai-yun-qian-duan-ji-shu-tuan-dui}

### blog {#zooteam-zheng-cai-yun-qian-duan-ji-shu-tuan-dui-blog}

<Route author="Pulset" example="/zooTeam/blog" path="/zooTeam/blog" radar="1" rssbud="1"/>

### weekly {#zooteam-zheng-cai-yun-qian-duan-ji-shu-tuan-dui-weekly}

<Route author="Pulset" example="/zooTeam/weekly" path="/zooTeam/weekly" radar="1" rssbud="1"/>

## 阿里云 {#a-li-yun}

### 数据库内核月报 {#a-li-yun-shu-ju-ku-nei-he-yue-bao}

<Route author="junbaor" example="/aliyun/database_month" path="/aliyun/database_month"/>

### 公告 {#a-li-yun-gong-gao}

<Route author="muzea" example="/aliyun/notice" path="/aliyun/notice/:type?">

| 类型     | type |
| -------- | ---- |
| 全部     |      |
| 升级公告 | 1    |
| 安全公告 | 2    |
| 备案公告 | 3    |
| 其他     | 4    |

</Route>

### 开发者社区 - 主题 {#a-li-yun-kai-fa-zhe-she-qu---zhu-ti}

<Route author="umm233" example="/aliyun/developer/group/alitech" path="/aliyun/developer/group/:type" paramsDesc={['对应技术领域分类']} />

## 安全客 {#an-quan-ke}

:::tip

官方提供了混合的主页资讯 RSS: <https://api.anquanke.com/data/v1/rss>

:::

### 分类订阅 {#an-quan-ke-fen-lei-ding-yue}

<Route author="qwertyuiop6" example="/anquanke/week" path="/anquanke/:category/:fulltext?" paramsDesc={['分类订阅', '是否获取全文，如需获取全文参数传入 `quanwen` 或 `fulltext`']} radar="1" rssbud="1">

| 360 网络安全周报 | 活动     | 知识      | 资讯 | 招聘 | 工具 |
| ---------------- | -------- | --------- | ---- | ---- | ---- |
| week             | activity | knowledge | news | job  | tool |

</Route>

## 安全内参 {#an-quan-nei-can}

### 分类 {#an-quan-nei-can-fen-lei}

<Route author="XinRoom" example="/secrss/category/产业趋势" path="/secrss/category/:category?" radar="1" rssbud="1"/>

### 作者 {#an-quan-nei-can-zuo-zhe}

<Route author="XinRoom" example="/secrss/author/网络安全威胁和漏洞信息共享平台" path="/secrss/author/:author" radar="1" rssbud="1"/>

## 安全文摘 {#an-quan-wen-zhai}

### 首页 {#an-quan-wen-zhai-shou-ye}

<Route author="kaiili" example="/secnews" path="/secnews" />

## 北京智源人工智能研究院 {#bei-jing-zhi-yuan-ren-gong-zhi-neng-yan-jiu-yuan}

### 智源社区 {#bei-jing-zhi-yuan-ren-gong-zhi-neng-yan-jiu-yuan-zhi-yuan-she-qu}

<Route author="TonyRL" example="/baai/hub" path="/baai/hub/:tagId?/:sort?/:range?" paramsDesc={['社群 ID，可在 [社群页](https://hub.baai.ac.cn/taglist) 或 URL 中找到', '分类，见下表，默认为 `new`', '时间跨度，仅在分类 `readCnt` 时有效']} radar="1">

分类

| 最热 | 最新 | 头条    |
| ---- | ---- | ------- |
| hot  | new  | readCnt |

时间跨度

| 3 天 | 7 天 | 30 天 |
| ---- | ---- | ----- |
| 3    | 7    | 30    |

</Route>

### 智源社区 - 活动 {#bei-jing-zhi-yuan-ren-gong-zhi-neng-yan-jiu-yuan-zhi-yuan-she-qu---huo-dong}

<Route author="TonyRL" example="/baai/hub/events" path="/baai/hub/events" radar="1"/>

### 智源社区 - 评论 {#bei-jing-zhi-yuan-ren-gong-zhi-neng-yan-jiu-yuan-zhi-yuan-she-qu---ping-lun}

<Route author="TonyRL" example="/baai/hub/comments" path="/baai/hub/comments" radar="1"/>

## 登链社区 {#deng-lian-she-qu}

### 文章 {#deng-lian-she-qu-wen-zhang}

<Route author="running-grass" example="/learnblockchain/posts/DApp/newest" path="/learnblockchain/posts/:cid/:sort?" paramsDesc={['分类id,更多分类可以论坛的URL找到', '排序方式，默认精选']} radar="1">

| id       | 分类         |
| -------- | ------------ |
| all      | 全部         |
| DApp     | 去中心化应用 |
| chains   | 公链         |
| 联盟链   | 联盟链       |
| scaling  | Layer2       |
| langs    | 编程语言     |
| security | 安全         |
| dst      | 存储         |
| basic    | 理论研究     |
| other    | 其他         |

| id       | 排序方式    |
| -------- | ----------- |
| newest   | 最新        |
| featured | 精选 (默认) |
| featured | 最赞        |
| hottest  | 最热        |

</Route>

## 饿了么开放平台 {#e-le-me-kai-fang-ping-tai}

### 商家开放平台公告 {#e-le-me-kai-fang-ping-tai-shang-jia-kai-fang-ping-tai-gong-gao}

<Route author="phantomk" example="/eleme/open/announce" path="/eleme/open/announce"/>

### 饿百零售开放平台公告 {#e-le-me-kai-fang-ping-tai-e-bai-ling-shou-kai-fang-ping-tai-gong-gao}

<Route author="phantomk" example="/eleme/open-be/announce" path="/eleme/open-be/announce"/>

## 极客时间 {#ji-ke-shi-jian}

### 专栏文章 {#ji-ke-shi-jian-zhuan-lan-wen-zhang}

<Route author="fengchang" example="/geektime/column/48" path="/geektime/column/:cid" paramsDesc={['专栏 id，可从[全部专栏](https://time.geekbang.org/paid-content)进入专栏介绍页，在 URL 中找到']}/>

### 极客新闻 {#ji-ke-shi-jian-ji-ke-xin-wen}

<Route author="zhangzhxb520" example="/geektime/news" path="/geektime/news"/>

> -   极客时间专栏需要付费订阅，RSS 仅做更新提醒，不含付费内容.
> -   极客新闻不需要付费，可通过 RSS 订阅.

## 极术社区 {#ji-shu-she-qu}

### 频道、专栏、用户 {#ji-shu-she-qu-pin-dao-%E3%80%81-zhuan-lan-%E3%80%81-yong-hu}

<Route author="bigfei" example="/aijishu/channel/ai" path="/aijishu/:type/:name?" paramsDesc={['文章类型，可以取值如下', '名字，取自URL']} radar="1" rssbud="1">

| type    | 说明 |
| ------- | ---- |
| channel | 频道 |
| blog    | 专栏 |
| u       | 用户 |

</Route>

## 技术头条 {#ji-shu-tou-tiao}

### 最新分享 {#ji-shu-tou-tiao-zui-xin-fen-xiang}

<Route author="xyqfer" example="/blogread/newest" path="/blogread/newest"/>

## 掘金 {#jue-jin}

### 分类 {#jue-jin-fen-lei}

<Route author="DIYgod" example="/juejin/category/frontend" path="/juejin/category/:category" paramsDesc={['分类名']} radar="1" rssbud="1">

| 后端    | 前端     | Android | iOS | 人工智能 | 开发工具 | 代码人生 | 阅读    |
| ------- | -------- | ------- | --- | -------- | -------- | -------- | ------- |
| backend | frontend | android | ios | ai       | freebie  | career   | article |

</Route>

### 标签 {#jue-jin-biao-qian}

<Route author="isheng5" example="/juejin/tag/架构" path="/juejin/tag/:tag" paramsDesc={['标签名，可在标签 URL 中找到']} radar="1" rssbud="1"/>

### 热门 {#jue-jin-re-men}

<Route author="moaix" example="/juejin/trending/ios/monthly" path="/juejin/trending/:category/:type" paramsDesc={['分类名', '类型']} radar="1" rssbud="1">

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

### 小册 {#jue-jin-xiao-ce}

<Route author="xyqfer" example="/juejin/books" path="/juejin/books" radar="1" rssbud="1"/>

> 掘金小册需要付费订阅，RSS 仅做更新提醒，不含付费内容.

### 沸点 {#jue-jin-fei-dian}

<Route author="xyqfer laampui" example="/juejin/pins/6824710202487472141" path="/juejin/pins/:type?" paramsDesc={['默认为 recommend，见下表']} radar="1" rssbud="1">

| 推荐      | 热门 | 上班摸鱼            | 内推招聘            | 一图胜千言          | 今天学到了          | 每天一道算法题      | 开发工具推荐        | 树洞一下            |
| --------- | ---- | ------------------- | ------------------- | ------------------- | ------------------- | ------------------- | ------------------- | ------------------- |
| recommend | hot  | 6824710203301167112 | 6819970850532360206 | 6824710202487472141 | 6824710202562969614 | 6824710202378436621 | 6824710202000932877 | 6824710203112423437 |

</Route>

### 用户文章 {#jue-jin-yong-hu-wen-zhang}

<Route author="Maecenas" example="/juejin/posts/3051900006845944" path="/juejin/posts/:id" paramsDesc={['用户 id, 可在用户页 URL 中找到']} radar="1" rssbud="1"/>

### 收藏集 {#jue-jin-shou-cang-ji}

<Route author="isQ" example="/juejin/collections/1697301682482439" path="/juejin/collections/:userId" paramsDesc={['用户唯一标志符, 在浏览器地址栏URL中能够找到']} radar="1" rssbud="1"/>

### 单个收藏夹 {#jue-jin-dan-ge-shou-cang-jia}

<Route author="isQ" example="/juejin/collection/6845243180586123271" path="/juejin/collection/:collectionId" paramsDesc={['收藏夹唯一标志符, 在浏览器地址栏URL中能够找到']} radar="1" rssbud="1"/>

### 分享 {#jue-jin-fen-xiang}

<Route author="qiwihui" example="/juejin/shares/56852b2460b2a099cdc1d133" path="/juejin/shares/:userId" paramsDesc={['用户 id, 可在用户页 URL 中找到']} radar="1" rssbud="1"/>

### 专栏 {#jue-jin-zhuan-lan}

<Route author="xiangzy1" example="/juejin/column/6960559453037199391" path="/juejin/column/:id" paramsDesc={['专栏 id, 可在专栏页 URL 中找到']} radar="1" rssbud="1"/>

### 资讯 {#jue-jin-zi-xun}

<Route author="cancergary" example="/juejin/news/739332228916791" path="/juejin/news/:userId" paramsDesc={['用户 id, 可在用户页 URL 中找到']} radar="1" rssbud="1"/>

## 开源中国 {#kai-yuan-zhong-guo}

### 资讯 {#kai-yuan-zhong-guo-zi-xun}

<Route author="tgly307 zengxs" example="/oschina/news/project" path="/oschina/news/:category?" paramsDesc={['板块名']} radar="1" rssbud="1">

| [综合资讯][osc_gen] | [软件更新资讯][osc_proj] | [行业资讯][osc_ind] | [编程语言资讯][osc_pl] |
| ------------------- | ------------------------ | ------------------- | ---------------------- |
| industry            | project                  | industry-news       | programming            |

订阅 [全部板块资讯][osc_all] 可以使用 <https://rsshub.app/oschina/news>

[osc_all]: https://www.oschina.net/news "开源中国 - 全部资讯"

[osc_gen]: https://www.oschina.net/news/industry "开源中国 - 综合资讯"

[osc_proj]: https://www.oschina.net/news/project "开源中国 - 软件更新资讯"

[osc_ind]: https://www.oschina.net/news/industry-news "开源中国 - 行业资讯"

[osc_pl]: https://www.oschina.net/news/programming "开源中国 - 编程语言资讯"

</Route>

### 用户博客 {#kai-yuan-zhong-guo-yong-hu-bo-ke}

<Route author="dxmpalb" example="/oschina/user/lenve" path="/oschina/user/:id" paramsDesc={['用户 id，可通过查看用户博客网址得到，如果博客以 u/数字结尾，使用下一条路由']} radar="1" rssbud="1"/>

### 数字型账号用户博客 {#kai-yuan-zhong-guo-shu-zi-xing-zhang-hao-yong-hu-bo-ke}

<Route author="dxmpalb" example="/oschina/u/3920392" path="/oschina/u/:uid" paramsDesc={['用户 id，可通过查看用户博客网址得到，以 u/数字结尾，数字即为 id']} radar="1" rssbud="1"/>

### 问答主题 {#kai-yuan-zhong-guo-wen-da-zhu-ti}

<Route author="loveely7" example="/oschina/topic/weekly-news" path="/oschina/topic/:topic" paramsDesc={['主题名，可从 [全部主题](https://www.oschina.net/question/topics) 进入主题页，在 URL 中找到']} radar="1" rssbud="1"/>

## 拉勾网 {#la-gou-wang}

:::tip

拉勾网官方提供职位的[邮件订阅](https://www.lagou.com/s/subscribe.html)，请根据自身需要选择使用。

:::

### 职位招聘 {#la-gou-wang-zhi-wei-zhao-pin}

<Route author="hoilc" example="/lagou/jobs/JavaScript/上海" path="/lagou/jobs/:position/:city" paramsDesc={['职位名，可以参考[拉勾网首页](https://www.lagou.com)的职位列表', '城市名，请参考[拉勾网支持的全部城市](https://www.lagou.com/jobs/allCity.html)']} anticrawler="1"/>

## 蓝桥云课 {#lan-qiao-yun-ke}

### 全站发布的课程 {#lan-qiao-yun-ke-quan-zhan-fa-bu-de-ke-cheng}

<Route author="huhuhang" example="/lanqiao/courses/latest/all" path="/lanqiao/courses/:sort/:tag"  paramsDesc={['排序规则 sort, 默认(`default`)、最新(`latest`)、最热(`hotest`)', '课程标签 `tag`，可在该页面找到：https://www.lanqiao.cn/courses/']} radar="1" rssbud="1"/>

### 作者发布的课程 {#lan-qiao-yun-ke-zuo-zhe-fa-bu-de-ke-cheng}

<Route author="huhuhang" example="/lanqiao/author/1701267" path="/lanqiao/author/:uid"  paramsDesc={['作者 `uid` 可在作者主页 URL 中找到']} radar="1" rssbud="1"/>

### 技术社区 {#lan-qiao-yun-ke-ji-shu-she-qu}

<Route author="huhuhang" example="/lanqiao/questions/2" path="/lanqiao/questions/:id" paramsDesc={['topic_id 主题 `id` 可在社区板块 URL 中找到']} radar="1" rssbud="1"/>

## 连享会 {#lian-xiang-hui}

### 精彩资讯 {#lian-xiang-hui-jing-cai-zi-xun}

<Route author="nczitzk" example="/lianxh" path="/lianxh/:category?" paramsDesc={['分类 id，可在对应分类页 URL 中找到，默认为空，即全部']}>

| 分类                 | id |
| -------------------- | -- |
| 全部                 |    |
| Stata 入门           | 16 |
| Stata 教程           | 17 |
| 计量专题             | 18 |
| 内生性 - 因果推断    | 19 |
| 面板数据             | 20 |
| 交乘项 - 调节 - 中介 | 21 |
| 结果输出             | 22 |
| 工具软件             | 23 |
| Stata 绘图           | 24 |
| 数据处理             | 25 |
| Stata 程序           | 26 |
| Probit-Logit         | 27 |
| 时间序列             | 28 |
| 空间计量 - 网络分析  | 29 |
| Markdown-LaTeX       | 30 |
| 论文写作             | 31 |
| 回归分析             | 32 |
| 其它                 | 33 |
| 数据分享             | 34 |
| Stata 资源           | 35 |
| 文本分析 - 爬虫      | 36 |
| Python-R-Matlab      | 37 |
| IV-GMM               | 38 |
| 倍分法 DID           | 39 |
| 断点回归 RDD         | 40 |
| PSM-Matching         | 41 |
| 合成控制法           | 42 |
| Stata 命令           | 43 |
| 专题课程             | 44 |
| 风险管理             | 45 |
| 生存分析             | 46 |
| 机器学习             | 47 |
| 分位数回归           | 48 |
| SFA-DEA - 效率分析   | 49 |
| 答疑 - 板书          | 50 |
| 论文重现             | 51 |
| 最新课程             | 52 |
| 公开课               | 53 |
| Stata33 讲           | 54 |

</Route>

## 洛谷 {#luo-gu}

### 日报 {#luo-gu-ri-bao}

<Route author="LogicJake prnake nczitzk" example="/luogu/daily" path="/luogu/daily/:id?" paramsDesc={['年度日报所在帖子 id，可在 URL 中找到，不填默认为 `47327`']} radar="1" rssbud="1"/>

### 比赛列表 {#luo-gu-bi-sai-lie-biao}

<Route author="prnake" example="/luogu/contest" path="/luogu/contest" radar="1" rssbud="1"/>

### 用户动态 {#luo-gu-yong-hu-dong-tai}

<Route author="solstice23" example="/luogu/user/feed/1" path="/luogu/user/feed/:uid" paramsDesc={['用户 UID']} radar="1" rssbud="1"/>

### 用户博客 {#luo-gu-yong-hu-bo-ke}

<Route author="ftiasch" example="/luogu/user/blog/ftiasch" path="/luogu/user/blog/:name" paramsDesc={['博客名称']} radar="1" rssbud="1"/>

## 码农俱乐部 {#ma-nong-ju-le-bu}

### 话题 {#ma-nong-ju-le-bu-hua-ti}

<Route author="mlogclub" example="/mlog-club/topics/newest" path="/mlog-club/topics/:node" paramsDesc={['node']}>

| node      | 名称     |
| --------- | -------- |
| newest    | 最新话题 |
| recommend | 热门话题 |
| 1         | 交流     |
| 2         | 开源     |
| 3         | 提问     |

</Route>

### 开源项目 {#ma-nong-ju-le-bu-kai-yuan-xiang-mu}

<Route author="mlogclub" example="/mlog-club/projects" path="/mlog-club/projects" />

## 码农网 {#ma-nong-wang}

### 最新 {#ma-nong-wang-zui-xin}

<Route author="kt286" example="/codeceo/home" path="/codeceo/home"/>

### 分类 {#ma-nong-wang-fen-lei}

<Route author="kt286" example="/codeceo/category/java" path="/codeceo/category/:category?" paramsDesc={['category']}>

| category        | 名称                |
| --------------- | ------------------- |
| news            | 资讯                |
| java            | JAVA 开发           |
| cpp             | C/C++ 开发          |
| donet           | .NET 开发           |
| web             | WEB 开发            |
| android         | Android 开发        |
| ios             | iOS 开发            |
| cloud           | 云计算 / 大数据     |
| os              | 操作系统            |
| database        | 数据库              |
| machine         | 机器学习 / 人工智能 |
| algorithm       | 算法设计            |
| design-patterns | 设计模式            |
| programmer      | 程序员人生          |
| weekly          | 《快乐码农》        |
| project         | 开源软件            |

</Route>

### 标签 {#ma-nong-wang-biao-qian}

<Route author="kt286" example="/codeceo/tag/node.js" path="/codeceo/tag/:category?" paramsDesc={['tag']}>

| tag        | 名称       |
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

## 码农周刊 {#ma-nong-zhou-kan}

### issues {#ma-nong-zhou-kan-issues}

<Route author="tonghs" example="/manong-weekly" path="/manong-weekly" />

## 美团开放平台 {#mei-tuan-kai-fang-ping-tai}

### 美团开放平台公告 {#mei-tuan-kai-fang-ping-tai-mei-tuan-kai-fang-ping-tai-gong-gao}

<Route author="youzipi" example="/meituan/open/announce" path="/meituan/open/announce"/>

## 平安银河实验室 {#ping-an-yin-he-shi-yan-shi}

### posts {#ping-an-yin-he-shi-yan-shi-posts}

<Route author="hellodword" example="/galaxylab" path="/galaxylab" />

## 前端艺术家 && 飞冰早报 {#qian-duan-yi-shu-jia-%26%26-fei-bing-zao-bao}

### 列表 {#qian-duan-yi-shu-jia-%26%26-fei-bing-zao-bao-lie-biao}

<Route author="kouchao" example="/jskou/0" path="/jskou/:type?" paramsDesc={['分类']}>

| 前端艺术家 | 飞冰早报 |
| ---------- | -------- |
| 0          | 1        |

</Route>

## 前端早早聊 {#qian-duan-zao-zao-liao}

### 文章 {#qian-duan-zao-zao-liao-wen-zhang}

<Route author="shaomingbo" example="/zaozao/article/quality"  path="/zaozao/article/:type?" paramsDesc={['文章分类']} radar="1">

| 精品推荐  | 技术干货 | 职场成长 | 社区动态  | 组件物料 | 行业动态 |
| --------- | -------- | -------- | --------- | -------- | -------- |
| recommend | quality  | growth   | community | material | industry |

</Route>

## 日报 | D2 资源库 {#ri-bao-%7C-d2-zi-yuan-ku}

### 日报 | D2 资源库 {#ri-bao-%7C-d2-zi-yuan-ku-ri-bao-%7C-d2-zi-yuan-ku}

<Route author="Andiedie" example="/d2/daily" path="/d2/daily"/>

## 顺丰 {#shun-feng}

### 顺丰丰桥开放平台公告 {#shun-feng-shun-feng-feng-qiao-kai-fang-ping-tai-gong-gao}

<Route author="phantomk" example="/sf/sffq-announce" path="/sf/sffq-announce"/>

## 腾讯大数据 {#teng-xun-da-shu-ju}

<Route author="nczitzk" example="/tencent/bigdata" path="/tencent/bigdata"/>

## 腾讯游戏开发者社区 {#teng-xun-you-xi-kai-fa-zhe-she-qu}

:::caution

有部分输出全文带有未进行样式处理的代码内容，显示效果不佳，建议跳转原文阅读

:::

### 分类 {#teng-xun-you-xi-kai-fa-zhe-she-qu-fen-lei}

<Route author="xyqfer" example="/gameinstitute/community/hot" path="/gameinstitute/community/:tag?" paramsDesc={['标签名称，默认为热门']}>

| 热门 | 策划 | 程序    | 技术前沿 | 音频  | 项目管理 | 游戏运营 | 游戏测试 |
| ---- | ---- | ------- | -------- | ----- | -------- | -------- | -------- |
| hot  | plan | program | tech     | audio | project  | yunying  | test     |

</Route>

## 腾讯云 {#teng-xun-yun}

### 云 + 社区专栏 {#teng-xun-yun-yun-%2B-she-qu-zhuan-lan}

<Route author="nczitzk" example="/tencent/cloud/column/86410" path="/tencent/cloud/column/:id?/:tag?" paramsDesc={['专栏 id，可在对应专栏页中找到，默认为 86410（腾讯云数据库专家服务）', '标签 id，可在对应专栏页中找到，默认为空']}/>

## 微信开放平台 {#wei-xin-kai-fang-ping-tai}

### 微信开放社区 - 小程序公告 {#wei-xin-kai-fang-ping-tai-wei-xin-kai-fang-she-qu---xiao-cheng-xu-gong-gao}

<Route author="phantomk" example="/wechat-open/community/xcx-announce" path="/wechat-open/community/xcx-announce"/>

### 微信开放社区 - 小游戏公告 {#wei-xin-kai-fang-ping-tai-wei-xin-kai-fang-she-qu---xiao-you-xi-gong-gao}

<Route author="phantomk" example="/wechat-open/community/xyx-announce" path="/wechat-open/community/xyx-announce"/>

### 微信开放社区 - 微信支付公告 {#wei-xin-kai-fang-ping-tai-wei-xin-kai-fang-she-qu---wei-xin-zhi-fu-gong-gao}

<Route author="phantomk" example="/wechat-open/community/pay-announce" path="/wechat-open/community/pay-announce"/>

### 微信开放社区 - 小游戏问答 {#wei-xin-kai-fang-ping-tai-wei-xin-kai-fang-she-qu---xiao-you-xi-wen-da}

<Route author="bestony" example="/wechat-open/community/xyx-question/0" path="/wechat-open/community/xyx-question/:category" paramsDesc={['0', 'hot', 'topic']}>

| 全部 | 游戏引擎 | 规则 | 账号  | 运营 | 游戏审核 | API 和组件 | 框架 | 管理后台 | 开发者工具 | 客户端 | 插件 | 云开发 | 教程反馈 | 其他 |
| ---- | -------- | ---- | ----- | ---- | -------- | ---------- | ---- | -------- | ---------- | ------ | ---- | ------ | -------- | ---- |
| 0    | 4096     | 8192 | 16384 | 2048 | 1        | 2          | 64   | 4        | 8          | 16     | 256  | 1024   | 128      | 32   |

</Route>

### 微信开放社区 - 小程序问答 {#wei-xin-kai-fang-ping-tai-wei-xin-kai-fang-she-qu---xiao-cheng-xu-wen-da}

<Route author="bestony" example="/wechat-open/community/xcx-question/new" path="/wechat-open/community/xcx-question/:tag" paramsDesc={['new', 'hot', 'topic']}>

| 最新 | 最热 | 热门话题 |
| ---- | ---- | -------- |
| new  | hot  | topic    |

</Route>

### 微信支付 - 商户平台公告 {#wei-xin-kai-fang-ping-tai-wei-xin-zhi-fu---shang-hu-ping-tai-gong-gao}

<Route author="phantomk" example="/wechat-open/pay/announce" path="/wechat-open/pay/announce"/>

## 微信小程序 {#wei-xin-xiao-cheng-xu}

### 公众平台系统公告栏目 {#wei-xin-xiao-cheng-xu-gong-zhong-ping-tai-xi-tong-gong-gao-lan-mu}

<Route author="xyqfer" example="/wechat/announce" path="/wechat/announce" />

### 基础库更新日志 {#wei-xin-xiao-cheng-xu-ji-chu-ku-geng-xin-ri-zhi}

<Route author="magicLaLa nczitzk" example="/weixin/miniprogram/framework" path="/weixin/miniprogram/framework"/>

### 开发者工具更新日志 {#wei-xin-xiao-cheng-xu-kai-fa-zhe-gong-ju-geng-xin-ri-zhi}

<Route author="nczitzk" example="/weixin/miniprogram/devtools" path="/weixin/miniprogram/devtools"/>

### 小程序插件 {#wei-xin-xiao-cheng-xu-xiao-cheng-xu-cha-jian}

<Route author="xyqfer" example="/wechat/miniprogram/plugins" path="/wechat/miniprogram/plugins" />

### 云开发更新日志 {#wei-xin-xiao-cheng-xu-yun-kai-fa-geng-xin-ri-zhi}

<Route author="nczitzk" example="/weixin/miniprogram/wxcloud/cloud-sdk" path="/weixin/miniprogram/wxcloud/:caty?" paramsDesc={['日志分类']}>

| 小程序基础库更新日志（云开发部分） | IDE 云开发 & 云控制台更新日志 | wx-server-sdk 更新日志 |
| ---------------------------------- | ----------------------------- | ---------------------- |
| cloud-sdk                          | ide                           | server-sdk             |

</Route>

## 印记中文 {#yin-ji-zhong-wen}

### 周刊 - JavaScript {#yin-ji-zhong-wen-zhou-kan---javascript}

<Route author="daijinru" example="/docschina/jsweekly" path="/docschina/jsweekly" radar="1" rssbud="1"/>

## 知晓程序 {#zhi-xiao-cheng-xu}

### 文章 {#zhi-xiao-cheng-xu-wen-zhang}

<Route author="HenryQW" example="/miniapp/article/cloud" path="/miniapp/article/:category" paramsDesc={['分类名称']}>

| 全部 | 小程序资讯 | 知晓云 | 小程序推荐     | 榜单 | 晓组织 | 新能力     | 小程序问答 |
| ---- | ---------- | ------ | -------------- | ---- | ------ | ---------- | ---------- |
| all  | news       | cloud  | recommendation | rank | group  | capability | qa         |

</Route>

### 小程序商店 - 最新 {#zhi-xiao-cheng-xu-xiao-cheng-xu-shang-dian---zui-xin}

<Route author="xyqfer" example="/miniapp/store/newest" path="/miniapp/store/newest"/>

## 众成翻译 {#zhong-cheng-fan-yi}

### 首页 {#zhong-cheng-fan-yi-shou-ye}

<Route author="SirM2z" example="/zcfy" path="/zcfy/index"/>

### 热门 {#zhong-cheng-fan-yi-re-men}

<Route author="SirM2z" example="/zcfy/hot" path="/zcfy/hot"/>

