const { getList, getDetailWithCache } = require('./util');

module.exports = async (ctx) => {
    const { keyword } = ctx.params;
    const list = await getList(`https://nhentai.net/search/?q=${keyword}`);
    const details = await Promise.all(list.map(getDetailWithCache.bind(null, ctx.cache)));

    ctx.state.data = {
        title: `nHentai - search - ${keyword}`,
        link: 'https://nhentai.net',
        description: 'hentai',
        item: details,
    };
};
