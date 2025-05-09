import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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

    let items = $(`${category === '即時' ? '.moreNews > .col-md-4' : ''} .media-body > .my-2 > a`)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.attr('title'),
                link: item.attr('href'),
                guid: item.attr('href').slice(0, item.attr('href').lastIndexOf('/')),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                return {
                    ...item,
                    description: $('.paragraphs').html(),
                    pubDate: timezone(parseDate($('.content .date').text()), +8),
                    category: [$('nav .nav-item.active a')?.text()?.trim(), ...$("meta[name='keyword']").attr('content').split(',')],
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
