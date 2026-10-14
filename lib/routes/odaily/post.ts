import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import { rootUrl } from './utils';

export const route: Route = {
    path: '/:id{280}?',
    categories: ['new-media'],
    example: '/odaily',
    parameters: { id: '仅支持最新文章（280），省略时同样返回最新文章。旧分类接口已下线。' },
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
            source: ['www.odaily.news/', 'www.odaily.news/:locale/post'],
            target: '/',
        },
    ],
    name: '文章',
    maintainers: ['nczitzk'],
    handler,
    url: 'www.odaily.news/zh-CN/post',
    description: '最新文章。旧版分类接口已下线，目前仅保留最新文章订阅。',
};

type CurrentPost = {
    id: number;
    title: string;
    summary: string;
    publishTimestamp: number;
    tags: Array<{ name: string }>;
};
type CurrentPostDetail = { content: string; author?: { nickname: string } };

async function handler(ctx) {
    const query = new URLSearchParams({ page: '1', size: String(getRouteLimit(ctx, 25)) });
    const response = await ofetch<{ data: { list: CurrentPost[] } }>(`https://web-api.odaily.news/post/page?${query}`);
    const items = await pMap(
        response.data.list,
        async (item) => {
            const link = `${rootUrl}/post/${item.id}`;
            const detail = await cache.tryGet(link + ':body', async () => {
                const response = await ofetch<{ data: CurrentPostDetail }>(`https://web-api.odaily.news/post/detail/${item.id}`);
                return { description: response.data.content, author: response.data.author?.nickname };
            });
            return { title: item.title, link, pubDate: parseDate(item.publishTimestamp), category: item.tags.map((tag) => tag.name), ...detail };
        },
        { concurrency: 3 }
    );
    return { title: '最新 - Odaily星球日报', link: rootUrl, item: items };
}
