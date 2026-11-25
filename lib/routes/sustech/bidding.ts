import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/bidding',
    categories: ['university'],
    example: '/sustech/bidding',
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
            source: ['biddingoffice.sustech.edu.cn/'],
        },
    ],
    name: '采购与招标管理部',
    maintainers: ['sparkcyf'],
    handler,
    url: 'biddingoffice.sustech.edu.cn/',
};

async function handler() {
    const link = 'http://biddingoffice.sustech.edu.cn';
    const response = await got({
        method: 'get',
        url: link,
    });

    const data = response.data;

    const $ = load(data);

    const list: Array<DataItem & { link: string }> = $('.index-wrap.index-2 ul li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('li > a');
            return { pubDate: parseDate($item.find('li > span').text(), 8), title: a.text(), link: `${link}${a.attr('href')}` };
        });
    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const content = load(response.data);
                return { description: content('.detail-wrap .text-wrap').html() };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    return { title: '南方科技大学采购与招标管理部', link, item: items };
}
