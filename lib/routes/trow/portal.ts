import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/portal',
    categories: ['bbs'],
    example: '/trow/portal',
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
            source: ['trow.cc/'],
        },
    ],
    name: '首页更新',
    maintainers: ['shiningdracon'],
    handler,
    url: 'trow.cc/',
};

async function handler() {
    let data;
    const response = await got.extend({ followRedirect: false }).get({
        url: `https://trow.cc`,
    });
    if (response.statusCode === 302) {
        const response2 = await got.extend({ followRedirect: false }).get({
            url: `https://trow.cc`,
            headers: {
                cookie: response.headers['set-cookie'],
            },
        });
        data = response2.data;
    } else {
        data = response.data;
    }

    const $ = load(data);
    const list = $('#portal_content .borderwrap[style="display:show"]');

    return {
        title: `The Ring of Wonder - Portal`,
        link: `https://trow.cc`,
        description: `The Ring of Wonder 首页更新`,
        item: list.toArray().map((item) => {
            item = $(item);
            const dateraw = item.find('.postdetails').text();
            return {
                title: item.find('.maintitle p:nth-child(2) > a').text(),
                description: item.find('.portal_news_content .row18').html(),
                link: item.find('.maintitle p:nth-child(2) > a').attr('href'),
                author: item.find('.postdetails a').text(),
                pubDate: timezone(parseDate(dateraw.slice(3), 'YYYY-MM-DD, HH:mm'), +8),
            };
        }),
    };
}
