import fetchFeed from './utils';

export default async (ctx) => {
    const currentUrl = '';

    ctx.set('data', await fetchFeed(ctx, currentUrl));
};
