// @ts-nocheck
const utils = require('./utils');

export default async (ctx) => {
    const timeframe = ctx.req.param('timeframe');
    const url = `https://dribbble.com/shots/popular${timeframe ? `?timeframe=${timeframe}` : ''}`;

    const title = 'Dribbble - Popular Shots';

    ctx.set('data', await utils.getData(ctx, url, title));
};
