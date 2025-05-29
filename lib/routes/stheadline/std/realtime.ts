import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://std.stheadline.com';

export const route: Route = {
    path: '/std/realtime/:category{.+}?',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const { category = '即時' } = ctx.req.param();
    const url = `${baseUrl}/realtime/${category}`;
    const { data: response } = await got(url);
    const $ = load(response);

    let items = $(`.news-block .news-detail > a`)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.title').text(),
                link: new URL(item.attr('href'), 'https://www.stheadline.com').href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                return {
                    ...item,
                    description: $('.content-body').html(),
                    pubDate: parseDate($('meta[property="article:published_time"]').attr('content')),
                    category: $("meta[name='keyword']").attr('content').split(','),
                    guid: $('meta[property="dable:item_id"]').attr('content'),
                };
            })
        )
    );

    return {
        title: $('head title').text(),
        description: $('meta[name=description]').attr('content'),
        image: 'https://std.stheadline.com/dist/images/favicon/icon-512.png',
        link: url,
        item: items,
    };
}
