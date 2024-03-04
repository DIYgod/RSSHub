// @ts-nocheck
const utils = require('./utils');

export default async (ctx) => {
    ctx.set(
        'data',
        await utils.getData({
            site: ctx.req.param('language') === 'chinese' ? 'www' : 'big5',
            channel: ctx.req.param('channel'),
            ctx,
        })
    );
};
