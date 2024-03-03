// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

module.exports = async (ctx, currentUrl) => {
    const rootUrl = 'https://coomer.party';
    currentUrl = `${rootUrl}/${currentUrl}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.card-list__items')
        .find('a')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 25)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                link: `${rootUrl}${item.attr('href')}`,
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

                content('.ad-container').remove();

                item.author = content('.post__user-name').text();
                item.title = content('.post__title span').first().text();
                item.pubDate = parseDate(content('.timestamp').attr('datetime'));
                item.description = content('.post__body').html();

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
