// @ts-nocheck
import { getSubPath } from '@/utils/common-utils';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const params = getSubPath(ctx) === '/' ? '' : getSubPath(ctx);

    const rootUrl = 'https://web3caff.com';
    const currentUrl = `${rootUrl}${params}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.list-grouped')
        .first()
        .find('.list-body')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 10)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('.list-title');

            return {
                title: a.text(),
                link: a.attr('href'),
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

                content('.ss-inline-share-wrapper').remove();

                item.description = content('.post-content').html();
                item.author = content('.author-name .author-popup').text();
                item.category = content('a[rel="category tag"]')
                    .toArray()
                    .map((tag) => $(tag).text());
                item.pubDate = parseDate(content('meta[property="article:published_time"]').attr('content'));

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
