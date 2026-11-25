import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';
import parser from '@/utils/rss-parser';
import { compareDates, parseDate } from '@/utils/time';

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
    const feed = await parser.parseString(await ofetch('https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada'));
    const limit = getRouteLimit(ctx, 20);
    const sourceOrder = ctx.req.query('sorted') === 'false';
    const sourceItems = feed.items
        .filter((item): item is typeof item & { title: string; link: string; pubDate: string } => Boolean(item.title && item.link && item.pubDate))
        .slice(0, Math.max(20, limit))
        .map((item) => ({ ...item, pubDate: parseDate(item.pubDate) }));
    if (!sourceOrder) {
        sourceItems.sort((first, second) => compareDates(second.pubDate, first.pubDate));
    }
    const items = await pMap(
        sourceItems.slice(0, limit),
        async (item) => ({
            title: item.title,
            link: item.link,
            author: item.creator,
            pubDate: item.pubDate,
            category: item.categories,
            description:
                (
                    await cache.tryGet<{ description?: string }>(`elpais:body:${item.link}`, async () => {
                        try {
                            const response = await ofetch(item.link);
                            const $ = load(response);
                            const metadata = $('script[type="application/ld+json"]')
                                .toArray()
                                .flatMap((element) => JSON.parse($(element).text()))
                                .find((entry) => entry.articleBody);
                            const content = $('[data-dtm-region="articulo_cuerpo"]');
                            if (metadata?.isAccessibleForFree === true && content.length) {
                                content.find('aside').remove();
                                return { description: content.html() ?? undefined };
                            }
                        } catch (error) {
                            logger.warn(`Unable to retrieve El País article ${item.link}: ${error}`);
                        }
                        return {};
                    })
                ).description ?? item.content,
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
