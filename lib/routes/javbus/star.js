const { getPage } = require('./util');

module.exports = async (ctx) => {
    const { sid, mode } = ctx.params;
    const isSimple = mode !== 'detail';

    ctx.state.data = await getPage(`https://www.javbus.com/star/${sid}`, isSimple);
};
