// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const link = 'http://cs.ccnu.edu.cn/xwzx/tzgg.htm';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('.list_box_07 li');

    ctx.set('data', {
        title: '华中师范大学计算机学院',
        link,
        description: '华中师范大学计算机学院通知公告',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                const a = item.find('a');
                return {
                    title: a.attr('title'),
                    description: item.find('.overfloat-dot-2').text(),
                    link: new URL(a.attr('href'), link).href,
                    pubDate: parseDate(item.find('.time').text(), 'DDYYYY-MM'),
                };
            }),
    });
};
