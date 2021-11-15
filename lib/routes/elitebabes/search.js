import utils from './utils.js';

export default async (ctx) => {
    const {
        keyword = ''
    } = ctx.params;
    const title = `${keyword ? `Search ${keyword} - ` : ''}Elite Babes`;

    const currentUrl = `${utils.rootUrl}/${keyword ? `?s=${keyword}` : ''}`;

    ctx.state.data = {
        title,
        link: currentUrl,
        itunes_author: title,
        item: await utils.fetch(ctx.cache, currentUrl),
    };
};
