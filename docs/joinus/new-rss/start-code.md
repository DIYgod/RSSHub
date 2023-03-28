---
sidebarDepth: 2
---
# 制作自己的 RSSHub 路由

如前所述，我们以 [GitHub 仓库 Issues](/programming.html#github-cang-ku-issues) 为例制作 RSS 源。我们将展示前面提到的四种数据获取方法：

1.  [通过 API](#tong-guo-api)
2.  [通过 got 从 HTML 获取数据](#tong-guo-got-cong-html-huo-qu-shu-ju)
3.  [使用通用配置路由](#shi-yong-tong-yong-pei-zhi-lu-you)
4.  [使用 puppeteer](#shi-yong-puppeteer)

## 通过 API

### 查看 API 文档

不同的站点有不同的 API。您可以查看要为其制作 RSS 源的站点的 API 文档。在本例中，我们将使用 [GitHub Issues API](https://docs.github.com/zh/rest/issues/issues#list-repository-issues)。

### 创建主文件

打开您的代码编辑器并创建一个新文件。由于我们要为 GitHub 仓库 Issues 制作 RSS 源，因此建议将文件命名为 `issue.js`。

以下是让您开始的基本代码：

<code-group>
<code-block title="issue.js">

```js
// 导入所需模组
const got = require('@/utils/got'); // 自订的 got
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    // 在此处编写您的逻辑

    ctx.state.data = {
        // 在此处输出您的 RSS
    };
};
```

</code-block>
</code-group>

### 获取用户输入

如前所述，我们需要从用户输入中获取 GitHub 用户名和仓库名称。如果请求 URL 中未提供仓库名称，则应默认为 `RSSHub`。您可以使用以下代码实现：

<code-group>
<code-block title="解构赋值" active>

```js{2}
module.exports = async (ctx) => {
    const { user, repo = 'RSSHub' } = ctx.params;

    ctx.state.data = {
        // 在此处输出您的 RSS
    };
};
```

</code-block>
<code-block title="传统赋值">

```js{2,3}
module.exports = async (ctx) => {
    const user = ctx.params.user;
    const repo = ctx.params.repo ?? 'RSSHub';

    ctx.state.data = {
        // 在此处输出您的 RSS
    };
};
```

</code-block>
</code-group>

这两个代码片段都执行相同的操作。第一个使用对象解构将 `user` 和 `repo` 变量赋值，而第二个使用传统赋值和空值合并运算符在请求 URL 中未提供它的情况下将 `repo` 变量分配默认值 `RSSHub`。

### 从 API 获取数据

在获取用户输入后，我们可以使用它向 API 发送请求。大多数情况下，您需要使用 `@/utils/got` 中的 `got`（一个自订的 [got](https://www.npmjs.com/package/got) 包装函数）发送 HTTP 请求。有关更多信息，请参阅 [got 文档](https://github.com/sindresorhus/got/tree/v11#usage)。

<code-group>
<code-block title="解构赋值" active>

```js{3-14}
module.exports = async (ctx) => {
    const { user, repo = 'RSSHub' } = ctx.params;
    // 发送 HTTP GET 请求到 API 并解构返回的数据对象
    const { data } = await got(`https://api.github.com/repos/${user}/${repo}/issues`, { 
        headers: {
            // 为简单起见，此示例使用 HTML 而不是推荐的 'application/vnd.github+json'，
            // 因后者返回 Markdown 并需要进一步处理
            accept: 'application/vnd.github.html+json',
        },
        searchParams: {
            // 这允许用户设置条数限制
            per_page: ctx.query.limit ? parseInt(ctx.query.limit, 10) : 30,
        },
    });

    ctx.state.data = {
        // 在此处输出您的 RSS
    };
};
```

</code-block>
<code-block title="传统赋值">

```js{4-14}
module.exports = async (ctx) => {
    const user = ctx.params.user;
    const repo = ctx.params.repo ?? 'RSSHub';
    // 发送 HTTP GET 请求到 API
    const response = await got(`https://api.github.com/repos/${user}/${repo}/issues`, { 
        headers: {
            accept: 'application/vnd.github.html+json',
        },
        searchParams: {
            per_page: ctx.query.limit ? parseInt(ctx.query.limit, 10) : 30,
        },
    });
    // response.data 是上述请求返回的数据对象
    const data = response.data;

    ctx.state.data = {
        // 在此处输出您的 RSS
    };
};
```

</code-block>
</code-group>

### 生成 RSS 源

一旦我们从 API 获取到数据，我们需要进一步处理它以生成符合 RSS 规范的 RSS 源。具体来说，我们需要提取源标题、源链接、文章标题、文章链接、文章正文和文章发布日期。

为此，我们可以将相关数据赋值给 `ctx.state.data` 对象，RSSHub 的中间件将处理其余部分。

以下是应有的最终代码：

<code-group>
<code-block title="最终代码" active>

```js{16-30,32-39}
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { user, repo = 'RSSHub' } = ctx.params;

    const { data } = await got(`https://api.github.com/repos/${user}/${repo}/issues`, { 
        headers: {
            accept: 'application/vnd.github.html+json',
        },
        searchParams: {
            per_page: ctx.query.limit ? parseInt(ctx.query.limit, 10) : 30,
        },
    });

    // 从 API 响应中提取相关数据
    const items = data.map((item) => ({
        // 文章标题
        title: item.title,
        // 文章链接
        link: item.html_url,
        // 文章正文
        description: item.body_html,
        // 文章发布日期
        pubDate: parseDate(item.created_at),
        // 如果有的话，文章作者
        author: item.user.login,
        // 如果有的话，文章分类
        category: item.labels.map((label) => label.name),
    }));

    ctx.state.data = {
        // 源标题
        title: `${user}/${repo} issues`,
        // 源链接
        link: `https://github.com/${user}/${repo}/issues`,
        // 源文章
        item: items,
    };
};
```

</code-block>
<code-block title="替代代码">

```js{16-36}
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { user, repo = 'RSSHub' } = ctx.params;

    const { data } = await got(`https://api.github.com/repos/${user}/${repo}/issues`, { 
        headers: {
            accept: 'application/vnd.github.html+json',
        },
        searchParams: {
            per_page: ctx.query.limit ? parseInt(ctx.query.limit, 10) : 30,
        },
    });

    ctx.state.data = {
        // 源标题
        title: `${user}/${repo} issues`,
        // 源链接
        link: `https://github.com/${user}/${repo}/issues`,
        // 遍历所有此前获取的数据
        item: data.map((item) => ({
            // 文章标题
            title: item.title,
            // 文章链接
            link: item.html_url,
            // 文章正文
            description: item.body_html,
            // 文章发布日期
            pubDate: parseDate(item.created_at),
            // 如果有的话，文章作者
            author: item.user.login,
            // 如果有的话，文章分类
            category: item.labels.map((label) => label.name),
        }));
    };
};
```

</code-block>
</code-group>

## 通过 got 从 HTML 获取数据

### 创建主文件

打开您的代码编辑器并创建一个新文件。由于我们要为 GitHub 仓库 Issues 制作 RSS 源，因此建议将文件命名为 `issue.js`。

以下是让您开始的基本代码：

```js
// 导入必要的模组
const got = require('@/utils/got'); // 自订的 got
const cheerio = require('cheerio'); // 可以使用类似 jQuery 的 API HTML 解析器
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    // 在此处编写您的逻辑

    ctx.state.data = {
        // 在此处输出您的 RSS
    };
};
```

`parseDate` 函数是 RSSHub 提供的一个工具函数，在代码的后面我们会用到它来解析日期。

您需要添加自己的代码来从 HTML 文档中提取数据、处理数据并以 RSS 格式输出。在下一步中，我们将详细介绍此过程的细节。

### 获取用户输入

如前所述，我们需要从用户输入中获取 GitHub 用户名和仓库名称。如果请求 URL 中未提供仓库名称，则应默认为 `RSSHub`。您可以使用以下代码实现：

```js{2-3}
module.exports = async (ctx) => {
    // 从 URL 参数中获取用户名和仓库名称
    const { user, repo = 'RSSHub' } = ctx.params;

    ctx.state.data = {
        // 在此处输出您的 RSS
    };
};
```

在这段代码中，`user` 将被设置为 `user` 参数的值，如果存在 `repo` 参数，则 `repo` 将被设置为该参数的值，否则为 `RSSHub`。

### 从网页获取数据

在获取了用户输入之后，我们需要向网页发起请求，以检索所需的信息。在大多数情况下，我们将使用 `@/utils/got` 中的 `got`（一个自订的 [got](https://www.npmjs.com/package/got) 包装函数）发送 HTTP 请求。您可以在 [got 文档](https://github.com/sindresorhus/got/tree/v11#usage) 中找到有关如何使用 got 的更多信息。

首先，我们将向 API 发送 HTTP GET 请求，并将 HTML 响应加载到 Cheerio 中，Cheerio 是一个帮助我们解析和操作 HTML 的库。

```js{5-6}
    const baseUrl = 'https://github.com';
    const { user, repo = 'RSSHub' } = ctx.params;

    // 注意，".data" 属性包含了请求返回的目标页面的完整 HTML 源代码
    const { data: response } = await got(`${baseUrl}/${user}/${repo}/issues`);
    const $ = cheerio.load(response);
```

接下来，我们将使用 Cheerio 选择器选择相关的 HTML 元素，解析我们需要的数据，并将其转换为数组。

```js{3-21}
    // 我们使用 Cheerio 选择器选择所有带类名“js-navigation-container”的“div”元素，
    // 其中包含带类名“flex-auto”的子元素。
    const item = $('div.js-navigation-container .flex-auto')
        // 使用“toArray()”方法将选择的所有 DOM 元素以数组的形式返回。
        .toArray()
        // 使用“map()”方法遍历数组，并从每个元素中解析需要的数据。
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.text(),
                // `link` 需要一个绝对 URL，但 `a.attr('href')` 返回一个相对 URL。
                link: `${baseUrl}${a.attr('href')}`,
                pubDate: parseDate(item.find('relative-time').attr('datetime')),
                author: item.find('.opened-by a').text(),
                category: item
                    .find('a[id^=label]')
                    .toArray()
                    .map((item) => $(item).text()),
            };
        });

    ctx.state.data = {
        // 在此处输出您的 RSS
    };
