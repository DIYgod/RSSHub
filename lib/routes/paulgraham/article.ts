import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: ['/articles', '/essays', '/'],
    categories: ['blog'],
    example: '/paulgraham/articles',
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
            source: ['paulgraham.com/articles.html'],
        },
    ],
    name: 'Essays',
    maintainers: ['Maecenas', 'nczitzk', 'dvorak0'],
    handler,
    url: 'paulgraham.com/articles.html',
};

async function handler(ctx) {
    const requestedLimit = Number(ctx.req.query('limit'));
    const limit = Number.isSafeInteger(requestedLimit) && requestedLimit > 0 ? requestedLimit : 30;

    const rootUrl = 'https://paulgraham.com';
    const currentUrl = new URL('articles.html', rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const seenLinks = new Set<string>();
    let items = $('font a')
        .toArray()
        .flatMap((item): DataItem[] => {
            const $item = $(item);
            const href = $item.attr('href');
            if (!href) {
                return [];
            }
            const link = new URL(href, rootUrl).href;
            if (seenLinks.has(link)) {
                return [];
            }
            seenLinks.add(link);
            return [{ title: $item.text(), link }];
        })
        .slice(0, limit);

    items = await pMap(
        items,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                const description = content('font').first();

                item.title = content('title').text();
                item.description = description.html();
                const dateText = description.contents().first().text();
                const fullDate = dateText.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}/);
                item.pubDate = fullDate ? parseDate(`${fullDate[0]} GMT`) : undefined;

                return item;
            }),
        { concurrency: 3 }
    );

    const author = 'Paul Graham';
    const title = $('title').text();
    const icon = $('link[rel="shortcut icon"]').prop('href');

    return {
        item: items,
        title: `${author} - ${title}`,
        link: currentUrl,
        description: title,
        language: 'en' as const satisfies Language,
        image: $(`img[alt="${title}"]`).prop('src'),
        icon,
        logo: icon,
        subtitle: title,
        author,
    };
}
