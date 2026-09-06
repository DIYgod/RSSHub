import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/jwc',
    categories: ['university'],
    example: '/usst/jwc',
    name: '教务处',
    maintainers: ['Diffumist'],
    handler,
};

async function handler() {
    const host = 'https://jwc.usst.edu.cn';
    const response = await ofetch(host);
    const $ = load(response);

    const items = await Promise.all(
        $('#container-2 .news')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const title = $item.find('.news_title a').text();
                const pubDate = parseDate($item.find('.news_date').text());
                const singleUrl = new URL($item.find('.news_title a').attr('href')!, host).href;

                return cache.tryGet(singleUrl, async () => {
                    const singleItem: DataItem = {
                        title,
                        link: singleUrl,
                        pubDate,
                    };
                    if (new URL(singleUrl).hostname === 'webpro.usst.edu.cn') {
                        return singleItem;
                    }
                    const detailResponse = await ofetch(singleUrl, {
                        ignoreResponseError: true,
                    });
                    const $detail = load(detailResponse);
                    singleItem.description = $detail('.wp_articlecontent').html();
                    return singleItem;
                });
            })
    );

    return {
        title: '上海理工大学 - 教务处',
        link: `${host}/`,
        description: '上海理工大学 - 教务处',
        item: items,
    };
}
