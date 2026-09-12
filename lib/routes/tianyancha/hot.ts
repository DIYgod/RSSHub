import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseRelativeDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/hot',
    categories: ['other'],
    example: '/tianyancha/hot',
    features: { antiCrawler: true },
    name: '热门搜索',
    maintainers: ['nczitzk'],
    handler,
};

async function handler() {
    const rootUrl = 'https://www.tianyancha.com/';
    const response = await ofetch(rootUrl);

    const $ = load(response);

    const list = $('.key')
        .slice(0, 10)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: $item.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);

                item.author = content('.resource').text().replace('来源：', '');
                item.description = content('.news-content').html();
                item.pubDate = parseRelativeDate(content('.resource').next().text());

                return item;
            })
        )
    );

    return {
        title: '热门搜索 - 天眼查',
        link: rootUrl,
        item: items,
    };
}
