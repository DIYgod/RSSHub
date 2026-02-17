import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/ota',
    categories: ['program-update'],
    example: '/notateslaapp/ota',
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
            source: ['notateslaapp.com/software-updates/history', 'notateslaapp.com/software-updates', 'notateslaapp.com/'],
        },
    ],
    name: 'Tesla Software Updates',
    maintainers: ['mrbruce516'],
    handler,
    url: 'notateslaapp.com/software-updates/history',
};

async function handler() {
    const response = await got({
        method: 'get',
        url: 'https://www.notateslaapp.com/software-updates/history/',
        headers: {
            Referer: 'https://www.notateslaapp.com/software-updates/history/',
        },
    });

    const data = response.data;

    const $ = load(data);
    const list = $('article[id]');

    return {
        title: '特斯拉系统更新',
        link: 'https://www.notateslaapp.com/software-updates/history/',
        description: '特斯拉系统更新 - 最新发布',
        item: list.toArray().map((item) => {
            item = $(item);
            return {
                title: item.find('.container h1').text(),
                description: item.find('.notes-container').text(),
                pubDate: null,
                link: item.find('.notes-container > .button-container > a').attr('href'),
            };
        }),
    };
}
