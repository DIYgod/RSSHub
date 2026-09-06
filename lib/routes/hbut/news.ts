import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news/:type',
    categories: ['university'],
    example: '/hbut/news/tzgg',
    parameters: { type: '分类' },
    radar: [
        { title: '通知公告', source: ['www.hbut.edu.cn/index/tzgg.htm'], target: '/news/tzgg' },
        { title: '学校新闻', source: ['news.hbut.edu.cn/xxxw.htm'], target: '/news/xxxw' },
        { title: '菁菁校园', source: ['news.hbut.edu.cn/jjxy.htm'], target: '/news/jjxy' },
        { title: '媒体聚焦', source: ['news.hbut.edu.cn/mtjj.htm'], target: '/news/mtjj' },
        { title: '人物风采', source: ['news.hbut.edu.cn/rwfc.htm'], target: '/news/rwfc' },
    ],
    name: '新闻中心',
    maintainers: ['LandonLi'],
    handler,
    description: `| 通知公告 | 学校新闻 | 菁菁校园 | 媒体聚焦 | 人物风采 |
| -------- | -------- | -------- | -------- | -------- |
| tzgg     | xxxw     | jjxy     | mtjj     | rwfc     |`,
};

const map = {
    tzgg: 'http://www.hbut.edu.cn/index/tzgg.htm',
    xxxw: 'http://news.hbut.edu.cn/xxxw.htm',
    jjxy: 'http://news.hbut.edu.cn/jjxy.htm',
    mtjj: 'http://news.hbut.edu.cn/mtjj.htm',
    rwfc: 'http://news.hbut.edu.cn/rwfc.htm',
};

async function handler(ctx: Context) {
    const { type } = ctx.req.param();
    const link = map[type];

    const response = await ofetch(link);
    const $ = load(response);

    return {
        link,
        title: $('title').text(),
        item: $('.date-list li a, .news-list a.item')
            .slice(0, 10)
            .toArray()
            .map((elem) => {
                const $elem = $(elem);
                const [, monthDay, year] = $elem
                    .find('.date')
                    .text()
                    .match(/(\d{2}-\d{2})\s*(\d{4})/)!;
                return {
                    link: new URL($elem.attr('href')!, link).href,
                    title: $elem.find('h2, .tit').text().trim(),
                    pubDate: timezone(parseDate(`${year}-${monthDay}`), 8),
                };
            }),
    };
}
