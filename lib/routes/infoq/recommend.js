const got = require('@/utils/got');
const utils = require('./utils');

module.exports = async (ctx) => {
    const apiUrl = 'https://www.infoq.cn/public/v1/my/recommond';
    const pageUrl = 'https://www.infoq.cn';

    const resp = await got({
        method: 'post',
        url: apiUrl,
        headers: {
            Referer: pageUrl,
        },
        json: {
            size: 5,
        },
    });

    const data = resp.data.data;
    const items = await utils.ProcessFeed(data, ctx.cache);

    ctx.state.data = {
        title: 'InfoQ推荐',
        link: pageUrl,
        description: 'InfoQ推荐',
        item: items,
    };
};
