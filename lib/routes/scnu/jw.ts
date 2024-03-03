// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const baseUrl = 'http://jw.scnu.edu.cn';
    const url = `${baseUrl}/ann/index.html`;
    const res = await got({
        method: 'get',
        url,
        headers: {
            Referer: baseUrl,
        },
    });
    const $ = load(res.data);
    const list = $('.notice_01').find('li');

    ctx.set('data', {
        title: $('title').first().text(),
        link: url,
        description: '华南师范大学教务处 - 通知公告',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                return {
                    title: item.find('a').text(),
                    pubDate: parseDate(item.find('.time').text()),
                    link: item.find('a').attr('href'),
                };
            }),
    });
};
