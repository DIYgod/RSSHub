import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/blog',
    categories: ['programming'],
    example: '/warp/blog',
    url: 'warp.dev',
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
            source: ['www.warp.dev'],
            target: '/blog',
        },
    ],
    name: 'Blog',
    maintainers: ['cscnk52'],
    handler,
    description: 'Provides a better reading experience (full articles) over the official ones.',
    view: ViewType.Notifications,
};

async function handler() {
    const feed = await parser.parseURL('https://www.warp.dev/blog/rss.xml');

    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link as string, async () => {
                const data = await ofetch(item.link as string);
                const $ = load(data);

                const main = $('main');

                // clean HTML
                main.find('style').remove();
                main.find('[style]').removeAttr('style');
                main.find('[class]').removeAttr('class');
                main.find('[id]').removeAttr('id');
                main.find('[preload]').removeAttr('preload');
                main.find('script').remove();
                main.find('figcaption').remove();

                // remove title, time and button
                main.find('section').first().find('div').first().remove();

                item.content = main.html() as string;

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
