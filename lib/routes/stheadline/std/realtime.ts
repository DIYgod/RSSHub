import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.stheadline.com';

export const route: Route = {
    path: '/std/:category{.+}?',
    name: '即時',
    maintainers: ['TonyRL'],
    example: '/stheadline/std/realtimenews',
    parameters: { category: '分類路徑，URL 中 `www.stheadline.com/` 後至中文分類名前部分，預設為 `realtimenews`' },
    radar: [
        {
            source: ['www.stheadline.com/theme/:category/chineseCategory', 'www.stheadline.com/:category/:chineseCategory'],
            target: '/std/:category',
        },
    ],
    handler,
};

async function handler(ctx) {
    const { category = 'realtimenews' } = ctx.req.param();
    const url = `${baseUrl}/${category}`;
    const { data: response } = await got(url);
    const $ = load(response);

    let items = $('.news-block .news-detail > a')
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
                    guid: item.link.slice(0, item.link.lastIndexOf('/')),
                };
            })
        )
    );

    return {
        title: $('head meta[name="title"]').attr('content') || $('head title').text(),
        description: $('meta[name=description]').attr('content'),
        image: 'https://www.sthlstatic.com/sthl/assets/favicon/android-icon-192x192.png',
        language: 'zh-HK',
        link: url,
        item: items,
    };
}
