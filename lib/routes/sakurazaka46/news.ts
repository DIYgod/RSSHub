// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const rootUrl = 'https://sakurazaka46.com';
    const currentUrl = `${rootUrl}/s/s46/news/list`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.com-news-part .box a')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 30)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('.lead').text(),
                link: `${rootUrl}${item.attr('href').split('?')[0]}`,
                pubDate: parseDate(item.find('.date').text()),
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

                item.description = content('.article').html();

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