```

### 生成 RSS 源

一旦我们从 API 获取到数据，我们需要进一步处理它以生成符合 RSS 规范的 RSS 源。具体来说，我们需要提取源标题、源链接、文章标题、文章链接、文章正文和文章发布日期。

为此，我们可以将相关数据赋值给 `ctx.state.data` 对象，RSSHub 的中间件将处理其余部分。

以下是应有的最终代码：

```js{29-36}
const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://github.com';
    const { user, repo = 'RSSHub' } = ctx.params;

    const { data: response } = await got(`${baseUrl}/${user}/${repo}/issues`);
    const $ = cheerio.load(response);

    const item = $('div.js-navigation-container .flex-auto')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.text(),
                link: `${baseUrl}${a.attr('href')}`,
                pubDate: parseDate(item.find('relative-time').attr('datetime')),
                author: item.find('.opened-by a').text(),
                category: item
                    .find('a[id^=label]')
                    .toArray()
                    .map((item) => $(item).text()),
            };
        });

    ctx.state.data = {
        // 源标题
        title: `${user}/${repo} issues`,
        // 源链接
        link: `${baseUrl}/${user}/${repo}/issues`,
        // 源文章
        item: items,
    };
};
```

### 更好的阅读体验

上述的代码仅针对每个订阅项提供部分信息。为了提供更好的阅读体验，我们可以在每个订阅项中添加完整的文章，例如每个 GitHub Issue 的正文。

以下是更新后的代码：

```js{12,29-43,48}
const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://github.com';
    const { user, repo = 'RSSHub' } = ctx.params;

    const { data: response } = await got(`${baseUrl}/${user}/${repo}/issues`);
    const $ = cheerio.load(response);

    const list = $('div.js-navigation-container .flex-auto')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.text(),
                link: `${baseUrl}${a.attr('href')}`,
                pubDate: parseDate(item.find('relative-time').attr('datetime')),
                author: item.find('.opened-by a').text(),
                category: item
                    .find('a[id^=label]')
                    .toArray()
                    .map((item) => $(item).text()),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                // 选择类名为“comment-body”的第一个元素
                item.description = $('.comment-body').first().html();

                // 上面每个列表项的每个属性都在此重用，
                // 并增加了一个新属性“description”
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${user}/${repo} issues`,
        link: `https://github.com/${user}/${repo}/issues`,
        item: items,
    };
};

