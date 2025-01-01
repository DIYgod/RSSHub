import { Route } from '@/types';
import { defaultDomain, getRootUrl, ProcessItems } from './utils';

export const route: Route = {
    path: '/search/:option?/:category?/:keyword?/:time?/:order?',
    categories: ['anime'],
    example: '/18comic/search/photos/all/NTR',
    parameters: {
        option: '选项，可选 `video` 和 `photos`，默认为 `photos`',
        category: '分类，同上表，默认为 `all` 即全部',
        keyword: '关键字，同上表，默认为空',
        time: '时间范围，同上表，默认为 `a` 即全部',
        order: '排列顺序，同上表，默认为 `mr` 即最新',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['jmcomic.group/'],
            target: '/:category?/:time?/:order?/:keyword?',
        },
    ],
    name: '搜索',
    maintainers: [],
    handler,
    url: 'jmcomic.group/',
    description: `::: tip
  关键字必须超过两个字，这是来自网站的限制。
:::`,
};

async function handler(ctx) {
    const option = ctx.req.param('option') ?? 'photos';
    const category = ctx.req.param('category') ?? 'all';
    const keyword = ctx.req.param('keyword') ?? '';
    const time = ctx.req.param('time') ?? 'a';
    const order = ctx.req.param('order') ?? 'mr';
    const { domain = defaultDomain } = ctx.req.query();
    const rootUrl = getRootUrl(domain);

    const currentUrl = `${rootUrl}/search/${option}${category === 'all' ? '' : `/${category}`}${keyword ? `?search_query=${keyword}` : '?'}${time === 'a' ? '' : `&t=${time}`}${order === 'mr' ? '' : `&o=${order}`}`;

    return await ProcessItems(ctx, currentUrl, rootUrl);
}
