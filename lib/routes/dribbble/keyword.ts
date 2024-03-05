// @ts-nocheck
const utils = require('./utils');

export default async (ctx) => {
    const keyword = ctx.req.param('keyword');
    const url = `https://dribbble.com/search/shots/recent?q=${keyword}`;

    const title = `Dribbble - keyword ${keyword}`;

    ctx.set('data', await utils.getData(ctx, url, title));
};
