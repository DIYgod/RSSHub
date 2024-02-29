const utils = require('./utils');

module.exports = async (ctx) => {
    ctx.set(
        'data',
        await utils.getData({
            site: ctx.req.param('language') === 'chinese' ? 'www' : 'big5',
            channel: ctx.req.param('channel'),
            ctx,
        })
    );
};
