---
sidebar: auto
---

# 参与我们

如果有任何想法或需求，可以在 [issue](https://github.com/DIYgod/RSSHub/issues) 中告诉我们，同时我们欢迎各种 pull requests

## 提交新的 RSS 内容

### 步骤 1: 编写脚本

在 [/lib/routes/](https://github.com/DIYgod/RSSHub/tree/master/lib/routes) 中的路由对应路径下创建新的 js 脚本：

#### 获取源数据

-   获取源数据的主要手段为使用 [axios](https://github.com/axios/axios) 发起 HTTP 请求（请求接口或请求网页）获取数据
-   个别情况需要使用 [puppeteer](https://github.com/GoogleChrome/puppeteer) 模拟浏览器渲染目标页面并获取数据

-   返回的数据一般为 JSON 或 HTML 格式
-   对于 HTML 格式的数据，使用 [cheerio](https://github.com/cheeriojs/cheerio) 进行处理

-   以下三种获取数据方法按 **「推荐优先级」** 排列：

    1. **使用 axios 从接口获取数据**

    样例：[/lib/routes/bilibili/coin.js](https://github.com/DIYgod/RSSHub/blob/master/lib/routes/bilibili/coin.js)。

    使用 axios 通过数据源提供的 API 接口获取数据：

    ```js
    // 发起 HTTP GET 请求
    const response = await axios({
        method: 'get',
        url: `https://api.bilibili.com/x/space/coin/video?vmid=${uid}&jsonp=jsonp`,
    });

    const data = response.data.data; // response.data 为 HTTP GET 请求返回的数据对象
    // 这个对象中包含了数组名为 data，所以 response.data.data 则为需要的数据
    ```

    返回的数据样例之一（response.data.data[0]）：

    ```json
    {
        "aid": 33614333,
        "videos": 2,
        "tid": 20,
        "tname": "宅舞",
        "copyright": 1,
        "pic": "http://i0.hdslb.com/bfs/archive/5649d7fe6ff7f7b431300fc1a0db80d3f174cacd.jpg",
        "title": "【赤九玖】响喜乱舞【和我一起狂舞吧，团长大人(✧◡✧)】",
        "pubdate": 1539259203,
        "ctime": 1539249536,
        "desc": "编舞出处：av31984673\n真心好喜欢这个舞和这首歌，居然恰巧被邀请跳了，感谢《苍之纪元》官方的邀请。这次cos的是游戏的新角色缪斯。然而时间有限很多地方还有很多不足。也没跳够，以后私下还会继续练习，希望能学到更多动作，也能为了有机会把它跳的更好。 \n摄影：绯山圣瞳九命猫 \n后期：炉火"
        // 省略部分数据
    }
    ```

    对数据进行进一步处理，生成符合 RSS 规范的对象，把获取的标题、链接、描述、发布时间等数据赋值给 ctx.state.data, [生成 RSS 源](#生成-rss-源)：

    ```js
    ctx.state.data = {
        // 源标题
        title: `${name} 的 bilibili 投币视频`,
        // 源链接
        link: `https://space.bilibili.com/${uid}`,
        // 源说明
        description: `${name} 的 bilibili 投币视频`,
        //遍历此前获取的数据
        item: data.map((item) => ({
            // 文章标题
            title: item.title,
            // 文章正文
            description: `${item.desc}<br><img referrerpolicy="no-referrer" src="${item.pic}">`,
            // 文章发布时间
            pubDate: new Date(item.time * 1000).toUTCString(),
            // 文章链接
            link: `https://www.bilibili.com/video/av${item.aid}`,
        })),
    };

    // 至此本路由结束
    ```

    2. **使用 axios 从 HTML 获取数据**

    有时候数据是写在 HTML 里的，**没有接口供我们调用**，样例: [/lib/routes/jianshu/home.js](https://github.com/DIYgod/RSSHub/blob/master/lib/routes/jianshu/home.js)。

    使用 axios 请求 HTML 数据：

    ```js
    // 发起 HTTP GET 请求
    const response = await axios({
        method: 'get',
        url: 'https://www.jianshu.com',
    });

    const data = response.data; // response.data 为 HTTP GET 请求返回的 HTML，也就是简书首页的所有 HTML
    ```

    使用 cheerio 解析返回的 HTML:

    ```js
    const $ = cheerio.load(data); // 使用 cheerio 加载返回的 HTML
    const list = $('.note-list li').get();
    // 使用 cheerio 选择器，选择 class="note-list" 下的所有 "li"元素，返回 cheerio node 对象数组
    // cheerio get() 方法将 cheerio node 对象数组转换为 node 对象数组

    // 注：每一个 cheerio node 对应一个 HTML DOM
    // 注：cheerio 选择器与 jquery 选择器几乎相同
    // 参考 cheerio 文档：https://cheerio.js.org/
    ```

    使用 /jianshu/utils.js 类进行全文获取：

    ```js
    const result = await util.ProcessFeed(list, ctx.cache);
    ```

    /jianshu/utils.js 类中的全文获取逻辑：

    ```js
    // 专门定义一个function用于加载文章内容
    async function load(link) {
        // 异步请求文章
        const response = await axios.get(link);
        // 加载文章内容
        const $ = cheerio.load(response.data);

        // 解析日期
        const date = new Date(
            $('.publish-time')
                .text()
                .match(/\d{4}.\d{2}.\d{2} \d{2}:\d{2}/)
        );
        const timeZone = 8;
        const serverOffset = date.getTimezoneOffset() / 60;
        const pubDate = new Date(date.getTime() - 60 * 60 * 1000 * (timeZone + serverOffset)).toUTCString();

        // 提取内容
        const description = $('.show-content-free').html();

        // 返回解析的结果
        return { description, pubDate };
    }

    // 使用 Promise.all() 进行 async 并发
    const result = await Promise.all(
        // 遍历每一篇文章
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const $title = $('.title');
            // 还原相对链接为绝对链接
            const itemUrl = url.resolve(host, $title.attr('href'));

            // 列表上提取到的信息
            const single = {
                title: $title.text(),
                link: itemUrl,
                author: $('.nickname').text(),
                guid: itemUrl,
            };

            // 使用 tryGet() 方法从缓存获取内容
            // 当缓存中无法获取到链接内容的时候，则使用 load() 方法加载文章内容
            const other = await caches.tryGet(itemUrl, async () => await load(itemUrl), 3 * 60 * 60);

            // 合并解析后的结果集作为该篇文章最终的输出结果
            return Promise.resolve(Object.assign({}, single, other));
        })
    );
    ```

    将结果 `result` 赋值给 `ctx.state.data`

    ```js
    ctx.state.data = {
        title: '简书首页',
        link: 'https://www.jianshu.com',
        // 选择 <meta name="description"> 的 content 属性
        description: $('meta[name="description"]').attr('content'),
        item: result,
    };

    // 至此本路由结束
    ```

    3. **使用 puppeteer 渲染页面获取数据**

    ::: tip 提示

    由于此方法性能较差且消耗较多资源，使用前请确保以上两种方法无法获取数据，不然将导致您的 pull requests 被拒绝！

    :::

    部分网站**没有接口供调用，且页面需要渲染**才能获取正确的 HTML，
    样例：[/lib/routes/sspai/series.js](https://github.com/DIYgod/RSSHub/blob/master/lib/routes/sspai/series.js)

    ```js
    // 使用 RSSHub 提供的 puppeteer 工具类，初始化 Chrome 进程
    const browser = await require('../../utils/puppeteer')();
    // 创建一个新的浏览器页面
    const page = await browser.newPage();
    // 访问指定的链接
    const link = 'https://sspai.com/series';
    await page.goto(link);
    // 渲染目标网页
    const html = await page.evaluate(
        () =>
            // 选取渲染后的 HTML
            document.querySelector('div.new-series-wrapper').innerHTML
    );
    // 关闭浏览器进程
    browser.close();
    ```

    使用 cheerio 解析返回的 HTML:

    ```js
    const $ = cheerio.load(html); // 使用 cheerio 加载返回的 HTML
    const list = $('div.item'); // 使用 cheerio 选择器，选择所有 <div class="item"> 元素，返回 cheerio node 对象数组
    ```

    赋值给 `ctx.state.data`

    ```js
    ctx.state.data = {
        title: '少数派 -- 最新上架付费专栏',
        link,
        description: '少数派 -- 最新上架付费专栏',
        item: list
            .map((i, item) => ({
                // 文章标题
                title: $(item)
                    .find('.item-title a')
                    .text()
                    .trim(),
                // 文章链接
                link: url.resolve(
                    link,
                    $(item)
                        .find('.item-title a')
                        .attr('href')
                ),
                // 文章作者
                author: $(item)
                    .find('.item-author')
                    .text()
                    .trim(),
            }))
            .get(), // cheerio get() 方法将 cheerio node 对象数组转换为 node 对象数组
    };

    // 至此本路由结束

    // 注：由于此路由只是起到一个新专栏上架提醒的作用，无法访问付费文章，因此没有文章正文
    ```

---

#### 使用缓存

所有路由都有一个缓存，全局缓存时间在 `lib/config.js` 里设定，但某些接口返回的内容更新频率较低，这时应该给这些数据设置一个更长的缓存时间。

-   添加缓存:

```js
ctx.cache.set((key: string), (value: string), (time: number)); // time 为缓存时间, 单位为秒
```

-   获取缓存:

```js
const value = await ctx.cache.get((key: string));
```

例如知乎日报需要获取文章全文：[/lib/routes/zhihu/daily.js](https://github.com/DIYgod/RSSHub/blob/master/lib/routes/zhihu/daily.js), 每篇文章都需要单独请求一次。

由于已知文章更新频率为一天，把结果缓存一天，可以让后续的请求直接使用已缓存的数据，从而提升性能并节省资源。

```js
const key = 'daily' + story.id; // story.id 为知乎日报返回的文章唯一识别符
ctx.cache.set(key, item.description, 24 * 60 * 60); // 设置缓存时间为 24小时 * 60分钟 * 60秒 = 86400秒 = 1天
```

当同样的请求被发起时，优先使用未过期的缓存：

```js
const key = 'daily' + story.id;
const value = await ctx.cache.get(key); // 从缓存中查询是否已存在该文章唯一识别符
if (value) {
    // 查询返回未过期缓存
    item.description = value; // 直接赋值
} else {
    // 查询未发现未过期缓存
    // 向数据源发起请求
}
```

---

#### 生成 RSS 源

获取到的数据赋给 ctx.state.data, 然后数据会经过 [template.js](https://github.com/DIYgod/RSSHub/blob/master/lib/middleware/template.js) 中间件处理，最后传到 [/lib/views/rss.art](https://github.com/DIYgod/RSSHub/blob/master/lib/views/rss.art) 来生成最后的 RSS 结果，每个字段的含义如下：

```js
ctx.state.data = {
    title: '', // 项目的标题
    link: '', // 指向项目的链接
    description: '', // 描述项目
    language: '', // 频道语言
    item: [
        // 其中一篇文章或一项内容
        {
            title: '', // 文章标题
            author: '', // 文章作者
            category: '', // 文章分类
            // category: [''], // 多个分类
            description: '', // 文章摘要或全文
            pubDate: '', // 文章发布时间
            guid: '', // 文章唯一标示, 必须唯一, 可选, 默认为文章链接
            link: '', // 指向文章的链接
        },
    ],
};
```

##### 播客源

用于音频类 RSS，**额外**添加这些字段能使你的 RSS 被泛用型播客软件订阅：

```js
ctx.state.data = {
    itunes_author: '', // 主播名字, 必须填充本字段才会被视为播客
    itunes_category: '', // 播客分类
    image: '', // 专辑图片, 作为播客源时必填
    item: [
        {
            itunes_item_image: '', // 每个track单独的图片
            enclosure_url: '', // 音频链接
            enclosure_length: '', // 时间戳 (播放长度) , 一般是秒数，可选
            enclosure_type: '', // [.mp3就填'audio/mpeg'] [.m4a就填'audio/x-m4a'] [.mp4就填'video/mp4'], 或其他类型.
        },
    ],
};
```

##### BT/磁力源

用于下载类 RSS，**额外**添加这些字段能使你的 RSS 被 BT 客户端识别并自动下载：

```js
ctx.state.data = {
    item: [
        {
            enclosure_url: '', // 磁力链接
            enclosure_length: '', // 时间戳 (播放长度) , 一般是秒数，可选
            enclosure_type: 'application/x-bittorrent', // 固定为 'application/x-bittorrent'
        },
    ],
};
```

---

### 步骤 2: 添加脚本路由

在 [/lib/router.js](https://github.com/DIYgod/RSSHub/blob/master/lib/router.js) 里添加路由

#### 举例

1. [bilibili/bangumi](https://github.com/DIYgod/RSSHub/blob/master/lib/routes/bilibili/bangumi.js)

| 名称                       | 说明                                                                               |
| -------------------------- | ---------------------------------------------------------------------------------- |
| 路由                       | `/bilibili/bangumi/:seasonid`                                                      |
| 数据来源                   | bilibili                                                                           |
| 路由名称                   | bangumi                                                                            |
| 参数 1                     | :seasonid 必选                                                                     |
| 参数 2                     | 无                                                                                 |
| 参数 3                     | 无                                                                                 |
| 脚本路径                   | `./routes/bilibili/bangumi`                                                        |
| lib/router.js 中的完整代码 | `router.get('/bilibili/bangumi/:seasonid', require('./routes/bilibili/bangumi'));` |

2. [github/issue](https://github.com/DIYgod/RSSHub/blob/master/lib/routes/github/issue.js)

| 名称                       | 说明                                                                         |
| -------------------------- | ---------------------------------------------------------------------------- |
| 路由                       | `/github/issue/:user/:repo`                                                  |
| 数据来源                   | github                                                                       |
| 路由名称                   | issue                                                                        |
| 参数 1                     | :user 必选                                                                   |
| 参数 2                     | :repo 必选                                                                   |
| 参数 3                     | 无                                                                           |
| 脚本路径                   | `./routes/github/issue`                                                      |
| lib/router.js 中的完整代码 | `router.get('/github/issue/:user/:repo', require('./routes/github/issue'));` |

3. [embassy](https://github.com/DIYgod/RSSHub/blob/master/lib/routes/embassy/index.js)

| 名称                       | 说明                                                                         |
| -------------------------- | ---------------------------------------------------------------------------- |
| 路由                       | `/embassy/:country/:city?`                                                   |
| 数据来源                   | embassy                                                                      |
| 路由名称                   | 无                                                                           |
| 参数 1                     | :country 必选                                                                |
| 参数 2                     | ?city 可选                                                                   |
| 参数 3                     | 无                                                                           |
| 脚本路径                   | `./routes/embassy/index`                                                     |
| lib/router.js 中的完整代码 | `router.get('/embassy/:country/:city?', require('./routes/embassy/index'));` |

---

### 步骤 3: 添加脚本文档

1.  更新 [文档 (/docs/README.md) ](https://github.com/DIYgod/RSSHub/blob/master/docs/README.md), 可以执行 `npm run docs:dev` 查看文档效果

    -   文档采用 vue 组件形式，格式如下：
        -   `name`: 路由名称
        -   `author`: 路由作者，多位作者使用单个空格分隔
        -   `example`: 路由举例
        -   `path`: 路由路径
        -   `:paramsDesc`: 路由参数说明，数组，支持 markdown
            1. 参数说明必须对应其在路径中出现的顺序
            1. 如缺少说明将会导致`npm run docs:dev`报错
            1. 说明中的 `'` `"` 必须通过反斜杠转义 `\'` `\"`
            1. 不必在说明中标注`可选/必选`，组件会根据路由`?`自动判断
    -   文档样例：

        1. 多参数：

        ```vue
        <route name="仓库 Issue" author="HenryQW" example="/github/issue/DIYgod/RSSHub" path="/github/issue/:user/:repo" :paramsDesc="['用户名', '仓库名']" />
        ```

        结果预览：

        ***

        <route name="仓库 Issue" author="HenryQW" example="/github/issue/DIYgod/RSSHub" path="/github/issue/:user/:repo" :paramsDesc="['用户名', '仓库名']"/>

        ***


        2. 无参数:

        ```vue
        <route name="最新上架付费专栏" author="HenryQW" example="/sspai/series" path="/sspai/series"/>
        ```

        结果预览：

        ***

        <route name="最新上架付费专栏" author="HenryQW" example="/sspai/series" path="/sspai/series"/>

        ***


        3. 复杂说明支持 slot:

        ```vue
        <route name="分类" author="DIYgod" example="/juejin/category/frontend" path="/juejin/category/:category" :paramsDesc="['分类名']">

        | 前端     | Android | iOS | 后端    | 设计   | 产品    | 工具资源 | 阅读    | 人工智能 |
        | -------- | ------- | --- | ------- | ------ | ------- | -------- | ------- | -------- |
        | frontend | android | ios | backend | design | product | freebie  | article | ai       |

        </route>
        ```

        结果预览：

        ***

        <route name="分类" author="DIYgod" example="/juejin/category/frontend" path="/juejin/category/:category" :paramsDesc="['分类名']">

        | 前端     | Android | iOS | 后端    | 设计   | 产品    | 工具资源 | 阅读    | 人工智能 |
        | -------- | ------- | --- | ------- | ------ | ------- | -------- | ------- | -------- |
        | frontend | android | ios | backend | design | product | freebie  | article | ai       |

        </route>

        ***

1.  请一定要注意把`<route>`的标签关闭！

1.  执行 `npm run format` 自动标准化代码格式，提交代码, 然后提交 pull request

---

## 参与讨论

1.  [Telegram 群](https://t.me/rsshub)
2.  [GitHub Issues](https://github.com/DIYgod/RSSHub/issues)
