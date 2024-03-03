// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const language = ctx.req.param('language') ?? 'eng';
    const category = ctx.req.param('category') ?? 'latest-news';

    const rootUrl = 'https://www.swissinfo.ch';
    const currentUrl = `${rootUrl}/${language}/${category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    let $ = load(response.data);

    const title = $('title').text();

    const fragmentResponse = await got({
        method: 'get',
        url: `${rootUrl}${$('main div[data-fragment-placeholder]').attr('data-fragment-placeholder')}`,
    });

    $ = load(fragmentResponse.data);

    let items = $('.si-teaser__link')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                link: `${rootUrl}${item.attr('href')}`,
                title: item.find('.si-teaser__title').text(),
                pubDate: parseDate(item.find('.si-teaser__date').attr('datetime')),
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

                content('.si-detail__content .si-grid').remove();
                content('.si-detail__content .si-teaser').remove();
                content('.show-for-sr, time, address, .si-detail__translation').remove();

                content('picture').each(function () {
                    content(this).html(`<img src="${content(this).find('source').first().attr('srcset')}">`);
                });

                item.description = content('.si-detail__content').html();
                item.author = content('meta[name="author"]').attr('content');
                item.guid = detailResponse.data.match(/content_id: "(.*)",/)[1];

                return item;
            })
        )
    );

    ctx.set('data', {
        title,
        link: currentUrl,
        item: items,
    });
};
