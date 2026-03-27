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
            source: ['my-formosa.com/'],
        },
    ],
    name: '首页',
    maintainers: ['dzx-dzx'],
    handler,
    url: 'my-formosa.com',
};

function fetch(url) {
    return ofetch(url, { responseType: 'arrayBuffer' }).then((raw) => {
        const decoder = new TextDecoder('big5');
        return decoder.decode(raw);
    });
}

async function handler() {
    const rootUrl = 'http://www.my-formosa.com/';

    const res = await fetch(rootUrl);

    const $ = load(res);

    const items = await Promise.all(
        $('#featured-news h3 a')
            .toArray()
            .map((item) => {
                item = $(item);

                const title = item.text();
                const link = new URL(item.attr('href'), rootUrl).href;

                return cache.tryGet(link, async () => {
                    const res = await fetch(link);
                    const $ = load(res);

                    const isTV = new URL(link).pathname.startsWith('/TV');

                    return {
                        title,
                        link,
                        author: $('.page-header~#featured-news h4').text(),
                        category: $("meta[name='keywords']").attr('content').split(',').filter(Boolean),
                        pubDate: timezone(parseDate((isTV ? $('.icon-calendar')[0].next.data : $('.date').text()).trim()), +8),
                        description: (isTV ? $('.post-item').html() : $('.body').html()).replaceAll(/\/News.*?\.jpg/g, (match) => `http://my-formosa.com${match}`),
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
