import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import utils from './utils';

export const route: Route = {
    path: '/topic/:id',
    categories: ['new-media'],
    example: '/infoq/topic/1',
    parameters: { id: '话题id，可在 [InfoQ全部话题](https://www.infoq.cn/topics) 页面找到URL里的话题id' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['infoq.cn/topic/:id'],
        },
    ],
    name: '话题',
    maintainers: ['brilon'],
    handler,
};

async function handler(ctx) {
    const paramId = ctx.req.param('id');
    const apiUrl = 'https://www.infoq.cn/public/v1/article/getList';
    const infoUrl = 'https://www.infoq.cn/public/v1/topic/getInfo';
    const pageUrl = `https://www.infoq.cn/topic/${paramId}`;

    const infoBody = Number.isNaN(Number(paramId)) ? { alias: paramId } : { id: Number.parseInt(paramId) };

    const info = await ofetch(infoUrl, {
        method: 'POST',
        headers: {
            Referer: pageUrl,
        },
        body: infoBody,
    });
    const infoData = info.data;
    const topicName = infoData.name;

    const resp = await ofetch(apiUrl, {
        method: 'POST',
        headers: {
            Referer: pageUrl,
        },
        body: {
            id: infoData.id,
            ptype: 0,
            size: ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 30,
            type: 0,
        },
    });

    const data = resp.data;
    const items = await utils.ProcessFeed(data, cache);

    return {
        title: `InfoQ 话题 - ${topicName}`,
        description: infoData.desc,
        image: infoData.cover,
        link: pageUrl,
        item: items,
    };
}
