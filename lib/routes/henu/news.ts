import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://jwc.henu.edu.cn';

const map = {
    tzgg: '/tzgg.htm',
    jxdt: '/jxdt.htm',
    mtbd: '/jxdt/mtbd.htm',
};

export const route: Route = {
    path: '/:type?',
    categories: ['university'],
    example: '/henu/tzgg',
    parameters: { type: '分类，见下表，默认为通知公告' },
    name: '教务处',
    maintainers: ['CasterWx'],
    description: `| 通知公告 | 教学动态 | 媒体报道 |
| -------- | -------- | -------- |
| tzgg     | jxdt     | mtbd     |`,
    handler,
};

async function handler(ctx: Context) {
    const { type = 'tzgg' } = ctx.req.param();
    const link = `${baseUrl}${map[type]}`;

    const response = await ofetch(link, {
        headers: {
            Referer: link,
        },
    });
    const $ = load(response);

    return {
        link,
        title: $('title').text(),
        item: $('.article-list li')
            .toArray()
            .map((elem) => ({
                link: new URL($('a', elem).attr('href')!, link).href,
                title: $('.article-title', elem).text(),
                pubDate: timezone(parseDate($('.article-date', elem).text()), 8),
            })) as DataItem[],
    };
}
