// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const category = ctx.req.param('category') ?? 'test';
    const language = ctx.req.param('language') ?? 'tc';
    const keyword = ctx.req.param('keyword') ?? '';

    const rootUrl = 'https://www.consumer.org.hk';
    const currentUrl = `${rootUrl}/${language}/free-article/free-article-${category}?category=free-article-${category}&q=${keyword}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.half-img-blk__title, .img-plate-blk__title')
        .find('a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
                pubDate: parseDate(item.parent().prev().find('li').first().text(), 'YYYY.MM'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.description = content('.ckec').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    });
};
