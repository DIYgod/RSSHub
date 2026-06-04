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
    const feed = await parser.parseURL('https://zed.dev/blog.rss');

    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link as string, async () => {
                const data = await ofetch(item.link as string);
                const $ = load(data);

                const article = $('article');

                // clean HTML
                article.find('style').remove();
                article.find('[style]').removeAttr('style');
                article.find('[class]').removeAttr('class');
                article.find('[id]').removeAttr('id');
                article.find('[preload]').removeAttr('preload');
                article.find('script').remove();
                article.find('figcaption').remove();
                article.find('aside').remove(); // remove Looking and hiring part

                item.content = article.html() as string;

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
