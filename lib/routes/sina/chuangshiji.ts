// @ts-nocheck
import cache from '@/utils/cache';
const { getRollNewsList, parseRollNewsList, parseArticle } = require('./utils');

export default async (ctx) => {
    const pageid = '402';
    const lid = '2559';
    const { limit = '50' } = ctx.req.query();
    const response = await getRollNewsList(pageid, lid, limit);
    const list = parseRollNewsList(response.data.result.data);

    const out = await Promise.all(list.map((item) => parseArticle(item, cache.tryGet)));

    ctx.set('data', {
        title: '新浪专栏-创事记',
        link: 'https://tech.sina.com.cn/chuangshiji',
        item: out,
    });
};
