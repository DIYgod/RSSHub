// @ts-nocheck
const { ProcessFeed } = require('./utils');

export default async (ctx) => ctx.set('data', await ProcessFeed('character', ctx.req.param('id'), ctx.req.param('order')));
