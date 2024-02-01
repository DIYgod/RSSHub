const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const limit = ctx.params.limit || 24;
    const items = [];
    let currPage = 1;
    do {
        const url = `https://www.nicesss.com/page/${currPage}`;
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
        title: '呦糖社 - 首页',
        link: 'https://www.nicesss.com/',
        description: '呦糖社 - 首页',
        image: 'https://www.nicesss.com/wp-content/themes/ripro/assets/images/logo/logo-light.png',
        icon: 'https://www.nicesss.com/wp-content/themes/ripro/assets/images/favicon/favicon.png',
        logo: 'https://www.nicesss.com/wp-content/themes/ripro/assets/images/favicon/favicon.png',
        item: items.slice(0, limit),
    };
};
