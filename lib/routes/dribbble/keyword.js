const utils = require('./utils');

module.exports = async (ctx) => {
    const keyword = ctx.params.keyword;

    ctx.state.data = await utils.getData(`Keyword ${keyword}`, `https://dribbble.com/search?q=${keyword}&s=latest`);
};
