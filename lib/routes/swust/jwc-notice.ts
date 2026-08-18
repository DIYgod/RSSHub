import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { evil, request } from './utils';

export const route: Route = {
    path: '/jwc/notice/:type?',
    categories: ['university'],
    example: '/swust/jwc/notice/1',
    parameters: { type: '分区 type，缺省为 1，详见下方表格' },
    name: '教务处通知',
    maintainers: ['lengthmin'],
    description: `| 创新创业教育 | 学生学业 | 建设与改革 | 教学质量保障 | 教学运行 | 教师教学 |
| ------------ | -------- | ---------- | ------------ | -------- | -------- |
| 1            | 2        | 3          | 4            | 5        | 6        |`,
    handler,
};

const api = 'http://www.dean.swust.edu.cn/cms/portal/notice.json';
const page = 'http://www.dean.swust.edu.cn/notice/page/';
const tag = 'http://www.dean.swust.edu.cn/notice/tag/';

async function handler(ctx: Context) {
    const { type = '1' } = ctx.req.param();

    const response = await request(api);
    const data = evil(response)[Number(type) - 1];
    const info = data.name;

    return {
        allowEmpty: true,
        title: `西南科技大学教务处 ${info}`,
        link: tag + data.id,
        description: `西南科技大学教务处 ${info}`,
        item: await Promise.all(
            data.items.map((item) => {
                const link = page + item.id;

                return cache.tryGet(link, () =>
                    Promise.resolve({
                        title: item.title,
                        link,
                        pubDate: timezone(parseDate(item.outdate), 8),
                        author: item.publisher,
                    })
                );
            })
        ),
    };
}
