// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const category = ctx.req.param('category') ?? '';

    const rootUrl = 'https://www.newsmarket.com.tw';
    const currentUrl = `${rootUrl}${category ? `/blog/category/${category}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.title a')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20)
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
                pubDate: parseDate(),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('figure img').each(function () {
                    content(this)
                        .parent()
                        .html(`<img src="${content(this).attr('data-src')}">`);
                });

                content('.inline-post').remove();

                item.author = content('.author-name').text();
                item.description = content('.entry-content').html();
                item.pubDate = parseDate(detailResponse.data.match(/"datePublished":"(.*)","dateModified"/)[1]);

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
