# 提交新的 RSSHub Radar 规则

如果需要查看新规则的结果，建议您安装浏览器扩展程序。您可以在 [参与我们](/joinus/quick-start.html#ti-jiao-xin-de-rsshub-radar-gui-ze) 页面下载适合您浏览器的扩展程序。

## 编写规则

要制作新的 RSSHub Radar 规则，需要在 `/lib/v2/` 目录下，相应的域名空间创建 `radar.js` 文件。下面以制作 `GitHub 仓库 Issues` 的 RSS 源为例，详见此处。编写的代码应如下所示：

```js
module.exports = {
    'github.com': {
        _name: 'GitHub',
        '.': [
            {
                title: '仓库 Issues',
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: ['/:user/:repo/issues/:id', '/:user/:repo/issues',  '/:user/:repo'],
                target: '/github/issue/:user/:repo',
            },
        ],
    },
};
```

## 顶层对象键

对象键是域名本身，不含任何子域名、URL 路径或协议。

![URL 构成](https://wsrv.nl/?url=https://enwpgo.files.wordpress.com/2022/10/image-30.png&output=webp)

在此示例中，域名为 `github.com`，对象键则为 `github.com`。

## 内部对象键

第一个内部对象键是 `_name`，是网站的名称。这应与路由文档的二级标题 (`##`) 相同。在此示例中是 `GitHub`。

其余的内部对象键是网站的子域名。如果要匹配的网站没有子域名，或者想同时匹配 `www.example.com` 和 `example.com`，则应使用 `'.'`。在此示例中，我们将使用 `'.'`，因为我们希望匹配 `github.com`。请注意，每个子域名键应返回**一个对象数组**。

<code-group>
<code-block title="github.com 和 www.github.com">

```js{4}
module.exports = {
    'github.com': {
        _name: 'GitHub',
        '.': [
            {
                title: '...',
                docs: '...',
                source: ['/...'],
                target: '/...',
            },
        ],
    },
};
```

</code-block>
<code-block title="abc.github.com">

```js{4}
module.exports = {
    'github.com': {
        _name: 'GitHub',
        abc: [
            {
                title: '...',
                docs: '...',
                source: ['/...'],
                target: '/...',
            },
        ],
    },
};
```

</code-block>
<code-block title="abc.def.github.com">

```js{4}
module.exports = {
    'github.com': {
        _name: 'GitHub',
        'abc.def': [
            {
                title: '...',
                docs: '...',
                source: ['/...'],
                target: '/...',
            },
        ],
    },
};
```

</code-block>
</code-group>

### `title`

标题是*必填*字段，应与路由文档的三级标题 (`###`) 相同。在此示例中，它是`仓库 Issues`。在 `title` 中无须重复网站名称 (`_name`)，即 `GitHub`。

### `docs`

文档链接也是*必填*字段。在这种情况下，`GitHub 仓库 Issues` 的文档链接将是 `https://docs.rsshub.app/programming.html#github`。请注意，URL hash 应位于二级标题 (`##`) 处，而不是三级标题 (`###`) `https://docs.rsshub.app/programming.html#github-cang-ku-issues`。

### `source`

source 是*可选*字段，应指定 URL 路径。如果不想匹配任何 URL 路径，请将其留空。它只会出现在 RSSHub Radar 浏览器扩展程序的`适用于当前网站的 RSSHub`选项中。

source 应为一个字符串数组。例如，如果 `GitHub 仓库 Issues` 的 source 是 `/:user/:repo`，则意味着当您访问 `https://github.com/DIYgod/RSSHub` 时将匹配 `/:user/:repo`，此时返回的结果 params 将是：`{user: 'DIYgod', repo: 'RSSHub'}`。浏览器扩展程序使用这些参数根据 target 字段建立 RSSHub 订阅地址。

::: warning 注意
如果要提取的值在 URL 参数或 URL hash 中，请使用 target 函数而不是 source 字段。 此外，请记住，source 字段仅匹配 URL 路径，而不匹配 URL 的任何其他部分。
:::

您也可以使用 `*` 符号执行通配符匹配。请注意，此处的语法与 [path-to-regexp](https://github.com/pillarjs/path-to-regexp) 不同。例如，`/:user/:repo/*` 将匹配 `https://github.com/DIYgod/RSSHub/issues` 和 `https://github.com/DIYgod/RSSHub/issues/1234`。如果要对匹配结果进行命名，可以在 `*` 符号后放置变量名。例如，`/user/:repo/*path`，在此情况下，`path` 将是 `issues` 和 `issues/1234`。

### `target`

目标是**可选**字段，并用于生成 RSSHub 订阅地址，它可以接受字符串或函数作为输入。如果你不想建立 RSSHub 订阅地址，可以将此字段留空。

以 `GitHub 仓库 Issues` 为例，在 RSSHub 文档中相应的路由为 `/github/issue/:user/:repo`。

在将 source 路径中的 `user` 匹配为 `DIYgod`，`repo` 匹配为 `RSSHub` 后，RSSHub 路由中的 `:user` 将被替换为 `DIYgod`，`:repo` 将被替换为 `RSSHub`，结果为 `/github/issue/DIYgod/RSSHub`。

#### `target` 函数

如果 source 路径不能匹配 RSSHub 路由的期望参数，则可以将 target 作为函数使用，与 `params`、`url` 和 `document` 参数一起使用。其中，`params` 参数包含 `source` 字段匹配到的参数，而 `url` 参数是当前的网页 URL 字符串，`document` 参数是 [document 接口](https://developer.mozilla.org/docs/Web/API/document)。

需要注意的是，`target` 函数在沙盒中运行，对 `document` 的任何更改都不会反映在网页中。

下面是使用 `target` 字段作为函数的两个示例：

<code-group>
<code-block title="使用 params 匹配">

```js{9}
module.exports = {
    'github.com': {
        _name: 'GitHub',
        '.': [
            {
                title: '仓库 Issues',
                docs: 'https://docs.rsshub.app/en/programming.html#github',
                source: ['/:user/:repo/issues/:id', '/:user/:repo/issues',  '/:user/:repo'],
                target: (params) => `/github/issue/${params.user}/${params.repo}`,
            },
        ],
    },
};
```

</code-block>
<code-block title="使用 URL 匹配">

```js{9}
module.exports = {
    'github.com': {
        _name: 'GitHub',
        '.': [
            {
                title: '仓库 Issues',
                docs: 'https://docs.rsshub.app/en/programming.html#github',
                source: ['/:user/:repo'],
                target: (_, url) => `/github/issue${new URL(url).pathname}`
            },
        ],
    },
};
```

</code-block>
</code-group>

两个示例将返回与 [第一个示例](/joinus/new-radar.html#bian-xie-gui-ze) 相同的 RSSHub 订阅地址。

### RSSBud

[RSSBud](https://github.com/Cay-Zhang/RSSBud) 支持 RSSHub Radar 的规则并且也会自动更新，但是请注意：

-   使用 `'.'` 子域名可以使 RSSBud 支持常见的移动端子域名，例如 `m`/`mobile`。
-   在 `target` 中使用 `document` 的规则并不适用于 RSSBud：RSSBud 不是浏览器扩展程序，它只能获取和分析网站的 URL，不能运行 JavaScript。

### 补充文档

[如前所述](/joinus/new-rss/add-docs.html#wen-dang-shi-li-qi-ta-zu-jian)，在 RSSHub 文档添加 radar="1" 将显示“支持浏览器扩展”的徽章。如果规则还与 RSSBud 兼容，则添加 rssbud="1" 将显示“支持 RSSBud”的徽章。

## 调试 Radar 规则

你可以在浏览器中的 RSSHub Radar 扩展设置中调试你的 radar 规则。首先，打开设置并切换到 “规则列表” 选项页。然后滚动到页面底部，您会看到一个文本框。在这里，您可以使用您的新规则替换旧规则以进行调试。

如果担心失去原来的 RSSHub Radar 规则，那就不要担心，如果你在设置页面中点击“立即更新”按钮，它将会被恢复。

以下是几个可以用来调试的 radar 规则示例：

```js
({
    'github.com': {
        _name: 'GitHub',
        '.': [
            {
                title: '仓库 Issues',
                docs: 'https://docs.rsshub.app/en/programming.html#github',
                source: ['/:user/:repo/issues/:id', '/:user/:repo/issues',  '/:user/:repo'],
                target: '/github/issue/:user/:repo',
            },
        ],
    },
})
```

::: details 其他示例

```js
({
    'bilibili.com': {
        _name: 'bilibili',
        www: [
            {
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
            },
        ],
    },
    'twitter.com': {
        _name: 'Twitter',
        '.': [
            {
                // for twitter.com
                title: '用户时间线',
                docs: 'https://docs.rsshub.app/social-media.html#twitter',
                source: '/:id',
                target: (params) => {
                    if (params.id !== 'home') {
                        return '/twitter/user/:id';
                    }
                },
            },
        ],
    },
    'pixiv.net': {
        _name: 'Pixiv',
        www: [
            {
                title: '用户收藏',
                docs: 'https://docs.rsshub.app/social-media.html#pixiv',
                source: '/bookmark.php',
                target: (params, url) => `/pixiv/user/bookmarks/${new URL(url).searchParams.get('id')}`,
            },
        ],
    },
    'weibo.com': {
        _name: '微博',
        '.': [
            {
                title: '博主',
                docs: 'https://docs.rsshub.app/social-media.html#%E5%BE%AE%E5%8D%9A',
                source: ['/u/:id', '/:id'],
                target: (params, url, document) => {
                    const uid = document && document.documentElement.innerHTML.match(/\$CONFIG\['oid']='(\d+)'/)[1];
                    return uid ? `/weibo/user/${uid}` : '';
                },
            },
        ],
    },
})
```

:::