```

现在，这个 RSS 源将具有类似于原始网站的阅读体验。

::: tip 提示
请注意，在先前的部分中，我们仅需向 API 发送一个  HTTP 请求即可获得所需的所有数据。然而，在此部分中，我们需要发送 `1 + n` 个 HTTP 请求，其中 `n` 是从第一个请求获取的文章列表中的数量。

部分网站可能不喜欢在短时间内接收大量请求，并返回类似于“429 Too Many Requests”的错误。
:::

## 使用通用配置路由

### 创建主文件

首先，我们需要一些数据：

1.  RSS 来源链接
2.  数据来源链接
3.  RSS 订阅标题（不是每个文章的标题）

打开您的代码编辑器并创建一个新文件。由于我们要为 GitHub 仓库 Issues 制作 RSS 源，因此建议将文件命名为 `issue.js`。

这是一些基础代码，你可以从这里开始：

```js
// 导入所需模组
const buildData = require('@/utils/common-config');

module.exports = async (ctx) => {
    ctx.state.data = await buildData({
        link: '', // RSS 来源链接
        url: '', // 数据来源链接
        // 此处可以使用变量
        // 如 %xxx% 会被解析为 **params** 中同名变量的值
        title: '%title%', 
        params: {
            title: '', // 标题变量
        },
    });
};
```

我们的 RSS 订阅源目前缺少内容。必须设置 `item` 才能添加内容。以下是一个示例：


```js{15-22}
const buildData = require('@/utils/common-config');

