import { Route } from '@/types';
import cache from '@/utils/cache';
import EhAPI from './ehapi';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import { URLSearchParams } from 'node:url';

export const route: Route = {
    path: '/watched/:params?/:routeParams?',
    categories: ['picture'],
    example: '/ehentai/watched/f_cats=1021/bittorrent=true&embed_thumb=false&my_tags=true',
    parameters: {
        params: 'Search parameters. You can copy the content after `https://e-hentai.org/watched?`',
        routeParams: 'Additional parameters, see the table above',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: true,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    name: 'Watched',
    maintainers: ['yindaheng98', 'syrinka', 'rosystain'],
    handler,
};

async function handler(ctx) {
    if (!EhAPI.has_cookie) {
        throw new ConfigNotFoundError('Ehentai watched RSS is disabled due to the lack of cookie config');
    }

    let params = ctx.req.param('params');
    let routeParams = ctx.req.param('routeParams');

    if (params && !routeParams && (params.includes('bittorrent=') || params.includes('embed_thumb=') || params.includes('my_tags='))) {
        routeParams = params;
        params = '';
    }

    const routeParamsParsed = new URLSearchParams(routeParams);
    const bittorrent = routeParamsParsed.get('bittorrent') === 'true';
    const embed_thumb = routeParamsParsed.get('embed_thumb') === 'true';
    const my_tags = routeParamsParsed.get('my_tags') === 'true';

    const items = await EhAPI.getWatchedItems(cache, params, bittorrent, embed_thumb, my_tags);

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
