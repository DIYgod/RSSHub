const EhAPI = require('./ehapi');

module.exports = async (ctx) => {
    if (!EhAPI.has_cookie) {
        throw 'Ehentai favorites RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>';
    }
    const favcat = ctx.params.favcat ? parseInt(ctx.params.favcat) : 0;
    const page = ctx.params.page;
    const routeParams = new URLSearchParams(ctx.params.routeParams);
    const bittorrent = routeParams.get('bittorrent') || false;
    const embed_thumb = routeParams.get('embed_thumb') || false;
    const inline_set = ctx.params.order === 'posted' ? 'fs_p' : 'fs_f';
    const items = await EhAPI.getFavoritesItems(ctx.cache, favcat, inline_set, page, bittorrent, embed_thumb);

    if (EhAPI.from_ex) {
        ctx.state.data = {
            title: 'ExHentai Favorites',
            link: `https://exhentai.org/favorites.php?favcat=${favcat}&inline_set=${inline_set}`,
            item: items,
        };
    } else {
        ctx.state.data = {
            title: 'E-Hentai Favorites',
            link: `https://e-hentai.org/favorites.php?favcat=${favcat}&inline_set=${inline_set}`,
            item: items,
        };
    }
};
