const { getPage } = require('../util');

export default async (ctx) => {
    const { gid } = ctx.params;

    ctx.state.data = await getPage(`https://www.javbus.one/genre/${gid}`, ctx);
};
