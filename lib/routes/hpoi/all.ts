import { ProcessFeed } from './utils';

export default async (ctx) => ctx.set('data', await ProcessFeed('all', 0, ctx.req.param('order')));
