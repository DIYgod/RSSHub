import { Route } from '@/types';
import cache from '@/utils/cache';
import { rootUrl, processItems } from './utils';

export const route: Route = {
    path: ['/actress/:id', '/actress/:id/'],
    categories: ['multimedia'],
    example: '/projectjav/actress/rima-arai-22198',
    parameters: { id: 'Actress ID or slug, can be found in the actress page URL' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['projectjav.com/actress/:id'],
            target: '/actress/:id',
        },
    ],
    name: 'Actress',
    maintainers: ['Exat1979'],
    handler,
    url: 'projectjav.com/',
    description: 'Fetches the latest movies from a specific actress page on ProjectJAV.',
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const currentUrl = `${rootUrl}/actress/${id}`;
    return await processItems(currentUrl, cache.tryGet);
}
