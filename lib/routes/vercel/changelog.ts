import Parser from 'rss-parser';

import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const parser = new Parser();

export const route: Route = {
    path: '/changelog',
    categories: ['programming'],
    example: '/vercel/changelog',
    parameters: {},
    radar: [
        {
            source: ['vercel.com/changelog', 'vercel.com'],
        },
    ],
    name: 'Changelog',
    maintainers: ['DIYgod'],
    handler,
    url: 'vercel.com/changelog',
};

async function handler() {
    const feedUrl = 'https://vercel.com/atom';
    const feed = await parser.parseString(await ofetch(feedUrl));

    const limit = 10;
    const items: DataItem[] = feed.items
        ?.filter((item) => item.link?.startsWith('https://vercel.com/changelog/'))
        .slice(0, limit)
        .map((item) => ({
            title: item.title,
            link: item.link,
            pubDate: parseDate(item.isoDate || item.pubDate),
            description: item['content:encoded'] || item.content || item.summary,
            author: item.creator || (item as any)['dc:creator'],
        })) || [];

    return {
        title: 'Vercel Changelog',
        link: 'https://vercel.com/changelog',
        description: feed.description || 'Latest updates from Vercel Changelog',
        item: items,
    };
}
