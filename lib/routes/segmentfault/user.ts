// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
const { host, acw_sc__v2, parseList, parseItems } = require('./utils');

export default async (ctx) => {
    const name = ctx.req.param('name');
    const apiURL = `${host}/gateway/homepage/${name}/timeline?size=20&offset=`;

    const response = await got(apiURL);
    const data = response.data.rows;

    const list = parseList(data);
    const { author } = list[0];

    const acwScV2Cookie = await acw_sc__v2(list[0].link, cache.tryGet);

    const items = await Promise.all(list.map((item) => parseItems(acwScV2Cookie, item, cache.tryGet)));

    ctx.set('data', {
        title: `segmentfault - ${author}`,
        link: `${host}/u/${name}`,
        item: items,
    });
};
