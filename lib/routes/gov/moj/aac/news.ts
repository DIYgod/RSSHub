// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
const baseUrl = 'https://www.aac.moj.gov.tw';

export default async (ctx) => {
    const type = ctx.req.param('type');
    const url = `${baseUrl}/7204/7246/?Page=1&PageSize=40${type ? `&type=${type}` : ''}`;
    const response = await got(url);
    const $ = load(response.data);
    $('.num').remove();
    const list = $('.list ul li a')
        .toArray()
        .map((item) => {
            item = $(item);
            const isDownload = /檔案下載/.test(item.attr('title'));
            const title = isDownload ? item.text().trim() : item.attr('title');
            return {
                title,
                link: new URL(item.attr('href'), baseUrl).href,
                isDownload,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (!item.isDownload) {
                    const response = await got(item.link);
                    const $ = load(response.data);

                    item.pubDate = timezone(parseDate($('.info time').attr('datetime'), 'YYYY-MM-DD HH:mm:ss'), +8);
                    $('.info, button').remove();
                    item.description = $('.cp').html() + ($('.lightbox_slider').length ? $('.lightbox_slider').html() : '') + ($('.file_download').length ? $('.file_download').html() : '');
                }
                delete item.isDownload;
                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('head title').text(),
        link: url,
        item: items,
        language: 'zh-TW',
    });
};
