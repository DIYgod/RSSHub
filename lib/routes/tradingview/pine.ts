// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const { version = 'v5' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 100;

    const rootUrl = 'https://www.tradingview.com';
    const currentUrl = new URL(`pine-script-docs/en/${version}/Release_notes.html`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const items = $('div.section')
        .toArray()
        .filter((item) => {
            item = $(item);

            return /\w+-\d{4}/.test(item.prop('id'));
        })
        .slice(0, limit)
        .map((item) => {
            item = $(item);

            const id = item.prop('id');
            const title = item.find('a.toc-backref').first().text();
            const link = new URL(item.find('a.headerlink').prop('href'), currentUrl).href;

            item.children().first().remove();

            return {
                title,
                link,
                description: item.html(),
                pubDate: parseDate(`${id.charAt(0).toUpperCase()}${id.slice(1)}`, 'MMMM-YYYY'),
            };
        });

    const image = new URL('_images/Pine_Script_logo.svg', currentUrl).href;
    const icon = new URL('favicon.ico', rootUrl).href;

    ctx.set('data', {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('div.text-logo').text(),
        language: $('html').prop('lang'),
        image,
        icon,
        logo: icon,
    });
};
