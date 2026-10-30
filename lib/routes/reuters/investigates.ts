import type { Route } from '@/types';
import { ViewType } from '@/types';

export const route: Route = {
    path: '/investigates',
    categories: ['traditional-media'],
    view: ViewType.Articles,
    example: '/reuters/investigates',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Investigates',
    maintainers: ['LyleLee'],
    handler,
};

// reuters.com/investigates/ moved to the regular /investigations/ section, which the category route already reads
function handler(ctx) {
    ctx.set('redirect', `/reuters/investigations${new URL(ctx.req.url).search}`);
    return null;
}
