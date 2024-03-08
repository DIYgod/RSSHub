import { FetchGoItems } from './utils';

export default async (ctx) => {
    ctx.set('data', await FetchGoItems(ctx, 'weekly'));
};
