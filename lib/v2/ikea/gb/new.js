const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const link = 'https://www.ikea.com/gb/en/new/new-products/';

    const {
        data: { specialPage },
    } = await got('https://sik.search.blue.cdtapps.com/gb/en/special', {
        searchParams: {
            special: 'new_product',
            // size: 24,
            // 'subcategories-style': 'tree-navigation',
            // c: 'lf',
            // v: 20220826,
            // sort: 'RELEVANCE',
        },
    });

    const {
        data: {
            moreProducts: { productWindow },
        },
    } = await got('https://sik.search.blue.cdtapps.com/gb/en/special/more-products', {
        searchParams: {
            special: 'new_product',
            start: 24,
            end: specialPage.productCount,
            // 'subcategories-style': 'tree-navigation',
            // c: 'lf',
            // v: 20220826,
            // sort: 'RELEVANCE',
        },
    });

    const products = [...specialPage.productWindow, ...productWindow];

    const items = products.map((p) => ({
        title: `${p.name} ${p.typeName}, ${p.itemMeasureReferenceText}`,
        description: art(path.join(__dirname, '../templates/new.art'), {
            p,
        }),
        link: p.pipUrl,
        category: p.categoryPath.map((c) => c.name),
    }));

    ctx.state.data = {
        title: 'New Products - Browse All New Furniture & Home Decor  - IKEA',
        link,
        description: 'New products released by IKEA UK.',
        item: items,
    };
};
