import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/latest',
    categories: ['blog'],
    example: '/towardsdatascience/latest',
    radar: [
        {
            source: ['towardsdatascience.com/'],
        },
    ],
    name: 'Latest articles',
    maintainers: ['mintyfrankie'],
    url: 'towardsdatascience.com/latest',
    handler,
};
async function handler() {
    const baseUrl = 'https://towardsdatascience.com/latest';
    const feedLang: Language = 'en';
    const feedDescription = 'Latest articles from Towards Data Science';
    const response = await ofetch('https://medium.com/towards-data-science/latest?posts=true', {
        headers: {
            accept: 'application/json',
        },
    });
    const data = JSON.parse(response.slice(16));
    const list: Array<
        DataItem & {
            freediumLink: string;
        }
    > = data.payload.posts.map(
        (
            item
        ): DataItem & {
            freediumLink: string;
        } => {
            const title = item.title;
            const link = `https://towardsdatascience.com/${item.uniqueSlug}`;
            const freediumLink = `https://freedium.cfd/https://towardsdatascience.com/${item.uniqueSlug}`;
            const author = data.payload.references.User[item.creatorId].name;
            const pubDate = typeof item.createdAt === 'number' && Number.isFinite(item.createdAt) ? parseDate(item.createdAt) : undefined;
            return {
                title,
                link,
                freediumLink,
                author,
                pubDate,
            };
        }
    );
    const items = await pMap(
        list,
        async (item) => {
            const description = await cache.tryGet(`towardsdatascience:body:${item.freediumLink}`, async () => {
                const response = await ofetch(item.freediumLink);
                const $ = load(response);
                return $('div.main-content').first().html();
            });
            const metadata = omitInternalField(item, 'freediumLink');
            return { ...metadata, description };
        },
        { concurrency: 3 }
    );
    return {
        title: 'Towards Data Science - Latest',
        language: feedLang,
        description: feedDescription,
        link: baseUrl,
        item: items,
    };
}
function omitInternalField<T extends object, K extends keyof T>(item: T, key: K): Omit<T, K> {
    const metadata = { ...item };
    delete metadata[key];
    return metadata;
}
