import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { calendarToInstant } from '@/utils/time';

const rootUrl = 'https://cpc.ey.gov.tw';

const typeMap = {
    xwg: {
        name: '新闻稿',
        url: '/Page/A3412E2A5A7B398F',
    },
    xfzx: {
        name: '消费资讯',
        url: '/Page/E414CC218269CCE8',
    },
};

export const route: Route = {
    path: '/:type?',
    categories: ['government'],
    example: '/cpcey/xwg',
    parameters: { type: '默认为 `xwg`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '消费资讯',
    maintainers: ['Fatpandac'],
    handler,
    description: `| 新闻稿 | 消费资讯 |
| :----: | :------: |
|   xwg  |   xfzx   |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'xwg';
    if (!Object.hasOwn(typeMap, type)) {
        throw new InvalidParameterError('Invalid type. Use xwg or xfzx.');
    }
    const url = rootUrl + typeMap[type].url;

    const response = await got.get(url);
    const $ = load(response.data);
    const list = $('div.words > ul > li')
        .toArray()
        .map((item): DataItem & { link: string } => {
            const date = $(item).find('span').text();
            const [year, month, day] = date.split('-', 3);

            return {
                link: rootUrl + $(item).find('a').attr('href'),
                title: $(item).find('a').attr('title')!,
                pubDate: calendarToInstant({ calendar: 'roc', year, month, day }, 8),
            };
        });

    const items = await Promise.all(
        list.map(async (item) => {
            let desc = '';
            const isOtherWebPage = !item.link.includes('.html');
            if (isOtherWebPage) {
                desc = await cache.tryGet(item.link, async () => {
                    const response = await got.get(item.link);
                    const $ = load(response.data);
                    const desc = $('div.words > div.graybg.ail > div').html();
                    return desc ?? '';
                });
            }
            item.description = desc;
            return item;
        })
    );

    return {
        title: `行政院消费者保护会-${typeMap[type].name}`,
        link: url,
        item: items,
    };
}
