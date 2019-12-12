const utils = require('./utils');

module.exports = async (ctx) => {
    const url = 'https://www.vulture.com/art/';
    const title = `Vulture - Art`;

    ctx.state.data = await utils.getData(ctx, url, title);
};
