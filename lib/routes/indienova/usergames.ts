// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const baseUrl = 'https://indienova.com';

    const { data: response, url: link } = await got(`${baseUrl}/usergames`);
    const $ = load(response);

    const list = $('.steam-game')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('h3').attr('title'),
                link: new URL(item.find('a').attr('href'), baseUrl).href,
                author: item.find('span').text(),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                item.description = $('.cover-image').prop('outerHTML') + $('.tab-container').html() + $('.swiper-wrapper').prop('outerHTML') + $('.postcontent').html();
                item.pubDate = $('.gamedb-release').length ? timezone(parseDate($('.gamedb-release').text().replaceAll(/[()]/g, '')), +8) : null;

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('head title').text(),
        link,
        item: items,
    });
};
