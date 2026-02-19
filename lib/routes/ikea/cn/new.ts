import type { Route } from '@/types';
import got from '@/utils/got';

import { generateProductItem, generateRequestHeaders } from './utils';

const request = ({ moreToken = '' }) =>
    got({
        method: 'post',
        url: 'https://srv-mp.app.ikea.cn/content/search/products/advanced',
        headers: generateRequestHeaders(),
        searchParams: {
            keyword: '新品',
            moreToken,
        },
        json: {},
    });

export const route: Route = {
    path: '/cn/new',
    categories: ['shopping'],
    example: '/ikea/cn/new',
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
            source: ['ikea.cn/cn/zh/new/', 'ikea.cn/'],
        },
    ],
    name: '中国 - 当季新品推荐',
    maintainers: ['jzhangdev'],
    handler,
    url: 'ikea.cn/cn/zh/new/',
};

async function handler() {
    const allProductSummaries = [];

    const loadMoreRequest = async ({ moreToken }) => {
        const response = await request({ moreToken });
        const { data } = response;
        allProductSummaries.push(data.productSummaries);
        if (data.moreToken) {
            await loadMoreRequest({ moreToken: data.moreToken });
        }
        return;
    };

    await loadMoreRequest({});

    const products = allProductSummaries.flat();

    return {
        title: 'IKEA 宜家 - 当季新品推荐',
        link: 'https://www.ikea.cn/cn/zh/new/',
        description: '当季新品推荐',
        item: products.map((element) => generateProductItem(element)),
    };
}
