const utils = require('./utils');

module.exports = async (ctx) => {
    const url = 'https://www.vulture.com/music/';
    const title = `Vulture - Music`;

    ctx.state.data = await utils.getData(ctx, url, title);
};
