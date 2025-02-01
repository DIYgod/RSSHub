import { Route } from '@/types';
import cache from '@/utils/cache';
import EhAPI from './ehapi';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import { queryToBoolean } from '@/utils/readable-social';

export const route: Route = {
    path: '/favorites/:favcat?/:order?/:page?/:bittorrent?',
    categories: ['picture'],
    example: '/ehentai/favorites/0/posted/0/1',
    parameters: {
        favcat: 'Favorites folder number',
        order: '`posted`(Sort by gallery release time) , `favorited`(Sort by time added to favorites)',
        page: 'Page number',
        bittorrent: 'Whether include a link to the latest torrent, default to false, Accepted keys: 0/1/true/false',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: true,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Favorites',
    maintainers: ['yindaheng98', 'syrinka'],
    handler,
};

async function handler(ctx) {
    if (!EhAPI.has_cookie) {
        throw new ConfigNotFoundError('Ehentai favorites RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }
    const favcat = ctx.req.param('favcat') ? Number.parseInt(ctx.req.param('favcat')) : 0;
    const page = ctx.req.param('page');
    const bittorrent = queryToBoolean(ctx.req.param('bittorrent') || 'false');
    const inline_set = ctx.req.param('order') === 'posted' ? 'fs_p' : 'fs_f';
    const items = await EhAPI.getFavoritesItems(cache, favcat, inline_set, page, bittorrent);

    return EhAPI.from_ex
        ? {
              title: 'ExHentai Favorites',
              link: `https://exhentai.org/favorites.php?favcat=${favcat}&inline_set=${inline_set}`,
              item: items,
          }
        : {
              title: 'E-Hentai Favorites',
              link: `https://e-hentai.org/favorites.php?favcat=${favcat}&inline_set=${inline_set}`,
              item: items,
          };
}
