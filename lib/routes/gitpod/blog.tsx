import { load } from 'cheerio';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import parser from '@/utils/rss-parser';

import { rootUrl } from './utils';

export const route: Route = {
    path: '/blog',
    categories: ['programming'],
    example: '/gitpod/blog',
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
            source: ['ona.com/stories', 'ona.com/', 'gitpod.io/blog', 'gitpod.io/'],
        },
    ],
    name: 'Blog',
    maintainers: ['TonyRL'],
    handler,
    url: 'ona.com/stories',
};

async function handler(ctx) {
    const limit = getRouteLimit(ctx, 10);
    const feed = await parser.parseString(await ofetch(`${rootUrl}/stories/feed`, { responseType: 'text' }));
    const datedItems = feed.items.map((item) => ({ item, date: item.pubDate ? parseDate(item.pubDate).getTime() : NaN }));
    const hasValidDates = datedItems.every(({ date }) => Number.isFinite(date));
    if (ctx.req.query('sorted') !== 'false' && hasValidDates) {
        datedItems.sort((a, b) => b.date - a.date);
    }
    const selectedItems = datedItems.slice(0, hasValidDates || ctx.req.query('sorted') === 'false' ? limit : Math.max(10, limit));
    const items = await Promise.all(
        selectedItems.map(async ({ item }): Promise<DataItem> => ({
            title: item.title!,
            link: item.link,
            guid: item.guid,
            pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
            ...(await cache.tryGet(`gitpod:story:${item.link}`, async () => {
                const html = await ofetch(item.link!, { responseType: 'text' });
                const $ = load(html);
                const article = $('script[type="application/ld+json"]')
                    .toArray()
                    .map((e) => JSON.parse($(e).text()))
                    .find((data) => data['@type'] === 'Article');
                const content = $('section[class*="mdx-content"]');
                if (!content.length) {
                    throw new Error(`Ona story content was not found: ${item.link}`);
                }
                return {
                    description: content.html() ?? undefined,
                    author: $('section:has(h1) img[alt]')
                        .toArray()
                        .map((e) => $(e).attr('alt'))
                        .join(', '),
                    image: article?.image ? new URL(article.image, item.link).href : undefined,
                };
            })),
        }))
    );

    const ret = {
        title: feed.title!,
        link: feed.link,
        description: feed.description,
        language: 'en-us' as const satisfies Language,
        item: items,
    };

    ctx.set('json', ret);
    return ret;
}
