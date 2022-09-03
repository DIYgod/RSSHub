const got = require('@/utils/got');
const utils = require('./utils');

module.exports = async (ctx) => {
    const apiUrl = 'https://www.infoq.cn/public/v1/my/recommond';
    const pageUrl = 'https://www.infoq.cn';

    const resp = await got.post(apiUrl, {
        headers: {
            Referer: pageUrl,
        },
        json: {
            size: ctx.query.limit ? Number(ctx.query.limit) : 30,
        },
    });

    const data = resp.data.data;
    const items = await utils.ProcessFeed(data, ctx.cache);

    ctx.state.data = {
        title: 'InfoQ 推荐',
        link: pageUrl,
        item: items,
    };
};
