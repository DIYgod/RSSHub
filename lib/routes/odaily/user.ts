import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import { rootUrl } from './utils';

export const route: Route = {
    path: '/user/:id',
    categories: ['new-media'],
    example: '/odaily/user/2147486902',
    parameters: { id: '用户 id，可在用户页地址栏中找到' },
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
            source: ['www.odaily.news/:locale/author/:id', 'www.odaily.news/author/:id'],
            target: '/user/:id',
        },
    ],
    name: '用户文章',
    maintainers: ['nczitzk'],
    handler,
};

type AuthorPost = { id: number; title: string; publishTimestamp: number; tags: Array<{ name: string }> };
type AuthorPostDetail = { content: string; author?: { nickname: string } };

async function handler(ctx) {
    const id = ctx.req.param('id');
    const query = new URLSearchParams({ page: '1', size: String(getRouteLimit(ctx, 25)), authorId: id });
    const response = await ofetch<{ data: { list: AuthorPost[] } }>(`https://web-api.odaily.news/post/page?${query}`);
    const items = await pMap(
        response.data.list,
        async (item) => {
            const link = `${rootUrl}/post/${item.id}`;
            const detail = await cache.tryGet(link + ':body', async () => {
                const response = await ofetch<{ data: AuthorPostDetail }>(`https://web-api.odaily.news/post/detail/${item.id}`);
                return { description: response.data.content, author: response.data.author?.nickname };
            });
            return { title: item.title, link, pubDate: parseDate(item.publishTimestamp), category: item.tags.map((tag) => tag.name), ...detail };
        },
        { concurrency: 3 }
    );
    return { title: `${items[0]?.author || id} - Odaily星球日报`, link: `${rootUrl}/zh-CN/author/${encodeURIComponent(id)}`, item: items };
}
