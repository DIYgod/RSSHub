import { load } from 'cheerio';

import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';

import { SourceClient } from './utils';

export const route: Route = {
    path: '/amherst/ipostories',
    categories: ['university'],
    example: '/umass/amherst/ipostories',
    radar: [{ source: ['www.umass.edu/global-affairs/international-students-scholars'] }],
    name: 'International Student and Scholar Services - Recent News',
    maintainers: ['GammaPi'],
    features: { requirePuppeteer: true, antiCrawler: true },
    handler,
};

async function handler() {
    const source = new SourceClient();
    try {
        const baseUrl = 'https://www.umass.edu';
        const link = `${baseUrl}/global-affairs/international-students-scholars`;

        const { data } = await source.get<{ data: string }>(`${baseUrl}/global-affairs/cached-views-news?view_name=announcements&view_display_id=announcement_band&view_args=18%2Fall`);
        const $ = load(data);

        const items = $('.tile.announcement')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const a = $item.find('a');
                const date = $item.find('.pub-date').text().trim();
                const pubDate = date ? parseDate(date, 'MMMM D, YYYY', true) : undefined;
                return {
                    title: a.text(),
                    description: $item.find('.summary').html()?.trim(),
                    link: new URL(a.attr('href')!, baseUrl).href,
                    pubDate: pubDate && !Number.isNaN(pubDate.getTime()) ? pubDate : undefined,
                };
            });

        return {
            title: 'UMass Amherst - Recent ISSS News',
            link,
            item: items,
        };
    } finally {
        await source.close();
    }
}
