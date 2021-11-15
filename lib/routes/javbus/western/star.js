const { getPage } = require('../util');

export default async (ctx) => {
    const { sid } = ctx.params;

    ctx.state.data = await getPage(`https://www.javbus.one/star/${sid}`, ctx);
};
