// @ts-nocheck
import cache from '@/utils/cache';
const EhAPI = require('./ehapi');

export default async (ctx) => {
    if (!EhAPI.has_cookie) {
        throw new Error('Ehentai favorites RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
    }
    const favcat = ctx.req.param('favcat') ? Number.parseInt(ctx.req.param('favcat')) : 0;
    const page = ctx.req.param('page');
    const routeParams = new URLSearchParams(ctx.req.param('routeParams'));
    const bittorrent = routeParams.get('bittorrent') || false;
    const embed_thumb = routeParams.get('embed_thumb') || false;
    const inline_set = ctx.req.param('order') === 'posted' ? 'fs_p' : 'fs_f';
    const items = await EhAPI.getFavoritesItems(cache, favcat, inline_set, page, bittorrent, embed_thumb);

    ctx.set(
        'data',
        EhAPI.from_ex
            ? {
                  title: 'ExHentai Favorites',
                  link: `https://exhentai.org/favorites.php?favcat=${favcat}&inline_set=${inline_set}`,
                  item: items,
              }
            : {
                  title: 'E-Hentai Favorites',
                  link: `https://e-hentai.org/favorites.php?favcat=${favcat}&inline_set=${inline_set}`,
                  item: items,
              }
    );
};
