const got = require('@/utils/got');
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
    } else if (type === 'latest' || !type) {
        link += '?latest=true';
        api += '?popular=false';
        title += '最新';
    }

    const response = await got({
        method: 'get',
        url: `${api}&limit=30`,
        headers: {
            Referer: link,
        },
    });

    const items = await utils.ProcessFeed(response.data, ctx.cache);

    ctx.state.data = {
        title,
        link,
        description: '不想錯過任何有趣的話題嗎？趕快加入我們吧！',
        item: items,
    };
};
