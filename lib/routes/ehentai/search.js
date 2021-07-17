const EhAPI = require('./ehapi');

module.exports = async (ctx) => {
    const page = ctx.params.page;
    let params = ctx.params.params;
    const bittorrent = ctx.params.bittorrent || false;
    let items;
    if (page) {
        // 如果定义了page，就要覆盖params
        params = params.replace(/&*page=[^&]$/, '').replace(/page=[^&]&/, '');
        items = await EhAPI.getSearchItems(ctx.cache, params, parseInt(page), bittorrent);
    } else {
        items = await EhAPI.getSearchItems(ctx.cache, params, undefined, bittorrent);
    }
    ctx.state.data = {
        title: 'E-Hentai Search',
        link: `https://e-hentai.org/?${params}`,
        item: items,
    };
};
