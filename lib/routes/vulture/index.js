const utils = require('./utils');

module.exports = async (ctx) => {
    const url = `https://www.vulture.com/${ctx.params.type}/`;
    const title = `Vulture - ${ctx.params.type}`;

    ctx.state.data = await utils.getData(ctx, url, title);
};
