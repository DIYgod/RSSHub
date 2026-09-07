import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Language, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { parseItems } from './util';

const rootUrl = 'https://www.1lou.me';

export const handler = async (ctx: Context) => {
    const { params } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 50;

    const queryString = Object.entries(ctx.req.query())
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

    const currentUrl = new URL(`${params && params.endsWith('.htm') ? params : `${params}.htm`}${queryString ? `?${queryString}` : ''}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang') as Language;

    let items = $('li.media.thread.tap:not(li.hidden-sm)')
        .slice(0, limit)
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);

            const subjectEl = $item.find('div.subject').children('a').first();

            return {
                title: subjectEl.text(),
                pubDate: timezone(parseDate($item.find('span.date').text()), 8),
                link: new URL(subjectEl.prop('href')!, rootUrl).href,
                category: [
                    $item.find('a.text-secondary').text().replaceAll('[]', ''),
                    ...$item
                        .find('a.badge')
                        .toArray()
                        .map((c) => $(c).text()),
                ].filter(Boolean),
                author: $item.find('a.username').text(),
                language,
            };
        });

    items = await parseItems(items, language);

    const author = 'BT 之家 1LOU 站';
    const image = new URL($('img.logo-2').prop('src')!, rootUrl).href;

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

搜索功能已移至 “搜索” 路由。
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
                const parsedUrl = new URL(url);

                return `/1lou${parsedUrl.href.replace(rootUrl, '')}`;
            },
        },
    ],
};
