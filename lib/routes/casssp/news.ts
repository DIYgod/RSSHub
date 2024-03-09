import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const { category = '3' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 15;

    const rootUrl = 'http://www.casssp.org.cn';
    const currentUrl = new URL(`news/${category}/`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('p.e_text-22.s_title a, p.e_text-18.s_title a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: new URL(item.prop('href'), rootUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                item.description = content('div.e_richText-25, div.e_richText-3').html();
                item.pubDate = parseDate(`${content('p.e_timeFormat-15').text()}-${content('p.e_timeFormat-14').text()}-${content('p.e_timeFormat-11').text()}`);

                return item;
            })
        )
    );

    const image = $('img[la="la"]').first().prop('src');
    const icon = new URL($('link[rel="shortcut icon "]').prop('href'), rootUrl).href;

    ctx.set('data', {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: $('html').prop('lang'),
        image,
        icon,
        logo: icon,
        subtitle: $('meta[name="keywords"]').prop('content'),
        author: $('img[la="la"]').first().prop('title'),
        allowEmpty: true,
    });
};
