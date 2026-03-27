import { load } from 'cheerio';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const fetchFeed = async (ctx, currentUrl) => {
    const rootUrl = 'https://www.ruancan.com';
    currentUrl = `${rootUrl}${currentUrl}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.item-title a')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 15)
        .toArray()
        .map((item) => {
            item = $(item);

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

                content('.entry-copyright').remove();

                content('.entry-content div').each(function () {
                    if (/^ruanc-\d+/.test(content(this).attr('id'))) {
                        content(this).remove();
                    }
                });

                content('figure').each(function () {
                    content(this).html(`<img src="${content(this).find('a').attr('href')}">`);
                });

                item.description = content('.entry-content').html();
                item.category = content('.entry-info a[rel="category tag"]')
                    .toArray()
                    .map((c) => content(c).text());
                item.pubDate = parseDate(content('.entry-info .entry-date').attr('datetime'));

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};
export default fetchFeed;
