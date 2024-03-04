// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const { data: response } = await got('https://www.guanhai.com.cn');
    const $ = load(response);

    const recommand = $('.img-box ul > a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.attr('title'),
                link: item.attr('href'),
            };
        });

    const list = [
        ...$('.pic-summary .title')
            .toArray()
            .map((item) => {
                item = $(item);
                return {
                    title: item.find('a').attr('title'),
                    link: item.find('a').attr('href'),
                    pubDate: timezone(parseDate(item.find('time').text(), 'YYYY-MM-DD HH:mm'), 8),
                };
            }),
        ...recommand,
    ].filter((item) => item.link.startsWith('http'));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                item.author = $('.source').text();
                item.description = $('.article-content').html() ?? $('.video-content').html();
                item.pubDate = item.pubDate ?? timezone(parseDate($('.date').text(), 'YYYY-MM-DD HH:mm'), 8);
                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('head title').text(),
        description: $('head meta[name=description]').text(),
        image: 'https://www.guanhai.com.cn/favicon.ico',
        link: 'https://www.guanhai.com.cn',
        item: items,
    });
};
