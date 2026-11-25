import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';
import { isOnSite } from '@/utils/valid-host';

export const route: Route = {
    path: '/amherst/eceseminar',
    categories: ['university'],
    example: '/umass/amherst/eceseminar',
    radar: [{ source: ['www.umass.edu/engineering/events'] }],
    name: 'College of Electrical and Computer Engineering - Seminar',
    maintainers: ['GammaPi'],
    description: 'Note: The [source website](https://www.umass.edu/engineering/events) may be empty when there are no upcoming events. This is normal and will cause rsshub fail to fetch this feed.',
    features: { antiCrawler: true },
    handler,
};
async function handler() {
    const baseUrl = 'https://www.umass.edu';
    const link = `${baseUrl}/engineering/events?field_event__departments_target_id%5B296%5D=296`;
    const response = await ofetch(link, { minVersion: 'TLSv1.3' });
    const $ = load(response);
    const items = await pMap(
        $('.listing__row article.event').toArray(),
        async (item) => {
            const $item = $(item);
            const a = $item.find('.event__title a');
            const link = new URL(a.attr('href')!, baseUrl).href;
            // only follow links on the site itself
            const { pubDate } = isOnSite(link, 'umass.edu')
                ? await cache.tryGet(`umass:ece:event-date:v1:${link}`, async () => {
                      const sourceContent1 = await ofetch(link, { minVersion: 'TLSv1.3' });
                      const $article = load(sourceContent1);
                      const datetime = $article('time[datetime]').attr('datetime');
                      return { pubDate: datetime ? parseDate(datetime) : undefined };
                  })
                : { pubDate: undefined };
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
}
