import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/rss',
    categories: ['traditional-media'],
    example: '/foreignaffairs/rss',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'RSS',
    maintainers: ['dzx-dzx'],
    handler,
};

async function handler() {
    const link = 'https://www.foreignaffairs.com/rss.xml';

    const feed = await parser.parseURL(link);

    const list: DataItem[] = feed.items.map((item) => {
        const pubDate = item.pubDate ? parseDate(item.pubDate) : undefined;
        return {
            title: item.title || '',
            link: item.link,
            guid: item.guid,
            pubDate: pubDate && Number.isFinite(pubDate.getTime()) ? pubDate : undefined,
            author: item.creator,
            category: item.categories,
        };
    });
    const items = await pMap(
        list,
        async (item) => {
            const description = await cache.tryGet(`foreignaffairs:article-body:${item.link}`, async () => {
                const response = await got({
                    method: 'get',
                    url: item.link,
                });

                const $ = load(response.data);

                $('.paywall').remove();
                $('.loading-indicator').remove();
                return $('.article-dropcap').html() ?? undefined;
            });
            return { ...item, description };
        },
        { concurrency: 3 }
    );

    return {
        title: 'Foreign Affairs - RSS',
        link: feed.link || 'https://www.foreignaffairs.com/',
        item: items,
    };
}
