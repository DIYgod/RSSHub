---
sidebar_position: 5
---

# 调试

当调试代码时，除了使用 `console.log` 或将 node 进程附加到调试器，您还可以使用如下方式进行调试。

注意：需要实例运行在 `debugInfo=true` 的情况下以下方式才有效

## 使用 `ctx.set('json', obj)`

要将自定义对象传递给 `ctx.set('json', obj)` 进行调试，请跟随以下步骤：

1.  创建自定义对象。
2.  将对象传递给 `ctx.set('json', obj)`。
3.  访问相应的路由并添加查询参数 `format=debug.json` 来查看您的对象。例如，如果您想调试 `/furstar/characters/en`，您可以访问 URL：`/furstar/characters/en?format=debug.json`。

以下是来自 [furstar/index.ts](https://github.com/DIYgod/RSSHub/blob/master/lib/routes/furstar/index.ts) 的使用 `ctx.set('json', obj)` 的示例：

```js
const info = utils.fetchAllCharacters(res.data, base);

ctx.set('json', {
    info,
});
```

在上面的示例中，我们将 `info` 对象传递给 `ctx.set('json', obj)`，然后可以使用相应的路由并添加查询参数 `format=debug.json` 来访问它。

## debug.html

为了快速测试 `ctx.set('data', obj)` 中的 description 是否正确，你可以利用 `{index}.debug.html` 机制来获取相关条目的 HTML，该链接可以直接在浏览器中打开以预览渲染结果。

使用方式：访问相应的路由并添加查询参数 `format={index}.debug.html`，其中 `{index}` 为你的 `data.item` 中的项目序号（从 0 开始），即返回对应路由结果中的 `data.item[index].description` 信息。
