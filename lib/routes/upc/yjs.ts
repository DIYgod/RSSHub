// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const baseUrl = 'http://zs.gs.upc.edu.cn';
    const link = `${baseUrl}/sszs/list.htm`;
    const response = await got(link);
    const $ = load(response.data);
    const list = $('.list tr');

    ctx.set('data', {
        title: '中国石油大学研究生院',
        link,
        description: '中国石油大学研究生院通知公告',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                const a = item.find('a');
                return {
                    title: a.attr('title'),
                    link: `${baseUrl}${a.attr('href')}`,
                    pubDate: parseDate(item.find('div[style]').text()),
                };
            }),
    });
};
