---
sidebarDepth: 0
---
# Debugging

When debugging your code, you can use more than just `console.log` or attaching the node process to a debugger. Another option is to use `ctx.state.json` to provide a custom object for debugging.

## Using `ctx.state.json`

To pass a custom object to ctx.state.json for debugging, follow these steps:

1.  Create your custom object.
2.  Assign your object to `ctx.state.json`.
3.  Access the corresponding route + `.debug.json` to view your object. For example, if you want to debug the route `/furstar/characters/:lang?`, you can access the URL: `/furstar/characters/en.debug.json`

Here's an example of how to use `ctx.state.json` taken from [furstar/index.js](https://github.com/DIYgod/RSSHub/blob/master/lib/v2/furstar/index.js)

```js
const info = utils.fetchAllCharacters(res.data, base);

ctx.state.json = {
    info,
};
```

In the example above, we're passing the `info` object to `ctx.state.json`, which we can then access using the corresponding route + `.debug.json`.
