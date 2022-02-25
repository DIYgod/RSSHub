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
    let title = params;
    const match = /f_search=([^&]+)/.exec(title);
    if (match !== null) {
        title = match[1];
    }

    if (EhAPI.from_ex) {
        ctx.state.data = {
            title: title + ' - ExHentai Search ',
            link: `https://exhentai.org/?${params}`,
            item: items,
        };
    } else {
        ctx.state.data = {
            title: title + ' - E-Hentai Search ',
            link: `https://e-hentai.org/?${params}`,
            item: items,
        };
    }
};
