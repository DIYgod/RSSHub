const universal = require('./universal');

module.exports = async (ctx) => {
    const path = 'category';
    const id = ctx.params.id ?? '';
    const titleHeader = '公众号 360 - ';
    await universal(ctx, path, id, titleHeader);
};
