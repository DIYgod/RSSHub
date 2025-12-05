import path from 'node:path';

import md5 from '@/utils/md5';
import { art } from '@/utils/render';

const generateRequestHeaders = () => {
    const now = Math.round(Date.now() / 1000);
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

export { generateProductItem, generateRequestHeaders };
