const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://api.tanwuapp.com/iOS/2.0.0/products?rentType=0&pageSize=1000&pageNum=1&clientType=web:h5',
    });

    const data = response.data.details.allProductList.data;

    ctx.state.data = {
        title: '探物',
        link: 'https://m.tanwuapp.com',
        description: '探物是一个科技数码产品租赁平台，旨在把市面上最新、最酷、最实用的科技产品带去给用户，传播科技便捷生活、共享丰富生活的价值理念。',
        item: data.map(({ productName, productImageSrc, productRent, rentUnit, productId, appraiseAvgScore }) => ({
            title: productName,
            link: `https://m.tanwuapp.com/?source=mobile#/productDetails?productId=${productId}`,
            description: `
          <img src="${productImageSrc}"><br>
          <strong>${productName}</strong><br><br>
          价格: ￥${productRent} / ${rentUnit}<br>
          评分: ${appraiseAvgScore}
        `,
            guid: productId,
        })),
    };
};
