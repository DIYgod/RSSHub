const { template } = require('./utils');

module.exports = async (ctx) => {
    const sid = ctx.params.sid;
    ctx.state.data = {
        link: `http://www.javlibrary.com/cn/vl_star.php?s=${sid}`,
    };
    await template(ctx);
};
