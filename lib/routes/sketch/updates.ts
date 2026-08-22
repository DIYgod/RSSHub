import { load } from 'cheerio';

import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/updates',
    categories: ['program-update'],
    example: '/sketch/updates',
    radar: [
        {
            source: ['www.sketch.com/changelog'],
            target: '/updates',
        },
    ],
    name: 'Release update',
    maintainers: ['Jeason0228'],
    handler,
    url: 'www.sketch.com/changelog',
};

async function handler(): Promise<Data> {
    const link = 'https://www.sketch.com/changelog/';
    const response = await ofetch(link);
    const $ = load(response);

    const items = $('article.detail')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const content = $item.find('.detail__content');
            content.find('button').remove();

            return {
                title: $item.find('h2.detail__title').text(),
                description: content.html(),
                link: $item.find('.detail__date button').attr('data-update-url'),
                pubDate: parseDate($item.find('.detail__date').attr('datetime')!),
                category: $item
                    .find('.detail__apps .pill')
                    .toArray()
                    .map((pill) => $(pill).text().trim()),
            };
        });

    return {
        title: $('head title').text(),
        link,
        language: 'en',
        item: items,
    };
}
