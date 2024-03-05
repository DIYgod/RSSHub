// @ts-nocheck
import got from '@/utils/got';
const { generateRequestHeaders, generateProductItem } = require('./utils');

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

export default async (ctx) => {
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

    ctx.set('data', {
        title: 'IKEA 宜家 - 当季新品推荐',
        link: 'https://www.ikea.cn/cn/zh/new/',
        description: '当季新品推荐',
        item: products.map((element) => generateProductItem(element)),
    });
};
