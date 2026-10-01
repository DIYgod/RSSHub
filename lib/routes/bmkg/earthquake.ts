import { load } from 'cheerio';
import type { Element } from 'domhandler';

import type { Data, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/earthquake',
    categories: ['forecast'],
    example: '/bmkg/earthquake',
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
            source: ['bmkg.go.id/', 'bmkg.go.id/gempabumi-terkini.html'],
        },
    ],
    name: 'Recent Earthquakes',
    maintainers: ['Shinanory'],
    handler,
    url: 'bmkg.go.id/',
};

const cellText = (cell: Element, index = 0) => {
    const node = cell.children[index];
    if (node?.nodeType !== 3) {
        throw new Error('Unexpected layout of the BMKG earthquake table');
    }
    return node.data;
};

async function handler(): Promise<Data> {
    const url = 'https://www.bmkg.go.id/gempabumi-terkini.html';
    const response = await got(url);
    const $ = load(response.data);
    const items = $('div .table-responsive tbody tr')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const td = $item.find('td').toArray();
            return {
                title: `${cellText(td[2])}|${cellText(td[3])}|${cellText(td[4])}|${cellText(td[5])}|${cellText(td[6])}`,
                link: url,
                pubDate: timezone(parseDate(`${cellText(td[1])} ${cellText(td[1], 2).slice(0, 8)}`, 'DD-MM-YY HH:mm:ss'), 7),
            };
        });

    return {
        title: $('title').text(),
        link: url,
        description: '印尼气象气候和地球物理局 最近的地震(M ≥ 5.0) | BMKG earthquake',
        item: items,
        language: 'in',
    };
}
