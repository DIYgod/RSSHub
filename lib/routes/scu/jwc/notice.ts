import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/jwc/notice',
    categories: ['university'],
    example: '/scu/jwc/notice',
    radar: [
        {
            source: ['jwc.scu.edu.cn/tzgg.htm'],
        },
    ],
    name: '教务处通知公告',
    maintainers: ['KXXH'],
    handler,
};

async function handler() {
    const baseUrl = 'https://jwc.scu.edu.cn';
    const link = `${baseUrl}/tzgg.htm`;
    const response = await ofetch(link);
    const $ = load(response);

    const list = $('.tz-list ul li a')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('.text p').text(),
                link: new URL($item.attr('href')!, baseUrl).href,
                pubDate: timezone(parseDate(`${$item.find('.date span').text()}/${$item.find('.date p').text()}`, 'YYYY/MM/DD'), 8),
            };
        });

    const items = await pMap(
        list,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(`scu-notice:article-v2:${item.link}`, async () => {
                const detailResponse = await ofetch(item.link);
                const $ = load(detailResponse);

                return {
                    title: $('.detail-tit h2').text(),
                    description: $('.v_news_content').html(),
                };
            })),
        }),
        { concurrency: 3 }
    );

    return {
        title: '四川大学教务处 - 通知公告',
        link,
        item: items,
    };
}
