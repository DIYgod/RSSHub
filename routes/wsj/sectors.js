const lib = require('./lib');
const base = 'https://cn.wsj.com/zh-hans';

module.exports = async (ctx) => {
    const site = `${base}/news/${ctx.params.cat}`;
    ctx.state.data = await lib(ctx, site);
};
