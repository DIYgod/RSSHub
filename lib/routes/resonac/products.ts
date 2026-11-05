import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
// import { parseDate } from '@/utils/parse-date';
// import timezone from '@/utils/timezone';

const baseUrl = 'https://www.resonac.com';
const host = 'https://www.resonac.com/products?intcid=glnavi_products';

export const route: Route = {
    path: '/products',
    categories: ['other'],
    example: '/resonac/products',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Products',
    maintainers: ['valuex'],
    handler,
    description: '',
};

async function handler() {
    const response = await got(host);
    const pageHtml = response.data;
    const $ = load(pageHtml);
    const groupLists = $('main .m-panel-card-02__item a[href^="/products/"]')
        .toArray()
        .map((el) => ({
            groupName: $('.m-panel-card-02__title', el).text().trim(),
            groupURL: new URL($(el).attr('href')!, baseUrl).href,
        }));

    const lists = await pMap(
        groupLists,
        async (productGroup) => {
            const products = await cache.tryGet(`resonac:product-list:v1:${productGroup.groupURL}`, async () => {
                const strUrl = productGroup.groupURL;
                const response = await got(strUrl);
                const $ = load(response.data);
                const item = $('dt.m-toggle__title div span a')
                    .toArray()
                    .map((el): DataItem => ({
                        title: $('b', el).text().trim(),
                        link: baseUrl + $(el).attr('href'),
                    }));
                return item;
            });
            return products.map((item) => ({ ...item, category: [productGroup.groupName] }));
        },
        { concurrency: 3 }
    );

    const fullList = new Map(lists.flat().map((item) => [item.link, item])).values().toArray();
    // fullList = fullList.filter((item) => item.title !== 'Empty');

    const items = await pMap(
        fullList,
        async (item) => {
            const description = await cache.tryGet(`resonac:product-body:v1:${item.link}`, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                return $('main div.str-section').html();
            });
            return { ...item, description };
        },
        { concurrency: 3 }
    );

    return {
        title: 'Resonac_Products',
        link: baseUrl,
        description: 'Resonac_Products',
        item: items,
    };
}
