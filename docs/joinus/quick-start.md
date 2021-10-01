---
sidebar: auto
---

# 参与我们

如果有任何想法或需求，可以在 [issue](https://github.com/DIYgod/RSSHub/issues) 中告诉我们，同时我们欢迎各种 pull requests

## 参与讨论

1.  [Telegram 群](https://t.me/rsshub)
2.  [GitHub Issues](https://github.com/DIYgod/RSSHub/issues)

## 提交新的 RSSHub 规则

开始编写 RSS 源前请确认源站没有提供 RSS，部分网页会在 HTML 头部包含 type 为 `application/atom+xml` 或 `application/rss+xml` 的 link 元素来指明 RSS 链接

### 调试

首先 `yarn` 或者 `npm install` 安装依赖，然后执行 `yarn dev` 或者 `npm run dev`，打开 `http://localhost:1200` 就可以看到效果，修改文件也会自动刷新

### 添加脚本路由

在 [/lib/router.js](https://github.com/DIYgod/RSSHub/blob/master/lib/router.js) 里添加路由

### 编写脚本

在 [/lib/routes/](https://github.com/DIYgod/RSSHub/tree/master/lib/routes) 中的路由对应路径下创建新的 js 脚本：

#### 获取源数据

-   获取源数据的主要手段为使用 [got](https://github.com/sindresorhus/got) 发起 HTTP 请求（请求接口或请求网页）获取数据

-   个别情况需要使用 [puppeteer](https://github.com/GoogleChrome/puppeteer) 模拟浏览器渲染目标页面并获取数据

-   返回的数据一般为 JSON 或 HTML 格式

-   对于 HTML 格式的数据，使用 [cheerio](https://github.com/cheeriojs/cheerio) 进行处理

-   以下三种获取数据方法按 **「推荐优先级」** 排列：

    1.  **使用 got 从接口获取数据**

    样例：[/lib/routes/bilibili/coin.js](https://github.com/DIYgod/RSSHub/blob/master/lib/routes/bilibili/coin.js)。

    使用 got 通过数据源提供的 API 接口获取数据：

    ```js
    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/space/coin/video?vmid=${uid}&jsonp=jsonp`,
        headers: {
            Referer: `https://space.bilibili.com/${uid}/`,
        },
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
            description: `${item.desc}<br><img src="${item.pic}">`,
            // 文章发布时间
            pubDate: new Date(item.time * 1000).toUTCString(),
            // 文章链接
            link: `https://www.bilibili.com/video/av${item.aid}`,
        })),
    };

    // 至此本路由结束
    ```

    2.  **使用 got 从 HTML 获取数据**

    有时候数据是写在 HTML 里的，**没有接口供我们调用**，样例: [/lib/routes/douban/explore.js](https://github.com/DIYgod/RSSHub/blob/master/lib/routes/douban/explore.js)。

    使用 got 请求 HTML 数据：

    ```js
    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        url: 'https://www.douban.com/explore',
    });

    const data = response.data; // response.data 为 HTTP GET 请求返回的 HTML，也就是简书首页的所有 HTML
    ```

    使用 cheerio 解析返回的 HTML:

    ```js
    const $ = cheerio.load(data); // 使用 cheerio 加载返回的 HTML
    const list = $('div[data-item_id]');
    // 使用 cheerio 选择器，选择带有 data-item_id 属性的所有 div 元素，返回 cheerio node 对象数组

    // 注：每一个 cheerio node 对应一个 HTML DOM
    // 注：cheerio 选择器与 jquery 选择器几乎相同
    // 参考 cheerio 文档：https://cheerio.js.org/
    ```

    使用 map 遍历数组，解析出每一个 item 的结果

    ```js
    ctx.state.data = {
        title: '豆瓣-浏览发现',
        link: 'https://www.douban.com/explore',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    itemPicUrl = item.find('a.cover').attr('style').replace('background-image:url(', '').replace(')', '');
                    return {
                        title: item.find('.title a').first().text(),
                        description: `作者：${item.find('.usr-pic a').last().text()}<br>描述：${item.find('.content p').text()}<br><img src="${itemPicUrl}">`,
                        link: item.find('.title a').attr('href'),
                    };
                })
                .get(),
    };

    // 至此本路由结束
    ```

    3.  **使用 puppeteer 渲染页面获取数据**

    ::: tip 提示

    由于此方法性能较差且消耗较多资源，使用前请确保以上两种方法无法获取数据，不然将导致您的 pull requests 被拒绝！

    :::

    部分网站**没有接口供调用，且页面有加密**
    样例：[/lib/routes/sspai/series.js](https://github.com/DIYgod/RSSHub/blob/master/lib/routes/sspai/series.js)

    ```js
    // 使用 RSSHub 提供的 puppeteer 工具类，初始化 Chrome 进程
    const browser = await require('@/utils/puppeteer')();
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
                title: $(item).find('.item-title a').text().trim(),
                // 文章链接
                link: url.resolve(link, $(item).find('.item-title a').attr('href')),
                // 文章作者
                author: $(item).find('.item-author').text().trim(),
            }))
            .get(), // cheerio get() 方法将 cheerio node 对象数组转换为 node 对象数组
    };

    // 至此本路由结束

    // 注：由于此路由只是起到一个新专栏上架提醒的作用，无法访问付费文章，因此没有文章正文
    ```

    4.  **使用通用配置型路由**

    很大一部分网站是可以通过一个配置范式来生成 RSS 的。  
    通用配置即通过 cheerio（**CSS 选择器、jQuery 函数**）读取 json 数据来简便的生成 RSS。

    首先我们需要几个数据：

    1.  RSS 来源链接
    2.  数据来源链接
    3.  RSS 标题（非 item 标题）

    ```js
    const buildData = require('@/utils/common-config');
    module.exports = async (ctx) => {
        ctx.state.data = await buildData({
            link: '', // RSS来源链接
            url: '', // 数据来源链接
            title: '%title%', // 这里使用了变量，形如 **%xxx%** 这样的会被解析为变量，值为 **params** 下的同名值
            params: {
                title: '', // RSS标题
            },
        });
    };
    ```

    至此，我们的 RSS 还没有任何内容，内容需要由`item`完成
    下面为一个实例

    ```js
    const buildData = require('@/utils/common-config');

    module.exports = async (ctx) => {
        const link = `https://www.uraaka-joshi.com/`;
        ctx.state.data = await buildData({
            link,
            url: link,
            title: `%title%`,
            params: {
                title: '裏垢女子まとめ',
            },
            item: {
                item: '.content-main .stream .stream-item',
                title: `$('.post-account-group').text() + ' - %title%'`, // 只支持$().xxx()这样的js语句，也足够使用
                link: `$('.post-account-group').attr('href')`, // .text()代表获取元素的文本，.attr()表示获取指定属性
                description: `$('.post .context').html()`, // .html()代表获取元素的html代码
                pubDate: `new Date($('.post-time').attr('datetime')).toUTCString()`, // 日期的格式多种多样，可以尝试使用**/utils/date**
                guid: `new Date($('.post-time').attr('datetime')).getTime()`, // guid必须唯一，这是RSS的不同item的标志
            },
        });
    };
    ```

    至此我们完成了一个最简单的路由

* * *

#### 使用缓存

所有路由都有一个缓存，全局缓存时间在 `lib/config.js` 里设定，但某些接口返回的内容更新频率较低，这时应该给这些数据设置一个更长的缓存时间，比如需要额外请求的全文内容

例如 bilibili 专栏 需要获取文章全文：[/lib/routes/bilibili/followings_article.js](https://github.com/DIYgod/RSSHub/blob/master/lib/routes/bilibili/followings_article.js)

由于无法从一个接口获取所有文章的全文，所以每篇文章都需要单独请求一次，而这些数据一般是不变的，应该把这些数据保存到缓存里，避免每次访问路由都去请求那么多接口

```js
const description = await ctx.cache.tryGet(link, async () => {
    const result = await got.get(link);

    const $ = cheerio.load(result.data);
    $('img').each(function (i, e) {
        $(e).attr('src', $(e).attr('data-src'));
    });

    return $('.article-holder').html();
});
```

tryGet 的实现可以看[这里](https://github.com/DIYgod/RSSHub/blob/master/lib/middleware/cache.js#L128)，第一个参数为缓存的 key，第二个参数为缓存数据获取方法，第三个参数为缓存时间，正常情况不应该传入，缓存时间默认为 [CACHE_CONTENT_EXPIRE](/install/#缓存配置)，且每次访问缓存会重新计算过期时间

* * *

#### 生成 RSS 源

获取到的数据赋给 ctx.state.data, 然后数据会经过 [template.js](https://github.com/DIYgod/RSSHub/blob/master/lib/middleware/template.js) 中间件处理，最后传到 [/lib/views/rss.art](https://github.com/DIYgod/RSSHub/blob/master/lib/views/rss.art) 来生成最后的 RSS 结果，每个字段的含义如下：

```js
ctx.state.data = {
    title: '', // 项目的标题
    link: '', // 指向项目的链接
    description: '', // 描述项目
    language: '', // 频道语言
    allowEmpty: false, // 默认 false，设为 true 可以允许 item 为空
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

##### BT / 磁力源

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

##### 媒体源

**额外**添加这些字段能使你的 RSS 被支持 [Media RSS](http://www.rssboard.org/media-rss) 的软件订阅：

示例：

```js
ctx.state.data = {
    item: [
        {
            media: {
                content: {
                    url: post.file_url,
                    type: `image/${mime[post.file_ext]}`,
                },
                thumbnail: {
                    url: post.preview_url,
                },
            },
        },
    ],
};
```

* * *

### 添加脚本文档

1.  更新 [文档 (/docs/) ](https://github.com/DIYgod/RSSHub/blob/master/docs/) 目录内对应的文档，可以执行 `npm run docs:dev` 查看文档效果

    -   文档采用 vue 组件形式，格式如下：
        -   `author`: 路由作者，多位作者使用单个空格分隔
        -   `example`: 路由举例
        -   `path`: 路由路径
        -   `:paramsDesc`: 路由参数说明，数组，支持 markdown
            1.  参数说明必须对应其在路径中出现的顺序
            2.  如缺少说明将会导致`npm run docs:dev`报错
            3.  说明中的 `'` `"` 必须通过反斜杠转义 `\'` `\"`
            4.  不必在说明中标注`可选 / 必选`，组件会根据路由`?`自动判断
    -   文档样例：

        1.  无参数:

        ```vue
        <Route author="HenryQW" example="/sspai/series" path="/sspai/series" />
        ```

        结果预览：

        * * *

        <Route author="HenryQW" example="/sspai/series" path="/sspai/series"/>

        * * *

        2.  多参数：

        ```vue
        <Route author="HenryQW" example="/github/issue/DIYgod/RSSHub" path="/github/issue/:user/:repo" :paramsDesc="['用户名', '仓库名']" />
        ```

        结果预览：

        * * *

        <Route author="HenryQW" example="/github/issue/DIYgod/RSSHub" path="/github/issue/:user/:repo" :paramsDesc="['用户名', '仓库名']"/>

        * * *


        3. 复杂说明支持 slot:

        ```vue
        <Route author="DIYgod" example="/juejin/category/frontend" path="/juejin/category/:category" :paramsDesc="['分类名']">

        | 前端     | Android | iOS | 后端    | 设计   | 产品    | 工具资源 | 阅读    | 人工智能 |
        | -------- | ------- | --- | ------- | ------ | ------- | -------- | ------- | -------- |
        | frontend | android | ios | backend | design | product | freebie  | article | ai       |

        </Route>
        ```

        结果预览：

        ***

        <Route author="DIYgod" example="/juejin/category/frontend" path="/juejin/category/:category" :paramsDesc="['分类名']">

        | 前端     | Android | iOS | 后端    | 设计   | 产品    | 工具资源 | 阅读    | 人工智能 |
        | -------- | ------- | --- | ------- | ------ | ------- | -------- | ------- | -------- |
        | frontend | android | ios | backend | design | product | freebie  | article | ai       |

        </Route>

        ***

1.  请一定要注意把`<Route>`的标签关闭！

2. 加入新站点时，请一定要在新站点标题中添加**原站链接**🔗 ！ 

3.  执行 `npm run format` 自动标准化代码格式，提交代码，然后提交 pull request

## 提交新的 RSSHub Radar 规则

### 调试

打开浏览器扩展设置页，切换到规则列表页，下拉页面可以看到一个文本框，把新规则复制到文本框里就可以用来调试

### 编写规则

在 [/assets/radar-rules.js](https://github.com/DIYgod/RSSHub/blob/master/assets/radar-rules.js) 里添加规则

下面说明中会用到的简化的规则：

```js
{
    'bilibili.com': {
        _name: 'bilibili',
        www: [{
            title: '分区视频',
            docs: 'https://docs.rsshub.app/social-media.html#bilibili',
            source: '/v/*tpath',
            target: (params) => {
                let tid;
                switch (params.tpath) {
                    case 'douga/mad':
                        tid = '24';
                        break;
                    default:
                        return false;
                }
                return `/bilibili/partion/${tid}`;
            },
        }],
    },
    'twitter.com': {
        _name: 'Twitter',
        '.': [{  // for twitter.com
            title: '用户时间线',
            docs: 'https://docs.rsshub.app/social-media.html#twitter',
            source: '/:id',
            target: (params) => {
                if (params.id !== 'home') {
                    return '/twitter/user/:id';
                }
            },
        }],
    },
    'pixiv.net': {
        _name: 'Pixiv',
        'www': [{
            title: '用户收藏',
            docs: 'https://docs.rsshub.app/social-media.html#pixiv',
            source: '/bookmark.php',
            target: (params, url) => `/pixiv/user/bookmarks/${new URL(url).searchParams.get('id')}`,
        }],
    },
    'weibo.com': {
        _name: '微博',
        '.': [{
            title: '博主',
            docs: 'https://docs.rsshub.app/social-media.html#%E5%BE%AE%E5%8D%9A',
            source: ['/u/:id', '/:id'],
            target: (params, url, document) => {
                const uid = document && document.documentElement.innerHTML.match(/\$CONFIG\['oid']='(\d+)'/)[1];
                return uid ? `/weibo/user/${uid}` : '';
            },
        }],
    },
}
```

下面详细说明这些字段的含义及用法

#### title

必填，路由名称

对应 RSSHub 文档中的名称，如 `Twitter 用户时间线` 规则的 `title` 为 `用户时间线`

#### docs

必填，文档地址

如 `Twitter 用户时间线` 规则的 `docs` 为 `https://docs.rsshub.app/social-media.html#twitter`

注意不是 `https://docs.rsshub.app/social-media.html#yong-hu-shi-jian-xian`，hash 应该定位到一级标题

#### source

可选，源站路径，留空则永远不会匹配成功，只会在 `当前网站适用的 RSSHub 中出现`

如 `Twitter 用户时间线` 规则的 `source` 为 `/:id`

比如我们现在在 `https://twitter.com/DIYgod` 这个页面，`twitter.com/:id` 匹配成功，结果 params 为 `{id: 'DIYgod'}`，下一步中插件就会根据 params `target` 字段生成 RSSHub 地址

请注意 `source` 只可以匹配 URL Path，如果参数在 URL Param 和 URL Hash 里请使用 `target`

#### target

可选，RSSHub 路径，留空则不会生成 RSSHub 路径

对应 RSSHub 文档中的 path，如 `Twitter 用户时间线` 规则的 `target` 为 `/twitter/user/:id`

上一步中源站路径匹配出 `id` 为 `DIYgod`，则 RSSHub 路径中的 `:id` 会被替换成 `DIYgod`，匹配结果为 `/twitter/user/DIYgod`，就是我们想要的结果

进一步，如果源站路径无法匹配出想要的参数，这时我们可以把 `target` 设为一个函数，函数有 `params` 、 `url` 和 `document` 三个参数

`params` 为上一步 `source` 匹配出来的参数，`url` 为页面 url，`document` 为页面 document

请注意，`target` 方法运行在沙盒中，对 `document` 的任何修改都不会反应到页面中

### RSSBud

[RSSBud](https://github.com/Cay-Zhang/RSSBud) 支持 RSSHub Radar 的规则并且也会自动更新，但是请注意：

-   在 Radar 的规则中使用 `'.'` 子域名可以让 RSSBud 适配 `m` / `mobile` 等常见移动端子域名

-   在 `target` 中使用 `document` 的规则并不适用 RSSBud：RSSBud 并不是一个浏览器插件，他只获取并分析网站的 URL

### 补充文档

在 RSSHub 文档里给对应路径加上 `radar="1"`，这样就会显示一个 `支持浏览器扩展` 标记

如果也支持 RSSBud，再加上 `rssbud="1"`，会显示 `支持 RSSBud` 标记
