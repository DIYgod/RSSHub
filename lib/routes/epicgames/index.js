const logger = require('@/utils/logger');
const got = require('@/utils/got');

const supportedList = require('./supportedList');

module.exports = async (ctx) => {
    // 获取用户传递进来的参数。
    // 此处 supportedList.js 文件中的可选项 collection 值只有"freegames"可选
    const collection = ctx.params.collection;

    const config = supportedList[collection.toLowerCase()];

    const desc = 'Epic 游戏限免';

    const link = config.link;
    const homeLink = config.homeLink;
    const content = config.jsonData;

    const response = await got({
        method: 'post',
        url: link,
        headers: {
            Referer: homeLink,
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': content.length,
        },
        data: content,
    });

    const data = response.data.data;

    let item = new Map();
    const out = new Array();
    let notHaveImageUrl = true;
    data.Catalog.searchStore.elements.map((element) => {
        try {
            if (element.promotions.promotionalOffers.length !== 0) {
                element.promotions.promotionalOffers.forEach((isPromotionalOffer) => {
                    if (isPromotionalOffer.promotionalOffers.length !== 0) {
                        isPromotionalOffer.promotionalOffers.forEach((havePromotionalOffer) => {
                            if (havePromotionalOffer.discountSetting.discountType === 'PERCENTAGE' && havePromotionalOffer.discountSetting.discountPercentage === 0) {
                                item = {
                                    title: element.title,
                                    link: `https://www.epicgames.com/store/zh-CN/product/${element.productSlug}`,
                                    pubDate: new Date(havePromotionalOffer.startDate).toUTCString(),
                                };
                            }
                            if (element.keyImages.length !== 0) {
                                element.keyImages.forEach((imageUrl) => {
                                    if (imageUrl.type === 'DieselStoreFrontWide') {
                                        item.description = `${element.description}<br><img src="${imageUrl.url}">`;
                                        notHaveImageUrl = false;
                                    }
                                });
                            }
                            if (notHaveImageUrl) {
                                item.description = element.description;
                            }
                        });
                    }
                });
                // 上述代码会将折扣游戏也抓取，但不会抓取折扣游戏的title
                if (item.title) {
                    out.push(item);
                }
                item = {};
            }
            return true;
        } catch (warn) {
            logger.warn(element.title + '\t==> Parse Error Info:\n' + warn);
            return false;
        }
    });
    // out.pop(undefined);

    ctx.state.data = {
        title: desc,
        link: homeLink,
        description: desc,
        item: out,
    };
};
