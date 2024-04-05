import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/fdy/:path{.+}?',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const baseUrl = 'http://fdy.bnu.edu.cn';
    const { path = 'tzgg' } = ctx.req.param();
    const link = `${baseUrl}/${path}/index.htm`;

    const { data: response } = await got(link);
    const $ = load(response);

    const list = $('.listconrl li')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.attr('title'),
                link: new URL(a.attr('href'), link).href,
                pubDate: parseDate(item.find('.news-dates').text()),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                item.description = $('.listconrc-newszw').html();
                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        link,
        item: items,
    };
}
