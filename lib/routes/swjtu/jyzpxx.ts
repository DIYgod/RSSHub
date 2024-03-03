// @ts-nocheck
import cache from '@/utils/cache';
const utils = require('./utils');
import got from '@/utils/got';

const rootURL = 'https://jiuye.swjtu.edu.cn/career';

export default async (ctx) => {
    const limit = Math.min(ctx.req.query('limit') ?? 10, 50);
    const resp = await got({
        method: 'post',
        url: `${rootURL}/zpxx/search/zpxx/1/${limit}`,
    });

    const list = resp.data.data.list;

    const items = await Promise.all(
        list.map((item) => {
            const key = `${rootURL}/zpxx/data/zpxx/${item.zpxxid}`;
            return utils.descpPage(key, cache);
        })
    );

    ctx.set('data', {
        title: '西南交大-就业招聘信息',
        link: `${rootURL}/zpxx/zpxx`,
        item: items,
        allowEmpty: true,
    });
};
