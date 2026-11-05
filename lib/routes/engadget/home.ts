import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/',
    categories: ['new-media'],
    example: '/engadget',
    radar: [
        {
            source: ['www.engadget.com'],
        },
    ],
    name: 'Home',
    maintainers: ['JamesWDGu', 'KeiLongW'],
    handler,
    url: 'www.engadget.com',
};

function getPublicationDate(date?: string) {
    if (!date) {
        return;
    }
    const parsedDate = parseDate(date);
    return Number.isFinite(parsedDate.getTime()) ? parsedDate : undefined;
}

async function handler() {
    const feed = await parser.parseURL('https://www.engadget.com/rss.xml');
    const sourceItems = feed.items.map((item) => ({ ...item, pubDate: getPublicationDate(item.pubDate) }));
    const selectedItems = sourceItems;

    const items = await pMap(
        selectedItems,
        async (item) => ({
            title: item.title!,
            description: await cache.tryGet(`engadget:article:${item.link}`, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);
                const article = $('article');
                article.find('ul.breadcrumbs, .title-gallery, .subtitle, .byline-container').remove();
                article.find('img.lazyload').each((_, el) => {
                    $(el).attr('src', $(el).attr('data-lazy-src'));
                });

                return article.html() ?? undefined;
            }),
            pubDate: item.pubDate,
            link: item.link,
            author: item.author,
            category: item.categories,
        }),
        { concurrency: 3 }
    );

    return {
        title: feed.title!,
        link: feed.link,
        description: feed.description,
        language: feed.language,
        item: items,
    };
}
