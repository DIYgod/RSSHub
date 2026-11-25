import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';
import { isOnSite } from '@/utils/valid-host';

export const route: Route = {
    path: '/goutongjiaoliu',
    categories: ['finance'],
    example: '/gov/pbc/goutongjiaoliu',
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
            source: ['pbc.gov.cn/goutongjiaoliu/113456/113469/index.html'],
        },
    ],
    name: '沟通交流',
    maintainers: ['nczitzk'],
    handler,
    url: 'pbc.gov.cn/goutongjiaoliu/113456/113469/index.html',
};

async function handler() {
    const link = 'http://www.pbc.gov.cn/goutongjiaoliu/113456/113469/index.html';
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
                item.pubDate = parseDate(content('.hui12').eq(5).text(), 8);
                return item;
            });
        },
        { concurrency: 1 }
    );
    return {
        title: '中国人民银行 - 沟通交流',
        link,
        item: items,
    };
}
