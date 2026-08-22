import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/code/blog',
    categories: ['programming'],
    example: '/visualstudio/code/blog',
    url: 'code.visualstudio.com',
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
            source: ['code.visualstudio.com/'],
            target: '/code/blog',
        },
    ],
    name: 'Code Blog',
    maintainers: ['cscnk52'],
    handler,
    description: 'Provides a better reading experience (full articles) over the official ones.',
    view: ViewType.Notifications,
};

async function handler(): Promise<Data> {
    const feed = await parser.parseURL('https://code.visualstudio.com/feed.xml');

    const items = await Promise.all(
        feed.items.map((item) => {
            const link = item.link as string;
            return cache.tryGet(link, async (): Promise<DataItem> => {
                const data = await ofetch(link);
                const $ = load(data);

                // remove title and time
                $('main h1').remove();
                $('main p').first().remove();

                return {
                    title: item.title as string,
                    link,
                    description: $('main').html(),
                    pubDate: item.pubDate,
                    author: item.creator,
                };
            });
        })
    );

    return {
        title: feed.title as string,
        link: feed.link,
        description: feed.description,
        item: items,
        language: 'en',
    };
}
