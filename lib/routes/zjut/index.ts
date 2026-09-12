import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'https://www.zjut.edu.cn';

export const route: Route = {
    path: '/:type?',
    categories: ['university'],
    example: '/zjut/4528',
    parameters: { type: '板块 id，默认为 4528，即通知公告' },
    radar: [
        {
            source: ['www.zjut.edu.cn/:type/list.htm'],
            target: '/:type',
        },
    ],
    name: '浙江工业大学',
    maintainers: ['junbaor'],
    handler,
    url: 'www.zjut.edu.cn',
    description: `| 学术探索 | 三创・人物 | 通知公告 | 美誉工大 | 智库工大 | 学术动态   |
| -------- | ---------- | -------- | -------- | -------- | ---------- |
| 4526     | 4527       | 4528     | 5389     | 5390     | xsdt\\_4662 |`,
};

async function handler(ctx: Context) {
    const { type = '4528' } = ctx.req.param();
    const link = `${host}/${type}/list.htm`;

    const response = await ofetch(link);
    const $ = load(response);

    const list = $('.col_news_list .news_list li.news')
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            const a = $item.find('.news_title a');

            return {
                title: a.text(),
                link: new URL(a.attr('href')!, host).href,
                pubDate: timezone(parseDate($item.find('.news_meta').text(), 'YYYY-MM-DD'), 8),
            };
        });

    const items = await Promise.all(
        list.map((item) => {
            if (!item.link.startsWith(`${host}/`)) {
                return item;
            }

            return cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);

                item.description = $('.wp_articlecontent').html();
                return item;
            });
        })
    );

    return {
        title: `浙江工业大学 - ${$('head title').text()}`,
        link,
        item: items,
    };
}
