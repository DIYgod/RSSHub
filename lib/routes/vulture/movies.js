const utils = require('./utils');

module.exports = async (ctx) => {
    const url = 'https://www.vulture.com/movies/';
    const title = `Vulture - Movies`;

    ctx.state.data = await utils.getData(ctx, url, title);
};
