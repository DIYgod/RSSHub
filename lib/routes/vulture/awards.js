const utils = require('./utils');

module.exports = async (ctx) => {
    const url = 'https://www.vulture.com/awards/';
    const title = `Vulture - Awards`;

    ctx.state.data = await utils.getData(ctx, url, title);
};
