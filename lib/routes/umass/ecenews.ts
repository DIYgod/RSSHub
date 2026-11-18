import { load } from 'cheerio';

import type { Route } from '@/types';
import { parseDateStrict } from '@/utils/time';

import { SourceClient } from './utils';

export const route: Route = {
    path: '/amherst/ecenews',
    categories: ['university'],
    example: '/umass/amherst/ecenews',
    radar: [{ source: ['www.umass.edu/engineering/news'] }],
    name: 'College of Engineering - News',
    maintainers: ['GammaPi'],
    features: { requirePuppeteer: true, antiCrawler: true },
    handler,
};

async function handler() {
    const source = new SourceClient();
    try {
        const baseUrl = 'https://www.umass.edu';
        const link = `${baseUrl}/engineering/news`;
        const response = await source.get(link);
        const $ = load(response);

        const items = $('.views-row article.news')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const a = $item.find('.news__title a');
                const date = $item.find('.news__info .news__time').text().trim();
                const pubDate = date ? parseDateStrict(date, 'MMMM D, YYYY') : undefined;
                return {
                    title: a.text(),
                    description: $item.find('.news__summary').html(),
                    link: new URL(a.attr('href')!, baseUrl).href,
                    pubDate,
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
    } finally {
        await source.close();
    }
}
