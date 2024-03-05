// @ts-nocheck
const utils = require('./utils');

export default async (ctx) => {
    const name = ctx.req.param('name');
    const url = `https://dribbble.com/${name}`;

    const title = `Dribbble - user ${name}`;

    ctx.set('data', await utils.getData(ctx, url, title));
};
