---
pageClass: routes
---

# Programming

## GitHub

::: tip

GitHub provides some official RSS feeds:

-   Repo releases: https://github.com/:owner/:repo/releases.atom
-   Repo commits: https://github.com/:owner/:repo/commits.atom
-   User activities: https://github.com/:user.atom
-   Private feed: https://github.com/:user.private.atom?token=:secret (You can find **Subscribe to your news feed** in [dashboard](https://github.com) page after login)

:::

### User Repo

<RouteEn author="dragon-yuan" path="/github/repos/:user" example="/github/repos/DIYgod" :paramsDesc="['GitHub username']" radar="1" />

### Trending

<RouteEn path="/github/trending/:since/:language?" example="/github/trending/daily/javascript" :paramsDesc="['time frame, available in [Trending page](https://github.com/trending/javascript?since=monthly) \'s URL, possible values are: daily, weekly or monthly', 'the feed language, available in [Trending page](https://github.com/trending/javascript?since=monthly) \'s URL']" radar="1" />

### Repo Issues

<RouteEn author="HenryQW" path="/github/issue/:user/:repo/:state?/:labels?" example="/github/issue/DIYgod/RSSHub/all/bug" :paramsDesc="['GitHub username', 'GitHub repo name', 'the state of the issues. Can be either `open`, `closed`, or `all`. Default: `open`.', 'a list of comma separated label names']" radar="1" />

### Repo Pull Requests

<RouteEn author="hashman" example="/github/pull/DIYgod/RSSHub" path="/github/pull/:user/:repo" :paramsDesc="['User name', 'Repo name']" radar="1"/>

### User Followers

<RouteEn author="HenryQW" path="/github/user/follower/:user" example="/github/user/followers/HenryQW" :paramsDesc="['GitHub username']" radar="1" />

### Repo Stars

<RouteEn author="HenryQW" path="/github/stars/:user/:repo" example="/github/stars/DIYGod/RSSHub" :paramsDesc="['GitHub username', 'GitHub repo name']" radar="1" />

### Repo Branches

<RouteEn author="max-arnold" example="/github/branches/DIYgod/RSSHub" path="/github/branches/:user/:repo" :paramsDesc="['User name', 'Repo name']" radar="1"/>

### Files Commits

<RouteEn author="zengxs" example="/github/file/DIYgod/RSSHub/master/lib/router.js" path="/github/file/:user/:repo/:branch/:filepath+" :paramsDesc="['User name', 'Repo name', 'Branch name', 'File path']" radar="1">

| User name | Repo name | Branch name | File path       |
| --------- | --------- | ----------- | --------------- |
| `DIYgod`  | `RSSHub`  | `master`    | `lib/router.js` |

> -   If there are special characters such as `/` in the **branch name**, they need to be encoded with urlencode, usually `/` needs to be replaced with `%2f`
> -   If there are special characters in the **file path**, you need to use urlencode to encode them, but the file path can be recognized normally `/` characters
> -   If the **file path** ends with `.rss`, `.atom`, `.json`, you need to replace the `.` in the suffix with `%2e`
>     > Reeder will make an error when subscribing to `% 2erss` or similar suffixes. At this time, add`.rss` after the route to subscribe
>     >
>     > Such as: replace `https://rsshub.app/github/file/DIYgod/RSSHub/master/lib/router%2ejs` to `https://rsshub.app/github/file/DIYgod/RSSHub/master/lib/router%2ejs.rss`

</RouteEn>

### Search Result

<RouteEn author="LogicJake" example="/github/search/RSSHub/bestmatch/desc" path="/github/search/:query/:sort?/:order?" :paramsDesc="['search keyword', 'Sort options (default to bestmatch)','Sort order, desc and asc (desc descending by default)']"/>

| Sort options     | sort      |
| ---------------- | --------- |
| Best match       | bestmatch |
| Most stars       | stars     |
| Most forks       | forks     |
| Recently updated | updated   |

### User Starred Repositories

<RouteEn author="LanceZhu" example="/github/starred_repos/DIYgod" path="/github/starred_repos/:user" :paramsDesc="['User name']" radar="1"/>

## GitLab

### Explore

<RouteEn author="imlonghao" example="/gitlab/explore/trending" path="/gitlab/explore/:type" :paramsDesc="['type']">

| Trending | Most stars | All |
| -------- | ---------- | --- |
| trending | starred    | all |

</RouteEn>

## Hacker News

### Section

<RouteEn author="cf020031308" example="/hackernews/best/comments" path="/hackernews/:section/:type?" :paramsDesc="['Section', 'Link type']">

Website: https://news.ycombinator.com/

| Section | section                             |
| ------- | ----------------------------------- |
| index   | https://news.ycombinator.com/       |
| new     | https://news.ycombinator.com/newest |
| past    | https://news.ycombinator.com/front  |
| ask     | https://news.ycombinator.com/ask    |
| show    | https://news.ycombinator.com/show   |
| jobs    | https://news.ycombinator.com/jobs   |
| best    | https://news.ycombinator.com/best   |

> Official RSS：https://news.ycombinator.com/rss is same as `index` section

| Link type | type                           |
| --------- | ------------------------------ |
| story     | Deault, link to shared address |
| comments  | Link to Hacker News address    |

</RouteEn>

## Hex-Rays

### Hex-Rays News

<Route author="hellodword" example="/hex-rays/news" path="/hex-rays/news">
</Route>

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

## LeetCode

### Articles

<RouteEn author="LogicJake" example="/leetcode/articles" path="/leetcode/articles"/>

### Submission

<RouteEn author="NathanDai" example="/leetcode/submission/us/nathandai" path="/leetcode/submission/:country/:user" :paramsDesc="['country, Chines(cn) and US(us)', 'Username, available at the URL of the LeetCode user homepage']"/>

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

## project-zero issues

### issues

<Route author="hellodword" example="/project-zero-issues" path="/project-zero-issues" />

## Scala

### Scala Blog

<RouteEn author="fengkx" example="/scala/blog/posts" path="/scala/blog/:part?" :paramsDesc="['part']" >
part parmater can be found in the url of blog
</RouteEn>

## Visual Studio Code Marketplace

### Visual Studio Code Plugins Marketplace

<RouteEn author="SeanChao" example="/vscode/marketplace" path="/vscode/marketplace/:category?" :paramsDesc="['Category']">

| Featured | Trending Weekly | Trending Monthly | Trending Daily | Most Popular | Recently Added |
| -------- | --------------- | ---------------- | -------------- | ------------ | -------------- |
| featured | trending        | trending_m       | trending_d     | popular      | new            |

</RouteEn>
