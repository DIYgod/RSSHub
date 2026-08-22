import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { request } from './utils';

export const route: Route = {
    path: '/cs/:type?',
    categories: ['university'],
    example: '/swust/cs/1',
    parameters: { type: '分区 type，缺省为 1，详见下方表格' },
    name: '计科学院通知',
    maintainers: ['lengthmin'],
    description: `| 新闻动态 | 学术动态 | 通知公告 | 教研动态 |
| -------- | -------- | -------- | -------- |
| 1        | 2        | 3        | 4        |`,
    handler,
};

const host = 'https://www.cs.swust.edu.cn/';

const types = {
    1: { info: '新闻动态', word: 'news' },
    2: { info: '学术动态', word: 'academic' },
    3: { info: '通知公告', word: 'notice' },
    4: { info: '教研动态', word: 'Teach_Research' },
};

async function handler(ctx: Context) {
    const { type = '1' } = ctx.req.param();
    const { info, word } = types[type] ?? types[1];

    const response = await request(host + word);
    const $ = load(response);

    return {
        allowEmpty: true,
        title: `西南科技大学 计科学院 ${info}`,
        link: host + word,
        description: `西南科技大学 计科学院 ${info}`,
        item: $('a', '.list.list3')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const link = host + $item.attr('href');

                const imgdesc = $item.find('.imgdesc');
                const date = imgdesc
                    .contents()
                    .filter((_, node) => node.nodeType === 3)
                    .text()
                    .replaceAll(/[[\]]/g, '');

                return {
                    title: imgdesc.find('.imgtitle').text(),
                    description: imgdesc.find('.imgtext').text(),
                    pubDate: timezone(parseDate(date), 8),
                    link,
                };
            }),
    };
}
