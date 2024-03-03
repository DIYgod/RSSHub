// @ts-nocheck
import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const link = 'https://www.fx678.com/kx/';
    const res = await got.get(link);
    const $ = load(res.data);
    // 页面新闻消息列表
    const list = $('.body_zb ul .body_zb_li .zb_word')
        .find('.list_font_pic > a:first-child')
        .map((i, e) => $(e).attr('href'))
        .slice(0, 30)
        .get();

    const out = await Promise.all(
        list.map((itemUrl) =>
            cache.tryGet(itemUrl, async () => {
                const res = await got.get(itemUrl);
                const $ = load(res.data);

                const contentPart = $('.article-main .content').html().trim();
                const forewordPart = $('.article-main .foreword').html().trim();
                const datetimeString = $('.article-cont .details i').text().trim();
                const articlePubDate = timezone(parseDate(datetimeString, 'YYYY-MM-DD HH:mm:ss'), +8);

                const item = {
                    title: $('.article-main .foreword').text().trim().split('——').pop(),
                    link: itemUrl,
                    description: contentPart.length > 1 ? contentPart : forewordPart,
                    pubDate: articlePubDate,
                };

                return item;
            })
        )
    );
    ctx.set('data', {
        title: '7x24小时快讯',
        link,
        item: out,
    });
};
