import type { Data, Route } from '@/types';
import parser from '@/utils/rss-parser';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/',
    name: 'Автомобільний сайт N1 в Україні',
    categories: ['new-media'],
    maintainers: ['driversti'],
    example: '/autocentre',
    handler,
};

const createItem = (item) => ({
    title: item.title,
    link: item.link,
    description: item.contentSnippet,
    category: item.categories,
    pubDate: parseDate(item.pubDate),
});

async function handler(): Promise<Data> {
    const feed = await parser.parseURL('https://www.autocentre.ua/rss');

    return {
        title: feed.title!,
        link: feed.link,
        description: feed.description,
        language: 'uk',
        item: feed.items.map((item) => createItem(item)),
    };
}
