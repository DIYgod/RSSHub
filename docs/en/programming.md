---
pageClass: routes
---

# Programming

## ACM

### A.M.Turing Award Winners

<RouteEn author="nczitzk" example="/acm/amturingaward" path="/acm/amturingaward"/>

## AtCoder

### Present Contests

<RouteEn author="nczitzk" example="/atcoder/contest/en/upcoming" path="/atcoder/contest/:language?/:status?" :paramsDesc="['Language, `jp` as Japanese or `en` as English, English by default', 'Status, see below, Recent Contests by default']">

Status

| Active Contests | Upcoming Contests | Recent Contests |
| --------------- | ----------------- | --------------- |
| active          | upcoming          | recent          |

</RouteEn>

### Contests Archive

<RouteEn author="nczitzk" example="/atcoder/contest" path="/atcoder/contest/:language?/:rated?/:category?/:keyword?" :paramsDesc="['Language, `jp` as Japanese or `en` as English, English by default', 'Rated Range, see below, all by default', 'Category, see below, all by default', 'Keyword']">

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

</RouteEn>

### Posts

<RouteEn author="nczitzk" example="/atcoder/post" path="/atcoder/post/:language?/:keyword?" :paramsDesc="['Language, `jp` as Japanese or `en` as English, English by default', 'Keyword']"/>

## BBC News Labs

### News

<RouteEn author="elxy" example="/bbcnewslabs/news" path="/bbcnewslabs/news"/>

## Bitbucket

### Commits

<RouteEn author="AuroraDysis" example="/bitbucket/commits/blaze-lib/blaze" path="/bitbucket/commits/:workspace/:repo_slug" :paramsDesc="['Workspace', 'Repository']" radar="1" rssbud="1" />

### Tags

<RouteEn author="AuroraDysis" example="/bitbucket/tags/blaze-lib/blaze" path="/bitbucket/tags/:workspace/:repo_slug" :paramsDesc="['Workspace', 'Repository']" radar="1" rssbud="1" />

## Bitmovin

### Blog

<RouteEn author="elxy" example="/bitmovin/blog" path="/bitmovin/blog"/>

## CNCF

### Category

<RouteEn author="Fatpandac" example="/cncf" path="/cncf/:cate?" radar="1" rssbud="1" :paramsDesc="['blog by default']">

| Blog | News | Announcements | Reports |
|------|------|---------------|---------|
| blog | news | announcements | reports |

</RouteEn>

## Codeforces

### Latest contests

<RouteEn author="Fatpandac" example="/codeforces/contests" path="/codeforces/contests"/>

### Recent actions

<RouteEn author="ftiasch" example="/codeforces/recent-actions" path="/codeforces/recent-actions/:minrating?" :paramsDesc="['The minimum blog/comment rating required. Default: 1']"/>

## cve.mitre.org

### Search Result

<RouteEn author="fengkx" example="/cve/search/PostgreSQL" path="/cve/search/:keyword" :paramsDesc="['keyword']" />

## Distill

### Latest

<RouteEn author="nczitzk" example="/distill" path="/distill"/>

## gihyo.jp

### Series

<Route author="masakichi" example="/gihyo/list/group/Ubuntu-Weekly-Recipe" path="/gihyo/list/group/:id" :paramsDesc="['Series']"/>

## GitHub

::: tip

GitHub provides some official RSS feeds:

