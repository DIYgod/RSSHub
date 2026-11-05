import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/system-update',
    categories: ['game'],
    example: '/nintendo/system-update',
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
            source: ['nintendo.co.jp/support/switch/system_update/index.html', 'nintendo.co.jp/'],
        },
    ],
    name: 'Switch System Update（Japan）',
    maintainers: ['hoilc'],
    handler,
    url: 'nintendo.co.jp/support/switch/system_update/index.html',
};

async function handler() {
    const url = 'https://www.nintendo.co.jp/support/switch/system_update/index.html';

    const response = await got(url);
    const $ = load(response.data);

    const list = $('h3')
        .toArray()
        .filter((heading) => /\d+年\d+月\d+日/.test($(heading).text()));

    return {
        title: 'Nintendo Switch 本体更新情報',
        link: url,
        item: list.map((update) => {
            const $update = $(update);
            const heading = $update.text();
            const matchedDate = /(\d+)年(\d+)月(\d+)日/.exec(heading);
            const updateInfo = $update.nextUntil('h3, h2');
            const updateInfos = updateInfo
                .toArray()
                .map((element) => $(element).html())
                .join('\n');
            const matchedVersion = /\d+(?:\.\d+)+/.exec(heading);

            return {
                title: heading,
                author: 'Nintendo',
                description: updateInfos,
                link: `${url}#${matchedVersion![0]}`,
                guid: `${url}#${matchedVersion![0]}`,
                pubDate: timezone(parseDate(`${matchedDate![1]}-${matchedDate![2]}-${matchedDate![3]}`, 'YYYY-M-D'), 9),
            };
        }),
    };
}
