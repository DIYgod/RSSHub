import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import queryString from 'query-string';

export const route: Route = {
    path: [
        '/post/popular_recent/:period?', // 对应 konachan.com
        '/sfw/post/popular_recent/:period?', // 对应 konachan.net（SFW）
    ],
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
        safe_search: {
            description: '是否使用无r18的站点konachan.net，若是,则在路径前加上 `/sfw`，如`/konachan/sfw/post/popular_recent/1d`，若否则默认使用 konachan.com',
            default: 'false',
        },
    },
    radar: [
        {
            source: ['konachan.com/post', 'konachan.net/post'],
        },
    ],
    name: 'Popular Recent Posts',
    maintainers: ['magic-akari', 'NekoAria', 'sineeeee'],
    description: `| 最近 24 小时    | 最近一周     | 最近一月    | 最近一年     |
| ------- | -------- | ------- | -------- |
| 1d | 1w | 1m | 1y |`,
    handler,
    features: {
        nsfw: true,
    },
};

async function handler(ctx) {
    const { period = '1d' } = ctx.req.param();
    const isSfw = ctx.req.path.includes('/sfw');
    const baseUrl = isSfw ? 'https://konachan.net' : 'https://konachan.com';

    const response = await got({
        url: `${baseUrl}/post/popular_recent.json`,
        searchParams: queryString.stringify({
            period,
        }),
    });

    const posts = response.data;

    const titles = {
        '1d': 'Last 24 hours',
        '1w': 'Last week',
        '1m': 'Last month',
        '1y': 'Last year',
    };

    const mime: Record<string, string> = {
        jpg: 'jpeg',
        png: 'png',
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
            pubDate: new Date(post.created_at * 1e3).toUTCString(),
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
                    type: `image/${mime[post.file_ext]}`,
                },
                thumbnail: {
                    url: post.preview_url,
                },
            },
            category: post.tags.split(/\s+/),
        })),
    };
}
