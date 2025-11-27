import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import { queryToBoolean } from '@/utils/readable-social';

import getComments from './comments';
import getEps from './ep';
import getFromAPI from './offcial-subject-api';

export const route: Route = {
    path: '/subject/:id/:type?/:showOriginalName?',
    categories: ['anime'],
    example: '/bangumi.tv/subject/328609/ep/true',
    parameters: { id: '条目 id, 在条目页面的地址栏查看', type: '条目类型，可选值为 `ep`, `comments`, `blogs`, `topics`，默认为 `ep`', showOriginalName: '显示番剧标题原名，可选值 0/1/false/true，默认为 false' },
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
            source: ['bgm.tv/subject/:id'],
            target: '/tv/subject/:id',
        },
    ],
    name: '条目的通用路由格式',
    maintainers: ['JimenezLi'],
    handler,
    description: `::: warning
  此通用路由仅用于对路由参数的描述，具体信息请查看下方与条目相关的路由
:::`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const type = ctx.req.param('type') || 'ep';
    const showOriginalName = queryToBoolean(ctx.req.param('showOriginalName'));
    let response;
    switch (type) {
        case 'ep':
            response = await getEps(id, showOriginalName);
            break;
        case 'comments':
            response = await getComments(id, Number(ctx.req.query('minLength')) || 0);
            break;
        case 'blogs':
            response = await getFromAPI('blog')(id, showOriginalName);
            break;
        case 'topics':
            response = await getFromAPI('topic')(id, showOriginalName);
            break;
        default:
            throw new InvalidParameterError(`暂不支持对${type}的订阅`);
    }
    return response;
}
