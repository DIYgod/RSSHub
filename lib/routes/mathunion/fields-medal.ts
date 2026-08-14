import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/fields-medal',
    categories: ['new-media'],
    example: '/mathunion/fields-medal',
    name: 'Fields Medal',
    maintainers: ['nczitzk'],
    handler,
};

async function handler() {
    const rootUrl = 'https://www.mathunion.org';
    const currentUrl = `${rootUrl}/imu-awards/fields-medal`;
    const response = await ofetch(currentUrl);

    const $ = load(response);

    const items = $('.paragraph--type--section-with-lists')
        .eq(0)
        .find('.list__group')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const year = $item.find('h3').text();
            const detailUrl = $item.find('ul li a').attr('href');

            $item.find('h3, ul').remove();

            return {
                title: year,
                link: detailUrl ? new URL(detailUrl, rootUrl).href : currentUrl,
                description: `<ul>${$item.html()}</ul>`,
                pubDate: parseDate(`${year}-12-31`),
            };
        });

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
