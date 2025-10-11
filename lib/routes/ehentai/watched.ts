import { Route } from '@/types';
import cache from '@/utils/cache';
import EhAPI from './ehapi';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import { URLSearchParams } from 'node:url';

export const route: Route = {
    path: '/watched/:params?/:page?/:routeParams?',
    categories: ['picture'],
    example: '/ehentai/watched',
    parameters: {
        params: 'Search parameters. You can copy the content after `https://e-hentai.org/watched?`',
        page: 'Page number',
        routeParams: 'Additional parameters, e.g. bittorrent=true',
    },
    features: {
        requireConfig: [
            { name: 'EH_IPB_MEMBER_ID', description: 'E-Hentai cookie' },
            { name: 'EH_IPB_PASS_HASH', description: 'E-Hentai cookie' },
            { name: 'EH_SK', description: 'E-Hentai cookie' },
        ],
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: true,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    name: 'Watched',
    maintainers: ['yindaheng98', 'syrinka'],
    handler,
};

async function handler(ctx) {
    if (!EhAPI.has_cookie) {
        throw new ConfigNotFoundError('Ehentai watched RSS is disabled due to the lack of cookie config');
    }

    const page = ctx.req.param('page');
    let params = ctx.req.param('params');
    const routeParams = new URLSearchParams(ctx.req.param('routeParams'));
    const bittorrent = routeParams.get('bittorrent') === 'true';
    const embed_thumb = routeParams.get('embed_thumb') === 'true';

    let items;
    if (page) {
        params = params.replace(/&*next=[^&]$/, '').replace(/next=[^&]&/, '');
        items = await EhAPI.getWatchedItems(cache, params, page, bittorrent, embed_thumb);
    } else {
        items = await EhAPI.getWatchedItems(cache, params, undefined, bittorrent, embed_thumb);
    }

    let title = params;
    const match = /f_search=([^&]+)/.exec(title);
    title = match?.[1] ? decodeURIComponent(match[1]) : 'Watched';

    return EhAPI.from_ex
        ? {
              title: `${title} - ExHentai Watched`,
              link: `https://exhentai.org/watched?${params || ''}`,
              item: items,
          }
        : {
              title: `${title} - E-Hentai Watched`,
              link: `https://e-hentai.org/watched?${params || ''}`,
              item: items,
          };
}
