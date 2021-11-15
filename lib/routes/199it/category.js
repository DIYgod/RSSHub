import utils from './utils/js';

const rootUrl = 'http://www.199it.com/archives/category/';

export default async (ctx) => {
    const keyword = ctx.params.caty.split('|').join('/');
    const currentUrl = `${rootUrl}/${keyword}`;

    ctx.state.data = await utils(ctx, keyword, currentUrl);
};
