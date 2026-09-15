import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';

const baseUrl = 'https://rsseverything.com';

export const route: Route = {
    path: ['/sharedfeeds', '/:language/sharedfeeds'],
    categories: ['other'],
    example: '/rsseverything/zh/sharedfeeds',
    parameters: {
        language: {
            description: 'Language of the page, and of the feed addresses it links to. One of `de`, `en`, `es`, `fr`, `it`, `ja`, `ko`, `pt`, `ru`, `zh`, `zh-Hant`',
            default: 'en',
        },
    },
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
            source: ['rsseverything.com/sharedfeeds', 'rsseverything.com/:language/sharedfeeds'],
            target: '/sharedfeeds',
        },
    ],
    name: 'Shared Feeds',
    maintainers: ['AboutRSS'],
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    const language = ctx.req.param('language') ?? 'en';

    const response = await ofetch(`${baseUrl}/${language}/sharedfeeds`);
    const $ = load(response);

    const items: DataItem[] = $('.feed-item')
        .toArray()
        .map((element) => {
            const $item = $(element);
            const $title = $item.find('.card-title a');

            return {
                title: $title.text().trim(),
                link: $title.attr('href'),
                description: $item.find('.card-text').text().trim(),
            };
        });

    // The page lists the oldest shared feed first, so the newest one always sits at the very end.
    // Reversing keeps the newest-first order readers expect from a feed.
    items.reverse();

    return {
        title: 'Shared Feeds - RssEverything',
        link: `${baseUrl}/${language}/sharedfeeds`,
        item: items,
    };
}
