// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseRelativeDate } from '@/utils/parse-date';

export default async (ctx) => {
    const origin = 'https://www.wxnmh.com/';
    const response = await got.get(`${origin}user-${ctx.req.param('id')}.htm`);
    const $ = load(response.data);

    const name = $('#body .col-lg-9 .card-block .col-md-9 h3').text().trim();
    const description = $('#body .col-lg-9 .card-block .col-md-9 p').text().trim();

    const links = $('#body tr.thread .subject a')
        .map((index, ele) => {
            const title = $(ele).text();
            const link = origin + $(ele).attr('href');
            return { title, link };
        })
        .get();

    const item = await Promise.all(
        links.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const res = await got.get(item.link);
                    const $ = load(res.data);
                    const desc = $('#js_content').html().replaceAll('data-src="http', 'src="http');
                    item.description = `<div style="max-width: 800px;margin: 0 auto;text-align: center;">${desc}</div>`;
                    item.pubDate = parseRelativeDate($('.date').text());
                    return item;
                } catch {
                    return '';
                }
            })
        )
    );

    ctx.set('data', {
        title: `${name} - 微信公众号`,
        link: 'https://www.wxnmh.com/',
        description,
        item,
    });
};
