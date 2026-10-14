import queryString from 'query-string';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/post/popular_recent/:period?',
    categories: ['picture'],
    view: ViewType.Pictures,
    example: '/konachan/post/popular_recent/1d',
    parameters: {
        period: {
            description: '展示时间',
            options: [
                { value: '1d', label: '最近 24 小时' },
                { value: '1w', label: '最近一周' },
                { value: '1m', label: '最近一月' },
                { value: '1y', label: '最近一年' },
            ],
            default: '1d',
        },
    },
    radar: [{ source: ['konachan.com/post'], target: '/post/popular_recent' }],
    name: 'Popular Recent Posts',
    maintainers: ['magic-akari', 'NekoAria', 'sineeeee'],
    description: `| 最近 24 小时 | 最近一周 | 最近一月 | 最近一年 |
| ------------ | -------- | -------- | -------- |
| 1d           | 1w       | 1m       | 1y       |`,
    handler,
    features: {
        nsfw: true,
    },
};

export async function handler(ctx) {
    const { period = '1d' } = ctx.req.param();
    const titles = {
        '1d': 'Last 24 hours',
        '1w': 'Last week',
        '1m': 'Last month',
        '1y': 'Last year',
    };

    if (!Object.hasOwn(titles, period)) {
        throw new InvalidParameterError('Invalid period: use 1d, 1w, 1m, or 1y.');
    }
    const isSfw = ctx.req.path.startsWith('/konachan/sfw/');
    const baseUrl = isSfw ? 'https://konachan.net' : 'https://konachan.com';

    const response = await got({
        url: `${baseUrl}/post/popular_recent.json`,
        searchParams: queryString.stringify({
            period,
        }),
    });

    const posts = response.data;

    const mime = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
    };

    const title = titles[period];

    return {
        title: `${title} - ${isSfw ? 'konachan.net' : 'konachan.com'}`,
        link: `${baseUrl}/post/popular_recent?period=${period}`,
        item: posts.map((post) => ({
            title: post.tags,
            id: `${ctx.req.path}#${post.id}`,
            guid: `${ctx.req.path}#${post.id}`,
            link: `${baseUrl}/post/show/${post.id}`,
            author: post.author,
            pubDate: post.created_at === undefined ? undefined : parseDate(post.created_at, 'X'),
            description: (() => {
                const result: string[] = [
                    `<img src="${post.sample_url}" />`,
                    `<p>Rating: ${post.rating}</p><p>Score: ${post.score}</p>`,
                    ...(post.source ? [`<a href="${post.source}">Source</a>`] : []),
                    ...(post.parent_id ? [`<a href="${baseUrl}/post/show/${post.parent_id}">Parent</a>`] : []),
                ];
                return result.join('');
            })(),
            media: {
                content: {
                    url: post.file_url,
                    type: mime[post.file_ext],
                },
                thumbnail: {
                    url: post.preview_url,
                },
            },
            category: post.tags.split(/\s+/),
        })),
    };
}
