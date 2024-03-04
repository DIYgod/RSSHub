// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const baseUrl = 'https://keepass.info/news/news_all.html';
    const { data: response } = await got(baseUrl);
    const $ = load(response);

    const list = $('p > a')
        .toArray()
        .map((elem) => {
            elem = $(elem);
            return {
                title: elem.find('b').text(),
                link: new URL(elem.attr('href'), baseUrl).href,
                pubDate: parseDate(elem.next().next('small').text().split('.')[0]),
            };
        })
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 10);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (!item.link.startsWith('https://keepass.info/')) {
                    return item;
                }

                const { data } = await got(item.link);
                const $ = load(data);

                $('.sectionheader').remove();
                $('.laytablews > tbody> tr:nth-child(1) > td:nth-child(2) > p').first().remove();

                item.description = $('.laytablews > tbody> tr:nth-child(1) > td:nth-child(2)').html();
                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('head title').attr('content'),
        link: baseUrl,
        item: items,
    });
};
