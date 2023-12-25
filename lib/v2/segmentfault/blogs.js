const got = require('@/utils/got');
const { host, acw_sc__v2, parseList, parseItems } = require('./utils');

module.exports = async (ctx) => {
    const { tag } = ctx.params;
    const apiURL = `${host}/gateway/tag/${tag}/articles?loadMoreType=pagination&initData=true&page=1&sort=newest&pageSize=30`;
    const response = await got(apiURL);
    const data = response.data.rows;

    const list = parseList(data);

    const acwScV2Cookie = await acw_sc__v2(list[0].link, ctx.cache.tryGet);

    const items = await Promise.all(list.map((item) => parseItems(acwScV2Cookie, item, ctx.cache.tryGet)));

    ctx.state.data = {
        title: `segmentfault-Blogs-${tag}`,
        link: `${host}/t/${tag}/blogs`,
        item: items,
    };
};
