import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/ygkkk',
    radar: [
        {
            source: ['ygkkk.blogspot.com/'],
        },
    ],
    name: '最新发表',
    maintainers: ['cnkmmk'],
    handler,
    url: 'ygkkk.blogspot.com/',
};
async function handler() {
    const currentUrl = 'https://ygkkk.blogspot.com';
    const response = await got(`${currentUrl}/feeds/posts/default?alt=rss`);
    const $ = load(response.data, { xmlMode: true });
    const feedTitle = $('channel > title').text();
    const feedDescription = $('channel > description').text();
    const items = $('channel > item')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const link = $item.find('link').text();
            const title = $item.find('title').text();
            const description = $item.find('description').text();
            const pubDate = $item.find('pubDate').text();
            const author = $item.children('author').text();
            const category = $item
                .children('category')
                .toArray()
                .map((node) => $(node).text())
                .filter((value) => value.trim());
            return {
                link,
                pubDate: getSourceDate(pubDate),
                updated: getSourceDate($item.children(String.raw`atom\:updated`).text()),
                title,
                description,
                author: author.trim() ? author : undefined,
                category: category.length ? category : undefined,
            };
        });
    return {
        title: feedTitle,
        description: feedDescription,
        link: currentUrl,
        item: items,
    };
}
function getSourceDate(value: string): Date | undefined {
    if (!value.trim()) {
        return;
    }
    const date = parseDate(value);
    return Number.isFinite(date.getTime()) ? date : undefined;
}
