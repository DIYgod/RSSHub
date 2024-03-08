import { ProcessItems } from './utils';

export default async (ctx) => {
    ctx.set('data', await ProcessItems(ctx));
};
