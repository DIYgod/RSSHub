// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const link = 'https://yjsy.gzhu.edu.cn/zsxx/zsdt/zsdt.htm';
    const response = await got(link, {
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = load(response.data);
    const list = $('.picnews_cont li');

    ctx.set('data', {
        title: '广州大学研究生院',
        link,
        description: '广州大学研招网通知公告',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                const a = item.find('span a');
                return {
                    title: a.attr('title'),
                    link: new URL(a.attr('href'), link).href,
                    pubDate: parseDate(a.text(), 'YYYY-MM-DD'),
                };
            }),
    });
};
