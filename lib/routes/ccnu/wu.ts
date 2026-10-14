import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/wu',
    categories: ['university'],
    example: '/ccnu/wu',
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
            source: ['uowji.ccnu.edu.cn/index/tzgg.htm', 'uowji.ccnu.edu.cn/'],
        },
    ],
    name: '伍伦贡联合研究院',
    maintainers: ['shengmaosu'],
    handler,
    url: 'uowji.ccnu.edu.cn/index/tzgg.htm',
};

async function handler() {
    const link = 'https://uowji.ccnu.edu.cn/index/tzgg.htm';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('.txtList li');

    return {
        title: '华中师范大学伍伦贡联合研究院',
        link,
        description: '华中师范大学伍伦贡联合研究院通知公告',
        item:
            list &&
            list.toArray().map((item) => {
                const $item = $(item);
                const a = $item.find('a');
                return {
                    title: a.attr('title')!,
                    link: new URL(a.attr('href')!, link).href,
                    pubDate: timezone(parseDate($item.find('.time').text().replaceAll(/\s/g, ''), 'DDYYYY.MM'), 8),
                };
            }),
    };
}
