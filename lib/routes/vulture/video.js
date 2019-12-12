const utils = require('./utils');

module.exports = async (ctx) => {
    const url = 'https://www.vulture.com/video/';
    const title = `Vulture - Video`;

    ctx.state.data = await utils.getData(ctx, url, title);
};
