// @ts-nocheck
import cache from '@/utils/cache';
const { getRollNewsList, parseRollNewsList, parseArticle } = require('../utils');

export default async (ctx) => {
    const map = {
        1686: '国内滚动',
        1687: '宏观经济',
        1690: '金融新闻',
        1688: '地方经济',
        1689: '部委动态',
        3231: '今日财经 TOP10',
    };
    const pageid = '155';
    const { lid = '1686' } = ctx.req.param();
    const { limit = '50' } = ctx.req.query();
    const response = await getRollNewsList(pageid, lid, limit);
    const list = parseRollNewsList(response.data.result.data);

    const out = await Promise.all(list.map((item) => parseArticle(item, cache.tryGet)));

    ctx.set('data', {
        title: `新浪财经－${map[lid]}`,
        link: 'http://finance.sina.com.cn/china/',
        item: out,
    });
};