-   Repo releases: `https://github.com/:owner/:repo/releases.atom`
-   Repo commits: `https://github.com/:owner/:repo/commits.atom`
-   User activities: `https://github.com/:user.atom`
-   Private feed: `https://github.com/:user.private.atom?token=:secret` (You can find **Subscribe to your news feed** in [dashboard](https://github.com) page after login)
-   Wiki history: `https://github.com/:owner/:repo/wiki.atom`

:::

### User Repo

<RouteEn author="dragon-yuan" path="/github/repos/:user" example="/github/repos/DIYgod" :paramsDesc="['GitHub username']" radar="1" rssbud="1"/>

### Trending

<RouteEn author="DIYgod" path="/github/trending/:since/:language/:spoken_language?" example="/github/trending/daily/javascript/en" :paramsDesc="['time frame, available in [Trending page](https://github.com/trending/javascript?since=monthly) \'s URL, possible values are: `daily`, `weekly` or `monthly`', 'the feed language, available in [Trending page](https://github.com/trending/javascript?since=monthly) \'s URL, don\'t filter option is `any`', 'natural language, available in [Trending page](https://github.com/trending/javascript?since=monthly) \'s URL']" radar="1" rssbud="1" selfhost="1"/>

### Topics

<RouteEn author="queensferryme" example="/github/topics/framework" path="/github/topics/:name/:qs?" :paramsDesc="['Topic name, which can be found in the URL of the corresponding [Topics Page](https://github.com/topics/framework)', 'Query string, like `l=php&o=desc&s=stars`. Details listed as follows:']" radar="1" rssbud="1">

| Parameter | Description      | Values                                                                                                                          |
| --------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `l`       | Language         | For instance `php`, which can be found in the URL of the corresponding [Topics page](https://github.com/topics/framework?l=php) |
| `o`       | Sorting Order    | `asc`, `desc`                                                                                                                   |
| `s`       | Sorting Criteria | `stars`, `forks`, `updated`                                                                                                     |

For instance, the `/github/topics/framework/l=php&o=desc&s=stars` route will generate the RSS feed corresponding to this [page](https://github.com/topics/framework?l=php&o=desc&s=stars).

</RouteEn>

### Repo Issues

<RouteEn author="HenryQW AndreyMZ" path="/github/issue/:user/:repo/:state?/:labels?" example="/github/issue/DIYgod/RSSHub/all/RSS%20proposal" :paramsDesc="['GitHub username', 'GitHub repo name', 'the state of the issues. Can be either `open`, `closed`, or `all`. Default: `open`.', 'a list of comma separated label names']" radar="1" rssbud="1"/>

### Repo Pull Requests

<RouteEn author="hashman TonyRL" example="/github/pull/DIYgod/RSSHub" path="/github/pull/:user/:repo/:state?/:labels?" :paramsDesc="['User name', 'Repo name', 'the state of pull requests. Can be either `open`, `closed`, or `all`. Default: `open`.', 'a list of comma separated label names']" radar="1" rssbud="1"/>

### User Followers

<RouteEn author="HenryQW" path="/github/user/follower/:user" example="/github/user/followers/HenryQW" :paramsDesc="['GitHub username']" radar="1" rssbud="1"/>

### Repo Stars

<RouteEn author="HenryQW" path="/github/stars/:user/:repo" example="/github/stars/DIYGod/RSSHub" :paramsDesc="['GitHub username', 'GitHub repo name']" radar="1" rssbud="1"/>

### Repo Branches

<RouteEn author="max-arnold" example="/github/branches/DIYgod/RSSHub" path="/github/branches/:user/:repo" :paramsDesc="['User name', 'Repo name']" radar="1" rssbud="1"/>

### Files Commits

<RouteEn author="zengxs" example="/github/file/DIYgod/RSSHub/master/lib/router.js" path="/github/file/:user/:repo/:branch/:filepath+" :paramsDesc="['User name', 'Repo name', 'Branch name', 'File path']" radar="1" rssbud="1">

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

</RouteEn>

### Search Result

<RouteEn author="LogicJake" example="/github/search/RSSHub/bestmatch/desc" path="/github/search/:query/:sort?/:order?" :paramsDesc="['search keyword', 'Sort options (default to bestmatch)','Sort order, desc and asc (desc descending by default)']">

| Sort options     | sort      |
| ---------------- | --------- |
| Best match       | bestmatch |
| Most stars       | stars     |
| Most forks       | forks     |
| Recently updated | updated   |

</RouteEn>

### User Starred Repositories

<RouteEn author="LanceZhu" example="/github/starred_repos/DIYgod" path="/github/starred_repos/:user" :paramsDesc="['User name']" radar="1" rssbud="1"/>

### Repo Contributors

<RouteEn author="zoenglinghou" example="/github/contributors/DIYgod/RSSHub" path="/github/contributors/:user/:repo/:order?/:anon?" :paramsDesc="['User name','Repo name','Sort order by commit numbers, desc and asc (descending by default)','Show anonymous users. Defaults to no, use any values for yes.']" radar="1" rssbud="1"/>

### Issue / Pull Request comments

<RouteEn author="TonyRL" example="/github/comments/DIYgod/RSSHub/8116" path="/github/comments/:user/:repo/:number" :paramsDesc="['User / Org name', 'Repo name', 'Issue or pull number']" radar="1" rssbud="1"/>

### Wiki History

<RouteEn author="TonyRL" example="/github/wiki/flutter/flutter/Roadmap" path="/github/wiki/:user/:repo/:page?" :paramsDesc="['User / Org name', 'Repo name', 'Page slug, can be found in URL, empty means Home']" radar="1" rssbud="1"/>

### Notifications

<RouteEn author="zhzy0077" example="/github/notifications" path="/github/notifications" radar="1" rssbud="1" selfhost="1"/>

## GitLab

### Explore

<RouteEn author="imlonghao zoenglinghou" example="/gitlab/explore/trending" path="/gitlab/explore/:type/:host?" :paramsDesc="['type', 'Gitlab instance hostname, default to gitlab.com']">

| Trending | Most stars | All |
| -------- | ---------- | --- |
| trending | starred    | all |

</RouteEn>

### Releases

<RouteEn author="zoenglinghou" example="/gitlab/release/pleroma/pleroma/git.pleroma.social" path="/gitlab/release/:namespace/:project/:host?" :paramsDesc="['owner or namespace. `/` needs to be replaced with `%2F`', 'project name', 'Gitlab instance hostname, default to gitlab.com']" />

### Tags

<RouteEn author="zoenglinghou" example="/gitlab/tag/rluna-open-source%2Ffile-management%2Fowncloud/core/gitlab.com" path="/gitlab/tag/:namespace/:project/:host?" :paramsDesc="['owner or namespace. `/` needs to be replaced with `%2F`', 'project name', 'Gitlab instance hostname, default to gitlab.com']" />

## Gitpod

### Blog

<RouteEn author="TonyRL" example="/gitpod/blog" path="/gitpod/blog" />

### Changelog

<RouteEn author="TonyRL" example="/gitpod/changelog" path="/gitpod/changelog" />

## Hacker News

### Section

<RouteEn author="cf020031308 nczitzk" example="/hackernews" path="/hackernews/:section?/:type?/:user?" :paramsDesc="['Section, see below, `index` by default', 'Link, see below, `sources` by default', 'User, only valid for section `threads` and `submitted`. When `over` section is used, `User` means the threshold points for post']">

Section

| homepage                              | new                                           | past                                        | comments                                                | ask                                     | show                                      | jobs                                      | best                                      | threads                                                 | submitted                                                   |over                            |
| ------------------------------------- | --------------------------------------------- | ------------------------------------------- | ------------------------------------------------------- | --------------------------------------- | ----------------------------------------- | ----------------------------------------- | ----------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------- |----------------------------------------------------------- |
| [index](https://news.ycombinator.com) | [newest](https://news.ycombinator.com/newest) | [front](https://news.ycombinator.com/front) | [newcomments](https://news.ycombinator.com/newcomments) | [ask](https://news.ycombinator.com/ask) | [show](https://news.ycombinator.com/show) | [jobs](https://news.ycombinator.com/jobs) | [best](https://news.ycombinator.com/best) | [threads](https://news.ycombinator.com/threads?id=dang) | [submitted](https://news.ycombinator.com/submitted?id=dang) | [over](https://news.ycombinator.com/over?points=100) |

> Section `Over` only shows the submissions over a fixed threshold from last few days

Items link to

| Source addresses shared by users | Comments on Hacker News | Comments list  |
| -------------------------------- | ----------------------- | -------------- |
| sources                          | comments                | comments_list  |

> Default RSS by the website: <https://news.ycombinator.com/rss>, same as `index` section, should be the first choice.

</RouteEn>

### Follow User

Subscribe to the updates (threads and submission) from a paritcular Hacker News user

<RouteEn author="cf020031308 nczitzk xie-dongping" example="/hackernews/threads/comments_list/dang" path="/hackernews/:section?/:type?/:user?" :paramsDesc="['Section, see above, `index` by default', 'Link, see above, `sources` by default', 'User, only valid for section `threads` and `submitted`']" />

## HackMD

### Profile

<RouteEn author="Yukaii kaiix" example="/hackmd/profile/hackmd" path="/hackmd/profile/:path" :paramsDesc="['userpath or teampath']" radar="1"/>

## Hex-Rays

### Hex-Rays News

<RouteEn author="hellodword" example="/hex-rays/news" path="/hex-rays/news" />

## Issue Hunt

### Project Funded

<RouteEn author="running-grass" radar="1" example="/issuehunt/funded/DIYgod/RSSHub" path="/issuehunt/funded/:username/:repo" :paramsDesc="['Github user/org','Repository name']" />

## Kaggle

### Discussion

<RouteEn author="LogicJake" example="/kaggle/discussion/387811/active" path="/kaggle/discussion/:forumId/:sort?" :paramsDesc="['Forum ID, open web request, search forumId; fill in all to subscribe to the whole site discussion forum', 'See the table below for sorting methods, default to hot']">

| hot     | recent          | new             | top        | active        |
| ------- | --------------- | --------------- | ---------- | ------------- |
| Hotness | Recent Comments | Recently Posted | Most Votes | Most Comments |

</RouteEn>

### Competitions

<RouteEn author="LogicJake" example="/kaggle/competitions" path="/kaggle/competitions/:category?" :paramsDesc="['category, default to all']">

| 空             | featured | research | recruitment | gettingStarted  | masters | playground | analytics |
| -------------- | -------- | -------- | ----------- | --------------- | ------- | ---------- | --------- |
| All Categories | Featured | Research | Recruitment | Getting started | Masters | Playground | Analytics |

</RouteEn>

## Layer3

### Quest

<RouteEn author="nczitzk" example="/layer3/quests" path="/layer3/quests" radar="1"/>


## LeetCode

### Articles

<RouteEn author="LogicJake" example="/leetcode/articles" path="/leetcode/articles"/>

### Submission

<RouteEn author="NathanDai" example="/leetcode/submission/us/nathandai" path="/leetcode/submission/:country/:user" :paramsDesc="['country, Chines(cn) and US(us)', 'Username, available at the URL of the LeetCode user homepage']"/>

### Daily Question

<RouteEn author="NavePnow" example="/leetcode/dailyquestion/en" path="/leetcode/dailyquestion/:lang" :paramsDesc="['site, Chines(cn) and Engligh(en)']"/>

### Daily Question Solution

<RouteEn author="woaidouya123" example="/leetcode/dailyquestion/solution/en" path="/leetcode/dailyquestion/solution/:lang" :paramsDesc="['site, Chines(cn) and Engligh(en)']"/>

## Linux Patchwork

### Patch Comments

<RouteEn author="ysc3839" example="/patchwork.kernel.org/comments/10723629" path="/patchwork.kernel.org/comments/:id" :paramsDesc="['Patch ID']"/>

## LWN.net

### Security alerts

<RouteEn author="zengxs" example="/lwn/alerts/CentOS" path="/lwn/alerts/:distributor" :paramsDesc="['Distribution identification']">

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

</RouteEn>

## MySQL

### Release Notes

<RouteEn author="nczitzk" example="/mysql/release/8.0" path="/mysql/release/:version?" :paramsDesc="['Version, see below, 8.0 by default']">

| 8.0 | 5.7 | 5.6 |
| --- | --- | --- |

</RouteEn>

## Node.js

### News

<RouteEn author="nczitzk" example="/nodejs/blog" path="/nodejs/blog/:language?" :paramsDesc="['Language, see below, en by default']">

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

</RouteEn>

## project-zero issues

### issues

<RouteEn author="hellodword" example="/project-zero-issues" path="/project-zero-issues" />

## react

### react-native

<RouteEn author="xixi" example="/react/react-native-weekly" path="/react/react-native-weekly" />

## Scala

### Scala Blog

<RouteEn author="fengkx" example="/scala/blog/posts" path="/scala/blog/:part?" :paramsDesc="['part parmater can be found in the url of blog']" >
</RouteEn>

## ui.dev

### BYTES - Your weekly dose of JS

Staying informed on the JavaScript ecosystem has never been so entertaining. Delivered every Monday and Thursday, for free. https://bytes.dev/

<RouteEn author="meixger" example="/bytes" path="/bytes"/>

### React Newsletter

Stay up to date on the latest React news, tutorials, resources, and more. Delivered every Tuesday, for free. https://reactnewsletter.com/

<RouteEn author="meixger" example="/reactnewsletter" path="/reactnewsletter"/>

## Visual Studio Code Marketplace

### Visual Studio Code Plugins Marketplace

<RouteEn author="SeanChao" example="/vscode/marketplace" path="/vscode/marketplace/:category?" :paramsDesc="['Category']">

| Featured | Trending Weekly | Trending Monthly | Trending Daily | Most Popular | Recently Added |
| -------- | --------------- | ---------------- | -------------- | ------------ | -------------- |
| featured | trending        | trending_m       | trending_d     | popular      | new            |

</RouteEn>

## zooTeam

### blog

<RouteEn author="Pulset" example="/zooTeam/blog" path="/zooTeam/blog" radar="1" rssbud="1"/>

### weekly

<RouteEn author="Pulset" example="/zooTeam/weekly" path="/zooTeam/weekly" radar="1" rssbud="1"/>
