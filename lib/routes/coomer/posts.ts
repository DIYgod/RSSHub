import fetchItems from './utils';

export default async (ctx) => {
    const currentUrl = 'posts';

    ctx.set('data', await fetchItems(ctx, currentUrl));
};
