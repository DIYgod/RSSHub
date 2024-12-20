import type { Route, Context } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import iconv from 'iconv-lite';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';

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
    name: '电影天堂',
    maintainers: ['junfengP'],
    handler,
};

async function loadContent(link: string, cache: Context['cache']) {
    return await cache.tryGet(link, async () => {
        const response = await got.get(link, {
            responseType: 'buffer',
        });
        const data = iconv.decode(response.data, 'gb2312');
        const $ = load(data);
        return $('div#Zoom').html() || '';
    });
}

async function handler() {
    const baseURL = 'https://www.ygdy8.net/index.html';
    const response = await got.get(baseURL, {
        responseType: 'buffer',
    });
    const data = iconv.decode(response.data, 'gb2312');

    const $ = load(data);
    const list = $('.co_content8 table tr').toArray();
    list.splice(0, 1);

    const items = await Promise.all(
        list.slice(0, 20).map(async (item) => {
            const link = $(item).find('a:nth-of-type(2)');
            const itemUrl = 'https://www.ygdy8.net' + link.attr('href');
            const description = await loadContent(itemUrl, cache);

            return {
                enclosure_url: String(description.match(/magnet:.*?(?=">)/) || ''),
                enclosure_type: 'application/x-bittorrent',
                title: link.text(),
                description,
                pubDate: parseDate($(item).find('font').text()),
                link: itemUrl,
            };
        })
    );

    return {
        title: '电影天堂/阳光电影',
        link: baseURL,
        description: '电影天堂RSS',
        item: items,
    };
}
