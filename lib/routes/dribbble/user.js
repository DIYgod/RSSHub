const utils = require('./utils');

module.exports = async (ctx) => {
    const name = ctx.params.name;
    const url = `https://dribbble.com/${name}`;

    const title = `Dribbble - user ${name}`;

    ctx.state.data = await utils.getData(ctx, url, title);
};
