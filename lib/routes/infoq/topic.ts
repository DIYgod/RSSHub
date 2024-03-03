// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
const utils = require('./utils');

export default async (ctx) => {
    const paramId = ctx.req.param('id');
    const apiUrl = 'https://www.infoq.cn/public/v1/article/getList';
    const infoUrl = 'https://www.infoq.cn/public/v1/topic/getInfo';
    const pageUrl = `https://www.infoq.cn/topic/${paramId}`;

    const infoBody = isNaN(paramId) ? { alias: paramId } : { id: Number.parseInt(paramId) };

    const info = await got.post(infoUrl, {
        headers: {
            Referer: pageUrl,
        },
        json: infoBody,
    });
    const topicName = info.data.data.name;
    const type = info.data.data.type;

    const resp = await got.post(apiUrl, {
        headers: {
            Referer: pageUrl,
        },
        json: {
            size: ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 30,
            type,
            id: info.data.data.id,
        },
    });

    const data = resp.data.data;
    const items = await utils.ProcessFeed(data, cache);

    ctx.set('data', {
        title: `InfoQ 话题 - ${topicName}`,
        description: info.data.data.desc,
        image: info.data.data.cover,
        link: pageUrl,
        item: items,
    });
};
