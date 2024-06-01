import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    name: 'News',
    example: '/dataguidance/news',
    path: '/news',
    radar: [
        {
            source: ['dataguidance.com/search/news'],
        },
    ],
    maintainers: ['harveyqiu'],
    handler,
    url: 'dataguidance.com/news',
};

async function handler() {
    const rootUrl = 'https://www.dataguidance.com';
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
                link: `${rootUrl}${a.attr('href')}`,
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
                item.pubDate = parseDate(content('.field-name-post-date').text());
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
