// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const baseUrl = 'https://www.taiwannews.com.tw';
    const { lang = 'en' } = ctx.req.param();
    const url = `${baseUrl}/${lang}/index`;
    const response = await got(url);
    const $ = load(response.data);

    const list = $('.mod_group-columns  .container-fluid .row')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('.entry-header a').first();
            return {
                title: a.attr('title'),
                link: new URL(a.attr('href'), baseUrl).href,
                pubDate: timezone(parseDate(item.find('.entry-date span').eq(1).text(), 'YYYY/MM/DD HH:mm'), +8),
            };
        })
        .filter((item) => item.title);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);

                item.author = $('.article-author').text();
                item.category = $('.tagcloud a')
                    .toArray()
                    .map((a) => $(a).attr('title'));

                $('.article-head-wrapper, div[id^=div-gpt-ad-], div[class^=hidden-], footer').remove();
                $('.container-fluid').eq(2).remove();

                item.description = $('.mod_single-column').html();
                return item;
            })
        )
    );

    ctx.set('data', {
        title: `${$('.categories').eq(0).text()} - ${$('head title').text()}`,
        description: $('meta[name="description"]').attr('content'),
        link: url,
        item: items,
        language: lang,
    });
};
