import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/amherst/ipostories',
    categories: ['university'],
    example: '/umass/amherst/ipostories',
    radar: [{ source: ['www.umass.edu/global-affairs/international-students-scholars'] }],
    name: 'International Student and Scholar Services - Recent News',
    maintainers: ['GammaPi'],
    handler,
};

async function handler() {
    const baseUrl = 'https://www.umass.edu';
    const link = `${baseUrl}/global-affairs/international-students-scholars`;

    const { data } = await ofetch(`${baseUrl}/global-affairs/cached-views-news`, {
        query: {
            view_name: 'announcements',
            view_display_id: 'announcement_band',
            view_args: '18/all',
        },
    });
    const $ = load(data);

    const items = $('.tile.announcement')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('a');
            return {
                title: a.text().trim(),
                description: $item.find('.summary').html()?.trim(),
                link: new URL(a.attr('href')!, baseUrl).href,
                pubDate: parseDate($item.find('.pub-date').text()),
            };
        });

    return {
        title: 'UMass Amherst - Recent ISSS News',
        link,
        item: items,
    };
}
