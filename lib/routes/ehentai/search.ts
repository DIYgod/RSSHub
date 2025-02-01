import { Route } from '@/types';
import cache from '@/utils/cache';
import EhAPI from './ehapi';
import { queryToBoolean } from '@/utils/readable-social';

export const route: Route = {
    path: '/search/:params?/:page?/:bittorrent?',
    categories: ['picture'],
    example: '/ehentai/search/f_cats=1021/0/1',
    parameters: {
        params: 'Search parameters. You can copy the content after `https://e-hentai.org/?`',
        page: 'Page number,default to 0',
        bittorrent: 'Whether include a link to the latest torrent, default to false, , Accepted keys: 0/1/true/false',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: true,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Search',
    maintainers: ['yindaheng98', 'syrinka'],
    handler,
};

async function handler(ctx) {
    let params = ctx.req.param('params');
    const { page = 0 } = ctx.req.param('page');
    const bittorrent = queryToBoolean(ctx.req.param('bittorrent') || 'false');
    // 如果定义了page，就要覆盖params
    params = params.replace(/&*next=[^&]$/, '').replace(/next=[^&]&/, '');
    const items = await EhAPI.getSearchItems(cache, params, page, bittorrent);
    let title = params;
    const match = /f_search=([^&]+)/.exec(title);
    if (match !== null) {
        title = match[1];
    }

    return EhAPI.from_ex
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
