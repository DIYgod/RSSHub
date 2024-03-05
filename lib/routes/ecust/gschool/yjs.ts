// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const baseUrl = 'https://gschool.ecust.edu.cn';
    const link = `${baseUrl}/12753/list.htm`;
    const response = await got(link);
    const $ = load(response.data);
    const list = $('#wp_news_w6 li');

    ctx.set('data', {
        title: '华东理工大学研究生院',
        link,
        description: '华东理工大学研究生院通知公告',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                return {
                    title: item.find('a').attr('title'),
                    link: `${baseUrl}${item.find('a').attr('href')}`,
                    pubDate: parseDate(item.find('.news_meta').text()),
                };
            }),
    });
};
