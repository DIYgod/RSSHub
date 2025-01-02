import { Route } from '@/types';
import cache from '@/utils/cache';
import EhAPI from './ehapi';

export const route: Route = {
    path: '/tag/:tag/:page?/:routeParams?',
    categories: ['picture'],
    example: '/ehentai/tag/language:chinese/1',
    parameters: { tag: 'Tag', page: 'Page number', routeParams: 'Additional parameters, see the table above' },
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
    const routeParams = new URLSearchParams(ctx.req.param('routeParams'));
    const bittorrent = routeParams.get('bittorrent') || false;
    const embed_thumb = routeParams.get('embed_thumb') || false;
    const items = await EhAPI.getTagItems(cache, tag, page, bittorrent, embed_thumb);

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
