import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news',
    categories: ['bbs'],
    example: '/wenxuecity/news',
    name: '焦点新闻',
    maintainers: ['nczitzk'],
    handler,
};

async function handler() {
    const rootUrl = 'https://www.wenxuecity.com';
    const currentUrl = `${rootUrl}/news/`;
    const response = await ofetch(currentUrl);
    const $ = load(response);

    const list = $('div.mainwrap div.block div.wrapper ul li a')
        .toArray()
        .slice(0, 15)
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: `${rootUrl}${$item.attr('href')}`,
            };
        }) as DataItem[];

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!, {
                    headers: {
                        Referer: currentUrl,
                    },
                });
                const content = load(detailResponse);

                item.description = content('#articleContent').html() ?? undefined;
                item.pubDate = timezone(parseDate(content('time[itemprop="datePublished"]').text()), 8);

                return item;
            })
        )
    );

    return {
        title: '焦点新闻 - 文学城',
        link: currentUrl,
        item: items as DataItem[],
    };
}
