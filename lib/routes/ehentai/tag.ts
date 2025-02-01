import { Route } from '@/types';
import cache from '@/utils/cache';
import EhAPI from './ehapi';
import { queryToBoolean } from '@/utils/readable-social';

export const route: Route = {
    path: '/tag/:tag/:page?/:bittorrent?',
    categories: ['picture'],
    example: '/ehentai/tag/language:chinese/0/1',
    parameters: { tag: 'Tag', page: 'Page number, default to 0', bittorrent: 'Whether include a link to the latest torrent, default to false, Accepted keys: 0/1/true/false' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: true,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Tag',
    maintainers: ['yindaheng98', 'syrinka'],
    handler,
};

async function handler(ctx) {
    const page = ctx.req.param('page');
    const tag = ctx.req.param('tag');
    const bittorrent = queryToBoolean(ctx.req.param('bittorrent') || 'false');
    const items = await EhAPI.getTagItems(cache, tag, page, bittorrent);

    return EhAPI.from_ex
        ? {
              title: tag + ' - ExHentai Tag',
              link: `https://exhentai.org/tag/${tag}`,
              item: items,
          }
        : {
              title: tag + ' - E-Hentai Tag',
              link: `https://e-hentai.org/tag/${tag}`,
              item: items,
          };
}
