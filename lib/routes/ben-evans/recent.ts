import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['blog'],
    example: '/ben-evans',
    name: 'Essays',
    maintainers: ['emdoe'],
    handler,
};

const rootUrl = 'https://www.ben-evans.com';

async function handler() {
    const url = `${rootUrl}/benedictevans/`;

    const response = await ofetch(url);
    const $ = load(response);

    const items = await Promise.all(
        $('section > article')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const title = $item.find('.BlogList-item-title').text();
                const address = rootUrl + $item.find('.BlogList-item-title').attr('href');
                const time = $item.find('.Blog-meta-item--date').text();

                return cache.tryGet(address, async () => {
                    const detailResponse = await ofetch(address);
                    const capture = load(detailResponse);

                    return {
                        title,
                        author: 'Benedict Evans',
                        description: capture('.col.sqs-col-12.span-12').html(),
                        link: address,
                        guid: address,
                        pubDate: parseDate(time),
                    };
                });
            })
    );

    return {
        title: 'Benedict Evans',
        link: url,
        item: items,
    };
}
