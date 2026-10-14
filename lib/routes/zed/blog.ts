import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/blog',
    categories: ['programming'],
    example: '/zed/blog',
    url: 'zed.dev',
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
            source: ['zed.dev'],
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
    const feed = await parser.parseString(await ofetch<string, 'text'>('https://zed.dev/blog.rss', { responseType: 'text' }));
    if (!feed.title) {
        throw new Error('Zed blog feed has no title');
    }

    const items = await Promise.all(
        feed.items.map(async (item) => {
            const { link, title } = item;
            if (!link || !title) {
                throw new Error('Zed blog feed item has no link or title');
            }
            const description = await cache.tryGet(`zed:${link}:description:v2`, async () => {
                const data = await ofetch(link);
                const $ = load(data);

                const article = $('article');

                // clean HTML
                article.find('style').remove();
                article.find('[style]').removeAttr('style');
                article.find('[class]').removeAttr('class');
                article.find('[id]').removeAttr('id');
                article.find('[preload]').removeAttr('preload');
                article.find('aside').remove(); // remove Looking and hiring part

                return article.html();
            });
            return {
                title,
                link,
                description,
                pubDate: item.pubDate,
                author: item.creator,
            } satisfies DataItem;
        })
    );

    return {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
        language: 'en',
    } satisfies Data;
}
