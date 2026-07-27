import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/',
    categories: ['new-media'],
    example: '/my-formosa',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['m.my-formosa.com.tw/'],
        },
    ],
    name: '首頁',
    maintainers: ['dzx-dzx'],
    handler,
    url: 'm.my-formosa.com.tw',
};

async function handler() {
    const rootUrl = 'https://m.my-formosa.com.tw';

    const res = await ofetch(rootUrl);
    const $ = load(res);

    const items = await Promise.all(
        $('ul.local-list li .cont h1 a')
            .toArray()
            .map((item) => {
                const $item = $(item);

                const title = $item.text();
                const link = new URL($item.attr('href')!, rootUrl).href;

                return cache.tryGet(link, async () => {
                    const res = await ofetch(link);
                    const $ = load(res);

                    const pubDate = $('.news_header .info')
                        .text()
                        .match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)?.[0];
                    const media = $.html($('.news_header > img, .news_header > .media'));
                    const summary = $.html($('.product > h2'));

                    return {
                        title,
                        link,
                        author: $('.cont h1 a').text(),
                        category: [$('.story_header button').text()],
                        pubDate: pubDate ? timezone(parseDate(pubDate), 8) : undefined,
                        description: media + summary + ($('.body').html() ?? ''),
                    };
                });
            })
    );

    return {
        title: $('title').text(),
        link: rootUrl,
        item: items,
    };
}
