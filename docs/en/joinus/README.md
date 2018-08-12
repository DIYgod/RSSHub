---
sidebar: auto
---

# 参与我们

如果有任何想法或需求，可以在 [issue](https://github.com/DIYgod/RSSHub/issues) 中告诉我们，同时我们欢迎各种 pull requests

## 提交新的 RSS 内容

1.  在 [/router.js](https://github.com/DIYgod/RSSHub/blob/master/router.js) 里添加路由

1.  在 [/routes/](https://github.com/DIYgod/RSSHub/tree/master/routes) 中的路由对应路径添加获取 RSS 内容的脚本

1.  更新 [README (/README.md) ](https://github.com/DIYgod/RSSHub/blob/master/README.md) 和 [文档 (/docs/README.md) ](https://github.com/DIYgod/RSSHub/blob/master/docs/README.md)，可以执行 `npm run docs:dev` 查看文档效果

1.  执行 `npm run format` 自动处理代码格式后，提交代码，然后提交 pull request

## 编写脚本

### 从接口获取数据

使用 [axios](https://github.com/axios/axios) 请求接口，然后把获取的标题、链接、描述、发布时间等数据赋值给 ctx.state.data（每个字段的含义在下面说明），可以直接看这个典型的例子：[/routes/bilibili/bangumi.js](https://github.com/DIYgod/RSSHub/blob/master/routes/bilibili/bangumi.js)

### 从 HTML 获取数据

有时候数据是写在 HTML 里的，没有接口供我们调用，这时候可以使用 [axios](https://github.com/axios/axios) 请求 HTML 数据，然后使用 [cheerio](https://github.com/cheeriojs/cheerio) 解析 HTML，再把数据赋值给 ctx.state.data，可以直接看这个典型的例子：[/routes/jianshu/home.js](https://github.com/DIYgod/RSSHub/blob/master/routes/jianshu/home.js)

### 使用缓存

所有路由都有一个缓存，缓存时间在 `config.js` 里设定，但某些接口返回的内容可能长时间都不会变化，这时应该给这些数据设置一个更长的缓存。

添加缓存:

```js
ctx.cache.set((key: string), (value: string), (time: number)); // time 为缓存时间，单位为秒
```

获取缓存:

```js
const value = await ctx.cache.get(key: string);
```

可以直接看这个典型的例子：[/routes/zhihu/daily.js](https://github.com/DIYgod/RSSHub/blob/master/routes/zhihu/daily.js)，这个例子中需要获取每篇文章的详细内容，每篇文章都需要单独请求一次，请求很多而且每个请求只需要一次，这时候可以把结果缓存一天。

### 数据

获取到的数据赋给 ctx.state.data，然后数据会经过 [template.js](https://github.com/DIYgod/RSSHub/blob/master/middleware/template.js) 中间件处理，最后传到 [/views/rss.art](https://github.com/DIYgod/RSSHub/blob/master/views/rss.art) 来生成最后的 RSS 结果，每个字段的含义如下:

```js
ctx.state.data = {
    title: '', // 项目的标题
    link: '', // 指向项目的链接
    description: '', // 描述项目
    item: [
        // 其中一篇文章或一项内容
        {
            title: '', // 文章标题
            description: '', // 文章内容或描述
            pubDate: '', // 文章发布时间
            guid: '', // 文章唯一标示，必须唯一，可选，默认为文章链接
            link: '', // 指向文章的链接
        },
    ],
};
```

## 参与讨论

1.  [Telegram 群](https://t.me/rsshub)
