import { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { processItems, fetchData } from './utils';
import { config } from '@/config';

export const route: Route = {
    path: '/illust/:type',
    categories: ['anime'],
    example: '/skebetter/illust/hot',
    parameters: { type: 'Type, see below' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    name: 'Illust',
    maintainers: ['SnowAgar25'],
    handler,
    radar: [
        {
            title: 'Illust - Hot',
            source: ['skebetter.com/illust'],
            target: '/illust/hot',
        },
        {
            title: 'Illust - Week',
            source: ['skebetter.com/illust'],
            target: '/illust/week',
        },
        {
            title: 'Illust - Month',
            source: ['skebetter.com/illust'],
            target: '/illust/month',
        },
        {
            title: 'Illust - Latest',
            source: ['skebetter.com/illust'],
            target: '/illust/latest',
        },
    ],
    description: `
| 急上昇 | 週間 | 月間 | 新着 |
| ----- | ---- | ---- | ---- |
| hot | week | month| latest |`,
};

async function handler(ctx): Promise<Data> {
    const type = ctx.req.param('type');
    const baseUrl = 'https://api.twieromanga.com/api/illust/hot';
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
            return processItems(data, 'illust');
        },
        config.cache.routeExpire,
        false
    );

    return {
        title: `Skebetter Illust - ${typeMap[type]}`,
        link: `https://skebetter.com/illust${linkMap[type]}`,
        item: items as DataItem[],
    };
}
