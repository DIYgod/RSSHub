// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const category = ctx.req.param('category') ?? '';

    const rootUrl = 'https://appleinsider.com';
    const currentUrl = `${rootUrl}${category ? `/${category}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $(`${category === '' ? '#news-river ' : ''}.river`)
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 30)
        .toArray()
        .map((item) => {
            item = $(item).find('a').first();

            return {
                title: item.text(),
                link: item.attr('href'),
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

                content('#article-social').next().remove();
                content('#article-hero, #article-social').remove();
                content('.deals-widget').remove();

                item.title = content('.h1-adjust').text();
                item.author = content('.avatar-link a').attr('title');
                item.pubDate = parseDate(content('time').first().attr('datetime'));
                item.description = content('header').next('.row').html();

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