module.exports = async (ctx) => {
    const { user, repo = 'RSSHub' } = ctx.params;
    const link = `https://github.com/${user}/${repo}/issues`;

    ctx.state.data = await buildData({
        link,
        url: link,
        title: `${user}/${repo} issues`, // 也可以使用 $('head title').text()
        params: {
            title: `${user}/${repo} issues`,
            baseUrl: 'https://github.com',
        },
        item: {
            item: 'div.js-navigation-container .flex-auto',
            // 如果要使用变量，必须使用模板字符串
            title: `$('a').first().text() + ' - %title%'`, // 仅支持像 $().xxx() 这样的 js 语句
            link: `'%baseUrl%' + $('a').first().attr('href')`, // .text() 为获取元素的文本
            // description: ..., 目前没有文章正文
            pubDate: `parseDate($('relative-time').attr('datetime'))`,
        },
    });
};
```

你会发现，此代码与上面的 [从网页获取数据](#tong-guo-got-cong-html-huo-qu-shu-ju-cong-wang-ye-huo-qu-shu-ju) 部分相似。但是，这个 RSS 订阅源不包含 GitHub Issue 的正文。

### 获取完整文章

要获取每个 GitHub Issue 的正文，你需要添加一些代码。以下是一个示例：

```js{2-3,25-34}
const buildData = require('@/utils/common-config');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { user, repo = 'RSSHub' } = ctx.params;
    const link = `https://github.com/${user}/${repo}/issues`;

    ctx.state.data = await buildData({
        link,
        url: link,
        title: `${user}/${repo} issues`,
        params: {
            title: `${user}/${repo} issues`,
            baseUrl: 'https://github.com',
        },
        item: {
            item: 'div.js-navigation-container .flex-auto',
            title: `$('a').first().text() + ' - %title%'`,
            link: `'%baseUrl%' + $('a').first().attr('href')`,
            pubDate: `parseDate($('relative-time').attr('datetime'))`,
        },
    });

    await Promise.all(
        ctx.state.data.item.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: resonse } = await got(item.link);
                const $ = cheerio.load(resonse);
                item.description = $('.comment-body').first().html();
                return item;
            })
        )
    );
};
```

你可以看到，上面的代码与 [前一节](#tong-guo-got-cong-html-huo-qu-shu-ju-geng-hao-de-yue-du-ti-yan) 非常相似，通过添加一些代码它获取了完整文章。建议你尽可能使用 [前一节](#tong-guo-got-cong-html-huo-qu-shu-ju-geng-hao-de-yue-du-ti-yan) 中的方法，因为它比使用 `@/utils/common-config` 更加灵活。

## 使用 puppeteer

使用 Puppeteer 是从网站获取数据的另一种方法。不过，建议您首先尝试 [上述方法](#tong-guo-got-cong-html-huo-qu-shu-ju)。还建议您先阅读 [通过 got 从 HTML 获取数据](#tong-guo-got-cong-html-huo-qu-shu-ju)，因为本节是前一节的扩展，不会解释一些基本概念。

### 创建主文件

创建一个新文件并使用适当的名称保存，例如 `issue.js`。然后，导入所需模组并设置函数的基本结构：

```js
// 导入所需模组
const cheerio = require('cheerio'); // 可以使用类似 jQuery 的 API HTML 解析器
const { parseDate } = require('@/utils/parse-date');
const logger = require('@/utils/logger');

