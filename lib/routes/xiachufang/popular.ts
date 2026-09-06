import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';

import { fetchPage, generateItems } from './utils';

export const route: Route = {
    path: '/popular/:timeframe?',
    categories: ['study'],
    example: '/xiachufang/popular/hot',
    parameters: { timeframe: '默认最新上传' },
    name: '作品动态',
    maintainers: ['xyqfer'],
    handler,
    description: `| 正在流行 | 24 小时最佳 | 本周最受欢迎 | 新秀菜谱 | 月度最佳   |
| -------- | ----------- | ------------ | -------- | ---------- |
| hot      | pop         | week         | rising   | monthhonor |`,
};

async function handler(ctx: Context) {
    const { timeframe = '' } = ctx.req.param();

    const mapper = {
        '': '最新上传',
        hot: '正在流行',
        pop: '24小时最佳',
        week: '本周最受欢迎',
        rising: '新秀菜谱',
        monthhonor: '月度最佳',
    };
    let url;

    switch (timeframe) {
        case 'hot':
        case 'pop':
            url = `https://www.xiachufang.com/activity/site/?order=${timeframe}`;
            break;

        case 'rising':
        case 'monthhonor':
            url = `https://www.xiachufang.com/explore/${timeframe}/`;
            break;

        case 'week':
            url = 'https://www.xiachufang.com/explore/';
            break;

        default:
            url = 'https://www.xiachufang.com/activity/site/?order=';
    }

    const response = await fetchPage(url);
    const $ = load(response);

    return {
        title: `下厨房-${mapper[timeframe]}`,
        link: url,
        item: generateItems($, timeframe),
    };
}
