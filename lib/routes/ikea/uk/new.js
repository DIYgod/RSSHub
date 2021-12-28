const got = require('@/utils/got');

module.exports = async (ctx) => {
    const link = 'https://www.ikea.com/gb/en/news/product-news-gallery/';

    const count = (await got.get('https://sik.search.blue.cdtapps.com/gb/en/product-list-page?category=products&f-toggles2=new_product')).data.productListPage.productCount;

    const products = (await got.get(`http://sik.search.blue.cdtapps.com/gb/en/product-list-page/more-products?category=products&start=1&end=${count}`)).data.moreProducts.productWindow;

    ctx.state.data = {
        title: 'IKEA UK - New Products',
        link,
        description: 'New products released by IKEA UK.',
        item: products.map((p) => ({
            title: `${p.name} ${p.typeName} ${p.itemMeasureReferenceText}`,
            description: `<img src="${p.mainImageUrl}">`,
            link: p.pipUrl,
        })),
    };
};
