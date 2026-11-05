import type { Route } from '@/types';
import cache from '@/utils/cache';
import { queryToBoolean } from '@/utils/readable-social';

import EhAPI from './ehapi';

export const route: Route = {
    path: '/tag/:tag/:page?/:routeParams?',
    categories: ['picture'],
    example: '/ehentai/tag/language:chinese/0/bittorrent=true&embed_thumb=false',
    parameters: { tag: 'Tag', page: 'Compatibility parameter: omit it or use 0 for the latest first page; other values are unsupported', routeParams: 'Additional parameters, see the table above' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: true,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    name: 'Tag',
    maintainers: ['yindaheng98', 'syrinka'],
    handler,
};

async function handler(ctx) {
    const page = ctx.req.param('page');
    const tag = ctx.req.param('tag');
    const routeParams = new URLSearchParams(ctx.req.param('routeParams'));
    const bittorrent = queryToBoolean(routeParams.get('bittorrent')) ?? false;
    const embedThumb = queryToBoolean(routeParams.get('embed_thumb')) ?? false;
    const items = await EhAPI.getTagItems(cache, tag, page, bittorrent, embedThumb, ctx);

    return EhAPI.fromEx
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
