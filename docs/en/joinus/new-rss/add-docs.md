---
sidebarDepth: 2
---

# Add the documentation

Now, we have completed the code, we need to add the documentation for your route. Open the appropriate file in the [documentation (/docs/en/)](https://github.com/DIYgod/RSSHub/blob/master/docs/en) directory, which in this example is `docs/en/programming.md`. You can get a live preview of the documentation by running the following command:

<code-group>
<code-block title="yarn" active>

```bash
yarn docs:dev
```

</code-block>
<code-block title="npm">

```bash
npm run docs:dev
```

</code-block>
</code-group>

The whole documentation is created using [VuePress v1](https://vuepress.vuejs.org).

You can add the documentation to your route using Vue components. They work like HTML tags. The following are the most commonly used components:

-   `author`: route maintainer(s), separated by a single space, should be the same as [`maintainer.js`](/en/joinus/new-rss/before-start.html#know-the-basics-maintainer-js)
-   `example`: route example, with a leading `/`
-   `path`: route path, should be the same as the key in [`maintainer.js`](/en/joinus/new-rss/before-start.html#know-the-basics-maintainer-js) with the namespace, which in the above example is `/github/issue/:user/:repo?`
-   `:paramsDesc`: route parameter description, in array of strings, supports Markdown
    -   description **must** follow the order in which they appear in path
    -   if you miss a description, the build will fail
    -   route parameters ending with `?`, `*` or `+` will be automatically marked as `optional`, `zero or more` or `one or more` respectively
    -   route parameters without a suffix are marked as `required`
    -   no need to explicitly mention the necessity of path parameters again

## Documentation examples

### No parameter

```vue
<RouteEn author="HenryQW" example="/sspai/series" path="/sspai/series" />
```

---

<RouteEn author="HenryQW" example="/sspai/series" path="/sspai/series"/>

---

### Multiple parameters

```vue
<RouteEn author="HenryQW" example="/github/issue/DIYgod/RSSHub" path="/github/issue/:user/:repo?" :paramsDesc="['GitHub username', 'GitHub repo name']" />
```

---

<RouteEn author="HenryQW" example="/github/issue/DIYgod/RSSHub" path="/github/issue/:user/:repo?" :paramsDesc="['GitHub username', 'GitHub repo name']" />

---

### Description with table

```vue
<RouteEn author="DIYgod" example="/pixiv/search/麻衣/popular/2" path="/pixiv/search/:keyword/:order?/:mode?" :paramsDesc="['keyword', 'rank mode, empty or other for time order, popular for popular order', 'filte R18 content, see table below']">

| only not R18 | only R18 | no filter      |
| ------------ | -------- | -------------- |
| safe         | r18      | empty or other |

</RouteEn>
```

---

<RouteEn author="DIYgod" example="/pixiv/search/麻衣/popular/2" path="/pixiv/search/:keyword/:order?/:mode?" :paramsDesc="['keyword', 'rank mode, empty or other for time order, popular for popular order', 'filte R18 content, see table below']">

| only not R18 | only R18 | no filter      |
| ------------ | -------- | -------------- |
| safe         | r18      | empty or other |

</RouteEn>

---

### Custom containers

```md
::: tip Tips title
This is a tip
:::

::: warning Warning title
This is a warning
:::

::: danger Danger title
This is a dangerous warning
:::

::: details Details title
This is a details block
:::
```

---

::: tip Tips title
This is a tip
:::

::: warning Warning title
This is a warning
:::

::: danger Danger title
This is a dangerous warning
:::

::: details Details title
This is a details block
:::

---

### Other components

-   `anticrawler`: set to `1` if the target web site has anti-crawler mechanism
-   `puppeteer`: set to `1` if the feed ues puppeteer
-   `radar`: set to `1` if the feed has radar rule
-   `rssbud`: set to `1` if the radar rule is also compatible with RSSBud
-   `selfhost`: set to `1` if the feed requires extra configuration through environment variables
-   `supportBT`: set to `1` if the feed supports BitTorrent
-   `supportPodcast`: set to `1` if the feed supports podcast
-   `supportScihub`: set to `1` if the feed supports Sci-Hub

Adding these components to your route documentation will add a badge in front of it.

```vue
<RouteEn author="HenryQW" example="/github/issue/DIYgod/RSSHub" path="/github/issue/:user/:repo?" :paramsDesc="['GitHub username', 'GitHub repo name']" anticrawler="1" puppeteer="1" radar="1" rssbud="1" selfhost="1" supportBT="1" supportPodcast="1" supportScihub="1" />
```

---

<RouteEn author="HenryQW" example="/github/issue/DIYgod/RSSHub" path="/github/issue/:user/:repo?" :paramsDesc="['GitHub username', 'GitHub repo name']" anticrawler="1" puppeteer="1" radar="1" rssbud="1" selfhost="1" supportBT="1" supportPodcast="1" supportScihub="1" />

---

## Other things to note

-   Each route documentation should be placed in a level 3 heading(`###`), add a level 2 heading(`##`) if it doesn't have one
-   There should be a blank line between each heading and following contents
-   Components can either be a self-closing tag(`<RouteEn .../>`) or a pair of tag(`<RouteEn>...</RouteEn>`)
-   **Remember to close the tag!**

Run the following command to lint the code before committing and submitting a merge request:

<code-group>
<code-block title="yarn" active>

```bash
yarn format
```

</code-block>
<code-block title="npm">

```bash
npm run format
```

</code-block>
</code-group>
