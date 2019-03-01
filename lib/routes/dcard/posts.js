const axios = require('../../utils/axios');
const utils = require('./utils');

module.exports = async (ctx) => {
    const type = ctx.params.type || 'latest';

    const response = await axios({
        method: 'get',
        url: `https://www.dcard.tw/_api/posts?popular=${type === 'popular' ? 'true' : 'false'}&limit=30`,
        headers: {
            Referer: `https://www.dcard.tw/f?latest=${type === 'popular' ? 'false' : 'true'}`,
        },
    });

    const data = response.data;
    console.log(`https://www.dcard.tw/_api/posts?popular=${type === 'popular' ? 'true' : 'false'}&limit=30`, `https://www.dcard.tw/f?latest=${type === 'popular' ? 'false' : 'true'}`);

    ctx.state.data = {
        title: `Dcard ${type === 'popular' ? '熱門' : '最新'}`,
        link: 'https://www.dcard.tw',
        description: '不想錯過任何有趣的話題嗎？趕快加入我們吧！',
        item: await utils.ProcessFeed(data, ctx.cache),
    };
};
