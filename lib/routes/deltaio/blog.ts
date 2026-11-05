import type { DataItem, Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/deltaio/blog',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['delta.io/blog'],
        },
    ],
    name: 'Blogs',
    maintainers: ['RengarLee'],
    handler,
    url: 'delta.io/blog',
};

async function handler() {
    const baseUrl = 'https://delta.io';
    const feed = await parser.parseURL(`${baseUrl}/rss.xml`);
    const items: DataItem[] = feed.items.map((item) => ({
        title: item.title!,
        description: item.content,
        author: item.creator,
        pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
        link: item.link,
        guid: item.guid,
    }));

    return {
        title: 'delta.io blog',
        link: `${baseUrl}/blog`,
        item: items,
    };
}
