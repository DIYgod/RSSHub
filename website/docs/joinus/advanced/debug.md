---
sidebar_position: 5
---

# Debugging

When debugging your code, you can use more than just `console.log` or attaching the node process to a debugger. You can also use the following methods for debugging.

Note: The following methods are only effective when the instance is running with `debugInfo=true`.

## Using `ctx.set('json', obj)`

To pass a custom object to `ctx.set('json', obj)` for debugging, follow these steps:

1.  Create your custom object.
2.  Pass your object to `ctx.set('json', obj)`.
3.  Access the corresponding route with query string `format=debug.json` to view your object. For example, if you want to debug the route `/furstar/characters/:lang?`, you can access the URL: `/furstar/characters/en?format=debug.json`

Here's an example of how to use `ctx.set('json', obj)` taken from [furstar/index.ts](https://github.com/DIYgod/RSSHub/blob/master/lib/routes/furstar/index.ts)

```js
const info = utils.fetchAllCharacters(res.data, base);

ctx.set('json', {
    info,
});
```

In the example above, we're passing the `info` object to `ctx.set('json', obj)`, which we can then access using the corresponding route with query string `format=debug.json`.

## debug.html

In order to quickly test if the `description` in `ctx.set('data', obj)` is correct, you can use the query string `format={index}.debug.html` to obtain the HTML of the corresponding entry. The link can be directly opened in the browser to preview the rendering result.

Usage: Access the corresponding route with query string `format={index}.debug.html`, where `{index}` is the item number (starting from 0) in your `data.item`. And the data corresponds to the `data.item[index].description` information will be returned as route result.
