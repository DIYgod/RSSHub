import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/amherst/csnews',
    categories: ['university'],
    example: '/umass/amherst/csnews',
    radar: [{ source: ['www.cics.umass.edu/news'] }],
    name: 'College of Information & Computer Sciences News',
    maintainers: ['GammaPi'],
    handler,
};

async function handler() {
    const link = 'https://www.cics.umass.edu/news';
    const response = await ofetch(link);
    const $ = load(response);

    const items = $('.listing__row .news-teaser')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('.news-teaser__title a');
            return {
                title: a.text().trim(),
                description: $item.find('.news-teaser__summary').text().trim(),
                link: new URL(a.attr('href')!, link).href,
                pubDate: parseDate($item.find('.news-teaser__date').text(), 'MMMM D, YYYY'),
                category: $item.find('.news-teaser__category a').text(),
            };
        });

    return {
        title: 'UMAmherst-CSNews',
        link,
        item: items,
    };
}
