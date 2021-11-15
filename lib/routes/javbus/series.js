import {getPage} from './util.js';

export default async (ctx) => {
    const { seriesid } = ctx.params;

    ctx.state.data = await getPage(`https://www.javbus.com/series/${seriesid}`, ctx);
};
