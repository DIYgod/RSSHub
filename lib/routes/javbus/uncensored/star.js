const { getPage } = require('../util');

module.exports = async (ctx) => {
    const { sid } = ctx.params;

    ctx.state.data = await getPage(`https://www.javbus.com/uncensored/star/${sid}`);
};
