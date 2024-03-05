// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const baseUrl = 'https://monitor.firefox.com';

    const response = await got(`${baseUrl}/breaches`);
    const $ = load(response.data);

    const items = $('.breach-card')
        .toArray()
        .map((item) => {
            item = $(item);
            item.find('.breach-detail-link').remove();
            return {
                title: item.find('h3 span').last().text(),
                description: item.find('.breach-main').html(),
                link: new URL(item.attr('href'), baseUrl).href,
                pubDate: timezone(parseDate(item.find('.breach-main div dd').first().text()), 0),
                category: item
                    .find('.breach-main div dd')
                    .last()
                    .text()
                    .split(',')
                    .map((x) => x.trim()),
            };
        });

    ctx.set('data', {
        title: $('title').text(),
        description: $('head meta[name=description]').attr('content').trim(),
        link: response.url,
        item: items,
        image: $('head meta[property=og:image]').attr('content'),
    });
};
