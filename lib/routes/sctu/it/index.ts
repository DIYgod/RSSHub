import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/it',
    categories: ['university'],
    example: '/sctu/it',
    radar: [
        {
            source: ['www.sctu.edu.cn/it/zxdt/tzgg.htm'],
        },
    ],
    name: '人工智能学院通知公告',
    maintainers: ['talenHuang'],
    handler,
};

async function handler() {
    const link = 'http://www.sctu.edu.cn/it/zxdt/tzgg.htm';
    const response = await ofetch(link);

    const $ = load(response);

    const list = $('.right-list-item a')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            return {
                title: $item.find('.list-item-title').text(),
                link: new URL($item.attr('href')!, link).href,
                pubDate: timezone(parseDate($item.find('.m-item-date').text(), 'YYYY年MM月DD日'), 8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);

                const $ = load(detailResponse);

                item.description = $('.article-content').html() ?? undefined;

                return item;
            })
        )
    );

    return {
        title: '通知公告 - 四川旅游学院人工智能学院',
        link,
        item: items,
    };
}
