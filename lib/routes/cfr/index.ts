import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { commonHeaders, getDataItem } from './utils';

export const route: Route = {
    path: '/:category/:subCategory?',
    categories: ['traditional-media'],
    parameters: {
        category: 'category, find it in the URL',
        subCategory: 'sub-category, find it in the URL',
    },
    example: '/cfr/asia',
    name: 'News',
    maintainers: ['KarasuShin'],
    handler,
    radar: [
        {
            source: ['www.cfr.org/:category', 'www.cfr.org/:category/:subCategory'],
            target: '/:category/:subCategory?',
        },
    ],
    features: {
        antiCrawler: true,
    },
};

async function handler(ctx: Context): Promise<Data> {
    const { category, subCategory } = ctx.req.param();

    const origin = 'https://www.cfr.org';
    let link = `${origin}/${category}`;
    if (subCategory) {
        link += `/${subCategory}`;
    }
    const res = await ofetch(link, {
        headers: commonHeaders,
    });

    const $ = load(res);

    const selectorMap: {
        [key: string]: string;
    } = {
        podcasts: '.episode-content__title a',
        blog: '.card-series__content-link',
        'books-reports': '.card-article__link',
    };

    const listSelector =
        selectorMap[category] ??
        [
            'a[href^="/article/"]',
            'a[href^="/articles/"]',
            'a[href^="/backgrounder/"]',
            'a[href^="/backgrounders/"]',
            'a[href^="/blog/"]',
            'a[href^="/book/"]',
            'a[href^="/event/"]',
            'a[href^="/podcasts/"]',
            'a[href^="/task-force-report/"]',
            'a[href^="/timeline/"]',
            'a[href^="/video/"]',
        ].join(',');

    const seen = new Set<string>();
    const links = $(listSelector)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const href = $item.attr('href');
            const $article = $item.closest('article');
            const $card = $article.length
                ? $article
                : $item
                      .parents()
                      .filter((_, element) => $(element).find('time[datetime]').length > 0)
                      .first();
            const date = $card.find('time[datetime]').first().attr('datetime');

            return {
                href,
                title: $item.text().trim() || $item.attr('aria-label') || $item.attr('title'),
                pubDate: date,
            };
        })
        .filter((item): item is { href: string; title?: string; pubDate?: string } => Boolean(item.href))
        .filter(({ href }) => {
            if (seen.has(href)) {
                return false;
            }
            seen.add(href);
            return true;
        });

    const items = await pMap(links, (item) => getDataItem(item), { concurrency: 5 });

    return {
        title: $('head title').text().replace(' | Council on Foreign Relations', ''),
        link,
        item: items,
    };
}
