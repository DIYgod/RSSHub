import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news',
    categories: ['game'],
    example: '/warhammer-community/news',
    radar: [
        {
            source: ['www.warhammer-community.com/en-gb/all-news-and-features/', 'www.warhammer-community.com/en-gb/'],
        },
    ],
    name: 'News',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.warhammer-community.com/en-gb/all-news-and-features/',
};

async function handler(ctx) {
    const baseUrl = 'https://www.warhammer-community.com';
    const limit = Number.parseInt(ctx.req.query('limit') || '16', 10);

    const response = await ofetch(`${baseUrl}/api/search/news/`, {
        method: 'POST',
        body: {
            sortBy: 'date_desc',
            category: '',
            collections: ['articles'],
            game_systems: [],
            index: 'news',
            locale: 'en-gb',
            page: 0,
            perPage: limit,
            topics: [],
        },
    });

    const list = response.news.map((item) => ({
        title: item.title,
        link: `${baseUrl}/en-gb${item.uri}/`,
        description: item.excerpt,
        image: `https://assets.warhammer-community.com/${item.image.path}`,
        pubDate: parseDate(item.date),
        category: item.topics.map((topic) => topic.title),
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);

                const content = $('.article-content');
                content.find('button').remove();

                item.description = content.html() || item.description;

                return item;
            })
        )
    );

    return {
        title: 'All News and Features - Warhammer Community',
        link: `${baseUrl}/en-gb/all-news-and-features/`,
        image: `${baseUrl}/images/apple-favicon.png`,
        item: items,
    };
}
