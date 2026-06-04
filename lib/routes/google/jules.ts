import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/jules/changelog',
    categories: ['program-update'],
    example: '/google/jules/changelog',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Jules Changelog',
    url: 'jules.google/docs/changelog/',
    maintainers: ['johan456789'],
    handler,
};

async function handler() {
    const url = 'https://jules.google/docs/changelog/';
    const html = await ofetch(url);
    const $ = load(html);

    const items = $('main article')
        .toArray()
        .map((el) => {
            const article = $(el);
            const h2 = article.find('h2');
            const id = h2.attr('id') || article.attr('id');
            const title = h2.text().trim();
            const anchor = id ? `${url}#${id}` : url;
            // Date appears as a span text node after h2 (no <time> tag)
            const pubDateText = h2.next('span').text().trim();

            // First image if exists
            const imgEl = article.find('img').first();
            const imgSrc = imgEl.attr('src');
            const image = imgSrc ? new URL(imgSrc, url).href : undefined;

            // Full HTML for the item content
            article.find('header').remove(); // remove title and date
            article.find('.sr-only').remove(); // remove sr-only elements

            return {
                title,
                description: article.html(),
                link: anchor,
                pubDate: pubDateText ? parseDate(pubDateText) : undefined,
                image,
            };
        });

    return {
        title: 'Jules Changelog',
        link: url,
        item: items,
    };
}
