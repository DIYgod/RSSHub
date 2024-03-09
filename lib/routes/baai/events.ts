import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { baseUrl, apiHost, parseEventDetail, parseItem } from './utils';

export const route: Route = {
    path: '/hub/events',
    categories: ['programming'],
    example: '/baai/hub/events',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['hub.baai.ac.cn/events', 'hub.baai.ac.cn/'],
    },
    name: '智源社区 - 活动',
    maintainers: ['TonyRL'],
    handler,
    url: 'hub.baai.ac.cn/events',
};

async function handler(ctx) {
    const responses = await got.all(
        Array.from(
            {
                // first 2 pages
                length: (ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 16) / 8,
            },
            (_, v) => `${apiHost}/api/v1/events?page=${v + 1}`
        ).map((url) => got.post(url))
    );

    const list = responses.flatMap((response) => response.data.data).map((item) => parseItem(item));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                item.description = await parseEventDetail(item);
                return item;
            })
        )
    );

    return {
        title: '活动 - 智源社区',
        link: `${baseUrl}/events`,
        item: items,
    };
}
