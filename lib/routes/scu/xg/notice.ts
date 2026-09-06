import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/xg/notice',
    categories: ['university'],
    example: '/scu/xg/notice',
    radar: [
        {
            source: ['xgb.scu.edu.cn/index/tzgg.htm'],
        },
    ],
    name: '学工部通知公告',
    maintainers: ['stevelee477'],
    handler,
    url: 'xgb.scu.edu.cn/index/tzgg.htm',
};

async function handler() {
    const baseUrl = 'https://xgb.scu.edu.cn';
    const link = `${baseUrl}/index/tzgg.htm`;
    const response = await ofetch(link);
    const $ = load(response);

    const list = $('li.news-list > a')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('.title').text(),
                link: new URL($item.attr('href')!, link).href,
                pubDate: timezone(parseDate(`${$item.find('.year-month').text()}-${$item.find('.date').text()}`, 'YYYY-MM-DD'), 8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);
                const $detail = load(detailResponse);

                return {
                    ...item,
                    description: $detail('.v_news_content').html(),
                };
            })
        )
    );

    return {
        title: '四川大学学工部 - 通知公告',
        link,
        item: items,
    };
}
