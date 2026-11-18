import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDateStrict } from '@/utils/time';
import { isOnSite } from '@/utils/valid-host';

import { SourceClient } from './utils';

export const route: Route = {
    path: '/amherst/ipoevents',
    categories: ['university'],
    example: '/umass/amherst/ipoevents',
    radar: [{ source: ['www.umass.edu/global-affairs/events'] }],
    name: 'Office of Global Affairs - International Student and Scholar Services Events',
    maintainers: ['GammaPi'],
    features: { requirePuppeteer: true, antiCrawler: true },
    handler,
};
async function handler() {
    const source = new SourceClient();
    try {
        const baseUrl = 'https://www.umass.edu';
        const link = `${baseUrl}/global-affairs/events?field_event_types_target_id%5B13%5D=13`;
        const response = await source.get(link);
        const $ = load(response);
        const items = await pMap(
            $('.teaser-item.event').toArray(),
            async (item) => {
                const $item = $(item);
                const a = $item.find('a.text-md');
                const link = new URL(a.attr('href')!, baseUrl).href;
                // only follow links on the site itself
                const { pubDate } = isOnSite(link, 'umass.edu')
                    ? await cache.tryGet(`umass:ipo:event-date:v1:${link}`, async () => {
                          const sourceContent1 = await source.get(link);
                          const $article = load(sourceContent1);
                          const date = $article('.date-wrapper')
                              .text()
                              .match(/^\s*([A-Za-z]+ \d{1,2}, \d{4} \d{1,2}:\d{2} [ap]m)\b/)?.[1];
                          if (!date) {
                              return {};
                          }
                          return { pubDate: parseDateStrict(date, 'MMMM D, YYYY h:mm a', 'America/New_York') };
                      })
                    : { pubDate: undefined };
                return {
                    title: a.text(),
                    description: $item.find('.summary').html(),
                    link,
                    pubDate,
                    category: $item
                        .find('.tag')
                        .toArray()
                        .map((tag) => $(tag).text().trim()),
                };
            },
            { concurrency: 1 }
        );
        return {
            title: $('head title').text(),
            link,
            item: items,
        };
    } finally {
        await source.close();
    }
}
