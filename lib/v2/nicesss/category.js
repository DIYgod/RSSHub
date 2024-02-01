const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    let category = decodeURIComponent(ctx.params.category);
    const limit = ctx.params.limit || 20;
    const items = [];
    let currPage = 1;

    switch (category) {
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

    do {
        const url = `https://www.nicesss.com/${category}/page/${currPage}`;
        try {
            // eslint-disable-next-line no-await-in-loop
            const { data: response } = await got(url);
            const content = cheerio.load(response);
            // eslint-disable-next-line no-await-in-loop
            const newItems = await utils.ProcessItems(ctx, content);
            items.push(...newItems);
        } catch {
            break;
        }
    } while (items.length < limit && currPage++ < 10);

    ctx.state.data = {
        title: `呦糖社 - “${category}”Category结果`,
        link: `https://www.nicesss.com/${category}`,
        description: `呦糖社 - “${category}”Category结果`,
        image: 'https://www.nicesss.com/wp-content/themes/ripro/assets/images/logo/logo-light.png',
        icon: 'https://www.nicesss.com/wp-content/themes/ripro/assets/images/favicon/favicon.png',
        logo: 'https://www.nicesss.com/wp-content/themes/ripro/assets/images/favicon/favicon.png',
        item: items.slice(0, limit),
    };
};
