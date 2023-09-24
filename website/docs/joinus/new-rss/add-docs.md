---
sidebar_position: 4
---

# Add documentation

Now that we have completed the code, it's time to add the documentation for your route. Open the appropriate file in the [document (/website/docs)](https://github.com/DIYgod/RSSHub/blob/master/website/docs), which in this example is `website/docs/routes/programming.md`.

In order to preview the documentation in real-time, you need to install the dependencies for the documentation. Run the following command in the **`website` directory**:

<Tabs groupId="package-manager">
<TabItem value="pnpm" label="pnpm" default>

```bash
pnpm i
```

</TabItem>
<TabItem value="yarn" label="yarn">

```bash
yarn
```

</TabItem>
<TabItem value="npm" label="npm">

```bash
npm install
```

</TabItem>
</Tabs>

You can now preview the documentation in real-time by running the following command in the **`website` directory**:

<Tabs groupId="package-manager">
<TabItem value="pnpm" label="pnpm" default>

```bash
pnpm run start
```

</TabItem>
<TabItem value="yarn" label="yarn">

```bash
yarn start
```

</TabItem>
<TabItem value="npm" label="npm">

```bash
npm run start
```

</TabItem>
</Tabs>

:::caution

You cannot switch to other languages in development mode. This is a [technical limitation](https://docusaurus.io/docs/i18n/tutorial#start-your-site) from Docusaurus.

:::

The documentation is written in MDX and rendered with [Docusaurus v2](https://docusaurus.io/docs).

To add documentation to your route, use the `Route` React component. It works like HTML tag. The following are the most commonly used component properties:

-   `author`: The route maintainer(s), separated by a single space. It should be the same as [`maintainer.js`](/joinus/new-rss/before-start#understand-the-basics-maintainer-js)
-   `example`: The route example, with a leading `/`
-   `path`: The route path, which should be the same as the key in [`maintainer.js`](/joinus/new-rss/before-start#understand-the-basics-maintainer-js) with the namespace. In the above example, it is `/github/issue/:user/:repo?`
-   `paramsDesc`: The route parameter description, in an array of strings that support Markdown.
    -   The description **must** follow the order in which they appear in the path.
    -   The number of description should match with the number of parameters in `path`. If you miss a description, the build will fail.
    -   Route parameters ending with `?`, `*` or `+` will be automatically marked as `optional`, `zero or more` or `one or more`, respectively.
    -   Route parameters without a suffix are marked as `required`
    -   There's no need to explicitly mention the necessity of path parameters again.
    -   If a parameter is optional, make sure to mention the default value.

## Documentation examples

### Repo Issues (No parameter)

```tsx
<Route author="HenryQW" example="/sspai/series" path="/sspai/series" />
```

---

<Route author="HenryQW" example="/sspai/series" path="/sspai/series"/>

---

### Repo Issues (Multiple parameters)

```tsx
<Route author="HenryQW" example="/github/issue/DIYgod/RSSHub" path="/github/issue/:user/:repo?" paramsDesc={['GitHub username', 'GitHub repo name, `RSSHub` by default']} />
```

---

<Route author="HenryQW" example="/github/issue/DIYgod/RSSHub" path="/github/issue/:user/:repo?" paramsDesc={['GitHub username', 'GitHub repo name, `RSSHub` by default']} />

---

### Keyword (Description with table)

```tsx
<Route author="DIYgod" example="/pixiv/search/麻衣/popular/2" path="/pixiv/search/:keyword/:order?/:mode?" paramsDesc={['keyword', 'rank mode, empty or other for time order, `popular` for popular order, `date` by default', 'filte R18 content, see table below, empty by default']}>

| only not R18 | only R18 | no filter      |
| ------------ | -------- | -------------- |
| safe         | r18      | empty or other |

</Route>
```

---

<Route author="DIYgod" example="/pixiv/search/麻衣/popular/2" path="/pixiv/search/:keyword/:order?/:mode?" paramsDesc={['keyword', 'rank mode, empty or other for time order, `popular` for popular order, `date` by default', 'filte R18 content, see table below, empty by default']}>

| only not R18 | only R18 | no filter      |
| ------------ | -------- | -------------- |
| safe         | r18      | empty or other |

</Route>

---

### Custom containers

If you'd like to provide additional information about a particular route, you can use these custom containers:

```md
<details>
  <summary>Click to expand</summary>
  This is a detail block. Title is optional and does not support Markdown.
</details>

:::note

This is a note.

:::

:::tip Tips title

Title is optional.

:::

:::info

Supprts Markdown.

:::

:::caution

Add a empty line around the starting and ending directive `:::`

:::

:::danger

Otherwise the content may not be rendered properly.

:::
```

---

<details>
  <summary>Click to expand</summary>
  This is a detail block. Title is optional and does not support Markdown.
</details>

:::note

This is a note.

:::

:::tip Tips title

Title is optional.

:::

:::info

Supprts Markdown.

:::

:::caution

Add a empty line around the starting and ending directive `:::`

:::

:::danger

Otherwise the content may not be rendered properly.

:::

---

### Other components

In addition to the aforementioned component properties, there are several other properties you can use to provide more information about your route:

-   `anticrawler`: set to `1` if the target website has an anti-crawler mechanism.
-   `puppeteer`: set to `1` if the feed uses puppeteer.
-   `radar`: set to `1` if the feed has a radar rule.
-   `rssbud`: set to `1` if the radar rule is also compatible with RSSBud
-   `selfhost`: set to `1` if the feed requires extra configuration through environment variables.
-   `supportBT`: set to `1` if the feed supports BitTorrent.
-   `supportPodcast`: set to `1` if the feed supports podcasts.
-   `supportScihub`: set to `1` if the feed supports Sci-Hub.

By using these properties, you can provide valuable information to users and make it easier for them to understand and use your route. Adding these properties to your route documentation will add a badge in front of it.

```tsx
<Route author="HenryQW" example="/github/issue/DIYgod/RSSHub" path="/github/issue/:user/:repo?" paramsDesc={['GitHub username', 'GitHub repo name, `RSSHub` by default']} anticrawler="1" puppeteer="1" radar="1" rssbud="1" selfhost="1" supportBT="1" supportPodcast="1" supportScihub="1" />
```

---

<Route author="HenryQW" example="/github/issue/DIYgod/RSSHub" path="/github/issue/:user/:repo?" paramsDesc={['GitHub username', 'GitHub repo name, `RSSHub` by default']} anticrawler="1" puppeteer="1" radar="1" rssbud="1" selfhost="1" supportBT="1" supportPodcast="1" supportScihub="1" />

---

## Other things to keep in mind

-   When documenting a route, use a level 3 heading (`###`). If the route documentation doesn't have a main section heading, add a level 2 heading (`##`).
-   Leave a blank line between each heading and the following content. This will help ensure that your documentation can be built successfully.
-   If the documentation contains a large table, it is suggested to put it inside a [details container](/joinus/new-rss/add-docs#documentation-examples-custom-containers)
-   Components can be written in two ways: as a self-closing tag (`<Route .../>`) or as a pair of tags (`<Route>...</Route>`).
-   **Remember to close the tag!**
-   Don't forget to run the following command in the **root directory** of the project to check and format your code before committing and submitting a merge request:

<Tabs groupId="package-manager">
<TabItem value="pnpm" label="pnpm" default>

```bash
pnpm run format
```

</TabItem>
<TabItem value="yarn" label="yarn">

```bash
yarn format
```

</TabItem>
<TabItem value="npm" label="npm">

```bash
npm run format
```

</TabItem>
</Tabs>
