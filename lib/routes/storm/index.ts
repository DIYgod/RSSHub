// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const category = ctx.req.param('category') ?? 'articles';
    const id = ctx.req.param('id') ?? '';

    const rootUrl = 'https://www.storm.mg';
    const currentUrl = `${rootUrl}/${category}${id ? `/${id}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.link_title')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
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

                content('.notify_wordings').remove();
                content('#premium_block').remove();

                item.description = content('#CMS_wrapper').html();
                item.author = content('meta[property="dable:author"]').attr('content');
                item.pubDate = parseDate(content('meta[itemprop="datePublished"]').attr('content'));

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
