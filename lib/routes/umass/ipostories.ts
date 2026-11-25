import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDateStrict } from '@/utils/time';

export const route: Route = {
    path: '/amherst/ipostories',
    categories: ['university'],
    example: '/umass/amherst/ipostories',
    radar: [{ source: ['www.umass.edu/global-affairs/international-students-scholars'] }],
    name: 'International Student and Scholar Services - Recent News',
    maintainers: ['GammaPi'],
    features: { antiCrawler: true },
    handler,
};

async function handler() {
    const baseUrl = 'https://www.umass.edu';
    const link = `${baseUrl}/global-affairs/international-students-scholars`;

    const { data } = await ofetch<{ data: string }>(`${baseUrl}/global-affairs/cached-views-news?view_name=announcements&view_display_id=announcement_band&view_args=18%2Fall`, { minVersion: 'TLSv1.3' });
    const $ = load(data);

    const items = $('.tile.announcement')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('a');
            return {
                title: a.text(),
                description: $item.find('.summary').html()?.trim(),
                link: new URL(a.attr('href')!, baseUrl).href,
                pubDate: parseDateStrict($item.find('.pub-date').text().trim(), 'MMMM D, YYYY'),
            };
        });

    return {
        title: 'UMass Amherst - Recent ISSS News',
        link,
        item: items,
    };
}
