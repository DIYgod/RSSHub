const EhAPI = require('./ehapi');

module.exports = async (ctx) => {
    const page = ctx.params.page ? parseInt(ctx.params.page) : 0;
    const tag = ctx.params.tag;
    const bittorrent = ctx.params.bittorrent || false;
    const items = await EhAPI.getTagItems(ctx.cache, tag, page, bittorrent);
    ctx.state.data = {
        title: 'E-Hentai Search',
        link: `https://e-hentai.org/tag/${tag}`,
        item: items,
    };
};
