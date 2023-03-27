---
sidebarDepth: 2
---

# Add documentation

Now that we have completed the code, it's time to add the documentation for your route. Open the appropriate file in the [documentation (/docs/en/)](https://github.com/DIYgod/RSSHub/blob/master/docs/en), which in this example is `docs/en/programming.md`. You can preview the documentation in real-time by running the following command:

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

The documentation is written in Markdown and rendered with [VuePress v1](https://v1.vuepress.vuejs.org).

To add documentation to your route, use Vue components. They work like HTML tags. The following are the most commonly used components:

-   `author`: The route maintainer(s), separated by a single space. It should be the same as [`maintainer.js`](/en/joinus/new-rss/before-start.html#understand-the-basics-maintainer-js)
-   `example`: The route example, with a leading `/`
-   `path`: The route path, which should be the same as the key in [`maintainer.js`](/en/joinus/new-rss/before-start.html#understand-the-basics-maintainer-js) with the namespace. In the above example, it is `/github/issue/:user/:repo?`
-   `:paramsDesc`: The route parameter description, in an array of strings that support Markdown.
    -   The description **must** follow the order in which they appear in the path.
    -   The number of description should match with the number of parameters in `path`. If you miss a description, the build will fail.
    -   Route parameters ending with `?`, `*` or `+` will be automatically marked as `optional`, `zero or more` or `one or more`, respectively.
    -   Route parameters without a suffix are marked as `required`
    -   There's no need to explicitly mention the necessity of path parameters again.
    -   If a parameter is optional, make sure to mention the default value.

## Documentation examples

### Repo Issues (No parameter)

```vue
<RouteEn author="HenryQW" example="/sspai/series" path="/sspai/series" />
```

---

<RouteEn author="HenryQW" example="/sspai/series" path="/sspai/series"/>

---

### Repo Issues (Multiple parameters)

```vue
<RouteEn author="HenryQW" example="/github/issue/DIYgod/RSSHub" path="/github/issue/:user/:repo?" :paramsDesc="['GitHub username', 'GitHub repo name, `RSSHub` by default']" />
```

---

<RouteEn author="HenryQW" example="/github/issue/DIYgod/RSSHub" path="/github/issue/:user/:repo?" :paramsDesc="['GitHub username', 'GitHub repo name, `RSSHub` by default']" />

---

### Keyword (Description with table)

```vue
<RouteEn author="DIYgod" example="/pixiv/search/麻衣/popular/2" path="/pixiv/search/:keyword/:order?/:mode?" :paramsDesc="['keyword', 'rank mode, empty or other for time order, `popular` for popular order, `date` by default', 'filte R18 content, see table below, empty by default']">

| only not R18 | only R18 | no filter      |
| ------------ | -------- | -------------- |
| safe         | r18      | empty or other |

</RouteEn>
```

---

<RouteEn author="DIYgod" example="/pixiv/search/麻衣/popular/2" path="/pixiv/search/:keyword/:order?/:mode?" :paramsDesc="['keyword', 'rank mode, empty or other for time order, `popular` for popular order, `date` by default', 'filte R18 content, see table below, empty by default']">

| only not R18 | only R18 | no filter      |
| ------------ | -------- | -------------- |
| safe         | r18      | empty or other |

</RouteEn>

---

### Custom containers

If you'd like to provide additional information about a particular route, you can use these custom containers:

```md
::: tip Tips title
This is a tip.
:::

::: warning Warning title
This is a warning.
:::

::: danger Danger title
This is a dangerous warning.
:::

::: details Details title
This is a details block.
:::
```

---

::: tip Tips title
This is a tip.
:::

::: warning Warning title
This is a warning.
:::

::: danger Danger title
This is a dangerous warning.
:::

::: details Details title
This is a details block.
:::

---

### Other components

In addition to the route components, there are several other components you can use to provide more information about your route:

-   `anticrawler`: set to `1` if the target website has an anti-crawler mechanism.
-   `puppeteer`: set to `1` if the feed uses puppeteer.
-   `radar`: set to `1` if the feed has a radar rule.
-   `rssbud`: set to `1` if the radar rule is also compatible with RSSBud
-   `selfhost`: set to `1` if the feed requires extra configuration through environment variables.
-   `supportBT`: set to `1` if the feed supports BitTorrent.
-   `supportPodcast`: set to `1` if the feed supports podcasts.
-   `supportScihub`: set to `1` if the feed supports Sci-Hub.

By using these components, you can provide valuable information to users and make it easier for them to understand and use your route. Adding these components to your route documentation will add a badge in front of it.

```vue
<RouteEn author="HenryQW" example="/github/issue/DIYgod/RSSHub" path="/github/issue/:user/:repo?" :paramsDesc="['GitHub username', 'GitHub repo name, `RSSHub` by default']" anticrawler="1" puppeteer="1" radar="1" rssbud="1" selfhost="1" supportBT="1" supportPodcast="1" supportScihub="1" />
```

---

<RouteEn author="HenryQW" example="/github/issue/DIYgod/RSSHub" path="/github/issue/:user/:repo?" :paramsDesc="['GitHub username', 'GitHub repo name, `RSSHub` by default']" anticrawler="1" puppeteer="1" radar="1" rssbud="1" selfhost="1" supportBT="1" supportPodcast="1" supportScihub="1" />

---

## Other things to keep in mind

-   When documenting a route, use a level 3 heading (`###`). If the route documentation doesn't have a main section heading, add a level 2 heading (`##`).
-   Leave a blank line between each heading and the following content. This will help ensure that your documentation can be built successfully.
-   If the documentation contains a large table, it is suggested to put it inside a [details container](/en/joinus/new-rss/add-docs.html#documentation-examples-custom-containers)
-   Components can be written in two ways: as a self-closing tag (`<RouteEn .../>`) or as a pair of tags (`<RouteEn>...</RouteEn>`).
-   **Remember to close the tag!**
-   Don't forget to run the following command to check and format your code before committing and submitting a merge request:

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
