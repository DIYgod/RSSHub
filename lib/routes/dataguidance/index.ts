import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    name: 'Data Guidance News',
    example: '/',
    path: '/news',
    radar: [
        {
            source: ['dataguidance.com/news'],
        },
    ],
    maintainers: ['harveyqiu'],
    handler,
    url: 'dataguidance.com/news',
};

async function handler() {
    const rootUrl = 'https://www.dataguidance.com/';
    const currentUrl = `${rootUrl}/search/news/`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.field-name-title')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();

            return {
                title: a.text(),
                link: `${rootUrl}/${a.attr('href')}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description = content('.field-name-body').html();

                return item;
            })
        )
    );

    return {
        title: 'Data Guidance News',
        link: currentUrl,
        item: items,
    };
}
