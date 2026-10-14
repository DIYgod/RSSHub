import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.indiansinkuwait.com';

export const route: Route = {
    path: '/latest',
    categories: ['new-media'],
    example: '/indiansinkuwait/latest',
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
            source: ['indiansinkuwait.com/latest-news', 'indiansinkuwait.com/'],
        },
    ],
    name: 'News',
    maintainers: ['TonyRL'],
    handler,
    url: 'indiansinkuwait.com/latest-news',
};

async function handler() {
    const { data: response } = await got(`${baseUrl}/latest-news`);
    const $ = load(response);

    const list = $('.paragraphs .span4')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            return {
                title: $item.find('.content-heading h6 a').text(),
                link: new URL($item.find('a').attr('href')!, `${baseUrl}/latest-news`).href,
            };
        });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                const date = $('#ctl00_ContentPlaceHolder1_SpanAuthor').text();
                item.pubDate = date ? parseDate(`${date} GMT`) : undefined;
                $('#newsdetails h3, #ctl00_ContentPlaceHolder1_SpanAuthor, .noprint, [id^=div-gpt-ad]').remove();
                item.description = $('#newsdetails').html();

                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        image: 'https://www.indiansinkuwait.com/apple-touch-icon-152x152-precomposed.png',
        link: `${baseUrl}/latest-news`,
        item: items,
    };
}
