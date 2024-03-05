// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'https://www.nowcoder.com';

export default async (ctx) => {
    const type = ctx.req.param('type');
    const order = ctx.req.param('order');

    const link = `https://www.nowcoder.com/discuss?type=${type}&order=${order}`;
    const response = await got.get(link);
    const $ = load(response.data);

    const type_name = $('a.discuss-tab.selected').text();
    const order_name = $('li.selected a').text();

    const list = $('li.clearfix')
        .map(function () {
            const info = {
                title: $(this).find('div.discuss-main.clearfix a:first').text().trim().replace('\n', ' '),
                link: $(this).find('div.discuss-main.clearfix a[rel]').attr('href'),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map((info) => {
            const title = info.title || 'tzgg';
            const itemUrl = new URL(info.link, host).href.replace(/^(.*)\?(.*)$/, '$1');

            return cache.tryGet(itemUrl, async () => {
                const response = await got.get(itemUrl);
                const $ = load(response.data);

                const date_value = $('span.post-time').text();

                const description = $('.nc-post-content').html();

                return {
                    title,
                    link: itemUrl,
                    description,
                    pubDate: timezone(parseDate(date_value), +8),
                };
            });
        })
    );

    ctx.set('data', {
        title: `${type_name}${order_name}——牛客网讨论区`,
        link,
        item: out,
    });
};
