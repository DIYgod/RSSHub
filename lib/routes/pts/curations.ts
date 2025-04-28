import { Route } from '@/types';

import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/curations',
    categories: ['traditional-media'],
    example: '/pts/curations',
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
            source: ['news.pts.org.tw/curations', 'news.pts.org.tw/'],
        },
    ],
    name: '專題策展',
    maintainers: ['nczitzk'],
    handler,
    url: 'news.pts.org.tw/curations',
};

async function handler() {
    const rootUrl = 'https://news.pts.org.tw';
    const currentUrl = `${rootUrl}/curations`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = $('.project-intro')
        .last()
        .find('h3 a')
        .toArray()
        .map((item) => {
            item = $(item);

            const projectDiv = item.parent().parent();

            return {
                title: item.text(),
                link: item.attr('href'),
                pubDate: parseDate(projectDiv.find('time').text()),
                description: art(path.join(__dirname, 'templates/description.art'), {
                    image: projectDiv.parent().find('.cover-fit').attr('src'),
                }),
            };
        });

    return {
        title: $('title')
            .text()
            .replace(/第\d+頁 ｜ /, ''),
        link: currentUrl,
        item: items,
    };
}
