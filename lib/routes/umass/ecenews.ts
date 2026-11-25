import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDateStrict } from '@/utils/time';

export const route: Route = {
    path: '/amherst/ecenews',
    categories: ['university'],
    example: '/umass/amherst/ecenews',
    radar: [{ source: ['www.umass.edu/engineering/news'] }],
    name: 'College of Engineering - News',
    maintainers: ['GammaPi'],
    features: { antiCrawler: true },
    handler,
};

async function handler() {
    const baseUrl = 'https://www.umass.edu';
    const link = `${baseUrl}/engineering/news`;
    const response = await ofetch(link, { minVersion: 'TLSv1.3' });
    const $ = load(response);

    const items = $('.views-row article.news')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('.news__title a');
            return {
                title: a.text(),
                description: $item.find('.news__summary').html(),
                link: new URL(a.attr('href')!, baseUrl).href,
                pubDate: parseDateStrict($item.find('.news__info .news__time').text(), 'MMMM D, YYYY'),
                category: $item
                    .find('.news__category a')
                    .toArray()
                    .map((c) => $(c).text()),
            };
        });

    return {
        title: 'UMass College of Engineering - News',
        link,
        item: items,
    };
}
