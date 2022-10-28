const got = require('@/utils/got');
const util = require('./util');

module.exports = async (ctx) => {
    const base_url = 'https://gocn.vip/topics';
    const api_url = 'https://gocn.vip/apiv3/topic/list?currentPage=1&cate2Id=0&grade=new';

    const response = await got({
        url: api_url,
        headers: {
            Referer: base_url,
        },
    });

    const list = response.data.data.list;

    ctx.state.data = {
        title: `GoCN社区-文章`,
        link: base_url,
        description: `获取GoCN站点最新文章`,
        item: await Promise.all(list.map(async (item) => await ctx.cache.tryGet(`${base_url}/${item.guid}`, () => util.getFeedItem(item)))),
    };
};
