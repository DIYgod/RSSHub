const EhAPI = require('./ehapi')();

module.exports = async (ctx) => {
    const favcat = ctx.params.favcat ? parseInt(ctx.params.favcat) : 0;
    const page = ctx.params.page ? parseInt(ctx.params.page) : 0;
    const inline_set = ctx.params.order === 'posted' ? 'fs_p' : 'fs_f';
    const items = await EhAPI.getFavoritesItems(page, favcat, inline_set);

    ctx.state.data = {
        title: 'E-Hentai Favorites',
        link: `https://e-hentai.org/favorites.php?favcat=${favcat}&inline_set=${inline_set}`,
        item: items,
    };
};
