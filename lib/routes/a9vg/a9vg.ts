import got from '@/utils/got';
import * as cheerio from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const baseUrl = 'http://www.a9vg.com';
    const link = `${baseUrl}/list/news`;
    const { data } = await got(link);

    const $ = cheerio.load(data);
    const list = $('.a9-rich-card-list li')
        .toArray()
        .map((elem) => {
            const item = $(elem);
            return {
                title: item.find('.a9-rich-card-list_label').text(),
                description: `<img src="${item.find('img').attr('src')}"><br>${item.find('.a9-rich-card-list_summary').text().trim()}`,
                pubDate: timezone(parseDate(item.find('.a9-rich-card-list_infos').text().trim(), 'YYYY-MM-DD HH:mm:ss'), 8),
                link: `${baseUrl}${item.find('.a9-rich-card-list_item').attr('href')}`,
            };
        });

    ctx.set('data', {
        title: 'A9VG 电玩部落',
        link,
        description: $('meta[name="description"]').attr('content'),
        item: list,
    });
};
