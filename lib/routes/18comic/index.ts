import { Route } from '@/types';
import { defaultDomain, getRootUrl, ProcessItems } from './utils';

export const route: Route = {
    path: '/:category?/:time?/:order?/:keyword?',
    categories: ['program-update'],
    example: '/18comic',
    parameters: { category: '分类，见下表，默认为 `all` 即全部', time: '时间范围，见下表，默认为 `a` 即全部', order: '排列顺序，见下表，默认为 `mr` 即最新', keyword: '关键字，见下表，默认为空' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['jmcomic.group/'],
    },
    name: '成人 A 漫',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'all';
    const keyword = ctx.req.param('keyword') ?? '';
    const time = ctx.req.param('time') ?? 'a';
    const order = ctx.req.param('order') ?? 'mr';
    const { domain = defaultDomain } = ctx.req.query();
    const rootUrl = getRootUrl(domain);

    const currentUrl = `${rootUrl}/albums${category === 'all' ? '' : `/${category}`}${keyword ? `?screen=${keyword}` : '?'}${time === 'a' ? '' : `&t=${time}`}${order === 'mr' ? '' : `&o=${order}`}`;

    ctx.set('data', await ProcessItems(ctx, currentUrl, rootUrl));
}
