const utils = require('./utils');

module.exports = async (ctx) => {
    const url = 'https://www.vulture.com/theater/';
    const title = `Vulture - Theater`;

    ctx.state.data = await utils.getData(ctx, url, title);
};
