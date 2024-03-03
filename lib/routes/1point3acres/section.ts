// @ts-nocheck
import cache from '@/utils/cache';
const { rootUrl, apiRootUrl, types, ProcessThreads } = require('./utils');

const sections = {
    257: '留学申请',
    379: '世界公民',
    400: '投资理财',
    31: '生活干货',
    345: '职场达人',
    391: '人际关系',
    38: '海外求职',
    265: '签证移民',
};

export default async (ctx) => {
    const id = ctx.req.param('id') ?? '';
    const type = ctx.req.param('type') ?? 'hot';
    const order = ctx.req.param('order') ?? '';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 10;

    const currentUrl = `${rootUrl}${id ? (isNaN(id) ? `/category/${id}` : `/section/${id}`) : ''}`;
    const apiUrl = `${apiRootUrl}/api${id ? (isNaN(id) ? `/tags/${id}/` : `/forums/${id}/`) : ''}threads?type=${type}&includes=tags,forum_name,summary&ps=${limit}&pg=1&order=${order === '' ? '' : 'time_desc'}&is_groupid=1`;

    ctx.set('data', {
        title: `一亩三分地 - ${Object.hasOwn(sections, id) ? sections[id] : id}${types[type]}`,
        link: currentUrl,
        item: await ProcessThreads(cache.tryGet, apiUrl, order),
    });
};
