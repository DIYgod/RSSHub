const { template } = require('./utils');

export default async (ctx) => {
    const vtype = ctx.params.vtype;
    ctx.state.data = {
        link: `http://www.javlibrary.com/cn/vl_${vtype}.php`,
    };
    await template(ctx);
};
