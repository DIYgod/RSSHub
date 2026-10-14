import { config } from '@/config';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import type { AnnouncementCatalog } from './types';

export const route: Route = {
    path: '/launchpool',
    categories: ['finance'],
    example: '/binance/launchpool',
    radar: [
        {
            source: ['binance.com/:lang/support/announcement'],
        },
    ],
    name: '数字货币及交易对上新',
    maintainers: ['zhenlohuang'],
    handler,
};

async function handler() {
    const baseUrl = 'https://www.binance.com/zh-CN/support/announcement';
    const url = `${baseUrl}/数字货币及交易对上新?c=48&navId=48`;

    const response = await ofetch<{ data: { catalogs: AnnouncementCatalog[] } | null }>('https://www.binance.com/bapi/apex/v1/public/apex/cms/article/list/query', {
        query: {
            type: 1,
            pageNo: 1,
            pageSize: 20,
            catalogId: 48,
        },
        headers: {
            Referer: 'https://www.binance.com/',
            'Accept-Language': 'zh-CN',
            'User-Agent': config.trueUA,
            lang: 'zh-CN',
        },
    });

    const articles = response.data?.catalogs.find((catalog) => catalog.catalogId === 48)?.articles.filter((article) => article.title.includes('币安新币挖矿上线')) ?? [];

    return {
        title: 'Binance | 数字货币及交易对上新',
        link: url,
        description: '数字货币及交易对上新',
        item: articles.map((item) => ({
            title: item.title,
            link: `${baseUrl}/${item.code}`,
            pubDate: parseDate(item.releaseDate),
        })),
    };
}
