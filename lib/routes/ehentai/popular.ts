import { Route } from '@/types';
import cache from '@/utils/cache';
import EhAPI from './ehapi';

export const route: Route = {
    path: '/popular/:params?/:routeParams?',
    categories: ['picture'],
    example: '/ehentai/popular/f_sft=on&f_sfu=on&f_sfl=on/bittorrent=true&embed_thumb=false&my_tags=true',
    parameters: {
        params: 'Filter parameters. You can copy the content after `https://e-hentai.org/popular?',
        routeParams: 'Additional parameters, see the table above. E.g. `bittorrent=true&embed_thumb=false`',
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
    name: 'Popular',
    maintainers: ['yindaheng98', 'syrinka', 'rosystain'],
    handler,
};

async function handler(ctx) {
    let params = ctx.req.param('params') ?? '';
    let routeParams = ctx.req.param('routeParams');

    if (params && !routeParams && (params.includes('bittorrent=') || params.includes('embed_thumb=') || params.includes('my_tags='))) {
        routeParams = params;
        params = '';
    }

    const routeParamsParsed = new URLSearchParams(routeParams);
    const bittorrent = routeParamsParsed.get('bittorrent') === 'true';
    const embed_thumb = routeParamsParsed.get('embed_thumb') === 'true';
    const my_tags = routeParamsParsed.get('my_tags') === 'true';
    const items = await EhAPI.getPopularItems(cache, params, bittorrent, embed_thumb, my_tags);

    return EhAPI.from_ex
        ? {
              title: `ExHentai Popular`,
              link: `https://exhentai.org/popular${params || ''}`,
              item: items,
          }
        : {
              title: `E-Hentai Popular`,
              link: `https://e-hentai.org/popular${params || ''}`,
              item: items,
          };
}
