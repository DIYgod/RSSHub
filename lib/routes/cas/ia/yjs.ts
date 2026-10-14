import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/ia/yjs',
    categories: ['university'],
    example: '/cas/ia/yjs',
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
            source: ['www.ia.cas.cn/yjsjy/zs/sszs', 'www.ia.cas.cn/'],
        },
    ],
    name: '自动化所',
    maintainers: ['shengmaosu'],
    handler,
    url: 'www.ia.cas.cn/yjsjy/zs/sszs',
};

async function handler() {
    const link = 'http://www.ia.cas.cn/yjsjy/zs/sszs/';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('#content li');

    return {
        title: '中科院自动化所',
        link,
        description: '中科院自动化所通知公告',
        item: list.toArray().map((item) => {
            const $item = $(item);
            const a = $item.find('a');
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, link).href,
                pubDate: timezone(parseDate($item.find('.data-s').text(), 'YYYY-MM-DD'), 8),
            };
        }),
    };
}
