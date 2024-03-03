// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const link = 'https://it.ouc.edu.cn/_s381/16619/list.psp';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('.col_news_list .news_list li');

    ctx.set('data', {
        title: '中国海洋大学信息科学与工程学院',
        link,
        description: '中国海洋大学信息科学与工程学院研究生招生通知公告',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                const a = item.find('a');
                return {
                    title: a.attr('title'),
                    link: new URL(a.attr('href'), link).href,
                    pubDate: parseDate(item.find('span').text(), 'YYYY-MM-DD'),
                };
            }),
    });
};
