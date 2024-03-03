// @ts-nocheck
import cache from '@/utils/cache';
const { getRollNewsList, parseRollNewsList, parseArticle } = require('./utils');

export default async (ctx) => {
    const map = {
        2509: '全部',
        2510: '国内',
        2511: '国际',
        2669: '社会',
        2512: '体育',
        2513: '娱乐',
        2514: '军事',
        2515: '科技',
        2516: '财经',
        2517: '股市',
        2518: '美股',
    };

    const pageid = '153';
    const { lid = '2509' } = ctx.req.param();
    const { limit = '50' } = ctx.req.query();
    const response = await getRollNewsList(pageid, lid, limit);
    const list = parseRollNewsList(response.data.result.data);

    const out = await Promise.all(list.map((item) => parseArticle(item, cache.tryGet)));

    ctx.set('data', {
        title: `新浪${map[lid]}滚动新闻`,
        link: `https://news.sina.com.cn/roll/#pageid=${pageid}&lid=${lid}&k=&num=${limit}&page=1`,
        item: out,
    });
};
