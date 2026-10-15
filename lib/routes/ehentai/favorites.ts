import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import { queryToBoolean } from '@/utils/readable-social';

import EhAPI from './ehapi';

export const route: Route = {
    path: '/favorites/:favcat?/:order?/:page?/:routeParams?',
    categories: ['picture'],
    example: '/ehentai/favorites/0/posted/0/bittorrent=true&embed_thumb=false',
    parameters: {
        favcat: 'Favorites folder number',
        order: '`posted`(Sort by gallery release time) , `favorited`(Sort by time added to favorites)',
        page: 'Compatibility parameter: omit it or use 0 for the latest first page; other values are unsupported',
        routeParams: 'Additional parameters, see the table above',
    },
    features: {
        requireConfig: [
            { name: 'EH_IPB_MEMBER_ID', description: 'E-Hentai member ID for the favorites account' },
            { name: 'EH_IPB_PASS_HASH', description: 'E-Hentai account session password hash' },
            { name: 'EH_SK', description: 'E-Hentai account session key' },
        ],
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: true,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    name: 'Favorites',
    maintainers: ['yindaheng98', 'syrinka'],
    handler,
};

async function handler(ctx) {
    if (!EhAPI.hasCookie) {
        throw new ConfigNotFoundError('E-Hentai favorites require EH_IPB_MEMBER_ID, EH_IPB_PASS_HASH, and EH_SK. Configure the favorites account before using this route.');
    }
    const favcat = ctx.req.param('favcat') ? Number.parseInt(ctx.req.param('favcat')) : 0;
    const page = ctx.req.param('page');
    const routeParams = new URLSearchParams(ctx.req.param('routeParams'));
    const bittorrent = queryToBoolean(routeParams.get('bittorrent')) ?? false;
    const embedThumb = queryToBoolean(routeParams.get('embed_thumb')) ?? false;
    const inlineSet = ctx.req.param('order') === 'posted' ? 'fs_p' : 'fs_f';
    const items = await EhAPI.getFavoritesItems(cache, favcat, inlineSet, page, bittorrent, embedThumb, ctx);

    return EhAPI.fromEx
        ? {
              title: 'ExHentai Favorites',
              link: `https://exhentai.org/favorites.php?favcat=${favcat}&inline_set=${inlineSet}`,
              item: items,
          }
        : {
              title: 'E-Hentai Favorites',
              link: `https://e-hentai.org/favorites.php?favcat=${favcat}&inline_set=${inlineSet}`,
              item: items,
          };
}
