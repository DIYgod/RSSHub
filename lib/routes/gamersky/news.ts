import type { Route } from '@/types';
import type { Context } from 'hono';
import { getArticleList, parseArticleList, getArticle, mdTableBuilder } from './utils';

const idNameMap = [
    {
        type: 'today',
        name: '今日推荐',
        nodeId: '11007',
    },
    {
        name: '单机电玩',
        type: 'pc',
        nodeId: '129',
    },
    {
        name: 'NS',
        type: 'ns',
        nodeId: '21160',
    },
    {
        name: '手游',
        type: 'mobile',
        nodeId: '20260',
    },
    {
        name: '网游',
        type: 'web',
        nodeId: '20225',
    },
    {
        name: '业界',
        type: 'industry',
        nodeId: '21163',
    },
    {
        name: '硬件',
        type: 'hardware',
        nodeId: '20070',
    },
    {
        name: '科技',
        type: 'tech',
        nodeId: '20547',
    },
];

export const route: Route = {
    path: '/news/:type?',
    categories: ['game'],
    example: '/gamersky/news/pc',
    parameters: {
        type: '资讯类型，见表，默认为 `pc`',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.gamersky.com/news'],
            target: '/news',
        },
    ],
    name: '资讯',
    maintainers: ['yy4382'],
    description: mdTableBuilder(idNameMap),
    handler,
};

async function handler(ctx: Context) {
    const type = ctx.req.param('type') ?? 'pc';

    const idName = idNameMap.find((item) => item.type === type);
    if (!idName) {
        throw new Error(`Invalid type: ${type}`);
    }

    const response = await getArticleList(idName.nodeId);
    const list = parseArticleList(response);
    const fullTextList = await Promise.all(list.map((item) => getArticle(item)));
    return {
        title: `${idName.name} - 游民星空`,
        link: 'https://www.gamersky.com/news',
        item: fullTextList,
    };
}
