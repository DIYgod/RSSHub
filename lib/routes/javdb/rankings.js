const utils = require('./utils');

module.exports = async (ctx) => {
    ctx.params.caty = ctx.params.caty || 'censored';
    ctx.params.time = ctx.params.time || 'daily';

    const currentUrl = `${utils.rootUrl}/rankings/video_${ctx.params.caty}?period=${ctx.params.time}`;

    const title = 'JavDB';

    ctx.state.data = await utils.ProcessItems(ctx, currentUrl, title);
};
