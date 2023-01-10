---
sidebarDepth: 2
---

# Add the documentation

Now we have finished the code, we need to add the documentation for your route. Open the corresponding file in [documentation (/docs/en/)](https://github.com/DIYgod/RSSHub/blob/master/docs/en) directory which is `docs/en/programming.md` in this example. You can have a live preview of the documentation by running the following command:

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

The whole documentation is built with [VuePress v1](https://vuepress.vuejs.org).

You can add the documentation for your route using Vue components:

-   `author`: route maintainer(s), separated by a single space, should have the same values as [`maintainer.js`](/en/joinus/new-rss/before-start.html#know-the-basics-maintainer-js)
-   `example`: route example, with a leading `/`
-   `path`: route path, should be the same as the key in [`maintainer.js`](/en/joinus/new-rss/before-start.html#know-the-basics-maintainer-js) with the namespace, which is `/github/issue/:user/:repo?` in the above example
-   `:paramsDesc`: route parameter description, in array of string, supports Markdown
    -   description **must** follow the order as they appear in path
