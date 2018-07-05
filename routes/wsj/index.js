const lib = require('./lib');
const base = 'https://cn.wsj.com/zh-hans';

module.exports = async (ctx) => {
    ctx.state.data = await lib(ctx, base, true);
};
