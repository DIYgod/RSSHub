const parseList = require('./utils');

module.exports = async (ctx) => {
    // set default router type
    const type = ctx.params.type ?? 'ggtz';

    const { link, title, resultList } = await parseList(ctx, type);

    ctx.state.data = {
        title,
        link,
        description: '河南财政金融学院 - 公告通知',
        item: resultList,
    };
};
