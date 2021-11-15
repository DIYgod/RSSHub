import {template} from './utils.js';

export default async (ctx) => {
    const {
        sid
    } = ctx.params;
    ctx.state.data = {
        link: `http://www.javlibrary.com/cn/vl_star.php?s=${sid}`,
    };
    await template(ctx);
};
