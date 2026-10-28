import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import { rootUrl } from './utils';

export const route: Route = {
    path: '/search/news/:keyword',
    categories: ['new-media'],
    example: '/odaily/search/news/RSS3',
    parameters: { keyword: '搜索关键字' },
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
            source: ['www.odaily.news/:locale/search/:keyword', 'www.odaily.news/search/:keyword'],
            target: '/search/news/:keyword',
        },
    ],
    name: '搜索快讯',
    maintainers: ['snowraincloud'],
    handler,
};

type Newsflash = {
    id: number;
    title: string;
    description: string;
    publishTimestamp: number;
    tags: Array<{ name: string }>;
};

async function handler(ctx) {
    const keywords = ctx.req.param('keyword');
    const query = new URLSearchParams({ page: '1', size: String(getRouteLimit(ctx, 25)), keywords });
    const response = await ofetch<{ data: { list: Newsflash[] } }>(`https://web-api.odaily.news/search/searchNewsflash?${query}`);
    const items = response.data.list.map((item) => ({
        title: item.title,
        link: `${rootUrl}/newsflash/${item.id}`,
        pubDate: parseDate(item.publishTimestamp),
        description: item.description,
        category: item.tags.map((tag) => tag.name),
    }));

    return {
        title: '快讯 - Odaily星球日报',
        link: `${rootUrl}/search?keywords=${encodeURIComponent(keywords)}`,
        item: items,
    };
}
