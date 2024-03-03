// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const link = 'https://bksy.tongji.edu.cn/30359/list.htm';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('.wcts-a0018 li');

    ctx.set('data', {
        title: '同济大学本科生院',
        link,
        description: '同济大学本科生院通知公告',
        item: list?.toArray().map((item) => {
            item = $(item);
            const a = item.find('a');
            const dateItem = item.find('.li-data');
            const yearAndMonth = dateItem.find('span').text().split('-');
            const day = dateItem.find('p').text();
            const date = `${yearAndMonth[0]}-${yearAndMonth[1]}-${day}`;
            return {
                title: item.find('.li-tt-title').text(),
                description: item.find('.intro').text(),
                link: new URL(a.attr('href'), link).href,
                pubDate: parseDate(date, 'YYYY-MM-DD'),
            };
        }),
    });
};
