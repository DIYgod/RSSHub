// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const baseUrl = 'http://fdy.bnu.edu.cn';
    const { path = 'tzgg' } = ctx.req.param();
    const link = `${baseUrl}/${path}/index.htm`;

    const { data: response } = await got(link);
    const $ = load(response);

    const list = $('.listconrl li')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.attr('title'),
                link: new URL(a.attr('href'), link).href,
                pubDate: parseDate(item.find('.news-dates').text()),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                item.description = $('.listconrc-newszw').html();
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
