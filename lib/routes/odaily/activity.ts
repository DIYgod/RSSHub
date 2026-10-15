import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';

import { rootUrl } from './utils';

export const route: Route = {
    path: '/activity',
    categories: ['new-media'],
    example: '/odaily/activity',
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
            source: ['www.odaily.news/:locale/activity', 'www.odaily.news/activity', 'www.odaily.news/'],
        },
    ],
    name: '活动',
    maintainers: ['nczitzk'],
    handler,
    url: 'www.odaily.news/zh-CN/activity',
};

type Activity = { id: number; title: string };
type ActivityDetail = { content?: string; tags: Array<{ name: string }> };

async function handler(ctx) {
    const query = new URLSearchParams({ page: '1', size: String(getRouteLimit(ctx, 25)) });
    const response = await ofetch<{ data: { list: Activity[] } }>(`https://web-api.odaily.news/activity/page?${query}`);
    const items = await pMap(
        response.data.list,
        async (item) => {
            const link = `${rootUrl}/activity/${item.id}`;
            const detail = await cache.tryGet(link + ':body', async () => {
                const response = await ofetch<{ data: ActivityDetail }>(`https://web-api.odaily.news/activity/detail/${item.id}`);
                return { description: response.data.content, category: response.data.tags.map((tag) => tag.name) };
            });
            return { title: item.title, link, ...detail };
        },
        { concurrency: 3 }
    );
    return { title: '活动 - Odaily星球日报', link: `${rootUrl}/zh-CN/activity`, item: items };
}
