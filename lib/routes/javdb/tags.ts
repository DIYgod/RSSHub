import { Route } from '@/types';
import utils from './utils';

export const route: Route = {
    path: '/tags/:query?/:category?',
    categories: ['picture'],
    example: '/javdb/tags/c2=5&c10=1',
    parameters: { query: '筛选，默认为 `c10=1`', category: '分类，见下表，默认为 `有碼`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['javdb.com/'],
        target: '',
    },
    name: '分類',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'censored';
    const query = ctx.req.param('query') ?? '';

    const currentUrl = `/tags${category === 'censored' ? '' : `/${category}`}?${query}`;

    const title = `JavDB${query === '' ? '' : ` - ${query}`} `;

    ctx.set('data', await utils.ProcessItems(ctx, currentUrl, title));
}
