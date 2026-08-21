import { load } from 'cheerio';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog',
    name: 'Blog',
    url: 'cognition.com/blog',
    maintainers: ['Loongphy', 'ttttmr'],
    example: '/cognition/blog',
    categories: ['programming'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['cognition.com/blog'],
        },
    ],
    view: ViewType.Articles,
    handler,
};

async function handler() {
    const baseUrl = 'https://cognition.com';
    const targetUrl = `${baseUrl}/blog`;
    const html = await ofetch(targetUrl);
    const $ = load(html);

    const items = $('section li a')
        .toArray()
        .map((item) => {
            const $item = $(item);

            return {
                title: $item.find('h2').text(),
                link: new URL($item.attr('href')!, baseUrl).href,
                description: $item.find('p').text(),
                pubDate: parseDate($item.find('span').text(), 'MM.DD.YY'),
            };
        });

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        allowEmpty: true,
        item: items,
        image: $('meta[property="og:image"]').attr('content'),
    };
}
