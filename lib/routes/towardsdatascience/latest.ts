import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/latest',
    categories: ['blog'],
    example: '/latest',
    radar: [
        {
            source: ['towardsdatascience.com/'],
        },
    ],
    name: 'Towards Data Science',
    maintainers: ['mintyfrankie'],
    url: 'towardsdatascience.com/latest',
    handler,
};

async function handler() {
    const baseUrl = 'https://towardsdatascience.com/latest';
    const feedLang = 'en';
    const feedDescription = 'Latest articles from Towards Data Science';

    const response = await ofetch('https://medium.com/towards-data-science/latest?posts=true', {
        headers: {
            accept: 'application/json',
        },
    });
    const data = JSON.parse(response.slice(16));

    const list = data.payload.posts.map((item) => {
        const title = item.title;
        const link = `https://towardsdatascience.com/${item.uniqueSlug}`;
        const freediumLink = `https://freedium.cfd/https://towardsdatascience.com/${item.uniqueSlug}`;
        const author = data.payload.references.User[item.creatorId].name;
        const pubDate = parseDate(item.createdAt);
        return {
            title,
            link,
            freediumLink,
            author,
            pubDate,
        };
    });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.freediumLink, async () => {
                const response = await ofetch(item.freediumLink);
                const $ = load(response);
                item.description = $('div.main-content').first().html();
                return item;
            })
        )
    );

    return {
        title: 'Towards Data Science - Latest',
        language: feedLang,
        description: feedDescription,
        link: baseUrl,
        item: items,
    };
}
