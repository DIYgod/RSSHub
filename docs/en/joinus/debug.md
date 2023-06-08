---
sidebarDepth: 0
---
# Debugging

When debugging your code, you can use more than just `console.log` or attaching the node process to a debugger. You can also use the following methods for debugging.

Note: The following methods are only effective when the instance is running with `debugInfo=true`.

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

## debug.html

In order to quickly test if the `description` in `ctx.state.data` is correct, you can use the `.debug.html` file suffix to obtain the HTML of the corresponding entry. The link can be directly opened in the browser to preview the rendering result.

Usage: Access the corresponding route + `.{index}.debug.html`, where `{index}` is the item number (starting from 0) in your `ctx.state.data.item`. And the data corresponds to the `ctx.state.data.item[index].description` information will be returned as route result.