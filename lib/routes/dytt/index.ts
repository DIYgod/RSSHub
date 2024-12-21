import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import iconv from 'iconv-lite';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: ['multimedia'],
    example: '/dytt',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: true,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['ygdy8.net/index.html'],
        },
    ],
    name: '最新电影',
    maintainers: ['junfengP'],
    handler,
};

async function loadContent(link: string) {
    const response = await got.get(link, {
        responseType: 'buffer',
    });
    const data = iconv.decode(response.data, 'gb2312');
    const $ = load(data);
    return $('div#Zoom').html() || '';
}

async function handler() {
    const baseURL = 'https://www.ygdy8.net/html/gndy/dyzz/index.html';
    const response = await got.get(baseURL, {
        responseType: 'buffer',
    });
    const data = iconv.decode(response.data, 'gb2312');

    const $ = load(data);
    const list = $('.co_content8 table tr b a').toArray();

    const items = await Promise.all(
        list.map(async (item) => {
            const link = $(item);
            const itemUrl = 'https://www.ygdy8.net' + link.attr('href');

            return await cache.tryGet(itemUrl, async () => {
                const description = await loadContent(itemUrl);
                return {
                    enclosure_url: description.match(/magnet:.*?(?=">)/) || '',
                    enclosure_type: 'application/x-bittorrent',
                    title: link.text(),
                    description,
                    pubDate: parseDate($(item).find('font').text()),
                    link: itemUrl,
                };
            });
        })
    );

    return {
        title: '电影天堂/阳光电影',
        link: baseURL,
        description: '电影天堂RSS',
        item: items,
    };
}
