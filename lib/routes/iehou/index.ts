import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

const parsePublicationDate = (value: string) => (value ? timezone(parseDate(value, ['YYYY-MM-DD HH:mm', 'MM-DD HH:mm']), 8) : undefined);

export const handler = async (ctx) => {
    const { category = '' } = ctx.req.param();
    const limit = getRouteLimit(ctx, 100);

    const rootUrl = 'https://iehou.com';
    const currentUrl = new URL(category ? `page-${category}.htm` : '', rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang') as Language;

    let items = $('li.list-group-item div.subject h2')
        // Detail pages can refine the list date, so retain the default pool for core sorting.
        .slice(0, ctx.req.query('sorted') === 'false' ? limit : Math.max(100, limit))
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            const title = $item.text();

            return {
                title,
                pubDate: parsePublicationDate($item.parent().find('span').text()),
                link: $item.find('a').prop('href'),
                category: $item
                    .nextAll('a')
                    .toArray()
                    .map((c) => $(c).text()),
                language,
            };
        });

    items = await pMap(
        items,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const title = $$('h1.title').text();
                const description = $$('div.thread-content').html();
                const image = $$('div.thread-content img').first().prop('src');

                item.title = title;
                item.description = description;
                item.pubDate = parsePublicationDate($$('i.icon-clock-o').parent().contents().last().text().trim());
                item.author = $$('img.avatar-1').parent().contents().last().text().trim();
                item.content = {
                    html: description,
                    text: $$('div.thread-content').text(),
                };
                item.image = image;
                item.banner = image;
                item.language = language;

                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').prop('content'),
        link: currentUrl,
        item: items,
        author: $('h1').text(),
        language,
    };
};

export const route: Route = {
    path: '/:category?',
    name: '线报',
    url: 'iehou.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/iehou',
    parameters: { category: '分类，默认为空，即最新线报，可在对应分类页 URL 中找到' },
    description: `::: tip
若订阅 [24 小时热门线报](https://iehou.com/page-dayhot.htm)，网址为 \`https://iehou.com/page-dayhot.htm\`。截取 \`https://iehou.com/page-\` 到末尾 \`.htm\` 的部分 \`dayhot\` 作为参数填入，此时路由为 [\`/iehou/dayhot\`](https://rsshub.app/iehou/dayhot)。
:::

| [最新线报](https://iehou.com/) | [24 小时热门](https://iehou.com/page-dayhot.htm) | [一周热门](https://iehou.com/page-weekhot.htm) |
| ------------------------------ | ------------------------------------------------ | ---------------------------------------------- |
| [](https://rsshub.app/iehou)   | [dayhot](https://rsshub.app/iehou/dayhot)        | [weekhot](https://rsshub.app/iehou/weekhot)    |`,
    categories: ['new-media'],

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
            title: '最新线报',
            source: ['iehou.com'],
            target: '/',
        },
        {
            title: '24小时热门',
            source: ['iehou.com/page-dayhot.htm'],
            target: '/dayhot',
        },
        {
            title: '一周热门',
            source: ['iehou.com/page-weekhot.htm'],
            target: '/weekhot',
        },
    ],
};
