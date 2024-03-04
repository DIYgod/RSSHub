// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
const baseUrl = 'https://www.ncwu.edu.cn/xxtz.htm';

export default async (ctx) => {
    const response = await got(baseUrl);

    const $ = load(response.data);
    const list = $('div.news-item')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: `「` + item.find('a.dw').text() + `」` + item.find('a.dw').next().text(),
                description: item.find('div.detail').text(),
                pubDate: parseDate(item.find('div.month').text() + '-' + item.find('div.day').text(), 'YYYY-MM-DD'),
                link: item.find('a.dw').next().attr('href'),
            };
        });

    ctx.set('data', {
        title: $('title').text(),
        link: baseUrl,
        item: list,
    });
};
