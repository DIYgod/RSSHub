import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news',
    categories: ['game'],
    example: '/fate-go/news',
    name: 'News',
    maintainers: ['nczitzk'],
    handler,
};

async function handler() {
    const newsUrl = 'https://news.fate-go.jp/';
    const response = await ofetch(newsUrl);
    const $ = load(response);
    const list = $('ul.list_news li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('p.title').text(),
                link: new URL($item.find('a').attr('href')!, newsUrl).href,
                pubDate: parseDate($item.find('p.date').text()),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const res = await ofetch(item.link);
                const content = load(res);
                content('div.article .title-box').remove();
                return {
                    ...item,
                    description: content('div.article').html(),
                };
            })
        )
    );

    return {
        title: 'Fate Grand Order News',
        link: newsUrl,
        item: items,
    };
}
