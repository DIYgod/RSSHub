---
sidebar: auto
---

# 参与我们

如果有任何想法或需求, 可以在 [issue](https://github.com/DIYgod/RSSHub/issues) 中告诉我们, 同时我们欢迎各种 pull requests

## 提交新的 RSS 内容

1.  在 [/router.js](https://github.com/DIYgod/RSSHub/blob/master/router.js) 里添加路由

1.  在 [/routes/](https://github.com/DIYgod/RSSHub/tree/master/routes) 中的路由对应路径添加获取 RSS 内容的脚本

1.  更新 [文档 (/docs/README.md) ](https://github.com/DIYgod/RSSHub/blob/master/docs/README.md), 可以执行 `npm run docs:dev` 查看文档效果

    -   文档采用 vue 组件形式, 格式如下:
        -   `name`: 路由名称
        -   `author`: 路由作者, 多位作者使用单个空格分隔
        -   `example`: 路由举例
        -   `path`: 路由路径
        -   `:paramsDesc`: 路由参数说明, 数组, 支持 markdown
            1. 参数说明必须对应其在路径中出现的顺序
            1. 如缺少说明将会导致`npm run docs:dev`报错
            1. 说明中的 `'` `"` 必须通过反斜杠转义 `\'` `\"`
            1. 不必在说明中标注`可选/必选`, 组件根据`?`自动判断
    -   文档样例:

        -   多参数:

        ```vue
        <route name="仓库 Issue" author="HenryQW" example="/github/issue/DIYgod/RSSHub" path="/github/issue/:user/:repo" :paramsDesc="['用户名', '仓库名']"/>
        ```

          <route name="仓库 Issue" author="HenryQW" example="/github/issue/DIYgod/RSSHub" path="/github/issue/:user/:repo" :paramsDesc="['用户名', '仓库名']"/>

        -   复杂说明支持 slot:

        ```vue
        <route name="分类" author="DIYgod" example="/juejin/category/frontend" path="/juejin/category/:category" :paramsDesc="['分类名']">
        
        | 前端     | Android | iOS | 后端    | 设计   | 产品    | 工具资源 | 阅读    | 人工智能 |
        | -------- | ------- | --- | ------- | ------ | ------- | -------- | ------- | -------- |
        | frontend | android | ios | backend | design | product | freebie  | article | ai       |
        
        </route>
        ```

          <route name="分类" author="DIYgod" example="/juejin/category/frontend" path="/juejin/category/:category" :paramsDesc="['分类名']">

        | 前端     | Android | iOS | 后端    | 设计   | 产品    | 工具资源 | 阅读    | 人工智能 |
        | -------- | ------- | --- | ------- | ------ | ------- | -------- | ------- | -------- |
        | frontend | android | ios | backend | design | product | freebie  | article | ai       |

          </route>

1.  执行 `npm run format` 自动处理代码格式后, 提交代码, 然后提交 pull request

## 编写脚本

RSSHub 支持三种获取数据的办法, 方法按 **「推荐优先级」** 排列:

### 从接口获取数据

使用 [axios](https://github.com/axios/axios) 请求接口, 然后把获取的标题、链接、描述、发布时间等数据赋值给 ctx.state.data (每个字段的含义在下面说明) , 可以直接看这个典型的例子: [/routes/bilibili/bangumi.js](https://github.com/DIYgod/RSSHub/blob/master/routes/bilibili/bangumi.js)

### 从 HTML 获取数据

有时候数据是写在 HTML 里的, **没有接口供我们调用**, 这时候可以使用 [axios](https://github.com/axios/axios) 请求 HTML 数据, 然后使用 [cheerio](https://github.com/cheeriojs/cheerio) 解析 HTML, 再把数据赋值给 ctx.state.data, 可以直接看这个典型的例子: [/routes/jianshu/home.js](https://github.com/DIYgod/RSSHub/blob/master/routes/jianshu/home.js)

### 渲染页面获取数据

::: tip 提示

由于此方法性能较差且消耗较多资源, 使用前请确保以上两种方法无法获取数据, 不然将导致您的 pull requests 被拒绝!

:::

部分网站**没有接口供调用, 且页面需要渲染**才能获取正确的 HTML, 这时候可以使用 [puppeteer](https://github.com/GoogleChrome/puppeteer) 通过 Headless Chrome 渲染页面, 然后使用 [cheerio](https://github.com/cheeriojs/cheerio) 解析返回的 HTML, 再把数据赋值给 ctx.state.data, 可以直接看这个典型的例子: [/routes/sspai/series.js](https://github.com/DIYgod/RSSHub/blob/master/routes/sspai/series.js)

### 使用缓存

所有路由都有一个缓存, 缓存时间在 `config.js` 里设定, 但某些接口返回的内容可能长时间都不会变化, 这时应该给这些数据设置一个更长的缓存.

添加缓存:

```js
ctx.cache.set((key: string), (value: string), (time: number)); // time 为缓存时间, 单位为秒
```

获取缓存:

```js
const value = await ctx.cache.get((key: string));
```

可以直接看这个典型的例子: [/routes/zhihu/daily.js](https://github.com/DIYgod/RSSHub/blob/master/routes/zhihu/daily.js), 这个例子中需要获取每篇文章的详细内容, 每篇文章都需要单独请求一次, 请求很多而且每个请求只需要一次, 这时候可以把结果缓存一天.

### 数据

获取到的数据赋给 ctx.state.data, 然后数据会经过 [template.js](https://github.com/DIYgod/RSSHub/blob/master/middleware/template.js) 中间件处理, 最后传到 [/views/rss.art](https://github.com/DIYgod/RSSHub/blob/master/views/rss.art) 来生成最后的 RSS 结果, 每个字段的含义如下:

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
            guid: '', // 文章唯一标示, 必须唯一, 可选, 默认为文章链接
            link: '', // 指向文章的链接
        },
    ],
};
```

<details><summary>如果你想制作播客订阅型RSS, 点这儿</summary><br>

参考文章:

-   [Podcasts Connect 帮助 创建播客 - Apple](https://help.apple.com/itc/podcasts_connect/#/itca5b22233a)
-   [Podcasts Connect 帮助 播客最佳做法 - Apple](https://help.apple.com/itc/podcasts_connect/#/itc2b3780e76)
-   RSS 格式参考: https://codepen.io/jon-walstedt/pen/jsIup
-   播客验证: https://podba.se/validate/?url=https://rsshub.app/ximalaya/album/299146/

这些字段能使你的 RSS 被泛用型播客软件订阅:

```js
ctx.state.data = {
    title: '', // 项目的标题
    link: '', // 指向项目的链接
    itunes_author: '', // 主播名字, 必须填充本字段才会被视为播客
    itunes_category: '', // 播客分类
    image: '', // 专辑图片, 作为播客源时必填
    description: '', // 描述项目
    item: [
        // 其中一篇文章或一项内容
        {
            title: '', // 文章标题
            description: '', // 文章内容或描述
            pubDate: '', // 文章发布时间
            guid: '', // 文章唯一标示, 必须唯一, 可选, 默认为文章链接
            link: '', // 指向文章的链接
            itunes_item_image: '', // 图像
            enclosure_url: '', // 音频链接
            enclosure_length: '', // 时间戳 (播放长度) , 一般是秒数
            enclosure_type: '', // [.mp3就填'audio/mpeg'] [.m4a就填'audio/x-m4a'], 或其他类型.
            itunes_duration: '', // 由enclosure_length转换为 时:分:秒
        },
    ],
};
```

</details>

## 参与讨论

1.  [Telegram 群](https://t.me/rsshub)
