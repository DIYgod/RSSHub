const utils = require('./utils');

module.exports = async (ctx) => {
    const url = 'https://www.vulture.com/books/';
    const title = `Vulture - Books`;

    ctx.state.data = await utils.getData(ctx, url, title);
};
