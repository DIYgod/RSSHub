---
sidebarDepth: 2
---

# Add the documentation

Now, we have completed the code, we need to add the documentation for your route. Open the appropriate file in [documentation (/docs/en/)](https://github.com/DIYgod/RSSHub/blob/master/docs/en) directory, which in this example is `docs/en/programming.md`. You can get a live preview of the documentation by running the following command:

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

You can add the documentation to your route using Vue components:

-   `author`: route maintainer(s), separated by a single space, should be the same as [`maintainer.js`](/en/joinus/new-rss/before-start.html#know-the-basics-maintainer-js)
-   `example`: route example, with a leading `/`
-   `path`: route path, should be the same as the key in [`maintainer.js`](/en/joinus/new-rss/before-start.html#know-the-basics-maintainer-js) with the namespace, which in the above example is `/github/issue/:user/:repo?`
-   `:paramsDesc`: route parameter description, in array of strings, supports Markdown
    -   description **must** follow the order in which they appear in path
