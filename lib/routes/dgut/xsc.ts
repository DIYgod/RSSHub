import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/xsc/:type?',
    categories: ['university'],
    example: '/dgut/xsc',
    parameters: { type: '默认为 `2`' },
    name: '学工部动态',
    maintainers: ['korokor0'],
    description: `| 学工动态 | 通知公告 | 网上公示 |
| -------- | -------- | -------- |
| 1        | 2        | 4        |`,
    handler,
};

const host = 'https://xsc.dgut.edu.cn/';
const name = '学生工作部（学生处）';
const map = {
    1: { info: '学工动态', urlType: 'bgfw/xgdt' },
    2: { info: '通知公告', urlType: 'bgfw/tzgg' },
    4: { info: '网上公示', urlType: 'bgfw/wsgs' },
};

async function handler(ctx: Context) {
    const { type } = ctx.req.param();
    const { info, urlType } = map[type] ?? map[2];

    const response = await ofetch(`${host}${urlType}/`);

    const $ = load(response);

    return {
        title: `东莞理工学院 ${name} ${info}`,
        link: `${host}${urlType}/index.shtml`,
        description: `东莞理工学院 ${name} ${info}`,
        item: $('#paging > ul li')
            .toArray()
            .slice(0, 10)
            .map((item) => {
                const $item = $(item);
                return {
                    title: $item.find('a').attr('title'),
                    description: $item.find('a').text(),
                    pubDate: timezone(parseDate($item.find('.time').text()), 8),
                    link: host + $item.find('a').attr('href')!.slice(1),
                };
            }) as DataItem[],
    };
}
