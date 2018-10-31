const utils = require('./utils');

module.exports = async (ctx) => {
    ctx.state.data = await utils.getData({
        site: 'big5',
        channel: ctx.params.channel,
    });
};
