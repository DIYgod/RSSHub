import {getPage} from './util.js';

export default async (ctx) => {
    const { gid } = ctx.params;

    ctx.state.data = await getPage(`https://www.javbus.com/genre/${gid}`, ctx);
};
