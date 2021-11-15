import utils from './utils/js';

export default async (ctx) => {
    ctx.params.tab = ctx.params.tab || '最新';

    const rootUrl = `https://www.95mm.net/home-ajax/index.html?tabcid=${ctx.params.tab}&page=1`;

    ctx.state.data = await utils(ctx, ctx.params.tab, rootUrl);
};
