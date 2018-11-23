const utils = require('./utils');

module.exports = async (ctx) => {
    ctx.state.data = await utils.getData({
        site: ctx.params.language === 'chinese' ? 'www' : 'big5',
        channel: ctx.params.channel,
    });
};
