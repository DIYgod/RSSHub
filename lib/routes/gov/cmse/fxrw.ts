import path from 'node:path';

import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/cmse/fxrw',
    categories: ['government'],
    example: '/gov/cmse/fxrw',
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
            source: ['www.cmse.gov.cn/fxrw'],
        },
    ],
    name: '飞行任务',
    maintainers: ['nczitzk'],
    handler,
    url: 'www.cmse.gov.cn/fxrw',
};

async function handler() {
    const rootUrl = 'http://www.cmse.gov.cn';
    const currentUrl = `${rootUrl}/fxrw/`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = $('#list li a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('.title').text().split('：').pop().trim(),
                link: new URL(item.attr('href'), currentUrl).href,
                pubDate: timezone(parseDate(item.find('.infoR').first().text().trim(), 'YYYY年M月D日H时m分'), +8),
                description: art(path.join(__dirname, 'templates/description.art'), {
                    image: new URL(item.find('img').attr('src'), currentUrl).href,
                    description: item.find('.info').html(),
                }),
            };
        });

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
