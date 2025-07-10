const utils = require('./utils');

const rootUrl = 'https://www.199it.com/archives/category';

module.exports = async (ctx) => {
    const keyword = ctx.params.caty.split('|').join('/');
    const currentUrl = `${rootUrl}/${keyword}`;

    ctx.state.data = await utils(ctx, keyword, currentUrl);
};
