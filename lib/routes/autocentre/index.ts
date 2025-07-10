import { Data, Route } from '@/types';
import parser from '@/utils/rss-parser';

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
});

async function handler(): Promise<Data> {
    const feed = await parser.parseURL('https://www.autocentre.ua/rss');

    return {
        title: feed.title as string,
        link: feed.link,
        description: feed.description,
        language: 'uk',
        item: await Promise.all(feed.items.map((item) => createItem(item))),
    };
}
