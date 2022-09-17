# Script Standard

::: warning Warning

This standard is still WIP and may change over time, so please remember to check it often!

:::

When writing a new route, RSSHub will read the following in a folder :

-   `router.js` Register route
-   `maintainer.js` Fetch route path and maintainer
-   `radar.js` Fetch the website and the matching rules corresponding to the route: <https://github.com/DIYgod/RSSHub-Radar/>
-   `templates` Rendering templates

**The above files are mandatory for all routes**

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

**All eligible routes under `/v2` path will be loaded automatically without the need of updating `router.js`**

## Route Example

Refer to `furstar`: `./lib/v2/furstar`

You can copy the folder as a start-up route template

## Register Route

`router.js` should export a method that provides a `@koa/router` object when we initialize the route

### Naming Standard

RSSHub will append all the route folder names in front of the actual route by default. The route maintainers can think that the one he gets is the root. We will append the corresponding namespace under which the developers have all the control

### Example

```js
module.exports = function (router) {
    router.get('/characters/:lang?', require('./index'));
    router.get('/artists/:lang?', require('./artists'));
    router.get('/archive/:lang?', require('./archive'));
};
```

## Maintainer List

`maintainer.js` should export an object from which we will retrieve the maintainer information when we get the path-related information, etc.

-   key: `@koa/router` Corresponding path
-   value: Array, includes all maintainers' Github Username

Github ID may be a better choice, but it is inconvenient to deal with the follow-up, so use GitHub Username for now.

### Example

```js
module.exports = {
    '/characters/:lang?': ['NeverBehave'],
    '/artists/:lang?': ['NeverBehave'],
    '/archive/:lang?': ['NeverBehave'],
};
```

`npm run build:maintainer` will generate a list of maintainers under `assets/build`

## Radar Rules

Writing style: <https://docs.rsshub.app/en/joinus/quick-start.html#submit-new-rsshub-radar-rule>

**We currently require all routes to include this file and include the corresponding domain name -- we don't require an exact route match. The minimum requirement is that it will show up on the corresponding site. This file will also be used later to help with bug feedback.**

### Example

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

`npm run build:radar` will generate a complete `radar-rules.js` under `/assets/build/`

## Template

We currently require all routes, when rendering content with HTML such as `description`, **must** use the art engine for layout

art documentation: <https://aui.github.io/art-template/docs/>

Apart from that, all templates should be placed in the script's `templates` folder: We will use this to provide custom template switching/rendering, etc.

### Example

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

The script can also provide a custom object for debugging: Access the corresponding route + `.debug.json` to get the corresponding content

We don't have any restrictions on the formatting of this part yet, it's completely optional, and we will see where this option goes
