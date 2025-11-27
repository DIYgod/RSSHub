import type { Route } from '@/types';
import cache from '@/utils/cache';

import { getRollNewsList, parseArticle, parseRollNewsList } from './utils';

const link = 'https://tech.sina.com.cn/discovery/';
const map = new Map([
    ['zx', { title: '最新', id: '1795' }],
    ['twhk', { title: '天文航空', id: '1796' }],
    ['dwzw', { title: '动物植物', id: '1797' }],
    ['zrdl', { title: '自然地理', id: '1798' }],
    ['lskg', { title: '历史考古', id: '1799' }],
    ['smyx', { title: '生命医学', id: '1800' }],
    ['shbk', { title: '生活百科', id: '1801' }],
    ['kjqy', { title: '科技前沿', id: '1802' }],
]);

export const route: Route = {
    path: '/discovery/:type',
    categories: ['new-media'],
    example: '/sina/discovery/zx',
    parameters: { type: '订阅分区类型，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '科技 - 科学探索',
    maintainers: ['LogicJake'],
    handler,
    description: `| 最新 | 天文航空 | 动物植物 | 自然地理 | 历史考古 | 生命医学 | 生活百科 | 科技前沿 |
| ---- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| zx   | twhk     | dwzw     | zrdl     | lskg     | smyx     | shbk     | kjqy     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const lid = map.get(type).id;
    const title = map.get(type).title;
    const pageid = '207';
    const { limit = '50' } = ctx.req.query();

    const response = await getRollNewsList(pageid, lid, limit);
    const list = parseRollNewsList(response.data.result.data);

    const out = await Promise.all(list.map((item) => parseArticle(item, cache.tryGet)));

    return {
        title: `${title}-新浪科技科学探索`,
        link,
        item: out,
    };
}
