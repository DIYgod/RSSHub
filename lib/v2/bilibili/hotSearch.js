const got = require('@/utils/got');
const cache = require('./cache');
const utils = require('./utils');

module.exports = async (ctx) => {
    const verifyString = await cache.getVerifyString(ctx);
    const params = utils.addVerifyInfo('limit=10&platform=web', verifyString);
    const url = `https://api.bilibili.com/x/web-interface/wbi/search/square?${params}`;
    const response = await got({
        method: 'get',
        url,
        headers: {
            Referer: `https://api.bilibili.com`,
        },
    });
    const trending = response?.data?.data?.trending;
    const title = trending?.title;
    const list = trending?.list || [];
    ctx.state.data = {
        title,
        link: url,
        description: 'bilibili热搜',
        item: list.map((item) => ({
            title: item.keyword,
            description: `${item.keyword}<br>${item.icon ? `<img src="${item.icon}">` : ''}`,
            link: item.link || item.goto || `https://search.bilibili.com/all?${new URLSearchParams({ keyword: item.keyword })}&from_source=webtop_search`,
        })),
    };
};
