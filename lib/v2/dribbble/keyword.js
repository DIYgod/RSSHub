const utils = require('./utils');

module.exports = async (ctx) => {
    const keyword = ctx.params.keyword;
    const url = `https://dribbble.com/search/shots/recent?q=${keyword}`;

    const title = `Dribbble - keyword ${keyword}`;

    ctx.state.data = await utils.getData(ctx, url, title);
};
