import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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

function parsePublicationDate(dateUniversal: string | undefined, date: string | undefined) {
    const parsed = dateUniversal ? timezone(parseDate(dateUniversal, 'YYYY-MM-DD', true), 0) : date ? timezone(parseDate(date, 'D MMM YY', 'en', true), 0) : undefined;
    return parsed && !Number.isNaN(parsed.getTime()) ? parsed : undefined;
}

function parseLimit(value: string | undefined, defaultLimit: number) {
    const limit = Number(value);
    return Number.isFinite(limit) && limit >= 1 ? Math.floor(limit) : defaultLimit;
}

async function handler(ctx) {
    const baseUrl = 'https://www.warhammer-community.com';
    const limit = parseLimit(ctx.req.query('limit'), 16);

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
        pubDate: parsePublicationDate(item.date_universal, item.date),
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
                return { description: content.html() || undefined };
            });
            return { ...item, ...details, description: details.description || item.description };
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
