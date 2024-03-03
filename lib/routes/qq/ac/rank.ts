// @ts-nocheck
const { rootUrl, ProcessItems } = require('./utils');

export default async (ctx) => {
    const titles = {
        mt: '月票榜',
        rise: '飙升榜',
        new: '新作榜',
        pay: '畅销榜',
        top: 'TOP100',
        male: '男生榜',
        female: '女生榜',
    };

    const type = ctx.req.param('type') ?? 'mt';
    const time = ctx.req.param('time') ?? 'cur';

    const currentUrl = `${rootUrl}/Rank/comicRank/type/${type}`;

    ctx.set('data', await ProcessItems(ctx, currentUrl, time, titles[type]));
};