module.exports = async (ctx) => {
    // 在此处编写您的逻辑

    ctx.state.data = {
        // 在此处输出您的 RSS
    };
};
```

### 将 got 替换为 puppeteer

现在，我们将使用 `puppeteer` 代替 `got` 来从网页获取数据。

<code-group>
<code-block title="puppeteer">

```js{9-33,39-40}
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const logger = require('@/utils/logger');

module.exports = async (ctx) => {
    const baseUrl = 'https://github.com';
    const { user, repo = 'RSSHub' } = ctx.params;

    // 导入 puppeteer 工具类并初始化浏览器实例
    const browser = await require('@/utils/puppeteer')();
    // 打开一个新标签页
    const page = await browser.newPage();
    // 拦截所有请求
    await page.setRequestInterception(true);
    // 仅允许某些类型的请求
    page.on('request', (request) => {
        // 在这次例子，我们只允许 HTML 请求
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });
    // 访问目标链接
    const link = `${baseUrl}/${user}/${repo}/issues`;
    // got 请求会被自动记录，
    // 但 puppeteer 请求不会
    // 所以我们需要手动记录它们
    logger.debug(`Requesting ${link}`);
    await page.goto(link, {
        // 指定页面等待载入的时间
        waitUntil: 'domcontentloaded',
    });
    // 获取页面的 HTML 内容
    const response = await page.content();
    // 关闭标签页
    page.close();

    const $ = cheerio.load(response);

    // const item = ...;

    // 不要忘记关闭浏览器实例
    browser.close();

    ctx.state.data = {
        // 在此处输出您的 RSS
    };
}
```

</code-block>
<code-block title="got">

```js{9}
const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://github.com';
    const { user, repo = 'RSSHub' } = ctx.params;

    const { data: response } = await got(`${baseUrl}/${user}/${repo}/issues`);
    const $ = cheerio.load(response);

    ctx.state.data = {
        // 在此处输出您的 RSS
    };
}
```

</code-block>
</code-group>

### 获取完整文章

使用浏览器新标签页获取每个 GitHub Issue 的正文，类似于 [上一节](#tong-guo-got-cong-html-huo-qu-shu-ju-geng-hao-de-yue-du-ti-yan)。我们可以使用以下代码：

```js{46-60,71-72}
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const logger = require('@/utils/logger');

