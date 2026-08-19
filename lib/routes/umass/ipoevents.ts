import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/amherst/ipoevents',
    categories: ['university'],
    example: '/umass/amherst/ipoevents',
    radar: [{ source: ['www.umass.edu/global-affairs/events'] }],
    name: 'Office of Global Affairs - International Student and Scholar Services Events',
    maintainers: ['GammaPi'],
    handler,
};

async function handler() {
    const baseUrl = 'https://www.umass.edu';
    const link = `${baseUrl}/global-affairs/events?field_event_types_target_id%5B13%5D=13`;
    const response = await ofetch(link);
    const $ = load(response);

    const items = $('.teaser-item.event')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('a.text-md');
            const date = `${$item.find('.date-box-day').text().trim()} ${$item.find('.date-box-month').text().trim()} ${$item.find('.date-wrapper').text().trim()}`;
            return {
                title: a.text().trim(),
                description: `${date}<br>${$item.find('.summary').html()}`,
                link: new URL(a.attr('href')!, baseUrl).href,
                category: $item
                    .find('.tag')
                    .toArray()
                    .map((tag) => $(tag).text().trim()),
            };
        });

    return {
        title: $('head title').text(),
        link,
        item: items,
    };
}
