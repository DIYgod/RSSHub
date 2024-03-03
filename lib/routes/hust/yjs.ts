// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const link = 'https://gszs.hust.edu.cn/zsxx/ggtz.htm';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('.main_conRCb li');

    ctx.set('data', {
        title: '华中科技大学研究生院',
        link,
        description: '华中科技大学研究生调剂信息',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                const a = item.find('a');
                return {
                    title: a.text(),
                    link: new URL(a.attr('href'), link).href,
                    pubDate: parseDate(item.find('span').text(), 'YYYY-MM-DD'),
                };
            }),
    });
};
