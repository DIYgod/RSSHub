const utils = require('./utils');

module.exports = async (ctx) => {
    const keyword = ctx.params.keyword || '';
    const title = `${keyword ? `Search ${keyword} - ` : ''}Elite Babes`;

    const currentUrl = `${utils.rootUrl}/${keyword ? `?s=${keyword}` : ''}`;

    ctx.state.data = {
        title,
        link: currentUrl,
        itunes_author: title,
        item: await utils.fetch(ctx.cache, currentUrl),
    };
};
