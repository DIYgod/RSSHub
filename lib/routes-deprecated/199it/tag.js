const utils = require('./utils');

const rootUrl = 'https://www.199it.com/archives/tag';

module.exports = async (ctx) => {
    const keyword = ctx.params.tag.split('|').join('/');
    const currentUrl = `${rootUrl}/${keyword}`;

    ctx.state.data = await utils(ctx, keyword, currentUrl);
};
