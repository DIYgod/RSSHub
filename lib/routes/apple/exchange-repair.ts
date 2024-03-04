// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const host = 'https://support.apple.com/';

export default async (ctx) => {
    const country = ctx.req.param('country') ?? '';
    const link = new URL(`${country}/service-programs`, host).href;

    const response = await got(link);
    const $ = load(response.data);
    const list = $('section.as-container-column')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('.icon-chevronright').parent();
            return {
                title: a.text(),
                link: new URL(a.attr('href'), host).href,
                pubDate: parseDate(item.find('.note').text(), ['MMMM D, YYYY', 'D MMMM YYYY', 'YYYY 年 M 月 D 日']),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $$ = load(response.data);

                // delete input and dropdown elements
                $$('div.as-sn-lookup-wrapper').remove();
                $$('div.as-dropdown-wrapper').remove();
                item.description = $$('.main').html();

                item.author = 'Apple Inc.';

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `Apple - ${$('h1.as-center').text()}`,
        link,
        item: out,
    });
};
