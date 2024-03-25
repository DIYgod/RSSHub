# 💻 编程

## A List Apart <Site url="alistapart.com"/>

### Topics <Site url="alistapart.com/articles/" size="sm" />

<Route namespace="alistapart" :data='{"path":"/:topic","categories":["programming"],"example":"/alistapart/application-development","parameters":{"topic":"Any Topic or from the table below. Defaults to All Articles"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["alistapart.com/blog/topic/:topic"]}],"name":"Topics","maintainers":["Rjnishant530"],"url":"alistapart.com/articles/","description":"You have the option to utilize the main heading or use individual categories as topics for the path.\n\n  | **Code**                    | *code*                    |\n  | --------------------------- | ------------------------- |\n  | **Application Development** | *application-development* |\n  | **Browsers**                | *browsers*                |\n  | **CSS**                     | *css*                     |\n  | **HTML**                    | *html*                    |\n  | **JavaScript**              | *javascript*              |\n  | **The Server Side**         | *the-server-side*         |\n\n  | **Content**          | *content*          |\n  | -------------------- | ------------------ |\n  | **Community**        | *community*        |\n  | **Content Strategy** | *content-strategy* |\n  | **Writing**          | *writing*          |\n\n  | **Design**                 | *design*               |\n  | -------------------------- | ---------------------- |\n  | **Brand Identity**         | *brand-identity*       |\n  | **Graphic Design**         | *graphic-design*       |\n  | **Layout & Grids**         | *layout-grids*         |\n  | **Mobile/Multidevice**     | *mobile-multidevice*   |\n  | **Responsive Design**      | *responsive-design*    |\n  | **Typography & Web Fonts** | *typography-web-fonts* |\n\n  | **Industry & Business** | *industry-business* |\n  | ----------------------- | ------------------- |\n  | **Business**            | *business*          |\n  | **Career**              | *career*            |\n  | **Industry**            | *industry*          |\n  | **State of the Web**    | *state-of-the-web*  |\n\n  | **Process**            | *process*            |\n  | ---------------------- | -------------------- |\n  | **Creativity**         | *creativity*         |\n  | **Project Management** | *project-management* |\n  | **Web Strategy**       | *web-strategy*       |\n  | **Workflow & Tools**   | *workflow-tools*     |\n\n  | **User Experience**          | *user-experience*          |\n  | ---------------------------- | -------------------------- |\n  | **Accessibility**            | *accessibility*            |\n  | **Information Architecture** | *information-architecture* |\n  | **Interaction Design**       | *interaction-design*       |\n  | **Usability**                | *usability*                |\n  | **User Research**            | *user-research*            |","location":"topic.ts"}' :test='{"code":0}' />

You have the option to utilize the main heading or use individual categories as topics for the path.

  | **Code**                    | *code*                    |
  | --------------------------- | ------------------------- |
  | **Application Development** | *application-development* |
  | **Browsers**                | *browsers*                |
  | **CSS**                     | *css*                     |
  | **HTML**                    | *html*                    |
  | **JavaScript**              | *javascript*              |
  | **The Server Side**         | *the-server-side*         |

  | **Content**          | *content*          |
  | -------------------- | ------------------ |
  | **Community**        | *community*        |
  | **Content Strategy** | *content-strategy* |
  | **Writing**          | *writing*          |

  | **Design**                 | *design*               |
  | -------------------------- | ---------------------- |
  | **Brand Identity**         | *brand-identity*       |
  | **Graphic Design**         | *graphic-design*       |
  | **Layout & Grids**         | *layout-grids*         |
  | **Mobile/Multidevice**     | *mobile-multidevice*   |
  | **Responsive Design**      | *responsive-design*    |
  | **Typography & Web Fonts** | *typography-web-fonts* |

  | **Industry & Business** | *industry-business* |
  | ----------------------- | ------------------- |
  | **Business**            | *business*          |
  | **Career**              | *career*            |
  | **Industry**            | *industry*          |
  | **State of the Web**    | *state-of-the-web*  |

  | **Process**            | *process*            |
  | ---------------------- | -------------------- |
  | **Creativity**         | *creativity*         |
  | **Project Management** | *project-management* |
  | **Web Strategy**       | *web-strategy*       |
  | **Workflow & Tools**   | *workflow-tools*     |

  | **User Experience**          | *user-experience*          |
  | ---------------------------- | -------------------------- |
  | **Accessibility**            | *accessibility*            |
  | **Information Architecture** | *information-architecture* |
  | **Interaction Design**       | *interaction-design*       |
  | **Usability**                | *usability*                |
  | **User Research**            | *user-research*            |

### Unknown <Site url="alistapart.com/articles/" size="sm" />

<Route namespace="alistapart" :data='{"path":"/","radar":[{"source":["alistapart.com/articles/"],"target":""}],"name":"Unknown","maintainers":["Rjnishant530"],"url":"alistapart.com/articles/","location":"index.ts"}' :test='undefined' />

## AlternativeTo <Site url="www.alternativeto.net"/>

### Platform Software <Site url="www.alternativeto.net" size="sm" />

<Route namespace="alternativeto" :data='{"path":"/platform/:name/:routeParams?","categories":["programming"],"example":"/alternativeto/platform/firefox","parameters":{"name":"Platform name","routeParams":"Filters of software type"},"features":{"requireConfig":false,"requirePuppeteer":true,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.alternativeto.net/platform/:name"],"target":"/platform/:name"}],"name":"Platform Software","maintainers":["JimenezLi"],"description":"> routeParms can be copied from original site URL, example: `/alternativeto/platform/firefox/license=free`","location":"platform.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

> routeParms can be copied from original site URL, example: `/alternativeto/platform/firefox/license=free`

### Software Alternatives <Site url="www.alternativeto.net" size="sm" />

<Route namespace="alternativeto" :data='{"path":"/software/:name/:routeParams?","categories":["programming"],"example":"/alternativeto/software/cpp","parameters":{"name":"Software name","routeParams":"Filters of software type"},"features":{"requireConfig":false,"requirePuppeteer":true,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.alternativeto.net/software/:name"],"target":"/software/:name"}],"name":"Software Alternatives","maintainers":["JimenezLi"],"description":"> routeParms can be copied from original site URL, example: `/alternativeto/software/cpp/license=opensource&platform=windows`","location":"software.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

> routeParms can be copied from original site URL, example: `/alternativeto/software/cpp/license=opensource&platform=windows`

## AtCoder <Site url="atcoder.jp"/>

### Contests Archive <Site url="atcoder.jp" size="sm" />

<Route namespace="atcoder" :data='{"path":"/contest/:language?/:rated?/:category?/:keyword?","categories":["programming"],"example":"/atcoder/contest","parameters":{"language":"Language, `jp` as Japanese or `en` as English, English by default","rated":"Rated Range, see below, all by default","category":"Category, see below, all by default","keyword":"Keyword"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Contests Archive","maintainers":["nczitzk"],"description":"Rated Range\n\n  | ABC Class (Rated for ~1999) | ARC Class (Rated for ~2799) | AGC Class (Rated for ~9999) |\n  | ---------------------------- | ---------------------------- | ---------------------------- |\n  | 1                            | 2                            | 3                            |\n\n  Category\n\n  | All | AtCoder Typical Contest | PAST Archive | Unofficial(unrated) |\n  | --- | ----------------------- | ------------ | ------------------- |\n  | 0   | 6                       | 50           | 101                 |\n\n  | JOI Archive | Sponsored Tournament | Sponsored Parallel(rated) |\n  | ----------- | -------------------- | ------------------------- |\n  | 200         | 1000                 | 1001                      |\n\n  | Sponsored Parallel(unrated) | Optimization Contest |\n  | --------------------------- | -------------------- |\n  | 1002                        | 1200                 |","location":"contest.ts"}' :test='{"code":0}' />

Rated Range

  | ABC Class (Rated for ~1999) | ARC Class (Rated for ~2799) | AGC Class (Rated for ~9999) |
  | ---------------------------- | ---------------------------- | ---------------------------- |
  | 1                            | 2                            | 3                            |

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

### Posts <Site url="atcoder.jp" size="sm" />

<Route namespace="atcoder" :data='{"path":"/post/:language?/:keyword?","categories":["programming"],"example":"/atcoder/post","parameters":{"language":"Language, `jp` as Japanese or `en` as English, English by default","keyword":"Keyword"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Posts","maintainers":["nczitzk"],"location":"post.ts"}' :test='{"code":0}' />

## BBC News Labs <Site url="bbcnewslabs.co.uk"/>

### News <Site url="bbcnewslabs.co.uk/" size="sm" />

<Route namespace="bbcnewslabs" :data='{"path":"/news","categories":["programming"],"example":"/bbcnewslabs/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["bbcnewslabs.co.uk/"]}],"name":"News","maintainers":["elxy"],"url":"bbcnewslabs.co.uk/","location":"news.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

## Bitbucket <Site url="bitbucket.com"/>

### Commits <Site url="bitbucket.com" size="sm" />

<Route namespace="bitbucket" :data='{"path":"/commits/:workspace/:repo_slug","categories":["programming"],"example":"/bitbucket/commits/blaze-lib/blaze","parameters":{"workspace":"Workspace","repo_slug":"Repository"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["bitbucket.com/commits/:workspace/:repo_slug"]}],"name":"Commits","maintainers":["AuroraDysis"],"location":"commits.ts"}' :test='{"code":0}' />

### Tags <Site url="bitbucket.com" size="sm" />

<Route namespace="bitbucket" :data='{"path":"/tags/:workspace/:repo_slug","categories":["programming"],"example":"/bitbucket/tags/blaze-lib/blaze","parameters":{"workspace":"Workspace","repo_slug":"Repository"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Tags","maintainers":["AuroraDysis"],"location":"tags.ts"}' :test='{"code":0}' />

## Bitmovin <Site url="bitmovin.com"/>

