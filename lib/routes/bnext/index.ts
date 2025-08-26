import { Route } from '@/types';
import parser from '@/utils/rss-parser';
import type { Item } from 'rss-parser';

const FEED_URL = 'https://rss.bnextmedia.com.tw/feed/bnext';

export const route: Route = {
    path: '/',
    categories: ['traditional-media'],
    example: '/bnext',
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
            source: ['www.bnext.com.tw'],
            target: '/bnext',
        },
    ],
    name: '最新文章',
    maintainers: ['johan456789'],
    handler,
    url: 'www.bnext.com.tw',
};

async function handler() {
    const feed = await parser.parseURL(FEED_URL);
    const items = (feed.items as Item[]).map((item) => {
        const enclosure = item.enclosure;
        const enclosure_url = enclosure?.url;
        const enclosure_type = enclosure?.type;
        const enclosure_length = enclosure?.length ? Number(enclosure.length) : undefined;

        return {
            title: item.title ?? item.link ?? 'Untitled',
            link: item.link,
            description: item.content ?? item.summary ?? item.contentSnippet,
            pubDate: item.isoDate ?? item.pubDate,
            enclosure_url,
            enclosure_type,
            enclosure_length,
        };
    });

    return {
        title: feed.title ?? '數位時代 BusinessNext',
        link: feed.link ?? 'https://www.bnext.com.tw',
        description: feed.description ?? '',
        item: items,
        allowEmpty: true, // the official feed clears all items every day at 00:00 UTC+8
    };
}
