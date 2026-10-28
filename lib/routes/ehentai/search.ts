import type { Route } from '@/types';
import cache from '@/utils/cache';
import { queryToBoolean } from '@/utils/readable-social';

import EhAPI from './ehapi';

export const route: Route = {
    path: '/search/:params?/:page?/:routeParams?',
    categories: ['picture'],
    example: '/ehentai/search/f_cats=1021/0/bittorrent=true&embed_thumb=false',
    parameters: {
        params: 'Search parameters. You can copy the content after `https://e-hentai.org/?`',
        page: 'Compatibility parameter: omit it or use 0 for the latest first page; other values are unsupported',
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
    name: 'Search',
    maintainers: ['yindaheng98', 'syrinka'],
    handler,
};

async function handler(ctx) {
    const page = ctx.req.param('page');
    const params = ctx.req.param('params') ?? '';
    const routeParams = new URLSearchParams(ctx.req.param('routeParams'));
    const bittorrent = queryToBoolean(routeParams.get('bittorrent')) ?? false;
    const embedThumb = queryToBoolean(routeParams.get('embed_thumb')) ?? false;
    const items = await EhAPI.getSearchItems(cache, params, page, bittorrent, embedThumb, ctx);
    let title = params || 'Search';
    const match = /f_search=([^&]+)/.exec(title);
    if (match !== null) {
        title = match[1];
    }

    return EhAPI.fromEx
        ? {
              title: title + ' - ExHentai Search ',
              link: `https://exhentai.org/?${params}`,
              item: items,
          }
        : {
              title: title + ' - E-Hentai Search ',
              link: `https://e-hentai.org/?${params}`,
              item: items,
          };
}
