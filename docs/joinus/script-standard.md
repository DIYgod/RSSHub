---
sidebarDepth: 2
---

# 路由规范

## 代码规范

### 通用准则

-   **保持一致！**
-   避免使用已经被废弃的特性。
-   避免修改 `yarn.lock` 和 `package.json`，除非您添加了新的依赖。
-   将重复的代码合并为函数。
-   优先使用更高版本的 ECMAScript 标准特性，而不是使用低版本特性。
-   按字母顺序排序（大写字母优先），以便更容易找到条目。
-   尽量使用 HTTPS 而非 HTTP 传输数据。
-   尽量使用 WebP 格式而非 JPG 格式，因为前者支持更好的压缩。

### 代码格式

#### 缩进

-   使用 4 个空格缩进。

#### 分号

-   在每条语句结尾添加分号。

#### 字符串

-   使用单引号而不是双引号。
-   使用 [模板字符串](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Template_literals) 而非复杂的字符串拼接。
-   对于 GraphQL 查询，使用 [模板字符串](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Template_literals)。

#### 空格

-   在每个文件末尾添加一个空行。
-   避免尾随空格，代码应整洁易读。

### 语言特性

#### 类型转换

-   避免重复转换同一类型。

#### 函数

-   优先使用 [箭头函数](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Functions/Arrow_functions)，而不是使用 `function` 关键字定义函数。

#### 循环

-   对于数组，使用 `for-of`，而不是使用 `for`。([javascript:S4138](https://rules.sonarsource.com/javascript/RSPEC-4138))

#### 变量

-   使用 `const` 和 `let` 而不是 `var`。
-   每次声明一个变量。

### 命名

-   使用 `lowerCamelCase` 命名变量和函数
-   使用 `kebab-case` 命名文件和文件夹，也可以使用 `snake_case`。
-   使用 `CONSTANT_CASE` 命名常量。

## v2 路由规范

当在 RSSHub 中编写新的路由时，需要按特定方式组织文件。命名空间文件夹应该存储在 `lib/v2` 目录下，并且应包括三个必需文件：

-   `router.js` 注册路由
-   `maintainer.js` 提供路由维护者信息
-   `radar.js` 为每个路由提供对应 [RSSHub Radar](https://github.com/DIYgod/RSSHub-Radar) 规则

命名空间文件夹结构应该像这样：

    ├───lib/v2
    │   ├───furstar
    │       ├─── templates
    │           ├─── description.art
    │       ├─── router.js
    │       ├─── maintainer.js
    │       ├─── radar.js
    │       ├─── someOtherJs.js
    │   └───test
    │   └───someOtherNamespaces
    ...

**所有符合条件的，在 `lib/v2` 路径下的路由将会被自动载入，无需更新 `lib/router.js`**

### 命名空间

RSSHub 会将所有路由命名空间的文件夹名附加到路由前面。路由维护者可命名空间视为根目录。

#### 命名规范

-   使用二级域名 (second-level domain, SLD) 作为命名空间。有关 URL 结构的更多信息，请参阅 [此页面](/joinus/new-radar.html#ding-ceng-dui-xiang-jian)。
-   不要创建相同命名空间的变体。有关更多信息，请参阅 [此页面](/joinus/new-rss/before-start.html#chuang-jian-ming-ming-kong-jian)

### 注册路由

`router.js` 文件应导出一个方法，提供在初始化路由时使用的 `@koa/router` 对象。

### 维护者列表

`maintainer.js` 文件应导出一个对象，提供与路由相关的维护者信息，包括：

-   键: `@koa/router` 对象中对应的路由
-   值：一个字符串数组，包括所有维护者的 GitHub ID。

要生成维护者列表，可使用以下命令：`yarn build:maintainer`，它将在 `assets/build/` 目录下一份维护者列表。

::: danger 警告
The path in the `@koa/router` object should be the same as the `path` in the corresponding documentation with the namespace appended in front of it.

在 `@koa/router` 对象中的路由应该与相应的文档中添加命名空间前的 `path` 一致。
:::

### Radar 规则

所有路由都需要包含 `radar.js` 文件，其中包括相应的域名。最低要求是规则出现在相应的站点上，即需要填写 `title` 和 `docs` 字段。

要生成完整的 `radar-rules.js` 文件，可使用以下命令：`yarn build:radar`，它将在 `assets/build/` 目录下创建文件。

::: tip 提示
在提交代码之前，请记得删除所有在 `assets/build/` 中的生成的资源。
:::

### 渲染模板

当渲染自定义 HTML 内容（例如 `item.description`）时，**必须**使用 [art-template](https://aui.github.io/art-template/) 进行排版。

所有模板都应放置在路由命名空间下的 `templates` 文件夹中，并使用 `.art` 文件扩展名命名。

#### 示例

下面是在 [furstar](https://github.com/DIYgod/RSSHub/blob/master/lib/v2/furstar) 命名空间中示例：

<<< @/lib/v2/furstar/templates/author.art

<!-- markdownlint-disable MD046 -->

```js
const path = require('path');
const { art } = require('@/utils/render');
const renderAuthor = (author) => art(path.join(__dirname, 'templates/author.art'), author);
```

<!-- markdownlint-enable MD046 -->
