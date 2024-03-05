// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
    const rootUrl = 'https://darwinawards.com';
    const currentUrl = `${rootUrl}/darwin/`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    $('.cameo').remove();

    $('.topvote_title_desc, .topvote_title_minimal, .topvote_minimal').each(function () {
        $(this).find('a').first().remove();
    });

    let items = $('#article_index a')
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

                content('h2, nav, footer, table, form').remove();

                item.description = content('article').html();

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
