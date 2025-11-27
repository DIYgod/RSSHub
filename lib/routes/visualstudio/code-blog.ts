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

async function handler() {
    const feed = await parser.parseURL('https://code.visualstudio.com/feed.xml');

    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link as string, async () => {
                const data = await ofetch(item.link as string);
                const $ = load(data);

                // remove title and time
                $('main h1').first().remove();
                $('main p').first().remove();

                item.content = $('main').html() as string;

                return {
                    title: item.title,
                    link: item.link,
                    description: item.content,
                    pubDate: item.pubDate,
                    author: item.creator,
                } as DataItem;
            })
        )
    );

    return {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
        language: 'en',
    } as Data;
}
