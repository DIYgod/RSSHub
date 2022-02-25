const EhAPI = require('./ehapi');

module.exports = async (ctx) => {
    if (!EhAPI.has_cookie) {
        throw 'Ehentai favorites RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>';
    }
    const favcat = ctx.params.favcat ? parseInt(ctx.params.favcat) : 0;
    const page = ctx.params.page ? parseInt(ctx.params.page) : 0;
    const bittorrent = ctx.params.bittorrent || false;
    const inline_set = ctx.params.order === 'posted' ? 'fs_p' : 'fs_f';
    const items = await EhAPI.getFavoritesItems(ctx.cache, page, favcat, inline_set, bittorrent);

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
