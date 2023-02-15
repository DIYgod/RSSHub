const utils = require('./utils');

module.exports = async (ctx) => {
    ctx.state.data = await utils.getData({
        site: ctx.params.language === 'chinese' ? 'www.ftchinese.com' : 'big5.ftchinese.com',
        channel: ctx.params.channel,
        ctx,
    });
};
