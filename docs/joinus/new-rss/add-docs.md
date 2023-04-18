---
sidebarDepth: 2
---

# 添加文档

现在我们完成了代码，是时候为您的路由添加文档了。在 [文档 (/docs/)](https://github.com/DIYgod/RSSHub/blob/master/docs) 中打开相应的文件，本例中是 `docs/programming.md`。您可以通过运行以下命令实时预览文档：

<code-group>
<code-block title="yarn" active>

```bash
yarn docs:dev
```

</code-block>
<code-block title="npm">

```bash
npm run docs:dev
```

</code-block>
</code-group>

文档使用 Markdown 编写，并使用 [VuePress v1](https://v1.vuepress.vuejs.org) 渲染。

要为您的路由添加文档，请使用 Vue 组件。它们类似于 HTML 标签。以下是最常用的组件：

-   `author`：路由维护者，用单个空格分隔。应与 [`maintainer.js`](/joinus/new-rss/before-start.html#li-jie-ji-chu-zhi-shi-maintainer-js) 相同
-   `example`：路由示例，以 `/` 开头
-   `path`：路由，应与添加命名空间后 [maintainer.js](/joinus/new-rss/before-start.html#li-jie-ji-chu-zhi-shi-maintainer-js) 中的键相同。在之前的教程中，它为 `/github/issue/:user/:repo?`
-   `:paramsDesc`：路由参数描述，以字符串数组形式，支持 Markdown。
    -   描述必须按照它们在路由中出现的顺序。
    -   描述的数量**应**与 `path` 中的参数数量匹配。如果漏掉一个描述，则构建过程会失败。
    -   以 `?`，`*` 或 `+` 结尾的路由参数将自动分别标记为`可选`，`零个或多个`或`一个或多个`，无须再次提及。
    -   没有符号后缀的路由参数将自动标记为`必选`
    -   如果参数是可选的，请提及其默认值。

## 文档示例

### 仓库 Issues（无参数）

```vue
<Route author="HenryQW" example="/sspai/series" path="/sspai/series" />
```

---

<Route author="HenryQW" example="/sspai/series" path="/sspai/series"/>

---

### 仓库 Issues（多个参数）

```vue
<Route author="HenryQW" example="/github/issue/DIYgod/RSSHub" path="/github/issue/:user/:repo?" :paramsDesc="['GitHub 用户名', 'GitHub 仓库名称，默认为 `RSSHub`']" />
```

---

<Route author="HenryQW" example="/github/issue/DIYgod/RSSHub" path="/github/issue/:user/:repo?" :paramsDesc="['GitHub 用户名', 'GitHub 仓库名称，默认为 `RSSHub`']" />

---

### 关键词（带表格的说明）

```vue
<Route author="DIYgod" example="/pixiv/search/麻衣/popular/2" path="/pixiv/search/:keyword/:order?/:mode?" :paramsDesc="['关键词', '排序方式，`popular` 按热门度排序，空或其他任意值按时间排，默认为 `date`', '过滤方式，见下表 默认为空']">

| 只看非 R18 内容 | 只看 R18 内容 | 不过滤   |
| ------------ | -------- | ------------ |
| safe         | r18      | 空或其他任意值 |

</Route>
```

---

<Route author="DIYgod" example="/pixiv/search/麻衣/popular/2" path="/pixiv/search/:keyword/:order?/:mode?" :paramsDesc="['关键词', '排序方式，`popular` 按热门度排序，空或其他任意值按时间排，默认为 `date`', '过滤方式，见下表 默认为空']">

| 只看非 R18 内容 | 只看 R18 内容 | 不过滤   |
| ------------ | -------- | ------------ |
| safe         | r18      | 空或其他任意值 |

</Route>

---

### 自定义容器

如果您想提供关于路由的更多信息，可以使用这些自定义容器：

```md
::: tip 提示标题
这是一个提示。
:::

::: warning 警告标题
这是一个警告。
:::

::: danger 危险标题
这是一条危险的警告。
:::

::: details 详细标题
这是一个详细块。
:::
```

---

::: tip 提示标题
这是一个提示。
:::

::: warning 警告标题
这是一个警告。
:::

::: danger 危险标题
这是一条危险的警告。
:::

::: details 详细标题
这是一个详细块。
:::

---

### 其他组件

除了路由组件之外，还有几个组件可用于提供有关路径的更多信息：

-   `anticrawler`：如果目标网站有反爬机制，则设置为 `1`。
-   `puppeteer`：如果源使用 puppeteer 抓取，则设置为 `1`。
-   `radar`：如果此源有相应的 Radar 规则，则设置为 `1`。
-   `rssbud`：如果 Radar 规则与 RSSBud 兼容，则设置为 `1`。
-   `selfhost`：如果 RSS 源需要通过环境变量进行额外配置，则设置为 `1`。
-   `supportBT`：如果支持被 BitTorrent 客户端识别，则设置为 `1`。
-   `supportPodcast`：如果源支持播客，则设置为 `1`。
-   `supportScihub`：如果源支持 Sci-Hub，则设置为 `1`。

通过添加这些组件，您可以向用户提供有用的信息，并使其更易于理解和使用您的路由。将这些组件添加到路由文档中将在其前面添加一个徽章。

```vue
<Route author="HenryQW" example="/github/issue/DIYgod/RSSHub" path="/github/issue/:user/:repo?" :paramsDesc="['GitHub 用户名', 'GitHub 仓库名称，默认为 `RSSHub`']" anticrawler="1" puppeteer="1" radar="1" rssbud="1" selfhost="1" supportBT="1" supportPodcast="1" supportScihub="1" />
```

---

<Route author="HenryQW" example="/github/issue/DIYgod/RSSHub" path="/github/issue/:user/:repo?" :paramsDesc="['GitHub 用户名', 'GitHub 仓库名称，默认为 `RSSHub`']" anticrawler="1" puppeteer="1" radar="1" rssbud="1" selfhost="1" supportBT="1" supportPodcast="1" supportScihub="1" />

---

## 其他事项

-   为路由添加文档时，请使用三级标题（`###`）。如果路由文档没有二级标题，则添加二级标题（`##`）。
-   在每个标题和内容之间留一个空行。这有助于确保文档可以成功构建。
-   如果文档包含大型表格，建议将其放入 [details 容器](#wen-dang-shi-li-zi-ding-yi-rong-qi) 中。
-   组件可以有两种写法：自闭合标签形式（`<Route .../>`）或成对标签形式（`<Route>...</Route>`）。
-   **别忘了关闭标签！**
-   在提交 Pull Request 之前，请务必运行以下命令检查和格式化您的代码：

<code-group>
<code-block title="yarn" active>

```bash
yarn format
```

</code-block>
<code-block title="npm">

```bash
npm run format
```

</code-block>
</code-group>
