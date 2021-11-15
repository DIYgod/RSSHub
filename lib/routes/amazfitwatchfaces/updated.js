import utils from './utils/js';

export default async (ctx) => {
    const currentUrl = `${ctx.params.model}/updated?${ctx.params.lang ? 'lang=' + ctx.params.lang : ''}${ctx.params.type ? '&compatible=' + ctx.params.type : ''}`;

    ctx.state.data = await utils(ctx, currentUrl);
};
