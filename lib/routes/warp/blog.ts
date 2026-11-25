import { load } from 'cheerio';
import pMap from 'p-map';

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
    const feed = await parser.parseURL('https://www.warp.dev/blog/feed.xml');
    if (!feed.title) {
        throw new Error('Warp blog feed has no title');
    }
    const items = await pMap(
        feed.items,
        async (item) => {
            const { link, title } = item;
            if (!link || !title) {
                throw new Error('Warp blog feed item has no link or title');
            }
            const { description } = await cache.tryGet<Pick<DataItem, 'description'>>(`warp:detail-with-metadata:${link}`, async () => {
                const data = await ofetch(link);
                const $ = load(data);
                const article = $('main article');
                const main = article.children('div');
                main.prepend(article.children('header').children('[class^="aspect-"]').find('img'));
                // clean HTML
                main.find('style').remove();
                main.find('[style]').removeAttr('style');
                main.find('[class]').removeAttr('class');
                main.find('[id]').removeAttr('id');
                main.find('[preload]').removeAttr('preload');
                return { description: main.html() };
            });
            return {
                title,
                link,
                description,
                pubDate: item.pubDate,
                author: item.creator,
                category: item.categories,
            };
        },
        { concurrency: 3 }
    );
    return {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
        language: 'en',
    } satisfies Data;
}
