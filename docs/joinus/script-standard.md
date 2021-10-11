# 路由规范

::: warning 警告

这个规范仍在制定过程中，可能会随着时间推移而发生改变，请记得多回来看看！

:::

在编写新的路由时，RSSHub会读取文件夹中的：

- `router.js`注册路由
- `maintainer.js`获取路由路径，维护者
- `radar.js`获取路由所对应的网站，以及匹配规则：https://github.com/DIYgod/RSSHub-Radar/
- `templates` 渲染模版

**以上文件为所有插件必备**

```
├───lib/v2
│   ├───furstar
│       ├─── templates
│           ├─── description.art
│       ├─── router.js
│       ├─── maintainer.js
│       ├─── radar.js
│       ├─── someOtherJs.js
│   └───test
│   └───someOtherScript
...
```

**所有符合条件的，在`/v2`路径下的路由，将会被自动载入，无需更新`router.js`**

## 路由示例

参考`furstar`: `./lib/v2/furstar`

可以复制该文件夹作为新路由模版

## 注册路由

`router.js` 应当导出一个方法，我们在初始化路由的时候，会提供一个`@koa/router`对象

### 命名规范

我们会默认将所有的路由文件夹名字附加在真正的路由前面。路由维护者可以认定自己获取的就是根，我们会在附加对应的命名空间，在这空间底下，开发者有所有的控制权

### 例子

```js
module.exports = function (router) {
    router.get('/characters/:lang?', require('./index'));
    router.get('/artists/:lang?', require('./artists'));
    router.get('/archive/:lang?', require('./archive'));
};
```

## 维护者列表

`maintainer.js` 应当导出一个对象，在我们获取路径相关信息时，将会在从这里调取开发者信息等

- key: `@koa/router` 对应的路径匹配
- value: 数组，包含所有开发者的Github Username

Github ID可能是更好的选择，但是后续处理不便，目前暂定Username

### 例子

```js
module.exports = {
    '/characters/:lang?': ['NeverBehave'],
    '/artists/:lang?': ['NeverBehave'],
    '/archive/:lang?': ['NeverBehave'],
};
```

`npm run build:maintainer` 将会在`assets/build`下生成一份贡献者清单

## Radar Rules

书写方式： <https://docs.rsshub.app/joinus/quick-start.html#ti-jiao-xin-de-rsshub-radar-gui-ze>

**我们目前要求所有路由，必须包含这个文件，并且包含对应的域名 -- 我们不要求完全的路由匹配，最低要求是在对应的网站，可以显示支持即可。这个文件后续会用于帮助bug反馈。**

### 例子

```js
module.exports = {
    'furstar.jp': {
        _name: 'Furstar',
        '.': [
            {
                title: '最新售卖角色列表',
                docs: 'https://docs.rsshub.app/shopping.html#furstar-zui-xin-shou-mai-jiao-se-lie-biao',
                source: ['/:lang', '/'],
                target: '/furstar/characters/:lang',
            },
            {
                title: '已经出售的角色列表',
                docs: 'https://docs.rsshub.app/shopping.html#furstar-yi-jing-chu-shou-de-jiao-se-lie-biao',
                source: ['/:lang/archive.php', '/archive.php'],
                target: '/furstar/archive/:lang',
            },
            {
                title: '画师列表',
                docs: 'https://docs.rsshub.app/shopping.html#furstar-hua-shi-lie-biao',
                source: ['/'],
                target: '/furstar/artists',
            },
        ],
    },
};
```


`npm run build:radar` 将会在`/assets/build/`下生成一份完整的`radar-rules.js`


## Template

我们目前要求所有路由，在渲染`description`等带HTML的内容时，**必须**使用art引擎进行排版

art说明文档： <https://aui.github.io/art-template/docs/>

同时，所有模版应该放在插件`templates`文件夹中 -- 后续我们会以此提供自定义模版切换/渲染等需求

### 例子

```art
<div>
    <img src="{{ avatar }}" />
    {{ if link !== null }}
    <a href="{{ link }}">{{name}}</a>
    {{ else }}
    <a href="#">{{name}}</a>
    {{ /if }}
</div>
```

```js
const { art } = require('@/utils/render');
const renderAuthor = (author) => art(path.join(__dirname, 'templates/author.art'), author);
```

## ctx.state.json

插件目前可以提供一个自定义的对象，用于调试 -- 访问对应路由+`.debug.json`即可获取到对应内容

我们对这个部分格式内容没有任何限制，完全可选，目前会继续观察这个选项的发展方向

