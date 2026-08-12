import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const map = {
    sszs: 'sszs/',
    bszs: 'bszs/',
};

export const route: Route = {
    path: '/graduate/:type?',
    categories: ['university'],
    example: '/hnust/graduate/sszs',
    parameters: { type: '默认为 `sszs`' },
    name: '研究生院招生工作',
    maintainers: ['Pretty9'],
    description: `| 硕士招生 | 博士招生 |
| -------- | -------- |
| sszs     | bszs     |`,
    handler,
};

async function handler(ctx: Context) {
    const { type = 'sszs' } = ctx.req.param();
    const base = 'https://graduate.hnust.edu.cn/zsgz/' + (Object.hasOwn(map, type) ? map[type] : map.sszs);
    const link = `${base}index.htm`;
    const response = await ofetch(link);
    const $ = load(response);

    const items = $('.list .item ul li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const date = $item.find('span').text();
            const title = $item.find('a').text();

            return {
                title,
                description: title,
                pubDate: timezone(parseDate(date), 8),
                link: base + $item.find('a').attr('href'),
            };
        });

    return {
        title: '湖南科技大学研究生院招生工作通知',
        link,
        description: '湖南科技大学研究生院招生工作通知',
        image: 'https://i.loli.net/2020/03/24/EAoPzbTsBxeOdjH.jpg',
        item: items,
    };
}
