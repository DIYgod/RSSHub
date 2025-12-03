import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/launchpool',
    categories: ['finance'],
    example: '/binance/launchpool',
    radar: [
        {
            source: ['binance.com/:lang/support/announcement'],
        },
    ],
    name: 'Binance数字货币及交易对上新',
    maintainers: ['zhenlohuang'],
    handler,
};

async function handler() {
    const baseUrl = 'https://www.binance.com/zh-CN/support/announcement';
    const url = `${baseUrl}/数字货币及交易对上新?c=48&navId=48`;

    const response = await got({
        url,
        headers: {
            Referer: 'https://www.binance.com/',
        },
    });

    const $ = load(response.data);
    const appData = JSON.parse($('#__APP_DATA').text());
    const articles = appData.appState.loader.dataByRouteId.d969.catalogs.find((catalog) => catalog.catalogId === 48).articles.filter((article) => article.title.includes('币安新币挖矿上线'));

    return {
        title: 'Binance | 数字货币及交易对上新',
        link: url,
        description: '数字货币及交易对上新',
        item: articles.map((item) => ({
            title: item.title,
            link: `${baseUrl}/${item.code}`,
            description: item.title,
            pubDate: parseDate(item.releaseDate),
        })),
    };
}
