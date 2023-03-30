---
sidebarDepth: 0
---
# 调试

当调试代码时，除了使用 `console.log` 或将 node 进程附加到调试器，您还可以将自定义对象提供给 `ctx.state.json` 来进行调试。

## 使用 `ctx.state.json`

要将自定义对象传递给 ctx.state.json 进行调试，请跟随以下步骤：

1.  创建自定义对象。
2.  将对象传递给 `ctx.state.json`。
3.  访问相应的路由 + `.debug.json` 来查看您的对象。例如，如果您想调试 `/furstar/characters/en`，您可以访问 URL：`/furstar/characters/en.debug.json`。

以下是来自 [furstar/index.js](https://github.com/DIYgod/RSSHub/blob/master/lib/v2/furstar/index.js) 的使用 `ctx.state.json` 的示例：

```js
const info = utils.fetchAllCharacters(res.data, base);

ctx.state.json = {
    info,
};
```

在上面的示例中，我们将 `info` 对象传递给 `ctx.state.json`，然后可以使用相应的路由 + `.debug.json` 来访问它。
