---
sidebarDepth: 2
---
# 开始之前

在本教程中，我们将通过制作一个 [GitHub 仓库 Issues](/programming.html#github-cang-ku-issues) 的 RSS 源为例，向您展示制作 RSS 源的过程。

## 安装依赖

开始之前，您需要安装 RSSHub 的依赖项。您可以在 RSSHub 的根目录下运行以下命令来完成安装：

<code-group>
<code-block title="pnpm" active>

```bash
pnpm i
```

</code-block>
<code-block title="yarn">

```bash
yarn
```

</code-block>
<code-block title="npm">

```bash
npm install
```

</code-block>
</code-group>

## 开始调试

一旦您成功安装了依赖，您可以通过运行以下命令来开始调试 RSSHub：

<code-group>
<code-block title="pnpm" active>

```bash
pnpm run dev
```

</code-block>
<code-block title="yarn">

```bash
yarn dev
```

</code-block>
<code-block title="npm">

```bash
npm run dev
```

</code-block>
</code-group>

请务必密切关注控制台输出的任何错误消息或其他有用的信息，这些信息可以帮助您诊断和解决问题。另外，如果您遇到任何困难，不要犹豫向 RSSHub 文档或社区寻求帮助。

要查看您所做更改的结果，请在浏览器中打开 `http://localhost:1200`。您将能够在浏览器中自动反映您对代码的更改。

## 遵循路由规范

确保所有新的 RSS 源路由均遵循 [路由规范](/joinus/script-standard.html) 非常重要。不遵循规范可能导致您的 Pull Request 在合理的时间内无法合并。

[路由规范](/joinus/script-standard.html) 提供了制作高质量和可靠源代码的指导方针。通过遵循这些指南，您可以确保您的 RSS 源按照预期工作，并且易于其他社区维护者阅读。

在提交您的 Pull Request 之前，请仔细阅读 [路由规范](/joinus/script-standard.html)，并确保您的代码符合所有要求。这将有助于加快审查过程。

## 创建命名空间

制作新的 RSS 路由的第一步是创建命名空间。命名空间应该与您制作 RSS 源的主要网站的二级域名**相同**。例如，如果您正在为 <https://github.com/DIYgod/RSSHub/issues> 制作 RSS 源，第二级域名是 `github`。因此，您应该在 `lib/v2` 下创建名为 `github` 的文件夹，作为您的 RSS 路由的命名空间。

::: tip 提示
在创建命名空间时，避免为同一命名空间的创建多个变体。例如，如果您为 `yahoo.co.jp` 和 `yahoo.com` 制作 RSS 源，则应该使用单个命名空间 `yahoo`，而不是创建多个命名空间如 `yahoo-jp`、`yahoojp`、`yahoo.jp`、`jp.yahoo`、`yahoocojp` 等。
:::

## 理解基础知识

### router.js

一旦您为 RSS 路由创建了命名空间，下一步就是在 `router.js` 中注册它。

例如，如果您为 [GitHub 仓库 Issues](/programming.html#github-cang-ku-issues) 制作 RSS 源，并且假设您希望用户输入 GitHub 用户名和仓库名，如果他们没有输入仓库名，则返回到 `RSSHub`，您可以使用以下代码在 `github/router.js` 中注册您的新 RSS 路由：

<code-group>
<code-block title="箭头函数" active>

```js{2}
module.exports = (router) => {
    router.get('/issue/:user/:repo?', require('./issue'));
};
```

</code-block>
<code-block title="传统函数">

```js{2}
module.exports = function (router) {
    router.get('/issue/:user/:repo?', require('./issue'));
};
```

</code-block>
</code-group>

在 `router.js` 中注册您的新 RSS 路由时，您可以定义路由路径并指定要执行的相应函数。在上面的代码中，`router.get()` 方法用于指定新的 RSS 路由的 HTTP 方法和路径。`router.get()` 的第一个参数是使用 [path-to-regexp](https://github.com/pillarjs/path-to-regexp) 语法的路由路径。第二个参数是您新的 RSS 规则 `issue.js` 中导出的函数。您可以省略 `.js` 扩展名。

在上面的示例中，`issue` 是一个精确匹配，`:user` 是一个必需参数，`:repo?` 是一个可选参数。`?` 在 `:repo` 之后表示该参数是可选的。如果用户没有输入仓库名，则会返回到您代码中指定的内容（这里是 `RSSHub`）。

一旦您定义了路由路径，您可以从 `ctx.params` 对象中获取参数的值。例如，如果用户访问了 `/github/issue/DIYgod/RSSHub`，您可以分别从 `ctx.params.user` 和 `ctx.params.repo` 中获取 `user` 和 `repo` 的值。例如，如果用户访问了 `/github/issue/DIYgod/RSSHub`，则 `ctx.params.user` 和 `ctx.params.repo` 将分别为 `DIYgod` 和 `RSSHub`。

**请注意，值的类型将是 String 或 undefined。**

您可以使用 `*` 或 `+` 符号来匹配路径的其余部分，例如 `/some/path/:variable*`。请注意，`*` 和 `+` 分别意味着“零个或多个”和“一个或多个”。您还可以使用模式，例如 `/some/path/:variable(\\d+)?`，甚至是正则表达式。

::: tip 提示
有关 `router` 的更高级用法，请参阅 [@koa/router API 参考文档](https://github.com/koajs/router/blob/master/API.md)。
:::

### maintainer.js

该文件用于存储 RSS 路由的维护者信息。您可以将您的 GitHub 用户名添加到该值数组中。请注意，此处的键应与 `router.js` 中的路径完全匹配：

```js{2}
module.exports = {
    '/issue/:user/:repo?': ['DIYgod'],
};
```

`maintainer.js` 文件有助于跟踪负责维护 RSS 路由的人员。当用户遇到 RSS 路由的问题时，他们可以联系此文件中列出的维护者。

### `templates` 文件夹

`templates` 文件夹包含您的新 RSS 路由的模板。如果您不需要呈现任何自定义 HTML 内容，可以跳过此文件夹。

每个模板文件应该有一个 `.art` 文件扩展名。

### radar.js

文件可以帮助用户在使用 [RSSHub Radar](https://github.com/DIYgod/RSSHub-Radar) 或其他兼容其格式的软件时订阅您的新 RSS 路由。我们将在后面的部分更多介绍。

### 您的新 RSS 路由 `issue.js`

现在您可以开始 [编写](/joinus/new-rss/start-code.html) 新的 RSS 路由了。

## 获取数据

要为新的 RSS 路由获取数据，通常需要使用 [got](https://github.com/sindresorhus/got) 进行 HTTP 请求到 API 或网页。在某些情况下，您可能需要使用 [puppeteer](https://github.com/puppeteer/puppeteer) 模拟浏览器并呈现网页以获取数据。

您获取的数据通常会以 JSON 或 HTML 格式呈现。如果您需要处理的是 HTML，可以使用 [cheerio](https://github.com/cheeriojs/cheerio) 进行进一步处理。

以下是推荐的数据获取方法列表，按优先顺序排列：

1.  **通过 API**：这是获取数据最推荐的方法，因为 API 通常比从 HTML 网页中提取数据更稳定和更快。

2.  **通过 got 从 HTML 获取数据**：如果 API 不可用，则可以尝试从 HTML 网页中提取数据。这通常是您大部分时候使用的方法。请注意，如果 HTML 包含嵌入 JSON，则应该使用它而不是其他 HTML 元素。

3.  **通用配置路由**：通用配置路由是一条特殊的路由，它可以通过 cheerio（CSS 选择器和 jQuery 函数）读取 JSON 数据轻松生成 RSS。

4.  **Puppeteer**：在某些罕见情况下，您可能需要使用 puppeteer 模拟浏览器并获取数据。这是最不推荐的方法，只有在绝对必要时才应该使用，例如网页带有浏览器完整性检查或强加密。如果可能，请使用其他方法，例如 API 请求或使用 [got](https://github.com/sindresorhus/got) 或 [cheerio](https://github.com/cheeriojs/cheerio) 直接从 HTML 页面中提取数据。
