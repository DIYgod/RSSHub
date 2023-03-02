const got = require('@/utils/got');
const utils = require('./utils');

module.exports = async (ctx) => {
    const { keyword } = ctx.params;
    const url = `${utils.searchApi}/api/article`;
    const link = utils.baseUrl;

    const { data } = await got.post(url, {
        headers: {
            Referer: utils.baseUrl,
        },
        searchParams: {
            platform: 'www',
            s: keyword,
            sort: '',
            page: 1,
            pagesize: 20,
            appid: 'hx_search',
            ...utils.generateSignature(),
        },
    });

    const list = data.data.datalist.map((d) => ({
        title: d.title,
        link: d.url.includes('article') ? `${d.url}.html` : d.url,
        description: d.content,
        author: d.author,
    }));

    const items = await utils.ProcessFeed(list, ctx.cache);

    const info = `虎嗅网 - ${keyword}`;
    ctx.state.data = {
        title: info,
        link,
        description: info,
        item: items,
    };
};
