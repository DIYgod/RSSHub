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
    const list = $('article[id] .notes-container')
        .toArray()
        .filter((item, index, items) => {
            const link = $(item).find('.button-container > a').attr('href');
            return link && items.findIndex((entry) => $(entry).find('.button-container > a').attr('href') === link) === index;
        });

    return {
        title: '特斯拉系统更新',
        link: 'https://www.notateslaapp.com/software-updates/history/',
        description: '特斯拉系统更新 - 最新发布',
        item: list.map((item) => {
            const $item = $(item);
            return {
                title: $item.find('h4').text(),
                description: $item.find('.release-notes').html(),
                link: $item.find('.button-container > a').attr('href'),
            };
        }),
    };
}
