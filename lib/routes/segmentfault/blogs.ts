// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
const { host, acw_sc__v2, parseList, parseItems } = require('./utils');

export default async (ctx) => {
    const tag = ctx.req.param('tag');
    const apiURL = `${host}/gateway/tag/${tag}/articles?loadMoreType=pagination&initData=true&page=1&sort=newest&pageSize=30`;
    const response = await got(apiURL);
    const data = response.data.rows;

    const list = parseList(data);

    const acwScV2Cookie = await acw_sc__v2(list[0].link, cache.tryGet);

    const items = await Promise.all(list.map((item) => parseItems(acwScV2Cookie, item, cache.tryGet)));

    ctx.set('data', {
        title: `segmentfault-Blogs-${tag}`,
        link: `${host}/t/${tag}/blogs`,
        item: items,
    });
};
