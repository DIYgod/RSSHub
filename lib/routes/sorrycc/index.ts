import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import type { Post, PostDetail } from './types';

const host = 'https://blog.sorrycc.com';

export const route: Route = {
    name: '文章',
    categories: ['blog'],
    path: '/',
    example: '/sorrycc',
    radar: [
        {
            source: ['sorrycc.com'],
            target: '/',
        },
        {
            source: ['blog.sorrycc.com/', 'blog.sorrycc.com/*path'],
            target: '/',
        },
    ],
    handler,
    maintainers: ['KarasuShin'],
    view: ViewType.Articles,
    features: {
        supportRadar: true,
    },
    description: '云谦的博客。受限文章仅包含网站公开提供的预览内容。',
};

async function handler(ctx: Context): Promise<Data> {
    const response = await ofetch<{ data: Post[] }>(`${host}/api/posts`, {
        query: { limit: getRouteLimit(ctx, 100) },
    });
    const items = await pMap(
        response.data,
        async (post) => {
            const link = `${host}/${post.post_name}`;
            const detail = await cache.tryGet(`${link}:content:${post.updated_at}`, async () => {
                const article = await ofetch<{ data: PostDetail }>(`${host}/api/posts/${post.post_name}`);
                return { description: article.data.content };
            });
            return {
                title: post.title,
                link,
                description: detail.description,
                author: post.author_name,
                pubDate: post.created_at === undefined ? undefined : parseDate(post.created_at, 'X'),
                updated: post.updated_at === undefined ? undefined : parseDate(post.updated_at, 'X'),
            };
        },
        { concurrency: 3 }
    );

    return {
        title: '云谦的博客',
        item: items,
        link: host,
    };
}
