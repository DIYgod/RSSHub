const { getPage } = require('../util');

export default async (ctx) => {
    const { seriesid } = ctx.params;

    ctx.state.data = await getPage(`https://www.javbus.com/uncensored/series/${seriesid}`, ctx);
};
