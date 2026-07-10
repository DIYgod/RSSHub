import type { Route } from '@/types';

import { fetchThreads, rootUrl } from './util';

export const handler = async (ctx) => {
    const { params } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;

    const queryString = Object.entries(ctx.req.query())
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

    const currentUrl = new URL(`${params && params.endsWith('.htm') ? params : `${params}.htm`}${queryString ? `?${queryString}` : ''}`, rootUrl).href;

    const { $, items, language } = await fetchThreads(currentUrl, limit);

    const author = 'BT 之家 1LOU 站';
    const image = new URL($('img.logo-2').prop('src'), rootUrl).href;

    return {
        title: `${$('title').text().split(/-/, 1)[0]} - ${author}`,
        description: $('meta[name="description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author,
        language,
    };
};

export const route: Route = {
    path: '/:params{.+}?',
    name: '通用',
    url: '1lou.me',
    maintainers: ['falling', 'nczitzk'],
    handler,
    example: '/1lou/forum-2-1',
    parameters: { params: '路径参数，可以在对应页面的 URL 中找到' },
    description: `::: tip
\`1lou.me/\` 后的内容填入 params 参数，以下是几个例子：

若订阅 [大陆电视剧](https://www.1lou.me/forum-2-1.htm?tagids=0_97_0_0)，网址为 \`https://www.1lou.me/forum-2-1.htm?tagids=0_97_0_0\`。截取 \`https://www.1lou.me/\` 到末尾 \`.htm\` 的部分 \`forum-2-1\` 作为参数，并补充 \`tagids\`，此时路由为 [\`/1lou/forum-2-1?tagids=0_97_0_0\`](https://rsshub.app/1lou/forum-2-1?tagids=0_97_0_0)。

若订阅 [最新发帖电视剧](https://www.1lou.me/forum-2-1.htm?orderby=tid\\&digest=0)，网址为 \`https://www.1lou.me/forum-2-1.htm?orderby=tid&digest=0\`。截取 \`https://www.1lou.me/\` 到末尾 \`.htm\` 的部分 \`forum-2-1\` 作为参数，并补充 \`orderby\`，此时路由为 [\`/1lou/forum-2-1?orderby=tid\`](https://rsshub.app/1lou/forum-2-1?orderby=tid)。

若搜索关键词，请使用 [\`/1lou/search/:keyword\`](https://rsshub.app/1lou/search/奥本海默) 路由。
:::`,
    categories: ['multimedia'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['1lou.me/:params'],
            target: (_, url) => {
                url = new URL(url);

                return `/1lou${url.href.replace(rootUrl, '')}`;
            },
        },
    ],
};
