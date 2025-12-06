import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/live',
    categories: ['multimedia'],
    example: '/bandcamp/live',
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
            source: ['bandcamp.com/live_schedule'],
        },
    ],
    name: 'Upcoming Live Streams',
    maintainers: ['nczitzk'],
    handler,
    url: 'bandcamp.com/live_schedule',
};

async function handler() {
    const rootUrl = 'https://bandcamp.com';
    const currentUrl = `${rootUrl}/live_schedule`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    $('.curated-wrapper').remove();

    const items = $('.live-listing')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                link: item.find('.title-link').attr('href'),
                title: item.find('.show-title').text(),
                author: item.find('.show-artist').text(),
                pubDate: parseDate(item.find('.show-time-container').text().trim().split(' UTC')[0]),
                description: `<img src="${
                    item
                        .find('.show-thumb-image')
                        .attr('style')
                        .match(/background-image: url\((.*)\);/)[1]
                }">`,
            };
        });

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
