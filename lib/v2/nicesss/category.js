const utils = require('./utils');

module.exports = async (ctx) => {
    const paramCategory = decodeURIComponent(ctx.params.category);
    let category = '';
    const limit = ctx.params.limit || 20;
    const items = [];

    switch (paramCategory) {
        case '秀人':
        case '秀人网':
        case 'XiuRen':
            category = 'xr';
            break;
        case '韩国':
        case '韩国美女':
        case '韩国美女写真':
        case '秘境':
            category = 'mij';
            break;
        case '丝袜':
        case '丝袜美女':
        case '丝袜美女写真':
        case '丝真':
            category = 'siz';
            break;
        case '热门':
        case '热门美女':
        case '热门美女写真':
        case '热站':
            category = 'rez';
            break;
        case '私影':
            category = '私影';
            break;
        case 'cos':
        case 'Cos':
        case 'cosplay':
        case 'Cosplay':
            category = 'cosplya';
            break;
        default:
            category = 'xr';
            break;
    }

    let pages = Math.ceil(limit / 20);
    pages = pages > 10 ? 10 : pages;
    const urls = Array.from({ length: pages }, (_, i) => `https://www.nicesss.com/${category}/page/${i + 1}`);

    try {
        const itemPromises = urls.map((url) => utils.ProcessUrl(url, ctx));
        const allItems = await Promise.all(itemPromises);
        items.push(...allItems.flat());
    } catch (error) {
        throw new Error(error);
    }

    ctx.state.data = {
        title: `呦糖社 - “${paramCategory}”Category结果`,
        link: `https://www.nicesss.com/${category}`,
        description: `呦糖社 - “${paramCategory}”Category结果`,
        image: 'https://www.nicesss.com/wp-content/themes/ripro/assets/images/logo/logo-light.png',
        icon: 'https://www.nicesss.com/wp-content/themes/ripro/assets/images/favicon/favicon.png',
        logo: 'https://www.nicesss.com/wp-content/themes/ripro/assets/images/favicon/favicon.png',
        item: items.slice(0, limit),
    };
};
