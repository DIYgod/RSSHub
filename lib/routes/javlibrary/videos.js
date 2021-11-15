import {template} from './utils.js';

export default async (ctx) => {
    const {
        vtype
    } = ctx.params;
    ctx.state.data = {
        link: `http://www.javlibrary.com/cn/vl_${vtype}.php`,
    };
    await template(ctx);
};
