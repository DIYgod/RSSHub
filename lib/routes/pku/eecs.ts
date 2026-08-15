import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const eecsMap = new Map([
    [0, 'tzgg.htm'],
    [1, 'tzgg/xytz.htm'],
    [2, 'tzgg/rstz.htm'],
    [6, 'tzgg/jwtz.htm'],
    [8, 'tzgg/xgtz.htm'],
    [3, 'tzgg/ghtz.htm'],
    [4, 'tzgg/yytz.htm'],
]);

export const route: Route = {
    path: '/eecs/:type?',
    name: '信科公告通知',
    example: '/pku/eecs/0',
    maintainers: ['Ir1d'],
    handler,
    description: `| 全部 | 学院通知 | 人事通知 | 教务通知 | 学工通知 | 工会通知 | 院友通知 |
| ---- | -------- | -------- | -------- | -------- | -------- | -------- |
| 0    | 1        | 2        | 6        | 8        | 3        | 4        |`,
};

async function handler(ctx) {
    const host = 'https://eecs.pku.edu.cn';

    const type = Number.parseInt(ctx.req.param('type')) || 0;
    const listUrl = host + '/' + (eecsMap.get(type) ?? eecsMap.get(0));

    const response = await got(listUrl);

    const $ = load(response.data);
    let items = $('ul.list-text > li > a')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            return {
                title: $item.find('.tit').text(),
                link: new URL($item.attr('href')!, listUrl).href,
                pubDate: parseDate($item.find('.date .mon').text() + '-' + $item.find('.date .day').text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detail = await got(item.link);
                const $ = load(detail.data);

                const content = $('.Section1');
                content.find('[style]').removeAttr('style');

                item.description = content.html();
                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: listUrl,
        description: '北大信科 公告通知',
        item: items,
    };
}
