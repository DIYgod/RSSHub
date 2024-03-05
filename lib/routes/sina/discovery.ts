// @ts-nocheck
import cache from '@/utils/cache';
const { getRollNewsList, parseRollNewsList, parseArticle } = require('./utils');

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

export default async (ctx) => {
    const type = ctx.req.param('type');
    const lid = map.get(type).id;
    const title = map.get(type).title;
    const pageid = '207';
    const { limit = '50' } = ctx.req.query();

    const response = await getRollNewsList(pageid, lid, limit);
    const list = parseRollNewsList(response.data.result.data);

    const out = await Promise.all(list.map((item) => parseArticle(item, cache.tryGet)));

    ctx.set('data', {
        title: `${title}-新浪科技科学探索`,
        link,
        item: out,
    });
};
