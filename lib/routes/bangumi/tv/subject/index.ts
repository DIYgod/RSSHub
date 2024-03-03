// @ts-nocheck
const getComments = require('./comments.js');
const getFromAPI = require('./offcial-subject-api.js');
const getEps = require('./ep.js');
import { queryToBoolean } from '@/utils/readable-social';

export default async (ctx) => {
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
            throw new Error(`暂不支持对${type}的订阅`);
    }
    ctx.set('data', response);
};
