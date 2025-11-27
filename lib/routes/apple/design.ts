import { load } from 'cheerio';

import type { Route } from '@/types';
import md5 from '@/utils/md5';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    categories: ['design'],
    example: '/apple/design',
    handler,
    maintainers: ['jean-jacket'],
    name: 'Design updates',
    path: '/design',
    url: 'developer.apple.com/design/whats-new/',
};

async function handler() {
    const LINK = 'https://developer.apple.com/design/whats-new/';

    const response = await ofetch(LINK);
    const $ = load(response);

    const items = $('table')
        .toArray()
        .flatMap((item) => {
            const table = $(item);
            const date = table.find('.date').first().text();

            return table
                .find('.topic-item')
                .toArray()
                .map((row) => {
                    const update = $(row);
                    const titleTag = update.find('span.topic-title a');
                    const title = titleTag.text();
                    const link = `https://developer.apple.com${titleTag.attr('href')}`;
                    const description = update.find('span.description').text();

                    return {
                        description,
                        guid: md5(`${title}${description}${date}`),
                        link,
                        pubDate: parseDate(date),
                        title,
                    };
                });
        });

    return {
        item: items,
        link: LINK,
        title: 'Apple design updates',
    };
}
