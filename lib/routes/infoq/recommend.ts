// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
const utils = require('./utils');

export default async (ctx) => {
    const apiUrl = 'https://www.infoq.cn/public/v1/my/recommond';
    const pageUrl = 'https://www.infoq.cn';

    const resp = await got.post(apiUrl, {
        headers: {
            Referer: pageUrl,
        },
        json: {
            size: ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 30,
        },
    });

    const data = resp.data.data;
    const items = await utils.ProcessFeed(data, cache);

    ctx.set('data', {
        title: 'InfoQ 推荐',
        link: pageUrl,
        item: items,
    });
};
