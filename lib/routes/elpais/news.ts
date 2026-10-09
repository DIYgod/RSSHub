import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/news',
    categories: ['new-media'],
    example: '/elpais/news',
    name: 'News',
    maintainers: ['DIYgod'],
    description: 'Includes full text for articles marked publicly accessible by El País. Subscription articles retain their official RSS summary.',
    radar: [{ source: ['elpais.com'], target: '/news' }],
    handler,
};

async function handler(ctx) {
    const link = 'https://elpais.com/';
    const response = await ofetch(link);
    const $ = load(response);
    const feedUrl = $('link[type="application/rss+xml"]').first().attr('href');
    if (!feedUrl) {
        throw new Error(`El País does not advertise an RSS feed for ${link}.`);
    }
    const feed = await parser.parseURL(feedUrl);
    const limit = Number(ctx.req.query('limit') ?? 20);
    const items = await pMap(
        feed.items.filter((item): item is typeof item & { title: string; link: string } => Boolean(item.title && item.link)).slice(0, limit),
        async (item) => ({
            title: item.title,
            link: item.link,
            author: item.creator,
            pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
            category: item.categories,
            description: await cache.tryGet(`elpais:article:${item.link}`, async () => {
                try {
                    const response = await ofetch(item.link!);
                    const $ = load(response);
                    const metadata = $('script[type="application/ld+json"]')
                        .toArray()
                        .flatMap((element) => JSON.parse($(element).text()))
                        .find((entry) => entry.articleBody);
                    const content = $('[data-dtm-region="articulo_cuerpo"]').first();
                    if (metadata?.isAccessibleForFree === true && content.length) {
                        content.find('aside, script, .ad, .a_b').remove();
                        return content.html() ?? item.content ?? '';
                    }
                } catch (error) {
                    logger.warn(`Unable to retrieve El País article ${item.link}: ${error}`);
                }
                return item.content ?? '';
            }),
        }),
        { concurrency: 3 }
    );
    return {
        title: feed.title ?? 'El País',
        description: feed.description,
        link,
        item: items,
    };
}
