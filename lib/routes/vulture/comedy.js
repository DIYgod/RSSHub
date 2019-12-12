const utils = require('./utils');

module.exports = async (ctx) => {
    const url = 'https://www.vulture.com/comedy/';
    const title = `Vulture - Comedy`;

    ctx.state.data = await utils.getData(ctx, url, title);
};
