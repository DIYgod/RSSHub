// @ts-nocheck
const parseList = require('./utils');

export default async (ctx) => {
    // set default router type
    const type = ctx.req.param('type') ?? 'ggtz';

    const { link, title, resultList } = await parseList(ctx, type);

    ctx.set('data', {
        title,
        link,
        description: '河南财政金融学院 - 公告通知',
        item: resultList,
    });
};
