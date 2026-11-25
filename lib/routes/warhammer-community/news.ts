import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDateStrict } from '@/utils/time';

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
    const limit = getRouteLimit(ctx, 16);

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

    const list: DataItem[] = response.news.map((item) => ({
        title: item.title,
        link: `${baseUrl}/en-gb${item.uri}/`,
        description: item.excerpt,
        image: `https://assets.warhammer-community.com/${item.image.path}`,
        pubDate: parseDateStrict(item.date_universal, 'YYYY-MM-DD', 0),
        category: item.topics.map((topic) => topic.title),
    }));

    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet<Pick<DataItem, 'description'>>(`warhammer-community:detail:${item.link}`, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);
                const content = $('.article-content');
                content.find('button').remove();
                return { description: content.html() };
            });
            return { ...item, description: details.description || item.description };
        },
        { concurrency: 3 }
    );

    return {
        title: 'All News and Features - Warhammer Community',
        link: `${baseUrl}/en-gb/all-news-and-features/`,
        image: `${baseUrl}/images/apple-favicon.png`,
        item: items,
    };
}
