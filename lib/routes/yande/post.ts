import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import queryString from 'query-string';

export const route: Route = {
    path: '/post/popular_recent/:period?',
    categories: ['picture'],
    view: ViewType.Pictures,
    example: '/yande/post/popular_recent/1d',
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
    radar: [
        {
            source: ['yande.re/post'],
        },
    ],
    name: 'Popular Recent Posts',
    maintainers: ['magic-akari', 'SettingDust', 'fashioncj', 'NekoAria'],
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

    const response = await got({
        url: 'https://yande.re/post/popular_recent.json',
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

    const mime = {
        jpg: 'jpeg',
        png: 'png',
    };

    const title = titles[period];

    return {
        title: `${title} - yande.re`,
        link: `https://yande.re/post/popular_recent?period=${period}`,
        item: posts.map((post) => ({
            title: post.tags,
            id: `${ctx.path}#${post.id}`,
            guid: `${ctx.path}#${post.id}`,
            link: `https://yande.re/post/show/${post.id}`,
            author: post.author,
            pubDate: new Date(post.created_at * 1e3).toUTCString(),
            description: (() => {
                const result = [`<img src="${post.sample_url}" />`, `<p>Rating:${post.rating}</p> <p>Score:${post.score}</p>`];
                if (post.source) {
                    result.push(`<a href="${post.source}">Source</a>`);
                }
                if (post.parent_id) {
                    result.push(`<a href="https://yande.re/post/show/${post.parent_id}">Parent</a>`);
                }
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
