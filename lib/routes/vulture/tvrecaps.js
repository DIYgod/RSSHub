const utils = require('./utils');

module.exports = async (ctx) => {
    const url = 'https://www.vulture.com/tv-recaps/';
    const title = `Vulture - TV Recaps`;

    ctx.state.data = await utils.getData(ctx, url, title);
};
