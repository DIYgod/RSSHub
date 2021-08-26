const utils = require('./utils');

module.exports = async (ctx) => {
    const category = ctx.params.category || 'censored';
    const time = ctx.params.time || 'daily';

    const currentUrl = `/rankings/video_${category}?period=${time}`;

    const title = 'JavDB';

    ctx.state.data = await utils.ProcessItems(ctx, currentUrl, title);
};
