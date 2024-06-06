import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/',
    categories: ['traditional-media'],
    example: '/my-formosa/',
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
    name: '美麗島電子報',
    maintainers: [''],
    handler,
    url: 'my-formosa.com',
};

async function handler() {
    const rootUrl = 'http://www.my-formosa.com/';

    const fetch = (url) =>
        ofetch(url, { responseType: 'arrayBuffer' }).then((raw) => {
            const decoder = new TextDecoder('big5');
            return decoder.decode(raw);
        });
    const res = await fetch(rootUrl);

    const $ = load(res);

    const items = $('#featured-news h3 a')
        .toArray()
        .map(async (item) => {
            item = $(item);

            const title = item.text();
            const link = new URL(item.attr('href'), rootUrl).href;

            return await cache.tryGet(link, async () => {
                const res = await fetch(link);
                const $ = load(res);

                return {
                    title,
                    link,
                    author: $('.page-header~#featured-news h4').text(),
                    category: $("meta[name='keywords']").attr('content').split(','),
                    pubDate: timezone(parseDate($('.date').text()), +8),
                    description: $('.body').html(),
                };
            });
        });

    return {
        title: $('title').text(),
        link: rootUrl,
        item: items,
    };
}
