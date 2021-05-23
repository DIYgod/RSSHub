const got = require('@/utils/got');
const utils = require('./utils');

module.exports = async (ctx) => {
    const { keyword } = ctx.params;
    const url = `https://search-api.huxiu.com/api/article?platform=www&s=${encodeURIComponent(keyword)}&sort=&page=1&pagesize=20`;
    const link = 'https://www.huxiu.com';

    const response = await got({
        method: 'post',
        url,
        headers: {
            Referer: link,
        },
    });

    const list = response.data.data.datalist.slice(0, 10).map((d) => `${link}/article/${d.aid}.html`);

    const items = await utils.ProcessFeed(list, ctx.cache);

    const info = `虎嗅网 - ${keyword}`;
    ctx.state.data = {
        title: info,
        link,
        description: info,
        item: items,
    };
};
