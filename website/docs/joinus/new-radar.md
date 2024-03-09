---
sidebar_position: 3
---

# New RSSHub Radar Rules

If you want to see the results, we suggest you install the browser extension. You can download it for your browser on the [Join Us](/joinus/quick-start#submit-new-rsshub-radar-rules-before-you-start) page.

## Code the rule

To create a new RSS feed, create a file called `radar.ts` under the corresponding namespace in [/lib/routes/](https://github.com/DIYgod/RSSHub/tree/master/lib/routes). We will continue to use the example of creating an RSS feed for `GitHub Repo Issues`, which is described [here](/joinus/new-rss/before-start). The resulting code will look like this:

```js
export default {
    'github.com': {
        _name: 'GitHub',
        '.': [
            {
                title: 'Repo Issues',
                docs: 'https://docs.rsshub.app/routes/programming#github',
                source: ['/:user/:repo/issues/:id', '/:user/:repo/issues',  '/:user/:repo'],
                target: '/github/issue/:user/:repo',
            },
        ],
    },
};
```

## Top-level Object key

The object key is the domain name without any subdomains, URL path, or protocol.

![Struction of a URL](https://wsrv.nl/?url=https://enwpgo.files.wordpress.com/2022/10/image-30.png&output=webp)

In this case, the domain name is `github.com`, so the object key is `github.com`.

## Inner object key

The first inner object key is `_name`, which is the name of the website. This should be the same as the level 2 heading (`##`) of the route documentation. In this case, it's `GitHub`.

The rest of the inner object keys are the subdomains of a website. If a website you want to match does not have any subdomains, or you want to match both `www.example.com` and `example.com`, use `'.'` instead. In this case, we will use `'.'` since we want to match `github.com`. Note that each subdomain should return **an array of objects**.

<Tabs>
<TabItem value="github.com" label="github.com and www.github.com">

```js
export default {
    'github.com': {
        _name: 'GitHub',
        // highlight-next-line
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

</TabItem>
<TabItem value="abc.github.com" label="abc.github.com">

```js
export default {
    'github.com': {
        _name: 'GitHub',
        // highlight-next-line
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

</TabItem>
<TabItem value="abc.def.github.com" label="abc.def.github.com">

```js
export default {
    'github.com': {
        _name: 'GitHub',
        // highlight-next-line
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

</TabItem>
</Tabs>

### `title`

The title is a *required* field and should be the same as the level 3 heading (`###`) of the route documentation. In this case, it's `Repo Issues`. Do not repeat the website name (`_name`), which is `GitHub`, in `title`.

### `docs`

The documentation link is also a *required* field. In this case, the documentation link for `GitHub Repo Issues` will be `https://docs.rsshub.app/routes/programming#github`.

Note that the hash should be positioned to the level 2 heading (`##`), and not `https://docs.rsshub.app/routes/programming#github-repo-issues`.

### `source`

The source field is *optional* and should specifies the URL path. Leave it blank if you don't want to match any URL paths. It only appears in `RSSHub for the current site` option of the RSSHub Radar browser extension.

The source should be an array of strings. For example, if the source for `GitHub Repo Issues` is `/:user/:repo`, it means that when you visit `https://github.com/DIYgod/RSSHub`, which matches the `github.com/:user/:repo` pattern, the parameters for this URL will be: `{user: 'DIYgod', repo: 'RSSHub'}`. The browser extension uses these parameters to create an RSSHub subscription address based on the `target` field.

:::warning

If the value you want to extract is in the URL search parameters or URL hash, use target as a function instead of the `source` field. Also, remember that the `source` field only matches the URL path and not any other parts of the URL.

:::

You can use the `*` symbol to perform wildcard matching. Note that the syntax here is not the same as the [path-to-regexp](https://github.com/pillarjs/path-to-regexp). For instance, `/:user/:repo/*` will match both `https://github.com/DIYgod/RSSHub/issues` and `https://github.com/DIYgod/RSSHub/issues/1234`. If you want to name the matching result, you can place the variable name after the `*` symbol. For example, `/user/:repo/*path`, whereby path will be `issues` and `issues/1234` in the above scenario.

### `target`

The target field is *optional* and is used to generate an RSSHub subscription address. It accepts both a string or a function. If you don't want to create an RSSHub subscription address, leave this field empty.

For the `GitHub Repo Issues` example, the corresponding route path in the RSSHub documentation is `/github/issue/:user/:repo`.

After matching the `user` with `DIYgod` and `repo` with `RSSHub` in the source path, the `:user` in the RSSHub route path will be replaced with `DIYgod`, and `:repo` will be replaced with `RSSHub`, resulting in `/github/issue/DIYgod/RSSHub`.

#### `target` as a function

In some cases, the source path may not match the desired parameters for an RSSHub route. In these situations, we can use the `target` field as a function with `params`, `url`, and `document` parameters.

The `params` parameter contains the parameters matched by the `source` field, while the `url` parameter is the current web page URL string, and the `document` parameter is the [document interface](https://developer.mozilla.org/docs/Web/API/document).

It is essential to note that the `target` method runs in a sandbox, and any changes made to `document` will not be reflected in the web page.

Here are two examples of how to use the `target` field as a function:

<Tabs>
<TabItem value="params" label="Match using params">

```js
export default {
    'github.com': {
        _name: 'GitHub',
        '.': [
            {
                title: 'Repo Issues',
                docs: 'https://docs.rsshub.app/routes/programming#github',
                source: ['/:user/:repo/issues/:id', '/:user/:repo/issues',  '/:user/:repo'],
                // highlight-next-line
                target: (params) => `/github/issue/${params.user}/${params.repo}`,
            },
        ],
    },
};
```

</TabItem>
<TabItem value="url" label="Match using URL">

```js
export default {
    'github.com': {
        _name: 'GitHub',
        '.': [
            {
                title: 'Repo Issues',
                docs: 'https://docs.rsshub.app/routes/programming#github',
                source: ['/:user/:repo'],
                // highlight-next-line
                target: (_, url) => `/github/issue${new URL(url).pathname}`
            },
        ],
    },
};
```

</TabItem>
</Tabs>

Both the above examples will return the same RSSHub subscription address as the [first example](/joinus/new-radar#code-the-rule).

### RSSBud

[RSSBud](https://github.com/Cay-Zhang/RSSBud) supports RSSHub Radar rules and will also be updated automatically, but please note that:

-   Use `'.'` subdomain allows RSSBud to support common mobile domains such as `m` / `mobile`
-   Use `document` in `target` does not apply to RSSBud: RSSBud is not a browser extension, it only fetches and analyzes the URL of a website, it cannot run JavaScript

### Update the Documentation

As mentioned earlier in [Other components](/joinus/new-rss/add-docs#documentation-examples-other-components), adding `radar="1"` in the RSSHub docs will show a `Support Radar` badge.

## Debugging Radar Rules

You can debug your radar rules in the RSSHub Radar extension settings of your browser. First, open the settings and switch to the "List of rules" tab. Then scroll down to the bottom of the page and you will see a text field. Here, you can replace the old rules with your new rules for debugging.

If you are worried about losing the original RSSHub radar, don't be. It will be restored if you click the "Update Now" button in the settings page.

Here's an example radar rule that you can play with:

```js
({
    'github.com': {
        _name: 'GitHub',
        '.': [
            {
                title: 'Repo Issues',
                docs: 'https://docs.rsshub.app/routes/programming#github',
                source: ['/:user/:repo/issues/:id', '/:user/:repo/issues',  '/:user/:repo'],
                target: '/github/issue/:user/:repo',
            },
        ],
    },
})
```

:::note Extra examples

```js
({
    'bilibili.com': {
        _name: 'bilibili',
        www: [
            {
                title: '分区视频',
                docs: 'https://docs.rsshub.app/social-media#bilibili',
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
                docs: 'https://docs.rsshub.app/social-media#twitter',
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
                docs: 'https://docs.rsshub.app/social-media#pixiv',
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
                docs: 'https://docs.rsshub.app/social-media#%E5%BE%AE%E5%8D%9A',
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
