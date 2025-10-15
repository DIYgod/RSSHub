import { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { processItems, fetchData } from './utils';
import { config } from '@/config';

export const route: Route = {
    path: '/manga/:order',
    categories: ['anime'],
    example: '/skebetter/manga/1',
    parameters: { order: 'Order, see below.' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    name: 'Manga',
    maintainers: ['SnowAgar25'],
    handler,
    radar: [
        {
            title: 'Manga - Latest',
            source: ['skebetter.com/series'],
            target: '/manga/1',
        },
        {
            title: 'Manga - Hot',
            source: ['skebetter.com/series'],
            target: '/manga/2',
        },
    ],
    description: `
| 新着 (Latest) | 人気 (Hot) |
| ---- | ---- |
| 1    | 2    |`,
};

async function handler(ctx): Promise<Data> {
    const order = ctx.req.param('order') ?? '1';
    const baseUrl = 'https://api.twieromanga.com/api/mangaseries';
    const orderMap = {
        '1': '新着',
        '2': '人気',
    };

    const url = `${baseUrl}?order=${order}`;

    const items = await cache.tryGet(
        url,
        async () => {
            const data = await fetchData(url, true);
            return processItems(data, 'manga');
        },
        config.cache.routeExpire,
        false
    );

    return {
        title: `Skebetter Manga - ${orderMap[order]}`,
        link: `https://skebetter.com/series?order=${order}`,
        item: items as DataItem[],
    };
}
