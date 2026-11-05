import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

function parsePortalDate(sourceDate: string) {
    if (!sourceDate.trim()) {
        return;
    }
    const date = parseDate(sourceDate, 'YYYY-MM-DD, HH:mm');
    return Number.isFinite(date.valueOf()) ? timezone(date, 8) : undefined;
}

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
    const response = await ofetch.raw('https://trow.cc', {
        redirect: 'manual',
    });
    let data = response._data;
    if (response.status === 302) {
        data = await ofetch('https://trow.cc', {
            headers: {
                cookie: response.headers
                    .getSetCookie()
                    .map((cookie) => cookie.split(';', 1)[0])
                    .join('; '),
            },
            redirect: 'manual',
        });
    }

    const $ = load(data);
    const list = $('#portal_content .borderwrap[style="display:show"]');

    return {
        title: 'The Ring of Wonder - Portal',
        link: 'https://trow.cc',
        description: 'The Ring of Wonder 首页更新',
        item: list
            .toArray()
            .filter((item) => $(item).find('.maintitle p:nth-child(2) > a').attr('href'))
            .map((item) => {
                const $item = $(item);
                const dateraw = $item.find('.postdetails').text();
                return {
                    title: $item.find('.maintitle p:nth-child(2) > a').text(),
                    description: $item.find('.portal_news_content .row18').html(),
                    link: new URL($item.find('.maintitle p:nth-child(2) > a').attr('href')!, 'https://trow.cc').href,
                    author: $item.find('.postdetails a').text(),
                    pubDate: parsePortalDate(dateraw.slice(3)),
                };
            }),
    };
}
