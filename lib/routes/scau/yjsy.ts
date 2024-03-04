// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const link = 'https://yjsy.scau.edu.cn/208/list1.htm';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('#wp_news_w25 tr td tr');

    ctx.set('data', {
        title: '华南农业大学研究生院',
        link,
        description: '通知公告',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                const a = item.find('a').last();
                return {
                    title: a.text(),
                    link: a.attr('href'),
                    pubDate: parseDate(item.find('td').eq(2).text(), 'YYYY/MM/DD'),
                };
            }),
    });
};
