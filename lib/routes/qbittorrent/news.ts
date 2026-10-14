import { config } from '@/config';
import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/news',
    categories: ['program-update'],
    example: '/qbittorrent/news',
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
            source: ['qbittorrent.org/news.php', 'qbittorrent.org/'],
        },
    ],
    name: 'News',
    maintainers: ['TonyRL'],
    handler,
    url: 'qbittorrent.org/news.php',
};

async function handler() {
    const baseUrl = 'https://www.qbittorrent.org';
    const feedUrl = `${baseUrl}/news_feed.atom`;
    const response = await cache.tryGet(feedUrl, () => ofetch(feedUrl, { responseType: 'text' }), config.cache.routeExpire, false);
    const feed = await parser.parseString(response);
    if (!feed.title) {
        throw new Error('The official qBittorrent Atom feed is missing its title.');
    }

    return {
        title: feed.title,
        link: `${baseUrl}/news.php`,
        language: 'en',
        item: feed.items.flatMap((item) => {
            if (!item.title || !item.link) {
                return [];
            }
            return {
                title: item.title,
                link: item.link,
                guid: item.id,
                description: item.content,
                author: item.author || item.creator,
                pubDate: item.isoDate ? parseDate(item.isoDate) : undefined,
            };
        }),
    } satisfies Data;
}
