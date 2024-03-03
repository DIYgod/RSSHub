// @ts-nocheck
import { config } from '@/config';
import got from '@/utils/got';
import wait from '@/utils/wait';
import cache from '@/utils/cache';

let cacheIndex = 0;

export default async (ctx) => {
    if (ctx.req.param('id') === 'error') {
        throw new Error('Error test');
    }
    if (ctx.req.param('id') === 'httperror') {
        await got({
            method: 'get',
            url: 'https://httpbingo.org/status/404',
        });
    }
    let item = [];
    switch (ctx.req.param('id')) {
        case 'filter':
            item = [
                {
                    title: 'Filter Title1',
                    description: 'Description1',
                    pubDate: new Date(`2019-3-1`).toUTCString(),
                    link: `https://github.com/DIYgod/RSSHub/issues/-1`,
                    author: `DIYgod0`,
                    category: ['Category0', 'Category1'],
                },
                {
                    title: 'Filter Title2',
                    description: 'Description2',
                    pubDate: new Date(`2019-3-1`).toUTCString(),
                    link: `https://github.com/DIYgod/RSSHub/issues/0`,
                    author: `DIYgod0`,
                    category: ['Category0', 'Category1', 'Category2'],
                },
                {
                    title: 'Filter Title3',
                    description: 'Description3',
                    pubDate: new Date(`2019-3-1`).toUTCString(),
                    link: `https://github.com/DIYgod/RSSHub/issues/1`,
                    author: `DIYgod0`,
                    category: 'Category3',
                },
            ];

            break;

        case 'filter-illegal-category':
            item.push({
                title: 'TitleIllegal',
                description: 'DescriptionIllegal',
                pubDate: new Date(`2019-3-1`).toUTCString(),
                link: `https://github.com/DIYgod/RSSHub/issues/1`,
                author: `DIYgod0`,
                category: [1, 'CategoryIllegal', true, null, undefined, { type: 'object' }],
            });

            break;

        case 'long':
            item.push({
                title: `Long Title `.repeat(50),
                description: `Long Description `.repeat(10),
                pubDate: new Date(`2019-3-1`).toUTCString(),
                link: `https://github.com/DIYgod/RSSHub/issues/0`,
                author: `DIYgod0`,
            });

            break;

        case 'cache': {
            const description = await cache.tryGet(
                'test',
                () => ({
                    text: `Cache${++cacheIndex}`,
                }),
                config.cache.routeExpire * 2
            );
            item.push({
                title: 'Cache Title',
                description: description.text,
                pubDate: new Date(`2019-3-1`).toUTCString(),
                link: `https://github.com/DIYgod/RSSHub/issues/0`,
                author: `DIYgod0`,
            });

            break;
        }
        case 'refreshCache': {
            let refresh = await cache.get('refreshCache');
            let noRefresh = await cache.get('noRefreshCache', false);
            if (!refresh) {
                refresh = '0';
                await cache.set('refreshCache', '1');
            }
            if (!noRefresh) {
                noRefresh = '0';
                await cache.set('noRefreshCache', '1', undefined);
            }
            item.push({
                title: 'Cache Title',
                description: refresh + ' ' + noRefresh,
                pubDate: new Date(`2019-3-1`).toUTCString(),
                link: `https://github.com/DIYgod/RSSHub/issues/0`,
                author: `DIYgod0`,
            });

            break;
        }
        case 'cacheUrlKey': {
            const description = await cache.tryGet(
                new URL('https://rsshub.app'),
                () => ({
                    text: `Cache${++cacheIndex}`,
                }),
                config.cache.routeExpire * 2
            );
            item.push({
                title: 'Cache Title',
                description: description.text,
                pubDate: new Date(`2019-3-1`).toUTCString(),
                link: `https://github.com/DIYgod/RSSHub/issues/0`,
                author: `DIYgod0`,
            });

            break;
        }
        case 'complicated':
            item.push(
                {
                    title: `Complicated Title`,
                    description: `<a href="/DIYgod/RSSHub"></a>
<img src="/DIYgod/RSSHub.jpg">
<script>alert(1);</script>
<a href="http://mock.com/DIYgod/RSSHub"></a>
<img src="/DIYgod/RSSHub.jpg" data-src="/DIYgod/RSSHub0.jpg">
<img data-src="/DIYgod/RSSHub.jpg">
<img data-mock="/DIYgod/RSSHub.png">
<img mock="/DIYgod/RSSHub.gif">
<img src="http://mock.com/DIYgod/DIYgod/RSSHub">
<img src="/DIYgod/RSSHub.jpg" onclick="alert(1);" onerror="alert(1);" onload="alert(1);">`,
                    pubDate: new Date(`2019-3-1`).toUTCString(),
                    link: `//mock.com/DIYgod/RSSHub`,
                    author: `DIYgod`,
                },
                {
                    title: `Complicated Title`,
                    description: `<a href="/DIYgod/RSSHub"></a>
<img src="/DIYgod/RSSHub.jpg">`,
                    pubDate: new Date(`2019-3-1`).toUTCString(),
                    link: `https://mock.com/DIYgod/RSSHub`,
                    author: `DIYgod`,
                }
            );

            break;

        case 'multimedia':
            item.push({
                title: `Multimedia Title`,
                description: `<img src="/DIYgod/RSSHub.jpg">
<video src="/DIYgod/RSSHub.mp4"></video>
<video poster="/DIYgod/RSSHub.jpg">
<source src="/DIYgod/RSSHub.mp4" type="video/mp4">
<source src="/DIYgod/RSSHub.webm" type="video/webm">
</video>
<audio src="/DIYgod/RSSHub.mp3"></audio>
<iframe src="/DIYgod/RSSHub.html"></iframe>`,
                pubDate: new Date(`2019-3-1`).toUTCString(),
                link: `https://mock.com/DIYgod/RSSHub`,
                author: `DIYgod`,
            });

            break;

        case 'sort':
            item.push(
                {
                    title: `Sort Title 0`,
                    link: `https://github.com/DIYgod/RSSHub/issues/s1`,
                    author: `DIYgod0`,
                },
                {
                    title: `Sort Title 1`,
                    link: `https://github.com/DIYgod/RSSHub/issues/s1`,
                    author: `DIYgod0`,
                },
                {
                    title: `Sort Title 2`,
                    link: `https://github.com/DIYgod/RSSHub/issues/s2`,
                    pubDate: new Date(1_546_272_000_000 - 10 * 10 * 1000).toUTCString(),
                    author: `DIYgod0`,
                },
                {
                    title: `Sort Title 3`,
                    link: `https://github.com/DIYgod/RSSHub/issues/s3`,
                    pubDate: new Date(1_546_272_000_000).toUTCString(),
                    author: `DIYgod0`,
                }
            );

            break;

        case 'mess':
            item.push({
                title: `Mess Title`,
                link: `/DIYgod/RSSHub/issues/0`,
                pubDate: 1_546_272_000_000,
                author: `DIYgod0`,
            });

            break;

        case 'opencc':
            item.push({
                title: '小可愛',
                description: '宇宙無敵',
                link: `/DIYgod/RSSHub/issues/0`,
                pubDate: new Date(1_546_272_000_000).toUTCString(),
                author: `DIYgod0`,
            });

            break;

        case 'brief':
            item.push({
                title: '小可愛',
                description: '<p>宇宙無敵</p><br>'.repeat(1000),
                link: `/DIYgod/RSSHub/issues/0`,
                pubDate: new Date(1_546_272_000_000).toUTCString(),
                author: `DIYgod0`,
            });

            break;

        case 'json':
            item.push(
                {
                    title: 'Title0',
                    pubDate: new Date(`2019-3-1`).toUTCString(),
                    link: `https://github.com/DIYgod/RSSHub/issues/-3`,
                },
                {
                    title: 'Title1',
                    description: 'Description1',
                    pubDate: new Date(`2019-3-1`).toUTCString(),
                    link: `https://github.com/DIYgod/RSSHub/issues/-2`,
                    author: `DIYgod0 `,
                    category: 'Category0',
                },
                {
                    title: 'Title2 HTML in description',
                    description: '<a href="https://github.com/DIYgod/RSSHub">RSSHub</a>',
                    pubDate: new Date(`2019-3-1`).toUTCString(),
                    updated: new Date(`2019-3-2`).toUTCString(),
                    link: `https://github.com/DIYgod/RSSHub/issues/-1`,
                    author: [{ name: ' DIYgod1' }, { name: 'DIYgod2 ' }],
                    category: ['Category0', 'Category1'],
                },
                {
                    title: 'Title3 HTML in content',
                    content: {
                        html: '<a href="https://github.com/DIYgod/RSSHub">DIYgod/RSSHub</a>',
                    },
                    pubDate: new Date(`2019-3-1`).toUTCString(),
                    updated: new Date(`2019-3-2`).toUTCString(),
                    link: `https://github.com/DIYgod/RSSHub/issues/0`,
                    author: [{ name: '   DIYgod3' }, { name: 'DIYgod4   ' }, { name: 'DIYgod5   ' }],
                    category: ['Category1'],
                    enclosure_url: 'https://github.com/DIYgod/RSSHub/issues/0',
                    enclosure_type: 'image/jpeg',
                    enclosure_length: 3661,
                    itunes_duration: 36610,
                },
                {
                    title: 'Title4 author is null',
                    pubDate: new Date(`2019-3-1`).toUTCString(),
                    link: `https://github.com/DIYgod/RSSHub/pull/11555`,
                    author: null,
                }
            );

            break;

        case 'gpt':
            item.push(
                {
                    title: 'Title0',
                    description: 'Description0',
                    pubDate: new Date(`2019-3-1`).toUTCString(),
                    link: 'https://github.com/DIYgod/RSSHub/issues/0',
                },
                {
                    title: 'Title1',
                    description:
                        '快速开始\n' +
                        '如果您在使用 RSSHub 过程中遇到了问题或者有建议改进，我们很乐意听取您的意见！您可以通过 Pull Request 来提交您的修改。无论您对 Pull Request 的使用是否熟悉，我们都欢迎不同经验水平的开发者参与贡献。如果您不懂编程，也可以通过 报告错误 的方式来帮助我们。\n' +
                        '\n' +
                        '参与讨论\n' +
                        'Telegram 群组 GitHub Issues GitHub 讨论\n' +
                        '\n' +
                        '开始之前\n' +
                        '要制作一个 RSS 订阅，您需要结合使用 Git、HTML、JavaScript、jQuery 和 Node.js。\n' +
                        '\n' +
                        '如果您对它们不是很了解，但想要学习它们，以下是一些好的资源：\n' +
                        '\n' +
                        'MDN Web Docs 上的 JavaScript 指南\n' +
                        'W3Schools\n' +
                        'Codecademy 上的 Git 课程\n' +
                        '如果您想查看其他开发人员如何使用这些技术来制作 RSS 订阅的示例，您可以查看 我们的代码库 中的一些代码。\n' +
                        '\n' +
                        '提交新的 RSSHub 规则\n' +
                        '如果您发现一个网站没有提供 RSS 订阅，您可以使用 RSSHub 制作一个 RSS 规则。RSS 规则是一个短小的 Node.js 程序代码（以下简称 “路由”），它告诉 RSSHub 如何从网站中提取内容并生成 RSS 订阅。通过制作新的 RSS 路由，您可以帮助让您喜爱的网站的内容被更容易访问和关注。\n' +
                        '\n' +
                        '在您开始编写 RSS 路由之前，请确保源站点没有提供 RSS。一些网页会在 HTML 头部中包含一个 type 为 application/atom+xml 或 application/rss+xml 的 link 元素来指示 RSS 链接。\n' +
                        '\n' +
                        '这是在 HTML 头部中看到 RSS 链接可能会长成这样：<link rel="alternate" type="application/rss+xml" href="http://example.com/rss.xml" />。如果您看到这样的链接，这意味着这个网站已经有了一个 RSS 订阅，您不需要为它制作一个新的 RSS 路由。',
                    pubDate: new Date(`2019-3-1`).toUTCString(),
                    link: 'https://github.com/DIYgod/RSSHub/issues/1',
                }
            );

            break;

        default:
        // Do nothing
    }

    for (let i = 1; i < 6; i++) {
        item.push({
            title: `Title${i}`,
            description: `Description${i}`,
            pubDate: new Date((ctx.req.param('id') === 'current_time' ? new Date() : 1_546_272_000_000) - i * 10 * 1000).toUTCString(),
            link: `https://github.com/DIYgod/RSSHub/issues/${i}`,
            author: `DIYgod${i}`,
        });
    }

    if (ctx.req.param('id') === 'empty') {
        item = null;
    }

    if (ctx.req.param('id') === 'allow_empty') {
        item = null;
    }

    if (ctx.req.param('id') === 'enclosure') {
        item = [
            {
                title: '',
                link: 'https://github.com/DIYgod/RSSHub/issues/1',
                enclosure_url: 'https://github.com/DIYgod/RSSHub/issues/1',
                enclosure_length: 3661,
                itunes_duration: 36610,
            },
        ];
    }

    if (ctx.req.param('id') === 'slow') {
        await wait(1000);
    }

    if (ctx.req.query('mode') === 'fulltext') {
        item = [
            {
                title: '',
                link: 'https://m.thepaper.cn/newsDetail_forward_4059298',
            },
        ];
    }

    ctx.set('data', {
        title: `Test ${ctx.req.param('id')}`,
        itunes_author: ctx.req.param('id') === 'enclosure' ? 'DIYgod' : null,
        link: 'https://github.com/DIYgod/RSSHub',
        item,
        allowEmpty: ctx.req.param('id') === 'allow_empty',
        description:
            ctx.req.param('id') === 'complicated' ? '<img src="http://mock.com/DIYgod/DIYgod/RSSHub">' : ctx.req.param('id') === 'multimedia' ? '<video src="http://mock.com/DIYgod/DIYgod/RSSHub"></video>' : 'A test route for RSSHub',
    });
};
