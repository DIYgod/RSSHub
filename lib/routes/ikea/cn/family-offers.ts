// @ts-nocheck
import got from '@/utils/got';
const { generateProductItem } = require('./utils');

const familyPriceProductsRequest = ({ pageIndex = 1 }) =>
    got({
        method: 'post',
        url: 'https://www.ikea.cn/api-host/search/prod/advanced/special',
        headers: {
            'X-Client-Platform': 'PcWeb',
        },
        json: {
            contentType: 'PRODUCT,CONTENT,PLANNER',
            filters: {
                filters: {},
                sortOption: 'RELEVANCE',
            },
            pageIndex,
            pageSize: 25,
            pageType: '',
            queryContent: 'family_price',
        },
    });

const productRequest = async (productIds) => {
    const response = await got({
        url: 'https://www.ikea.cn/api-host/content/products',
        headers: {
            'X-Client-Platform': 'PcWeb',
        },
        searchParams: new URLSearchParams(productIds),
    });
    return response.data;
};

export default async (ctx) => {
    const familyPriceProductIds = [];
    const productRequests = [];

    const familyPriceProductsLoadMore = async ({ pageIndex }) => {
        const response = await familyPriceProductsRequest({ pageIndex });
        const {
            data: { productPage, products },
        } = response.data;

        for (const { id } of products) {
            familyPriceProductIds.push(['ids', id]);
        }

        if (productPage.end < productPage.total) {
            await familyPriceProductsLoadMore({ pageIndex: pageIndex + 1 });
        }
        return;
    };

    await familyPriceProductsLoadMore({ pageIndex: 1 });

    while (familyPriceProductIds.length) {
        productRequests.push(productRequest(familyPriceProductIds.splice(0, 25)));
    }

    const productResponses = await Promise.all(productRequests);
    const products = productResponses.flat();

    ctx.set('data', {
        title: 'IKEA 宜家 - 会员特惠',
        link: 'https://www.ikea.cn/cn/zh/offers/family-offers/',
        description: '会员特惠',
        item: products.map((element) => generateProductItem(element)),
    });
};
