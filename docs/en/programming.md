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

<RouteEn author="dragon-yuan" path="/github/repos/:user" example="/github/repos/DIYgod" :paramsDesc="['GitHub username']" />

### Trending

<RouteEn path="/github/trending/:since/:language?" example="/github/trending/daily/javascript" :paramsDesc="['time frame, available in [Trending page](https://github.com/trending/javascript?since=monthly) \'s URL, possible values are: daily, weekly or monthly', 'the feed language, available in [Trending page](https://github.com/trending/javascript?since=monthly) \'s URL']" />

### Issue

<RouteEn author="HenryQW" path="/github/issue/:user/:repo" example="/github/issue/DIYgod/RSSHub" :paramsDesc="['GitHub username', 'GitHub repo name']" />

### Follower

<RouteEn author="HenryQW" path="/github/user/follower/:user" example="/github/user/followers/HenryQW" :paramsDesc="['GitHub username']" />

### Star

<RouteEn author="HenryQW" path="/github/stars/:user/:repo" example="/github/stars/DIYGod/RSSHub" :paramsDesc="['GitHub username', 'GitHub repo name']" />

## GitLab

### Explore

<RouteEn author="imlonghao" example="/gitlab/explore/trending" path="/gitlab/explore/:type" :paramsDesc="['type']">

| Trending | Most stars | All |
| -------- | ---------- | --- |
| trending | starred    | all |

</RouteEn>
