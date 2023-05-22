---
sidebarDepth: 0
---
# 调试

当调试代码时，除了使用 `console.log` 或将 node 进程附加到调试器，您还可以使用如下方式进行调试。

注意：需要实例运行在 `debugInfo=true` 的情况下以下方式才有效

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

## debug.html

为了快速测试 `ctx.state.data` 中的 description 是否正确，你可以利用 `debug.html` 机制来获取相关条目的 HTML，该链接可以直接在浏览器中打开以预览渲染结果。

使用方式：访问相应的路由 + `.{index}.debug.html`，其中 `{index}` 为你的 `ctx.state.data.item` 中的项目序号（从 0 开始），即返回对应路由结果中的 `ctx.state.data.item[index].description` 信息。
