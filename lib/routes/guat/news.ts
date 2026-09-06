/*
 * @Author: Kingsr
 * @Date: 2020-03-04 15:59:49
 * @LastEditors: Kingsr
 * @LastEditTime: 2020-03-04 17:39:01
 * @Description: 桂林航天工业学院RSSHub规则
 */
import { load } from 'cheerio';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news/:type?',
    categories: ['university'],
    example: '/guat/news/ghyw',
    parameters: { type: '资讯类型，如下表' },
    name: '新闻资讯',
    maintainers: ['wyml'],
    description: `| 桂航要闻 | 最新动态 | 通知公告 | 信息公开 |
| -------- | -------- | -------- | -------- |
| ghyw     | zxdt     | tzgg     | xxgk     |`,
    handler,
};

const host = 'https://www.guat.edu.cn';

const urls = {
    ghyw: `${host}/index/ghyw.htm`,
    zxdt: `${host}/index/zxdt.htm`,
    tzgg: `${host}/tzgg/tzgg.htm`,
    xxgk: `${host}/tzgg/xxgk.htm`,
};

async function handler(ctx: Context) {
    const { type = 'ghyw' } = ctx.req.param();
    const url = urls[type];
    if (!url) {
        throw new InvalidParameterError('参数不在可选范围之内');
    }
    const response = await ofetch(url);
    const $ = load(response);

    const list = $('.list_pic li a, div.list ul li a')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const sj = $item.find('.sj');
            return {
                title: $item.attr('title')!,
                link: new URL($item.attr('href')!, url).href,
                description: $item.find('.zy').text(),
                pubDate: timezone(parseDate(sj.length ? `${sj.find('span').text()}-${sj.find('p').text()}` : $item.find('span').text()), 8),
            };
        });

    return {
        title: `桂林航天工业学院 - ${$('.ej_main h2').text().trim()}`,
        link: url,
        item: list,
    };
}
