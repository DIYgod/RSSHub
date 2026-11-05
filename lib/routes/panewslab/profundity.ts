import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';

import { getArticles, getLimit, processArticles, rootUrl } from './utils';

const categories = {
    精选: '',
    链游: 'aipysd',
    元宇宙: 'arxgdo',
    NFT: 'dwhfpp',
    DeFi: 'gsqjtg',
    监管: 'kohnph',
    央行数字货币: 'loskks',
    波卡: 'sxrabd',
    'Layer 2': 'tdkreq',
    DAO: 'yyufxg',
    融资: 'zahilv',
    活动: 'zqives',
};

export const route: Route = {
    path: '/profundity/:category?',
    categories: ['new-media'],
    example: '/panewslab/profundity',
    parameters: { category: '分类，见下表，默认为精选' },
    radar: [{ source: ['www.panewslab.com/zh/in-depth'], target: '/profundity' }],
    name: '深度',
    maintainers: ['nczitzk'],
    handler,
    url: 'www.panewslab.com/zh/in-depth',
    description: `| 精选 | 链游 | 元宇宙 | NFT | DeFi | 监管 | 央行数字货币 | 波卡 | Layer 2 | DAO | 融资 | 活动 |
| ---- | ---- | ------ | --- | ---- | ---- | ------------ | ---- | ------- | --- | ---- | ---- |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '精选';
    if (!Object.hasOwn(categories, category)) {
        throw new InvalidParameterError(`Unknown article category: ${category}`);
    }
    const articles = await getArticles({ isInDepth: true, take: getLimit(ctx.req.query('limit'), 25), ...(categories[category] && { tagId: categories[category] }) });
    return {
        title: `PANews - ${category}`,
        link: `${rootUrl}/zh/in-depth`,
        item: await processArticles(articles),
    };
}
