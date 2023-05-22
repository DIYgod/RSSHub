const { getSimple, getDetails, getTorrents } = require('./util');

module.exports = async (ctx) => {
    const { keyword, mode } = ctx.params;

    const url = `https://nhentai.net/search/?q=${keyword}`;

    const simples = await getSimple(url);

    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 5;
    let items = simples;
    if (mode === 'detail') {
        items = await getDetails(ctx.cache, simples, limit);
    } else if (mode === 'torrent') {
        items = await getTorrents(ctx.cache, simples, limit);
    }

    ctx.state.data = {
        title: `nhentai - search - ${keyword}`,
        link: url,
        item: items,
    };
};
