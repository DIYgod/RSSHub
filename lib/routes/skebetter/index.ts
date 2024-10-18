import { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { processItems, fetchData } from './utils';
import { config } from '@/config';

export const route: Route = {
    path: '/:type',
    categories: ['anime'],
    example: '/skebetter/hot',
    parameters: { type: 'Type, see below' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Hot',
    maintainers: ['SnowAgar25'],
    handler,
    radar: [
        {
            title: 'Skebetter - Hot',
            source: ['skebetter.com'],
            target: '/hot',
        },
        {
            title: 'Skebetter - Week',
            source: ['skebetter.com'],
            target: '/week',
        },
        {
            title: 'Skebetter - Month',
            source: ['skebetter.com'],
            target: '/month',
        },
        {
            title: 'Skebetter - Latest',
            source: ['skebetter.com'],
            target: '/latest',
        },
    ],
    description: `
| 急上昇 | 週間 | 月間 | 新着 |
| ----- | ---- | ---- | ---- |
| hot | week | month| latest |`,
};

async function handler(ctx): Promise<Data> {
    const type = ctx.req.param('type');
    const baseUrl = 'https://api.twieromanga.com/api/hotv2';
    const typeMap = {
        hot: '急上昇',
        week: '週間',
        month: '月間',
        latest: '新着',
    };
    const linkMap = {
        hot: '',
        week: '?term=week',
        month: '?term=month',
        latest: '?term=latest',
    };

    const url = `${baseUrl}?type=${type}`;

    const items = await cache.tryGet(
        url,
        async () => {
            const data = await fetchData(url);
            return processItems(data, 'index');
        },
        config.cache.routeExpire,
        false
    );

    return {
        title: `Skebetter - ${typeMap[type]}`,
        link: `https://skebetter.com/${linkMap[type]}`,
        item: items as DataItem[],
    };
}
