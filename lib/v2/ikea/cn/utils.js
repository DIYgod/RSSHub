const { art } = require('@/utils/render');
const md5 = require('@/utils/md5');
const path = require('path');

const generateRequestHeaders = () => {
    const now = Math.round(new Date().getTime() / 1000);
    return {
        'X-Client-Platform': 'WechatMiniprogram',
        'X-Client-DeviceId': md5(now.toString()),
    };
};

const generateProductItem = (product) => {
    const {
        productFullId,
        name,
        productType,
        measureText,
        priceDisplay: { currentPrice, originalPrice },
        images,
    } = product;
    const isFamilyOffer = currentPrice && originalPrice;

    return {
        title: `${name} ${productType} - \u{000A5}${currentPrice}`,
        description: art(path.join(__dirname, '../templates/cn/product.art'), {
            isFamilyOffer,
            name,
            productType,
            measureText,
            currentPrice,
            originalPrice,
            images: images.map((image) => image.url),
        }),
        link: `https://www.ikea.cn/cn/zh/p/${productFullId}`,
    };
};

module.exports = {
    generateRequestHeaders,
    generateProductItem,
};
