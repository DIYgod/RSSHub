import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/amherst/eceseminar',
    categories: ['university'],
    example: '/umass/amherst/eceseminar',
    radar: [{ source: ['www.umass.edu/engineering/events'] }],
    name: 'College of Electrical and Computer Engineering - Seminar',
    maintainers: ['GammaPi'],
    description: 'Note: The [source website](https://www.umass.edu/engineering/events) may be empty when there are no upcoming events. This is normal and will cause rsshub fail to fetch this feed.',
    handler,
};

async function handler() {
    const baseUrl = 'https://www.umass.edu';
    const link = `${baseUrl}/engineering/events?field_event__departments_target_id%5B296%5D=296`;
    const response = await ofetch(link);
    const $ = load(response);

    const items = $('.listing__row article.event')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('.event__title a');
            const date = `${$item.find('.date-box__day').text()} ${$item.find('.date-box__month').text()} ${$item.find('.event__time').text()}`;
            return {
                title: a.text().trim(),
                link: new URL(a.attr('href')!, baseUrl).href,
                description: $item.find('.event__summary').html(),
                pubDate: timezone(parseDate(date, 'D MMM h:mm a'), -4),
            };
        });

    return {
        title: 'UMAmherst-ECESeminar',
        link,
        item: items,
    };
}
