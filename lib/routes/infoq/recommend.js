const axios = require('../../utils/axios');
const utils = require('./utils');

module.exports = async (ctx) => {
    const apiUrl = 'https://www.infoq.cn/public/v1/my/recommond';
    const pageUrl = 'https://www.infoq.cn';

    const resp = await axios({
        method: 'post',
        url: apiUrl,
        headers: {
            Referer: pageUrl,
            'Content-Type': 'application/json',
        },
        data: {
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
