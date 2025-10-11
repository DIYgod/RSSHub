import { Route } from '@/types';
import cache from '@/utils/cache';
import EhAPI from './ehapi';

export const route: Route = {
    path: '/popular/:routeParams?',
    categories: ['picture'],
    example: '/ehentai/popular',
    parameters: {
        routeParams: `same as EHentai search parameters`,
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    name: 'Popular',
    maintainers: ['syrinka'],
    handler,
};

async function handler(ctx) {
    const routeParams = ctx.req.param('routeParams') ?? '';
    const items = await EhAPI.getPopularItems(cache, routeParams, ctx.req.query('page'));

    return EhAPI.from_ex
        ? {
              title: `ExHentai Popular`,
              link: `https://exhentai.org/popular`,
              item: items,
          }
        : {
              title: `E-Hentai Popular`,
              link: `https://e-hentai.org/popular`,
              item: items,
          };
}
