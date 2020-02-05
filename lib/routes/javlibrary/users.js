const template = require('./utils');
const userposts = require('./userposts');
module.exports = async (ctx) => {
    const utype = ctx.params.utype;
    const uid = ctx.params.uid;

    // userposts 页面结构不同，单独写路由
    if (utype === 'userposts') {
        await userposts(ctx);
    } else {
        ctx.state.data = {
            link: `http://www.javlibrary.com/cn/${utype}.php?u=${uid}`,
        };
        await template(ctx);
    }
};
