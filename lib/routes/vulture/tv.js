const utils = require('./utils');

module.exports = async (ctx) => {
    const url = 'https://www.vulture.com/tv/';
    const title = `Vulture - TV`;

    ctx.state.data = await utils.getData(ctx, url, title);
};
