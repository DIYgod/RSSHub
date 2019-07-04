const { getPage } = require('./util');

module.exports = async (ctx) => {
    const { a, b, c } = ctx.params;
    const url = 'https://www.javbus.work/' + [a, b, c].filter((i) => i).join('/');

    ctx.state.data = await getPage(url, ctx);
};
