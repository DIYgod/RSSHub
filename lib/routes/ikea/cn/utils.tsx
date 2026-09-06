import { renderToString } from 'hono/jsx/dom/server';

import md5 from '@/utils/md5';

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
        description: renderToString(
            <>
                <p>名称：{name}</p>
                <p>类型：{productType}</p>
                <p>尺寸：{measureText}</p>
                {isFamilyOffer ? (
                    <>
                        <p>会员价格：\u00A5{currentPrice}</p>
                        <p>非会员价格：\u00A5{originalPrice}</p>
                    </>
                ) : (
                    <p>价格：\u00A5{currentPrice}</p>
                )}
                <p>
                    {images.map((image) => (
                        <img src={image.url} />
                    ))}
                </p>
            </>
        ),
        link: `https://www.ikea.cn/cn/zh/p/${productFullId}`,
    };
};

export { generateProductItem, generateRequestHeaders };
