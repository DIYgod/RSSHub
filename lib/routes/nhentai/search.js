const { getSimple, getDetails, getTorrents } = require('./util');

module.exports = async (ctx) => {
    const { keyword, mode } = ctx.params;

    const url = `https://nhentai.net/search/?q=${keyword}`;

    const simples = await getSimple(url);

    ctx.state.data = {
        title: `nHentai - search - ${keyword}`,
        link: url,
        description: 'hentai',
        item: mode === 'detail' ? await getDetails(ctx.cache, simples) : mode === 'torrent' ? await getTorrents(ctx.cache, simples) : simples,
    };
};