module.exports = async (ctx) => {
    const baseUrl = 'https://github.com';
    const { user, repo = 'RSSHub' } = ctx.params;

    const browser = await require('@/utils/puppeteer')();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });

    const link = `${baseUrl}/${user}/${repo}/issues`;
    logger.debug(`Requesting ${link}`);
    await page.goto(link, {
        waitUntil: 'domcontentloaded',
    });
    const response = await page.content();
    page.close();

    const $ = cheerio.load(response);

    const list = $('div.js-navigation-container .flex-auto')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.text(),
                link: `${baseUrl}${a.attr('href')}`,
                pubDate: parseDate(item.find('relative-time').attr('datetime')),
                author: item.find('.opened-by a').text(),
                category: item
                    .find('a[id^=label]')
                    .toArray()
                    .map((item) => $(item).text()),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                // 重用浏览器实例并打开新标签页
                const page = await browser.newPage();
                // 设置请求拦截，仅允许 HTML 请求
                await page.setRequestInterception(true);
                page.on('request', (request) => {
                    request.resourceType() === 'document' ? request.continue() : request.abort();
                });

                logger.debug(`Requesting ${item.link}`);
                await page.goto(item.link, {
                    waitUntil: 'domcontentloaded',
                });
                const response = await page.content();
                // 获取 HTML 内容后关闭标签页
                page.close();

                const $ = cheerio.load(response);

                item.description = $('.comment-body').first().html();

                return item;
            })
        )
    );

    // 所有请求完成后关闭浏览器实例
    browser.close();

    ctx.state.data = {
        title: `${user}/${repo} issues`,
        link: `https://github.com/${user}/${repo}/issues`,
        item: items,
    };
};
```

### 额外资源

这里有一些您可以使用的资源来了解 puppeteer：

-   [puppeteer's 旧版文档](https://github.com/puppeteer/puppeteer/blob/v15.2.0/docs/api.md)
-   [puppeteer's 当前文档](https://pptr.dev)
-   [puppeteer's 非官方中文文档](https://zhaoqize.github.io/puppeteer-api-zh_CN/)

#### 拦截请求

在爬取网页时，您可能会遇到您不需要的图像、字体和其他资源。这些资源会减慢页面加载速度并消耗宝贵的 CPU 和内存资源。为了避免这种情况，您可以在 puppeteer 中启用请求拦截。

这是如何实现的：

```js
await page.setRequestInterception(true);
page.on('request', (request) => {
    request.resourceType() === 'document' ? request.continue() : request.abort();
});
// 这两条语句必须放在 page.goto() 之前
```

您可以在 [这里](https://chromedevtools.github.io/devtools-protocol/tot/Network/#type-ResourceType) 找到 `request.resourceType()` 的所有可能值。在代码中使用这些值时，请确保使用**小写**字母。

#### Wait Until

在上面的代码中，您将看到在 `page.goto()` 函数中使用了 `waitUntil: 'domcontentloaded'`。这是 puppeteer 的一个选项，它告诉它在何时认为导航成功。您可以在 [这里](https://pptr.dev/api/puppeteer.page.goto/#remarks) 找到所有可能的值及其含义。

需要注意的是，`domcontentloaded` 的等待时间较短，而 `networkidle0` 可能不适用于始终发送后台遥测或获取数据的网站。

此外，重要的是避免等待特定的超时时间，而是等待选择器出现。等待超时是不准确的，因为它取决于 puppeteer 实例的负载情况。
