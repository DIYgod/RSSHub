import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';

import { SourceClient } from './utils';

export const route: Route = {
    path: '/amherst/eceseminar',
    categories: ['university'],
    example: '/umass/amherst/eceseminar',
    radar: [{ source: ['www.umass.edu/engineering/events'] }],
    name: 'College of Electrical and Computer Engineering - Seminar',
    maintainers: ['GammaPi'],
    description: 'Note: The [source website](https://www.umass.edu/engineering/events) may be empty when there are no upcoming events. This is normal and will cause rsshub fail to fetch this feed.',
    features: { requirePuppeteer: true, antiCrawler: true },
    handler,
};
async function handler() {
    const source = new SourceClient();
    try {
        const baseUrl = 'https://www.umass.edu';
        const link = `${baseUrl}/engineering/events?field_event__departments_target_id%5B296%5D=296`;
        const response = await source.get(link);
        const $ = load(response);
        const items = await pMap(
            $('.listing__row article.event').toArray(),
            async (item) => {
                const $item = $(item);
                const a = $item.find('.event__title a');
                const link = new URL(a.attr('href')!, baseUrl).href;
                const { pubDate } = await cache.tryGet(`umass:ece:event-date:v1:${link}`, async () => {
                    const sourceContent1 = await source.get(link);
                    const $article = load(sourceContent1);
                    const datetime = $article('time[datetime]').first().attr('datetime');
                    const date = datetime ? parseDate(datetime) : undefined;
                    return { pubDate: date && !Number.isNaN(date.getTime()) ? date : undefined };
                });
                return {
                    title: a.text(),
                    link,
                    description: $item.find('.event__summary').html(),
                    pubDate,
                };
            },
            { concurrency: 1 }
        );
        return {
            title: 'UMAmherst-ECESeminar',
            link,
            item: items,
        };
    } finally {
        await source.close();
    }
}