### Blog <Site url="bitmovin.com/blog" size="sm" />

<Route namespace="bitmovin" :data='{"path":"/blog","categories":["programming"],"example":"/bitmovin/blog","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["bitmovin.com/blog","bitmovin.com/"]}],"name":"Blog","maintainers":["elxy"],"url":"bitmovin.com/blog","location":"blog.ts"}' :test='{"code":0}' />

## CNCF <Site url="cncf.io"/>

### Category <Site url="cncf.io" size="sm" />

<Route namespace="cncf" :data='{"path":"/:cate?","categories":["programming"],"example":"/cncf","parameters":{"cate":"blog by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Category","maintainers":["Fatpandac"],"description":"| Blog | News | Announcements | Reports |\n  | ---- | ---- | ------------- | ------- |\n  | blog | news | announcements | reports |","location":"index.ts"}' :test='{"code":0}' />

| Blog | News | Announcements | Reports |
  | ---- | ---- | ------------- | ------- |
  | blog | news | announcements | reports |

### Unknown <Site url="cncf.io/reports" size="sm" />

<Route namespace="cncf" :data='{"path":"/reports","radar":[{"source":["cncf.io/reports"]}],"name":"Unknown","maintainers":[],"url":"cncf.io/reports","location":"reports.ts"}' :test='undefined' />

## Codeforces <Site url="codeforces.com"/>

### Latest contests <Site url="www.codeforces.com/contests" size="sm" />

<Route namespace="codeforces" :data='{"path":"/contests","categories":["programming"],"example":"/codeforces/contests","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.codeforces.com/contests"]}],"name":"Latest contests","maintainers":["Fatpandac"],"url":"www.codeforces.com/contests","location":"contests.ts"}' :test='{"code":0}' />

### Recent actions <Site url="codeforces.com/recent-actions" size="sm" />

<Route namespace="codeforces" :data='{"path":"/recent-actions/:minrating?","categories":["programming"],"example":"/codeforces/recent-actions","parameters":{"minrating":"The minimum blog/comment rating required. Default: 1"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["codeforces.com/recent-actions"],"target":"/recent-actions"}],"name":"Recent actions","maintainers":[],"url":"codeforces.com/recent-actions","location":"recent-actions.ts"}' :test='{"code":0}' />

## dbaplus社群 <Site url="dbaplus.cn"/>

### 最新文章 <Site url="dbaplus.cn/" size="sm" />

<Route namespace="dbaplus" :data='{"path":"/","categories":["programming"],"example":"/dbaplus","radar":[{"source":["dbaplus.cn/"]}],"name":"最新文章","maintainers":["cnkmmk"],"url":"dbaplus.cn/","location":"rss.ts"}' :test='{"code":0}' />

## deeplearning.ai <Site url="www.deeplearning.ai"/>

### TheBatch 周报 <Site url="www.deeplearning.ai/thebatch" size="sm" />

<Route namespace="deeplearning" :data='{"path":"/thebatch","categories":["programming"],"example":"/deeplearning/thebatch","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.deeplearning.ai/thebatch","www.deeplearning.ai/"]}],"name":"TheBatch 周报","maintainers":["nczitzk","juvenn"],"url":"www.deeplearning.ai/thebatch","location":"thebatch.ts"}' :test='{"code":0}' />

## gihyo.jp <Site url="gihyo.jp"/>

### Series <Site url="gihyo.jp" size="sm" />

<Route namespace="gihyo" :data='{"path":"/list/group/:id","categories":["programming"],"example":"/gihyo/list/group/Ubuntu-Weekly-Recipe","parameters":{"id":"Series"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["gihyo.jp/list/group/:id"]}],"name":"Series","maintainers":["masakichi"],"location":"group.ts"}' :test='{"code":0}' />

## Gitee <Site url="gitee.com"/>

### 仓库提交 <Site url="gitee.com" size="sm" />

<Route namespace="gitee" :data='{"path":"/commits/:owner/:repo","categories":["programming"],"example":"/gitee/commits/y_project/RuoYi","parameters":{"owner":"用户名","repo":"仓库名"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["gitee.com/:owner/:repo/commits"]}],"name":"仓库提交","maintainers":["TonyRL"],"location":"repos/commits.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

### 仓库动态 <Site url="gitee.com" size="sm" />

<Route namespace="gitee" :data='{"path":"/events/:owner/:repo","categories":["programming"],"example":"/gitee/events/y_project/RuoYi","parameters":{"owner":"用户名","repo":"仓库名"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["gitee.com/:owner/:repo"]}],"name":"仓库动态","maintainers":["TonyRL"],"location":"repos/events.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

### 仓库 Releases <Site url="gitee.com" size="sm" />

<Route namespace="gitee" :data='{"path":"/releases/:owner/:repo","categories":["programming"],"example":"/gitee/releases/y_project/RuoYi","parameters":{"owner":"用户名","repo":"仓库名"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["gitee.com/:owner/:repo/releases"]}],"name":"仓库 Releases","maintainers":["TonyRL"],"location":"repos/releases.ts"}' :test='{"code":0}' />

### 用户公开动态 <Site url="gitee.com" size="sm" />

<Route namespace="gitee" :data='{"path":"/events/:username","categories":["programming"],"example":"/gitee/events/y_project","parameters":{"username":"用户名"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["gitee.com/:username"]}],"name":"用户公开动态","maintainers":["TonyRL"],"location":"users/events.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

## GitHub <Site url="github.com"/>

:::tip
GitHub provides some official RSS feeds:

