import { Data, Route } from '@/types';
import parser from '@/utils/rss-parser';
import cache from '@/utils/cache';

export const route: Route = {
    path: '',
    name: 'Автоцентр.ua',
    maintainers: ['driversti'],
    example: 'autocentre',
    handler,
};

const createItem = (item) => ({
    title: item.title,
    link: item.link,
    description: item.contentSnippet,
});

const getFromCacheOrNew = (item) => cache.tryGet(item.link, () => createItem(item));

async function handler(): Promise<Data> {
    const feed = await parser.parseURL('https://autocentre.ua/rss');

    return {
        title: feed.title as string,
        link: feed.link,
        description: feed.description,
        language: 'uk',
        item: await Promise.all(feed.items.map((item) => getFromCacheOrNew(item))),
    };
}
