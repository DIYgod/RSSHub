# 路由配置

在编写新的路由时，RSSHub会读取文件夹中的`config.js`注册脚本，下面是这个文件的规范

::: warning 警告

这个规范仍在制定过程中，可能会随着时间推移而发生改变，请记得多回来看看！

:::

## 注册路由

如果需要注册一个路由，请在导出对象中`routes`中书写 -- 这个属性应当是一个数组，规则如下：

```js
routes: [
    {
        path: '/furstar/characters/:lang?',
        module: './index',
    },
    {
        path: '/furstar/artists/:lang?',
        module: './artists',
    },
    {
        path: '/furstar/archive/:lang?',
        module: './archive',
    },
],
```

- path
    - `@koa/router` 可以识别的路径
- module
    - 相对于`config.js`的脚本位置