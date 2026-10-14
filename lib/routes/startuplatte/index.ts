import { load } from 'cheerio';

import NotFoundError from '@/errors/types/not-found';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?',
    categories: ['new-media'],
    example: '/startuplatte',
    parameters: { category: '分类，见下表，默认为首頁' },
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
            source: ['startuplatte.com/category/:category', 'startuplatte.com/'],
        },
    ],
    name: '分类',
    maintainers: ['nczitzk'],
    handler,
    description: `| 首頁 | 大師智慧 | 深度分析 | 新知介紹 |
| ---- | -------- | -------- | -------- |
|      | quote    | analysis | trend    |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '';

    const rootUrl = 'https://startuplatte.com';
    const currentUrl = `${rootUrl}${category ? `/category/${category}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('article h2 a')
        .toArray()
        .map((element) => ({
            id: Number($(element).closest('article').attr('id')?.replace('post-', '')),
            title: $(element).text(),
            link: $(element).attr('href'),
        }));

    const ids = list.map((item) => item.id);
    const posts = ids.length
        ? await cache.tryGet(`startuplatte:posts:v1:${ids.join(',')}`, () =>
              ofetch<WordPressPost[]>(`${rootUrl}/wp-json/wp/v2/posts`, {
                  query: { include: ids.join(','), per_page: ids.length, _embed: 'author,wp:term' },
              })
          )
        : [];

    const items = list.map((item) => {
        const post = posts.find((post) => post.id === item.id);
        if (!post) {
            throw new NotFoundError(`WordPress did not return article ${item.id}.`);
        }
        return {
            title: item.title,
            link: item.link,
            description: post.content.rendered,
            pubDate: post.date_gmt ? parseDate(`${post.date_gmt}Z`) : undefined,
            author: post._embedded?.author?.map((author) => author.name).join(', '),
            category: post._embedded?.['wp:term']?.flat().map((term) => term.name),
        };
    });

    return {
        title: $('title').text() || '創新拿鐵',
        link: currentUrl,
        item: items,
    };
}

interface WordPressPost {
    id: number;
    date_gmt?: string;
    content: { rendered: string };
    _embedded?: {
        author?: Array<{ name: string }>;
        'wp:term'?: Array<Array<{ name: string }>>;
    };
}
