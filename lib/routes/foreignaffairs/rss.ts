import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
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

    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got({
                    method: 'get',
                    url: item.link,
                });

                const $ = load(response.data);

                $('.paywall').remove();
                $('.loading-indicator').remove();
                item.description = $('.article-dropcap').html();
                item.author = item.creator;

                return item;
            })
        )
    );

    return {
        title: 'Foreign Affairs - RSS',
        link,
        item: items,
    };
}
