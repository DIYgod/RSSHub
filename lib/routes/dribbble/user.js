const utils = require('./utils');

module.exports = async (ctx) => {
    const name = ctx.params.name;

    ctx.state.data = await utils.getData(name, `https://dribbble.com/${name}`);
};