-   Repo releases: `https://github.com/:owner/:repo/releases.atom`
-   Repo commits: `https://github.com/:owner/:repo/commits.atom`
-   User activities: `https://github.com/:user.atom`
-   Private feed: `https://github.com/:user.private.atom?token=:secret` (You can find **Subscribe to your news feed** in [dashboard](https://github.com) page after login)
-   Wiki history: `https://github.com/:owner/:repo/wiki.atom`
:::

### Gist Commits <Site url="github.com" size="sm" />

<Route namespace="github" :data='{"path":"/gist/:gistId","categories":["programming"],"example":"/github/gist/d2c152bb7179d07015f336b1a0582679","parameters":{"gistId":"Gist ID"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["gist.github.com/:owner/:gistId/revisions","gist.github.com/:owner/:gistId/stargazers","gist.github.com/:owner/:gistId/forks","gist.github.com/:owner/:gistId"]}],"name":"Gist Commits","maintainers":["TonyRL"],"location":"gist.ts"}' :test='{"code":0}' />

### Issue / Pull Request comments <Site url="github.com" size="sm" />

<Route namespace="github" :data='{"path":"/comments/:user/:repo/:number?","categories":["programming"],"example":"/github/comments/DIYgod/RSSHub/8116","parameters":{"user":"User / Org name","repo":"Repo name","number":"Issue or pull number (if omitted: all)"},"radar":[{"source":["github.com/:user/:repo/:type","github.com/:user/:repo/:type/:number"],"target":"/comments/:user/:repo/:number?"}],"name":"Issue / Pull Request comments","maintainers":["TonyRL","FliegendeWurst"],"location":"comments.ts"}' :test='{"code":0}' />

### Notifications <Site url="github.com/notifications" size="sm" />

<Route namespace="github" :data='{"path":"/notifications","categories":["programming"],"example":"/github/notifications","parameters":{},"features":{"requireConfig":[{"name":"GITHUB_ACCESS_TOKEN","description":""}],"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["github.com/notifications"]}],"name":"Notifications","maintainers":["zhzy0077"],"url":"github.com/notifications","location":"notifications.ts"}' :test='undefined' />

### Repo Branches <Site url="github.com" size="sm" />

<Route namespace="github" :data='{"path":"/branches/:user/:repo","categories":["programming"],"example":"/github/branches/DIYgod/RSSHub","parameters":{"user":"User name","repo":"Repo name"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["github.com/:user/:repo/branches","github.com/:user/:repo"]}],"name":"Repo Branches","maintainers":["max-arnold"],"location":"branches.ts"}' :test='{"code":0}' />

### Repo Contributors <Site url="github.com" size="sm" />

<Route namespace="github" :data='{"path":"/contributors/:user/:repo/:order?/:anon?","categories":["programming"],"example":"/github/contributors/DIYgod/RSSHub","parameters":{"user":"User name","repo":"Repo name","order":"Sort order by commit numbers, desc and asc (descending by default)","anon":"Show anonymous users. Defaults to no, use any values for yes."},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["github.com/:user/:repo/graphs/contributors","github.com/:user/:repo"],"target":"/contributors/:user/:repo"}],"name":"Repo Contributors","maintainers":["zoenglinghou"],"location":"contributors.ts"}' :test='{"code":0}' />

### Repo Issues <Site url="github.com" size="sm" />

<Route namespace="github" :data='{"path":"/issue/:user/:repo/:state?/:labels?","categories":["programming"],"example":"/github/issue/vuejs/core/all/wontfix","parameters":{"user":"GitHub username","repo":"GitHub repo name","state":"the state of the issues. Can be either `open`, `closed`, or `all`. Default: `open`.","labels":"a list of comma separated label names"},"radar":[{"source":["github.com/:user/:repo/issues","github.com/:user/:repo/issues/:id","github.com/:user/:repo"],"target":"/issue/:user/:repo"}],"name":"Repo Issues","maintainers":["HenryQW","AndreyMZ"],"location":"issue.ts"}' :test='{"code":0}' />

### Repo Pull Requests <Site url="github.com" size="sm" />

<Route namespace="github" :data='{"path":"/pull/:user/:repo/:state?/:labels?","categories":["programming"],"example":"/github/pull/DIYgod/RSSHub","parameters":{"user":"User name","repo":"Repo name","state":"the state of pull requests. Can be either `open`, `closed`, or `all`. Default: `open`.","labels":"a list of comma separated label names"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["github.com/:user/:repo/pulls","github.com/:user/:repo/pulls/:id","github.com/:user/:repo"],"target":"/pull/:user/:repo"}],"name":"Repo Pull Requests","maintainers":[],"location":"pulls.ts"}' :test='{"code":0}' />

### Repo Pulse <Site url="github.com" size="sm" />

<Route namespace="github" :data='{"path":"/pulse/:user/:repo/:period?","categories":["programming"],"example":"/github/pulse/DIYgod/RSSHub","parameters":{"user":"User name","repo":"Repo name","period":"Time frame, selected from a repository&#39;s Pulse/Insights page. Possible values are: `daily`, `halfweekly`, `weekly`, or `monthly`. Default: `weekly`. If your RSS client supports it, consider aligning the polling frequency of the feed to the period."},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["github.com/:user/:repo/pulse","github.com/:user/:repo/pulse/:period"]}],"name":"Repo Pulse","maintainers":["jameschensmith"],"location":"pulse.ts"}' :test='{"code":0}' />

### Repo Stars <Site url="github.com" size="sm" />

<Route namespace="github" :data='{"path":"/stars/:user/:repo","categories":["programming"],"example":"/github/stars/DIYGod/RSSHub","parameters":{"user":"GitHub username","repo":"GitHub repo name"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["github.com/:user/:repo/stargazers","github.com/:user/:repo"]}],"name":"Repo Stars","maintainers":["HenryQW"],"location":"star.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### Search Result <Site url="github.com" size="sm" />

<Route namespace="github" :data='{"path":"/search/:query/:sort?/:order?","categories":["programming"],"example":"/github/search/RSSHub/bestmatch/desc","parameters":{"query":"search keyword","sort":"Sort options (default to bestmatch)","order":"Sort order, desc and asc (desc descending by default)"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Search Result","maintainers":["LogicJake"],"description":"| Sort options     | sort      |\n  | ---------------- | --------- |\n  | Best match       | bestmatch |\n  | Most stars       | stars     |\n  | Most forks       | forks     |\n  | Recently updated | updated   |","location":"search.ts"}' :test='{"code":0}' />

| Sort options     | sort      |
  | ---------------- | --------- |
  | Best match       | bestmatch |
  | Most stars       | stars     |
  | Most forks       | forks     |
  | Recently updated | updated   |

### Topics <Site url="github.com/topics" size="sm" />

<Route namespace="github" :data='{"path":"/topics/:name/:qs?","categories":["programming"],"example":"/github/topics/framework","parameters":{"name":"Topic name, which can be found in the URL of the corresponding [Topics Page](https://github.com/topics/framework)","qs":"Query string, like `l=php&o=desc&s=stars`. Details listed as follows:"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["github.com/topics"]}],"name":"Topics","maintainers":["queensferryme"],"url":"github.com/topics","description":"| Parameter | Description      | Values                                                                                                                          |\n  | --------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |\n  | `l`       | Language         | For instance `php`, which can be found in the URL of the corresponding [Topics page](https://github.com/topics/framework?l=php) |\n  | `o`       | Sorting Order    | `asc`, `desc`                                                                                                                   |\n  | `s`       | Sorting Criteria | `stars`, `forks`, `updated`                                                                                                     |\n\n  For instance, the `/github/topics/framework/l=php&o=desc&s=stars` route will generate the RSS feed corresponding to this [page](https://github.com/topics/framework?l=php&o=desc&s=stars).","location":"topic.ts"}' :test='{"code":0}' />

| Parameter | Description      | Values                                                                                                                          |
  | --------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
  | `l`       | Language         | For instance `php`, which can be found in the URL of the corresponding [Topics page](https://github.com/topics/framework?l=php) |
  | `o`       | Sorting Order    | `asc`, `desc`                                                                                                                   |
  | `s`       | Sorting Criteria | `stars`, `forks`, `updated`                                                                                                     |

  For instance, the `/github/topics/framework/l=php&o=desc&s=stars` route will generate the RSS feed corresponding to this [page](https://github.com/topics/framework?l=php&o=desc&s=stars).

### Trending <Site url="github.com/trending" size="sm" />

<Route namespace="github" :data='{"path":"/trending/:since/:language/:spoken_language?","categories":["programming"],"example":"/github/trending/daily/javascript/en","parameters":{"since":"time frame, available in [Trending page](https://github.com/trending/javascript?since=monthly) &#39;s URL, possible values are: `daily`, `weekly` or `monthly`","language":"the feed language, available in [Trending page](https://github.com/trending/javascript?since=monthly) &#39;s URL, don&#39;t filter option is `any`","spoken_language":"natural language, available in [Trending page](https://github.com/trending/javascript?since=monthly) &#39;s URL"},"features":{"requireConfig":[{"name":"GITHUB_ACCESS_TOKEN","description":""}],"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["github.com/trending"],"target":"/trending/:since"}],"name":"Trending","maintainers":["DIYgod","jameschensmith"],"url":"github.com/trending","location":"trending.ts"}' :test='undefined' />

### Unknown <Site url="github.com" size="sm" />

<Route namespace="github" :data='{"path":"/file/:user/:repo/:branch/:filepath{.+}","radar":[{"source":["github.com/:user/:repo/blob/:branch/*filepath"],"target":"/file/:user/:repo/:branch/:filepath"}],"name":"Unknown","maintainers":[],"location":"file.ts"}' :test='undefined' />

### User Followers <Site url="github.com" size="sm" />

<Route namespace="github" :data='{"path":"/user/followers/:user","categories":["programming"],"example":"/github/user/followers/HenryQW","parameters":{"user":"GitHub username"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["github.com/:user"]}],"name":"User Followers","maintainers":["HenryQW"],"location":"follower.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### User Repo <Site url="github.com" size="sm" />

<Route namespace="github" :data='{"path":"/repos/:user","categories":["programming"],"example":"/github/repos/DIYgod","parameters":{"user":"GitHub username"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["github.com/:user"]}],"name":"User Repo","maintainers":["DIYgod"],"location":"repos.ts"}' :test='{"code":0}' />

### User Starred Repositories <Site url="github.com" size="sm" />

<Route namespace="github" :data='{"path":"/starred_repos/:user","categories":["programming"],"example":"/github/starred_repos/DIYgod","parameters":{"user":"User name"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["github.com/:user"]}],"name":"User Starred Repositories","maintainers":["LanceZhu"],"location":"starred-repos.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### Wiki History <Site url="github.com" size="sm" />

<Route namespace="github" :data='{"path":"/wiki/:user/:repo/:page?","categories":["programming"],"example":"/github/wiki/flutter/flutter/Roadmap","parameters":{"user":"User / Org name","repo":"Repo name","page":"Page slug, can be found in URL, empty means Home"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["github.com/:user/:repo/wiki/:page/_history","github.com/:user/:repo/wiki/:page","github.com/:user/:repo/wiki/_history","github.com/:user/:repo/wiki"],"target":"/wiki/:user/:repo/:page"}],"name":"Wiki History","maintainers":["TonyRL"],"location":"wiki.ts"}' :test='{"code":0}' />

## Gitpod <Site url="gitpod.io"/>

### Blog <Site url="gitpod.io/blog" size="sm" />

<Route namespace="gitpod" :data='{"path":"/blog","categories":["programming"],"example":"/gitpod/blog","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["gitpod.io/blog","gitpod.io/"]}],"name":"Blog","maintainers":["TonyRL"],"url":"gitpod.io/blog","location":"blog.ts"}' :test='{"code":1,"message":"expected NaN to be greater than -432000000"}' />

### Changelog <Site url="gitpod.io/changelog" size="sm" />

<Route namespace="gitpod" :data='{"path":"/changelog","categories":["programming"],"example":"/gitpod/changelog","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["gitpod.io/changelog","gitpod.io/"]}],"name":"Changelog","maintainers":["TonyRL"],"url":"gitpod.io/changelog","location":"changelog.ts"}' :test='{"code":0}' />

## GoCN <Site url="gocn.vip"/>

### Unknown <Site url="gocn.vip/" size="sm" />

<Route namespace="gocn" :data='{"path":["/","/news"],"name":"Unknown","maintainers":["AtlanCI","CcccFz"],"url":"gocn.vip/","location":"news.ts"}' :test='undefined' />

### Unknown <Site url="gocn.vip/" size="sm" />

<Route namespace="gocn" :data='{"path":["/","/news"],"name":"Unknown","maintainers":["AtlanCI","CcccFz"],"url":"gocn.vip/","location":"news.ts"}' :test='undefined' />

### 每日新闻 <Site url="gocn.vip/" size="sm" />

<Route namespace="gocn" :data='{"path":"/topics","categories":["programming"],"example":"/gocn/topics","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["gocn.vip/"]}],"name":"每日新闻","maintainers":["AtlanCI","CcccFz"],"url":"gocn.vip/","location":"topics.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

### 招聘 <Site url="gocn.vip/" size="sm" />

<Route namespace="gocn" :data='{"path":"/jobs","categories":["programming"],"example":"/gocn/jobs","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["gocn.vip/"]}],"name":"招聘","maintainers":["AtlanCI","CcccFz"],"url":"gocn.vip/","location":"jobs.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

## Go 语言中文网 <Site url="studygolang.com"/>

### 板块 <Site url="studygolang.com" size="sm" />

<Route namespace="studygolang" :data='{"path":"/go/:id?","categories":["programming"],"example":"/studygolang/go/daily","parameters":{"id":"板块 id，默认为周刊"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["studygolang.com/go/:id","studygolang.com/"]}],"name":"板块","maintainers":["nczitzk"],"location":"go.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

### 招聘 <Site url="studygolang.com" size="sm" />

<Route namespace="studygolang" :data='{"path":"/jobs","categories":["programming"],"example":"/studygolang/jobs","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"招聘","maintainers":["CcccFz","nczitzk"],"location":"jobs.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

### 周刊 <Site url="studygolang.com" size="sm" />

<Route namespace="studygolang" :data='{"path":"/weekly","categories":["programming"],"example":"/studygolang/weekly","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"周刊","maintainers":["CWeilet","nczitzk"],"location":"weekly.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

## Hacker News <Site url="ycombinator.com"/>

### 用户 <Site url="ycombinator.com" size="sm" />

<Route namespace="hackernews" :data='{"path":"/:section?/:type?/:user?","categories":["programming"],"example":"/hackernews/threads/comments_list/dang","parameters":{"section":"内容分区，见上表，默认为 `index`","type":"链接类型，见上表，默认为 `sources`","user":"设定用户，只在 `threads` 和 `submitted` 分区有效"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["ycombinator.com/:section","ycombinator.com/"]}],"name":"用户","maintainers":["nczitzk","xie-dongping"],"description":"订阅特定用户的内容","location":"index.ts"}' :test='{"code":0}' />

订阅特定用户的内容

## Hacking8 <Site url="hacking8.com"/>

### 搜索 <Site url="hacking8.com" size="sm" />

<Route namespace="hacking8" :data='{"path":"/search/:keyword?","categories":["programming"],"example":"/hacking8/search/rsshub","parameters":{"keyword":"关键字，默认为空"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["hacking8.com/index/:category","hacking8.com/"],"target":"/:category?"}],"name":"搜索","maintainers":["nczitzk"],"location":"search.ts"}' :test='{"code":0}' />

### 信息流 <Site url="hacking8.com" size="sm" />

<Route namespace="hacking8" :data='{"path":"/:category?","categories":["programming"],"example":"/hacking8","parameters":{"category":"分类，见下表，默认为最近更新"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["hacking8.com/index/:category","hacking8.com/"]}],"name":"信息流","maintainers":["nczitzk"],"description":"| 推荐  | 最近更新 | 漏洞 / PoC 监控 | PDF |\n  | ----- | -------- | --------------- | --- |\n  | likes | index    | vul-poc         | pdf |","location":"index.ts"}' :test='{"code":0}' />

| 推荐  | 最近更新 | 漏洞 / PoC 监控 | PDF |
  | ----- | -------- | --------------- | --- |
  | likes | index    | vul-poc         | pdf |

## HackMD <Site url="hackmd.io"/>

### Profile <Site url="hackmd.io" size="sm" />

<Route namespace="hackmd" :data='{"path":"/profile/:path","categories":["programming"],"example":"/hackmd/profile/hackmd","parameters":{"path":"userpath or teampath"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Profile","maintainers":["Yukaii","kaiix"],"location":"profile.ts"}' :test='{"code":0}' />

## HelloGitHub <Site url="hellogithub.com"/>

### Unknown <Site url="hellogithub.com" size="sm" />

<Route namespace="hellogithub" :data='{"path":["/ranking/:type?","/report/:type?"],"name":"Unknown","maintainers":["moke8","nczitzk"],"description":"| 编程语言 | 服务器   | 数据库     |\n  | -------- | -------- | ---------- |\n  | tiobe    | netcraft | db-engines |","location":"report.ts"}' :test='undefined' />

| 编程语言 | 服务器   | 数据库     |
  | -------- | -------- | ---------- |
  | tiobe    | netcraft | db-engines |

### Unknown <Site url="hellogithub.com" size="sm" />

<Route namespace="hellogithub" :data='{"path":["/ranking/:type?","/report/:type?"],"name":"Unknown","maintainers":["moke8","nczitzk"],"description":"| 编程语言 | 服务器   | 数据库     |\n  | -------- | -------- | ---------- |\n  | tiobe    | netcraft | db-engines |","location":"report.ts"}' :test='undefined' />

| 编程语言 | 服务器   | 数据库     |
  | -------- | -------- | ---------- |
  | tiobe    | netcraft | db-engines |

### Unknown <Site url="hellogithub.com" size="sm" />

<Route namespace="hellogithub" :data='{"path":["/month","/volume"],"name":"Unknown","maintainers":["moke8","nczitzk"],"location":"volume.ts"}' :test='undefined' />

### Unknown <Site url="hellogithub.com" size="sm" />

<Route namespace="hellogithub" :data='{"path":["/month","/volume"],"name":"Unknown","maintainers":["moke8","nczitzk"],"location":"volume.ts"}' :test='undefined' />

### 文章 <Site url="hellogithub.com" size="sm" />

<Route namespace="hellogithub" :data='{"path":["/article/:sort?/:id?","/:sort?/:id?"],"categories":["programming"],"example":"/hellogithub/article","parameters":{"sort":"排序方式，见下表，默认为 `hot`，即热门","id":"标签 id，可在对应标签页 URL 中找到，默认为全部标签"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"文章","maintainers":["moke8","nczitzk"],"description":"| 热门 | 最近 |\n  | ---- | ---- |\n  | hot  | last |","location":"index.ts"}' :test='{"code":0}' />

| 热门 | 最近 |
  | ---- | ---- |
  | hot  | last |

### 文章 <Site url="hellogithub.com" size="sm" />

<Route namespace="hellogithub" :data='{"path":["/article/:sort?/:id?","/:sort?/:id?"],"categories":["programming"],"example":"/hellogithub/article","parameters":{"sort":"排序方式，见下表，默认为 `hot`，即热门","id":"标签 id，可在对应标签页 URL 中找到，默认为全部标签"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"文章","maintainers":["moke8","nczitzk"],"description":"| 热门 | 最近 |\n  | ---- | ---- |\n  | hot  | last |","location":"index.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

| 热门 | 最近 |
  | ---- | ---- |
  | hot  | last |

## Hex-Rays <Site url="hex-rays.com"/>

### Hex-Rays News <Site url="hex-rays.com/" size="sm" />

<Route namespace="hex-rays" :data='{"path":"/news","categories":["programming"],"example":"/hex-rays/news","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["hex-rays.com/","hex-rays.com/blog"]}],"name":"Hex-Rays News","maintainers":["hellodword ","TonyRL"],"url":"hex-rays.com/","location":"index.ts"}' :test='undefined' />

## Huggingface <Site url="huggingface.co"/>

### Daily Papers <Site url="huggingface.co/papers" size="sm" />

<Route namespace="huggingface" :data='{"path":"/daily-papers","categories":["programming"],"example":"/huggingface/daily-papers","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["huggingface.co/papers","huggingface.co/"]}],"name":"Daily Papers","maintainers":["zeyugao"],"url":"huggingface.co/papers","location":"daily-papers.ts"}' :test='{"code":0}' />

### 中文博客 <Site url="huggingface.co/blog/zh" size="sm" />

<Route namespace="huggingface" :data='{"path":"/blog-zh","categories":["programming"],"example":"/huggingface/blog-zh","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["huggingface.co/blog/zh","huggingface.co/"]}],"name":"中文博客","maintainers":["zcf0508"],"url":"huggingface.co/blog/zh","location":"blog-zh.ts"}' :test='{"code":0}' />

## Issue Hunt <Site url="issuehunt.io"/>

### Project Funded <Site url="issuehunt.io" size="sm" />

<Route namespace="issuehunt" :data='{"path":"/funded/:username/:repo","categories":["programming"],"example":"/issuehunt/funded/DIYgod/RSSHub","parameters":{"username":"Github user/org","repo":"Repository name"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Project Funded","maintainers":["running-grass"],"location":"funded.ts"}' :test='{"code":0}' />

## Kong API 网关平台 <Site url="konghq.com"/>

[Kong](https://konghq.com/) 是一家开源的 API 网关服务商，此处收集其官网的最新博客文章。

### 博客最新文章 <Site url="konghq.com/blog/*" size="sm" />

<Route namespace="konghq" :data='{"path":"/blog-posts","categories":["programming"],"example":"/konghq/blog-posts","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["konghq.com/blog/*"]}],"name":"博客最新文章","maintainers":["piglei"],"url":"konghq.com/blog/*","location":"blog-posts.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

## LeetCode <Site url="leetcode.com"/>

### Articles <Site url="leetcode.com/articles" size="sm" />

<Route namespace="leetcode" :data='{"path":"/articles","categories":["programming"],"example":"/leetcode/articles","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["leetcode.com/articles"]}],"name":"Articles","maintainers":["LogicJake"],"url":"leetcode.com/articles","location":"articles.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### Unknown <Site url="leetcode.cn/" size="sm" />

<Route namespace="leetcode" :data='{"path":"/dailyquestion/cn","radar":[{"source":["leetcode.cn/"]}],"name":"Unknown","maintainers":[],"url":"leetcode.cn/","location":"dailyquestion-cn.ts"}' :test='undefined' />

### Unknown <Site url="leetcode.com/" size="sm" />

<Route namespace="leetcode" :data='{"path":"/dailyquestion/en","radar":[{"source":["leetcode.com/"]}],"name":"Unknown","maintainers":[],"url":"leetcode.com/","location":"dailyquestion-en.ts"}' :test='undefined' />

### Unknown <Site url="leetcode.cn/" size="sm" />

<Route namespace="leetcode" :data='{"path":"/dailyquestion/solution/cn","radar":[{"source":["leetcode.cn/"]}],"name":"Unknown","maintainers":[],"url":"leetcode.cn/","location":"dailyquestion-solution-cn.ts"}' :test='undefined' />

### Unknown <Site url="leetcode.com/" size="sm" />

<Route namespace="leetcode" :data='{"path":"/dailyquestion/solution/en","radar":[{"source":["leetcode.com/"]}],"name":"Unknown","maintainers":[],"url":"leetcode.com/","location":"dailyquestion-solution-en.ts"}' :test='undefined' />

## ModelScope 魔搭社区 <Site url="modelscope.cn"/>

### DevPress 官方社区 <Site url="community.modelscope.cn/" size="sm" />

<Route namespace="modelscope" :data='{"path":"/community","categories":["programming"],"example":"/modelscope/community","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["community.modelscope.cn/"]}],"name":"DevPress 官方社区","maintainers":["TonyRL"],"url":"community.modelscope.cn/","location":"community.ts"}' :test='{"code":0}' />

### 创空间 <Site url="modelscope.cn/studios" size="sm" />

<Route namespace="modelscope" :data='{"path":"/studios","categories":["programming"],"example":"/modelscope/studios","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["modelscope.cn/studios"]}],"name":"创空间","maintainers":["TonyRL"],"url":"modelscope.cn/studios","location":"studios.ts"}' :test='{"code":0}' />

### 模型库 <Site url="modelscope.cn/models" size="sm" />

<Route namespace="modelscope" :data='{"path":"/models","categories":["programming"],"example":"/modelscope/models","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["modelscope.cn/models"]}],"name":"模型库","maintainers":["TonyRL"],"url":"modelscope.cn/models","location":"models.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### 数据集 <Site url="modelscope.cn/datasets" size="sm" />

<Route namespace="modelscope" :data='{"path":"/datasets","categories":["programming"],"example":"/modelscope/datasets","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["modelscope.cn/datasets"]}],"name":"数据集","maintainers":["TonyRL"],"url":"modelscope.cn/datasets","location":"datasets.ts"}' :test='{"code":0}' />

## MySQL <Site url="dev.mysql.com"/>

### Release Notes <Site url="dev.mysql.com" size="sm" />

<Route namespace="mysql" :data='{"path":"/release/:version?","categories":["programming"],"example":"/mysql/release/8.0","parameters":{"version":"Version, see below, 8.0 by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"Release Notes","maintainers":["nczitzk"],"description":"| 8.0 | 5.7 | 5.6 |\n  | --- | --- | --- |","location":"release.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

| 8.0 | 5.7 | 5.6 |
  | --- | --- | --- |

## Node.js <Site url="nodejs.org"/>

### News <Site url="nodejs.org" size="sm" />

<Route namespace="nodejs" :data='{"path":"/blog/:language?","categories":["programming"],"example":"/nodejs/blog","parameters":{"language":"Language, see below, en by default"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["nodejs.org/:language/blog","nodejs.org/"]}],"name":"News","maintainers":["nczitzk"],"description":"| العربية | Catalan | Deutsch | Español | زبان فارسی |\n  | ------- | ------- | ------- | ------- | ---------- |\n  | ar      | ca      | de      | es      | fa         |\n\n  | Français | Galego | Italiano | 日本語 | 한국어 |\n  | -------- | ------ | -------- | ------ | ------ |\n  | fr       | gl     | it       | ja     | ko     |\n\n  | Português do Brasil | limba română | Русский | Türkçe | Українська |\n  | ------------------- | ------------ | ------- | ------ | ---------- |\n  | pt-br               | ro           | ru      | tr     | uk         |\n\n  | 简体中文 | 繁體中文 |\n  | -------- | -------- |\n  | zh-cn    | zh-tw    |","location":"blog.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

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

## NOSEC 安全讯息平台 <Site url="nosec.org"/>

### Posts <Site url="nosec.org" size="sm" />

<Route namespace="nosec" :data='{"path":"/:keykind?","categories":["programming"],"example":"/nosec/hole","parameters":{"keykind":"对应文章分类"},"name":"Posts","maintainers":["hellodword"],"description":"  | 分类     | 标识       |\n    | :------- | :--------- |\n    | 威胁情报 | `threaten` |\n    | 安全动态 | `security` |\n    | 漏洞预警 | `hole`     |\n    | 数据泄露 | `leakage`  |\n    | 专题报告 | `speech`   |\n    | 技术分析 | `skill`    |\n    | 安全工具 | `tool`     |","radar":[{"source":["nosec.org/home/index/:keykind","nosec.org/home/index"]}],"location":"index.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

  | 分类     | 标识       |
    | :------- | :--------- |
    | 威胁情报 | `threaten` |
    | 安全动态 | `security` |
    | 漏洞预警 | `hole`     |
    | 数据泄露 | `leakage`  |
    | 专题报告 | `speech`   |
    | 技术分析 | `skill`    |
    | 安全工具 | `tool`     |

## Quicker <Site url="getquicker.net"/>

### Unknown <Site url="getquicker.net/Help/Versions" size="sm" />

<Route namespace="quicker" :data='{"path":["/update","/versions"],"name":"Unknown","maintainers":["Cesaryuan","nczitzk"],"url":"getquicker.net/Help/Versions","location":"versions.ts"}' :test='undefined' />

### Unknown <Site url="getquicker.net/Help/Versions" size="sm" />

<Route namespace="quicker" :data='{"path":["/update","/versions"],"name":"Unknown","maintainers":["Cesaryuan","nczitzk"],"url":"getquicker.net/Help/Versions","location":"versions.ts"}' :test='undefined' />

### 动作分享 <Site url="getquicker.net" size="sm" />

<Route namespace="quicker" :data='{"path":"/share/:category?","categories":["programming"],"example":"/quicker/share/Recent","parameters":{"category":"分类，见下表，默认为动作库最新更新"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["getquicker.net/Share/:category","getquicker.net/"]}],"name":"动作分享","maintainers":["nczitzk"],"description":"| 动作库最新更新 | 动作库最多赞 | 动作库新动作 | 动作库最近赞 |\n  | -------------- | ------------ | ------------ | ------------ |\n  | Recent         | Recommended  | NewActions   | RecentLiked  |\n\n  | 子程序      | 扩展热键  | 文本指令     |\n  | ----------- | --------- | ------------ |\n  | SubPrograms | PowerKeys | TextCommands |","location":"share.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

| 动作库最新更新 | 动作库最多赞 | 动作库新动作 | 动作库最近赞 |
  | -------------- | ------------ | ------------ | ------------ |
  | Recent         | Recommended  | NewActions   | RecentLiked  |

  | 子程序      | 扩展热键  | 文本指令     |
  | ----------- | --------- | ------------ |
  | SubPrograms | PowerKeys | TextCommands |

### 讨论区 <Site url="getquicker.net" size="sm" />

<Route namespace="quicker" :data='{"path":"/qa/:category?/:state?","categories":["programming"],"example":"/quicker/qa","parameters":{"category":"分类，见下表，默认为全部","state":"状态，见下表，默认为全部"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"讨论区","maintainers":["Cesaryuan","nczitzk"],"description":"分类\n\n  | 使用问题 | 动作开发 | BUG 反馈 | 功能建议 |\n  | -------- | -------- | -------- | -------- |\n  | 1        | 9        | 3        | 4        |\n\n  | 动作需求 | 经验创意 | 动作推荐 | 信息发布 |\n  | -------- | -------- | -------- | -------- |\n  | 6        | 2        | 7        | 5        |\n\n  | 随便聊聊 | 异常报告 | 全部 |\n  | -------- | -------- | ---- |\n  | 8        | 10       | all  |\n\n  状态\n\n  | 全部 | 精华   | 已归档  |\n  | ---- | ------ | ------- |\n  |      | digest | achived |","location":"qa.ts"}' :test='{"code":0}' />

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

### 用户更新 <Site url="getquicker.net" size="sm" />

<Route namespace="quicker" :data='{"path":"/user/:category/:id","categories":["programming"],"example":"/quicker/user/Actions/3-CL","parameters":{"category":"分类，见下表","id":"用户 id，可在对应用户页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"用户更新","maintainers":["Cesaryuan","nczitzk"],"description":"| 动作    | 子程序      | 动作单      |\n  | ------- | ----------- | ----------- |\n  | Actions | SubPrograms | ActionLists |","location":"user.ts"}' :test='{"code":1,"message":"expected NaN to be greater than -432000000"}' />

| 动作    | 子程序      | 动作单      |
  | ------- | ----------- | ----------- |
  | Actions | SubPrograms | ActionLists |

## Reactiflux <Site url="reactiflux.com"/>

### Transcripts <Site url="reactiflux.com/transcripts" size="sm" />

<Route namespace="reactiflux" :data='{"path":"/transcripts","name":"Transcripts","url":"reactiflux.com/transcripts","maintainers":["nczitzk"],"example":"/reactiflux/transcripts","categories":["programming"],"radar":[{"source":["www.reactiflux.com/transcripts"],"target":"/transcripts"}],"location":"transcripts.ts"}' :test='{"code":0}' />

## Rust 语言中文社区 <Site url="rustcc.cn"/>

### 新闻/聚合 <Site url="rustcc.cn/" size="sm" />

<Route namespace="rustcc" :data='{"path":"/news","categories":["programming"],"example":"/rustcc/news","radar":[{"source":["rustcc.cn/"]}],"name":"新闻/聚合","maintainers":["zhenlohuang"],"url":"rustcc.cn/","location":"news.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

### 招聘 <Site url="rustcc.cn/" size="sm" />

<Route namespace="rustcc" :data='{"path":"/jobs","categories":["programming"],"example":"/rustcc/jobs","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["rustcc.cn/"]}],"name":"招聘","maintainers":["CcccFz"],"url":"rustcc.cn/","location":"jobs.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

## SecWiki - 安全维基 <Site url="www.sec-wiki.com"/>

### 最新周刊 <Site url="www.sec-wiki.com" size="sm" />

<Route namespace="sec-wiki" :data='{"path":"/weekly","categories":["programming"],"example":"/sec-wiki/weekly","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"最新周刊","maintainers":["p7e4"],"location":"weekly.ts"}' :test='undefined' />

## SegmentFault <Site url="segmentfault.com"/>

### 博客 <Site url="segmentfault.com" size="sm" />

<Route namespace="segmentfault" :data='{"path":"/blogs/:tag","categories":["programming"],"example":"/segmentfault/blogs/go","parameters":{"tag":"标签名称，在 [标签](https://segmentfault.com/tags) 中可以找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["segmentfault.com/t/:tag/blogs"]}],"name":"博客","maintainers":["shiluanzzz"],"location":"blogs.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### 频道 <Site url="segmentfault.com" size="sm" />

<Route namespace="segmentfault" :data='{"path":"/channel/:name","categories":["programming"],"example":"/segmentfault/channel/frontend","parameters":{"name":"频道名称，在频道 URL 可以找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["segmentfault.com/channel/:name"]}],"name":"频道","maintainers":["LogicJake","Fatpandac"],"location":"channel.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### 用户 <Site url="segmentfault.com" size="sm" />

<Route namespace="segmentfault" :data='{"path":"/user/:name","categories":["programming"],"example":"/segmentfault/user/minnanitkong","parameters":{"name":"用户 Id，用户详情页 URL 可以找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["segmentfault.com/u/:name"]}],"name":"用户","maintainers":["leyuuu","Fatpandac"],"location":"user.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

## Smashing Magazine <Site url="smashingmagazine.com"/>

### Category <Site url="smashingmagazine.com/articles/" size="sm" />

<Route namespace="smashingmagazine" :data='{"path":"/:category?","categories":["programming"],"example":"/smashingmagazine/react","parameters":{"category":"Find in URL or Table below"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["smashingmagazine.com/category/:category"],"target":"/:category"}],"name":"Category","maintainers":["Rjnishant530"],"url":"smashingmagazine.com/articles/","description":"| **Category**       |                    |\n  | ------------------ | ------------------ |\n  | Accessibility      | accessibility      |\n  | Best practices     | best-practices     |\n  | Business           | business           |\n  | Career             | career             |\n  | Checklists         | checklists         |\n  | CSS                | css                |\n  | Data Visualization | data-visualization |\n  | Design             | design             |\n  | Design Patterns    | design-patterns    |\n  | Design Systems     | design-systems     |\n  | E-Commerce         | e-commerce         |\n  | Figma              | figma              |\n  | Freebies           | freebies           |\n  | HTML               | html               |\n  | Illustrator        | illustrator        |\n  | Inspiration        | inspiration        |\n  | JavaScript         | javascript         |\n  | Mobile             | mobile             |\n  | Performance        | performance        |\n  | Privacy            | privacy            |\n  | React              | react              |\n  | Responsive Design  | responsive-design  |\n  | Round-Ups          | round-ups          |\n  | SEO                | seo                |\n  | Typography         | typography         |\n  | Tools              | tools              |\n  | UI                 | ui                 |\n  | Usability          | usability          |\n  | UX                 | ux                 |\n  | Vue                | vue                |\n  | Wallpapers         | wallpapers         |\n  | Web Design         | web-design         |\n  | Workflow           | workflow           |","location":"category.ts"}' :test='{"code":0}' />

| **Category**       |                    |
  | ------------------ | ------------------ |
  | Accessibility      | accessibility      |
  | Best practices     | best-practices     |
  | Business           | business           |
  | Career             | career             |
  | Checklists         | checklists         |
  | CSS                | css                |
  | Data Visualization | data-visualization |
  | Design             | design             |
  | Design Patterns    | design-patterns    |
  | Design Systems     | design-systems     |
  | E-Commerce         | e-commerce         |
  | Figma              | figma              |
  | Freebies           | freebies           |
  | HTML               | html               |
  | Illustrator        | illustrator        |
  | Inspiration        | inspiration        |
  | JavaScript         | javascript         |
  | Mobile             | mobile             |
  | Performance        | performance        |
  | Privacy            | privacy            |
  | React              | react              |
  | Responsive Design  | responsive-design  |
  | Round-Ups          | round-ups          |
  | SEO                | seo                |
  | Typography         | typography         |
  | Tools              | tools              |
  | UI                 | ui                 |
  | Usability          | usability          |
  | UX                 | ux                 |
  | Vue                | vue                |
  | Wallpapers         | wallpapers         |
  | Web Design         | web-design         |
  | Workflow           | workflow           |

## web.dev <Site url="web.dev"/>

### Articles <Site url="web.dev" size="sm" />

<Route namespace="web" :data='{"path":"/articles","categories":["programming"],"example":"/web/articles","radar":[{"source":["web.dev/articles"]}],"name":"Articles","maintainers":["KarasuShin"],"location":"articles.ts"}' :test='{"code":0}' />

### Blog <Site url="web.dev" size="sm" />

<Route namespace="web" :data='{"path":"/blog","categories":["programming"],"example":"/web/blog","radar":[{"source":["web.dev/blog"]}],"name":"Blog","maintainers":["KarasuShin"],"location":"blog.ts"}' :test='{"code":0}' />

### Series <Site url="web.dev" size="sm" />

<Route namespace="web" :data='{"path":"/series/:seriesName","parameters":{"seriesName":"topic name in the series section"},"categories":["programming"],"example":"/web/series/new-to-the-web","radar":[{"source":["web.dev/series/:seriesName"],"target":"/series/:seriesName"}],"name":"Series","maintainers":["KarasuShin"],"description":":::tip\n    The `seriesName` can be extracted from the Series page URL: `https://web.dev/series/:seriesName`\n:::","location":"series.ts"}' :test='{"code":0}' />

:::tip
    The `seriesName` can be extracted from the Series page URL: `https://web.dev/series/:seriesName`
:::

## 阿里云 <Site url="developer.aliyun.com"/>

### 公告 <Site url="developer.aliyun.com" size="sm" />

<Route namespace="aliyun" :data='{"path":"/notice/:type?","categories":["programming"],"example":"/aliyun/notice","parameters":{"type":"N"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"公告","maintainers":["muzea"],"description":"| 类型     | type |\n  | -------- | ---- |\n  | 全部     |      |\n  | 升级公告 | 1    |\n  | 安全公告 | 2    |\n  | 备案公告 | 3    |\n  | 其他     | 4    |","location":"notice.ts"}' :test='{"code":0}' />

| 类型     | type |
  | -------- | ---- |
  | 全部     |      |
  | 升级公告 | 1    |
  | 安全公告 | 2    |
  | 备案公告 | 3    |
  | 其他     | 4    |

### 开发者社区 - 主题 <Site url="developer.aliyun.com" size="sm" />

<Route namespace="aliyun" :data='{"path":"/developer/group/:type","categories":["programming"],"example":"/aliyun/developer/group/alitech","parameters":{"type":"对应技术领域分类"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["developer.aliyun.com/group/:type"]}],"name":"开发者社区 - 主题","maintainers":["umm233"],"location":"developer/group.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### 数据库内核月报 <Site url="mysql.taobao.org/monthly" size="sm" />

<Route namespace="aliyun" :data='{"path":"/database_month","categories":["programming"],"example":"/aliyun/database_month","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["mysql.taobao.org/monthly","mysql.taobao.org/"]}],"name":"数据库内核月报","maintainers":["junbaor"],"url":"mysql.taobao.org/monthly","location":"database-month.ts"}' :test='{"code":0}' />

## 安全客 <Site url="anquanke.com"/>

:::tip
官方提供了混合的主页资讯 RSS: [https://api.anquanke.com/data/v1/rss](https://api.anquanke.com/data/v1/rss)
:::

### 分类订阅 <Site url="anquanke.com" size="sm" />

<Route namespace="anquanke" :data='{"path":"/:category/:fulltext?","categories":["programming"],"example":"/anquanke/week","parameters":{"category":"分类订阅","fulltext":"是否获取全文，如需获取全文参数传入 `quanwen` 或 `fulltext`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"分类订阅","maintainers":["qwertyuiop6"],"description":"| 360 网络安全周报 | 活动     | 知识      | 资讯 | 招聘 | 工具 |\n  | ---------------- | -------- | --------- | ---- | ---- | ---- |\n  | week             | activity | knowledge | news | job  | tool |","location":"category.ts"}' :test='{"code":0}' />

| 360 网络安全周报 | 活动     | 知识      | 资讯 | 招聘 | 工具 |
  | ---------------- | -------- | --------- | ---- | ---- | ---- |
  | week             | activity | knowledge | news | job  | tool |

## 安全内参 <Site url="secrss.com"/>

### 分类 <Site url="secrss.com" size="sm" />

<Route namespace="secrss" :data='{"path":"/category/:category?","categories":["programming"],"example":"/secrss/category/产业趋势","parameters":{"category":"N"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"分类","maintainers":["XinRoom","SunBK201"],"location":"category.ts"}' :test='{"code":0}' />

### 作者 <Site url="secrss.com" size="sm" />

<Route namespace="secrss" :data='{"path":"/author/:author","categories":["programming"],"example":"/secrss/author/网络安全威胁和漏洞信息共享平台","parameters":{"author":"N"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"作者","maintainers":["XinRoom","SunBK201"],"location":"author.ts"}' :test='{"code":0}' />

## 北京智源人工智能研究院 <Site url="hub.baai.ac.cn"/>

### Unknown <Site url="hub.baai.ac.cn" size="sm" />

<Route namespace="baai" :data='{"path":["/hub/:tagId/:sort?/:range?","/hub/:tagId/:sort?","/hub/:sort?"],"name":"Unknown","maintainers":[],"location":"hub.ts"}' :test='undefined' />

### Unknown <Site url="hub.baai.ac.cn" size="sm" />

<Route namespace="baai" :data='{"path":["/hub/:tagId/:sort?/:range?","/hub/:tagId/:sort?","/hub/:sort?"],"name":"Unknown","maintainers":[],"location":"hub.ts"}' :test='undefined' />

### Unknown <Site url="hub.baai.ac.cn" size="sm" />

<Route namespace="baai" :data='{"path":["/hub/:tagId/:sort?/:range?","/hub/:tagId/:sort?","/hub/:sort?"],"name":"Unknown","maintainers":[],"location":"hub.ts"}' :test='undefined' />

### 智源社区 - 评论 <Site url="hub.baai.ac.cn/comments" size="sm" />

<Route namespace="baai" :data='{"path":"/hub/comments","categories":["programming"],"example":"/baai/hub/comments","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["hub.baai.ac.cn/comments","hub.baai.ac.cn/"]}],"name":"智源社区 - 评论","maintainers":["TonyRL"],"url":"hub.baai.ac.cn/comments","location":"comments.ts"}' :test='{"code":0}' />

### 智源社区 - 活动 <Site url="hub.baai.ac.cn/events" size="sm" />

<Route namespace="baai" :data='{"path":"/hub/events","categories":["programming"],"example":"/baai/hub/events","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["hub.baai.ac.cn/events","hub.baai.ac.cn/"]}],"name":"智源社区 - 活动","maintainers":["TonyRL"],"url":"hub.baai.ac.cn/events","location":"events.ts"}' :test='{"code":0}' />

## 登链社区 <Site url="learnblockchain.cn"/>

### 文章 <Site url="learnblockchain.cn" size="sm" />

<Route namespace="learnblockchain" :data='{"path":"/posts/:cid/:sort?","categories":["programming"],"example":"/learnblockchain/posts/DApp/newest","parameters":{"cid":"分类id,更多分类可以论坛的URL找到","sort":"排序方式，默认精选"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"文章","maintainers":["running-grass"],"description":"| id       | 分类         |\n  | -------- | ------------ |\n  | all      | 全部         |\n  | DApp     | 去中心化应用 |\n  | chains   | 公链         |\n  | 联盟链   | 联盟链       |\n  | scaling  | Layer2       |\n  | langs    | 编程语言     |\n  | security | 安全         |\n  | dst      | 存储         |\n  | basic    | 理论研究     |\n  | other    | 其他         |\n\n  | id       | 排序方式    |\n  | -------- | ----------- |\n  | newest   | 最新        |\n  | featured | 精选 (默认) |\n  | featured | 最赞        |\n  | hottest  | 最热        |","location":"posts.ts"}' :test='{"code":0}' />

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

## 极术社区 <Site url="www.aijishu"/>

### 频道、专栏、用户 <Site url="www.aijishu" size="sm" />

<Route namespace="aijishu" :data='{"path":"/:type/:name?","categories":["programming"],"example":"/aijishu/channel/ai","parameters":{"type":"文章类型，可以取值如下","name":"名字，取自URL"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"频道、专栏、用户","maintainers":[],"description":"| type    | 说明 |\n  | ------- | ---- |\n  | channel | 频道 |\n  | blog    | 专栏 |\n  | u       | 用户 |","location":"index.ts"}' :test='{"code":0}' />

| type    | 说明 |
  | ------- | ---- |
  | channel | 频道 |
  | blog    | 专栏 |
  | u       | 用户 |

## 技术头条 <Site url="blogread.cn"/>

### 最新文章 <Site url="blogread.cn" size="sm" />

<Route namespace="blogread" :data='{"path":"/newest","categories":["programming"],"example":"/blogread/newest","radar":[{"source":["blogread.cn/news/newest.php"]}],"name":"最新文章","maintainers":["fashioncj"],"location":"index.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

## 掘金 <Site url="juejin.cn"/>

### 标签 <Site url="juejin.cn" size="sm" />

<Route namespace="juejin" :data='{"path":"/tag/:tag","categories":["programming"],"example":"/juejin/tag/JavaScript","parameters":{"tag":"标签名，可在标签 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["juejin.cn/tag/:tag"]}],"name":"标签","maintainers":["isheng5"],"location":"tag.ts"}' :test='{"code":0}' />

### 单个收藏夹 <Site url="juejin.cn" size="sm" />

<Route namespace="juejin" :data='{"path":"/collection/:collectionId","categories":["programming"],"example":"/juejin/collection/6845243180586123271","parameters":{"collectionId":"收藏夹唯一标志符, 在浏览器地址栏URL中能够找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["juejin.cn/collection/:collectionId"]}],"name":"单个收藏夹","maintainers":["isQ"],"location":"collection.ts"}' :test='{"code":0}' />

### 沸点 <Site url="juejin.cn" size="sm" />

<Route namespace="juejin" :data='{"path":"/pins/:type?","categories":["programming"],"example":"/juejin/pins/6824710202487472141","parameters":{"type":"默认为 recommend，见下表"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"沸点","maintainers":["xyqfer","laampui"],"description":"| 推荐      | 热门 | 上班摸鱼            | 内推招聘            | 一图胜千言          | 今天学到了          | 每天一道算法题      | 开发工具推荐        | 树洞一下            |\n  | --------- | ---- | ------------------- | ------------------- | ------------------- | ------------------- | ------------------- | ------------------- | ------------------- |\n  | recommend | hot  | 6824710203301167112 | 6819970850532360206 | 6824710202487472141 | 6824710202562969614 | 6824710202378436621 | 6824710202000932877 | 6824710203112423437 |","location":"pins.ts"}' :test='{"code":0}' />

| 推荐      | 热门 | 上班摸鱼            | 内推招聘            | 一图胜千言          | 今天学到了          | 每天一道算法题      | 开发工具推荐        | 树洞一下            |
  | --------- | ---- | ------------------- | ------------------- | ------------------- | ------------------- | ------------------- | ------------------- | ------------------- |
  | recommend | hot  | 6824710203301167112 | 6819970850532360206 | 6824710202487472141 | 6824710202562969614 | 6824710202378436621 | 6824710202000932877 | 6824710203112423437 |

### 分类 <Site url="juejin.cn" size="sm" />

<Route namespace="juejin" :data='{"path":"/category/:category","categories":["programming"],"example":"/juejin/category/frontend","parameters":{"category":"分类名"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"分类","maintainers":["DIYgod"],"description":"| 后端    | 前端     | Android | iOS | 人工智能 | 开发工具 | 代码人生 | 阅读    |\n  | ------- | -------- | ------- | --- | -------- | -------- | -------- | ------- |\n  | backend | frontend | android | ios | ai       | freebie  | career   | article |","location":"category.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

| 后端    | 前端     | Android | iOS | 人工智能 | 开发工具 | 代码人生 | 阅读    |
  | ------- | -------- | ------- | --- | -------- | -------- | -------- | ------- |
  | backend | frontend | android | ios | ai       | freebie  | career   | article |

### 热门 <Site url="juejin.cn" size="sm" />

<Route namespace="juejin" :data='{"path":"/trending/:category/:type","categories":["programming"],"example":"/juejin/trending/ios/monthly","parameters":{"category":"分类名","type":"类型"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"热门","maintainers":["moaix"],"description":"| category | 标签     |\n  | -------- | -------- |\n  | android  | Android  |\n  | frontend | 前端     |\n  | ios      | iOS      |\n  | backend  | 后端     |\n  | design   | 设计     |\n  | product  | 产品     |\n  | freebie  | 工具资源 |\n  | article  | 阅读     |\n  | ai       | 人工智能 |\n  | devops   | 运维     |\n  | all      | 全部     |\n\n  | type       | 类型     |\n  | ---------- | -------- |\n  | weekly     | 本周最热 |\n  | monthly    | 本月最热 |\n  | historical | 历史最热 |","location":"trending.ts"}' :test='{"code":0}' />

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

### 收藏集 <Site url="juejin.cn" size="sm" />

<Route namespace="juejin" :data='{"path":"/collections/:userId","categories":["programming"],"example":"/juejin/collections/1697301682482439","parameters":{"userId":"用户唯一标志符, 在浏览器地址栏URL中能够找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["juejin.cn/user/:id","juejin.cn/user/:id/collections"],"target":"/collections/:id"}],"name":"收藏集","maintainers":["isQ"],"location":"favorites.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

### 小册 <Site url="juejin.cn/books" size="sm" />

<Route namespace="juejin" :data='{"path":"/books","categories":["programming"],"example":"/juejin/books","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["juejin.cn/books"]}],"name":"小册","maintainers":["xyqfer"],"url":"juejin.cn/books","description":"> 掘金小册需要付费订阅，RSS 仅做更新提醒，不含付费内容.","location":"books.ts"}' :test='{"code":0}' />

> 掘金小册需要付费订阅，RSS 仅做更新提醒，不含付费内容.

### 用户文章 <Site url="juejin.cn" size="sm" />

<Route namespace="juejin" :data='{"path":"/posts/:id","categories":["programming"],"example":"/juejin/posts/3051900006845944","parameters":{"id":"用户 id, 可在用户页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["juejin.cn/user/:id","juejin.cn/user/:id/posts"]}],"name":"用户文章","maintainers":["Maecenas"],"location":"posts.ts"}' :test='{"code":0}' />

### 专栏 <Site url="juejin.cn" size="sm" />

<Route namespace="juejin" :data='{"path":"/column/:id","categories":["programming"],"example":"/juejin/column/6960559453037199391","parameters":{"id":"专栏 id, 可在专栏页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["juejin.cn/column/:id"]}],"name":"专栏","maintainers":["xiangzy1"],"location":"column.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

## 开源中国 <Site url="oschina.net"/>

### 数字型账号用户博客 <Site url="oschina.net" size="sm" />

<Route namespace="oschina" :data='{"path":["/u/:uid","/user/:id"],"categories":["programming"],"example":"/oschina/u/3920392","parameters":{"uid":"用户 id，可通过查看用户博客网址得到，以 u/数字结尾，数字即为 id"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["my.oschina.net/u/:uid"]}],"name":"数字型账号用户博客","maintainers":[],"location":"user.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

### 数字型账号用户博客 <Site url="oschina.net" size="sm" />

<Route namespace="oschina" :data='{"path":["/u/:uid","/user/:id"],"categories":["programming"],"example":"/oschina/u/3920392","parameters":{"uid":"用户 id，可通过查看用户博客网址得到，以 u/数字结尾，数字即为 id"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["my.oschina.net/u/:uid"]}],"name":"数字型账号用户博客","maintainers":[],"location":"user.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### 问答主题 <Site url="oschina.net" size="sm" />

<Route namespace="oschina" :data='{"path":"/topic/:topic","categories":["programming"],"example":"/oschina/topic/weekly-news","parameters":{"topic":"主题名，可从 [全部主题](https://www.oschina.net/question/topics) 进入主题页，在 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["oschina.net/question/topic/:topic"]}],"name":"问答主题","maintainers":["loveely7"],"location":"topic.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

### 资讯 <Site url="oschina.net" size="sm" />

<Route namespace="oschina" :data='{"path":"/news/:category?","categories":["programming"],"example":"/oschina/news/project","parameters":{"category":"板块名"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["oschina.net/news/:category"],"target":"/news/:category"}],"name":"资讯","maintainers":["tgly307","zengxs"],"description":"| [综合资讯][osc_gen] | [软件更新资讯][osc_proj] | [行业资讯][osc_ind] | [编程语言资讯][osc_pl] |\n  | ------------------- | ------------------------ | ------------------- | ---------------------- |\n  | industry            | project                  | industry-news       | programming            |\n\n  订阅 [全部板块资讯][osc_all] 可以使用 [https://rsshub.app/oschina/news](https://rsshub.app/oschina/news)\n\n  [osc_all]: https://www.oschina.net/news \"开源中国 - 全部资讯\"\n\n  [osc_gen]: https://www.oschina.net/news/industry \"开源中国 - 综合资讯\"\n\n  [osc_proj]: https://www.oschina.net/news/project \"开源中国 - 软件更新资讯\"\n\n  [osc_ind]: https://www.oschina.net/news/industry-news \"开源中国 - 行业资讯\"\n\n  [osc_pl]: https://www.oschina.net/news/programming \"开源中国 - 编程语言资讯\"","location":"news.ts"}' :test='{"code":1,"message":"Test timed out in 10000ms.\nIf this is a long-running test, pass a timeout value as the last argument or configure it globally with \"testTimeout\"."}' />

| [综合资讯][osc_gen] | [软件更新资讯][osc_proj] | [行业资讯][osc_ind] | [编程语言资讯][osc_pl] |
  | ------------------- | ------------------------ | ------------------- | ---------------------- |
  | industry            | project                  | industry-news       | programming            |

  订阅 [全部板块资讯][osc_all] 可以使用 [https://rsshub.app/oschina/news](https://rsshub.app/oschina/news)

  [osc_all]: https://www.oschina.net/news "开源中国 - 全部资讯"

  [osc_gen]: https://www.oschina.net/news/industry "开源中国 - 综合资讯"

  [osc_proj]: https://www.oschina.net/news/project "开源中国 - 软件更新资讯"

  [osc_ind]: https://www.oschina.net/news/industry-news "开源中国 - 行业资讯"

  [osc_pl]: https://www.oschina.net/news/programming "开源中国 - 编程语言资讯"

## 蓝桥云课 <Site url="lanqiao.cn"/>

### 技术社区 <Site url="lanqiao.cn/questions/" size="sm" />

<Route namespace="lanqiao" :data='{"path":"/questions/:id","categories":["programming"],"example":"/lanqiao/questions/2","parameters":{"id":"topic_id 主题 `id` 可在社区板块 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["lanqiao.cn/questions/","lanqiao.cn/questions/topics/:id"]}],"name":"技术社区","maintainers":["huhuhang"],"url":"lanqiao.cn/questions/","location":"questions.ts"}' :test='{"code":0}' />

### 全站发布的课程 <Site url="lanqiao.cn" size="sm" />

<Route namespace="lanqiao" :data='{"path":"/courses/:sort/:tag","categories":["programming"],"example":"/lanqiao/courses/latest/all","parameters":{"sort":"排序规则 sort, 默认(`default`)、最新(`latest`)、最热(`hotest`)","tag":"课程标签 `tag`，可在该页面找到：https://www.lanqiao.cn/courses/"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":true,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"全站发布的课程","maintainers":["huhuhang"],"location":"courses.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### 作者发布的课程 <Site url="lanqiao.cn" size="sm" />

<Route namespace="lanqiao" :data='{"path":"/author/:uid","categories":["programming"],"example":"/lanqiao/author/1701267","parameters":{"uid":"作者 `uid` 可在作者主页 URL 中找到"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["lanqiao.cn/users/:uid"]}],"name":"作者发布的课程","maintainers":["huhuhang"],"location":"author.ts"}' :test='{"code":0}' />

## 洛谷 <Site url="luogu.com.cn"/>

### 比赛列表 <Site url="luogu.com.cn/contest/list" size="sm" />

<Route namespace="luogu" :data='{"path":"/contest","categories":["programming"],"example":"/luogu/contest","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["luogu.com.cn/contest/list","luogu.com.cn/"]}],"name":"比赛列表","maintainers":["prnake"],"url":"luogu.com.cn/contest/list","location":"contest.ts"}' :test='{"code":1,"message":"expected -967073558 to be greater than -432000000"}' />

### 日报 <Site url="luogu.com.cn/discuss/47327" size="sm" />

<Route namespace="luogu" :data='{"path":"/daily/:id?","categories":["programming"],"example":"/luogu/daily","parameters":{"id":"年度日报所在帖子 id，可在 URL 中找到，不填默认为 `47327`"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["luogu.com.cn/discuss/47327","luogu.com.cn/"],"target":"/daily"}],"name":"日报","maintainers":["LogicJake ","prnake ","nczitzk"],"url":"luogu.com.cn/discuss/47327","location":"daily.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### 用户博客 <Site url="luogu.com.cn" size="sm" />

<Route namespace="luogu" :data='{"path":"/user/blog/:name","categories":["programming"],"example":"/luogu/user/blog/ftiasch","parameters":{"name":"博客名称"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["luogu.com.cn/blog/:name"]}],"name":"用户博客","maintainers":[],"location":"user-blog.ts"}' :test='{"code":1,"message":"expected 503 to be 200 // Object.is equality"}' />

### 用户动态 <Site url="luogu.com.cn" size="sm" />

<Route namespace="luogu" :data='{"path":"/user/feed/:uid","categories":["programming"],"example":"/luogu/user/feed/1","parameters":{"uid":"用户 UID"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["luogu.com.cn/user/:uid"]}],"name":"用户动态","maintainers":["solstice23"],"location":"user-feed.ts"}' :test='{"code":0}' />

## 墨天轮 <Site url="modb.pro"/>

### 合辑 <Site url="modb.pro" size="sm" />

<Route namespace="modb" :data='{"path":"/topic/:id","categories":["programming"],"example":"/modb/topic/44158","parameters":{"id":"合辑序号"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"name":"合辑","maintainers":["yueneiqi"],"location":"topic.ts"}' :test='{"code":0}' />

## 前端早早聊 <Site url="www.zaozao.run"/>

### 文章 <Site url="www.zaozao.run" size="sm" />

<Route namespace="zaozao" :data='{"path":"/article/:type?","categories":["programming"],"example":"/zaozao/article/quality","parameters":{"type":"文章分类"},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["www.zaozao.run/article/:type"],"target":"/article/:type"}],"name":"文章","maintainers":["shaomingbo"],"description":"| 精品推荐  | 技术干货 | 职场成长 | 社区动态  | 组件物料 | 行业动态 |\n  | --------- | -------- | -------- | --------- | -------- | -------- |\n  | recommend | quality  | growth   | community | material | industry |","location":"article.ts"}' :test='{"code":0}' />

| 精品推荐  | 技术干货 | 职场成长 | 社区动态  | 组件物料 | 行业动态 |
  | --------- | -------- | -------- | --------- | -------- | -------- |
  | recommend | quality  | growth   | community | material | industry |

## 微信小程序 <Site url="posts.careerengine.us"/>

:::tip
公众号直接抓取困难，故目前提供几种间接抓取方案，请自行选择
:::

### Unknown <Site url="mp.data258.com/" size="sm" />

<Route namespace="wechat" :data='{"path":"/data258/:id?","radar":[{"source":["mp.data258.com/","mp.data258.com/article/category/:id"]}],"name":"Unknown","maintainers":["Rongronggg9"],"url":"mp.data258.com/","location":"data258.ts"}' :test='undefined' />

### 公众平台系统公告栏目 <Site url="mp.weixin.qq.com/cgi-bin/announce" size="sm" />

<Route namespace="wechat" :data='{"path":"/announce","categories":["programming"],"example":"/wechat/announce","parameters":{},"features":{"requireConfig":false,"requirePuppeteer":false,"antiCrawler":false,"supportBT":false,"supportPodcast":false,"supportScihub":false},"radar":[{"source":["mp.weixin.qq.com/cgi-bin/announce"]}],"name":"公众平台系统公告栏目","maintainers":["xyqfer"],"url":"mp.weixin.qq.com/cgi-bin/announce","location":"announce.ts"}' :test='{"code":0}' />

## 印记中文 <Site url="docschina.org"/>

### 周刊 - JavaScript <Site url="docschina.org" size="sm" />

<Route namespace="docschina" :data='{"path":"/weekly/:category?","categories":["programming"],"example":"/docschina/weekly","parameters":{"category":"周刊分类，见下表，默认为js"},"name":"周刊 - JavaScript","maintainers":["daijinru","hestudy"],"description":"| javascript | node | react |\n    | ---------- | ---- | ----- |\n    | js         | node | react |","radar":[{"source":["docschina.org/news/weekly/js/*","docschina.org/news/weekly/js","docschina.org/"],"target":"/jsweekly"}],"location":"weekly.ts"}' :test='{"code":0}' />

| javascript | node | react |
    | ---------- | ---- | ----- |
    | js         | node | react |

