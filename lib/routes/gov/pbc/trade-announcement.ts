import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';
import { isOnSite } from '@/utils/valid-host';

export const route: Route = {
    path: '/tradeAnnouncement',
    categories: ['finance'],
    example: '/gov/pbc/tradeAnnouncement',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '货币政策司公开市场交易公告',
    maintainers: ['nczitzk'],
    handler,
};

async function handler() {
    const link = 'https://www.pbc.gov.cn/zhengcehuobisi/125207/125213/125431/125475/index.html';
    const response = await ofetch(link);
    const $ = load(response);
    const list = $('font.newslist_style')
        .toArray()
        .map((item): DataItem => {
            const a = $(item).find('a[title]');
            return {
                title: a.attr('title')!,
                link: new URL(a.attr('href')!, 'http://www.pbc.gov.cn').href,
            };
        });
    const items = await pMap(
        list,
        (item) => {
            // only follow links on the site itself
            if (!isOnSite(item.link, 'pbc.gov.cn')) {
                return item;
            }
            return cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);
                item.description = content('#zoom').html();
                item.pubDate = parseDate(content('#shijian').text(), 8);
                return item;
            });
        },
        { concurrency: 1 }
    );
    return {
        title: '中国人民银行 - 货币政策司公开市场交易公告',
        link,
        item: items,
    };
}
