const axios = require('../../utils/axios');
const utils = require('./utils');

module.exports = async (ctx) => {
    const { type, section = 'posts' } = ctx.params;

    let link = `https://www.dcard.tw/f`;

    let api = `https://www.dcard.tw/_api`;

    let title = `Dcard - `;

    if (section !== 'posts' && section !== 'popular' && section !== 'latest') {
        link += `/${section}`;
        api += `/forums/${section}`;
        title += `${section} - `;
    }

    api += `/posts`;

    if (type === 'popular') {
        link += '?latest=false';
        api += '?popular=true';
        title += '熱門';
    } else if (type === 'posts' || !type) {
        link += '?latest=true';
        api += '?popular=false';
        title += '最新';
    }

    const response = await axios({
        method: 'get',
        url: `${api}&limit=30`,
        headers: {
            Referer: link,
        },
    });

    const data = response.data;

    const items = await utils.ProcessFeed(data, ctx.cache);

    ctx.state.data = {
        title,
        link,
        description: '不想錯過任何有趣的話題嗎？趕快加入我們吧！',
        item: items,
    };
};
