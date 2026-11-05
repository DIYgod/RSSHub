import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:type?',
    categories: ['government'],
    example: '/crac/2',
    parameters: { type: '类型，见下表，默认为全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '最新资讯',
    maintainers: ['Misaka13514'],
    handler,
    description: `| 新闻动态 | 通知公告 | 政策法规 | 常见问题 | 资料下载 | English | 业余中继台 | 科普专栏 |
| -------- | -------- | -------- | -------- | -------- | ------- | ---------- | -------- |
| 1        | 2        | 3        | 5        | 6        | 7       | 8          | 9        |`,
    radar: [
        {
            source: ['www.crac.org.cn/', 'www.crac.org.cn/News/*'],
        },
    ],
};

const categories = {
    '1': 1,
    '2': 5,
    '3': 6,
    '5': 9,
    '6': 7,
    '7': 15,
    '8': 10,
    '9': 11,
};

type Post = {
    link: string;
    title: { rendered: string };
    content: { rendered: string };
    date_gmt: string;
    modified_gmt: string;
    _embedded?: {
        author?: Array<{ name: string }>;
        'wp:term'?: Array<Array<{ name: string }>>;
    };
};

async function handler(ctx) {
    const baseUrl = 'https://www.crac.org.cn';
    const type = ctx.req.param('type');
    if (type && !Object.hasOwn(categories, type)) {
        throw new InvalidParameterError('Invalid type. Use 1, 2, 3, 5, 6, 7, 8 or 9, or omit the type for all news.');
    }
    const category = type ? categories[type] : undefined;
    const limit = Math.min(10, 100);
    const link = category ? `${baseUrl}/?cat=${category}` : `${baseUrl}/`;
    const posts = await ofetch<Post[]>(baseUrl, {
        query: {
            rest_route: '/wp/v2/posts',
            per_page: limit,
            _embed: true,
            ...(category && { categories: category }),
        },
    });

    return {
        title: '中国无线电协会业余无线电分会 - CRAC',
        link,
        item: posts.map((post) => ({
            title: load(post.title.rendered).text(),
            link: post.link,
            description: post.content.rendered,
            pubDate: post.date_gmt ? parseDate(`${post.date_gmt}Z`) : undefined,
            updated: post.modified_gmt ? parseDate(`${post.modified_gmt}Z`) : undefined,
            author: post._embedded?.author?.[0]?.name,
            category: post._embedded?.['wp:term']?.flat().map((term) => term.name),
        })),
    };
}
