import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

export const route: Route = {
    path: '/articles',
    categories: ['government'],
    example: '/meritalk/articles',
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
            source: ['meritalk.com/articles/'],
            target: '/articles',
        },
    ],
    name: 'Latest Articles',
    maintainers: ['superguyDiluc'],
    handler,
};

async function handler(ctx: Context) {
    const baseUrl = 'https://www.meritalk.com/articles';

    const { data: response } = await got(baseUrl);
    const $ = load(response);

    const list = $('div.news-block-sm')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('.news-block-title a');
            const link = a.attr('href');

            if (!link) {
                return null;
            }

            return {
                title: a.text().trim(),
                link: link,
                pubDate: parseDate($item.find('time[datetime]').attr('datetime') as string),
                category: $item
                    .find('.category-header-name a')
                    .toArray()
                    .map((elem) => $(elem).text()),
                description: '',
            };
        })
        .filter((item) => item !== null);

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit') as string, 10) : 30;
    const itemsToFetch = list.slice(0, limit);

    const items = await Promise.all(
        itemsToFetch.map((item) =>
            cache.tryGet(item!.link, async () => {
                const { data: response } = await got(item!.link);
                const $ = load(response);

                const featuredImage = $('.single-featured-image').first().html() || '';
                const fullContent = $('.single-body').first().html() || '';
                item!.description = renderDescription({
                    featuredImage,
                    fullContent,
                });

                return item;
            })
        )
    );

    const validItems = items.filter((item) => item !== null) as any[];
    validItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    return {
        title: 'News – MeriTalk',
        link: 'https://www.meritalk.com/articles/',
        item: validItems,
    };
}
