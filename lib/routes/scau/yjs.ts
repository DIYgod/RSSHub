// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const link = 'https://yzb.scau.edu.cn/2136/list1.htm';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('#wp_news_w25 tr');

    ctx.set('data', {
        title: '华南农业大学研招办',
        link,
        description: '华农研讯',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                const a = item.find('a');
                return {
                    title: a.text(),
                    link: a.attr('href'),
                    pubDate: parseDate(item.find('td').eq(3).text(), 'YYYY/MM/DD'),
                };
            }),
    });
};
