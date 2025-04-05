import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

export const route: Route = {
    path: '/',
    categories: ['new-media'],
    example: '/techsir',
    url: 'www.techsir.com',
    name: '最新资讯',
    maintainers: ['p3psi-boo'],
    handler,
};

async function handler() {
    const baseUrl = 'https://techsir.com';

    const response = await got({
        method: 'get',
        url: baseUrl,
    });

    const $ = load(response.data);

    const alist = $(
        '#kt_wrapper > div.main-content-area > div.container.container-fluid > div:nth-child(1) > div.col-xs-12.col-sm-6.col-md-8.post-listing > div.row.flex-row-fluid > div:nth-child(2) > div > div > div.card-body.pt-2 > div.d-flex'
    );

    const list = alist.toArray().map((item) => {
        const $item = $(item);

        const path = $item.find('a').attr('href');
        const link = `${baseUrl}${path}`;
        const title = $item.find('a').text();

        return {
            title,
            link,
        };
    });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got({
                    method: 'get',
                    url: item.link,
                });

                const $ = load(response.data);
                item.description = $('.kg-card-markdown').html();
                item.pubDate = parseDate($('time.time').text());
                item.author = $('a.author').text();
                return item;
            })
        )
    );

    return {
        title: 'TechSir - 最新资讯',
        link: baseUrl,
        item: items,
    };
}
