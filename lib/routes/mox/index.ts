// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const category = ctx.req.param('category') ?? '';

    const rootUrl = 'https://mox.moe';
    const currentUrl = `${rootUrl}${category ? `/l/${category}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.listbg td')
        .toArray()
        .map((item) => {
            item = $(item).find('a').last();

            const guid = item.attr('href').split('/').pop();
            const pubDate = item.parent().find('.filesize').text();

            return {
                title: item.text(),
                link: item.attr('href'),
                pubDate: parseDate(pubDate),
                guid: `${guid}-${pubDate}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.guid, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.author = content('.status font a').first().text();
                item.description = `<img src="${content('.img_book').attr('src')}"><br>${content('.author').html()}<br>${content('#desc_text').html()}`;

                return item;
            })
        )
    );

    ctx.set('data', {
        title: 'Mox.moe',
        link: currentUrl,
        item: items,
    });
};
