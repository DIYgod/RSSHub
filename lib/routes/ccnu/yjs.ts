// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const link = 'http://gs.ccnu.edu.cn/zsgz/ssyjs.htm';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('.main-zyrx li');

    ctx.set('data', {
        title: '华中师范大学研究生院',
        link,
        description: '华中师范大学研究生院通知公告',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                const a = item.find('a');
                return {
                    title: a.attr('title'),
                    link: new URL(a.attr('href'), link).href,
                    pubDate: parseDate(item.find('small').text(), 'YYYY-MM-DD'),
                };
            }),
    });
};
