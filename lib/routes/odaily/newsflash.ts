import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import { rootUrl } from './utils';

export const route: Route = {
    path: '/newsflash',
    categories: ['new-media'],
    example: '/odaily/newsflash',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.odaily.news/:locale/newsflash', 'www.odaily.news/newsflash', 'www.odaily.news/'],
        },
    ],
    name: '快讯',
    maintainers: ['nczitzk'],
    handler,
    url: 'www.odaily.news/zh-CN/newsflash',
};

type Newsflash = {
    id: number;
    title: string;
    description: string;
    publishTimestamp: number;
    tags: Array<{ name: string }>;
};

async function handler(ctx) {
    const query = new URLSearchParams({ page: '1', size: String(getRouteLimit(ctx, 100)) });
    const response = await ofetch<{ data: { list: Newsflash[] } }>(`https://web-api.odaily.news/newsflash/page?${query}`);
    const items = response.data.list.map((item) => ({
        title: item.title,
        link: `${rootUrl}/newsflash/${item.id}`,
        pubDate: parseDate(item.publishTimestamp),
        description: item.description,
        category: item.tags.map((tag) => tag.name),
    }));

    return {
        title: '快讯 - Odaily星球日报',
        link: `${rootUrl}/newsflash`,
        item: items,
    };
}
