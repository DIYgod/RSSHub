import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import utils from './utils';

export const route: Route = {
    path: '/topic/:id',
    categories: ['new-media', 'popular'],
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

    return {
        title: `InfoQ 话题 - ${topicName}`,
        description: info.data.data.desc,
        image: info.data.data.cover,
        link: pageUrl,
        item: items,
    };
}
