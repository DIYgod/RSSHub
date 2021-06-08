const EhAPI = require('./ehapi')();

module.exports = async (ctx) => {
    const page = ctx.params.page ? parseInt(ctx.params.page) : 0;
    const tag = ctx.params.tag;
    const items = await EhAPI.getTagItems(tag, page);
    ctx.state.data = {
        title: 'E-Hentai Search',
        link: `https://e-hentai.org/tag/${tag}`,
        item: items,
    };
};
