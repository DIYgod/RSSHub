import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

import { renderDescription } from './templates/description';

export const handler = async (ctx) => {
    const { id = '1' } = ctx.req.param();
    const limit = getRouteLimit(ctx, 10);

    const rootUrl = 'https://www.eshukan.com';
    const currentUrl = new URL(`academic/index.aspx?cid=${id}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('ul.article li')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            const a = $item.find('a');

            const title = a.contents().last().text();
            const pubDate = $item
                .find('p span')
                .text()
                .match(/(\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2})/)?.[1];

            $item.find('p span').remove();

            const description = renderDescription({
                intro: $item.find('p').text(),
            });

            return {
                title,
                description,
                pubDate: pubDate ? timezone(parseDate(pubDate), 8) : undefined,
                link: new URL(a.prop('href')!, currentUrl).href,
                content: {
                    html: description,
                    text: $item.find('p').text(),
                },
            };
        });

    // Detail dates can replace list dates, so retain the default candidate pool before sorting.
    items = items.slice(0, ctx.req.query('sorted') === 'false' ? limit : Math.max(limit ?? 10, 10));

    items = await pMap(
        items,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const title = $$('h1').text();
                const description = renderDescription({
                    intro: $$('div.summary').html() ?? undefined,
                    description: $$('div.detail').html() ?? undefined,
                });
                const pubDate = $$('div.author')
                    .text()
                    .match(/(\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2})/)?.[1];

                item.title = title;
                item.description = description;
                item.pubDate = pubDate ? timezone(parseDate(pubDate), 8) : item.pubDate;
                item.author = $$('div.author a').text();
                item.content = {
                    html: description,
                    text: $$('div.detail').text(),
                };

                return item;
            }),
        { concurrency: 3 }
    );

    const title = $('title').text();
    const image = new URL($('div.logo img').prop('src')!, rootUrl).href;

    return {
        title,
        description: $('meta[name="description"]').prop('content'),
        link: currentUrl,
        item: items,
        image,
        author: title.split(/_/).pop(),
    };
};

export const route: Route = {
    path: '/academic/:id?',
    name: '学术资讯',
    url: 'www.eshukan.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/eshukan/academic/1',
    parameters: { id: '栏目 id，默认为 `1`，即期刊动态，可在对应栏目页 URL 中找到' },
    description: `::: tip
若订阅 [期刊动态](https://www.eshukan.com/academic/index.aspx?cid=1)，网址为 \`https://www.eshukan.com/academic/index.aspx?cid=1\`。截取 \`https://www.eshukan.com/academic/index.aspx?cid=\` 到末尾的部分 \`1\` 作为参数填入，此时路由为 [\`/eshukan/academic/1\`](https://rsshub.app/eshukan/academic/1)。
:::`,
    categories: ['study'],

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
            source: ['www.eshukan.com/academic/index.aspx'],
            target: (_, url) => {
                const { searchParams } = new URL(url);
                const id = searchParams.get('cid');

                return `/academic${id ? `/${id}` : ''}`;
            },
        },
    ],
};
