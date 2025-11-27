import { load } from 'cheerio';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import { type Data, type Route, ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import type { Post } from './types';

export const route: Route = {
    name: 'ニュース',
    categories: ['anime'],
    path: '/news/:category?',
    example: '/m-78/news',
    radar: [
        {
            source: ['m-78.jp/news'],
            target: '/news',
        },
        {
            source: ['m-78.jp/news/category/:category'],
            target: '/news/:category',
        },
    ],
    parameters: {
        category: {
            description: 'news category',
            default: 'news',
            options: [
                {
                    value: 'news',
                    label: 'ニュース',
                },
                {
                    value: 'streaming',
                    label: '動画配信',
                },
                {
                    value: 'event',
                    label: 'イベント',
                },
                {
                    value: 'onair',
                    label: '放送',
                },
                {
                    value: 'broadcast',
                    label: '放送/配信',
                },
                {
                    value: 'goods',
                    label: 'グッズ',
                },
                {
                    value: 'ultraman-cardgame',
                    label: 'ウルトラマン カードゲーム',
                },
                {
                    value: 'shop',
                    label: 'ショップ',
                },
                {
                    value: 'blu-ray_dvd',
                    label: 'Blu-ray・DVD',
                },
                {
                    value: 'digital',
                    label: 'デジタル',
                },
            ],
        },
    },
    handler,
    maintainers: ['KarasuShin'],
    features: {
        supportRadar: true,
    },
    view: ViewType.Articles,
};

async function handler(ctx: Context): Promise<Data> {
    const rootUrl = 'https://m-78.jp';
    const cateAPIUrl = `${rootUrl}/wp-json/wp/v2/categories`;
    const postsAPIUrl = `${rootUrl}/wp-json/wp/v2/posts`;
    const category = ctx.req.param('category') ?? 'news';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')!, 10) : 20;

    const categories = await ofetch(`${cateAPIUrl}?slug=${category}`);
    if (categories.length === 0) {
        throw new InvalidParameterError('Category not found');
    }

    const { id: categoryId, link: categoryLink, name: categoryName } = categories[0];

    const posts = await ofetch<Post[]>(`${postsAPIUrl}?categories=${categoryId}&per_page=${limit}`);
    return {
        title: `${categoryName} | ニュース`,
        link: categoryLink,
        item: posts.map((post) => {
            const $ = load(post.content.rendered, null, false);
            $('#ez-toc-container').remove();
            $('img').each((_, img) => {
                if (/wp-content\/uploads/.test(img.attribs.src)) {
                    img.attribs.src = img.attribs.src.replace(/(-\d+x\d+)/, '');
                }
            });
            return {
                title: post.title.rendered,
                link: post.link,
                description: $.html(),
                pubDate: parseDate(post.date_gmt),
                updated: parseDate(post.modified_gmt),
            };
        }),
    };
}
