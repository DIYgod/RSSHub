import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

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
        .flatMap((item) => {
            const $item = $(item);
            const itemPubdate = $item.find('li > span').text();
            const a = $item.find('li > a');
            const href = a.attr('href');
            const title = a.text();
            return href && title ? { pubDate: itemPubdate ? parseDateInTimezone(itemPubdate, 8) : undefined, title, link: new URL(href, link).href } : [];
        });
    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const content = load(response.data);
                const description = content('.detail-wrap .text-wrap').html();
                if (!description) {
                    throw new Error(`The tender page has no public article content: ${item.link}`);
                }
                return { description };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    return { title: '南方科技大学采购与招标管理部', link, item: items };
}
