const got = require('@/utils/got');
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

module.exports = async (ctx) => {
    const allProductSummaries = [];

    const loadMoreRequest = async ({ moreToken }) => {
        const response = await request({ moreToken });
        const { data } = response;
        allProductSummaries.push(data.productSummaries);
        if (data.moreToken) {
            await loadMoreRequest({ moreToken: data.moreToken });
        }
        return Promise.resolve();
    };

    await loadMoreRequest({});

    const products = allProductSummaries.flat();

    ctx.state.data = {
        title: 'IKEA 宜家 - 当季新品推荐',
        link: 'https://www.ikea.cn/cn/zh/new/',
        description: '当季新品推荐',
        item: products.map(generateProductItem),
    };
};
